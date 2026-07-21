import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/storefront/product-card";
import { listCategories, listProducts } from "@/lib/services/product-service";
import { resolveViewerPriceListCode } from "@/lib/services/pricing-service";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const priceListCode = await resolveViewerPriceListCode();
  const [categories, products] = await Promise.all([
    listCategories(),
    listProducts({ categorySlug: category, priceListCode }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold tracking-tight">All products</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/products"
          className={cn(
            "rounded-full px-4 py-2 text-xs font-bold transition-colors",
            !category ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-foreground hover:text-background",
          )}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/products?category=${c.slug}`}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold transition-colors",
              category === c.slug ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-foreground hover:text-background",
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">No products found in this category yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
