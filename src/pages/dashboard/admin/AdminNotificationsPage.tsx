import React, { useState, useEffect } from 'react'
import { 
  Bell, Send, Users, Store, ShieldCheck, Megaphone, 
  Gift, Tag, Percent, Clock, Trash2, Search,
  RefreshCw, Loader2, CheckCircle, X, Sparkles,
  Target, Globe, UserCheck, TrendingUp
} from 'lucide-react'
import { useToast } from '../../../components/Toast'
import { notificationsService, Notification, SendNotificationData } from '../../../lib/api/notificationsService'
import { usersService } from '../../../lib/api/usersService'

type TargetAudience = 'all' | 'clients' | 'sellers' | 'admins'
type NotificationType = 'info' | 'promotion' | 'system'

interface NotificationTemplate {
  id: string
  name: string
  icon: React.ReactNode
  title: string
  content: string
  type: NotificationType
  targetAudience: TargetAudience
  color: string
}

const TEMPLATES: NotificationTemplate[] = [
  {
    id: 'promo_general',
    name: 'Promotion Générale',
    icon: <Percent size={20} />,
    title: '🎉 Offre Spéciale !',
    content: 'Profitez de -20% sur tout le site avec le code PROMO20 ! Offre valable jusqu\'au [DATE].',
    type: 'promotion',
    targetAudience: 'all',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'new_products',
    name: 'Nouveaux Produits',
    icon: <Sparkles size={20} />,
    title: '✨ Nouveautés disponibles !',
    content: 'Découvrez notre nouvelle collection ! Des produits exclusifs vous attendent.',
    type: 'info',
    targetAudience: 'clients',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'flash_sale',
    name: 'Vente Flash',
    icon: <TrendingUp size={20} />,
    title: '⚡ Vente Flash - 24h seulement !',
    content: 'Ne ratez pas nos offres exceptionnelles ! Jusqu\'à -50% sur une sélection de produits.',
    type: 'promotion',
    targetAudience: 'all',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'loyalty_reward',
    name: 'Récompense Fidélité',
    icon: <Gift size={20} />,
    title: '🎁 Un cadeau vous attend !',
    content: 'Merci pour votre fidélité ! Bénéficiez d\'une livraison gratuite sur votre prochaine commande.',
    type: 'promotion',
    targetAudience: 'clients',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'seller_update',
    name: 'Info Vendeurs',
    icon: <Store size={20} />,
    title: '📢 Information importante pour les vendeurs',
    content: 'Nouvelles fonctionnalités disponibles dans votre tableau de bord. Consultez vos statistiques améliorées !',
    type: 'system',
    targetAudience: 'sellers',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'system_maintenance',
    name: 'Maintenance',
    icon: <Clock size={20} />,
    title: '🔧 Maintenance programmée',
    content: 'Une maintenance est prévue le [DATE] de [HEURE] à [HEURE]. Le site sera temporairement indisponible.',
    type: 'system',
    targetAudience: 'all',
    color: 'from-gray-500 to-gray-700'
  }
]

