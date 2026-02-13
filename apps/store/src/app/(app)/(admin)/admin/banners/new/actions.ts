"use server";

import { revalidatePath } from "next/cache";
import { createBanner } from "@/lib/banners";
import type { BannerFormValues } from "@/lib/schemas/banner";

export async function createBannerAction(values: BannerFormValues) {
  const image_url = values.image_url?.trim() || "";
  if (!image_url) {
    return { ok: false as const, error: "URL de imagen requerida" };
  }

  const result = await createBanner({
    title: values.title,
    subtitle: values.subtitle || null,
    image_url,
    mobile_image_url: values.mobile_image_url?.trim() || null,
    link_url: values.link_url?.trim() || null,
    link_text: values.link_text?.trim() || null,
    position: values.position,
    type: values.type,
    display_order: values.display_order,
    is_active: values.is_active,
    show_title: values.show_title,
    starts_at: values.starts_at?.trim() || null,
    ends_at: values.ends_at?.trim() || null
  });

  if (result.ok) {
    revalidatePath("/admin/banners");
  }
  return result;
}
