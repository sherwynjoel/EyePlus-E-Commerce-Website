import { prisma } from "@/lib/db/client";
import type { PriceListCode } from "@/lib/generated/prisma/client";
import type { ProductCardData } from "@/components/storefront/product-card";

export async function listCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
  });
}

export async function listProducts(options: {
  categorySlug?: string;
  priceListCode?: PriceListCode;
} = {}): Promise<ProductCardData[]> {
  const { categorySlug, priceListCode = "RETAIL" } = options;

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    include: {
      category: true,
      variants: {
        include: {
          prices: {
            where: { priceList: { code: priceListCode } },
            orderBy: { effectiveFrom: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return products.map((product) => {
    const variantsWithPrice = product.variants
      .map((v) => ({ variant: v, price: v.prices[0] }))
      .filter((v): v is { variant: (typeof product.variants)[number]; price: NonNullable<typeof v.price> } =>
        Boolean(v.price),
      );

    const cheapest = variantsWithPrice.sort((a, b) => Number(a.price.sellingPrice) - Number(b.price.sellingPrice))[0];
    const imageUrl = (cheapest?.variant.imageUrls as string[] | undefined)?.[0];

    return {
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      categoryName: product.category.name,
      fromPrice: cheapest ? Number(cheapest.price.sellingPrice) : null,
      mrp: cheapest ? Number(cheapest.price.mrp) : null,
      imageUrl,
    };
  });
}

export async function getProductBySlug(slug: string, priceListCode: PriceListCode = "RETAIL") {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: {
        include: {
          prices: {
            where: { priceList: { code: priceListCode } },
            orderBy: { effectiveFrom: "desc" },
            take: 1,
          },
          inventory: true,
        },
      },
    },
  });

  return product;
}
