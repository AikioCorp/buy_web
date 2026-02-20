import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Send, CheckCircle, Lock, Shield, ArrowRight, Sparkles } from 'lucide-react'
import { useToast } from '@/components/Toast'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      showToast('Veuillez entrer votre adresse email', 'error')
      return
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      showToast('Veuillez entrer une adresse email valide', 'error')
      return
    }

    try {
      setLoading(true)

      // Appeler l'API Supabase pour envoyer l'email de réinitialisation
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      )

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      setEmailSent(true)
      showToast('Email de réinitialisation envoyé!', 'success')

    } catch (error: any) {
      console.error('Error sending reset email:', error)
      showToast(
        error.message || 'Erreur lors de l\'envoi de l\'email',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-lg text-center animate-fade-in border border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Email envoyé !</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Nous avons envoyé un lien de réinitialisation à <strong className="text-[#0f4c2b]">{email}</strong>.
            Vérifiez votre boîte de réception et suivez les instructions.
          </p>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8 text-left">
            <div className="flex items-start gap-3 mb-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-900 font-semibold">
                Vous ne voyez pas l'email ?
              </p>
            </div>
            <ul className="text-sm text-blue-700 space-y-2 ml-8">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                Vérifiez votre dossier spam/courrier indésirable
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                Attendez quelques minutes (l'email peut prendre du temps)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                Vérifiez que l'adresse email est correcte
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-[#0f4c2b] to-[#1a5f3a] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Retour à la connexion
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => {
                setEmailSent(false)
                setEmail('')
              }}
              className="w-full px-6 py-3.5 text-[#0f4c2b] font-semibold hover:bg-green-50 rounded-xl transition-all duration-300 border-2 border-transparent hover:border-[#0f4c2b]"
            >
              Renvoyer l'email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-lg animate-fade-in border border-gray-100">
        {/* Icon & Title */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center shadow-lg">
              <Lock className="w-10 h-10 text-[#0f4c2b]" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-yellow-900" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Mot de passe oublié ?
          </h1>
          <p className="text-gray-600 text-lg">
            Pas de souci ! Entrez votre email et nous vous enverrons un lien de réinitialisation
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Adresse email
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0f4c2b] transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-100 focus:border-[#0f4c2b] transition-all text-gray-900 placeholder:text-gray-400"
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full px-6 py-4 bg-gradient-to-r from-[#0f4c2b] to-[#1a5f3a] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>Envoyer le lien de réinitialisation</span>
              </>
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-[#0f4c2b] hover:text-[#1a5f3a] font-semibold transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Retour à la connexion
          </Link>
        </div>

        {/* Security Note */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-start gap-3 text-sm text-gray-500">
            <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-gray-700">Sécurisé et confidentiel.</strong> Nous ne partageons jamais vos informations personnelles.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
