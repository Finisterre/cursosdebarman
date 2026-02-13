import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  price: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().min(0).optional().nullable(),
  slug: z.string().min(2, "Slug requerido"),
  description: z.string().min(10, "Descripción requerida"),
  category_id: z.string().optional().or(z.literal("")).nullable(),
  featured: z.boolean().optional().default(false),
  // SEO
  meta_title: z.string().optional().or(z.literal("")),
  meta_description: z.string().optional().or(z.literal("")),
  meta_keywords: z.string().optional().or(z.literal("")),
  meta_image: z.string().optional().or(z.literal("")),
  canonical_url: z.string().optional().or(z.literal("")),
  no_index: z.boolean().optional().default(false),
});

export type ProductFormValues = z.infer<typeof productSchema>;

