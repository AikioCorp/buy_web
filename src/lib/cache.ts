// Système de cache robuste pour BuyMore

interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface CacheConfig {
  defaultTTL: number // Time to live in milliseconds
  maxItems: number
}

const DEFAULT_CONFIG: CacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes par défaut
  maxItems: 100
}

class CacheManager {
  private cache: Map<string, CacheItem<any>> = new Map()
  private config: CacheConfig

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.loadFromStorage()
  }

  // Charger le cache depuis localStorage
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('buymore_cache')
      if (stored) {
        const parsed = JSON.parse(stored)
        const now = Date.now()
        
        // Filtrer les éléments expirés
        Object.entries(parsed).forEach(([key, item]: [string, any]) => {
          if (item.expiresAt > now) {
            this.cache.set(key, item)
          }
        })
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error)
    }
  }

  // Sauvegarder le cache dans localStorage
  private saveToStorage(): void {
    try {
      const obj: Record<string, CacheItem<any>> = {}
      this.cache.forEach((value, key) => {
        obj[key] = value
      })
      localStorage.setItem('buymore_cache', JSON.stringify(obj))
    } catch (error) {
      console.warn('Failed to save cache to storage:', error)
    }
  }

  // Obtenir un élément du cache
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    // Vérifier si l'élément a expiré
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      this.saveToStorage()
      return null
    }
    
    return item.data as T
  }

  // Définir un élément dans le cache
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const expiresAt = now + (ttl || this.config.defaultTTL)
    
    // Vérifier la limite d'éléments
    if (this.cache.size >= this.config.maxItems) {
      this.evictOldest()
    }
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    })
    
    this.saveToStorage()
  }

  // Supprimer l'élément le plus ancien
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity
    
    this.cache.forEach((item, key) => {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    })
    
    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  // Supprimer un élément du cache
  delete(key: string): void {
    this.cache.delete(key)
    this.saveToStorage()
  }

  // Vider tout le cache
  clear(): void {
    this.cache.clear()
    localStorage.removeItem('buymore_cache')
  }

  // Vérifier si une clé existe et n'est pas expirée
  has(key: string): boolean {
    return this.get(key) !== null
  }

  // Obtenir ou définir avec une fonction de récupération
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key)
    
    if (cached !== null) {
      return cached
    }
    
    const data = await fetchFn()
    this.set(key, data, ttl)
    return data
  }
}

// Instance singleton du cache
export const cache = new CacheManager()

// Clés de cache prédéfinies
export const CACHE_KEYS = {
  PRODUCTS: 'products',
  PRODUCTS_PAGE: (page: number) => `products_page_${page}`,
  PRODUCT_DETAIL: (id: number) => `product_${id}`,
  CATEGORIES: 'categories',
  SHOPS: 'shops',
  SHOPS_PAGE: (page: number) => `shops_page_${page}`,
  SHOP_DETAIL: (id: number) => `shop_${id}`,
  DEALS: 'deals',
  HOME_DATA: 'home_data',
}

// TTL personnalisés (en millisecondes)
export const CACHE_TTL = {
  SHORT: 2 * 60 * 1000,      // 2 minutes
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 heure
}
