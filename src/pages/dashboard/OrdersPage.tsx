import React, { useState, useEffect } from 'react'
import {
  Package, Search, Eye, X, Clock, Loader2, RefreshCw,
  Truck, CheckCircle, XCircle, ShoppingBag, Phone, MapPin,
  User, Calendar, CreditCard, MessageSquare, Printer, Download
} from 'lucide-react'
import { ordersService, Order, OrderStatus } from '../../lib/api/ordersService'
import { useToast } from '../../components/Toast'

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

const OrdersPage: React.FC = () => {
  const { showToast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('')

  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [orderToUpdate, setOrderToUpdate] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending')
  const [statusNote, setStatusNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const pageSize = 20

  useEffect(() => {
    loadOrders()
  }, [currentPage, searchQuery, selectedStatus])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await ordersService.getOrders()

      if (response.data) {
        if (Array.isArray(response.data)) {
          setOrders(response.data)
          setTotalCount(response.data.length)
        } else if (response.data.results) {
          setOrders(response.data.results)
          setTotalCount(response.data.count)
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
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Commandes</h1>
          <p className="text-gray-600 mt-1">
            {totalCount} commande{totalCount > 1 ? 's' : ''} au total
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
        >
          <RefreshCw size={18} />
          Actualiser
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center gap-2">
            <Clock className="text-yellow-600" size={20} />
            <span className="text-sm font-medium text-yellow-800">En attente</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900 mt-2">
            {orders.filter(o => o.status === 'pending').length}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2">
            <Package className="text-purple-600" size={20} />
            <span className="text-sm font-medium text-purple-800">En préparation</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-2">
            {orders.filter(o => o.status === 'processing').length}
          </p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <div className="flex items-center gap-2">
            <Truck className="text-indigo-600" size={20} />
            <span className="text-sm font-medium text-indigo-800">Expédiées</span>
          </div>
          <p className="text-2xl font-bold text-indigo-900 mt-2">
            {orders.filter(o => o.status === 'shipped').length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-sm font-medium text-green-800">Livrées</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-2">
            {orders.filter(o => o.status === 'delivered').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher une commande..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </form>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as OrderStatus | '')
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
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
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <ShoppingBag className="text-emerald-600" size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Client #{order.customer}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.items?.length || 0} article{(order.items?.length || 0) > 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatPrice(order.total_amount)}
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
                            onClick={() => handleViewOrder(order)}
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
                  <span className="text-sm text-gray-500">Total de la commande</span>
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatPrice(viewingOrder.total_amount)}
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
                    <span>Client #{viewingOrder.customer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <span>{(viewingOrder as any).phone || 'Non renseigné'}</span>
                  </div>
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                    <span>{(viewingOrder as any).shipping_address || 'Adresse non renseignée'}</span>
                  </div>
                </div>
              </div>

              {/* Articles commandés */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Package size={18} />
                  Articles commandés ({viewingOrder.items?.length || 0})
                </h3>
                <div className="space-y-3">
                  {(viewingOrder.items || []).map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
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
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{item.product?.name || 'Produit'}</div>
                        <div className="text-sm text-gray-500">
                          {item.variant ? `Variante: ${item.variant}` : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">x{item.quantity}</div>
                        <div className="font-medium text-gray-900">{formatPrice(item.unit_price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Récapitulatif */}
              <div className="border-t border-gray-200 mt-6 pt-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sous-total</span>
                    <span>{formatPrice(viewingOrder.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Livraison</span>
                    <span>{formatPrice((viewingOrder as any).shipping_cost || 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-emerald-600">{formatPrice(viewingOrder.total_amount)}</span>
                  </div>
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
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note (optionnel)
                  </label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Ajouter une note pour le client..."
                  />
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Le client sera notifié par email et SMS du changement de statut.
                </p>
              </div>
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
