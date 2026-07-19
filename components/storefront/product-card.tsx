import Link from "next/link";
import { Tv } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatInr } from "@/lib/utils/currency";

export interface ProductCardData {
  slug: string;
  name: string;
  brand: string | null;
  categoryName: string;
  fromPrice: number | null;
  mrp: number | null;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const hasDiscount = product.mrp && product.fromPrice && product.mrp > product.fromPrice;

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <Card className="h-full overflow-hidden py-0 transition-shadow hover:shadow-md">
        <div className="flex aspect-square items-center justify-center bg-muted/50">
          <Tv className="size-16 text-muted-foreground/40" strokeWidth={1} />
        </div>
        <CardContent className="space-y-1 px-4 pt-4">
          <p className="text-xs text-muted-foreground">{product.brand ?? product.categoryName}</p>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug group-hover:underline">
            {product.name}
          </h3>
        </CardContent>
        <CardFooter className="flex items-center gap-2 px-4 pb-4">
          {product.fromPrice != null ? (
            <>
              <span className="text-base font-semibold">From {formatInr(product.fromPrice)}</span>
              {hasDiscount ? (
                <span className="text-xs text-muted-foreground line-through">{formatInr(product.mrp!)}</span>
              ) : null}
            </>
          ) : (
            <Badge variant="secondary">Price on request</Badge>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
