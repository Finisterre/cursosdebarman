-- Columna order_id en orders: número de pedido legible (1, 2, 3, ...)
CREATE SEQUENCE IF NOT EXISTS order_display_no_seq;

-- Si la columna no existe, crearla como bigint (si ya existe como bigint, no se modifica)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_id bigint UNIQUE;

-- Rellenar órdenes existentes que tengan order_id NULL: asignar 1, 2, 3... por fecha
WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM orders
  WHERE order_id IS NULL
)
UPDATE orders o
SET order_id = numbered.rn
FROM numbered
WHERE o.id = numbered.id;

-- Dejar el sequence en max(order_id) para que las nuevas órdenes sigan la numeración
SELECT setval('order_display_no_seq', COALESCE((SELECT max(order_id) FROM orders), 0));

-- RPC: al crear una nueva orden, asignar order_id con el siguiente número
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
  v_order_display_id bigint;
  v_preference_id text;
  v_item jsonb;
  v_product_id uuid;
  v_product_name text;
  v_sku text;
  v_quantity int;
  v_unit_price numeric;
  v_subtotal numeric;
BEGIN
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
    SELECT id, preference_id INTO v_order_id, v_preference_id
    FROM orders
    WHERE idempotency_key = p_idempotency_key
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

  v_order_display_id := nextval('order_display_no_seq');

  INSERT INTO orders (user_id, status, total, payer_email, payer_name, idempotency_key, external_reference, order_id)
  VALUES (
    p_user_id,
    'pending',
    p_total,
    NULLIF(trim(p_payer_email), ''),
    NULLIF(trim(p_payer_name), ''),
    NULLIF(trim(p_idempotency_key), ''),
    NULL,
    v_order_display_id
  )
  RETURNING id INTO v_order_id;

  UPDATE orders SET external_reference = v_order_id::text WHERE id = v_order_id;

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

  INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by, note)
  VALUES (v_order_id, NULL, 'pending', 'system', 'Orden creada');

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'preference_id', NULL,
    'is_existing', false
  );
END;
$$;
