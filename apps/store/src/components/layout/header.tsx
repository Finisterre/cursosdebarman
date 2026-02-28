"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import type { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import Image from "next/image";
import { Menu, ShoppingCart, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductSearch } from "../store/product-search";


type HeaderProps = {
  categories: Category[];
};

export function Header({ categories }: HeaderProps) {
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b bg-black py-4  border-white ">
      <Container className="flex h-16 flex-wrap items-center justify-between gap-3 md:gap-4">

      
        <Link href="/" className="font-dancing flex text-4xl font-semibold text-white shrink-0" onClick={() => setMobileMenuOpen(false)}>
        <Image src="/top-logo.svg" alt="Finisterre Studio" width={200} height={80} className="shrink-0 mb-4" />
       
        </Link>
        <div className="hidden flex-1 max-w-xl md:flex md:justify-center mx-auto">
          <ProductSearch />
        </div>

       

        {/* Desktop: nav + carrito */}
       
        <Button asChild variant="secondary" className="hidden md:inline-flex shrink-0">
          <Link href="/cart">Carrito {totalItems > 0 ? <span className="text-xs text-white h-5 w-5 bg-black rounded-full text-center leading-5">{totalItems}</span> : <ShoppingCart size={16} />}
    
          </Link>
        </Button>

         {/* Desktop: buscador en el centro */}
      

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
            "absolute right-0 top-0 flex h-full w-full flex-col gap-2 border-l border-white/10 bg-black p-4 pt-20 transition-transform duration-200 ease-out",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="mb-2">
            <ProductSearch onNavigate={() => setMobileMenuOpen(false)} />
          </div>
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
            <Button asChild variant="secondary" className="w-1/2 mx-auto justify-center block text-center">
              <Link href="/cart" onClick={() => setMobileMenuOpen(false)}>
                Carrito ({totalItems})
              </Link>
            </Button>
          </div>
        </aside>
      </div>
      <nav className="hidden items-center mx-auto container max-w-6xl gap-4 text-sm text-muted-foreground md:flex shrink-0 mt-4 px-4">
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
     
    </header>
  );
}

