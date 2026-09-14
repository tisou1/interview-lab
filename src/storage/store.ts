import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import type { Context, PracticeSession, QuestionMeta, Rating, SavedData, SessionItem, StudyRecord } from '../types'
import { blankProgress, localDate, makeItem, rebuildProgress, withBaseline } from '../lib/learning'
import { decodeBackup, emptyData, validateData } from './validation'

export const STORAGE_KEY = 'frontend-interview-lab:v1'
let preserveUnreadableStorage = false
const flushClocks = () => { if (typeof window !== 'undefined') window.dispatchEvent(new Event('learning:flush')) }
export const useStorageStatus = create<{ error: string | null; setError: (error: string | null) => void }>(set => ({ error: null, setError: error => set({ error }) }))
export const safeStorage: StateStorage = {
  getItem(key) {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return null
      try { decodeBackup(raw); return raw } catch {
        try { localStorage.setItem(`${key}:corrupt:${Date.now()}`, raw) } catch { preserveUnreadableStorage = true; useStorageStatus.getState().setError('存储数据损坏且备份失败，原始数据仍保留在浏览器中。请先导出原始备份。'); return null }
        localStorage.removeItem(key)
        useStorageStatus.getState().setError('本地数据无法读取，已保留原始备份并恢复空状态。可在设置中导出备份。')
        return null
      }
    } catch { useStorageStatus.getState().setError('浏览器不允许读取本地存储，本次学习可能无法保存。'); return null }
  },
  setItem(key, value) {
    if (preserveUnreadableStorage) return
    try { localStorage.setItem(key, value) } catch { useStorageStatus.getState().setError('保存失败：本地存储不可用或空间不足。请在设置中导出学习数据，避免关闭后丢失。') }
  },
  removeItem(key) { try { localStorage.removeItem(key) } catch { useStorageStatus.getState().setError('清除本地存储失败。') } },
}
export function getItem(data: SavedData, context: Context): SessionItem | undefined { return context.kind === 'detail' ? data.details[context.questionId] : data[context.kind]?.items[data[context.kind]!.currentIndex] }
function updateItem(data: SavedData, context: Context, change: (item: SessionItem) => SessionItem): Partial<SavedData> {
  if (context.kind === 'detail') return { details: { ...data.details, [context.questionId]: change(data.details[context.questionId]) } }
  const session = data[context.kind]
  if (!session || session.completedAt) return {}
  return { [context.kind]: { ...session, items: session.items.map((item, i) => i === session.currentIndex ? change(item) : item) } }
}
function recordFor(item: SessionItem, sessionId: string, mode: 'practice' | 'mock', now: string): StudyRecord { return { id: item.recordId, questionId: item.questionId, category: item.category, sessionId, mode, submittedAt: now, localDate: localDate(now), seconds: item.seconds, status: item.status, mastery: item.mastery } }
interface Actions {
  ensureDetail: (question: QuestionMeta, restart?: boolean) => void
  favorite: (id: number) => void
  draft: (id: number, draft: string) => void
  setTheme: (theme: SavedData['theme']) => void
  setFilters: (filters: string) => void
  start: (mode: 'practice' | 'mock', questions: QuestionMeta[], minutes: number) => void
  patchItem: (context: Context, patch: Partial<Pick<SessionItem, 'revealed' | 'flagged' | 'status'>>) => void
  addTime: (context: Context, seconds: number, recordId: string) => void
  rate: (context: Context, rating: Rating) => void
  move: (kind: 'practice' | 'mock', index: number) => void
  finish: (kind: 'practice' | 'mock') => string | undefined
  rateReport: (sessionId: string, questionId: number, rating: Rating) => void
  importData: (data: SavedData) => void
  clear: () => void
}
export const useLearning = create<SavedData & Actions>()(persist((set, get) => ({
  ...emptyData(),
  ensureDetail: (question, restart = false) => set(state => state.details[question.id] && !restart ? {} : ({ details: { ...state.details, [question.id]: makeItem(question) } })),
  favorite: id => set(state => { const p = state.progress[id] ?? blankProgress(id); return { progress: { ...state.progress, [id]: { ...p, favorite: !p.favorite } } } }),
  draft: (id, draft) => set(state => ({ progress: { ...state.progress, [id]: { ...(state.progress[id] ?? blankProgress(id)), draft } } })),
  setTheme: theme => set({ theme }),
  setFilters: filters => set({ filters }),
  start: (mode, questions, minutes) => {
    if (!questions.length || (mode === 'mock' && (!Number.isFinite(minutes) || minutes < 1))) return
    flushClocks()
    const now = new Date()
    set({ [mode]: { id: crypto.randomUUID(), mode, items: questions.map(makeItem), currentIndex: 0, startedAt: now.toISOString(), ...(mode === 'mock' ? { deadline: new Date(now.getTime() + minutes * 60000).toISOString() } : {}) } })
  },
  patchItem: (context, patch) => set(state => { const item = getItem(state, context); if (!item) return {}; return updateItem(state, context, old => ({ ...old, ...patch })) }),
  addTime: (context, seconds, recordId) => set(state => {
    const item = getItem(state, context)
    if (!item || item.recordId !== recordId || item.mastery || !Number.isFinite(seconds) || seconds <= 0 || context.kind !== 'detail' && state[context.kind]?.completedAt) return {}
    const p = state.progress[item.questionId] ?? blankProgress(item.questionId)
    return { ...updateItem(state, context, old => ({ ...old, seconds: old.seconds + seconds })), progress: { ...state.progress, [p.questionId]: { ...p, totalSeconds: p.totalSeconds + seconds } } }
  }),
  rate: (context, rating) => set(state => {
    const item = getItem(state, context)
    if (!item || context.kind === 'mock' || state.mock && !state.mock.completedAt || context.kind === 'practice' && state.practice?.completedAt || state.records.some(record => record.id === item.recordId)) return {}
    const updated = { ...item, mastery: rating, status: rating === 'again' ? 'again' as const : 'answered' as const }
    const now = new Date().toISOString()
    const records = [...state.records, recordFor(updated, context.kind === 'detail' ? `detail-${item.recordId}` : state.practice!.id, 'practice', now)]
    const p = withBaseline(state.progress[item.questionId] ?? blankProgress(item.questionId), state.records)
    return { ...updateItem(state, context, () => updated), records, progress: { ...state.progress, [p.questionId]: rebuildProgress({ ...p, attempts: p.attempts + 1 }, records) } }
  }),
  move: (kind, index) => { flushClocks(); set(state => {
    const session = state[kind]
    if (!session || index < 0 || index >= session.items.length) return {}
    const current = session.items[session.currentIndex]
    if (kind === 'practice' && index > session.currentIndex && current.revealed && !current.mastery && current.status !== 'skipped') return {}
    return { [kind]: { ...session, currentIndex: index } }
  }) },
  finish: kind => {
    flushClocks()
    const session = get()[kind]
    if (!session) return undefined
    if (session.completedAt) return session.id
    const now = new Date().toISOString()
    const completedAt = kind === 'mock' && session.deadline! < now ? session.deadline! : now
    set(state => {
      const finished: PracticeSession = { ...session, completedAt, items: session.items.map(item => kind === 'mock' && item.status === 'again' ? { ...item, mastery: 'again' } : item) }
      const records = [...state.records]
      const progress = { ...state.progress }
      if (kind === 'mock') for (const item of session.items) {
        if (records.some(record => record.id === item.recordId)) continue
        const record = recordFor({ ...item, mastery: item.status === 'again' ? 'again' : undefined }, session.id, 'mock', completedAt)
        records.push(record)
        const p = withBaseline(progress[item.questionId] ?? blankProgress(item.questionId), state.records)
        progress[item.questionId] = rebuildProgress({ ...p, attempts: p.attempts + (item.status !== 'unanswered' && item.status !== 'skipped' ? 1 : 0) }, records)
      }
      return { [kind]: finished, records, progress, history: [...state.history.filter(old => old.id !== session.id), finished] }
    })
    return session.id
  },
  rateReport: (sessionId, questionId, rating) => set(state => {
    const session = state.history.find(s => s.id === sessionId)
    const item = session?.items.find(i => i.questionId === questionId)
    if (!session || !item || !state.records.some(r => r.id === item.recordId)) return {}
    const records = state.records.map(record => record.id === item.recordId ? { ...record, mastery: rating } : record)
    const p = state.progress[questionId] ?? blankProgress(questionId)
    const updated = { ...session, items: session.items.map(i => i.questionId === questionId ? { ...i, mastery: rating } : i) }
    return { records, progress: { ...state.progress, [questionId]: rebuildProgress(p, records) }, history: state.history.map(s => s.id === sessionId ? updated : s), ...(state.mock?.id === sessionId ? { mock: updated } : {}) }
  }),
  importData: data => { const valid = validateData(data); flushClocks(); preserveUnreadableStorage = false; useStorageStatus.getState().setError(null); set(valid) },
  clear: () => { flushClocks(); preserveUnreadableStorage = false; useStorageStatus.getState().setError(null); set(emptyData()) },
}), {
  name: STORAGE_KEY, version: 2,
  storage: createJSONStorage(() => safeStorage),
  partialize: ({ progress, details, practice, mock, history, records, theme, filters }) => ({ progress, details, practice, mock, history, records, theme, filters }),
  migrate: data => validateData(data, true),
  merge: (persisted, current) => ({ ...current, ...validateData(persisted, true) }),
}))

export function exportData() { return JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), state: validateData(useLearning.getState()) }, null, 2) }
