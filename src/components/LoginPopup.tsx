import { useState } from 'react'
import { X, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, User, Phone } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/components/Toast'
import { PhoneInput } from '@/components/PhoneInput'

interface LoginPopupProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  message?: string
}

export function LoginPopup({ isOpen, onClose, onSuccess, message }: LoginPopupProps) {
  const [isRegister, setIsRegister] = useState(false)
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login, register } = useAuthStore()
  const { showToast } = useToast()

  if (!isOpen) return null

  const resetForm = () => {
    setEmail('')
    setPhoneNumber('')
    setPassword('')
    setConfirmPassword('')
    setFirstName('')
    setLastName('')
    setError('')
  }

  const switchMode = () => {
    setIsRegister(!isRegister)
    resetForm()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const loginIdentifier = loginMethod === 'email' ? email : phoneNumber
      const success = await login(loginIdentifier, password, loginMethod)
      
      if (success) {
        showToast('Connexion réussie !', 'success')
        onClose()
        if (onSuccess) onSuccess()
      } else {
        setError('Email/téléphone ou mot de passe incorrect')
      }
    } catch (err: any) {
      setError(err.message || 'Email/téléphone ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)

    try {
      // Créer un username unique
      const fullName = `${firstName} ${lastName}`.trim()
      const baseUsername = fullName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      const uniqueSuffix = Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(-2)
      const username = `${baseUsername}_${uniqueSuffix}`

      // Formater le numéro de téléphone
      const formattedPhone = loginMethod === 'phone'
        ? (phoneNumber.startsWith('+223') ? phoneNumber : `+223 ${phoneNumber.replace(/^\+?223\s*/, '').replace(/[^0-9]/g, '').replace(/(\d{2})(?=\d)/g, '$1 ').trim()}`)
        : ''

      const success = await register({
        username,
        email: loginMethod === 'email' ? email : '',
        password,
        first_name: firstName,
        last_name: lastName,
        phone: formattedPhone,
      })
      
      if (success) {
        showToast('Compte créé avec succès !', 'success')
        onClose()
        if (onSuccess) onSuccess()
      } else {
        setError('Erreur lors de la création du compte')
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0f4c2b] to-[#1a5f3a] px-6 py-6 text-white text-center sticky top-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            {isRegister ? <UserPlus className="w-7 h-7" /> : <LogIn className="w-7 h-7" />}
          </div>
          <h2 className="text-xl font-bold">{isRegister ? 'Créer un compte' : 'Connexion'}</h2>
          <p className="text-white/80 mt-1 text-sm">
            {isRegister 
              ? 'Rejoignez BuyMore et profitez de nos offres' 
              : (message || 'Connectez-vous pour continuer')}
          </p>
        </div>

        {/* Toggle Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => !loading && setIsRegister(false)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              !isRegister 
                ? 'text-[#0f4c2b] border-b-2 border-[#0f4c2b] bg-green-50/50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => !loading && setIsRegister(true)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              isRegister 
                ? 'text-[#0f4c2b] border-b-2 border-[#0f4c2b] bg-green-50/50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Créer un compte
          </button>
        </div>

        {/* Form */}
        <form onSubmit={isRegister ? handleRegister : handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Méthode de connexion/inscription */}
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                loginMethod === 'email'
                  ? 'bg-[#0f4c2b] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Mail className="inline w-4 h-4 mr-1" /> Email
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                loginMethod === 'phone'
                  ? 'bg-[#0f4c2b] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Phone className="inline w-4 h-4 mr-1" /> Téléphone
            </button>
          </div>

          {/* Champs pour l'inscription */}
          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Prénom"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nom"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email ou Téléphone */}
          {loginMethod === 'email' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent text-sm"
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone
              </label>
              <PhoneInput
                value={phoneNumber}
                onChange={setPhoneNumber}
                required
                className="text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent text-sm"
                required
                minLength={isRegister ? 6 : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {isRegister && (
              <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
            )}
          </div>

          {/* Confirmation mot de passe pour l'inscription */}
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent text-sm"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0f4c2b] hover:bg-[#1a5f3a] text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isRegister ? 'Création...' : 'Connexion...'}
              </>
            ) : (
              <>
                {isRegister ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                {isRegister ? 'Créer mon compte' : 'Se connecter'}
              </>
            )}
          </button>

          <div className="text-center text-sm text-gray-600">
            {isRegister ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
            <button 
              type="button"
              onClick={switchMode}
              className="text-[#0f4c2b] font-semibold hover:underline"
            >
              {isRegister ? 'Se connecter' : 'Créer un compte'}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Continuer sans compte
          </button>
        </form>
      </div>
    </div>
  )
}
