import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { categoryNames, difficultyNames, typeNames, type Context, type Question, type Rating, type SessionItem } from '../types'
import { formatTime } from '../lib/learning'
import { useLearning, useStorageStatus } from '../storage/store'
import { useStudyClock } from '../hooks/useStudyClock'
import { Badge, HtmlContent, Icon } from './ui'
import { Reveal } from './Motion'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import styles from '../styles/App.module.css'

export default function QuestionWorkspace({ question, item, context, previous, next, nextLabel = '下一题' }: { question: Question; item: SessionItem; context: Context; previous?: () => void; next?: () => void; nextLabel?: string }) {
  const p = useLearning(s => s.progress[question.id])
  const draft = useLearning(s => s.draft)
  const favorite = useLearning(s => s.favorite)
  const patchItem = useLearning(s => s.patchItem)
  const rate = useLearning(s => s.rate)
  const activeMock = useLearning(s => s.mock)
  const storageError = useStorageStatus(s => s.error)
  const mock = context.kind === 'mock'
  const examLocked = !!activeMock && !activeMock.completedAt
  const [running, setRunning] = useState(context.kind !== 'detail' || item.seconds > 0)
  const [sections, setSections] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  const { seconds, flush } = useStudyClock(context, item, running)
  const blockedNext = !mock && item.revealed && !item.mastery && item.status !== 'skipped'
  const doRate = (rating: Rating) => { if (mock || examLocked || item.mastery) return; flush(); rate(context, rating); setMessage('自评已记录，复习计划已更新。'); toast.success('自评已记录', { description: '复习计划已同步更新。' }) }
  const reveal = () => { if (!mock && !examLocked) { patchItem(context, { revealed: true }); setMessage(`已思考 ${formatTime(seconds)}，现在对照参考答案。`) } }
  const navigateNext = () => { if (!blockedNext) { flush(); next?.() } else { setMessage('请先选择熟练度，或明确跳过本题。'); toast.info('请先完成本题自评') } }
  const navigatePrevious = () => { flush(); previous?.() }
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, select, button, a, [contenteditable="true"], dialog') || event.ctrlKey || event.metaKey || event.altKey || event.repeat) return
      if (event.code === 'Space') { event.preventDefault(); reveal() }
      else if (['1', '2', '3'].includes(event.key) && item.revealed) { event.preventDefault(); doRate(({ '1': 'again', '2': 'hard', '3': 'good' } as const)[event.key as '1']) }
      else if (event.key.toLowerCase() === 'f') { event.preventDefault(); favorite(question.id) }
      else if (event.key.toLowerCase() === 'r') { event.preventDefault(); patchItem(context, { flagged: !item.flagged }) }
      else if (event.key === 'ArrowRight') { event.preventDefault(); navigateNext() }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); navigatePrevious() }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  })
  const draftArea = (fullscreen: boolean) => <textarea aria-label={fullscreen ? '全屏回答草稿' : '回答草稿'} className={styles.draft} placeholder="先写结论，再补充原理、例子和边界。不必完整，写下你的思路就好。" value={p?.draft ?? ''} onChange={e => draft(question.id, e.target.value)}/>
  return <div className={styles.studyLayout}><div><article className={`${styles.card} ${styles.studyCard}`}><div className={styles.sectionHeading}><div className={styles.questionMeta}><span>#{String(question.id).padStart(3, '0')}</span><span>{categoryNames[question.category]}</span><span>{difficultyNames[question.difficulty]}</span></div><button className={`${styles.iconButton} ${p?.favorite ? styles.favorite : ''}`} aria-label={p?.favorite ? '取消收藏本题' : '收藏本题'} aria-pressed={!!p?.favorite} onClick={() => favorite(question.id)}><Icon name="star" size={19}/></button></div>
      <h1 className={styles.studyTitle}>{question.title}</h1><div className={styles.questionMeta}><span>{typeNames[question.type]}</span><span>建议 {question.estimatedMinutes} 分钟</span><span>{question.tags.join(' / ')}</span></div>
      <HtmlContent html={question.promptHtml}/>
      <div className={styles.draftHeader}><h3>我的回答提纲</h3><div className={styles.actions}><span className={styles.muted}>{storageError ? '保存异常，请导出数据' : '自动保存到此设备'}</span><button className={styles.tab} onClick={() => dialog.current?.showModal()}>全屏编辑</button></div></div>{draftArea(false)}
      {mock ? <div className={styles.revealPanel}><p className={styles.muted} style={{ marginBottom: 14 }}>标记你的回答状态，交卷后统一对照题解。</p><div className={styles.actions}><button className={item.status === 'answered' ? styles.selected : ''} aria-pressed={item.status === 'answered'} onClick={() => patchItem(context, { status: 'answered' })}><Icon name="check" size={16}/>已回答</button><button className={item.status === 'again' ? styles.again : ''} aria-pressed={item.status === 'again'} onClick={() => patchItem(context, { status: 'again' })}>不会</button><button className={item.flagged ? styles.hard : ''} aria-pressed={item.flagged} onClick={() => patchItem(context, { flagged: !item.flagged })}><Icon name="flag" size={15}/>待复查</button></div></div> : examLocked ? <div className={styles.notice}>你有一场未完成的模拟面试，交卷后可查看题解和自评。<Link to="/mock/session"> 返回面试 →</Link></div> : <>
        <div className={styles.revealPanel}>{!item.revealed ? <><p className={styles.muted} style={{ marginBottom: 13 }}>已思考 {formatTime(seconds)}。准备好后，再对照你的回答。</p><Button size="lg" onClick={reveal}>查看参考答案 <span>Space</span></Button></> : question.answerSections.map((section, index) => { const open = index === 0 ? !sections.includes(section.id) : sections.includes(section.id); return <section className={styles.answerSection} key={section.id}><button className={styles.answerToggle} aria-expanded={open} aria-controls={section.id} onClick={() => setSections(old => old.includes(section.id) ? old.filter(id => id !== section.id) : [...old, section.id])}>{section.title}<span aria-hidden="true">{open ? '−' : '+'}</span></button>{open && <Reveal className={styles.answerContent} id={section.id}><HtmlContent html={section.html}/></Reveal>}</section> })}</div>
        {item.revealed && <div className={styles.ratingBar}><p>对照答案后，你掌握得怎么样？</p><div className={styles.actions}>{(['again', 'hard', 'good'] as const).map((rating, index) => <button key={rating} className={styles[rating]} aria-pressed={item.mastery === rating} disabled={!!item.mastery} onClick={() => doRate(rating)}>{index + 1} · {rating === 'again' ? '不会' : rating === 'hard' ? '模糊' : '掌握'}</button>)}</div>{item.mastery && <p style={{ marginTop: 14 }}>下次复习：{p?.nextReviewAt ? new Date(p.nextReviewAt).toLocaleDateString('zh-CN') : '已安排'}{context.kind === 'detail' && <button className={styles.tab} onClick={() => useLearning.getState().ensureDetail(question, true)}>重新练习本题</button>}</p>}</div>}
      </>}
      <p role="status" className={styles.muted} style={{ marginTop: 12 }}>{message}</p>
    </article><div className={styles.bottomActions}><Button variant="outline" disabled={!previous} onClick={navigatePrevious}>← 上一题</Button>{!mock && !item.mastery && <Button variant="ghost" onClick={() => { flush(); patchItem(context, { status: 'skipped' }); setMessage('已跳过本题，熟练度保持不变。'); toast('已跳过本题'); next?.() }}>跳过</Button>}<Button disabled={!next || blockedNext} onClick={navigateNext}>{nextLabel} →</Button></div></div>
    <aside className={`${styles.card} ${styles.studyAside}`}><h3>本题思考时间</h3><div className={styles.timer} role="timer" aria-label="本题累计用时">{formatTime(seconds)}</div><p className={styles.muted}>留一点时间，组织你的表达。</p>{!mock && !item.mastery && <button style={{ marginTop: 15, width: '100%' }} onClick={() => { flush(); setRunning(!running) }}>{running ? '暂停思考计时' : '开始思考'}</button>}<div style={{ margin: '24px 0' }}><Badge mastery={p?.mastery}/></div><button className={`${styles.secondary} ${item.flagged ? styles.hard : ''}`} style={{ width: '100%' }} aria-pressed={item.flagged} onClick={() => patchItem(context, { flagged: !item.flagged })}><Icon name="flag" size={16}/>{item.flagged ? '已标记待复查' : '标记待复查'}</button>{!mock && <><h3 style={{ marginTop: 25 }}>键盘也很顺手</h3><dl className={styles.shortcutList}><dt>查看核心答案</dt><dd><kbd>Space</kbd></dd><dt>不会 / 模糊 / 掌握</dt><dd><kbd>1 / 2 / 3</kbd></dd><dt>切换题目</dt><dd><kbd>← / →</kbd></dd><dt>收藏 / 待复查</dt><dd><kbd>F / R</kbd></dd></dl></>}</aside>
    <dialog ref={dialog} className={styles.draftDialog} aria-label="全屏草稿编辑"><div className={styles.sectionHeading}><h2>我的回答提纲</h2><button onClick={() => dialog.current?.close()}>完成编辑</button></div>{draftArea(true)}</dialog>
  </div>
}
