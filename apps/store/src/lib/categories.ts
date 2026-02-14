import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Category, Banner } from "@/types";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  is_active: boolean;
  banner_id?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  meta_image?: string | null;
  canonical_url?: string | null;
  no_index?: boolean | null;
  updated_at?: string | null;
};

type BannerRow = {
  id: string;
  image_url: string;
  title?: string;
  [key: string]: unknown;
};

function mapBanner(row: BannerRow | null): Banner | null {
  if (!row || !row.id) return null;
  return {
    id: row.id,
    title: row.title ?? "",
    subtitle: null,
    image_url: row.image_url,
    mobile_image_url: null,
    link_url: null,
    link_text: null,
    position: "category",
    type: "image",
    display_order: 0,
    is_active: true,
    show_title: false,
    created_at: "",
    updated_at: "",
  };
}

function mapCategory(row: CategoryRow & { banners?: BannerRow | null }): Category {
  const hasBannerJoin = row && "banners" in row && row.banners;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    parent_id: row.parent_id ?? null,
    is_active: row.is_active,
    banner_id: row.banner_id ?? null,
    banner: hasBannerJoin ? mapBanner(row.banners as BannerRow) : null,
    meta_title: row.meta_title ?? null,
    meta_description: row.meta_description ?? null,
    meta_keywords: row.meta_keywords ?? null,
    meta_image: row.meta_image ?? null,
    canonical_url: row.canonical_url ?? null,
    no_index: row.no_index ?? null,
    updated_at: row.updated_at ?? null,
  };
}

function sortCategories(categories: Category[]): Category[] {
  const sorted = [...categories].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  sorted.forEach((category) => {
    if (category.children && category.children.length > 0) {
      category.children = sortCategories(category.children);
    }
  });

  return sorted;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("*")
    .order("name", { ascending: true });


  if (error || !data) {
    return [];
  }

  return data.map((row) => mapCategory(row as CategoryRow));
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*, banners(*)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return mapCategory(data as CategoryRow & { banners?: BannerRow | null });
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return mapCategory(data as CategoryRow);
}

/** Categoría por slug con banner (para la página de categoría en la store). */
export async function getCategoryBySlugWithBanner(slug: string): Promise<Category | null> {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("*, banners(*)")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return mapCategory(data as CategoryRow & { banners?: BannerRow | null });
}

export async function getRootCategories(): Promise<Category[]> {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("*")
    .is("parent_id", null)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapCategory(row as CategoryRow));
}

export async function getCategoriesTree(): Promise<Category[]> {
  const categories = await getCategories();
  const map = new Map<string, Category>();
  const roots: Category[] = [];

  categories.forEach((category) => {
    map.set(category.id, { ...category, children: [] });
  });

  map.forEach((category) => {
    if (category.parent_id && map.has(category.parent_id)) {
      const parent = map.get(category.parent_id);
      if (parent) {
        parent.children = parent.children ?? [];
        parent.children.push(category);
      }
    } else {
      roots.push(category);
    }
  });

  return sortCategories(roots);
}

function findCategoryInTree(
  categories: Category[],
  slug: string
): Category | null {
  for (const category of categories) {
    if (category.slug === slug) {
      return category;
    }
    if (category.children && category.children.length > 0) {
      const found = findCategoryInTree(category.children, slug);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function collectCategoryIds(category: Category): string[] {
  const ids = [category.id];
  if (category.children && category.children.length > 0) {
    category.children.forEach((child) => {
      ids.push(...collectCategoryIds(child));
    });
  }
  return ids;
}

export async function getCategoryDescendantsBySlug(slug: string): Promise<{
  category: Category | null;
  ids: string[];
}> {
  const tree = await getCategoriesTree();
  const category = findCategoryInTree(tree, slug);
  if (!category) {
    return { category: null, ids: [] };
  }
  return { category, ids: collectCategoryIds(category) };
}

export async function deleteCategory(id: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabaseAdmin.from("categories").delete().eq("id", id);
  if (error) {
    console.error("[categories] deleteCategory", id, error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** Para sitemap: categorías activas con slug y updated_at. */
export async function getCategoriesForSitemap(): Promise<{ slug: string; updated_at: string | null }[]> {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("slug, updated_at")
    .eq("is_active", true);

  if (error || !data) return [];
  return data.map((r: { slug: string; updated_at: string | null }) => ({
    slug: r.slug,
    updated_at: r.updated_at ?? null,
  }));
}

