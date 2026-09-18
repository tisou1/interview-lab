import { useEffect, useLayoutEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import ThemeMenu from '../components/ThemeMenu'
import { Icon } from '../components/ui'
import { useLearning, useStorageStatus } from '../storage/store'
import { themeById, themeMode } from '../lib/themes'
import { questions } from '../data/questions'
import styles from '../styles/App.module.css'

const links = [
  ['/', 'home', '学习概览'],
  ['/questions', 'book', '全部题库'],
  ['/practice', 'play', '专注练习'],
  ['/review', 'review', '复习计划'],
  ['/mock', 'mock', '模拟面试'],
  ['/stats', 'chart', '学习统计'],
  ['/roadmap', 'map', '学习路线'],
]
function Navigation({ close }: { close?: () => void }) {
  return (
    <>
      <div className={styles.navLabel}>我的学习空间</div>
      <nav aria-label="主导航">
        {links.map(([to, icon, label]) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={close}
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navActive : ''}`}
          >
            <Icon name={icon} />
            {label}
            {to === '/questions' && <span>{questions.length}</span>}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
function Brand() {
  return (
    <div className={styles.brand}>
      <span className={styles.brandMark}>
        <Icon name="code" size={25} />
      </span>
      <div>
        前端练习室<small>INTERVIEW LAB</small>
      </div>
    </div>
  )
}
export default function Layout() {
  const theme = useLearning((s) => s.theme)
  const progress = useLearning((s) => s.progress)
  const mock = useLearning((s) => s.mock)
  // 只订阅到期判定需要的字段，避免场次内每次 patch 都重建定时器。
  const mockId = mock?.id
  const mockDeadline = mock?.deadline
  const mockCompletedAt = mock?.completedAt
  const finish = useLearning((s) => s.finish)
  const error = useStorageStatus((s) => s.error)
  const location = useLocation()
  const dialog = useRef<HTMLDialogElement>(null)
  const learned = questions.filter(
    (q) => progress[q.id]?.mastery && progress[q.id].mastery !== 'new',
  ).length
  // 用 layout effect 在首次绘制前写入主题，避免深色主题出现白屏闪烁。
  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.classList.toggle('dark', themeMode(theme) === 'dark')
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', themeById(theme).swatches[0])
  }, [theme])
  useEffect(() => {
    if (!mockId || mockCompletedAt) return
    const remaining = Date.parse(mockDeadline!) - Date.now()
    if (remaining <= 0) {
      finish('mock')
      return
    }
    const timer = setTimeout(() => finish('mock'), remaining)
    const check = () => {
      if (Date.now() >= Date.parse(mockDeadline!)) finish('mock')
    }
    document.addEventListener('visibilitychange', check)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', check)
    }
  }, [mockId, mockDeadline, mockCompletedAt, finish])
  useEffect(() => {
    window.scrollTo(0, 0)
    dialog.current?.close()
    // 依赖的是路由变化本身，effect 内并不读取 pathname。
    // oxlint-disable-next-line react/exhaustive-effect-dependencies
  }, [location.pathname])
  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main">
        跳转到主要内容
      </a>
      <aside className={styles.sidebar}>
        <Brand />
        <Navigation />
        <div className={styles.sidebarBottom}>
          <div className={styles.smallProgress}>
            <div>
              <span>学习是一点点积累</span>
              <strong>
                {learned}
                <span> / {questions.length}</span>
              </strong>
            </div>
            <progress max={questions.length} value={learned} />
          </div>
          <NavLink to="/settings" className={styles.navLink}>
            <Icon name="settings" />
            数据与设置
          </NavLink>
          <div className={styles.localNote}>
            <span className={styles.dot} />
            个人空间 · 数据保存在此设备
          </div>
        </div>
      </aside>
      <div className={styles.workspace}>
        <div className={styles.topbar}>
          <div className={styles.breadcrumb}>
            <button
              className={`${styles.iconButton} ${styles.mobileOnly}`}
              aria-label="打开导航"
              onClick={() => dialog.current?.showModal()}
            >
              <Icon name="menu" />
            </button>
            <span>Workspace</span>
            <span>/</span>
            <strong>
              {links.find(([to]) =>
                to === '/' ? location.pathname === '/' : location.pathname.startsWith(to),
              )?.[2] ?? '数据与设置'}
            </strong>
          </div>
          <div className={styles.topActions}>
            <span className={styles.desktopOnly}>把知识，变成自己的回答。</span>
            <ThemeMenu />
            <span className={styles.avatar}>FE</span>
          </div>
        </div>
        {error && (
          <div role="alert" className={styles.errorBanner}>
            {error} <NavLink to="/settings">管理数据</NavLink>
          </div>
        )}
        <main id="main" className={styles.main}>
          <Outlet />
        </main>
        <footer className={styles.footer}>
          Frontend Interview Lab <span>理解原理 · 练习表达 · 持续复习</span>
        </footer>
      </div>
      <dialog ref={dialog} className={styles.navDialog} aria-label="移动端导航">
        <div className={styles.sectionHeading}>
          <Brand />
          <button
            className={styles.iconButton}
            aria-label="关闭导航"
            onClick={() => dialog.current?.close()}
          >
            <Icon name="close" />
          </button>
        </div>
        <Navigation close={() => dialog.current?.close()} />
        <NavLink to="/settings" className={styles.navLink} onClick={() => dialog.current?.close()}>
          <Icon name="settings" />
          数据与设置
        </NavLink>
      </dialog>
    </div>
  )
}
