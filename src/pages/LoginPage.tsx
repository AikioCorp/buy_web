import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Mail, Lock, ArrowRight, ShoppingBag, Eye, EyeOff, Phone } from 'lucide-react'
import { SocialAuthButtons } from '../components/auth/SocialAuthButtons'
import { PhoneLoginForm } from '../components/auth/PhoneLoginForm'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, error, isLoading, clearError, isAuthenticated, user, role } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated && user) {
      let redirectPath = '/'
      if (user.is_superuser || role === 'super_admin') {
        redirectPath = '/superadmin'
      } else if (user.is_staff || role === 'admin') {
        redirectPath = '/admin'
      } else if (user.is_seller || role === 'vendor') {
        redirectPath = '/dashboard'
      } else {
        redirectPath = '/client'
      }
      navigate(redirectPath, { replace: true })
    }
  }, [isAuthenticated, user, role, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    // Only handle email login here, phone is handled by PhoneLoginForm
    if (loginMethod !== 'email') return

    const success = await login(email, password, loginMethod)
    
    if (success) {
      // Get the role from the store after login
      const { role, user } = useAuthStore.getState()
      
      // Determine redirect based on role
      let defaultRedirect = '/'
      if (user?.is_superuser || role === 'super_admin') {
        defaultRedirect = '/superadmin'
      } else if (user?.is_staff || role === 'admin') {
        defaultRedirect = '/admin'
      } else if (user?.is_seller || role === 'vendor') {
        defaultRedirect = '/dashboard'
      } else {
        defaultRedirect = '/client'
      }
      
      const from = (location.state as any)?.from?.pathname || defaultRedirect
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      {/* Partie gauche - Formulaire */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white py-8 lg:py-0">
        <div className="max-w-md w-full space-y-6 sm:space-y-8 animate-fade-in">
          {/* Logo et titre */}
          <div className="text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="bg-gradient-to-br from-[#0f4c2b] to-[#1a5f3a] p-3 sm:p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
                <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Bon retour !</h2>
            <p className="text-sm sm:text-base text-gray-600">Connectez-vous pour continuer vos achats</p>
          </div>

          {/* Social Auth Buttons */}
          <SocialAuthButtons mode="login" />

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-5 sm:space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-shake">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4 sm:space-y-5">
              {/* Méthode de connexion */}
              <div className="flex flex-col gap-2 mb-2">
                <div className="flex gap-2">
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
                    disabled
                    className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
                  >
                    <Phone className="inline w-4 h-4 mr-1" /> Téléphone (bientôt disponible)
                  </button>
                </div>
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  La connexion par téléphone est temporairement désactivée.
                  Fonctionnalité en cours de correction.
                </p>
              </div>

              {/* Connexion par téléphone avec OTP désactivée : on force la méthode email */}
              {loginMethod === 'phone' ? (
                <></>
              ) : (
                <>
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
                          placeholder="exemple@buymore.ml"
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
                  </div>
                </>
              )}
            </div>

            {/* Mot de passe oublié */}
            {loginMethod === 'email' && (
              <div className="flex items-center justify-end">
                <Link to="/forgot-password" className="text-sm font-medium text-[#0f4c2b] hover:text-[#1a5f3a] transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
            )}

            {/* Bouton de connexion */}
            {loginMethod === 'email' && (
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
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            )}

            {/* Lien inscription */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <Link to="/register" className="font-semibold text-[#0f4c2b] hover:text-[#1a5f3a] transition-colors">
                  Créer un compte
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Partie droite - Image/Illustration */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-[#0f4c2b] via-[#1a5f3a] to-[#0f4c2b] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJWMzZoLTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNGgydjJoLTJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="relative z-10 text-center text-white max-w-lg">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Bienvenue sur<br />BuyMore
          </h1>
          <p className="text-xl text-green-100 mb-8">
            Votre marketplace de confiance pour acheter et vendre en toute sécurité
          </p>
          <div className="grid grid-cols-2 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform">
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-green-100">Produits</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-green-100">Boutiques</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
