import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import type { Banner } from "@/types";

type BannerRow = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  mobile_image_url: string | null;
  link_url: string | null;
  link_text: string | null;
  position: string;
  type: string;
  display_order: number;
  is_active: boolean;
  show_title?: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: BannerRow): Banner {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? null,
    image_url: row.image_url,
    mobile_image_url: row.mobile_image_url ?? null,
    link_url: row.link_url ?? null,
    link_text: row.link_text ?? null,
    position: row.position as Banner["position"],
    type: row.type as Banner["type"],
    display_order: Number(row.display_order) ?? 0,
    is_active: Boolean(row.is_active),
    show_title: row.show_title ?? true,
    starts_at: row.starts_at ?? null,
    ends_at: row.ends_at ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

/** Lista todos los banners (admin). */
export async function getBanners(): Promise<Banner[]> {
  const { data, error } = await supabaseAdmin
    .from("banners")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[banners] getBanners", error);
    return [];
  }
  return (data ?? []).map((r) => mapRow(r as BannerRow));
}

/** Banners para la tienda: activos, vigentes por fecha, opcionalmente por posición. */
export async function getBannersForStore(
  position?: Banner["position"]
): Promise<Banner[]> {
  const now = new Date().toISOString();
  let query = supabaseServer
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (position) {
    query = query.eq("position", position);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[banners] getBannersForStore", error);
    return [];
  }
  const list = (data ?? []).map((r) => mapRow(r as BannerRow));
  return list.filter((b) => {
    if (b.position === "category") return false;
    if (b.starts_at && b.starts_at > now) return false;
    if (b.ends_at && b.ends_at < now) return false;
    return true;
  });
}

/** Obtener un banner por id (admin). */
export async function getBannerById(id: string): Promise<Banner | null> {
  const { data, error } = await supabaseAdmin
    .from("banners")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return mapRow(data as BannerRow);
}

/** Actualizar banner (admin). */
export async function updateBanner(
  id: string,
  input: {
    title: string;
    subtitle?: string | null;
    image_url: string;
    mobile_image_url?: string | null;
    link_url?: string | null;
    link_text?: string | null;
    position: Banner["position"];
    type: Banner["type"];
    display_order: number;
    is_active: boolean;
    show_title?: boolean;
    starts_at?: string | null;
    ends_at?: string | null;
  }
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabaseAdmin
    .from("banners")
    .update({
      title: input.title,
      subtitle: input.subtitle ?? null,
      image_url: input.image_url,
      mobile_image_url: input.mobile_image_url ?? null,
      link_url: input.link_url ?? null,
      link_text: input.link_text ?? null,
      position: input.position,
      type: input.type,
      display_order: input.display_order,
      is_active: input.is_active,
      show_title: input.show_title ?? true,
      starts_at: input.starts_at ?? null,
      ends_at: input.ends_at ?? null,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    console.error("[banners] updateBanner", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** Crear banner (admin). */
export async function createBanner(input: {
  title: string;
  subtitle?: string | null;
  image_url: string;
  mobile_image_url?: string | null;
  link_url?: string | null;
  link_text?: string | null;
  position: Banner["position"];
  type: Banner["type"];
  display_order: number;
  is_active: boolean;
  show_title?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const { error, data } = await supabaseAdmin
    .from("banners")
    .insert({
      title: input.title,
      subtitle: input.subtitle ?? null,
      image_url: input.image_url,
      mobile_image_url: input.mobile_image_url ?? null,
      link_url: input.link_url ?? null,
      link_text: input.link_text ?? null,
      position: input.position,
      type: input.type,
      display_order: input.display_order,
      is_active: input.is_active,
      show_title: input.show_title ?? true,
      starts_at: input.starts_at ?? null,
      ends_at: input.ends_at ?? null
    })
    .select("id")
    .single();

  if (error) {
    console.error("[banners] createBanner", error);
    return { ok: false, error: error.message };
  }
  return { ok: true, id: (data as { id: string })?.id };
}

/** Eliminar banner (admin). */
export async function deleteBanner(id: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabaseAdmin.from("banners").delete().eq("id", id);

  if (error) {
    console.error("[banners] deleteBanner", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
