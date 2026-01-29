import { Link } from 'react-router-dom'
import { 
  ShoppingBag, Truck, Shield, Users, Target, Heart, 
  CheckCircle, MapPin, Phone, Mail, ArrowRight 
} from 'lucide-react'

export function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0f4c2b] to-[#1a5f3a] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">À propos de Buy More</h1>
            <p className="text-xl text-gray-200">
              Tout ce dont vous avez besoin, en un clic ! La marketplace malienne qui connecte 
              vendeurs et acheteurs pour une expérience d'achat simple et rapide.
            </p>
          </div>
        </div>
      </section>

      {/* Notre Mission */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre Mission</h2>
                <p className="text-gray-600 mb-4">
                  Buy More est née de la volonté de révolutionner le commerce en ligne au Mali. 
                  Notre mission est de rendre le shopping en ligne accessible, sécurisé et agréable 
                  pour tous les Maliens.
                </p>
                <p className="text-gray-600 mb-4">
                  Nous connectons les meilleurs vendeurs locaux avec des millions d'acheteurs, 
                  en offrant une plateforme moderne, fiable et facile à utiliser.
                </p>
                <p className="text-gray-600">
                  Que vous soyez à Bamako, Sikasso, Ségou ou ailleurs au Mali, Buy More vous 
                  permet d'acheter et de vendre en toute confiance.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#0f4c2b]">1000+</div>
                    <div className="text-gray-500 text-sm">Produits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#0f4c2b]">50+</div>
                    <div className="text-gray-500 text-sm">Boutiques</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#0f4c2b]">5000+</div>
                    <div className="text-gray-500 text-sm">Clients satisfaits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#0f4c2b]">24h</div>
                    <div className="text-gray-500 text-sm">Livraison rapide</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Nos Valeurs</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-[#0f4c2b]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Confiance</h3>
                <p className="text-gray-600">
                  Nous garantissons des transactions sécurisées et des produits authentiques 
                  pour une expérience d'achat en toute sérénité.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-[#0f4c2b]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Qualité</h3>
                <p className="text-gray-600">
                  Nous sélectionnons rigoureusement nos vendeurs pour vous offrir 
                  uniquement des produits de qualité.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-[#0f4c2b]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Proximité</h3>
                <p className="text-gray-600">
                  Notre équipe est à votre écoute pour vous accompagner 
                  dans toutes vos démarches d'achat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi nous choisir */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Pourquoi choisir Buy More ?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: Truck, title: 'Livraison rapide', desc: 'Livraison sous 24-48h à Bamako et dans les principales villes du Mali' },
                { icon: Shield, title: 'Paiement sécurisé', desc: 'Vos transactions sont protégées et vos données personnelles sécurisées' },
                { icon: CheckCircle, title: 'Produits authentiques', desc: 'Tous nos vendeurs sont vérifiés pour garantir l\'authenticité des produits' },
                { icon: Heart, title: 'Service client', desc: 'Une équipe dédiée pour répondre à toutes vos questions 7j/7' },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 bg-white rounded-xl p-6 shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-[#0f4c2b]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notre Équipe */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre Équipe</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Buy More est une entreprise malienne dédiée à révolutionner le commerce en ligne au Mali. 
              Notre équipe passionnée travaille chaque jour pour vous offrir la meilleure expérience d'achat possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-br from-[#0f4c2b] to-[#1a5f3a] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Contactez-nous</h2>
                <p className="text-gray-200 mb-6">
                  Une question ? Une suggestion ? Notre équipe est là pour vous aider.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-yellow-400" />
                    <span>Sotuba ACI près de la clinique Almed, Bamako – Mali</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-yellow-400" />
                    <a href="tel:+22370796969" className="hover:text-yellow-400 transition">+223 70 79 69 69</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-yellow-400" />
                    <a href="mailto:vente@buymore.ml" className="hover:text-yellow-400 transition">vente@buymore.ml</a>
                  </div>
                </div>
              </div>
              <div className="text-center md:text-right">
                <Link 
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-yellow-400 text-[#0f4c2b] px-8 py-4 rounded-full font-bold hover:bg-yellow-300 transition-colors"
                >
                  Nous contacter <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
