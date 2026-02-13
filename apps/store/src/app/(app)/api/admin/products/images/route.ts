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
  const productId = formData.get("productId");

  if (typeof productId !== "string" || !productId) {
    return NextResponse.json({ ok: false, message: "Falta productId" }, { status: 400 });
  }

  const files = formData.getAll("files");
  const fileList = Array.isArray(files) ? files : [files];
  const validFiles = fileList.filter((f): f is File => f instanceof File);

  if (validFiles.length === 0) {
    return NextResponse.json({ ok: false, message: "No hay archivos" }, { status: 400 });
  }

  const urls: string[] = [];

  for (const file of validFiles) {
    const ext = getExtension(file);
    const filePath = `products/${productId}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type || "image/jpeg",
      });

    if (error) {
      console.error("[api] products/images upload", error);
      return NextResponse.json(
        { ok: false, message: "Error subiendo imagen", details: error.message },
        { status: 500 }
      );
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath);
    if (data.publicUrl) {
      urls.push(data.publicUrl);
    }
  }

  return NextResponse.json({ ok: true, urls });
}
