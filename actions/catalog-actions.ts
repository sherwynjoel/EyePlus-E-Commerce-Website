"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/rbac";
import { createCategory, updateCategory, createProduct, updateProduct, createVariant, updateVariant } from "@/lib/services/catalog-service";
import { createCoupon, updateCoupon } from "@/lib/services/coupon-service";
import type { CouponType, ProductStatus } from "@/lib/generated/prisma/client";

function parseOptionalNumber(value: FormDataEntryValue | null): number | undefined {
  const str = String(value ?? "").trim();
  return str ? Number(str) : undefined;
}

function parseOptionalDate(value: FormDataEntryValue | null): Date | undefined {
  const str = String(value ?? "").trim();
  return str ? new Date(str) : undefined;
}

// ---------- Categories ----------

export async function createCategoryAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "STAFF"]);
  await createCategory({
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? "") || undefined,
    parentId: String(formData.get("parentId") ?? "") || null,
    sortOrder: parseOptionalNumber(formData.get("sortOrder")) ?? 0,
    imageUrl: String(formData.get("imageUrl") ?? "") || undefined,
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategoryAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "STAFF"]);
  const id = String(formData.get("id") ?? "");
  await updateCategory(id, {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? "") || undefined,
    parentId: String(formData.get("parentId") ?? "") || null,
    sortOrder: parseOptionalNumber(formData.get("sortOrder")) ?? 0,
    imageUrl: String(formData.get("imageUrl") ?? "") || undefined,
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

// ---------- Products ----------

export async function createProductAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "STAFF"]);
  const product = await createProduct({
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? "") || undefined,
    categoryId: String(formData.get("categoryId") ?? ""),
    brand: String(formData.get("brand") ?? "") || undefined,
    description: String(formData.get("description") ?? "") || undefined,
    status: String(formData.get("status") ?? "DRAFT") as ProductStatus,
  });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}`);
}

export async function updateProductAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "STAFF"]);
  const id = String(formData.get("id") ?? "");
  await updateProduct(id, {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? "") || undefined,
    categoryId: String(formData.get("categoryId") ?? ""),
    brand: String(formData.get("brand") ?? "") || undefined,
    description: String(formData.get("description") ?? "") || undefined,
    status: String(formData.get("status") ?? "DRAFT") as ProductStatus,
  });

  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/admin/products");
  redirect(`/admin/products/${id}`);
}

// ---------- Variants ----------

export async function createVariantAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "STAFF"]);
  const productId = String(formData.get("productId") ?? "");

  await createVariant(productId, {
    sku: String(formData.get("sku") ?? ""),
    attributeLabel: String(formData.get("attributeLabel") ?? "variant"),
    attributeValue: String(formData.get("attributeValue") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? "") || undefined,
    mrpRetail: Number(formData.get("mrpRetail") ?? 0),
    sellingPriceRetail: Number(formData.get("sellingPriceRetail") ?? 0),
    mrpDealerBronze: parseOptionalNumber(formData.get("mrpDealerBronze")),
    sellingPriceDealerBronze: parseOptionalNumber(formData.get("sellingPriceDealerBronze")),
    mrpDealerSilver: parseOptionalNumber(formData.get("mrpDealerSilver")),
    sellingPriceDealerSilver: parseOptionalNumber(formData.get("sellingPriceDealerSilver")),
    mrpDealerGold: parseOptionalNumber(formData.get("mrpDealerGold")),
    sellingPriceDealerGold: parseOptionalNumber(formData.get("sellingPriceDealerGold")),
    quantityOnHand: Number(formData.get("quantityOnHand") ?? 0),
  });

  revalidatePath(`/admin/products/${productId}`);
  redirect(`/admin/products/${productId}`);
}

export async function updateVariantAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "STAFF"]);
  const productId = String(formData.get("productId") ?? "");
  const variantId = String(formData.get("variantId") ?? "");

  await updateVariant(variantId, {
    sku: String(formData.get("sku") ?? ""),
    attributeLabel: String(formData.get("attributeLabel") ?? "variant"),
    attributeValue: String(formData.get("attributeValue") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? "") || undefined,
    mrpRetail: Number(formData.get("mrpRetail") ?? 0),
    sellingPriceRetail: Number(formData.get("sellingPriceRetail") ?? 0),
    mrpDealerBronze: parseOptionalNumber(formData.get("mrpDealerBronze")),
    sellingPriceDealerBronze: parseOptionalNumber(formData.get("sellingPriceDealerBronze")),
    mrpDealerSilver: parseOptionalNumber(formData.get("mrpDealerSilver")),
    sellingPriceDealerSilver: parseOptionalNumber(formData.get("sellingPriceDealerSilver")),
    mrpDealerGold: parseOptionalNumber(formData.get("mrpDealerGold")),
    sellingPriceDealerGold: parseOptionalNumber(formData.get("sellingPriceDealerGold")),
    quantityOnHand: Number(formData.get("quantityOnHand") ?? 0),
  });

  revalidatePath(`/admin/products/${productId}`);
  redirect(`/admin/products/${productId}`);
}

// ---------- Coupons ----------

export async function createCouponAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "STAFF"]);
  await createCoupon({
    code: String(formData.get("code") ?? ""),
    type: String(formData.get("type") ?? "PERCENT") as CouponType,
    value: Number(formData.get("value") ?? 0),
    minOrderValue: parseOptionalNumber(formData.get("minOrderValue")),
    maxDiscount: parseOptionalNumber(formData.get("maxDiscount")),
    startsAt: parseOptionalDate(formData.get("startsAt")),
    endsAt: parseOptionalDate(formData.get("endsAt")),
    usageLimit: parseOptionalNumber(formData.get("usageLimit")),
    perUserLimit: parseOptionalNumber(formData.get("perUserLimit")),
    active: formData.get("active") === "on",
  });

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

export async function updateCouponAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "STAFF"]);
  const id = String(formData.get("id") ?? "");
  await updateCoupon(id, {
    code: String(formData.get("code") ?? ""),
    type: String(formData.get("type") ?? "PERCENT") as CouponType,
    value: Number(formData.get("value") ?? 0),
    minOrderValue: parseOptionalNumber(formData.get("minOrderValue")),
    maxDiscount: parseOptionalNumber(formData.get("maxDiscount")),
    startsAt: parseOptionalDate(formData.get("startsAt")),
    endsAt: parseOptionalDate(formData.get("endsAt")),
    usageLimit: parseOptionalNumber(formData.get("usageLimit")),
    perUserLimit: parseOptionalNumber(formData.get("perUserLimit")),
    active: formData.get("active") === "on",
  });

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}
