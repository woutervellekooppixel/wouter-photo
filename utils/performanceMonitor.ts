// Performance monitoring utilities

declare global {
  function gtag(command: string, action: string, parameters?: any): void
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number
}

export const performanceMonitor = {
  // Measure Core Web Vitals
  measureCLS: () => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const layoutShift = entry as LayoutShiftEntry
          if (!layoutShift.hadRecentInput) {
            resolve(layoutShift.value)
          }
        })
      }).observe({ type: 'layout-shift', buffered: true })
    })
  },

  measureFID: () => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const firstInput = entry as FirstInputEntry
          resolve(firstInput.processingStart - firstInput.startTime)
        })
      }).observe({ type: 'first-input', buffered: true })
    })
  },

  measureLCP: () => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        resolve(lastEntry.startTime)
      }).observe({ type: 'largest-contentful-paint', buffered: true })
    })
  },

  // Track image loading performance
  trackImageLoad: (imageSrc: string, startTime: number) => {
    const loadTime = performance.now() - startTime
    
    // Send to analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'image_load_time', {
        event_category: 'Performance',
        event_label: imageSrc,
        value: Math.round(loadTime)
      })
    }
  },

  // Memory usage monitoring
  getMemoryUsage: () => {
    if ('memory' in performance) {
      return {
        // @ts-ignore
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        // @ts-ignore
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        // @ts-ignore
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      }
    }
    return null
  }
}
