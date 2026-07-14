/**
 * useConcierge — Hook que maneja la lógica del chatbot de ventas.
 *
 * Responsabilidades:
 * - Mantener el historial de mensajes (usuario ↔ concierge)
 * - Procesar mensajes: interpretar intención, buscar productos, responder
 * - Integrar con CartContext para agregar productos al carrito
 * - Integrar con productSearch para búsqueda semántica del catálogo
 *
 * La respuesta del concierge se construye sin LLM externo, usando
 * plantillas y búsqueda semántica local (TF-IDF + cosine similarity).
 *
 * Carga de datos: primero intenta la mock API (json-server). Si falla,
 * cae a /data/db.json (servido por Vite). Si ambos fallan, habilita el
 * chat igual con un mensaje de error amigable.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Product } from '../types/product';
import { buildIndex, searchSimilar, isIndexReady, clearIndex, searchByName } from '../services/productSearch';
import { PRODUCTS_API_URL } from '../services/productService';

// ──────────────────────────────────────────────
//  Fallback data loader
// ──────────────────────────────────────────────

/**
 * Fetch products from an absolute URL (Vite-served /data/db.json).
 * Returns null on failure.
 */
async function fetchFallbackProducts(): Promise<Product[] | null> {
  try {
    const res = await fetch('/data/db.json');
    if (!res.ok) return null;
    const json = await res.json();
    // Handle both { "products": [...] } and plain [...] formats
    if (Array.isArray(json)) return json;
    if (json.products && Array.isArray(json.products)) return json.products;
    return null;
  } catch {
    return null;
  }
}

/**
 * Attempt to load products from multiple sources with a timeout.
 * Tries: mock API → /data/db.json fallback.
 */
async function loadProductsWithFallback(): Promise<Product[]> {
  // Try 1: mock API (with 5s timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(PRODUCTS_API_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data: Product[] = await res.json();
      if (data.length > 0) return data;
    }
  } catch {
    // API unavailable — continue to fallback
  }

  // Try 2: /data/db.json served by Vite
  const fallback = await fetchFallbackProducts();
  if (fallback && fallback.length > 0) return fallback;

  return [];
}

// ──────────────────────────────────────────────
//  Types
// ──────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  /** Optional products to display as recommendations */
  products?: Product[];
  /** Timestamp for ordering */
  timestamp: number;
}

export interface ConciergeState {
  messages: ChatMessage[];
  isOpen: boolean;
  isTyping: boolean;
  products: Product[];
  catalogLoaded: boolean;
}

export interface ConciergeActions {
  open: () => void;
  close: () => void;
  toggle: () => void;
  sendMessage: (text: string) => void;
  addToCart: (product: Product) => void;
}

export type UseConciergeReturn = ConciergeState & ConciergeActions;

let messageCounter = 0;
function nextId(): string {
  messageCounter += 1;
  return `msg-${Date.now()}-${messageCounter}`;
}

// ──────────────────────────────────────────────
//  Response templates
// ──────────────────────────────────────────────

interface ParsedIntent {
  query: string;
  maxPrice?: number;
  category?: string;
  action?: 'search' | 'add_to_cart' | 'greeting' | 'help' | 'unknown';
  productName?: string; // for add_to_cart
}

/**
 * Parse user message to extract intent, search terms, price, and category.
 */
