-- variant_types: tipos globales reutilizables (ej. Color, Talle)
CREATE TABLE IF NOT EXISTS variant_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- variant_options: opciones por tipo (ej. Rojo, Negro | M, L)
CREATE TABLE IF NOT EXISTS variant_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_type_id uuid NOT NULL REFERENCES variant_types(id) ON DELETE CASCADE,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(variant_type_id, value)
);

CREATE INDEX IF NOT EXISTS idx_variant_options_type ON variant_options(variant_type_id);

-- product_variants: vincula producto + opción con precio y stock
-- Si ya existe product_variants con columnas name/value, migrar manualmente o recrear
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_option_id uuid NOT NULL REFERENCES variant_options(id) ON DELETE CASCADE,
  price numeric NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, variant_option_id)
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);

-- Opcional: agregar columnas a product_variants si la tabla ya existía con name/value
-- ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS variant_option_id uuid REFERENCES variant_options(id);
-- Migración de datos existentes dependería de tu caso; si empiezas desde cero, usa la definición de arriba.
