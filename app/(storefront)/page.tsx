import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { listCategories, listProducts } from "@/lib/services/product-service";

export default async function HomePage() {
  const [categories, products] = await Promise.all([listCategories(), listProducts()]);

  return (
    <div>
      <section className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Screens for every space.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              TVs, panels, kiosks, and signage for homes and businesses — with dealer pricing
              and bulk ordering for authorized resellers.
            </p>
            <div className="mt-8 flex gap-3">
              <Button size="lg" nativeButton={false} render={<Link href="/products" />}>
                Shop now
              </Button>
              <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/dealer-signup" />}>
                Become a dealer
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold tracking-tight">Shop by category</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="rounded-lg border border-border/60 px-4 py-6 text-center text-sm font-medium transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Featured products</h2>
          <Link href="/products" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            No products yet — run the seed script to populate the catalog.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
