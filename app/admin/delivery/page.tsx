import { prisma } from "@/lib/db/client";
import { EmptyState } from "@/components/shared/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck } from "lucide-react";

export default async function AdminDeliveryPage() {
  const assignments = await prisma.deliveryAssignment.findMany({
    include: { order: true, staff: true },
    orderBy: { assignedAt: "desc" },
  });
  const pincodes = await prisma.pincodeServiceability.count();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Delivery</h1>
      <p className="mt-1 text-sm text-muted-foreground">{pincodes} pincodes configured for serviceability checks.</p>

      {assignments.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Truck} title="No deliveries assigned" description="Delivery assignments for confirmed orders will appear here." />
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.order.orderNumber}</TableCell>
                  <TableCell className="text-muted-foreground">{a.staff?.name ?? a.staff?.phone ?? "Unassigned"}</TableCell>
                  <TableCell className="text-muted-foreground">{a.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
