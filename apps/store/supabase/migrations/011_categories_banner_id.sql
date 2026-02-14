-- Permitir que cada categoría tenga un banner opcional (solo categorías padre en la app).
-- La FK apunta a banners(id); ON DELETE SET NULL para no borrar la categoría si se borra el banner.
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS banner_id uuid REFERENCES banners(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_categories_banner_id ON categories(banner_id);

COMMENT ON COLUMN categories.banner_id IS 'Banner opcional; solo categorías raíz (parent_id IS NULL) pueden tener banner.';

-- Si la columna banners.position es un ENUM, agregar el valor 'category', por ejemplo:
-- ALTER TYPE nombre_del_enum_position ADD VALUE IF NOT EXISTS 'category';
