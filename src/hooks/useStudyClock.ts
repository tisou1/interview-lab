import { useCallback, useEffect, useRef, useState } from 'react'
import type { Context, SessionItem } from '../types'
import { useLearning } from '../storage/store'

export function useStudyClock(context: Context, item: SessionItem, enabled: boolean) {
  const pending = useRef(0)
  const [display, setDisplay] = useState(0)
  const contextKey = context.kind === 'detail' ? `detail-${context.questionId}` : context.kind
  const { recordId } = item
  const mastered = !!item.mastery
  // context 每次渲染都是新对象。改为在 effect 中写入，保证切题时清理函数读到的仍是旧上下文，
  // 未结算的秒数会记到上一题而不是下一题。
  const contextRef = useRef(context)
  useEffect(() => {
    contextRef.current = context
  })
  const flush = useCallback(() => {
    if (pending.current > 0) {
      useLearning.getState().addTime(contextRef.current, pending.current, recordId)
      pending.current = 0
      setDisplay(0)
    }
  }, [recordId])
  useEffect(() => {
    pending.current = 0
    // 切题或重开场次时必须清空已显示秒数，否则会累加到下一题。
    // oxlint-disable-next-line react/set-state-in-effect
    setDisplay(0)
    if (!enabled || mastered) return
    let last = performance.now()
    let active = !document.hidden
    const tick = () => {
      const now = performance.now()
      if (active) pending.current += (now - last) / 1000
      last = now
      if (pending.current >= 5) flush()
      else setDisplay(pending.current)
    }
    const visibility = () => {
      tick()
      active = !document.hidden
      flush()
    }
    const interval = setInterval(tick, 500)
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('pagehide', flush)
    window.addEventListener('learning:flush', flush)
    return () => {
      tick()
      clearInterval(interval)
      document.removeEventListener('visibilitychange', visibility)
      window.removeEventListener('pagehide', flush)
      window.removeEventListener('learning:flush', flush)
      flush()
    }
    // contextKey 只是「换题就重开计时器」的触发器，effect 内不读取它本身。
    // oxlint-disable-next-line react/exhaustive-effect-dependencies
  }, [contextKey, recordId, enabled, mastered, flush])
  return { seconds: item.seconds + display, flush }
}
