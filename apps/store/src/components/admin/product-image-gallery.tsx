"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Star, Trash2, ChevronUp, ChevronDown, Upload } from "lucide-react";
import {
  addProductImagesAction,
  setPrimaryImageAction,
  reorderImagesAction,
  deleteProductImageAction,
} from "@/app/(app)/(admin)/admin/products/[id]/edit/product-images-actions";

type ProductImageGalleryProps = {
  productId: string;
  initialImages: ProductImage[];
};

export function ProductImageGallery({ productId, initialImages }: ProductImageGalleryProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<ProductImage[]>(initialImages);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.set("productId", productId);
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const res = await fetch("/api/admin/products/images", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as { ok: boolean; urls?: string[]; message?: string };

      if (!res.ok || !data.ok || !data.urls?.length) {
        toast({ title: "Error", description: data.message ?? "Error subiendo imágenes", variant: "destructive" });
        return;
      }

      const result = await addProductImagesAction(productId, data.urls);
      if (result.ok && result.images?.length) {
        setImages((prev) => [...prev, ...result.images!].sort((a, b) => a.position - b.position));
        toast({ title: "Imágenes agregadas", description: `${result.images.length} imagen(es) subida(s).` });
        router.refresh();
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Error subiendo imágenes", variant: "destructive" });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    const result = await setPrimaryImageAction(productId, imageId);
    if (result.ok) {
      setImages((prev) =>
        prev.map((img) => ({ ...img, is_primary: img.id === imageId }))
      );
      toast({ title: "Imagen principal actualizada" });
      router.refresh();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const next = direction === "up" ? index - 1 : index + 1;
    if (next < 0 || next >= images.length) return;

    const newOrder = [...images];
    [newOrder[index], newOrder[next]] = [newOrder[next], newOrder[index]];
    const ordering = newOrder.map((img, i) => ({ id: img.id, position: i }));

    const result = await reorderImagesAction(productId, ordering);
    if (result.ok) {
      setImages(newOrder.map((img, i) => ({ ...img, position: i })));
      router.refresh();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleDelete = (img: ProductImage) => {
    const toastResult = toast({
      variant: "destructive",
      title: "¿Eliminar imagen?",
      description: "Se borrará del producto y del almacenamiento.",
      action: (
        <Button
          size="sm"
          variant="outline"
          className="border-destructive/50 text-destructive hover:bg-destructive/10"
          onClick={async () => {
            const result = await deleteProductImageAction(img.id);
            toastResult.dismiss();
            if (result.ok) {
              setImages((prev) => prev.filter((i) => i.id !== img.id));
              toast({ title: "Imagen eliminada" });
              router.refresh();
            } else {
              toast({ title: "Error", description: result.error, variant: "destructive" });
            }
          }}
        >
          Eliminar
        </Button>
      ),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Galería de imágenes</h3>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Subiendo..." : "Subir imágenes"}
          </Button>
        </div>
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 border border-dashed rounded-lg text-center">
          Sin imágenes. Subí una o más para la galería.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div
              key={img.id}
              className="relative group rounded-lg border overflow-hidden bg-muted/30"
            >
              <div className="aspect-square relative">
                <Image
                  src={img.url}
                  alt=""
                  title="fs-shop"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {img.is_primary && (
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center gap-1 rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                      <Star size={12} /> Principal
                    </span>
                  </div>
                )}
              </div>
              <div className="p-2 flex flex-wrap items-center gap-1 border-t bg-background">
                {!img.is_primary && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => handleSetPrimary(img.id)}
                  >
                    <Star size={14} className="mr-1" />
                    Principal
                  </Button>
                )}
                <div className="flex">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                    aria-label="Subir"
                  >
                    <ChevronUp size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleMove(index, "down")}
                    disabled={index === images.length - 1}
                    aria-label="Bajar"
                  >
                    <ChevronDown size={16} />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 ml-auto"
                  onClick={() => handleDelete(img)}
                  aria-label="Eliminar"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
