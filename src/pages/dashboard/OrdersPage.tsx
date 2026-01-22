import React, { useState } from 'react'
import { Package, Search, Filter, ArrowUp, ArrowDown, Eye, Check, X, Clock } from 'lucide-react'

type OrderStatus = 'pending' | 'processing' | 'delivered' | 'cancelled'

interface Order {
  id: string
  customer: string
  date: string
  total: number
  items: number
  status: OrderStatus
}

const OrdersPage: React.FC = () => {
  const [sortField, setSortField] = useState<keyof Order>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Mock orders data
  const orders: Order[] = [
    { id: 'ORD-2021', customer: 'Ibrahim Touré', date: '2023-11-15', total: 12500, items: 2, status: 'delivered' },
    { id: 'ORD-2020', customer: 'Aminata Diallo', date: '2023-11-14', total: 8700, items: 1, status: 'processing' },
    { id: 'ORD-2019', customer: 'Moussa Keita', date: '2023-11-12', total: 14250, items: 3, status: 'pending' },
    { id: 'ORD-2018', customer: 'Fatoumata Sylla', date: '2023-11-10', total: 5800, items: 1, status: 'delivered' },
    { id: 'ORD-2017', customer: 'Mamadou Coulibaly', date: '2023-11-08', total: 24500, items: 4, status: 'cancelled' },
    { id: 'ORD-2016', customer: 'Kadiatou Bah', date: '2023-11-07', total: 10200, items: 2, status: 'delivered' },
    { id: 'ORD-2015', customer: 'Oumar Diop', date: '2023-11-05', total: 7500, items: 1, status: 'processing' },
    { id: 'ORD-2014', customer: 'Aïssata Camara', date: '2023-11-03', total: 18900, items: 3, status: 'delivered' },
  ]

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

  // Sort orders based on current sort field and direction
  const sortedOrders = [...orders].sort((a, b) => {
    if (sortField === 'total' || sortField === 'items') {
      return sortDirection === 'asc'
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField]
    }
    
    // For string fields
    const valA = String(a[sortField]).toLowerCase()
    const valB = String(b[sortField]).toLowerCase()
    
    return sortDirection === 'asc'
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA)
  })

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock size={18} className="text-yellow-500" />
      case 'processing':
        return <Clock size={18} className="text-blue-500" />
      case 'delivered':
        return <Check size={18} className="text-green-500" />
      case 'cancelled':
        return <X size={18} className="text-red-500" />
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

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Commandes</h1>
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex p-4 border-b border-gray-200">
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-md bg-green-50 text-green-700 font-medium">
              Toutes (8)
            </button>
            <button className="px-3 py-1 rounded-md hover:bg-gray-50">
              En attente (1)
            </button>
            <button className="px-3 py-1 rounded-md hover:bg-gray-50">
              En traitement (2)
            </button>
            <button className="px-3 py-1 rounded-md hover:bg-gray-50">
              Livrées (4)
            </button>
            <button className="px-3 py-1 rounded-md hover:bg-gray-50">
              Annulées (1)
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
              {sortedOrders.map(order => (
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
                        {order.status === 'pending' && 'En attente'}
                        {order.status === 'processing' && 'En traitement'}
                        {order.status === 'delivered' && 'Livrée'}
                        {order.status === 'cancelled' && 'Annulée'}
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
