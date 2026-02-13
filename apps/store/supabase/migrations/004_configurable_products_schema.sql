-- variant_values: opciones por tipo (ej. Rojo, M)
CREATE TABLE IF NOT EXISTS variant_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_type_id uuid NOT NULL REFERENCES variant_types(id) ON DELETE CASCADE,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(variant_type_id, value)
);
CREATE INDEX IF NOT EXISTS idx_variant_values_type ON variant_values(variant_type_id);

-- products: columnas para producto configurable/hijos
ALTER TABLE products ADD COLUMN IF NOT EXISTS parent_product_id uuid REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_variant boolean NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku text UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price numeric;
ALTER TABLE products ALTER COLUMN price DROP NOT NULL;
ALTER TABLE products ALTER COLUMN stock DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_parent ON products(parent_product_id);

-- product_variant_values: vincula producto (hijo) con sus valores de variante
CREATE TABLE IF NOT EXISTS product_variant_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_value_id uuid NOT NULL REFERENCES variant_values(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, variant_value_id)
);
CREATE INDEX IF NOT EXISTS idx_product_variant_values_product ON product_variant_values(product_id);
