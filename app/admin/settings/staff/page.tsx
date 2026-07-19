import { prisma } from "@/lib/db/client";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminStaffSettingsPage() {
  const staff = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "STAFF"] } },
    include: { staffProfile: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Staff &amp; admins</h1>

      <div className="mt-6 rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phone</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.phone}</TableCell>
                <TableCell className="text-muted-foreground">{member.name ?? "—"}</TableCell>
                <TableCell><Badge variant="secondary">{member.role}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{member.staffProfile?.department ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
