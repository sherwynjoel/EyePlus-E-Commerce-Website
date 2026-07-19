import { prisma } from "@/lib/db/client";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ticket } from "lucide-react";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Coupons</h1>

      {coupons.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Ticket} title="No coupons yet" description="Coupons and festival offers will be managed here." />
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                  <TableCell className="text-muted-foreground">{coupon.type}</TableCell>
                  <TableCell className="text-muted-foreground">{coupon.value.toString()}</TableCell>
                  <TableCell><Badge variant={coupon.active ? "default" : "secondary"}>{coupon.active ? "Active" : "Inactive"}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
