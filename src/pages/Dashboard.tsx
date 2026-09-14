import { Link } from 'react-router'
import { questions, questionMap } from '../data/questions'
import { categoryNames, type Category } from '../types'
import { useLearning } from '../storage/store'
import { dailyStats, isDue, localDate } from '../lib/learning'
import { BarChart } from '../components/Chart'
import { Badge, Empty, Icon, PageHeader } from '../components/ui'
import styles from '../styles/App.module.css'

export function Metric({ label, value, unit, note, icon }: { label: string; value: number | string; unit?: string; note: string; icon: string }) { return <div className={styles.metric}><div className={styles.metricLabel}>{label}<Icon name={icon} size={17}/></div><div className={styles.metricValue}>{value}<small>{unit}</small></div><div className={styles.metricFoot}>{note}</div></div> }
export default function Dashboard() {
  const progress = useLearning(s => s.progress)
  const records = useLearning(s => s.records)
  const practice = useLearning(s => s.practice)
  const due = questions.filter(q => isDue(progress[q.id])).length
  const mastered = questions.filter(q => progress[q.id]?.mastery === 'good').length
  const learned = questions.filter(q => progress[q.id]?.mastery && progress[q.id].mastery !== 'new').length
  const today = records.filter(r => r.localDate === localDate() && !['unanswered', 'skipped'].includes(r.status))
  const recent = [...records].reverse().slice(0, 4)
  const categories = Object.keys(categoryNames).filter(c => questions.some(q => q.category === c)) as Category[]
  const trend = dailyStats(records, 7)
  return <>
    <PageHeader eyebrow="YOUR LEARNING, IN PROGRESS" title="每一次思考，都算数。" description="从一道题开始，把理解变成清晰、有条理的表达。" action={<div className={styles.headerDate}>{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</div>}/>
    <section className={styles.hero}><div className={styles.heroContent}><div className={styles.eyebrow}>RECALL → EXPLAIN → REFLECT</div><h2>{due ? `今天，有 ${due} 道题等你温习` : '先想一想，再看答案。'}</h2><p>{due ? '趁记忆还在，把模糊的知识再讲清楚一次。' : '不急着翻开题解。用几分钟，试着说出自己的理解。'}</p><Link className={styles.primary} to={practice && !practice.completedAt ? '/practice/session' : due ? '/review' : '/practice'}>{practice && !practice.completedAt ? '继续上次练习' : due ? '开始今日复习' : '开始专注练习'}<Icon name="arrow" size={16}/></Link><Link className={styles.heroLink} to="/questions">浏览题库 <span>↗</span></Link></div><div className={styles.recallDiagram} aria-label="思考、表达、对照、复习形成学习循环"><div className={styles.recallLoop}><div><strong>主动回忆</strong>MAKE IT YOURS</div><span className={styles.loopLabel}>思考</span><span className={styles.loopLabel}>表达</span><span className={styles.loopLabel}>对照</span><span className={styles.loopLabel}>复习</span></div></div></section>
    <div className={styles.metricGrid}><Metric label="已学习题目" value={learned} unit={`/ ${questions.length}`} note="每一道题，都是一次积累" icon="book"/><Metric label="当前已掌握" value={mastered} unit="题" note={`题库掌握率 ${Math.round(mastered / questions.length * 100)}% · 基于自评`} icon="check"/><Metric label="今日待复习" value={due} unit="题" note={due ? '按记忆间隔，及时巩固' : '复习计划会随自评生成'} icon="review"/><Metric label="今日专注" value={Math.round(today.reduce((sum, r) => sum + r.seconds, 0) / 60)} unit="分钟" note={`已完成 ${today.length} 次作答`} icon="clock"/></div>
    <div className={styles.dashboardColumns}><div className={styles.stack}><BarChart title="本周学习节奏" description="最近 7 天 · 已完成作答次数" points={trend.map(d => ({ label: d.label, value: d.count }))} unit="次"/>
      <section className={styles.card}><div className={styles.sectionHeading}><h3>最近学习</h3><Link className={styles.textLink} to="/stats">查看统计 <Icon name="arrow" size={13}/></Link></div>{recent.length ? recent.map(r => <Link className={styles.topicRow} to={`/questions/${r.questionId}`} key={r.id}><span className={styles.questionNumber}>{String(r.questionId).padStart(3, '0')}</span><div className={styles.topicInfo}><h3>{questionMap.get(r.questionId)?.title ?? `题目 ${r.questionId}（已移出题库）`}</h3><p>{r.localDate} · {r.mode === 'mock' ? '模拟面试' : '专注练习'}</p></div><Badge mastery={r.mastery}/></Link>) : <Empty title="你的第一条学习记录，从这里开始" to="/practice" label="开始练习">完成作答与自评后，会记录在这里。</Empty>}</section>
    </div><div className={styles.stack}><section className={styles.card}><div className={styles.sectionHeading}><h3>知识版图</h3><span className={styles.muted}>{categories.length} 个专题</span></div>{categories.map(category => { const group = questions.filter(q => q.category === category); const good = group.filter(q => progress[q.id]?.mastery === 'good').length; return <Link className={styles.topicRow} key={category} to={`/questions?category=${category}`}><span className={styles.topicIcon} data-category={category}>{({ javascript: 'JS', react: 'RE', typescript: 'TS', browser: 'WEB', engineering: 'ENG', coding: '</>', architecture: 'SYS' })[category]}</span><div className={styles.topicInfo}><h3>{categoryNames[category]}</h3><p>{group.length} 道题 · {good} 道掌握</p></div><div className={styles.topicProgress}>{Math.round(good / group.length * 100)}%<progress aria-label={`${categoryNames[category]}掌握进度`} value={good} max={group.length}/></div></Link> })}</section>
      <section className={styles.card}><div className={styles.sectionHeading}><h3>给表达，一次实战。</h3><Icon name="mock"/></div><p className={styles.muted}>限时作答、独立思考，再用一份自评报告发现自己的薄弱环节。</p><Link className={styles.textLink} style={{ marginTop: 20 }} to="/mock">开启模拟面试 <Icon name="arrow" size={14}/></Link></section>
    </div></div>
  </>
}
