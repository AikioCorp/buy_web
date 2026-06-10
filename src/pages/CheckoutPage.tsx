import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCartStore, getEffectivePrice } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useShippingStore } from '@/store/shippingStore'
import { ordersService } from '@/lib/api/ordersService'
import { apiClient } from '@/lib/api/apiClient'
import { mobileMoneyService, type MobileMoneyProvider, PROVIDER_LABELS } from '@/lib/api/mobileMoneyService'
import { toLocalMsisdn, hasValidMsisdn } from '@/lib/phone'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/Card'
import {
  ShoppingBag, MapPin, CreditCard, Truck, CheckCircle,
  ArrowLeft, Loader2, AlertCircle, Phone, User, Mail, Save, ChevronDown
} from 'lucide-react'
import analytics from '@/lib/analytics/tracker'
import {
  BAMAKO_ZONES,
  getQuartierSuggestions,
  resolveQuartierOption,
} from '@/lib/locations/bamako'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://buymore-api-production.up.railway.app'

// Fonction pour obtenir l'URL de l'image du produit
const getProductImageUrl = (product: any): string | null => {
  if (!product) return null

  let url: string | null = null

  // Check different image sources
  // 1. media array (new format)
  if (product.media && product.media.length > 0) {
    const primaryImage = product.media.find((m: any) => m.is_primary) || product.media[0]
    url = primaryImage?.image_url || primaryImage?.file || primaryImage?.image
  }
  // 2. images array (common format)
  else if (product.images && product.images.length > 0) {
    const primaryImage = product.images.find((img: any) => img.is_primary) || product.images[0]
    url = primaryImage?.image || primaryImage?.url || primaryImage?.image_url
  }
  // 3. Direct image property
  else if (product.image) {
    url = product.image
  }
  // 4. Direct image_url property  
  else if (product.image_url) {
    url = product.image_url
  }
  // 5. thumbnail property
  else if (product.thumbnail) {
    url = product.thumbnail
  }

  if (!url) return null

  // Fix protocol
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://')
  }

  // Return full URL
  if (url.startsWith('https://') || url.startsWith('data:')) return url
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

interface ShippingAddress {
  id?: number
  full_name: string
  phone: string
  email: string
  commune: string
  quartier: string
  address_details: string
  country: string
  is_default: boolean
}

type Step = 'shipping' | 'payment' | 'confirmation'

