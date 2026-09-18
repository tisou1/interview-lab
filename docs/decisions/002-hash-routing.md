# ADR 002：改用 HashRouter 以适配纯静态托管

状态：采用。修订 [ADR 001](001-local-first.md) 中关于路由的部分。

## 背景

应用需要部署到 GitHub Pages 的仓库子路径（`/interview-lab/`）。ADR 001 选用的 BrowserRouter 依赖静态服务把未知路径回退到 `index.html`，而 GitHub Pages 不支持为单页应用配置回退规则：直接访问或刷新 `/interview-lab/questions/1` 会返回 404。

此前在文档中提到的 `public/_redirects` 与 Nginx 回退示例，对 GitHub Pages 并不生效。

## 决策

改用 `react-router` 的 `HashRouter`：

- 路由状态保存在 URL fragment 中，地址形如 `https://<user>.github.io/interview-lab/#/questions/1`。
- 深层路径不会发送到服务器，因此任意静态托管都能直接访问和刷新深链，无需任何服务端配置。
- Vite `base` 保持 `/interview-lab/`，它只决定静态资源前缀，与路由模式解耦；`basename` 推导随之删除。
- 组件测试改用 `MemoryRouter`，不依赖具体的路由实现。
- `vercel.json` 的 rewrites 保留但不承担职责，仅作为冗余配置。

## 原因

- GitHub Pages 无法配置 SPA 回退，BrowserRouter 的深链在该环境下必然失败。
- hash 路由不需要额外的 404 兜底页面，也不需要把 `index.html` 复制成 `404.html` 这类权宜做法。
- 本站没有 SEO 需求，也不做服务端渲染，hash 路由的常规缺点（链接美观度、锚点语义）不构成实际损失。

## 后果

- 站内链接、筛选参数和报告地址都位于 `#` 之后。查询参数仍在 fragment 内（`#/questions?q=React`），`useSearchParams` 行为不变。
- 旧版不含 `#` 的 BrowserRouter 外链会落到学习概览页，需要重新分享。
- 若将来改为服务端渲染或需要 SEO，应重新评估并回到 BrowserRouter（或 `createBrowserRouter`）。
