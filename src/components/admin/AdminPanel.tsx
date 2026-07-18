import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchAllUsers } from '../../services/userService';
import { fetchProducts, updateProductStock } from '../../services/api';
import { useToast } from '../ui/Toast';
import type { User } from '../../types/user';
import type { Product } from '../../types/product';

export function AdminPanel() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stock management state
  const [products, setProducts] = useState<Product[]>([]);
  const [newStockValues, setNewStockValues] = useState<Record<number, number>>({});
  const [savingProducts, setSavingProducts] = useState<Set<number>>(new Set());
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError(null);

    fetchAllUsers(token)
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  // Load products for stock management
  useEffect(() => {
    setProductsLoading(true);
    fetchProducts()
      .then((data) => {
        setProducts(data);
        setProductsLoading(false);
      })
      .catch((err: Error) => {
        showToast(err.message, 'error');
        setProductsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStockChange = (productId: number, value: string) => {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setNewStockValues((prev) => ({ ...prev, [productId]: parsed }));
    }
  };

  const handleUpdateStock = async (product: Product) => {
    const newStock = newStockValues[product.id];
    if (newStock === undefined || newStock < 0 || newStock === product.stock) return;

    setSavingProducts((prev) => new Set(prev).add(product.id));
    try {
      const updated = await updateProductStock(product.id, newStock);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: updated.stock ?? newStock } : p)),
      );
      setNewStockValues((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
      showToast(`Stock de "${product.nombre || product.name || product.id}" actualizado`, 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar stock';
      showToast(message, 'error');
    } finally {
      setSavingProducts((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-500 text-lg">Cargando usuarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold mb-6">Panel de Administración</h2>

      {/* ── Users table ── */}
      <div className="overflow-x-auto mb-12">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rol</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Registro</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600">{user.id}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{user.email}</td>
                <td className="px-4 py-3 text-sm text-gray-800">
                  {user.name} {user.apellido || ''}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {user.role || 'user'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('es-AR')
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-gray-400 text-sm mt-4">
          Total de usuarios: {users.length}
        </p>
      </div>

      {/* ── Stock management section ── */}
      <h3 className="text-xl font-bold mb-4">Gestión de Stock</h3>
      {productsLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="text-gray-500 text-lg">Cargando productos...</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Producto</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stock Actual</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nuevo Stock</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Acción</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const currentValue = newStockValues[product.id];
                const hasChanged =
                  currentValue !== undefined &&
                  currentValue >= 0 &&
                  currentValue !== product.stock;
                const isSaving = savingProducts.has(product.id);

                return (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{product.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                      {product.nombre || product.name || `Producto #${product.id}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        {product.stock ?? '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <input
                        type="number"
                        min={0}
                        value={currentValue ?? product.stock ?? ''}
                        onChange={(e) => handleStockChange(product.id, e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        disabled={isSaving}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleUpdateStock(product)}
                        disabled={!hasChanged || isSaving}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                          !hasChanged || isSaving
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                        }`}
                      >
                        {isSaving ? 'Guardando...' : 'Actualizar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-gray-400 text-sm mt-4">
            Total de productos: {products.length}
          </p>
        </div>
      )}
    </div>
  );
}
