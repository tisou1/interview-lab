import { Link, useNavigate } from 'react-router'
import { questions, questionMap } from '../data/questions'
import { categoryNames, type Category } from '../types'
import { useLearning } from '../storage/store'
import { addDays, dailyStats, isDue, localDate } from '../lib/learning'
import { BarChart } from '../components/Chart'
import { Badge, Empty, Icon } from '../components/ui'
import styles from '../styles/App.module.css'

export function Metric({
  label,
  value,
  unit,
  note,
  icon,
}: {
  label: string
  value: number | string
  unit?: string
  note: string
  icon: string
}) {
  return (
    <div className={styles.metric}>
      <div className={styles.metricLabel}>
        {label}
        <Icon name={icon} size={17} />
      </div>
      <div className={styles.metricValue}>
        {value}
        <small>{unit}</small>
      </div>
      <div className={styles.metricFoot}>{note}</div>
    </div>
  )
}

// 队列里最长一次做多少题：再多就变成负担，剩下的明天继续。
const SESSION_LIMIT = 12

function dayLabel(value?: string) {
  if (!value) return ''
  const target = localDate(value)
  if (target === localDate()) return '今天'
  if (target === localDate(addDays(new Date(), -1))) return '昨天'
  return new Date(value).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

export default function Dashboard() {
  const progress = useLearning((s) => s.progress)
  const records = useLearning((s) => s.records)
  const practice = useLearning((s) => s.practice)
  const start = useLearning((s) => s.start)
  const navigate = useNavigate()

  const dueQuestions = questions.filter((q) => isDue(progress[q.id]))
  const due = dueQuestions.length
  const mastered = questions.filter((q) => progress[q.id]?.mastery === 'good').length
  const learned = questions.filter(
    (q) => progress[q.id]?.mastery && progress[q.id].mastery !== 'new',
  ).length
  const today = records.filter(
    (r) => r.localDate === localDate() && !['unanswered', 'skipped'].includes(r.status),
  )
  const recent = [...records].reverse().slice(0, 4)
  const categories = Object.keys(categoryNames).filter((c) =>
    questions.some((q) => q.category === c),
  ) as Category[]
  const trend = dailyStats(records, 7)
  const weekCount = trend.reduce((sum, day) => sum + day.count, 0)
  const queue = [...dueQuestions]
    .sort((a, b) =>
      (progress[a.id]?.nextReviewAt ?? '').localeCompare(progress[b.id]?.nextReviewAt ?? ''),
    )
    .slice(0, SESSION_LIMIT)
  const minutes = queue.reduce((sum, q) => sum + q.estimatedMinutes, 0)
  const resumable = practice && !practice.completedAt

  const activeDays = new Set(
    records
      .filter((r) => r.status !== 'unanswered' && r.status !== 'skipped')
      .map((r) => r.localDate),
  )
  let streak = 0
  for (let offset = 0; offset < 365; offset += 1) {
    if (!activeDays.has(localDate(addDays(new Date(), -offset)))) break
    streak += 1
  }
  const lastReviewedAt = records.reduce(
    (latest, record) => (record.submittedAt > latest ? record.submittedAt : latest),
    '',
  )
  const nextReviewAt = Object.values(progress)
    .map((item) => item.nextReviewAt)
    .filter((value): value is string => !!value)
    .sort()[0]

  const beginReview = () => {
    start('practice', queue, 0)
    navigate('/practice/session')
  }

  const headline = due ? (
    <>
      今天有 <b>{due}</b> 道题等你温习
    </>
  ) : learned ? (
    '今天的复习已经清空'
  ) : (
    '从一个问题开始'
  )
  const lead = due
    ? `按到期时间排好了顺序，这一组 ${queue.length} 道，预计 ${minutes} 分钟。先自己讲一遍，再对照答案。`
    : learned
      ? '想做点新的也行，题库里还有没碰过的题；也可以再挑一个专题练一轮。'
      : '不急着翻开题解。用几分钟，试着说出自己的理解，再对照参考答案。'

  return (
    <>
      <section className={styles.queueHero}>
        <p className={styles.queueDate}>
          {new Date().toLocaleDateString('zh-CN', {
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </p>
        <h1>{headline}</h1>
        <p className={styles.queueLead}>{lead}</p>
        <div className={styles.queueActions}>
          {resumable ? (
            <Link className={styles.primary} to="/practice/session">
              继续上次练习
              <Icon name="arrow" size={16} />
            </Link>
          ) : due ? (
            <button type="button" className={styles.primary} onClick={beginReview}>
              开始复习 {queue.length} 道
              <Icon name="arrow" size={16} />
            </button>
          ) : (
            <Link className={styles.primary} to="/practice">
              开始练习
              <Icon name="arrow" size={16} />
            </Link>
          )}
          <Link className={styles.textLink} to="/questions">
            浏览题库
            <Icon name="chevronRight" size={13} />
          </Link>
        </div>
      </section>

      <div className={styles.facts}>
        <div className={styles.fact}>
          <span>今日到期</span>
          <strong>
            {due}
            <small>题</small>
          </strong>
        </div>
        <div className={styles.fact}>
          <span>已掌握</span>
          <strong>
            {mastered}
            <small>/ {questions.length}</small>
          </strong>
        </div>
        <div className={styles.fact}>
          <span>连续复习</span>
          <strong>
            {streak}
            <small>天</small>
          </strong>
        </div>
        <div className={styles.fact}>
          <span>本周完成</span>
          <strong>
            {weekCount}
            <small>题</small>
          </strong>
        </div>
      </div>
      <div className={styles.queueFoot}>
        <span>上次复习 {lastReviewedAt ? dayLabel(lastReviewedAt) : '还没有记录'}</span>
        <span>
          今日已作答 {today.length} 次 ·{' '}
          {nextReviewAt ? `下次到期 ${dayLabel(nextReviewAt)}` : '完成自评后生成复习计划'}
        </span>
      </div>

      <div className={styles.dashboardColumns} style={{ marginTop: 32 }}>
        <div className={styles.stack}>
          <BarChart
            title="本周学习节奏"
            description="最近 7 天 · 已完成作答次数"
            points={trend.map((d) => ({ label: d.label, value: d.count }))}
            unit="次"
          />
          <section className={styles.card}>
            <div className={styles.sectionHeading}>
              <h3>最近学习</h3>
              <Link className={styles.textLink} to="/stats">
                查看统计 <Icon name="arrow" size={13} />
              </Link>
            </div>
            {recent.length ? (
              recent.map((r) => (
                <Link className={styles.topicRow} to={`/questions/${r.questionId}`} key={r.id}>
                  <span className={styles.questionNumber}>
                    {String(r.questionId).padStart(3, '0')}
                  </span>
                  <div className={styles.topicInfo}>
                    <h3>
                      {questionMap.get(r.questionId)?.title ?? `题目 ${r.questionId}（已移出题库）`}
                    </h3>
                    <p>
                      {r.localDate} · {r.mode === 'mock' ? '模拟面试' : '专注练习'}
                    </p>
                  </div>
                  <Badge mastery={r.mastery} />
                </Link>
              ))
            ) : (
              <Empty title="你的第一条学习记录，从这里开始" to="/practice" label="开始练习">
                完成作答与自评后，会记录在这里。
              </Empty>
            )}
          </section>
        </div>
        <div className={styles.stack}>
          <section className={styles.card}>
            <div className={styles.sectionHeading}>
              <h3>知识版图</h3>
              <span className={styles.muted}>{categories.length} 个专题</span>
            </div>
            {categories.map((category) => {
              const group = questions.filter((q) => q.category === category)
              const good = group.filter((q) => progress[q.id]?.mastery === 'good').length
              return (
                <Link
                  className={styles.topicRow}
                  key={category}
                  to={`/questions?category=${category}`}
                >
                  <span className={styles.topicIcon} data-category={category}>
                    {
                      {
                        javascript: 'JS',
                        react: 'RE',
                        typescript: 'TS',
                        browser: 'WEB',
                        engineering: 'ENG',
                        coding: '</>',
                        architecture: 'SYS',
                      }[category]
                    }
                  </span>
                  <div className={styles.topicInfo}>
                    <h3>{categoryNames[category]}</h3>
                    <p>
                      {group.length} 道题 · {good} 道掌握
                    </p>
                  </div>
                  <div className={styles.topicProgress}>
                    {Math.round((good / group.length) * 100)}%
                    <progress
                      aria-label={`${categoryNames[category]}掌握进度`}
                      value={good}
                      max={group.length}
                    />
                  </div>
                </Link>
              )
            })}
          </section>
          <section className={styles.card}>
            <div className={styles.sectionHeading}>
              <h3>给表达，一次实战。</h3>
              <Icon name="mock" />
            </div>
            <p className={styles.muted}>限时作答、独立思考，再用一份自评报告发现自己的薄弱环节。</p>
            <Link className={styles.textLink} style={{ marginTop: 20 }} to="/mock">
              开启模拟面试 <Icon name="arrow" size={14} />
            </Link>
          </section>
        </div>
      </div>
    </>
  )
}
