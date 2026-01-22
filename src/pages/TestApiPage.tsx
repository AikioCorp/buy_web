/**
 * Page de test pour vérifier la connexion à l'API Django REST
 */

import { useEffect, useState } from 'react';
import { useProducts, useCategories } from '../hooks';
import { useAuthStore } from '../stores';

export function TestApiPage() {
  const { products, isLoading: productsLoading, error: productsError } = useProducts({ page_size: 5 });
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { user, isAuthenticated } = useAuthStore();
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    // Tester la connexion à l'API
    const checkApi = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/`);
        if (response.ok) {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      } catch (error) {
        setApiStatus('offline');
      }
    };

    checkApi();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">🔌 Test de connexion à l'API</h1>

      {/* Statut de l'API */}
      <div className="mb-8 p-4 rounded-lg bg-gray-100">
        <h2 className="text-xl font-semibold mb-2">Statut de l'API</h2>
        <p className="mb-2">
          <strong>URL :</strong> {import.meta.env.VITE_API_BASE_URL || 'Non configurée'}
        </p>
        <p>
          <strong>Statut :</strong>{' '}
          {apiStatus === 'checking' && <span className="text-yellow-600">Vérification...</span>}
          {apiStatus === 'online' && <span className="text-green-600">✅ En ligne</span>}
          {apiStatus === 'offline' && <span className="text-red-600">❌ Hors ligne</span>}
        </p>
      </div>

      {/* Authentification */}
      <div className="mb-8 p-4 rounded-lg bg-gray-100">
        <h2 className="text-xl font-semibold mb-2">Authentification</h2>
        {isAuthenticated ? (
          <div className="text-green-600">
            ✅ Connecté en tant que : {user?.username || user?.email}
          </div>
        ) : (
          <div className="text-gray-600">
            ℹ️ Non connecté
          </div>
        )}
      </div>

      {/* Catégories */}
      <div className="mb-8 p-4 rounded-lg bg-gray-100">
        <h2 className="text-xl font-semibold mb-2">Catégories</h2>
        {categoriesLoading && <p>Chargement...</p>}
        {categoriesError && <p className="text-red-600">❌ Erreur : {categoriesError}</p>}
        {categories && categories.length > 0 && (
          <div className="text-green-600">
            ✅ {categories.length} catégories chargées
            <ul className="mt-2 ml-4 list-disc">
              {categories.slice(0, 5).map(cat => (
                <li key={cat.id}>{cat.name}</li>
              ))}
            </ul>
          </div>
        )}
        {categories && categories.length === 0 && (
          <p className="text-yellow-600">⚠️ Aucune catégorie trouvée</p>
        )}
      </div>

      {/* Produits */}
      <div className="mb-8 p-4 rounded-lg bg-gray-100">
        <h2 className="text-xl font-semibold mb-2">Produits</h2>
        {productsLoading && <p>Chargement...</p>}
        {productsError && <p className="text-red-600">❌ Erreur : {productsError}</p>}
        {products && products.length > 0 && (
          <div className="text-green-600">
            ✅ {products.length} produits chargés
            <ul className="mt-2 ml-4 list-disc">
              {products.map(product => (
                <li key={product.id}>
                  {product.name} - {product.base_price} FCFA
                </li>
              ))}
            </ul>
          </div>
        )}
        {products && products.length === 0 && (
          <p className="text-yellow-600">⚠️ Aucun produit trouvé</p>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 rounded-lg bg-blue-50 border border-blue-200">
        <h3 className="font-semibold mb-2">📝 Instructions</h3>
        <ol className="list-decimal ml-4 space-y-1">
          <li>Vérifiez que le backend Django est démarré</li>
          <li>Vérifiez que VITE_API_BASE_URL est configuré dans .env</li>
          <li>Si tout est vert, l'API fonctionne correctement !</li>
          <li>Vous pouvez maintenant migrer les composants existants</li>
        </ol>
      </div>
    </div>
  );
}
