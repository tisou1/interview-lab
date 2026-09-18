// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseQuestions, sourceFiles } from '../scripts/build-question-data.mjs'
const meta =
  '<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["Promise"],"estimatedMinutes":10} -->'
const fixture = (answer = '### 参考答案\n\n正确答案。', id = 116) =>
  `## ${id}. 测试题\n\n${meta}\n\n题干。\n\n<details>\n<summary>答案</summary>\n\n${answer}\n\n</details>\n`
describe('Markdown source pipeline', () => {
  it('preserves all 115 stable IDs and unheaded code in the real source', () => {
    const questions = parseQuestions(readFileSync(sourceFiles[0], 'utf8'))
    expect(questions).toHaveLength(115)
    expect(new Set(questions.map((q) => q.id)).size).toBe(115)
    expect(questions.map((q) => q.id)).toEqual(Array.from({ length: 115 }, (_, i) => i + 1))
    expect(questions.find((q) => q.id === 96)?.answerSections[0].html).toContain('reduceRight')
    expect(questions.find((q) => q.id === 98)?.promptHtml).toContain('setPending')
    expect(questions.every((q) => q.source.line > 0 && q.answerSections.length > 0)).toBe(true)
  })
  it('accepts a new Markdown question without changing application code', () => {
    const questions = parseQuestions(readFileSync(sourceFiles[0], 'utf8') + '\n\n' + fixture())
    expect(questions).toHaveLength(116)
    expect(questions.at(-1)?.answerSections[0].html).toContain('正确答案')
  })
  it('supports HTML and Markdown answer headings and preserves introductory code', () => {
    const question = parseQuestions(
      fixture(
        '```js\nconst value = 1\n```\n\n<h3>追问</h3>\n<p>边界</p>\n\n### 易错点\n\n不要遗漏。',
      ),
    )[0]
    expect(question.answerSections.map((s) => s.title)).toEqual(['核心答案', '追问', '易错点'])
    expect(question.answerSections[0].html).toContain('const value = 1')
  })
  it('does not treat fenced headings as questions', () => {
    const question = parseQuestions(fixture('```md\n## 999. 假题目\n```\n\n真实答案'))
    expect(question).toHaveLength(1)
    expect(question[0].answerSections[0].html).toContain('999.')
  })
  it('sanitizes unsafe HTML and external links', () => {
    const question = parseQuestions(
      fixture(
        '<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">\n\n<a href="javascript:alert(1)">bad</a>\n\n[外部](https://example.com)',
      ),
    )[0]
    const html = question.answerSections.map((s) => s.html).join('')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('onerror')
    expect(html).not.toContain('javascript:')
    expect(html).toContain('noopener noreferrer')
  })
  it.each([
    [fixture() + '\n' + fixture(), '重复'],
    [fixture().replace(meta, ''), '元数据'],
    [fixture().replace('"intermediate"', '"invalid"'), '难度'],
    [fixture().replace('</details>', ''), '结构'],
    [fixture(''), '不能为空'],
    [fixture().replace('116. 测试题', '116. '), '标题'],
  ])('rejects invalid content with file and line diagnostics', (source, message) => {
    expect(() => parseQuestions(source, 'bank.md')).toThrow(new RegExp(`bank.md:\\d+:.*${message}`))
  })
})
