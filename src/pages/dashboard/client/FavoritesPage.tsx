import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2, ShoppingCart, Package } from 'lucide-react'
import { useFavorites } from '../../../hooks/useFavorites'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend.buymore.ml'

// Fonction utilitaire pour construire l'URL de l'image
const getImageUrl = (media?: Array<{ image_url?: string; file?: string; is_primary?: boolean }>): string | null => {
  if (!media || media.length === 0) return null
  const primaryImage = media.find(m => m.is_primary) || media[0]
  let url = primaryImage?.image_url || primaryImage?.file
  if (!url) return null
  // Convertir http:// en https:// pour éviter le blocage mixed content
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://')
  }
  if (url.startsWith('https://')) return url
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

const FavoritesPage: React.FC = () => {
  const { favorites, isLoading, removeFavorite } = useFavorites()

  const handleRemove = async (favoriteId: number) => {
    if (confirm('Êtes-vous sûr de vouloir retirer ce produit de vos favoris ?')) {
      await removeFavorite(favoriteId)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="text-red-500" />
          Mes favoris
        </h1>
        <p className="text-gray-600 mt-1">
          {favorites.length} {favorites.length > 1 ? 'produits' : 'produit'} dans votre liste
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Heart size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun favori</h3>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas encore ajouté de produits à vos favoris
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Découvrir des produits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
            >
              <Link to={`/products/${favorite.product.slug || favorite.product.id}`}>
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {getImageUrl(favorite.product.media) ? (
                    <img
                      src={getImageUrl(favorite.product.media)!}
                      alt={favorite.product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={48} className="text-gray-400" />
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <Link to={`/products/${favorite.product.slug || favorite.product.id}`}>
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-green-600">
                    {favorite.product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 mb-2">{favorite.product.store?.name}</p>
                <p className="text-lg font-bold text-green-600 mb-3">
                  {parseFloat(favorite.product.base_price).toLocaleString()} FCFA
                </p>

                <div className="flex gap-2">
                  <Link
                    to={`/products/${favorite.product.slug || favorite.product.id}`}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm"
                  >
                    <ShoppingCart size={16} />
                    Acheter
                  </Link>
                  <button
                    onClick={() => handleRemove(favorite.id)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    title="Retirer des favoris"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FavoritesPage
