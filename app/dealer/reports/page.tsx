import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { getDealerReportSummary, getDealerSpendTrend } from "@/lib/services/report-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendChart } from "@/components/shared/trend-chart";
import { formatInr } from "@/lib/utils/currency";

export default async function DealerReportsPage() {
  const session = await getSession();
  const dealerProfile = await prisma.dealerProfile.findUniqueOrThrow({ where: { userId: session!.userId } });

  const [summary, spendTrend] = await Promise.all([
    getDealerReportSummary(dealerProfile.id),
    getDealerSpendTrend(dealerProfile.id, 6),
  ]);

  const statTiles = [
    { label: "Total orders", value: summary.totalOrders.toString() },
    { label: "Total spend", value: formatInr(summary.totalSpend) },
    { label: "Pending orders", value: summary.pendingOrders.toString() },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {statTiles.map((tile) => (
          <Card key={tile.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{tile.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{tile.value}</CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Spend — last 6 months</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart points={spendTrend} valueFormatter={(v) => formatInr(v)} />
        </CardContent>
      </Card>
    </div>
  );
}
