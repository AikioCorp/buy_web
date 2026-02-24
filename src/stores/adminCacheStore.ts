import { create } from 'zustand'

/**
 * Cache store global pour les pages admin.
 * Permet le refresh silencieux : les données sont affichées immédiatement
 * depuis le cache, puis rafraîchies en arrière-plan.
 */

interface CacheSlice<T> {
    data: T[]
    totalCount: number
    timestamp: number
    filters: string  // JSON des filtres actifs pour invalider si changés
}

interface AdminCacheState {
    products: CacheSlice<any> | null
    users: CacheSlice<any> | null
    shops: CacheSlice<any> | null
    orders: CacheSlice<any> | null

    setCache: (key: 'products' | 'users' | 'shops' | 'orders', data: any[], totalCount: number, filters?: string) => void
    getCache: (key: 'products' | 'users' | 'shops' | 'orders', filters?: string) => CacheSlice<any> | null
    clearCache: (key?: 'products' | 'users' | 'shops' | 'orders') => void
    isFresh: (key: 'products' | 'users' | 'shops' | 'orders', maxAgeMs?: number) => boolean
}

const CACHE_TTL = 3 * 60 * 1000 // 3 minutes

export const useAdminCacheStore = create<AdminCacheState>((set, get) => ({
    products: null,
    users: null,
    shops: null,
    orders: null,

    setCache: (key, data, totalCount, filters = '') => {
        set({
            [key]: {
                data,
                totalCount,
                timestamp: Date.now(),
                filters,
            },
        })
    },

    getCache: (key, filters = '') => {
        const slice = get()[key]
        if (!slice) return null
        // Invalider si les filtres ont changé
        if (filters && slice.filters !== filters) return null
        return slice
    },

    clearCache: (key) => {
        if (key) {
            set({ [key]: null })
        } else {
            set({ products: null, users: null, shops: null, orders: null })
        }
    },

    isFresh: (key, maxAgeMs = CACHE_TTL) => {
        const slice = get()[key]
        if (!slice) return false
        return Date.now() - slice.timestamp < maxAgeMs
    },
}))
