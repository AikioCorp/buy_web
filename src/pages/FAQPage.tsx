import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Search, ShoppingCart, Truck, CreditCard, RefreshCw, Store, HelpCircle } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQCategory {
  id: string
  title: string
  icon: React.ElementType
  items: FAQItem[]
}

const faqData: FAQCategory[] = [
  {
    id: 'commandes',
    title: 'Commandes',
    icon: ShoppingCart,
    items: [
      {
        question: 'Comment passer une commande sur Buy More ?',
        answer: 'Pour passer une commande, parcourez notre catalogue, ajoutez les produits souhaités à votre panier, puis cliquez sur "Commander". Vous pouvez finaliser votre achat en ligne ou via WhatsApp en cliquant sur "Commander sur WhatsApp".'
      },
      {
        question: 'Puis-je modifier ou annuler ma commande ?',
        answer: 'Vous pouvez modifier ou annuler votre commande tant qu\'elle n\'a pas été expédiée. Contactez-nous rapidement par téléphone au +223 70 79 69 69 ou par email à vente@buymore.ml.'
      },
      {
        question: 'Comment suivre ma commande ?',
        answer: 'Une fois votre commande expédiée, vous recevrez un SMS ou un email avec les informations de suivi. Vous pouvez également suivre votre commande depuis votre espace client dans la section "Mes commandes".'
      },
      {
        question: 'Que faire si je n\'ai pas reçu de confirmation de commande ?',
        answer: 'Vérifiez d\'abord votre dossier spam. Si vous ne trouvez pas l\'email, contactez notre service client avec les détails de votre commande. Nous vérifierons et vous enverrons une nouvelle confirmation.'
      }
    ]
  },
  {
    id: 'livraison',
    title: 'Livraison',
    icon: Truck,
    items: [
      {
        question: 'Quels sont les délais de livraison ?',
        answer: 'À Bamako, la livraison est effectuée sous 24 à 48 heures. Pour les autres villes du Mali (Sikasso, Ségou, Mopti, etc.), comptez 3 à 7 jours ouvrables selon la destination.'
      },
      {
        question: 'Quels sont les frais de livraison ?',
        answer: 'Les frais de livraison varient selon votre localisation et le poids de votre commande. À Bamako, la livraison standard coûte entre 1 000 et 3 000 FCFA. Les frais exacts sont calculés au moment du checkout.'
      },
      {
        question: 'Livrez-vous dans toutes les régions du Mali ?',
        answer: 'Oui, nous livrons dans toutes les grandes villes du Mali : Bamako, Sikasso, Ségou, Mopti, Kayes, Koutiala, et bien d\'autres. Contactez-nous pour les zones rurales.'
      },
      {
        question: 'Que faire si je ne suis pas disponible lors de la livraison ?',
        answer: 'Notre livreur vous contactera avant la livraison. Si vous n\'êtes pas disponible, vous pouvez désigner une personne de confiance pour réceptionner le colis ou reprogrammer la livraison.'
      }
    ]
  },
  {
    id: 'paiement',
    title: 'Paiement',
    icon: CreditCard,
    items: [
      {
        question: 'Quels modes de paiement acceptez-vous ?',
        answer: 'Nous acceptons le paiement à la livraison (cash), Orange Money, Moov Money, et les virements bancaires. Le paiement par carte bancaire sera bientôt disponible.'
      },
      {
        question: 'Le paiement à la livraison est-il disponible ?',
        answer: 'Oui, le paiement à la livraison est disponible pour toutes les commandes à Bamako et dans les principales villes. Vous payez en espèces au moment de la réception de votre colis.'
      },
      {
        question: 'Comment payer avec Orange Money ou Moov Money ?',
        answer: 'Lors du checkout, sélectionnez "Mobile Money" comme mode de paiement. Vous recevrez les instructions pour effectuer le transfert. Une fois le paiement confirmé, votre commande sera traitée.'
      },
      {
        question: 'Mes informations de paiement sont-elles sécurisées ?',
        answer: 'Absolument. Nous utilisons des protocoles de sécurité avancés pour protéger vos données. Nous ne stockons jamais vos informations de paiement sensibles.'
      }
    ]
  },
  {
    id: 'retours',
    title: 'Retours & Remboursements',
    icon: RefreshCw,
    items: [
      {
        question: 'Quelle est votre politique de retour ?',
        answer: 'Vous disposez de 7 jours après réception pour retourner un produit non utilisé et dans son emballage d\'origine. Certains produits (alimentaires, cosmétiques ouverts) ne sont pas retournables.'
      },
      {
        question: 'Comment effectuer un retour ?',
        answer: 'Contactez notre service client pour initier le retour. Nous vous fournirons les instructions et organiserons la récupération du produit. Une fois le produit vérifié, le remboursement sera effectué.'
      },
      {
        question: 'Sous quel délai serai-je remboursé ?',
        answer: 'Le remboursement est effectué sous 5 à 10 jours ouvrables après réception et vérification du produit retourné. Le remboursement se fait via le même mode de paiement utilisé lors de l\'achat.'
      },
      {
        question: 'Que faire si je reçois un produit défectueux ?',
        answer: 'Contactez-nous immédiatement avec des photos du produit. Nous organiserons un échange ou un remboursement complet, frais de retour inclus.'
      }
    ]
  },
  {
    id: 'vendeurs',
    title: 'Devenir Vendeur',
    icon: Store,
    items: [
      {
        question: 'Comment devenir vendeur sur Buy More ?',
        answer: 'Inscrivez-vous sur notre plateforme en cliquant sur "Devenir vendeur". Remplissez le formulaire avec vos informations et documents requis. Notre équipe validera votre compte sous 24-48h.'
      },
      {
        question: 'Quels sont les frais pour vendre sur Buy More ?',
        answer: 'L\'inscription est gratuite. Nous prélevons une commission sur chaque vente réalisée. Le taux de commission varie selon la catégorie de produits. Contactez-nous pour plus de détails.'
      },
      {
        question: 'Quels documents sont nécessaires pour s\'inscrire ?',
        answer: 'Vous aurez besoin d\'une pièce d\'identité valide, d\'un numéro de téléphone, et idéalement d\'un registre de commerce (RCCM) pour les entreprises. Les particuliers peuvent aussi vendre.'
      },
      {
        question: 'Comment gérer ma boutique en ligne ?',
        answer: 'Une fois inscrit, vous accédez à un tableau de bord complet pour gérer vos produits, commandes, et statistiques. Vous pouvez ajouter des produits, modifier les prix, et suivre vos ventes en temps réel.'
      }
    ]
  },
  {
    id: 'compte',
    title: 'Mon Compte',
    icon: HelpCircle,
    items: [
      {
        question: 'Comment créer un compte ?',
        answer: 'Cliquez sur "S\'inscrire" en haut de la page, remplissez le formulaire avec votre email et mot de passe. Vous pouvez aussi vous inscrire avec votre numéro de téléphone.'
      },
      {
        question: 'J\'ai oublié mon mot de passe, que faire ?',
        answer: 'Cliquez sur "Mot de passe oublié" sur la page de connexion. Entrez votre email et vous recevrez un lien pour réinitialiser votre mot de passe.'
      },
      {
        question: 'Comment modifier mes informations personnelles ?',
        answer: 'Connectez-vous à votre compte, allez dans "Mon profil" et modifiez vos informations (nom, adresse, téléphone). N\'oubliez pas de sauvegarder vos modifications.'
      },
      {
        question: 'Comment supprimer mon compte ?',
        answer: 'Pour supprimer votre compte, contactez notre service client par email à vente@buymore.ml. Notez que cette action est irréversible et supprimera toutes vos données.'
      }
    ]
  }
]

