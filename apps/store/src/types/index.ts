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

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  position: number;
  is_primary: boolean;
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
  images?: ProductImage[];
  /** SEO */
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  meta_image?: string | null;
  canonical_url?: string | null;
  no_index?: boolean | null;
  updated_at?: string | null;
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
  /** Banner opcional (solo categorías raíz). */
  banner_id?: string | null;
  banner?: Banner | null;
  /** SEO */
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  meta_image?: string | null;
  canonical_url?: string | null;
  no_index?: boolean | null;
  updated_at?: string | null;
};

export type CartItem = {
  productId: string;
  price: number;
  quantity: number;
  sku?: string | null;
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
  subtotal?: number;
  sku?: string | null;
  order_id?: string | null;
};

export type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled";

export type OrderStatusHistoryEntry = {
  id: string;
  orderId: string;
  previousStatus: string | null;
  newStatus: string;
  changedBy: string;
  note: string | null;
  createdAt: string;
};

export type Order = {
  id: string;
  order_id: string;
  customerName: string;
  payerEmail?: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  statusHistory?: OrderStatusHistoryEntry[];
};

export type StoreSettings = {
  id: string;
  currency: string;
  storeName: string;
};

export type SiteSettings = {
  id: string;
  site_name: string;
  default_meta_title: string | null;
  default_meta_description: string | null;
  default_meta_keywords: string | null;
  default_meta_image: string | null;
  google_verification: string | null;
  google_analytics_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Banner = {
  id: string;
  title: string;
  show_title: boolean;
  subtitle?: string | null;
  image_url: string;
  mobile_image_url?: string | null;
  link_url?: string | null;
  link_text?: string | null;
  position: "home_top" | "home_middle" | "home_bottom" | "hero" | "sidebar" | "category";
  type: "image" | "slider" | "promo" | "video";
  display_order: number;
  is_active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at: string;
  updated_at: string;
};
