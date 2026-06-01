import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle, Smartphone } from 'lucide-react'

/**
 * Page de paiement InTouch — configuration chargée depuis le backend.
 * Aucune variable d'environnement nécessaire côté frontend.
 *
 * Signature SDK InTouch (sendPaymentInfos) :
 *   (timestamp, agencyCode, secureCode, domain,
 *    returnUrl, cancelUrl, amount, city,
 *    firstName, lastName, email, phone)
 */

declare global {
  interface Window {
    sendPaymentInfos?: (
      timestamp:  number,
      agencyCode: string,
      secureCode: string,
      domain:     string,
      returnUrl:  string,
      cancelUrl:  string,
      amount:     number,
      city:       string,
      firstName:  string,
      lastName:   string,
      email:      string,
      phone:      string
    ) => void
  }
}

const INTOUCH_SDK_URL = 'https://touchpay.gutouch.net/touchpayv2/script/touchpaynr/prod_touchpay-0.0.1.js'

// URL de l'API BuyMore — déduite de window.location ou hardcodée en fallback
const getApiBase = () => {
  // En production sur buymore.ml, l'API est sur buymore-api-production.up.railway.app
  // En développement sur localhost, l'API est sur localhost:3000
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000'
  }
  return 'https://buymore-api-production.up.railway.app'
}

interface IntouchSdkConfig {
  agency_code: string
  secure_code: string
  domain:      string
  webhook_url: string
}

