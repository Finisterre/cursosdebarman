"use client";

import { useState } from "react";
import type { Product } from "@/types";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductPurchaseBlock } from "@/components/store/product-purchase-block";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e";

type ProductDetailContentProps = {
  product: Product;
  children?: React.ReactNode;
};

export function ProductDetailContent({ product, children }: ProductDetailContentProps) {
  const [selectedChild, setSelectedChild] = useState<Product | null>(null);

  const imageUrl =
    selectedChild?.image_url ?? product.image_url ?? FALLBACK_IMAGE;

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <ProductGallery image={imageUrl} name={product.name} />
      <div className="space-y-4">
        {children}
        <ProductPurchaseBlock
          product={product}
          onSelectChild={setSelectedChild}
        />
      </div>
    </div>
  );
}
