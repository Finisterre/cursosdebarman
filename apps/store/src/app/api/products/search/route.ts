import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export type ProductSearchResult = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  sale_price: number | null;
  image_url: string | null;
};

/**
 * GET /api/products/search?q=...
 * Full-text search para autocomplete. Preparado para:
 * - Ranking por popularidad / ventas / stock
 * - Búsqueda semántica con embeddings
 * - Logging de búsquedas populares
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabaseServer.rpc("search_products", {
    search_query: q,
  });

  if (error) {
    console.error("[api/products/search]", error);
    return NextResponse.json([]);
  }

  const results: ProductSearchResult[] = (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    price: row.price != null ? Number(row.price) : null,
    sale_price: row.sale_price != null ? Number(row.sale_price) : null,
    image_url: (row.image_url as string) ?? null,
  }));

  return NextResponse.json(results);
}
