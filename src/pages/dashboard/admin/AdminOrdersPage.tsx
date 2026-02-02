import React, { useState, useEffect } from 'react'
import { 
  Search, ShoppingCart, Eye, X, CheckCircle, Clock, Truck, XCircle,
  AlertTriangle, Ban, Loader2, RefreshCw, Package, MapPin, Phone, CreditCard
} from 'lucide-react'
import { ordersService, Order, OrderStatus } from '../../../lib/api/ordersService'
import { usePermissions } from '../../../hooks/usePermissions'
import { useToast } from '../../../components/Toast'

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
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

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

  const handleUpdateStatus = async (order: Order, newStatus: OrderStatus) => {
    if (!canManageOrders()) return
    try {
      setActionLoading(true)
      await ordersService.updateOrderStatus(order.id, newStatus)
      loadOrders()
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour', 'error')
    } finally {
      setActionLoading(false)
    }
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
          <p className="text-blue-100 text-sm">Total</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl p-4 text-white shadow-lg">
          <p className="text-yellow-100 text-sm">En attente</p>
          <p className="text-2xl font-bold mt-1">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-4 text-white shadow-lg">
          <p className="text-blue-100 text-sm">En cours</p>
          <p className="text-2xl font-bold mt-1">{stats.processing}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-4 text-white shadow-lg">
          <p className="text-purple-100 text-sm">Expédiées</p>
          <p className="text-2xl font-bold mt-1">{stats.shipped}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg">
          <p className="text-green-100 text-sm">Livrées</p>
          <p className="text-2xl font-bold mt-1">{stats.delivered}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-4 text-white shadow-lg">
          <p className="text-red-100 text-sm">Annulées</p>
          <p className="text-2xl font-bold mt-1">{stats.cancelled}</p>
        </div>
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
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) handleUpdateStatus(order, e.target.value as OrderStatus)
                            }}
                            className="px-2 py-1 text-sm bg-gray-50 border border-gray-200 rounded-lg"
                            disabled={actionLoading}
                          >
                            <option value="">Changer statut</option>
                            {order.status === 'pending' && <option value="processing">En cours</option>}
                            {order.status === 'processing' && <option value="shipped">Expédié</option>}
                            {order.status === 'shipped' && <option value="delivered">Livré</option>}
                          </select>
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
                <h3 className="font-semibold text-gray-900 mb-3">
                  Articles ({((viewingOrder as any).order_items || viewingOrder.items || []).length})
                </h3>
                <div className="space-y-2">
                  {((viewingOrder as any).order_items || []).length > 0 ? (
                    (viewingOrder as any).order_items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {item.product_image ? (
                              <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                            ) : (
                              <Package size={20} className="text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.product_name || 'Produit'}</p>
                            <p className="text-sm text-gray-500">Qté: {item.quantity} × {parseFloat(item.unit_price || '0').toLocaleString()} FCFA</p>
                          </div>
                        </div>
                        <p className="font-bold text-green-600">{parseFloat(item.total_price || '0').toLocaleString()} FCFA</p>
                      </div>
                    ))
                  ) : viewingOrder.items?.length ? (
                    viewingOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package size={20} className="text-gray-400" />
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
    </div>
  )
}

export default AdminOrdersPage
