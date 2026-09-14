import { useCallback, useEffect, useRef, useState } from 'react'
import type { Context, SessionItem } from '../types'
import { useLearning } from '../storage/store'

export function useStudyClock(context: Context, item: SessionItem, enabled: boolean) {
  const pending = useRef(0)
  const [display, setDisplay] = useState(0)
  const contextKey = context.kind === 'detail' ? `detail-${context.questionId}` : context.kind
  const contextRef = useRef(context)
  contextRef.current = context
  const flush = useCallback(() => {
    if (pending.current > 0) {
      useLearning.getState().addTime(contextRef.current, pending.current, item.recordId)
      pending.current = 0
      setDisplay(0)
    }
  }, [item.recordId])
  useEffect(() => {
    pending.current = 0
    setDisplay(0)
    if (!enabled || item.mastery) return
    let last = performance.now()
    let active = !document.hidden
    const tick = () => {
      const now = performance.now()
      if (active) pending.current += (now - last) / 1000
      last = now
      if (pending.current >= 5) flush()
      else setDisplay(pending.current)
    }
    const visibility = () => { tick(); active = !document.hidden; flush() }
    const interval = setInterval(tick, 500)
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('pagehide', flush)
    window.addEventListener('learning:flush', flush)
    return () => { tick(); clearInterval(interval); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pagehide', flush); window.removeEventListener('learning:flush', flush); flush() }
  }, [contextKey, item.recordId, enabled, !!item.mastery, flush])
  return { seconds: item.seconds + display, flush }
}
