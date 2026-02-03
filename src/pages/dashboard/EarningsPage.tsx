import React, { useState, useEffect } from 'react'
import { 
  Wallet, CreditCard, Building2, Smartphone,
  Clock, Plus,
  Banknote, TrendingUp, PiggyBank, Receipt, Loader2
} from 'lucide-react'
import { ordersService } from '../../lib/api/ordersService'

interface Transaction {
  id: string
  type: 'sale' | 'payout'
  amount: number
  date: string
  status: 'completed' | 'pending'
  description: string
}

const EarningsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'payouts'>('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    available: 0,
    pending: 0,
    totalEarned: 0,
    thisMonth: 0
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    loadEarnings()
  }, [])

  const loadEarnings = async () => {
    try {
      setLoading(true)
      
      // Charger les commandes pour calculer les revenus
      const ordersResponse = await ordersService.getOrders()
      const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : []
      
      // Calculer les revenus
      let totalEarned = 0
      let thisMonth = 0
      let pending = 0
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      
      const transactionsList: Transaction[] = []
      
      orders.forEach(order => {
        const amount = parseFloat(order.total_amount) || 0
        const orderDate = new Date(order.created_at)
        
        totalEarned += amount
        
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          thisMonth += amount
        }
        
        if (order.status === 'pending' || order.status === 'processing') {
          pending += amount
        }
        
        transactionsList.push({
          id: `TXN-${order.id}`,
          type: 'sale',
          amount,
          date: order.created_at,
          status: order.status === 'delivered' ? 'completed' : 'pending',
          description: `Commande #${order.id}`
        })
      })
      
      setStats({
        available: totalEarned - pending,
        pending,
        totalEarned,
        thisMonth
      })
      
      setTransactions(transactionsList.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ))
    } catch (error) {
      console.error('Erreur chargement revenus:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement des revenus...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenus</h1>
          <p className="text-gray-500 mt-1">Gérez vos revenus et retraits</p>
        </div>
        <button className="mt-4 md:mt-0 flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors">
          <Wallet size={18} />
          Demander un retrait
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Wallet size={24} />
            </div>
            <span className="text-emerald-100 text-sm">Disponible</span>
          </div>
          <p className="text-3xl font-bold">{stats.available.toLocaleString()} XOF</p>
          <p className="text-emerald-100 text-sm mt-2">Prêt à retirer</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock size={24} className="text-amber-600" />
            </div>
            <span className="text-gray-500 text-sm">En attente</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pending.toLocaleString()} XOF</p>
          <p className="text-gray-500 text-sm mt-2">En cours de traitement</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
            <span className="text-gray-500 text-sm">Ce mois</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.thisMonth.toLocaleString()} XOF</p>
          <p className="text-gray-500 text-sm mt-2">Revenus du mois</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <PiggyBank size={24} className="text-purple-600" />
            </div>
            <span className="text-gray-500 text-sm">Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalEarned.toLocaleString()} XOF</p>
          <p className="text-gray-500 text-sm mt-2">Depuis le début</p>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Méthodes de paiement</h2>
          <button className="flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700">
            <Plus size={18} />
            Ajouter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Orange Money */}
          <div className="border border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Banknote size={24} className="text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Orange Money</p>
                <p className="text-sm text-gray-500">Non configuré</p>
              </div>
            </div>
            <button className="w-full py-2 text-sm text-orange-600 font-medium hover:bg-orange-50 rounded-lg transition-colors">
              Configurer
            </button>
          </div>

          {/* Wave */}
          <div className="border border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <CreditCard size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Wave</p>
                <p className="text-sm text-gray-500">Non configuré</p>
              </div>
            </div>
            <button className="w-full py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
              Configurer
            </button>
          </div>

          {/* Moov Money */}
          <div className="border border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Smartphone size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Moov Money</p>
                <p className="text-sm text-gray-500">Non configuré</p>
              </div>
            </div>
            <button className="w-full py-2 text-sm text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">
              Configurer
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[
            { id: 'overview', label: 'Aperçu' },
            { id: 'transactions', label: 'Transactions' },
            { id: 'payouts', label: 'Retraits' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Receipt size={32} className="text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Aucune activité</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Vos revenus et transactions apparaîtront ici une fois que vous aurez effectué vos premières ventes.
              </p>
            </div>
          )}

          {activeTab === 'transactions' && (
            transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Banknote size={32} className="text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Aucune transaction</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  L'historique de vos transactions apparaîtra ici.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        txn.type === 'sale' ? 'bg-emerald-100' : 'bg-blue-100'
                      }`}>
                        {txn.type === 'sale' ? (
                          <TrendingUp size={20} className="text-emerald-600" />
                        ) : (
                          <Wallet size={20} className="text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{txn.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(txn.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${txn.type === 'sale' ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {txn.type === 'sale' ? '+' : '-'}{txn.amount.toLocaleString()} XOF
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        txn.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {txn.status === 'completed' ? 'Complété' : 'En attente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'payouts' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Wallet size={32} className="text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Aucun retrait</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                L'historique de vos retraits apparaîtra ici.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EarningsPage
