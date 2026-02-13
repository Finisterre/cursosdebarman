"use server";

import { revalidatePath } from "next/cache";
import { updateSiteSettings } from "@/lib/site-settings";

export async function updateSiteSettingsAction(input: {
  site_name?: string;
  default_meta_title?: string | null;
  default_meta_description?: string | null;
  default_meta_keywords?: string | null;
  default_meta_image?: string | null;
  google_verification?: string | null;
  google_analytics_id?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const result = await updateSiteSettings(input);
  if (result.ok) {
    revalidatePath("/admin/settings");
    revalidatePath("/");
  }
  return result;
}
