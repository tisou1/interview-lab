import type { QuestionType } from '../types'

export type CodeLanguage = 'text' | 'javascript' | 'typescript' | 'html' | 'css'

export const codeLanguages: CodeLanguage[] = ['text', 'javascript', 'typescript', 'html', 'css']

export const codeLanguageNames: Record<CodeLanguage, string> = {
  text: '纯文本',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  html: 'HTML',
  css: 'CSS',
}

export function isCodeQuestion(type: QuestionType) {
  return type === 'coding' || type === 'debugging'
}

// 非代码题用纯文本模式（不注册语言、无高亮），仍复用同一个编辑器。
export function detectCodeLanguage(question: {
  type: QuestionType
  category: string
  tags: string[]
  title: string
}): CodeLanguage {
  if (!isCodeQuestion(question.type)) return 'text'
  if (question.category === 'typescript') return 'typescript'
  const haystack = `${question.title} ${question.tags.join(' ')}`.toLowerCase()
  if (haystack.includes('typescript')) return 'typescript'
  if (haystack.includes('html') || haystack.includes('dom')) return 'html'
  if (haystack.includes('css') || haystack.includes('样式')) return 'css'
  return 'javascript'
}
