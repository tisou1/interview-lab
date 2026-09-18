# Frontend Interview Lab 协作指南

本文件面向在本仓库中工作的编码 Agent。目标是让改动保持小、准、可验证，并保护已有学习数据和内容资产。

## 项目概览

这是一个本地优先的前端面试学习应用，技术栈为 React 19、TypeScript、Vite、Zustand、React Router、Tailwind CSS 和 Motion。

- 题库与学习路线来自 Markdown，在构建时解析为只读数据。
- 学习进度、草稿、场次和统计保存在浏览器 `localStorage`，没有后端或账号系统。
- 应用使用 HashRouter（URL 形如 `/interview-lab/#/questions/1`），并以 `/interview-lab/` 作为默认部署子路径。
- `package.json`、源码和配置是当前行为的事实来源；文档与其冲突时，先查明原因再修改。

## 开始工作前

1. 阅读用户请求和本文件，并检查当前工作区状态。
2. 定位受影响的源码、测试、配置和项目文档后再修改。
3. 保留用户已有改动；不要覆盖、回退或顺手整理无关内容。
4. 选择能够完成任务的最小改动，不做未经请求的重构、升级或格式化。

## 项目地图

- `src/app/`：应用入口布局、路由和全局错误边界。
- `src/pages/`：按路由懒加载的页面组件。
- `src/components/`：业务组件、图表、动效包装与 UI 组件。
- `src/components/ui/`：通过 shadcn 方式维护的基础 UI 组件。
- `src/hooks/`：学习计时等 React hooks。
- `src/lib/`：抽题、筛选、复习间隔、统计和主题注册表等纯逻辑。
- `src/storage/`：Zustand store、持久化、导入、校验和迁移。
- `src/data/`：生成数据的只读访问层。
- `src/styles/`：全局样式、设计 token 和页面样式。
- `scripts/`：Markdown 构建管线和 bundle budget 检查。
- `fe/`：题库与学习路线的 Markdown 源文件。
- `tests/`：Vitest 单元/组件测试和 `tests/e2e/` 下的 Playwright 流程测试。
- `docs/`：架构、内容管线、测试、性能和决策记录。

## 按任务读取文档

- 修改架构、路由或状态边界前，阅读 `docs/ARCHITECTURE.md`；涉及路由模式时同时阅读 `docs/decisions/002-hash-routing.md`。
- 修改持久化模型或基础技术选型前，同时阅读 `docs/decisions/001-local-first.md`。
- 修改题库、路线、解析器或生成数据前，阅读 `docs/CONTENT_PIPELINE.md` 和 `docs/QUESTION_TEMPLATE.md`。
- 修改测试策略或浏览器流程前，阅读 `docs/TESTING.md`。
- 修改加载策略、统计口径或 bundle budget 前，阅读 `docs/PERFORMANCE.md`。
- 如果拟议改动违背已采用的 ADR，先向用户说明冲突，不要静默绕过。

## 不可破坏的约束

### 内容管线

- `fe/JavaScript_React原理与实战模拟面试题库.md` 是题库的唯一人工维护源。
- `fe/前端技术深度进阶路线_12周_求职版_最终整合.md` 是学习路线源。
- 禁止手工编辑或提交 `src/data/generated/`；应通过 `pnpm content` 重新生成。
- 题目 ID 来自标题编号，必须唯一且稳定；调整顺序时不得重排已有 ID。
- 保持 Markdown 解析、HTML 白名单清洗和不安全 URL/属性过滤。
- 用户草稿只能作为文本处理，不得拼接到 `dangerouslySetInnerHTML`。

### 状态与数据

- URL 保存可分享的筛选和视图状态；Zustand 保存跨页面学习数据；临时 UI 状态留在组件内。
- 不要把只读题库复制进 `localStorage`。
- 修改持久化 schema 时必须同步版本迁移、导入校验和相关回归测试。
- 保持损坏数据备份和存储失败提示；不要在失败路径中覆盖无法备份的原始数据。
- 提交、自评和自动交卷应保持幂等，不能因重复操作生成重复学习记录。
- 自评是用户主观熟练度，不得重新解释为自动评分或客观正确率。

### 主题与样式

- `src/lib/themes.ts` 是主题注册表；新增主题加一条记录，并在 `src/styles/tokens.css` 补一段同 id 的调色板，语义变量层不需要改。
- 组件样式只能消费 `tokens.css` 的语义变量，不要在组件里写死颜色；深浅判断用主题的 `mode` 或 `.dark` 类，不要判断具体主题 id。
- 主题切换只替换 `html` 上的 `data-theme`、`.dark` 与 `meta[theme-color]`，不要引入运行时逐节点改色。
- 调色板的前景色需与各自的背景满足可读对比度；改动配色后要核对弱化文本、强调色与状态色。

### 路由、渲染与动效

- Vite `base` 决定静态资源前缀，与路由模式解耦；HashRouter 不接收 `basename`，深链只存在于 URL fragment。
- 不要换回 BrowserRouter：GitHub Pages 无法配置 SPA 回退（见 `docs/decisions/002-hash-routing.md`）。
- 未知路由、题目或报告应显示应用内空状态，而不是导致渲染崩溃。
- 保持路由级懒加载，不要让首页预加载全部题解或 Markdown 解析工具链。
- 动效必须尊重 `prefers-reduced-motion`；业务状态更新不能依赖动画完成回调。
- 新增交互应保持键盘可用、焦点可见，并避免移动端横向溢出。

## 代码约定

