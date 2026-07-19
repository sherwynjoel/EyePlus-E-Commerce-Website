import { prisma } from "@/lib/db/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminOverviewPage() {
  const [productCount, orderCount, customerCount, pendingDealerCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.dealerProfile.count({ where: { approvalStatus: "PENDING" } }),
  ]);

  const stats = [
    { label: "Products", value: productCount },
    { label: "Orders", value: orderCount },
    { label: "Customers", value: customerCount },
    { label: "Pending dealers", value: pendingDealerCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{stat.value}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
