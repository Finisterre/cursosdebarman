import { Container } from "@/components/layout/container";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getRootCategories } from "@/lib/categories";

export const revalidate = 0;

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

