import { useCallback, useEffect } from 'react'
import { useDashboardStore } from '../stores/dashboardStore'
import { usersService } from '../lib/api/usersService'
import { ordersService } from '../lib/api/ordersService'
import { shopsService } from '../lib/api/shopsService'
import { productsService } from '../lib/api/productsService'

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

  // Charger les données du dashboard
  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    // Si les données sont en cache et pas obsolètes, ne pas recharger
    if (!forceRefresh && data && !isDataStale()) {
      console.log('📦 Utilisation du cache dashboard')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Chargement des données dashboard...')
      
      const [usersRes, ordersRes, shopsRes, productsRes] = await Promise.allSettled([
        usersService.getAllUsers(1, 1),
        ordersService.getAllOrdersAdmin({ page: 1 }),
        shopsService.getAllShopsAdmin({ page: 1 }),
        productsService.getAllProductsAdmin({ page: 1 })
      ])

      let totalUsers = 0
      let totalOrders = 0
      let totalShops = 0
      let totalProducts = 0
      let totalRevenue = 0
      let pendingOrders = 0
      let activeVendors = 0
      let recentOrders: any[] = []

      if (usersRes.status === 'fulfilled' && usersRes.value.data) {
        totalUsers = usersRes.value.data.count || 0
        if (usersRes.value.data.results) {
          activeVendors = usersRes.value.data.results.filter((u: any) => u.is_seller && u.is_active).length
        }
      }

      if (ordersRes.status === 'fulfilled' && ordersRes.value.data) {
        const ordersData = ordersRes.value.data
        totalOrders = ordersData.count || 0
        if (ordersData.results) {
          totalRevenue = ordersData.results.reduce((sum: number, order: any) => 
            sum + parseFloat(order.total_amount || '0'), 0
          )
          pendingOrders = ordersData.results.filter((o: any) => o.status === 'pending').length
          recentOrders = ordersData.results.slice(0, 5)
        }
      }

      if (shopsRes.status === 'fulfilled' && shopsRes.value.data) {
        const shopsData = shopsRes.value.data
        totalShops = shopsData.count || (Array.isArray(shopsData) ? shopsData.length : 0)
      }

      if (productsRes.status === 'fulfilled' && productsRes.value.data) {
        totalProducts = productsRes.value.data.count || 0
      }

      setData({
        stats: {
          totalUsers,
          totalOrders,
          totalShops,
          totalProducts,
          totalRevenue,
          pendingOrders,
          activeVendors
        },
        recentOrders
      })

      console.log('✅ Données dashboard chargées et mises en cache')
    } catch (err) {
      console.error('❌ Erreur chargement dashboard:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }, [data, isDataStale, setData, setLoading, setError])

  // Rafraîchir uniquement les statistiques (plus rapide)
  const refreshStats = useCallback(async () => {
    try {
      console.log('🔄 Rafraîchissement rapide des stats...')
      
      const [usersRes, ordersRes, shopsRes, productsRes] = await Promise.allSettled([
        usersService.getAllUsers(1, 1),
        ordersService.getAllOrdersAdmin({ page: 1 }),
        shopsService.getAllShopsAdmin({ page: 1 }),
        productsService.getAllProductsAdmin({ page: 1 })
      ])

      const newStats: any = {}

      if (usersRes.status === 'fulfilled' && usersRes.value.data) {
        newStats.totalUsers = usersRes.value.data.count || 0
        if (usersRes.value.data.results) {
          newStats.activeVendors = usersRes.value.data.results.filter((u: any) => u.is_seller && u.is_active).length
        }
      }

      if (ordersRes.status === 'fulfilled' && ordersRes.value.data) {
        const ordersData = ordersRes.value.data
        newStats.totalOrders = ordersData.count || 0
        if (ordersData.results) {
          newStats.totalRevenue = ordersData.results.reduce((sum: number, order: any) => 
            sum + parseFloat(order.total_amount || '0'), 0
          )
          newStats.pendingOrders = ordersData.results.filter((o: any) => o.status === 'pending').length
        }
      }

      if (shopsRes.status === 'fulfilled' && shopsRes.value.data) {
        const shopsData = shopsRes.value.data
        newStats.totalShops = shopsData.count || (Array.isArray(shopsData) ? shopsData.length : 0)
      }

      if (productsRes.status === 'fulfilled' && productsRes.value.data) {
        newStats.totalProducts = productsRes.value.data.count || 0
      }

      updateStats(newStats)
      console.log('✅ Stats rafraîchies')
    } catch (err) {
      console.error('❌ Erreur rafraîchissement stats:', err)
    }
  }, [updateStats])

  // Charger automatiquement au montage si nécessaire
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