function parseIntent(text: string): ParsedIntent {
  const lower = text.toLowerCase().trim();

  // Greetings
  if (/^(hola|buenas|buen[asod]|hey|hello|saludos)/i.test(lower)) {
    return { query: text, action: 'greeting' };
  }

  // Help
  if (/^(ayuda|help|qu[eé] puedes hacer|qu[eé] hac[eé]s)/i.test(lower)) {
    return { query: text, action: 'help' };
  }

  // Add to cart: patterns like "agregá X", "añadí X", "poné X al carrito", "comprá X"
  const addMatch = lower.match(
    /(?:agreg[áa]|añad[íi]|pon[eé]|compr[áa]|quiero\s+(?:comprar|el|la|un|una))\s+(.*?)(?:\s+(?:al|en\s+el)\s+carrito)?$/i,
  );
  if (addMatch) {
    const productName = addMatch[1].trim();
    if (productName && productName.length > 2) {
      return {
        query: productName,
        action: 'add_to_cart',
        productName,
      };
    }
  }

  // Extract budget: $ numbers like "5000", "$5000", "5000 pesos", "bajo 5000", "máximo 5000"
  let maxPrice: number | undefined;
  const priceMatch = lower.match(
    /(?:(\$|precio|pesos)?\s*(\d{3,6})\s*(?:pesos)?|(?:menos|bajo|máximo|hasta|max|menor)\s*(?:\$)?\s*(\d{3,6}))/i,
  );
  if (priceMatch) {
    maxPrice = parseInt(priceMatch[2] ?? priceMatch[3] ?? '0', 10);
  }

  // Extract category: tipos conocidos
  let category: string | undefined;
  const categoryPatterns: Array<[RegExp, string]> = [
    [/(?:remera|remeras|remera|remeron)/i, 'remera'],
    [/(?:buzo|buzos|buzito)/i, 'buzo'],
    [/(?:accesorio|accesorios|gorra|gorro|gorras|gorros)/i, 'accesorio'],
    [/(?:vaso|vasos|taza|tazas|chop|chops)/i, 'vaso'],
  ];

  for (const [pattern, cat] of categoryPatterns) {
    if (pattern.test(lower)) {
      category = cat;
      break;
    }
  }

  // Remove price-related words from the query for better semantic matching
  let query = text
    .replace(/(?:menos|bajo|máximo|hasta|max|menor|mayor)\s*(?:\$)?\s*\d{3,6}/gi, '')
    .replace(/(?:\$)?\s*\d{3,6}\s*(?:pesos)?/gi, '')
    .replace(/\b(?:agreg[áa]|añad[íi]|pon[eé]|compr[áa]|quiero)\b/gi, '')
    .replace(/\b(?:al|en\s+el)\s+carrito\b/gi, '')
    .replace(/\b(?:por\s+fa[ov]or|gracias|please|thanks)\b/gi, '')
    .trim();

  if (!query || query.length < 2) {
    query = 'buscar'; // fallback
  }

  return {
    query,
    maxPrice,
    category,
    action: 'search',
  };
}

/**
 * Generate a response message based on search results.
 */
function formatSearchResponse(
  results: Array<{ product: Product; score: number }>,
  intent: ParsedIntent,
): { text: string; products: Product[] } {
  if (results.length === 0) {
    let msg = 'No encontré productos que coincidan con tu búsqueda. ';
    if (intent.category && intent.maxPrice) {
      msg += `No hay ${intent.category}s por menos de $${intent.maxPrice}. ¿Querés probar con otro presupuesto o categoría?`;
    } else if (intent.category) {
      msg += `No tenemos ${intent.category}s en este momento. ¿Te interesa ver otra categoría?`;
    } else {
      msg += 'Podés probar con otras palabras o consultar nuestro catálogo completo.';
    }
    return { text: msg, products: [] };
  }

  const products = results.map((r) => r.product);
  let text: string;

  if (intent.maxPrice !== undefined && intent.category) {
    text = `Encontré ${products.length} ${intent.category}s por hasta $${intent.maxPrice}:\n\n`;
  } else if (intent.category) {
    text = `Estas son nuestras ${intent.category}s disponibles:\n\n`;
  } else if (intent.maxPrice !== undefined) {
    text = `Encontré ${products.length} productos por hasta $${intent.maxPrice}:\n\n`;
  } else {
    text = 'Te recomiendo estos productos:\n\n';
  }

  // Add product details to text
  text += products
    .map((p, i) => `${i + 1}. **${p.nombre}** — $${p.precio}`)
    .join('\n');

  text +=
    '\n\n¿Te gusta alguno? Decime "agregá [nombre del producto]" para sumarlo al carrito.';

  return { text, products };
}

// ──────────────────────────────────────────────
//  Hook
// ──────────────────────────────────────────────

