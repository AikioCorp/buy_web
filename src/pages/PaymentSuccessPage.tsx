import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Loader2 } from 'lucide-react'

/**
 * Page de retour après paiement Wave (succès).
 * Wave redirige ici avec ?order=ORDER_NUMBER.
 * On récupère le transaction_id stocké en sessionStorage et on redirige
 * vers PaymentStatusPage pour confirmer le statut réel via l'API.
 */
export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const orderNumber = searchParams.get('order')
  const provider    = searchParams.get('provider') || 'orange_money'  // opérateur réel, pas wave hardcodé
  const storedTxId    = sessionStorage.getItem('pending_payment_tx')
  const storedOrderId = sessionStorage.getItem('pending_payment_order')

  useEffect(() => {
    sessionStorage.removeItem('pending_payment_tx')
    sessionStorage.removeItem('pending_payment_order')

    const timer = setTimeout(() => {
      if (storedTxId && storedOrderId) {
        navigate(`/payment/status?transaction_id=${storedTxId}&order_id=${storedOrderId}&provider=${provider}`, { replace: true })
      } else {
        navigate('/client/orders', { replace: true })
      }
    }, 1500)

    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement Wave confirmé</h1>
        <p className="text-gray-500 mb-4">
          {orderNumber ? `Commande ${orderNumber} — ` : ''}Vérification du statut en cours…
        </p>
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    </div>
  )
}
