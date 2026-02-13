"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import {
  updateProductPriceStockAction,
  deleteVariantChildAction,
} from "@/app/(app)/(admin)/admin/products/[id]/edit/actions";

type ChildWithValues = Product & { variantValues?: { value: string; variantTypeName: string }[] };

type Props = {
  children: ChildWithValues[];
};

function variantLabel(child: ChildWithValues): string {
  const values = child.variantValues ?? [];
  if (values.length === 0) return child.sku ?? child.slug ?? child.id;
  return values.map((v) => v.value).join(" · ");
}

export function ProductVariantsPriceStockEditor({ children }: Props) {
  const router = useRouter();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localState, setLocalState] = useState<Record<string, { price: string; stock: string }>>(
    () =>
      Object.fromEntries(
        children.map((c) => [
          c.id,
          {
            price: c.price != null ? String(c.price) : "",
            stock: c.stock != null ? String(c.stock) : "0",
          },
        ])
      )
  );

  const handleSave = async (child: ChildWithValues) => {
    setSavingId(child.id);
    const state = localState[child.id] ?? { price: "", stock: "" };
    const price = state.price === "" ? null : Number(state.price);
    const stock = state.stock === "" ? null : Number(state.stock);
    const result = await updateProductPriceStockAction(child.id, price, stock ?? 0);
    setSavingId(null);
    if (result.ok) {
      toast({ title: "Guardado", description: "Precio y stock actualizados." });
      router.refresh();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const updateLocal = (childId: string, field: "price" | "stock", value: string) => {
    setLocalState((prev) => ({
      ...prev,
      [childId]: {
        ...(prev[childId] ?? { price: "", stock: "0" }),
        [field]: value,
      },
    }));
  };

  const performDelete = async (child: ChildWithValues) => {
    setDeletingId(child.id);
    const result = await deleteVariantChildAction(child.id);
    setDeletingId(null);
    if (result.ok) {
      toast({ title: "Variante eliminada" });
      router.refresh();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const showDeleteConfirm = (child: ChildWithValues) => {
    const label = variantLabel(child);
    const toastResult = toast({
      variant: "destructive",
      title: "¿Eliminar variante?",
      description: `Se borrará "${label}". No se puede deshacer.`,
      action: (
        <Button
          size="sm"
          variant="outline"
          className="border-destructive/50 text-destructive hover:bg-destructive/10"
          onClick={async () => {
            await performDelete(child);
            toastResult.dismiss();
          }}
        >
          Eliminar
        </Button>
      ),
    });
  };

  if (children.length === 0) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Variante</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="w-[140px]">Precio</TableHead>
            <TableHead className="w-[120px]">Stock</TableHead>
            <TableHead className="w-[100px]"></TableHead>
            <TableHead className="w-[80px]"></TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {children.map((child) => (
            <TableRow key={child.id}>
              <TableCell className="font-medium">{variantLabel(child)}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {child.sku ?? "—"}
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={localState[child.id]?.price ?? (child.price != null ? String(child.price) : "")}
                  onChange={(e) => updateLocal(child.id, "price", e.target.value)}
                  placeholder="0"
                  className="h-9"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  value={localState[child.id]?.stock ?? (child.stock != null ? String(child.stock) : "0")}
                  onChange={(e) => updateLocal(child.id, "stock", e.target.value)}
                  className="h-9"
                />
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSave(child)}
                  disabled={savingId === child.id}
                >
                  {savingId === child.id ? "..." : "Guardar"}
                </Button>
              </TableCell>
              <TableCell>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/products/${child.id}/edit`}>Editar</Link>
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => showDeleteConfirm(child)}
                  disabled={deletingId === child.id}
                >
                  {deletingId === child.id ? "..." : "Borrar"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
