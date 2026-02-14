"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ProductFormValues } from "@/lib/schemas/product";
import { productSchema } from "@/lib/schemas/product";
import type { Category, VariantType, VariantValue } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { uploadProductImage } from "@/lib/uploadProductImage";
import { SEOFormSection } from "@/components/admin/seo-form-section";
import { createProductAction } from "@/app/(app)/(admin)/admin/products/new/actions";
import type { OptionByType } from "@/lib/products";

type CategoryOption = { id: string; label: string; depth: number };

function flattenCategories(categories: Category[], depth = 0): CategoryOption[] {
  const result: CategoryOption[] = [];
  categories.forEach((category) => {
    const prefix = depth > 0 ? `${"-- ".repeat(depth)}` : "";
    result.push({ id: category.id, label: `${prefix}${category.name}`, depth });
    if (category.children && category.children.length > 0) {
      result.push(...flattenCategories(category.children, depth + 1));
    }
  });
  return result;
}

type NewProductFormProps = {
  categories: Category[];
  variantTypes: VariantType[];
  variantValuesByType: Record<string, VariantValue[]>;
};

export function NewProductForm({
  categories,
  variantTypes,
  variantValuesByType,
}: NewProductFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [variantSelections, setVariantSelections] = useState<Record<string, VariantValue[]>>({});

  const categoryOptions = useMemo(() => flattenCategories(categories), [categories]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      sale_price: null as number | null,
      slug: "",
      description: "",
      category_id: "",
      featured: false,
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      meta_image: "",
      canonical_url: "",
      no_index: false,
    },
  });

  useEffect(() => {
    if (!selectedFile) return;
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const toggleVariantValue = (typeId: string, value: VariantValue) => {
    setVariantSelections((prev) => {
      const current = prev[typeId] ?? [];
      const exists = current.some((v) => v.id === value.id);
      const next = exists
        ? current.filter((v) => v.id !== value.id)
        : [...current, value];
      return { ...prev, [typeId]: next };
    });
  };

  const hasVariantSelection =
    variantTypes.length > 0 &&
    variantTypes.some((t) => (variantSelections[t.id]?.length ?? 0) > 0);

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit(async (values) => {
        setIsSubmitting(true);
        setErrorMessage("");
        try {
          const variantOptions: Record<string, OptionByType[]> | null = hasVariantSelection
            ? variantTypes.reduce<Record<string, OptionByType[]>>((acc, t) => {
                const selected = variantSelections[t.id] ?? [];
                if (selected.length > 0) {
                  acc[t.id] = selected.map((v) => ({ id: v.id, value: v.value }));
                }
                return acc;
              }, {})
            : null;

          const result = await createProductAction({
            name: values.name,
            slug: values.slug,
            description: values.description,
            category_id: values.category_id || null,
            featured: values.featured,
            price: hasVariantSelection ? null : values.price ?? 0,
            sale_price: hasVariantSelection ? null : values.sale_price ?? null,
            variantOptions: variantOptions ?? undefined,
            meta_title: values.meta_title || null,
            meta_description: values.meta_description || null,
            meta_keywords: values.meta_keywords || null,
            meta_image: values.meta_image || null,
            canonical_url: values.canonical_url || null,
            no_index: values.no_index ?? false,
          });

          if (!result.ok) {
            setErrorMessage(result.error ?? "Error al crear el producto.");
            return;
          }

          const currentProductId = result.id!;
          let imageUrlToSave: string | null = null;

          if (selectedFile) {
            imageUrlToSave = await uploadProductImage(currentProductId, selectedFile);
          }

          if (imageUrlToSave) {
            const updateRes = await fetch("/api/admin/products", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: currentProductId,
                ...values,
                price: hasVariantSelection ? null : values.price,
                sale_price: hasVariantSelection ? null : values.sale_price ?? null,
                image_url: imageUrlToSave,
              }),
            });
            const updateData = (await updateRes.json()) as { ok: boolean; message?: string };
            if (!updateRes.ok || !updateData.ok) {
              setErrorMessage(updateData.message ?? "Error al guardar imagen.");
              return;
            }
            setPreviewUrl(imageUrlToSave);
          }

          toast({
            title: "Producto creado",
            description: "El producto se creó correctamente.",
          });
          form.reset();
          setVariantSelections({});
        } catch (error) {
          console.error("Error creando producto", error);
          setErrorMessage("Ocurrió un error al guardar.");
        } finally {
          setIsSubmitting(false);
        }
      })}
    >
      <div className="flex flex-row gap-8">
        <div className="space-y-2 w-1/2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2 w-1/4">
          <Label htmlFor="price">Precio (producto simple)</Label>
          <Input id="price" type="number" min={0} step={0.01} {...form.register("price")} />
          {hasVariantSelection && (
            <p className="text-xs text-muted-foreground">No aplica si usás variantes.</p>
          )}
          {form.formState.errors.price && (
            <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
          )}
        </div>
        <div className="space-y-2 w-1/4">
          <Label htmlFor="sale_price">Precio oferta (opcional)</Label>
          <Input
            id="sale_price"
            type="number"
            min={0}
            step={0.01}
            placeholder=""
            {...form.register("sale_price")}
          />
          {hasVariantSelection && (
            <p className="text-xs text-muted-foreground">No aplica si usás variantes.</p>
          )}
        </div>
        <div className="space-y-2 w-1/4">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...form.register("slug")} />
          {form.formState.errors.slug && (
            <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" {...form.register("description")} />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="flex flex-row gap-8">
        <div className="space-y-2 w-1/2">
          <Label htmlFor="category_id">Categoría</Label>
          <select
            id="category_id"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            {...form.register("category_id")}
          >
            <option value="">Sin categoría</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 w-1/2">
          <Label className="text-sm font-medium">Destacado</Label>
          <Controller
            name="featured"
            control={form.control}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>
      </div>

      {variantTypes.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
          <Label className="text-sm font-medium">Variantes (producto configurable)</Label>
          <p className="text-xs text-muted-foreground">
            Seleccioná al menos un valor por tipo para crear combinaciones. Si no seleccionás nada, se crea un producto simple.
          </p>
          {variantTypes.map((type) => {
            const options = variantValuesByType[type.id] ?? [];
            return (
              <div key={type.id}>
                <p className="text-sm font-medium mb-2">{type.name}</p>
                <div className="flex flex-wrap gap-2">
                  {options.map((opt) => {
                    const selected = (variantSelections[type.id] ?? []).some(
                      (v) => v.id === opt.id
                    );
                    return (
                      <label
                        key={opt.id}
                        className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleVariantValue(type.id, opt)}
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
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="image">Imagen</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
        />
        {previewUrl && (
          <img src={previewUrl} alt="Vista previa" className="mt-2 w-full max-w-xs rounded-md object-contain" />
        )}
      </div>

      <SEOFormSection
        form={form}
        titleField="meta_title"
        descriptionField="meta_description"
        keywordsField="meta_keywords"
        imageField="meta_image"
        canonicalField="canonical_url"
        noIndexField="no_index"
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Crear producto"}
      </Button>
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
    </form>
  );
}
