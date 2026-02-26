import nodemailer from "nodemailer";
import type { CartItemInput } from "@/lib/orders";

const getTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;

  if (!user || !pass || !host || !port) {
    return null;
  }

  const secure = process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1";
  return nodemailer.createTransport({
    host: host.trim(),
    port: parseInt(port, 10) || 587,
    secure,
    auth: { user: user.trim(), pass: pass.trim() }
  });
};

/**
 * Envía un email al cliente con el detalle de la orden cuando el pago está confirmado.
 * No lanza: solo registra errores. Útil para no bloquear el flujo de checkout.
 */
export async function sendOrderConfirmationEmail(params: {
  orderId: string;
  orderNumber: string;
  toEmail: string;
  payerName?: string;
  items: CartItemInput[];
  total: number;
}): Promise<{ ok: boolean; error?: string }> {
  const { orderId, orderNumber, toEmail, payerName, items, total } = params;
  const displayNumber = orderNumber?.trim() || orderId;
  const trimmedEmail = toEmail?.trim();
  if (!trimmedEmail) {
    return { ok: false, error: "Email vacío" };
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[email] SMTP no configurado (SMTP_USER, SMTP_PASSWORD, SMTP_HOST, SMTP_PORT). No se envía email.");
    return { ok: false, error: "SMTP no configurado" };
  }

  console.log("[email] Enviando confirmación de orden", orderId, "a", trimmedEmail);
  const fromUser = process.env.SMTP_USER ?? "noreply";
  const fromName = process.env.SMTP_FROM_NAME ?? "Tienda";

  const itemsRows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(item.name)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatMoney(item.unitPrice)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatMoney((item.unitPrice ?? 0) * (item.quantity ?? 1))}</td>
        </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Confirmación de pedido</title></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:20px;color:#333">
  <h2 style="color:#111">Confirmación de tu pedido</h2>
  <p>Hola${payerName ? ` ${escapeHtml(payerName)}` : ""},</p>
  <p>Recibimos tu pedido correctamente. Detalle:</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <thead>
      <tr style="background:#f5f5f5">
        <th style="padding:8px;text-align:left">Producto</th>
        <th style="padding:8px;text-align:center">Cantidad</th>
        <th style="padding:8px;text-align:right">Precio unit.</th>
        <th style="padding:8px;text-align:right">Subtotal</th>
      </tr>
    </thead>
    <tbody>${itemsRows}</tbody>
  </table>
  <p style="font-size:1.1em;font-weight:bold">Total: ${formatMoney(total)}</p>
  <p style="color:#666;font-size:0.9em">Nº de pedido: <strong>${escapeHtml(displayNumber)}</strong>. Conservá este número para cualquier consulta.</p>
  <p style="margin-top:24px">Gracias por tu compra.</p>
</body>
</html>`;

  const text = `Confirmación de pedido\n\nNº de pedido: ${displayNumber}\n${payerName ? `Hola ${payerName},\n\n` : ""}Detalle:\n${items.map((i) => `- ${i.name} x ${i.quantity} = ${formatMoney((i.unitPrice ?? 0) * (i.quantity ?? 1))}`).join("\n")}\n\nTotal: ${formatMoney(total)}\n\nGracias por tu compra.`;

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromUser}>`,
      to: trimmedEmail,
      subject: `Confirmación de pedido #${displayNumber}`,
      text,
      html
    });
    console.log("[email] Enviado correctamente a", trimmedEmail);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] Error enviando confirmación de orden", orderId, message);
    return { ok: false, error: message };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS"
  }).format(value);
}