export function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { items, getTotal, clearCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const { savedAddress, saveAddress } = useShippingStore()

  const [currentStep, setCurrentStep] = useState<Step>('shipping')

  // Scroll en haut à chaque changement d'étape
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderSuccess, setOrderSuccess] = useState(false)
  // Empêche la redirection vers /cart pendant le traitement du paiement
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [saveAddressForLater, setSaveAddressForLater] = useState(true)
  
  // Saved addresses from API
  const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [customerProfile, setCustomerProfile] = useState<any>(null)

  // Shipping form - Start empty, will be populated by useEffect
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    full_name: '',
    phone: '',
    email: '',
    commune: '',
    quartier: '',
    address_details: '',
    country: 'Mali',
    is_default: true
  })
  const [quartierQuery, setQuartierQuery] = useState('')
  const [showQuartierSuggestions, setShowQuartierSuggestions] = useState(false)
  const quartierInputRef = useRef<HTMLInputElement | null>(null)

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'mobile_money'>('cash_on_delivery')
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('')
  // Opérateur mobile money choisi par l'utilisateur (transmis tel quel à l'API)
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState<MobileMoneyProvider>('orange_money')

  // Multi-coupon support
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupons, setAppliedCoupons] = useState<Array<{ code: string; discount: number; coupon: any }>>([])
  const [couponMessage, setCouponMessage] = useState<string | null>(null)
  const [couponMessageType, setCouponMessageType] = useState<'success' | 'error'>('success')
  const [couponLoading, setCouponLoading] = useState(false)
  const [freeShipping, setFreeShipping] = useState(false)
  const [suggestedCoupons, setSuggestedCoupons] = useState<any[]>([])
  const totalCouponDiscount = appliedCoupons.reduce((sum, c) => sum + c.discount, 0)

  // Calcul automatique des frais de livraison en fonction de la commune
  const getDeliveryFee = (): number => {
    const subtotal = getTotal()
    if (subtotal >= 50000) return 0
    return 1000
  }

  const handleQuartierSelect = (quartierLabel: string) => {
    const selectedQuartier = resolveQuartierOption(quartierLabel)
    if (!selectedQuartier) return

    setQuartierQuery(selectedQuartier.label)
    setShippingAddress((current) => ({
      ...current,
      quartier: selectedQuartier.quartier,
      commune: selectedQuartier.commune,
    }))
  }

  const quartierSuggestions = useMemo(
    () => getQuartierSuggestions(quartierQuery, 10),
    [quartierQuery],
  )

  const selectedQuartierLabel = shippingAddress.quartier && shippingAddress.commune
    ? `${shippingAddress.quartier} · ${shippingAddress.commune}`
    : ''

  useEffect(() => {
    if (document.activeElement !== quartierInputRef.current && quartierQuery !== selectedQuartierLabel) {
      setQuartierQuery(selectedQuartierLabel)
    }
  }, [quartierQuery, selectedQuartierLabel])

  // Load customer profile and saved addresses
  useEffect(() => {
    const loadCustomerData = async () => {
      if (!isAuthenticated) return
      
      try {
        setLoadingAddresses(true)
        
        // Load profile and addresses in parallel
        const [profileRes, addressesRes] = await Promise.all([
          apiClient.get<any>('/api/customers/profile'),
          apiClient.get<any[]>('/api/customers/addresses')
        ])
        
        const profile = profileRes.data
        const addresses = addressesRes.data || []
        
        setCustomerProfile(profile)
        setSavedAddresses(addresses)
        
        // Find default address or first address
        const defaultAddress = addresses.find((a: any) => a.is_default) || addresses[0]
        
        // Build shipping address from profile + default address
        const userEmail = profile?.email && !profile.email.includes('@phone.buymore.ml') ? profile.email : ''
        const fullName = profile?.first_name && profile?.last_name 
          ? `${profile.first_name} ${profile.last_name}`
          : profile?.first_name || user?.username || ''
        
        // Use profile phone, or address phone, or user phone
        const phone = profile?.phone || defaultAddress?.phone || user?.phone || ''
        
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id)
          setShippingAddress({
            id: defaultAddress.id,
            full_name: defaultAddress.full_name || fullName,
            phone: defaultAddress.phone || phone,
            email: defaultAddress.email || userEmail,
            commune: defaultAddress.commune || '',
            quartier: defaultAddress.quartier || '',
            address_details: defaultAddress.address_details || '',
            country: defaultAddress.country || 'Mali',
            is_default: defaultAddress.is_default
          })
        } else {
          // No saved address, use profile data
          setShippingAddress({
            full_name: fullName,
            phone: phone,
            email: userEmail,
            commune: savedAddress?.commune || '',
            quartier: savedAddress?.quartier || '',
            address_details: savedAddress?.address_details || '',
            country: 'Mali',
            is_default: true
          })
        }
      } catch (error) {
        console.error('Error loading customer data:', error)
        // Fallback to user data from auth store
        const userEmail = user?.email && !user.email.includes('@phone.buymore.ml') ? user.email : ''
        setShippingAddress({
          full_name: user?.first_name && user?.last_name 
            ? `${user.first_name} ${user.last_name}` 
            : user?.username || '',
          phone: user?.phone || '',
          email: userEmail,
          commune: savedAddress?.commune || '',
          quartier: savedAddress?.quartier || '',
          address_details: savedAddress?.address_details || '',
          country: 'Mali',
          is_default: true
        })
      } finally {
        setLoadingAddresses(false)
      }
    }
    
    loadCustomerData()
  }, [isAuthenticated, user])

  // Redirect to login if not authenticated.
  // On attend 400ms avant de rediriger pour laisser le temps au store de
  // se peupler après un window.location.href (rechargement complet de page).
  useEffect(() => {
    if (isAuthenticated) return
    const t = setTimeout(() => {
      if (!useAuthStore.getState().isAuthenticated) {
        navigate('/login', { state: { from: location } })
      }
    }, 400)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  // Redirect to cart if empty — sauf pendant le traitement d'un paiement
  useEffect(() => {
    if (items.length === 0 && !orderSuccess && !isProcessingPayment) {
      navigate('/cart')
    } else if (items.length > 0 && !orderSuccess) {
      const itemsCount = items.reduce((acc, item) => acc + item.quantity, 0)
      analytics.checkoutStarted(itemsCount, getTotal())
    }
  }, [items, navigate, orderSuccess, isProcessingPayment])

  const validateShipping = (): boolean => {
    const resolvedQuartier = !shippingAddress.quartier && quartierQuery.trim()
      ? resolveQuartierOption(quartierQuery)
      : undefined

    if (resolvedQuartier) {
      setShippingAddress((current) => ({
        ...current,
        quartier: resolvedQuartier.quartier,
        commune: resolvedQuartier.commune,
      }))
      setQuartierQuery(resolvedQuartier.label)
    }

    const quartierValue = shippingAddress.quartier || resolvedQuartier?.quartier || ''
    const communeValue = shippingAddress.commune || resolvedQuartier?.commune || ''

    if (!shippingAddress.full_name.trim()) {
      setError('Le nom complet est requis')
      return false
    }
    if (!shippingAddress.phone.trim()) {
      setError('Le numéro de téléphone est requis')
      return false
    }
    if (!quartierValue) {
      setError('Veuillez sélectionner votre quartier')
      return false
    }
    if (!communeValue) {
      setError('La commune n’a pas pu être détectée pour ce quartier')
      return false
    }
    setError(null)
    return true
  }

  const handleShippingSubmit = () => {
    const resolvedQuartier = !shippingAddress.quartier && quartierQuery.trim()
      ? resolveQuartierOption(quartierQuery)
      : undefined

    const shippingSnapshot = resolvedQuartier
      ? {
          ...shippingAddress,
          quartier: resolvedQuartier.quartier,
          commune: resolvedQuartier.commune,
        }
      : shippingAddress

    if (resolvedQuartier) {
      setShippingAddress(shippingSnapshot)
      setQuartierQuery(resolvedQuartier.label)
    }

    if (validateShipping()) {
      // Sauvegarder l'adresse pour les prochaines commandes si l'utilisateur le souhaite
      if (saveAddressForLater) {
        saveAddress({
          full_name: shippingSnapshot.full_name,
          phone: shippingSnapshot.phone,
          email: shippingSnapshot.email,
          commune: shippingSnapshot.commune,
          quartier: shippingSnapshot.quartier,
          address_details: shippingSnapshot.address_details,
          country: shippingSnapshot.country
        })
      }
      setCurrentStep('payment')
    }
  }

  const handlePaymentSubmit = () => {
    if (paymentMethod === 'mobile_money') {
      // Le champ Mobile Money peut rester vide : on utilise alors le téléphone
      // de livraison. On bloque uniquement si AUCUN numéro n'est disponible.
      const effectivePhone = mobileMoneyNumber.trim() || shippingAddress.phone.trim()
      if (!effectivePhone) {
        setError('Aucun numéro disponible. Renseignez un numéro Mobile Money ou un téléphone de livraison.')
        return
      }
    }
    setError(null)
    setCurrentStep('confirmation')
  }

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase()
    if (!code) return

    // Check if already applied
    if (appliedCoupons.some(c => c.code.toUpperCase() === code)) {
      setCouponMessage('Ce coupon est déjà appliqué')
      setCouponMessageType('error')
      return
    }

    setCouponLoading(true)
    setCouponMessage(null)

    try {
      const storeIds = [...new Set(items.map(i => (i.product as any).store_id || (i.product as any).store?.id).filter(Boolean))]

      const res = await apiClient.post<any>('/api/coupons/validate', {
        code,
        subtotal: getTotal(),
        product_ids: items.map(i => i.product.id),
        store_ids: storeIds,
        items_count: items.reduce((sum, i) => sum + i.quantity, 0),
        already_applied_coupon_ids: appliedCoupons.map(c => c.coupon?.id).filter(Boolean),
      })
      const data = res.data ?? {}

      if (data.valid) {
        setAppliedCoupons(prev => [...prev, { code: data.coupon.code, discount: data.discount, coupon: data.coupon }])
        if (data.coupon?.discount_type === 'free_shipping') {
          setFreeShipping(true)
        }
        setCouponMessage(`Coupon "${data.coupon.code}" appliqué ! -${formatPrice(data.discount, 'XOF')}`)
        setCouponMessageType('success')
        setCouponInput('')
      } else {
        setCouponMessage(data.message || 'Code coupon invalide')
        setCouponMessageType('error')
      }
    } catch (err) {
      setCouponMessage('Erreur de validation du coupon')
      setCouponMessageType('error')
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = (code: string) => {
    setAppliedCoupons(prev => {
      const updated = prev.filter(c => c.code !== code)
      // Re-check free shipping
      setFreeShipping(updated.some(c => c.coupon?.discount_type === 'free_shipping'))
      return updated
    })
    setCouponMessage(null)
  }

  const handleRemoveAllCoupons = () => {
    setAppliedCoupons([])
    setFreeShipping(false)
    setCouponMessage(null)
    setCouponInput('')
  }

  // Load coupon suggestions when checkout starts
  const loadSuggestions = async () => {
    try {
      const storeIds = [...new Set(items.map(i => (i.product as any).store_id || (i.product as any).store?.id).filter(Boolean))]

      const res = await apiClient.post<any>('/api/coupons/suggest', {
        subtotal: getTotal(),
        product_ids: items.map(i => i.product.id),
        store_ids: storeIds,
      })
      if (res.data?.data && Array.isArray(res.data.data)) {
        setSuggestedCoupons(res.data.data)
      }
    } catch (err) {
      // Silent fail for suggestions
    }
  }

  useEffect(() => {
    if (items.length > 0) loadSuggestions()
  }, [items.length])

  const handlePlaceOrder = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Créer la commande avec l'adresse de livraison
      const orderData = {
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        shipping_address: {
          full_name: shippingAddress.full_name,
          phone: shippingAddress.phone,
          email: shippingAddress.email || undefined,
          commune: shippingAddress.commune,
          quartier: shippingAddress.quartier,
          address_details: shippingAddress.address_details || undefined,
          country: shippingAddress.country
        },
        payment_method: paymentMethod,
        delivery_fee: freeShipping ? 0 : getDeliveryFee(),
        coupon_code: appliedCoupons.length > 0 ? appliedCoupons.map(c => c.code).join(',') : undefined,
        // N'enregistrer l'adresse en base que si l'utilisateur l'a demandé
        save_address: saveAddressForLater,
      }

      try {
        console.log('🛒 Creating order with data:', orderData)
        const response = await ordersService.createOrder(orderData)
        console.log('📦 Order creation response:', response)

        if (response.error) {
          console.error('❌ Order error:', response.error)
          // Extraire le message d'erreur si c'est un objet
          const errorMessage = typeof response.error === 'object' && response.error !== null
            ? (response.error as any).message || JSON.stringify(response.error)
            : String(response.error)
          setError(errorMessage)
          return
        }

        if (response.data) {
          console.log('✅ Order created successfully:', response.data)

          // L'API retourne { success: true, data: { id, ... } }
          // response.data est l'enveloppe { success, data }, pas l'ordre directement
          const orderData = (response.data as any)?.data ?? response.data
          const orderId: number = orderData?.id
            ?? orderData?.order_id
            ?? (response.data as any)?.id
          console.log('📦 orderId resolved:', orderId)
          setOrderId(orderId)

          // Track order created
          const orderTotal = getTotal() + getDeliveryFee()
          const itemsCount = items.reduce((acc, item) => acc + item.quantity, 0)
          analytics.orderCreated(orderId, orderTotal, itemsCount, 'website')

          // Paiement Mobile Money via InTouch SDK.
          // Le backend génère une URL /payment/intouch?... avec tous les paramètres
          // (montant, référence, email, nom) récupérés depuis la commande.
          if (paymentMethod === 'mobile_money') {
            setIsProcessingPayment(true)

            if (!orderId) {
              setIsProcessingPayment(false)
              setError('Erreur : ID de commande manquant')
              return
            }

            // Numéro effectif : champ Mobile Money sinon téléphone de livraison.
            const effectiveRaw = mobileMoneyNumber.trim() || shippingAddress.phone || ''
            const phone = toLocalMsisdn(effectiveRaw)

            if (!hasValidMsisdn(phone)) {
              setIsProcessingPayment(false)
              setError('Numéro mobile money invalide. Entrez un numéro malien à 8 chiffres.')
              return
            }

            console.log('💳 InTouch paiement:', { order_id: orderId, provider: mobileMoneyProvider })

            // Email du client depuis le formulaire de livraison (pas les faux @phone.buymore.ml)
            const clientEmail = (shippingAddress.email || '').includes('@phone.buymore.ml')
              ? ''
              : (shippingAddress.email || '')

            const payRes = await mobileMoneyService.initiateIntouchPayment({
              order_id:      orderId,
              phone_number:  `+223${phone}`,
              provider:      mobileMoneyProvider,
              customer_email: clientEmail,
            })

            if (payRes.error || !payRes.data) {
              setIsProcessingPayment(false)
              setError(typeof payRes.error === 'string' ? payRes.error : 'Erreur lors de l\'initiation du paiement InTouch')
              return
            }

            const tx = payRes.data
            sessionStorage.setItem('pending_payment_tx',    String(tx.transaction_id))
            sessionStorage.setItem('pending_payment_order', String(orderId))

            console.log('🔗 Redirecting to InTouch SDK page:', tx.payment_url)
            window.location.href = tx.payment_url
            return
          }

          // Paiement à la livraison : succès direct
          clearCart()
          setOrderSuccess(true)
        } else {
          console.error('❌ No data returned from server')
          setError('Aucune donnée retournée par le serveur')
        }
      } catch (apiError: any) {
        console.error('❌ API Error:', apiError)
        setError(apiError.message || 'Erreur lors de la création de la commande')
      }
    } catch (err: any) {
      console.error('Erreur création commande:', err)
      setError(err.message || 'Une erreur est survenue lors de la création de la commande')
    } finally {
      setIsLoading(false)
    }
  }

  const subtotal = getTotal()
  const delivery = freeShipping ? 0 : getDeliveryFee()
  const total = subtotal + delivery - totalCouponDiscount

  // Order success view
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Commande confirmée !
              </h1>
              <p className="text-gray-600 mb-6">
                Merci pour votre commande. Vous recevrez un email de confirmation avec les détails de votre commande.
              </p>
              {orderId && (
                <p className="text-sm text-gray-500 mb-6">
                  Numéro de commande: <span className="font-semibold">#{orderId}</span>
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate('/client/orders')}>
                  Voir mes commandes
                </Button>
                <Button variant="outline" onClick={() => navigate('/products')}>
                  Continuer mes achats
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour au panier
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Finaliser la commande</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[
              { key: 'shipping', label: 'Livraison', icon: Truck },
              { key: 'payment', label: 'Paiement', icon: CreditCard },
              { key: 'confirmation', label: 'Confirmation', icon: CheckCircle }
            ].map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep === step.key
                  ? 'bg-[#0f4c2b] text-white'
                  : index < ['shipping', 'payment', 'confirmation'].indexOf(currentStep)
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-200 text-gray-500'
                  }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <span className={`ml-2 text-sm font-medium ${currentStep === step.key ? 'text-[#0f4c2b]' : 'text-gray-500'
                  }`}>
                  {step.label}
                </span>
                {index < 2 && (
                  <div className={`w-16 h-1 mx-4 ${index < ['shipping', 'payment', 'confirmation'].indexOf(currentStep)
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Shipping Step */}
            {currentStep === 'shipping' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-[#0f4c2b]" />
                    Adresse de livraison
                  </h2>

                  {/* Saved Addresses Selector */}
                  {loadingAddresses ? (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400 mr-2" />
                      <span className="text-gray-500 text-sm">Chargement de vos adresses...</span>
                    </div>
                  ) : savedAddresses.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Utiliser une adresse enregistrée
                      </label>
                      <div className="space-y-2">
                        {savedAddresses.map((addr: any) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setSelectedAddressId(addr.id)
                              setShippingAddress({
                                id: addr.id,
                                full_name: addr.full_name || shippingAddress.full_name,
                                phone: addr.phone || customerProfile?.phone || shippingAddress.phone,
                                email: addr.email || customerProfile?.email || shippingAddress.email,
                                commune: addr.commune || '',
                                quartier: addr.quartier || '',
                                address_details: addr.address_details || '',
                                country: addr.country || 'Mali',
                                is_default: addr.is_default
                              })
                            }}
                            className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                              selectedAddressId === addr.id
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{addr.full_name || 'Adresse'}</span>
                                  {addr.is_default && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Par défaut</span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {addr.quartier && `${addr.quartier}, `}{addr.commune}
                                </p>
                                {addr.phone && (
                                  <p className="text-sm text-gray-500">{addr.phone}</p>
                                )}
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedAddressId === addr.id ? 'border-green-500 bg-green-500' : 'border-gray-300'
                              }`}>
                                {selectedAddressId === addr.id && (
                                  <CheckCircle className="w-4 h-4 text-white" />
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAddressId(null)
                            setShippingAddress({
                              full_name: customerProfile?.first_name 
                                ? `${customerProfile.first_name} ${customerProfile.last_name || ''}`
                                : '',
                              phone: customerProfile?.phone || '',
                              email: customerProfile?.email || '',
                              commune: '',
                              quartier: '',
                              address_details: '',
                              country: 'Mali',
                              is_default: false
                            })
                          }}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                            selectedAddressId === null
                              ? 'border-green-500 bg-green-50'
                              : 'border-dashed border-gray-300 hover:border-gray-400 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className="font-medium">Nouvelle adresse</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom complet *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={shippingAddress.full_name}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, full_name: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent"
                            placeholder="Amadou Traoré"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Téléphone *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="tel"
                            value={shippingAddress.phone}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent"
                            placeholder="+223 70 12 34 56"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={shippingAddress.email}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent"
                          placeholder="email@exemple.com"
                        />
                      </div>
                    </div>

                    {/* Sélection Quartier puis commune auto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quartier *
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            ref={quartierInputRef}
                            type="text"
                            value={quartierQuery}
                            onChange={(e) => {
                              const nextQuery = e.target.value
                              setQuartierQuery(nextQuery)
                              setShowQuartierSuggestions(true)

                              const resolved = resolveQuartierOption(nextQuery)
                              if (resolved) {
                                setShippingAddress((current) => ({
                                  ...current,
                                  quartier: resolved.quartier,
                                  commune: resolved.commune,
                                }))
                              } else {
                                setShippingAddress((current) => ({
                                  ...current,
                                  quartier: '',
                                  commune: '',
                                }))
                              }
                            }}
                            onFocus={() => setShowQuartierSuggestions(true)}
                            onBlur={() => {
                              window.setTimeout(() => {
                                const resolved = resolveQuartierOption(quartierQuery)
                                if (resolved) {
                                  handleQuartierSelect(resolved.label)
                                }
                                setShowQuartierSuggestions(false)
                              }, 150)
                            }}
                            placeholder="Tapez votre quartier ou votre commune"
                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent bg-white"
                            autoComplete="off"
                          />
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                          {showQuartierSuggestions && (
                            <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                              {quartierSuggestions.length > 0 ? (
                                <div className="max-h-72 overflow-y-auto py-2">
                                  {quartierSuggestions.map((option) => (
                                    <button
                                      key={option.label}
                                      type="button"
                                      onMouseDown={(event) => event.preventDefault()}
                                      onClick={() => {
                                        handleQuartierSelect(option.label)
                                        setShowQuartierSuggestions(false)
                                      }}
                                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-green-50"
                                    >
                                      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-[#0f4c2b]">
                                        <MapPin className="h-4 w-4" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-gray-900">
                                          {option.quartier}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {option.commune}
                                        </p>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <div className="px-4 py-4 text-sm text-gray-500">
                                  Aucun quartier trouvé. Essayez un autre nom ou la commune.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          Recherchez par quartier ou directement par commune.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Commune détectée
                        </label>
                        <div className="w-full px-4 py-3 border border-green-200 rounded-lg bg-green-50 text-gray-800 min-h-[52px] flex items-center">
                          {shippingAddress.commune || 'La commune apparaîtra automatiquement'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Indications supplémentaires (optionnel)
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.address_details}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address_details: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent"
                        placeholder="Près de la mosquée, à côté de la pharmacie..."
                      />
                    </div>

                    {/* Option de sauvegarde de l'adresse */}
                    <div className="mt-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={saveAddressForLater}
                          onChange={(e) => setSaveAddressForLater(e.target.checked)}
                          className="w-5 h-5 text-[#0f4c2b] border-gray-300 rounded focus:ring-[#0f4c2b]"
                        />
                        <div className="flex items-center gap-2">
                          <Save className="h-4 w-4 text-gray-500 group-hover:text-[#0f4c2b]" />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900">
                            Mémoriser cette adresse pour mes prochaines commandes
                          </span>
                        </div>
                      </label>
                      {savedAddress && (
                        <p className="text-xs text-green-600 mt-1 ml-8">
                          ✓ Adresse pré-remplie depuis votre dernière commande
                        </p>
                      )}
                    </div>

                    {/* Frais de livraison automatique */}
                    <div className={`mt-6 p-4 border rounded-lg ${getDeliveryFee() === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-green-50 border-green-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className={`h-5 w-5 ${getDeliveryFee() === 0 ? 'text-emerald-600' : 'text-green-600'}`} />
                          <span className={`font-medium ${getDeliveryFee() === 0 ? 'text-emerald-800' : 'text-green-800'}`}>
                            {getDeliveryFee() === 0 ? 'Livraison Gratuite !' : 'Livraison à Bamako'}
                          </span>
                        </div>
                        <span className={`font-bold ${getDeliveryFee() === 0 ? 'text-emerald-700' : 'text-green-700'}`}>
                          {getDeliveryFee() === 0 ? 'GRATUIT' : formatPrice(getDeliveryFee(), 'XOF')}
                        </span>
                      </div>
                      {getDeliveryFee() === 0 ? (
                        <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
                          <CheckCircle size={14} />
                          Votre commande dépasse 50 000 XOF - Livraison offerte !
                        </p>
                      ) : (
                        <>
                          {shippingAddress.commune && (
                            <p className="text-sm text-green-600 mt-2">
                              {shippingAddress.commune === 'Commune VI'
                                ? 'Zone périphérique - Délai de livraison: 24-48h'
                                : 'Zone centrale - Délai de livraison: sous 24h'
                              }
                            </p>
                          )}
                          {getTotal() < 50000 && (
                            <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                              <AlertCircle size={12} />
                              Plus que {formatPrice(50000 - getTotal(), 'XOF')} pour la livraison gratuite
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleShippingSubmit} size="lg">
                      Continuer vers le paiement
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Step */}
            {currentStep === 'payment' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-[#0f4c2b]" />
                    Mode de paiement
                  </h2>

                  <div className="space-y-4">
                    {/* Cash on Delivery */}
                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cash_on_delivery' ? 'border-[#0f4c2b] bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="cash_on_delivery"
                        checked={paymentMethod === 'cash_on_delivery'}
                        onChange={() => setPaymentMethod('cash_on_delivery')}
                        className="h-4 w-4 text-[#0f4c2b] focus:ring-[#0f4c2b]"
                      />
                      <div className="ml-3">
                        <span className="font-medium">Paiement à la livraison</span>
                        <p className="text-sm text-gray-500">Payez en espèces lors de la réception</p>
                      </div>
                    </label>

                    {/* Mobile Money */}
                    <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'mobile_money' ? 'border-[#0f4c2b] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="mobile_money"
                        checked={paymentMethod === 'mobile_money'}
                        onChange={() => setPaymentMethod('mobile_money')}
                        className="h-4 w-4 text-[#0f4c2b] focus:ring-[#0f4c2b] mt-1"
                      />
                      <div className="ml-3 flex-1">
                        <span className="font-medium">Mobile Money</span>
                        <p className="text-sm text-gray-500">Orange Money, Moov Money, Wave</p>
                      </div>
                    </label>

                    {/* Mobile Money : numéro uniquement — l'opérateur est choisi sur la page InTouch */}
                    {paymentMethod === 'mobile_money' && (
                      <div className="border border-green-200 bg-green-50 rounded-lg p-4 space-y-3">
                        <p className="text-sm font-medium text-gray-700">Orange Money · Moov Money · Wave</p>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Numéro Mobile Money
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 font-medium">+223</span>
                            <input
                              type="tel"
                              value={mobileMoneyNumber}
                              onChange={e => setMobileMoneyNumber(e.target.value.replace(/\D/g, ''))}
                              placeholder={toLocalMsisdn(shippingAddress.phone) || '7X XX XX XX'}
                              maxLength={8}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c2b]"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Laissez vide pour utiliser le numéro de livraison ({toLocalMsisdn(shippingAddress.phone) || 'non renseigné'})
                          </p>
                        </div>
                      </div>
                    )}

                  </div>

                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep('shipping')}>
                      Retour
                    </Button>
                    <Button onClick={handlePaymentSubmit} size="lg">
                      Vérifier la commande
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Confirmation Step */}
            {currentStep === 'confirmation' && (
              <div className="space-y-4">
                {/* En-tête */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-9 w-9 rounded-full bg-green-50 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-[#0f4c2b]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Récapitulatif de la commande</h2>
                  </div>
                  <p className="text-sm text-gray-500 ml-12">Vérifiez vos informations avant de confirmer</p>
                </div>

                {/* Adresse de livraison */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Adresse de livraison</h3>
                    <button
                      onClick={() => setCurrentStep('shipping')}
                      className="ml-auto text-xs text-[#0f4c2b] hover:underline font-medium"
                    >
                      Modifier
                    </button>
                  </div>
                  <div className="space-y-1 pl-9">
                    <p className="font-medium text-gray-900">{shippingAddress.full_name}</p>
                    <p className="text-sm text-gray-600">{shippingAddress.quartier}, {shippingAddress.commune}</p>
                    {shippingAddress.address_details && (
                      <p className="text-sm text-gray-600">{shippingAddress.address_details}</p>
                    )}
                    <p className="text-sm text-gray-600">Bamako, {shippingAddress.country}</p>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 pt-1">
                      <Phone className="h-3.5 w-3.5" />
                      {shippingAddress.phone}
                    </div>
                  </div>
                </div>

                {/* Mode de paiement */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-7 w-7 rounded-full bg-purple-50 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Mode de paiement</h3>
                    <button
                      onClick={() => setCurrentStep('payment')}
                      className="ml-auto text-xs text-[#0f4c2b] hover:underline font-medium"
                    >
                      Modifier
                    </button>
                  </div>
                  <div className="pl-9">
                    {paymentMethod === 'cash_on_delivery' ? (
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-yellow-50 flex items-center justify-center text-lg">💵</div>
                        <div>
                          <p className="font-medium text-gray-900">Paiement à la livraison</p>
                          <p className="text-xs text-gray-500">Payez en espèces à la réception</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center text-lg">📱</div>
                        <div>
                          <p className="font-medium text-gray-900">Mobile Money</p>
                          <p className="text-xs text-gray-500">+223 {toLocalMsisdn(mobileMoneyNumber || shippingAddress.phone)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Articles */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-7 w-7 rounded-full bg-orange-50 flex items-center justify-center">
                      <ShoppingBag className="h-4 w-4 text-orange-500" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Articles <span className="text-gray-400 font-normal">({items.length})</span></h3>
                  </div>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {getProductImageUrl(item.product) ? (
                            <img
                              src={getProductImageUrl(item.product)!}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ShoppingBag className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate text-sm">{item.product.name}</p>
                          <p className="text-xs text-gray-500">Qté : {item.quantity}</p>
                        </div>
                        <p className="font-bold text-gray-900 text-sm whitespace-nowrap">
                          {formatPrice(getEffectivePrice(item.product) * item.quantity, 'XOF')}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Sous-total</span>
                      <span>{formatPrice(getTotal(), 'XOF')}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Livraison</span>
                      <span className={freeShipping ? 'text-green-600 font-medium' : ''}>
                        {freeShipping ? 'Gratuite' : formatPrice(getDeliveryFee(), 'XOF')}
                      </span>
                    </div>
                    {totalCouponDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Réduction</span>
                        <span>-{formatPrice(totalCouponDiscount, 'XOF')}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100">
                      <span>Total</span>
                      <span className="text-[#0f4c2b] text-lg">{formatPrice(getTotal() + (freeShipping ? 0 : getDeliveryFee()) - totalCouponDiscount, 'XOF')}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep('payment')} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Retour
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    size="lg"
                    disabled={isLoading}
                    className="flex-1 max-w-xs"
                  >
                    {isLoading ? (
                      <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Traitement...</>
                    ) : (
                      'Confirmer la commande'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Résumé</h2>

                {/* Items count */}
                <p className="text-sm text-gray-600 mb-4">{items.length} article(s)</p>

                {/* Items list */}
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {getProductImageUrl(item.product) ? (
                          <img
                            src={getProductImageUrl(item.product)!}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingBag className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatPrice(getEffectivePrice(item.product) * item.quantity, 'XOF')}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Multi-Coupon */}
                <div className="border-t pt-4 mb-4">
                  <p className="text-sm font-medium mb-2">Code(s) promo</p>

                  {/* Applied coupons list */}
                  {appliedCoupons.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {appliedCoupons.map((c) => (
                        <div key={c.code} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-bold text-green-700">{c.code}</span>
                            <p className="text-xs text-green-600">-{formatPrice(c.discount, 'XOF')}</p>
                          </div>
                          <button onClick={() => handleRemoveCoupon(c.code)} className="text-red-500 hover:text-red-700 text-xs font-medium ml-2">✕</button>
                        </div>
                      ))}
                      {appliedCoupons.length > 1 && (
                        <button onClick={handleRemoveAllCoupons} className="text-xs text-red-500 hover:text-red-700">Retirer tous les coupons</button>
                      )}
                    </div>
                  )}

                  {/* Input for new coupon */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Entrer un code promo"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-3 py-2 bg-[#0f4c2b] text-white text-sm rounded-lg hover:bg-[#0a3a20] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {couponLoading ? '...' : 'Appliquer'}
                    </button>
                  </div>

                  {/* Message */}
                  {couponMessage && (
                    <p className={`text-xs mt-1 ${couponMessageType === 'success' ? 'text-green-600' : 'text-red-500'}`}>{couponMessage}</p>
                  )}

                  {/* Suggestions */}
                  {suggestedCoupons.length > 0 && appliedCoupons.length === 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Coupons disponibles :</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestedCoupons.slice(0, 3).map((s: any) => (
                          <button
                            key={s.code}
                            onClick={() => { setCouponInput(s.code); }}
                            className="text-xs bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 px-2 py-1 rounded border border-gray-200 hover:border-green-300 transition-colors"
                          >
                            {s.code} {s.discount_type === 'percentage' ? `(-${s.discount_value}%)` : s.discount_type === 'free_shipping' ? '(Livr. gratuite)' : `(-${formatPrice(s.discount_value, 'XOF')})`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sous-total</span>
                    <span>{formatPrice(subtotal, 'XOF')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Livraison</span>
                    <span>{freeShipping ? <span className="text-green-600 font-medium">Gratuit</span> : formatPrice(delivery, 'XOF')}</span>
                  </div>
                  {totalCouponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Réduction coupon{appliedCoupons.length > 1 ? 's' : ''}</span>
                      <span>-{formatPrice(totalCouponDiscount, 'XOF')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-[#0f4c2b]">{formatPrice(total, 'XOF')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
