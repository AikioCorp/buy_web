import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { analytics } from '../lib/analytics/tracker'

/**
 * Hook that automatically tracks page views on navigation changes.
 * Place this once in your App component.
 */
export function usePageTracking() {
    const location = useLocation()

    useEffect(() => {
        analytics.pageView()
    }, [location.pathname])
}

/**
 * Hook to track a specific product view.
 * Use in ProductDetailPage.
 */
export function useProductTracking(product: {
    id: number
    name: string
    slug?: string
    base_price?: string | number
    category_id?: number
} | null) {
    useEffect(() => {
        if (product) {
            analytics.productView(
                product.id,
                product.name,
                product.slug,
                typeof product.base_price === 'string' ? parseFloat(product.base_price) : product.base_price,
                product.category_id
            )
        }
    }, [product?.id])
}
