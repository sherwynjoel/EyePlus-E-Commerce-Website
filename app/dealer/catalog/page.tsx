import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { formatInr } from "@/lib/utils/currency";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addToCartAction } from "@/actions/storefront-actions";
import { ShoppingBag } from "lucide-react";

export default async function DealerCatalogPage() {
  const session = await getSession();
  const dealerProfile = await prisma.dealerProfile.findUniqueOrThrow({ where: { userId: session!.userId } });
  const priceListCode = `DEALER_${dealerProfile.tier}` as const;

  const variants = await prisma.productVariant.findMany({
    where: { product: { status: "ACTIVE" } },
    include: {
      product: true,
      prices: { where: { priceList: { code: priceListCode } }, take: 1 },
    },
    take: 50,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Catalog</h1>
          <p className="mt-1 text-sm text-muted-foreground">Prices shown at your {dealerProfile.tier} dealer tier.</p>
        </div>
        <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/dealer/orders/new" />}>
          <ShoppingBag className="size-4" />
          Review order
        </Button>
      </div>

      <div className="mt-6 rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Dealer price</TableHead>
              <TableHead className="text-right">Add to order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell className="font-medium">{variant.product.name}</TableCell>
                <TableCell className="text-muted-foreground">{variant.sku}</TableCell>
                <TableCell className="text-right">
                  {variant.prices[0] ? formatInr(variant.prices[0].sellingPrice.toString()) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {variant.prices[0] ? (
                    <form action={addToCartAction} className="flex justify-end gap-2">
                      <input type="hidden" name="variantId" value={variant.id} />
                      <input type="hidden" name="onSuccessRedirect" value="/dealer/orders/new" />
                      <Input
                        type="number"
                        name="quantity"
                        min={1}
                        defaultValue={1}
                        className="h-8 w-16"
                      />
                      <Button type="submit" size="sm" variant="outline">Add</Button>
                    </form>
                  ) : (
                    <span className="text-muted-foreground">Unavailable</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
