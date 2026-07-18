import { useMemo, useCallback } from 'react';
import { useCatalog } from '../../hooks/useCatalog';
import { navigate } from '../../services/router';
import { ProductGrid } from './ProductGrid';
import { FilterSidebar } from './FilterSidebar';

export function ProductsSection() {
  const {
    products,
    allProducts,
    loading,
    error,
    filterByCategories,
    filterByPrice,
    activeCategories,
    activeMaxPrice,
  } = useCatalog();

  const priceRange = useMemo(() => {
    const prices = allProducts.map((p) => p.precio);
    return {
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPriceLimit: prices.length > 0 ? Math.max(...prices) : 10000,
    };
  }, [allProducts]);

  const handleCategoryChange = useCallback(
    (categories: string[]) => {
      filterByCategories(categories);
    },
    [filterByCategories],
  );

  const handlePriceChange = useCallback(
    (maxPrice: number | null) => {
      filterByPrice(maxPrice);
    },
    [filterByPrice],
  );

  const handleClearFilters = useCallback(() => {
    filterByCategories([]);
    filterByPrice(null);
  }, [filterByCategories, filterByPrice]);

  const handleProductClick = useCallback((id: number) => {
    navigate(`/product/${id}`);
  }, []);

  return (
    <section id="destacados" className="my-5 py-5">
      <div className="container mt-2 py-5 mx-auto px-4">
        <h1 className="font-bold text-2xl font-display">Productos</h1>
        <hr />
        <h5 className="text-muted">
          Aca vas a poder observar los produtos con los mejores precios de la temporada.
        </h5>
      </div>

      <div className="flex gap-8 mx-auto max-w-7xl px-4">
        <FilterSidebar
          selectedCategories={activeCategories}
          maxPrice={activeMaxPrice}
          minPrice={priceRange.minPrice}
          maxPriceLimit={priceRange.maxPriceLimit}
          onCategoryChange={handleCategoryChange}
          onPriceChange={handlePriceChange}
          onClearFilters={handleClearFilters}
        />

        <div className="flex-1 min-w-0">
          <ProductGrid
            products={products}
            onProductClick={handleProductClick}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </section>
  );
}
