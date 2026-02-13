import { NextResponse } from "next/server";
import { getChildProductsWithVariantValues } from "@/lib/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("product_id");

  if (!productId) {
    return NextResponse.json(
      { ok: false, message: "Falta product_id" },
      { status: 400 }
    );
  }

  try {
    const variants = await getChildProductsWithVariantValues(productId);
    return NextResponse.json({ ok: true, variants });
  } catch (error) {
    console.error("[api] product-variants GET", error);
    return NextResponse.json(
      { ok: false, message: "Error listando variantes" },
      { status: 500 }
    );
  }
}
