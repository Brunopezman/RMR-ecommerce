/**
 * Product Search Service — Semantic search with TF-IDF + cosine similarity.
 *
 * Builds an in-memory index from the product catalog (nombre + descripción + tipo)
 * and supports both semantic (RAG-style) queries and exact filters (maxPrice, category).
 *
 * For a small catalog (< 1000 items), this is kept in memory and rebuilt on refresh.
 */

import type { Product } from '../types/product';

// ──────────────────────────────────────────────
//  Types
// ──────────────────────────────────────────────

export interface SearchFilters {
  maxPrice?: number;
  category?: string;
  tags?: string[];
}

interface IndexEntry {
  product: Product;
  /** Combined searchable text (lowercased) */
  text: string;
  /** TF-IDF vector as { term -> weight } */
  vector: Map<string, number>;
}

// ──────────────────────────────────────────────
//  Spanish stop words (common words with little meaning)
// ──────────────────────────────────────────────

const STOP_WORDS = new Set([
  'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las',
  'por', 'un', 'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como',
  'más', 'pero', 'sus', 'le', 'ya', 'este', 'entre', 'porque', 'este',
  'esta', 'esto', 'ese', 'esa', 'esos', 'esas', 'todo', 'todos', 'muy',
  'era', 'tiene', 'poco', 'mucho', 'otros', 'otro', 'gran', 'fue',
  'han', 'hay', 'ser', 'sido', 'tanto', 'tipo', 'sin', 'sobre',
  'cada', 'qué', 'son', 'fue', 'había', 'donde', 'quien', 'cual',
  'también', 'hasta', 'está', 'este', 'entre', 'por', 'con',
]);

// ──────────────────────────────────────────────
//  Tokenizer
// ──────────────────────────────────────────────

/** Tokenize text: lowercase, split on non-alphanumeric, filter short/stop words */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-záéíóúüñ0-9]+/gu)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

// ──────────────────────────────────────────────
//  TF-IDF helpers
// ──────────────────────────────────────────────

/** Build a term-frequency map for a token list */
function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) {
    tf.set(t, (tf.get(t) ?? 0) + 1);
  }
  // Normalize by document length
  const len = tokens.length || 1;
  for (const [term, count] of tf) {
    tf.set(term, count / len);
  }
  return tf;
}

/** Compute IDF for each term across all documents */
function inverseDocumentFrequency(documents: string[][]): Map<string, number> {
  const idf = new Map<string, number>();
  const N = documents.length;

  for (const doc of documents) {
    const seen = new Set(doc);
    for (const term of seen) {
      idf.set(term, (idf.get(term) ?? 0) + 1);
    }
  }

  for (const [term, df] of idf) {
    idf.set(term, Math.log((N + 1) / (df + 1)) + 1); // smooth IDF
  }

  return idf;
}

