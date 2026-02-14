import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";
import { getBannersForStore } from "@/lib/banners";
import { getSiteSettings } from "@/lib/site-settings";
import { absoluteUrl } from "@/lib/seo";
import { ProductList } from "@/components/store/product-list";
import { HomeBanners } from "@/components/store/home-banners";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings?.default_meta_title ?? settings?.site_name ?? "fs-eshop";
  const description = settings?.default_meta_description ?? undefined;
  const keywords = settings?.default_meta_keywords?.trim() || undefined;
  const image = settings?.default_meta_image ?? undefined;
  const url = absoluteUrl("/");

  return {
    title,
    description,
    keywords: keywords ? keywords.split(",").map((k) => k.trim()).filter(Boolean) : undefined,
    openGraph: {
      title,
      description: description ?? undefined,
      url,
      siteName: settings?.site_name ?? undefined,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description ?? undefined,
      images: image ? [image] : undefined,
    },
    alternates: { canonical: url },
  };
}

export default async function StoreHomePage() {
  const [featured, bannersTop, bannersHero, bannersMiddle, bannersBottom] = await Promise.all([
    getFeaturedProducts(),
    getBannersForStore("home_top"),
    getBannersForStore("hero"),
    getBannersForStore("home_middle"),
    getBannersForStore("home_bottom")
  ]);


  return (
    <div className="space-y-12">
      {bannersHero.length > 0 && (
        <HomeBanners banners={bannersHero} position="hero" />
      )}

      {bannersTop.length > 0 && (
        <HomeBanners banners={bannersTop} position="home_top" />
      )}

      {/* <section className="rounded-2xl border bg-muted/30 px-8 py-12">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm text-muted-foreground">Colección destacada</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Ecommerce moderno listo para escalar.
          </h1>
          <p className="text-muted-foreground">
            Estructura limpia, UI minimalista y base sólida para integrar pagos y logística.
          </p>
          <Button asChild>
            <Link href="/products">Explorar productos</Link>
          </Button>
        </div>
      </section> */}

      {bannersMiddle.length > 0 && (
        <HomeBanners banners={bannersMiddle} position="home_middle" />
      )}

    

      <section className="space-y-6 max-w-6xl mx-auto" aria-label="Productos destacados">
        <header className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Destacados</h2>
          <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">
            Ver todo
          </Link>
        </header>
        <ProductList products={featured} />
      </section>

      {bannersBottom.length > 0 && (
        <HomeBanners banners={bannersBottom} position="home_bottom" />
      )}
    </div>
  );
}

