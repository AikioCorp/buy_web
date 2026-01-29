import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/Card'
import { Trash2, ShoppingBag, MessageCircle } from 'lucide-react'
import { LoginPopup } from '@/components/LoginPopup'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend.buymore.ml'

// Fonction pour obtenir l'URL de l'image du produit
const getProductImageUrl = (product: any): string | null => {
  if (!product?.media || product.media.length === 0) return null
  const primaryImage = product.media.find((m: any) => m.is_primary) || product.media[0]
  let url = primaryImage?.image_url || primaryImage?.file
  if (!url) return null
  // Convertir http:// en https:// pour éviter le blocage mixed content
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://')
  }
  if (url.startsWith('https://')) return url
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

export function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore()
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const [showLoginPopup, setShowLoginPopup] = useState(false)

  const handleCheckout = () => {
    if (!user) {
      setShowLoginPopup(true)
      return
    }
    navigate('/checkout')
  }

  const handleLoginSuccess = () => {
    setShowLoginPopup(false)
    navigate('/checkout')
  }

  const handleWhatsAppOrder = () => {
    const itemsList = items.map(item => 
      `• *${item.product.name}*\n  Quantité: ${item.quantity}\n  Prix unitaire: ${formatPrice(parseFloat(item.product.base_price), 'XOF')}\n  Sous-total: ${formatPrice(parseFloat(item.product.base_price) * item.quantity, 'XOF')}`
    ).join('\n\n')
    
    const message = `Bonjour BuyMore, je souhaite commander:\n\n${itemsList}\n\n*Montant total: ${formatPrice(getTotal(), 'XOF')}*\n\n*Lieu de livraison:* [Veuillez préciser votre adresse]\n\nMerci de me confirmer la disponibilité et les frais de livraison.`
    const whatsappUrl = `https://wa.me/22370009007?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Votre panier est vide</h2>
        <p className="text-gray-600 mb-8">Découvrez nos produits et commencez vos achats !</p>
        <Link to="/shops">
          <Button>Explorer les boutiques</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mon panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.product.id}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {getProductImageUrl(item.product) ? (
                      <img src={getProductImageUrl(item.product)!} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">{item.product.store?.name || 'Boutique'}</p>
                    <p className="text-lg font-bold text-primary mt-1">
                      {formatPrice(parseFloat(item.product.base_price), 'XOF')}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border rounded text-center"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Résumé de la commande</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span className="font-semibold">{formatPrice(getTotal(), 'XOF')}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Livraison</span>
                  <span>À calculer</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(getTotal(), 'XOF')}</span>
                </div>
              </div>

              <Button onClick={handleCheckout} className="w-full" size="lg">
                Passer la commande
              </Button>

              <button
                onClick={handleWhatsAppOrder}
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-all mt-2"
              >
                <MessageCircle className="h-5 w-5" />
                Commander sur WhatsApp
              </button>

              <Button
                variant="outline"
                onClick={clearCart}
                className="w-full mt-2"
              >
                Vider le panier
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

      {/* Login Popup */}
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  )
}
