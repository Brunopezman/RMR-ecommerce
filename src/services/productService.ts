import type { Product } from '../types/product';

/**
 * Base URL for the products API.
 */
export const PRODUCTS_API_URL = 'http://localhost:4000/products';

/**
 * Fetch products from a URL (defaults to PRODUCTS_API_URL).
 * Returns empty array on failure (matches vanilla behavior).
 */
export async function fetchProducts(
  url: string = PRODUCTS_API_URL,
): Promise<Product[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: Product[] = await res.json();
    return data;
  } catch (err) {
    console.error('productService.fetchProducts error:', err);
    return [];
  }
}

/**
 * Filter products by a single category (case-insensitive).
 * Supports `categoria`, `category`, and `tipo` fields.
 * Returns all products if category is falsy.
 */
export function filterByCategory(
  products: Product[],
  category: string | null | undefined,
): Product[] {
  if (!category) return products;
  const q = String(category).toLowerCase();
  return products.filter(
    (p) =>
      (p.categoria ?? p.category ?? p.tipo ?? '').toLowerCase() === q,
  );
}

/**
 * Filter products by multiple categories (case-insensitive).
 * Supports `categoria`, `category`, and `tipo` fields.
 * Returns all products if categories array is empty.
 */
export function filterByCategories(
  products: Product[],
  categories: string[],
): Product[] {
  if (categories.length === 0) return products;
  const q = categories.map((c) => c.toLowerCase());
  return products.filter((p) => {
    const cat = (p.categoria ?? p.category ?? p.tipo ?? '').toLowerCase();
    return q.includes(cat);
  });
}

/**
 * Filter products by maximum price.
 * Returns all products if maxPrice is null.
 */
export function filterByMaxPrice(
  products: Product[],
  maxPrice: number | null,
): Product[] {
  if (maxPrice === null) return products;
  return products.filter((p) => p.precio <= maxPrice);
}

/**
 * Search products by name (case-insensitive, partial match).
 * Supports both `nombre` and `name` fields.
 * Returns all products if term is falsy.
 */
export function searchByName(
  products: Product[],
  term: string | null | undefined,
): Product[] {
  if (!term) return products;
  const q = String(term).trim().toLowerCase();
  return products.filter(
    (p) => (p.nombre ?? p.name ?? '').toLowerCase().includes(q),
  );
}