export function PaymentIntouchPage() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()

  const reference  = searchParams.get('reference') || ''
  const amount     = Number(searchParams.get('amount') || 0)
  const phone      = searchParams.get('phone')     || ''
  const email      = searchParams.get('email')     || ''
  const orderNum   = searchParams.get('order')     || ''
  const firstName  = searchParams.get('firstname') || 'Client'
  const lastName   = searchParams.get('lastname')  || 'BuyMore'
  const city       = searchParams.get('city')      || 'Bamako'

  const [sdkConfig,  setSdkConfig]  = useState<IntouchSdkConfig | null>(null)
  const [sdkReady,   setSdkReady]   = useState(false)
  const [sdkError,   setSdkError]   = useState<string | null>(null)
  const [launched,   setLaunched]   = useState(false)
  const [loadingCfg, setLoadingCfg] = useState(true)

  const IS_DEV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

  // ── Étape 1 : charger la config depuis le backend ─────────────────────────
  useEffect(() => {
    if (!reference || !amount) {
      setSdkError('Paramètres de paiement manquants.')
      setLoadingCfg(false)
      return
    }

    const fetchConfig = async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/payments/intouch/sdk-config`)
        if (!res.ok) throw new Error(`Erreur serveur ${res.status}`)
        const data: IntouchSdkConfig = await res.json()
        if (!data.agency_code || !data.secure_code) {
          throw new Error('Configuration InTouch incomplète sur le serveur')
        }
        console.log('[InTouch] Config chargée :', { agencyCode: data.agency_code, domain: data.domain })
        setSdkConfig(data)
      } catch (err: any) {
        setSdkError(`Impossible de charger la configuration de paiement : ${err.message}`)
      } finally {
        setLoadingCfg(false)
      }
    }

    fetchConfig()
  }, [reference, amount])

  // ── Étape 2 : charger le SDK InTouch ─────────────────────────────────────
  // On ne marque "ready" QUE lorsque window.sendPaymentInfos est réellement
  // disponible (le onload du script peut précéder l'attachement du global →
  // d'où l'ancien bug "SDK indisponible, rechargez la page").
  const loadSdk = () => {
    setSdkError(null)
    setSdkReady(false)

    // Si la fonction est déjà là (script déjà chargé une fois), on est prêt.
    if (typeof window.sendPaymentInfos === 'function') {
      setSdkReady(true)
      return
    }

    // Attendre la disponibilité du global avec un polling borné.
    const waitForGlobal = () => {
      let waited = 0
      const interval = window.setInterval(() => {
        if (typeof window.sendPaymentInfos === 'function') {
          window.clearInterval(interval)
          console.log('[InTouch] SDK prêt ✅')
          setSdkReady(true)
        } else if ((waited += 100) >= 8000) {
          window.clearInterval(interval)
          setSdkError('Le système de paiement met trop de temps à répondre. Réessayez.')
        }
      }, 100)
    }

    const existing = document.getElementById('intouch-sdk') as HTMLScriptElement | null
    if (existing) {
      waitForGlobal()
      return
    }

    const script = document.createElement('script')
    script.id = 'intouch-sdk'
    script.src = INTOUCH_SDK_URL
    script.async = true
    script.onload = () => waitForGlobal()
    script.onerror = () => {
      // Retirer le script échoué pour permettre un vrai retry
      script.remove()
      setSdkError('Impossible de charger le système de paiement. Vérifiez votre connexion.')
    }
    document.body.appendChild(script)
  }

  useEffect(() => {
    if (!sdkConfig) return
    loadSdk()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkConfig])

  // ── Étape 3 : lancer le paiement dès que le SDK est prêt ─────────────────
  useEffect(() => {
    if (sdkReady && sdkConfig && !launched) launchPayment()
  }, [sdkReady, sdkConfig])

  const launchPayment = () => {
    if (typeof window.sendPaymentInfos !== 'function') {
      // Ne devrait plus arriver (on n'appelle qu'une fois prêt), mais on recharge
      // le SDK au lieu de demander un refresh complet de la page.
      setLaunched(false)
      loadSdk()
      return
    }
    if (!sdkConfig) return

    const origin    = window.location.origin
    const returnUrl = `${origin}/payment/success?reference=${encodeURIComponent(reference)}&order=${encodeURIComponent(orderNum)}&payment_method=intouch`
    const cancelUrl = `${origin}/payment/cancel?reference=${encodeURIComponent(reference)}&order=${encodeURIComponent(orderNum)}&payment_method=intouch`
    const notifUrl  = sdkConfig.webhook_url

    // Log non sensible : pas de secureCode, ni téléphone/email en clair
    console.log('[InTouch] sendPaymentInfos:', {
      agencyCode: sdkConfig.agency_code,
      domain: sdkConfig.domain,
      amount,
      reference,
    })

    try {
      setLaunched(true)
      window.sendPaymentInfos(
        new Date().getTime(),
        sdkConfig.agency_code,
        sdkConfig.secure_code,
        sdkConfig.domain,
        returnUrl,
        cancelUrl,
        amount,
        city,
        firstName,
        lastName,
        email,
        phone
      )
    } catch (err: any) {
      console.error('[InTouch] Erreur sendPaymentInfos :', err)
      setSdkError('Erreur lors du lancement du paiement InTouch. Cliquez sur "Réessayer".')
      setLaunched(false)
    }
  }

  // ── Erreur ────────────────────────────────────────────────────────────────
  if (sdkError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Erreur de paiement</h1>
          <p className="text-gray-500 mb-6">{sdkError}</p>
          <div className="space-y-3">
            <button
              onClick={() => { setLaunched(false); loadSdk() }}
              className="w-full py-3 bg-[#0f4c2b] text-white rounded-xl font-semibold hover:bg-[#0a3a20]"
            >
              Réessayer
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50"
            >
              Retour au panier
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Chargement ────────────────────────────────────────────────────────────
  const isLoading = loadingCfg || (!sdkReady && !sdkError)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">

        <div className="flex justify-center mb-6">
          {isLoading
            ? <Loader2 className="h-12 w-12 animate-spin text-[#0f4c2b]" />
            : <Smartphone className="h-12 w-12 text-[#0f4c2b]" />
          }
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement Mobile Money</h1>
        <p className="text-gray-500 mb-6">
          {loadingCfg
            ? 'Chargement de la configuration…'
            : !sdkReady
              ? 'Chargement du système de paiement…'
              : launched
                ? 'La fenêtre de paiement est ouverte. Suivez les instructions.'
                : 'Initialisation…'
          }
        </p>

        {/* Récapitulatif */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
          {amount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Montant</span>
              <span className="font-semibold">{amount.toLocaleString('fr-ML')} FCFA</span>
            </div>
          )}
          {phone && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Téléphone</span>
              <span className="font-semibold">{phone}</span>
            </div>
          )}
          {orderNum && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Commande</span>
              <span className="font-semibold">{orderNum}</span>
            </div>
          )}
          {reference && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Référence</span>
              <span className="font-mono text-xs text-gray-400">{reference}</span>
            </div>
          )}
        </div>

        {/* Avertissement localhost */}
        {IS_DEV && sdkReady && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-left">
            <p className="text-xs font-semibold text-amber-800 mb-1">⚠️ Mode développement</p>
            <p className="text-xs text-amber-700">
              InTouch peut rejeter les appels depuis localhost. Le SDK fonctionnera sur <strong>buymore.ml</strong>.
            </p>
          </div>
        )}

        {/* Bouton relancement */}
        {sdkReady && (
          <button
            onClick={() => { setLaunched(false); launchPayment() }}
            className="w-full py-3 bg-[#0f4c2b] text-white rounded-xl font-semibold hover:bg-[#0a3a20] transition-colors mb-3 flex items-center justify-center gap-2"
          >
            <Smartphone className="h-5 w-5" />
            {launched ? 'Relancer le paiement' : 'Lancer le paiement'}
          </button>
        )}

        <button
          onClick={() => navigate('/cart')}
          className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm"
        >
          Annuler — retourner au panier
        </button>

        {launched && (
          <p className="text-xs text-gray-400 mt-4">
            Si la fenêtre s'est fermée sans confirmation, cliquez sur "Relancer le paiement".
          </p>
        )}
      </div>
    </div>
  )
}
