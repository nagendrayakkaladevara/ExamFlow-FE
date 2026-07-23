import { useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

function scrollToTop(element?: HTMLElement | null) {
  if (element) {
    element.scrollTo({ top: 0, left: 0 })
    return
  }

  window.scrollTo({ top: 0, left: 0 })
}

export function useScrollToTopOnNavigate<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null)
  const { pathname, search, hash } = useLocation()

  useLayoutEffect(() => {
    scrollToTop(ref.current)
  }, [pathname, search, hash])

  return ref
}

export function useWindowScrollToTopOnNavigate() {
  const { pathname, search, hash } = useLocation()

  useLayoutEffect(() => {
    scrollToTop()
  }, [pathname, search, hash])
}
