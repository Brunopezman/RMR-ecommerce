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
import { ChatBubble } from './ChatBubble';
import type { Product } from '../../types/product';

// ──────────────────────────────────────────────
//  Quick reply suggestions
// ──────────────────────────────────────────────

const suggestions = [
  { label: 'Remeras de rock', query: 'mostrame remeras de rock' },
  { label: 'Menos de $5000', query: 'productos por menos de 5000' },
  { label: 'Buzos', query: 'buzos' },
  { label: 'Accesorios', query: 'accesorios' },
];

// ──────────────────────────────────────────────
//  Main Component
// ──────────────────────────────────────────────

export function ShoppingConcierge() {
  const ctx = useContext(CartContext);
  const {
    messages,
    isOpen,
    isTyping,
    catalogLoaded,
    unreadCount,
    toggle,
    sendMessage,
  } = useConcierge(ctx?.addToCart ?? (() => {}));

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

  // Callback to add a product to cart via context
  const handleAddToCart = useCallback(
    (product: Product) => {
      ctx?.addToCart(product);
    },
    [ctx],
  );

  return (
    <>
      {/* ─── FAB Button ─── */}
      <button
        onClick={toggle}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-14 sm:h-14 max-sm:w-12 max-sm:h-12 rounded-full bg-coral hover:bg-coral-dark text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-0 cursor-pointer ${
          !isOpen && unreadCount > 0 ? 'animate-pulse' : ''
        }`}
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir asistente de compra'}
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

        {/* Badge de notificacion */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ─── Chat Panel ─── */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[calc(100vw-32px)] sm:w-96 h-[500px] max-h-[85vh] sm:max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300"
          role="dialog"
          aria-label="Chat de ventas"
        >
          {/* ─── Header ─── */}
          <div className="bg-coral text-white px-4 py-3 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
            <div className="flex items-center gap-3">
              {/* Avatar circular: icono de auriculares */}
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6-1.78 6-6.42a5.24 5.24 0 00-1.39-3.62 4.87 4.87 0 00-.14-3.57 11.22 11.22 0 00-3.55 1.62 11.37 11.37 0 00-6.44 0A11.22 11.22 0 004.47 3.5a4.87 4.87 0 00-.14 3.57 5.24 5.24 0 00-1.39 3.62c0 4.64 2.86 6.07 6 6.42a3.37 3.37 0 00-.94 2.61V22" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-display font-semibold leading-tight">Asistente de Compra</p>
                <p className="text-xs text-white/80 leading-tight flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${catalogLoaded ? 'bg-green-300' : 'bg-yellow-300'}`} />
                  {catalogLoaded ? 'En linea' : 'Cargando...'}
                </p>
              </div>
            </div>
            <button
              onClick={toggle}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-colors bg-transparent border-0 cursor-pointer"
              aria-label="Cerrar chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ─── Messages Area ─── */}
          <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50/50" aria-live="polite" aria-atomic="false">
            {messages.length === 0 && !isTyping && (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center px-4">
                <p>¡Hola! Soy tu **Asistente de Compra**. Decime que estas buscando</p>
              </div>
            )}

            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} onAddToCart={handleAddToCart} />
            ))}

            {/* Quick reply chips — shown when no messages yet */}
            {messages.length === 0 && catalogLoaded && !isTyping && (
              <div className="px-1 pb-1 flex flex-wrap gap-2">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputText(suggestion.query);
                      setTimeout(() => {
                        sendMessage(suggestion.query);
                      }, 200);
                    }}
                    style={{ animationDelay: `${i * 80}ms` }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-full border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-sm animate-slide-up"
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            )}

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
                  ? 'Busca productos...'
                  : 'Cargando catalogo...'
              }
              disabled={!catalogLoaded || isTyping}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping || !catalogLoaded}
              className="w-10 h-10 rounded-full bg-coral hover:bg-coral-dark text-white flex items-center justify-center flex-shrink-0 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-0 cursor-pointer"
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
