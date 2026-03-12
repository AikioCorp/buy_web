import { useState } from 'react'
import { X, Phone, MessageCircle, Loader2 } from 'lucide-react'

interface WhatsAppPhonePopupProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (phone: string) => void
  isLoading?: boolean
}

export function WhatsAppPhonePopup({ isOpen, onClose, onSubmit, isLoading }: WhatsAppPhonePopupProps) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const validatePhone = (value: string): boolean => {
    // Remove spaces and dashes
    const cleaned = value.replace(/[\s-]/g, '')
    // Mali phone numbers: +223 followed by 8 digits, or just 8 digits starting with 6, 7, or 9
    const maliRegex = /^(\+223)?[679]\d{7}$/
    return maliRegex.test(cleaned)
  }

  const formatPhone = (value: string): string => {
    // Remove non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '')
    
    // If starts with 223, add +
    if (cleaned.startsWith('223') && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned
    }
    
    // If starts with just digits (no +223), it's a local number
    if (!cleaned.startsWith('+') && cleaned.length <= 8) {
      // Format as XX XX XX XX
      const parts = cleaned.match(/.{1,2}/g)
      return parts ? parts.join(' ') : cleaned
    }
    
    return cleaned
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clean and validate
    const cleaned = phone.replace(/[\s-]/g, '')
    
    if (!cleaned) {
      setError('Veuillez entrer votre numéro de téléphone')
      return
    }
    
    if (!validatePhone(cleaned)) {
      setError('Numéro de téléphone invalide. Format: 70 XX XX XX ou +223 70 XX XX XX')
      return
    }

    // Normalize to +223 format
    let normalizedPhone = cleaned
    if (!normalizedPhone.startsWith('+223')) {
      normalizedPhone = '+223' + normalizedPhone
    }

    onSubmit(normalizedPhone)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Commander via WhatsApp</h2>
              <p className="text-white/80 text-sm">Une dernière étape avant de continuer</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 text-sm mb-4">
              Pour vous contacter concernant votre commande, veuillez entrer votre numéro de téléphone.
            </p>
            
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="70 12 34 56"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg ${
                  error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                autoFocus
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Exemple: 70 12 34 56 ou +223 70 12 34 56
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle size={16} className="text-green-600" />
              </div>
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Pourquoi ce numéro ?</p>
                <ul className="text-green-700 space-y-1">
                  <li>• Pour confirmer votre commande</li>
                  <li>• Pour vous informer de la livraison</li>
                  <li>• Pour vous contacter si besoin</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <MessageCircle size={18} />
                  Continuer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
