import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DealerDashboardPage() {
  const session = await getSession();
  const dealerProfile = await prisma.dealerProfile.findUniqueOrThrow({ where: { userId: session!.userId } });
  const orderCount = await prisma.order.count({ where: { dealerProfileId: dealerProfile.id } });
  const productCount = await prisma.product.count({ where: { status: "ACTIVE" } });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dealer code</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{dealerProfile.dealerCode}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders placed</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{orderCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products available</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{productCount}</CardContent>
        </Card>
      </div>
    </div>
  );
}
