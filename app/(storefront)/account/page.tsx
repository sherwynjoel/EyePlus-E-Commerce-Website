import Link from "next/link";
import { requireUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Heart, MapPin, RotateCcw } from "lucide-react";

const LINKS = [
  { href: "/account/orders", label: "Order history", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/returns", label: "Returns", icon: RotateCcw },
];

export default async function AccountPage() {
  const session = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.userId } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">My account</h1>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><span className="text-muted-foreground">Phone:</span> {user.phone}</p>
          <p><span className="text-muted-foreground">Name:</span> {user.name ?? "Not set"}</p>
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-lg border border-border/60 px-4 py-6 text-center text-sm font-medium transition-colors hover:border-primary/40 hover:bg-muted/40"
          >
            <Icon className="size-5 text-muted-foreground" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
