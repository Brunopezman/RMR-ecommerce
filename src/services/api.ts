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
import type { Order } from '../types/order';

/** Base URL for all API calls — swap this in Paso B */
export const BASE_URL = 'http://localhost:3001';

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

/** POST /users — register a new user */
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
