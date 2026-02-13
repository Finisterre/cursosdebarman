import { notFound } from "next/navigation";
import { getCategoriesTree, getCategoryById } from "@/lib/categories";
import { CategoryForm } from "@/components/admin/category-form";
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb";

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
      <AdminBreadcrumb
        items={[
          { label: "Categorías", href: "/admin/categories" },
          { label: "Editar categoría" },
        ]}
      />
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
          is_active: category.is_active,
          meta_title: category.meta_title ?? "",
          meta_description: category.meta_description ?? "",
          meta_keywords: category.meta_keywords ?? "",
          meta_image: category.meta_image ?? "",
          canonical_url: category.canonical_url ?? "",
          no_index: category.no_index ?? false,
        }}
      />
    </div>
  );
}

