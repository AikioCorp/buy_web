import React, { useState, useEffect } from 'react'
import { 
  X, ChevronRight, ChevronLeft, Store, Package, ShoppingCart,
  BarChart3, Wallet, Sparkles, CheckCircle, Rocket
} from 'lucide-react'

interface TourStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  target?: string
}

interface OnboardingTourProps {
  onComplete: () => void
  onSkip: () => void
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const steps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Bienvenue sur BuyMore ! 🎉',
      description: 'Félicitations ! Vous êtes maintenant vendeur sur la plus grande marketplace du Mali. Ce petit guide va vous montrer comment démarrer.',
      icon: <Sparkles size={32} className="text-yellow-500" />,
    },
    {
      id: 'store',
      title: 'Créez votre boutique',
      description: 'Commencez par créer votre boutique. Donnez-lui un nom accrocheur, ajoutez une description et un logo pour attirer les clients.',
      icon: <Store size={32} className="text-emerald-500" />,
      target: '/dashboard/store'
    },
    {
      id: 'products',
      title: 'Ajoutez vos produits',
      description: 'Une fois votre boutique créée, ajoutez vos produits avec de belles photos, des descriptions détaillées et des prix compétitifs.',
      icon: <Package size={32} className="text-blue-500" />,
      target: '/dashboard/products'
    },
    {
      id: 'orders',
      title: 'Gérez vos commandes',
      description: 'Quand les clients commandent, vous recevez une notification. Traitez les commandes rapidement pour une bonne réputation.',
      icon: <ShoppingCart size={32} className="text-purple-500" />,
      target: '/dashboard/orders'
    },
    {
      id: 'analytics',
      title: 'Suivez vos performances',
      description: 'Consultez vos statistiques pour comprendre ce qui fonctionne et optimiser vos ventes.',
      icon: <BarChart3 size={32} className="text-orange-500" />,
      target: '/dashboard/analytics'
    },
    {
      id: 'earnings',
      title: 'Recevez vos paiements',
      description: 'Configurez vos méthodes de paiement (Orange Money, Wave, Moov Money) pour recevoir vos gains automatiquement.',
      icon: <Wallet size={32} className="text-green-500" />,
      target: '/dashboard/earnings'
    },
    {
      id: 'ready',
      title: 'Vous êtes prêt ! 🚀',
      description: 'C\'est tout ! Commencez par créer votre boutique et ajoutez votre premier produit. Bonne vente !',
      icon: <Rocket size={32} className="text-red-500" />,
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setIsVisible(false)
    localStorage.setItem('onboarding_completed', 'true')
    onComplete()
  }

  const handleSkip = () => {
    setIsVisible(false)
    localStorage.setItem('onboarding_completed', 'true')
    onSkip()
  }

  if (!isVisible) return null

  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-8 pt-6">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'w-8 bg-emerald-500' 
                    : index < currentStep 
                      ? 'w-1.5 bg-emerald-300' 
                      : 'w-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
              {step.icon}
            </div>
          </div>

          {/* Title & Description */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {step.title}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                currentStep === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft size={18} />
              Précédent
            </button>

            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Passer le tutoriel
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle size={18} />
                  Commencer
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingTour
