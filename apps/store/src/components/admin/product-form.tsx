"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ProductFormValues } from "@/lib/schemas/product";
import { productSchema } from "@/lib/schemas/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { uploadProductImage } from "@/lib/uploadProductImage";

type ProductFormProps = {
  initialValues?: ProductFormValues;
  productId?: string;
  initialImageUrl?: string | null;
};

export function ProductForm({ initialValues, productId, initialImageUrl }: ProductFormProps) {
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialImageUrl ?? "");
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialValues ?? {
      name: "",
      price: 0,
      slug: "",
      description: ""
    }
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
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Precio</Label>
        <Input id="price" type="number" {...form.register("price")} />
        {form.formState.errors.price && (
          <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
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
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
        )}
      </div>
      <div className="space-y-2">
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
            className="w-1/2 rounded-md object-contain"
          />
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Guardar"}
      </Button>
      {statusMessage && <p className="text-sm text-muted-foreground">{statusMessage}</p>}
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
    </form>
  );
}

