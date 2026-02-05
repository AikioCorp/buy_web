import { Clock, Store, CheckCircle, Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

interface VendorPendingApprovalPageProps {
  shopName?: string
  shopEmail?: string
}

export function VendorPendingApprovalPage({ shopName, shopEmail }: VendorPendingApprovalPageProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
          <Clock className="w-12 h-12 text-yellow-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Boutique en attente d'approbation
        </h1>

        {/* Shop name if available */}
        {shopName && (
          <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full mb-4">
            <Store className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">{shopName}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Votre demande de création de boutique a été soumise avec succès. 
          Notre équipe examine actuellement votre dossier.
        </p>

        {/* Timeline */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 mb-8 border border-emerald-100">
          <h3 className="font-semibold text-emerald-800 mb-4 flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Délai de traitement
          </h3>
          <p className="text-emerald-700 text-lg font-medium">
            Maximum <span className="text-2xl font-bold">24 heures</span> ouvrables
          </p>
          <p className="text-emerald-600 text-sm mt-2">
            Du lundi au vendredi, de 8h à 18h
          </p>
        </div>

        {/* What happens next */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-4">Prochaines étapes</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-600 text-sm font-bold">1</span>
              </div>
              <p className="text-gray-600">Notre équipe vérifie les informations de votre boutique</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-600 text-sm font-bold">2</span>
              </div>
              <p className="text-gray-600">Vous recevrez une notification par email une fois approuvée</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-600 text-sm font-bold">3</span>
              </div>
              <p className="text-gray-600">Vous pourrez alors ajouter vos produits et commencer à vendre</p>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-gray-600 text-sm mb-3">
            Des questions ? Contactez notre support :
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="mailto:support@buymore.ml" 
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <Mail className="w-4 h-4" />
              support@buymore.ml
            </a>
            <a 
              href="tel:+22370000000" 
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <Phone className="w-4 h-4" />
              +223 70 00 00 00
            </a>
          </div>
        </div>

        {/* Back to home */}
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}

export default VendorPendingApprovalPage
