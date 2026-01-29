import { Outlet, Link } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Facebook, Instagram, MapPin, Mail, Phone, Heart } from 'lucide-react'

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-[#1a4d2e] text-white mt-12">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* À propos */}
            <div>
              <h3 className="font-bold text-xl mb-4 text-yellow-400">Buy More</h3>
              <p className="text-gray-300 text-sm mb-4">
                Tout ce dont vous avez besoin, en un clic ! Livraison rapide.
              </p>
              {/* Réseaux sociaux */}
              <div className="flex items-center gap-3">
                <a 
                  href="https://www.facebook.com/people/Buy-More/61577174854756/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.instagram.com/buy13295/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.tiktok.com/@buy.more5" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-black transition-colors"
                >
                  <TikTokIcon className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Liens rapides */}
            <div>
              <h3 className="font-bold text-lg mb-4">Liens rapides</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/shops" className="text-gray-300 hover:text-yellow-400 transition">
                    Boutiques
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-gray-300 hover:text-yellow-400 transition">
                    Produits
                  </Link>
                </li>
                <li>
                  <Link to="/deals" className="text-gray-300 hover:text-yellow-400 transition">
                    Promotions
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-gray-300 hover:text-yellow-400 transition">
                    Devenir vendeur
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-yellow-400 transition">
                    À propos
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-300 hover:text-yellow-400 transition">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-300 hover:text-yellow-400 transition">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-300 hover:text-yellow-400 transition">
                    Conditions d'utilisation
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-400" />
                  <span>Sotuba ACI près de la clinique Almed<br />Bamako – Mali</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0 text-yellow-400" />
                  <a href="mailto:vente@buymore.ml" className="hover:text-yellow-400 transition">
                    vente@buymore.ml
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0 text-yellow-400" />
                  <a href="tel:+22370796969" className="hover:text-yellow-400 transition">
                    +223 70 79 69 69
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-[#2d5f3f] mt-8 pt-8 text-center text-sm text-gray-300">
            <p className="mb-2">© 2026 Buy More. Tous droits réservés.</p>
            <p className="flex items-center justify-center gap-1">
              Site créé avec <Heart className="w-4 h-4 text-red-500 fill-red-500" /> par{' '}
              <a 
                href="https://www.aikio.co" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-yellow-400 hover:underline"
              >
                Aikio Corp SAS
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
