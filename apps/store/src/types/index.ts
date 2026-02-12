export type ProductVariant = {
  id: string;
  productId: string;
  name: string;
  price: number;
  stock: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  description: string;
  image: string;
  featured?: boolean;
  variants?: ProductVariant[];
};

export type CartItem = Product & {
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

