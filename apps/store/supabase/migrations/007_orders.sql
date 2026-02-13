-- orders: orden de compra (creada antes de la preferencia MP)
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  status text NOT NULL DEFAULT 'pending', -- pending | pending_missing_preference | paid | cancelled | etc.
  total numeric NOT NULL,
  preference_id text,
  payment_id text,
  merchant_order_id text,
  external_reference text,
  payment_status text,
  payment_type text,
  payer_email text,
  payer_name text,
  idempotency_key text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key
  ON orders (idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- order_items: ítems de la orden (snapshot)
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name text NOT NULL,
  sku text,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  subtotal numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- order_status_history: historial de cambios de estado
CREATE TABLE IF NOT EXISTS order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status text,
  new_status text NOT NULL,
  changed_by text NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);

-- RPC: crea orden + ítems + historial en una transacción (idempotente si se pasa idempotency_key)
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_user_id uuid,
  p_total numeric,
  p_payer_email text,
  p_payer_name text,
  p_items jsonb,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
  v_preference_id text;
  v_item jsonb;
  v_product_id uuid;
  v_product_name text;
  v_sku text;
  v_quantity int;
  v_unit_price numeric;
  v_subtotal numeric;
BEGIN
  -- Idempotencia: solo reutilizar si la orden es reciente (últimos 2 min) para evitar duplicados al refrescar.
  -- Pasados 2 minutos, el mismo carrito puede crear una orden nueva (misma compra en otra ocasión).
  IF p_idempotency_key IS NOT NULL AND trim(p_idempotency_key) != '' THEN
    SELECT id, preference_id INTO v_order_id, v_preference_id
    FROM orders
    WHERE idempotency_key = p_idempotency_key
      AND status IN ('pending', 'paid')
      AND created_at > (now() - interval '2 minutes')
    ORDER BY created_at DESC
    LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object(
        'order_id', v_order_id,
        'preference_id', v_preference_id,
        'is_existing', true
      );
    END IF;
  END IF;

  -- Nueva orden
  INSERT INTO orders (user_id, status, total, payer_email, payer_name, idempotency_key, external_reference)
  VALUES (
    p_user_id,
    'pending',
    p_total,
    NULLIF(trim(p_payer_email), ''),
    NULLIF(trim(p_payer_name), ''),
    NULLIF(trim(p_idempotency_key), ''),
    NULL
  )
  RETURNING id INTO v_order_id;

  -- external_reference = order.id (para MP)
  UPDATE orders SET external_reference = v_order_id::text WHERE id = v_order_id;

  -- Ítems
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_product_name := COALESCE(v_item->>'name', '');
    v_sku := NULLIF(trim(v_item->>'sku'), '');
    v_quantity := (v_item->>'quantity')::int;
    v_unit_price := (v_item->>'unit_price')::numeric;
    v_subtotal := (v_item->>'subtotal')::numeric;
    IF v_quantity IS NULL OR v_quantity < 1 THEN
      v_quantity := 1;
    END IF;
    IF v_subtotal IS NULL THEN
      v_subtotal := v_unit_price * v_quantity;
    END IF;
    INSERT INTO order_items (order_id, product_id, product_name, sku, quantity, unit_price, subtotal)
    VALUES (v_order_id, v_product_id, v_product_name, v_sku, v_quantity, v_unit_price, v_subtotal);
  END LOOP;

  -- Historial inicial
  INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by, note)
  VALUES (v_order_id, NULL, 'pending', 'system', 'Orden creada');

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'preference_id', NULL,
    'is_existing', false
  );
END;
$$;

-- Permitir que el cliente Supabase (service_role / anon) ejecute la función
GRANT EXECUTE ON FUNCTION public.create_order_with_items(uuid, numeric, text, text, jsonb, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_order_with_items(uuid, numeric, text, text, jsonb, text) TO anon;
