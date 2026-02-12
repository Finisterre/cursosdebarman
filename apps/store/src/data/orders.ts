import type { Order } from "@/types";

export const orders: Order[] = [
  {
    id: "order_1001",
    customerName: "Lucia Perez",
    total: 156000,
    status: "pending",
    createdAt: "2026-02-12",
    items: [
      { id: "item_1", productId: "prod_1", name: "Mochila Urbana", price: 78000, quantity: 2 }
    ]
  },
  {
    id: "order_1002",
    customerName: "Marcos Silva",
    total: 125000,
    status: "paid",
    createdAt: "2026-02-11",
    items: [
      { id: "item_2", productId: "prod_2", name: "Auriculares Wireless", price: 125000, quantity: 1 }
    ]
  }
];

