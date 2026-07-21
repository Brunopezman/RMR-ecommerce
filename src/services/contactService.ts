/**
 * Contact Service — send contact form messages to the backend.
 *
 * This service follows the pattern from authService.ts and api.ts:
 * - Uses fetch with typed responses
 * - Validates HTTP status and structured error payloads
 * - All errors are thrown as descriptive Error instances
 */

import type { ContactFormData, ContactResponse, ContactAreaInfo } from '../types/contact';
import { CONTACT_AREAS } from '../types/contact';
import { BASE_URL } from './api';

/**
 * Send a contact message to the backend.
 *
 * Makes a POST request to `${BASE_URL}/api/contact` with the form data.
 *
 * @param data - The contact form payload
 * @returns A promise resolving to `{ success: true, messageId }` on success
 * @throws Error with a descriptive message on validation failure, server error, or network error
 */
export async function sendContactMessage(data: ContactFormData): Promise<ContactResponse> {
  const endpoint = `${BASE_URL}/api/contact`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Error de red desconocido.';
    throw new Error(`No se pudo enviar el mensaje: ${message}`);
  }

  // ── Success: HTTP 201 ──────────────────────────────────────────────
  if (response.status === 201) {
    const json = (await response.json()) as ContactResponse;
    return json;
  }

  // ── Error: 4xx / 5xx ───────────────────────────────────────────────
  let errorBody: Record<string, unknown> = {};
  try {
    errorBody = (await response.json()) as Record<string, unknown>;
  } catch {
    errorBody = { error: `Error del servidor (HTTP ${response.status})` };
  }

  const errorMessage =
    (errorBody.error as string) ||
    (errorBody.msg as string) ||
    `Error del servidor (HTTP ${response.status})`;

  throw new Error(errorMessage);
}

/**
 * Returns the list of available contact areas.
 *
 * Currently returns the local constant. In the future this could fetch
 * from the server to allow dynamic area configuration.
 */
export function getContactAreas(): ContactAreaInfo[] {
  return CONTACT_AREAS;
}
