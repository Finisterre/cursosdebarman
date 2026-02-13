"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ProductFormValues } from "@/lib/schemas/product";
import { productSchema } from "@/lib/schemas/product";
import type { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { uploadProductImage } from "@/lib/uploadProductImage";

type ProductFormProps = {
  initialValues?: ProductFormValues;
  productId?: string;
  initialImageUrl?: string | null;
  categories: Category[];
};

type CategoryOption = {
  id: string;
  label: string;
  depth: number;
};

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

export function ProductForm({
  initialValues,
  productId,
  initialImageUrl,
  categories
}: ProductFormProps) {
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialImageUrl ?? "");
  const categoryOptions = useMemo(() => flattenCategories(categories), [categories]);
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialValues ?? {
      name: "",
      price: 0,
      stock: 0,
      slug: "",
      description: "",
      category_id: "",
      featured: false,
    },
  });

  useEffect(() => {
    if (!selectedFile) {
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        setIsSubmitting(true);
        setErrorMessage("");
        setStatusMessage("");
        try {
          let currentProductId = productId ?? "";
          let imageUrlToSave: string | null = initialImageUrl ?? null;

          if (!productId) {
            const createResponse = await fetch("/api/admin/products", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(values)
            });

            const createData = (await createResponse.json()) as {
              ok: boolean;
              message?: string;
              id?: string;
            };

            if (!createResponse.ok || !createData.ok || !createData.id) {
              setErrorMessage(createData.message ?? "No se pudo crear el producto.");
              return;
            }

            currentProductId = createData.id;
          }

          if (selectedFile) {
            imageUrlToSave = await uploadProductImage(currentProductId, selectedFile);
          }

          const updateResponse = await fetch("/api/admin/products", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              ...values,
              id: currentProductId,
              image_url: imageUrlToSave ?? undefined
            })
          });

          const updateData = (await updateResponse.json()) as { ok: boolean; message?: string };

          if (!updateResponse.ok || !updateData.ok) {
            setErrorMessage(updateData.message ?? "No se pudo guardar.");
            return;
          }

          toast({
            title: productId ? "Producto actualizado" : "Producto creado",
            description: "Los cambios se guardaron correctamente."
          });
          setStatusMessage(productId ? "Producto actualizado." : "Producto creado.");
          if (imageUrlToSave) {
            setPreviewUrl(imageUrlToSave);
          }
        } catch (error) {
          console.error("Error guardando producto", error);
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
        <Label htmlFor="price">Precio</Label>
        <Input id="price" type="number" min={0} step={0.01} {...form.register("price")} />
        {form.formState.errors.price && (
          <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
        )}
      </div>
      <div className="space-y-2 w-1/4">
        <Label htmlFor="stock">Stock</Label>
        <Input id="stock" type="number" min={0} {...form.register("stock")} />
        {form.formState.errors.stock && (
          <p className="text-sm text-destructive">{form.formState.errors.stock.message}</p>
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
      <div>
          <Label className="text-sm font-medium">Destacado</Label>
          <p className="text-xs text-muted-foreground">Se muestra en la portada.</p>
        </div>
        <Controller
          name="featured"
          control={form.control}
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </div>
      </div>

      <div className="flex flex-row gap-8">
      <div className="space-y-2 w-1/2">
        <Label htmlFor="image">Imagen</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setSelectedFile(file);
          }}
        />
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Vista previa"
            className="w-full rounded-md object-contain max-h-64"
          />
        )}
      </div>

      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Guardar"}
      </Button>
      {statusMessage && <p className="text-sm text-muted-foreground">{statusMessage}</p>}
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
    </form>
  );
}

