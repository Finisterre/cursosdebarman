import Image from "next/image";
import Link from "next/link";
import type { Banner } from "@/types";
import { cn } from "@/lib/utils";
import { BannerSwiper } from "./banner-swiper";
import { BannerImage } from "./banner-image";

type HomeBannersProps = {
  banners: Banner[];
  position: Banner["position"];
  className?: string;
};

export { BannerImage } from "./banner-image";

export function HomeBanners({ banners, position, className }: HomeBannersProps) {
  const list = banners.filter((b) => b.position === position);
  if (list.length === 0) return null;

  const isSlider = list.some((b) => b.type === "slider");
  const isHero = position === "hero";

  if (isSlider && list.length > 0) {
    return (

    <BannerSwiper banners={list} className={className} />
    );
  }

  if (isHero && list[0]) {
    return (
      <section className={cn("relative w-full", className)}>
        <div className="relative  w-full overflow-hidden rounded-xl ">
          <BannerImage banner={list[0]} className="h-full w-full" />
        </div>
      </section>
    );
  }


  const aspect = list.length === 1 ? "aspect-[21/9]" : list.length === 2 ? "aspect-[1/1]" : list.length === 3 ? "aspect-[3/1]" : "aspect-[4/1]";

  const gridClass =
    list.length === 1
      ? "grid grid-cols-1 gap-4 w-full"
      : list.length === 2
        ? "grid grid-cols-1 md:grid-cols-2 gap-4"
        : list.length === 3
          ? "grid grid-cols-1 md:grid-cols-3 gap-4"
          : list.length >= 4
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4";

  return (
    <section className={cn(gridClass, className)}>
      {list.map((b) => (
        <div key={b.id} className="overflow-hidden rounded-lg border bg-muted/30">
          {b.type === "promo" ? (
            <div className="flex flex-col">
              <div className="relative aspect-video w-full">
                <Image
                  src={b.image_url}
                  alt={b.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{b.title}</h3>
                {b.subtitle && <p className="text-sm text-muted-foreground">{b.subtitle}</p>}
                {b.link_url && b.link_text && (
                  <Link href={b.link_url as any} className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
                    {b.link_text}
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <>
            
          
              <BannerImage banner={b} className="w-full" aspect={aspect}  />
              </>
          )}
        </div>
      ))}
    </section>
  );
}
