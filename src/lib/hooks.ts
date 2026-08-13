'use client'

import { useState, useEffect } from 'react'

export function useIsMobile(breakpoint = 768) {
  // Lazy initializer: compute initial value at mount time to avoid setState in effect
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [breakpoint])

  return isMobile
}
