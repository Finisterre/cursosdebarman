import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  slug: z.string().min(2, "Slug requerido"),
  description: z.string().optional().or(z.literal("")),
  parent_id: z.string().optional().or(z.literal("")).nullable(),
  is_active: z.boolean(),
  /** URL de imagen de banner (solo categorías raíz). Se sube al bucket y se crea/actualiza un banner. */
  banner_image_url: z.string().optional().or(z.literal("")),
  // SEO
  meta_title: z.string().optional().or(z.literal("")),
  meta_description: z.string().optional().or(z.literal("")),
  meta_keywords: z.string().optional().or(z.literal("")),
  meta_image: z.string().optional().or(z.literal("")),
  canonical_url: z.string().optional().or(z.literal("")),
  no_index: z.boolean().optional().default(false),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

