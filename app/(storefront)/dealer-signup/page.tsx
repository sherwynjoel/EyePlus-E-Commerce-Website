import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { applyAsDealerAction } from "@/actions/dealer-actions";

export default async function DealerSignupPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-xl font-semibold">Become an EyePlus dealer</h1>
        <p className="text-sm text-muted-foreground">
          Log in with your phone number first, then we&apos;ll ask a few details about your business.
        </p>
        <Button nativeButton={false} render={<Link href="/auth/login?next=/dealer-signup" />}>Log in to continue</Button>
      </div>
    );
  }

  const dealerProfile = await prisma.dealerProfile.findUnique({ where: { userId: session.userId } });

  if (dealerProfile) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-xl font-semibold">{dealerProfile.businessName}</h1>
        <Badge variant={dealerProfile.approvalStatus === "APPROVED" ? "default" : "secondary"}>
          {dealerProfile.approvalStatus}
        </Badge>
        <p className="text-sm text-muted-foreground">Dealer code: {dealerProfile.dealerCode}</p>
        {dealerProfile.approvalStatus === "APPROVED" ? (
          <Button nativeButton={false} render={<Link href="/dealer" />}>Go to dealer portal</Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Your application is being reviewed by our team.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Become a dealer</CardTitle>
          <CardDescription>Tell us about your business to apply for dealer pricing.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={applyAsDealerAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input id="businessName" name="businessName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstNumber">GST number (optional)</Label>
              <Input id="gstNumber" name="gstNumber" />
            </div>
            <Button type="submit" className="w-full">
              Submit application
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
