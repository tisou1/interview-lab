# 前端练习室 · Frontend Interview Lab

基于 React 的个人前端面试学习网站。把 Markdown 题库转为「主动回忆 → 分层题解 → 自评 → 间隔复习」的学习流程，并提供模拟面试和真实学习记录统计。

## 本地运行

要求 Node.js 24.15+ 的 24.x 或 26+（本项目使用 Node.js 24.18 验证），通过 Corepack 使用 package.json 固定的 pnpm 11.27.0。

```sh
pnpm install
pnpm dev
```

打开终端显示的本地地址。开发服务器启动时转换题库，并监听 `fe` 中的两个源文件。

```sh
pnpm content     # 单独校验并生成题库
pnpm typecheck
pnpm test
pnpm build      # 转换、类型检查、构建、bundle budget
pnpm preview
pnpm exec playwright install chromium
corepack pnpm test:e2e
pnpm deps:check  # 项目内 taze 检查所有直接依赖；pnpm 按要求保留 11.x
```

如果 Windows 沙箱无法读取用户级 Corepack 缓存，可在当前 PowerShell 会话中设置 `$env:COREPACK_HOME = "$PWD\.cache\corepack"`。项目使用本地 pnpm store 和依赖副本，避免共享缓存访问权限影响构建。

## 功能

- 全部 115 道现有题目，分类、难度、题型、标签和关键词筛选，URL 保留筛选条件。
- 草稿、收藏、待复查、计时、分层解析、自评，以及连续掌握的 7 / 14 / 30 天复习计划。
- 练习场次恢复，模拟面试去重抽题、截止时间恢复、自动交卷和逐题自评报告。
- 7 / 30 / 90 天趋势、当前熟练度与分类掌握率、未来复习安排和历次面试对比。
- Zustand 本地持久化、版本迁移、损坏数据备份、JSON 导入导出和清空。
- 12 周学习路线、深浅主题、键盘操作和移动端全屏草稿。
- 直接使用 `react-router` 的 BrowserRouter；Motion 提供轻量入场、答案展开和图表动效，尊重 reduced motion 设置。

## 如何新增题目

只编辑 `fe/JavaScript_React原理与实战模拟面试题库.md`。使用未占用的稳定编号，复制 [题目模板](docs/QUESTION_TEMPLATE.md)，填入元数据、题干和 `<details>` 答案区。题目标题前后保留空行。

开发时保存文件会自动更新；线上需要重新运行构建并部署 `dist/`。生成的 JSON 位于 `src/data/generated/`，不手工编辑，也不提交。题目编号不可因调整顺序而重排，否则已有学习进度会失去对应关系。

具体格式与错误诊断见 [内容管线](docs/CONTENT_PIPELINE.md)。

## UI 组件

项目按照 shadcn 的 Vite 安装方式接入 Tailwind CSS 与 `@tailwindcss/vite`，配置位于 `components.json`。组件源码保存在 `src/components/ui/`，可以继续用官方 CLI 添加组件：

```sh
pnpm dlx shadcn@latest add dropdown-menu
```

现有 `Button`、`Select`、`Dialog` 和 `Sonner` 已接入业务页面。主题变量统一维护在 `src/styles/tokens.css`，使用黑白灰作为主色，并由 Zustand 的主题设置同步 `.dark` 类。

## 部署

采用 BrowserRouter，需要静态托管支持 SPA 回退。当前 Vite `base` 与 BrowserRouter `basename` 均为 `/interview-lab/`；部署时将应用路由回退到 `index.html`。已提供 `public/_redirects` 和 [Nginx 示例](deploy/nginx.conf)。

验收时直接访问并刷新 `/interview-lab/questions/1`、`/interview-lab/mock/report/示例ID`；第二个地址即使没有对应本地报告，也应显示网站内的空状态。实际静态资源缺失应返回 404。更换部署子目录时，需要同时调整 Vite `base`；BrowserRouter 会从 `import.meta.env.BASE_URL` 自动取得对应 basename。

## 数据与统计

无需后端和账号；数据只保存在当前浏览器。更换设备、清理浏览器数据前请导出备份。导入采用校验后整体替换，需要确认。没有作答记录的旧数据只恢复进度，不伪造历史曲线。

掌握率来自用户自评，不是自动评分。“已回答”不代表答对。模拟面试在界面上禁止查看题解；这是个人自律学习工具，不是防作弊考试系统。代码题仅支持提纲书写和答案对照，不执行代码。

## 项目文档

依赖更新采用本地 `taze`，`pnpm deps:check` 对运行与开发依赖检查 npm latest。pnpm 固定 11.x；传递依赖按锁文件及 pnpm 默认安全策略解析，不强行覆盖上游兼容范围。运行 `pnpm exec taze latest --write --include-locked --exclude pnpm` 可更新版本声明，随后重新安装并执行测试。

- [架构与状态边界](docs/ARCHITECTURE.md)
- [Markdown 内容管线](docs/CONTENT_PIPELINE.md)
- [测试与验收](docs/TESTING.md)
- [性能与统计口径](docs/PERFORMANCE.md)
- [架构决策](docs/decisions/001-local-first.md)

计划书和 `fe` 学习文档继续保留作为原始资料。学习路线里的 TeamFlow 等项目只是阅读材料，不属于本站业务功能。
