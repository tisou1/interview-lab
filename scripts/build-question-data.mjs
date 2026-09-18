import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const sourceFiles = [
  path.join(root, 'fe/JavaScript_React原理与实战模拟面试题库.md'),
  path.join(root, 'fe/前端技术深度进阶路线_12周_求职版_最终整合.md'),
]
export const categories = [
  'javascript',
  'react',
  'browser',
  'typescript',
  'engineering',
  'coding',
  'architecture',
]
const reader = unified().use(remarkParse).use(remarkGfm)
const renderer = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSanitize, {
    ...defaultSchema,
    attributes: { ...defaultSchema.attributes, code: [['className', /^language-./]], '*': [] },
  })
const writer = unified().use(rehypeStringify)
const plain = (node) => node.value ?? (node.children ?? []).map(plain).join('')
const html = (children) => writer.stringify({ type: 'root', children })

function openExternalLinks(node) {
  if (node.tagName === 'a' && /^https?:/.test(String(node.properties?.href))) {
    node.properties.rel = ['noopener', 'noreferrer']
    node.properties.target = '_blank'
  }
  node.children?.forEach(openExternalLinks)
}

function safeTree(markdown) {
  const tree = renderer.runSync(renderer.parse(markdown))
  openExternalLinks(tree)
  return tree
}

export function renderMarkdown(markdown) {
  return html(safeTree(markdown).children)
}

export function parseQuestions(markdown, filename = 'questions.md') {
  const tree = reader.parse(markdown)
  const boundaries = tree.children.filter((node) => node.type === 'heading' && node.depth <= 2)
  const result = []
  const seen = new Set()
  for (let index = 0; index < boundaries.length; index++) {
    const heading = boundaries[index]
    const label = plain(heading)
    const match = heading.depth === 2 && /^(\d+)\.\s*(.*)$/.exec(label)
    if (!match || Number(match[1]) === 0) continue
    const id = Number(match[1])
    const title = match[2].trim()
    const fail = (message) => {
      throw new Error(`${filename}:${heading.position.start.line}: Q${id} ${message}`)
    }
    if (!Number.isSafeInteger(id) || id < 1) fail('编号必须为正整数')
    if (!title) fail('题目标题不能为空')
    if (seen.has(id)) fail('题目编号重复')
    seen.add(id)
    const body = markdown.slice(
      heading.position.end.offset,
      boundaries[index + 1]?.position.start.offset ?? markdown.length,
    )
    const metadataMatches = [...body.matchAll(/<!--\s*question:\s*([\s\S]*?)-->/g)]
    if (metadataMatches.length !== 1) fail('每道题需要且仅需要一份 question 元数据')
    let metadata
    try {
      metadata = JSON.parse(metadataMatches[0][1])
    } catch {
      fail('question 元数据不是有效 JSON')
    }
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata))
      fail('元数据必须为对象')
    if (!categories.includes(metadata.category)) fail('分类无效')
    if (!['theory', 'coding', 'debugging', 'scenario'].includes(metadata.type)) fail('题型无效')
    if (!['basic', 'intermediate', 'advanced'].includes(metadata.difficulty)) fail('难度无效')
    if (
      !Array.isArray(metadata.tags) ||
      !metadata.tags.length ||
      metadata.tags.some((tag) => typeof tag !== 'string' || !tag.trim())
    )
      fail('tags 必须为非空字符串数组')
    if (!Number.isFinite(metadata.estimatedMinutes) || metadata.estimatedMinutes <= 0)
      fail('预计用时必须大于 0')
    const bodyAst = reader.parse(body)
    const details = bodyAst.children.find(
      (node) => node.type === 'html' && /^\s*<details(?:\s[^>]*)?>/i.test(node.value),
    )
    if (!details) fail('缺少 <details> 答案区')
    const start = details.position.start.offset
    const remainder = body.slice(start)
    const open = /^\s*<details(?:\s[^>]*)?>/i.exec(remainder)
    const end = remainder.lastIndexOf('</details>')
    if (
      end < 0 ||
      (remainder.match(/<details(?:\s[^>]*)?>/g) ?? []).length !== 1 ||
      (remainder.match(/<\/details>/g) ?? []).length !== 1
    )
      fail('答案区 details 结构不完整或嵌套')
    if (body.slice(start + end + 10).replace(/\s|---/g, '')) fail('答案区之后有未归属内容')
    const answer = remainder
      .slice(open[0].length, end)
      .replace(/<summary\b[^>]*>[\s\S]*?<\/summary>/i, '')
    const answerTree = safeTree(answer)
    const flattened = []
    function flatten(nodes) {
      for (const node of nodes) {
        if (node.type === 'element' && node.tagName === 'div') flatten(node.children)
        else flattened.push(node)
      }
    }
    flatten(answerTree.children)
    const answerSections = []
    let sectionTitle = '核心答案'
    let nodes = []
    const flush = () => {
      if (!nodes.some((node) => node.type !== 'text' || node.value.trim())) {
        nodes = []
        return
      }
      answerSections.push({
        id: `q${id}-section-${answerSections.length}`,
        title: sectionTitle,
        html: html(nodes),
      })
      nodes = []
    }
    for (const node of flattened) {
      if (node.type === 'element' && /^h[2-4]$/.test(node.tagName)) {
        flush()
        sectionTitle = plain(node) || '解析'
      } else nodes.push(node)
    }
    flush()
    if (!answerSections.length || !answerSections.some((s) => s.html.replace(/<[^>]*>|\s/g, '')))
      fail('参考答案不能为空')
    const prompt = body.slice(0, start).replace(metadataMatches[0][0], '').trim()
    result.push({
      id,
      slug: `question-${id}`,
      title,
      category: metadata.category,
      type: metadata.type,
      difficulty: metadata.difficulty,
      tags: metadata.tags,
      estimatedMinutes: metadata.estimatedMinutes,
      promptHtml: renderMarkdown(prompt),
      answerSections,
      source: { file: filename, line: heading.position.start.line },
    })
  }
  if (!result.length) throw new Error(`${filename}:1: 未找到题目`)
  return result
}

export function buildContent() {
  // Finish all parsing before replacing generated files, so malformed edits retain the last valid data.
  const questions = parseQuestions(
    fs.readFileSync(sourceFiles[0], 'utf8'),
    'fe/' + path.basename(sourceFiles[0]),
  )
  const roadmap = renderMarkdown(fs.readFileSync(sourceFiles[1], 'utf8'))
  const output = path.join(root, 'src/data/generated')
  fs.mkdirSync(output, { recursive: true })
  const write = (name, value) => {
    const text = JSON.stringify(value)
    const target = path.join(output, name + '.json')
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== text)
      fs.writeFileSync(target, text)
  }
  write(
    'index',
    questions.map(({ promptHtml, answerSections, ...question }) => ({
      ...question,
      searchText: `${question.title} ${question.tags.join(' ')}`.toLowerCase(),
    })),
  )
  for (const category of categories)
    write(
      category,
      questions.filter((question) => question.category === category),
    )
  write('roadmap', { html: roadmap })
  return questions
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`题库构建完成：${buildContent().length} 道题`)
}
