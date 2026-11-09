import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useLearning } from '../storage/store'
import { questionMap } from '../data/questions'
import { ConfirmDialog, Empty, Icon, useQuestion } from '../components/ui'
import QuestionWorkspace from '../components/QuestionWorkspace'
import { formatTime } from '../lib/learning'
import type { Rating } from '../types'
import { Button } from '@/components/ui/button'
import styles from '../styles/App.module.css'

export default function Session({ mode }: { mode: 'practice' | 'mock' }) {
  const session = useLearning((s) => s[mode])
  const move = useLearning((s) => s.move)
  const finish = useLearning((s) => s.finish)
  const item = session?.items[session.currentIndex]
  const { question, error } = useQuestion(item?.questionId ?? 0)
  const [now, setNow] = useState(() => Date.now())
  const [confirm, setConfirm] = useState(false)
  const navigate = useNavigate()
  const grid = useRef<HTMLDialogElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const mock = mode === 'mock'
  const sessionId = session?.id
  const sessionCompletedAt = session?.completedAt
  const sessionDeadline = session?.deadline
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(interval)
  }, [])
  useEffect(() => {
    if (!sessionId || !mock) return
    if (sessionCompletedAt) navigate(`/mock/report/${sessionId}`, { replace: true })
    else if (Date.parse(sessionDeadline!) <= now) {
      const id = finish('mock')
      navigate(`/mock/report/${id}`, { replace: true })
    }
  }, [sessionId, sessionCompletedAt, sessionDeadline, now, mock, finish, navigate])
  if (!session || !item)
    return (
      <Empty title="还没有进行中的场次" to={`/${mode}`} label={mock ? '配置模拟面试' : '配置练习'}>
        选择专题与题量，就可以开始。
      </Empty>
    )
  if (session.completedAt && !mock) {
    const total = session.items.length
    const rated = session.items.filter((i) => i.mastery).length
    const count = (rating: Rating) => session.items.filter((i) => i.mastery === rating).length
    const seconds = Math.max(
      0,
      (Date.parse(session.completedAt) - Date.parse(session.startedAt)) / 1000,
    )
    return (
      <div className={styles.donePage} data-fill>
        <div className={styles.doneInner}>
          <span className={styles.doneMark}>
            <Icon name="check" size={22} />
          </span>
          <h1>这一组做完了</h1>
          <p className={styles.doneMeta}>
            {total} 道题 · 用时 {formatTime(seconds)}
          </p>
          <div className={styles.doneScore}>
            <div data-tone="good">
              <strong>{count('good')}</strong>
              <span>掌握</span>
            </div>
            <div data-tone="hard">
              <strong>{count('hard')}</strong>
              <span>模糊</span>
            </div>
            <div data-tone="again">
              <strong>{count('again')}</strong>
              <span>不会</span>
            </div>
          </div>
          <div className={styles.doneActions}>
            <Button size="lg" onClick={() => navigate('/practice')}>
              再来一组
            </Button>
            <Button variant="ghost" size="lg" onClick={() => navigate('/')}>
              回到今日队列
            </Button>
          </div>
          <p className={styles.doneNote}>
            {rated} / {total} 道已自评，复习计划已按自评更新。
          </p>
        </div>
      </div>
    )
  }
  if (session.completedAt) return <p>正在打开报告…</p>
  const submit = () => {
    const id = finish(mode)
    if (mock) navigate(`/mock/report/${id}`)
  }
  const next = () =>
    session.currentIndex < session.items.length - 1
      ? move(mode, session.currentIndex + 1)
      : setConfirm(true)
  const total = session.items.length
  const step = session.currentIndex + 1
  return (
    <div className={styles.session} data-fill>
      <div
        className={styles.sessionProgress}
        role="progressbar"
        aria-label="本组进度"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={step}
      >
        <i style={{ width: `${(step / total) * 100}%` }} />
      </div>
      <div className={styles.sessionHead}>
        <button
          type="button"
          className={styles.sessionStep}
          aria-label={`查看答题卡，共 ${total} 题`}
          onClick={() => grid.current?.showModal()}
        >
          第 <b>{step}</b> 题 · 共 {total} 题
          <Icon name="chevronDown" size={13} />
        </button>
        <span className={styles.sessionSpacer} />
        {mock && (
          <div className={styles.sessionTimer} role="timer" aria-label="面试剩余时间">
            {formatTime((Date.parse(session.deadline!) - now) / 1000)}
          </div>
        )}
        <button type="button" className={styles.sessionChip} onClick={() => setConfirm(true)}>
          {mock ? '提前交卷' : '结束练习'}
        </button>
      </div>
      <div className={styles.sessionBody} ref={body} tabIndex={-1}>
        {question ? (
          <QuestionWorkspace
            key={item.recordId}
            question={question}
            item={item}
            context={{ kind: mode }}
            previous={
              session.currentIndex > 0 ? () => move(mode, session.currentIndex - 1) : undefined
            }
            next={next}
            nextLabel={
              session.currentIndex === session.items.length - 1
                ? mock
                  ? '交卷'
                  : '完成练习'
                : '下一题'
            }
          />
        ) : (
          <Empty title={error ? '题目加载失败' : '题目不可用或正在加载'}>
            可以打开答题卡切换题目，或刷新重试。
          </Empty>
        )}
      </div>
      <dialog ref={grid} className={styles.cardDialog} aria-label="答题卡">
        <div className={styles.sectionHeading}>
          <h2>答题卡</h2>
          <button type="button" onClick={() => grid.current?.close()}>
            关闭
          </button>
        </div>
        <div className={styles.answerGrid}>
          {session.items.map((entry, index) => (
            <button
              key={entry.questionId}
              className={`${index === session.currentIndex ? styles.current : ''} ${entry.mastery === 'good' || entry.status === 'answered' ? styles.good : entry.status === 'again' ? styles.again : entry.flagged ? styles.hard : ''}`}
              aria-label={`跳到第 ${index + 1} 题${entry.flagged ? '，待复查' : ''}`}
              aria-current={index === session.currentIndex ? 'step' : undefined}
              title={questionMap.get(entry.questionId)?.title}
              onClick={() => {
                move(mode, index)
                grid.current?.close()
                // 关闭 dialog 后浏览器会把焦点还给「答题卡」按钮，空格会再次打开它。
                // 把焦点交给正文容器，键盘才能继续揭示答案、自评、翻页。
                requestAnimationFrame(() => body.current?.focus({ preventScroll: true }))
              }}
            >
              {index + 1}
              {entry.flagged
                ? ' ⚑'
                : entry.status === 'answered'
                  ? ' ✓'
                  : entry.status === 'again'
                    ? ' ?'
                    : entry.status === 'skipped'
                      ? ' −'
                      : ''}
            </button>
          ))}
        </div>
        <p className={styles.muted}>✓ 已回答 · ? 不会 · ⚑ 待复查 · − 跳过</p>
      </dialog>
      {confirm && (
        <ConfirmDialog
          title={mock ? '确认交卷？' : '结束这组练习？'}
          onConfirm={submit}
          onClose={() => setConfirm(false)}
          confirmLabel={mock ? '确认交卷' : '结束练习'}
        >
          <p>
            已处理 {session.items.filter((i) => i.status !== 'unanswered').length} /{' '}
            {session.items.length} 道题。
            {mock
              ? '交卷后无法继续作答，可以查看题解和填写自评。'
              : '已保存的草稿和自评会保留，未自评题目不更新掌握状态。'}
          </p>
        </ConfirmDialog>
      )}
    </div>
  )
}
