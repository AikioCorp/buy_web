import React, { useState, useEffect } from 'react'
import {
  Search, ShoppingCart, Eye, X, CheckCircle, Clock, Truck, XCircle,
  AlertTriangle, Ban, Loader2, RefreshCw, Package, MapPin, Phone, CreditCard, Edit, User
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ordersService, Order, OrderStatus } from '../../lib/api/ordersService'
import { vendorService } from '../../lib/api/vendorService'
import { useToast } from '../../components/Toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://buymore-api-production.up.railway.app'

// Cache pour les images et slugs chargés depuis l'API
const productImageCache = new Map<number, string | null>()
const productSlugCache = new Map<number, string | null>()

// Fonction pour charger l'image d'un produit depuis l'API
const fetchProductImage = async (productId: number): Promise<string | null> => {
  if (productImageCache.has(productId)) {
    return productImageCache.get(productId)!
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`)
    if (!response.ok) return null
    
    const result = await response.json()
    const product = result.data
    // Cache le slug du produit
    if (product.slug) {
      productSlugCache.set(productId, product.slug)
    }
    
    let imageUrl: string | null = null
    
    // Chercher l'image dans le produit
    if (product.media && product.media.length > 0) {
      const primaryImage = product.media.find((m: any) => m.is_primary) || product.media[0]
      imageUrl = primaryImage?.image_url || primaryImage?.file
    } else if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find((img: any) => img.is_primary) || product.images[0]
      imageUrl = primaryImage?.image || primaryImage?.url || primaryImage?.image_url
    } else if (product.image_url) {
      imageUrl = product.image_url
    } else if (product.thumbnail) {
      imageUrl = product.thumbnail
    }
    
    // Formater l'URL
    if (imageUrl) {
      if (imageUrl.startsWith('http://')) {
        imageUrl = imageUrl.replace('http://', 'https://')
      }
      if (!imageUrl.startsWith('https://') && !imageUrl.startsWith('data:')) {
        imageUrl = `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
      }
    }
    
    productImageCache.set(productId, imageUrl)
    return imageUrl
  } catch (error) {
    productImageCache.set(productId, null)
    return null
  }
}

// Fonction pour obtenir l'URL de l'image d'un produit
const getProductImageUrl = (item: any): string | null => {
  if (!item) return null
  
  let url: string | null = null
  
  // 1. Try direct product_image field (from order_items)
  if (item.product_image) {
    url = item.product_image
  }
  // 2. Check product object if exists
  else {
    const product = item.product || item
    
    // 2a. media array (new format)
    if (product.media && product.media.length > 0) {
      const primaryImage = product.media.find((m: any) => m.is_primary) || product.media[0]
      url = primaryImage?.image_url || primaryImage?.file || primaryImage?.image
    }
    // 2b. images array (common format)
    else if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find((img: any) => img.is_primary) || product.images[0]
      url = primaryImage?.image || primaryImage?.url || primaryImage?.image_url
    }
    // 2c. Direct image property
    else if (product.image) {
      url = product.image
    }
    // 2d. Direct image_url property  
    else if (product.image_url) {
      url = product.image_url
    }
    // 2e. thumbnail property
    else if (product.thumbnail) {
      url = product.thumbnail
    }
  }
  
  if (!url) return null
  
  // Fix protocol
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://')
  }
  
  // Return full URL
  return url.startsWith('https://') || url.startsWith('data:') 
    ? url 
    : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

