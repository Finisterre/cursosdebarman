import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Query params que Mercado Pago puede enviar al volver del checkout (según docs):
 * - payment_id, status, external_reference, merchant_order_id
 * - collection_id, collection_status, payment_type
 * - preference_id, site_id, processing_mode, merchant_account_id
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

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: MercadoPagoSearchParams;
}) {
  const params = typeof searchParams === "object" && searchParams !== null
    ? (searchParams as Record<string, string | string[] | undefined>)
    : {};

  const paramEntries = Object.entries(params).filter(
    ([_, value]) => value !== undefined && value !== ""
  );

  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <h1 className="text-2xl font-semibold">¡Pedido confirmado!</h1>
      <p className="text-muted-foreground">
        Recibimos tu orden. Pronto vas a recibir un email con el detalle.
      </p>

      {paramEntries.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-4 text-left">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Datos recibidos por query params (Mercado Pago):
          </p>
          <pre className="overflow-auto text-xs">
            {JSON.stringify(
              Object.fromEntries(
                paramEntries.map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : v])
              ),
              null,
              2
            )}
          </pre>
        </div>
      )}

      <Button asChild>
        <Link href="/products">Seguir comprando</Link>
      </Button>
    </div>
  );
}
