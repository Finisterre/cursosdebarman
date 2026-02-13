"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { decrementStockForOrder } from "@/lib/orders";
import type { OrderStatus } from "@/types";

export async function updateOrderStatusAction(orderId: string, newStatus: OrderStatus) {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .single();

  if (fetchError || !existing) {
    return { ok: false as const, error: "Orden no encontrada" };
  }

  const previousStatus = (existing as { status?: string }).status ?? "pending";

  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (updateError) {
    return { ok: false as const, error: updateError.message };
  }

  await supabaseAdmin.from("order_status_history").insert({
    order_id: orderId,
    previous_status: previousStatus,
    new_status: newStatus,
    changed_by: "admin",
    note: null
  });

  if (newStatus === "paid" && previousStatus !== "paid") {
    await decrementStockForOrder(orderId);
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { ok: true as const };
}
