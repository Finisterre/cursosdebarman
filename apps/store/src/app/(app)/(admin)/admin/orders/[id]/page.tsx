import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { updateOrderStatusAction } from "./actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb";



type AdminOrderDetailPageProps = {
  params: { id: string };
};

export const revalidate = 0;

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const order = await getOrderById(params.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminBreadcrumb
        items={[
          { label: "Pedidos", href: "/admin/orders" },
          { label: `Pedido ${order.id.slice(0, 8)}...` },
        ]}
      />
      <div>
        <h1 className="text-2xl font-semibold">Pedido {order.id}</h1>
        <p className="text-sm text-muted-foreground">Cliente: {order.customerName}</p>
      </div>
      <OrderStatusForm orderId={order.id} status={order.status} updateOrderStatusAction={updateOrderStatusAction} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Precio unit.</TableHead>
            <TableHead>Subtotal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-muted-foreground">{item.sku ?? "—"}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>${item.price.toLocaleString("es-AR")}</TableCell>
              <TableCell>${(item.subtotal ?? item.price * item.quantity).toLocaleString("es-AR")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {order.statusHistory && order.statusHistory.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Historial de estado</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado anterior</TableHead>
                <TableHead>Estado nuevo</TableHead>
                <TableHead>Cambiado por</TableHead>
                <TableHead>Nota</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.statusHistory.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDateTime(entry.createdAt)}
                  </TableCell>
                  <TableCell>{entry.previousStatus ?? "—"}</TableCell>
                  <TableCell className="font-medium">{entry.newStatus}</TableCell>
                  <TableCell>{entry.changedBy}</TableCell>
                  <TableCell className="text-muted-foreground">{entry.note ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

