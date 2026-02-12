# Variables de entorno

Crear `.env.local` en `apps/store` con:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
MERCADOPAGO_ACCESS_TOKEN=
```

Notas:
- Solo `NEXT_PUBLIC_*` se expone al cliente.
- `SUPABASE_SERVICE_ROLE_KEY` se usa solo en server actions o API routes.

