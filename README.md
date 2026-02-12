# fs-eshop

Starter ecommerce en Next.js 14 (App Router) con TypeScript, Tailwind, shadcn/ui, React Hook Form, Zod y Supabase.

## Estructura

```
apps/
  store/   # app principal Next.js (store + admin con route groups)
  admin/   # placeholder para futura app separada
```

## Variables de entorno

Revisar `apps/store/ENVIRONMENT.md` y completar en `.env.local`.

## Notas

- La app usa route groups en `apps/store/src/app/(app)/(store)` y `apps/store/src/app/(app)/(admin)`.
- Las rutas admin están protegidas por `middleware.ts` (cookie `admin_session`).
- La integración con Mercado Pago es un placeholder listo para extender.

