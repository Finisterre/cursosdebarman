"use client";

import { useState } from "react";
import type { OrderStatus } from "@/types";
import { Button } from "@/components/ui/button";

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  fulfilled: "Enviado",
  cancelled: "Cancelado"
};

type UpdateOrderStatusAction = (orderId: string, status: OrderStatus) => Promise<{ ok: boolean; error?: string }>;

export function OrderStatusForm({
  orderId,
  status,
  updateOrderStatusAction
}: {
  orderId: string;
  status: OrderStatus;
  updateOrderStatusAction: UpdateOrderStatusAction;
}) {
  const [value, setValue] = useState<OrderStatus>(status);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    setIsPending(true);
    try {
      const result = await updateOrderStatusAction(orderId, value);
      if (!result.ok) {
        console.error(result.error);
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={value}
        onChange={(event) => setValue(event.target.value as OrderStatus)}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
      >
        {Object.entries(statusLabels).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      <Button variant="secondary" onClick={handleSubmit} disabled={isPending}>
        {isPending ? "Actualizando..." : "Actualizar estado"}
      </Button>
    </div>
  );
}

