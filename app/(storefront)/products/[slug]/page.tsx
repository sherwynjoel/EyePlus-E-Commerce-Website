import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";
import { getProductBySlug } from "@/lib/services/product-service";
import { resolveViewerPriceListCode } from "@/lib/services/pricing-service";
import { ProductDetail, type ProductDetailVariant } from "@/components/storefront/product-detail";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const priceListCode = await resolveViewerPriceListCode();
  const product = await getProductBySlug(slug, priceListCode);

  if (!product || product.status !== "ACTIVE") {
    notFound();
  }

  const session = await getSession();
  const wishlistVariantIds = session
    ? new Set(
        (
          await prisma.wishlist.findMany({
            where: { userId: session.userId, variantId: { in: product.variants.map((v) => v.id) } },
            select: { variantId: true },
          })
        ).map((w) => w.variantId),
      )
    : new Set<string>();

  const variants: ProductDetailVariant[] = product.variants.map((variant) => {
    const price = variant.prices[0];
    const quantityAvailable = variant.inventory.reduce(
      (sum, inv) => sum + Math.max(0, inv.quantityOnHand - inv.quantityReserved),
      0,
    );
    return {
      id: variant.id,
      sku: variant.sku,
      attributes: (variant.attributes as Record<string, string>) ?? {},
      sellingPrice: price ? Number(price.sellingPrice) : null,
      mrp: price ? Number(price.mrp) : null,
      quantityAvailable,
      inWishlist: wishlistVariantIds.has(variant.id),
      imageUrl: (variant.imageUrls as string[] | undefined)?.[0],
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <ProductDetail
        slug={product.slug}
        name={product.name}
        brand={product.brand}
        categoryName={product.category.name}
        description={product.description}
        variants={variants}
        isLoggedIn={Boolean(session)}
      />
    </div>
  );
}
