import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createProductAction, updateProductAction } from "@/actions/catalog-actions";

interface CategoryOption {
  id: string;
  name: string;
}

export function ProductForm({
  product,
  categories,
}: {
  product?: {
    id: string;
    name: string;
    slug: string;
    categoryId: string;
    brand: string | null;
    description: string | null;
    status: string;
  };
  categories: CategoryOption[];
}) {
  const action = product ? updateProductAction : createProductAction;

  return (
    <form action={action} className="space-y-4">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={product?.name} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (optional — auto-generated from name if left blank)</Label>
        <Input id="slug" name="slug" defaultValue={product?.slug} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={product?.categoryId ?? ""}
          required
          className="h-9 w-full rounded-md border border-border/60 bg-background px-2 text-sm"
        >
          <option value="" disabled>Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand">Brand (optional)</Label>
        <Input id="brand" name="brand" defaultValue={product?.brand ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={product?.description ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={product?.status ?? "DRAFT"}
          className="h-9 w-full rounded-md border border-border/60 bg-background px-2 text-sm"
        >
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <Button type="submit" className="w-full">
        {product ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
