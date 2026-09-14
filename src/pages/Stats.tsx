import { useState } from 'react'
import { Link } from 'react-router'
import { questions } from '../data/questions'
import { categoryNames, masteryNames, type Category, type Mastery } from '../types'
import { useLearning } from '../storage/store'
import { addDays, dailyStats, formatTime, isDue, localDate } from '../lib/learning'
import { BarChart } from '../components/Chart'
import { Empty, PageHeader } from '../components/ui'
import { Metric } from './Dashboard'
import styles from '../styles/App.module.css'

export default function Stats() {
  const [days, setDays] = useState(30)
  const progress = useLearning(s => s.progress)
  const records = useLearning(s => s.records)
  const history = useLearning(s => s.history)
  const daily = dailyStats(records, days)
  const categories = Object.keys(categoryNames).filter(c => questions.some(q => q.category === c)) as Category[]
  const mocks = history.filter(s => s.mode === 'mock' && localDate(s.completedAt!) >= localDate(addDays(new Date(), 1 - days)))
  const due = questions.filter(q => isDue(progress[q.id])).length
  const schedule = Array.from({ length: 7 }, (_, i) => { const date = localDate(addDays(new Date(), i + 1)); return { label: date.slice(5), value: questions.filter(q => progress[q.id]?.nextReviewAt && localDate(progress[q.id].nextReviewAt!) === date).length } })
  const duration = (s: typeof mocks[number]) => Math.max(0, (Date.parse(s.completedAt!) - Date.parse(s.startedAt)) / 1000)
  const mockPoints = (fn: (s: typeof mocks[number]) => number) => mocks.map((s, i) => ({ label: `${localDate(s.completedAt!).slice(5)} #${i + 1}`, value: fn(s) }))
  return <>
    <PageHeader eyebrow="PROGRESS YOU CAN SEE" title="看见自己的进步。" description="用真实练习记录发现学习节奏。掌握程度来自你的自评。" action={<div className={styles.tabs}>{[7, 30, 90].map(n => <button key={n} className={`${styles.tab} ${days === n ? styles.selected : ''}`} aria-pressed={days === n} onClick={() => setDays(n)}>近 {n} 天</button>)}</div>}/>
    <div className={styles.metricGrid}><Metric label="完成作答" value={daily.reduce((sum, d) => sum + d.count, 0)} unit="次" note={`近 ${days} 天 · 包含重复练习`} icon="check"/><Metric label="有效学习时长" value={Math.round(daily.reduce((sum, d) => sum + d.minutes, 0))} unit="分钟" note="来自已完成作答记录" icon="clock"/><Metric label="学习天数" value={daily.filter(d => d.count > 0).length} unit="天" note={`近 ${days} 天有作答的日期`} icon="chart"/><Metric label="模拟面试" value={mocks.length} unit="场" note={`近 ${days} 天已交卷场次`} icon="mock"/></div>
    <div className={styles.statGrid}><BarChart title="每日作答次数" description={`近 ${days} 天 · 跳过和未回答不计入`} unit="次" points={daily.map(d => ({ label: d.label, value: d.count }))}/><BarChart title="每日有效学习时长" description="只统计前台练习时间，未提交题目暂不计入" unit="分钟" points={daily.map(d => ({ label: d.label, value: d.minutes }))}/>
      <BarChart title="分类掌握率" description="当前掌握题数 / 当前分类题库总数，不受时间范围影响" horizontal unit="%" points={categories.map(category => { const group = questions.filter(q => q.category === category); return { label: categoryNames[category], value: Math.round(group.filter(q => progress[q.id]?.mastery === 'good').length / group.length * 100) } })}/>
      <BarChart title="当前熟练度分布" description={`题库共 ${questions.length} 道，统计当前最新自评`} horizontal unit="题" points={(Object.keys(masteryNames) as Mastery[]).map(mastery => ({ label: masteryNames[mastery], value: questions.filter(q => (progress[q.id]?.mastery ?? 'new') === mastery).length, color: mastery === 'good' ? 'var(--green)' : mastery === 'again' ? 'var(--red)' : mastery === 'hard' ? 'var(--orange)' : 'var(--muted)' }))}/>
      <BarChart title="接下来的复习安排" description={`目前已有 ${due} 道题到期；下方为未来 7 天计划`} unit="题" points={schedule}/>
      <section className={styles.card}><h3>怎样理解这些数字？</h3><ul className={styles.notes}><li>同一道题重复练习，会产生多次作答记录。</li><li>“已回答”表示你完成了回答，不代表答对。</li><li>掌握率按最新自评计算，不是客观正确率。</li><li>面试自评覆盖率 = 已自评题数 / 本场题数。</li><li>面试掌握比例 = 自评掌握题数 / 已自评题数。</li><li>导入没有历史记录的旧数据，不会生成过去的趋势。</li></ul><Link className={styles.textLink} to="/review">查看待复习题目 →</Link></section>
    </div>
    <div className={styles.sectionHeading} style={{ marginTop: 32 }}><h2>模拟面试 · 历次自评对比</h2><Link className={styles.textLink} to="/mock">开始一场面试 →</Link></div>
    {!mocks.length ? <Empty title="还没有这个时间范围内的面试记录" to="/mock" label="开始模拟面试">完成面试后，在这里对比用时、自评和分类表现。</Empty> : <>
      <div className={styles.statGrid}><BarChart title="面试总用时" unit="分钟" points={mockPoints(s => Math.round(duration(s) / 60 * 10) / 10)}/><BarChart title="平均每题用时" description="面试总用时 / 本场题数" unit="秒" points={mockPoints(s => Math.round(duration(s) / s.items.length))}/><BarChart title="逐场自评覆盖率" unit="%" points={mockPoints(s => Math.round(s.items.filter(i => i.mastery).length / s.items.length * 100))}/><BarChart title="已自评题目中的掌握比例" description="未自评题不视为不会；覆盖率请结合左图阅读" unit="%" points={mockPoints(s => { const rated = s.items.filter(i => i.mastery); return rated.length ? Math.round(rated.filter(i => i.mastery === 'good').length / rated.length * 100) : 0 })}/><BarChart title="面试分类表现" description={`近 ${days} 天 · 使用场次分类快照 · 掌握数 / 已自评数`} horizontal unit="%" points={(Object.keys(categoryNames) as Category[]).filter(category => mocks.some(s => s.items.some(i => i.category === category))).map(category => { const items = mocks.flatMap(s => s.items).filter(i => i.category === category && i.mastery); return { label: categoryNames[category], value: items.length ? Math.round(items.filter(i => i.mastery === 'good').length / items.length * 100) : 0 } })}/></div>
      <section className={styles.card} style={{ marginTop: 22 }}><h3>场次明细</h3><div className={styles.tableWrap}><table><caption>待复查可与回答状态重叠，数量不相加</caption><thead><tr>{['场次', '题数', '总用时', '已回答', '不会', '待复查', '未回答', '报告'].map(t => <th scope="col" key={t}>{t}</th>)}</tr></thead><tbody>{mocks.map(s => <tr key={s.id}><th scope="row">{new Date(s.startedAt).toLocaleString('zh-CN')}</th><td>{s.items.length}</td><td>{formatTime(duration(s))}</td><td>{s.items.filter(i => i.status === 'answered').length}</td><td>{s.items.filter(i => i.status === 'again').length}</td><td>{s.items.filter(i => i.flagged).length}</td><td>{s.items.filter(i => i.status === 'unanswered').length}</td><td><Link className={styles.textLink} to={`/mock/report/${s.id}`}>查看报告</Link></td></tr>)}</tbody></table></div></section>
    </>}
  </>
}