const VendorOrdersPage: React.FC = () => {
  const { showToast } = useToast()
  const navigate = useNavigate()
  
  // State pour les images chargées dynamiquement
  const [loadedImages, setLoadedImages] = React.useState<Map<number, string | null>>(new Map())
  const [vendorShopId, setVendorShopId] = useState<number | null>(null)

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [orderToUpdate, setOrderToUpdate] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending')
  const [statusNote, setStatusNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const handleProductClick = async (e: React.MouseEvent, productId: number, productSlug?: string) => {
    e.stopPropagation()
    let slug = productSlug || productSlugCache.get(productId)
    if (!slug && productId) {
      await fetchProductImage(productId) // This also caches the slug
      slug = productSlugCache.get(productId) || undefined
    }
    const url = `/products/${slug || productId}`
    window.open(url, '_blank')
  }

  const handleStatusClick = (order: Order) => {
    setOrderToUpdate(order)
    setNewStatus(order.status)
    setStatusNote('')
    setIsStatusModalOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!orderToUpdate) return

    try {
      setActionLoading(true)
      await ordersService.updateOrderStatus(orderToUpdate.id, newStatus)
      showToast('Statut de la commande mis à jour avec succès', 'success')
      setIsStatusModalOpen(false)
      setOrderToUpdate(null)
      loadOrders()
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de la mise à jour du statut', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const pageSize = 20

  // Stats - filtrer uniquement les commandes de la boutique du vendeur
  const stats = {
    total: totalCount,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  useEffect(() => {
    loadVendorShop()
  }, [])

  useEffect(() => {
    if (vendorShopId) {
      loadOrders()
    }
  }, [currentPage, searchQuery, statusFilter, vendorShopId])

  const loadVendorShop = async () => {
    try {
      const response = await vendorService.getStats()
      if (response.data) {
        const data = (response.data as any).data || response.data
        if (data.shop_id) {
          setVendorShopId(data.shop_id)
        }
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Erreur chargement shop_id:', err)
      }
    }
  }

  // Charger les images manquantes après le chargement des commandes
  const loadMissingImages = React.useCallback(async (orders: any[]) => {
    const imagesToLoad: number[] = []
    
    for (const order of orders) {
      const items = (order as any).order_items || []
      for (const item of items) {
        if (!item.product_image && item.product_id && !loadedImages.has(item.product_id)) {
          imagesToLoad.push(item.product_id)
        }
      }
    }
    
    if (imagesToLoad.length === 0) return
    
    const newImages = new Map(loadedImages)
    await Promise.all(
      imagesToLoad.map(async (productId) => {
        const imageUrl = await fetchProductImage(productId)
        newImages.set(productId, imageUrl)
      })
    )
    
    setLoadedImages(newImages)
  }, [loadedImages])
  
  const loadOrders = async () => {
    if (!vendorShopId) return
    
    try {
      setLoading(true)
      setError(null)

      // Charger TOUTES les commandes via l'endpoint vendeur
      const response = await ordersService.getOrders()

      if (response.data) {
        const raw = response.data as any
        const ordersData = raw.data || raw
        let allOrders: Order[] = []

        if (Array.isArray(ordersData)) {
          allOrders = ordersData
        } else if (ordersData.results) {
          allOrders = ordersData.results
        }

        // Filtrer pour ne garder que les commandes contenant des produits de la boutique du vendeur
        const vendorOrders = allOrders.filter((order: any) => {
          const items = order.order_items || order.items || []
          // Vérifier si au moins un item appartient à la boutique du vendeur
          return items.some((item: any) => item.store_id === vendorShopId)
        })

        // Appliquer le filtre de statut si nécessaire
        const filteredOrders = statusFilter === 'all' 
          ? vendorOrders 
          : vendorOrders.filter((o: any) => o.status === statusFilter)

        setOrders(filteredOrders)
        setTotalCount(vendorOrders.length)
        loadMissingImages(filteredOrders)
      }
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('Erreur API:', err)
      }
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

  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return { icon: Clock, label: 'En attente', bg: 'bg-yellow-100 text-yellow-700' }
      case 'confirmed': return { icon: CheckCircle, label: 'Confirmée', bg: 'bg-emerald-100 text-emerald-700' }
      case 'processing': return { icon: Package, label: 'En préparation', bg: 'bg-blue-100 text-blue-700' }
      case 'shipped': return { icon: Truck, label: 'Expédiée', bg: 'bg-purple-100 text-purple-700' }
      case 'delivered': return { icon: CheckCircle, label: 'Livrée', bg: 'bg-green-100 text-green-700' }
      case 'cancelled': return { icon: XCircle, label: 'Annulée', bg: 'bg-red-100 text-red-700' }
      default: return { icon: Clock, label: status, bg: 'bg-gray-100 text-gray-700' }
    }
  }

  // Intelligent status flow: only show valid next statuses
  const getNextStatuses = (currentStatus: OrderStatus): { value: OrderStatus; label: string }[] => {
    switch (currentStatus) {
      case 'pending':
        return [
          { value: 'confirmed', label: 'Confirmer la commande' },
          { value: 'processing', label: 'Mettre en préparation' },
          { value: 'cancelled', label: 'Annuler la commande' },
        ]
      case 'confirmed':
        return [
          { value: 'processing', label: 'Mettre en préparation' },
          { value: 'shipped', label: 'Marquer comme expédiée' },
          { value: 'cancelled', label: 'Annuler la commande' },
        ]
      case 'processing':
        return [
          { value: 'shipped', label: 'Marquer comme expédiée' },
          { value: 'delivered', label: 'Marquer comme livrée' },
          { value: 'cancelled', label: 'Annuler la commande' },
        ]
      case 'shipped':
        return [
          { value: 'delivered', label: 'Marquer comme livrée' },
          { value: 'cancelled', label: 'Annuler la commande' },
        ]
      default:
        return []
    }
  }

  // Calculer le total de la boutique du vendeur pour une commande
  const getVendorOrderTotal = (order: Order) => {
    const orderData = order as any
    const items = orderData.order_items || order.items || []
    
    // Filtrer uniquement les produits de la boutique du vendeur
    const vendorItems = items.filter((item: any) => item.store_id === vendorShopId)
    
    const vendorTotal = vendorItems.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.total_price || 0) || (parseFloat(item.unit_price || 0) * (item.quantity || 0)))
    }, 0)
    
    return vendorTotal
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement des commandes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={loadOrders} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            Mes Commandes
          </h1>
          <p className="text-gray-500 mt-1">{totalCount} commandes pour votre boutique</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {([
          { key: 'all' as const, label: 'Total', value: stats.total, bg: 'bg-gradient-to-br from-blue-500 to-blue-600' },
          { key: 'pending' as const, label: 'En attente', value: stats.pending, bg: 'bg-gradient-to-br from-yellow-500 to-amber-500' },
          { key: 'confirmed' as const, label: 'Confirmées', value: stats.confirmed, bg: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
          { key: 'processing' as const, label: 'En cours', value: stats.processing, bg: 'bg-gradient-to-br from-green-500 to-emerald-600' },
          { key: 'shipped' as const, label: 'Expédiées', value: stats.shipped, bg: 'bg-gradient-to-br from-purple-500 to-violet-600' },
          { key: 'delivered' as const, label: 'Livrées', value: stats.delivered, bg: 'bg-gradient-to-br from-indigo-500 to-blue-600' },
          { key: 'cancelled' as const, label: 'Annulées', value: stats.cancelled, bg: 'bg-gradient-to-br from-red-500 to-rose-600' },
        ]).map(card => (
          <button
            key={card.key}
            onClick={() => { setStatusFilter(card.key); setCurrentPage(1) }}
            className={`${card.bg} rounded-xl p-4 text-white shadow-sm hover:shadow-md transition-all`}
          >
            <p className="text-sm opacity-90">{card.label}</p>
            <p className="text-3xl font-bold mt-1">{card.value}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une commande..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-100"
            />
          </form>
        </div>
        <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto">
          {([
            { key: 'all' as const, label: 'Toutes' },
            { key: 'pending' as const, label: 'En attente' },
            { key: 'confirmed' as const, label: 'Confirmées' },
            { key: 'processing' as const, label: 'En cours' },
            { key: 'shipped' as const, label: 'Expédiées' },
            { key: 'delivered' as const, label: 'Livrées' },
            { key: 'cancelled' as const, label: 'Annulées' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setCurrentPage(1) }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button onClick={loadOrders} className="ml-auto p-2 hover:bg-gray-100 rounded-lg">
            <RefreshCw size={18} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucune commande trouvée</h3>
          <p className="text-gray-500 mt-1">Modifiez vos filtres ou effectuez une nouvelle recherche</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Commande</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Client</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Total</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Statut</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status)
                const orderData = order as any
                const items = orderData.order_items || order.items || []
                const vendorItems = items.filter((item: any) => item.store_id === vendorShopId)
                const itemsCount = vendorItems.length
                const clientName = orderData.shipping_full_name || orderData.user?.username || orderData.customer_name || 'N/A'
                const clientPhone = orderData.shipping_phone || ''
                const orderSource = orderData.order_source
                const isWhatsApp = orderSource === 'whatsapp'
                const isMobile = orderSource === 'mobile'
                const vendorTotal = getVendorOrderTotal(order)
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50 group cursor-pointer" onClick={() => handleViewOrder(order)}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">#{orderData.order_number || order.id}</p>
                      <p className="text-sm text-gray-500">{itemsCount} article{itemsCount > 1 ? 's' : ''}</p>
                      {isWhatsApp && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium mt-1">WhatsApp</span>
                      )}
                      {isMobile && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium mt-1">Mobile</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{clientName}</p>
                      {clientPhone && <p className="text-sm text-gray-500">{clientPhone}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{vendorTotal.toLocaleString()} FCFA</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusInfo.bg}`}>
                        <statusInfo.icon className="w-3.5 h-3.5" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewOrder(order) }}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStatusClick(order) }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Changer statut"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* View Order Modal - Réutiliser le même modal que AdminOrdersPage */}
      {isViewModalOpen && viewingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-green-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Commande #{(viewingOrder as any).order_number || viewingOrder.id}</h2>
                  <p className="text-sm text-white/80">
                    {new Date(viewingOrder.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Client Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User size={18} className="text-emerald-600" />
                  Informations client
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Nom complet</p>
                    <p className="font-medium text-gray-900">{(viewingOrder as any).shipping_full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Téléphone</p>
                    <p className="font-medium text-gray-900">{(viewingOrder as any).shipping_phone || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-500">Adresse de livraison</p>
                    <p className="font-medium text-gray-900">
                      {(viewingOrder as any).shipping_address || 'N/A'}
                      {(viewingOrder as any).shipping_commune && `, ${(viewingOrder as any).shipping_commune}`}
                      {(viewingOrder as any).shipping_quartier && `, ${(viewingOrder as any).shipping_quartier}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items - Filtrer uniquement les items de la boutique du vendeur */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Package size={18} className="text-emerald-600" />
                  Articles de votre boutique
                </h3>
                <div className="space-y-3">
                  {((viewingOrder as any).order_items || (viewingOrder as any).items || [])
                    .filter((item: any) => item.store_id === vendorShopId)
                    .map((item: any, index: number) => {
                      const imageUrl = getProductImageUrl(item) || loadedImages.get(item.product_id)
                      return (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                            {imageUrl ? (
                              <img src={imageUrl} alt={item.product_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={24} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.product_name}</p>
                            <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{parseFloat(item.total_price || 0).toLocaleString()} FCFA</p>
                            <p className="text-sm text-gray-500">{parseFloat(item.unit_price || 0).toLocaleString()} FCFA/u</p>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total de votre boutique</span>
                  <span className="text-2xl font-bold text-emerald-600">{getVendorOrderTotal(viewingOrder).toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleStatusClick(viewingOrder)
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg flex items-center gap-2"
              >
                <Edit size={18} />
                Changer le statut
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {isStatusModalOpen && orderToUpdate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Changer le statut</h3>
              <p className="text-sm text-gray-500 mt-1">Commande #{(orderToUpdate as any).order_number || orderToUpdate.id}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau statut</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-100"
                >
                  {getNextStatuses(orderToUpdate.status).map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                disabled={actionLoading}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={actionLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Mettre à jour
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

export default VendorOrdersPage
