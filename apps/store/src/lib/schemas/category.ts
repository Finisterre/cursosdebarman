import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  slug: z.string().min(2, "Slug requerido"),
  description: z.string().optional().or(z.literal("")),
  parent_id: z.string().optional().or(z.literal("")).nullable(),
  is_active: z.boolean()
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

