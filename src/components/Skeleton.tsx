import { useEffect, useState, type CSSProperties } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import styles from '../styles/App.module.css'

/**
 * 加载骨架。
 * 只画结构、不画细节，尺寸对齐真实布局，目的是让内容「长出来」而不是把整页换掉。
 * 视觉上不出现文案，读屏由各自的 role="status" 负责。
 */

// 本地热更新和二次进入通常 180ms 内就绪，立刻显示骨架只会闪一下，比不显示更脏。
const SHOW_DELAY = 180

function useReady() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), SHOW_DELAY)
    return () => clearTimeout(timer)
  }, [])
  return ready
}

export function Skeleton({
  w = '100%',
  h = 8,
  r = 4,
  className,
}: {
  w?: number | string
  h?: number
  r?: number
  className?: string
}) {
  const style: CSSProperties = {
    width: typeof w === 'number' ? `${w}px` : w,
    height: `${h}px`,
    borderRadius: `${r}px`,
  }
  return <span className={`${styles.skelBar} ${className ?? ''}`} style={style} />
}

export function SkeletonLines({ rows = 3 }: { rows?: number }) {
  const widths = ['100%', '94%', '97%', '66%']
  return (
    <span className={styles.skelLines}>
      {Array.from({ length: rows }, (_, index) => {
        const w = widths[index % widths.length]
        return <Skeleton key={`${index}-${w}`} w={w} h={8} />
      })}
    </span>
  )
}

function QuestionCardSkeleton() {
  return (
    <div className={`${styles.card} ${styles.studyCard}`}>
      <div className={styles.skelTags}>
        <Skeleton w={24} h={6} />
        <Skeleton w={30} h={6} />
        <Skeleton w={28} h={6} />
      </div>
      <div className={styles.skelTitle}>
        <Skeleton w="88%" h={16} r={5} />
        <Skeleton w="52%" h={16} r={5} />
      </div>
      <div className={styles.skelRow}>
        <Skeleton w={46} h={6} />
        <Skeleton w={64} h={6} />
        <Skeleton w={96} h={6} />
      </div>
      <SkeletonLines rows={4} />
      <div className={styles.skelRow}>
        <Skeleton w={56} h={8} />
        <Skeleton w={92} h={8} />
      </div>
      <Skeleton w="100%" h={148} r={8} className={`${styles.skelBox} ${styles.skelEditor}`} />
    </div>
  )
}

function QuestionAsideSkeleton() {
  return (
    <div className={styles.studyAside}>
      <Skeleton w={44} h={7} />
      <div className={styles.skelTimer}>
        <Skeleton w={78} h={22} r={5} />
      </div>
      <Skeleton w={112} h={6} />
      <Skeleton w="100%" h={34} r={7} className={`${styles.skelBox} ${styles.skelAsideButton}`} />
      <div className={styles.skelBadge}>
        <Skeleton w={64} h={8} />
      </div>
      <div className={styles.skelAsideGroup}>
        <Skeleton w={54} h={7} />
        <Skeleton w="100%" h={6} />
        <Skeleton w="86%" h={6} />
        <Skeleton w="92%" h={6} />
        <Skeleton w="78%" h={6} />
      </div>
    </div>
  )
}

function ActionBarSkeleton() {
  return (
    <div className={`${styles.bottomActions} ${styles.skelActions}`}>
      <Skeleton w={78} h={36} r={7} className={styles.skelBox} />
      <Skeleton w={64} h={36} r={7} className={styles.skelBox} />
      <Skeleton w={92} h={36} r={7} className={styles.skelAccent} />
    </div>
  )
}

export function QuestionSkeleton({ chrome = false }: { chrome?: boolean }) {
  const wide = useMediaQuery('(min-width: 1024px)')
  const ready = useReady()
  const body = wide ? (
    <div className={styles.studyPanels}>
      <div className={styles.studyMain}>
        <div className={styles.studyScroll}>
          <QuestionCardSkeleton />
        </div>
        <ActionBarSkeleton />
      </div>
      <div className={styles.studySide}>
        <div className={styles.studyScroll}>
          <QuestionAsideSkeleton />
        </div>
      </div>
    </div>
  ) : (
    <div className={styles.studyStack}>
      <QuestionCardSkeleton />
      <ActionBarSkeleton />
    </div>
  )
  const frame = (
    <div className={styles.skelFrame}>
      <span className={styles.skelProgress} aria-hidden="true" />
      <div
        className={`${styles.studyFrame} ${styles.skelFade}`}
        data-ready={ready}
        aria-hidden="true"
      >
        {body}
      </div>
    </div>
  )
  const status = (
    <p className={styles.srOnly} role="status">
      正在加载题目…
    </p>
  )
  // chrome 用于整个详情页还没挂载时占位：补一条返回栏，顶栏由外壳自己保留。
  if (!chrome)
    return (
      <>
        {frame}
        {status}
      </>
    )
  return (
    <div className={styles.detailShell} data-fill>
      <div className={styles.sectionHeading}>
        <Skeleton w={52} h={12} />
        <Skeleton w={72} h={12} />
      </div>
      {frame}
      {status}
    </div>
  )
}

// 其余页面的形状差异太大，只对齐「标题 + 内容块」这一层，避免画错结构。
export function PageSkeleton() {
  const ready = useReady()
  return (
    <div>
      <div
        className={`${styles.skelFade} ${styles.skelPage}`}
        data-ready={ready}
        aria-hidden="true"
      >
        <div className={styles.skelGroup}>
          <Skeleton w={58} h={7} />
          <Skeleton w="42%" h={20} r={5} />
          <Skeleton w="62%" h={8} />
        </div>
        <div className={styles.skelPageBlocks}>
          <Skeleton w="100%" h={118} r={8} className={styles.skelBox} />
          <Skeleton w="100%" h={118} r={8} className={styles.skelBox} />
        </div>
      </div>
      <p className={styles.srOnly} role="status">
        正在加载页面…
      </p>
    </div>
  )
}
