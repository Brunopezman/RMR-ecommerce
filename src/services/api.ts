/**
 * API Service — Single source of truth for all backend calls.
 *
 * This module defines the base URL and endpoints for the e-commerce API.
 * In Paso A (mock), all endpoints point at json-server (port 3001).
 * In Paso B (real backend), only the BASE_URL needs to change.
 *
 * Each function returns typed responses matching the API contract.
 */

import type { Product } from '../types/product';
import type { User } from '../types/user';
import type { AuthUser } from '../types/auth';
import type { Order } from '../types/order';

/** Base URL for all API calls */
export const BASE_URL = 'http://localhost:4000';

// ──────────────────────────────────────────────
//  Products
// ──────────────────────────────────────────────

/** GET /products — full catalog */
export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/products`);
  if (!res.ok) throw new Error(`fetchProducts failed: HTTP ${res.status}`);
  return res.json();
}

/** GET /products/:id — single product */
export async function fetchProductById(id: number): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error(`fetchProductById failed: HTTP ${res.status}`);
  return res.json();
}

// ──────────────────────────────────────────────
//  Users
// ──────────────────────────────────────────────

/** POST /users — register a new user (legacy, for json-server) */
export async function registerUser(
  user: Omit<User, 'id' | 'createdAt'>,
): Promise<User> {
  const res = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error(`registerUser failed: HTTP ${res.status}`);
  return res.json();
}

/** POST /api/auth/login — authenticate and return user + token */
export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: AuthUser; token: string }> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data.error as string) || (data.msg as string) || 'Credenciales inválidas.');
  }
  return res.json() as Promise<{ user: AuthUser; token: string }>;
}

/** PATCH /users/:id — update user profile (requires auth) */
export async function updateUser(
  id: number | string,
  data: Partial<User>,
): Promise<User> {
  const token = localStorage.getItem('authToken');
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`updateUser failed: HTTP ${res.status}`);
  return res.json();
}

/** PATCH /products/:id/stock — update product stock (requires auth) */
export async function updateProductStock(
  id: number,
  stock: number,
): Promise<Product> {
  const token = localStorage.getItem('authToken');
  const res = await fetch(`${BASE_URL}/products/${id}/stock`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ stock }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      (data.error as string) || `Error al actualizar stock: HTTP ${res.status}`,
    );
  }

  return res.json();
}

// ──────────────────────────────────────────────
//  Orders
// ──────────────────────────────────────────────

/** GET /orders?userId=:id — orders for a user */
export async function fetchOrdersByUser(userId: number | string): Promise<Order[]> {
  const res = await fetch(`${BASE_URL}/orders?userId=${userId}`);
  if (!res.ok) throw new Error(`fetchOrdersByUser failed: HTTP ${res.status}`);
  return res.json();
}

/** POST /orders — create a new order */
export async function createOrder(
  order: Omit<Order, 'id' | 'createdAt' | 'status'>,
): Promise<Order> {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error(`createOrder failed: HTTP ${res.status}`);
  return res.json();
}
