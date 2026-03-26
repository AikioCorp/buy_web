import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Search, Edit2, Trash2, Copy, BarChart3, Eye, X,
  Tag, Calendar, Users, TrendingUp, Loader2, Check, AlertCircle,
  ToggleLeft, ToggleRight, Gift, Percent, DollarSign, RefreshCw,
  Store, Shield, Truck
} from 'lucide-react'

import { apiClient } from '../../../lib/api'

interface Coupon {
  id: number
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed_amount' | 'free_shipping'
  discount_value: number
  coupon_scope: 'global' | 'store'
  store_id: number | null
  coupon_type: string
  max_uses: number | null
  max_uses_per_user: number
  current_uses: number
  usage_count: number
  min_order_amount: number
  max_discount_amount: number | null
  start_date: string
  end_date: string | null
  is_active: boolean
  is_stackable: boolean
  first_order_only: boolean
  applicable_to: string
  applicable_ids: number[]
  created_at: string
  store?: { name: string } | null
}

interface StorePermission {
  id: number
  name: string
  slug: string
  can_use_coupons: boolean
  is_active: boolean
}

interface CouponUsage {
  id: number
  coupon_id: number
  order_id: number | null
  user_id: string | null
  discount_applied: number
  order_subtotal: number | null
  used_at: string
  order?: { id: number; order_number: string; total_amount: number; created_at: string; shipping_full_name: string }
}


const formatPrice = (price: number) => new Intl.NumberFormat('fr-FR').format(Math.round(price)) + ' FCFA'
const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const toDatetimeLocal = (d: string | null) => {
  if (!d) return ''
  const date = new Date(d)
  return date.toISOString().slice(0, 16)
}

