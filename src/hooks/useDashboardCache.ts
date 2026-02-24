import { useCallback, useEffect } from 'react'
import { useDashboardStore } from '../stores/dashboardStore'
import { usersService } from '../lib/api/usersService'
import { ordersService } from '../lib/api/ordersService'
import { shopsService } from '../lib/api/shopsService'
import { productsService } from '../lib/api/productsService'

/**
 * Hook optimisé pour charger et cacher les données du dashboard Admin & SuperAdmin.
 * 
 * Stratégie de récupération :
 * - 5 requêtes parallèles (Promise.allSettled) pour une rapidité maximale
 * - Requête séparée pour les commandes "pending" afin d'avoir le count exact
 * - page_size par défaut (pas de page_size=1 car l'API renvoie count = results.length)
 * - Cache via Zustand store avec TTL de staleness
 * - Logs détaillés en dev pour le debugging
 */
export const useDashboardCache = () => {
  const {
    data,
    loading,
    error,
    setData,
    setLoading,
    setError,
    clearCache,
    isDataStale,
    updateStats,
    updateRecentOrders
  } = useDashboardStore()

  /**
   * Extraire les données d'une réponse API normalisée
   */
  const extractData = (res: any) => {
    if (!res?.data) return { list: [], count: 0 }
    const raw = res.data
    // L'API peut renvoyer {data: {results, count}} ou {results, count} ou un Array
    const inner = raw?.data || raw
    if (Array.isArray(inner)) {
      return { list: inner, count: inner.length }
    }
    const list = inner.results || []
    // Utiliser count de l'API, mais si count === list.length ET list est plein,
    // c'est probablement un count par page, pas le total global
    const count = inner.count || list.length
    return { list, count }
  }

  // Charger les données du dashboard
  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && data && !isDataStale()) {
      if (import.meta.env.DEV) console.log('📦 Utilisation du cache dashboard')
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (import.meta.env.DEV) console.log('🔄 Chargement des données dashboard...')

      // 5 requêtes parallèles — aucune n'attend les autres
      const [usersRes, ordersRes, pendingRes, shopsRes, productsRes] = await Promise.allSettled([
        usersService.getAllUsers(1, 50),                              // 50 users pour compter les vendeurs
        ordersService.getAllOrdersAdmin({ page: 1 }),                 // Commandes récentes + count total
        ordersService.getAllOrdersAdmin({ page: 1, status: 'pending' as any }), // Count exact des pending
        shopsService.getAllShopsAdmin({ page: 1 }),                   // Boutiques + count
        productsService.getAllProductsAdmin({ page: 1 }),             // Produits (page_size défaut)
      ])

      let totalUsers = 0, totalOrders = 0, totalShops = 0, totalProducts = 0
      let totalRevenue = 0, pendingOrders = 0, activeVendors = 0
      let recentOrders: any[] = []

      // ── Users ──
      if (usersRes.status === 'fulfilled') {
        const { list, count } = extractData(usersRes.value)
        totalUsers = count
        activeVendors = list.filter((u: any) => u.is_seller && u.is_active !== false).length
        if (import.meta.env.DEV) console.log(`👥 Users: ${totalUsers} total, ${activeVendors} vendeurs (sur ${list.length} chargés)`)
      }

      // ── Orders (toutes) ──
      if (ordersRes.status === 'fulfilled') {
        const { list, count } = extractData(ordersRes.value)
        totalOrders = count
        totalRevenue = list.reduce((sum: number, o: any) => {
          const amt = parseFloat(o.total_amount || '0')
          return sum + (isNaN(amt) ? 0 : amt)
        }, 0)
        recentOrders = list.slice(0, 10)
        if (import.meta.env.DEV) console.log(`🛒 Orders: ${totalOrders} total, revenu=${totalRevenue} (${list.length} chargées)`)
      }

      // ── Commandes en attente ──
      if (pendingRes.status === 'fulfilled') {
        const { list, count } = extractData(pendingRes.value)
        pendingOrders = count > 0 ? count : list.length
        if (import.meta.env.DEV) console.log(`⏳ Pending: ${pendingOrders}`)
      }

      // ── Shops ──
      if (shopsRes.status === 'fulfilled') {
        const { count } = extractData(shopsRes.value)
        totalShops = count
        if (import.meta.env.DEV) console.log(`🏪 Shops: ${totalShops}`)
      }

      // ── Products ──
      if (productsRes.status === 'fulfilled') {
        const { count } = extractData(productsRes.value)
        totalProducts = count
        if (import.meta.env.DEV) console.log(`📦 Products: ${totalProducts}`)
      }

      setData({
        stats: { totalUsers, totalOrders, totalShops, totalProducts, totalRevenue, pendingOrders, activeVendors },
        recentOrders
      })

      if (import.meta.env.DEV) console.log('✅ Dashboard chargé', { totalUsers, totalOrders, totalShops, totalProducts, totalRevenue, pendingOrders })
    } catch (err) {
      console.error('❌ Erreur chargement dashboard:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }, [data, isDataStale, setData, setLoading, setError])

  // Rafraîchissement rapide (sans afficher le loading)
  const refreshStats = useCallback(async () => {
    try {
      if (import.meta.env.DEV) console.log('🔄 Refresh rapide...')

      const [usersRes, ordersRes, pendingRes, shopsRes, productsRes] = await Promise.allSettled([
        usersService.getAllUsers(1, 50),
        ordersService.getAllOrdersAdmin({ page: 1 }),
        ordersService.getAllOrdersAdmin({ page: 1, status: 'pending' as any }),
        shopsService.getAllShopsAdmin({ page: 1 }),
        productsService.getAllProductsAdmin({ page: 1 }),
      ])

      const newStats: any = {}

      if (usersRes.status === 'fulfilled') {
        const { list, count } = extractData(usersRes.value)
        newStats.totalUsers = count
        newStats.activeVendors = list.filter((u: any) => u.is_seller && u.is_active !== false).length
      }
      if (ordersRes.status === 'fulfilled') {
        const { list, count } = extractData(ordersRes.value)
        newStats.totalOrders = count
        newStats.totalRevenue = list.reduce((s: number, o: any) => {
          const amt = parseFloat(o.total_amount || '0')
          return s + (isNaN(amt) ? 0 : amt)
        }, 0)
        if (list.length > 0) updateRecentOrders(list.slice(0, 10))
      }
      if (pendingRes.status === 'fulfilled') {
        const { list, count } = extractData(pendingRes.value)
        newStats.pendingOrders = count > 0 ? count : list.length
      }
      if (shopsRes.status === 'fulfilled') {
        const { count } = extractData(shopsRes.value)
        newStats.totalShops = count
      }
      if (productsRes.status === 'fulfilled') {
        const { count } = extractData(productsRes.value)
        newStats.totalProducts = count
      }

      updateStats(newStats)
      if (import.meta.env.DEV) console.log('✅ Stats rafraîchies:', newStats)
    } catch (err) {
      console.error('❌ Erreur refresh stats:', err)
    }
  }, [updateStats, updateRecentOrders])

  // Chargement auto au montage
  useEffect(() => {
    if (!data || isDataStale()) {
      loadDashboardData()
    }
  }, [])

  return {
    data,
    loading,
    error,
    loadDashboardData,
    refreshStats,
    clearCache,
    isDataStale: isDataStale()
  }
}
