"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { VariantType, VariantValue } from "@/types";
import type { OptionByType } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { regenerateVariantsAction } from "@/app/(app)/(admin)/admin/products/[id]/edit/actions";

type Props = {
  productId: string;
  variantTypes: VariantType[];
  valuesByType: Record<string, VariantValue[]>;
  isConfigurable: boolean;
};

export function ProductVariantsEditor({
  productId,
  variantTypes,
  valuesByType,
  isConfigurable,
}: Props) {
  const router = useRouter();
  const [selections, setSelections] = useState<Record<string, VariantValue[]>>({});
  const [defaultPrice, setDefaultPrice] = useState<string>("");
  const [defaultStock, setDefaultStock] = useState<string>("0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleValue = (typeId: string, value: VariantValue) => {
    setSelections((prev) => {
      const current = prev[typeId] ?? [];
      const exists = current.some((v) => v.id === value.id);
      const next = exists
        ? current.filter((v) => v.id !== value.id)
        : [...current, value];
      return { ...prev, [typeId]: next };
    });
  };

  const hasSelection =
    variantTypes.length > 0 &&
    variantTypes.some((t) => (selections[t.id]?.length ?? 0) > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSelection) {
      toast({ title: "Seleccioná al menos un valor por tipo.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const variantOptions: Record<string, OptionByType[]> = {};
      variantTypes.forEach((t) => {
        const selected = selections[t.id] ?? [];
        if (selected.length > 0) {
          variantOptions[t.id] = selected.map((v) => ({ id: v.id, value: v.value }));
        }
      });
      const price = defaultPrice === "" ? null : Number(defaultPrice);
      const stock = Number(defaultStock) || 0;
      const result = await regenerateVariantsAction(
        productId,
        variantOptions,
        price,
        stock
      );
      if (result.ok) {
        toast({
          title: "Variantes actualizadas",
          description: "Se regeneraron los SKUs según las combinaciones.",
        });
        router.refresh();
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variantTypes.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          No hay tipos de variante. Creá algunos en{" "}
          <a href="/admin/variant-types" className="underline">Variantes</a>.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
      <h3 className="font-medium">
        {isConfigurable ? "Regenerar combinaciones (SKUs)" : "Convertir a producto configurable"}
      </h3>
      <p className="text-sm text-muted-foreground">
        Elegí los tipos y valores; se crearán/actualizarán los productos hijo (SKU) con esas combinaciones.
        {isConfigurable && " Los hijos actuales se reemplazarán."}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {variantTypes.map((type) => {
          const options = valuesByType[type.id] ?? [];
          return (
            <div key={type.id}>
              <Label className="text-sm font-medium">{type.name}</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {options.map((opt) => {
                  const selected = (selections[type.id] ?? []).some((v) => v.id === opt.id);
                  return (
                    <label
                      key={opt.id}
                      className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleValue(type.id, opt)}
                        className="rounded border-input"
                      />
                      <span>{opt.value}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div className="flex gap-4">
          <div className="space-y-1">
            <Label className="text-sm">Precio por defecto (opcional)</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(e.target.value)}
              placeholder="Dejar vacío para null"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm">Stock por defecto</Label>
            <Input
              type="number"
              min={0}
              value={defaultStock}
              onChange={(e) => setDefaultStock(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting || !hasSelection}>
          {isSubmitting ? "Guardando..." : isConfigurable ? "Regenerar variantes" : "Crear variantes"}
        </Button>
      </form>
    </div>
  );
}