/** Compute cosine similarity between two vectors (both Maps) */
function cosineSimilarity(
  a: Map<string, number>,
  b: Map<string, number>,
): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const [term, weight] of a) {
    normA += weight * weight;
    const bWeight = b.get(term) ?? 0;
    if (bWeight !== 0) {
      dot += weight * bWeight;
    }
  }

  for (const [, weight] of b) {
    normB += weight * weight;
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// ──────────────────────────────────────────────
//  Index
// ──────────────────────────────────────────────

let _index: IndexEntry[] | null = null;
let _idfMap: Map<string, number> | null = null;

/**
 * Build (or rebuild) the in-memory search index from a list of products.
 * Extracts searchable text from nombre + descripcion + tipo.
 */
export function buildIndex(products: Product[]): void {
  const documents = products.map((p) => {
    const text = [
      p.nombre ?? p.name ?? '',
      p.descripcion ?? '',
      p.tipo ?? p.category ?? p.categoria ?? '',
    ]
      .join(' ')
      .toLowerCase();

    const tokens = tokenize(text);
    return { product: p, text, tokens };
  });

  const allTokenLists = documents.map((d) => d.tokens);
  _idfMap = inverseDocumentFrequency(allTokenLists);

  _index = documents.map(({ product, text, tokens }) => ({
    product,
    text,
    vector: (() => {
      const tf = termFrequency(tokens);
      const vec = new Map<string, number>();
      for (const [term, tfWeight] of tf) {
        vec.set(term, tfWeight * (_idfMap!.get(term) ?? 1));
      }
      return vec;
    })(),
  }));
}

/** Clear the index (useful for testing) */
export function clearIndex(): void {
  _index = null;
  _idfMap = null;
}

/** Check if the index has been built */
export function isIndexReady(): boolean {
  return _index !== null && _index.length > 0;
}

// ──────────────────────────────────────────────
//  Search
// ──────────────────────────────────────────────

/**
 * Search products by semantic similarity to the query, with optional exact filters.
 *
 * 1. Tokenizes & vectorizes the query using the same TF-IDF scheme.
 * 2. Computes cosine similarity against every indexed product.
 * 3. Returns top N results, optionally filtered by maxPrice / category.
 *
 * @param query  Free-text search query (e.g., "remera elegante para regalo")
 * @param topN   Maximum number of results (default: 5)
 * @param filters Optional exact filters { maxPrice, category }
 * @returns      Sorted array of { product, score }
 */
export function searchSimilar(
  query: string,
  topN: number = 5,
  filters?: SearchFilters,
): Array<{ product: Product; score: number }> {
  if (!_index || _index.length === 0) {
    return [];
  }

  // Tokenize query
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    // If query has no meaningful tokens, return products matching filters only
    let results = _index.map((entry) => ({ product: entry.product, score: 0 }));
    return applyFilters(results, filters).slice(0, topN);
  }

  // Build query TF-IDF vector
  const queryTf = termFrequency(queryTokens);
  const queryVec = new Map<string, number>();
  for (const [term, tfWeight] of queryTf) {
    queryVec.set(term, tfWeight * (_idfMap!.get(term) ?? 1));
  }

  // Score all products
  const scored = _index.map((entry) => ({
    product: entry.product,
    score: cosineSimilarity(queryVec, entry.vector),
  }));

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Apply filters
  return applyFilters(scored, filters).slice(0, topN);
}

/**
 * Apply exact filters to a scored result list.
 * Filters are applied after scoring so semantic ranking still works.
 */
function applyFilters(
  results: Array<{ product: Product; score: number }>,
  filters?: SearchFilters,
): Array<{ product: Product; score: number }> {
  if (!filters) return results;

  let filtered = results;

  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter((r) => r.product.precio <= filters.maxPrice!);
  }

  if (filters.category) {
    const cat = filters.category.toLowerCase();
    filtered = filtered.filter((r) => {
      const pCat = (r.product.tipo ?? r.product.category ?? r.product.categoria ?? '').toLowerCase();
      return pCat === cat;
    });
  }

  if (filters.tags && filters.tags.length > 0) {
    const tagSet = new Set(filters.tags.map((t) => t.toLowerCase()));
    filtered = filtered.filter((r) => {
      const text = (r.product.nombre + ' ' + (r.product.descripcion ?? '')).toLowerCase();
      for (const tag of tagSet) {
        if (text.includes(tag)) return true;
      }
      return false;
    });
  }

  return filtered;
}

/**
 * Search by exact category (convenience wrapper).
 */
export function searchByCategory(
  category: string,
  products: Product[],
): Product[] {
  const cat = category.toLowerCase();
  return products.filter((p) => {
    const pCat = (p.tipo ?? p.category ?? p.categoria ?? '').toLowerCase();
    return pCat === cat;
  });
}

/**
 * Search by exact price range.
 */
export function searchByPriceRange(
  maxPrice: number,
  products: Product[],
): Product[] {
  return products.filter((p) => p.precio <= maxPrice);
}

/**
 * Get a product by its ID from the index.
 */
export function getProductById(
  id: number,
  products: Product[],
): Product | undefined {
  return products.find((p) => p.id === id);
}

/**
 * Search by exact name match (partial, case-insensitive).
 */
export function searchByName(
  name: string,
  products: Product[],
): Product[] {
  const q = name.toLowerCase().trim();
  return products.filter((p) => {
    const pName = (p.nombre ?? p.name ?? '').toLowerCase();
    return pName.includes(q);
  });
}
