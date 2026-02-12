import Link from "next/link";
import { getCategoriesTree } from "@/lib/categories";
import type { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const revalidate = 0;

function renderCategoryRows(categories: Category[], depth = 0): React.ReactNode[] {
  const rows: React.ReactNode[] = [];
  categories.forEach((category) => {
    rows.push(
      <TableRow key={category.id}>
        <TableCell style={{ paddingLeft: depth * 16 }} className="font-medium">
          {category.name}
        </TableCell>
        <TableCell>{category.slug}</TableCell>
        <TableCell>{category.is_active ? "Activa" : "Inactiva"}</TableCell>
        <TableCell>
          <Button asChild variant="outline">
            <Link href={`/admin/categories/${category.id}`}>Editar</Link>
          </Button>
        </TableCell>
      </TableRow>
    );

    if (category.children && category.children.length > 0) {
      rows.push(...renderCategoryRows(category.children, depth + 1));
    }
  });

  return rows;
}

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesTree();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categorías</h1>
        <Button asChild>
          <Link href="/admin/categories/new">Nueva categoría</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderCategoryRows(categories)}</TableBody>
      </Table>
    </div>
  );
}

