import { Clock, Store, CheckCircle, Mail, Phone, Package, Settings, User, ShoppingBag, Lock, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

interface VendorPendingApprovalPageProps {
  shopName?: string
  shopEmail?: string
  shopPhone?: string
  showLimitedDashboard?: boolean
}

export function VendorPendingApprovalPage({ 
  shopName, 
  shopEmail, 
  shopPhone,
  showLimitedDashboard = true 
}: VendorPendingApprovalPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Status Banner */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-10 h-10 text-yellow-600 animate-pulse" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Boutique en attente d'approbation
            </h1>
            {shopName && (
              <div className="inline-flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-full mb-2">
                <Store className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-gray-700">{shopName}</span>
              </div>
            )}
            <p className="text-gray-600 text-sm">
              Notre équipe examine votre dossier. Délai: <strong>24h ouvrables max</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Limited Access */}
        {showLimitedDashboard && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              Accès disponibles
            </h2>

            {/* Available Actions */}
            <div className="bg-white rounded-xl border border-gray-200 divide-y">
              <Link 
                to="/dashboard/profile" 
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Mon profil</p>
                  <p className="text-sm text-gray-500">Modifier vos informations personnelles</p>
                </div>
              </Link>
              <Link 
                to="/dashboard/settings" 
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Paramètres</p>
                  <p className="text-sm text-gray-500">Configurer votre compte</p>
                </div>
              </Link>
              <Link 
                to="/" 
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Explorer le marché</p>
                  <p className="text-sm text-gray-500">Voir les boutiques actives</p>
                </div>
              </Link>
            </div>

            {/* Locked Actions */}
            <h2 className="text-lg font-semibold text-gray-500 flex items-center gap-2 mt-6">
              <Lock className="w-5 h-5" />
              Disponible après approbation
            </h2>
            <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y opacity-60">
              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-500">Mes produits</p>
                  <p className="text-sm text-gray-400">Ajouter et gérer vos produits</p>
                </div>
                <Lock className="w-4 h-4 text-gray-400 ml-auto" />
              </div>
              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-500">Commandes</p>
                  <p className="text-sm text-gray-400">Gérer les commandes clients</p>
                </div>
                <Lock className="w-4 h-4 text-gray-400 ml-auto" />
              </div>
              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-500">Modifier la boutique</p>
                  <p className="text-sm text-gray-400">Logo, description, zones de livraison</p>
                </div>
                <Lock className="w-4 h-4 text-gray-400 ml-auto" />
              </div>
            </div>
          </div>
        )}

        {/* Right Column - Info */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-100">
            <h3 className="font-semibold text-emerald-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Prochaines étapes
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-700 text-xs font-bold">1</span>
                </div>
                <p className="text-emerald-700 text-sm">Vérification de votre boutique par notre équipe</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-600 text-xs font-bold">2</span>
                </div>
                <p className="text-emerald-600 text-sm">Notification par email une fois approuvée</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-600 text-xs font-bold">3</span>
                </div>
                <p className="text-emerald-600 text-sm">Ajoutez vos produits et commencez à vendre!</p>
              </li>
            </ul>
          </div>

          {/* Shop Info Card */}
          {(shopName || shopEmail || shopPhone) && (
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Informations de votre boutique</h3>
              <div className="space-y-3">
                {shopName && (
                  <div className="flex items-center gap-3">
                    <Store className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{shopName}</span>
                  </div>
                )}
                {shopEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{shopEmail}</span>
                  </div>
                )}
                {shopPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{shopPhone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Support */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-gray-600 text-sm mb-3 font-medium">
              Besoin d'aide ? Contactez-nous :
            </p>
            <div className="space-y-2">
              <a 
                href="mailto:vente@buymore.ml" 
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
              >
                <Mail className="w-4 h-4" />
                vente@buymore.ml
              </a>
              <a 
                href="https://wa.me/22370796969" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
              >
                <Phone className="w-4 h-4" />
                +223 70 79 69 69 (WhatsApp)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorPendingApprovalPage
