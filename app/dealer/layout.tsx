import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { DealerShell } from "@/components/dealer/dealer-shell";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";

export default async function DealerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "DEALER") {
    redirect("/auth/login?next=/dealer");
  }

  const dealerProfile = await prisma.dealerProfile.findUnique({ where: { userId: session.userId } });

  if (!dealerProfile) {
    redirect("/dealer-signup");
  }

  if (dealerProfile.approvalStatus !== "APPROVED") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-xl font-semibold">{dealerProfile.businessName}</h1>
        <Badge variant={dealerProfile.approvalStatus === "REJECTED" ? "destructive" : "secondary"}>
          {dealerProfile.approvalStatus}
        </Badge>
        <p className="max-w-sm text-sm text-muted-foreground">
          {dealerProfile.approvalStatus === "REJECTED"
            ? "Your dealer application was not approved. Contact support for details."
            : "Your dealer application is pending admin approval. You'll get an SMS once it's approved."}
        </p>
        <form action={logoutAction}>
          <Button variant="outline" size="sm" type="submit">Log out</Button>
        </form>
      </div>
    );
  }

  return (
    <DealerShell businessName={dealerProfile.businessName} tier={dealerProfile.tier}>
      {children}
    </DealerShell>
  );
}
