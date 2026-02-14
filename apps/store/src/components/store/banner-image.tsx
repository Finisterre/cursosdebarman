import Image from "next/image";
import Link from "next/link";
import type { Banner } from "@/types";
import { cn } from "@/lib/utils";

export function BannerImage({ banner, className, aspect }: { banner: Banner; className?: string; aspect?: string }) {
  const content = (
    <>
      <Image
        src={banner.image_url}
        alt={banner.title}
        width={1920}
        height={500}
        className={cn("object-cover", className)}
        sizes="(max-width: 768px) 100vw, 1920px"
      />
      {(banner.title || banner.subtitle) && (
        <div className={cn("absolute inset-0 flex flex-col items-center justify-center gap-1 p-4 text-center", !banner.show_title && !banner.subtitle ? "bg-transparent" : "bg-black/20")}>
          {banner.title && banner.show_title && <span className="text-xl font-semibold text-white drop-shadow-md md:text-2xl">{banner.title}</span>}
          {banner.subtitle && <span className="text-sm text-white/90 drop-shadow md:text-base">{banner.subtitle}</span>}
          {banner.link_url && banner.link_text && (
            <span className="mt-2 inline-block rounded bg-white/90 px-4 py-2 text-sm font-medium text-black">
              {banner.link_text}
            </span>
          )}
        </div>
      )}
    </>
  );

  if (banner.link_url) {
    return (
      <Link href={banner.link_url as any} className={cn("block relative overflow-hidden rounded-lg", aspect ? `aspect-[${aspect}]` : "")}>
       
        {content}
      </Link>
    );
  }
  return <div className="relative overflow-hidden rounded-lg">{content}</div>;
}
