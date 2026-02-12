import { NextResponse } from "next/server";

type PreferenceItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
};

type PreferenceBody = {
  items: PreferenceItem[];
  payer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

export async function POST(request: Request) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN ?? "";
  if (!accessToken) {
    return NextResponse.json(
      { ok: false, message: "Falta MERCADOPAGO_ACCESS_TOKEN" },
      { status: 500 }
    );
  }

  const body = (await request.json()) as PreferenceBody;
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? request.headers.get("origin") ?? "http://localhost:3000";
  const successUrl = `${origin}/checkout/success`;
  const failureUrl = `${origin}/checkout`;
  const pendingUrl = `${origin}/checkout`;

  const phoneValue = body.payer?.phone?.trim() ?? "";
  const phoneDigits = phoneValue.replace(/\D/g, "");
  const payer =
    body.payer && (body.payer.name || body.payer.email || phoneDigits)
      ? {
          name: body.payer.name,
          email: body.payer.email,
          phone: phoneDigits ? { number: phoneDigits } : undefined
        }
      : undefined;

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items: body.items,
      payer,
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl
      },
      auto_return: "approved"
    })
  });

  const data = (await response.json()) as { init_point?: string; sandbox_init_point?: string };

  console.log("Mercado Pago preference request", {
    origin,
    successUrl,
    failureUrl,
    pendingUrl,
    payload: {
      items: body.items,
      payer,
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl
      },
      auto_return: "approved"
    }
  });
  console.log("Mercado Pago preference response", { ok: response.ok, status: response.status, data });

  if (!response.ok) {
    return NextResponse.json(
      { ok: false, message: "Error creando preferencia", details: data },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    init_point: data.init_point,
    sandbox_init_point: data.sandbox_init_point
  });
}

