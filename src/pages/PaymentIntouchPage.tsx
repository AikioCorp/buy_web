import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle, Smartphone } from 'lucide-react'

declare global {
  interface Window {
    sendPaymentInfos?: (
      timestamp:  number,   // 1
      agencyCode: string,   // 2
      secureCode: string,   // 3
      domain:     string,   // 4
      returnUrl:  string,   // 5
      cancelUrl:  string,   // 6
      amount:     number,   // 7
      city:       string,   // 8
      email:      string,   // 9 ← InTouch attend l'email en position 9
      firstName:  string,   // 10
      lastName:   string,   // 11
      phone:      string    // 12
    ) => void
  }
}

const SDK_URL = 'https://touchpay.gutouch.net/touchpayv2/script/touchpaynr/prod_touchpay-0.0.1.js'

const getApiBase = () =>
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : 'https://buymore-api-production.up.railway.app'

const PROVIDER_LABELS: Record<string, string> = {
  orange_money: 'Orange Money',
  moov_money:   'Moov Money',
  wave:         'Wave',
}

interface SdkConfig {
  agency_code: string
  secure_code: string
  domain:      string
  webhook_url: string
}

export function PaymentIntouchPage() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()

  // Paramètres depuis l'URL (construits par le backend InTouch service)
  const reference  = searchParams.get('reference') || ''
  const amount     = Number(searchParams.get('amount') || 0)
  const phone      = searchParams.get('phone')     || ''
  const email      = searchParams.get('email')     || ''
  const orderNum   = searchParams.get('order')     || ''
  const firstName  = searchParams.get('firstname') || 'Client'
  const lastName   = searchParams.get('lastname')  || 'BuyMore'
  const city       = searchParams.get('city')      || 'Bamako'
  // Opérateur sélectionné dans le checkout — transmis dans l'URL par le backend
  const provider   = searchParams.get('provider')  || 'orange_money'

  const [sdkConfig,  setSdkConfig]  = useState<SdkConfig | null>(null)
  const [sdkReady,   setSdkReady]   = useState(false)
  const [sdkError,   setSdkError]   = useState<string | null>(null)
  const [launched,   setLaunched]   = useState(false)
  const [loadingCfg, setLoadingCfg] = useState(true)

  // Ref pour pouvoir appeler launchPayment depuis le callback SDK sans stale closure
  const launchRef    = useRef<(() => void) | null>(null)
  const sdkConfigRef = useRef<SdkConfig | null>(null)
  const IS_DEV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

  // ── Étape 1 : fetch config depuis le backend ───────────────────────────────
  useEffect(() => {
    if (!reference || !amount) {
      setSdkError('Paramètres de paiement manquants.')
      setLoadingCfg(false)
      return
    }
    fetch(`${getApiBase()}/api/payments/intouch/sdk-config`)
      .then(r => { if (!r.ok) throw new Error(`Erreur ${r.status}`); return r.json() })
      .then((data: SdkConfig) => {
        if (!data.agency_code || !data.secure_code) throw new Error('Config InTouch incomplète')
        sdkConfigRef.current = data
        setSdkConfig(data)
      })
      .catch(err => setSdkError(`Config introuvable : ${err.message}`))
      .finally(() => setLoadingCfg(false))
  }, [reference, amount])

  // ── Lancement du paiement (stable via useCallback) ─────────────────────────
  const launchPayment = useCallback(() => {
    const cfg = sdkConfigRef.current
    if (!cfg) return
    if (typeof window.sendPaymentInfos !== 'function') {
      // SDK pas encore disponible → recharger
      loadSdkAndLaunch()
      return
    }

    const origin    = window.location.origin
    const returnUrl = `${origin}/payment/success`
      + `?reference=${encodeURIComponent(reference)}`
      + `&order=${encodeURIComponent(orderNum)}`
      + `&payment_method=intouch`
      + `&provider=${encodeURIComponent(provider)}`
    const cancelUrl = `${origin}/payment/cancel`
      + `?reference=${encodeURIComponent(reference)}`
      + `&order=${encodeURIComponent(orderNum)}`
      + `&payment_method=intouch`
      + `&provider=${encodeURIComponent(provider)}`

    try {
      setLaunched(true)
      // Ordre réel attendu par InTouch (vérifié par le comportement observé) :
      // timestamp, agencyCode, secureCode, domain, returnUrl, cancelUrl,
      // amount, city, email, firstName, lastName, phone
      window.sendPaymentInfos(
        new Date().getTime(),
        cfg.agency_code,
        cfg.secure_code,
        cfg.domain,
        returnUrl,
        cancelUrl,
        amount,
        city,
        email,      // position 9 — InTouch affiche ce champ comme "email"
        firstName,  // position 10
        lastName,   // position 11
        phone       // position 12
      )
    } catch (err: any) {
      console.error('[InTouch] sendPaymentInfos erreur :', err)
      setSdkError('Erreur lors du lancement. Cliquez sur "Réessayer".')
      setLaunched(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, orderNum, provider, amount, city, firstName, lastName, email, phone])

  // Synchroniser le ref pour que le callback SDK ait toujours la version fraîche
  useEffect(() => { launchRef.current = launchPayment }, [launchPayment])

  // ── Étape 2 : charger le SDK puis lancer directement ──────────────────────
  // IMPORTANT : on n'utilise pas sdkReady pour déclencher le launch — React peut
  // batcher setSdkReady(false)+setSdkReady(true) en un seul render et l'useEffect
  // ne se relance pas. On appelle launchPayment() directement depuis le callback.
  const loadSdkAndLaunch = useCallback(() => {
    setSdkError(null)
    setSdkReady(false)
    setLaunched(false)

    const doLaunch = () => {
      setSdkReady(true)
      // Lancer directement plutôt que via useEffect pour éviter le problème
      // de batching React (false→true dans le même cycle = pas de re-render)
      setTimeout(() => launchRef.current?.(), 50)
    }

    // SDK déjà chargé ?
    if (typeof window.sendPaymentInfos === 'function') {
      doLaunch()
      return
    }

    // Retirer l'éventuel script échoué précédent
    document.getElementById('intouch-sdk')?.remove()

    const script = document.createElement('script')
    script.id    = 'intouch-sdk'
    script.src   = SDK_URL
    script.async = true

    script.onload = () => {
      // Polling court pour s'assurer que sendPaymentInfos est attaché
      let waited = 0
      const t = window.setInterval(() => {
        if (typeof window.sendPaymentInfos === 'function') {
          window.clearInterval(t)
          doLaunch()
        } else if ((waited += 100) >= 8000) {
          window.clearInterval(t)
          setSdkError('Le système de paiement met trop de temps. Réessayez.')
        }
      }, 100)
    }

    script.onerror = () => {
      script.remove()
      setSdkError('Impossible de charger le système de paiement. Vérifiez votre connexion.')
    }

    document.body.appendChild(script)
  }, [])

  // ── Étape 3 : dès que la config est prête, charger le SDK et lancer ────────
  useEffect(() => {
    if (sdkConfig) loadSdkAndLaunch()
  }, [sdkConfig, loadSdkAndLaunch])

  // ── UI Erreur ──────────────────────────────────────────────────────────────
  if (sdkError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Erreur de paiement</h1>
          <p className="text-gray-500 mb-6">{sdkError}</p>
          <div className="space-y-3">
            <button
              onClick={loadSdkAndLaunch}
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
                : 'Lancement du paiement…'
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
          {provider && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Opérateur</span>
              <span className="font-semibold">{PROVIDER_LABELS[provider] || provider}</span>
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

        {IS_DEV && sdkReady && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-left">
            <p className="text-xs font-semibold text-amber-800 mb-1">⚠️ Mode développement</p>
            <p className="text-xs text-amber-700">
              InTouch peut rejeter les appels depuis localhost.
              Le SDK fonctionnera correctement sur <strong>buymore.ml</strong>.
            </p>
          </div>
        )}

        {/* Bouton manuel — toujours visible une fois le SDK prêt */}
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
