import { requireUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/client";
import { EmptyState } from "@/components/shared/empty-state";
import { MapPin } from "lucide-react";

export default async function AddressesPage() {
  const session = await requireUser();
  const addresses = await prisma.address.findMany({
    where: { userId: session.userId },
    orderBy: { isDefault: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Addresses</h1>

      {addresses.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={MapPin}
            title="No saved addresses"
            description="Add an address at checkout and it will be saved here for next time."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-lg border border-border/60 p-4 text-sm">
              <p className="font-medium">{address.label ?? address.type}</p>
              <p className="text-muted-foreground">
                {address.line1}, {address.city}, {address.state} {address.pincode}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
