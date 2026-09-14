import { beforeEach, describe, expect, it, vi } from 'vitest'
import { questions } from '../src/data/questions'
import { addDays, applyRating, blankProgress, dailyStats, drawQuestions, filterQuestions, localDate } from '../src/lib/learning'
import { exportData, safeStorage, STORAGE_KEY, useLearning, useStorageStatus } from '../src/storage/store'
import { decodeBackup, emptyData } from '../src/storage/validation'

beforeEach(() => { localStorage.clear(); useLearning.setState(emptyData()); useStorageStatus.getState().setError(null) })
describe('review scheduling and selection', () => {
  it('uses calendar-day intervals and resets streak on hard and again', () => {
    const now = '2026-09-14T14:00:00.000Z'
    let progress = blankProgress(1)
    for (const days of [7, 14, 30, 30]) { progress = applyRating(progress, 'good', now); expect(progress.nextReviewAt).toBe(addDays(new Date(now), days).toISOString()) }
    progress = applyRating(progress, 'hard', now)
    expect(progress.goodStreak).toBe(0)
    expect(progress.nextReviewAt).toBe(addDays(new Date(now), 3).toISOString())
    expect(applyRating(progress, 'good', now).goodStreak).toBe(1)
    expect(applyRating(progress, 'again', now).nextReviewAt).toBe(addDays(new Date(now), 1).toISOString())
  })
  it('draws unique, balanced categories, clamps insufficient pools and prioritizes weak items', () => {
    const pool = questions.filter(q => q.category === 'javascript' || q.category === 'react')
    const progress = { [pool[0].id]: { ...blankProgress(pool[0].id), mastery: 'again' as const } }
    const selected = drawQuestions(pool, 10, progress, true, false, () => 0.4)
    expect(new Set(selected.map(q => q.id)).size).toBe(10)
    expect(selected.filter(q => q.category === 'react')).toHaveLength(5)
    expect(selected.some(q => q.id === pool[0].id)).toBe(true)
    expect(drawQuestions(pool.slice(0, 2), 10, {}, false, true)).toHaveLength(2)
  })
  it('combines text, metadata and progress filters', () => {
    const q = questions.find(q => q.category === 'react')!
    const p = { [q.id]: { ...blankProgress(q.id), favorite: true } }
    expect(filterQuestions(questions, new URLSearchParams('category=react&status=favorite'), p).map(q => q.id)).toEqual([q.id])
    expect(filterQuestions(questions, new URLSearchParams('q=不存在的关键词'), p)).toHaveLength(0)
  })
})
describe('persistent learning records', () => {
  it('does not count repeated submissions and preserves drafts through rehydration', async () => {
    const question = questions[0]
    useLearning.getState().ensureDetail(question)
    useLearning.getState().draft(question.id, '我的草稿')
    const context = { kind: 'detail' as const, questionId: question.id }
    useLearning.getState().rate(context, 'hard')
    useLearning.getState().rate(context, 'good')
    expect(useLearning.getState().records).toHaveLength(1)
    expect(useLearning.getState().progress[question.id].attempts).toBe(1)
    const backup = exportData()
    useLearning.getState().clear()
    useLearning.getState().importData(decodeBackup(backup))
    await useLearning.persist.rehydrate()
    expect(useLearning.getState().progress[question.id].draft).toBe('我的草稿')
    expect(useLearning.getState().records).toHaveLength(1)
  })
  it('finishes a mock once and updates a report without adding attempts', () => {
    useLearning.getState().start('mock', questions.slice(0, 5), 10)
    useLearning.getState().patchItem({ kind: 'mock' }, { status: 'again' })
    const deadline = useLearning.getState().mock!.deadline
    const id = useLearning.getState().finish('mock')!
    useLearning.getState().finish('mock')
    expect(useLearning.getState().history).toHaveLength(1)
    expect(useLearning.getState().records).toHaveLength(5)
    expect(useLearning.getState().mock!.deadline).toBe(deadline)
    expect(useLearning.getState().history[0].items[0].mastery).toBe('again')
    expect(useLearning.getState().progress[1].mastery).toBe('again')
    useLearning.getState().rateReport(id, 1, 'good')
    useLearning.getState().rateReport(id, 1, 'hard')
    expect(useLearning.getState().records).toHaveLength(5)
    expect(useLearning.getState().progress[1].attempts).toBe(1)
    expect(useLearning.getState().progress[1].mastery).toBe('hard')
  })
  it('retains chronological ratings when an earlier report changes', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-10T10:00:00Z'))
    useLearning.getState().start('mock', questions.slice(0, 1), 10)
    const id = useLearning.getState().finish('mock')!
    useLearning.getState().rateReport(id, 1, 'good')
    vi.setSystemTime(new Date('2026-09-14T10:00:00Z'))
    useLearning.getState().ensureDetail(questions[0]); useLearning.getState().rate({ kind: 'detail', questionId: 1 }, 'hard')
    useLearning.getState().rateReport(id, 1, 'again')
    expect(useLearning.getState().progress[1].mastery).toBe('hard')
    expect(useLearning.getState().progress[1].goodStreak).toBe(0)
    vi.useRealTimers()
  })
  it('imports progress-only legacy backups without inventing history and preserves the rating baseline', () => {
    const p = { ...blankProgress(1), mastery: 'good' as const, goodStreak: 2, attempts: 2 }
    const imported = decodeBackup(JSON.stringify({ version: 1, state: { progress: { 1: p }, theme: 'light' } }))
    expect(imported.records).toEqual([])
    useLearning.getState().importData(imported)
    useLearning.getState().ensureDetail(questions[0]); useLearning.getState().rate({ kind: 'detail', questionId: 1 }, 'good')
    expect(useLearning.getState().progress[1].goodStreak).toBe(3)
    expect(useLearning.getState().records).toHaveLength(1)
  })
  it('backs up malformed storage and reports quota failures', () => {
    localStorage.setItem(STORAGE_KEY, '{invalid')
    expect(safeStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(Object.keys(localStorage).some(key => key.startsWith(`${STORAGE_KEY}:corrupt:`))).toBe(true)
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('QuotaExceededError') })
    safeStorage.setItem(STORAGE_KEY, '{}')
    expect(useStorageStatus.getState().error).toContain('保存失败')
    spy.mockRestore()
  })
  it('rejects invalid import and duplicate record IDs before replacing state', () => {
    expect(() => decodeBackup('{bad')).toThrow()
    expect(() => decodeBackup(JSON.stringify({ version: 99, state: {} }))).toThrow('版本')
    useLearning.getState().ensureDetail(questions[0]); useLearning.getState().rate({ kind: 'detail', questionId: 1 }, 'good')
    const payload = JSON.parse(exportData()); payload.state.records.push(payload.state.records[0])
    expect(() => decodeBackup(JSON.stringify(payload))).toThrow('重复')
    expect(useLearning.getState().records).toHaveLength(1)
  })
  it('groups records by stored local day, excluding unanswered and skipped attempts', () => {
    useLearning.getState().start('mock', questions.slice(0, 5), 10)
    useLearning.getState().patchItem({ kind: 'mock' }, { status: 'answered' }); useLearning.getState().finish('mock')
    const records = useLearning.getState().records
    expect(dailyStats(records, 7).reduce((sum, day) => sum + day.count, 0)).toBe(1)
    const midnight = new Date(2026, 8, 15, 0, 1)
    expect(dailyStats([{ ...records[0], localDate: localDate(new Date(2026, 8, 14, 23, 59)) }], 2, midnight).map(d => d.count)).toEqual([1, 0])
  })
})
