import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/lib/api/productsService'
import { favoritesService } from '@/lib/api/favoritesService'
import { apiClient } from '@/lib/api/apiClient'
import { useAuthStore } from '@/stores/authStore'

interface FavoritesState {
  favorites: Product[]
  favoriteIdsByProductId: Record<number, number>
  addFavorite: (product: Product) => void
  removeFavorite: (productId: number) => void
  toggleFavorite: (product: Product) => boolean
  isFavorite: (productId: number) => boolean
  getFavoritesCount: () => number
  clearFavorites: () => void
  syncWithBackend: (force?: boolean) => Promise<void>
}

const normalizeFavorites = (favorites: Product[]) => {
  const seen = new Set<number>()
  return favorites.filter((product) => {
    if (!product || typeof product.id !== 'number' || seen.has(product.id)) {
      return false
    }
    seen.add(product.id)
    return true
  })
}

const isAuthenticated = () =>
  Boolean(apiClient.getToken()) && useAuthStore.getState().isAuthenticated

const isDuplicateFavoriteError = (error?: string) =>
  Boolean(error && error.toLowerCase().includes('already'))

let syncPromise: Promise<void> | null = null

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      favoriteIdsByProductId: {},

      addFavorite: (product: Product) => {
        const { favorites } = get()
        if (!favorites.find(p => p.id === product.id)) {
          set({ favorites: normalizeFavorites([...favorites, product]) })
        }

        if (!isAuthenticated()) {
          return
        }

        void (async () => {
          const response = await favoritesService.addFavorite(product.id)
          if (response.error && !isDuplicateFavoriteError(response.error)) {
            set({ favorites: get().favorites.filter((item) => item.id !== product.id) })
            return
          }
          await get().syncWithBackend(true)
        })()
      },

      removeFavorite: (productId: number) => {
        const previousFavoriteIds = { ...get().favoriteIdsByProductId }
        set({
          favorites: get().favorites.filter(p => p.id !== productId),
          favoriteIdsByProductId: Object.fromEntries(
            Object.entries(previousFavoriteIds).filter(([id]) => Number(id) !== productId)
          ),
        })

        if (!isAuthenticated()) {
          return
        }

        void (async () => {
          let favoriteId = previousFavoriteIds[productId]

          if (!favoriteId) {
            await get().syncWithBackend(true)
            favoriteId = get().favoriteIdsByProductId[productId]
          }

          if (favoriteId) {
            await favoritesService.removeFavorite(favoriteId)
          }

          await get().syncWithBackend(true)
        })()
      },

      toggleFavorite: (product: Product) => {
        const { favorites, addFavorite, removeFavorite } = get()
        const isFav = favorites.some(p => p.id === product.id)
        
        if (isFav) {
          removeFavorite(product.id)
          return false
        } else {
          addFavorite(product)
          return true
        }
      },

      isFavorite: (productId: number) => {
        return get().favorites.some(p => p.id === productId)
      },

      getFavoritesCount: () => {
        return get().favorites.length
      },

      clearFavorites: () => {
        const favoriteIds = Object.values(get().favoriteIdsByProductId)
        set({ favorites: [], favoriteIdsByProductId: {} })

        if (!isAuthenticated() || favoriteIds.length === 0) {
          return
        }

        void (async () => {
          await Promise.all(favoriteIds.map((favoriteId) => favoritesService.removeFavorite(favoriteId)))
          await get().syncWithBackend(true)
        })()
      },

      syncWithBackend: async (force = false) => {
        if (!isAuthenticated()) {
          set({ favoriteIdsByProductId: {} })
          return
        }

        if (syncPromise && !force) {
          await syncPromise
          return
        }

        syncPromise = (async () => {
          const localFavorites = normalizeFavorites(get().favorites)
          let response = await favoritesService.getFavorites()

          if (response.error) {
            return
          }

          let results = response.data?.results || []
          let favoriteIdsByProductId = Object.fromEntries(
            results
              .filter((favorite) => favorite.product?.id)
              .map((favorite) => [favorite.product.id, favorite.id])
          )

          const backendProductIds = new Set(Object.keys(favoriteIdsByProductId).map(Number))
          const localOnlyFavorites = localFavorites.filter((product) => !backendProductIds.has(product.id))

          if (localOnlyFavorites.length > 0) {
            await Promise.all(
              localOnlyFavorites.map((product) => favoritesService.addFavorite(product.id))
            )
            response = await favoritesService.getFavorites()
            results = response.data?.results || []
            favoriteIdsByProductId = Object.fromEntries(
              results
                .filter((favorite) => favorite.product?.id)
                .map((favorite) => [favorite.product.id, favorite.id])
            )
          }

          set({
            favorites: normalizeFavorites(results.map((favorite) => favorite.product).filter(Boolean)),
            favoriteIdsByProductId,
          })
        })().finally(() => {
          syncPromise = null
        })

        await syncPromise
      },
    }),
    {
      name: 'buymore-favorites',
    }
  )
)

const authState = useAuthStore.getState()
let previousAuthStatus = authState.isAuthenticated

useAuthStore.subscribe((state) => {
  if (state.isAuthenticated && !previousAuthStatus) {
    void useFavoritesStore.getState().syncWithBackend(true)
  }

  if (!state.isAuthenticated && previousAuthStatus) {
    useFavoritesStore.setState({ favoriteIdsByProductId: {} })
  }

  previousAuthStatus = state.isAuthenticated
})

if (authState.isAuthenticated) {
  void useFavoritesStore.getState().syncWithBackend(true)
}
