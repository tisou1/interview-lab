# ADR 001：本地学习工具的基础选择

状态：采用。

## 决策

采用 React + TypeScript + Vite，直接依赖 react-router 的 BrowserRouter 管理正常路径，Zustand persist 保存跨页面数据。题目内容和元数据均维护在 Markdown，通过构建时 AST 解析与 HTML 白名单清洗生成只读模块。图表使用 React + SVG，动效使用 Motion。pnpm 固定 11.x，其他直接依赖通过本地 taze 检查 latest。

## 原因

用户需要一个能持续扩充题库、支持复习和模拟面试的个人工具，无需账户或服务端数据库。Markdown 是现有内容格式，应保持为唯一内容维护入口。草稿、会话、统计等跨页面共享数据使用 Zustand 可避免复杂的 props 传递，同时保持临时 UI 状态在组件内部。

SVG 足以覆盖本项目的趋势柱图与分类条形图，支持语义摘要、数据表和键盘访问；无需额外图表运行时依赖。构建时解析可以避免客户端加载整个 Markdown 解析工具链。

## 后果

线上题库更新需要重新构建部署；BrowserRouter 要求静态托管支持 index.html 回退。学习数据受浏览器存储容量限制，导出备份是迁移设备的方式。历史记录必须独立于当前进度，且修改自评需要重算后续复习安排。

将来如增加云同步，应保留稳定题目 ID 和作答 record ID，并单独设计多设备合并策略；首版不提前引入后端。

## 修订

2026-09：路由由 BrowserRouter 改为 HashRouter，以便在 GitHub Pages 等纯静态托管下直接访问深链而无需 SPA 回退，见 [ADR 002](002-hash-routing.md)。其余决策不变。
