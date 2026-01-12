'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type Props = {
  cycle: string[]
  intervalMs?: number
  className?: string
}

export default function WheelSuffix({ cycle, intervalMs = 450, className }: Props) {
  const shouldReduceMotion = useReducedMotion()

  const normalized = useMemo(() => {
    const uniq: string[] = []
    for (const item of cycle) {
      const s = String(item)
      if (!uniq.includes(s)) uniq.push(s)
    }
    return uniq.length ? uniq : ['PHOTO']
  }, [cycle])

  const maxLen = useMemo(
    () => normalized.reduce((max, s) => Math.max(max, s.length), 0),
    [normalized]
  )

  const [mounted, setMounted] = useState(false)
  const [index, setIndex] = useState<number>(normalized.length - 1)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const onChange = () => setIsMobile(mq.matches)
    onChange()

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    }

    mq.addListener(onChange)
    return () => mq.removeListener(onChange)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (shouldReduceMotion) {
      setIndex(normalized.length - 1)
      return
    }

    const effectiveIntervalMs = isMobile ? Math.round(intervalMs * 1.8) : intervalMs

    let current = 0
    setIndex(0)

    const id = window.setInterval(() => {
      current += 1
      if (current >= normalized.length) {
        window.clearInterval(id)
        return
      }
      setIndex(current)

      if (current === normalized.length - 1) {
        window.clearInterval(id)
      }
    }, effectiveIntervalMs)

    return () => window.clearInterval(id)
  }, [mounted, shouldReduceMotion, normalized, intervalMs, isMobile])

  // Work around occasional framer-motion TS inference issues in some setups.
  const MotionDiv = (motion as any).div as any

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        overflow: 'hidden',
        height: '1em',
        lineHeight: '1em',
        verticalAlign: 'baseline',
        minWidth: `${maxLen + 1.5}ch`,
        textAlign: 'left',
      }}
      aria-hidden
    >
      <MotionDiv
        className="will-change-transform"
        animate={{ y: `${-index}em` }}
        transition={{ type: 'spring', stiffness: isMobile ? 130 : 150, damping: isMobile ? 26 : 24, mass: 0.7 }}
      >
        {normalized.map((s) => (
          <div key={s} style={{ height: '1em', lineHeight: '1em' }}>
            .{s}
          </div>
        ))}
      </MotionDiv>
    </span>
  )
}
