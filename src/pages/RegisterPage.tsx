import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Mail, Lock, User, ArrowRight, ShoppingBag, Eye, EyeOff, Store, FileText, Phone, Shield, RefreshCw, ArrowLeft } from 'lucide-react'
import { SocialAuthButtons } from '../components/auth/SocialAuthButtons'
import { authService } from '@/lib/api/authService'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('customer')
  const [showPassword, setShowPassword] = useState(false)
  // Champs boutique (si vendeur)
  const [shopName, setShopName] = useState('')
  const [shopDescription, setShopDescription] = useState('')
  const [shopPhone, setShopPhone] = useState('')
  const [shopEmail, setShopEmail] = useState('')
  const [useRegistrationPhone, setUseRegistrationPhone] = useState(true)

  // État OTP pour l'inscription avec téléphone via email
  const [otpStep, setOtpStep] = useState(false)
  const [otpPhone, setOtpPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpCountdown, setOtpCountdown] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const { register, error, isLoading, clearError, isAuthenticated, user, role: userRole } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated && user) {
      let redirectPath = '/'
      if (user.is_superuser || userRole === 'super_admin') {
        redirectPath = '/superadmin'
      } else if (user.is_staff || userRole === 'admin') {
        redirectPath = '/admin'
      } else if (user.is_seller || userRole === 'vendor') {
        redirectPath = '/dashboard'
      } else {
        redirectPath = '/client'
      }
      navigate(redirectPath, { replace: true })
    }
  }, [isAuthenticated, user, userRole, navigate])

  // Countdown OTP
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpCountdown])

  // Focus premier input OTP quand on arrive à l'étape OTP
  useEffect(() => {
    if (otpStep && otpRefs.current[0]) {
      otpRefs.current[0]?.focus()
    }
  }, [otpStep])

  // Formater un numéro de téléphone malien (8 chiffres) en +223 XX XX XX XX
  const formatMaliPhone = (digits: string) => {
    if (!digits) return ''
    const clean = digits.replace(/[^0-9]/g, '').slice(0, 8)
    if (clean.length === 0) return ''
    // Format: +223 XX XX XX XX
    const formatted = clean.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
    return `+223 ${formatted}`
  }

  // Gestion OTP inputs
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '')
    if (digit.length > 1) {
      const digits = digit.slice(0, 6).split('')
      const newOtp = [...otp]
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d
      })
      setOtp(newOtp)
      const nextIndex = Math.min(index + digits.length, 5)
      otpRefs.current[nextIndex]?.focus()
      return
    }
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const otpCode = otp.join('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    // Séparer le nom complet en prénom et nom
    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Créer un username unique à partir du nom complet + suffixe aléatoire
    const baseUsername = fullName.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    const uniqueSuffix = Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(-2)
    const username = `${baseUsername}_${uniqueSuffix}`

    // Déterminer le téléphone de la boutique
    let finalShopPhone = ''
    if (role === 'vendor' && shopPhone) {
      finalShopPhone = formatMaliPhone(shopPhone)
    }

    const registerData = {
      username,
      email: email,
      password,
      first_name: firstName,
      last_name: lastName,
      phone: phoneNumber || undefined,
      is_seller: role === 'vendor',
      store_name: role === 'vendor' ? shopName : undefined,
      store_description: role === 'vendor' ? shopDescription : undefined,
      store_phone: role === 'vendor' ? finalShopPhone : undefined,
      store_email: role === 'vendor' && shopEmail ? shopEmail : undefined,
    }

    console.log('📝 Register data:', registerData)

    const result = await register(registerData)

    if (result === 'requires_otp') {
      // L'inscription a réussi mais l'OTP est requis
      // Passer à l'étape de vérification OTP
      setOtpPhone(phoneNumber)
      setOtpStep(true)
      setOtpCountdown(60)
      return
    }

    if (result === true) {
      // Rediriger vers la page appropriée (inscription sans téléphone, token direct)
      if (role === 'vendor') {
        navigate('/dashboard/store', { replace: true })
      } else {
        const from = (location.state as any)?.from?.pathname || '/'
        navigate(from, { replace: true })
      }
    }
  }

  // Vérifier l'OTP après inscription
  const handleVerifyRegistrationOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.length !== 6) return

    setOtpError('')
    setOtpLoading(true)

    try {
      const response = await authService.verifyPhoneOtp({
        phone: otpPhone,
        otp: otpCode,
      })

      if (response.error) {
        const errMsg = typeof response.error === 'string' ? response.error : (response.error as any)?.message || JSON.stringify(response.error)
        setOtpError(errMsg)
        return
      }

      const data = response.data
      if (!data) {
        setOtpError('Réponse invalide du serveur')
        return
      }

      // ✅ Token reçu — charger l'utilisateur et rediriger
      const { loadUser } = useAuthStore.getState()
      await loadUser()

      const verifiedUser = data.user
      let redirectPath = '/client'
      if (verifiedUser?.is_superuser) redirectPath = '/superadmin'
      else if (verifiedUser?.is_staff) redirectPath = '/admin'
      else if (verifiedUser?.is_seller) redirectPath = '/dashboard'

      if (role === 'vendor') redirectPath = '/dashboard/store'

      navigate(redirectPath, { replace: true })
      window.location.reload()
    } catch (err: any) {
      const msg = err?.message || err?.toString?.() || 'Code OTP invalide ou expiré'
      setOtpError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setOtpLoading(false)
    }
  }

  // Renvoyer le code OTP
  const handleResendRegistrationOtp = async () => {
    if (otpCountdown > 0) return
    setOtpLoading(true)
    setOtpError('')
    try {
      const response = await authService.sendPhoneOtp(otpPhone)
      if (response.error) {
        const errMsg = typeof response.error === 'string' ? response.error : (response.error as any)?.message || JSON.stringify(response.error)
        setOtpError(errMsg)
        return
      }
      setOtpCountdown(60)
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } catch (err: any) {
      const msg = err?.message || err?.toString?.() || 'Erreur lors du renvoi du code'
      setOtpError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col-reverse lg:flex-row">
      {/* Partie gauche - Image/Illustration */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-[#0f4c2b] via-[#1a5f3a] to-[#0f4c2b] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJWMzZoLTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="relative z-10 text-center text-white max-w-lg">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Rejoignez<br />BuyMore
          </h1>
          <p className="text-xl text-green-100 mb-8">
            Créez votre compte et découvrez des milliers de produits
          </p>
          <div className="space-y-4 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left transform hover:scale-105 transition-transform">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Achetez en toute sécurité</div>
                  <div className="text-green-100 text-sm">Paiement sécurisé et livraison rapide</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left transform hover:scale-105 transition-transform">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Store className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Vendez vos produits</div>
                  <div className="text-green-100 text-sm">Créez votre boutique en quelques clics</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partie droite - Formulaire */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white py-8 lg:py-0">
        <div className="max-w-md w-full space-y-6 sm:space-y-8 animate-fade-in">
          {/* Logo et titre */}
          <div className="text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="bg-gradient-to-br from-[#0f4c2b] to-[#1a5f3a] p-3 sm:p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
                <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Créer un compte</h2>
            <p className="text-sm sm:text-base text-gray-600">Rejoignez notre communauté dès aujourd'hui</p>
          </div>

          {/* Social Auth Buttons */}
          <SocialAuthButtons mode="register" />

          {/* Onglets + formulaire */}
          <div className="mt-6 sm:mt-8 space-y-5 sm:space-y-6">

            {/* ────── Écran de vérification OTP (après inscription email+téléphone) ────── */}
            {otpStep ? (
              <form onSubmit={handleVerifyRegistrationOtp} className="space-y-5">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-3">
                    <Shield className="h-7 w-7 text-[#0f4c2b]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Vérifiez votre numéro</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Un code a été envoyé au <span className="font-medium text-gray-700">{otpPhone}</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Votre compte a été créé avec succès. Entrez le code SMS pour finaliser.
                  </p>
                </div>

                {otpError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <p className="text-red-700 text-sm font-medium">{otpError}</p>
                  </div>
                )}

                {/* OTP Input (6 chiffres séparés) */}
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={(e) => {
                        e.preventDefault()
                        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '')
                        handleOtpChange(index, pastedData)
                      }}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f4c2b] focus:border-[#0f4c2b] transition-all"
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || otpCode.length !== 6}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0f4c2b] to-[#1a5f3a] text-white py-3 px-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Vérification...
                    </span>
                  ) : (
                    <>
                      <span>Vérifier et accéder</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                {/* Renvoyer / retour */}
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep(false)
                      setOtp(['', '', '', '', '', ''])
                      setOtpError('')
                    }}
                    className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Modifier les infos
                  </button>

                  <button
                    type="button"
                    onClick={handleResendRegistrationOtp}
                    disabled={otpCountdown > 0 || otpLoading}
                    className="flex items-center gap-1 text-[#0f4c2b] hover:text-[#1a5f3a] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw className={`h-4 w-4 ${otpLoading ? 'animate-spin' : ''}`} />
                    {otpCountdown > 0 ? `Renvoyer (${otpCountdown}s)` : 'Renvoyer le code'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                {error && !otpStep && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-shake">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Formulaire email — seul <form> HTML de la page */}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {/* Nom complet */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#0f4c2b] transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="block w-full pl-12 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                        placeholder="Votre nom complet ici"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Adresse email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#0f4c2b] transition-colors" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="block w-full pl-12 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  {/* Mot de passe */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#0f4c2b] transition-colors" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="block w-full pl-12 pr-12 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Minimum 6 caractères</p>
                  </div>

                  {/* Numéro de téléphone (optionnel) */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Numéro de téléphone <span className="text-gray-400 font-normal">(optionnel)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-[#0f4c2b] transition-colors" />
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 8)
                          setPhoneNumber(value)
                        }}
                        maxLength={8}
                        className="block w-full pl-12 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                        placeholder="70 00 00 00"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Si fourni, un code SMS sera envoyé pour vérification
                    </p>
                  </div>
                  {/* Type de compte */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Type de compte
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => setRole('customer')}
                        className={`relative flex flex-col items-center p-4 border-2 rounded-xl transition-all ${role === 'customer'
                          ? 'border-[#0f4c2b] bg-green-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                      >
                        <ShoppingBag className={`h-8 w-8 mb-2 ${role === 'customer' ? 'text-[#0f4c2b]' : 'text-gray-400'
                          }`} />
                        <span className={`text-sm font-semibold ${role === 'customer' ? 'text-[#0f4c2b]' : 'text-gray-700'
                          }`}>
                          Client
                        </span>
                        {role === 'customer' && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-[#0f4c2b] rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('vendor')}
                        className={`relative flex flex-col items-center p-4 border-2 rounded-xl transition-all ${role === 'vendor'
                          ? 'border-[#0f4c2b] bg-green-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                      >
                        <Store className={`h-8 w-8 mb-2 ${role === 'vendor' ? 'text-[#0f4c2b]' : 'text-gray-400'
                          }`} />
                        <span className={`text-sm font-semibold ${role === 'vendor' ? 'text-[#0f4c2b]' : 'text-gray-700'
                          }`}>
                          Vendeur
                        </span>
                        {role === 'vendor' && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-[#0f4c2b] rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Champs boutique (si vendeur) */}
                  {role === 'vendor' && (
                    <div className="space-y-4 pt-4 border-t-2 border-gray-200 animate-fade-in">
                      <div className="flex items-center gap-2 text-[#0f4c2b] mb-2">
                        <Store className="h-5 w-5" />
                        <h3 className="font-semibold text-base">Informations de votre boutique</h3>
                      </div>

                      {/* Nom de la boutique */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nom de la boutique *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Store className="h-5 w-5 text-gray-400 group-focus-within:text-[#0f4c2b] transition-colors" />
                          </div>
                          <input
                            type="text"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            required
                            className="block w-full pl-12 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                            placeholder="Ma Super Boutique"
                          />
                        </div>
                      </div>

                      {/* Description (optionnel) */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Description <span className="text-gray-400 font-normal">(optionnel)</span>
                        </label>
                        <div className="relative">
                          <div className="absolute top-3 left-0 pl-4 pointer-events-none">
                            <FileText className="h-5 w-5 text-gray-400 group-focus-within:text-[#0f4c2b] transition-colors" />
                          </div>
                          <textarea
                            value={shopDescription}
                            onChange={(e) => setShopDescription(e.target.value)}
                            rows={2}
                            className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent transition-all bg-gray-50 focus:bg-white resize-none"
                            placeholder="Décrivez brièvement votre boutique..."
                          />
                        </div>
                      </div>

                      {/* Téléphone boutique */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Téléphone boutique <span className="text-gray-400 font-normal">(optionnel)</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-gray-500 font-medium text-sm">+223</span>
                          </div>
                          <input
                            type="tel"
                            value={shopPhone}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 8)
                              setShopPhone(value)
                            }}
                            maxLength={8}
                            className="block w-full pl-16 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                            placeholder="70 00 00 00"
                          />
                        </div>
                      </div>

                      {/* Email boutique (optionnel) */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email boutique <span className="text-gray-400 font-normal">(optionnel)</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#0f4c2b] transition-colors" />
                          </div>
                          <input
                            type="email"
                            value={shopEmail}
                            onChange={(e) => setShopEmail(e.target.value)}
                            className="block w-full pl-12 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                            placeholder="contact@maboutique.com"
                          />
                        </div>
                      </div>

                      {/* Note d'approbation */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> Votre boutique sera vérifiée par notre équipe avant d'être activée.
                          Ce processus prend généralement moins de 24h (jours ouvrables).
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bouton d'inscription */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center items-center py-3 sm:py-4 px-4 border border-transparent text-sm sm:text-base font-semibold rounded-xl text-white bg-gradient-to-r from-[#0f4c2b] to-[#1a5f3a] hover:from-[#1a5f3a] hover:to-[#0f4c2b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0f4c2b] disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Création du compte...
                      </>
                    ) : (
                      <>
                        {role === 'vendor' ? 'Créer ma boutique' : 'Créer mon compte'}
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Lien connexion */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Déjà un compte ?{' '}
              <Link to="/login" className="font-semibold text-[#0f4c2b] hover:text-[#1a5f3a] transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
