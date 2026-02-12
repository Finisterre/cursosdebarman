-- Ejecutar cuando product_variants ya existe con columnas name, value (esquema viejo).
-- Aviso: se eliminan todas las filas actuales de product_variants.

TRUNCATE TABLE product_variants;

ALTER TABLE product_variants DROP COLUMN IF EXISTS name;
ALTER TABLE product_variants DROP COLUMN IF EXISTS value;

ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS variant_option_id uuid REFERENCES variant_options(id) ON DELETE CASCADE;
ALTER TABLE product_variants
  ALTER COLUMN variant_option_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_product_option
  ON product_variants(product_id, variant_option_id);
