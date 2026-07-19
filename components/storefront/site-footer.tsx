import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            TVs, panels, kiosks, signage, and more — for homes, businesses, and authorized dealers.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Shop</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/products" className="hover:text-foreground">All products</Link></li>
            <li><Link href="/dealer-signup" className="hover:text-foreground">Become a dealer</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Account</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/account/orders" className="hover:text-foreground">Order history</Link></li>
            <li><Link href="/account/wishlist" className="hover:text-foreground">Wishlist</Link></li>
            <li><Link href="/account/returns" className="hover:text-foreground">Returns</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Support</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Mon–Sat, 9am–7pm</li>
            <li>support@eyeplus.example</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} EyePlus. All rights reserved.
      </div>
    </footer>
  );
}
