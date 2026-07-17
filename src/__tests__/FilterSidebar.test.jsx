import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterSidebar } from '../components/catalog/FilterSidebar';

const DEFAULT_PROPS = {
  selectedCategories: [],
  maxPrice: null,
  minPrice: 0,
  maxPriceLimit: 10000,
  onCategoryChange: vi.fn(),
  onPriceChange: vi.fn(),
  onClearFilters: vi.fn(),
};

/** Helper: returns the desktop sidebar */
function getDesktopSidebar() {
  return screen.getByRole('complementary', { name: 'Filtros de productos' });
}

/** Returns all checkboxes scoped to the desktop sidebar */
function getDesktopCheckboxes() {
  const sidebar = getDesktopSidebar();
  // In the desktop sidebar, checkboxes have sr-only class and are wrapped in labels
  // We scope by the fieldset inside the sidebar
  const fieldset = sidebar.querySelector('fieldset');
  return fieldset ? fieldset.querySelectorAll('input[type="checkbox"]') : [];
}

describe('FilterSidebar', () => {
  it('renderiza el título Filtros en el sidebar desktop', () => {
    render(<FilterSidebar {...DEFAULT_PROPS} />);
    const sidebar = getDesktopSidebar();
    expect(within(sidebar).getByText('Filtros')).toBeInTheDocument();
  });

  it('renderiza los 4 checkboxes de categoría en el sidebar', () => {
    render(<FilterSidebar {...DEFAULT_PROPS} />);
    const checkboxes = getDesktopCheckboxes();
    expect(checkboxes).toHaveLength(4);
  });

  it('los checkboxes tienen los ids correctos: cat-remera, cat-buzo, cat-accesorio, cat-vaso', () => {
    render(<FilterSidebar {...DEFAULT_PROPS} />);
    const checkboxes = getDesktopCheckboxes();
    const ids = Array.from(checkboxes).map(cb => cb.id);
    expect(ids).toEqual(['cat-remera', 'cat-buzo', 'cat-accesorio', 'cat-vaso']);
  });

  it('marca los checkboxes según selectedCategories', () => {
    render(
      <FilterSidebar
        {...DEFAULT_PROPS}
        selectedCategories={['remera', 'buzo']}
      />,
    );
    const checkboxes = getDesktopCheckboxes();
    expect(checkboxes[0].checked).toBe(true); // remera
    expect(checkboxes[1].checked).toBe(true); // buzo
    expect(checkboxes[2].checked).toBe(false); // accesorio
    expect(checkboxes[3].checked).toBe(false); // vaso
  });

  it('no muestra el botón "Limpiar filtros" si no hay filtros activos', () => {
    render(<FilterSidebar {...DEFAULT_PROPS} />);
    const sidebar = getDesktopSidebar();
    expect(within(sidebar).queryByText('Limpiar filtros')).not.toBeInTheDocument();
  });

  it('muestra el botón "Limpiar filtros" cuando hay categorías seleccionadas', () => {
    render(
      <FilterSidebar
        {...DEFAULT_PROPS}
        selectedCategories={['remera']}
      />,
    );
    const sidebar = getDesktopSidebar();
    expect(within(sidebar).getByText('Limpiar filtros')).toBeInTheDocument();
  });

  it('muestra el botón "Limpiar filtros" cuando hay precio máximo activo', () => {
    render(
      <FilterSidebar
        {...DEFAULT_PROPS}
        maxPrice={5000}
      />,
    );
    const sidebar = getDesktopSidebar();
    expect(within(sidebar).getByText('Limpiar filtros')).toBeInTheDocument();
  });

  it('llama a onCategoryChange al hacer clic en la label del checkbox', async () => {
    const onCategoryChange = vi.fn();
    const user = userEvent.setup();

    render(
      <FilterSidebar
        {...DEFAULT_PROPS}
        onCategoryChange={onCategoryChange}
      />,
    );
    const sidebar = getDesktopSidebar();
    const [remeraLabel] = within(sidebar).getAllByText('Remeras');
    await user.click(remeraLabel);

    expect(onCategoryChange).toHaveBeenCalledWith(['remera']);
  });

  it('llama a onCategoryChange removiendo la categoría si ya estaba seleccionada', async () => {
    const onCategoryChange = vi.fn();
    const user = userEvent.setup();

    render(
      <FilterSidebar
        {...DEFAULT_PROPS}
        selectedCategories={['remera']}
        onCategoryChange={onCategoryChange}
      />,
    );
    const sidebar = getDesktopSidebar();
    const [remeraLabel] = within(sidebar).getAllByText('Remeras');
    await user.click(remeraLabel);

    expect(onCategoryChange).toHaveBeenCalledWith([]);
  });

  it('llama a onClearFilters al hacer clic en "Limpiar filtros" del sidebar', async () => {
    const onClearFilters = vi.fn();
    const user = userEvent.setup();

    render(
      <FilterSidebar
        {...DEFAULT_PROPS}
        selectedCategories={['remera']}
        onClearFilters={onClearFilters}
      />,
    );
    const sidebar = getDesktopSidebar();

    await user.click(within(sidebar).getByText('Limpiar filtros'));

    expect(onClearFilters).toHaveBeenCalledOnce();
  });

  it('renderiza el slider de precio con valores correctos en el sidebar', () => {
    render(
      <FilterSidebar
        {...DEFAULT_PROPS}
        minPrice={0}
        maxPriceLimit={10000}
      />,
    );
    const sidebar = getDesktopSidebar();
    const slider = within(sidebar).getByLabelText('Seleccionar precio máximo');

    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '10000');
    expect(slider).toHaveAttribute('step', '100');
  });

  it('llama a onPriceChange al cambiar el slider en el sidebar', () => {
    const onPriceChange = vi.fn();
    const { container } = render(
      <FilterSidebar
        {...DEFAULT_PROPS}
        onPriceChange={onPriceChange}
      />,
    );
    const sidebar = getDesktopSidebar();
    const slider = within(sidebar).getByLabelText('Seleccionar precio máximo');

    // jsdom does not support keyboard interaction on range inputs,
    // so we dispatch a 'change' event programmatically
    fireEvent.change(slider, { target: { value: '5000' } });

    expect(onPriceChange).toHaveBeenCalled();
  });

  it('no sincroniza localPrice cuando maxPrice prop cambia externamente (feedback loop eliminado)', () => {
    const { rerender } = render(
      <FilterSidebar
        {...DEFAULT_PROPS}
        maxPrice={5000}
        maxPriceLimit={10000}
      />,
    );
    const sidebar = getDesktopSidebar();
    expect(within(sidebar).getByText('$5.000')).toBeInTheDocument();

    rerender(
      <FilterSidebar
        {...DEFAULT_PROPS}
        maxPrice={3000}
        maxPriceLimit={10000}
      />,
    );
    // localPrice NO debe cambiar porque eliminamos el useEffect que sincronizaba
    // la prop externa con el estado local del slider
    expect(within(sidebar).getByText('$5.000')).toBeInTheDocument();
  });

  it('renderiza el badge de filtros activos en el botón mobile', () => {
    render(
      <FilterSidebar
        {...DEFAULT_PROPS}
        selectedCategories={['remera', 'buzo']}
        maxPrice={5000}
      />,
    );

    const badges = screen.getAllByText('3');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it('al hacer clic en checkbox por label también funciona', async () => {
    const onCategoryChange = vi.fn();
    const user = userEvent.setup();

    render(
      <FilterSidebar
        {...DEFAULT_PROPS}
        onCategoryChange={onCategoryChange}
      />,
    );

    // Use getAllByRole('checkbox') and click the desktop one (first 4)
    const allCheckboxes = screen.getAllByRole('checkbox');
    // Desktop checkboxes have accessible names; pick the one for "Remeras"
    // First 4 checkboxes should be desktop ones
    await user.click(allCheckboxes[0]);

    expect(onCategoryChange).toHaveBeenCalledWith(['remera']);
  });
});
