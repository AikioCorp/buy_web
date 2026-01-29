import { useState } from 'react'
import { 
  MapPin, Phone, Mail, Clock, Send, MessageCircle,
  Facebook, Instagram, CheckCircle
} from 'lucide-react'

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simuler l'envoi du formulaire
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
  }

  const handleWhatsApp = () => {
    const message = `Bonjour Buy More, je vous contacte depuis votre site web.`
    window.open(`https://wa.me/22370796969?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0f4c2b] to-[#1a5f3a] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contactez-nous</h1>
            <p className="text-xl text-gray-200">
              Notre équipe est à votre disposition pour répondre à toutes vos questions.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Informations de contact */}
              <div className="lg:col-span-1 space-y-6">
                {/* Carte Adresse */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-[#0f4c2b]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
                      <p className="text-gray-600 text-sm">
                        Sotuba ACI près de la clinique Almed<br />
                        Bamako – Mali
                      </p>
                    </div>
                  </div>
                </div>

                {/* Carte Téléphone */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-[#0f4c2b]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Téléphone</h3>
                      <a href="tel:+22370796969" className="text-[#0f4c2b] font-medium hover:underline">
                        +223 70 79 69 69
                      </a>
                    </div>
                  </div>
                </div>

                {/* Carte Email */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-[#0f4c2b]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <a href="mailto:vente@buymore.ml" className="text-[#0f4c2b] font-medium hover:underline">
                        vente@buymore.ml
                      </a>
                    </div>
                  </div>
                </div>

                {/* Carte Horaires */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-[#0f4c2b]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Horaires</h3>
                      <p className="text-gray-600 text-sm">
                        Lun - Sam : 8h00 - 18h00<br />
                        Dimanche : Fermé
                      </p>
                    </div>
                  </div>
                </div>

                {/* Réseaux sociaux */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Suivez-nous</h3>
                  <div className="flex items-center gap-3">
                    <a 
                      href="https://www.facebook.com/people/Buy-More/61577174854756/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a 
                      href="https://www.instagram.com/buy13295/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                    <a 
                      href="https://www.tiktok.com/@buy.more5" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
                    >
                      <TikTokIcon className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl p-4 flex items-center justify-center gap-3 font-semibold transition-colors"
                >
                  <MessageCircle className="w-6 h-6" />
                  Contactez-nous sur WhatsApp
                </button>
              </div>

              {/* Formulaire de contact */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>
                  
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Message envoyé !</h3>
                      <p className="text-gray-600 mb-6">
                        Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.
                      </p>
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="text-[#0f4c2b] font-semibold hover:underline"
                      >
                        Envoyer un autre message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom complet <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder="Votre nom"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder="votre@email.com"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder="+223 XX XX XX XX"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sujet <span className="text-red-500">*</span>
                          </label>
                          <select
                            required
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                          >
                            <option value="">Sélectionner un sujet</option>
                            <option value="question">Question générale</option>
                            <option value="commande">Suivi de commande</option>
                            <option value="vendeur">Devenir vendeur</option>
                            <option value="partenariat">Partenariat</option>
                            <option value="reclamation">Réclamation</option>
                            <option value="autre">Autre</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          required
                          rows={6}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                          placeholder="Décrivez votre demande en détail..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#0f4c2b] hover:bg-[#1a5f3a] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Envoyer le message
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3830.5!2d-8.0!3d12.65!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDM5JzAwLjAiTiA4wrAwMCcwMC4wIlc!5e0!3m2!1sfr!2sml!4v1234567890"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localisation Buy More"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
