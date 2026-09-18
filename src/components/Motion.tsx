import { LazyMotion, MotionConfig, m, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

// A restrained motion vocabulary: orientation first, feedback second.
const loadFeatures = () => import('./motionFeatures').then((module) => module.default)
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  )
}

export function Reveal({
  children,
  className,
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  const reduced = useReducedMotion()
  return (
    <m.div
      id={id}
      className={className}
      initial={reduced ? false : { opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.18, ease: [0.2, 0, 0, 1] }}
    >
      {children}
    </m.div>
  )
}

export function HeaderEntrance({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reduced = useReducedMotion()
  return (
    <m.header
      className={className}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.22, ease: [0.2, 0, 0, 1] }}
    >
      {children}
    </m.header>
  )
}
