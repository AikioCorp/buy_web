import React, { useState, useEffect } from 'react'
import { Package, Search, ArrowUp, ArrowDown, Eye, Check, X, Clock, Loader2, RefreshCw } from 'lucide-react'
import { ordersService, Order as ApiOrder } from '../../lib/api/ordersService'

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface Order {
  id: string
  customer: string
  date: string
  total: number
  items: number
  status: OrderStatus
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<keyof Order>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await ordersService.getOrders()
      
      if (response.data) {
        const apiOrders = Array.isArray(response.data) ? response.data : []
        const formattedOrders: Order[] = apiOrders.map((order: ApiOrder) => ({
          id: `ORD-${order.id}`,
          customer: `Client #${order.customer || order.user}`,
          date: order.created_at,
          total: parseFloat(order.total_amount) || 0,
          items: order.items?.length || 0,
          status: order.status as OrderStatus
        }))
        setOrders(formattedOrders)
      }
    } catch (err: any) {
      console.error('Erreur chargement commandes:', err)
      setError('Impossible de charger les commandes')
      // Fallback avec données fictives pour la démo
      setOrders([
        { id: 'ORD-2021', customer: 'Ibrahim Touré', date: '2024-01-15', total: 12500, items: 2, status: 'delivered' },
        { id: 'ORD-2020', customer: 'Aminata Diallo', date: '2024-01-14', total: 8700, items: 1, status: 'processing' },
        { id: 'ORD-2019', customer: 'Moussa Keita', date: '2024-01-12', total: 14250, items: 3, status: 'pending' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: keyof Order) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: keyof Order) => {
    if (field !== sortField) return null
    return sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
  }

  
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock size={18} className="text-yellow-500" />
      case 'confirmed':
        return <Check size={18} className="text-blue-500" />
      case 'processing':
        return <Clock size={18} className="text-blue-500" />
      case 'shipped':
        return <Package size={18} className="text-purple-500" />
      case 'delivered':
        return <Check size={18} className="text-green-500" />
      case 'cancelled':
        return <X size={18} className="text-red-500" />
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
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'confirmed': return 'Confirmée'
      case 'processing': return 'En traitement'
      case 'shipped': return 'Expédiée'
      case 'delivered': return 'Livrée'
      case 'cancelled': return 'Annulée'
      default: return status
    }
  }

  // Filtrer les commandes
  const filteredOrders = orders.filter(order => {
    const matchesFilter = activeFilter === 'all' || order.status === activeFilter
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Compter par statut
  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  // État de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement des commandes...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Commandes</h1>
          <button 
            onClick={loadOrders}
            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Actualiser"
          >
            <RefreshCw size={18} />
          </button>
        </div>
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

      {error && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          {error} - Affichage des données de démonstration
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex p-4 border-b border-gray-200 overflow-x-auto">
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-md font-medium whitespace-nowrap ${activeFilter === 'all' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'}`}
            >
              Toutes ({statusCounts.all})
            </button>
            <button 
              onClick={() => setActiveFilter('pending')}
              className={`px-3 py-1 rounded-md whitespace-nowrap ${activeFilter === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'hover:bg-gray-50'}`}
            >
              En attente ({statusCounts.pending})
            </button>
            <button 
              onClick={() => setActiveFilter('processing')}
              className={`px-3 py-1 rounded-md whitespace-nowrap ${activeFilter === 'processing' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
            >
              En traitement ({statusCounts.processing})
            </button>
            <button 
              onClick={() => setActiveFilter('delivered')}
              className={`px-3 py-1 rounded-md whitespace-nowrap ${activeFilter === 'delivered' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'}`}
            >
              Livrées ({statusCounts.delivered})
            </button>
            <button 
              onClick={() => setActiveFilter('cancelled')}
              className={`px-3 py-1 rounded-md whitespace-nowrap ${activeFilter === 'cancelled' ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50'}`}
            >
              Annulées ({statusCounts.cancelled})
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-1">
                    Commande # {getSortIcon('id')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('customer')}
                >
                  <div className="flex items-center gap-1">
                    Client {getSortIcon('customer')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Date {getSortIcon('date')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center gap-1">
                    Total {getSortIcon('total')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Statut {getSortIcon('status')}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune commande trouvée</p>
                  </td>
                </tr>
              ) : filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(order.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.total.toLocaleString()} XOF
                    </div>
                    <div className="text-xs text-gray-500">{order.items} article{order.items > 1 ? 's' : ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <span className={`ml-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-green-600 hover:text-green-900 flex items-center gap-1 justify-end">
                      <Eye size={16} />
                      <span>Détails</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Précédent
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">1</span> à <span className="font-medium">8</span> sur <span className="font-medium">8</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Précédent
                </button>
                <button className="bg-green-50 border-green-500 text-green-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrdersPage
