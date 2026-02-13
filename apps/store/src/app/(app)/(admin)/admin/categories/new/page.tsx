import { getCategoriesTree } from "@/lib/categories";
import { CategoryForm } from "@/components/admin/category-form";
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb";

export const revalidate = 0;

export default async function NewCategoryPage() {
  const categories = await getCategoriesTree();

  return (
    <div className="space-y-6">
      <AdminBreadcrumb
        items={[
          { label: "Categorías", href: "/admin/categories" },
          { label: "Nueva categoría" },
        ]}
      />
      <div>
        <h1 className="text-2xl font-semibold">Nueva categoría</h1>
        <p className="text-sm text-muted-foreground">Crea una categoría para organizar productos.</p>
      </div>
      <CategoryForm categories={categories} />
    </div>
  );
}