export default function SuperAdminCouponsPage() {
  const [activeTab, setActiveTab] = useState<'coupons' | 'permissions'>('coupons')
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined)
  const [totalCount, setTotalCount] = useState(0)

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [showUsagesModal, setShowUsagesModal] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [usages, setUsages] = useState<CouponUsage[]>([])
  const [usagesLoading, setUsagesLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)

  // Store permissions state
  const [storePermissions, setStorePermissions] = useState<StorePermission[]>([])
  const [permissionsLoading, setPermissionsLoading] = useState(false)
  const [togglingStoreId, setTogglingStoreId] = useState<number | null>(null)

  // Form state
  const [form, setForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed_amount' | 'free_shipping',
    discount_value: 10,
    coupon_scope: 'global' as 'global' | 'store',
    coupon_type: 'standard',
    max_uses: '' as string | number,
    max_uses_per_user: 1,
    min_order_amount: 0,
    max_discount_amount: '' as string | number,
    start_date: '',
    end_date: '',
    is_active: true,
    is_public: false,
    applicable_to: 'all',
    is_stackable: false,
    first_order_only: false,
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadCoupons = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (filterActive !== undefined) params.append('is_active', String(filterActive))
      const res = await apiClient.get<any>(`/api/coupons/?${params}`)
      if (res.error) throw new Error(res.error)
      setCoupons(res.data?.data || [])
      setTotalCount(res.data?.count || 0)
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [search, filterActive])

  useEffect(() => { loadCoupons() }, [loadCoupons])

  const handleGenerateCode = async () => {
    try {
      const res = await apiClient.post<any>('/api/coupons/generate-code', {})
      if (res.data?.code) setForm(f => ({ ...f, code: res.data.code }))
    } catch { /* ignore */ }
  }

  const resetForm = () => {
    setForm({
      code: '', description: '', discount_type: 'percentage', discount_value: 10,
      coupon_scope: 'global', coupon_type: 'standard',
      max_uses: '', max_uses_per_user: 1, min_order_amount: 0, max_discount_amount: '',
      start_date: '', end_date: '', is_active: true, is_public: false, applicable_to: 'all',
      is_stackable: false, first_order_only: false,
    })
    setEditingCoupon(null)
    setFormError(null)
  }

  const openCreateModal = () => {
    resetForm()
    handleGenerateCode()
    setShowFormModal(true)
  }

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setForm({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      coupon_scope: coupon.coupon_scope || 'global',
      coupon_type: coupon.coupon_type || 'standard',
      max_uses: coupon.max_uses ?? '',
      max_uses_per_user: coupon.max_uses_per_user,
      min_order_amount: coupon.min_order_amount,
      max_discount_amount: coupon.max_discount_amount ?? '',
      start_date: toDatetimeLocal(coupon.start_date),
      end_date: toDatetimeLocal(coupon.end_date),
      is_active: coupon.is_active,
      is_public: (coupon as any).is_public || false,
      applicable_to: coupon.applicable_to,
      is_stackable: coupon.is_stackable || false,
      first_order_only: coupon.first_order_only || false,
    })
    setFormError(null)
    setShowFormModal(true)
  }

  const handleSubmit = async () => {
    if (form.discount_type !== 'free_shipping' && (!form.discount_value || form.discount_value <= 0)) {
      setFormError('La valeur de réduction est requise')
      return
    }
    setFormLoading(true)
    setFormError(null)
    try {
      const payload: any = {
        code: form.code || undefined,
        description: form.description || undefined,
        discount_type: form.discount_type,
        discount_value: form.discount_type === 'free_shipping' ? 0 : Number(form.discount_value),
        coupon_scope: form.coupon_scope,
        coupon_type: form.coupon_type,
        max_uses: form.max_uses !== '' ? Number(form.max_uses) : null,
        max_uses_per_user: Number(form.max_uses_per_user),
        min_order_amount: Number(form.min_order_amount) || 0,
        max_discount_amount: form.max_discount_amount !== '' ? Number(form.max_discount_amount) : null,
        start_date: form.start_date || undefined,
        end_date: form.end_date || null,
        is_active: form.is_active,
        is_public: form.is_public,
        applicable_to: form.applicable_to,
        is_stackable: form.is_stackable,
        first_order_only: form.first_order_only,
      }

      if (editingCoupon) {
        const res = await apiClient.patch<any>(`/api/coupons/${editingCoupon.id}`, payload)
        if (res.error) throw new Error(res.error)
        showToast('Coupon modifié avec succès')
      } else {
        const res = await apiClient.post<any>('/api/coupons/', payload)
        if (res.error) throw new Error(res.error)
        showToast('Coupon créé avec succès')
      }
      setShowFormModal(false)
      resetForm()
      loadCoupons()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Supprimer le coupon ${coupon.code} ?`)) return
    try {
      const res = await apiClient.delete<any>(`/api/coupons/${coupon.id}`)
      if (res.error) throw new Error(res.error)
      showToast('Coupon supprimé')
      loadCoupons()
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const res = await apiClient.patch<any>(`/api/coupons/${coupon.id}`, { is_active: !coupon.is_active })
      if (res.error) throw new Error(res.error)
      loadCoupons()
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleViewUsages = async (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setShowUsagesModal(true)
    setUsagesLoading(true)
    try {
      const [usagesRes, statsRes] = await Promise.all([
        apiClient.get<any>(`/api/coupons/${coupon.id}/usages`),
        apiClient.get<any>(`/api/coupons/${coupon.id}/stats`),
      ])
      setUsages(usagesRes.data?.data || [])
      setStats(statsRes.data?.data || null)
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setUsagesLoading(false)
    }
  }

  const copyCode = (coupon: Coupon) => {
    navigator.clipboard.writeText(coupon.code)
    setCopiedId(coupon.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Store permissions
  const loadStorePermissions = useCallback(async () => {
    setPermissionsLoading(true)
    try {
      const res = await apiClient.get<any>('/api/coupons/admin/stores-permissions')
      if (res.error) throw new Error(res.error)
      setStorePermissions(res.data?.data || [])
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setPermissionsLoading(false)
    }
  }, [])

  const toggleStorePermission = async (storeId: number, currentValue: boolean) => {
    setTogglingStoreId(storeId)
    try {
      const res = await apiClient.patch<any>(`/api/coupons/admin/store/${storeId}/permission`, { can_use_coupons: !currentValue })
      if (res.error) throw new Error(res.error)
      setStorePermissions(prev => prev.map(s => s.id === storeId ? { ...s, can_use_coupons: !currentValue } : s))
      showToast(`Coupons ${!currentValue ? 'activés' : 'désactivés'} pour la boutique`)
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setTogglingStoreId(null)
    }
  }

  useEffect(() => {
    if (activeTab === 'permissions') loadStorePermissions()
  }, [activeTab, loadStorePermissions])

  const isExpired = (coupon: Coupon) => coupon.end_date && new Date(coupon.end_date) < new Date()
  const isActive = (coupon: Coupon) => coupon.is_active && !isExpired(coupon)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="text-purple-600" size={28} />
            Gestion des Coupons
          </h1>
          <p className="text-gray-500 text-sm mt-1">{totalCount} coupon(s) au total</p>
        </div>
        {activeTab === 'coupons' && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Plus size={18} /> Créer un coupon
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'coupons' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <Tag size={16} /> Coupons
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'permissions' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <Shield size={16} /> Permissions boutiques
        </button>
      </div>

      {activeTab === 'coupons' && (<>
      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par code ou description..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterActive(undefined)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${filterActive === undefined ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterActive(true)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${filterActive === true ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Actifs
          </button>
          <button
            onClick={() => setFilterActive(false)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${filterActive === false ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Inactifs
          </button>
        </div>
        <button onClick={loadCoupons} className="p-2.5 bg-gray-100 rounded-lg hover:bg-gray-200">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Coupons Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-purple-600" size={32} />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20">
          <Gift className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">Aucun coupon trouvé</p>
          <button onClick={openCreateModal} className="mt-4 text-purple-600 hover:underline text-sm">Créer votre premier coupon</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map(coupon => (
            <div key={coupon.id} className={`bg-white rounded-xl border-2 p-5 transition-all hover:shadow-md ${isActive(coupon) ? 'border-green-200' : isExpired(coupon) ? 'border-red-200 opacity-70' : 'border-gray-200 opacity-70'}`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${coupon.discount_type === 'percentage' ? 'bg-blue-100' : coupon.discount_type === 'free_shipping' ? 'bg-teal-100' : 'bg-green-100'}`}>
                    {coupon.discount_type === 'percentage' ? <Percent size={20} className="text-blue-600" /> : coupon.discount_type === 'free_shipping' ? <Truck size={20} className="text-teal-600" /> : <DollarSign size={20} className="text-green-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg tracking-wider">{coupon.code}</span>
                      <button onClick={() => copyCode(coupon)} className="text-gray-400 hover:text-gray-600" title="Copier">
                        {copiedId === coupon.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 truncate max-w-[180px]">{coupon.description || 'Pas de description'}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleActive(coupon)}
                  title={coupon.is_active ? 'Désactiver' : 'Activer'}
                >
                  {coupon.is_active ? <ToggleRight size={28} className="text-green-500" /> : <ToggleLeft size={28} className="text-gray-400" />}
                </button>
              </div>

              {/* Discount */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-3 text-center">
                <span className="text-2xl font-black text-purple-700">
                  {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` :
                   coupon.discount_type === 'free_shipping' ? 'Livr. gratuite' :
                   formatPrice(coupon.discount_value)}
                </span>
                <span className="text-xs text-purple-500 block">
                  {coupon.discount_type === 'free_shipping' ? '' : 'de réduction'}
                </span>
                {coupon.max_discount_amount && coupon.discount_type === 'percentage' && (
                  <span className="text-xs text-gray-500">Max: {formatPrice(coupon.max_discount_amount)}</span>
                )}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="font-bold text-gray-900">{coupon.current_uses}</p>
                  <p className="text-gray-500">Utilisations</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="font-bold text-gray-900">{coupon.max_uses ?? '∞'}</p>
                  <p className="text-gray-500">Limite</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="font-bold text-gray-900">{coupon.min_order_amount > 0 ? formatPrice(coupon.min_order_amount) : '-'}</p>
                  <p className="text-gray-500">Min. cmd</p>
                </div>
              </div>

              {/* Dates */}
              <div className="text-xs text-gray-500 mb-3 space-y-1">
                {coupon.end_date && (
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{isExpired(coupon) ? 'Expiré le' : 'Expire le'} {formatDate(coupon.end_date)}</span>
                  </div>
                )}
                {!coupon.end_date && (
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>Sans date d'expiration</span>
                  </div>
                )}
              </div>

              {/* Status badges */}
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                {isActive(coupon) ? (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Actif</span>
                ) : isExpired(coupon) ? (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Expiré</span>
                ) : (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Inactif</span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${coupon.coupon_scope === 'global' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                  {coupon.coupon_scope === 'global' ? 'Global' : 'Boutique'}
                </span>
                {coupon.applicable_to !== 'all' && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Restreint</span>
                )}
                {coupon.is_stackable && (
                  <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full text-xs font-medium">Cumulable</span>
                )}
                {coupon.first_order_only && (
                  <span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">1ère cmd</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t">
                <button onClick={() => handleViewUsages(coupon)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 text-xs font-medium">
                  <BarChart3 size={14} /> Suivi
                </button>
                <button onClick={() => openEditModal(coupon)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-xs font-medium">
                  <Edit2 size={14} /> Modifier
                </button>
                <button onClick={() => handleDelete(coupon)} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs font-medium">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      </>)}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div>
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
              <Shield size={20} className="text-purple-600" />
              Permissions coupons par boutique
            </h2>
            <p className="text-sm text-gray-500 mb-6">Activez ou désactivez la fonctionnalité coupons pour chaque boutique. Les vendeurs ne pourront créer et gérer des coupons que si leur boutique est autorisée.</p>

            {permissionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-purple-600" size={32} />
              </div>
            ) : storePermissions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Store className="mx-auto text-gray-300 mb-3" size={40} />
                <p>Aucune boutique active trouvée</p>
              </div>
            ) : (
              <div className="space-y-3">
                {storePermissions.map(store => (
                  <div key={store.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${store.can_use_coupons ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Store size={18} className={store.can_use_coupons ? 'text-green-600' : 'text-gray-400'} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{store.name}</p>
                        <p className="text-xs text-gray-500">/{store.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${store.can_use_coupons ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {store.can_use_coupons ? 'Activé' : 'Désactivé'}
                      </span>
                      <button
                        onClick={() => toggleStorePermission(store.id, store.can_use_coupons)}
                        disabled={togglingStoreId === store.id}
                        className="relative"
                        title={store.can_use_coupons ? 'Désactiver les coupons' : 'Activer les coupons'}
                      >
                        {togglingStoreId === store.id ? (
                          <Loader2 size={24} className="animate-spin text-purple-500" />
                        ) : store.can_use_coupons ? (
                          <ToggleRight size={32} className="text-green-500 cursor-pointer" />
                        ) : (
                          <ToggleLeft size={32} className="text-gray-400 cursor-pointer" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl">
              <h2 className="text-lg font-bold text-white">{editingCoupon ? 'Modifier le coupon' : 'Créer un coupon'}</h2>
              <button onClick={() => { setShowFormModal(false); resetForm() }} className="text-white/80 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  <AlertCircle size={16} /> {formError}
                </div>
              )}

              {/* Code */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="Auto-généré si vide"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono tracking-wider focus:ring-2 focus:ring-purple-500"
                  />
                  <button onClick={handleGenerateCode} className="px-3 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 text-sm">
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ex: Promo lancement -20%" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
              </div>

              {/* Scope + Coupon Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Portée</label>
                  <select value={form.coupon_scope} onChange={(e) => setForm(f => ({ ...f, coupon_scope: e.target.value as any }))} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500">
                    <option value="global">Global (admin)</option>
                    <option value="store">Boutique</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Type de coupon</label>
                  <select value={form.coupon_type} onChange={(e) => setForm(f => ({ ...f, coupon_type: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500">
                    <option value="standard">Standard</option>
                    <option value="first_order">Première commande</option>
                    <option value="loyalty">Fidélité</option>
                    <option value="seasonal">Saisonnier</option>
                    <option value="flash_sale">Vente flash</option>
                    <option value="referral">Parrainage</option>
                    <option value="welcome">Bienvenue</option>
                  </select>
                </div>
              </div>

              {/* Discount type + value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Type de réduction</label>
                  <select value={form.discount_type} onChange={(e) => setForm(f => ({ ...f, discount_type: e.target.value as any }))} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500">
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed_amount">Montant fixe (FCFA)</option>
                    <option value="free_shipping">Livraison gratuite</option>
                  </select>
                </div>
                {form.discount_type !== 'free_shipping' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Valeur</label>
                  <input type="number" value={form.discount_value} onChange={(e) => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))} min={0} max={form.discount_type === 'percentage' ? 100 : undefined} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
                </div>
                )}
              </div>

              {/* Limits */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Max utilisations</label>
                  <input type="number" value={form.max_uses} onChange={(e) => setForm(f => ({ ...f, max_uses: e.target.value }))} placeholder="∞" min={0} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Par utilisateur</label>
                  <input type="number" value={form.max_uses_per_user} onChange={(e) => setForm(f => ({ ...f, max_uses_per_user: Number(e.target.value) }))} min={1} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Cmd min (FCFA)</label>
                  <input type="number" value={form.min_order_amount} onChange={(e) => setForm(f => ({ ...f, min_order_amount: Number(e.target.value) }))} min={0} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>

              {/* Max discount (for %) */}
              {form.discount_type === 'percentage' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Plafond de réduction (FCFA)</label>
                  <input type="number" value={form.max_discount_amount} onChange={(e) => setForm(f => ({ ...f, max_discount_amount: e.target.value }))} placeholder="Pas de plafond" min={0} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Date de début</label>
                  <input type="datetime-local" value={form.start_date} onChange={(e) => setForm(f => ({ ...f, start_date: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Date de fin</label>
                  <input type="datetime-local" value={form.end_date} onChange={(e) => setForm(f => ({ ...f, end_date: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Actif immédiatement</label>
                  <button onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))} className={`w-12 h-6 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-300'} relative`}>
                    <span className={`block w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Visible par tous les clients</label>
                    <p className="text-xs text-gray-500">Afficher ce code dans les suggestions</p>
                  </div>
                  <button onClick={() => setForm(f => ({ ...f, is_public: !f.is_public }))} className={`w-12 h-6 rounded-full transition-colors ${form.is_public ? 'bg-amber-500' : 'bg-gray-300'} relative`}>
                    <span className={`block w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${form.is_public ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Première commande uniquement</label>
                  <button onClick={() => setForm(f => ({ ...f, first_order_only: !f.first_order_only }))} className={`w-12 h-6 rounded-full transition-colors ${form.first_order_only ? 'bg-purple-500' : 'bg-gray-300'} relative`}>
                    <span className={`block w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${form.first_order_only ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Cumulable avec d'autres coupons</label>
                  <button onClick={() => setForm(f => ({ ...f, is_stackable: !f.is_stackable }))} className={`w-12 h-6 rounded-full transition-colors ${form.is_stackable ? 'bg-blue-500' : 'bg-gray-300'} relative`}>
                    <span className={`block w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${form.is_stackable ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => { setShowFormModal(false); resetForm() }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Annuler</button>
              <button onClick={handleSubmit} disabled={formLoading} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2">
                {formLoading && <Loader2 size={16} className="animate-spin" />}
                {editingCoupon ? 'Sauvegarder' : 'Créer le coupon'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Usages/Stats Modal */}
      {showUsagesModal && selectedCoupon && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-white">Suivi: {selectedCoupon.code}</h2>
                <p className="text-white/70 text-sm">{selectedCoupon.description || 'Pas de description'}</p>
              </div>
              <button onClick={() => setShowUsagesModal(false)} className="text-white/80 hover:text-white"><X size={20} /></button>
            </div>

            <div className="p-6">
              {usagesLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-purple-600" size={32} /></div>
              ) : (
                <>
                  {/* Stats Cards */}
                  {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      <div className="bg-purple-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-purple-700">{stats.total_uses}</p>
                        <p className="text-xs text-purple-500">Utilisations</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-green-700">{formatPrice(stats.total_discount)}</p>
                        <p className="text-xs text-green-500">Total réduit</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-blue-700">{stats.unique_users}</p>
                        <p className="text-xs text-blue-500">Utilisateurs</p>
                      </div>
                      <div className="bg-orange-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-orange-700">{formatPrice(stats.average_order_value)}</p>
                        <p className="text-xs text-orange-500">Panier moyen</p>
                      </div>
                    </div>
                  )}

                  {/* Usages list */}
                  <h3 className="font-medium text-gray-900 mb-3">Historique d'utilisation</h3>
                  {usages.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">Aucune utilisation pour le moment</p>
                  ) : (
                    <div className="space-y-2">
                      {usages.map(usage => (
                        <div key={usage.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{usage.order?.shipping_full_name || 'Client'}</p>
                            <p className="text-xs text-gray-500">
                              Commande #{usage.order?.order_number || usage.order_id || '-'} • {formatDate(usage.used_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">-{formatPrice(usage.discount_applied)}</p>
                            {usage.order_subtotal && (
                              <p className="text-xs text-gray-500">sur {formatPrice(usage.order_subtotal)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t">
              <button onClick={() => setShowUsagesModal(false)} className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
