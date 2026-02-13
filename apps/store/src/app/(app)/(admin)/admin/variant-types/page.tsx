import { getVariantTypes, getVariantValuesByType } from "@/lib/variants";
import { VariantTypesClient } from "./variant-types-client";
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb";

export const revalidate = 0;

export default async function VariantTypesPage() {
  const variantTypes = await getVariantTypes();
  const valuesByType: Record<string, Awaited<ReturnType<typeof getVariantValuesByType>>> = {};
  for (const t of variantTypes) {
    valuesByType[t.id] = await getVariantValuesByType(t.id);
  }

  return (
    <div className="space-y-6">
      <AdminBreadcrumb items={[{ label: "Variantes" }]} />
      <div>
        <h1 className="text-2xl font-semibold">Tipos de variante</h1>
        <p className="text-sm text-muted-foreground">
          Gestioná los tipos (ej. Color, Talle) y sus valores. Se usan al crear productos configurables.
        </p>
      </div>
      <VariantTypesClient
        variantTypes={variantTypes}
        valuesByType={valuesByType}
      />
    </div>
  );
}
