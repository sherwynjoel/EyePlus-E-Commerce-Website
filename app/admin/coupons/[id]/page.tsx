import { notFound } from "next/navigation";
import { getCouponById } from "@/lib/services/coupon-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CouponForm } from "@/components/admin/coupon-form";

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const coupon = await getCouponById(id);
  if (!coupon) notFound();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">Edit coupon</h1>
      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent>
          <CouponForm coupon={coupon} />
        </CardContent>
      </Card>
    </div>
  );
}