- 遵循现有 TypeScript strict 配置；代码风格由 `pnpm format`（oxfmt）统一维护，不要手工调整格式或单独重排导入。
- 保持现有单引号、无分号风格；仅在可读性需要时拆分 JSX。
- 优先使用 `@/` 别名引用跨目录模块；邻近模块可继续使用相对路径。
- 将可独立验证的业务规则放在 `src/lib/`，不要把计算逻辑埋在页面 JSX 中。
- 使用 Zustand selector 订阅所需状态，避免无关状态导致大范围重渲染。
- 不新增依赖来解决已有平台 API 或当前依赖能够清晰处理的问题。
- 注释解释非显而易见的原因或不变量，不复述代码本身。

## 包管理与第三方工具

- 本项目只使用 `pnpm`，版本以 `package.json#packageManager` 为准。
- 直接运行 `pnpm`；不要改用 `npm`、`yarn` 或 Corepack 包装命令。
- 保留 `pnpm-lock.yaml`，只有依赖确实变化时才更新锁文件。
- 安装或集成第三方工具时，先核对与当前版本和框架匹配的官方文档及官方 CLI。
- 不手工仿造官方 CLI 应生成的配置；若官方流程与现有配置冲突，先诊断冲突。
- 不要把删除 `node_modules`、锁文件或 pnpm store 当作常规排错步骤。
- 不要运行 `pnpm store prune`；只有证据表明安装损坏时才重新安装依赖。
- 代码检查与格式化固定使用 `oxlint` 和 `oxfmt`，配置为根目录的 `oxlint.config.ts` 与 `oxfmt.config.ts`（两个工具都会自动发现）；不引入其他 linter/formatter，也不手工仿造它们应生成的配置。
- 两个工具的配置都排除了 `fe/`（题库源）、`前端面试题学习网站开发计划书.md`（归档资料）和 `src/data/generated/`，不要把这些路径从忽略列表移除。

## 可用命令

| 命令                | 用途                                              |
| ------------------- | ------------------------------------------------- |
| `pnpm dev`          | 启动 Vite 开发服务器并监听内容源                  |
| `pnpm content`      | 校验并生成题库和路线数据                          |
| `pnpm typecheck`    | 执行 TypeScript 类型检查                          |
| `pnpm lint`         | 用 oxlint 做静态检查                              |
| `pnpm lint:fix`     | 用 oxlint 自动修复可修复项                        |
| `pnpm format`       | 用 oxfmt 写入格式化                               |
| `pnpm format:check` | 只检查格式是否符合，不写入                        |
| `pnpm check`        | `lint` + `format:check` + `typecheck`             |
| `pnpm test`         | 运行全部 Vitest 测试                              |
| `pnpm build`        | 内容生成、类型检查、生产构建和 bundle budget 检查 |
| `pnpm build:vercel` | 使用根路径 base 执行 Vercel 构建                  |
| `pnpm test:e2e`     | 运行 Playwright 桌面和移动端流程                  |
| `pnpm preview`      | 预览生产构建结果                                  |

不要调用仓库中不存在的脚本（例如已移除的 `deps:check`）。新增脚本后应同步本节及相关文档。

## 验证策略

使用与改动风险匹配的最小验证，不要默认运行完整测试、完整构建或浏览器检查。

| 改动类型                            | 最小验证                                                             |
| ----------------------------------- | -------------------------------------------------------------------- |
| 纯文档                              | 检查路径、命令、链接和 diff；不运行应用测试                          |
| 题库或路线内容                      | `pnpm content`                                                       |
| 内容解析器                          | `pnpm content`，并运行 `pnpm exec vitest run tests/parser.test.ts`   |
| lint 或格式化配置                   | `pnpm lint` 与 `pnpm format:check`                                   |
| 主题变量或样式 token                | `pnpm typecheck`，必要时运行相关组件测试和浏览器检查                 |
| TypeScript 或 React 组件            | `pnpm typecheck`、`pnpm lint`，并运行直接相关的 Vitest 文件          |
| 学习算法或持久化                    | 运行 `tests/learning.test.ts` 及受影响的 `clock` 或 `workspace` 测试 |
| 构建配置、路由 base、依赖或性能预算 | `pnpm build`                                                         |
| 跨页面关键流程或重大功能            | 在上述检查后运行相关 Playwright 测试；必要时运行 `pnpm test:e2e`     |

- 为行为修复添加能复现问题的聚焦回归测试，不要照抄实现细节。
- 测试失败时先定位原因，不通过清缓存、放宽断言或删除测试来掩盖问题。
- 只有实际运行过的检查才能报告为通过；未运行的检查要明确说明。
- 浏览器、截图和完整 E2E 仅在用户要求、改动风险需要或目标无法用较小检查验证时使用。

## 安全与隐私

- 不读取、输出、提交或记录真实凭据、隐私数据、`.env*` 内容或浏览器学习数据。
- 测试和文档使用合成数据及占位凭据。
- 将 Markdown、导入 JSON、URL 参数和浏览器存储视为不可信输入，保留现有校验与清洗边界。
- 不为获得通过结果而关闭安全检查、HTML 清洗、导入校验或错误保护。

## Git 与交付

- 修改前后检查 `git status`，提交前审阅 diff。
- 每个完成的用户请求创建一个聚焦提交；提交信息应简洁、描述明确。
- 只提交当前任务相关文件或 hunks，不包含生成物、临时文件、凭据或用户的无关改动。
- 不执行 amend、rebase、reset、force push 或其他历史重写，除非用户明确要求。
- 不主动 push；只有用户明确要求时才推送远端。
- 交付时说明改了什么、运行了哪些验证，以及仍未验证的风险。
