import Link from "next/link";
import { getBanners } from "@/lib/banners";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Banner } from "@/types";
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb";
import { DeleteBannerButton } from "@/components/admin/delete-banner-button";

export const revalidate = 0;

const positionLabels: Record<Banner["position"], string> = {
  category: "Categoría",
  home_top: "Home arriba",
  home_middle: "Home medio",
  home_bottom: "Home abajo",
  hero: "Hero",
  sidebar: "Sidebar"
};

const typeLabels: Record<Banner["type"], string> = {
  image: "Imagen",
  slider: "Slider",
  promo: "Promo",
  video: "Video"
};

export default async function AdminBannersPage() {
  const banners = await getBanners();

  return (
    <div className="space-y-6">
      <AdminBreadcrumb items={[{ label: "Banners" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Banners</h1>
        <Button asChild>
          <Link href="/admin/banners/new">Nuevo banner</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Posición</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Orden</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {banners.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No hay banners. Creá uno desde &quot;Nuevo banner&quot;.
              </TableCell>
            </TableRow>
          ) : (
            banners.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.title}</TableCell>
                <TableCell>{positionLabels[b.position]}</TableCell>
                <TableCell>{typeLabels[b.type]}</TableCell>
                <TableCell>{b.display_order}</TableCell>
                <TableCell>
                  <Badge variant={b.is_active ? "default" : "secondary"}>
                    {b.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/banners/${b.id}`}>Editar</Link>
                  </Button>
                  <DeleteBannerButton bannerId={b.id} bannerTitle={b.title} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
