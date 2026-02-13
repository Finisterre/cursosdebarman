-- SEO Global: tabla site_settings
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL,
  default_meta_title text,
  default_meta_description text,
  default_meta_keywords text,
  default_meta_image text,
  google_verification text,
  google_analytics_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insertar fila por defecto si no existe
INSERT INTO site_settings (id, site_name, default_meta_title, default_meta_description)
SELECT gen_random_uuid(), 'fs-eshop', 'fs-eshop', 'Tu tienda online'
WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);

-- SEO en categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS meta_keywords text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS meta_image text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS canonical_url text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS no_index boolean DEFAULT false;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- SEO en products
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_keywords text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_image text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS canonical_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS no_index boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Trigger para updated_at en site_settings
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS site_settings_updated_at ON site_settings;
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS categories_updated_at ON categories;
CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
