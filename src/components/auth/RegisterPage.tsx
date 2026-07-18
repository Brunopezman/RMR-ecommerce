import { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { navigate } from '../../services/router';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RegisterFormData {
  name: string;
  apellido: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  codigoPostal: string;
  sexo: string;
  telefono: string;
}

interface FieldErrors {
  name?: string;
  apellido?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const INITIAL_REGISTER_DATA: RegisterFormData = {
  name: '',
  apellido: '',
  email: '',
  password: '',
  confirmPassword: '',
  address: '',
  codigoPostal: '',
  sexo: '',
  telefono: '',
};

export function RegisterPage() {
  const { register } = useAuth();

  const [formData, setFormData] = useState<RegisterFormData>(INITIAL_REGISTER_DATA);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const updateField = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (
      field === 'email' ||
      field === 'name' ||
      field === 'apellido' ||
      field === 'password' ||
      field === 'confirmPassword'
    ) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = useCallback((): boolean => {
    const errors: FieldErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio.';
    }

    if (!formData.apellido.trim()) {
      errors.apellido = 'El apellido es obligatorio.';
    }

    if (!formData.email.trim()) {
      errors.email = 'El email es obligatorio.';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      errors.email = 'Formato de email inválido.';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria.';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Debe confirmar la contraseña.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      await register(formData.email.trim(), formData.password, {
        name: formData.name.trim(),
        apellido: formData.apellido.trim() || undefined,
        address: formData.address.trim() || undefined,
        codigoPostal: formData.codigoPostal.trim() || undefined,
        sexo: formData.sexo || undefined,
        telefono: formData.telefono.trim() || undefined,
      });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-lg font-semibold font-display">Crear Cuenta</h1>
        </div>

        <div className="p-4">
          {error && (
            <div
              className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-3"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <form id="registerForm" onSubmit={handleSubmit} noValidate>
            {/* Nombre */}
            <div className="mb-3">
              <label htmlFor="regName" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-coral ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                id="regName"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                disabled={loading}
              />
              {fieldErrors.name && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.name}</p>
              )}
            </div>

            {/* Apellido */}
            <div className="mb-3">
              <label htmlFor="regApellido" className="block text-sm font-medium text-gray-700 mb-1">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-coral ${fieldErrors.apellido ? 'border-red-500' : 'border-gray-300'}`}
                id="regApellido"
                value={formData.apellido}
                onChange={(e) => updateField('apellido', e.target.value)}
                disabled={loading}
              />
              {fieldErrors.apellido && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.apellido}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-3">
              <label htmlFor="regEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-coral ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                id="regEmail"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                disabled={loading}
              />
              {fieldErrors.email && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Contraseña */}
            <div className="mb-3">
              <label htmlFor="regPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-coral ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                id="regPassword"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                disabled={loading}
              />
              {fieldErrors.password && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div className="mb-3">
              <label htmlFor="regConfirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-coral ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                id="regConfirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                disabled={loading}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Dirección */}
            <div className="mb-3">
              <label htmlFor="regAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral"
                id="regAddress"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Código Postal */}
            <div className="mb-3">
              <label htmlFor="regCodigoPostal" className="block text-sm font-medium text-gray-700 mb-1">
                Código Postal
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral"
                id="regCodigoPostal"
                value={formData.codigoPostal}
                onChange={(e) => updateField('codigoPostal', e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Sexo */}
            <div className="mb-3">
              <label htmlFor="regSexo" className="block text-sm font-medium text-gray-700 mb-1">
                Sexo
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral bg-white"
                id="regSexo"
                value={formData.sexo}
                onChange={(e) => updateField('sexo', e.target.value)}
                disabled={loading}
              >
                <option value="">Seleccionar...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
                <option value="Prefiero no decirlo">Prefiero no decirlo</option>
              </select>
            </div>

            {/* Teléfono */}
            <div className="mb-4">
              <label htmlFor="regTelefono" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral"
                id="regTelefono"
                value={formData.telefono}
                onChange={(e) => updateField('telefono', e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                className="w-full bg-black text-white border-none py-3 px-7 font-display uppercase font-bold text-sm transition-colors duration-300 hover:bg-coral-dark cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
                disabled={loading}
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>
              <button
                type="button"
                className="w-full bg-transparent text-gray-600 border border-gray-300 py-3 px-7 font-display uppercase font-bold text-sm transition-colors duration-300 hover:bg-gray-100 cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
                onClick={() => navigate('/')}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}