import { requireUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/client";
import { EmptyState } from "@/components/shared/empty-state";
import { Heart } from "lucide-react";

export default async function WishlistPage() {
  const session = await requireUser();
  const items = await prisma.wishlist.findMany({
    where: { userId: session.userId },
    include: { variant: { include: { product: true } } },
    orderBy: { addedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Wishlist</h1>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save products you're interested in to find them here later."
          />
        </div>
      ) : (
        <div className="mt-6 divide-y divide-border/60 rounded-lg border border-border/60">
          {items.map((item) => (
            <div key={item.id} className="px-4 py-4 text-sm font-medium">
              {item.variant.product.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
