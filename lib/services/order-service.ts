import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/auth/rbac";
import { getErpAdapter } from "@/lib/erp";
import { notify } from "@/lib/sms/notification-service";
import { checkPincodeServiceability } from "@/lib/services/delivery-service";
import { getAddressForCurrentUser } from "@/lib/services/address-service";

function generateOrderNumber(): string {
  return `EYP-${Date.now().toString(36).toUpperCase()}`;
}

export async function createOrderFromCart(addressId: string) {
  const session = await requireUser();

  const address = await getAddressForCurrentUser(addressId);
  if (!address) throw new Error("Address not found.");

  const serviceability = await checkPincodeServiceability(address.pincode);
  if (!serviceability.serviceable) {
    throw new Error("We don't currently deliver to this pincode.");
  }

  const cart = await prisma.cart.findFirst({
    where: { userId: session.userId, status: "ACTIVE" },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.priceSnapshot) * item.quantity, 0);
  const grandTotal = subtotal;

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: session.userId,
      status: "PENDING",
      shippingAddressId: address.id,
      billingAddressId: address.id,
      subtotal,
      grandTotal,
      items: {
        create: cart.items.map((item) => ({
          variantId: item.variantId,
          productNameSnapshot: item.variant.product.name,
          quantity: item.quantity,
          unitPrice: item.priceSnapshot,
          lineTotal: Number(item.priceSnapshot) * item.quantity,
        })),
      },
      payment: {
        create: {
          amount: grandTotal,
          status: "CREATED",
        },
      },
    },
    include: { items: true, payment: true },
  });

  return order;
}

export async function getOrderForCurrentUser(orderId: string) {
  const session = await requireUser();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payment: true },
  });
  if (!order || order.userId !== session.userId) return null;
  return order;
}

export async function confirmOrderPayment(
  orderId: string,
  paymentDetails: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    method?: "CARD" | "UPI" | "NETBANKING";
  },
) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: true, user: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { orderId },
      data: {
        status: "CAPTURED",
        razorpayOrderId: paymentDetails.razorpayOrderId,
        razorpayPaymentId: paymentDetails.razorpayPaymentId,
        razorpaySignature: paymentDetails.razorpaySignature,
        method: paymentDetails.method,
      },
    });

    await tx.order.update({ where: { id: orderId }, data: { status: "CONFIRMED" } });

    await tx.orderStatusHistory.create({
      data: { orderId, status: "CONFIRMED", changedByUserId: order.userId },
    });

    for (const item of order.items) {
      await tx.inventory.updateMany({
        where: { variantId: item.variantId, warehouseCode: "MAIN" },
        data: { quantityOnHand: { decrement: item.quantity } },
      });
    }

    await tx.cart.updateMany({
      where: { userId: order.userId, status: "ACTIVE" },
      data: { status: "CONVERTED" },
    });
  });

  const erp = getErpAdapter();
  const erpResult = await erp.salesOrders.createSalesOrder({
    orderNumber: order.orderNumber,
    customerCode: order.userId,
    items: order.items.map((item) => ({
      itemCode: item.variantId,
      quantity: item.quantity,
      rate: Number(item.unitPrice),
    })),
    grandTotal: Number(order.grandTotal),
  });

  await prisma.order.update({ where: { id: orderId }, data: { erpSalesOrderId: erpResult.erpSalesOrderId } });

  await notify(order.user.phone, "ORDER_CONFIRMED", { orderNumber: order.orderNumber });

  return order;
}
