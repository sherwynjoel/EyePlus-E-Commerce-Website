import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryForm } from "@/components/admin/category-form";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [category, parentOptions] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!category) notFound();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">Edit category</h1>
      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent>
          <CategoryForm category={category} parentOptions={parentOptions} />
        </CardContent>
      </Card>
    </div>
  );
}
