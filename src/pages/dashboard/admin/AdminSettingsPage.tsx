import { useState } from 'react'
import { 
  Settings, Globe, Bell, Mail, CreditCard, Truck,
  Save, RefreshCw, AlertCircle, CheckCircle
} from 'lucide-react'

interface SettingSection {
  title: string
  icon: React.ElementType
  settings: {
    name: string
    type: 'text' | 'select' | 'toggle' | 'number'
    value: string | boolean | number
    options?: string[]
    description?: string
  }[]
}

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false)
  const [sections, setSections] = useState<SettingSection[]>([
    {
      title: 'Paramètres généraux',
      icon: Globe,
      settings: [
        { name: 'Nom du site', type: 'text', value: 'BuyMore', description: 'Nom affiché sur le site' },
        { name: 'Email de contact', type: 'text', value: 'contact@buymore.ml', description: 'Email principal de contact' },
        { name: 'Devise', type: 'select', value: 'FCFA', options: ['FCFA', 'EUR', 'USD'] },
        { name: 'Langue par défaut', type: 'select', value: 'Français', options: ['Français', 'English', 'Bambara'] },
        { name: 'Mode maintenance', type: 'toggle', value: false, description: 'Activer le mode maintenance' }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        { name: 'Notifications email', type: 'toggle', value: true, description: 'Envoyer des notifications par email' },
        { name: 'Notifications push', type: 'toggle', value: true, description: 'Activer les notifications push' },
        { name: 'Résumé quotidien', type: 'toggle', value: false, description: 'Envoyer un résumé quotidien aux admins' },
        { name: 'Alertes de sécurité', type: 'toggle', value: true, description: 'Recevoir les alertes de sécurité' }
      ]
    },
    {
      title: 'Paiements',
      icon: CreditCard,
      settings: [
        { name: 'Commission plateforme (%)', type: 'number', value: 5, description: 'Commission prélevée sur chaque vente' },
        { name: 'Montant minimum commande', type: 'number', value: 1000, description: 'Montant minimum pour passer commande (FCFA)' },
        { name: 'Wave', type: 'toggle', value: true, description: 'Activer les paiements Wave' },
        { name: 'Orange Money', type: 'toggle', value: true, description: 'Activer les paiements Orange Money' },
        { name: 'Moov Money', type: 'toggle', value: true, description: 'Activer les paiements Moov Money' }
      ]
    },
    {
      title: 'Livraison',
      icon: Truck,
      settings: [
        { name: 'Frais de livraison Bamako', type: 'number', value: 1000, description: 'Frais de livraison dans Bamako (FCFA)' },
        { name: 'Frais de livraison hors Bamako', type: 'number', value: 2500, description: 'Frais de livraison hors Bamako (FCFA)' },
        { name: 'Livraison gratuite à partir de', type: 'number', value: 50000, description: 'Montant pour livraison gratuite (FCFA)' },
        { name: 'Délai de livraison estimé', type: 'select', value: '24-48h', options: ['24h', '24-48h', '48-72h', '3-5 jours'] }
      ]
    }
  ])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const updateSetting = (sectionIndex: number, settingIndex: number, value: string | boolean | number) => {
    const newSections = [...sections]
    newSections[sectionIndex].settings[settingIndex].value = value
    setSections(newSections)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-7 h-7 text-gray-600" />
            Paramètres
          </h1>
          <p className="text-gray-500 mt-1">Configurez les paramètres de la plateforme</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Réinitialiser
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Enregistrer
          </button>
        </div>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-700 font-medium">Paramètres enregistrés avec succès !</p>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
              <section.icon className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">{section.title}</h3>
            </div>
            <div className="p-6 space-y-6">
              {section.settings.map((setting, settingIndex) => (
                <div key={settingIndex} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{setting.name}</p>
                    {setting.description && (
                      <p className="text-sm text-gray-500">{setting.description}</p>
                    )}
                  </div>
                  <div className="w-full md:w-64">
                    {setting.type === 'text' && (
                      <input
                        type="text"
                        value={setting.value as string}
                        onChange={(e) => updateSetting(sectionIndex, settingIndex, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                    {setting.type === 'number' && (
                      <input
                        type="number"
                        value={setting.value as number}
                        onChange={(e) => updateSetting(sectionIndex, settingIndex, parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                    {setting.type === 'select' && (
                      <select
                        value={setting.value as string}
                        onChange={(e) => updateSetting(sectionIndex, settingIndex, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {setting.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    )}
                    {setting.type === 'toggle' && (
                      <button
                        onClick={() => updateSetting(sectionIndex, settingIndex, !setting.value)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          setting.value ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          setting.value ? 'left-7' : 'left-1'
                        }`}></span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Warning */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-yellow-800">Attention</p>
          <p className="text-sm text-yellow-700">
            Certains paramètres peuvent affecter le fonctionnement de la plateforme. 
            Assurez-vous de bien comprendre l'impact de vos modifications avant de les enregistrer.
          </p>
        </div>
      </div>
    </div>
  )
}
