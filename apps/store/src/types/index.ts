export type ProductVariant = {
  id: string;
  productId: string;
  name: string;
  value: string;
  price: number;
  stock: number;
};

export type VariantType = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export type VariantOption = {
  id: string;
  variantTypeId: string;
  value: string;
  createdAt: string;
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



export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  description: string;
  image: string;
  featured?: boolean;
  category_id?: string | null;
  category?: Category;
  variants?: ProductVariant[];
};

export type CartItem = Product & {
  quantity: number;
  selectedVariant?: ProductVariant;
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

