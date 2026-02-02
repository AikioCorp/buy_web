import { useState, useEffect } from 'react'
import { 
  Shield, AlertTriangle, CheckCircle, XCircle, Eye, Flag,
  MessageSquare, Package, Store, User, Clock, Filter,
  ChevronLeft, ChevronRight, Loader2, RefreshCw
} from 'lucide-react'
import { moderationService, Report } from '../../../lib/api/moderationService'
import { shopsService } from '../../../lib/api/shopsService'
import { productsService } from '../../../lib/api/productsService'
import { useToast } from '../../../components/Toast'

interface ModerationItem {
  id: number
  type: 'product' | 'shop' | 'review' | 'user'
  title: string
  description: string
  reportedBy: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  date: string
  priority: 'low' | 'medium' | 'high'
}

export default function AdminModerationPage() {
  const { showToast } = useToast()
  const [items, setItems] = useState<ModerationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  useEffect(() => {
    loadModerationItems()
  }, [])

  const loadModerationItems = async () => {
    try {
      setLoading(true)
      const moderationItems: ModerationItem[] = []

      // Try to load from moderation API first
      try {
        const reportsRes = await moderationService.getReports()
        if (reportsRes.data?.results) {
          reportsRes.data.results.forEach((report: Report) => {
            moderationItems.push({
              id: report.id,
              type: report.type as ModerationItem['type'],
              title: report.target_name,
              description: report.details || report.reason,
              reportedBy: report.reported_by?.name || 'Système',
              reason: report.reason,
              status: report.status === 'resolved' ? 'approved' : report.status as ModerationItem['status'],
              date: report.created_at,
              priority: report.priority
            })
          })
        }
      } catch {
        // API might not exist yet, continue with fallback
      }

      // Fallback: Load pending shops as moderation items
      try {
        const shopsRes = await shopsService.getAllShopsAdmin({ page: 1 })
        if (shopsRes.data?.results) {
          shopsRes.data.results
            .filter((shop: any) => shop.status === 'pending' || !shop.is_active)
            .forEach((shop: any) => {
              moderationItems.push({
                id: shop.id + 10000,
                type: 'shop',
                title: shop.name,
                description: `Nouvelle boutique en attente de validation`,
                reportedBy: 'Système',
                reason: 'Nouvelle boutique',
                status: 'pending',
                date: shop.created_at || new Date().toISOString(),
                priority: 'medium'
              })
            })
        }
      } catch {
        // Ignore errors
      }

      // Fallback: Load inactive products
      try {
        const productsRes = await productsService.getAllProductsAdmin({ page: 1 })
        if (productsRes.data?.results) {
          productsRes.data.results
            .filter((product: any) => !product.is_active)
            .slice(0, 5)
            .forEach((product: any) => {
              moderationItems.push({
                id: product.id + 20000,
                type: 'product',
                title: product.name,
                description: `Produit désactivé`,
                reportedBy: 'Système',
                reason: 'Produit inactif',
                status: 'pending',
                date: product.created_at || new Date().toISOString(),
                priority: 'low'
              })
            })
        }
      } catch {
        // Ignore errors
      }

      setItems(moderationItems)
    } catch (err: any) {
      showToast('Erreur lors du chargement', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter(item => {
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter
    return matchesType && matchesStatus && matchesPriority
  })

  const getTypeIcon = (type: string) => {
    const icons = {
      product: Package,
      shop: Store,
      review: MessageSquare,
      user: User
    }
    return icons[type as keyof typeof icons] || Flag
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      product: 'Produit',
      shop: 'Boutique',
      review: 'Avis',
      user: 'Utilisateur'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-red-100 text-red-700'
    }
    return badges[priority as keyof typeof badges] || 'bg-gray-100 text-gray-700'
  }

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Haute'
    }
    return labels[priority as keyof typeof labels] || priority
  }

  const handleApprove = async (id: number) => {
    try {
      // Try API first
      if (id < 10000) {
        await moderationService.approveReport(id)
      }
      setItems(items.map(item => 
        item.id === id ? { ...item, status: 'approved' as const } : item
      ))
      showToast('Élément approuvé', 'success')
    } catch {
      // Local update only
      setItems(items.map(item => 
        item.id === id ? { ...item, status: 'approved' as const } : item
      ))
      showToast('Approuvé localement', 'success')
    }
  }

  const handleReject = async (id: number) => {
    try {
      // Try API first
      if (id < 10000) {
        await moderationService.rejectReport(id)
      }
      setItems(items.map(item => 
        item.id === id ? { ...item, status: 'rejected' as const } : item
      ))
      showToast('Élément rejeté', 'success')
    } catch {
      // Local update only
      setItems(items.map(item => 
        item.id === id ? { ...item, status: 'rejected' as const } : item
      ))
      showToast('Rejeté localement', 'success')
    }
  }

  const pendingCount = items.filter(i => i.status === 'pending').length
  const highPriorityCount = items.filter(i => i.priority === 'high' && i.status === 'pending').length

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-orange-600" />
            Modération
          </h1>
          <p className="text-gray-500 mt-1">Gérez les signalements et modérez le contenu</p>
        </div>
        <div className="flex items-center gap-3">
          {highPriorityCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">{highPriorityCount} urgent(s)</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-sm text-gray-500">En attente</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{items.filter(i => i.status === 'approved').length}</p>
              <p className="text-sm text-gray-500">Approuvés</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{items.filter(i => i.status === 'rejected').length}</p>
              <p className="text-sm text-gray-500">Rejetés</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{highPriorityCount}</p>
              <p className="text-sm text-gray-500">Priorité haute</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="product">Produits</option>
              <option value="shop">Boutiques</option>
              <option value="review">Avis</option>
              <option value="user">Utilisateurs</option>
            </select>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvés</option>
            <option value="rejected">Rejetés</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes les priorités</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Faible</option>
          </select>
        </div>
      </div>

      {/* Moderation Items */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredItems.map((item) => {
            const TypeIcon = getTypeIcon(item.type)
            return (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      item.type === 'product' ? 'bg-blue-100' :
                      item.type === 'shop' ? 'bg-purple-100' :
                      item.type === 'review' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <TypeIcon className={`w-6 h-6 ${
                        item.type === 'product' ? 'text-blue-600' :
                        item.type === 'shop' ? 'text-purple-600' :
                        item.type === 'review' ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(item.priority)}`}>
                          {getPriorityLabel(item.priority)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Flag className="w-3 h-3" />
                          {item.reason}
                        </span>
                        <span>Signalé par: {item.reportedBy}</span>
                        <span>{new Date(item.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleApprove(item.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approuver
                        </button>
                        <button 
                          onClick={() => handleReject(item.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          <XCircle className="w-4 h-4" />
                          Rejeter
                        </button>
                      </>
                    ) : (
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        item.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                      </span>
                    )}
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Affichage de {filteredItems.length} élément(s)
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium">1</span>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
