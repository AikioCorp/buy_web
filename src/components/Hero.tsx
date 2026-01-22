import { Link } from 'react-router-dom'
import { Search, ShoppingBag, TrendingUp } from 'lucide-react'
import { Button } from './Button'

export function Hero() {
  return (
    <div className="bg-gradient-to-r from-[#1a4d2e] to-[#2d5f3f] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Découvrez les meilleures
              <span className="text-yellow-400"> boutiques</span> en ligne
            </h1>
            <p className="text-lg md:text-xl text-gray-200">
              Shopping Made Easy - Achetez vos produits préférés auprès de vendeurs locaux et internationaux
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/shops">
                <Button size="lg" className="bg-yellow-400 text-[#1a4d2e] hover:bg-yellow-500 font-semibold">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Explorer les boutiques
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#1a4d2e]">
                  Devenir vendeur
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#3a7550]">
              <div>
                <div className="text-3xl font-bold text-yellow-400">500+</div>
                <div className="text-sm text-gray-300">Boutiques</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-400">10K+</div>
                <div className="text-sm text-gray-300">Produits</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-400">50K+</div>
                <div className="text-sm text-gray-300">Clients</div>
              </div>
            </div>
          </div>

          {/* Right Content - Features */}
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all">
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-400 rounded-lg p-3">
                  <Search className="w-6 h-6 text-[#1a4d2e]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Recherche facile</h3>
                  <p className="text-gray-200">
                    Trouvez rapidement les produits que vous cherchez parmi des milliers d'articles
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all">
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-400 rounded-lg p-3">
                  <ShoppingBag className="w-6 h-6 text-[#1a4d2e]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Paiement sécurisé</h3>
                  <p className="text-gray-200">
                    Achetez en toute confiance avec nos systèmes de paiement sécurisés
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all">
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-400 rounded-lg p-3">
                  <TrendingUp className="w-6 h-6 text-[#1a4d2e]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Livraison rapide</h3>
                  <p className="text-gray-200">
                    Recevez vos commandes rapidement grâce à notre réseau de livraison
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
