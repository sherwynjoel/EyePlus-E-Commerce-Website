import { prisma } from "@/lib/db/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryForm } from "@/components/admin/category-form";

export default async function NewCategoryPage() {
  const parentOptions = await prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">New category</h1>
      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent>
          <CategoryForm parentOptions={parentOptions} />
        </CardContent>
      </Card>
    </div>
  );
}
