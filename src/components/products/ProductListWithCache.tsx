import React from 'react';
import { useProductCache } from '../../hooks/useProductCache';

interface ProductListWithCacheProps {
  category_id?: number;
  store_id?: number;
  search?: string;
}

export const ProductListWithCache: React.FC<ProductListWithCacheProps> = ({
  category_id,
  store_id,
  search,
}) => {
  const {
    products,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    loadAll,
    refresh,
    progress,
  } = useProductCache({
    category_id,
    store_id,
    search,
    autoLoad: true,
    prefetchNext: true,
  });

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Erreur: {error.message}</p>
        <button
          onClick={refresh}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête avec statistiques */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h2 className="text-xl font-semibold">Produits</h2>
          <p className="text-sm text-gray-600">
            {totalCount} produits au total
          </p>
        </div>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          Actualiser
        </button>
      </div>

      {/* Barre de progression pour chargement complet */}
      {progress && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              Chargement de tous les produits...
            </span>
            <span className="text-sm text-blue-700">
              {progress.loaded} / {progress.total}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(progress.loaded / progress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Liste des produits */}
      {loading && !progress ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                {product.images && product.images.length > 0 && (
                  <img
                    src={product.images[0].image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded mb-3"
                  />
                )}
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-blue-600">
                    {product.base_price.toLocaleString()} FCFA
                  </span>
                  {product.compare_at_price && (
                    <span className="text-sm text-gray-500 line-through">
                      {product.compare_at_price.toLocaleString()} FCFA
                    </span>
                  )}
                </div>
                {product.stock > 0 ? (
                  <span className="text-sm text-green-600">En stock</span>
                ) : (
                  <span className="text-sm text-red-600">Rupture de stock</span>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <button
              onClick={prevPage}
              disabled={!hasPrevPage || loading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Précédent
            </button>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Page {currentPage + 1} sur {totalPages}
              </span>
              <button
                onClick={loadAll}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Charger tout
              </button>
            </div>

            <button
              onClick={nextPage}
              disabled={!hasNextPage || loading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductListWithCache;
