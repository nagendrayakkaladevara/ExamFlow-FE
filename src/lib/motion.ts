import type { Transition, Variants } from 'motion/react'

const easeOut = [0.25, 0.1, 0.25, 1] as const

export function motionTransition(
  reduced: boolean,
  duration = 0.25,
  delay = 0,
): Transition {
  if (reduced) return { duration: 0 }
  return { duration, ease: easeOut, delay }
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0 },
}

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0 },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1 },
}
