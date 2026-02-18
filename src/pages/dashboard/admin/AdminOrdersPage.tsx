import React, { useState, useEffect } from 'react'
import {
  Search, ShoppingCart, Eye, X, CheckCircle, Clock, Truck, XCircle,
  AlertTriangle, Ban, Loader2, RefreshCw, Package, MapPin, Phone, CreditCard, Edit, User
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ordersService, Order, OrderStatus } from '../../../lib/api/ordersService'
import { usePermissions } from '../../../hooks/usePermissions'
import { useAuthStore } from '../../../store/authStore'
import { useToast } from '../../../components/Toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://apibuy.buymore.ml'

// Cache pour les images chargées depuis l'API
const productImageCache = new Map<number, string | null>()

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

const AdminOrdersPage: React.FC = () => {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const role = useAuthStore((state) => state.role)
  const {
    canViewOrders,
    canManageOrders,
    canCancelOrders
  } = usePermissions()
  
  // State pour les images chargées dynamiquement
  const [loadedImages, setLoadedImages] = React.useState<Map<number, string | null>>(new Map())

  const isAdminRole = role === 'admin' || role === 'super_admin'
  const canManageOrderActions = canManageOrders() || isAdminRole
  const canCancelOrderActions = canCancelOrders() || isAdminRole

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

  const handleProductClick = (productId: number, productSlug?: string) => {
    if (productSlug) {
      navigate(`/products/${productSlug}`)
    } else if (productId) {
      // Fallback to ID if slug is not available
      navigate(`/products/${productId}`)
    }
  }

  const handleStatusClick = (order: Order) => {
    setOrderToUpdate(order)
    setNewStatus(order.status)
    setStatusNote('')
    setIsStatusModalOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!orderToUpdate || !canManageOrders()) return

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

  // Stats
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
    loadOrders()
  }, [currentPage, searchQuery, statusFilter])

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
    try {
      setLoading(true)
      setError(null)
      const params: any = { page: currentPage }
      if (statusFilter !== 'all') params.status = statusFilter

      const response = await ordersService.getAllOrdersAdmin(params)
      console.log('Admin Orders response:', response)
      console.log('Admin Orders response.data:', response.data)

      if (response.data) {
        // Handle nested success wrapper: {success: true, data: {...}}
        const actualData = (response.data as any).data || response.data

        if (Array.isArray(actualData)) {
          console.log('Admin Orders array:', actualData.length)
          setOrders(actualData)
          setTotalCount(actualData.length)
        } else if (actualData.results) {
          console.log('Admin Orders results:', actualData.results.length, 'total:', actualData.count)
          setOrders(actualData.results)
          setTotalCount(actualData.count || actualData.results.length)
        }
        
        setError(null)
        
        // Charger les images manquantes en arrière-plan
        const ordersData = Array.isArray(actualData) ? actualData : actualData.results || []
        loadMissingImages(ordersData)
      }
    } catch (err: any) {
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


  const handleCancelOrder = async (order: Order) => {
    if (!canCancelOrders()) return
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return
    try {
      setActionLoading(true)
      await ordersService.updateOrderStatus(order.id, 'cancelled')
      loadOrders()
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l\'annulation', 'error')
    } finally {
      setActionLoading(false)
    }
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

  const totalPages = Math.ceil(totalCount / pageSize)

  // No permission warning
  if (!canViewOrders()) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Ban className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Accès non autorisé</h2>
          <p className="text-gray-500">Vous n'avez pas la permission de voir les commandes.</p>
        </div>
      </div>
    )
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
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
          <button onClick={loadOrders} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            Gestion des Commandes
          </h1>
          <p className="text-gray-500 mt-1">{totalCount} commandes enregistrées</p>
        </div>
      </div>

      {/* Stats Cards - Style Gestion Boutiques */}
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

      {/* Onglets de filtres - Style Gestion Boutiques */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une commande..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100"
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
                  ? 'bg-blue-600 text-white'
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
                const itemsCount = ((order as any).order_items || order.items || []).length
                const clientName = (order as any).shipping_full_name || (order as any).user?.username || (order as any).customer_name || 'N/A'
                const clientPhone = (order as any).shipping_phone || ''
                const orderSource = (order as any).order_source
                const isWhatsApp = orderSource === 'whatsapp'
                const isMobile = orderSource === 'mobile'
                return (
                  <tr key={order.id} className="hover:bg-gray-50 group cursor-pointer" onClick={() => handleViewOrder(order)}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">#{(order as any).order_number || order.id}</p>
                      <p className="text-sm text-gray-500">{itemsCount} article{itemsCount > 1 ? 's' : ''}</p>
                      {isWhatsApp && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium mt-1">WhatsApp</span>
                      )}
                      {isMobile && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium mt-1">Mobile</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{clientName}</p>
                      <p className="text-sm text-gray-500">{clientPhone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-blue-600">{parseFloat(order.total_amount || '0').toLocaleString()} FCFA</p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); if (canManageOrderActions && order.status !== 'delivered' && order.status !== 'cancelled') handleStatusClick(order) }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${canManageOrderActions && order.status !== 'delivered' && order.status !== 'cancelled' ? 'hover:ring-2 hover:ring-offset-1 hover:ring-indigo-300 cursor-pointer' : ''}`}
                        title={canManageOrderActions && order.status !== 'delivered' && order.status !== 'cancelled' ? 'Cliquer pour changer le statut' : ''}
                      >
                        <statusInfo.icon size={12} />
                        {statusInfo.label}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleViewOrder(order)} className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg" title="Voir">
                          <Eye size={18} />
                        </button>
                        {canManageOrderActions && order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusClick(order)}
                            className="p-2 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-lg"
                            title="Modifier le statut"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        {canCancelOrderActions && order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <button onClick={() => handleCancelOrder(order)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg" title="Annuler">
                            <XCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium disabled:opacity-50">
              Précédent
            </button>
            <span className="px-4 text-sm font-bold text-gray-900">Page {currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium disabled:opacity-50">
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* View Modal - Responsive */}
      {isViewModalOpen && viewingOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-3xl my-auto flex flex-col max-h-[98vh]">
            <div className="p-3 sm:p-4 md:p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Commande #{(viewingOrder as any).order_number || viewingOrder.id}</h2>
                <p className="text-xs sm:text-sm text-gray-500">{viewingOrder.created_at ? new Date(viewingOrder.created_at).toLocaleString('fr-FR') : ''}</p>
                {(viewingOrder as any).order_source === 'whatsapp' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium mt-1">📱 WhatsApp</span>
                )}
                {(viewingOrder as any).order_source === 'mobile' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mt-1">📱 App Mobile</span>
                )}
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>
            <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 overflow-y-auto flex-1">
              {/* Status */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                <span className="text-gray-600">Statut</span>
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusInfo(viewingOrder.status).bg}`}>
                  {React.createElement(getStatusInfo(viewingOrder.status).icon, { size: 14 })}
                  {getStatusInfo(viewingOrder.status).label}
                </span>
              </div>

              {/* Customer & Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {[(viewingOrder as any).shipping_quartier, (viewingOrder as any).shipping_commune].filter(Boolean).join(', ') || 'Non spécifié'}
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
                        (viewingOrder as any).payment_method === 'whatsapp' ? 'Via WhatsApp' :
                          (viewingOrder as any).payment_method || 'Non spécifié'}
                    </p>
                    <p className="text-gray-600">Sous-total: {parseFloat((viewingOrder as any).subtotal || '0').toLocaleString()} FCFA</p>
                    <p className="text-gray-600">Livraison: {parseFloat((viewingOrder as any).delivery_fee || '0').toLocaleString()} FCFA</p>
                    <p className="font-bold text-green-700 text-lg mt-1">Total: {parseFloat(viewingOrder.total_amount || '0').toLocaleString()} FCFA</p>
                  </div>
                </div>
              </div>

              {/* Items - Groupés par boutique pour multi-shop */}
              <div>
                {(viewingOrder as any).stores && (viewingOrder as any).stores.length > 1 && (
                  <div className="mb-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-sm font-medium text-indigo-800 flex items-center gap-2">
                      <User size={16} />
                      Commande multi-boutiques ({(viewingOrder as any).stores.length} boutiques)
                    </p>
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 mb-3">
                  Articles ({((viewingOrder as any).order_items || viewingOrder.items || []).length})
                </h3>
                {(() => {
                  const items = (viewingOrder as any).order_items || viewingOrder.items || [];
                  const stores = (viewingOrder as any).stores || [];
                  const isMultiShop = stores.length > 1;
                  
                  if (isMultiShop) {
                    // Grouper par boutique
                    const itemsByStore = new Map<number, any[]>();
                    items.forEach((item: any) => {
                      if (!itemsByStore.has(item.store_id)) itemsByStore.set(item.store_id, []);
                      itemsByStore.get(item.store_id)!.push(item);
                    });
                    
                    return (
                      <div className="space-y-4">
                        {Array.from(itemsByStore.entries()).map(([storeId, storeItems]) => {
                          const store = stores.find((s: any) => s.id === storeId);
                          const storeTotal = storeItems.reduce((sum, item) => sum + parseFloat(item.total_price || '0'), 0);
                          return (
                            <div key={storeId} className="border border-gray-200 rounded-xl overflow-hidden">
                              <div className="bg-indigo-50 px-3 sm:px-4 py-2 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-2">
                                <span className="font-medium text-indigo-900 text-sm">{store?.name || 'Boutique'}</span>
                                <span className="font-bold text-indigo-700 text-sm">{storeTotal.toLocaleString()} FCFA</span>
                              </div>
                              <div className="p-2 space-y-2">
                                {storeItems.map((item: any, idx: number) => {
                                  const productId = item.product_id || item.product?.id;
                                  const imgUrl = getProductImageUrl(item) || (productId ? loadedImages.get(productId) : null);
                                  return (
                                    <div key={item.id || idx} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                      <button
                                        onClick={(e) => { e.stopPropagation(); productId && handleProductClick(productId, item.product_slug || item.product?.slug) }}
                                        className={`w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 transition-all ${productId ? 'hover:ring-2 hover:ring-indigo-500 cursor-pointer' : 'cursor-default'}`}
                                        title={productId ? 'Voir le produit' : ''}
                                      >
                                        {imgUrl ? (
                                          <img src={imgUrl} alt={item.product_name || 'Produit'} className="h-full w-full object-cover" onError={(e) => { console.error('Image load error:', imgUrl); e.currentTarget.style.display = 'none'; }} />
                                        ) : (
                                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                            <Package className="text-gray-400" size={20} />
                                          </div>
                                        )}
                                      </button>
                                      <div className="flex-1 min-w-0">
                                        <button
                                          onClick={(e) => { e.stopPropagation(); productId && handleProductClick(productId, item.product_slug || item.product?.slug) }}
                                          className={`font-medium text-xs sm:text-sm text-gray-900 text-left block ${productId ? 'hover:text-indigo-600 cursor-pointer' : ''} transition-colors line-clamp-2`}
                                        >
                                          {item.product_name || item.product?.name || 'Produit'}
                                        </button>
                                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Qté: {item.quantity}</p>
                                      </div>
                                      <div className="text-right flex-shrink-0">
                                        <div className="text-[10px] sm:text-xs text-gray-500">{parseFloat(item.unit_price || '0').toLocaleString()} FCFA</div>
                                        <div className="font-semibold text-xs sm:text-sm text-gray-900">{parseFloat(item.total_price || '0').toLocaleString()} FCFA</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  } else {
                    // Affichage normal pour single-shop
                    return (
                      <div className="space-y-2">
                        {items.map((item: any, index: number) => {
                          const productId = item.product_id || item.product?.id;
                          const imgUrl = getProductImageUrl(item) || (productId ? loadedImages.get(productId) : null);
                          return (
                            <div key={item.id || index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors">
                              <button
                                onClick={(e) => { e.stopPropagation(); productId && handleProductClick(productId, item.product_slug || item.product?.slug) }}
                                className={`w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 transition-all ${productId ? 'hover:ring-2 hover:ring-indigo-500 cursor-pointer' : 'cursor-default'}`}
                                title={productId ? 'Voir le produit' : ''}
                              >
                                {imgUrl ? (
                                  <img src={imgUrl} alt={item.product_name || item.product?.name || 'Produit'} className="h-full w-full object-cover" onError={(e) => { console.error('Image load error:', imgUrl); e.currentTarget.style.display = 'none'; }} />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                    <Package className="text-gray-400" size={24} />
                                  </div>
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <button
                                  onClick={(e) => { e.stopPropagation(); productId && handleProductClick(productId, item.product_slug || item.product?.slug) }}
                                  className={`font-semibold text-xs sm:text-sm text-gray-900 text-left block ${productId ? 'hover:text-indigo-600 cursor-pointer' : ''} transition-colors line-clamp-2`}
                                >
                                  {item.product_name || item.product?.name || 'Produit'}
                                </button>
                                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Quantité: {item.quantity}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-[10px] sm:text-xs text-gray-500">{parseFloat(item.unit_price || '0').toLocaleString()} FCFA</div>
                                <div className="font-semibold text-xs sm:text-sm text-gray-900">{parseFloat(item.total_price || '0').toLocaleString()} FCFA</div>
                              </div>
                            </div>
                          );
                        })}
                        {items.length === 0 && (
                          <div className="text-center py-6 text-gray-500">
                            <Package size={32} className="mx-auto mb-2 text-gray-300" />
                            <p>Aucun article trouvé</p>
                          </div>
                        )}
                      </div>
                    );
                  }
                })()}
              </div>

              {/* Customer notes */}
              {(viewingOrder as any).customer_notes && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <h4 className="font-medium text-amber-900 mb-1 text-sm">Note du client</h4>
                  <p className="text-sm text-amber-800">{(viewingOrder as any).customer_notes}</p>
                </div>
              )}
            </div>

            {/* Footer with actions */}
            <div className="p-3 sm:p-4 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 flex-shrink-0 bg-gray-50 rounded-b-xl sm:rounded-b-2xl">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {canManageOrderActions && viewingOrder.status !== 'delivered' && viewingOrder.status !== 'cancelled' && (
                  <button
                    onClick={() => { setIsViewModalOpen(false); handleStatusClick(viewingOrder) }}
                    className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
                  >
                    <Edit size={14} />
                    Changer le statut
                  </button>
                )}
                {canCancelOrderActions && viewingOrder.status !== 'delivered' && viewingOrder.status !== 'cancelled' && (
                  <button
                    onClick={() => { setIsViewModalOpen(false); handleCancelOrder(viewingOrder) }}
                    className="px-3 sm:px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
                  >
                    <XCircle size={14} />
                    Annuler la commande
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white text-xs sm:text-sm font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal - Intelligent Flow */}
      {isStatusModalOpen && orderToUpdate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Modifier le statut</h2>
              <p className="text-sm text-gray-500">Commande #{(orderToUpdate as any).order_number || orderToUpdate.id}</p>
            </div>

            <div className="p-6 space-y-5">
              {/* Current status */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Statut actuel</label>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusInfo(orderToUpdate.status).bg}`}>
                  {React.createElement(getStatusInfo(orderToUpdate.status).icon, { size: 14 })}
                  {getStatusInfo(orderToUpdate.status).label}
                </span>
              </div>

              {/* Next status options */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Passer au statut</label>
                <div className="space-y-2">
                  {getNextStatuses(orderToUpdate.status).map((option) => {
                    const info = getStatusInfo(option.value);
                    const isCancelled = option.value === 'cancelled';
                    return (
                      <button
                        key={option.value}
                        onClick={() => setNewStatus(option.value)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                          newStatus === option.value
                            ? isCancelled ? 'border-red-400 bg-red-50' : 'border-indigo-400 bg-indigo-50'
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          newStatus === option.value
                            ? isCancelled ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {React.createElement(info.icon, { size: 16 })}
                        </div>
                        <span className={`font-medium text-sm ${
                          newStatus === option.value
                            ? isCancelled ? 'text-red-700' : 'text-indigo-700'
                            : 'text-gray-700'
                        }`}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Note (optionnel)
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm"
                  placeholder="Ajouter une note pour le client..."
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white text-sm font-medium"
                disabled={actionLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={actionLoading || newStatus === orderToUpdate.status}
                className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 text-sm font-medium ${
                  newStatus === 'cancelled' ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Mise à jour...
                  </>
                ) : (
                  'Confirmer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrdersPage
