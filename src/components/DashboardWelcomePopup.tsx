import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export function DashboardWelcomePopup() {
  const [isVisible, setIsVisible] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté et n'a jamais visité le dashboard
    if (user) {
      const hasVisitedDashboard = localStorage.getItem(`dashboard_visited_${user.id}`)
      
      // Afficher le popup seulement si l'utilisateur n'a jamais visité le dashboard
      if (!hasVisitedDashboard) {
        // Attendre 2 secondes avant d'afficher le popup
        const timer = setTimeout(() => {
          setIsVisible(true)
        }, 2000)

        return () => clearTimeout(timer)
      }
    }
  }, [user])

  const handleVisitDashboard = () => {
    if (user) {
      // Marquer que l'utilisateur a visité le dashboard
      localStorage.setItem(`dashboard_visited_${user.id}`, 'true')
    }
    setIsVisible(false)
  }

  const handleDismiss = () => {
    if (user) {
      // Marquer que l'utilisateur a visité le dashboard (même s'il a juste fermé le popup)
      localStorage.setItem(`dashboard_visited_${user.id}`, 'true')
    }
    setIsVisible(false)
  }

  if (!isVisible || !user) return null

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-[150] animate-slide-up">
      <div className="bg-white rounded-lg shadow-xl border-2 border-[#e8d20c] max-w-sm overflow-hidden">
        {/* Header avec effet de brillance */}
        <div className="bg-gradient-to-r from-[#0f4c2b] to-[#1a5f3a] p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-[#e8d20c] p-2 rounded-full">
                <Sparkles className="w-5 h-5 text-[#0f4c2b]" />
              </div>
              <h3 className="text-white font-bold text-lg">Bienvenue !</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4">
          <p className="text-gray-700 mb-4">
            Félicitations {user?.username} ! 🎉
            <br />
            <span className="text-sm">
              Votre compte a été créé avec succès. Découvrez votre espace personnel et toutes ses fonctionnalités.
            </span>
          </p>

          <div className="flex gap-2">
            <Link
              to="/dashboard"
              onClick={handleVisitDashboard}
              className="flex-1 bg-gradient-to-r from-[#0f4c2b] to-[#1a5f3a] text-white px-4 py-2 rounded-lg font-medium hover:from-[#1a5f3a] hover:to-[#0f4c2b] transition-all text-center text-sm"
            >
              Visiter mon espace
            </Link>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
