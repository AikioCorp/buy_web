import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/lib/api/productsService'

interface FavoritesState {
  favorites: Product[]
  addFavorite: (product: Product) => void
  removeFavorite: (productId: number) => void
  toggleFavorite: (product: Product) => boolean
  isFavorite: (productId: number) => boolean
  getFavoritesCount: () => number
  clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (product: Product) => {
        const { favorites } = get()
        if (!favorites.find(p => p.id === product.id)) {
          set({ favorites: [...favorites, product] })
        }
      },

      removeFavorite: (productId: number) => {
        set({ favorites: get().favorites.filter(p => p.id !== productId) })
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
        set({ favorites: [] })
      },
    }),
    {
      name: 'buymore-favorites',
    }
  )
)
