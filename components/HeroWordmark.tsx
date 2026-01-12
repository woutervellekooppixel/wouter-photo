'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type Props = {
  className?: string
  wordClassName?: string
  suffixClassName?: string
  intervalMs?: number
}

export default function HeroWordmark({
  className,
  wordClassName,
  suffixClassName,
  intervalMs = 700,
}: Props) {
  const shouldReduceMotion = useReducedMotion()

  const suffixes = useMemo(
    () => ['PORTFOLIO', 'CONCERTS', 'EVENTS', 'MISC', 'ABOUT', 'PHOTO'],
    []
  )

  const [mounted, setMounted] = useState(false)
  const [index, setIndex] = useState<number>(suffixes.length - 1) // start at PHOTO
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
      setIndex(suffixes.length - 1)
      return
    }

    const effectiveIntervalMs = isMobile ? Math.round(intervalMs * 1.8) : intervalMs

    // Start sequence from the beginning on mount, then stop on PHOTO.
    let current = 0
    setIndex(current)

    const id = window.setInterval(() => {
      current += 1
      if (current >= suffixes.length) {
        window.clearInterval(id)
        return
      }
      setIndex(current)

      if (current === suffixes.length - 1) {
        window.clearInterval(id)
      }
    }, effectiveIntervalMs)

    return () => window.clearInterval(id)
  }, [mounted, intervalMs, isMobile, shouldReduceMotion, suffixes.length])

  const maxSuffixLen = useMemo(
    () => suffixes.reduce((max, s) => Math.max(max, s.length), 0),
    [suffixes]
  )

  // Work around occasional framer-motion TS inference issues in some setups.
  const MotionDiv = (motion as any).div as any

  return (
    <div
      className={className}
      style={{
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'baseline',
        justifyContent: 'flex-start',
      }}
    >
      <span className={wordClassName}>WOUTER</span>
      {/* Wheel window (no whitespace between WOUTER and .SUFFIX) */}
      <span
        className="inline-block overflow-hidden align-baseline text-left"
        style={{
          height: '1em',
          lineHeight: '1em',
          minWidth: `${maxSuffixLen + 1.5}ch`,
        }}
      >
        <MotionDiv
          className="will-change-transform"
          animate={{ y: `${-index}em` }}
          transition={{ type: 'spring', stiffness: isMobile ? 120 : 140, damping: isMobile ? 24 : 22, mass: 0.7 }}
        >
          {suffixes.map((s) => (
            <div key={s} style={{ height: '1em', lineHeight: '1em' }}>
              <span className={suffixClassName}>.{s}</span>
            </div>
          ))}
        </MotionDiv>
      </span>
    </div>
  )
}
