import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Search, ArrowLeft, Package, ShoppingBag } from 'lucide-react'

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 leading-none animate-pulse">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-bounce">
              <Package className="w-24 h-24 text-indigo-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            Oups ! Page introuvable
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            La page que vous recherchez semble avoir disparu. Elle a peut-être été déplacée ou n'existe plus.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <Home size={20} />
            Retour à l'accueil
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl font-semibold shadow-md hover:shadow-lg border-2 border-gray-200 transform hover:scale-105 transition-all"
          >
            <ArrowLeft size={20} />
            Page précédente
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Liens rapides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/products')}
              className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-2xl transition-all transform hover:scale-105"
            >
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              <span className="font-semibold text-blue-900">Produits</span>
            </button>
            <button
              onClick={() => navigate('/deals')}
              className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-2xl transition-all transform hover:scale-105"
            >
              <Package className="w-8 h-8 text-green-600" />
              <span className="font-semibold text-green-900">Promotions</span>
            </button>
            <button
              onClick={() => navigate('/products')}
              className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-2xl transition-all transform hover:scale-105"
            >
              <Search className="w-8 h-8 text-purple-600" />
              <span className="font-semibold text-purple-900">Rechercher</span>
            </button>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-12 text-sm text-gray-500">
          <p>
            Besoin d'aide ? Contactez notre{' '}
            <a href="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium underline">
              service client
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
