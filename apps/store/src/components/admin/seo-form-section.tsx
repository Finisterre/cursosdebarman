"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const META_TITLE_MAX = 60;
const META_DESC_MAX = 160;

type SEOFormSectionProps = {
  form: UseFormReturn<any>;
  titleField: string;
  descriptionField: string;
  keywordsField: string;
  imageField: string;
  canonicalField: string;
  noIndexField: string;
  className?: string;
};

export function SEOFormSection({
  form,
  titleField,
  descriptionField,
  keywordsField,
  imageField,
  canonicalField,
  noIndexField,
  className,
}: SEOFormSectionProps) {
  const title = form.watch(titleField) ?? "";
  const description = form.watch(descriptionField) ?? "";

  return (
    <div className={cn("space-y-6 rounded-lg border p-4", className)}>
      <h3 className="text-sm font-semibold">SEO</h3>

      <div className="space-y-2">
        <Label htmlFor={titleField}>Meta Title</Label>
        <Input
          id={titleField}
          placeholder="Título para buscadores (recomendado ~60 caracteres)"
          {...form.register(titleField)}
        />
        <p className={cn("text-xs", title.length > META_TITLE_MAX ? "text-amber-600" : "text-muted-foreground")}>
          {title.length}/{META_TITLE_MAX}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={descriptionField}>Meta Description</Label>
        <Textarea
          id={descriptionField}
          rows={2}
          placeholder="Descripción para buscadores (recomendado ~160 caracteres)"
          {...form.register(descriptionField)}
        />
        <p className={cn("text-xs", description.length > META_DESC_MAX ? "text-amber-600" : "text-muted-foreground")}>
          {description.length}/{META_DESC_MAX}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={keywordsField}>Meta Keywords (opcional)</Label>
        <Input id={keywordsField} placeholder="palabra1, palabra2" {...form.register(keywordsField)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={imageField}>Meta Image URL (opcional)</Label>
        <Input id={imageField} type="url" placeholder="https://..." {...form.register(imageField)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={canonicalField}>Canonical URL (opcional)</Label>
        <Input id={canonicalField} type="url" placeholder="https://..." {...form.register(canonicalField)} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register(noIndexField)} className="h-4 w-4 rounded border-input" />
        No indexar en buscadores
      </label>

      {/* Preview tipo Google */}
      <div className="rounded border bg-muted/40 p-3 text-left">
        <p className="text-xs text-muted-foreground mb-1">Vista previa (Google)</p>
        <p className="text-blue-600 text-lg hover:underline cursor-default truncate">
          {title || "Título de la página"}
        </p>
        <p className="text-sm text-green-700 cursor-default">
          {typeof window !== "undefined" ? window.location.origin : ""}/...
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description || "Descripción que aparecerá en los resultados de búsqueda."}
        </p>
      </div>
    </div>
  );
}
