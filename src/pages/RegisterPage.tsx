import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Mail, Lock, User, ArrowRight, ShoppingBag, Eye, EyeOff, Store, FileText, Upload } from 'lucide-react'
import { NeighborhoodAutocomplete } from '@/components/NeighborhoodAutocomplete'
import { PhoneInput } from '@/components/PhoneInput'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('customer')
  const [showPassword, setShowPassword] = useState(false)
  // Champs boutique (si vendeur)
  const [shopName, setShopName] = useState('')
  const [shopDescription, setShopDescription] = useState('')
  const [shopAddress, setShopAddress] = useState('')
  const [shopPhone, setShopPhone] = useState('')
  const [shopEmail, setShopEmail] = useState('')
  const [shopLogo, setShopLogo] = useState<File | null>(null)
  const [shopLogoPreview, setShopLogoPreview] = useState<string>('')
  
  const { register, error, isLoading, clearError } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setShopLogo(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setShopLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    // Séparer le nom complet en prénom et nom
    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Créer un username à partir de l'email
    const username = email.split('@')[0]

    const registerData = {
      username,
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      phone: role === 'vendor' ? shopPhone : '',
      is_seller: role === 'vendor',
      store_name: role === 'vendor' ? shopName : undefined,
      store_description: role === 'vendor' ? shopDescription : undefined,
    }

    const success = await register(registerData)
    
    if (success) {
      // Rediriger vers la page précédente (ex: checkout) ou vers l'accueil
      const from = (location.state as any)?.from?.pathname || '/'
      navigate(from, { replace: true })
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

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-5 sm:space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-shake">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4 sm:space-y-5">
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
                    placeholder="Seydou Kanté"
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

              {/* Type de compte */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Type de compte
                </label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`relative flex flex-col items-center p-4 border-2 rounded-xl transition-all ${
                      role === 'customer'
                        ? 'border-[#0f4c2b] bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <ShoppingBag className={`h-8 w-8 mb-2 ${
                      role === 'customer' ? 'text-[#0f4c2b]' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-semibold ${
                      role === 'customer' ? 'text-[#0f4c2b]' : 'text-gray-700'
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
                    className={`relative flex flex-col items-center p-4 border-2 rounded-xl transition-all ${
                      role === 'vendor'
                        ? 'border-[#0f4c2b] bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <Store className={`h-8 w-8 mb-2 ${
                      role === 'vendor' ? 'text-[#0f4c2b]' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-semibold ${
                      role === 'vendor' ? 'text-[#0f4c2b]' : 'text-gray-700'
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

                  {/* Description */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description *
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-0 pl-4 pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400 group-focus-within:text-[#0f4c2b] transition-colors" />
                      </div>
                      <textarea
                        value={shopDescription}
                        onChange={(e) => setShopDescription(e.target.value)}
                        required
                        rows={3}
                        className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent transition-all bg-gray-50 focus:bg-white resize-none"
                        placeholder="Décrivez votre boutique et vos produits..."
                      />
                    </div>
                  </div>

                  {/* Quartier (Adresse) */}
                  <NeighborhoodAutocomplete
                    value={shopAddress}
                    onChange={setShopAddress}
                    required
                    placeholder="Sélectionnez un quartier de Bamako"
                  />

                  {/* Téléphone */}
                  <PhoneInput
                    value={shopPhone}
                    onChange={setShopPhone}
                    required
                  />

                  {/* Email boutique (optionnel) */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email de la boutique (optionnel)
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
                    <p className="mt-1 text-xs text-gray-500">Si vide, votre email personnel sera utilisé</p>
                  </div>

                  {/* Logo */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Logo de la boutique (optionnel)
                    </label>
                    <div className="flex items-center gap-4">
                      {shopLogoPreview && (
                        <div className="flex-shrink-0">
                          <img
                            src={shopLogoPreview}
                            alt="Logo preview"
                            className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200"
                          />
                        </div>
                      )}
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#0f4c2b] transition-colors bg-gray-50 hover:bg-green-50">
                          <Upload className="h-5 w-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">
                            {shopLogo ? 'Changer le logo' : 'Télécharger un logo'}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Format: JPG, PNG (max 2MB)</p>
                  </div>
                </div>
              )}
            </div>

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

            {/* Lien connexion */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Déjà un compte ?{' '}
                <Link to="/login" className="font-semibold text-[#0f4c2b] hover:text-[#1a5f3a] transition-colors">
                  Se connecter
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
