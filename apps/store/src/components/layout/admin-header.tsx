"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export function AdminHeader() {
  return (
    <header className="border-b bg-background">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/admin/dashboard" className="text-lg font-semibold">
          Admin fs-eshop
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/admin/products" className="transition-colors hover:text-foreground">
            Productos
          </Link>
          <Link href="/admin/categories" className="transition-colors hover:text-foreground">
            Categorías
          </Link>
          <Link href="/admin/variant-types" className="transition-colors hover:text-foreground">
            Variantes
          </Link>
          <Link href="/admin/orders" className="transition-colors hover:text-foreground">
            Pedidos
          </Link>
          <Link href="/admin/banners" className="transition-colors hover:text-foreground">
            Banners
          </Link>
        </nav>
        <Button
          variant="secondary"
          onClick={() => {
            document.cookie = "admin_session=; Max-Age=0; path=/";
            window.location.href = "/admin/login";
          }}
        >
          Salir
        </Button>
      </Container>
    </header>
  );
}

