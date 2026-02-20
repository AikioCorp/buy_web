import { ArrowLeft, ChevronLeft } from 'lucide-react'
import { useSmartNavigation } from '../hooks/useSmartNavigation'

interface SmartBackButtonProps {
  className?: string
  label?: string
  variant?: 'default' | 'minimal' | 'floating' | 'elegant' | 'gradient'
}

export function SmartBackButton({ 
  className = '', 
  label = 'Retour',
  variant = 'elegant'
}: SmartBackButtonProps) {
  const { smartBack, hasBackState } = useSmartNavigation()

  // Styles selon la variante
  const variantStyles = {
    default: 'inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm',
    minimal: 'inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors',
    floating: 'fixed top-20 left-4 z-40 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl',
    elegant: 'group inline-flex items-center gap-2 px-5 py-2.5 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl hover:border-[#0f4c2b] hover:bg-[#0f4c2b] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg',
    gradient: 'group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0f4c2b] to-[#1a5f3a] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-md'
  }

  const iconSize = variant === 'elegant' || variant === 'gradient' ? 18 : 20

  return (
    <button
      onClick={smartBack}
      className={`${variantStyles[variant]} ${className}`}
      title={hasBackState() ? 'Retour à la position précédente' : 'Retour'}
    >
      <div className={`${variant === 'elegant' ? 'group-hover:-translate-x-1' : ''} transition-transform duration-300`}>
        <ChevronLeft size={iconSize} strokeWidth={2.5} />
      </div>
      <span className="font-semibold text-sm">{label}</span>
    </button>
  )
}
