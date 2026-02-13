"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { VariantType, VariantValue } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  createVariantTypeAction,
  createVariantValueAction,
  deleteVariantTypeAction,
  deleteVariantValueAction,
} from "./actions";

type Props = {
  variantTypes: VariantType[];
  valuesByType: Record<string, VariantValue[]>;
};

export function VariantTypesClient({ variantTypes, valuesByType }: Props) {
  const router = useRouter();
  const [newTypeName, setNewTypeName] = useState("");
  const [addingValueForTypeId, setAddingValueForTypeId] = useState<string | null>(null);
  const [newValueText, setNewValueText] = useState("");

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    const formData = new FormData();
    formData.set("name", newTypeName.trim());
    const result = await createVariantTypeAction(formData);
    if (result.ok) {
      toast({ title: "Tipo creado", description: "Se agregó el tipo de variante." });
      setNewTypeName("");
      router.refresh();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleCreateValue = async (typeId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newValueText.trim()) return;
    const formData = new FormData();
    formData.set("variantTypeId", typeId);
    formData.set("value", newValueText.trim());
    const result = await createVariantValueAction(formData);
    if (result.ok) {
      toast({ title: "Valor creado", description: "Se agregó el valor." });
      setNewValueText("");
      setAddingValueForTypeId(null);
      router.refresh();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleDeleteType = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar el tipo "${name}" y todos sus valores?`)) return;
    const result = await deleteVariantTypeAction(id);
    if (result.ok) {
      toast({ title: "Tipo eliminado" });
      router.refresh();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleDeleteValue = async (id: string, value: string) => {
    if (!confirm(`¿Eliminar el valor "${value}"?`)) return;
    const result = await deleteVariantValueAction(id);
    if (result.ok) {
      toast({ title: "Valor eliminado" });
      router.refresh();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-medium mb-4">Nuevo tipo de variante</h2>
        <form onSubmit={handleCreateType} className="flex gap-4 items-end">
          <div className="space-y-2 flex-1 max-w-xs">
            <Label htmlFor="newTypeName">Nombre (ej. Color, Talle)</Label>
            <Input
              id="newTypeName"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="Ej: Material"
            />
          </div>
          <Button type="submit">Agregar tipo</Button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-4">Tipos y valores</h2>
        {variantTypes.length === 0 ? (
          <p className="text-muted-foreground">No hay tipos. Agregá uno arriba.</p>
        ) : (
          <div className="space-y-6">
            {variantTypes.map((type) => {
              const values = valuesByType[type.id] ?? [];
              const isAdding = addingValueForTypeId === type.id;
              return (
                <div key={type.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold">{type.name}</span>
                      <span className="text-muted-foreground text-sm ml-2">/{type.slug}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteType(type.id, type.name)}
                    >
                      Eliminar tipo
                    </Button>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Valores:</p>
                    <ul className="flex flex-wrap gap-2 mb-2">
                      {values.map((v) => (
                        <li
                          key={v.id}
                          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm"
                        >
                          {v.value}
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteValue(v.id, v.value)}
                            aria-label={`Quitar ${v.value}`}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                    {!isAdding ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAddingValueForTypeId(type.id)}
                      >
                        + Agregar valor
                      </Button>
                    ) : (
                      <form
                        onSubmit={(e) => handleCreateValue(type.id, e)}
                        className="flex gap-2 items-center"
                      >
                        <Input
                          value={newValueText}
                          onChange={(e) => setNewValueText(e.target.value)}
                          placeholder="Nuevo valor"
                          className="max-w-[200px]"
                          autoFocus
                        />
                        <Button type="submit" size="sm">
                          Guardar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAddingValueForTypeId(null);
                            setNewValueText("");
                          }}
                        >
                          Cancelar
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
