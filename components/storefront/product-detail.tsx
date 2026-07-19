"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Tv, Heart, HeartOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatInr } from "@/lib/utils/currency";
import { addToCartAction, toggleWishlistAction } from "@/actions/storefront-actions";

export interface ProductDetailVariant {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  sellingPrice: number | null;
  mrp: number | null;
  quantityAvailable: number;
  inWishlist: boolean;
  imageUrl?: string;
}

export function ProductDetail({
  slug,
  name,
  brand,
  categoryName,
  description,
  variants,
  isLoggedIn,
}: {
  slug: string;
  name: string;
  brand: string | null;
  categoryName: string;
  description: string | null;
  variants: ProductDetailVariant[];
  isLoggedIn: boolean;
}) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const selected = useMemo(() => variants.find((v) => v.id === selectedId) ?? variants[0], [variants, selectedId]);

  const hasDiscount = selected?.mrp && selected?.sellingPrice && selected.mrp > selected.sellingPrice;
  const inStock = (selected?.quantityAvailable ?? 0) > 0;
  const redirectTo = `/products/${slug}`;

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-muted/50">
        {selected?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={selected.imageUrl} alt={name} className="size-full object-cover" />
        ) : (
          <Tv className="size-32 text-muted-foreground/40" strokeWidth={1} />
        )}
      </div>

      <div>
        <p className="text-sm text-muted-foreground">{brand ?? categoryName}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{name}</h1>

        <div className="mt-4 flex items-baseline gap-3">
          {selected?.sellingPrice != null ? (
            <>
              <span className="text-2xl font-semibold">{formatInr(selected.sellingPrice)}</span>
              {hasDiscount ? (
                <span className="text-sm text-muted-foreground line-through">{formatInr(selected.mrp!)}</span>
              ) : null}
            </>
          ) : (
            <Badge variant="secondary">Price on request</Badge>
          )}
        </div>

        {description ? <p className="mt-4 text-sm text-muted-foreground">{description}</p> : null}

        {variants.length > 1 ? (
          <div className="mt-6">
            <p className="text-sm font-medium">Choose an option</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {variants.map((variant) => {
                const label = Object.values(variant.attributes)[0] ?? variant.sku;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedId(variant.id)}
                    className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                      variant.id === selected?.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border/60 hover:bg-muted/50"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <p className="mt-4 text-sm">
          {inStock ? (
            <span className="text-emerald-600 dark:text-emerald-500">In stock</span>
          ) : (
            <span className="text-destructive">Out of stock</span>
          )}
        </p>

        <Separator className="my-6" />

        <form action={addToCartAction} className="flex items-center gap-3">
          <input type="hidden" name="variantId" value={selected?.id} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <input
            type="number"
            name="quantity"
            min={1}
            max={Math.max(1, selected?.quantityAvailable ?? 1)}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            className="h-9 w-16 rounded-md border border-border/60 bg-background px-2 text-sm"
          />
          <Button type="submit" size="lg" disabled={!inStock || !selected}>
            Add to cart
          </Button>
        </form>

        {isLoggedIn ? (
          <form action={toggleWishlistAction} className="mt-3">
            <input type="hidden" name="variantId" value={selected?.id} />
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <Button type="submit" variant="ghost" size="sm">
              {selected?.inWishlist ? (
                <>
                  <HeartOff className="size-4" /> Remove from wishlist
                </>
              ) : (
                <>
                  <Heart className="size-4" /> Add to wishlist
                </>
              )}
            </Button>
          </form>
        ) : (
          <Link href={`/auth/login?next=${redirectTo}`} className="mt-3 inline-block text-sm text-muted-foreground hover:underline">
            Log in to save to wishlist
          </Link>
        )}
      </div>
    </div>
  );
}
