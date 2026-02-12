"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProductVariantForAdmin } from "@/lib/variants";
import type { VariantOption, VariantType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { saveVariantsAction } from "@/app/(app)/(admin)/admin/products/[id]/edit/actions";
import { Trash2 } from "lucide-react";

type VariantRow = {
  variantOptionId: string;
  typeName: string;
  value: string;
  price: number;
  stock: number;
};

type ProductVariantFormProps = {
  productId: string;
  variantTypes: VariantType[];
  variantOptions: VariantOption[];
  initialVariants: ProductVariantForAdmin[];
};

export function ProductVariantForm({
  productId,
  variantTypes,
  variantOptions,
  initialVariants,
}: ProductVariantFormProps) {
  const [rows, setRows] = useState<VariantRow[]>(() =>
    initialVariants.map((v) => ({
      variantOptionId: v.variantOptionId,
      typeName: v.name,
      value: v.value,
      price: v.price,
      stock: v.stock,
    }))
  );
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [selectedOptionIds, setSelectedOptionIds] = useState<Set<string>>(new Set());
  const [priceByNewOption, setPriceByNewOption] = useState<Record<string, number>>({});
  const [stockByNewOption, setStockByNewOption] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  const optionsForType = selectedTypeId
    ? variantOptions.filter((o) => o.variantTypeId === selectedTypeId)
    : [];

  const selectedType = variantTypes.find((t) => t.id === selectedTypeId);

  const addSelectedToRows = useCallback(() => {
    if (!selectedType || selectedOptionIds.size === 0) return;
    const toAdd: VariantRow[] = [];
    selectedOptionIds.forEach((optionId) => {
      const opt = variantOptions.find((o) => o.id === optionId);
      if (!opt || rows.some((r) => r.variantOptionId === optionId)) return;
      toAdd.push({
        variantOptionId: opt.id,
        typeName: selectedType.name,
        value: opt.value,
        price: priceByNewOption[optionId] ?? 0,
        stock: stockByNewOption[optionId] ?? 0,
      });
    });
    if (toAdd.length > 0) {
      setRows((prev) => [...prev, ...toAdd]);
      setSelectedOptionIds(new Set());
      setPriceByNewOption((p) => {
        const next = { ...p };
        selectedOptionIds.forEach((id) => delete next[id]);
        return next;
      });
      setStockByNewOption((s) => {
        const next = { ...s };
        selectedOptionIds.forEach((id) => delete next[id]);
        return next;
      });
    }
  }, [
    selectedType,
    selectedOptionIds,
    variantOptions,
    rows,
    priceByNewOption,
    stockByNewOption,
  ]);

  const removeRow = useCallback((variantOptionId: string) => {
    setRows((prev) => prev.filter((r) => r.variantOptionId !== variantOptionId));
  }, []);

  const updateRow = useCallback(
    (variantOptionId: string, field: "price" | "stock", value: number) => {
      setRows((prev) =>
        prev.map((r) =>
          r.variantOptionId === variantOptionId ? { ...r, [field]: value } : r
        )
      );
    },
    []
  );

  const toggleOption = useCallback((optionId: string) => {
    setSelectedOptionIds((prev) => {
      const next = new Set(prev);
      if (next.has(optionId)) next.delete(optionId);
      else next.add(optionId);
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const result = await saveVariantsAction(
        productId,
        rows.map((r) => ({ variantOptionId: r.variantOptionId, price: r.price, stock: r.stock }))
      );
      if (!result.ok) {
        toast({
          title: "Error",
          description: result.error ?? "No se pudieron guardar las variantes",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Variantes guardadas", description: "Los cambios se guardaron correctamente." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Ocurrió un error al guardar.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [productId, rows]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Variantes</h2>
        <Button type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar variantes"}
        </Button>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
        <p className="text-sm font-medium">Agregar variantes</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Tipo de variante</Label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={selectedTypeId}
              onChange={(e) => {
                setSelectedTypeId(e.target.value);
                setSelectedOptionIds(new Set());
              }}
            >
              <option value="">Seleccionar tipo</option>
              {variantTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {selectedTypeId && optionsForType.length > 0 && (
          <>
            <div className="space-y-2">
              <Label>Opciones</Label>
              <div className="flex flex-wrap gap-3">
                {optionsForType.map((opt) => {
                  const isSelected = selectedOptionIds.has(opt.id);
                  const alreadyInRows = rows.some((r) => r.variantOptionId === opt.id);
                  return (
                    <label
                      key={opt.id}
                      className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={alreadyInRows}
                        onChange={() => toggleOption(opt.id)}
                        className="rounded border-input"
                      />
                      <span>{opt.value}</span>
                      {alreadyInRows && (
                        <span className="text-xs text-muted-foreground">(ya agregada)</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
            {selectedOptionIds.size > 0 && (
              <div className="space-y-2">
                <Label>Precio y stock por opción</Label>
                <div className="flex flex-wrap gap-4">
                  {Array.from(selectedOptionIds).map((optionId) => {
                    const opt = variantOptions.find((o) => o.id === optionId);
                    if (!opt) return null;
                    return (
                      <div
                        key={optionId}
                        className="flex items-end gap-2 rounded border p-2"
                      >
                        <span className="text-sm font-medium">{opt.value}</span>
                        <div className="flex gap-2">
                          <div>
                            <Label className="sr-only">Precio</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Precio"
                              className="w-24"
                              value={priceByNewOption[optionId] ?? ""}
                              onChange={(e) =>
                                setPriceByNewOption((p) => ({
                                  ...p,
                                  [optionId]: Number(e.target.value) || 0,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label className="sr-only">Stock</Label>
                            <Input
                              type="number"
                              placeholder="Stock"
                              className="w-20"
                              value={stockByNewOption[optionId] ?? ""}
                              onChange={(e) =>
                                setStockByNewOption((s) => ({
                                  ...s,
                                  [optionId]: Number(e.target.value) || 0,
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addSelectedToRows}>
                  Agregar al listado
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay variantes. Seleccioná un tipo y opciones para agregar.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.variantOptionId}>
                <TableCell className="font-medium">{r.typeName}</TableCell>
                <TableCell>{r.value}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    className="w-28"
                    value={r.price}
                    onChange={(e) =>
                      updateRow(r.variantOptionId, "price", Number(e.target.value) || 0)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    className="w-24"
                    value={r.stock}
                    onChange={(e) =>
                      updateRow(r.variantOptionId, "stock", Number(e.target.value) || 0)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeRow(r.variantOptionId)}
                    aria-label="Quitar variante"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
