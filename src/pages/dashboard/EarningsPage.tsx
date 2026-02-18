import React, { useState, useEffect, useMemo } from 'react'
import { 
  Wallet, Smartphone, Clock, Loader2, X, AlertTriangle,
  Banknote, TrendingUp, PiggyBank, Receipt, CheckCircle,
  XCircle, ArrowDownCircle, Info
} from 'lucide-react'
import { vendorService, WithdrawalRequest } from '../../lib/api/vendorService'

const METHODS = [
  { id: 'orange_money', name: 'Orange Money', icon: '🟠', color: 'orange', fee: '1.5%', desc: 'Frais de transfert: 1.5% (min 100, max 5 000 XOF)' },
  { id: 'moov_money', name: 'Moov Money', icon: '🔵', color: 'blue', fee: '1.5%', desc: 'Frais de transfert: 1.5% (min 100, max 5 000 XOF)' },
  { id: 'wave', name: 'Wave', icon: '🌊', color: 'cyan', fee: '1%', desc: 'Frais de transfert: 1%' },
  { id: 'cash', name: 'Espèces', icon: '💵', color: 'green', fee: '0%', desc: 'Retrait en espèces - aucun frais' },
]

function calcFee(method: string, amount: number): number {
  if (method === 'orange_money' || method === 'moov_money') {
    let fee = Math.round(amount * 1.5 / 100)
    if (fee < 100) fee = 100
    if (fee > 5000) fee = 5000
    return fee
  }
  if (method === 'wave') return Math.round(amount * 1 / 100)
  return 0
}

const EarningsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'payouts'>('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    available: 0,
    pending: 0,
    totalEarned: 0,
    thisMonth: 0,
    totalPaidOut: 0,
  })
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [transactions, setTransactions] = useState<any[]>([])

  // Withdrawal modal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [wMethod, setWMethod] = useState('orange_money')
  const [wAmount, setWAmount] = useState('')
  const [wPhone, setWPhone] = useState('')
  const [wName, setWName] = useState('')
  const [wNotes, setWNotes] = useState('')
  const [wLoading, setWLoading] = useState(false)
  const [wError, setWError] = useState('')
  const [wSuccess, setWSuccess] = useState('')

  useEffect(() => {
    loadEarnings()
  }, [])

  const loadEarnings = async () => {
    try {
      setLoading(true)
      
      const [statsRes, withdrawalsRes, revenueRes] = await Promise.all([
        vendorService.getStats(),
        vendorService.getMyWithdrawals(),
        vendorService.getRevenue({ page_size: 50 }),
      ])

      if (statsRes.data) {
        const d = (statsRes.data as any).data || statsRes.data
        setStats({
          available: d.revenue_available || 0,
          pending: d.revenue_total - (d.revenue_available || 0) - (d.total_paid_out || 0),
          totalEarned: d.revenue_total || 0,
          thisMonth: d.revenue_month || 0,
          totalPaidOut: d.total_paid_out || 0,
        })
      }

      if (withdrawalsRes.data) {
        const wd = (withdrawalsRes.data as any).data || withdrawalsRes.data
        setWithdrawals(wd.withdrawals || [])
      }

      if (revenueRes.data) {
        const rd = (revenueRes.data as any).data || revenueRes.data
        setTransactions(rd.transactions || [])
      }
    } catch (error) {
      console.error('Erreur chargement revenus:', error)
    } finally {
      setLoading(false)
    }
  }

  const wFee = useMemo(() => calcFee(wMethod, parseFloat(wAmount) || 0), [wMethod, wAmount])
  const wNet = useMemo(() => Math.max(0, (parseFloat(wAmount) || 0) - wFee), [wAmount, wFee])

  const handleWithdraw = async () => {
    setWError('')
    setWSuccess('')
    const amount = parseFloat(wAmount)
    if (!amount || amount < 500) {
      setWError('Le montant minimum est de 500 XOF')
      return
    }
    if (amount > stats.available) {
      setWError(`Solde insuffisant. Disponible: ${stats.available.toLocaleString()} XOF`)
      return
    }
    if (['orange_money', 'moov_money', 'wave'].includes(wMethod) && !wPhone) {
      setWError('Le numéro de téléphone est requis')
      return
    }

    try {
      setWLoading(true)
      const res = await vendorService.createWithdrawal({
        amount,
        method: wMethod,
        phone_number: wPhone || undefined,
        account_name: wName || undefined,
        notes: wNotes || undefined,
      })
      if (res.error) {
        setWError(typeof res.error === 'string' ? res.error : 'Erreur lors de la demande')
        return
      }
      setWSuccess('Demande de retrait envoyée avec succès !')
      setWAmount('')
      setWPhone('')
      setWName('')
      setWNotes('')
      setTimeout(() => {
        setShowWithdrawModal(false)
        setWSuccess('')
        loadEarnings()
      }, 2000)
    } catch (err: any) {
      setWError(err.message || 'Erreur lors de la demande')
    } finally {
      setWLoading(false)
    }
  }

  const getWithdrawalStatusBadge = (status: string) => {
    const config: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
      pending: { label: 'En attente', cls: 'bg-yellow-100 text-yellow-800', icon: <Clock size={12} /> },
      approved: { label: 'Approuvé', cls: 'bg-green-100 text-green-800', icon: <CheckCircle size={12} /> },
      rejected: { label: 'Rejeté', cls: 'bg-red-100 text-red-800', icon: <XCircle size={12} /> },
      processing: { label: 'En cours', cls: 'bg-blue-100 text-blue-800', icon: <Loader2 size={12} /> },
      completed: { label: 'Effectué', cls: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle size={12} /> },
    }
    const c = config[status] || config.pending
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${c.cls}`}>
        {c.icon} {c.label}
      </span>
    )
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  const formatAmount = (a: number) => a.toLocaleString('fr-FR') + ' XOF'

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
          <p className="text-gray-500 mt-1">Gérez vos revenus et demandes de retrait</p>
        </div>
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="mt-4 md:mt-0 flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
        >
          <ArrowDownCircle size={18} />
          Demander un retrait
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Wallet size={24} />
            </div>
            <span className="text-emerald-100 text-sm">Disponible</span>
          </div>
          <p className="text-3xl font-bold">{formatAmount(stats.available)}</p>
          <p className="text-emerald-100 text-sm mt-2">Prêt à retirer</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
            <span className="text-gray-500 text-sm">Ce mois</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatAmount(stats.thisMonth)}</p>
          <p className="text-gray-500 text-sm mt-2">Revenus du mois</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <PiggyBank size={24} className="text-purple-600" />
            </div>
            <span className="text-gray-500 text-sm">Total gagné</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatAmount(stats.totalEarned)}</p>
          <p className="text-gray-500 text-sm mt-2">Depuis le début</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Banknote size={24} className="text-amber-600" />
            </div>
            <span className="text-gray-500 text-sm">Total retiré</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatAmount(stats.totalPaidOut)}</p>
          <p className="text-gray-500 text-sm mt-2">Déjà versé</p>
        </div>
      </div>

      {/* Mobile Money Fees Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <Info size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-900">Frais de transfert mobile money</p>
          <p className="text-sm text-amber-700 mt-1">
            Les frais de transfert s'appliquent lors des retraits : <strong>Orange Money & Moov Money : 1.5%</strong> (min 100, max 5 000 XOF) • <strong>Wave : 1%</strong> • <strong>Espèces : gratuit</strong>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[
            { id: 'overview', label: 'Transactions', count: transactions.length },
            { id: 'payouts', label: 'Mes retraits', count: withdrawals.length },
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
              {tab.label} {tab.count > 0 && <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{tab.count}</span>}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Receipt size={32} className="text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Aucune transaction</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Vos revenus apparaîtront ici une fois que vous aurez effectué vos premières ventes livrées.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((txn: any) => (
                  <div key={txn.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <TrendingUp size={20} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{txn.product_name || 'Vente'}</p>
                        <p className="text-sm text-gray-500">
                          {txn.orders?.order_number ? `#${txn.orders.order_number}` : ''} • {txn.quantity}x • {formatDate(txn.created_at || txn.orders?.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">+{formatAmount(parseFloat(txn.total_price) || 0)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        txn.orders?.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {txn.orders?.status === 'delivered' ? 'Livré' : txn.orders?.status === 'cancelled' ? 'Annulé' : 'En cours'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'payouts' && (
            withdrawals.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Wallet size={32} className="text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Aucun retrait</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Demandez un retrait pour recevoir vos revenus sur votre compte mobile money ou en espèces.
                </p>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="mt-4 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700"
                >
                  Demander un retrait
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((w) => (
                  <div key={w.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <ArrowDownCircle size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{w.method_name || w.method}</p>
                        <p className="text-sm text-gray-500">
                          {w.phone_number && `${w.phone_number} • `}{formatDate(w.created_at)}
                        </p>
                        {w.admin_notes && (
                          <p className="text-xs text-gray-400 mt-1">Note: {w.admin_notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatAmount(w.amount)}</p>
                      {w.transfer_fee > 0 && (
                        <p className="text-xs text-gray-500">Frais: {formatAmount(w.transfer_fee)} • Net: {formatAmount(w.net_amount)}</p>
                      )}
                      <div className="mt-1">{getWithdrawalStatusBadge(w.status)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Demander un retrait</h2>
                <p className="text-sm text-gray-500">Solde disponible: <strong className="text-emerald-600">{formatAmount(stats.available)}</strong></p>
              </div>
              <button onClick={() => { setShowWithdrawModal(false); setWError(''); setWSuccess('') }} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {wError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  <AlertTriangle size={16} /> {wError}
                </div>
              )}
              {wSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
                  <CheckCircle size={16} /> {wSuccess}
                </div>
              )}

              {/* Method selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Méthode de retrait</label>
                <div className="grid grid-cols-2 gap-3">
                  {METHODS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setWMethod(m.id)}
                      className={`p-3 border rounded-xl text-left transition-all ${
                        wMethod === m.id ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{m.icon}</span>
                        <span className="font-medium text-sm text-gray-900">{m.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Frais: {m.fee}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Montant (XOF)</label>
                <input
                  type="number"
                  value={wAmount}
                  onChange={e => setWAmount(e.target.value)}
                  placeholder="Ex: 10000"
                  min={500}
                  max={stats.available}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {parseFloat(wAmount) > 0 && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Montant</span><span>{formatAmount(parseFloat(wAmount) || 0)}</span></div>
                    <div className="flex justify-between text-red-600"><span>Frais de transfert</span><span>-{formatAmount(wFee)}</span></div>
                    <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Vous recevrez</span><span className="text-emerald-600">{formatAmount(wNet)}</span></div>
                  </div>
                )}
              </div>

              {/* Phone (for mobile money) */}
              {['orange_money', 'moov_money', 'wave'].includes(wMethod) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de téléphone</label>
                  <input
                    type="tel"
                    value={wPhone}
                    onChange={e => setWPhone(e.target.value)}
                    placeholder="Ex: +223 70 00 00 00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Account name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du titulaire (optionnel)</label>
                <input
                  type="text"
                  value={wName}
                  onChange={e => setWName(e.target.value)}
                  placeholder="Nom complet"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note (optionnel)</label>
                <textarea
                  value={wNotes}
                  onChange={e => setWNotes(e.target.value)}
                  rows={2}
                  placeholder="Information supplémentaire..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Fee warning */}
              {wMethod !== 'cash' && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-sm text-amber-800">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Les frais de transfert mobile money seront déduits du montant. {METHODS.find(m => m.id === wMethod)?.desc}</span>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => { setShowWithdrawModal(false); setWError(''); setWSuccess('') }}
                className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                disabled={wLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleWithdraw}
                disabled={wLoading || !!wSuccess}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
              >
                {wLoading ? <><Loader2 className="animate-spin" size={16} /> Envoi...</> : 'Confirmer le retrait'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EarningsPage
