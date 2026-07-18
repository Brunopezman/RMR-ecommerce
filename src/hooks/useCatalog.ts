import { useState, useEffect, useCallback } from 'react';
import type { Product } from '../types/product';
import {
  fetchProducts,
  filterByCategories,
  filterByMaxPrice,
  searchByName,
  PRODUCTS_API_URL,
} from '../services/productService';

const DEFAULT_DATA_URL = PRODUCTS_API_URL;

/**
 * Fallback: load products from /data/db.json (served by Vite)
 * when the API is unavailable.
 */
async function fetchFallbackProducts(): Promise<Product[]> {
  try {
    const res = await fetch('/data/db.json');
    if (!res.ok) return [];
    const json = await res.json();
    if (Array.isArray(json)) return json;
    if (json.products && Array.isArray(json.products)) return json.products;
    return [];
  } catch {
    return [];
  }
}

export interface UseCatalogReturn {
  products: Product[];
  allProducts: Product[];
  loading: boolean;
  error: string | null;
  filterByCategory: (category: string | null | undefined) => void;
  filterByCategories: (categories: string[]) => void;
  filterByPrice: (maxPrice: number | null) => void;
  searchByName: (term: string | null | undefined) => void;
  activeCategories: string[];
  activeMaxPrice: number | null;
}

export function useCatalog(dataUrl: string = DEFAULT_DATA_URL): UseCatalogReturn {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeMaxPrice, setActiveMaxPrice] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      // Try 1: API (json-server)
      let data = await fetchProducts(dataUrl);
      if (cancelled) return;

      // Try 2: fallback to /data/db.json served by Vite
      if (data.length === 0) {
        data = await fetchFallbackProducts();
        if (cancelled) return;
      }

      if (data.length === 0) {
        setError('No se pudieron cargar los productos.');
      }

      setAllProducts(data);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [dataUrl]);

  // Apply filters whenever allProducts, activeCategories, activeMaxPrice, or searchTerm change
  useEffect(() => {
    let result = allProducts;

    if (activeCategories.length > 0) {
      result = filterByCategories(result, activeCategories);
    }

    if (activeMaxPrice !== null) {
      result = filterByMaxPrice(result, activeMaxPrice);
    }

    if (searchTerm) {
      result = searchByName(result, searchTerm);
    }

    setFilteredProducts(result);
  }, [allProducts, activeCategories, activeMaxPrice, searchTerm]);

  const handleFilterByCategory = useCallback((category: string | null | undefined) => {
    // Maintain backward compatibility: single category sets the array
    setActiveCategories(category ? [category] : []);
  }, []);

  const handleFilterByCategories = useCallback((categories: string[]) => {
    setActiveCategories(categories);
  }, []);

  const handleFilterByPrice = useCallback((maxPrice: number | null) => {
    setActiveMaxPrice(maxPrice);
  }, []);

  const handleSearchByName = useCallback((term: string | null | undefined) => {
    setSearchTerm(term);
  }, []);

  return {
    products: filteredProducts,
    allProducts,
    loading,
    error,
    filterByCategory: handleFilterByCategory,
    filterByCategories: handleFilterByCategories,
    filterByPrice: handleFilterByPrice,
    searchByName: handleSearchByName,
    activeCategories,
    activeMaxPrice,
  };
}
