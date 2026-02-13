import { supabaseAdmin } from "@/lib/supabase/admin";
import { createMercadoPagoPreference } from "@/lib/mercadopago";
import type { Order } from "@/types";

/** Ítem del carrito para crear orden (snapshot: name, sku, unitPrice, quantity). */
export type CartItemInput = {
  productId: string;
  sku?: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

/** Payload para createOrderAndPreference. */
export type CartData = {
  items: CartItemInput[];
  total: number;
  payerEmail?: string;
  payerName?: string;
  userId?: string | null;
  idempotencyKey?: string | null;
  shippingAddress?: Record<string, unknown>;
};

export type CreateOrderAndPreferenceSuccess = {
  ok: true;
  orderId: string;
  preferenceId: string | undefined;
  init_point: string | undefined;
  sandbox_init_point: string | undefined;
};

export type CreateOrderAndPreferenceError = {
  ok: false;
  message: string;
  code?: string;
  details?: unknown;
};

/**
 * Crea la orden en DB (orden + ítems + historial), luego la preferencia en MP,
 * guarda preference_id en la orden y devuelve la URL para redirigir.
 * Todo en backend; idempotente si se envía idempotencyKey.
 */
export async function createOrderAndPreference(
  cartData: CartData,
  origin: string
): Promise<CreateOrderAndPreferenceSuccess | CreateOrderAndPreferenceError> {
  if (!cartData.items?.length || cartData.total == null) {
    return { ok: false, message: "Carrito vacío o total inválido", code: "INVALID_CART" };
  }

  const total = Number(cartData.total);
  if (Number.isNaN(total) || total < 0) {
    return { ok: false, message: "Total inválido", code: "INVALID_TOTAL" };
  }

  const itemsForRpc = cartData.items.map((item) => ({
    product_id: item.productId,
    name: item.name ?? "",
    sku: item.sku ?? null,
    quantity: Math.max(1, Number(item.quantity) || 1),
    unit_price: Number(item.unitPrice) || 0,
    subtotal: (Number(item.unitPrice) || 0) * Math.max(1, Number(item.quantity) || 1)
  }));

  try {
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc("create_order_with_items", {
      p_user_id: cartData.userId ?? null,
      p_total: total,
      p_payer_email: cartData.payerEmail ?? "",
      p_payer_name: cartData.payerName ?? "",
      p_items: itemsForRpc,
      p_idempotency_key: cartData.idempotencyKey ?? null
    });

    if (rpcError) {
      console.error("[orders] create_order_with_items RPC error", rpcError);
      return {
        ok: false,
        message: "Error al crear la orden",
        code: "ORDER_CREATE_FAILED",
        details: rpcError
      };
    }

    const result = rpcResult as {
      order_id?: string;
      preference_id?: string | null;
      is_existing?: boolean;
    };
    const orderId = result?.order_id;
    if (!orderId) {
      console.error("[orders] RPC no devolvió order_id", rpcResult);
      return { ok: false, message: "Error al crear la orden", code: "ORDER_ID_MISSING" };
    }

    const preferenceResult = await createMercadoPagoPreference(origin, {
      items: cartData.items.map((item) => ({
        id: item.productId,
        title: item.name ?? item.productId,
        quantity: Math.max(1, item.quantity),
        unit_price: item.unitPrice
      })),
      payer:
        cartData.payerEmail || cartData.payerName
          ? { email: cartData.payerEmail ?? undefined, name: cartData.payerName ?? undefined }
          : undefined,
      external_reference: orderId
    });

    if (!preferenceResult.ok) {
      console.error("[orders] Mercado Pago preference failed", preferenceResult.message);
      await markOrderPendingMissingPreference(orderId);
      return {
        ok: false,
        message: preferenceResult.message,
        code: "PREFERENCE_FAILED",
        details: "details" in preferenceResult ? preferenceResult.details : undefined
      };
    }

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        preference_id: preferenceResult.preference_id ?? null,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("[orders] Error actualizando preference_id", updateError);
      await markOrderPendingMissingPreference(orderId);
      return {
        ok: false,
        message: "Orden creada pero falló guardar preferencia. Reintentá más tarde.",
        code: "PREFERENCE_UPDATE_FAILED",
        details: updateError
      };
    }

    return {
      ok: true,
      orderId,
      preferenceId: preferenceResult.preference_id,
      init_point: preferenceResult.init_point,
      sandbox_init_point: preferenceResult.sandbox_init_point
    };
  } catch (err) {
    console.error("[orders] createOrderAndPreference exception", err);
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Error inesperado al crear la orden",
      code: "EXCEPTION",
      details: err
    };
  }
}

/** Marca la orden como pending_missing_preference para debugging. */
async function markOrderPendingMissingPreference(orderId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status: "pending_missing_preference", updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) {
    console.error("[orders] No se pudo marcar pending_missing_preference", orderId, error);
  }
}

/**
 * Lista de pedidos. Conectar con Supabase cuando exista la tabla `orders`.
 */
export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[orders] getOrders", error);
    return [];
  }
  return (data ?? []).map(mapOrderRow);
}

/**
 * Pedido por id.
 */
export async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabaseAdmin.from("orders").select("*").eq("id", id).single();
  if (error || !data) return null;
  return mapOrderRow(data);
}

function mapOrderRow(row: Record<string, unknown>): Order {
  const status = row.status as string;
  return {
    id: row.id as string,
    customerName: (row.payer_name as string) ?? "",
    total: Number(row.total) ?? 0,
    status: (status === "paid" || status === "fulfilled" || status === "cancelled" ? status : "pending") as Order["status"],
    createdAt: (row.created_at as string) ?? "",
    items: []
  };
}
