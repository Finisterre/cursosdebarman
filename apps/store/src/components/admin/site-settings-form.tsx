"use client";

import { useState } from "react";
import type { SiteSettings } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { updateSiteSettingsAction } from "@/app/(app)/(admin)/admin/settings/actions";

type SiteSettingsFormProps = {
  initialValues: SiteSettings | null;
};

export function SiteSettingsForm({ initialValues }: SiteSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <form
      className="max-w-xl space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);
        const form = e.currentTarget;
        const formData = new FormData(form);
        try {
          const result = await updateSiteSettingsAction({
            site_name: (formData.get("site_name") as string) || "",
            default_meta_title: (formData.get("default_meta_title") as string) || null,
            default_meta_description: (formData.get("default_meta_description") as string) || null,
            default_meta_keywords: (formData.get("default_meta_keywords") as string) || null,
            default_meta_image: (formData.get("default_meta_image") as string) || null,
            google_verification: (formData.get("google_verification") as string) || null,
            google_analytics_id: (formData.get("google_analytics_id") as string) || null,
          });
          if (!result.ok) {
            setErrorMessage(result.error ?? "No se pudo guardar.");
            return;
          }
          toast({ title: "Configuración guardada" });
        } catch (err) {
          setErrorMessage("Error al guardar.");
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="site_name">Nombre del sitio</Label>
        <Input
          id="site_name"
          name="site_name"
          defaultValue={initialValues?.site_name ?? ""}
          placeholder="fs-eshop"
        />
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="text-sm font-semibold">SEO por defecto</h3>
        <div className="space-y-2">
          <Label htmlFor="default_meta_title">Meta Title por defecto</Label>
          <Input
            id="default_meta_title"
            name="default_meta_title"
            defaultValue={initialValues?.default_meta_title ?? ""}
            placeholder="Título para todas las páginas"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="default_meta_description">Meta Description por defecto</Label>
          <Textarea
            id="default_meta_description"
            name="default_meta_description"
            rows={2}
            defaultValue={initialValues?.default_meta_description ?? ""}
            placeholder="Descripción por defecto (~160 caracteres)"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="default_meta_keywords">Meta Keywords por defecto (opcional)</Label>
          <Input
            id="default_meta_keywords"
            name="default_meta_keywords"
            defaultValue={initialValues?.default_meta_keywords ?? ""}
            placeholder="palabra1, palabra2"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="default_meta_image">Meta Image por defecto (URL, opcional)</Label>
          <Input
            id="default_meta_image"
            name="default_meta_image"
            type="url"
            defaultValue={initialValues?.default_meta_image ?? ""}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="text-sm font-semibold">Google</h3>
        <div className="space-y-2">
          <Label htmlFor="google_verification">Código de verificación (meta tag content)</Label>
          <Input
            id="google_verification"
            name="google_verification"
            defaultValue={initialValues?.google_verification ?? ""}
            placeholder="Código de Google Search Console"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="google_analytics_id">Google Analytics ID (ej. G-XXXX)</Label>
          <Input
            id="google_analytics_id"
            name="google_analytics_id"
            defaultValue={initialValues?.google_analytics_id ?? ""}
            placeholder="G-XXXXXXXXXX"
          />
        </div>
      </div>

      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Guardar configuración"}
      </Button>
    </form>
  );
}
