/**
 * Crea una preferencia de pago en Mercado Pago.
 * Usado por createOrderAndPreference y por el route handler legacy.
 */
export type PreferenceItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
};

export type PreferencePayer = {
  name?: string;
  email?: string;
  phone?: string;
};

export type CreatePreferenceParams = {
  items: PreferenceItem[];
  payer?: PreferencePayer;
  external_reference?: string;
};

export type CreatePreferenceResult = {
  ok: true;
  init_point: string | undefined;
  sandbox_init_point: string | undefined;
  preference_id: string | undefined;
};

export type CreatePreferenceError = {
  ok: false;
  message: string;
  details?: unknown;
};

export async function createMercadoPagoPreference(
  origin: string,
  params: CreatePreferenceParams
): Promise<CreatePreferenceResult | CreatePreferenceError> {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN ?? "";
  if (!accessToken) {
    console.error("[mercadopago] Falta MERCADOPAGO_ACCESS_TOKEN");
    return { ok: false, message: "Falta MERCADOPAGO_ACCESS_TOKEN" };
  }

  const successUrl = `${origin}/checkout/success`;
  const failureUrl = `${origin}/checkout`;
  const pendingUrl = `${origin}/checkout`;

  const phoneValue = params.payer?.phone?.trim() ?? "";
  const phoneDigits = phoneValue.replace(/\D/g, "");
  const payer =
    params.payer && (params.payer.name || params.payer.email || phoneDigits)
      ? {
          name: params.payer.name,
          email: params.payer.email,
          phone: phoneDigits ? { number: phoneDigits } : undefined
        }
      : undefined;

  const body: Record<string, unknown> = {
    items: params.items,
    payer,
    back_urls: { success: successUrl, failure: failureUrl, pending: pendingUrl },
    auto_return: "approved"
  };
  if (params.external_reference) {
    body.external_reference = params.external_reference;
  }

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = (await response.json()) as {
    id?: string;
    init_point?: string;
    sandbox_init_point?: string;
    message?: string;
  };

  if (!response.ok) {
    console.error("[mercadopago] Error creando preferencia", { status: response.status, data });
    return {
      ok: false,
      message: data?.message ?? "Error creando preferencia",
      details: data
    };
  }

  return {
    ok: true,
    init_point: data.init_point,
    sandbox_init_point: data.sandbox_init_point,
    preference_id: data.id
  };
}
