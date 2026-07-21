import Link from "next/link";
import { Tv, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { WindowProductTile } from "@/components/storefront/window-product-tile";
import { listCategories, listProducts } from "@/lib/services/product-service";
import { resolveViewerPriceListCode } from "@/lib/services/pricing-service";
import { formatInr } from "@/lib/utils/currency";

export default async function HomePage() {
  const priceListCode = await resolveViewerPriceListCode();
  const [categories, products] = await Promise.all([listCategories(), listProducts({ priceListCode })]);

  if (products.length < 7) {
    return <SimpleHomeLayout categories={categories} products={products} />;
  }

  const [heroProduct, ...rest] = products;
  // The 5th slot (would-be "desk" tile) is intentionally given to the
  // OTP-verified-checkout feature card instead of a 7th product.
  const [tv1, tv2, tv3, tab, , panel] = rest;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="bento-grid">
        {/* Hero tile */}
        <div className="bento-hero grid grid-cols-1 gap-6 rounded-2xl bg-muted/40 p-8 ring-1 ring-foreground/10 sm:grid-cols-2 sm:items-center sm:p-10">
          <div>
            <p className="mb-2 text-[11px] font-bold tracking-widest text-foreground uppercase">
              Featured — {heroProduct.name}
            </p>
            <h1 className="mb-3 max-w-[14ch] text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
              Screens for every space.
            </h1>
            {heroProduct.fromPrice != null ? (
              <p className="mb-6 flex items-baseline gap-2">
                <span className="text-xs font-semibold text-muted-foreground">From</span>
                <span className="text-3xl font-extrabold tabular-nums">{formatInr(heroProduct.fromPrice)}</span>
              </p>
            ) : null}
            <div className="flex gap-3">
              <Button size="lg" nativeButton={false} render={<Link href="/products" />}>
                Shop now
              </Button>
              <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/dealer-signup" />}>
                Become a dealer
              </Button>
            </div>
          </div>
          <div className="hidden aspect-square items-center justify-center overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 sm:flex">
            {heroProduct.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroProduct.imageUrl} alt={heroProduct.name} className="size-full object-cover" />
            ) : (
              <Tv className="size-24 text-muted-foreground/40" strokeWidth={1} />
            )}
          </div>
        </div>

        <WindowProductTile product={tv1} area="bento-tv1" />
        <WindowProductTile product={tv2} area="bento-tv2" />
        <WindowProductTile product={tv3} area="bento-tv3" />

        {/* Dealer promo tile */}
        <div className="bento-promo flex flex-col justify-between rounded-2xl bg-foreground p-6 text-background">
          <div>
            <p className="mb-2 text-[10px] font-bold tracking-widest text-background/60 uppercase">For resellers</p>
            <h3 className="mb-2 text-lg font-extrabold">Dealer pricing</h3>
            <p className="mb-4 text-xs leading-relaxed text-background/70">
              Bronze, Silver, and Gold tiers with bulk ordering on account.
            </p>
            <div className="mb-5 flex gap-1.5">
              {["Bronze", "Silver", "Gold"].map((tier) => (
                <span key={tier} className="rounded-full bg-background/15 px-2.5 py-1 text-[10px] font-bold">
                  {tier}
                </span>
              ))}
            </div>
          </div>
          <Link href="/dealer-signup" className="text-xs font-bold hover:underline">
            Become a dealer →
          </Link>
        </div>

        {/* Category tile */}
        <div className="bento-cat rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
          <h3 className="mb-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">Browse categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="rounded-full bg-muted px-3.5 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        <WindowProductTile product={tab} area="bento-tab" />

        {/* Feature tile */}
        <div className="bento-desk flex items-center gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted">
            <ShieldCheck className="size-5" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="mb-0.5 text-sm font-bold">OTP-verified checkout</h3>
            <p className="text-xs leading-snug text-muted-foreground">
              No passwords — every account and order is phone-verified.
            </p>
          </div>
        </div>

        <WindowProductTile product={panel} area="bento-panel" />
      </div>

      <div className="mt-6 flex justify-end">
        <Link href="/products" className="text-sm font-semibold text-foreground hover:underline">
          View all products →
        </Link>
      </div>
    </div>
  );
}

async function SimpleHomeLayout({
  categories,
  products,
}: {
  categories: Awaited<ReturnType<typeof listCategories>>;
  products: Awaited<ReturnType<typeof listProducts>>;
}) {
  return (
    <div>
      <section className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Screens for every space.</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              TVs, panels, kiosks, and signage for homes and businesses — with dealer pricing and bulk ordering for
              authorized resellers.
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
