import { Link } from 'react-router-dom'
import { FileText, Shield, ShoppingCart, Truck, CreditCard, AlertTriangle, Scale } from 'lucide-react'

export function TermsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0f4c2b] to-[#1a5f3a] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Conditions d'Utilisation</h1>
            <p className="text-xl text-gray-200">
              Dernière mise à jour : Janvier 2026
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Table des matières */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0f4c2b]" />
                Table des matières
              </h2>
              <nav className="grid md:grid-cols-2 gap-2">
                {[
                  { id: 'presentation', label: '1. Présentation' },
                  { id: 'inscription', label: '2. Inscription et compte' },
                  { id: 'commandes', label: '3. Commandes et paiements' },
                  { id: 'livraison', label: '4. Livraison' },
                  { id: 'retours', label: '5. Retours et remboursements' },
                  { id: 'vendeurs', label: '6. Conditions vendeurs' },
                  { id: 'propriete', label: '7. Propriété intellectuelle' },
                  { id: 'responsabilite', label: '8. Responsabilité' },
                  { id: 'donnees', label: '9. Protection des données' },
                  { id: 'modification', label: '10. Modifications' },
                ].map(item => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="text-[#0f4c2b] hover:underline text-sm"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl p-8 shadow-sm space-y-8">
              {/* Section 1 */}
              <section id="presentation">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#0f4c2b]" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">1. Présentation</h2>
                </div>
                <div className="text-gray-600 space-y-4 pl-13">
                  <p>
                    Buy More est une plateforme de commerce en ligne malienne, 
                    dont le siège social est situé à Sotuba ACI, Bamako, Mali.
                  </p>
                  <p>
                    Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation du site 
                    <strong> buymore.ml</strong> et de tous les services associés. En accédant à notre plateforme, 
                    vous acceptez sans réserve les présentes conditions.
                  </p>
                  <p>
                    <strong>Contact :</strong><br />
                    Email : vente@buymore.ml<br />
                    Téléphone : +223 70 79 69 69<br />
                    Adresse : Sotuba ACI près de la clinique Almed, Bamako – Mali
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section id="inscription">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#0f4c2b]" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">2. Inscription et Compte</h2>
                </div>
                <div className="text-gray-600 space-y-4 pl-13">
                  <p><strong>2.1 Création de compte</strong></p>
                  <p>
                    Pour effectuer des achats sur Buy More, vous devez créer un compte en fournissant 
                    des informations exactes et complètes. Vous êtes responsable de la confidentialité 
                    de vos identifiants de connexion.
                  </p>
                  <p><strong>2.2 Conditions d'âge</strong></p>
                  <p>
                    Vous devez être âgé d'au moins 18 ans ou avoir l'autorisation d'un parent/tuteur 
                    légal pour utiliser nos services.
                  </p>
                  <p><strong>2.3 Sécurité du compte</strong></p>
                  <p>
                    Vous êtes seul responsable de toutes les activités effectuées depuis votre compte. 
                    En cas d'utilisation non autorisée, contactez-nous immédiatement.
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section id="commandes">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-[#0f4c2b]" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">3. Commandes et Paiements</h2>
                </div>
                <div className="text-gray-600 space-y-4 pl-13">
                  <p><strong>3.1 Processus de commande</strong></p>
                  <p>
                    Toute commande passée sur Buy More constitue un contrat de vente. Les prix affichés 
                    sont en Francs CFA (FCFA) et incluent toutes les taxes applicables. Les frais de 
                    livraison sont indiqués séparément.
                  </p>
                  <p><strong>3.2 Modes de paiement</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Paiement à la livraison (espèces)</li>
                    <li>Orange Money</li>
                    <li>Moov Money</li>
                    <li>Virement bancaire</li>
                  </ul>
                  <p><strong>3.3 Confirmation de commande</strong></p>
                  <p>
                    Vous recevrez un email ou SMS de confirmation après validation de votre commande. 
                    Cette confirmation vaut acceptation de la vente.
                  </p>
                  <p><strong>3.4 Annulation</strong></p>
                  <p>
                    Vous pouvez annuler votre commande tant qu'elle n'a pas été expédiée. 
                    Contactez notre service client dans les plus brefs délais.
                  </p>
                </div>
              </section>

              {/* Section 4 */}
              <section id="livraison">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-[#0f4c2b]" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">4. Livraison</h2>
                </div>
                <div className="text-gray-600 space-y-4 pl-13">
                  <p><strong>4.1 Zones de livraison</strong></p>
                  <p>
                    Nous livrons dans toutes les principales villes du Mali. Les délais et frais 
                    varient selon la destination.
                  </p>
                  <p><strong>4.2 Délais de livraison</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Bamako : 24 à 48 heures</li>
                    <li>Autres villes : 3 à 7 jours ouvrables</li>
                  </ul>
                  <p><strong>4.3 Réception</strong></p>
                  <p>
                    À la réception, vérifiez l'état du colis. En cas de dommage visible, 
                    refusez le colis et contactez-nous immédiatement.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section id="retours">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-[#0f4c2b]" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">5. Retours et Remboursements</h2>
                </div>
                <div className="text-gray-600 space-y-4 pl-13">
                  <p><strong>5.1 Droit de retour</strong></p>
                  <p>
                    Vous disposez de 7 jours à compter de la réception pour retourner un produit 
                    non utilisé et dans son emballage d'origine.
                  </p>
                  <p><strong>5.2 Produits non retournables</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Produits alimentaires périssables</li>
                    <li>Produits cosmétiques ouverts</li>
                    <li>Sous-vêtements et maillots de bain</li>
                    <li>Produits personnalisés</li>
                  </ul>
                  <p><strong>5.3 Procédure de remboursement</strong></p>
                  <p>
                    Le remboursement est effectué sous 5 à 10 jours ouvrables après réception 
                    et vérification du produit retourné, via le même mode de paiement utilisé.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section id="vendeurs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Scale className="w-5 h-5 text-[#0f4c2b]" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">6. Conditions Vendeurs</h2>
                </div>
                <div className="text-gray-600 space-y-4 pl-13">
                  <p><strong>6.1 Inscription vendeur</strong></p>
                  <p>
                    Les vendeurs doivent fournir des informations exactes et des documents valides 
                    lors de leur inscription. Buy More se réserve le droit de refuser ou suspendre 
                    tout compte vendeur.
                  </p>
                  <p><strong>6.2 Obligations des vendeurs</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Proposer des produits authentiques et conformes à la description</li>
                    <li>Respecter les délais de traitement des commandes</li>
                    <li>Répondre aux demandes des clients dans les 24 heures</li>
                    <li>Respecter la législation malienne en vigueur</li>
                  </ul>
                  <p><strong>6.3 Commissions</strong></p>
                  <p>
                    Buy More prélève une commission sur chaque vente réalisée. Le taux est 
                    communiqué lors de l'inscription et peut varier selon les catégories.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section id="propriete">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#0f4c2b]" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">7. Propriété Intellectuelle</h2>
                </div>
                <div className="text-gray-600 space-y-4 pl-13">
                  <p>
                    Tous les éléments du site Buy More (logos, textes, images, design) sont la 
                    propriété exclusive de Buy More. Toute reproduction 
                    ou utilisation non autorisée est strictement interdite.
                  </p>
                </div>
              </section>

              {/* Section 8 */}
              <section id="responsabilite">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-[#0f4c2b]" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">8. Limitation de Responsabilité</h2>
                </div>
                <div className="text-gray-600 space-y-4 pl-13">
                  <p>
                    Buy More agit en tant qu'intermédiaire entre vendeurs et acheteurs. 
                    Nous ne pouvons être tenus responsables :
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Des défauts des produits vendus par des vendeurs tiers</li>
                    <li>Des retards de livraison dus à des circonstances exceptionnelles</li>
                    <li>Des dommages indirects liés à l'utilisation de nos services</li>
                  </ul>
                </div>
              </section>

              {/* Section 9 */}
              <section id="donnees">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#0f4c2b]" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">9. Protection des Données</h2>
                </div>
                <div className="text-gray-600 space-y-4 pl-13">
                  <p>
                    Vos données personnelles sont collectées et traitées conformément à notre 
                    politique de confidentialité. Nous nous engageons à :
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Protéger vos informations personnelles</li>
                    <li>Ne pas vendre vos données à des tiers</li>
                    <li>Utiliser vos données uniquement pour améliorer nos services</li>
                    <li>Vous permettre d'accéder et de modifier vos données</li>
                  </ul>
                </div>
              </section>

              {/* Section 10 */}
              <section id="modification">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#0f4c2b]" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">10. Modifications des CGU</h2>
                </div>
                <div className="text-gray-600 space-y-4 pl-13">
                  <p>
                    Buy More se réserve le droit de modifier les présentes conditions à tout moment. 
                    Les utilisateurs seront informés des modifications par email ou notification 
                    sur le site. L'utilisation continue du site après modification vaut acceptation 
                    des nouvelles conditions.
                  </p>
                </div>
              </section>

              {/* Footer */}
              <div className="border-t border-gray-200 pt-8 mt-8">
                <p className="text-gray-500 text-sm text-center">
                  Pour toute question concernant ces conditions, contactez-nous à{' '}
                  <a href="mailto:vente@buymore.ml" className="text-[#0f4c2b] hover:underline">
                    vente@buymore.ml
                  </a>
                </p>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">Des questions sur nos conditions ?</p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-[#0f4c2b] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#1a5f3a] transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
