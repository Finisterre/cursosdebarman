"use client";

import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import type { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

type HeaderProps = {
  categories: Category[];
};

export function Header({ categories }: HeaderProps) {
  const { totalItems } = useCart();

  return (
    <header className="border-b">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          fs-eshop
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          {/* <Link href="/products" className="transition-colors hover:text-foreground">
            Productos
          </Link> */}
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/${category.slug}`}
              className="transition-colors hover:text-foreground"
            >
              {category.name}
            </Link>
          ))}
          {/* <Link href="/admin/login" className="transition-colors hover:text-foreground">
            Admin
          </Link> */}
        </nav>
        <Button asChild variant="secondary">
          <Link href="/cart">Carrito ({totalItems})</Link>
        </Button>
      </Container>
    </header>
  );
}

