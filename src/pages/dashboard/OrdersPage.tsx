import React, { useState, useEffect } from 'react'
import {
  Package, Search, Eye, X, Clock, Loader2, RefreshCw,
  Truck, CheckCircle, XCircle, ShoppingBag, Phone, MapPin,
  User, Calendar, CreditCard, MessageSquare, Printer, Download, Edit
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ordersService, Order, OrderStatus } from '../../lib/api/ordersService'
import { vendorService } from '../../lib/api/vendorService'
import { useToast } from '../../components/Toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://buymore-api-production.up.railway.app'

// Cache pour les images et slugs chargés depuis l'API
const productImageCache = new Map<number, string | null>()
const productSlugCache = new Map<number, string | null>()

// Fonction pour charger l'image et le slug d'un produit depuis l'API
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
    if (imageUrl) {
      if (imageUrl.startsWith('http://')) imageUrl = imageUrl.replace('http://', 'https://')
      if (!imageUrl.startsWith('https://') && !imageUrl.startsWith('data:')) {
        imageUrl = `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
      }
    }
    productImageCache.set(productId, imageUrl)
    return imageUrl
  } catch {
    productImageCache.set(productId, null)
    return null
  }
}

const getImageUrl = (item: any): string | null => {
  if (!item) return null;

  // 1. Try direct product_image field
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

const OrdersPage: React.FC = () => {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('')
  const [vendorShopId, setVendorShopId] = useState<number | null>(null)

  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [orderToUpdate, setOrderToUpdate] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending')
  const [statusNote, setStatusNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Map<number, string | null>>(new Map())

  // Charger les images manquantes en arrière-plan
  const loadMissingImages = React.useCallback(async (ordersList: any[]) => {
    const imagesToLoad: number[] = []
    for (const order of ordersList) {
      const items = (order as any).order_items || order.items || []
      for (const item of items) {
        if (!getImageUrl(item) && item.product_id && !loadedImages.has(item.product_id)) {
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

  const handleProductClick = async (e: React.MouseEvent, productId: number, productSlug?: string) => {
    e.stopPropagation()
    let slug = productSlug || productSlugCache.get(productId)
    if (!slug && productId) {
      // Fetch slug on-demand if not cached yet
      await fetchProductImage(productId) // This also caches the slug
      slug = productSlugCache.get(productId) || undefined
    }
    const url = `/products/${slug || productId}`
    window.open(url, '_blank')
  }

  // Calculer le total de la boutique du vendeur pour une commande
  const getVendorOrderTotal = (order: Order) => {
    const orderData = order as any
    const items = orderData.order_items || order.items || []
    
    // Si on a le shop_id du vendeur, filtrer uniquement ses produits
    if (vendorShopId) {
      const vendorItems = items.filter((item: any) => {
        return item.store_id === vendorShopId
      })
      
      const vendorTotal = vendorItems.reduce((sum: number, item: any) => {
        return sum + (parseFloat(item.total_price || 0) || (parseFloat(item.unit_price || 0) * (item.quantity || 0)))
      }, 0)
      
      return vendorTotal
    }
    
    // Si la commande a un store_id, c'est une sous-commande d'une commande multi-boutiques
    if (orderData.store_id) {
      const itemsTotal = items.reduce((sum: number, item: any) => {
        return sum + (parseFloat(item.total_price || 0) || (parseFloat(item.unit_price || 0) * (item.quantity || 0)))
      }, 0)
      return itemsTotal
    }
    
    // Pour les commandes normales, retourner le total sans les frais de livraison
    const subtotal = parseFloat(orderData.subtotal || 0)
    if (subtotal > 0) return subtotal
    
    // Fallback: calculer depuis les items
    return items.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.total_price || 0) || (parseFloat(item.unit_price || 0) * (item.quantity || 0)))
    }, 0)
  }

  const pageSize = 20

  useEffect(() => {
    loadVendorShop()
    loadOrders()
  }, [currentPage, selectedStatus])

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
      console.error('Erreur chargement shop_id:', err)
    }
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await ordersService.getOrders()

      if (response.data) {
        // Backend wraps response in { success: true, data: [...] }
        const raw = response.data as any
        const ordersData = raw.data || raw

        if (Array.isArray(ordersData)) {
          setOrders(ordersData)
          setTotalCount(ordersData.length)
          loadMissingImages(ordersData)
        } else if (ordersData.results) {
          setOrders(ordersData.results)
          setTotalCount(ordersData.count)
          loadMissingImages(ordersData.results)
        } else {
          setOrders([])
          setTotalCount(0)
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
    setStatusNote('')
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

  const formatPrice = (price: string | number) => {
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

  const getNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    const flow: Record<OrderStatus, OrderStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: []
    }
    return flow[currentStatus] || []
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

  // Filtrer les commandes localement si nécessaire
  const filteredOrders = selectedStatus
    ? orders.filter(o => o.status === selectedStatus)
    : orders

  const searchFilteredOrders = searchQuery
    ? filteredOrders.filter(o =>
      String(o.id).includes(searchQuery) ||
      String(o.customer).toLowerCase().includes(searchQuery.toLowerCase())
    )
    : filteredOrders

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            Gestion des Commandes
          </h1>
          <p className="text-gray-500 mt-1">{totalCount} commande{totalCount > 1 ? 's' : ''} au total</p>
        </div>
      </div>

      {/* Stats Cards - Style Admin avec gradients */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {([
          { key: '' as const, label: 'Total', value: orders.length, bg: 'bg-gradient-to-br from-emerald-500 to-green-600' },
          { key: 'pending' as const, label: 'En attente', value: orders.filter(o => o.status === 'pending').length, bg: 'bg-gradient-to-br from-yellow-500 to-amber-500' },
          { key: 'confirmed' as const, label: 'Confirmées', value: orders.filter(o => o.status === 'confirmed').length, bg: 'bg-gradient-to-br from-blue-500 to-cyan-600' },
          { key: 'processing' as const, label: 'En cours', value: orders.filter(o => o.status === 'processing').length, bg: 'bg-gradient-to-br from-purple-500 to-violet-600' },
          { key: 'shipped' as const, label: 'Expédiées', value: orders.filter(o => o.status === 'shipped').length, bg: 'bg-gradient-to-br from-indigo-500 to-blue-600' },
          { key: 'delivered' as const, label: 'Livrées', value: orders.filter(o => o.status === 'delivered').length, bg: 'bg-gradient-to-br from-green-500 to-emerald-600' },
        ]).map(card => (
          <button
            key={card.key}
            onClick={() => { setSelectedStatus(card.key as OrderStatus | ''); setCurrentPage(1) }}
            className={`${card.bg} rounded-xl p-4 text-white shadow-sm hover:shadow-md transition-all`}
          >
            <p className="text-sm opacity-90">{card.label}</p>
            <p className="text-3xl font-bold mt-1">{card.value}</p>
          </button>
        ))}
      </div>

      {/* Onglets de filtres + Recherche - Style Admin */}
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
          {statusOptions.map(tab => (
            <button
              key={tab.value}
              onClick={() => { setSelectedStatus(tab.value as OrderStatus | ''); setCurrentPage(1) }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedStatus === tab.value
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadOrders}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Réessayer
            </button>
          </div>
        ) : searchFilteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Aucune commande trouvée</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Articles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchFilteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      onClick={() => handleViewOrder(order)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <ShoppingBag className="text-emerald-600" size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">#{(order as any).order_number || order.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{(order as any).shipping_full_name || `Client #${(order as any).customer_id || order.customer}`}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {((order as any).order_items || order.items)?.length || 0} article{(((order as any).order_items || order.items)?.length || 0) > 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatPrice(getVendorOrderTotal(order))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleStatusClick(order)}
                          className="hover:opacity-80 transition-opacity"
                        >
                          {getStatusBadge(order.status)}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleViewOrder(order); }}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Voir les détails"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} sur {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Order Modal */}
      {isViewModalOpen && viewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Commande #{viewingOrder.id}</h2>
                <p className="text-sm text-gray-500">{formatDate(viewingOrder.created_at)}</p>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Statut et Total */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Statut actuel</span>
                  <div className="mt-1">{getStatusBadge(viewingOrder.status)}</div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">Total de votre commande</span>
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatPrice(getVendorOrderTotal(viewingOrder))}
                  </div>
                </div>
              </div>

              {/* Informations client */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <User size={18} />
                  Informations client
                </h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span>{(viewingOrder as any).shipping_full_name || `Client #${(viewingOrder as any).customer_id || viewingOrder.customer}`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <span>{(viewingOrder as any).shipping_phone || (viewingOrder as any).phone || 'Non renseigné'}</span>
                  </div>
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                    <span>{(viewingOrder as any).shipping_quartier ? `${(viewingOrder as any).shipping_quartier}, ${(viewingOrder as any).shipping_commune}` : ((viewingOrder as any).shipping_address || 'Adresse non renseignée')}</span>
                  </div>
                </div>
              </div>

              {/* Articles commandés */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Package size={18} />
                  Articles commandés ({((viewingOrder as any).order_items || viewingOrder.items)?.length || 0})
                </h3>
                <div className="space-y-3">
                  {((viewingOrder as any).order_items || viewingOrder.items || []).map((item: any, idx: number) => {
                    return (
                    <div 
                      key={item.id || idx} 
                      onClick={(e) => handleProductClick(e, item.product_id || item.product?.id, item.product_slug || item.product?.slug)}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors cursor-pointer"
                      title="Ouvrir dans un nouvel onglet"
                    >
                      <div
                        className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-emerald-500 transition-all"
                        title="Voir le produit"
                      >
                        {(getImageUrl(item) || loadedImages.get(item.product_id)) ? (
                          <img
                            src={(getImageUrl(item) || loadedImages.get(item.product_id))!}
                            alt={item.product_name || item.product?.name || 'Produit'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <Package className="text-gray-400" size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors text-left truncate">
                          {item.product_name || item.product?.name || 'Produit'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Quantité: {item.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">{formatPrice(item.unit_price)}</div>
                        <div className="font-semibold text-gray-900">{formatPrice(parseFloat(item.total_price || item.unit_price) * (item.quantity || 1))}</div>
                      </div>
                    </div>
                    )
                  })}
                </div>
              </div>

              {/* Récapitulatif */}
              <div className="border-t border-gray-200 mt-6 pt-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total de votre commande</span>
                    <span className="text-emerald-600">{formatPrice(getVendorOrderTotal(viewingOrder))}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Note: Les frais de livraison sont gérés par l'administration et ne sont pas inclus dans votre total.
                  </p>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 p-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white"
                >
                  <Printer size={16} />
                  Imprimer
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white"
                >
                  Fermer
                </button>
                {getNextStatuses(viewingOrder.status).length > 0 && (
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false)
                      handleStatusClick(viewingOrder)
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Modifier le statut
                  </button>
                )}
              </div>
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
                {getNextStatuses(orderToUpdate.status).length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    Cette commande ne peut plus être modifiée.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {getNextStatuses(orderToUpdate.status).map(status => (
                      <label
                        key={status}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${newStatus === status
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:bg-gray-50'
                          }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={status}
                          checked={newStatus === status}
                          onChange={() => setNewStatus(status)}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        {getStatusBadge(status)}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {getNextStatuses(orderToUpdate.status).length > 0 && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note pour le client (optionnel)
                    </label>
                    <textarea
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Ajouter une note..."
                    />
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Le client sera notifié par email et SMS du changement de statut.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsStatusModalOpen(false)
                  setOrderToUpdate(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={actionLoading}
              >
                Annuler
              </button>
              {getNextStatuses(orderToUpdate.status).length > 0 && (
                <button
                  onClick={handleUpdateStatus}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersPage
