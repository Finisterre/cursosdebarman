import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(6, "Teléfono requerido"),
  address: z.string().min(4, "Dirección requerida"),
  city: z.string().min(2, "Ciudad requerida")
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

