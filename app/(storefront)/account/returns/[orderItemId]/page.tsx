import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { requestReturnAction } from "@/actions/storefront-actions";

const ERROR_MESSAGES: Record<string, string> = {
  missing_reason: "Please describe why you'd like to return this item.",
};

export default async function RequestReturnPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderItemId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { orderItemId } = await params;
  const { error } = await searchParams;
  const session = await requireUser();

  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: { order: true },
  });

  if (!orderItem || orderItem.order.userId !== session.userId) notFound();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Request a return</CardTitle>
          <CardDescription>{orderItem.productNameSnapshot}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={requestReturnAction} className="space-y-4">
            <input type="hidden" name="orderItemId" value={orderItem.id} />
            <input type="hidden" name="orderId" value={orderItem.orderId} />
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for return</Label>
              <Textarea id="reason" name="reason" rows={4} required />
              {error ? (
                <p className="text-sm text-destructive">{ERROR_MESSAGES[error] ?? error}</p>
              ) : null}
            </div>
            <Button type="submit" className="w-full">Submit return request</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
