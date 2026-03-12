import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Ticket, Plus, Trash2, Search, CheckCircle, XCircle, Clock, Tag,
  Percent, Gift, Truck, AlertCircle, Copy, ChevronRight, Sparkles
} from 'lucide-react'
import { useToast } from '../../../components/Toast'
import { apiClient } from '../../../lib/api/apiClient'

interface SavedCoupon {
  id: number
  coupon_id: number
  saved_at: string
  notes: string | null
  coupon: {
    id: number
    code: string
    description: string
    discount_type: 'percentage' | 'fixed_amount' | 'free_shipping'
    discount_value: number
    min_order_amount: number
    max_discount_amount: number | null
    start_date: string
    end_date: string | null
    is_active: boolean
    current_uses: number
    max_uses: number | null
    max_uses_per_user: number | null
  }
}

interface CouponValidation {
  valid: boolean
  error?: string
  coupon?: any
}

const CouponsPage: React.FC = () => {
  const { showToast } = useToast()
  const [savedCoupons, setSavedCoupons] = useState<SavedCoupon[]>([])
  const [publicCoupons, setPublicCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [validating, setValidating] = useState(false)
  const [validation, setValidation] = useState<CouponValidation | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSavedCoupons()
    loadPublicCoupons()
  }, [])

  const loadSavedCoupons = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<SavedCoupon[]>('/api/customers/coupons')
      if (response.data) {
        setSavedCoupons(response.data)
      }
    } catch (error) {
      console.error('Error loading coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPublicCoupons = async () => {
    try {
      const response = await apiClient.get<any[]>('/api/coupons/public')
      if (response.data) {
        setPublicCoupons(response.data)
      }
    } catch (error) {
      console.error('Error loading public coupons:', error)
    }
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) return

    try {
      setValidating(true)
      setValidation(null)
      const response = await apiClient.post<CouponValidation>('/api/customers/coupons/validate', {
        code: couponCode.trim().toUpperCase()
      })
      if (response.data) {
        setValidation(response.data)
      }
    } catch (error: any) {
      setValidation({ valid: false, error: error.message || 'Erreur de validation' })
    } finally {
      setValidating(false)
    }
  }

  const saveCoupon = async () => {
    if (!validation?.valid || !validation.coupon) return

    try {
      setSaving(true)
      const response = await apiClient.post<SavedCoupon>('/api/customers/coupons', {
        code: couponCode.trim().toUpperCase()
      })
      if (response.data) {
        setSavedCoupons(prev => [response.data!, ...prev])
        setCouponCode('')
        setValidation(null)
        showToast('Coupon enregistré !', 'success')
      }
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de l\'enregistrement', 'error')
    } finally {
      setSaving(false)
    }
  }

  const removeCoupon = async (id: number) => {
    try {
      await apiClient.delete(`/api/customers/coupons/${id}`)
      setSavedCoupons(prev => prev.filter(c => c.id !== id))
      showToast('Coupon supprimé', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de la suppression', 'error')
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    showToast('Code copié !', 'success')
  }

  const getCouponStatus = (coupon: SavedCoupon['coupon']) => {
    const now = new Date()
    const endDate = coupon.end_date ? new Date(coupon.end_date) : null

    if (!coupon.is_active) {
      return { status: 'inactive', label: 'Inactif', color: 'bg-gray-100 text-gray-600' }
    }
    if (endDate && now > endDate) {
      return { status: 'expired', label: 'Expiré', color: 'bg-red-100 text-red-600' }
    }
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return { status: 'exhausted', label: 'Épuisé', color: 'bg-orange-100 text-orange-600' }
    }
    return { status: 'valid', label: 'Valide', color: 'bg-green-100 text-green-600' }
  }

  const getDiscountDisplay = (coupon: SavedCoupon['coupon']) => {
    switch (coupon.discount_type) {
      case 'percentage':
        return { icon: <Percent size={16} />, text: `-${coupon.discount_value}%` }
      case 'fixed_amount':
        return { icon: <Tag size={16} />, text: `-${coupon.discount_value.toLocaleString()} F` }
      case 'free_shipping':
        return { icon: <Truck size={16} />, text: 'Livraison gratuite' }
      default:
        return { icon: <Gift size={16} />, text: 'Réduction' }
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Ticket className="text-green-600" />
          Mes Coupons
        </h1>
        <p className="text-gray-600 mt-1">Gérez vos codes promo et coupons de réduction</p>
      </div>

      {/* Ajouter un coupon */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Plus size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg">Ajouter un code promo</h2>
            <p className="text-white/80 text-sm">Entrez un code pour vérifier sa validité et l'enregistrer</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase())
                setValidation(null)
              }}
              onKeyDown={(e) => e.key === 'Enter' && validateCoupon()}
              placeholder="Ex: BIENVENUE20"
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            {couponCode && (
              <button
                onClick={() => { setCouponCode(''); setValidation(null) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={validateCoupon}
            disabled={!couponCode.trim() || validating}
            className="px-6 py-3 bg-white text-green-600 rounded-lg font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {validating ? (
              <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search size={18} />
            )}
            Vérifier
          </button>
        </div>

        {/* Résultat de validation */}
        {validation && (
          <div className={`mt-4 p-4 rounded-lg ${validation.valid ? 'bg-white/20' : 'bg-red-500/30'}`}>
            {validation.valid && validation.coupon ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={20} className="text-yellow-300" />
                  <span className="font-bold">Coupon valide !</span>
                </div>
                <div className="bg-white/10 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-lg">{validation.coupon.code}</span>
                    <span className="text-xl font-bold text-yellow-300">
                      {getDiscountDisplay(validation.coupon).text}
                    </span>
                  </div>
                  {validation.coupon.description && (
                    <p className="text-sm text-white/80">{validation.coupon.description}</p>
                  )}
                  {validation.coupon.min_order_amount > 0 && (
                    <p className="text-xs text-white/60 mt-1">
                      Min. commande: {validation.coupon.min_order_amount.toLocaleString()} FCFA
                    </p>
                  )}
                  {validation.coupon.end_date && (
                    <p className="text-xs text-white/60">
                      Expire le: {formatDate(validation.coupon.end_date)}
                    </p>
                  )}
                </div>
                <button
                  onClick={saveCoupon}
                  disabled={saving}
                  className="w-full py-2 bg-yellow-400 text-gray-900 rounded-lg font-bold hover:bg-yellow-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}
                  Enregistrer ce coupon
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle size={20} />
                <span>{validation.error || 'Coupon invalide'}</span>
              </div>
            )}
          </div>
        )}

        {/* Coupons publics disponibles */}
        {!validation && publicCoupons.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-sm text-white/80 mb-3 flex items-center gap-2">
              <Gift size={16} />
              Codes promo disponibles :
            </p>
            <div className="flex flex-wrap gap-2">
              {publicCoupons.map((coupon: any) => {
                const discountLabel = coupon.discount_type === 'percentage' 
                  ? `-${coupon.discount_value}%`
                  : coupon.discount_type === 'free_shipping'
                    ? 'Livr. gratuite'
                    : `-${coupon.discount_value.toLocaleString()} F`
                return (
                  <button
                    key={coupon.code}
                    onClick={() => {
                      setCouponCode(coupon.code)
                      setValidation(null)
                    }}
                    className="group flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <span className="font-mono font-bold text-sm">{coupon.code}</span>
                    <span className="text-xs bg-yellow-400/80 text-gray-900 px-1.5 py-0.5 rounded font-medium">{discountLabel}</span>
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-white/60 mt-2">
              💡 Cliquez sur un code pour le tester automatiquement.
            </p>
          </div>
        )}
      </div>

      {/* Liste des coupons sauvegardés */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={18} className="text-yellow-500" />
            Mes coupons enregistrés
          </h3>
          <span className="text-sm text-gray-500">{savedCoupons.length} coupon(s)</span>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : savedCoupons.length === 0 ? (
          <div className="p-8 text-center">
            <Ticket size={48} className="mx-auto text-gray-300 mb-3" />
            <h4 className="font-medium text-gray-900 mb-1">Aucun coupon enregistré</h4>
            <p className="text-sm text-gray-500">Ajoutez un code promo ci-dessus pour commencer</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {savedCoupons.map((saved) => {
              const status = getCouponStatus(saved.coupon)
              const discount = getDiscountDisplay(saved.coupon)
              const isUsable = status.status === 'valid'

              return (
                <div
                  key={saved.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${!isUsable ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-lg text-gray-900">{saved.coupon.code}</span>
                        <button
                          onClick={() => copyCode(saved.coupon.code)}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          title="Copier le code"
                        >
                          <Copy size={14} />
                        </button>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-green-600 font-bold mb-1">
                        {discount.icon}
                        <span>{discount.text}</span>
                      </div>

                      {saved.coupon.description && (
                        <p className="text-sm text-gray-600 mb-1">{saved.coupon.description}</p>
                      )}

                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        {saved.coupon.min_order_amount > 0 && (
                          <span>Min. {saved.coupon.min_order_amount.toLocaleString()} F</span>
                        )}
                        {saved.coupon.max_discount_amount && (
                          <span>Max. -{saved.coupon.max_discount_amount.toLocaleString()} F</span>
                        )}
                        {saved.coupon.end_date && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Expire: {formatDate(saved.coupon.end_date)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isUsable && (
                        <Link
                          to="/"
                          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-1"
                        >
                          Utiliser <ChevronRight size={14} />
                        </Link>
                      )}
                      <button
                        onClick={() => removeCoupon(saved.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Comment utiliser vos coupons ?</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Ajoutez des produits à votre panier</li>
              <li>Au moment du paiement, entrez votre code promo</li>
              <li>La réduction sera automatiquement appliquée</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CouponsPage
