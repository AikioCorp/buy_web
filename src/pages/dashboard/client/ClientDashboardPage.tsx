import React, { useState } from 'react'
import {
  ShoppingBag, Package, CreditCard, Clock, Calendar, CheckCircle, Heart, MapPin,
  Bell, ArrowRight, Star, Truck, Eye, Trash2, Plus, Download, TrendingDown, Award
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useOrders } from '../../../hooks/useOrders'
import { useFavorites } from '../../../hooks/useFavorites'
import { useProducts } from '../../../hooks/useProducts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://buymore-api-production.up.railway.app'

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

const StatCard = ({ title, value, icon, color, trend }: { title: string, value: string, icon: React.ReactNode, color: string, trend?: string }) => (
  <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 flex items-center justify-between">
    <div>
      <p className="text-gray-600 text-sm font-medium">{title}</p>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
      {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
    </div>
    <div className={`${color} p-3 rounded-lg`}>{icon}</div>
  </div>
)

const OrderCard = ({ 
  orderId, shopName, total, date, status 
}: { 
  orderId: string, 
  shopName: string, 
  total: string, 
  date: string,
  status: 'pending' | 'delivered' | 'processing' | 'cancelled'
}) => {
  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-800",
    delivered: "bg-green-100 text-green-800",
    processing: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  }

  const statusIcons = {
    pending: <Clock size={16} />,
    delivered: <CheckCircle size={16} />,
    processing: <Package size={16} />,
    cancelled: <Package size={16} />,
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">Commande #{orderId}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusClasses[status]}`}>
          {statusIcons[status]}
          <span>
            {status === 'pending' && 'En attente'}
            {status === 'processing' && 'En traitement'}
            {status === 'delivered' && 'Livrée'}
            {status === 'cancelled' && 'Annulée'}
          </span>
        </span>
      </div>
      <p className="font-medium">{shopName}</p>
      <div className="flex justify-between items-center mt-2">
        <p className="text-green-600 font-bold">{total}</p>
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <Calendar size={14} /> {date}
        </p>
      </div>
    </div>
  )
}

