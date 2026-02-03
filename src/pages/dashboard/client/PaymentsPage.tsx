import React, { useState } from 'react'
import { CreditCard, Plus, Trash2, Check, Smartphone, Building2 } from 'lucide-react'
import { usePayments } from '../../../hooks/usePayments'
import type { CreatePaymentMethodData } from '../../../lib/api'

const PaymentsPage: React.FC = () => {
  const { paymentMethods, isLoading, createPaymentMethod, deletePaymentMethod, setDefaultPaymentMethod } = usePayments()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<CreatePaymentMethodData>({
    type: 'mobile_money',
    label: '',
    details: {},
    is_default: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createPaymentMethod(formData)
    setShowForm(false)
    resetForm()
  }

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce moyen de paiement ?')) {
      await deletePaymentMethod(id)
    }
  }

  const handleSetDefault = async (id: number) => {
    await setDefaultPaymentMethod(id)
  }

  const resetForm = () => {
    setFormData({
      type: 'mobile_money',
      label: '',
      details: {},
      is_default: false,
    })
  }

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="text-blue-600" />
      case 'mobile_money':
        return <Smartphone className="text-green-600" />
      case 'bank_transfer':
        return <Building2 className="text-purple-600" />
      default:
        return <CreditCard className="text-gray-600" />
    }
  }

  const getPaymentLabel = (type: string) => {
    switch (type) {
      case 'card':
        return 'Carte bancaire'
      case 'mobile_money':
        return 'Mobile Money'
      case 'bank_transfer':
        return 'Moov Money'
      default:
        return type
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="text-green-600" />
            Moyens de paiement
          </h1>
          <p className="text-gray-600 mt-1">Gérez vos moyens de paiement</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Ajouter
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Nouveau moyen de paiement</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de paiement *
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'mobile_money', details: {} })}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 ${
                    formData.type === 'mobile_money'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Smartphone size={24} />
                  <span className="text-sm font-medium">Mobile Money</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'card', details: {} })}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 ${
                    formData.type === 'card'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard size={24} />
                  <span className="text-sm font-medium">Carte bancaire</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'bank_transfer', details: {} })}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 ${
                    formData.type === 'bank_transfer'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Building2 size={24} />
                  <span className="text-sm font-medium">Moov Money</span>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Libellé *
              </label>
              <input
                type="text"
                required
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Mon compte Orange Money"
              />
            </div>

            {formData.type === 'mobile_money' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de téléphone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.details.phone_number || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      details: { ...formData.details, phone_number: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="+223 XX XX XX XX"
                />
              </div>
            )}

            {formData.type === 'card' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de carte *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.details.card_number || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        details: { ...formData.details, card_number: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d'expiration *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.details.card_expiry || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          details: { ...formData.details, card_expiry: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="MM/AA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.details.card_cvv || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          details: { ...formData.details, card_cvv: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="123"
                    />
                  </div>
                </div>
              </>
            )}

            {formData.type === 'bank_transfer' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la banque *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.details.bank_name || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        details: { ...formData.details, bank_name: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de compte *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.details.account_number || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        details: { ...formData.details, account_number: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </>
            )}

            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">
                  Définir comme moyen de paiement par défaut
                </span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Ajouter
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {paymentMethods.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CreditCard size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun moyen de paiement</h3>
          <p className="text-gray-600 mb-6">
            Ajoutez un moyen de paiement pour faciliter vos achats
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`bg-white rounded-lg shadow p-4 relative ${
                method.is_default ? 'border-2 border-green-500' : ''
              }`}
            >
              {method.is_default && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Check size={12} />
                  Par défaut
                </div>
              )}

              <div className="flex items-center gap-3 mb-3">
                {getPaymentIcon(method.type)}
                <div>
                  <h3 className="font-bold">{method.label}</h3>
                  <p className="text-sm text-gray-600">{getPaymentLabel(method.type)}</p>
                </div>
              </div>

              {method.type === 'mobile_money' && method.details.phone_number && (
                <p className="text-sm text-gray-600 mb-3">{method.details.phone_number}</p>
              )}

              {method.type === 'card' && method.details.card_last4 && (
                <p className="text-sm text-gray-600 mb-3">
                  •••• •••• •••• {method.details.card_last4}
                </p>
              )}

              {method.type === 'bank_transfer' && method.details.bank_name && (
                <p className="text-sm text-gray-600 mb-3">{method.details.bank_name}</p>
              )}

              <div className="flex gap-2">
                {!method.is_default && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm"
                  >
                    Définir par défaut
                  </button>
                )}
                <button
                  onClick={() => handleDelete(method.id)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PaymentsPage
