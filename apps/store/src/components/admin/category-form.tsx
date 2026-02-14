"use client";

import { useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CategoryFormValues } from "@/lib/schemas/category";
import { categorySchema } from "@/lib/schemas/category";
import type { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { SEOFormSection } from "@/components/admin/seo-form-section";
import { uploadBannerImage } from "@/lib/uploadBannerImage";
import Image from "next/image";

type CategoryFormProps = {
  categories: Category[];
  initialValues?: CategoryFormValues;
  categoryId?: string;
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

export function CategoryForm({ categories, initialValues, categoryId }: CategoryFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const options = useMemo(() => flattenCategories(categories), [categories]);

  const [uploadingBanner, setUploadingBanner] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialValues ?? {
      name: "",
      slug: "",
      description: "",
      parent_id: "",
      is_active: true,
      banner_image_url: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      meta_image: "",
      canonical_url: "",
      no_index: false,
    }
  });

  const parentId = form.watch("parent_id");
  const isRootCategory = !parentId || parentId === "";
  const bannerImageUrl = form.watch("banner_image_url");

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const url = await uploadBannerImage(file);
      form.setValue("banner_image_url", url);
      toast({ title: "Imagen subida" });
    } catch (err) {
      toast({ title: "Error al subir la imagen", variant: "destructive" });
    } finally {
      setUploadingBanner(false);
      e.target.value = "";
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        setIsSubmitting(true);
        setErrorMessage("");
        try {
          const response = await fetch("/api/admin/categories", {
            method: categoryId ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              ...values,
              id: categoryId
            })
          });

          const data = (await response.json()) as { ok: boolean; message?: string };

          if (!response.ok || !data.ok) {
            setErrorMessage(data.message ?? "No se pudo guardar.");
            return;
          }

          toast({
            title: categoryId ? "Categoría actualizada" : "Categoría creada",
            description: "Los cambios se guardaron correctamente."
          });
        } catch (error) {
          console.error("Error guardando categoría", error);
          setErrorMessage("Ocurrió un error al guardar.");
        } finally {
          setIsSubmitting(false);
        }
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" {...form.register("slug")} />
        {form.formState.errors.slug && (
          <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" {...form.register("description")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="parent_id">Categoría padre</Label>
        <select
          id="parent_id"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          {...form.register("parent_id")}
        >
          <option value="">Sin categoría padre</option>
          {options.map((option) => (
            <option key={option.id} value={option.id} disabled={option.id === categoryId}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register("is_active")} />
        Activa
      </label>

      {isRootCategory && (
        <div className="space-y-2">
          <Label>Banner (solo categorías raíz)</Label>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerUpload}
          />
          {bannerImageUrl ? (
            <div className="space-y-2">
              <div className="relative h-32 w-full max-w-md overflow-hidden rounded-md border bg-muted">
                <Image src={bannerImageUrl} alt="Banner" title="fs-shop" fill className="object-cover" sizes="400px" />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingBanner}
                  onClick={() => bannerInputRef.current?.click()}
                >
                  {uploadingBanner ? "Subiendo…" : "Cambiar imagen"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => form.setValue("banner_image_url", "")}
                >
                  Quitar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={uploadingBanner}
              onClick={() => bannerInputRef.current?.click()}
            >
              {uploadingBanner ? "Subiendo…" : "Subir imagen de banner"}
            </Button>
          )}
        </div>
      )}

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
        {isSubmitting ? "Guardando..." : "Guardar"}
      </Button>
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
    </form>
  );
}

