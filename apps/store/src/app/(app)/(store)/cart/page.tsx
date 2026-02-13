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

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Carrito</h1>
        <p className="text-muted-foreground">Tu carrito está vacío.</p>
        <Button asChild variant="outline">
          <Link href="/products">Explorar productos</Link>
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
      <h1 className="text-2xl font-semibold">Mi Carrito</h1>
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
            <TableRow key={item.productId}>
              <TableCell className="font-medium">{item.name ?? item.productId}</TableCell>
              <TableCell>
                <input
                  className="h-9 w-20 rounded-md border border-input bg-background px-2 text-sm"
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
                <Button variant="ghost" onClick={() => removeItem(item.productId)}>
                  Quitar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
        <span className="text-sm text-muted-foreground">Subtotal</span>
        <span className="text-lg font-semibold">${subtotal.toLocaleString("es-AR")}</span>
      </div>
      <Button asChild>
        <Link href="/checkout">Continuar al checkout</Link>
      </Button>
    </div>
  );
}
