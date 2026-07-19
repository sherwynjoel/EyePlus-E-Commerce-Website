import Link from "next/link";
import { getCartForCurrentUser, computeCartTotals } from "@/lib/services/cart-service";
import { listAddressesForCurrentUser } from "@/lib/services/address-service";
import { checkPincodeServiceability } from "@/lib/services/delivery-service";
import { updateCartItemAction, removeCartItemAction } from "@/actions/storefront-actions";
import { placeDealerOrderAction } from "@/actions/dealer-actions";
import { AddressForm } from "@/components/storefront/address-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatInr } from "@/lib/utils/currency";
import { EmptyState } from "@/components/shared/empty-state";
import { ShoppingBag } from "lucide-react";

export default async function DealerNewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const cart = await getCartForCurrentUser();

  if (!cart || cart.items.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New bulk order</h1>
        <div className="mt-6">
          <EmptyState
            icon={ShoppingBag}
            title="No items added yet"
            description="Add items from the catalog to start building a bulk order."
          />
        </div>
        <Button className="mt-4" size="sm" nativeButton={false} render={<Link href="/dealer/catalog" />}>
          Go to catalog
        </Button>
      </div>
    );
  }

  const { subtotal } = computeCartTotals(cart.items);
  const addresses = await listAddressesForCurrentUser();
  const addressesWithServiceability = await Promise.all(
    addresses.map(async (address) => ({
      address,
      serviceability: await checkPincodeServiceability(address.pincode),
    })),
  );
  const anyDeliverable = addressesWithServiceability.some(({ serviceability }) => serviceability.serviceable);
  const defaultDeliverableId =
    addressesWithServiceability.find(({ address, serviceability }) => address.isDefault && serviceability.serviceable)
      ?.address.id ??
    addressesWithServiceability.find(({ serviceability }) => serviceability.serviceable)?.address.id;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">New bulk order</h1>

      {error ? (
        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Items</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-md border border-border/60 p-3 text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{item.variant.product.name}</p>
                    <p className="text-muted-foreground">{item.variant.sku} · {formatInr(item.priceSnapshot.toString())} each</p>
                  </div>
                  <form action={updateCartItemAction} className="flex items-center gap-2">
                    <input type="hidden" name="cartItemId" value={item.id} />
                    <input
                      type="number"
                      name="quantity"
                      defaultValue={item.quantity}
                      min={1}
                      className="h-8 w-16 rounded-md border border-border/60 bg-background px-2 text-sm"
                    />
                    <Button type="submit" variant="outline" size="sm">Update</Button>
                  </form>
                  <form action={removeCartItemAction}>
                    <input type="hidden" name="cartItemId" value={item.id} />
                    <Button type="submit" variant="ghost" size="sm">Remove</Button>
                  </form>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Delivery address</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {addressesWithServiceability.length === 0 ? (
                <p className="text-sm text-muted-foreground">Add an address below.</p>
              ) : (
                addressesWithServiceability.map(({ address, serviceability }) => (
                  <label key={address.id} className="flex items-start gap-3 rounded-lg border border-border/60 p-4 text-sm has-[:checked]:border-primary">
                    <input
                      type="radio"
                      name="addressId"
                      value={address.id}
                      defaultChecked={address.id === defaultDeliverableId}
                      disabled={!serviceability.serviceable}
                      className="mt-1"
                      form="dealer-place-order"
                    />
                    <span className="flex-1">
                      <span className="font-medium">{address.label || address.type}</span>{" "}
                      <span className="text-muted-foreground">— {address.line1}, {address.city}, {address.state} {address.pincode}</span>
                      <br />
                      {serviceability.serviceable ? (
                        <Badge variant="secondary" className="mt-1">Deliverable in ~{serviceability.estimatedDays} days</Badge>
                      ) : (
                        <Badge variant="destructive" className="mt-1">Not deliverable</Badge>
                      )}
                    </span>
                  </label>
                ))
              )}
              <div className="pt-2">
                <AddressForm redirectTo="/dealer/orders/new" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="space-y-4 py-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatInr(subtotal)}</span>
              </div>
              <form id="dealer-place-order" action={placeDealerOrderAction}>
                <Button type="submit" className="w-full" size="lg" disabled={!anyDeliverable}>
                  Place order
                </Button>
              </form>
              <p className="text-xs text-muted-foreground">
                Dealer orders are placed on account — no online payment is required.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
