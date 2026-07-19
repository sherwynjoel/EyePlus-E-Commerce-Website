import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/rbac";
import type { OrderStatus } from "@/lib/generated/prisma/client";

const REVENUE_STATUSES: OrderStatus[] = [
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "RETURN_REQUESTED",
  "RETURNED",
];

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURN_REQUESTED: "Return requested",
  RETURNED: "Returned",
  REFUNDED: "Refunded",
};

export interface TrendPoint {
  label: string;
  value: number;
}

// ---------- Admin ----------

export async function getAdminOverviewStats() {
  await requireRole(["ADMIN", "STAFF"]);

  const [revenueAgg, totalOrders, totalCustomers] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: REVENUE_STATUSES } },
      _sum: { grandTotal: true },
      _count: { _all: true },
    }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  const totalRevenue = Number(revenueAgg._sum.grandTotal ?? 0);
  const revenueOrderCount = revenueAgg._count._all;

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue: revenueOrderCount > 0 ? totalRevenue / revenueOrderCount : 0,
    totalCustomers,
  };
}

export async function getRevenueTrend(days = 14): Promise<TrendPoint[]> {
  await requireRole(["ADMIN", "STAFF"]);

  // Bucketing is done entirely in UTC calendar days to match how `placedAt`
  // (a UTC timestamp) reports its date via toISOString() — mixing in local-time
  // date arithmetic here would shift bucket keys by the server's UTC offset and
  // silently drop recent orders from every bucket.
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const orders = await prisma.order.findMany({
    where: { status: { in: REVENUE_STATUSES }, placedAt: { gte: since } },
    select: { placedAt: true, grandTotal: true },
  });

  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setUTCDate(d.getUTCDate() + i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  for (const order of orders) {
    const key = order.placedAt.toISOString().slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + Number(order.grandTotal));
    }
  }

  return Array.from(buckets.entries()).map(([date, value]) => ({
    label: new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", timeZone: "UTC" }),
    value,
  }));
}

export async function getOrdersByStatus(): Promise<TrendPoint[]> {
  await requireRole(["ADMIN", "STAFF"]);

  const grouped = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  return grouped
    .map((g) => ({ label: STATUS_LABELS[g.status] ?? g.status, value: g._count._all }))
    .sort((a, b) => b.value - a.value);
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  await requireRole(["ADMIN", "STAFF"]);

  const grouped = await prisma.orderItem.groupBy({
    by: ["productNameSnapshot"],
    _sum: { quantity: true, lineTotal: true },
    orderBy: { _sum: { lineTotal: "desc" } },
    take: limit,
  });

  return grouped.map((g) => ({
    name: g.productNameSnapshot,
    quantity: g._sum.quantity ?? 0,
    revenue: Number(g._sum.lineTotal ?? 0),
  }));
}

const LOW_STOCK_THRESHOLD = 10;

export async function getInventoryOverview() {
  await requireRole(["ADMIN", "STAFF"]);

  const inventory = await prisma.inventory.findMany({
    where: { warehouseCode: "MAIN" },
    include: { variant: { include: { product: true } } },
  });

  const totalUnits = inventory.reduce((sum, i) => sum + i.quantityOnHand, 0);
  const outOfStock = inventory.filter((i) => i.quantityOnHand <= 0);
  const lowStock = inventory.filter((i) => i.quantityOnHand > 0 && i.quantityOnHand <= LOW_STOCK_THRESHOLD);

  const attentionItems = [...outOfStock, ...lowStock]
    .sort((a, b) => a.quantityOnHand - b.quantityOnHand)
    .slice(0, 10);

  return {
    totalSkus: inventory.length,
    totalUnits,
    lowStockCount: lowStock.length,
    outOfStockCount: outOfStock.length,
    attentionItems,
  };
}

// ---------- Dealer ----------

export async function getDealerReportSummary(dealerProfileId: string) {
  const orders = await prisma.order.findMany({
    where: { dealerProfileId },
    select: { status: true, grandTotal: true },
  });

  const totalOrders = orders.length;
  const totalSpend = orders
    .filter((o) => REVENUE_STATUSES.includes(o.status))
    .reduce((sum, o) => sum + Number(o.grandTotal), 0);
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;

  return { totalOrders, totalSpend, pendingOrders };
}

export async function getDealerSpendTrend(dealerProfileId: string, months = 6): Promise<TrendPoint[]> {
  // UTC throughout — see the note in getRevenueTrend on why mixing local-time
  // arithmetic with a UTC timestamp field silently drops recent orders.
  const since = new Date();
  since.setUTCMonth(since.getUTCMonth() - (months - 1));
  since.setUTCDate(1);
  since.setUTCHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { dealerProfileId, status: { in: REVENUE_STATUSES }, placedAt: { gte: since } },
    select: { placedAt: true, grandTotal: true },
  });

  const buckets = new Map<string, number>();
  for (let i = 0; i < months; i++) {
    const d = new Date(since);
    d.setUTCMonth(d.getUTCMonth() + i);
    buckets.set(`${d.getUTCFullYear()}-${d.getUTCMonth()}`, 0);
  }

  for (const order of orders) {
    const key = `${order.placedAt.getUTCFullYear()}-${order.placedAt.getUTCMonth()}`;
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + Number(order.grandTotal));
    }
  }

  return Array.from(buckets.keys()).map((key) => {
    const [year, month] = key.split("-").map(Number);
    return {
      label: new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }),
      value: buckets.get(key) ?? 0,
    };
  });
}
