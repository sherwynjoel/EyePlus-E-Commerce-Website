import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createVariantAction, updateVariantAction } from "@/actions/catalog-actions";

interface PriceValue {
  mrp: number;
  sellingPrice: number;
}

export interface VariantFormValues {
  id?: string;
  sku: string;
  attributeLabel: string;
  attributeValue: string;
  quantityOnHand: number;
  imageUrl?: string;
  retail?: PriceValue;
  dealerBronze?: PriceValue;
  dealerSilver?: PriceValue;
  dealerGold?: PriceValue;
}

const PRICE_FIELDS = [
  { key: "Retail", mrpName: "mrpRetail", sellingName: "sellingPriceRetail", valueKey: "retail" as const, required: true },
  { key: "Dealer — Bronze", mrpName: "mrpDealerBronze", sellingName: "sellingPriceDealerBronze", valueKey: "dealerBronze" as const, required: false },
  { key: "Dealer — Silver", mrpName: "mrpDealerSilver", sellingName: "sellingPriceDealerSilver", valueKey: "dealerSilver" as const, required: false },
  { key: "Dealer — Gold", mrpName: "mrpDealerGold", sellingName: "sellingPriceDealerGold", valueKey: "dealerGold" as const, required: false },
];

export function VariantForm({ productId, variant }: { productId: string; variant?: VariantFormValues }) {
  const action = variant ? updateVariantAction : createVariantAction;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="productId" value={productId} />
      {variant?.id ? <input type="hidden" name="variantId" value={variant.id} /> : null}

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`sku-${variant?.id ?? "new"}`}>SKU</Label>
          <Input id={`sku-${variant?.id ?? "new"}`} name="sku" defaultValue={variant?.sku} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`attributeLabel-${variant?.id ?? "new"}`}>Attribute (e.g. size)</Label>
          <Input id={`attributeLabel-${variant?.id ?? "new"}`} name="attributeLabel" defaultValue={variant?.attributeLabel ?? "size"} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`attributeValue-${variant?.id ?? "new"}`}>Value (e.g. 55 inch)</Label>
          <Input id={`attributeValue-${variant?.id ?? "new"}`} name="attributeValue" defaultValue={variant?.attributeValue} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`imageUrl-${variant?.id ?? "new"}`}>Image URL (optional)</Label>
        <Input
          id={`imageUrl-${variant?.id ?? "new"}`}
          name="imageUrl"
          type="url"
          placeholder="https://…"
          defaultValue={variant?.imageUrl ?? ""}
        />
      </div>

      <div className="rounded-md border border-border/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
              <th className="p-2">Price list</th>
              <th className="p-2">MRP</th>
              <th className="p-2">Selling price</th>
            </tr>
          </thead>
          <tbody>
            {PRICE_FIELDS.map((field) => {
              const value = variant?.[field.valueKey];
              return (
                <tr key={field.key} className="border-b border-border/60 last:border-b-0">
                  <td className="p-2">{field.key}</td>
                  <td className="p-2">
                    <Input
                      type="number"
                      name={field.mrpName}
                      defaultValue={value?.mrp}
                      required={field.required}
                      className="h-8"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      name={field.sellingName}
                      defaultValue={value?.sellingPrice}
                      required={field.required}
                      className="h-8"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="max-w-xs space-y-2">
        <Label htmlFor={`quantityOnHand-${variant?.id ?? "new"}`}>Stock on hand</Label>
        <Input
          id={`quantityOnHand-${variant?.id ?? "new"}`}
          name="quantityOnHand"
          type="number"
          defaultValue={variant?.quantityOnHand ?? 0}
          required
        />
      </div>

      <Button type="submit" size="sm">
        {variant ? "Save variant" : "Add variant"}
      </Button>
    </form>
  );
}
