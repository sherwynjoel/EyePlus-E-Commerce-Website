import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { addAddressAction } from "@/actions/storefront-actions";

export function AddressForm({ redirectTo }: { redirectTo: string }) {
  return (
    <form action={addAddressAction} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div className="space-y-2">
        <Label htmlFor="label">Label (optional)</Label>
        <Input id="label" name="label" placeholder="Home, Office…" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="line1">Address line 1</Label>
        <Input id="line1" name="line1" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="line2">Address line 2 (optional)</Label>
        <Input id="line2" name="line2" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pincode">Pincode</Label>
          <Input id="pincode" name="pincode" required maxLength={6} inputMode="numeric" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Contact phone</Label>
          <Input id="phone" name="phone" required inputMode="numeric" />
        </div>
      </div>
      <Button type="submit" className="w-full">Save address</Button>
    </form>
  );
}
