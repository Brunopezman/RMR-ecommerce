import { useState, useCallback, useEffect } from 'react';
import { useContact } from '../../hooks/useContact';
import { CONTACT_AREAS, type ContactArea, type ContactFormData } from '../../types/contact';
import { navigate } from '../../services/router';
import { Header } from '../layout/Header';
import { useToast } from '../ui/Toast';

/* ------------------------------------------------------------------ */
/*  Constantes                                                         */
/* ------------------------------------------------------------------ */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  name?: string;
  email?: string;
  area?: string;
  subject?: string;
  message?: string;
}

const INITIAL_FORM: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  area: 'ventas',
  subject: '',
  message: '',
};

/* ------------------------------------------------------------------ */
/*  Componente                                                         */
/* ------------------------------------------------------------------ */

export function ContactPage() {
  const { loading, success, error, messageId, submit, reset } = useContact();
  const { showToast } = useToast();

  const [form, setForm] = useState<ContactFormData>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  /* ── Toast feedback ────────────────────────────────────────────── */

  useEffect(() => {
    if (success && messageId !== null) {
      showToast('Mensaje enviado con éxito', 'success');
    } else if (error) {
      showToast(error, 'error');
    }
  }, [success, messageId, error, showToast]);

  /* ── Field update with error clearing ──────────────────────────── */

  const updateField = useCallback(<K extends keyof ContactFormData>(
    field: K,
    value: ContactFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field in fieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [fieldErrors]);

  /* ── Validation ────────────────────────────────────────────────── */

  const validate = useCallback((): boolean => {
    const errors: FieldErrors = {};

    if (!form.name.trim() || form.name.trim().length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres.';
    }

    if (!form.email.trim()) {
      errors.email = 'El email es obligatorio.';
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      errors.email = 'Formato de email inválido.';
    }

    if (!form.subject.trim() || form.subject.trim().length < 3) {
      errors.subject = 'El asunto debe tener al menos 3 caracteres.';
    }

    if (!form.message.trim()) {
      errors.message = 'El mensaje es obligatorio.';
    } else if (form.message.trim().length < 10) {
      errors.message = 'El mensaje debe tener al menos 10 caracteres.';
    } else if (form.message.length > 2000) {
      errors.message = 'El mensaje no puede exceder los 2000 caracteres.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  /* ── Submit ─────────────────────────────────────────────────────── */

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await submit(form);
  }, [form, validate, submit]);

  /* ── Reset form (for "Enviar otro mensaje") ────────────────────── */

  const handleReset = useCallback(() => {
    setForm(INITIAL_FORM);
    setFieldErrors({});
    reset();
  }, [reset]);

  /* ── Header navigation ─────────────────────────────────────────── */

  const handleHeaderNavigate = useCallback((view: 'home' | 'shop') => {
    navigate(view === 'shop' ? '/shop' : '/');
  }, []);

  /* ================================================================ */
  /*  Pantalla de éxito                                                */
  /* ================================================================ */

  if (success && messageId !== null) {
    return (
      <div className="min-h-screen bg-white">
        <Header onNavigate={handleHeaderNavigate} />
        <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            {/* Check icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold font-display mb-2">
              ¡Mensaje enviado con éxito!
            </h2>
            <p className="text-gray-600 mb-1">
              Te vamos a responder a la brevedad al email ingresado.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Número de seguimiento: #{messageId}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/')}
                className="bg-black text-white hover:bg-coral-dark px-6 py-3 rounded-lg font-display uppercase font-bold text-sm transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
              >
                Volver al inicio
              </button>
              <button
                onClick={handleReset}
                className="bg-transparent text-gray-600 border border-gray-300 hover:bg-gray-100 px-6 py-3 rounded-lg font-display uppercase font-bold text-sm transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
              >
                Enviar otro mensaje
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ================================================================ */
  /*  Formulario                                                       */
  /* ================================================================ */

  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={handleHeaderNavigate} />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Header section ──────────────────────────────────────── */}
        <h1 className="text-3xl font-bold font-display mb-2">Contacto</h1>
        <p className="text-gray-600 mb-6">
          Estamos para ayudarte. Completá el formulario y te respondemos a la brevedad.
        </p>

        {/* ── Contact info grid ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-semibold text-gray-700">Email</p>
            <p className="text-sm text-gray-600">contacto@rockmerch.com.ar</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Teléfono</p>
            <p className="text-sm text-gray-600">+54 11 5555-1234</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Horarios</p>
            <p className="text-sm text-gray-600">Lun a Vie de 9:00 a 18:00</p>
          </div>
        </div>

        {/* ── Error banner ────────────────────────────────────────── */}
        {error && (
          <div
            className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        {/* ── Form ────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            {/* Nombre */}
            <div className="mb-4">
              <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="contact-name"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-coral ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                disabled={loading}
              />
              {fieldErrors.name && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="contact-email"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-coral ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                disabled={loading}
              />
              {fieldErrors.email && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Teléfono */}
            <div className="mb-4">
              <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                id="contact-phone"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral"
                value={form.phone ?? ''}
                onChange={(e) => updateField('phone', e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Área */}
            <div className="mb-4">
              <label htmlFor="contact-area" className="block text-sm font-medium text-gray-700 mb-1">
                Área <span className="text-red-500">*</span>
              </label>
              <select
                id="contact-area"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral bg-white"
                value={form.area}
                onChange={(e) => updateField('area', e.target.value as ContactArea)}
                disabled={loading}
              >
                {CONTACT_AREAS.map((area) => (
                  <option key={area.value} value={area.value}>
                    {area.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {CONTACT_AREAS.find((a) => a.value === form.area)?.description}
              </p>
            </div>
          </div>

          {/* Asunto */}
          <div className="mb-4">
            <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-1">
              Asunto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="contact-subject"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-coral ${fieldErrors.subject ? 'border-red-500' : 'border-gray-300'}`}
              value={form.subject}
              onChange={(e) => updateField('subject', e.target.value)}
              disabled={loading}
            />
            {fieldErrors.subject && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.subject}</p>
            )}
          </div>

          {/* Mensaje */}
          <div className="mb-6">
            <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">
              Mensaje <span className="text-red-500">*</span>
            </label>
            <textarea
              id="contact-message"
              rows={5}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-coral resize-vertical ${fieldErrors.message ? 'border-red-500' : 'border-gray-300'}`}
              value={form.message}
              onChange={(e) => updateField('message', e.target.value)}
              disabled={loading}
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-1">
              {fieldErrors.message ? (
                <p className="text-red-600 text-xs">{fieldErrors.message}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-gray-400">{form.message.length}/2000</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-black text-white hover:bg-coral-dark px-8 py-3 rounded-lg font-display uppercase font-bold text-sm transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
            >
              {loading ? 'Enviando...' : 'Enviar mensaje'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              disabled={loading}
              className="w-full sm:w-auto bg-transparent text-gray-600 border border-gray-300 hover:bg-gray-100 px-8 py-3 rounded-lg font-display uppercase font-bold text-sm transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
            >
              Cancelar
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
