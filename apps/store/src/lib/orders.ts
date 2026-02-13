import type { Order } from "@/types";

/**
 * Lista de pedidos. Conectar con Supabase cuando exista la tabla `orders`.
 */
export async function getOrders(): Promise<Order[]> {
  // TODO: cuando exista tabla orders en Supabase:
  // const { data, error } = await supabaseServer.from("orders")...
  return [];
}

/**
 * Pedido por id. Conectar con Supabase cuando exista la tabla `orders`.
 */
export async function getOrderById(id: string): Promise<Order | null> {
  // TODO: cuando exista tabla orders en Supabase...
  const orders = await getOrders();
  return orders.find((o) => o.id === id) ?? null;
}
