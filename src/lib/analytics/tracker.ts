/**
 * BuyMore Analytics Tracker
 * Professional-grade tracking system for visitor analytics, product views, and order tracking.
 * Uses session-based tracking with batched event sending for minimal performance impact.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://buymore-api-production.up.railway.app'

// === Session Management ===
const SESSION_KEY = 'bm_session_id'
const VISITOR_KEY = 'bm_visitor_id'
const SESSION_EXPIRY_KEY = 'bm_session_expiry'
const SESSION_DURATION = 30 * 60 * 1000 // 30 minutes

function generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
}

function getVisitorId(): string {
    let visitorId = localStorage.getItem(VISITOR_KEY)
    if (!visitorId) {
        visitorId = generateId()
        localStorage.setItem(VISITOR_KEY, visitorId)
    }
    return visitorId
}

function getSessionId(): string {
    const now = Date.now()
    const expiry = localStorage.getItem(SESSION_EXPIRY_KEY)
    let sessionId = localStorage.getItem(SESSION_KEY)

    if (!sessionId || !expiry || now > parseInt(expiry)) {
        sessionId = generateId()
        localStorage.setItem(SESSION_KEY, sessionId)
    }

    // Extend session on activity
    localStorage.setItem(SESSION_EXPIRY_KEY, String(now + SESSION_DURATION))
    return sessionId
}

// === Event Types ===
export type AnalyticsEventType =
    | 'page_view'
    | 'product_view'
    | 'product_add_to_cart'
    | 'product_remove_from_cart'
    | 'search'
    | 'order_created'
    | 'checkout_started'
    | 'whatsapp_order'

export interface AnalyticsEvent {
    event_type: AnalyticsEventType
    event_data: Record<string, any>
    visitor_id: string
    session_id: string
    page_url: string
    referrer: string
    user_agent: string
    screen_resolution: string
    timestamp: string
}

// === Event Queue & Batching ===
let eventQueue: AnalyticsEvent[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null
const BATCH_INTERVAL = 5000 // 5 seconds
const MAX_BATCH_SIZE = 20

function createEvent(type: AnalyticsEventType, data: Record<string, any> = {}): AnalyticsEvent {
    return {
        event_type: type,
        event_data: data,
        visitor_id: getVisitorId(),
        session_id: getSessionId(),
        page_url: window.location.pathname + window.location.search,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        timestamp: new Date().toISOString(),
    }
}

function scheduleFlush() {
    if (flushTimer) return
    flushTimer = setTimeout(() => {
        flushEvents()
        flushTimer = null
    }, BATCH_INTERVAL)
}

async function flushEvents() {
    if (eventQueue.length === 0) return

    const batch = eventQueue.splice(0, MAX_BATCH_SIZE)

    try {
        // Use sendBeacon for non-blocking sends (works even on page unload)
        const payload = JSON.stringify({ events: batch })
        const sent = navigator.sendBeacon?.(
            `${API_BASE_URL}/api/analytics/track`,
            new Blob([payload], { type: 'application/json' })
        )

        // Fallback to fetch if sendBeacon fails or is unavailable
        if (!sent) {
            await fetch(`${API_BASE_URL}/api/analytics/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
                keepalive: true,
            })
        }
    } catch (error) {
        // Re-queue failed events (max 100 in queue to prevent memory issues)
        if (eventQueue.length < 100) {
            eventQueue.unshift(...batch)
        }
        console.debug('[Analytics] Flush failed, events re-queued:', error)
    }
}

// Flush on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        flushEvents()
    })

    // Also flush on visibility change (tab switch)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            flushEvents()
        }
    })
}

// === Public API ===
export const analytics = {
    /**
     * Track a page view
     */
    pageView(pageName?: string) {
        const event = createEvent('page_view', {
            page_name: pageName || document.title,
            path: window.location.pathname,
        })
        eventQueue.push(event)
        scheduleFlush()
    },

    /**
     * Track a product view
     */
    productView(productId: number, productName: string, productSlug?: string, price?: number, categoryId?: number) {
        const event = createEvent('product_view', {
            product_id: productId,
            product_name: productName,
            product_slug: productSlug,
            price,
            category_id: categoryId,
        })
        eventQueue.push(event)
        scheduleFlush()
    },

    /**
     * Track adding a product to cart
     */
    addToCart(productId: number, productName: string, quantity: number, price: number) {
        const event = createEvent('product_add_to_cart', {
            product_id: productId,
            product_name: productName,
            quantity,
            price,
        })
        eventQueue.push(event)
        scheduleFlush()
    },

    /**
     * Track a search query
     */
    search(query: string, resultsCount?: number) {
        const event = createEvent('search', {
            query,
            results_count: resultsCount,
        })
        eventQueue.push(event)
        scheduleFlush()
    },

    /**
     * Track an order creation
     */
    orderCreated(orderId: number, total: number, itemsCount: number, source: string = 'website') {
        const event = createEvent('order_created', {
            order_id: orderId,
            total,
            items_count: itemsCount,
            source,
        })
        eventQueue.push(event)
        scheduleFlush()
    },

    /**
     * Track a WhatsApp order
     */
    whatsAppOrder(productIds: number[], total: number) {
        const event = createEvent('whatsapp_order', {
            product_ids: productIds,
            total,
        })
        eventQueue.push(event)
        scheduleFlush()
    },

    /**
     * Track checkout started
     */
    checkoutStarted(itemsCount: number, total: number) {
        const event = createEvent('checkout_started', {
            items_count: itemsCount,
            total,
        })
        eventQueue.push(event)
        scheduleFlush()
    },

    /**
     * Get visitor ID for reference
     */
    getVisitorId,

    /**
     * Get session ID for reference
     */
    getSessionId,

    /**
     * Force flush all pending events
     */
    flush: flushEvents,
}

export default analytics
