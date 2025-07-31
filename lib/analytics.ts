// Extend Window interface for gtag and dataLayer
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

// Google Analytics configuration
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID
export const GTM_CONTAINER_ID = 'GTM-K55DF7SN'

// Simple console logging for debugging (we'll remove this later)
const logEvent = (eventName: string, data: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Analytics Event: ${eventName}`, data)
  }
}

// Push to dataLayer for Google Tag Manager
export const pushToDataLayer = (data: Record<string, any>) => {
  logEvent('DataLayer Push', data)
  
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(data)
  } else if (process.env.NODE_ENV === 'development') {
    console.log('⚠️  DataLayer not available yet')
  }
}

// Log page views
export const pageview = (url: string, title?: string) => {
  const data = {
    event: 'page_view',
    page_path: url,
    page_title: title || document.title
  }
  
  logEvent('Page View', data)
  pushToDataLayer(data)
}

// Track blog post views
export const trackBlogView = (slug: string, title: string, category: string) => {
  const data = {
    event: 'blog_view',
    blog_slug: slug,
    blog_title: title,
    blog_category: category,
    content_type: 'blog_post'
  }
  
  logEvent('Blog View', data)
  pushToDataLayer(data)
}

// Track affiliate link clicks
export const trackAffiliateClick = (productName: string, productCategory: string, affiliate: string) => {
  pushToDataLayer({
    event: 'affiliate_click',
    product_name: productName,
    product_category: productCategory,
    affiliate_partner: affiliate,
    click_type: 'affiliate_link'
  })
}

// Track portfolio views
export const trackPortfolioView = (category: string) => {
  pushToDataLayer({
    event: 'portfolio_view',
    portfolio_category: category,
    content_type: 'portfolio'
  })
}

// Track contact form submissions
export const trackContactSubmission = () => {
  pushToDataLayer({
    event: 'contact_form_submit',
    form_type: 'contact'
  })
}
