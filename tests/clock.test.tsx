import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useStudyClock } from '../src/hooks/useStudyClock'
import { questions } from '../src/data/questions'
import { useLearning } from '../src/storage/store'
import { emptyData } from '../src/storage/validation'

beforeEach(() => { vi.useFakeTimers(); Object.defineProperty(document, 'hidden', { configurable: true, value: false }); useLearning.setState(emptyData()); useLearning.getState().ensureDetail(questions[0]) })
afterEach(() => { vi.useRealTimers(); Object.defineProperty(document, 'hidden', { configurable: true, value: false }) })
it('excludes hidden time and flushes uncommitted seconds before navigation', () => {
  const context = { kind: 'detail' as const, questionId: 1 }
  const { unmount } = renderHook(() => useStudyClock(context, useLearning(s => s.details[1]), true))
  act(() => { vi.advanceTimersByTime(3000); Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')) })
  expect(useLearning.getState().details[1].seconds).toBeCloseTo(3)
  act(() => { vi.advanceTimersByTime(20000); Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')); vi.advanceTimersByTime(2000); window.dispatchEvent(new Event('learning:flush')) })
  expect(useLearning.getState().details[1].seconds).toBeCloseTo(5)
  unmount()
})
