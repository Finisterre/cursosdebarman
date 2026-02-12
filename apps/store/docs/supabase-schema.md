# Supabase schema (base)

Tablas sugeridas:

- `products`
- `product_variants`
- `orders`
- `order_items`
- `customers`
- `store_settings`

Este starter deja las entidades tipadas en `src/types` y listo para conectar.

## Campos esperados (mínimos)

`products`
- `id` (uuid)
- `name` (text)
- `slug` (text, único)
- `description` (text, nullable)
- `price` (numeric)
- `image_url` (text, nullable)
- `featured` (boolean)

