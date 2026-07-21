/**
 * useContact — Hook for contact form submission state management.
 *
 * Provides:
 * - `submit(data)`: sends the contact form to the backend and tracks state
 * - `reset()`: clears all state back to initial values
 * - Reactive state: `loading`, `success`, `error`, `messageId`
 */

import { useState, useCallback } from 'react';
import type { ContactFormData } from '../types/contact';
import { sendContactMessage } from '../services/contactService';

interface UseContactState {
  loading: boolean;
  success: boolean;
  error: string | null;
  messageId: number | null;
}

const INITIAL_STATE: UseContactState = {
  loading: false,
  success: false,
  error: null,
  messageId: null,
};

export function useContact() {
  const [state, setState] = useState<UseContactState>(INITIAL_STATE);

  const submit = useCallback(async (data: ContactFormData) => {
    setState({ loading: true, success: false, error: null, messageId: null });

    try {
      const response = await sendContactMessage(data);
      setState({
        loading: false,
        success: true,
        error: null,
        messageId: response.messageId,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
      setState({
        loading: false,
        success: false,
        error: errorMessage,
        messageId: null,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    ...state,
    submit,
    reset,
  };
}
