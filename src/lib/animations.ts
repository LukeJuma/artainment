import { useState, useCallback, useRef } from 'react'
import type { Variants } from 'framer-motion'

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export const stagger: Variants = { visible: { transition: { staggerChildren: 0.1 } } }

export function useInView(threshold = 0.15) {
  const [inView, setInView] = useState(false)
  const obsRef = useRef<IntersectionObserver | null>(null)
  // Callback ref (not useEffect-on-mount): sections that render only after
  // async data arrives (early `return null` while loading) never had an
  // observer attached, so their grids stayed invisible forever. Attaching
  // on node mount fixes every current and future call site.
  const ref = useCallback(
    (el: HTMLDivElement | null) => {
      obsRef.current?.disconnect()
      obsRef.current = null
      if (!el) return
      if (inView) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true)
            obs.disconnect()
          }
        },
        { threshold },
      )
      obs.observe(el)
      obsRef.current = obs
    },
    [threshold, inView],
  )
  return { ref, inView }
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])
  return matches
}

export const useIsMobile = () => useMediaQuery('(max-width: 768px)')
export const useIsTablet = () => useMediaQuery('(max-width: 1024px)')
