import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createCategoryAction, updateCategoryAction } from "@/actions/catalog-actions";

interface CategoryOption {
  id: string;
  name: string;
}

export function CategoryForm({
  category,
  parentOptions,
}: {
  category?: {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    sortOrder: number;
    imageUrl: string | null;
  };
  parentOptions: CategoryOption[];
}) {
  const action = category ? updateCategoryAction : createCategoryAction;

  return (
    <form action={action} className="space-y-4">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={category?.name} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (optional — auto-generated from name if left blank)</Label>
        <Input id="slug" name="slug" defaultValue={category?.slug} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentId">Parent category (optional)</Label>
        <select
          id="parentId"
          name="parentId"
          defaultValue={category?.parentId ?? ""}
          className="h-9 w-full rounded-md border border-border/60 bg-background px-2 text-sm"
        >
          <option value="">None (top-level)</option>
          {parentOptions
            .filter((c) => c.id !== category?.id)
            .map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort order</Label>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL (optional)</Label>
          <Input id="imageUrl" name="imageUrl" defaultValue={category?.imageUrl ?? ""} />
        </div>
      </div>

      <Button type="submit" className="w-full">
        {category ? "Save changes" : "Create category"}
      </Button>
    </form>
  );
}
