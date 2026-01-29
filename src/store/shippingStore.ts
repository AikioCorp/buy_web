import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SavedShippingAddress {
  full_name: string
  phone: string
  email: string
  commune: string
  quartier: string
  address_details: string
  country: string
}

interface ShippingState {
  savedAddress: SavedShippingAddress | null
  
  // Actions
  saveAddress: (address: SavedShippingAddress) => void
  clearAddress: () => void
  hasAddress: () => boolean
}

export const useShippingStore = create<ShippingState>()(
  persist(
    (set, get) => ({
      savedAddress: null,

      saveAddress: (address: SavedShippingAddress) => {
        set({ savedAddress: address })
      },

      clearAddress: () => {
        set({ savedAddress: null })
      },

      hasAddress: () => {
        return get().savedAddress !== null
      },
    }),
    {
      name: 'shipping-storage',
    }
  )
)
