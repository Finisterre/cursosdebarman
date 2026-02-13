"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bannerSchema, type BannerFormValues } from "@/lib/schemas/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import type { Banner } from "@/types";

const POSITION_OPTIONS: { value: Banner["position"]; label: string }[] = [
  { value: "home_top", label: "Home - Arriba" },
  { value: "home_middle", label: "Home - Medio" },
  { value: "home_bottom", label: "Home - Abajo" },
  { value: "hero", label: "Hero" },
  { value: "sidebar", label: "Sidebar" }
];

const TYPE_OPTIONS: { value: Banner["type"]; label: string }[] = [
  { value: "image", label: "Imagen" },
  { value: "slider", label: "Slider" },
  { value: "promo", label: "Promo" },
  { value: "video", label: "Video" }
];

const defaultFormValues: BannerFormValues = {
  title: "",
  subtitle: "",
  image_url: "",
  mobile_image_url: "",
  link_url: "",
  link_text: "",
  position: "home_top",
  type: "image",
  display_order: 0,
  is_active: true,
  starts_at: "",
  ends_at: ""
};

type BannerFormProps = {
  initialValues?: BannerFormValues;
  bannerId?: string;
  createBannerAction?: (values: BannerFormValues) => Promise<{ ok: boolean; error?: string }>;
  /** Server Action: (bannerId, values) => Promise<{ ok, error? }>. Se pasa por referencia desde la página de edición. */
  updateBannerAction?: (bannerId: string, values: BannerFormValues) => Promise<{ ok: boolean; error?: string }>;
};

export function BannerForm({
  initialValues,
  bannerId,
  createBannerAction,
  updateBannerAction
}: BannerFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const isEdit = Boolean(bannerId && updateBannerAction);

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: initialValues ?? defaultFormValues
  });

  const bannerType = form.watch("type");

  const handleSubmit = async (values: BannerFormValues) => {
    setErrorMessage("");
    if (isEdit && bannerId && updateBannerAction) {
      const result = await updateBannerAction(bannerId, values);
      if (!result.ok) {
        setErrorMessage(result.error ?? "No se pudo guardar el banner.");
        return;
      }
      toast({ title: "Banner actualizado correctamente." });
    } else if (createBannerAction) {
      const result = await createBannerAction(values);
      if (!result.ok) {
        setErrorMessage(result.error ?? "No se pudo crear el banner.");
        return;
      }
      toast({ title: "Banner creado correctamente." });
      form.reset(defaultFormValues);
    }
  };

  return (
    <form
      className="space-y-4 max-w-xl"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input id="title" {...form.register("title")} />
          {form.formState.errors.title && (
            <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtítulo (opcional)</Label>
          <Input id="subtitle" {...form.register("subtitle")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">URL imagen *</Label>
        <Input id="image_url" type="url" placeholder="https://..." {...form.register("image_url")} />
        {form.formState.errors.image_url && (
          <p className="text-sm text-destructive">{form.formState.errors.image_url.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="mobile_image_url">URL imagen móvil (opcional)</Label>
        <Input id="mobile_image_url" type="url" placeholder="https://..." {...form.register("mobile_image_url")} />
      </div>

      {(bannerType === "promo" || bannerType === "image" || bannerType === "video") && (
        <>
          <div className="space-y-2">
            <Label htmlFor="link_url">URL del enlace (opcional)</Label>
            <Input id="link_url" type="url" placeholder="https://..." {...form.register("link_url")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link_text">Texto del botón/enlace (opcional)</Label>
            <Input id="link_text" placeholder="Ver más" {...form.register("link_text")} />
          </div>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="position">Posición</Label>
          <select
            id="position"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...form.register("position")}
          >
            {POSITION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <select
            id="type"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...form.register("type")}
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="display_order">Orden de visualización</Label>
          <Input id="display_order" type="number" min={0} {...form.register("display_order")} />
          {form.formState.errors.display_order && (
            <p className="text-sm text-destructive">{form.formState.errors.display_order.message}</p>
          )}
        </div>
        <div className="flex items-center gap-2 pt-8">
          <input
            type="checkbox"
            id="is_active"
            className="h-4 w-4 rounded border-input"
            {...form.register("is_active")}
          />
          <Label htmlFor="is_active">Activo</Label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="starts_at">Vigencia desde (opcional, ISO)</Label>
          <Input id="starts_at" type="datetime-local" {...form.register("starts_at")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ends_at">Vigencia hasta (opcional, ISO)</Label>
          <Input id="ends_at" type="datetime-local" {...form.register("ends_at")} />
        </div>
      </div>

      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
      <Button type="submit">{isEdit ? "Guardar cambios" : "Crear banner"}</Button>
    </form>
  );
}
