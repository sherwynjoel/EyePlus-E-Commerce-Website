import { listAddressesForCurrentUser } from "@/lib/services/address-service";
import { AddressForm } from "@/components/storefront/address-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AddressesPage() {
  const addresses = await listAddressesForCurrentUser();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Addresses</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          {addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved addresses yet — add one alongside.</p>
          ) : (
            addresses.map((address) => (
              <div key={address.id} className="rounded-lg border border-border/60 p-4 text-sm">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{address.label || address.type}</p>
                  {address.isDefault ? <Badge variant="secondary">Default</Badge> : null}
                </div>
                <p className="mt-1 text-muted-foreground">
                  {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.pincode}
                </p>
                <p className="text-muted-foreground">{address.phone}</p>
              </div>
            ))
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add an address</CardTitle>
          </CardHeader>
          <CardContent>
            <AddressForm redirectTo="/account/addresses" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
