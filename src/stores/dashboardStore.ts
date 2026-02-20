import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DashboardStats {
  totalUsers: number
  totalOrders: number
  totalShops: number
  totalProducts: number
  totalRevenue: number
  pendingOrders: number
  activeVendors: number
}

interface DashboardData {
  stats: DashboardStats
  recentOrders: any[]
  lastUpdated: number
  isStale: boolean
}

interface DashboardStore {
  data: DashboardData | null
  loading: boolean
  error: string | null
  
  // Actions
  setData: (data: Partial<DashboardData>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearCache: () => void
  isDataStale: () => boolean
  updateStats: (stats: Partial<DashboardStats>) => void
  updateRecentOrders: (orders: any[]) => void
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      data: null,
      loading: false,
      error: null,

      setData: (newData) => set((state) => ({
        data: {
          stats: newData.stats || state.data?.stats || {
            totalUsers: 0,
            totalOrders: 0,
            totalShops: 0,
            totalProducts: 0,
            totalRevenue: 0,
            pendingOrders: 0,
            activeVendors: 0
          },
          recentOrders: newData.recentOrders || state.data?.recentOrders || [],
          lastUpdated: Date.now(),
          isStale: false
        }
      })),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      clearCache: () => set({ data: null, error: null }),

      isDataStale: () => {
        const { data } = get()
        if (!data) return true
        return Date.now() - data.lastUpdated > CACHE_DURATION
      },

      updateStats: (newStats) => set((state) => {
        if (!state.data) return state
        return {
          data: {
            ...state.data,
            stats: { ...state.data.stats, ...newStats },
            lastUpdated: Date.now(),
            isStale: false
          }
        }
      }),

      updateRecentOrders: (orders) => set((state) => {
        if (!state.data) return state
        return {
          data: {
            ...state.data,
            recentOrders: orders,
            lastUpdated: Date.now(),
            isStale: false
          }
        }
      })
    }),
    {
      name: 'dashboard-cache',
      partialize: (state) => ({
        data: state.data
      })
    }
  )
)
