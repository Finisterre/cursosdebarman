import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  price: z.coerce.number().min(1, "Precio requerido"),
  slug: z.string().min(2, "Slug requerido"),
  description: z.string().min(10, "Descripción requerida")
});

export type ProductFormValues = z.infer<typeof productSchema>;

