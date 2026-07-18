/** Producto del catálogo */
export interface Product {
  id: number;
  nombre: string;
  tipo?: string;
  img: string;
  descripcion?: string;
  precio: number;
  /** Cantidad en carrito (solo cuando está en el carrito) */
  cantidad?: number;
  /** Campos alternativos que pueden venir del JSON */
  name?: string;
  category?: string;
  categoria?: string;
  /** Talle seleccionado (ej: "S", "M", "L", "XL", "Único") */
  talle?: string;
  /** Talles disponibles para este producto */
  tallesDisponibles?: string[];
}
