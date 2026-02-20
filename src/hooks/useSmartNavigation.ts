import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

interface ScrollState {
  scrollPosition: number
  previousPath: string
  timestamp: number
}

const SCROLL_STATE_KEY = 'smartNavScrollState'
const STATE_TIMEOUT = 30 * 60 * 1000 // 30 minutes

export function useSmartNavigation() {
  const navigate = useNavigate()
  const location = useLocation()

  // Nettoyer les états expirés au chargement
  useEffect(() => {
    const cleanExpiredState = () => {
      const stored = sessionStorage.getItem(SCROLL_STATE_KEY)
      if (stored) {
        try {
          const state: ScrollState = JSON.parse(stored)
          const now = Date.now()
          if (now - state.timestamp > STATE_TIMEOUT) {
            sessionStorage.removeItem(SCROLL_STATE_KEY)
          }
        } catch (e) {
          sessionStorage.removeItem(SCROLL_STATE_KEY)
        }
      }
    }
    cleanExpiredState()
  }, [])

  /**
   * Naviguer vers une page en sauvegardant la position de scroll actuelle
   */
  const navigateWithScroll = (path: string, state?: any) => {
    const scrollState: ScrollState = {
      scrollPosition: window.scrollY,
      previousPath: location.pathname + location.search,
      timestamp: Date.now()
    }
    
    sessionStorage.setItem(SCROLL_STATE_KEY, JSON.stringify(scrollState))
    navigate(path, { state })
  }

  /**
   * Retour intelligent : revenir à la page précédente et restaurer la position de scroll
   */
  const smartBack = () => {
    const stored = sessionStorage.getItem(SCROLL_STATE_KEY)
    
    if (stored) {
      try {
        const state: ScrollState = JSON.parse(stored)
        const now = Date.now()
        
        // Vérifier que l'état n'est pas expiré
        if (now - state.timestamp <= STATE_TIMEOUT) {
          // Naviguer vers la page précédente
          navigate(state.previousPath)
          
          // Restaurer la position de scroll après un court délai
          // pour laisser le temps à la page de se charger
          setTimeout(() => {
            window.scrollTo({
              top: state.scrollPosition,
              behavior: 'smooth'
            })
          }, 100)
          
          // Nettoyer l'état après utilisation
          sessionStorage.removeItem(SCROLL_STATE_KEY)
          return
        }
      } catch (e) {
        console.error('Error parsing scroll state:', e)
      }
    }
    
    // Fallback : retour normal si pas d'état sauvegardé
    navigate(-1)
  }

  /**
   * Vérifier si on a un état de retour sauvegardé
   */
  const hasBackState = (): boolean => {
    const stored = sessionStorage.getItem(SCROLL_STATE_KEY)
    if (!stored) return false
    
    try {
      const state: ScrollState = JSON.parse(stored)
      const now = Date.now()
      return now - state.timestamp <= STATE_TIMEOUT
    } catch (e) {
      return false
    }
  }

  /**
   * Obtenir le chemin de la page précédente
   */
  const getPreviousPath = (): string | null => {
    const stored = sessionStorage.getItem(SCROLL_STATE_KEY)
    if (!stored) return null
    
    try {
      const state: ScrollState = JSON.parse(stored)
      return state.previousPath
    } catch (e) {
      return null
    }
  }

  return {
    navigateWithScroll,
    smartBack,
    hasBackState,
    getPreviousPath
  }
}
