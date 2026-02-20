import { Link } from 'react-router-dom'
import { Shield, Eye, Database, Users, Cookie, Lock, UserCheck, Bell, FileText, Mail } from 'lucide-react'

export function PrivacyPolicyPage() {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#0f4c2b] to-[#1a5f3a] text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Politique de Confidentialité</h1>
                        <p className="text-xl text-green-100">
                            Dernière mise à jour : Février 2026
                        </p>
                        <p className="text-sm text-green-200 mt-2">
                            Chez Buy More, la protection de vos données personnelles est une priorité.
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
                                    { id: 'introduction', label: '1. Introduction' },
                                    { id: 'collecte', label: '2. Données collectées' },
                                    { id: 'utilisation', label: '3. Utilisation des données' },
                                    { id: 'stockage', label: '4. Stockage et sécurité' },
                                    { id: 'tiers', label: '5. Partage avec des tiers' },
                                    { id: 'cookies', label: '6. Cookies et traceurs' },
                                    { id: 'droits', label: '7. Vos droits' },
                                    { id: 'mineurs', label: '8. Protection des mineurs' },
                                    { id: 'modifications', label: '9. Modifications' },
                                    { id: 'contact', label: '10. Nous contacter' },
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
                            <section id="introduction">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-[#0f4c2b]" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">1. Introduction</h2>
                                </div>
                                <div className="text-gray-600 space-y-4 pl-13">
                                    <p>
                                        La présente Politique de Confidentialité décrit la manière dont <strong>Buy More</strong>,
                                        plateforme de commerce en ligne malienne basée à Sotuba ACI, Bamako, Mali,
                                        collecte, utilise, stocke et protège vos données personnelles.
                                    </p>
                                    <p>
                                        En utilisant notre site <strong>buymore.ml</strong> et nos services associés,
                                        vous consentez à la collecte et au traitement de vos données conformément
                                        à la présente politique. Si vous n'acceptez pas ces conditions, veuillez
                                        ne pas utiliser nos services.
                                    </p>
                                    <p>
                                        Cette politique s'applique à tous les utilisateurs de la plateforme :
                                        acheteurs, vendeurs et visiteurs.
                                    </p>
                                </div>
                            </section>

                            {/* Section 2 */}
                            <section id="collecte">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <Database className="w-5 h-5 text-[#0f4c2b]" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">2. Données Collectées</h2>
                                </div>
                                <div className="text-gray-600 space-y-4 pl-13">
                                    <p><strong>2.1 Données que vous nous fournissez</strong></p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Nom complet, prénom</li>
                                        <li>Adresse email</li>
                                        <li>Numéro de téléphone</li>
                                        <li>Adresse de livraison</li>
                                        <li>Mot de passe (stocké sous forme chiffrée)</li>
                                        <li>Informations de la boutique (pour les vendeurs)</li>
                                    </ul>

                                    <p><strong>2.2 Données collectées automatiquement</strong></p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Adresse IP et informations de connexion</li>
                                        <li>Type de navigateur et système d'exploitation</li>
                                        <li>Pages visitées et temps passé sur le site</li>
                                        <li>Données de géolocalisation (si autorisé)</li>
                                        <li>Identifiants de l'appareil</li>
                                    </ul>

                                    <p><strong>2.3 Données de transaction</strong></p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Historique des commandes et achats</li>
                                        <li>Méthode de paiement utilisée (sans données bancaires complètes)</li>
                                        <li>Adresses de livraison associées aux commandes</li>
                                        <li>Communications avec les vendeurs ou le service client</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 3 */}
                            <section id="utilisation">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <Eye className="w-5 h-5 text-[#0f4c2b]" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">3. Utilisation des Données</h2>
                                </div>
                                <div className="text-gray-600 space-y-4 pl-13">
                                    <p>Nous utilisons vos données personnelles pour :</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>
                                            <strong>Gestion de votre compte :</strong> création, authentification et
                                            maintenance de votre compte utilisateur
                                        </li>
                                        <li>
                                            <strong>Traitement des commandes :</strong> gestion des achats, paiements,
                                            livraisons et suivi des commandes
                                        </li>
                                        <li>
                                            <strong>Vérification d'identité :</strong> envoi de codes OTP par SMS
                                            pour sécuriser votre connexion et inscription
                                        </li>
                                        <li>
                                            <strong>Communication :</strong> notifications de commandes, promotions
                                            (si consentement), et messages de service client
                                        </li>
                                        <li>
                                            <strong>Amélioration des services :</strong> analyse des tendances d'utilisation,
                                            personnalisation de l'expérience et recommandations de produits
                                        </li>
                                        <li>
                                            <strong>Sécurité :</strong> détection des fraudes, prévention des abus
                                            et protection de nos utilisateurs
                                        </li>
                                        <li>
                                            <strong>Obligations légales :</strong> conformité avec les lois et
                                            réglementations applicables au Mali
                                        </li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 4 */}
                            <section id="stockage">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <Lock className="w-5 h-5 text-[#0f4c2b]" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">4. Stockage et Sécurité</h2>
                                </div>
                                <div className="text-gray-600 space-y-4 pl-13">
                                    <p><strong>4.1 Durée de conservation</strong></p>
                                    <p>
                                        Vos données personnelles sont conservées aussi longtemps que votre compte est actif,
                                        puis pendant une durée de 3 ans après sa suppression pour des raisons légales et comptables.
                                    </p>

                                    <p><strong>4.2 Mesures de sécurité</strong></p>
                                    <p>Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Chiffrement des données sensibles (mots de passe, tokens d'authentification)</li>
                                        <li>Communications sécurisées via HTTPS/TLS</li>
                                        <li>Accès restreint aux données personnelles au sein de notre équipe</li>
                                        <li>Surveillance régulière des systèmes contre les intrusions</li>
                                        <li>Sauvegardes régulières et sécurisées des données</li>
                                    </ul>

                                    <p><strong>4.3 Hébergement</strong></p>
                                    <p>
                                        Vos données sont hébergées sur des serveurs sécurisés. Nous choisissons nos
                                        hébergeurs avec soin pour garantir un haut niveau de protection et de disponibilité.
                                    </p>
                                </div>
                            </section>

                            {/* Section 5 */}
                            <section id="tiers">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <Users className="w-5 h-5 text-[#0f4c2b]" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">5. Partage avec des Tiers</h2>
                                </div>
                                <div className="text-gray-600 space-y-4 pl-13">
                                    <p>
                                        <strong>Buy More ne vend jamais vos données personnelles.</strong> Nous
                                        pouvons toutefois partager certaines informations dans les cas suivants :
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>
                                            <strong>Vendeurs :</strong> votre nom et adresse de livraison sont partagés
                                            avec le vendeur pour l'exécution de votre commande
                                        </li>
                                        <li>
                                            <strong>Services de livraison :</strong> vos coordonnées de livraison
                                            sont transmises à nos partenaires logistiques
                                        </li>
                                        <li>
                                            <strong>Services de paiement :</strong> les prestataires de paiement mobile
                                            (Orange Money, Moov Money) reçoivent les informations nécessaires au traitement
                                        </li>
                                        <li>
                                            <strong>Services de vérification :</strong> votre numéro de téléphone peut
                                            être utilisé via des services tiers pour la vérification par OTP (SMS)
                                        </li>
                                        <li>
                                            <strong>Obligations légales :</strong> en cas de demande des autorités
                                            compétentes maliennes conformément à la loi
                                        </li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 6 */}
                            <section id="cookies">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <Cookie className="w-5 h-5 text-[#0f4c2b]" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">6. Cookies et Traceurs</h2>
                                </div>
                                <div className="text-gray-600 space-y-4 pl-13">
                                    <p><strong>6.1 Types de cookies utilisés</strong></p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>
                                            <strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site
                                            (session, authentification, panier d'achat)
                                        </li>
                                        <li>
                                            <strong>Cookies de performance :</strong> nous aident à comprendre comment
                                            les visiteurs utilisent le site afin d'améliorer l'expérience
                                        </li>
                                        <li>
                                            <strong>Cookies de préférences :</strong> mémorisent vos choix (langue,
                                            thème, préférences d'affichage)
                                        </li>
                                    </ul>

                                    <p><strong>6.2 Gestion des cookies</strong></p>
                                    <p>
                                        Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur.
                                        Veuillez noter que la désactivation de certains cookies peut affecter le
                                        fonctionnement du site.
                                    </p>

                                    <p><strong>6.3 Stockage local</strong></p>
                                    <p>
                                        Nous utilisons le stockage local du navigateur (localStorage) pour conserver
                                        vos tokens d'authentification et préférences. Ces données restent sur votre
                                        appareil et ne sont pas envoyées automatiquement à nos serveurs.
                                    </p>
                                </div>
                            </section>

                            {/* Section 7 */}
                            <section id="droits">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <UserCheck className="w-5 h-5 text-[#0f4c2b]" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">7. Vos Droits</h2>
                                </div>
                                <div className="text-gray-600 space-y-4 pl-13">
                                    <p>Conformément aux lois applicables, vous disposez des droits suivants :</p>
                                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                                        <div className="border border-gray-200 rounded-xl p-4">
                                            <h3 className="font-semibold text-gray-900 mb-1">📋 Droit d'accès</h3>
                                            <p className="text-sm">Obtenir une copie de vos données personnelles que nous détenons</p>
                                        </div>
                                        <div className="border border-gray-200 rounded-xl p-4">
                                            <h3 className="font-semibold text-gray-900 mb-1">✏️ Droit de rectification</h3>
                                            <p className="text-sm">Corriger vos données si elles sont inexactes ou incomplètes</p>
                                        </div>
                                        <div className="border border-gray-200 rounded-xl p-4">
                                            <h3 className="font-semibold text-gray-900 mb-1">🗑️ Droit de suppression</h3>
                                            <p className="text-sm">Demander la suppression de votre compte et de vos données</p>
                                        </div>
                                        <div className="border border-gray-200 rounded-xl p-4">
                                            <h3 className="font-semibold text-gray-900 mb-1">⏸️ Droit de limitation</h3>
                                            <p className="text-sm">Limiter le traitement de vos données dans certains cas</p>
                                        </div>
                                        <div className="border border-gray-200 rounded-xl p-4">
                                            <h3 className="font-semibold text-gray-900 mb-1">📤 Droit de portabilité</h3>
                                            <p className="text-sm">Recevoir vos données dans un format structuré et lisible</p>
                                        </div>
                                        <div className="border border-gray-200 rounded-xl p-4">
                                            <h3 className="font-semibold text-gray-900 mb-1">🚫 Droit d'opposition</h3>
                                            <p className="text-sm">Vous opposer au traitement de vos données à des fins marketing</p>
                                        </div>
                                    </div>
                                    <p className="mt-4">
                                        Pour exercer ces droits, contactez-nous à{' '}
                                        <a href="mailto:vente@buymore.ml" className="text-[#0f4c2b] hover:underline font-medium">
                                            vente@buymore.ml
                                        </a>{' '}
                                        ou via la page de votre profil. Nous répondrons dans un délai de 30 jours.
                                    </p>
                                </div>
                            </section>

                            {/* Section 8 */}
                            <section id="mineurs">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <Bell className="w-5 h-5 text-[#0f4c2b]" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">8. Protection des Mineurs</h2>
                                </div>
                                <div className="text-gray-600 space-y-4 pl-13">
                                    <p>
                                        Nos services sont destinés aux personnes âgées de 18 ans et plus.
                                        Nous ne collectons pas sciemment de données personnelles de mineurs
                                        sans le consentement d'un parent ou tuteur légal.
                                    </p>
                                    <p>
                                        Si vous êtes un parent ou tuteur et que vous pensez que votre enfant
                                        nous a fourni des données personnelles, veuillez nous contacter afin
                                        que nous puissions supprimer ces informations.
                                    </p>
                                </div>
                            </section>

                            {/* Section 9 */}
                            <section id="modifications">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-[#0f4c2b]" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">9. Modifications de cette Politique</h2>
                                </div>
                                <div className="text-gray-600 space-y-4 pl-13">
                                    <p>
                                        Nous pouvons mettre à jour cette politique de confidentialité de temps à autre.
                                        Toute modification sera publiée sur cette page avec une date de mise à jour révisée.
                                    </p>
                                    <p>
                                        En cas de changements significatifs, nous vous informerons par email ou
                                        par une notification visible sur notre site. Nous vous encourageons à
                                        consulter régulièrement cette page.
                                    </p>
                                </div>
                            </section>

                            {/* Section 10 */}
                            <section id="contact">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-[#0f4c2b]" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">10. Nous Contacter</h2>
                                </div>
                                <div className="text-gray-600 space-y-4 pl-13">
                                    <p>
                                        Pour toute question relative à cette politique de confidentialité ou pour
                                        exercer vos droits, vous pouvez nous contacter :
                                    </p>
                                    <div className="bg-gray-50 rounded-xl p-5 space-y-2">
                                        <p><strong>Buy More</strong></p>
                                        <p>📧 Email : <a href="mailto:vente@buymore.ml" className="text-[#0f4c2b] hover:underline">vente@buymore.ml</a></p>
                                        <p>📞 Téléphone : <a href="tel:+22370796969" className="text-[#0f4c2b] hover:underline">+223 70 79 69 69</a></p>
                                        <p>📍 Adresse : Sotuba ACI près de la clinique Almed, Bamako – Mali</p>
                                    </div>
                                </div>
                            </section>

                            {/* Footer */}
                            <div className="border-t border-gray-200 pt-8 mt-8">
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500">
                                    <p>
                                        Voir aussi nos{' '}
                                        <Link to="/terms" className="text-[#0f4c2b] hover:underline font-medium">
                                            Conditions d'Utilisation
                                        </Link>
                                    </p>
                                    <span className="hidden sm:inline">•</span>
                                    <p>
                                        Contactez-nous à{' '}
                                        <a href="mailto:vente@buymore.ml" className="text-[#0f4c2b] hover:underline">
                                            vente@buymore.ml
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact CTA */}
                        <div className="mt-8 text-center">
                            <p className="text-gray-600 mb-4">Des questions sur la protection de vos données ?</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center gap-2 bg-[#0f4c2b] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#1a5f3a] transition-colors"
                                >
                                    Nous contacter
                                </Link>
                                <Link
                                    to="/terms"
                                    className="inline-flex items-center gap-2 border-2 border-[#0f4c2b] text-[#0f4c2b] px-6 py-3 rounded-full font-semibold hover:bg-[#0f4c2b] hover:text-white transition-colors"
                                >
                                    Conditions d'utilisation
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
