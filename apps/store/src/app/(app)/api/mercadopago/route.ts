import { NextResponse } from "next/server";
import { createOrderAndPreference } from "@/lib/orders";
import type { CartData } from "@/lib/orders";

/**
 * POST: crea orden en DB + preferencia Mercado Pago y devuelve init_point.
 * Body: CartData (items, total, payerEmail?, payerName?, userId?, idempotencyKey?).
 */
export async function POST(request: Request) {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? request.headers.get("origin") ?? "http://localhost:3000";

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Cuerpo JSON inválido" },
      { status: 400 }
    );
  }

  const cartData = body as CartData;
  if (!Array.isArray(cartData?.items)) {
    return NextResponse.json(
      { ok: false, message: "items es requerido y debe ser un array" },
      { status: 400 }
    );
  }

  const result = await createOrderAndPreference(cartData, origin);

  if (!result.ok) {
    const status = result.code === "INVALID_CART" || result.code === "INVALID_TOTAL" ? 400 : 500;
    return NextResponse.json(
      { ok: false, message: result.message, code: result.code, details: result.details },
      { status }
    );
  }

  return NextResponse.json({
    ok: true,
    orderId: result.orderId,
    preferenceId: result.preferenceId,
    init_point: result.init_point,
    sandbox_init_point: result.sandbox_init_point
  });
}
