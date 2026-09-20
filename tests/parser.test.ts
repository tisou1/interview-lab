// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseQuestions, sourceFiles } from '../scripts/build-question-data.mjs'
const meta =
  '<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["Promise"],"estimatedMinutes":10} -->'
const fixture = (answer = '### 参考答案\n\n正确答案。', id = 900) =>
  `## ${id}. 测试题\n\n${meta}\n\n题干。\n\n<details>\n<summary>答案</summary>\n\n${answer}\n\n</details>\n`

/** 改版前已发布的编号必须保留，否则按 ID 记录的学习进度会失去对应关系。 */
const LEGACY_IDS = Array.from({ length: 115 }, (_, index) => index + 1)

/** 答案小节的约定名称，新增题目必须复用其中之一。 */
const SECTION_TITLES = new Set([
  '核心答案',
  '原理与示例',
  '边界与易错点',
  '追问',
  '参考实现',
  '复杂度与取舍',
  '设计框架',
  '设计要点与边界',
  '排查步骤',
  '评分点',
])

describe('Markdown source pipeline', () => {
  it('preserves the legacy IDs and keeps every question valid', () => {
    const questions = parseQuestions(readFileSync(sourceFiles[0], 'utf8'))
    const ids = questions.map((question) => question.id)

    expect(new Set(ids).size).toBe(ids.length)
    expect(questions.length).toBeGreaterThanOrEqual(150)
    for (const id of LEGACY_IDS) expect(ids).toContain(id)
    expect(ids.filter((id) => id >= 116)).toHaveLength(questions.length - LEGACY_IDS.length)
    expect(questions.find((question) => question.id === 96)?.answerSections[0].html).toContain(
      'reduceRight',
    )
    expect(questions.find((question) => question.id === 98)?.promptHtml).toContain('setPending')
    expect(questions.every((question) => question.source.line > 0)).toBe(true)
  })
  it('keeps answer sections non-empty, consistently named and free of broken code blocks', () => {
    const questions = parseQuestions(readFileSync(sourceFiles[0], 'utf8'))

    for (const question of questions) {
      expect(question.answerSections.length, `Q${question.id} 缺少答案小节`).toBeGreaterThan(0)

      for (const section of question.answerSections) {
        expect(section.title.trim(), `Q${question.id} 小节标题为空`).not.toBe('')
        expect(
          SECTION_TITLES.has(section.title),
          `Q${question.id} 使用了未约定的小节名：${section.title}`,
        ).toBe(true)
        expect(section.html.replace(/<[^>]*>|\s/g, ''), `Q${question.id} 存在空小节`).not.toBe('')
        // 代码块内出现块级标签说明 HTML 块被空行截断，同一段代码会被渲染成多块
        const preBlocks = section.html.match(/<pre>[\s\S]*?<\/pre>/g) ?? []
        expect(
          preBlocks.every((block: string) => !/<(p|div|ul|ol|li|h[1-6]|table)\b/.test(block)),
          `Q${question.id} 的代码块结构被破坏`,
        ).toBe(true)
      }
    }
  })
  it('accepts a new Markdown question without changing application code', () => {
    const source = readFileSync(sourceFiles[0], 'utf8')
    const before = parseQuestions(source)
    const after = parseQuestions(source + '\n\n' + fixture())

    expect(after).toHaveLength(before.length + 1)
    expect(after.at(-1)?.answerSections[0].html).toContain('正确答案')
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
    [fixture().replace('900. 测试题', '900. '), '标题'],
  ])('rejects invalid content with file and line diagnostics', (source, message) => {
    expect(() => parseQuestions(source, 'bank.md')).toThrow(new RegExp(`bank.md:\\d+:.*${message}`))
  })
})
