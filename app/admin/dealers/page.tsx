import { prisma } from "@/lib/db/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { approveDealerAction, rejectDealerAction } from "@/actions/admin-actions";

export default async function AdminDealersPage() {
  const dealers = await prisma.dealerProfile.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dealers</h1>

      <div className="mt-6 rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Dealer code</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dealers.map((dealer) => (
              <TableRow key={dealer.id}>
                <TableCell className="font-medium">{dealer.businessName}</TableCell>
                <TableCell className="text-muted-foreground">{dealer.user.phone}</TableCell>
                <TableCell className="text-muted-foreground">{dealer.dealerCode}</TableCell>
                <TableCell>{dealer.tier}</TableCell>
                <TableCell>
                  <Badge variant={dealer.approvalStatus === "APPROVED" ? "default" : dealer.approvalStatus === "REJECTED" ? "destructive" : "secondary"}>
                    {dealer.approvalStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {dealer.approvalStatus === "PENDING" ? (
                    <div className="flex justify-end gap-2">
                      <form action={approveDealerAction}>
                        <input type="hidden" name="dealerProfileId" value={dealer.id} />
                        <Button size="sm" type="submit">Approve</Button>
                      </form>
                      <form action={rejectDealerAction}>
                        <input type="hidden" name="dealerProfileId" value={dealer.id} />
                        <Button size="sm" variant="outline" type="submit">Reject</Button>
                      </form>
                    </div>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
