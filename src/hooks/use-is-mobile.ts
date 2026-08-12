'use client'

import { useState, useEffect } from 'react'

export function useIsMobile(breakpoint = 640) {
  // Lazy initializer: compute initial value at mount time to avoid setState in effect
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < breakpoint
  })

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const onChange = () => setIsMobile(window.innerWidth < breakpoint)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [breakpoint])

  return isMobile
}
