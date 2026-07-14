import { useState, useEffect } from 'react';
import type { Product } from '../types/product';
import { fetchProducts, filterByCategory, searchByName, PRODUCTS_API_URL } from '../services/productService';

const DEFAULT_DATA_URL = PRODUCTS_API_URL;

interface UseCatalogReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  filterByCategory: (category: string | null | undefined) => void;
  searchByName: (term: string | null | undefined) => void;
}

export function useCatalog(dataUrl: string = DEFAULT_DATA_URL): UseCatalogReturn {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const data = await fetchProducts(dataUrl);
      if (cancelled) return;

      if (data.length === 0) {
        setError('No se pudieron cargar los productos.');
      }

      setAllProducts(data);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [dataUrl]);

  // Apply filters whenever allProducts, activeCategory, or searchTerm change
  useEffect(() => {
    let result = allProducts;

    if (activeCategory) {
      result = filterByCategory(result, activeCategory);
    }

    if (searchTerm) {
      result = searchByName(result, searchTerm);
    }

    setFilteredProducts(result);
  }, [allProducts, activeCategory, searchTerm]);

  const handleFilterByCategory = (category: string | null | undefined) => {
    setActiveCategory(category);
  };

  const handleSearchByName = (term: string | null | undefined) => {
    setSearchTerm(term);
  };

  return {
    products: filteredProducts,
    loading,
    error,
    filterByCategory: handleFilterByCategory,
    searchByName: handleSearchByName,
  };
}
