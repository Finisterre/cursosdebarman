"use server";

import {
  addProductImages,
  setPrimaryImage as setPrimaryImageLib,
  reorderImages,
  deleteProductImage,
} from "@/lib/product-images";
import type { ProductImage } from "@/types";

export async function addProductImagesAction(
  productId: string,
  urls: string[]
): Promise<{ ok: boolean; images?: ProductImage[]; error?: string }> {
  if (!productId) return { ok: false, error: "productId requerido" };
  return addProductImages(productId, urls);
}

export async function setPrimaryImageAction(
  productId: string,
  imageId: string
): Promise<{ ok: boolean; error?: string }> {
  if (!productId || !imageId) return { ok: false, error: "Datos requeridos" };
  return setPrimaryImageLib(productId, imageId);
}

export async function reorderImagesAction(
  productId: string,
  ordering: { id: string; position: number }[]
): Promise<{ ok: boolean; error?: string }> {
  if (!productId) return { ok: false, error: "productId requerido" };
  return reorderImages(productId, ordering);
}

export async function deleteProductImageAction(
  imageId: string
): Promise<{ ok: boolean; error?: string }> {
  if (!imageId) return { ok: false, error: "imageId requerido" };
  return deleteProductImage(imageId);
}
