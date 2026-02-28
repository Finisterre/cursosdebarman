"use client";

import { useState } from "react";
import type { Product } from "@/types";
import { ProductGalleryWithThumbs } from "@/components/store/product-gallery-with-thumbs";
import { ProductPurchaseBlock } from "@/components/store/product-purchase-block";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e";

type ProductDetailContentProps = {
  product: Product;
  children?: React.ReactNode;
};

export function ProductDetailContent({ product, children }: ProductDetailContentProps) {
  const [selectedChild, setSelectedChild] = useState<Product | null>(null);

  const mainImageUrl =
    selectedChild?.image_url ?? product.image_url ?? FALLBACK_IMAGE;

  const galleryImages = selectedChild
    ? (selectedChild.images ?? [])
    : (product.images ?? []);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <ProductGalleryWithThumbs
        mainImageUrl={mainImageUrl}
        images={galleryImages}
        name={product.name}
      />
      <div className="space-y-4">
        <h1 className="text-3xl ">{product.name}</h1>
        <ProductPurchaseBlock
          product={product}
          onSelectChild={setSelectedChild}
        />
        {children}
      </div>
    </div>
  );
}
