import { Component, lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import Layout from './Layout'
import { Empty } from '../components/ui'

const Dashboard = lazy(() => import('../pages/Dashboard'))
const Questions = lazy(() => import('../pages/Questions'))
const Practice = lazy(() => import('../pages/Practice'))
const Session = lazy(() => import('../pages/Session'))
const Detail = lazy(() => import('../pages/Detail'))
const Report = lazy(() => import('../pages/Report'))
const Stats = lazy(() => import('../pages/Stats'))
const Roadmap = lazy(() => import('../pages/Roadmap'))
const Settings = lazy(() => import('../pages/Settings'))

class ErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false }
  static getDerivedStateFromError() { return { error: true } }
  render() { return this.state.error ? <div style={{ padding: 40 }}><h1>页面暂时无法显示</h1><p>请刷新页面重试。浏览器中的学习数据会保留。</p><button onClick={() => window.location.reload()}>重新加载</button></div> : this.props.children }
}
// BASE_URL 在构建时由 `vite build --base=...` 决定（如 `/react-lite/`）。
// 传给 BrowserRouter 作为 basename，GitHub Pages 子路径部署时路由才能正确匹配。
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')
export default function App() {
  return <ErrorBoundary><BrowserRouter basename={basename}><Suspense fallback={<div className="loading" role="status">正在打开练习室…</div>}><Routes><Route element={<Layout/>}>
    <Route index element={<Dashboard/>}/><Route path="questions" element={<Questions/>}/><Route path="questions/:id" element={<Detail/>}/>
    <Route path="practice" element={<Practice mode="practice"/>}/><Route path="practice/session" element={<Session mode="practice"/>}/>
    <Route path="review" element={<Questions review/>}/><Route path="mock" element={<Practice mode="mock"/>}/><Route path="mock/session" element={<Session mode="mock"/>}/><Route path="mock/report/:sessionId" element={<Report/>}/>
    <Route path="stats" element={<Stats/>}/><Route path="roadmap" element={<Roadmap/>}/><Route path="settings" element={<Settings/>}/>
    <Route path="*" element={<Empty title="这个页面不存在" to="/" label="返回学习概览">可以从题库重新选择一道题。</Empty>}/>
  </Route></Routes></Suspense></BrowserRouter></ErrorBoundary>
}
