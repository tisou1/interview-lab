import index from './generated/index.json'
import type { Category, Question, QuestionMeta } from '../types'
export const questions = index as QuestionMeta[]
export const questionMap = new Map(questions.map(question => [question.id, question]))
const loaders = import.meta.glob<{ default: Question[] }>(['./generated/*.json', '!./generated/index.json', '!./generated/roadmap.json'])
const cache = new Map<Category, Promise<Question[]>>()
export async function loadQuestion(id: number): Promise<Question | undefined> {
  const meta = questionMap.get(id)
  if (!meta) return undefined
  let promise = cache.get(meta.category)
  if (!promise) {
    promise = loaders[`./generated/${meta.category}.json`]()
      .then(module => module.default).catch(error => { cache.delete(meta.category); throw error })
    cache.set(meta.category, promise)
  }
  return (await promise).find(question => question.id === id)
}
