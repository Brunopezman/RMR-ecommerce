/**
 * Contact form types — used by the contact form, contact service, and hook.
 */

export type ContactArea = 'ventas' | 'soporte' | 'reclamos' | 'prensa' | 'otros';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  area: ContactArea;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  messageId: number;
}

export interface ContactAreaInfo {
  value: ContactArea;
  label: string;
  description: string;
}

export const CONTACT_AREAS: ContactAreaInfo[] = [
  { value: 'ventas',   label: 'Ventas',       description: 'Consultas sobre productos, precios y disponibilidad' },
  { value: 'soporte',  label: 'Soporte',      description: 'Problemas con tu pedido, cambios o devoluciones' },
  { value: 'reclamos', label: 'Reclamos',     description: 'Inconvenientes con tu compra o experiencia' },
  { value: 'prensa',   label: 'Prensa',       description: 'Consultas de medios, colaboraciones y eventos' },
  { value: 'otros',    label: 'Otros',        description: 'Cualquier otra consulta no contemplada arriba' },
];
