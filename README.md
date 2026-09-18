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
pnpm content      # 单独校验并生成题库
pnpm typecheck
pnpm lint         # oxlint 静态检查
pnpm lint:fix     # oxlint 自动修复
pnpm format       # oxfmt 写入格式化
pnpm format:check # 只检查格式是否符合
pnpm check        # lint + format:check + typecheck
pnpm test
pnpm build      # 转换、类型检查、构建、bundle budget
pnpm preview
pnpm exec playwright install chromium
pnpm test:e2e
```

如果 Windows 沙箱无法读取用户级 Corepack 缓存，可在当前 PowerShell 会话中设置 `$env:COREPACK_HOME = "$PWD\.cache\corepack"`。项目使用本地 pnpm store 和依赖副本，避免共享缓存访问权限影响构建。

## 功能

- 全部 115 道现有题目，分类、难度、题型、标签和关键词筛选，URL 保留筛选条件。
- 草稿、收藏、待复查、计时、分层解析、自评，以及连续掌握的 7 / 14 / 30 天复习计划。
- 练习场次恢复，模拟面试去重抽题、截止时间恢复、自动交卷和逐题自评报告。
- 7 / 30 / 90 天趋势、当前熟练度与分类掌握率、未来复习安排和历次面试对比。
- Zustand 本地持久化、版本迁移、损坏数据备份、JSON 导入导出和清空。
- 12 周学习路线、6 套可切换主题、键盘操作和移动端全屏草稿。
- 直接使用 `react-router` 的 HashRouter，`/interview-lab/#/questions/1` 这类深链在纯静态托管下可直接访问和刷新；Motion 提供轻量入场、答案展开和图表动效，尊重 reduced motion 设置。

## 如何新增题目

只编辑 `fe/JavaScript_React原理与实战模拟面试题库.md`。使用未占用的稳定编号，复制 [题目模板](docs/QUESTION_TEMPLATE.md)，填入元数据、题干和 `<details>` 答案区。题目标题前后保留空行。

开发时保存文件会自动更新；线上需要重新运行构建并部署 `dist/`。生成的 JSON 位于 `src/data/generated/`，不手工编辑，也不提交。题目编号不可因调整顺序而重排，否则已有学习进度会失去对应关系。

具体格式与错误诊断见 [内容管线](docs/CONTENT_PIPELINE.md)。

## UI 组件

项目按照 shadcn 的 Vite 安装方式接入 Tailwind CSS 与 `@tailwindcss/vite`，配置位于 `components.json`。组件源码保存在 `src/components/ui/`，可以继续用官方 CLI 添加组件：

```sh
pnpm dlx shadcn@latest add dropdown-menu
```

现有 `Button`、`Select`、`Dialog`、`Popover` 和 `Sonner` 已接入业务页面。

## 主题

提供 6 套编辑器配色：Vitesse Light、Vitesse Dark、GitHub Light、GitHub Dark、Nord、Catppuccin Mocha。顶栏的调色板按钮和设置页的主题卡片网格都能切换，选择结果保存在本机。

主题注册表在 `src/lib/themes.ts`，调色板与语义变量在 `src/styles/tokens.css`：调色板按 `html[data-theme]` 声明，语义变量只在 `:root` 声明一次并引用调色板，因此新增主题只需补一段调色板。`Layout` 同时维护 `.dark` 类供 Tailwind 的 `dark:` 变体使用，并更新 `meta[name=theme-color]`。

## 部署

采用 HashRouter，URL 形如 `/interview-lab/#/questions/1`：深层路径只存在于 URL fragment，不会发送到服务器，因此 GitHub Pages 这类纯静态托管**不需要**配置 SPA 回退或 `_redirects`。

Vite `base` 仍为 `/interview-lab/`，决定静态资源前缀；`pnpm build` 的产物可直接发布到 `gh-pages` 分支。需要根路径部署时改用 `pnpm build:vercel`（base 为 `/`）。

验收时直接访问并刷新 `/interview-lab/#/questions/1`、`/interview-lab/#/mock/report/示例ID`；第二个地址即使没有对应本地报告，也应显示网站内的空状态。实际静态资源缺失仍应返回 404。更换部署子目录时只需调整 Vite `base`，路由不再依赖 `import.meta.env.BASE_URL`。旧版 BrowserRouter 形式的外链（不含 `#`）会落到学习概览页，需要重新生成。

## 数据与统计

无需后端和账号；数据只保存在当前浏览器。更换设备、清理浏览器数据前请导出备份。导入采用校验后整体替换，需要确认。没有作答记录的旧数据只恢复进度，不伪造历史曲线。

掌握率来自用户自评，不是自动评分。“已回答”不代表答对。模拟面试在界面上禁止查看题解；这是个人自律学习工具，不是防作弊考试系统。代码题仅支持提纲书写和答案对照，不执行代码。

## 项目文档

依赖更新采用本地 `taze`。pnpm 固定 11.x；传递依赖按锁文件及 pnpm 默认安全策略解析，不强行覆盖上游兼容范围。运行 `pnpm exec taze latest --write --include-locked --exclude pnpm` 可更新版本声明，随后重新安装并执行测试。

- [架构与状态边界](docs/ARCHITECTURE.md)
- [Markdown 内容管线](docs/CONTENT_PIPELINE.md)
- [测试与验收](docs/TESTING.md)
- [性能与统计口径](docs/PERFORMANCE.md)
- [架构决策：本地优先](docs/decisions/001-local-first.md)
- [架构决策：hash 路由](docs/decisions/002-hash-routing.md)

计划书和 `fe` 学习文档继续保留作为原始资料。学习路线里的 TeamFlow 等项目只是阅读材料，不属于本站业务功能。
