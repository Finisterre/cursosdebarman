import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getRootCategories } from "@/lib/categories";
import { getSiteSettings } from "@/lib/site-settings";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const verification = settings?.google_verification?.trim();
  return {
    ...(verification && {
      verification: { google: verification },
    }),
  };
}

export default async function StoreLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const categories = await getRootCategories();
  return (
    <div className="flex min-h-screen flex-col ">
      <Header categories={categories} />
      <main className="flex-1">
        <Container className="py-10">{children}</Container>
      </main>
      <Footer />
    </div>
  );
}

