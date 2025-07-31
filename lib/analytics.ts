// Extend Window interface for gtag and dataLayer
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

// Google Analytics configuration
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID

// Push to dataLayer for Google Tag Manager
export const pushToDataLayer = (data: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(data)
  }
}

// Log page views
export const pageview = (url: string, title?: string) => {
  pushToDataLayer({
    event: 'page_view',
    page_path: url,
    page_title: title
  })
}

// Track blog post views
export const trackBlogView = (slug: string, title: string, category: string) => {
  pushToDataLayer({
    event: 'blog_view',
    blog_slug: slug,
    blog_title: title,
    blog_category: category,
    content_type: 'blog_post'
  })
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
