import type { Product } from "@/types";

export const products: Product[] = [
  {
    id: "prod_1",
    slug: "mochila-urbana",
    name: "Mochila Urbana",
    price: 78000,
    description:
      "Mochila resistente para uso diario con compartimentos internos y bolsillo frontal.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    featured: true,
    variants: [
      { id: "var_1", productId: "prod_1", name: "Negro", price: 78000, stock: 12 },
      { id: "var_2", productId: "prod_1", name: "Gris", price: 78000, stock: 8 }
    ]
  },
  {
    id: "prod_2",
    slug: "auriculares-wireless",
    name: "Auriculares Wireless",
    price: 125000,
    description:
      "Cancelación de ruido y batería de larga duración para sesiones prolongadas.",
    image: "https://images.unsplash.com/photo-1518441902110-5f1a1c6d37cc",
    featured: true
  },
  {
    id: "prod_3",
    slug: "botella-termica",
    name: "Botella Térmica",
    price: 32000,
    description: "Mantiene bebidas frías o calientes durante horas.",
    image: "https://images.unsplash.com/photo-1526401485004-2fda9f4e2d7b"
  },
  {
    id: "prod_4",
    slug: "campera-liviana",
    name: "Campera Liviana",
    price: 98000,
    description: "Corte moderno con tela impermeable.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
  }
];

