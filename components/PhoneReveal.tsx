'use client'

import { useState, useEffect } from 'react'

export default function PhoneReveal() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    async function checkLocation() {
      try {
        const cfRes = await fetch('https://cloudflare.com/cdn-cgi/trace')
        const cfText = await cfRes.text()
        const country = cfText.match(/loc=([A-Z]{2})/)?.[1]
        if (country) { setShow(country === 'NL'); return }
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()
        setShow(data.country_code === 'NL')
      } catch {
        setShow(false)
      }
    }
    checkLocation()
  }, [])

  if (!show) return null
  return (
    <span>
      <br />
      +31 (0)6 16 290 418
    </span>
  )
}
