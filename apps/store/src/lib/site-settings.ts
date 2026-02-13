import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { SiteSettings } from "@/types";

type SiteSettingsRow = {
  id: string;
  site_name: string;
  default_meta_title: string | null;
  default_meta_description: string | null;
  default_meta_keywords: string | null;
  default_meta_image: string | null;
  google_verification: string | null;
  google_analytics_id: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: SiteSettingsRow): SiteSettings {
  return {
    id: row.id,
    site_name: row.site_name,
    default_meta_title: row.default_meta_title ?? null,
    default_meta_description: row.default_meta_description ?? null,
    default_meta_keywords: row.default_meta_keywords ?? null,
    default_meta_image: row.default_meta_image ?? null,
    google_verification: row.google_verification ?? null,
    google_analytics_id: row.google_analytics_id ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/** Obtener configuración global del sitio (SEO, etc.). Para metadata y layout. */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabaseServer
    .from("site_settings")
    .select("*")
    .limit(1)
    .single();

  if (error || !data) return null;
  return mapRow(data as SiteSettingsRow);
}

/** Actualizar site settings (admin). */
export async function updateSiteSettings(input: {
  site_name?: string;
  default_meta_title?: string | null;
  default_meta_description?: string | null;
  default_meta_keywords?: string | null;
  default_meta_image?: string | null;
  google_verification?: string | null;
  google_analytics_id?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const { data: existing } = await supabaseAdmin.from("site_settings").select("id").limit(1).single();
  if (!existing?.id) {
    const { error: insertErr } = await supabaseAdmin.from("site_settings").insert({
      site_name: input.site_name ?? "fs-eshop",
      default_meta_title: input.default_meta_title ?? null,
      default_meta_description: input.default_meta_description ?? null,
      default_meta_keywords: input.default_meta_keywords ?? null,
      default_meta_image: input.default_meta_image ?? null,
      google_verification: input.google_verification ?? null,
      google_analytics_id: input.google_analytics_id ?? null,
    });
    if (insertErr) {
      console.error("[site-settings] insert", insertErr);
      return { ok: false, error: insertErr.message };
    }
    return { ok: true };
  }

  const updatePayload: Record<string, unknown> = {};
  if (input.site_name !== undefined) updatePayload.site_name = input.site_name;
  if (input.default_meta_title !== undefined) updatePayload.default_meta_title = input.default_meta_title;
  if (input.default_meta_description !== undefined) updatePayload.default_meta_description = input.default_meta_description;
  if (input.default_meta_keywords !== undefined) updatePayload.default_meta_keywords = input.default_meta_keywords;
  if (input.default_meta_image !== undefined) updatePayload.default_meta_image = input.default_meta_image;
  if (input.google_verification !== undefined) updatePayload.google_verification = input.google_verification;
  if (input.google_analytics_id !== undefined) updatePayload.google_analytics_id = input.google_analytics_id;

  if (Object.keys(updatePayload).length === 0) return { ok: true };

  const { error } = await supabaseAdmin
    .from("site_settings")
    .update(updatePayload)
    .eq("id", existing.id);

  if (error) {
    console.error("[site-settings] update", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
