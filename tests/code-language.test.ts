import { describe, expect, it } from 'vitest'
import { detectCodeLanguage, isCodeQuestion } from '../src/lib/codeLanguage'

describe('code question language', () => {
  it('treats coding and debugging questions as code questions', () => {
    expect(isCodeQuestion('coding')).toBe(true)
    expect(isCodeQuestion('debugging')).toBe(true)
    expect(isCodeQuestion('theory')).toBe(false)
    expect(isCodeQuestion('scenario')).toBe(false)
  })

  it('infers the highlighting language from question metadata', () => {
    expect(detectCodeLanguage({ category: 'typescript', tags: [], title: '' })).toBe('typescript')
    expect(detectCodeLanguage({ category: 'javascript', tags: ['TypeScript'], title: '' })).toBe(
      'typescript',
    )
    expect(detectCodeLanguage({ category: 'browser', tags: [], title: '实现 HTML 模板' })).toBe(
      'html',
    )
    expect(detectCodeLanguage({ category: 'engineering', tags: ['CSS'], title: '' })).toBe('css')
    expect(
      detectCodeLanguage({ category: 'javascript', tags: ['Promise'], title: '手写 Promise.all' }),
    ).toBe('javascript')
  })
})
