import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/rbac";
import type { PriceListCode, ProductStatus } from "@/lib/generated/prisma/client";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---------- Categories ----------

export async function listAllCategories() {
  return prisma.category.findMany({ orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }] });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export interface CategoryInput {
  name: string;
  slug?: string;
  parentId?: string | null;
  sortOrder?: number;
  imageUrl?: string;
}

export async function createCategory(input: CategoryInput) {
  await requireRole(["ADMIN", "STAFF"]);
  return prisma.category.create({
    data: {
      name: input.name,
      slug: input.slug || slugify(input.name),
      parentId: input.parentId || null,
      sortOrder: input.sortOrder ?? 0,
      imageUrl: input.imageUrl || null,
    },
  });
}

export async function updateCategory(id: string, input: CategoryInput) {
  await requireRole(["ADMIN", "STAFF"]);
  return prisma.category.update({
    where: { id },
    data: {
      name: input.name,
      slug: input.slug || slugify(input.name),
      parentId: input.parentId || null,
      sortOrder: input.sortOrder ?? 0,
      imageUrl: input.imageUrl || null,
    },
  });
}

// ---------- Products ----------

export async function getProductForAdmin(id: string) {
  await requireRole(["ADMIN", "STAFF"]);
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: { include: { prices: { include: { priceList: true } }, inventory: true } },
    },
  });
}

export interface ProductInput {
  name: string;
  slug?: string;
  categoryId: string;
  brand?: string;
  description?: string;
  status: ProductStatus;
}

export async function createProduct(input: ProductInput) {
  await requireRole(["ADMIN", "STAFF"]);
  const slug = input.slug || slugify(input.name);
  return prisma.product.create({
    data: {
      name: input.name,
      slug,
      categoryId: input.categoryId,
      brand: input.brand || null,
      description: input.description || null,
      status: input.status,
      erpItemCode: `ITEM-${slug.toUpperCase()}`,
    },
  });
}

export async function updateProduct(id: string, input: ProductInput) {
  await requireRole(["ADMIN", "STAFF"]);
  return prisma.product.update({
    where: { id },
    data: {
      name: input.name,
      slug: input.slug || slugify(input.name),
      categoryId: input.categoryId,
      brand: input.brand || null,
      description: input.description || null,
      status: input.status,
    },
  });
}

// ---------- Variants, pricing, inventory ----------

export interface VariantInput {
  sku: string;
  attributeLabel: string;
  attributeValue: string;
  mrpRetail: number;
  sellingPriceRetail: number;
  mrpDealerBronze?: number;
  sellingPriceDealerBronze?: number;
  mrpDealerSilver?: number;
  sellingPriceDealerSilver?: number;
  mrpDealerGold?: number;
  sellingPriceDealerGold?: number;
  quantityOnHand: number;
}

const PRICE_LIST_CODES: PriceListCode[] = ["RETAIL", "DEALER_BRONZE", "DEALER_SILVER", "DEALER_GOLD"];

async function getOrCreatePriceListId(code: PriceListCode): Promise<string> {
  const priceList = await prisma.priceList.upsert({
    where: { code },
    update: {},
    create: { code, name: code },
  });
  return priceList.id;
}

function pricesFromInput(input: VariantInput): Partial<Record<PriceListCode, { mrp: number; sellingPrice: number }>> {
  return {
    RETAIL: { mrp: input.mrpRetail, sellingPrice: input.sellingPriceRetail },
    DEALER_BRONZE:
      input.mrpDealerBronze != null && input.sellingPriceDealerBronze != null
        ? { mrp: input.mrpDealerBronze, sellingPrice: input.sellingPriceDealerBronze }
        : undefined,
    DEALER_SILVER:
      input.mrpDealerSilver != null && input.sellingPriceDealerSilver != null
        ? { mrp: input.mrpDealerSilver, sellingPrice: input.sellingPriceDealerSilver }
        : undefined,
    DEALER_GOLD:
      input.mrpDealerGold != null && input.sellingPriceDealerGold != null
        ? { mrp: input.mrpDealerGold, sellingPrice: input.sellingPriceDealerGold }
        : undefined,
  };
}

export async function createVariant(productId: string, input: VariantInput) {
  await requireRole(["ADMIN", "STAFF"]);

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      sku: input.sku,
      attributes: { [input.attributeLabel]: input.attributeValue },
      erpItemCode: input.sku,
    },
  });

  const prices = pricesFromInput(input);
  for (const code of PRICE_LIST_CODES) {
    const value = prices[code];
    if (!value) continue;
    const priceListId = await getOrCreatePriceListId(code);
    await prisma.price.create({
      data: { variantId: variant.id, priceListId, mrp: value.mrp, sellingPrice: value.sellingPrice },
    });
  }

  await prisma.inventory.create({
    data: { variantId: variant.id, warehouseCode: "MAIN", quantityOnHand: input.quantityOnHand },
  });

  return variant;
}

export async function updateVariant(variantId: string, input: VariantInput) {
  await requireRole(["ADMIN", "STAFF"]);

  await prisma.productVariant.update({
    where: { id: variantId },
    data: { sku: input.sku, attributes: { [input.attributeLabel]: input.attributeValue } },
  });

  const prices = pricesFromInput(input);
  for (const code of PRICE_LIST_CODES) {
    const value = prices[code];
    if (!value) continue;
    const priceListId = await getOrCreatePriceListId(code);
    const existing = await prisma.price.findFirst({ where: { variantId, priceListId } });
    if (existing) {
      await prisma.price.update({ where: { id: existing.id }, data: { mrp: value.mrp, sellingPrice: value.sellingPrice } });
    } else {
      await prisma.price.create({ data: { variantId, priceListId, mrp: value.mrp, sellingPrice: value.sellingPrice } });
    }
  }

  await prisma.inventory.updateMany({
    where: { variantId, warehouseCode: "MAIN" },
    data: { quantityOnHand: input.quantityOnHand },
  });
}
