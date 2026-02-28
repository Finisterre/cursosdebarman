-- Full-text search para autocomplete: extensiones + search_vector + RPC
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Columna para búsqueda full-text (nombre + descripción, español, sin acentos)
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS trigger AS $$
BEGIN
  new.search_vector := to_tsvector('spanish',
    unaccent(coalesce(new.name, '') || ' ' || coalesce(new.description, ''))
  );
  RETURN new;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_search_vector_update ON products;
CREATE TRIGGER products_search_vector_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_search_vector();

-- Índice GIN para búsqueda rápida
CREATE INDEX IF NOT EXISTS products_search_idx
  ON products USING gin(search_vector);

-- Rellenar search_vector en filas existentes (el trigger lo mantiene al insert/update)
UPDATE products
SET search_vector = to_tsvector('spanish', unaccent(coalesce(name, '') || ' ' || coalesce(description, '')))
WHERE search_vector IS NULL;

-- Columna is_active para filtrar productos visibles (default true para no romper datos existentes)
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL;

-- RPC: búsqueda con ranking, lista para extender (popularidad, boost por ventas, etc.)
CREATE OR REPLACE FUNCTION search_products(search_query text)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  price numeric,
  sale_price numeric,
  image_url text
)
LANGUAGE sql STABLE AS $$
  SELECT
    p.id,
    p.name,
    p.slug,
    p.price,
    p.sale_price,
    p.image_url
  FROM products p
  WHERE
    p.search_vector @@ plainto_tsquery('spanish', unaccent(search_query))
    AND coalesce(p.is_active, true) = true
    AND (p.is_variant = false OR p.is_variant IS NULL)
  ORDER BY
    ts_rank(p.search_vector, plainto_tsquery('spanish', unaccent(search_query))) DESC
  LIMIT 6;
$$;

COMMENT ON FUNCTION search_products(text) IS 'Full-text search para autocomplete. Preparado para ranking por popularidad/ventas/stock y embeddings.';
