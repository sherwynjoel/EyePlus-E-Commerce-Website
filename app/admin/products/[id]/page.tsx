import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { getProductForAdmin } from "@/lib/services/catalog-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/admin/product-form";
import { VariantForm, type VariantFormValues } from "@/components/admin/variant-form";
import type { PriceListCode } from "@/lib/generated/prisma/client";

function priceFor(prices: { priceList: { code: PriceListCode }; mrp: unknown; sellingPrice: unknown }[], code: PriceListCode) {
  const price = prices.find((p) => p.priceList.code === code);
  if (!price) return undefined;
  return { mrp: Number(price.mrp), sellingPrice: Number(price.sellingPrice) };
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductForAdmin(id),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent>
          <ProductForm product={product} categories={categories} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Variants</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {product.variants.map((variant) => {
            const attributes = (variant.attributes as Record<string, string>) ?? {};
            const [attributeLabel, attributeValue] = Object.entries(attributes)[0] ?? ["size", ""];
            const quantityOnHand = variant.inventory.find((inv) => inv.warehouseCode === "MAIN")?.quantityOnHand ?? 0;

            const values: VariantFormValues = {
              id: variant.id,
              sku: variant.sku,
              attributeLabel,
              attributeValue,
              quantityOnHand,
              retail: priceFor(variant.prices, "RETAIL"),
              dealerBronze: priceFor(variant.prices, "DEALER_BRONZE"),
              dealerSilver: priceFor(variant.prices, "DEALER_SILVER"),
              dealerGold: priceFor(variant.prices, "DEALER_GOLD"),
            };

            return (
              <div key={variant.id} className="rounded-lg border border-border/60 p-4">
                <VariantForm productId={product.id} variant={values} />
              </div>
            );
          })}

          <div className="rounded-lg border border-dashed border-border/60 p-4">
            <p className="mb-3 text-sm font-medium">Add a new variant</p>
            <VariantForm productId={product.id} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
