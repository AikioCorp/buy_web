import React, { useState, useEffect } from 'react'
import {
  Wallet, TrendingUp, Store, Clock, CheckCircle, XCircle,
  Loader2, Search, Eye, X, AlertTriangle, Banknote,
  ArrowDownCircle, PiggyBank, Users, ShoppingBag, Info
} from 'lucide-react'
import { vendorService, WithdrawalRequest, ShopRevenue, AdminRevenueStats } from '../../../lib/api/vendorService'

const AdminRevenuePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'shops' | 'withdrawals'>('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminRevenueStats | null>(null)
  const [shops, setShops] = useState<ShopRevenue[]>([])
  const [shopsTotal, setShopsTotal] = useState(0)
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [withdrawalsTotal, setWithdrawalsTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Action modal
  const [actionModal, setActionModal] = useState<{ withdrawal: WithdrawalRequest; action: string } | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (activeTab === 'withdrawals') loadWithdrawals()
    if (activeTab === 'shops') loadShops()
  }, [activeTab, statusFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      const [statsRes, withdrawalsRes, shopsRes] = await Promise.all([
        vendorService.getAdminRevenueStats(),
        vendorService.getAllWithdrawals({ status: 'pending' }),
        vendorService.getRevenueByShop(),
      ])

      if (statsRes.data) {
        const d = (statsRes.data as any).data || statsRes.data
        setStats(d)
      }
      if (withdrawalsRes.data) {
        const d = (withdrawalsRes.data as any).data || withdrawalsRes.data
        setWithdrawals(d.withdrawals || [])
        setWithdrawalsTotal(d.total || 0)
      }
      if (shopsRes.data) {
        const d = (shopsRes.data as any).data || shopsRes.data
        setShops(d.shops || [])
        setShopsTotal(d.total || 0)
      }
    } catch (error) {
      console.error('Error loading revenue data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadWithdrawals = async () => {
    try {
      const res = await vendorService.getAllWithdrawals({
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      })
      if (res.data) {
        const d = (res.data as any).data || res.data
        setWithdrawals(d.withdrawals || [])
        setWithdrawalsTotal(d.total || 0)
      }
    } catch (error) {
      console.error('Error loading withdrawals:', error)
    }
  }

  const loadShops = async () => {
    try {
      const res = await vendorService.getRevenueByShop({ search: searchQuery || undefined })
      if (res.data) {
        const d = (res.data as any).data || res.data
        setShops(d.shops || [])
        setShopsTotal(d.total || 0)
      }
    } catch (error) {
      console.error('Error loading shops revenue:', error)
    }
  }

  const handleAction = async () => {
    if (!actionModal) return
    try {
      setActionLoading(true)
      await vendorService.updateWithdrawalStatus(
        actionModal.withdrawal.id,
        actionModal.action,
        adminNotes || undefined
      )
      setActionModal(null)
      setAdminNotes('')
      loadData()
    } catch (error: any) {
      console.error('Error updating withdrawal:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const fmt = (a: number) => a.toLocaleString('fr-FR') + ' XOF'
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; cls: string }> = {
      pending: { label: 'En attente', cls: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Approuvé', cls: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejeté', cls: 'bg-red-100 text-red-800' },
      processing: { label: 'En cours', cls: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Effectué', cls: 'bg-emerald-100 text-emerald-800' },
    }
    const c = config[status] || config.pending
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.cls}`}>{c.label}</span>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Revenus & Retraits</h1>
        <p className="text-gray-500 mt-1">Vue globale des revenus de la plateforme et gestion des demandes de retrait</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><TrendingUp size={20} /></div>
              <span className="text-indigo-100 text-xs">Revenu total</span>
            </div>
            <p className="text-2xl font-bold">{fmt(stats.total_revenue)}</p>
            <p className="text-indigo-200 text-xs mt-1">{stats.delivered_orders} commandes livrées</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center"><Banknote size={20} className="text-blue-600" /></div>
              <span className="text-gray-500 text-xs">Ce mois</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{fmt(stats.month_revenue)}</p>
            <p className="text-gray-500 text-xs mt-1">{stats.total_orders} commandes totales</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center"><Clock size={20} className="text-amber-600" /></div>
              <span className="text-gray-500 text-xs">Retraits en attente</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{fmt(stats.pending_withdrawals_amount)}</p>
            <p className="text-gray-500 text-xs mt-1">{stats.pending_withdrawals_count} demande(s)</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><Wallet size={20} className="text-emerald-600" /></div>
              <span className="text-gray-500 text-xs">Solde plateforme</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{fmt(stats.platform_balance)}</p>
            <p className="text-gray-500 text-xs mt-1">{fmt(stats.total_paid_out)} déjà versé</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[
            { id: 'overview', label: 'Demandes de retrait', icon: <ArrowDownCircle size={16} /> },
            { id: 'shops', label: 'Revenus par boutique', icon: <Store size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Withdrawals Tab */}
          {activeTab === 'overview' && (
            <div>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && loadWithdrawals()}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="approved">Approuvé</option>
                  <option value="rejected">Rejeté</option>
                  <option value="processing">En cours</option>
                  <option value="completed">Effectué</option>
                </select>
              </div>

              {withdrawals.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Aucune demande de retrait</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map(w => (
                    <div key={w.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <ArrowDownCircle size={20} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {(w as any).stores?.name || `Boutique #${w.shop_id}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {w.method_name || w.method} {w.phone_number && `• ${w.phone_number}`} {w.account_name && `• ${w.account_name}`}
                          </p>
                          <p className="text-xs text-gray-400">{fmtDate(w.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{fmt(w.amount)}</p>
                          {w.transfer_fee > 0 && (
                            <p className="text-xs text-gray-500">Frais: {fmt(w.transfer_fee)} • Net: {fmt(w.net_amount)}</p>
                          )}
                          <div className="mt-1">{getStatusBadge(w.status)}</div>
                        </div>
                        {w.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setActionModal({ withdrawal: w, action: 'approved' }); setAdminNotes('') }}
                              className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                              title="Approuver"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => { setActionModal({ withdrawal: w, action: 'rejected' }); setAdminNotes('') }}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                              title="Rejeter"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Shops Revenue Tab */}
          {activeTab === 'shops' && (
            <div>
              <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher une boutique..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadShops()}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {shops.length === 0 ? (
                <div className="text-center py-12">
                  <Store size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Aucune boutique trouvée</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Boutique</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Revenu total</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Versé</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">En attente</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Solde dispo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {shops.map(shop => (
                        <tr key={shop.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                <Store size={16} className="text-indigo-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{shop.name}</p>
                                <p className="text-xs text-gray-500">{shop.is_active ? 'Active' : 'Inactive'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-sm">{fmt(shop.total_revenue)}</td>
                          <td className="py-3 px-4 text-right text-sm text-emerald-600">{fmt(shop.total_paid_out)}</td>
                          <td className="py-3 px-4 text-right text-sm text-amber-600">{fmt(shop.pending_payout)}</td>
                          <td className="py-3 px-4 text-right font-bold text-sm">{fmt(shop.available_balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {actionModal.action === 'approved' ? 'Approuver le retrait' : 'Rejeter le retrait'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {(actionModal.withdrawal as any).stores?.name || `Boutique #${actionModal.withdrawal.shop_id}`} — {fmt(actionModal.withdrawal.amount)}
              </p>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-gray-500">Méthode</span><span>{actionModal.withdrawal.method_name}</span></div>
                {actionModal.withdrawal.phone_number && (
                  <div className="flex justify-between"><span className="text-gray-500">Téléphone</span><span>{actionModal.withdrawal.phone_number}</span></div>
                )}
                <div className="flex justify-between"><span className="text-gray-500">Montant</span><span className="font-bold">{fmt(actionModal.withdrawal.amount)}</span></div>
                {actionModal.withdrawal.transfer_fee > 0 && (
                  <>
                    <div className="flex justify-between text-red-600"><span>Frais</span><span>-{fmt(actionModal.withdrawal.transfer_fee)}</span></div>
                    <div className="flex justify-between font-bold border-t pt-1"><span>Net à verser</span><span>{fmt(actionModal.withdrawal.net_amount)}</span></div>
                  </>
                )}
              </div>

              {actionModal.action === 'rejected' && (
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg text-sm text-red-700 mb-4">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Le vendeur sera notifié du rejet. Le montant sera remis dans son solde disponible.</span>
                </div>
              )}

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note {actionModal.action === 'rejected' ? '(raison du rejet)' : '(optionnel)'}
              </label>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                rows={3}
                placeholder={actionModal.action === 'rejected' ? 'Raison du rejet...' : 'Note pour le vendeur...'}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                disabled={actionLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading || (actionModal.action === 'rejected' && !adminNotes)}
                className={`px-6 py-2.5 rounded-xl font-medium text-white flex items-center gap-2 disabled:opacity-50 ${
                  actionModal.action === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionLoading ? <Loader2 className="animate-spin" size={16} /> : null}
                {actionModal.action === 'approved' ? 'Approuver' : 'Rejeter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminRevenuePage
