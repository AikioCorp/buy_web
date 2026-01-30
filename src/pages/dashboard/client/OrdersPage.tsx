import React, { useState, useEffect } from 'react'
import { Search, Package, CheckCircle, Clock, XCircle, Calendar, Loader2, Truck, Eye, X } from 'lucide-react'
import { ordersService, Order, OrderStatus } from '../../../lib/api/ordersService'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend.buymore.ml'

const getImageUrl = (media?: Array<{ image_url?: string; file?: string; is_primary?: boolean }>): string | null => {
  if (!media || media.length === 0) return null
  const primaryImage = media.find(m => m.is_primary) || media[0]
  let url = primaryImage?.image_url || primaryImage?.file
  if (!url) return null
  if (url.startsWith('http://')) url = url.replace('http://', 'https://')
  if (url.startsWith('https://')) return url
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | OrderStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await ordersService.getMyOrders()
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          setOrders(response.data)
        } else if ((response.data as any).results) {
          setOrders((response.data as any).results)
        } else {
          setOrders([])
        }
      }
    } catch (err: any) {
      console.error('Erreur chargement commandes:', err)
      setError(err.message || 'Erreur lors du chargement des commandes')
    } finally {
      setLoading(false)
    }
  }

  // Filter orders based on active tab and search
  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'all' || order.status === activeTab
    const matchesSearch = searchQuery === '' || 
      order.id.toString().includes(searchQuery) ||
      order.items?.some(item => item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesTab && matchesSearch
  })

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock size={18} className="text-yellow-500" />
      case 'confirmed':
        return <CheckCircle size={18} className="text-blue-500" />
      case 'processing':
        return <Package size={18} className="text-purple-500" />
      case 'shipped':
        return <Truck size={18} className="text-indigo-500" />
      case 'delivered':
        return <CheckCircle size={18} className="text-green-500" />
      case 'cancelled':
        return <XCircle size={18} className="text-red-500" />
      default:
        return <Clock size={18} className="text-gray-500" />
    }
  }

  const getStatusClass = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-purple-100 text-purple-800'
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'En attente'
      case 'confirmed':
        return 'Confirmée'
      case 'processing':
        return 'En préparation'
      case 'shipped':
        return 'Expédiée'
      case 'delivered':
        return 'Livrée'
      case 'cancelled':
        return 'Annulée'
      default:
        return status
    }
  }

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('fr-FR').format(Number(price)) + ' FCFA'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Count orders by status
  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  }

  const handleViewOrder = (order: Order) => {
    setViewingOrder(order)
    setIsViewModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Chargement des commandes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-red-800">Erreur</h3>
        <p className="text-red-600 mt-1">{error}</p>
        <button 
          onClick={loadOrders}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Mes commandes</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une commande..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="flex overflow-x-auto p-4 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap mr-2 ${
              activeTab === 'all' 
                ? 'bg-green-50 text-green-700' 
                : 'hover:bg-gray-50'
            }`}
          >
            Toutes ({orderCounts.all})
          </button>
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap mr-2 flex items-center gap-1 ${
              activeTab === 'pending' 
                ? 'bg-yellow-50 text-yellow-700' 
                : 'hover:bg-gray-50'
            }`}
          >
            <Clock size={16} />
            En attente ({orderCounts.pending})
          </button>
          <button 
            onClick={() => setActiveTab('processing')}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap mr-2 flex items-center gap-1 ${
              activeTab === 'processing' 
                ? 'bg-purple-50 text-purple-700' 
                : 'hover:bg-gray-50'
            }`}
          >
            <Package size={16} />
            En préparation ({orderCounts.processing})
          </button>
          <button 
            onClick={() => setActiveTab('shipped')}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap mr-2 flex items-center gap-1 ${
              activeTab === 'shipped' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'hover:bg-gray-50'
            }`}
          >
            <Truck size={16} />
            Expédiées ({orderCounts.shipped})
          </button>
          <button 
            onClick={() => setActiveTab('delivered')}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap mr-2 flex items-center gap-1 ${
              activeTab === 'delivered' 
                ? 'bg-green-50 text-green-700' 
                : 'hover:bg-gray-50'
            }`}
          >
            <CheckCircle size={16} />
            Livrées ({orderCounts.delivered})
          </button>
          <button 
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'cancelled' 
                ? 'bg-red-50 text-red-700' 
                : 'hover:bg-gray-50'
            }`}
          >
            <XCircle size={16} />
            Annulées ({orderCounts.cancelled})
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredOrders.map((order) => (
            <div key={order.id} className="p-4 hover:bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex gap-4">
                  {/* Image du premier produit */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {order.items?.[0]?.product?.media && getImageUrl(order.items[0].product.media) ? (
                      <img 
                        src={getImageUrl(order.items[0].product.media)!} 
                        alt={order.items[0].product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">Commande #{order.id}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusClass(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm">
                      <p className="text-gray-700">
                        {order.items?.length || 0} article{(order.items?.length || 0) > 1 ? 's' : ''}
                        {order.items?.[0]?.product?.store?.name && (
                          <span className="text-gray-500"> • {order.items[0].product.store.name}</span>
                        )}
                      </p>
                      <p className="text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar size={14} />
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end">
                  <div className="font-bold text-green-600">
                    {formatPrice(order.total_amount)}
                  </div>
                  <button 
                    onClick={() => handleViewOrder(order)}
                    className="flex items-center text-green-600 hover:text-green-800 gap-1 mt-2 text-sm font-medium"
                  >
                    <Eye size={16} />
                    Voir les détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-8 text-center">
            <div className="inline-flex rounded-full bg-yellow-100 p-3 mb-4">
              <Package size={24} className="text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium">Aucune commande trouvée</h3>
            <p className="text-gray-500 mt-1">
              {orders.length === 0 
                ? "Vous n'avez pas encore passé de commande"
                : `Aucune commande ${activeTab !== 'all' ? getStatusText(activeTab as OrderStatus).toLowerCase() : ''}`
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de détails de commande */}
      {isViewModalOpen && viewingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">Commande #{viewingOrder.id}</h2>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Statut */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Statut</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusClass(viewingOrder.status)}`}>
                  {getStatusIcon(viewingOrder.status)}
                  {getStatusText(viewingOrder.status)}
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Date de commande</span>
                <span className="font-medium">{formatDate(viewingOrder.created_at)}</span>
              </div>

              {/* Articles */}
              <div>
                <h3 className="font-semibold mb-3">Articles commandés</h3>
                <div className="space-y-3">
                  {viewingOrder.items?.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product?.media && getImageUrl(item.product.media) ? (
                          <img 
                            src={getImageUrl(item.product.media)!} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.product?.name || 'Produit'}</p>
                        <p className="text-sm text-gray-500">
                          {item.product?.store?.name}
                        </p>
                        <div className="flex justify-between mt-1">
                          <span className="text-sm text-gray-600">Qté: {item.quantity}</span>
                          <span className="font-medium text-green-600">{formatPrice(item.unit_price)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">{formatPrice(viewingOrder.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersPage
