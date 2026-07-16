import { useState, useEffect, useRef, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Tipos                                                              */
/* ------------------------------------------------------------------ */

export interface FilterSidebarProps {
  selectedCategories: string[];
  maxPrice: number | null;
  minPrice: number;
  maxPriceLimit: number;
  onCategoryChange: (categories: string[]) => void;
  onPriceChange: (maxPrice: number | null) => void;
  onClearFilters: () => void;
}

/* ------------------------------------------------------------------ */
/*  Constantes                                                         */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  { value: 'remera', label: 'Remeras' },
  { value: 'buzo', label: 'Buzos' },
  { value: 'accesorio', label: 'Accesorios' },
  { value: 'vaso', label: 'Vasos' },
] as const;

/* ------------------------------------------------------------------ */
/*  Componente                                                         */
/* ------------------------------------------------------------------ */

export function FilterSidebar({
  selectedCategories,
  maxPrice,
  minPrice,
  maxPriceLimit,
  onCategoryChange,
  onPriceChange,
  onClearFilters,
}: FilterSidebarProps) {
  /* — Estado local — */
  const [mobileOpen, setMobileOpen] = useState(false);
  const [localPrice, setLocalPrice] = useState<number>(maxPrice ?? maxPriceLimit);

  /* — Refs — */
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  /* — Sincronizar localPrice cuando la prop cambie externamente — */
  useEffect(() => {
    setLocalPrice(maxPrice ?? maxPriceLimit);
  }, [maxPrice, maxPriceLimit]);

  /* — Cerrar con Escape y bloquear scroll en mobile — */
  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    /* Focus el botón cerrar al abrir el drawer */
    closeRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  /* — Handlers — */
  const handleCategoryToggle = useCallback(
    (category: string) => {
      const isSelected = selectedCategories.includes(category);
      onCategoryChange(
        isSelected
          ? selectedCategories.filter((c) => c !== category)
          : [...selectedCategories, category],
      );
    },
    [selectedCategories, onCategoryChange],
  );

  const handlePriceChange = useCallback(
    (value: number) => {
      setLocalPrice(value);
      onPriceChange(value >= maxPriceLimit ? null : value);
    },
    [maxPriceLimit, onPriceChange],
  );

  const handleClear = useCallback(() => {
    setLocalPrice(maxPriceLimit);
    onClearFilters();
  }, [maxPriceLimit, onClearFilters]);

  const hasActiveFilters =
    selectedCategories.length > 0 || maxPrice !== null;

  const activeFilterCount =
    selectedCategories.length + (maxPrice !== null ? 1 : 0);

  /* ---------------------------------------------------------------- */
  /*  Contenido compartido (mobile drawer + desktop sidebar)          */
  /* ---------------------------------------------------------------- */

  const filterBody = (
    <div className="space-y-6">
      {/* — Categorías — */}
      <fieldset>
        <legend className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-3">
          Categoría
        </legend>
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const checked = selectedCategories.includes(cat.value);
            const checkboxId = `cat-${cat.value}`;
            return (
              <label
                key={cat.value}
                htmlFor={checkboxId}
                className="flex items-center gap-3 cursor-pointer group"
              >
                {/* Checkbox visual personalizado */}
                <span
                  className={`relative inline-flex items-center justify-center w-5 h-5 rounded border-2 flex-shrink-0 transition-all duration-200 ${
                    checked
                      ? 'bg-coral border-coral'
                      : 'border-gray-300 bg-white group-hover:border-coral'
                  }`}
                  aria-hidden="true"
                >
                  {checked && (
                    <svg
                      className="w-3 h-3 text-white pointer-events-none"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </span>

                {/* Checkbox nativo (solo accesibilidad) */}
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCategoryToggle(cat.value)}
                  className="sr-only"
                  aria-checked={checked}
                />

                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200 select-none">
                  {cat.label}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* — Separador — */}
      <hr className="border-gray-200 my-4" />

      {/* — Precio máximo — */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor="price-range"
            className="text-sm font-semibold uppercase tracking-wider text-gray-900"
          >
            Precio máx.
          </label>
          <span
            className="text-sm font-bold text-coral tabular-nums"
            aria-live="polite"
          >
            ${localPrice.toLocaleString('es-AR')}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>${minPrice.toLocaleString('es-AR')}</span>
          <span>${maxPriceLimit.toLocaleString('es-AR')}</span>
        </div>

        <input
          id="price-range"
          type="range"
          min={minPrice}
          max={maxPriceLimit}
          step={100}
          value={localPrice}
          onChange={(e) => handlePriceChange(Number(e.target.value))}
          /* accent-coral + pseudo-elementos para thumb cross-browser */
          className="
            w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
            accent-coral
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:bg-coral
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:duration-200
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:bg-coral
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:hover:scale-110
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-coral
          "
          aria-label="Seleccionar precio máximo"
          aria-valuenow={localPrice}
          aria-valuemin={minPrice}
          aria-valuemax={maxPriceLimit}
        />
      </div>

      {/* — Botón Limpiar (solo visible cuando hay filtros activos) — */}
      {hasActiveFilters && (
        <button
          onClick={handleClear}
          className="
            w-full text-sm text-gray-500 hover:text-coral
            transition-colors duration-200
            border border-gray-200 hover:border-coral
            rounded px-4 py-2.5
            flex items-center justify-center gap-2
            bg-transparent cursor-pointer
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral
          "
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Limpiar filtros
        </button>
      )}
    </div>
  );

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <>
      {/* ============ MOBILE: Botón flotante "Filtrar" ============ */}
      <button
        ref={triggerRef}
        onClick={() => setMobileOpen(true)}
        className={`
          fixed bottom-20 left-6 z-30
          md:hidden
          flex items-center gap-2
          bg-black text-white
          px-5 py-3
          rounded-full shadow-lg
          hover:bg-coral
          transition-colors duration-300
          text-sm font-semibold uppercase tracking-wide
          cursor-pointer border-0
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral
        `}
        aria-label="Abrir filtros"
        aria-haspopup="dialog"
        aria-expanded={mobileOpen}
      >
        {/* Icono filtro */}
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Filtrar
        {hasActiveFilters && (
          <span
            className="bg-coral text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-0.5 font-bold"
            aria-label={`${activeFilterCount} filtro${activeFilterCount !== 1 ? 's' : ''} activo${activeFilterCount !== 1 ? 's' : ''}`}
          >
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* ============ MOBILE: Drawer lateral ============ */}
      <div
        className={`
          fixed inset-0 z-50
          md:hidden
          transition-opacity duration-300 ease-in-out
          ${mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Filtros de productos"
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => {
            setMobileOpen(false);
            triggerRef.current?.focus();
          }}
          aria-hidden="true"
        />

        {/* Panel */}
        <div
          ref={drawerRef}
          className={`
            absolute left-0 top-0 bottom-0
            w-80 max-w-[85vw]
            bg-white shadow-xl
            flex flex-col
            transition-transform duration-300 ease-in-out
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-900">
              Filtros
            </h2>
            <button
              ref={closeRef}
              onClick={() => {
                setMobileOpen(false);
                triggerRef.current?.focus();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 bg-transparent border-0 cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
              aria-label="Cerrar filtros"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Cuerpo con scroll */}
          <div className="flex-1 overflow-y-auto px-5 py-6">
            {filterBody}
          </div>
        </div>
      </div>

      {/* ============ DESKTOP: Sidebar permanente ============ */}
      <aside
        className="hidden md:block w-64 flex-shrink-0"
        aria-label="Filtros de productos"
      >
        <div className="sticky top-24 bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <h2 className="text-lg font-bold uppercase tracking-wider text-gray-900 mb-6">
            Filtros
          </h2>
          {filterBody}
        </div>
      </aside>
    </>
  );
}

export default FilterSidebar;