const AdminNotificationsPage: React.FC = () => {
  const { showToast } = useToast()
  
  // State
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [currentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  // Compose state
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [formData, setFormData] = useState<SendNotificationData & { targetAudience: TargetAudience }>({
    title: '',
    content: '',
    type: 'info',
    link: '',
    targetAudience: 'all'
  })

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    clients: 0,
    sellers: 0,
    admins: 0
  })

  useEffect(() => {
    loadNotifications()
    loadUserStats()
  }, [currentPage, filterType])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationsService.getAllNotifications(currentPage, 20, filterType !== 'all' ? filterType : undefined)
      if (response.data) {
        setNotifications(response.data.results || [])
        setTotalCount(response.data.count || 0)
      }
    } catch (err: any) {
      console.error('Error loading notifications:', err)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const loadUserStats = async () => {
    try {
      const response = await usersService.getAllUsers(1, 1000)
      if (response.data?.results) {
        const users = response.data.results
        setStats({
          totalUsers: users.length,
          clients: users.filter((u: any) => !u.is_seller && !u.is_staff && !u.is_superuser).length,
          sellers: users.filter((u: any) => u.is_seller).length,
          admins: users.filter((u: any) => u.is_staff || u.is_superuser).length
        })
      }
    } catch (err) {
      console.error('Error loading user stats:', err)
    }
  }

  const handleSelectTemplate = (template: NotificationTemplate) => {
    setFormData({
      title: template.title,
      content: template.content,
      type: template.type,
      link: '',
      targetAudience: template.targetAudience
    })
  }

  const handleSendNotification = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('Veuillez remplir le titre et le contenu', 'error')
      return
    }

    try {
      setSending(true)
      const data: SendNotificationData = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        link: formData.link || undefined
      }

      if (formData.targetAudience === 'all') {
        await notificationsService.sendToAll(data)
      } else {
        await notificationsService.sendToUserType(formData.targetAudience, data)
      }

      showToast('Notification envoyée avec succès !', 'success')
      setIsComposeOpen(false)
      setFormData({ title: '', content: '', type: 'info', link: '', targetAudience: 'all' })
      loadNotifications()
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l\'envoi', 'error')
    } finally {
      setSending(false)
    }
  }

  const handleDeleteNotification = async (id: number) => {
    if (!window.confirm('Supprimer cette notification ?')) return
    try {
      await notificationsService.deleteNotificationAdmin(id)
      showToast('Notification supprimée', 'success')
      loadNotifications()
    } catch (err: any) {
      showToast(err.message || 'Erreur', 'error')
    }
  }

  const getAudienceLabel = (target: TargetAudience) => {
    switch (target) {
      case 'all': return { label: 'Tous les utilisateurs', icon: Globe, count: stats.totalUsers, color: 'text-purple-600 bg-purple-50' }
      case 'clients': return { label: 'Clients', icon: Users, count: stats.clients, color: 'text-blue-600 bg-blue-50' }
      case 'sellers': return { label: 'Vendeurs', icon: Store, count: stats.sellers, color: 'text-green-600 bg-green-50' }
      case 'admins': return { label: 'Administrateurs', icon: ShieldCheck, count: stats.admins, color: 'text-red-600 bg-red-50' }
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'promotion': return { icon: Tag, color: 'text-orange-500 bg-orange-50' }
      case 'system': return { icon: Bell, color: 'text-gray-500 bg-gray-50' }
      case 'order': return { icon: CheckCircle, color: 'text-green-500 bg-green-50' }
      default: return { icon: Bell, color: 'text-blue-500 bg-blue-50' }
    }
  }

  const filteredNotifications = notifications.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Megaphone className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Centre de Notifications</h1>
              <p className="text-white/80 mt-1">Communiquez avec vos utilisateurs</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => setIsComposeOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg"
            >
              <Send size={18} />
              Nouvelle notification
            </button>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
              <span className="font-medium">{stats.totalUsers} utilisateurs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Utilisateurs', value: stats.totalUsers, icon: Users, color: 'from-indigo-500 to-purple-500' },
          { label: 'Clients', value: stats.clients, icon: UserCheck, color: 'from-blue-500 to-cyan-500' },
          { label: 'Vendeurs', value: stats.sellers, icon: Store, color: 'from-green-500 to-emerald-500' },
          { label: 'Admins', value: stats.admins, icon: ShieldCheck, color: 'from-orange-500 to-red-500' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Templates */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target size={20} className="text-indigo-500" />
          Templates rapides
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => { handleSelectTemplate(template); setIsComposeOpen(true) }}
              className="group flex items-center gap-3 p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all text-left"
            >
              <div className={`p-2.5 rounded-lg bg-gradient-to-br ${template.color} text-white group-hover:scale-110 transition-transform`}>
                {template.icon}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{template.name}</p>
                <p className="text-xs text-gray-500">{getAudienceLabel(template.targetAudience).label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une notification..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">Tous les types</option>
            <option value="promotion">Promotions</option>
            <option value="system">Système</option>
            <option value="info">Informations</option>
          </select>
          <button 
            onClick={loadNotifications}
            className="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span className="font-medium">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Historique des notifications</h2>
          <span className="text-sm text-gray-500">{totalCount} notifications</span>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune notification</h3>
            <p className="text-gray-500">Commencez par envoyer votre première notification</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notif) => {
              const typeInfo = getTypeIcon(notif.type)
              const TypeIcon = typeInfo.icon
              return (
                <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl ${typeInfo.color}`}>
                      <TypeIcon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                          {notif.type}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">{notif.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteNotification(notif.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Send size={24} />
                  <div>
                    <h2 className="text-xl font-bold">Nouvelle notification</h2>
                    <p className="text-white/80 text-sm">Envoyez un message à vos utilisateurs</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsComposeOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-5">
              {/* Audience Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Audience cible</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['all', 'clients', 'sellers', 'admins'] as TargetAudience[]).map((audience) => {
                    const info = getAudienceLabel(audience)
                    const Icon = info.icon
                    return (
                      <button
                        key={audience}
                        onClick={() => setFormData({ ...formData, targetAudience: audience })}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          formData.targetAudience === audience
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${info.color}`}>
                          <Icon size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900">{info.label}</p>
                          <p className="text-xs text-gray-500">{info.count} utilisateurs</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Notification Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type de notification</label>
                <div className="flex gap-2">
                  {[
                    { value: 'info', label: 'Information', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                    { value: 'promotion', label: 'Promotion', color: 'bg-orange-100 text-orange-700 border-orange-200' },
                    { value: 'system', label: 'Système', color: 'bg-gray-100 text-gray-700 border-gray-200' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, type: type.value as NotificationType })}
                      className={`px-4 py-2 rounded-lg font-medium border transition-all ${
                        formData.type === type.value
                          ? type.color + ' ring-2 ring-offset-2 ring-indigo-300'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Titre</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: 🎉 Offre spéciale !"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Écrivez votre message ici..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all resize-none"
                />
              </div>

              {/* Link (optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lien (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="Ex: /products ou /promotions"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                />
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Aperçu</p>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                      <Bell size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{formData.title || 'Titre de la notification'}</p>
                      <p className="text-sm text-gray-600 mt-1">{formData.content || 'Contenu du message...'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <p className="text-sm text-gray-500">
                <span className="font-medium text-indigo-600">{getAudienceLabel(formData.targetAudience).count}</span> utilisateurs recevront cette notification
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsComposeOpen(false)}
                  className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                  disabled={sending}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSendNotification}
                  disabled={sending || !formData.title.trim() || !formData.content.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {sending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Envoyer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminNotificationsPage
