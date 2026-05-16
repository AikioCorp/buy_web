import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle, Smartphone } from 'lucide-react'

/**
 * Page de paiement InTouch / TouchPay SDK
 *
 * Charge le SDK JavaScript TouchPay et appelle sendPaymentInfos() automatiquement.
 *
 * Signature réelle du SDK (confirmée par la doc BuyMore) :
 *   sendPaymentInfos(
 *     timestamp,    // new Date().getTime()
 *     codeAgence,   // 'BMORE8055'
 *     secureCode,   // 'sWO3jRTSoXdkKB2sd...'
 *     domain,       // 'buymore.ml'
 *     returnUrl,    // URL de succès
 *     cancelUrl,    // URL d'annulation
 *     amount,       // montant en FCFA (number)
 *     city,         // ville du client
 *     firstName,    // prénom
 *     lastName,     // nom
 *     email,        // email
 *     phone         // numéro de téléphone
 *   )
 *
 * Query params reçus depuis le backend :
 *   reference, amount, phone, email, order, firstname?, lastname?, city?
 */

declare global {
  interface Window {
    sendPaymentInfos?: (
      timestamp:   number,
      codeAgence:  string,
      secureCode:  string,
      domain:      string,
      returnUrl:   string,
      cancelUrl:   string,
      amount:      number,
      city:        string,
      firstName:   string,
      lastName:    string,
      email:       string,
      phone:       string
    ) => void
  }
}

// ── Config (injectée via variables d'environnement Vite) ──────────────────
const INTOUCH_SDK_URL = 'https://touchpay.gutouch.net/touchpayv2/script/touchpaynr/prod_touchpay-0.0.1.js'
const AGENCY_CODE     = import.meta.env.VITE_INTOUCH_CODE_AGENCE  || 'BMORE8055'
const SECURE_CODE     = import.meta.env.VITE_INTOUCH_SECURE_CODE  || ''
// Domaine enregistré chez InTouch — doit correspondre exactement au domaine configuré chez GUTouch
const DOMAIN          = import.meta.env.VITE_INTOUCH_DOMAIN       || 'buymore.ml'
// URL webhook : doit être publique (pas localhost) — InTouch appelle cette URL depuis ses serveurs
const NOTIF_URL       = import.meta.env.VITE_INTOUCH_WEBHOOK_URL  || 'https://buymore-api-production.up.railway.app/api/payments/intouch/callback'
// En développement depuis localhost, InTouch rejette les appels car le domaine ne correspond pas
const IS_DEV_LOCALHOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

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

  const [sdkReady,  setSdkReady]  = useState(false)
  const [sdkError,  setSdkError]  = useState<string | null>(null)
  const [launched,  setLaunched]  = useState(false)

  // ── Charger le SDK ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!reference || !amount) {
      setSdkError('Paramètres de paiement manquants.')
      return
    }
    if (!SECURE_CODE) {
      setSdkError('Configuration InTouch incomplète (VITE_INTOUCH_SECURE_CODE manquant).')
      return
    }

    // Si déjà chargé
    if (document.getElementById('intouch-sdk')) {
      setSdkReady(true)
      return
    }

    const script    = document.createElement('script')
    script.id       = 'intouch-sdk'
    script.src      = INTOUCH_SDK_URL
    script.async    = true
    script.onload   = () => { console.log('[InTouch] SDK chargé ✅'); setSdkReady(true) }
    script.onerror  = () => setSdkError('Impossible de charger le SDK InTouch. Vérifiez votre connexion.')
    document.body.appendChild(script)
  }, [reference, amount])

  // ── Lancer le paiement dès que le SDK est prêt ────────────────────────────
  useEffect(() => {
    if (sdkReady && !launched) launchPayment()
  }, [sdkReady])

  const launchPayment = () => {
    if (!window.sendPaymentInfos) {
      setSdkError('La fonction sendPaymentInfos n\'est pas disponible. Rechargez la page.')
      return
    }

    const origin    = window.location.origin
    const returnUrl = `${origin}/payment/success?reference=${encodeURIComponent(reference)}&order=${encodeURIComponent(orderNum)}&payment_method=intouch`
    const cancelUrl = `${origin}/payment/cancel?reference=${encodeURIComponent(reference)}&order=${encodeURIComponent(orderNum)}&payment_method=intouch`
    // notifUrl DOIT être public — InTouch appelle cette URL depuis ses serveurs
    const notifUrl  = NOTIF_URL

    console.log('[InTouch] Appel sendPaymentInfos :', {
      agencyCode: AGENCY_CODE,
      secureCode: SECURE_CODE ? `${SECURE_CODE.slice(0, 8)}...` : '⚠️ VIDE',
      domain:     DOMAIN,
      amount,
      reference,
      notifUrl,
      returnUrl,
      cancelUrl,
      phone,
      email,
    })

    try {
      setLaunched(true)
      window.sendPaymentInfos(
        new Date().getTime(),  // timestamp unique
        AGENCY_CODE,           // codeAgence  ex: BMORE8055
        SECURE_CODE,           // secureCode  (fourni par GUTouch)
        DOMAIN,                // domaine marchand ex: businessbuymore.com
        returnUrl,             // URL retour succès
        cancelUrl,             // URL retour annulation
        amount,                // montant en FCFA (number)
        city,                  // ville ex: Bamako
        firstName,             // prénom client
        lastName,              // nom client
        email,                 // email client (peut être vide)
        phone                  // téléphone client
      )
    } catch (err: any) {
      console.error('[InTouch] Erreur sendPaymentInfos :', err)
      setSdkError('Erreur lors du lancement du paiement. Cliquez sur "Réessayer".')
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
              onClick={() => { setSdkError(null); setLaunched(false); launchPayment() }}
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

  // ── Chargement / attente ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">

        <div className="flex justify-center mb-6">
          {sdkReady
            ? <Smartphone className="h-12 w-12 text-[#0f4c2b]" />
            : <Loader2 className="h-12 w-12 animate-spin text-[#0f4c2b]" />
          }
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement Mobile Money</h1>
        <p className="text-gray-500 mb-6">
          {!sdkReady
            ? 'Chargement du système de paiement…'
            : launched
              ? 'La fenêtre de paiement est ouverte. Suivez les instructions.'
              : 'Initialisation du paiement…'
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
        {IS_DEV_LOCALHOST && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-left">
            <p className="text-xs font-semibold text-amber-800 mb-1">⚠️ Mode développement (localhost)</p>
            <p className="text-xs text-amber-700">
              InTouch rejette les appels depuis localhost. Le SDK fonctionnera correctement sur <strong>buymore.ml</strong>.
              Pour tester en local, utilise <strong>ngrok</strong> ou déploie directement.
            </p>
          </div>
        )}

        {/* Bouton de relancement manuel */}
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
            Si la fenêtre de paiement s'est fermée sans confirmation, cliquez sur "Relancer le paiement".
          </p>
        )}
      </div>
    </div>
  )
}
