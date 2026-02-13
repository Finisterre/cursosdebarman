import Link from "next/link";
import { getProducts } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await getProducts();


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <Button asChild>
          <Link href="/admin/products/new">Agregar producto</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Imagen</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>
                <img
                  src={product.image_url ?? ""}
                  alt={product.name}
                  width={100}
                  height={100}
                />
              </TableCell>
              <TableCell>
                {product.price != null
                  ? `$${product.price.toLocaleString("es-AR")}`
                  : "Configurable"}
              </TableCell>
              <TableCell>{product.slug}</TableCell>
              <TableCell>
                <Button asChild variant="outline">
                  <Link href={`/admin/products/${product.id}/edit`}>Editar</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

