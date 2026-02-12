import { supabaseServer } from "@/lib/supabase/server";
import type { Category } from "@/types";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  is_active: boolean;
};

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    parent_id: row.parent_id ?? null,
    is_active: row.is_active
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
    .select("id, name, slug, description, parent_id, is_active")
    .order("name", { ascending: true });

  console.log("Supabase categories response", { data, error });

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapCategory(row as CategoryRow));
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("id, name, slug, description, parent_id, is_active")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return mapCategory(data as CategoryRow);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("id, name, slug, description, parent_id, is_active")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return mapCategory(data as CategoryRow);
}

export async function getRootCategories(): Promise<Category[]> {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("id, name, slug, description, parent_id, is_active")
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

