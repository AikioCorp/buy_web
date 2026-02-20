import React, { useState, useEffect } from 'react'
import {
  Search, ShoppingBag, Eye, X, Truck, CheckCircle, XCircle, Clock, Package,
  ArrowRightLeft, Store, AlertTriangle, Loader2, RefreshCw, Phone, MapPin,
  CreditCard, Edit
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ordersService, Order, OrderStatus } from '../../../lib/api/ordersService'
import { shopsService } from '../../../lib/api/shopsService'
import { useToast } from '../../../components/Toast'
import { usePermissions } from '../../../hooks/usePermissions'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://buymore-api-production.up.railway.app'

interface Shop {
  id: number
  name: string
  is_active: boolean
}

// Cache pour les slugs des produits
const productSlugCache = new Map<number, string | null>()

const fetchProductSlug = async (productId: number): Promise<string | null> => {
  if (productSlugCache.has(productId)) return productSlugCache.get(productId)!
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`)
    if (!response.ok) return null
    const result = await response.json()
    const slug = result.data?.slug || null
    productSlugCache.set(productId, slug)
    return slug
  } catch {
    return null
  }
}

const getImageUrl = (item: any): string | null => {
  if (!item) return null;

  // 1. Try direct product_image field (often used in OrderItem responses)
  if (item.product_image) {
    const url = item.product_image;
    if (url.startsWith('http://')) return url.replace('http://', 'https://');
    if (url.startsWith('https://')) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  // 2. Try nested product.media or product.images
  const product = item.product || item;
  const mediaArray = product?.media || product?.images || [];

  if (Array.isArray(mediaArray) && mediaArray.length > 0) {
    const primaryImage = mediaArray.find((m: any) => m.is_primary) || mediaArray[0];
    let url = primaryImage?.image_url || primaryImage?.file || primaryImage?.image;

    if (url) {
      if (typeof url === 'string') {
        if (url.startsWith('http://')) return url.replace('http://', 'https://');
        if (url.startsWith('https://')) return url;
        return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
      }
    }
  }

  return null;
}

const SuperAdminOrdersPage: React.FC = () => {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const {
    canViewOrders,
    canManageOrders,
    canCancelOrders,
    isSuperAdmin
  } = usePermissions()
  const [orders, setOrders] = useState<Order[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('')

  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [orderToUpdate, setOrderToUpdate] = useState<Order | null>(null)
  const [orderToTransfer, setOrderToTransfer] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending')
  const [statusNote, setStatusNote] = useState('')
  const [transferShopId, setTransferShopId] = useState<number | null>(null)
  const [transferReason, setTransferReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Filtres avancés
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null)

  const pageSize = 20

  const loadShops = async () => {
    try {
      const response = await shopsService.getAllShops()
      if (response.data) {
        const shopsList = Array.isArray(response.data) ? response.data : response.data.results || []
        setShops(shopsList)
      }
    } catch (err) {
      console.error('Erreur chargement boutiques:', err)
    }
  }

  useEffect(() => {
    loadOrders()
    loadShops()
  }, [])

  useEffect(() => {
    loadOrders()
  }, [currentPage, searchQuery, selectedStatus, selectedShopId])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await ordersService.getAllOrdersAdmin({
        page: currentPage,
        status: selectedStatus || undefined,
        search: searchQuery || undefined,
        store_id: selectedShopId || undefined
      })

      console.log('Orders response:', response)
      console.log('Orders response.data:', response.data)

      if (response.data) {
        // Handle nested success wrapper: {success: true, data: {...}}
        const responseData = response.data as any
        console.log('Full response structure:', JSON.stringify(responseData, null, 2))

        // Check for nested data structure: {success: true, data: {results: [...], count: N}}
        let actualData = responseData
        if (responseData.success && responseData.data) {
          actualData = responseData.data
        }

        if (Array.isArray(actualData)) {
          console.log('Orders array:', actualData.length)
          setOrders(actualData)
          setTotalCount(actualData.length)
        } else if (actualData.results && Array.isArray(actualData.results)) {
          console.log('Orders results:', actualData.results.length, 'total:', actualData.count)
          setOrders(actualData.results)
          setTotalCount(actualData.count || actualData.results.length)
        } else if (actualData.orders && Array.isArray(actualData.orders)) {
          console.log('Orders from orders key:', actualData.orders.length)
          setOrders(actualData.orders)
          setTotalCount(actualData.total || actualData.orders.length)
        } else {
          console.log('No orders found, data structure:', actualData)
          // Try to find orders in any array property
          const possibleArrays = Object.values(actualData).filter(v => Array.isArray(v))
          if (possibleArrays.length > 0 && (possibleArrays[0] as any[]).length > 0) {
            console.log('Found orders in alternative array:', (possibleArrays[0] as any[]).length)
            setOrders(possibleArrays[0] as Order[])
            setTotalCount((possibleArrays[0] as any[]).length)
          } else {
            setOrders([])
            setTotalCount(0)
          }
        }
      }
    } catch (err: any) {
      console.error('Erreur API:', err)
      setError(err.message || 'Erreur lors du chargement des commandes')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadOrders()
  }

  const handleViewOrder = (order: Order) => {
    setViewingOrder(order)
    setIsViewModalOpen(true)
  }

  const handleStatusClick = (order: Order) => {
    setOrderToUpdate(order)
    setNewStatus(order.status)
    setIsStatusModalOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!orderToUpdate) return

    try {
      setActionLoading(true)
      await ordersService.updateOrderStatus(orderToUpdate.id, newStatus)
      setIsStatusModalOpen(false)
      setOrderToUpdate(null)
      setStatusNote('')
      loadOrders()
      showToast('Statut mis à jour avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour du statut', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleTransferClick = async (order: Order) => {
    setOrderToTransfer(order)
    setTransferShopId(null)
    setTransferReason('')

    // Charger les boutiques si pas encore fait
    if (shops.length === 0) {
      try {
        const response = await shopsService.getAllShops()
        if (response.data) {
          const shopsList = Array.isArray(response.data) ? response.data : response.data.results || []
          setShops(shopsList)
        }
      } catch (err) {
        console.error('Erreur chargement boutiques:', err)
      }
    }

    setIsTransferModalOpen(true)
  }

  const handleTransferOrder = async () => {
    if (!orderToTransfer || !transferShopId || !transferReason.trim()) return

    try {
      setActionLoading(true)
      await ordersService.transferOrder(orderToTransfer.id, transferShopId, transferReason)

      setIsTransferModalOpen(false)
      setOrderToTransfer(null)
      setTransferShopId(null)
      setTransferReason('')
      loadOrders()
      showToast('Commande transférée avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du transfert de la commande', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleProductClick = async (e: React.MouseEvent, productId: number, productSlug?: string) => {
    e.stopPropagation()
    let slug = productSlug || productSlugCache.get(productId)
    if (!slug && productId) {
      slug = await fetchProductSlug(productId)
    }
    const url = `/products/${slug || productId}`
    window.open(url, '_blank')
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('fr-FR').format(Number(price)) + ' FCFA'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={12} /> },
      confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle size={12} /> },
      processing: { label: 'En préparation', color: 'bg-purple-100 text-purple-800', icon: <Package size={12} /> },
      shipped: { label: 'Expédiée', color: 'bg-indigo-100 text-indigo-800', icon: <Truck size={12} /> },
      delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={12} /> },
      cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: <XCircle size={12} /> }
    }

    const config = statusConfig[status] || statusConfig.pending

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    )
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  const statusOptions: { value: OrderStatus | ''; label: string }[] = [
    { value: '', label: 'Tous les statuts' },
    { value: 'pending', label: 'En attente' },
    { value: 'confirmed', label: 'Confirmée' },
    { value: 'processing', label: 'En préparation' },
    { value: 'shipped', label: 'Expédiée' },
    { value: 'delivered', label: 'Livrée' },
    { value: 'cancelled', label: 'Annulée' }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Commandes</h1>
          <p className="text-gray-500 mt-1">
            Gérez et suivez toutes les commandes de la plateforme
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <button
            onClick={loadOrders}
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats Cards - Clickable to filter */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {([
          { key: '' as const, label: 'Total', value: totalCount, gradient: 'from-blue-500 to-blue-600', light: 'text-blue-100', ring: 'ring-blue-300', icon: <ShoppingBag size={24} /> },
          { key: 'pending' as const, label: 'En attente', value: (orders || []).filter(o => o.status === 'pending').length, gradient: 'from-yellow-500 to-orange-500', light: 'text-yellow-100', ring: 'ring-yellow-300', icon: <Clock size={24} /> },
          { key: 'processing' as const, label: 'Préparation', value: (orders || []).filter(o => o.status === 'processing').length, gradient: 'from-purple-500 to-purple-600', light: 'text-purple-100', ring: 'ring-purple-300', icon: <Package size={24} /> },
          { key: 'shipped' as const, label: 'Expédiées', value: (orders || []).filter(o => o.status === 'shipped').length, gradient: 'from-indigo-500 to-indigo-600', light: 'text-indigo-100', ring: 'ring-indigo-300', icon: <Truck size={24} /> },
          { key: 'delivered' as const, label: 'Livrées', value: (orders || []).filter(o => o.status === 'delivered').length, gradient: 'from-green-500 to-emerald-600', light: 'text-green-100', ring: 'ring-green-300', icon: <CheckCircle size={24} /> },
        ]).map(card => (
          <button
            key={card.key}
            onClick={() => { setSelectedStatus(card.key as OrderStatus | ''); setCurrentPage(1) }}
            className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-5 text-white shadow-lg text-left transition-all hover:scale-105 hover:shadow-xl ${selectedStatus === card.key ? `ring-4 ${card.ring} scale-105` : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`${card.light} text-sm font-medium`}>{card.label}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                {card.icon}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        {/* Filters */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par n° commande, client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </form>

            <div className="flex gap-3">
              {/* Filtre par boutique */}
              <select
                value={selectedShopId || ''}
                onChange={(e) => {
                  setSelectedShopId(e.target.value ? parseInt(e.target.value) : null)
                  setCurrentPage(1)
                }}
                className="px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-700 min-w-[180px]"
              >
                <option value="">🏪 Toutes les boutiques</option>
                {shops.map(shop => (
                  <option key={shop.id} value={shop.id}>{shop.name}</option>
                ))}
              </select>

              {/* Filtre par statut */}
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value as OrderStatus | '')
                  setCurrentPage(1)
                }}
                className="px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-700 min-w-[160px]"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
              <p className="mt-3 text-gray-500">Chargement des commandes...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={loadOrders}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : (orders || []).length === 0 ? (
          <div className="p-16 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucune commande trouvée</p>
            <p className="text-gray-400 text-sm mt-1">Les commandes apparaîtront ici</p>
          </div>
        ) : (
          <>
            {/* Orders List */}
            <div className="divide-y divide-gray-100">
              {(orders || []).map((order) => {
                const orderItems = (order as any).order_items || order.items || []
                const itemsCount = orderItems.length
                return (
                  <div
                    key={order.id}
                    className="p-5 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => handleViewOrder(order)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                          #{order.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">
                              {(order as any).shipping_full_name || `Client #${order.customer}`}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatusClick(order); }}
                              className="hover:scale-105 transition-transform"
                            >
                              {getStatusBadge(order.status)}
                            </button>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Package size={14} />
                              {itemsCount} article{itemsCount > 1 ? 's' : ''}
                            </span>
                            <span>•</span>
                            <span>{formatDate(order.created_at)}</span>
                            {(order as any).shipping_commune && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin size={14} />
                                  {(order as any).shipping_commune}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{formatPrice(order.total_amount)}</p>
                          <p className="text-xs text-gray-400">
                            {(order as any).payment_method === 'cash_on_delivery' ? 'À la livraison' :
                              (order as any).payment_method === 'mobile_money' ? 'Mobile Money' : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="p-2.5 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors"
                            title="Voir les détails"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleStatusClick(order)}
                            className="p-2.5 text-green-600 hover:bg-green-100 rounded-xl transition-colors"
                            title="Modifier le statut"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleTransferClick(order)}
                            className="p-2.5 text-orange-600 hover:bg-orange-100 rounded-xl transition-colors"
                            title="Transférer"
                          >
                            <ArrowRightLeft size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                <p className="text-sm text-gray-600">
                  Page <span className="font-semibold">{currentPage}</span> sur <span className="font-semibold">{totalPages}</span>
                  <span className="text-gray-400 ml-2">({totalCount} commandes)</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Order Modal */}
      {isViewModalOpen && viewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Commande #{viewingOrder.id}</h2>
                <p className="text-sm text-gray-500">{formatDate(viewingOrder.created_at)}</p>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-sm text-gray-500">Statut</span>
                  <div className="mt-1">{getStatusBadge(viewingOrder.status)}</div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">Total</span>
                  <div className="text-2xl font-bold text-indigo-600">
                    {formatPrice(viewingOrder.total_amount)}
                  </div>
                </div>
              </div>

              {/* Customer & Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                    <MapPin size={16} />
                    Adresse de livraison
                  </h4>
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-gray-900">{(viewingOrder as any).shipping_full_name || 'Non spécifié'}</p>
                    <p className="text-gray-600 flex items-center gap-1">
                      <Phone size={12} />
                      {(viewingOrder as any).shipping_phone || '-'}
                    </p>
                    <p className="text-gray-600">
                      {(viewingOrder as any).shipping_quartier}, {(viewingOrder as any).shipping_commune}
                    </p>
                    {(viewingOrder as any).shipping_address_details && (
                      <p className="text-gray-500">{(viewingOrder as any).shipping_address_details}</p>
                    )}
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                    <CreditCard size={16} />
                    Paiement
                  </h4>
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-gray-900">
                      {(viewingOrder as any).payment_method === 'cash_on_delivery' ? 'Paiement à la livraison' :
                        (viewingOrder as any).payment_method === 'mobile_money' ? 'Mobile Money' :
                          (viewingOrder as any).payment_method || 'Non spécifié'}
                    </p>
                    <p className="text-gray-600">Sous-total: {formatPrice((viewingOrder as any).subtotal || '0')}</p>
                    <p className="text-gray-600">Livraison: {formatPrice((viewingOrder as any).delivery_fee || '0')}</p>
                    <p className="font-bold text-green-700 text-lg">Total: {formatPrice(viewingOrder.total_amount)}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                {/* Show stores involved */}
                {(viewingOrder as any).stores && (viewingOrder as any).stores.length > 1 && (
                  <div className="mb-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-sm font-medium text-indigo-800 flex items-center gap-2">
                      <Store size={16} />
                      Commande multi-boutiques: {(viewingOrder as any).stores.map((s: any) => s.name).join(', ')}
                    </p>
                  </div>
                )}
                <h3 className="font-medium text-gray-900 mb-4">Articles commandés ({((viewingOrder as any).order_items || viewingOrder.items || []).length})</h3>
                <div className="space-y-3">
                  {((viewingOrder as any).order_items || []).length > 0 ? (
                    (viewingOrder as any).order_items.map((item: any) => {
                      const storeName = (viewingOrder as any).stores?.find((s: any) => s.id === item.store_id)?.name;
                      return (
                      <div
                        key={item.id}
                        onClick={(e) => handleProductClick(e, item.product_id || item.product?.id, item.product_slug || item.product?.slug)}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                        title="Ouvrir dans un nouvel onglet"
                      >
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {getImageUrl(item) ? (
                            <img
                              src={getImageUrl(item)!}
                              alt={item.product_name || 'Produit'}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <Package className="text-gray-400" size={24} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">{item.product_name || 'Produit'}</div>
                          <div className="text-sm text-gray-500">
                            Quantité: {item.quantity}
                            {storeName && <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">{storeName}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">{formatPrice(item.unit_price)} × {item.quantity}</div>
                          <div className="font-bold text-green-600">{formatPrice(item.total_price)}</div>
                        </div>
                      </div>
                    )})
                  ) : (viewingOrder.items || []).length > 0 ? (
                    viewingOrder.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={(e) => handleProductClick(e, (item as any).product_id || item.product?.id, (item as any).product_slug || item.product?.slug)}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                        title="Ouvrir dans un nouvel onglet"
                      >
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {getImageUrl(item) ? (
                            <img
                              src={getImageUrl(item)!}
                              alt={item.product?.name || 'Produit'}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="text-gray-400" size={24} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">{item.product?.name || 'Produit'}</div>
                          <div className="text-sm text-gray-500">
                            Boutique: {item.product?.store?.name || '-'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">x{item.quantity}</div>
                          <div className="font-bold text-green-600">{formatPrice(item.unit_price)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package size={40} className="mx-auto mb-2 text-gray-300" />
                      <p>Aucun article trouvé</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false)
                    handleStatusClick(viewingOrder)
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Edit size={16} />
                  Modifier le statut
                </button>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false)
                    handleTransferClick(viewingOrder)
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                >
                  <ArrowRightLeft size={16} />
                  Transférer
                </button>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {isStatusModalOpen && orderToUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Modifier le statut</h2>
              <p className="text-sm text-gray-500">Commande #{orderToUpdate.id}</p>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut actuel
                </label>
                <div>{getStatusBadge(orderToUpdate.status)}</div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau statut
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="processing">En préparation</option>
                  <option value="shipped">Expédiée</option>
                  <option value="delivered">Livrée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note pour le client (optionnel)
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ajouter une note..."
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Le client sera notifié par email et SMS du changement de statut.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={actionLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={actionLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Mise à jour...
                  </>
                ) : (
                  'Mettre à jour'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Order Modal */}
      {isTransferModalOpen && orderToTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <ArrowRightLeft className="text-orange-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Transférer la commande</h2>
                  <p className="text-sm text-gray-500">Commande #{orderToTransfer.id}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-yellow-800">
                    Le transfert de commande notifiera le client et la nouvelle boutique.
                    Cette action est irréversible.
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Boutique actuelle
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Store className="text-gray-400" size={18} />
                  <span className="text-gray-900">
                    {(orderToTransfer.items?.[0]?.product as any)?.store?.name || 'Non définie'}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouvelle boutique <span className="text-red-500">*</span>
                </label>
                <select
                  value={transferShopId || ''}
                  onChange={(e) => setTransferShopId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Sélectionner une boutique</option>
                  {shops
                    .filter(s => s.is_active)
                    .filter(s => {
                      // Exclude the current store from the list
                      const currentStoreId = orderToTransfer.items?.[0]?.product?.store?.id
                      return s.id !== currentStoreId
                    })
                    .map(shop => (
                      <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison du transfert <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Expliquez la raison du transfert au client..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cette raison sera communiquée au client par email et SMS.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsTransferModalOpen(false)
                  setOrderToTransfer(null)
                  setTransferShopId(null)
                  setTransferReason('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={actionLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleTransferOrder}
                disabled={actionLoading || !transferShopId || !transferReason.trim()}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Transfert...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft size={16} />
                    Transférer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperAdminOrdersPage
