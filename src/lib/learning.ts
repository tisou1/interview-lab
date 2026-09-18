import type {
  Category,
  QuestionMeta,
  QuestionProgress,
  Rating,
  SavedData,
  SessionItem,
  StudyRecord,
} from '../types'

export function localDate(value: Date | string = new Date()) {
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
export function blankProgress(id: number): QuestionProgress {
  return {
    questionId: id,
    mastery: 'new',
    favorite: false,
    attempts: 0,
    goodStreak: 0,
    totalSeconds: 0,
    draft: '',
  }
}
export function applyRating(
  progress: QuestionProgress,
  rating: Rating,
  now: string,
): QuestionProgress {
  const goodStreak = rating === 'good' ? progress.goodStreak + 1 : 0
  const days =
    rating === 'again'
      ? 1
      : rating === 'hard'
        ? 3
        : goodStreak === 1
          ? 7
          : goodStreak === 2
            ? 14
            : 30
  return {
    ...progress,
    mastery: rating,
    goodStreak,
    lastReviewedAt: now,
    nextReviewAt: addDays(new Date(now), days).toISOString(),
  }
}
export function rebuildProgress(progress: QuestionProgress, records: StudyRecord[]) {
  let result = {
    ...progress,
    mastery: 'new' as const,
    goodStreak: 0,
    lastReviewedAt: undefined,
    nextReviewAt: undefined,
    ...progress.ratingBase,
  } as QuestionProgress
  for (const record of records
    .filter((r) => r.questionId === progress.questionId && r.mastery)
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt)))
    result = applyRating(result, record.mastery!, record.submittedAt)
  return result
}
export function withBaseline(progress: QuestionProgress, records: StudyRecord[]): QuestionProgress {
  if (
    progress.ratingBase ||
    records.some((record) => record.questionId === progress.questionId && record.mastery)
  )
    return progress
  const { mastery, goodStreak, lastReviewedAt, nextReviewAt } = progress
  return { ...progress, ratingBase: { mastery, goodStreak, lastReviewedAt, nextReviewAt } }
}
export function isDue(progress?: QuestionProgress, now = new Date()) {
  return !!progress?.nextReviewAt && progress.nextReviewAt <= now.toISOString()
}
export function formatTime(seconds: number) {
  const n = Math.max(0, Math.floor(seconds))
  return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`
}
export function makeItem(question: QuestionMeta): SessionItem {
  return {
    questionId: question.id,
    title: question.title,
    category: question.category,
    difficulty: question.difficulty,
    recordId: crypto.randomUUID(),
    seconds: 0,
    status: 'unanswered',
    flagged: false,
    revealed: false,
  }
}
export function shuffle<T>(items: T[], random = Math.random) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
export function drawQuestions(
  pool: QuestionMeta[],
  count: number,
  progress: SavedData['progress'],
  priority: boolean,
  randomOrder: boolean,
  random = Math.random,
) {
  const groups = new Map<Category, QuestionMeta[]>()
  for (const question of shuffle(pool, random))
    groups.set(question.category, [...(groups.get(question.category) ?? []), question])
  if (priority)
    for (const group of groups.values())
      group.sort(
        (a, b) =>
          Number(['again', 'hard'].includes(progress[b.id]?.mastery)) -
          Number(['again', 'hard'].includes(progress[a.id]?.mastery)),
      )
  const selected: QuestionMeta[] = []
  while (selected.length < Math.min(count, pool.length)) {
    for (const group of groups.values()) {
      if (selected.length >= count) break
      const item = group.shift()
      if (item) selected.push(item)
    }
  }
  return randomOrder ? shuffle(selected, random) : selected.sort((a, b) => a.id - b.id)
}
export function filterQuestions(
  questions: QuestionMeta[],
  params: URLSearchParams,
  progress: SavedData['progress'],
) {
  const query = (params.get('q') ?? '').toLowerCase().trim()
  const result = questions.filter((question) => {
    const p = progress[question.id]
    return (
      (!query || question.searchText.includes(query) || String(question.id) === query) &&
      (!params.get('category') || params.get('category') === question.category) &&
      (!params.get('difficulty') || params.get('difficulty') === question.difficulty) &&
      (!params.get('type') || params.get('type') === question.type) &&
      (!params.get('tag') || question.tags.includes(params.get('tag')!)) &&
      (params.get('status') !== 'favorite' || p?.favorite) &&
      (params.get('status') !== 'wrong' || p?.mastery === 'again' || p?.mastery === 'hard') &&
      (params.get('status') !== 'new' || !p || p.mastery === 'new') &&
      (params.get('status') !== 'due' || isDue(p))
    )
  })
  const levels = { basic: 0, intermediate: 1, advanced: 2 }
  return result.sort((a, b) =>
    params.get('sort') === 'difficulty'
      ? levels[a.difficulty] - levels[b.difficulty] || a.id - b.id
      : params.get('sort') === 'recent'
        ? (progress[b.id]?.lastReviewedAt ?? '').localeCompare(
            progress[a.id]?.lastReviewedAt ?? '',
          ) || a.id - b.id
        : a.id - b.id,
  )
}
export function dailyStats(records: StudyRecord[], days: number, now = new Date()) {
  return Array.from({ length: days }, (_, index) => {
    const date = localDate(addDays(now, index - days + 1))
    const matches = records.filter(
      (record) =>
        record.localDate === date && record.status !== 'unanswered' && record.status !== 'skipped',
    )
    return {
      label: date.slice(5),
      fullLabel: date,
      count: matches.length,
      minutes:
        Math.round((matches.reduce((sum, record) => sum + record.seconds, 0) / 60) * 10) / 10,
    }
  })
}
