import { getSiteSettings } from "@/lib/site-settings";
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <AdminBreadcrumb items={[{ label: "Configuración del sitio" }]} />
      <div>
        <h1 className="text-2xl font-semibold">Configuración del sitio</h1>
        <p className="text-sm text-muted-foreground">
          SEO global, verificación de Google y Analytics. Se usan como fallback en todas las páginas.
        </p>
      </div>
      <SiteSettingsForm initialValues={settings} />
    </div>
  );
}
