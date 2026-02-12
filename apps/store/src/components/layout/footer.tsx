import { Container } from "@/components/layout/container";

export function Footer() {
  return (
    <footer className="border-t py-6 text-sm text-muted-foreground">
      <Container className="flex items-center justify-between">
        <span>© {new Date().getFullYear()} fs-eshop</span>
        <span>Hecho con Next.js y Supabase</span>
      </Container>
    </footer>
  );
}

