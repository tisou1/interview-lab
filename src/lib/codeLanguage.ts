import type { QuestionType } from '../types'

export type CodeLanguage = 'javascript' | 'typescript' | 'html' | 'css'

export const codeLanguages: CodeLanguage[] = ['javascript', 'typescript', 'html', 'css']

export const codeLanguageNames: Record<CodeLanguage, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  html: 'HTML',
  css: 'CSS',
}

export function isCodeQuestion(type: QuestionType) {
  return type === 'coding' || type === 'debugging'
}

export function detectCodeLanguage(question: {
  category: string
  tags: string[]
  title: string
}): CodeLanguage {
  if (question.category === 'typescript') return 'typescript'
  const haystack = `${question.title} ${question.tags.join(' ')}`.toLowerCase()
  if (haystack.includes('typescript')) return 'typescript'
  if (haystack.includes('html') || haystack.includes('dom')) return 'html'
  if (haystack.includes('css') || haystack.includes('样式')) return 'css'
  return 'javascript'
}
