import Link from "next/link";
import { Tv } from "lucide-react";
import { formatInr } from "@/lib/utils/currency";
import type { ProductCardData } from "@/components/storefront/product-card";

export function WindowProductTile({ product, area }: { product: ProductCardData; area: string }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className={`${area} group flex flex-col rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-shadow hover:shadow-md`}
    >
      <div className="mb-3 flex min-h-0 flex-1 items-center justify-center rounded-lg bg-muted/60">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="size-full rounded-lg object-cover" />
        ) : (
          <Tv className="size-10 text-muted-foreground/40" strokeWidth={1} />
        )}
      </div>
      <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
        {product.brand ?? product.categoryName}
      </p>
      <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-snug group-hover:underline">
        {product.name}
      </h3>
      <p className="mt-auto flex items-baseline gap-1 text-[17px] font-extrabold tabular-nums">
        {product.fromPrice != null ? (
          <>
            {product.mrp && product.mrp > product.fromPrice ? (
              <span className="text-[10.5px] font-semibold text-muted-foreground">From</span>
            ) : null}
            {formatInr(product.fromPrice)}
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Price on request</span>
        )}
      </p>
    </Link>
  );
}
