export async function uploadProductImage(productId: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("productId", productId);
  formData.append("file", file);

  const response = await fetch("/api/admin/products/image", {
    method: "POST",
    body: formData
  });

  const data = (await response.json()) as { ok: boolean; publicUrl?: string; message?: string };

  if (!response.ok || !data.ok || !data.publicUrl) {
    throw new Error(data.message ?? "No se pudo subir la imagen.");
  }

  return data.publicUrl;
}

