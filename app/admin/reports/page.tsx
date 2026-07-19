import {
  getAdminOverviewStats,
  getRevenueTrend,
  getOrdersByStatus,
  getTopProducts,
  getInventoryOverview,
} from "@/lib/services/report-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendChart } from "@/components/shared/trend-chart";
import { BarList } from "@/components/shared/bar-list";
import { formatInr } from "@/lib/utils/currency";

export default async function AdminReportsPage() {
  const [stats, revenueTrend, ordersByStatus, topProducts, inventory] = await Promise.all([
    getAdminOverviewStats(),
    getRevenueTrend(14),
    getOrdersByStatus(),
    getTopProducts(5),
    getInventoryOverview(),
  ]);

  const statTiles = [
    { label: "Total revenue", value: formatInr(stats.totalRevenue) },
    { label: "Total orders", value: stats.totalOrders.toString() },
    { label: "Avg. order value", value: formatInr(Math.round(stats.avgOrderValue)) },
    { label: "Customers", value: stats.totalCustomers.toString() },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <CardTitle className="text-base">Revenue — last 14 days</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart points={revenueTrend} valueFormatter={(v) => formatInr(v)} />
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by status</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList items={ordersByStatus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top products</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Units sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product) => (
                    <TableRow key={product.name}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right">{product.quantity}</TableCell>
                      <TableCell className="text-right">{formatInr(product.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">SKUs</p>
              <p className="text-xl font-semibold">{inventory.totalSkus}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Units on hand</p>
              <p className="text-xl font-semibold">{inventory.totalUnits}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low stock</p>
              <p className="text-xl font-semibold">{inventory.lowStockCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Out of stock</p>
              <p className="text-xl font-semibold">{inventory.outOfStockCount}</p>
            </div>
          </div>

          {inventory.attentionItems.length > 0 ? (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium">Needs attention</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">On hand</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.attentionItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.variant.product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{item.variant.sku}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={item.quantityOnHand <= 0 ? "destructive" : "secondary"}>
                          {item.quantityOnHand}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
