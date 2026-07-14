/**
 * ShoppingConcierge — Chatbot de ventas embebido en la UI.
 *
 * Renderiza un botón flotante (FAB) que abre un panel de chat.
 * El chat permite al usuario buscar productos por texto libre,
 * filtrar por precio/categoría y agregar productos al carrito.
 *
 * Diseño: Tailwind CSS, responsive, sin romper el layout existente.
 */

import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { CartContext } from '../../context/CartContext';
import { useConcierge } from '../../hooks/useConcierge';
import type { Product } from '../../types/product';

// ──────────────────────────────────────────────
//  Constants
// ──────────────────────────────────────────────

function formatPrice(price: number): string {
  return '$' + price.toLocaleString('es-AR');
}

// ──────────────────────────────────────────────
//  Chat Message Bubble
// ──────────────────────────────────────────────

function ChatBubble({
  message,
}: {
  message: {
    role: 'user' | 'assistant';
    text: string;
    products?: Product[];
    timestamp: number;
  };
}) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-[rgb(245,146,109)] text-white rounded-br-md'
            : 'bg-gray-100 text-gray-800 rounded-bl-md'
        }`}
      >
        {/* Render text with basic markdown-style bold */}
        <p className="whitespace-pre-wrap">{message.text}</p>

        {/* Product recommendations as cards */}
        {message.products && message.products.length > 0 && (
          <div className="mt-3 space-y-2 border-t border-gray-200 pt-2">
            {message.products.map((product) => (
              <ProductMiniCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
//  Product Mini Card (inline recommendation)
// ──────────────────────────────────────────────

function ProductMiniCard({ product }: { product: Product }) {
  const ctx = useContext(CartContext);

  const handleAdd = useCallback(() => {
    ctx?.addToCart(product);
  }, [ctx, product]);

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-gray-200">
      {/* Product image */}
      <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-gray-200">
        {product.img ? (
          <img
            src={product.img}
            alt={product.nombre}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            📷
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-900 truncate">
          {product.nombre}
        </p>
        <p className="text-xs text-gray-500">{formatPrice(product.precio)}</p>
      </div>

      {/* Add to cart button */}
      <button
        onClick={handleAdd}
        className="flex-shrink-0 bg-[rgb(245,146,109)] hover:bg-[rgb(230,130,90)] text-white text-xs font-medium px-2.5 py-1 rounded-full transition-colors duration-200 border-0 cursor-pointer"
        aria-label={`Agregar ${product.nombre} al carrito`}
      >
        + Carrito
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
//  Main Component
// ──────────────────────────────────────────────

export function ShoppingConcierge() {
  const ctx = useContext(CartContext)!;
  const {
    messages,
    isOpen,
    isTyping,
    catalogLoaded,
    toggle,
    sendMessage,
  } = useConcierge(ctx.addToCart);

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputText.trim() || isTyping || !catalogLoaded) return;
      sendMessage(inputText);
      setInputText('');
    },
    [inputText, isTyping, catalogLoaded, sendMessage],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        handleSubmit(e);
      }
    },
    [handleSubmit],
  );

  return (
    <>
      {/* ─── FAB Button ─── */}
      <button
        onClick={toggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[rgb(245,146,109)] hover:bg-[rgb(230,130,90)] text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-0 cursor-pointer"
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat de ventas'}
        style={{ boxShadow: '0 4px 15px rgba(245, 146, 109, 0.4)' }}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* ─── Chat Panel ─── */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300"
          style={{ boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)' }}
        >
          {/* ─── Header ─── */}
          <div className="bg-[rgb(245,146,109)] text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Concierge de Ventas</p>
                <p className="text-xs text-white/80 leading-tight">
                  {catalogLoaded ? '🟢 En línea' : '🟡 Cargando...'}
                </p>
              </div>
            </div>
            <button
              onClick={toggle}
              className="text-white/80 hover:text-white transition-colors bg-transparent border-0 cursor-pointer p-1"
              aria-label="Cerrar chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ─── Messages Area ─── */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 bg-gray-50/50">
            {messages.length === 0 && !isTyping && (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center px-4">
                <p>Envíame un mensaje para empezar a buscar productos 🎸</p>
              </div>
            )}

            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ─── Input Area ─── */}
          <form
            onSubmit={handleSubmit}
            className="flex-shrink-0 border-t border-gray-200 px-4 py-3 bg-white flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                catalogLoaded
                  ? 'Buscá productos...'
                  : 'Cargando catálogo...'
              }
              disabled={!catalogLoaded || isTyping}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none focus:border-[rgb(245,146,109)] focus:ring-1 focus:ring-[rgb(245,146,109)] transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping || !catalogLoaded}
              className="w-10 h-10 rounded-full bg-[rgb(245,146,109)] hover:bg-[rgb(230,130,90)] text-white flex items-center justify-center flex-shrink-0 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-0 cursor-pointer"
              aria-label="Enviar mensaje"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