const ProductSuggestion = ({ 
  name, price, image 
}: { 
  name: string, 
  price: string, 
  image: string 
}) => (
  <div className="group">
    <div className="h-36 bg-gray-100 rounded-lg mb-2 overflow-hidden group-hover:shadow-md transition-all">
      {image ? (
        <img src={image} alt={name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Package size={24} className="text-gray-400" />
        </div>
      )}
    </div>
    <h4 className="font-medium text-sm truncate">{name}</h4>
    <p className="text-green-600 font-bold">{price}</p>
  </div>
)

const ClientDashboardPage: React.FC = () => {
  const { user } = useAuthStore()
  const { orders, isLoading: ordersLoading } = useOrders()
  const { favorites, isLoading: favoritesLoading } = useFavorites()
  const { products } = useProducts({ page: 1, page_size: 8, light: true })
  const [tab, setTab] = useState<'overview' | 'wishlist'>('overview')

  const firstName = user?.first_name || user?.username || 'Utilisateur'
  
  // Calculer les statistiques
  const totalOrders = orders?.length || 0
  const pendingOrders = orders?.filter(o => o.status === 'pending' || o.status === 'processing').length || 0
  const totalSpent = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0
  
  // Récupérer les 3 dernières commandes
  const recentOrders = orders?.slice(0, 3) || []
  
  // Récupérer 4 produits recommandés
  const recommendedProducts = products?.slice(0, 4) || []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bonjour, {firstName}! 👋</h1>
        <p className="text-gray-600 mt-1">Bienvenue sur votre tableau de bord client BuyMore</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Commandes totales"
          value={ordersLoading ? '...' : totalOrders.toString()}
          icon={<ShoppingBag size={24} className="text-white" />}
          color="bg-blue-500"
          trend="Tous les temps"
        />
        <StatCard
          title="En cours"
          value={ordersLoading ? '...' : pendingOrders.toString()}
          icon={<Truck size={24} className="text-white" />}
          color="bg-orange-500"
          trend="À livrer bientôt"
        />
        <StatCard
          title="Dépenses totales"
          value={ordersLoading ? '...' : `${totalSpent.toLocaleString()} FCFA`}
          icon={<CreditCard size={24} className="text-white" />}
          color="bg-green-500"
          trend="Cette année"
        />
        <StatCard
          title="Favoris"
          value={favoritesLoading ? '...' : (favorites?.length || 0).toString()}
          icon={<Heart size={24} className="text-white" />}
          color="bg-purple-500"
          trend="Produits sauvegardés"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setTab('overview')}
          className={`px-4 py-3 font-medium transition-colors ${
            tab === 'overview'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Vue d'ensemble
        </button>
        <button
          onClick={() => setTab('wishlist')}
          className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
            tab === 'wishlist'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Heart size={18} />
          Liste de souhaits ({favoritesLoading ? '...' : favorites?.length || 0})
        </button>
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Commandes récentes</h2>
                <a href="/client/orders" className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center gap-1">
                  Voir tous <ArrowRight size={16} />
                </a>
              </div>
              <div className="space-y-3">
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucune commande récente
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      orderId={order.id.toString()}
                      shopName={order.items?.[0]?.product?.store?.name || 'Boutique'}
                      total={`${parseFloat(order.total_amount).toLocaleString()} FCFA`}
                      date={new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      status={order.status as any}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Recommended Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Recommandé pour vous</h2>
                <span className="text-xs text-gray-500">Basé sur votre historique</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recommendedProducts.length === 0 ? (
                  <div className="col-span-4 text-center py-8 text-gray-500">
                    Aucun produit recommandé
                  </div>
                ) : (
                  recommendedProducts.map((product) => (
                    <ProductSuggestion
                      key={product.id}
                      name={product.name}
                      price={`${parseFloat(product.base_price).toLocaleString()} FCFA`}
                      image={getImageUrl(product.media || (product as any).images) || ''}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Delivery Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Statut de livraison</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-sm">Commande #2433</p>
                    <p className="text-xs text-green-600 font-medium">En route</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Préparation</span>
                    <span>En transit</span>
                    <span>Livré</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-sm">Commande #2422</p>
                    <p className="text-xs text-blue-600 font-medium">Préparation</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Préparation</span>
                    <span>En transit</span>
                    <span>Livré</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Favorite Shops */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Boutiques favorites</h2>
              <div className="space-y-3">
                {[
                  { name: 'Électronique Plus', abbr: 'EP', rating: 4.8 },
                  { name: 'Mode Bamako', abbr: 'MB', rating: 4.9 },
                  { name: 'Tout pour la Maison', abbr: 'TM', rating: 4.5 }
                ].map((shop, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
                        {shop.abbr}
                      </div>
                      <p className="font-medium text-sm">{shop.name}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{shop.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <h3 className="font-bold text-gray-900 mb-3">Actions rapides</h3>
              <div className="space-y-2">
                <a href="/client/addresses" className="w-full text-left text-sm font-medium text-green-700 hover:text-green-800 flex items-center gap-2 py-2">
                  <MapPin size={16} /> Gérer adresses
                </a>
                <a href="/client/settings" className="w-full text-left text-sm font-medium text-green-700 hover:text-green-800 flex items-center gap-2 py-2">
                  <Bell size={16} /> Préférences
                </a>
                <a href="/client/orders" className="w-full text-left text-sm font-medium text-green-700 hover:text-green-800 flex items-center gap-2 py-2">
                  <Download size={16} /> Mes commandes
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wishlist Tab */}
      {tab === 'wishlist' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Ma liste de souhaits</h2>
            <p className="text-sm text-gray-600">Gardez vos articles préférés pour plus tard</p>
          </div>

          {favoritesLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement...</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun favori</h3>
              <p className="text-gray-600">Vous n'avez pas encore ajouté de produits à vos favoris</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {favorites.slice(0, 8).map((favorite) => (
                <div key={favorite.id} className="group bg-gray-50 rounded-lg p-4 hover:shadow transition-all">
                  <div className="h-32 bg-gray-200 rounded mb-3 flex items-center justify-center overflow-hidden">
                    {getImageUrl(favorite.product.media || (favorite.product as any).images) ? (
                      <img 
                        src={getImageUrl(favorite.product.media || (favorite.product as any).images)!} 
                        alt={favorite.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={32} className="text-gray-400" />
                    )}
                  </div>
                  <h4 className="font-medium text-sm truncate">{favorite.product.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{favorite.product.store?.name || 'Boutique'}</p>
                  <p className="text-green-600 font-bold text-sm mt-2">
                    {parseFloat(favorite.product.base_price).toLocaleString()} FCFA
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors text-xs">
                      <Eye size={16} className="mx-auto" />
                    </button>
                    <button className="flex-1 p-1 text-red-600 hover:bg-red-50 rounded transition-colors text-xs">
                      <Trash2 size={16} className="mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ClientDashboardPage
