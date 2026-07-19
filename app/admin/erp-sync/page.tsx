import { prisma } from "@/lib/db/client";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw } from "lucide-react";

export default async function AdminErpSyncPage() {
  const logs = await prisma.erpSyncLog.findMany({
    orderBy: { syncedAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">ERP Sync</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Running against the <strong>{process.env.ERP_ADAPTER ?? "mock"}</strong> adapter.
        Switch to a real ERPNext instance later by setting <code>ERP_ADAPTER=frappe</code>.
      </p>

      {logs.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={RefreshCw} title="No sync activity yet" description="ERP sync calls (customer, item, stock, sales order) will be logged here." />
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entity</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.entityType}</TableCell>
                  <TableCell className="text-muted-foreground">{log.entityId}</TableCell>
                  <TableCell className="text-muted-foreground">{log.direction}</TableCell>
                  <TableCell>
                    <Badge variant={log.status === "SUCCESS" ? "default" : "destructive"}>{log.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.syncedAt.toLocaleString("en-IN")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
