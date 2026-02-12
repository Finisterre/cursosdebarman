import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  return (
    <div className="space-y-4 text-center">
      <h1 className="text-2xl font-semibold">¡Pedido confirmado!</h1>
      <p className="text-muted-foreground">
        Recibimos tu orden. Pronto vas a recibir un email con el detalle.
      </p>
      <Button asChild>
        <Link href="/products">Seguir comprando</Link>
      </Button>
    </div>
  );
}

