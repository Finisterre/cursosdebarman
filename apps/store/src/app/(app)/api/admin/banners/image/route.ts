import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = "product-images";

function getExtension(file: File): string {
  const name = file.name;
  const i = name.lastIndexOf(".");
  if (i === -1) return "jpg";
  return name.slice(i + 1).toLowerCase() || "jpg";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "Falta archivo" }, { status: 400 });
  }

  const ext = getExtension(file);
  const filePath = `banners/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (error) {
    console.error("[api] banners/image upload", error);
    return NextResponse.json(
      { ok: false, message: "Error subiendo imagen", details: error.message },
      { status: 500 }
    );
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath);

  if (!data.publicUrl) {
    return NextResponse.json(
      { ok: false, message: "No se pudo obtener URL pública" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, publicUrl: data.publicUrl });
}
