import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/auth/rbac";
import { resolveViewerPriceListCode } from "@/lib/services/pricing-service";

const CART_ITEM_INCLUDE = {
  items: {
    include: {
      variant: {
        include: {
          product: { include: { category: true } },
          inventory: true,
        },
      },
    },
    orderBy: { id: "asc" as const },
  },
};

async function getOrCreateActiveCart(userId: string) {
  const existing = await prisma.cart.findFirst({ where: { userId, status: "ACTIVE" } });
  if (existing) return existing;

  return prisma.cart.create({
    data: { userId, sessionId: `user:${userId}:${Date.now()}`, status: "ACTIVE" },
  });
}

export async function getCartForCurrentUser() {
  const session = await requireUser();
  const cart = await prisma.cart.findFirst({
    where: { userId: session.userId, status: "ACTIVE" },
    include: CART_ITEM_INCLUDE,
  });
  return cart;
}

export function computeCartTotals(items: { quantity: number; priceSnapshot: { toString(): string } }[]) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.priceSnapshot) * item.quantity, 0);
  return { subtotal };
}

export async function addToCart(variantId: string, quantity: number) {
  const session = await requireUser();
  const cart = await getOrCreateActiveCart(session.userId);
  const priceListCode = await resolveViewerPriceListCode();

  const price = await prisma.price.findFirst({
    where: { variantId, priceList: { code: priceListCode } },
    orderBy: { effectiveFrom: "desc" },
  });
  if (!price) throw new Error("No price is configured for this product.");

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity, priceSnapshot: price.sellingPrice },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, variantId, quantity, priceSnapshot: price.sellingPrice },
    });
  }
}

async function assertCartItemOwnership(cartItemId: string, userId: string) {
  const item = await prisma.cartItem.findUnique({ where: { id: cartItemId }, include: { cart: true } });
  if (!item || item.cart.userId !== userId) {
    throw new Error("Cart item not found.");
  }
  return item;
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  const session = await requireUser();
  await assertCartItemOwnership(cartItemId, session.userId);

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
  } else {
    await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
  }
}

export async function removeCartItem(cartItemId: string) {
  const session = await requireUser();
  await assertCartItemOwnership(cartItemId, session.userId);
  await prisma.cartItem.delete({ where: { id: cartItemId } });
}
