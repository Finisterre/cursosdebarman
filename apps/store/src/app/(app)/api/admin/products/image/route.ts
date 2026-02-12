import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const formData = await request.formData();
  const productId = formData.get("productId");
  const file = formData.get("file");

  if (typeof productId !== "string" || !productId) {
    return NextResponse.json({ ok: false, message: "Falta productId" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "Falta archivo" }, { status: 400 });
  }

  const filePath = `products/${productId}/main.jpg`;

  const { error } = await supabaseAdmin.storage
    .from("product-images")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type || "image/jpeg"
    });

  if (error) {
    return NextResponse.json(
      { ok: false, message: "Error subiendo imagen", details: error.message },
      { status: 500 }
    );
  }

  const { data } = supabaseAdmin.storage.from("product-images").getPublicUrl(filePath);

  if (!data.publicUrl) {
    return NextResponse.json(
      { ok: false, message: "No se pudo obtener URL pública" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, publicUrl: data.publicUrl });
}

