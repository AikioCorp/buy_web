import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { XCircle } from 'lucide-react'

/**
 * Page de retour après annulation d'un paiement Wave.
 * Wave redirige ici avec ?order=ORDER_NUMBER.
 */
export function PaymentCancelPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const orderNumber = searchParams.get('order')

  useEffect(() => {
    sessionStorage.removeItem('pending_payment_tx')
    sessionStorage.removeItem('pending_payment_order')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <XCircle className="h-14 w-14 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement annulé</h1>
        <p className="text-gray-500 mb-6">
          {orderNumber
            ? `Vous avez annulé le paiement Wave pour la commande ${orderNumber}.`
            : 'Vous avez annulé le paiement Wave.'}
          {' '}Votre commande reste en attente de paiement.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/cart')}
            className="w-full py-3 bg-[#0f4c2b] text-white rounded-xl font-semibold hover:bg-[#0a3a20] transition-colors"
          >
            Retour au panier
          </button>
          <button
            onClick={() => navigate('/client/orders')}
            className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 transition-colors"
          >
            Voir mes commandes
          </button>
        </div>
      </div>
    </div>
  )
}
