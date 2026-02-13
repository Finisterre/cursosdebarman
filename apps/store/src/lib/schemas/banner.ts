import { z } from "zod";

const positionEnum = z.enum(["home_top", "home_middle", "home_bottom", "hero", "sidebar"]);
const typeEnum = z.enum(["image", "slider", "promo", "video"]);

export const bannerSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  subtitle: z.string().optional().or(z.literal("")),
  image_url: z.string().min(1, "URL de imagen requerida").refine((v) => !v || v.startsWith("http"), "URL inválida"),
  mobile_image_url: z.string().url().optional().or(z.literal("")),
  link_url: z.string().url().optional().or(z.literal("")),
  link_text: z.string().optional().or(z.literal("")),
  position: positionEnum,
  type: typeEnum,
  display_order: z.coerce.number().int().min(0),
  is_active: z.boolean(),
  starts_at: z.string().optional().or(z.literal("")),
  ends_at: z.string().optional().or(z.literal(""))
});

export type BannerFormValues = z.infer<typeof bannerSchema>;