export function useConcierge(addToCartFn: (product: Product) => void): UseConciergeReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const initializedRef = useRef(false);
  const mountedRef = useRef(true);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      initializedRef.current = false; // allow re-init on StrictMode remount
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  // Safety net: force catalogLoaded after 8s no matter what
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (!catalogLoaded) {
        console.warn('useConcierge: safety net — forcing catalogLoaded after 8s');
        setCatalogLoaded(true);
      }
    }, 8000);
    return () => clearTimeout(safetyTimer);
  }, [catalogLoaded]);

  // Load catalog and build search index on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function loadCatalog() {
      const data = await loadProductsWithFallback();
      if (!mountedRef.current) return;

      if (Array.isArray(data)) {
        setProducts(data);
        clearIndex();
        buildIndex(data);
      }

      setCatalogLoaded(true);

      if (!data || data.length === 0) {
        console.warn('useConcierge: no products loaded from any source');
      }
    }

    loadCatalog();
  }, []);

  // Welcome message when chat is first opened
  const open = useCallback(() => {
    if (!isOpen) {
      setIsOpen(true);
      if (messages.length === 0 && catalogLoaded) {
        const welcome: ChatMessage = {
          id: nextId(),
          role: 'assistant',
          text:
            '🎸 ¡Bienvenido a Rock Merch & Roll! Soy tu asistente de compras.\n\n' +
            'Podés preguntarme por:\n' +
            '• **Productos**: "mostrame remeras", "buzos económicos"\n' +
            '• **Presupuesto**: "algo por menos de $5000"\n' +
            '• **Comprar**: "agregá Remera AC/DC al carrito"\n\n' +
            '¿Qué estás buscando?',
          timestamp: Date.now(),
        };
        setMessages([welcome]);
      }
    }
  }, [isOpen, messages, catalogLoaded]);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const addProductToCart = useCallback(
    (product: Product) => {
      addToCartFn(product);
      const msg: ChatMessage = {
        id: nextId(),
        role: 'assistant',
        text: `✅ Agregué **${product.nombre}** ($${product.precio}) al carrito. Podés seguir comprando o ir al carrito para finalizar.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, msg]);
    },
    [addToCartFn],
  );

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !catalogLoaded) return;

      const userMsg: ChatMessage = {
        id: nextId(),
        role: 'user',
        text: text.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      // Simulate brief typing delay for natural feel
      typingTimerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;

        const intent = parseIntent(text);

        let response: ChatMessage;

        switch (intent.action) {
          case 'greeting': {
            response = {
              id: nextId(),
              role: 'assistant',
              text:
                '🎸 ¡Hola! Encantado de verte por acá.\n\n' +
                'Puedo ayudarte a encontrar el producto perfecto. ' +
                'Contame qué estás buscando: ¿remeras, buzos, accesorios? ' +
                '¿Tenés algún presupuesto en mente?',
              timestamp: Date.now(),
            };
            break;
          }

          case 'help': {
            response = {
              id: nextId(),
              role: 'assistant',
              text:
                '🎸 **¿Qué puedo hacer por vos?**\n\n' +
                '🔍 **Buscar productos** — "mostrame remeras", "buzos de rock"\n' +
                '💰 **Por presupuesto** — "algo por menos de $4000"\n' +
                '📂 **Por categoría** — "accesorios", "gorras"\n' +
                '🛒 **Agregar al carrito** — "agregá Remera The Beatles"\n' +
                '❓ **Ayuda** — "ayuda" o "qué podés hacer"\n\n' +
                '¿Cómo puedo ayudarte hoy?',
              timestamp: Date.now(),
            };
            break;
          }

          case 'add_to_cart': {
            const productName = intent.productName ?? text;
            const found = searchByName(productName, products);

            if (found.length === 0) {
              response = {
                id: nextId(),
                role: 'assistant',
                text:
                  `No encontré un producto llamado "${productName}". ` +
                  '¿Podés verificar el nombre? Podés ver todos los productos en la sección "Productos".',
                timestamp: Date.now(),
              };
            } else if (found.length === 1) {
              addProductToCart(found[0]);
              setIsTyping(false);
              return; // addProductToCart already adds the message
            } else {
              // Multiple matches — show options
              const list = found.map((p, i) => `${i + 1}. ${p.nombre} — $${p.precio}`).join('\n');
              response = {
                id: nextId(),
                role: 'assistant',
                text:
                  `Encontré varios productos que coinciden:\n\n${list}\n\n` +
                  '¿Cuál querés agregar? Decime el nombre exacto.',
                products: found,
                timestamp: Date.now(),
              };
            }
            break;
          }

          case 'search':
          default: {
            const results = searchSimilar(intent.query, 5, {
              maxPrice: intent.maxPrice,
              category: intent.category,
            });

            const { text: respText, products: respProducts } = formatSearchResponse(results, intent);
            response = {
              id: nextId(),
              role: 'assistant',
              text: respText,
              products: respProducts,
              timestamp: Date.now(),
            };
            break;
          }
        }

        setMessages((prev) => [...prev, response]);
        setIsTyping(false);
      }, 600); // 600ms typing delay
    },
    [catalogLoaded, products, addProductToCart],
  );

  return {
    messages,
    isOpen,
    isTyping,
    products,
    catalogLoaded,
    open,
    close,
    toggle,
    sendMessage,
    addToCart: addProductToCart,
  };
}
