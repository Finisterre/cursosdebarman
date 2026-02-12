import { supabaseServer } from "@/lib/supabase/server";
import type { Product } from "@/types";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  featured: boolean | null;
};

const fallbackImage = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e";

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    price: row.price,
    image: row.image_url ?? fallbackImage,
    featured: row.featured ?? false
  };
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabaseServer
    .from("products")
    .select("id, name, slug, description, price, image_url, featured")
    .order("name");

  console.log("Supabase products response", { data, error });

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapProduct(row as ProductRow));
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabaseServer
    .from("products")
    .select("id, name, slug, description, price, image_url, featured")
    .eq("featured", true)
    .order("name");

  console.log("Supabase featured products response", { data, error });

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapProduct(row as ProductRow));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabaseServer
    .from("products")
    .select("id, name, slug, description, price, image_url, featured")
    .eq("slug", slug)
    .single();

  console.log("Supabase product by slug response", { slug, data, error });

  if (error || !data) {
    return null;
  }

  return mapProduct(data as ProductRow);
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabaseServer
    .from("products")
    .select("id, name, slug, description, price, image_url, featured")
    .eq("id", id)
    .single();

  console.log("Supabase product by id response", { id, data, error });

  if (error || !data) {
    return null;
  }

  return mapProduct(data as ProductRow);
}

