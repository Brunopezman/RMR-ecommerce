/**
 * ChatBubble — Burbuja de mensaje individual para el chat del concierge.
 *
 * Renderiza un mensaje de usuario o asistente, con soporte para
 * mostrar tarjetas de producto recomendadas.
 * Incluye mini avatar para el asistente y timestamp relativo.
 */

import type { Product } from '../../types/product';
import { ProductMiniCard } from './ProductMiniCard';

// ──────────────────────────────────────────────
//  Types
// ──────────────────────────────────────────────

export interface ChatBubbleMessage {
  role: 'user' | 'assistant';
  text: string;
  products?: Product[];
  timestamp: number;
}

export interface ChatBubbleProps {
  message: ChatBubbleMessage;
  onAddToCart: (product: Product) => void;
}

// ──────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────

function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'ahora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

// ──────────────────────────────────────────────
//  Component
// ──────────────────────────────────────────────

export function ChatBubble({ message, onAddToCart }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 animate-slide-up`}>
      {/* Assistant avatar */}
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6-1.78 6-6.42a5.24 5.24 0 00-1.39-3.62 4.87 4.87 0 00-.14-3.57 11.22 11.22 0 00-3.55 1.62 11.37 11.37 0 00-6.44 0A11.22 11.22 0 004.47 3.5a4.87 4.87 0 00-.14 3.57 5.24 5.24 0 00-1.39 3.62c0 4.64 2.86 6.07 6 6.42a3.37 3.37 0 00-.94 2.61V22" />
          </svg>
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-coral text-white rounded-tr-sm'
            : 'bg-gray-50 border border-gray-200 text-gray-800 rounded-tl-sm'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>

        {/* Product recommendations */}
        {message.products && message.products.length > 0 && (
          <div className="mt-3 space-y-2 border-t border-gray-200 pt-2">
            {message.products.map((product) => (
              <ProductMiniCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className={`text-[10px] mt-1.5 ${isUser ? 'text-white/60' : 'text-gray-400'}`}>
          {relativeTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
