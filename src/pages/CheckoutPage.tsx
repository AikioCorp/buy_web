import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useShippingStore } from '@/store/shippingStore'
import { ordersService } from '@/lib/api/ordersService'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/Card'
import { 
  ShoppingBag, MapPin, CreditCard, Truck, CheckCircle, 
  ArrowLeft, Loader2, AlertCircle, Phone, User, Mail, Save
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend.buymore.ml'

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

// Données des communes et quartiers de Bamako
const BAMAKO_ZONES: Record<string, { quartiers: string[], frais_livraison: number }> = {
  'Commune I': {
    quartiers: ['Korofina Nord', 'Korofina Sud', 'Banconi', 'Boulkassoumbougou', 'Djelibougou', 'Sotuba', 'Fadjiguila', 'Sikoroni', 'Doumanzana'],
    frais_livraison: 1000
  },
  'Commune II': {
    quartiers: ['Hippodrome', 'Médina Coura', 'Bozola', 'Niarela', 'Quinzambougou', 'Bagadadji', 'TSF', 'Missira', 'Zone Industrielle', 'Bougouba'],
    frais_livraison: 1000
  },
  'Commune III': {
    quartiers: ['Bamako Coura', 'Darsalam', 'Ouolofobougou', 'ACI 2000', 'Point G', 'Koulouba', 'N\'Tomikorobougou', 'Samé', 'Badialan I', 'Badialan II', 'Badialan III'],
    frais_livraison: 1000
  },
  'Commune IV': {
    quartiers: ['Lafiabougou', 'Hamdallaye', 'Djicoroni Para', 'Sébenikoro', 'Taliko', 'Lassa', 'Sébénikoro', 'Djélibougou'],
    frais_livraison: 1000
  },
  'Commune V': {
    quartiers: ['Badalabougou', 'Quartier du Fleuve', 'Torokorobougou', 'Daoudabougou', 'Sabalibougou', 'Kalaban Coura', 'Baco Djicoroni ACI', 'Baco Djicoroni Golf', 'Garantiguibougou'],
    frais_livraison: 1000
  },
  'Commune VI': {
    quartiers: ['Sogoniko', 'Faladié', 'Magnambougou', 'Niamakoro', 'Banankabougou', 'Missabougou', 'Sokorodji', 'Yirimadio', 'Dianéguéla', 'Senou'],
    frais_livraison: 1500
  }
}

type Step = 'shipping' | 'payment' | 'confirmation'

export function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { items, getTotal, clearCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const { savedAddress, saveAddress } = useShippingStore()
  
  const [currentStep, setCurrentStep] = useState<Step>('shipping')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [saveAddressForLater, setSaveAddressForLater] = useState(true)
  
  // Shipping form - Priorité: adresse sauvegardée > données utilisateur > vide
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(() => {
    // Si une adresse est sauvegardée, l'utiliser
    if (savedAddress) {
      return {
        ...savedAddress,
        is_default: true
      }
    }
    // Sinon, utiliser les données de l'utilisateur
    // Ne pas afficher l'email généré automatiquement
    const userEmail = user?.email && !user.email.includes('@phone.buymore.ml') ? user.email : ''
    
    return {
      full_name: user?.first_name && user?.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user?.username || '',
      phone: user?.phone || '',
      email: userEmail,
      commune: '',
      quartier: '',
      address_details: '',
      country: 'Mali',
      is_default: true
    }
  })
  
  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'mobile_money'>('cash_on_delivery')
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState<'wave' | 'orange_money' | 'sama' | 'moov'>('wave')
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('')
  
  // Calcul automatique des frais de livraison en fonction de la commune
  const getDeliveryFee = (): number => {
    if (!shippingAddress.commune) return 1000 // Frais par défaut
    return BAMAKO_ZONES[shippingAddress.commune]?.frais_livraison || 1000
  }
  
  // Quartiers disponibles en fonction de la commune sélectionnée
  const availableQuartiers = shippingAddress.commune 
    ? BAMAKO_ZONES[shippingAddress.commune]?.quartiers || []
    : []

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
    }
  }, [isAuthenticated, navigate, location])

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0 && !orderSuccess) {
      navigate('/cart')
    }
  }, [items, navigate, orderSuccess])

  const validateShipping = (): boolean => {
    if (!shippingAddress.full_name.trim()) {
      setError('Le nom complet est requis')
      return false
    }
    if (!shippingAddress.phone.trim()) {
      setError('Le numéro de téléphone est requis')
      return false
    }
    if (!shippingAddress.commune) {
      setError('Veuillez sélectionner votre commune')
      return false
    }
    if (!shippingAddress.quartier) {
      setError('Veuillez sélectionner votre quartier')
      return false
    }
    setError(null)
    return true
  }

  const handleShippingSubmit = () => {
    if (validateShipping()) {
      // Sauvegarder l'adresse pour les prochaines commandes si l'utilisateur le souhaite
      if (saveAddressForLater) {
        saveAddress({
          full_name: shippingAddress.full_name,
          phone: shippingAddress.phone,
          email: shippingAddress.email,
          commune: shippingAddress.commune,
          quartier: shippingAddress.quartier,
          address_details: shippingAddress.address_details,
          country: shippingAddress.country
        })
      }
      setCurrentStep('payment')
    }
  }

  const handlePaymentSubmit = () => {
    if (paymentMethod === 'mobile_money' && !mobileMoneyNumber.trim()) {
      setError('Le numéro Mobile Money est requis')
      return
    }
    setError(null)
    setCurrentStep('confirmation')
  }

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
        delivery_fee: getDeliveryFee()
      }

      try {
        console.log('🛒 Creating order with data:', orderData)
        const response = await ordersService.createOrder(orderData)
        console.log('📦 Order creation response:', response)
        
        if (response.error) {
          console.error('❌ Order error:', response.error)
          setError(response.error)
          return
        }

        if (response.data) {
          console.log('✅ Order created successfully:', response.data)
          setOrderId(response.data.id)
          setOrderSuccess(true)
          clearCart()
          console.log('✅ Order success state set, should show success page')
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
  const delivery = getDeliveryFee()
  const total = subtotal + delivery

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
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep === step.key 
                    ? 'bg-[#0f4c2b] text-white' 
                    : index < ['shipping', 'payment', 'confirmation'].indexOf(currentStep)
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep === step.key ? 'text-[#0f4c2b]' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
                {index < 2 && (
                  <div className={`w-16 h-1 mx-4 ${
                    index < ['shipping', 'payment', 'confirmation'].indexOf(currentStep)
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
                            onChange={(e) => setShippingAddress({...shippingAddress, full_name: e.target.value})}
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
                            onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
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
                          onChange={(e) => setShippingAddress({...shippingAddress, email: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent"
                          placeholder="email@exemple.com"
                        />
                      </div>
                    </div>

                    {/* Sélection Commune et Quartier */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Commune *
                        </label>
                        <select
                          value={shippingAddress.commune}
                          onChange={(e) => setShippingAddress({
                            ...shippingAddress, 
                            commune: e.target.value,
                            quartier: '' // Reset quartier when commune changes
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent bg-white"
                        >
                          <option value="">Sélectionnez votre commune</option>
                          {Object.keys(BAMAKO_ZONES).map((commune) => (
                            <option key={commune} value={commune}>{commune}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quartier *
                        </label>
                        <select
                          value={shippingAddress.quartier}
                          onChange={(e) => setShippingAddress({...shippingAddress, quartier: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent bg-white"
                          disabled={!shippingAddress.commune}
                        >
                          <option value="">Sélectionnez votre quartier</option>
                          {availableQuartiers.map((quartier) => (
                            <option key={quartier} value={quartier}>{quartier}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Indications supplémentaires (optionnel)
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.address_details}
                        onChange={(e) => setShippingAddress({...shippingAddress, address_details: e.target.value})}
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
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800">Livraison à Bamako</span>
                        </div>
                        <span className="font-bold text-green-700">{formatPrice(getDeliveryFee(), 'XOF')}</span>
                      </div>
                      {shippingAddress.commune && (
                        <p className="text-sm text-green-600 mt-2">
                          {shippingAddress.commune === 'Commune VI' 
                            ? 'Zone périphérique - Délai de livraison: 24-48h'
                            : 'Zone centrale - Délai de livraison: sous 24h'
                          }
                        </p>
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
                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'cash_on_delivery' ? 'border-[#0f4c2b] bg-green-50' : 'border-gray-200 hover:border-gray-300'
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
                    <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'mobile_money' ? 'border-[#0f4c2b] bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
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
                        <p className="text-sm text-gray-500 mb-3">Wave, Orange Money, Sama, Moov Africa</p>
                        {paymentMethod === 'mobile_money' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: 'wave', label: 'Wave', color: 'bg-blue-500' },
                                { id: 'orange_money', label: 'Orange Money', color: 'bg-orange-500' },
                                { id: 'sama', label: 'Sama', color: 'bg-purple-500' },
                                { id: 'moov', label: 'Moov Africa', color: 'bg-cyan-500' }
                              ].map((provider) => (
                                <button
                                  key={provider.id}
                                  type="button"
                                  onClick={() => setMobileMoneyProvider(provider.id as any)}
                                  className={`p-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                                    mobileMoneyProvider === provider.id
                                      ? 'border-[#0f4c2b] bg-green-50 text-[#0f4c2b]'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  {provider.label}
                                </button>
                              ))}
                            </div>
                            <input
                              type="tel"
                              value={mobileMoneyNumber}
                              onChange={(e) => setMobileMoneyNumber(e.target.value)}
                              placeholder="Votre numéro de téléphone"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent"
                            />
                          </div>
                        )}
                      </div>
                    </label>

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
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-[#0f4c2b]" />
                    Récapitulatif de la commande
                  </h2>

                  {/* Shipping Address Summary */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Adresse de livraison</h3>
                    <p className="text-gray-600">{shippingAddress.full_name}</p>
                    <p className="text-gray-600">{shippingAddress.quartier}, {shippingAddress.commune}</p>
                    {shippingAddress.address_details && (
                      <p className="text-gray-600">{shippingAddress.address_details}</p>
                    )}
                    <p className="text-gray-600">Bamako, {shippingAddress.country}</p>
                    <p className="text-gray-600">{shippingAddress.phone}</p>
                  </div>

                  {/* Payment Method Summary */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Mode de paiement</h3>
                    <p className="text-gray-600">
                      {paymentMethod === 'cash_on_delivery' && 'Paiement à la livraison'}
                      {paymentMethod === 'mobile_money' && (
                        <>
                          {mobileMoneyProvider === 'wave' && 'Wave'}
                          {mobileMoneyProvider === 'orange_money' && 'Orange Money'}
                          {mobileMoneyProvider === 'sama' && 'Sama'}
                          {mobileMoneyProvider === 'moov' && 'Moov Africa'}
                          {' - '}{mobileMoneyNumber}
                        </>
                      )}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-4">Articles ({items.length})</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {getProductImageUrl(item.product) ? (
                              <img 
                                src={getProductImageUrl(item.product)!} 
                                alt={item.product.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ShoppingBag className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">
                            {formatPrice(parseFloat(item.product.base_price) * item.quantity, 'XOF')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep('payment')}>
                      Retour
                    </Button>
                    <Button 
                      onClick={handlePlaceOrder} 
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Traitement...
                        </>
                      ) : (
                        <>
                          Confirmer la commande
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
                        {formatPrice(parseFloat(item.product.base_price) * item.quantity, 'XOF')}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sous-total</span>
                    <span>{formatPrice(subtotal, 'XOF')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Livraison</span>
                    <span>{formatPrice(delivery, 'XOF')}</span>
                  </div>
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
