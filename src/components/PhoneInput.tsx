import { useState } from 'react'
import { Phone } from 'lucide-react'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
  className?: string
}

export function PhoneInput({
  value,
  onChange,
  required = false,
  className = ""
}: PhoneInputProps) {
  // Extraire les chiffres du numéro complet (+223 XX XX XX XX)
  const extractDigits = (phone: string) => {
    return phone.replace(/\D/g, '').replace(/^223/, '')
  }
  
  const [displayValue, setDisplayValue] = useState(extractDigits(value))

  // Formater le numéro au format malien
  const formatPhoneNumber = (input: string): string => {
    // Retirer tout sauf les chiffres
    const digits = input.replace(/\D/g, '')
    
    // Limiter à 8 chiffres
    const limitedDigits = digits.slice(0, 8)
    
    // Formater avec des espaces: XX XX XX XX
    if (limitedDigits.length <= 2) {
      return limitedDigits
    } else if (limitedDigits.length <= 4) {
      return `${limitedDigits.slice(0, 2)} ${limitedDigits.slice(2)}`
    } else if (limitedDigits.length <= 6) {
      return `${limitedDigits.slice(0, 2)} ${limitedDigits.slice(2, 4)} ${limitedDigits.slice(4)}`
    } else {
      return `${limitedDigits.slice(0, 2)} ${limitedDigits.slice(2, 4)} ${limitedDigits.slice(4, 6)} ${limitedDigits.slice(6)}`
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const formatted = formatPhoneNumber(input)
    setDisplayValue(formatted)
    
    // Stocker le numéro complet avec l'indicatif
    const digits = input.replace(/\D/g, '').slice(0, 8)
    if (digits.length > 0) {
      onChange(`+223 ${formatPhoneNumber(digits)}`)
    } else {
      onChange('')
    }
  }

  return (
    <div className="group">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Téléphone {required && '*'}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-[#0f4c2b] transition-colors" />
        </div>
        
        {/* Drapeau et indicatif */}
        <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none">
          <div className="flex items-center gap-2 px-3 border-r border-gray-300">
            <span className="text-2xl" role="img" aria-label="Mali flag">🇲🇱</span>
            <span className="text-sm font-medium text-gray-700">+223</span>
          </div>
        </div>
        
        <input
          type="tel"
          value={displayValue}
          onChange={handleChange}
          required={required}
          className={`block w-full pl-[140px] pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent transition-all bg-gray-50 focus:bg-white ${className}`}
          placeholder="Votre numéro ici"
          maxLength={11}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Format: 8 chiffres
      </p>
    </div>
  )
}
