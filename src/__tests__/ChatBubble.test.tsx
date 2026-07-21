/**
 * Tests for ChatBubble — burbuja de mensaje del concierge.
 *
 * Covers: renderizado de texto, productos, estilos user vs assistant.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatBubble } from '../components/chat/ChatBubble';
import type { Product } from '../types/product';

const mockProduct: Product = {
  id: 1,
  nombre: 'Remera The Beatles',
  tipo: 'remera',
  img: '/img/remera.jpg',
  precio: 4000,
};

const mockProduct2: Product = {
  id: 4,
  nombre: 'Remera AC/DC',
  tipo: 'remera',
  img: '/img/remera-acdc.jpg',
  precio: 4500,
};

describe('ChatBubble', () => {
  const onAddToCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza texto del asistente correctamente', () => {
    render(
      <ChatBubble
        message={{
          role: 'assistant',
          text: 'Hola, soy tu asistente de compra.',
          timestamp: Date.now(),
        }}
        onAddToCart={onAddToCart}
      />,
    );

    expect(screen.getByText('Hola, soy tu asistente de compra.')).toBeInTheDocument();
    // Should also show relative time
    expect(screen.getByText('ahora')).toBeInTheDocument();
  });

  it('renderiza texto del usuario correctamente', () => {
    render(
      <ChatBubble
        message={{
          role: 'user',
          text: 'Quiero una remera de rock',
          timestamp: Date.now(),
        }}
        onAddToCart={onAddToCart}
      />,
    );

    expect(screen.getByText('Quiero una remera de rock')).toBeInTheDocument();
  });

  it('renderiza productos cuando existen en el mensaje', () => {
    const products: Product[] = [mockProduct, mockProduct2];

    render(
      <ChatBubble
        message={{
          role: 'assistant',
          text: 'Te recomiendo estos productos:',
          products,
          timestamp: Date.now(),
        }}
        onAddToCart={onAddToCart}
      />,
    );

    // The product names should be visible in the mini cards
    expect(screen.getByText('Remera The Beatles')).toBeInTheDocument();
    expect(screen.getByText('Remera AC/DC')).toBeInTheDocument();
    // Prices should be formatted
    expect(screen.getByText('$4.000')).toBeInTheDocument();
    expect(screen.getByText('$4.500')).toBeInTheDocument();
    // Buttons for each product
    const buttons = screen.getAllByRole('button', { name: /agregar/i });
    expect(buttons.length).toBe(2);
  });

  it('aplica estilos diferentes para user vs assistant', () => {
    const { container: userContainer } = render(
      <ChatBubble
        message={{
          role: 'user',
          text: 'Mensaje de usuario',
          timestamp: Date.now(),
        }}
        onAddToCart={onAddToCart}
      />,
    );

    const { container: assistantContainer } = render(
      <ChatBubble
        message={{
          role: 'assistant',
          text: 'Mensaje del asistente',
          timestamp: Date.now(),
        }}
        onAddToCart={onAddToCart}
      />,
    );

    // User message should be right-aligned (justify-end class)
    const userWrapper = userContainer.firstChild as HTMLElement;
    expect(userWrapper.className).toContain('justify-end');

    // Assistant message should be left-aligned (justify-start class)
    const assistantWrapper = assistantContainer.firstChild as HTMLElement;
    expect(assistantWrapper.className).toContain('justify-start');
  });

  it('no renderiza productos cuando el mensaje no tiene products', () => {
    render(
      <ChatBubble
        message={{
          role: 'assistant',
          text: 'Solo texto, sin productos.',
          timestamp: Date.now(),
        }}
        onAddToCart={onAddToCart}
      />,
    );

    expect(screen.getByText('Solo texto, sin productos.')).toBeInTheDocument();
    // No buttons should be rendered (only the "agregar" buttons from ProductMiniCard)
    const buttons = screen.queryAllByRole('button', { name: /agregar/i });
    expect(buttons.length).toBe(0);
  });
});
