'use client'

import { useEffect } from 'react'

export default function DisableBodyScroll() {
  useEffect(() => {
    const prevScrollY = window.scrollY

    // Ensure we start at the top; otherwise locking scroll can leave the header off-screen.
    window.scrollTo(0, 0)

    const html = document.documentElement
    const body = document.body

    const prevHtmlOverflow = html.style.overflow
    const prevHtmlOverscroll = html.style.overscrollBehavior
    const prevBodyOverflow = body.style.overflow
    const prevBodyOverscroll = body.style.overscrollBehavior

    html.style.overflow = 'hidden'
    html.style.overscrollBehavior = 'none'
    body.style.overflow = 'hidden'
    body.style.overscrollBehavior = 'none'

    return () => {
      html.style.overflow = prevHtmlOverflow
      html.style.overscrollBehavior = prevHtmlOverscroll
      body.style.overflow = prevBodyOverflow
      body.style.overscrollBehavior = prevBodyOverscroll

      // Restore scroll position when leaving the page.
      window.scrollTo(0, prevScrollY)
    }
  }, [])

  return null
}
