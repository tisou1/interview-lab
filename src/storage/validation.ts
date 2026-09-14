import { categoryNames, difficultyNames } from '../types'
import type { SavedData } from '../types'
export function emptyData(): SavedData { return { progress: {}, details: {}, practice: null, mock: null, history: [], records: [], theme: 'light', filters: '' } }
type Obj = Record<string, any>
const object = (value: unknown): value is Obj => !!value && typeof value === 'object' && !Array.isArray(value)
const finite = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0
const integer = (value: unknown) => finite(value) && Number.isInteger(value)
const date = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value))
const rating = (value: unknown) => ['again', 'hard', 'good'].includes(String(value))
const validItem = (item: unknown): boolean => object(item) && integer(item.questionId) && item.questionId > 0 && typeof item.title === 'string' && Object.hasOwn(categoryNames, item.category) && Object.hasOwn(difficultyNames, item.difficulty) && typeof item.recordId === 'string' && !!item.recordId && finite(item.seconds) && ['unanswered', 'answered', 'again', 'skipped'].includes(item.status) && typeof item.flagged === 'boolean' && typeof item.revealed === 'boolean' && (item.mastery === undefined || rating(item.mastery))
const validSession = (session: unknown): boolean => object(session) && typeof session.id === 'string' && !!session.id && ['practice', 'mock'].includes(session.mode) && Array.isArray(session.items) && session.items.length > 0 && session.items.length <= 10000 && session.items.every(validItem) && new Set(session.items.map((item: Obj) => item.questionId)).size === session.items.length && new Set(session.items.map((item: Obj) => item.recordId)).size === session.items.length && integer(session.currentIndex) && session.currentIndex < session.items.length && date(session.startedAt) && (session.completedAt === undefined || date(session.completedAt)) && (session.mode !== 'mock' || date(session.deadline))

export function validateData(input: unknown, legacy = false): SavedData {
  if (!object(input)) throw new Error('学习数据必须是对象')
  const value = legacy ? { ...emptyData(), ...input } : input
  if (!object(value.progress)) throw new Error('学习进度格式错误')
  for (const [key, p] of Object.entries(value.progress)) {
    if (!object(p) || String(p.questionId) !== key || !integer(p.questionId) || p.questionId < 1 || !['new', 'again', 'hard', 'good'].includes(p.mastery) || typeof p.favorite !== 'boolean' || !integer(p.attempts) || !integer(p.goodStreak) || !finite(p.totalSeconds) || typeof p.draft !== 'string' || (p.lastReviewedAt !== undefined && !date(p.lastReviewedAt)) || (p.nextReviewAt !== undefined && !date(p.nextReviewAt))) throw new Error(`题目 ${key} 的学习进度无效`)
    if (p.ratingBase !== undefined && (!object(p.ratingBase) || !['new', 'again', 'hard', 'good'].includes(p.ratingBase.mastery) || !integer(p.ratingBase.goodStreak) || p.ratingBase.lastReviewedAt !== undefined && !date(p.ratingBase.lastReviewedAt) || p.ratingBase.nextReviewAt !== undefined && !date(p.ratingBase.nextReviewAt))) throw new Error(`题目 ${key} 的历史基线无效`)
  }
  if (!object(value.details) || !Object.entries(value.details).every(([key, item]) => validItem(item) && String((item as Obj).questionId) === key)) throw new Error('单题练习数据无效')
  if (value.practice !== null && (!validSession(value.practice) || value.practice.mode !== 'practice')) throw new Error('练习场次无效')
  if (value.mock !== null && (!validSession(value.mock) || value.mock.mode !== 'mock')) throw new Error('模拟面试场次无效')
  if (!Array.isArray(value.history) || !value.history.every((s: unknown) => validSession(s) && !!(s as Obj).completedAt) || new Set(value.history.map((s: Obj) => s.id)).size !== value.history.length) throw new Error('历史场次无效')
  if (!Array.isArray(value.records) || !value.records.every((r: unknown) => object(r) && typeof r.id === 'string' && !!r.id && integer(r.questionId) && r.questionId > 0 && typeof r.sessionId === 'string' && ['practice', 'mock'].includes(r.mode) && Object.hasOwn(categoryNames, r.category) && date(r.submittedAt) && /^\d{4}-\d{2}-\d{2}$/.test(r.localDate) && finite(r.seconds) && ['unanswered', 'answered', 'again', 'skipped'].includes(r.status) && (r.mastery === undefined || rating(r.mastery))) || new Set(value.records.map((r: Obj) => r.id)).size !== value.records.length) throw new Error('学习记录无效或重复')
  if (!['light', 'dark'].includes(value.theme) || typeof value.filters !== 'string') throw new Error('偏好设置无效')
  return { progress: value.progress, details: value.details, practice: value.practice, mock: value.mock, history: value.history, records: value.records, theme: value.theme, filters: value.filters }
}
export function decodeBackup(text: string) {
  if (text.length > 20 * 1024 * 1024) throw new Error('文件超过 20 MB，请检查文件是否正确')
  const payload = JSON.parse(text)
  if (!object(payload) || ![1, 2].includes(payload.version)) throw new Error('不支持的数据版本')
  return validateData(payload.state, payload.version === 1)
}
