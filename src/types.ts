import type { ThemeId } from './lib/themes'
export const categoryNames = {
  javascript: 'JavaScript',
  react: 'React',
  browser: '浏览器与网络',
  typescript: 'TypeScript',
  engineering: '工程化',
  coding: '代码实战',
  architecture: '系统设计',
} as const
export type Category = keyof typeof categoryNames
export const difficultyNames = { basic: '基础', intermediate: '进阶', advanced: '深入' } as const
export type Difficulty = keyof typeof difficultyNames
export const typeNames = {
  theory: '原理题',
  coding: '代码题',
  debugging: '排障题',
  scenario: '场景题',
} as const
export type QuestionType = keyof typeof typeNames
export const masteryNames = { new: '未学习', again: '不会', hard: '模糊', good: '掌握' } as const
export type Mastery = keyof typeof masteryNames
export type Rating = Exclude<Mastery, 'new'>
export interface QuestionMeta {
  id: number
  slug: string
  title: string
  category: Category
  type: QuestionType
  difficulty: Difficulty
  tags: string[]
  estimatedMinutes: number
  source: { file: string; line: number }
  searchText: string
}
export interface Question extends QuestionMeta {
  promptHtml: string
  answerSections: { id: string; title: string; html: string }[]
}
export interface QuestionProgress {
  questionId: number
  mastery: Mastery
  favorite: boolean
  attempts: number
  goodStreak: number
  lastReviewedAt?: string
  nextReviewAt?: string
  totalSeconds: number
  draft: string
  ratingBase?: {
    mastery: Mastery
    goodStreak: number
    lastReviewedAt?: string
    nextReviewAt?: string
  }
}
export type AnswerStatus = 'unanswered' | 'answered' | 'again' | 'skipped'
export interface SessionItem {
  questionId: number
  title: string
  category: Category
  difficulty: Difficulty
  recordId: string
  seconds: number
  status: AnswerStatus
  flagged: boolean
  revealed: boolean
  mastery?: Rating
}
export interface PracticeSession {
  id: string
  mode: 'practice' | 'mock'
  items: SessionItem[]
  currentIndex: number
  startedAt: string
  completedAt?: string
  deadline?: string
}
export interface StudyRecord {
  id: string
  questionId: number
  sessionId: string
  mode: 'practice' | 'mock'
  category: Category
  submittedAt: string
  localDate: string
  seconds: number
  status: AnswerStatus
  mastery?: Rating
}
export interface SavedData {
  progress: Record<number, QuestionProgress>
  details: Record<number, SessionItem>
  practice: PracticeSession | null
  mock: PracticeSession | null
  history: PracticeSession[]
  records: StudyRecord[]
  theme: ThemeId
  filters: string
}
export type Context = { kind: 'detail'; questionId: number } | { kind: 'practice' | 'mock' }
