"use client";

import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ArrowRight,  Store, Trash } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Carrito</h1>
        <p className="text-white">Tu carrito está vacío.</p>
        <Button asChild variant="outline" className="bg-orange-500 text-white rounded-full hover:bg-orange-500/80 border-none ">
          <Link href="/products">Explorar productos <Store size={16} /></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        root={{ label: "Inicio", href: "/" }}
        firstSegment={{ label: "Mi Carrito", href: "/cart" }}
      />
      <h1 className="text-2xl text-white font-semibold">Mi Carrito</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Total</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.productId} className="text-sm md:text-base">
              <TableCell className="font-medium">{item.name ?? item.productId}</TableCell>
              <TableCell>
                <input
                  className="h-9 md:h-10 w-16 md:w-20 rounded-md text-black border border-input bg-background px-1 md:px-2 text-sm"
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.productId, Math.max(1, Number(e.target.value) || 1))
                  }
                />
              </TableCell>
              <TableCell>${item.price.toLocaleString("es-AR")}</TableCell>
              <TableCell>
                ${(item.price * item.quantity).toLocaleString("es-AR")}
              </TableCell>
              <TableCell>
                <Button variant="secondary" className="bg-white text-black rounded-full hover:bg-white/80" onClick={() => removeItem(item.productId)}>
                 <span className="hidden md:block">Quitar</span> <Trash size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between rounded-lg  bg-white/30 p-4">
        <span className="text-sm text-white">Total</span>
        <span className="text-lg font-semibold">${subtotal.toLocaleString("es-AR")}</span>
      </div>
      <Button asChild className=" text-blackinline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-[#882c0b] text-white hover:bg-orange-500/70 rounded-full">
        <Link href="/checkout" className="group inline-flex items-center gap-2">
          Continuar con el Pago{" "}
          <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1 group-hover:scale-110 group-hover:text-yellow-500" />
        </Link>
      </Button>
    </div>
  );
}
