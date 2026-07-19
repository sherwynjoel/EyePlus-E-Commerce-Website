import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createCouponAction, updateCouponAction } from "@/actions/catalog-actions";

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function CouponForm({
  coupon,
}: {
  coupon?: {
    id: string;
    code: string;
    type: string;
    value: unknown;
    minOrderValue: unknown;
    maxDiscount: unknown;
    startsAt: Date | null;
    endsAt: Date | null;
    usageLimit: number | null;
    perUserLimit: number | null;
    active: boolean;
  };
}) {
  const action = coupon ? updateCouponAction : createCouponAction;

  return (
    <form action={action} className="space-y-4">
      {coupon ? <input type="hidden" name="id" value={coupon.id} /> : null}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Code</Label>
          <Input id="code" name="code" defaultValue={coupon?.code} required className="uppercase" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            defaultValue={coupon?.type ?? "PERCENT"}
            className="h-9 w-full rounded-md border border-border/60 bg-background px-2 text-sm"
          >
            <option value="PERCENT">Percent off</option>
            <option value="FLAT">Flat amount off</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="value">Value</Label>
          <Input id="value" name="value" type="number" defaultValue={coupon ? Number(coupon.value) : undefined} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxDiscount">Max discount (optional)</Label>
          <Input id="maxDiscount" name="maxDiscount" type="number" defaultValue={coupon?.maxDiscount != null ? Number(coupon.maxDiscount) : undefined} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="minOrderValue">Minimum order value (optional)</Label>
        <Input id="minOrderValue" name="minOrderValue" type="number" defaultValue={coupon?.minOrderValue != null ? Number(coupon.minOrderValue) : undefined} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startsAt">Starts (optional)</Label>
          <Input id="startsAt" name="startsAt" type="date" defaultValue={toDateInputValue(coupon?.startsAt)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endsAt">Ends (optional)</Label>
          <Input id="endsAt" name="endsAt" type="date" defaultValue={toDateInputValue(coupon?.endsAt)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="usageLimit">Total usage limit (optional)</Label>
          <Input id="usageLimit" name="usageLimit" type="number" defaultValue={coupon?.usageLimit ?? undefined} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="perUserLimit">Per-user limit (optional)</Label>
          <Input id="perUserLimit" name="perUserLimit" type="number" defaultValue={coupon?.perUserLimit ?? undefined} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={coupon?.active ?? true} className="size-4" />
        Active
      </label>

      <Button type="submit" className="w-full">
        {coupon ? "Save changes" : "Create coupon"}
      </Button>
    </form>
  );
}
