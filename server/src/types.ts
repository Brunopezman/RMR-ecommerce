/**
 * Server-side types matching the API contract in docs/architecture/api-contract.md.
 * These MUST mirror the frontend types in react/src/types/.
 */

export interface Product {
  id: number;
  nombre: string;
  tipo?: string;
  img: string;
  descripcion?: string;
  precio: number;
  cantidad?: number;
}

export interface User {
  id: number | string;
  email: string;
  name: string;
  address?: string;
  createdAt?: string;
}

export interface OrderItem {
  productId: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface Order {
  id: number;
  userId: number | string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress?: string;
}

/** Row from the order_items table (internal) */
export interface OrderItemRow {
  id: number;
  order_id: number;
  product_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}
