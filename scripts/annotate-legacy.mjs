// One-time migration: metadata stays in Markdown after this script runs.
import fs from 'node:fs'
const filename = new URL('../fe/JavaScript_React原理与实战模拟面试题库.md', import.meta.url)
const input = fs.readFileSync(filename, 'utf8')
const advanced = new Set([14, 18, 24, 26, 27, 28, 35, 36, 37, 38, 39, 40, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 88, 92, 93, 102, 105, 106, 110, 111, 112, 113, 114, 115])
const output = input.replace(/^(## (\d+)\. ([^\r\n]+))\r?\n(?!\r?\n<!-- question:)/gm, (full, heading, number, title) => {
  const id = Number(number)
  if (!id || id > 115) return full
  const category = id <= 28 || (id >= 86 && id <= 97) ? 'javascript' : id <= 72 || (id >= 98 && id <= 109) ? 'react' : id <= 77 ? 'browser' : id <= 81 ? 'typescript' : id <= 85 ? 'engineering' : 'architecture'
  const type = [98, 104, 109].includes(id) ? 'debugging' : id >= 110 || [106, 107, 108].includes(id) ? 'scenario' : id >= 86 ? 'coding' : 'theory'
  const difficulty = advanced.has(id) ? 'advanced' : id <= 13 || [29, 30, 31, 73, 74, 78, 79].includes(id) ? 'basic' : 'intermediate'
  const concepts = title.match(/Promise|React|Hook[s]?|Effect|Context|Fiber|Suspense|TypeScript|Event Loop|ESM|CORS|CSP|CSRF|XSS|RBAC|SSR|LRU|debounce|throttle|reducer|state|闭包|原型链|缓存|泛型|性能|并发|测试|权限|请求|调度|模块/g) ?? []
  const tags = [...new Set([category === 'javascript' ? 'JavaScript' : category === 'react' ? 'React' : category === 'browser' ? '浏览器' : category === 'typescript' ? 'TypeScript' : category === 'engineering' ? '工程化' : '系统设计', ...concepts])]
  const metadata = { category, type, difficulty, tags, estimatedMinutes: type === 'coding' ? 10 : difficulty === 'advanced' ? 8 : difficulty === 'basic' ? 3 : 5 }
  return `${heading}\n\n<!-- question: ${JSON.stringify(metadata)} -->\n`
})
fs.writeFileSync(filename, output)
console.log('现有题目元数据已写入 Markdown')
