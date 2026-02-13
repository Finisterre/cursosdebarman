import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getOrderById, updateOrderFromMpReturn, type MpReturnParams } from "@/lib/orders";
import { CheckCircle } from "lucide-react";

/**
 * Query params que Mercado Pago envía al volver del checkout (según docs).
 * La página actualiza la orden en DB con estos datos antes de mostrar el mensaje.
 */
type MercadoPagoSearchParams = {
  payment_id?: string;
  status?: string;
  external_reference?: string;
  merchant_order_id?: string;
  collection_id?: string;
  collection_status?: string;
  payment_type?: string;
  preference_id?: string;
  site_id?: string;
  processing_mode?: string;
  merchant_account_id?: string;
  [key: string]: string | string[] | undefined;
};

function toStr(v: string | string[] | undefined): string | undefined {
  if (v === undefined || v === "") return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: MercadoPagoSearchParams;
}) {
  const params = typeof searchParams === "object" && searchParams !== null
    ? (searchParams as Record<string, string | string[] | undefined>)
    : {};

  const mpParams: MpReturnParams = {
    external_reference: toStr(params.external_reference),
    payment_id: toStr(params.payment_id),
    merchant_order_id: toStr(params.merchant_order_id),
    status: toStr(params.status),
    collection_id: toStr(params.collection_id),
    collection_status: toStr(params.collection_status),
    payment_type: toStr(params.payment_type),
    preference_id: toStr(params.preference_id)
  };

  if (mpParams.external_reference) {
    await updateOrderFromMpReturn(mpParams);
  }

  const order = mpParams.external_reference ? await getOrderById(mpParams.external_reference) : null;

  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <h1 className="text-2xl font-semibold flex items-center justify-center gap-2">
        ¡Pedido confirmado! <CheckCircle size={24} className="text-green-500" />
      </h1>
      <p className="text-muted-foreground">
        Recibimos tu orden. Pronto vas a recibir un email con el detalle.
      </p>

      {order?.items && order.items.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-4 text-left">
          <p className="mb-3 text-sm font-medium text-muted-foreground">Resumen del pedido</p>
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div>
                  <span className="font-medium">{item.name}</span>
                  {item.sku && (
                    <span className="ml-2 text-sm text-muted-foreground">({item.sku})</span>
                  )}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    ${item.price.toLocaleString("es-AR")} × {item.quantity}
                  </span>
                  <span className="ml-2 font-medium">
                    ${(item.subtotal ?? item.price * item.quantity).toLocaleString("es-AR")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-end border-t pt-3">
            <span className="font-semibold">Total: ${order.total.toLocaleString("es-AR")}</span>
          </div>
        </div>
      )}

      <Button asChild>
        <Link href="/products">Seguir comprando</Link>
      </Button>
    </div>
  );
}
