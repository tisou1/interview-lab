import { useEffect, useLayoutEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import ThemeMenu from '../components/ThemeMenu'
import { Icon } from '../components/ui'
import { themeById, themeMode } from '../lib/themes'
import { useLearning, useStorageStatus } from '../storage/store'
import styles from '../styles/Shell.module.css'

// 顶栏导航与移动端抽屉共用一份定义，避免两处漂移。
const navLinks = [
  { to: '/', label: '今日', icon: 'home', end: true },
  { to: '/questions', label: '题库', icon: 'book', end: false },
  { to: '/stats', label: '统计', icon: 'chart', end: false },
  { to: '/roadmap', label: '路线', icon: 'map', end: false },
]

function Brand() {
  return (
    <>
      <span className={styles.brandMark}>
        <Icon name="code" size={15} />
      </span>
      前端练习室
    </>
  )
}

export default function Layout() {
  const theme = useLearning((s) => s.theme)
  const mock = useLearning((s) => s.mock)
  // 只订阅到期判定需要的字段，避免场次内每次 patch 都重建定时器。
  const mockId = mock?.id
  const mockDeadline = mock?.deadline
  const mockCompletedAt = mock?.completedAt
  const finish = useLearning((s) => s.finish)
  const error = useStorageStatus((s) => s.error)
  const location = useLocation()
  const dialog = useRef<HTMLDialogElement>(null)
  const main = useRef<HTMLElement>(null)

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

  // 每次切页把内容区滚动位置归零，而不是依赖浏览器恢复。
  useEffect(() => {
    main.current?.scrollTo({ top: 0 })
    dialog.current?.close()
    // 依赖的是路由变化本身，effect 内并不读取 pathname。
    // oxlint-disable-next-line react/exhaustive-effect-dependencies
  }, [location.pathname])

  const closeDrawer = () => dialog.current?.close()

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main">
        跳转到主要内容
      </a>
      <header className={styles.topbar}>
        <NavLink to="/" className={styles.brand} aria-label="前端练习室首页">
          <Brand />
        </NavLink>
        <nav className={styles.nav} aria-label="主导航">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navActive : ''}`}
            >
              <Icon name={link.icon} size={16} />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.actions}>
          <ThemeMenu />
          <NavLink to="/settings" className={styles.iconLink} aria-label="数据与设置">
            <Icon name="settings" size={17} />
          </NavLink>
          <button
            type="button"
            className={styles.menuButton}
            aria-label="打开导航"
            onClick={() => dialog.current?.showModal()}
          >
            <Icon name="menu" size={18} />
          </button>
        </div>
      </header>
      {error && (
        <div role="alert" className={styles.banner}>
          {error} <NavLink to="/settings">管理数据</NavLink>
        </div>
      )}
      <main id="main" className={styles.main} ref={main} tabIndex={-1}>
        <div className={styles.page}>
          <Outlet />
        </div>
      </main>
      <dialog ref={dialog} className={styles.drawer} aria-label="移动端导航">
        <div className={styles.drawerHead}>
          <span className={styles.brand}>
            <Brand />
          </span>
          <button
            type="button"
            className={styles.drawerClose}
            aria-label="关闭导航"
            onClick={closeDrawer}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        <nav className={styles.drawerNav} aria-label="页面导航">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={closeDrawer}
              className={({ isActive }) =>
                `${styles.drawerLink} ${isActive ? styles.drawerActive : ''}`
              }
            >
              <Icon name={link.icon} size={17} />
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/settings"
            onClick={closeDrawer}
            className={({ isActive }) =>
              `${styles.drawerLink} ${isActive ? styles.drawerActive : ''}`
            }
          >
            <Icon name="settings" size={17} />
            数据与设置
          </NavLink>
        </nav>
      </dialog>
    </div>
  )
}
