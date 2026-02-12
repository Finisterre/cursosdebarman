import { notFound } from "next/navigation";
import { orders } from "@/data/orders";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AdminOrderDetailPageProps = {
  params: { id: string };
};

export default function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const order = orders.find((item) => item.id === params.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pedido {order.id}</h1>
        <p className="text-sm text-muted-foreground">Cliente: {order.customerName}</p>
      </div>
      <OrderStatusForm status={order.status} onUpdate={() => {}} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>${item.price.toLocaleString("es-AR")}</TableCell>
              <TableCell>${(item.price * item.quantity).toLocaleString("es-AR")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

