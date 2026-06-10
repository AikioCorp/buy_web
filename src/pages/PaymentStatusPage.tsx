import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Clock, Loader2, Phone, RefreshCw } from 'lucide-react'
import { mobileMoneyService, PROVIDER_LABELS, type TransactionStatus, type MobileMoneyProvider } from '@/lib/api/mobileMoneyService'
import { useCartStore } from '@/store/cartStore'

const POLL_INTERVAL_MS = 5000
const MAX_POLLS = 36 // 3 minutes max

const STATUS_CONFIG: Record<TransactionStatus, { icon: React.ReactNode; title: string; desc: string; color: string }> = {
  initiated: {
    icon: <Loader2 className="h-12 w-12 animate-spin text-blue-500" />,
    title: 'Paiement en cours…',
    desc: 'Nous attendons votre confirmation. Validez la demande sur votre téléphone.',
    color: 'blue',
  },
  pending: {
    icon: <Loader2 className="h-12 w-12 animate-spin text-blue-500" />,
    title: 'Traitement en cours…',
    desc: 'Votre paiement est en cours de traitement. Merci de patienter.',
    color: 'blue',
  },
  completed: {
    icon: <CheckCircle className="h-12 w-12 text-green-500" />,
    title: 'Paiement réussi !',
    desc: 'Votre paiement a bien été reçu. Votre commande est confirmée.',
    color: 'green',
  },
  failed: {
    icon: <XCircle className="h-12 w-12 text-red-500" />,
    title: 'Paiement échoué',
    desc: 'Le paiement n\'a pas pu être traité. Vous pouvez réessayer.',
    color: 'red',
  },
  expired: {
    icon: <Clock className="h-12 w-12 text-amber-500" />,
    title: 'Paiement expiré',
    desc: 'La session de paiement a expiré. Veuillez relancer un nouveau paiement.',
    color: 'amber',
  },
}

export function PaymentStatusPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { clearCart } = useCartStore()

  const transactionId = searchParams.get('transaction_id')
  const orderId = searchParams.get('order_id')
  const provider = (searchParams.get('provider') as MobileMoneyProvider) || 'orange_money'
  const initError = searchParams.get('error')

  const [status, setStatus] = useState<TransactionStatus>(initError ? 'failed' : 'initiated')
  const [amount, setAmount] = useState<number | null>(null)
  const [pollCount, setPollCount] = useState(0)
  const [isStopped, setIsStopped] = useState(!!initError || !transactionId || transactionId === 'error')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const providerLabel = PROVIDER_LABELS[provider] || provider

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsStopped(true)
  }

  const checkStatus = async () => {
    if (!transactionId || transactionId === 'error') return

    const res = await mobileMoneyService.checkStatus(Number(transactionId))
    if (res.data) {
      const newStatus = res.data.status
      setStatus(newStatus)
      if (res.data.amount) setAmount(res.data.amount)

      if (newStatus === 'completed' || newStatus === 'failed' || newStatus === 'expired') {
        stopPolling()
      }
    }

    setPollCount(c => {
      const next = c + 1
      if (next >= MAX_POLLS) stopPolling()
      return next
    })
  }

  useEffect(() => {
    if (isStopped || !transactionId || transactionId === 'error') return

    // Premier check immédiat
    checkStatus()

    intervalRef.current = setInterval(checkStatus, POLL_INTERVAL_MS)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [transactionId])

  // Redirection auto vers les commandes après succès
  useEffect(() => {
    if (status === 'completed') {
      clearCart()
      const timer = setTimeout(() => navigate('/client/orders'), 3000)
      return () => clearTimeout(timer)
    }
  }, [status, navigate, clearCart])

  const cfg = STATUS_CONFIG[status]
  const isLoading = (status === 'initiated' || status === 'pending') && !isStopped

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">

        {/* Icône de statut */}
        <div className="flex justify-center mb-6">
          {cfg.icon}
        </div>

        {/* Titre */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{cfg.title}</h1>
        <p className="text-gray-500 mb-6">{initError ? decodeURIComponent(initError) : cfg.desc}</p>

        {/* Infos paiement */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
          {amount && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Montant</span>
              <span className="font-semibold">{amount.toLocaleString('fr-ML')} FCFA</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Opérateur</span>
            <span className="font-semibold">{providerLabel}</span>
          </div>
          {orderId && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Commande</span>
              <span className="font-semibold">#{orderId}</span>
            </div>
          )}
          {transactionId && transactionId !== 'error' && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Transaction</span>
              <span className="font-semibold text-xs text-gray-400">#{transactionId}</span>
            </div>
          )}
        </div>

        {/* Spinner de polling */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Vérification automatique toutes les 5 secondes…</span>
          </div>
        )}

        {/* Instruction pour Orange / Moov */}
        {isLoading && (provider === 'orange_money' || provider === 'moov_money') && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3 text-left">
            <Phone className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Validez sur votre téléphone</p>
              <p>Vous avez reçu une notification {providerLabel}. Entrez votre code PIN pour confirmer le paiement.</p>
            </div>
          </div>
        )}

        {/* Expiration timeout */}
        {isStopped && status !== 'completed' && status !== 'failed' && status !== 'expired' && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 text-sm text-amber-700">
            La vérification automatique s'est arrêtée. Cliquez sur "Vérifier manuellement" si vous avez validé.
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {status === 'completed' && (
            <button
              onClick={() => navigate('/client/orders')}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Voir mes commandes
            </button>
          )}

          {(status === 'failed' || status === 'expired' || initError) && (
            <button
              onClick={() => navigate('/cart')}
              className="w-full py-3 bg-[#0f4c2b] text-white rounded-xl font-semibold hover:bg-[#0a3a20] transition-colors"
            >
              Retour au panier
            </button>
          )}

          {isStopped && (status === 'initiated' || status === 'pending') && transactionId && transactionId !== 'error' && (
            <button
              onClick={() => {
                setIsStopped(false)
                checkStatus()
              }}
              className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Vérifier manuellement
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 text-gray-500 hover:text-gray-700 text-sm"
          >
            Retour à l'accueil
          </button>
        </div>

        {/* Redirection auto message */}
        {status === 'completed' && (
          <p className="text-xs text-gray-400 mt-4">
            Redirection automatique dans 3 secondes…
          </p>
        )}
      </div>
    </div>
  )
}