export function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (categoryId: string, index: number) => {
    const key = `${categoryId}-${index}`
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(key)) {
      newOpenItems.delete(key)
    } else {
      newOpenItems.add(key)
    }
    setOpenItems(newOpenItems)
  }

  const filteredData = faqData.map(category => ({
    ...category,
    items: category.items.filter(
      item =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => 
    activeCategory ? category.id === activeCategory : category.items.length > 0
  )

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0f4c2b] to-[#1a5f3a] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Foire Aux Questions</h1>
            <p className="text-xl text-gray-200 mb-8">
              Trouvez rapidement les réponses à vos questions
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === null
                    ? 'bg-[#0f4c2b] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Toutes les catégories
              </button>
              {faqData.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeCategory === category.id
                      ? 'bg-[#0f4c2b] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  {category.title}
                </button>
              ))}
            </div>

            {/* FAQ Items */}
            <div className="space-y-8">
              {filteredData.map(category => (
                <div key={category.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <category.icon className="w-5 h-5 text-[#0f4c2b]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                  </div>
                  
                  <div className="space-y-3">
                    {category.items.map((item, index) => {
                      const isOpen = openItems.has(`${category.id}-${index}`)
                      return (
                        <div
                          key={index}
                          className="bg-white rounded-xl shadow-sm overflow-hidden"
                        >
                          <button
                            onClick={() => toggleItem(category.id, index)}
                            className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium text-gray-900">{item.question}</span>
                            <ChevronDown
                              className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          {isOpen && (
                            <div className="px-6 pb-4">
                              <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              {filteredData.every(cat => cat.items.length === 0) && (
                <div className="text-center py-12">
                  <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun résultat trouvé</h3>
                  <p className="text-gray-600">
                    Essayez avec d'autres mots-clés ou{' '}
                    <Link to="/contact" className="text-[#0f4c2b] font-semibold hover:underline">
                      contactez-nous
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Vous n'avez pas trouvé votre réponse ?
            </h2>
            <p className="text-gray-600 mb-6">
              Notre équipe est disponible pour répondre à toutes vos questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-[#0f4c2b] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#1a5f3a] transition-colors"
              >
                Nous contacter
              </Link>
              <a
                href="https://wa.me/22370796969"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
