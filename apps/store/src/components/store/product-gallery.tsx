import Image from "next/image";

export function ProductGallery({ image, name }: { image: string; name: string }) {
  return (
    <div className="relative h-96 w-full overflow-hidden rounded-xl border">
      <Image src={image} alt={name} title={name || "fs-shop"} fill className="object-contain" sizes="100vw" />
    </div>
  );
}

