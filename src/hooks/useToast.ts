import { useState, useCallback, useRef, useEffect } from 'react';

export interface ToastState {
  message: string;
  visible: boolean;
  type: 'success' | 'error';
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    visible: false,
    type: 'success',
  });
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ message, visible: true, type });
      timerRef.current = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 2500);
    },
    [],
  );

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { toast, showToast, hideToast };
}
