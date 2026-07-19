import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CouponForm } from "@/components/admin/coupon-form";

export default function NewCouponPage() {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">New coupon</h1>
      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent>
          <CouponForm />
        </CardContent>
      </Card>
    </div>
  );
}
