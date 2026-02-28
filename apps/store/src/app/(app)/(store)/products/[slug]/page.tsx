import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFeaturedProducts, getProductWithVariants, getProductBySlug } from "@/lib/products";
import { getProductImages } from "@/lib/product-images";
import { getSiteSettings } from "@/lib/site-settings";
import { absoluteUrl } from "@/lib/seo";
import { ProductDetailContent } from "@/components/store/product-detail-content";
import { ProductJsonLd } from "@/components/store/product-json-ld";
import { Badge } from "@/components/ui/badge";
import { ProductList } from "@/components/store/product-list";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getCategoryById } from "@/lib/categories";

export const revalidate = 0;

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()]);
  if (!product) return { title: "Producto no encontrado" };

  const title = product.meta_title?.trim() || product.name || settings?.default_meta_title || settings?.site_name || "Producto";
  const description =
    product.meta_description?.trim() ||
    product.description?.slice(0, 160) ||
    settings?.default_meta_description?.trim() ||
    undefined;
  const image =
    product.meta_image?.trim() ||
    product.image_url?.trim() ||
    settings?.default_meta_image?.trim() ||
    undefined;
  const keywordsRaw =
    product.meta_keywords?.trim() ||
    settings?.default_meta_keywords?.trim() ||
    undefined;
  const keywords = keywordsRaw
    ? keywordsRaw.split(",").map((k) => k.trim()).filter(Boolean)
    : undefined;
  const canonical = product.canonical_url?.trim() || absoluteUrl(`/products/${product.slug}`);
  const noIndex = product.no_index ?? false;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: product.meta_title?.trim() || product.name,
      description: description ?? undefined,
      url: canonical,
      images: image ? [{ url: image }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.meta_title?.trim() || product.name,
      description: description ?? undefined,
      images: image ? [image] : undefined,
    },
    alternates: { canonical },
    robots: { index: !noIndex, follow: true },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductWithVariants(slug);
  const featured = await getFeaturedProducts();
  const category = await getCategoryById(product?.category_id ?? "");

  if (!product) {
    notFound();
  }

  const parentCategory = category?.parent_id
    ? await getCategoryById(category.parent_id)
    : null;

  const breadcrumbSegments: { label: string; href: string }[] = [];
  if (parentCategory) {
    breadcrumbSegments.push({ label: parentCategory.name, href: `/${parentCategory.slug}` });
  }
  if (category) {
    breadcrumbSegments.push({ label: category.name, href: `/${category.slug}` });
  }
  breadcrumbSegments.push({ label: product.name, href: "" });

  const parentImages = await getProductImages(product.id);
  const productWithImages: typeof product = {
    ...product,
    images: parentImages,
    variants: product.variants?.length
      ? await Promise.all(
          product.variants.map(async (v) => ({
            ...v,
            images: await getProductImages(v.id),
          }))
        )
      : [],
  };

  return (
    <>
      <ProductJsonLd product={product} />
      <Breadcrumb root={{ label: "Inicio", href: "/" }} segments={breadcrumbSegments} />
      <article itemScope itemType="https://schema.org/Product">
        <ProductDetailContent product={productWithImages}>
          <header className="space-y-2">
            {/* {product.featured && <Badge variant="secondary">Destacado</Badge>} */}
            {/* <h1 className="text-3xl ">{product.name}</h1> */}
          </header>
          <p className="text-white whitespace-pre-wrap">{product.description}</p>
        </ProductDetailContent>
      </article>
      <section className="space-y-6 mt-20" aria-label="Productos destacados">
        <header className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Destacados</h2>
          <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">
            Ver todo
          </Link>
        </header>
        <ProductList products={featured} />
      </section>
    </>
  );
}
