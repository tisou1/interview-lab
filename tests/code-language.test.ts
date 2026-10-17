import { describe, expect, it } from 'vitest'
import { detectCodeLanguage, isCodeQuestion } from '../src/lib/codeLanguage'

describe('code question language', () => {
  it('treats coding and debugging questions as code questions', () => {
    expect(isCodeQuestion('coding')).toBe(true)
    expect(isCodeQuestion('debugging')).toBe(true)
    expect(isCodeQuestion('theory')).toBe(false)
    expect(isCodeQuestion('scenario')).toBe(false)
  })

  it('falls back to plain text for non-code questions', () => {
    expect(
      detectCodeLanguage({ type: 'theory', category: 'javascript', tags: ['React'], title: 'key' }),
    ).toBe('text')
    expect(
      detectCodeLanguage({ type: 'scenario', category: 'architecture', tags: [], title: '设计' }),
    ).toBe('text')
  })

  it('infers the highlighting language from question metadata', () => {
    expect(
      detectCodeLanguage({ type: 'coding', category: 'typescript', tags: [], title: '' }),
    ).toBe('typescript')
    expect(
      detectCodeLanguage({
        type: 'coding',
        category: 'javascript',
        tags: ['TypeScript'],
        title: '',
      }),
    ).toBe('typescript')
    expect(
      detectCodeLanguage({
        type: 'coding',
        category: 'browser',
        tags: [],
        title: '实现 HTML 模板',
      }),
    ).toBe('html')
    expect(
      detectCodeLanguage({ type: 'coding', category: 'engineering', tags: ['CSS'], title: '' }),
    ).toBe('css')
    expect(
      detectCodeLanguage({
        type: 'coding',
        category: 'javascript',
        tags: ['Promise'],
        title: '手写 Promise.all',
      }),
    ).toBe('javascript')
  })
})
