import React, { useState } from 'react'
import { 
  HelpCircle, Book, MessageCircle, Mail, Phone, ChevronRight,
  Search, ExternalLink, FileText, Video, Users, Zap
} from 'lucide-react'

const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const faqs = [
    {
      question: "Comment ajouter un produit ?",
      answer: "Allez dans 'Produits' depuis le menu, puis cliquez sur 'Ajouter un produit'. Remplissez les informations requises et ajoutez des photos de qualité."
    },
    {
      question: "Comment recevoir mes paiements ?",
      answer: "Configurez vos méthodes de paiement dans 'Revenus'. Vous pouvez ajouter Orange Money, Wave ou un compte bancaire pour recevoir vos gains."
    },
    {
      question: "Comment gérer mes commandes ?",
      answer: "Toutes vos commandes apparaissent dans la section 'Commandes'. Vous pouvez les traiter, les expédier et suivre leur statut."
    },
    {
      question: "Comment modifier ma boutique ?",
      answer: "Allez dans 'Ma Boutique' pour modifier le nom, la description, le logo et les coordonnées de votre boutique."
    },
    {
      question: "Quels sont les frais de la plateforme ?",
      answer: "BuyMore prélève une commission de 5% sur chaque vente. Il n'y a pas de frais d'inscription ni d'abonnement mensuel."
    },
  ]

  const resources = [
    {
      icon: <Book size={24} className="text-blue-600" />,
      title: "Guide du vendeur",
      description: "Apprenez les bases pour réussir sur BuyMore",
      color: "bg-blue-100"
    },
    {
      icon: <Video size={24} className="text-purple-600" />,
      title: "Tutoriels vidéo",
      description: "Des vidéos pour maîtriser toutes les fonctionnalités",
      color: "bg-purple-100"
    },
    {
      icon: <FileText size={24} className="text-emerald-600" />,
      title: "Documentation",
      description: "Documentation complète de la plateforme",
      color: "bg-emerald-100"
    },
    {
      icon: <Users size={24} className="text-orange-600" />,
      title: "Communauté",
      description: "Rejoignez notre communauté de vendeurs",
      color: "bg-orange-100"
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <HelpCircle size={32} className="text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Centre d'aide</h1>
        <p className="text-gray-500 mt-2">Comment pouvons-nous vous aider ?</p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher dans l'aide..."
          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
        />
      </div>

      {/* Quick Resources */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {resources.map((resource, index) => (
          <div 
            key={index}
            className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className={`w-12 h-12 rounded-xl ${resource.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              {resource.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{resource.title}</h3>
            <p className="text-sm text-gray-500">{resource.description}</p>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-2xl border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Questions fréquentes</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {faqs.map((faq, index) => (
            <details key={index} className="group">
              <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                <span className="font-medium text-gray-900">{faq.question}</span>
                <ChevronRight size={20} className="text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Besoin d'aide supplémentaire ?</h2>
            <p className="text-emerald-100">Notre équipe support est disponible 7j/7 pour vous aider</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a 
              href="mailto:support@buymore.ml"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-emerald-700 rounded-xl font-medium hover:bg-emerald-50 transition-colors"
            >
              <Mail size={18} />
              Envoyer un email
            </a>
            <a 
              href="tel:+22300000000"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors"
            >
              <Phone size={18} />
              +223 00 00 00 00
            </a>
          </div>
        </div>
      </div>

      {/* Live Chat Button */}
      <div className="fixed bottom-6 right-6">
        <button className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors">
          <MessageCircle size={20} />
          <span className="font-medium">Chat en direct</span>
        </button>
      </div>
    </div>
  )
}

export default HelpPage
