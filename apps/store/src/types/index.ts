export type VariantType = {
  id: string;
  name: string;
  slug: string;
};

export type VariantValue = {
  id: string;
  variantTypeId: string;
  value: string;
};

export type ProductVariantValue = {
  variantTypeId: string;
  variantTypeName: string;
  valueId: string;
  value: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price?: number | null;
  sale_price?: number | null;
  stock?: number | null;
  image_url?: string | null;
  featured?: boolean;
  category_id?: string | null;
  parent_product_id?: string | null;
  sku?: string | null;
  is_variant: boolean;
  variants?: Product[];
  variantValues?: ProductVariantValue[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  is_active: boolean;
  position?: number;
  children?: Category[];
};

export type CartItem = {
  productId: string;
  price: number;
  quantity: number;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

export type OrderItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled";

export type Order = {
  id: string;
  customerName: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
};

export type StoreSettings = {
  id: string;
  currency: string;
  storeName: string;
};
