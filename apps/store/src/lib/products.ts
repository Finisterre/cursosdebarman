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
  category_id: string | null;
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
    featured: row.featured ?? false,
    category_id: row.category_id ?? null
  };
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabaseServer
    .from("products")
    .select("id, name, slug, description, price, image_url, featured, category_id")
    .order("name");

  console.log("Supabase getProducts", { data, error });

  if (error || !data) {
    return [];
  }

  console.log("Get products", data);

  return data.map((row) => mapProduct(row as ProductRow));
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabaseServer
    .from("products")
    .select("id, name, slug, description, price, image_url, featured, category_id")
    .eq("featured", true)
    .order("name");

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapProduct(row as ProductRow));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabaseServer
    .from("products")
    .select("id, name, slug, description, price, image_url, featured, category_id")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }



  return mapProduct(data as ProductRow);
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabaseServer
    .from("products")
    .select("id, name, slug, description, price, image_url, featured, category_id")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return mapProduct(data as ProductRow);
}

