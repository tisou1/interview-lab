import { useEffect, useState } from 'react'

/**
 * 订阅媒体查询。首帧同步求值，避免桌面端先按移动端渲染再切换布局。
 * 测试环境（jsdom）没有 matchMedia，统一按 false 处理。
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
    return window.matchMedia(query).matches
  })
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const list = window.matchMedia(query)
    const sync = () => setMatches(list.matches)
    sync()
    list.addEventListener('change', sync)
    return () => list.removeEventListener('change', sync)
  }, [query])
  return matches
}
