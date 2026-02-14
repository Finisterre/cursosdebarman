"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import type { ProductImage } from "@/types";
import { cn } from "@/lib/utils";

type ProductGalleryWithThumbsProps = {
  mainImageUrl: string;
  images: ProductImage[];
  name: string;
};

export function ProductGalleryWithThumbs({
  mainImageUrl,
  images,
  name,
}: ProductGalleryWithThumbsProps) {
  const sortedImages = useMemo(
    () => [...images].sort((a, b) => a.position - b.position),
    [images]
  );

  const thumbnails = useMemo(
    () => [{ url: mainImageUrl, id: "main" }, ...sortedImages],
    [mainImageUrl, sortedImages]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [mainImageUrl, images]);

  const displayUrl = thumbnails[selectedIndex]?.url ?? mainImageUrl;
  const showThumbnails = thumbnails.length > 1;

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border bg-muted/30">
        <Image
          src={displayUrl}
          alt={name}
          title={name || "fs-shop"}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {showThumbnails && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {thumbnails.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                selectedIndex === index
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/50"
              )}
            >
              <Image
                src={item.url}
                alt=""
                title={name || "fs-shop"}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
