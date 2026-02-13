"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/schemas/checkout";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: ""
    }
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
       
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Checkout</h1>
          <p className="text-sm text-muted-foreground">
            Completa los datos para finalizar la compra.
          </p>
        </div>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            setIsSubmitting(true);
            setErrorMessage("");
            try {
              const cartPayload = {
                items: items.map((item) => ({
                  productId: item.productId,
                  sku: "sku" in item ? (item as { sku?: string }).sku : undefined,
                  name: item.name ?? item.productId,
                  unitPrice: item.price,
                  quantity: item.quantity
                })),
                total: subtotal,
                payerEmail: values.email,
                payerName: values.name,
                idempotencyKey: [
                  ...items
                    .slice()
                    .sort((a, b) => a.productId.localeCompare(b.productId))
                    .map((i) => `${i.productId}:${i.quantity}`),
                  String(subtotal)
                ].join("|")
              };

              const response = await fetch("/api/mercadopago", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cartPayload)
              });

              const data = (await response.json()) as {
                ok: boolean;
                init_point?: string;
                sandbox_init_point?: string;
                message?: string;
                code?: string;
              };

              if (!response.ok || !data.ok) {
                setErrorMessage(data.message ?? "No se pudo iniciar el pago.");
                return;
              }

              const redirectUrl = data.init_point ?? data.sandbox_init_point;
              if (!redirectUrl) {
                setErrorMessage("No se recibió URL de pago.");
                return;
              }

              clear();
              window.location.href = redirectUrl;
            } catch (error) {
              console.error("Error Mercado Pago", error);
              setErrorMessage("Ocurrió un error al iniciar el pago.");
            } finally {
              setIsSubmitting(false);
            }
          })}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" {...form.register("phone")} />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" {...form.register("city")} />
              {form.formState.errors.city && (
                <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" {...form.register("address")} />
            {form.formState.errors.address && (
              <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            {isSubmitting ? "Procesando..." : "Pagar con Mercado Pago"}
          </Button>
          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
        </form>
      </section>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toLocaleString("es-AR")}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t pt-4 text-base font-semibold">
              <span>Total</span>
              <span>${subtotal.toLocaleString("es-AR")}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mercado Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Placeholder de integración para generar preferencia y redirigir.</p>
            <p>
              Endpoint sugerido: <code>/(app)/api/mercadopago</code>.
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

