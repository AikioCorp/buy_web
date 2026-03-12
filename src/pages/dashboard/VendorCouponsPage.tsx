import React, { useState, useEffect, useCallback } from 'react'
import {
  Gift, Plus, Search, Edit, Trash2, Copy, CheckCircle, XCircle,
  AlertTriangle, Loader2, Tag, Calendar, Percent, DollarSign, X, Truck
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://buymore-api-production.up.railway.app'

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

const formatPrice = (price: number) => new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'

interface Coupon {
  id: number
  code: string
  description: string
  discount_type: 'percentage' | 'fixed_amount' | 'free_shipping'
  discount_value: number
  coupon_scope: string
  store_id: number
  coupon_type: string
  min_order_amount: number
  max_discount_amount: number | null
  max_uses: number | null
  max_uses_per_user: number | null
  usage_count: number
  is_active: boolean
  start_date: string | null
  end_date: string | null
  applicable_to: string
  applicable_ids: number[]
  excluded_product_ids: number[]
  is_stackable: boolean
  stack_group: string | null
  first_order_only: boolean
  created_at: string
}

const COUPON_TYPES = [
  { value: 'standard', label: 'Standard' },
  { value: 'first_order', label: 'Première commande' },
  { value: 'loyalty', label: 'Fidélité' },
  { value: 'seasonal', label: 'Saisonnier' },
  { value: 'flash_sale', label: 'Vente flash' },
  { value: 'referral', label: 'Parrainage' },
]

const DISCOUNT_TYPES = [
  { value: 'percentage', label: 'Pourcentage (%)', icon: <Percent size={14} /> },
  { value: 'fixed_amount', label: 'Montant fixe (FCFA)', icon: <DollarSign size={14} /> },
  { value: 'free_shipping', label: 'Livraison gratuite', icon: <Truck size={14} /> },
]

const APPLICABLE_TO_OPTIONS = [
  { value: 'all', label: 'Tous les produits' },
  { value: 'products', label: 'Produits spécifiques' },
  { value: 'categories', label: 'Catégories spécifiques' },
]

const VendorCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [permission, setPermission] = useState<{ can_use_coupons: boolean; store_name: string } | null>(null)
  const [permissionLoading, setPermissionLoading] = useState(true)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed_amount' | 'free_shipping',
    discount_value: 0,
    coupon_type: 'standard',
    min_order_amount: 0,
    max_discount_amount: null as number | null,
    max_uses: null as number | null,
    max_uses_per_user: null as number | null,
    is_active: true,
    start_date: '',
    end_date: '',
    applicable_to: 'all',
    applicable_ids: [] as number[],
    excluded_product_ids: [] as number[],
    is_stackable: false,
    first_order_only: false,
  })

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const checkPermission = async () => {
    try {
      const res = await fetch(`${API_URL}/api/coupons/vendor/permission`, { headers: getAuthHeaders() })
      const data = await res.json()
      if (data.data) {
        setPermission(data.data)
      }
    } catch {
      setPermission(null)
    } finally {
      setPermissionLoading(false)
    }
  }

  const loadCoupons = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const res = await fetch(`${API_URL}/api/coupons/vendor/my-coupons?${params}`, { headers: getAuthHeaders() })
      const data = await res.json()
      setCoupons(data.data || [])
    } catch {
      setCoupons([])
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { checkPermission() }, [])
  useEffect(() => {
    if (permission?.can_use_coupons) loadCoupons()
  }, [permission, loadCoupons])

  const generateCode = async () => {
    try {
      const res = await fetch(`${API_URL}/api/coupons/generate-code`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ prefix: 'SHOP', length: 8 }),
      })
      const data = await res.json()
      if (data.code) setForm(f => ({ ...f, code: data.code }))
    } catch { /* silent */ }
  }

  const openCreateModal = () => {
    setEditingCoupon(null)
    setForm({
      code: '', description: '', discount_type: 'percentage', discount_value: 10,
      coupon_type: 'standard', min_order_amount: 0, max_discount_amount: null,
      max_uses: null, max_uses_per_user: 1, is_active: true, start_date: '', end_date: '',
      applicable_to: 'all', applicable_ids: [], excluded_product_ids: [],
      is_stackable: false, first_order_only: false,
    })
    setModalError(null)
    setIsModalOpen(true)
    generateCode()
  }

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setForm({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      coupon_type: coupon.coupon_type || 'standard',
      min_order_amount: coupon.min_order_amount || 0,
      max_discount_amount: coupon.max_discount_amount,
      max_uses: coupon.max_uses,
      max_uses_per_user: coupon.max_uses_per_user || 1,
      is_active: coupon.is_active,
      start_date: coupon.start_date ? coupon.start_date.split('T')[0] : '',
      end_date: coupon.end_date ? coupon.end_date.split('T')[0] : '',
      applicable_to: coupon.applicable_to || 'all',
      applicable_ids: coupon.applicable_ids || [],
      excluded_product_ids: coupon.excluded_product_ids || [],
      is_stackable: coupon.is_stackable || false,
      first_order_only: coupon.first_order_only || false,
    })
    setModalError(null)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.code.trim()) { setModalError('Le code est requis'); return }
    if (form.discount_type !== 'free_shipping' && form.discount_value <= 0) { setModalError('La valeur de réduction doit être > 0'); return }

    setSaving(true)
    setModalError(null)

    try {
      const body: any = {
        code: form.code.trim().toUpperCase(),
        description: form.description,
        discount_type: form.discount_type,
        discount_value: form.discount_type === 'free_shipping' ? 0 : form.discount_value,
        coupon_type: form.coupon_type,
        min_order_amount: form.min_order_amount || 0,
        max_discount_amount: form.max_discount_amount || null,
        max_uses: form.max_uses || null,
        max_uses_per_user: form.max_uses_per_user || null,
        is_active: form.is_active,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        applicable_to: form.applicable_to,
        applicable_ids: form.applicable_ids,
        excluded_product_ids: form.excluded_product_ids,
        is_stackable: form.is_stackable,
        first_order_only: form.first_order_only,
      }

      let url: string, method: string
      if (editingCoupon) {
        url = `${API_URL}/api/coupons/vendor/${editingCoupon.id}`
        method = 'PATCH'
      } else {
        url = `${API_URL}/api/coupons/vendor/create`
        method = 'POST'
      }

      const res = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(body) })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erreur lors de la sauvegarde')

      setIsModalOpen(false)
      loadCoupons()
    } catch (err: any) {
      setModalError(err.message || 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeleting(true)
    try {
      await fetch(`${API_URL}/api/coupons/vendor/${id}`, { method: 'DELETE', headers: getAuthHeaders() })
      setDeleteId(null)
      loadCoupons()
    } catch { /* silent */ }
    finally { setDeleting(false) }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  // Permission loading / denied
  if (permissionLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    )
  }

  if (!permission || !permission.can_use_coupons) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="text-yellow-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Coupons non activés</h2>
        <p className="text-gray-500 max-w-md">
          Les coupons ne sont pas encore activés pour votre boutique. Contactez un administrateur pour activer cette fonctionnalité.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            Mes Coupons
          </h1>
          <p className="text-gray-500 mt-1">{coupons.length} coupon{coupons.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 font-medium shadow-lg shadow-purple-200 transition-all"
        >
          <Plus size={18} /> Créer un coupon
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un coupon..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Coupons List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="animate-spin text-purple-600" size={24} />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Gift className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun coupon</h3>
          <p className="text-gray-500 mb-4">Créez votre premier coupon pour attirer plus de clients !</p>
          <button onClick={openCreateModal} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
            <Plus size={16} className="inline mr-1" /> Créer un coupon
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {coupons.map(coupon => (
            <div key={coupon.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${coupon.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Tag size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-lg tracking-wider">{coupon.code}</span>
                      <button onClick={() => copyCode(coupon.code)} className="text-gray-400 hover:text-gray-600" title="Copier">
                        <Copy size={14} />
                      </button>
                      {coupon.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle size={10} /> Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                          <XCircle size={10} /> Inactif
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{coupon.description || 'Aucune description'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-purple-600">
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` :
                       coupon.discount_type === 'free_shipping' ? 'Livr. gratuite' :
                       formatPrice(coupon.discount_value)}
                    </p>
                    <p className="text-xs text-gray-400">Réduction</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-700">{coupon.usage_count || 0}{coupon.max_uses ? `/${coupon.max_uses}` : ''}</p>
                    <p className="text-xs text-gray-400">Utilisations</p>
                  </div>
                  {coupon.end_date && (
                    <div className="text-center">
                      <p className="font-bold text-gray-700 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(coupon.end_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </p>
                      <p className="text-xs text-gray-400">Expiration</p>
                    </div>
                  )}
                  <div className="flex gap-1">
                    <button onClick={() => openEditModal(coupon)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => setDeleteId(coupon.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b flex items-center justify-between z-10">
              <h2 className="text-xl font-bold">{editingCoupon ? 'Modifier le coupon' : 'Nouveau coupon'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{modalError}</div>
              )}

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code du coupon</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono tracking-wider"
                    placeholder="EX: SHOP20OFF"
                  />
                  <button onClick={generateCode} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm whitespace-nowrap">
                    Générer
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: 20% de réduction sur tous nos produits"
                />
              </div>

              {/* Discount Type + Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de réduction</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm(f => ({ ...f, discount_type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {DISCOUNT_TYPES.map(dt => (
                      <option key={dt.value} value={dt.value}>{dt.label}</option>
                    ))}
                  </select>
                </div>
                {form.discount_type !== 'free_shipping' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valeur {form.discount_type === 'percentage' ? '(%)' : '(FCFA)'}
                    </label>
                    <input
                      type="number"
                      value={form.discount_value}
                      onChange={(e) => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min={0}
                      max={form.discount_type === 'percentage' ? 100 : undefined}
                    />
                  </div>
                )}
              </div>

              {/* Coupon Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de coupon</label>
                <select
                  value={form.coupon_type}
                  onChange={(e) => setForm(f => ({ ...f, coupon_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {COUPON_TYPES.map(ct => (
                    <option key={ct.value} value={ct.value}>{ct.label}</option>
                  ))}
                </select>
              </div>

              {/* Applicable To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applicable à</label>
                <select
                  value={form.applicable_to}
                  onChange={(e) => setForm(f => ({ ...f, applicable_to: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {APPLICABLE_TO_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commande minimum (FCFA)</label>
                  <input
                    type="number"
                    value={form.min_order_amount}
                    onChange={(e) => setForm(f => ({ ...f, min_order_amount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Réduction max (FCFA)</label>
                  <input
                    type="number"
                    value={form.max_discount_amount ?? ''}
                    onChange={(e) => setForm(f => ({ ...f, max_discount_amount: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Illimité"
                    min={0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Utilisations max (total)</label>
                  <input
                    type="number"
                    value={form.max_uses ?? ''}
                    onChange={(e) => setForm(f => ({ ...f, max_uses: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Illimité"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max par utilisateur</label>
                  <input
                    type="number"
                    value={form.max_uses_per_user ?? ''}
                    onChange={(e) => setForm(f => ({ ...f, max_uses_per_user: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min={1}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm(f => ({ ...f, end_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Coupon actif</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.first_order_only}
                    onChange={(e) => setForm(f => ({ ...f, first_order_only: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Première commande uniquement</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_stackable}
                    onChange={(e) => setForm(f => ({ ...f, is_stackable: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Cumulable avec d'autres coupons</span>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white p-6 border-t flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 font-medium"
              >
                {saving && <Loader2 className="animate-spin" size={16} />}
                {editingCoupon ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <AlertTriangle className="mx-auto text-red-500 mb-3" size={40} />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Supprimer ce coupon ?</h3>
            <p className="text-sm text-gray-500 mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Annuler</button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <Loader2 className="animate-spin" size={14} />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorCouponsPage
