'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface AnalyticsEvent {
  eventType: string
  category?: string
  properties?: Record<string, any>
  context?: Record<string, any>
}

interface PageViewEvent {
  url: string
  title?: string
  referrer?: string
}

interface ProductViewEvent {
  productId: string
  productName: string
  productCategory?: string
  productPrice?: number
  currency?: string
}

interface PurchaseEvent {
  orderId: string
  orderValue: number
  currency?: string
  products?: Array<{
    productId: string
    productName: string
    productCategory?: string
    price: number
    quantity: number
  }>
}

interface AnalyticsConfig {
  userId?: string
  sessionId?: string
  anonymousId?: string
  enabled?: boolean
  debug?: boolean
}

class AnalyticsManager {
  private config: AnalyticsConfig = {
    enabled: true,
    debug: false,
  }
  private sessionId: string
  private anonymousId: string
  private queue: AnalyticsEvent[] = []
  private isOnline = true

  constructor() {
    this.sessionId = this.generateSessionId()
    this.anonymousId = this.getOrCreateAnonymousId()
    this.setupEventListeners()
  }

  configure(config: Partial<AnalyticsConfig>) {
    this.config = { ...this.config, ...config }
  }

  setUserId(userId: string) {
    this.config.userId = userId
  }

  clearUserId() {
    this.config.userId = undefined
  }

  async track(event: AnalyticsEvent): Promise<void> {
    if (!this.config.enabled) return

    const enrichedEvent = this.enrichEvent(event)

    if (this.config.debug) {
      console.log('[Analytics] Tracking event:', enrichedEvent)
    }

    if (this.isOnline) {
      try {
        await this.sendEvent(enrichedEvent)
      } catch (error) {
        console.error('[Analytics] Failed to send event:', error)
        this.queue.push(enrichedEvent)
      }
    } else {
      this.queue.push(enrichedEvent)
    }
  }

  async trackPageView(data: PageViewEvent): Promise<void> {
    await this.track({
      eventType: 'page_view',
      category: 'content',
      properties: {
        url: data.url,
        pageTitle: data.title,
        referrer: data.referrer,
      },
      context: {
        page: {
          url: data.url,
          title: data.title,
          referrer: data.referrer,
          path: new URL(data.url, window.location.origin).pathname,
        },
      },
    })
  }

  async trackProductView(data: ProductViewEvent): Promise<void> {
    await this.track({
      eventType: 'product_view',
      category: 'ecommerce',
      properties: {
        productId: data.productId,
        productName: data.productName,
        productCategory: data.productCategory,
        productPrice: data.productPrice,
        currency: data.currency || 'USD',
      },
    })
  }

  async trackPurchase(data: PurchaseEvent): Promise<void> {
    await this.track({
      eventType: 'purchase',
      category: 'ecommerce',
      properties: {
        orderId: data.orderId,
        orderValue: data.orderValue,
        currency: data.currency || 'USD',
        products: data.products,
      },
    })
  }

  async trackAddToCart(productId: string, productName: string, price: number, quantity: number): Promise<void> {
    await this.track({
      eventType: 'add_to_cart',
      category: 'ecommerce',
      properties: {
        productId,
        productName,
        price,
        quantity,
        value: price * quantity,
      },
    })
  }

  async trackRemoveFromCart(productId: string, productName: string, price: number, quantity: number): Promise<void> {
    await this.track({
      eventType: 'remove_from_cart',
      category: 'ecommerce',
      properties: {
        productId,
        productName,
        price,
        quantity,
        value: price * quantity,
      },
    })
  }

  async trackSearch(query: string, results: number): Promise<void> {
    await this.track({
      eventType: 'product_search',
      category: 'content',
      properties: {
        searchQuery: query,
        searchResults: results,
      },
    })
  }

  async trackCheckoutStart(orderValue: number, currency = 'USD'): Promise<void> {
    await this.track({
      eventType: 'checkout_start',
      category: 'ecommerce',
      properties: {
        orderValue,
        currency,
      },
    })
  }

  async trackCheckoutComplete(orderId: string, orderValue: number, currency = 'USD'): Promise<void> {
    await this.track({
      eventType: 'checkout_complete',
      category: 'ecommerce',
      properties: {
        orderId,
        orderValue,
        currency,
      },
    })
  }

  async trackUserSignup(method?: string): Promise<void> {
    await this.track({
      eventType: 'user_signup',
      category: 'user',
      properties: {
        method: method || 'email',
      },
    })
  }

  async trackUserLogin(method?: string): Promise<void> {
    await this.track({
      eventType: 'user_login',
      category: 'user',
      properties: {
        method: method || 'email',
      },
    })
  }

  async trackButtonClick(buttonText: string, location: string): Promise<void> {
    await this.track({
      eventType: 'button_click',
      category: 'content',
      properties: {
        buttonText,
        location,
      },
    })
  }

  async trackFormSubmit(formName: string, success: boolean): Promise<void> {
    await this.track({
      eventType: 'form_submit',
      category: 'content',
      properties: {
        formName,
        success,
      },
    })
  }

  async trackError(error: string, location: string): Promise<void> {
    await this.track({
      eventType: 'error',
      category: 'system',
      properties: {
        error,
        location,
      },
    })
  }

  private enrichEvent(event: AnalyticsEvent): AnalyticsEvent {
    return {
      ...event,
      properties: {
        ...event.properties,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      },
      context: {
        ...event.context,
        userId: this.config.userId,
        sessionId: this.sessionId,
        anonymousId: this.anonymousId,
        library: {
          name: 'yxlp-analytics',
          version: '1.0.0',
        },
        page: {
          url: window.location.href,
          path: window.location.pathname,
          search: window.location.search,
          title: document.title,
          referrer: document.referrer,
        },
        userAgent: navigator.userAgent,
        locale: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: {
          width: window.screen.width,
          height: window.screen.height,
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      },
    }
  }

  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    const response = await fetch('/api/analytics/track/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      throw new Error(`Analytics request failed: ${response.statusText}`)
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getOrCreateAnonymousId(): string {
    const key = 'yxlp_anonymous_id'
    let anonymousId = localStorage.getItem(key)
    
    if (!anonymousId) {
      anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem(key, anonymousId)
    }
    
    return anonymousId
  }

  private setupEventListeners(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true
      this.flushQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })

    // Page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushQueue()
      }
    })

    // Before unload
    window.addEventListener('beforeunload', () => {
      this.flushQueue()
    })
  }

  private async flushQueue(): Promise<void> {
    if (this.queue.length === 0) return

    const events = [...this.queue]
    this.queue = []

    try {
      // Send events in batch
      await fetch('/api/analytics/track/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      })
    } catch (error) {
      console.error('[Analytics] Failed to flush queue:', error)
      // Re-add events to queue
      this.queue.unshift(...events)
    }
  }
}

// Global analytics instance
const analytics = new AnalyticsManager()

export function useAnalytics() {
  const router = useRouter()

  useEffect(() => {
    // Configure analytics with user info if available
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        analytics.setUserId(payload.sub || payload.userId)
      } catch (error) {
        console.error('Failed to parse token for analytics:', error)
      }
    }
  }, [])

  const trackPageView = useCallback((url?: string, title?: string) => {
    analytics.trackPageView({
      url: url || window.location.href,
      title: title || document.title,
      referrer: document.referrer,
    })
  }, [])

  const trackProductView = useCallback((data: ProductViewEvent) => {
    analytics.trackProductView(data)
  }, [])

  const trackPurchase = useCallback((data: PurchaseEvent) => {
    analytics.trackPurchase(data)
  }, [])

  const trackAddToCart = useCallback((productId: string, productName: string, price: number, quantity: number) => {
    analytics.trackAddToCart(productId, productName, price, quantity)
  }, [])

  const trackRemoveFromCart = useCallback((productId: string, productName: string, price: number, quantity: number) => {
    analytics.trackRemoveFromCart(productId, productName, price, quantity)
  }, [])

  const trackSearch = useCallback((query: string, results: number) => {
    analytics.trackSearch(query, results)
  }, [])

  const trackCheckoutStart = useCallback((orderValue: number, currency?: string) => {
    analytics.trackCheckoutStart(orderValue, currency)
  }, [])

  const trackCheckoutComplete = useCallback((orderId: string, orderValue: number, currency?: string) => {
    analytics.trackCheckoutComplete(orderId, orderValue, currency)
  }, [])

  const trackUserSignup = useCallback((method?: string) => {
    analytics.trackUserSignup(method)
  }, [])

  const trackUserLogin = useCallback((method?: string) => {
    analytics.trackUserLogin(method)
  }, [])

  const trackButtonClick = useCallback((buttonText: string, location: string) => {
    analytics.trackButtonClick(buttonText, location)
  }, [])

  const trackFormSubmit = useCallback((formName: string, success: boolean) => {
    analytics.trackFormSubmit(formName, success)
  }, [])

  const trackError = useCallback((error: string, location: string) => {
    analytics.trackError(error, location)
  }, [])

  const trackCustomEvent = useCallback((eventType: string, properties?: Record<string, any>) => {
    analytics.track({
      eventType,
      category: 'custom',
      properties,
    })
  }, [])

  const setUserId = useCallback((userId: string) => {
    analytics.setUserId(userId)
  }, [])

  const clearUserId = useCallback(() => {
    analytics.clearUserId()
  }, [])

  return {
    trackPageView,
    trackProductView,
    trackPurchase,
    trackAddToCart,
    trackRemoveFromCart,
    trackSearch,
    trackCheckoutStart,
    trackCheckoutComplete,
    trackUserSignup,
    trackUserLogin,
    trackButtonClick,
    trackFormSubmit,
    trackError,
    trackCustomEvent,
    setUserId,
    clearUserId,
  }
}

// Auto-track page views for Next.js router
export function useAutoPageTracking() {
  const { trackPageView } = useAnalytics()
  const router = useRouter()

  useEffect(() => {
    // Track initial page view
    trackPageView()

    // Track route changes
    const handleRouteChange = (url: string) => {
      trackPageView(url)
    }

    // Note: Next.js 13+ app router doesn't have router events
    // This would need to be implemented differently for app router
    if (typeof window !== 'undefined' && 'addEventListener' in window) {
      window.addEventListener('popstate', () => {
        trackPageView()
      })
    }

    return () => {
      if (typeof window !== 'undefined' && 'removeEventListener' in window) {
        window.removeEventListener('popstate', () => {
          trackPageView()
        })
      }
    }
  }, [trackPageView])
}

export default analytics
