import { prisma } from "@/lib/db/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">New product</h1>
      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent>
          <ProductForm categories={categories} />
        </CardContent>
      </Card>
      <p className="mt-4 text-sm text-muted-foreground">
        You&apos;ll be able to add variants (sizes, pricing, and stock) after creating the product.
      </p>
    </div>
  );
}
