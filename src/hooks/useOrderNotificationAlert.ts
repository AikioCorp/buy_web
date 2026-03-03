import { useEffect, useRef } from 'react'
import { ordersService } from '../lib/api/ordersService'
import { useAuthStore } from '../stores/authStore'

/**
 * Hook to poll pending orders and trigger a browser Web Notification
 * when a new order arrives.
 */
export const useOrderNotificationAlert = () => {
    const { user } = useAuthStore()
    const lastPendingCountRef = useRef<number | null>(null)

    useEffect(() => {
        // 1. Demander la permission pour les notifications au montage
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission()
        }
    }, [])

    useEffect(() => {
        // On ne poll que si l'utilisateur est admin/super_admin/vendeur
        if (!user || user.role === 'client') return

        const pollOrders = async () => {
            try {
                const response = await ordersService.getAllOrdersAdmin({ page: 1, status: 'pending' as any })
                const data = response.data
                const currentCount = Array.isArray(data) ? data.length : (data?.count || data?.results?.length || 0)

                // Initialiser la ref au premier chargement sans déclencher de notif
                if (lastPendingCountRef.current === null) {
                    lastPendingCountRef.current = currentCount
                    return
                }

                // Si le nombre a augmenté, c'est qu'il y a une nouvelle commande
                if (currentCount > lastPendingCountRef.current) {
                    const diff = currentCount - lastPendingCountRef.current
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('BuyMore - Nouvelles Commandes !', {
                            body: `Vous avez ${diff} nouvelle(s) commande(s) en attente. (${currentCount} au total)`,
                            icon: '/vite.svg', // Optionnel : tu peux mettre le logo de l'app ici
                            badge: '/vite.svg'
                        })
                        // Optionnel : jouer un son
                        try {
                            const audio = new Audio('/notification.mp3') // si tu as un fichier son
                            audio.play().catch(() => { })
                        } catch (e) { }
                    }
                }

                // Mettre à jour la dernière valeur connue
                lastPendingCountRef.current = currentCount
            } catch (err) {
                // Silencieux en cas d'erreur réseau pour ne pas spammer la console
            }
        }

        // Premier appel initial
        pollOrders()

        // Polling toutes les 30 secondes
        const interval = setInterval(pollOrders, 30_000)

        return () => clearInterval(interval)
    }, [user])
}
