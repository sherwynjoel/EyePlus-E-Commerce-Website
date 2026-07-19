import { prisma } from "@/lib/db/client";
import { requireUser, requireRole } from "@/lib/auth/rbac";

export async function requestReturn(orderItemId: string, reason: string) {
  const session = await requireUser();

  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: { order: true },
  });

  if (!orderItem || orderItem.order.userId !== session.userId) {
    throw new Error("Order item not found.");
  }
  if (orderItem.order.status !== "DELIVERED") {
    throw new Error("Only delivered orders can be returned.");
  }

  await prisma.$transaction([
    prisma.returnRequest.create({
      data: { orderId: orderItem.orderId, orderItemId, reason },
    }),
    prisma.order.update({ where: { id: orderItem.orderId }, data: { status: "RETURN_REQUESTED" } }),
  ]);
}

export async function approveReturn(returnRequestId: string) {
  await requireRole(["ADMIN", "STAFF"]);
  await prisma.returnRequest.update({ where: { id: returnRequestId }, data: { status: "APPROVED" } });
}

export async function rejectReturn(returnRequestId: string) {
  await requireRole(["ADMIN", "STAFF"]);
  const returnRequest = await prisma.returnRequest.findUniqueOrThrow({ where: { id: returnRequestId } });

  await prisma.$transaction([
    prisma.returnRequest.update({
      where: { id: returnRequestId },
      data: { status: "REJECTED", resolvedAt: new Date() },
    }),
    prisma.order.update({ where: { id: returnRequest.orderId }, data: { status: "DELIVERED" } }),
  ]);
}

export async function markReturnRefunded(returnRequestId: string) {
  await requireRole(["ADMIN", "STAFF"]);

  const returnRequest = await prisma.returnRequest.findUniqueOrThrow({
    where: { id: returnRequestId },
    include: { orderItem: true },
  });

  await prisma.$transaction([
    prisma.returnRequest.update({
      where: { id: returnRequestId },
      data: { status: "REFUNDED", resolvedAt: new Date() },
    }),
    prisma.order.update({ where: { id: returnRequest.orderId }, data: { status: "REFUNDED" } }),
    prisma.payment.updateMany({ where: { orderId: returnRequest.orderId }, data: { status: "REFUNDED" } }),
    prisma.inventory.updateMany({
      where: { variantId: returnRequest.orderItem.variantId, warehouseCode: "MAIN" },
      data: { quantityOnHand: { increment: returnRequest.orderItem.quantity } },
    }),
  ]);
}
