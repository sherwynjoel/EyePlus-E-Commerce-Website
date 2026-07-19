import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/shared/logo";
import { logoutAction } from "@/actions/auth-actions";
import { LayoutDashboard, ShoppingBag, ClipboardList, BarChart3 } from "lucide-react";

const NAV = [
  { href: "/dealer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dealer/catalog", label: "Catalog", icon: ShoppingBag },
  { href: "/dealer/orders", label: "Orders", icon: ClipboardList },
  { href: "/dealer/reports", label: "Reports", icon: BarChart3 },
];

export function DealerShell({
  businessName,
  tier,
  children,
}: {
  businessName: string;
  tier: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r border-border/60 bg-muted/20 lg:flex lg:flex-col">
        <div className="border-b border-border/60 px-4 py-4">
          <LogoMark className="h-7 w-auto" />
          <p className="mt-2 text-sm font-semibold">{businessName}</p>
          <Badge variant="secondary" className="mt-1">{tier} dealer</Badge>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border/60 p-3">
          <form action={logoutAction}>
            <Button variant="outline" size="sm" type="submit" className="w-full">
              Log out
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border/60 px-4 py-3 lg:hidden">
          <p className="text-sm font-semibold">{businessName} · Dealer Portal</p>
          <form action={logoutAction}>
            <Button variant="outline" size="sm" type="submit">Log out</Button>
          </form>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
