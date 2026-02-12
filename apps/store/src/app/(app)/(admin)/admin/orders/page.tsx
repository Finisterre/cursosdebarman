import Link from "next/link";
import { orders } from "@/data/orders";
import type { OrderStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusLabels: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  pending: { label: "Pendiente", variant: "secondary" },
  paid: { label: "Pagado", variant: "default" },
  fulfilled: { label: "Enviado", variant: "outline" },
  cancelled: { label: "Cancelado", variant: "outline" }
};

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Lista de pedidos lista para sincronizar con Supabase.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                  {order.id}
                </Link>
              </TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>${order.total.toLocaleString("es-AR")}</TableCell>
              <TableCell>
                <Badge variant={statusLabels[order.status]?.variant ?? "outline"}>
                  {statusLabels[order.status]?.label ?? order.status}
                </Badge>
              </TableCell>
              <TableCell>{order.createdAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

