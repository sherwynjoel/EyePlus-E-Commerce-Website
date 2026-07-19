import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { logoutAction } from "@/actions/auth-actions";
import { ShoppingCart, LayoutDashboard, Store } from "lucide-react";

const NAV_LINKS = [
  { href: "/products?category=tvs", label: "TVs" },
  { href: "/products?category=panels", label: "Panels" },
  { href: "/products?category=kiosks", label: "Kiosks" },
  { href: "/products?category=signage", label: "Signage" },
  { href: "/products?category=tablets", label: "Tablets" },
  { href: "/products?category=laptops", label: "Laptops" },
  { href: "/products?category=desktops", label: "Desktops" },
];

export async function SiteHeader() {
  const session = await getSession();
  const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user?.role === "ADMIN" || user?.role === "STAFF" ? (
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/admin" />}>
              <LayoutDashboard className="size-4" />
              Admin
            </Button>
          ) : null}

          {user?.role === "DEALER" ? (
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/dealer" />}>
              <Store className="size-4" />
              Dealer Portal
            </Button>
          ) : null}

          <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/cart" />} aria-label="Cart">
            <ShoppingCart className="size-5" />
          </Button>

          {user ? (
            <form action={logoutAction}>
              <Button variant="outline" size="sm" type="submit">
                Log out
              </Button>
            </form>
          ) : (
            <Button size="sm" nativeButton={false} render={<Link href="/auth/login" />}>Log in</Button>
          )}
        </div>
      </div>
    </header>
  );
}
