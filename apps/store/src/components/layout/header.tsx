"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import type { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type HeaderProps = {
  categories: Category[];
};

export function Header({ categories }: HeaderProps) {
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b bg-black py-4">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold" onClick={() => setMobileMenuOpen(false)}>
          <Image src="/top-logo.svg" alt="Logo" width={200} height={200} />
        </Link>

        {/* Desktop: nav + carrito */}
        <nav className="hidden items-center gap-4 text-sm text-muted-foreground md:flex">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/${category.slug}`}
              className="text-white transition-colors hover:text-gray-400"
            >
              {category.name}
            </Link>
          ))}
        </nav>
        <Button asChild variant="secondary" className="hidden md:inline-flex">
          <Link href="/cart">Carrito ({totalItems})</Link>
        </Button>

        {/* Mobile: hamburger */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileMenuOpen}
          className="flex h-10 w-10 items-center justify-center text-white md:hidden"
          onClick={() => setMobileMenuOpen((o) => !o)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </Container>

      {/* Mobile menu panel */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          !mobileMenuOpen && "pointer-events-none"
        )}
        aria-hidden={!mobileMenuOpen}
      >
        <button
          type="button"
          aria-label="Cerrar"
          className={cn(
            "absolute inset-0 bg-black/60 transition-opacity",
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileMenuOpen(false)}
        />
        <aside
          className={cn(
            "absolute right-0 top-0 flex h-full w-64 flex-col gap-2 border-l border-white/10 bg-black p-4 pt-20 transition-transform duration-200 ease-out",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute right-3 top-4 flex h-10 w-10 items-center justify-center rounded-md text-white transition-colors hover:bg-white/10"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/${category.slug}`}
              className="rounded-md px-3 py-2 text-white transition-colors hover:bg-white/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              {category.name}
            </Link>
          ))}
          <div className="mt-2 border-t border-white/10 pt-2">
            <Button asChild variant="secondary" className="w-full justify-center">
              <Link href="/cart" onClick={() => setMobileMenuOpen(false)}>
                Carrito ({totalItems})
              </Link>
            </Button>
          </div>
        </aside>
      </div>
    </header>
  );
}

