import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { categoryNames, masteryNames, type PracticeSession, type SessionItem } from '../types'
import { useLearning } from '../storage/store'
import { formatTime } from '../lib/learning'
import { Empty, PageHeader, QuestionAnswer } from '../components/ui'
import { BarChart } from '../components/Chart'
import { Metric } from './Dashboard'
import styles from '../styles/App.module.css'
import { toast } from 'sonner'

function ReportItem({ item, session }: { item: SessionItem; session: PracticeSession }) {
  const [open, setOpen] = useState(false)
  const rate = useLearning(s => s.rateReport)
  return <section className={`${styles.card} ${styles.reportItem}`}><div className={styles.questionMeta}><span>#{item.questionId}</span><span>{categoryNames[item.category]}</span><span>思考 {formatTime(item.seconds)}</span><span>{item.status === 'answered' ? '已回答' : item.status === 'again' ? '不会' : '未回答'}{item.flagged ? ' · 待复查' : ''}</span></div><h3 style={{ marginTop: 10 }}>{item.title}</h3><div className={styles.actions}><span className={styles.muted}>我的自评</span>{(['again', 'hard', 'good'] as const).map(rating => <button key={rating} className={item.mastery === rating ? styles[rating] : ''} aria-pressed={item.mastery === rating} onClick={() => { rate(session.id, item.questionId, rating); toast.success('报告自评已更新') }}>{masteryNames[rating]}</button>)}</div><details onToggle={e => setOpen(e.currentTarget.open)}><summary>查看完整题解</summary>{open && <QuestionAnswer id={item.questionId}/>}</details></section>
}
export default function Report() {
  const { sessionId } = useParams()
  const session = useLearning(s => s.history.find(item => item.id === sessionId && item.mode === 'mock'))
  const active = useLearning(s => s.mock)
  if (active && !active.completedAt) return <Empty title="请先完成当前模拟面试" to="/mock/session" label="继续面试">交卷后可以查看报告与题解。</Empty>
  if (!session) return <Empty title="未找到这场模拟面试" to="/mock" label="返回模拟面试">报告保存在当前设备，也可以通过导入学习数据恢复。</Empty>
  const duration = Math.max(0, (Date.parse(session.completedAt!) - Date.parse(session.startedAt)) / 1000)
  const categories = [...new Set(session.items.map(i => i.category))]
  const weak = session.items.filter(i => i.mastery === 'again' || i.mastery === 'hard' || i.status === 'again' && !i.mastery)
  const suggested = session.items.filter(i => weak.includes(i) || i.flagged || i.status === 'unanswered')
  return <>
    <PageHeader eyebrow="REFLECT, THEN MOVE FORWARD" title="这一次面试，你收获了什么？" description={`${new Date(session.startedAt).toLocaleString('zh-CN')} · ${session.items.length} 道题 · 本报告为自评结果，不提供自动评分。`} action={<Link className={styles.secondary} to="/mock">返回模拟面试</Link>}/>
    <div className={styles.metricGrid}><Metric label="面试总用时" value={formatTime(duration)} note={`平均每题 ${formatTime(duration / session.items.length)}`} icon="clock"/><Metric label="已回答" value={session.items.filter(i => i.status === 'answered').length} unit="题" note="已回答不代表答对" icon="check"/><Metric label="标记不会" value={session.items.filter(i => i.status === 'again').length} unit="题" note="交卷时自动安排复习" icon="review"/><Metric label="待复查" value={session.items.filter(i => i.flagged).length} unit="题" note="可与已回答、不会重叠" icon="flag"/></div>
    <div className={styles.statGrid}><BarChart title="本场题目分类" horizontal unit="题" points={categories.map(category => ({ label: categoryNames[category], value: session.items.filter(i => i.category === category).length }))}/><section className={styles.card}><h3>下一步，补上这些薄弱环节</h3><p className={styles.muted} style={{ marginTop: 10 }}>已自评 {session.items.filter(i => i.mastery).length} / {session.items.length} 题。不会和模糊的自评会更新复习计划；修改自评不会新增作答次数。</p><p className={styles.notice}>{weak.length ? `薄弱分类：${[...new Set(weak.map(i => categoryNames[i.category]))].join('、')}` : '填写逐题自评后，这里会显示需要加强的分类。'}</p>{suggested.length ? <ul className={styles.notes}>{suggested.map(item => <li key={item.questionId}><Link className={styles.textLink} to={`/questions/${item.questionId}`}>#{item.questionId} {item.title}</Link></li>)}</ul> : <p className={styles.muted}>本场暂时没有需要补充复习的题目。</p>}<Link className={styles.textLink} to="/review?status=wrong">查看错题与复习计划 →</Link></section></div>
    <div className={styles.sectionHeading} style={{ marginTop: 30 }}><h2>逐题对照与自评</h2><Link className={styles.textLink} to="/stats">对比历次面试 →</Link></div>{session.items.map(item => <ReportItem key={item.recordId} item={item} session={session}/>)}</>
}
