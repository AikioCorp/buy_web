import React, { useState } from 'react'
import { Search, Filter, Package, CheckCircle, Clock, XCircle, ChevronRight, Calendar } from 'lucide-react'

type OrderStatus = 'pending' | 'processing' | 'delivered' | 'cancelled'

interface Order {
  id: string
  shopName: string
  date: string
  total: number
  items: number
  status: OrderStatus
}

const OrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | OrderStatus>('all')
  
  // Mock orders data
  const orders: Order[] = [
    { id: 'ORD-2457', shopName: 'Électronique Plus', date: '2023-11-15', total: 35000, items: 2, status: 'delivered' },
    { id: 'ORD-2433', shopName: 'Mode Bamako', date: '2023-10-30', total: 12500, items: 1, status: 'processing' },
    { id: 'ORD-2422', shopName: 'Tout pour la Maison', date: '2023-10-22', total: 28900, items: 3, status: 'pending' },
    { id: 'ORD-2410', shopName: 'Librairie Centrale', date: '2023-10-15', total: 8500, items: 2, status: 'delivered' },
    { id: 'ORD-2397', shopName: 'Supermarché Express', date: '2023-10-07', total: 15200, items: 5, status: 'delivered' },
    { id: 'ORD-2385', shopName: 'Électronique Plus', date: '2023-09-28', total: 7500, items: 1, status: 'cancelled' },
    { id: 'ORD-2371', shopName: 'Mode Bamako', date: '2023-09-19', total: 22500, items: 2, status: 'delivered' }
  ]

  // Filter orders based on active tab
  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab)

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock size={18} className="text-yellow-500" />
      case 'processing':
        return <Package size={18} className="text-blue-500" />
      case 'delivered':
        return <CheckCircle size={18} className="text-green-500" />
      case 'cancelled':
        return <XCircle size={18} className="text-red-500" />
    }
  }

  const getStatusClass = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
    }
  }

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'En attente'
      case 'processing':
        return 'En traitement'
      case 'delivered':
        return 'Livrée'
      case 'cancelled':
        return 'Annulée'
    }
  }

  // Count orders by status
  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
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
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <button className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <Filter size={18} />
            <span>Filtres</span>
          </button>
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
                ? 'bg-blue-50 text-blue-700' 
                : 'hover:bg-gray-50'
            }`}
          >
            <Package size={16} />
            En traitement ({orderCounts.processing})
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
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{order.id}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusClass(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="mt-1 text-sm">
                    <p className="font-medium">{order.shopName}</p>
                    <p className="text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar size={14} />
                      {new Date(order.date).toLocaleDateString('fr-FR', { 
                        day: 'numeric',
                        month: 'long', 
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end">
                  <div className="font-bold text-green-600">
                    {order.total.toLocaleString()} XOF
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.items} {order.items > 1 ? 'articles' : 'article'}
                  </div>
                  <button className="flex items-center text-green-600 hover:text-green-800 gap-1 mt-2 text-sm font-medium">
                    Voir les détails
                    <ChevronRight size={16} />
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
              Vous n'avez pas encore de commandes {activeTab !== 'all' ? `${getStatusText(activeTab).toLowerCase()}s` : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage
