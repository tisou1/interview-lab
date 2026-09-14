import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useLearning } from '../storage/store'
import { ConfirmDialog, Empty, useQuestion } from '../components/ui'
import QuestionWorkspace from '../components/QuestionWorkspace'
import { formatTime } from '../lib/learning'
import styles from '../styles/App.module.css'

export default function Session({ mode }: { mode: 'practice' | 'mock' }) {
  const session = useLearning(s => s[mode])
  const move = useLearning(s => s.move)
  const finish = useLearning(s => s.finish)
  const item = session?.items[session.currentIndex]
  const { question, error } = useQuestion(item?.questionId ?? 0)
  const [now, setNow] = useState(Date.now())
  const [confirm, setConfirm] = useState(false)
  const navigate = useNavigate()
  const mock = mode === 'mock'
  useEffect(() => { const interval = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(interval) }, [])
  useEffect(() => {
    if (!session || !mock) return
    if (session.completedAt) navigate(`/mock/report/${session.id}`, { replace: true })
    else if (Date.parse(session.deadline!) <= now) { const id = finish('mock'); navigate(`/mock/report/${id}`, { replace: true }) }
  }, [session?.id, session?.completedAt, session?.deadline, now, mock, finish, navigate])
  if (!session || !item) return <Empty title="还没有进行中的场次" to={`/${mode}`} label={mock ? '配置模拟面试' : '配置练习'}>选择专题与题量，就可以开始。</Empty>
  if (session.completedAt && !mock) return <><Empty title="这组练习完成了" to="/practice" label="再来一组">本组 {session.items.filter(i => i.mastery).length} / {session.items.length} 道题已自评。进度和复习安排已保存。</Empty><div className={styles.actions} style={{ justifyContent: 'center' }}><Link className={styles.secondary} to="/review">查看复习计划</Link><Link className={styles.secondary} to="/stats">查看学习统计</Link></div></>
  if (session.completedAt) return <p>正在打开报告…</p>
  const submit = () => { const id = finish(mode); if (mock) navigate(`/mock/report/${id}`) }
  const next = () => session.currentIndex < session.items.length - 1 ? move(mode, session.currentIndex + 1) : setConfirm(true)
  return <>
    <div className={styles.sessionBar}><div><strong>{mock ? '模拟面试' : '专注练习'} · {session.currentIndex + 1} / {session.items.length}</strong><p className={styles.muted}>{mock ? '交卷后查看题解与自评报告' : '每次只关注眼前这一道题'}</p></div>{mock && <div className={styles.timer} role="timer" aria-label="面试剩余时间">{formatTime((Date.parse(session.deadline!) - now) / 1000)}</div>}<button onClick={() => setConfirm(true)}>{mock ? '提前交卷' : '结束练习'}</button></div>
    {question ? <QuestionWorkspace key={item.recordId} question={question} item={item} context={{ kind: mode }} previous={session.currentIndex > 0 ? () => move(mode, session.currentIndex - 1) : undefined} next={next} nextLabel={session.currentIndex === session.items.length - 1 ? mock ? '交卷' : '完成练习' : '下一题'}/> : <Empty title={error ? '题目加载失败' : '题目不可用或正在加载'}>可以使用下方答题卡切换题目，或刷新重试。</Empty>}
    <section className={styles.card} style={{ marginTop: 24 }}><div className={styles.sectionHeading}><h3>答题卡</h3><span className={styles.muted}>✓ 已回答 / 已自评 · ? 不会 · ⚑ 待复查 · − 跳过</span></div><div className={styles.answerGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))' }}>{session.items.map((entry, index) => <button key={entry.questionId} className={`${index === session.currentIndex ? styles.current : ''} ${entry.mastery === 'good' || entry.status === 'answered' ? styles.good : entry.status === 'again' ? styles.again : entry.flagged ? styles.hard : ''}`} aria-label={`跳到第 ${index + 1} 题${entry.flagged ? '，待复查' : ''}`} aria-current={index === session.currentIndex ? 'step' : undefined} onClick={() => move(mode, index)}>{index + 1}{entry.flagged ? ' ⚑' : entry.status === 'answered' ? ' ✓' : entry.status === 'again' ? ' ?' : entry.status === 'skipped' ? ' −' : ''}</button>)}</div></section>
    {confirm && <ConfirmDialog title={mock ? '确认交卷？' : '结束这组练习？'} onConfirm={submit} onClose={() => setConfirm(false)} confirmLabel={mock ? '确认交卷' : '结束练习'}><p>已处理 {session.items.filter(i => i.status !== 'unanswered').length} / {session.items.length} 道题。{mock ? '交卷后无法继续作答，可以查看题解和填写自评。' : '已保存的草稿和自评会保留，未自评题目不更新掌握状态。'}</p></ConfirmDialog>}
  </>
}
