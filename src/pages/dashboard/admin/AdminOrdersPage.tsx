import React, { useState, useEffect } from 'react'
import {
  Search, ShoppingCart, Eye, X, CheckCircle, Clock, Truck, XCircle,
  AlertTriangle, Ban, Loader2, RefreshCw, Package, MapPin, Phone, CreditCard, Edit, User
} from 'lucide-react'
import { ordersService, Order, OrderStatus } from '../../../lib/api/ordersService'
import { usePermissions } from '../../../hooks/usePermissions'
import { useToast } from '../../../components/Toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://apibuy.buymore.ml'

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

const AdminOrdersPage: React.FC = () => {
  const { showToast } = useToast()
  const {
    canViewOrders,
    canManageOrders,
    canCancelOrders
  } = usePermissions()

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

  const handleProductClick = (productId: number) => {
    if (productId) {
      window.open(`/products/${productId}`, '_blank')
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
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  useEffect(() => {
    loadOrders()
  }, [currentPage, searchQuery, statusFilter])

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
        } else {
          console.log('Admin No orders found, data structure:', actualData)
          setOrders([])
          setTotalCount(0)
        }
      }
    } catch (err: any) {
      console.error('Admin Orders error:', err)
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

  const getImageUrl = (item: any): string | null => {
    if (!item) return null;
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://apibuy.buymore.ml'

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

  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return { icon: Clock, label: 'En attente', bg: 'bg-yellow-100 text-yellow-700' }
      case 'processing': return { icon: Package, label: 'En cours', bg: 'bg-blue-100 text-blue-700' }
      case 'shipped': return { icon: Truck, label: 'Expédié', bg: 'bg-purple-100 text-purple-700' }
      case 'delivered': return { icon: CheckCircle, label: 'Livré', bg: 'bg-green-100 text-green-700' }
      case 'cancelled': return { icon: XCircle, label: 'Annulé', bg: 'bg-red-100 text-red-700' }
      default: return { icon: Clock, label: status, bg: 'bg-gray-100 text-gray-700' }
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

      {/* Stats Cards - Clickable to filter */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {([
          { key: 'all' as const, label: 'Total', value: stats.total, gradient: 'from-blue-500 to-blue-600', light: 'text-blue-100', ring: 'ring-blue-300' },
          { key: 'pending' as const, label: 'En attente', value: stats.pending, gradient: 'from-yellow-500 to-amber-500', light: 'text-yellow-100', ring: 'ring-yellow-300' },
          { key: 'processing' as const, label: 'En cours', value: stats.processing, gradient: 'from-blue-400 to-cyan-500', light: 'text-blue-100', ring: 'ring-cyan-300' },
          { key: 'shipped' as const, label: 'Expédiées', value: stats.shipped, gradient: 'from-purple-500 to-violet-600', light: 'text-purple-100', ring: 'ring-purple-300' },
          { key: 'delivered' as const, label: 'Livrées', value: stats.delivered, gradient: 'from-green-500 to-emerald-600', light: 'text-green-100', ring: 'ring-green-300' },
          { key: 'cancelled' as const, label: 'Annulées', value: stats.cancelled, gradient: 'from-red-500 to-rose-600', light: 'text-red-100', ring: 'ring-red-300' },
        ]).map(card => (
          <button
            key={card.key}
            onClick={() => { setStatusFilter(card.key); setCurrentPage(1) }}
            className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-4 text-white shadow-lg text-left transition-all hover:scale-105 hover:shadow-xl ${statusFilter === card.key ? `ring-4 ${card.ring} scale-105` : ''}`}
          >
            <p className={`${card.light} text-sm`}>{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une commande..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100"
            />
          </form>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="processing">En cours</option>
              <option value="shipped">Expédié</option>
              <option value="delivered">Livré</option>
              <option value="cancelled">Annulé</option>
            </select>
            <button onClick={loadOrders} className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100">
              <RefreshCw size={20} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
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
                return (
                  <tr key={order.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">#{order.id}</p>
                      <p className="text-sm text-gray-500">{order.items?.length || 0} articles</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{(order as any).user?.username || (order as any).customer_name || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{(order as any).user?.email || (order as any).customer_email || ''}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-blue-600">{parseFloat(order.total_amount || '0').toLocaleString()} FCFA</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg}`}>
                        <statusInfo.icon size={12} />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100">
                        <button onClick={() => handleViewOrder(order)} className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg" title="Voir">
                          <Eye size={18} />
                        </button>
                        {canManageOrders() && order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusClick(order)}
                            className="p-2 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-lg"
                            title="Modifier le statut"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        {canCancelOrders() && order.status !== 'delivered' && order.status !== 'cancelled' && (
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

      {/* View Modal */}
      {isViewModalOpen && viewingOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Commande #{viewingOrder.id}</h2>
                <p className="text-sm text-gray-500">{viewingOrder.created_at ? new Date(viewingOrder.created_at).toLocaleString('fr-FR') : ''}</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
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
                    <p className="text-gray-600">Sous-total: {parseFloat((viewingOrder as any).subtotal || '0').toLocaleString()} FCFA</p>
                    <p className="text-gray-600">Livraison: {parseFloat((viewingOrder as any).delivery_fee || '0').toLocaleString()} FCFA</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                {/* Show stores involved */}
                {(viewingOrder as any).stores && (viewingOrder as any).stores.length > 1 && (
                  <div className="mb-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-sm font-medium text-indigo-800 flex items-center gap-2">
                      <User size={16} />
                      Commande multi-boutiques: {(viewingOrder as any).stores.map((s: any) => s.name).join(', ')}
                    </p>
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 mb-3">
                  Articles ({((viewingOrder as any).order_items || viewingOrder.items || []).length})
                </h3>
                <div className="space-y-2">
                  {((viewingOrder as any).order_items || []).length > 0 ? (
                    (viewingOrder as any).order_items.map((item: any, index: number) => {
                      const storeName = (viewingOrder as any).stores?.find((s: any) => s.id === item.store_id)?.name;
                      return (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors">
                        <button
                          onClick={() => handleProductClick(item.product_id || item.product?.id)}
                          className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer"
                          title="Voir le produit"
                        >
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
                        </button>
                        <div className="flex-1">
                          <button
                            onClick={() => handleProductClick(item.product_id || item.product?.id)}
                            className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors text-left block"
                          >
                            {item.product_name || 'Produit'}
                          </button>
                          <p className="text-sm text-gray-500">
                            Quantité: {item.quantity}
                            {storeName && <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">{storeName}</span>}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">{parseFloat(item.unit_price || '0').toLocaleString()} FCFA</div>
                          <div className="font-semibold text-gray-900">{parseFloat(item.total_price || '0').toLocaleString()} FCFA</div>
                        </div>
                      </div>
                    )})
                  ) : viewingOrder.items?.length ? (
                    viewingOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {getImageUrl(item) ? (
                              <img
                                src={getImageUrl(item)!}
                                alt={(item as any).product?.name || (item as any).product_name || 'Produit'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package size={20} className="text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{(item as any).product?.name || (item as any).product_name || 'Produit'}</p>
                            <p className="text-sm text-gray-500">Qté: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-bold text-green-600">{parseFloat(item.unit_price || '0').toLocaleString()} FCFA</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Package size={32} className="mx-auto mb-2 text-gray-300" />
                      <p>Aucun article trouvé</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-600 p-5 rounded-xl text-white">
                <span className="font-semibold text-lg">Total</span>
                <span className="text-3xl font-bold">{parseFloat(viewingOrder.total_amount || '0').toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal - SuperAdmin Style */}
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
                <div>{getStatusInfo(orderToUpdate.status).label}</div>
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
    </div>
  )
}

export default AdminOrdersPage
