import { supabaseAdmin } from "@/lib/supabase/admin";
import { createMercadoPagoPreference } from "@/lib/mercadopago";
import type { Order, OrderItem, OrderStatusHistoryEntry } from "@/types";

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

    console.log("[orders] Supabase RPC create_order_with_items respuesta", {
      data: rpcResult,
      error: rpcError,
      payload: { total, itemsCount: itemsForRpc.length, productIds: itemsForRpc.map((i) => i.product_id) }
    });

    if (rpcError) {
      console.error("[orders] create_order_with_items RPC error", rpcError);
      const message =
        rpcError.code === "23503"
          ? "Uno de los productos no existe en la base de datos (revisá product_id / variante)."
          : "Error al crear la orden";
      return {
        ok: false,
        message,
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

/**
 * Descuenta el stock de cada producto de la orden (solo si status = paid y aún no se descontó).
 * Idempotente: usa orders.stock_decremented para no descontar dos veces.
 */
export async function decrementStockForOrder(orderId: string): Promise<{ ok: boolean; error?: string }> {
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("id, status, stock_decremented")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return { ok: false, error: "Orden no encontrada" };
  }

  const row = order as { status?: string; stock_decremented?: boolean };
  if (row.status !== "paid") {
    return { ok: true };
  }
  if (row.stock_decremented === true) {
    return { ok: true };
  }

  const { data: items, error: itemsError } = await supabaseAdmin
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);

  if (itemsError || !items?.length) {
    return { ok: true };
  }

  for (const item of items as { product_id: string; quantity: number }[]) {
    const { data: product } = await supabaseAdmin
      .from("products")
      .select("stock")
      .eq("id", item.product_id)
      .single();
    const current = product != null && (product as { stock?: number | null }).stock != null
      ? Number((product as { stock: number }).stock)
      : 0;
    const newStock = current - (item.quantity ?? 0);
    await supabaseAdmin
      .from("products")
      .update({ stock: newStock })
      .eq("id", item.product_id);
  }

  await supabaseAdmin
    .from("orders")
    .update({ stock_decremented: true, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  return { ok: true };
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

/** Parámetros que Mercado Pago envía al volver a la URL de éxito. */
export type MpReturnParams = {
  external_reference?: string;
  payment_id?: string;
  merchant_order_id?: string;
  status?: string;
  collection_id?: string;
  collection_status?: string;
  payment_type?: string;
  preference_id?: string;
};

/**
 * Actualiza la orden con los datos que Mercado Pago envía por query params
 * al redirigir a /checkout/success. Idempotente (se puede llamar varias veces).
 */
export async function updateOrderFromMpReturn(params: MpReturnParams): Promise<{ ok: boolean; orderId?: string; error?: string }> {
  const orderId = typeof params.external_reference === "string" ? params.external_reference.trim() : null;
  if (!orderId) {
    return { ok: false, error: "Falta external_reference" };
  }

  const paymentStatus = params.status ?? params.collection_status ?? null;
  const newOrderStatus =
    paymentStatus === "approved"
      ? "paid"
      : paymentStatus === "rejected"
        ? "rejected"
        : paymentStatus === "pending" || paymentStatus === "in_process"
          ? "pending"
          : null;

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };
  if (params.payment_id != null && params.payment_id !== "") updates.payment_id = params.payment_id;
  if (params.merchant_order_id != null && params.merchant_order_id !== "") updates.merchant_order_id = params.merchant_order_id;
  if (paymentStatus != null) updates.payment_status = paymentStatus;
  if (params.payment_type != null && params.payment_type !== "") updates.payment_type = params.payment_type;
  if (newOrderStatus != null) updates.status = newOrderStatus;

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("orders")
    .select("id, status, stock_decremented")
    .eq("id", orderId)
    .single();

  if (fetchError || !existing) {
    console.error("[orders] updateOrderFromMpReturn: orden no encontrada", orderId, fetchError);
    return { ok: false, orderId, error: "Orden no encontrada" };
  }

  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update(updates)
    .eq("id", orderId);

  if (updateError) {
    console.error("[orders] updateOrderFromMpReturn: error al actualizar", orderId, updateError);
    return { ok: false, orderId, error: updateError.message };
  }

  const previousStatus = (existing as { status?: string }).status ?? "pending";
  if (newOrderStatus === "paid" && previousStatus !== "paid") {
    await supabaseAdmin.from("order_status_history").insert({
      order_id: orderId,
      previous_status: previousStatus,
      new_status: "paid",
      changed_by: "user",
      note: "Pago confirmado (retorno desde Mercado Pago)"
    });
    await decrementStockForOrder(orderId);
  }

  return { ok: true, orderId };
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
 * Pedido por id, con ítems e historial de estado.
 */
export async function getOrderById(id: string): Promise<Order | null> {
  const { data: orderRow, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (orderError || !orderRow) return null;

  const [itemsResult, historyResult] = await Promise.all([
    supabaseAdmin.from("order_items").select("*").eq("order_id", id).order("created_at", { ascending: true }),
    supabaseAdmin.from("order_status_history").select("*").eq("order_id", id).order("created_at", { ascending: true })
  ]);

  const order = mapOrderRow(orderRow as Record<string, unknown>);
  order.items = (itemsResult.data ?? []).map((row: Record<string, unknown>) => mapOrderItemRow(row));
  order.statusHistory = (historyResult.data ?? []).map((row: Record<string, unknown>) => mapStatusHistoryRow(row));
  return order;
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

function mapOrderItemRow(row: Record<string, unknown>): OrderItem {
  return {
    id: row.id as string,
    productId: row.product_id as string,
    name: (row.product_name as string) ?? "",
    price: Number(row.unit_price) ?? 0,
    quantity: Number(row.quantity) ?? 0,
    subtotal: row.subtotal != null ? Number(row.subtotal) : undefined,
    sku: (row.sku as string | null) ?? undefined
  };
}

function mapStatusHistoryRow(row: Record<string, unknown>): OrderStatusHistoryEntry {
  return {
    id: row.id as string,
    orderId: row.order_id as string,
    previousStatus: (row.previous_status as string | null) ?? null,
    newStatus: (row.new_status as string) ?? "",
    changedBy: (row.changed_by as string) ?? "",
    note: (row.note as string | null) ?? null,
    createdAt: (row.created_at as string) ?? ""
  };
}
