import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCartForCurrentUser, computeCartTotals } from "@/lib/services/cart-service";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatInr } from "@/lib/utils/currency";
import { updateCartItemAction, removeCartItemAction } from "@/actions/storefront-actions";
import { ShoppingCart, Tv } from "lucide-react";

export default async function CartPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold tracking-tight">Your cart</h1>
        <div className="mt-6 flex flex-col items-center gap-3 rounded-lg border border-dashed border-border/60 px-6 py-16 text-center">
          <ShoppingCart className="size-8 text-muted-foreground/50" strokeWidth={1.5} />
          <p className="font-medium">Log in to see your cart</p>
          <Button size="sm" nativeButton={false} render={<Link href="/auth/login?next=/cart" />}>
            Log in
          </Button>
        </div>
      </div>
    );
  }

  const cart = await getCartForCurrentUser();
  const items = cart?.items ?? [];
  const { subtotal } = computeCartTotals(items);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Your cart</h1>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is empty"
            description="Browse products and add them to your cart to see them here."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {items.map((item) => {
              const attributes = (item.variant.attributes as Record<string, string>) ?? {};
              const label = Object.values(attributes)[0];
              const imageUrl = (item.variant.imageUrls as string[] | undefined)?.[0];
              return (
                <Card key={item.id}>
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted/50">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imageUrl} alt={item.variant.product.name} className="size-full object-cover" />
                      ) : (
                        <Tv className="size-8 text-muted-foreground/40" strokeWidth={1} />
                      )}
                    </div>
                    <div className="flex-1">
                      <Link href={`/products/${item.variant.product.slug}`} className="font-medium hover:underline">
                        {item.variant.product.name}
                      </Link>
                      {label ? <p className="text-sm text-muted-foreground">{label}</p> : null}
                      <p className="mt-1 text-sm font-medium">{formatInr(item.priceSnapshot.toString())}</p>
                    </div>
                    <form action={updateCartItemAction} className="flex items-center gap-2">
                      <input type="hidden" name="cartItemId" value={item.id} />
                      <input
                        type="number"
                        name="quantity"
                        defaultValue={item.quantity}
                        min={1}
                        className="h-9 w-16 rounded-md border border-border/60 bg-background px-2 text-sm"
                      />
                      <Button type="submit" variant="outline" size="sm">Update</Button>
                    </form>
                    <form action={removeCartItemAction}>
                      <input type="hidden" name="cartItemId" value={item.id} />
                      <Button type="submit" variant="ghost" size="sm">Remove</Button>
                    </form>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div>
            <Card>
              <CardContent className="space-y-4 py-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatInr(subtotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Taxes and shipping calculated at checkout.</p>
                <Button className="w-full" size="lg" nativeButton={false} render={<Link href="/checkout" />}>
                  Proceed to checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
