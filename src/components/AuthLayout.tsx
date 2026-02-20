import { Outlet, Link } from 'react-router-dom'
import { SimpleNavbar } from './SimpleNavbar'
import { Facebook, Instagram, MapPin, Mail, Phone, Heart, MessageCircle } from 'lucide-react'

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <SimpleNavbar />
      
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
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
                <a
                  href="https://wa.me/22370796969"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-500 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
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
                <li>
                  <Link to="/privacy" className="text-gray-300 hover:text-yellow-400 transition">
                    Politique de confidentialité
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
      
      {/* Navbar mobile en bas pour les pages d'authentification */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f4c2b] z-[100] shadow-md border-t border-[#e8d20c]/20">
        <div className="flex justify-around items-center py-1.5 px-0.5">
          <a href="/" className="flex flex-col items-center px-1 py-0.5 text-white hover:text-[#e8d20c]/90">
            <div className="p-1 rounded-full">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-[10px] mt-0.5 font-medium">Accueil</span>
          </a>
          
          <a href="/categories" className="flex flex-col items-center px-1 py-0.5 text-white hover:text-[#e8d20c]/90">
            <div className="p-1 rounded-full">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <span className="text-[10px] mt-0.5 font-medium">Catégories</span>
          </a>
          
          <a href="/shops" className="flex flex-col items-center px-1 py-0.5 text-white hover:text-[#e8d20c]/90">
            <div className="p-1 rounded-full">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className="text-[10px] mt-0.5 font-medium">Boutiques</span>
          </a>
          
          <a href="/favorites" className="flex flex-col items-center px-1 py-0.5 text-white hover:text-[#e8d20c]/90 relative">
            <div className="p-1 rounded-full relative">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">0</span>
            </div>
            <span className="text-[10px] mt-0.5 font-medium">Favoris</span>
          </a>
          
          <a href="/login" className="flex flex-col items-center px-1 py-0.5 text-white hover:text-[#e8d20c]/90">
            <div className="p-1 rounded-full">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <span className="text-[10px] mt-0.5 font-medium">Connexion</span>
          </a>
        </div>
      </div>
    </div>
  )
}
