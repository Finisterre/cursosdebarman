import { notFound } from "next/navigation";
import { getCategoriesTree, getCategoryById } from "@/lib/categories";
import { CategoryForm } from "@/components/admin/category-form";

export const revalidate = 0;

type EditCategoryPageProps = {
  params: { id: string };
};

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const [categories, category] = await Promise.all([
    getCategoriesTree(),
    getCategoryById(params.id)
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Editar categoría</h1>
        <p className="text-sm text-muted-foreground">Actualiza la información de la categoría.</p>
      </div>
      <CategoryForm
        categories={categories}
        categoryId={params.id}
        initialValues={{
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          parent_id: category.parent_id ?? "",
          is_active: category.is_active
        }}
      />
    </div>
  );
}

