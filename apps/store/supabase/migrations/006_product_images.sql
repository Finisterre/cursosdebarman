-- Galería de imágenes por producto
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- Una sola imagen primaria por producto
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_one_primary
  ON product_images(product_id)
  WHERE is_primary = true;
