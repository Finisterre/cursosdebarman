"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Banner } from "@/types";
import { BannerImage } from "./banner-image";
import { cn } from "@/lib/utils";
import "swiper/css";
import "swiper/css/navigation";

type BannerSwiperProps = {
  banners: Banner[];
  className?: string;
};

export function BannerSwiper({ banners, className }: BannerSwiperProps) {
  if (banners.length === 0) return null;

  return (
    <section className={cn("relative w-full", className)}>
      <Swiper
        modules={[Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        loop={banners.length > 1}
        navigation
      >
        {banners.map((b) => (
          <SwiperSlide key={b.id}>
            <div className="overflow-hidden rounded-lg">
              <BannerImage banner={b} className=" w-full object-cover" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
