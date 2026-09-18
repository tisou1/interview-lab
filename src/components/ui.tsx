import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import type { Mastery, Question } from '../types'
import { masteryNames } from '../types'
import { loadQuestion, questionMap } from '../data/questions'
import { HeaderEntrance } from './Motion'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import styles from '../styles/App.module.css'

const icons: Record<string, ReactNode> = {
  home: (
    <>
      <path d="m3 10 9-7 9 7v10H3Z" />
      <path d="M9 20v-7h6v7" />
    </>
  ),
  book: (
    <>
      <path d="M12 5c-3-2-7-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-2-1-6-1-9 1Z" />
      <path d="M12 5v15" />
    </>
  ),
  play: <path d="m8 4 13 8-13 8Z" />,
  review: (
    <>
      <path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" />
      <path d="M12 8v5l3 2" />
    </>
  ),
  mock: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M9 5V3h6v2M8 11h8M8 16h5" />
    </>
  ),
  chart: (
    <>
      <path d="M4 3v17h17M8 16v-5M13 16V7M18 16V4" />
    </>
  ),
  map: (
    <>
      <path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2ZM9 3v16M15 5v16" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h16M4 17h16" />
      <circle cx="9" cy="7" r="3" />
      <circle cx="16" cy="17" r="3" />
    </>
  ),
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" />,
  check: <path d="m5 12 4 4L20 5" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  moon: <path d="M20 14A9 9 0 0 1 10 4 9 9 0 1 0 20 14Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.8-1.9 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8h1.5A4.9 4.9 0 0 0 21 9.9C21 6 17 3 12 3Z" />
      <circle cx="7.5" cy="11" r="1.2" />
      <circle cx="10.5" cy="7.5" r="1.2" />
      <circle cx="15" cy="8" r="1.2" />
    </>
  ),
  code: <path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18" />,
  download: (
    <>
      <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
    </>
  ),
  flag: (
    <>
      <path d="M5 22V3c5-4 9 4 15 0v11c-6 4-10-4-15 0" />
    </>
  ),
}
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name] ?? icons.code}
    </svg>
  )
}
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <HeaderEntrance className={styles.pageHeader}>
      <div>
        <div className={styles.eyebrow}>{eyebrow}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </HeaderEntrance>
  )
}
export function Badge({ mastery = 'new' }: { mastery?: Mastery }) {
  return (
    <span className={`${styles.badge} ${styles[mastery]}`}>
      <span className={styles.dot} />
      {masteryNames[mastery]}
    </span>
  )
}
export function Empty({
  title,
  children,
  to,
  label,
}: {
  title: string
  children?: ReactNode
  to?: string
  label?: string
}) {
  return (
    <div className={styles.empty}>
      <Icon name="book" size={30} />
      <h3>{title}</h3>
      <p>{children}</p>
      {to && (
        <Link className={styles.primary} to={to}>
          {label ?? '去题库看看'}
          <Icon name="arrow" size={16} />
        </Link>
      )}
    </div>
  )
}
export function HtmlContent({ html }: { html: string }) {
  return <div className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />
}
export function useQuestion(id: number) {
  const [result, setResult] = useState<{ id: number; question?: Question; error?: boolean }>({ id })
  useEffect(() => {
    let active = true
    loadQuestion(id)
      .then((question) => {
        if (active) setResult({ id, question })
      })
      .catch(() => {
        if (active) setResult({ id, error: true })
      })
    return () => {
      active = false
    }
  }, [id])
  return result.id === id ? result : { id }
}
export function QuestionAnswer({ id }: { id: number }) {
  const { question, error } = useQuestion(id)
  if (!questionMap.has(id)) return <p>该题已移出当前题库，历史回答和自评仍保留。</p>
  if (error) return <p role="alert">题解加载失败，请刷新重试。</p>
  if (!question) return <p>正在加载题解…</p>
  return (
    <>
      {question.answerSections.map((section) => (
        <section key={section.id}>
          <h3>{section.title}</h3>
          <HtmlContent html={section.html} />
        </section>
      ))}
    </>
  )
}
export function ConfirmDialog({
  title,
  children,
  onConfirm,
  onClose,
  confirmLabel = '确认',
}: {
  title: string
  children: ReactNode
  onConfirm: () => void
  onClose: () => void
  confirmLabel?: string
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <div>{children}</div>
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" autoFocus onClick={onClose}>
            取消
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
