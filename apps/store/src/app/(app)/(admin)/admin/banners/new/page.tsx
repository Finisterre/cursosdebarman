import { BannerForm } from "@/components/admin/banner-form";
import { createBannerAction } from "./actions";
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb";

export const revalidate = 0;

export default function NewBannerPage() {
  return (
    <div className="space-y-6">
      <AdminBreadcrumb
        items={[
          { label: "Banners", href: "/admin/banners" },
          { label: "Nuevo banner" },
        ]}
      />
      <div>
        <h1 className="text-2xl font-semibold">Nuevo banner</h1>
        <p className="text-sm text-muted-foreground">
          Creá un banner para la home u otras posiciones. Elegí tipo y posición según dónde quieras mostrarlo.
        </p>
      </div>
      <BannerForm createBannerAction={createBannerAction} />
    </div>
  );
}
