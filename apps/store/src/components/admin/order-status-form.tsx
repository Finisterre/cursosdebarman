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

export function OrderStatusForm({
  status,
  onUpdate
}: {
  status: OrderStatus;
  onUpdate?: (status: OrderStatus) => void;
}) {
  const [value, setValue] = useState<OrderStatus>(status);

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
      <Button
        variant="secondary"
        onClick={() => {
          onUpdate?.(value);
        }}
      >
        Actualizar estado
      </Button>
    </div>
  );
}

