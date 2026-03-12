import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag, Package, CreditCard, Clock, Calendar, CheckCircle, Heart, MapPin,
  Bell, ArrowRight, Star, Truck, Eye, Trash2, Plus, Download, TrendingDown, Award,
  Zap, Percent, Gift, ShoppingCart, Sparkles, Tag, ChevronRight
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useOrders } from '../../../hooks/useOrders'
import { useFavorites } from '../../../hooks/useFavorites'
import { useProducts } from '../../../hooks/useProducts'
import { flashSalesService } from '../../../lib/api/flashSalesService'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://buymore-api-production.up.railway.app'

// Fonction utilitaire pour construire l'URL de l'image
const getImageUrl = (media?: Array<{ image_url?: string; file?: string; is_primary?: boolean }>): string | null => {
  if (!media || media.length === 0) return null
  const primaryImage = media.find(m => m.is_primary) || media[0]
  let url = primaryImage?.image_url || primaryImage?.file
  if (!url) return null
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
    <div className="p-3 rounded-lg" style={{ background: color }}>{icon}</div>
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
  const { products } = useProducts({ page: 1, page_size: 20, light: true })
  const [tab, setTab] = useState<'overview' | 'wishlist'>('overview')
  const [flashSales, setFlashSales] = useState<any[]>([])

  const firstName = user?.first_name || user?.username || 'Utilisateur'
  
  // Charger les flash sales actives
  useEffect(() => {
    const loadFlashSales = async () => {
      try {
        const response = await flashSalesService.getActiveFlashSales()
        if (response.data) {
          setFlashSales(response.data)
        }
      } catch (error) {
        console.error('Error loading flash sales:', error)
      }
    }
    loadFlashSales()
  }, [])
  
  // Calculer les statistiques
  const totalOrders = orders?.length || 0
  const pendingOrders = orders?.filter(o => o.status === 'pending' || o.status === 'processing').length || 0
  const deliveredOrders = orders?.filter(o => o.status === 'delivered').length || 0
  const totalSpent = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0
  
  // Calculer les économies réalisées (produits achetés en promo)
  const totalSavings = orders?.reduce((sum, order) => {
    return sum + (order.items?.reduce((itemSum: number, item: any) => {
      const basePrice = parseFloat(item.product?.base_price || 0)
      const promoPrice = parseFloat(item.product?.promo_price || 0)
      if (promoPrice > 0 && promoPrice < basePrice) {
        return itemSum + ((basePrice - promoPrice) * item.quantity)
      }
      return itemSum
    }, 0) || 0)
  }, 0) || 0
  
  // Récupérer les 3 dernières commandes
  const recentOrders = orders?.slice(0, 3) || []
  
  // Commandes en cours de livraison (vraies données)
  const activeDeliveries = orders?.filter(o => o.status === 'processing' || o.status === 'shipped').slice(0, 2) || []
  
  // Produits en promo (vraies données)
  const promoProducts = products?.filter((p: any) => {
    const basePrice = parseFloat(p.base_price || 0)
    const promoPrice = parseFloat(p.promo_price || 0)
    return promoPrice > 0 && promoPrice < basePrice
  }).slice(0, 4) || []
  
  // Produits recommandés (basés sur les catégories des commandes précédentes ou aléatoires)
  const recommendedProducts = products?.slice(0, 4) || []
  
  // Produits des flash sales
  const flashSaleProducts = flashSales.length > 0 
    ? flashSales[0]?.products?.slice(0, 4).map((fp: any) => fp.product).filter(Boolean) || []
    : []

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
            {/* Livraisons en cours (vraies données) */}
            {activeDeliveries.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck size={20} className="text-green-600" />
                  Livraisons en cours
                </h2>
                <div className="space-y-4">
                  {activeDeliveries.map((order: any) => {
                    const progress = order.status === 'shipped' ? 75 : 25
                    const statusText = order.status === 'shipped' ? 'En route' : 'Préparation'
                    const statusColor = order.status === 'shipped' ? 'text-green-600' : 'text-blue-600'
                    const barColor = order.status === 'shipped' ? 'bg-green-600' : 'bg-blue-600'
                    return (
                      <div key={order.id}>
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium text-sm">Commande #{order.id}</p>
                          <p className={`text-xs font-medium ${statusColor}`}>{statusText}</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          <span>Préparation</span>
                          <span>En transit</span>
                          <span>Livré</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Flash Sales - Offres limitées */}
            {flashSaleProducts.length > 0 && (
              <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-lg p-5 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <Zap size={18} className="text-yellow-300" />
                    Ventes Flash
                  </h3>
                  <Link to="/" className="text-xs bg-white/20 px-2 py-1 rounded-full hover:bg-white/30 transition-colors flex items-center gap-1">
                    Voir tout <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {flashSaleProducts.slice(0, 2).map((product: any) => {
                    const basePrice = parseFloat(product.base_price || 0)
                    const promoPrice = parseFloat(product.promo_price || 0)
                    const discount = promoPrice > 0 && promoPrice < basePrice 
                      ? Math.round(((basePrice - promoPrice) / basePrice) * 100) 
                      : 0
                    return (
                      <Link key={product.id} to={`/products/${product.slug || product.id}`} className="bg-white/10 rounded-lg p-2 hover:bg-white/20 transition-colors">
                        <div className="h-16 bg-white/20 rounded mb-2 overflow-hidden">
                          {getImageUrl(product.media) ? (
                            <img src={getImageUrl(product.media)!} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package size={20} /></div>
                          )}
                        </div>
                        <p className="text-xs font-medium truncate">{product.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {discount > 0 && <span className="text-[10px] bg-yellow-400 text-black px-1 rounded font-bold">-{discount}%</span>}
                          <span className="text-xs font-bold">{(promoPrice || basePrice).toLocaleString()} F</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Produits en promo */}
            {promoProducts.length > 0 && (
              <div className="bg-white rounded-lg shadow p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Tag size={18} className="text-red-500" />
                    Bonnes affaires
                  </h3>
                  <Link to="/products?promo=true" className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1">
                    Voir plus <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="space-y-2">
                  {promoProducts.slice(0, 3).map((product: any) => {
                    const basePrice = parseFloat(product.base_price || 0)
                    const promoPrice = parseFloat(product.promo_price || 0)
                    const discount = Math.round(((basePrice - promoPrice) / basePrice) * 100)
                    return (
                      <Link key={product.id} to={`/products/${product.slug || product.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {getImageUrl(product.media) ? (
                            <img src={getImageUrl(product.media)!} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-gray-400" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 font-bold text-sm">{promoPrice.toLocaleString()} F</span>
                            <span className="text-gray-400 text-xs line-through">{basePrice.toLocaleString()} F</span>
                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">-{discount}%</span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Économies réalisées */}
            {totalSavings > 0 && (
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg p-5 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Vous avez économisé</p>
                    <p className="text-2xl font-bold">{totalSavings.toLocaleString()} FCFA</p>
                  </div>
                </div>
                <p className="text-xs opacity-80">Grâce aux promotions BuyMore ! 🎉</p>
              </div>
            )}

            {/* Actions rapides */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-green-600" />
                Actions rapides
              </h3>
              <div className="space-y-2">
                <Link to="/client/addresses" className="w-full text-left text-sm font-medium text-green-700 hover:text-green-800 flex items-center gap-2 py-2">
                  <MapPin size={16} /> Gérer adresses
                </Link>
                <Link to="/client/settings" className="w-full text-left text-sm font-medium text-green-700 hover:text-green-800 flex items-center gap-2 py-2">
                  <Bell size={16} /> Préférences
                </Link>
                <Link to="/client/orders" className="w-full text-left text-sm font-medium text-green-700 hover:text-green-800 flex items-center gap-2 py-2">
                  <ShoppingBag size={16} /> Mes commandes
                </Link>
                <Link to="/" className="w-full text-left text-sm font-medium text-green-700 hover:text-green-800 flex items-center gap-2 py-2">
                  <ShoppingCart size={16} /> Continuer mes achats
                </Link>
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
