import { EmptyState } from "@/components/shared/empty-state";
import { ShoppingCart } from "lucide-react";

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Your cart</h1>
      <div className="mt-6">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse products and add them to your cart to see them here."
        />
      </div>
    </div>
  );
}
