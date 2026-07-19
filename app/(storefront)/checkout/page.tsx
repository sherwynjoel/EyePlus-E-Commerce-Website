import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getCartForCurrentUser, computeCartTotals } from "@/lib/services/cart-service";
import { listAddressesForCurrentUser } from "@/lib/services/address-service";
import { checkPincodeServiceability } from "@/lib/services/delivery-service";
import { placeOrderAction } from "@/actions/storefront-actions";
import { AddressForm } from "@/components/storefront/address-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatInr } from "@/lib/utils/currency";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; coupon?: string }>;
}) {
  const { error, coupon } = await searchParams;
  const session = await getSession();
  if (!session) redirect("/auth/login?next=/checkout");

  const cart = await getCartForCurrentUser();
  if (!cart || cart.items.length === 0) redirect("/cart");

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
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>

      {error ? (
        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <form action={placeOrderAction}>
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Delivery address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {addressesWithServiceability.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Add an address below to see delivery options.
                  </p>
                ) : (
                  addressesWithServiceability.map(({ address, serviceability }) => (
                    <label
                      key={address.id}
                      className="flex items-start gap-3 rounded-lg border border-border/60 p-4 text-sm has-[:checked]:border-primary"
                    >
                      <input
                        type="radio"
                        name="addressId"
                        value={address.id}
                        defaultChecked={address.id === defaultDeliverableId}
                        disabled={!serviceability.serviceable}
                        className="mt-1"
                      />
                      <span className="flex-1">
                        <span className="font-medium">{address.label || address.type}</span>{" "}
                        <span className="text-muted-foreground">
                          — {address.line1}, {address.city}, {address.state} {address.pincode}
                        </span>
                        <br />
                        {serviceability.serviceable ? (
                          <Badge variant="secondary" className="mt-1">
                            Deliverable in ~{serviceability.estimatedDays} days
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="mt-1">Not deliverable to this pincode</Badge>
                        )}
                      </span>
                    </label>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardContent className="space-y-4 py-6">
                <div className="space-y-2 text-sm">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {item.variant.product.name} × {item.quantity}
                      </span>
                      <span>{formatInr(Number(item.priceSnapshot) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-border/60 pt-4 text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatInr(subtotal)}</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="couponCode">Coupon code (optional)</Label>
                  <Input id="couponCode" name="couponCode" defaultValue={coupon ?? ""} placeholder="e.g. WELCOME10" className="uppercase" />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={!anyDeliverable}>
                  Place order
                </Button>
                <p className="text-xs text-muted-foreground">
                  The final total (after any coupon discount) is shown on the payment page.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Add another address</CardTitle>
        </CardHeader>
        <CardContent>
          <AddressForm redirectTo="/checkout" />
        </CardContent>
      </Card>
    </div>
  );
}
