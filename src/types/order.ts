/** Una orden de compra */
export interface Order {
  id: number;
  userId: number | string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress?: string;
}

/** Item dentro de una orden */
export interface OrderItem {
  productId: number;
  nombre: string;
  precio: number;
  cantidad: number;
}
