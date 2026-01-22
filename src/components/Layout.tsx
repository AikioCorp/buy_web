import { Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Navbar } from './Navbar'

export function Layout() {
  // Le nouveau authStore charge automatiquement l'utilisateur au démarrage
  // Plus besoin d'appeler initialize()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-[#1a4d2e] text-white mt-12">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4 text-yellow-400">Buy More</h3>
              <p className="text-gray-300 text-sm">
                Shopping Made Easy - La marketplace qui connecte vendeurs et acheteurs.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Liens rapides</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/shops" className="text-gray-300 hover:text-yellow-400 transition">
                    Boutiques
                  </a>
                </li>
                <li>
                  <a href="/products" className="text-gray-300 hover:text-yellow-400 transition">
                    Produits
                  </a>
                </li>
                <li>
                  <a href="/deals" className="text-gray-300 hover:text-yellow-400 transition">
                    Promotions
                  </a>
                </li>
                <li>
                  <a href="/register" className="text-gray-300 hover:text-yellow-400 transition">
                    Devenir vendeur
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/about" className="text-gray-300 hover:text-yellow-400 transition">
                    À propos
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-300 hover:text-yellow-400 transition">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/faq" className="text-gray-300 hover:text-yellow-400 transition">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-gray-300 hover:text-yellow-400 transition">
                    Conditions d'utilisation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Bamako, Mali</li>
                <li>contact@buymore.com</li>
                <li>+223 XX XX XX XX</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#2d5f3f] mt-8 pt-8 text-center text-sm text-gray-300">
            <p>&copy; 2025 Buy More - Aikio Corp. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
