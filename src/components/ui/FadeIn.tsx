import { motion, type Variants } from 'framer-motion'
import { useInView } from '../../lib/animations'

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  y?: number
  x?: number
  scale?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  style?: React.CSSProperties
  className?: string
  once?: boolean
}

const directionMap = {
  up: { y: 40, x: 0 },
  down: { y: -40, x: 0 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
}

export function FadeIn({ children, delay = 0, duration = 0.6, direction = 'up', y, x, scale, style, className, once = true }: FadeInProps) {
  const { ref, inView } = useInView(0.12)
  const offset = directionMap[direction]
  const initial = { opacity: 0, y: y ?? offset.y, x: x ?? offset.x, ...(scale !== undefined ? { scale } : {}) }
  const animate = { opacity: 1, y: 0, x: 0, ...(scale !== undefined ? { scale: 1 } : {}) }

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={inView ? animate : (once ? initial : {})}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function FadeInStagger({ children, staggerDelay = 0.08, style, className }: {
  children: React.ReactNode
  staggerDelay?: number
  style?: React.CSSProperties
  className?: string
}) {
  const { ref, inView } = useInView(0.1)
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: staggerDelay } },
  }
  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  }

  return (
    <motion.div ref={ref} variants={container} initial="hidden" animate={inView ? 'visible' : 'hidden'} style={style} className={className}>
      {Array.isArray(children) ? children.map((child, i) => (
        <motion.div key={i} variants={item}>{child}</motion.div>
      )) : <motion.div variants={item}>{children}</motion.div>}
    </motion.div>
  )
}
