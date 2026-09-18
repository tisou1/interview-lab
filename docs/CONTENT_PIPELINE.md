# Markdown 内容管线

## 内容源

题库源：`fe/JavaScript_React原理与实战模拟面试题库.md`。

路线源：`fe/前端技术深度进阶路线_12周_求职版_最终整合.md`，单独生成阅读页面，不参与题数统计。

现有题库包含编号 1–115 的题目，另有模拟卷、评分模板与参考资料。附录原文保留，不将附录当成新的独立题目。网站模拟面试按配置抽题。

## 题目格式

- 顶层二级标题：`## 正整数. 题目标题`。编号 0 的使用说明除外。
- 标题后的 HTML 注释包含唯一一份 `question:` JSON 元数据。
- `<details>` 前是题干，可以包含 Markdown、代码块和现有 HTML。
- `<details>` 中是题解，可使用 Markdown `###` 或 HTML `<h3>` 小标题。
- `<summary>` 用作源文档折叠入口，不作为答案正文。现有 `<div>` 包装会展开为答案节点。
- 标题前后、`<details>` / `<summary>` 与 Markdown 正文之间保留空行，符合 CommonMark HTML 块规则。
- 解析保留第一个答案小标题之前的正文或代码，并将其作为「核心答案」。后续章节保持原始标题和顺序。
- 题目 ID 由标题编号决定。元数据不能覆盖 ID、标题或来源信息。

| 元数据字段       | 允许值                                                                          |
| ---------------- | ------------------------------------------------------------------------------- |
| category         | javascript / react / browser / typescript / engineering / coding / architecture |
| type             | theory / coding / debugging / scenario                                          |
| difficulty       | basic / intermediate / advanced                                                 |
| tags             | 非空字符串数组                                                                  |
| estimatedMinutes | 大于 0 的数字                                                                   |

代码题仍可归入 JavaScript 或 React 专题，使用 `type: coding` 表示题型。浏览器、TypeScript、工程化的混合源章节通过逐题元数据区分。

## 生成过程

`scripts/build-question-data.mjs` 使用 remark AST 识别真正的标题，跳过 fenced code 内的伪标题。提取答案后，经 remark-gfm、remark-rehype、rehype-raw 和 rehype-sanitize 处理为安全 HTML，再按答案标题分层。

安全过滤使用白名单；删除事件属性、脚本和不安全 URL；代码块仅保留语言 class；外部链接添加 `noopener noreferrer`。用户草稿通过 textarea 文本值渲染，永不拼入 HTML。

输出：轻量 `index.json`（题目元数据和搜索文本）、各分类题目数据、`roadmap.json`。全部生成文件位于 `src/data/generated/`，由 Git 忽略。Vite 构建将分类数据拆成延迟加载模块。

开发启动时生成一次；监听源文件变化，成功时重新生成并刷新页面，失败时显示带文件和行号的错误浮层。先完成全部解析再写文件，避免非法编辑覆盖上次有效数据。生产构建解析失败会直接退出。

## 校验与维护

必检：唯一正整数 ID、非空标题、元数据枚举、非空 tags、正数预计时间、有效且非空的答案区。错误示例：`fe/题库.md:42: Q116 难度无效`。

`scripts/annotate-legacy.mjs` 是初始 115 道题的幂等迁移脚本，已执行。后续维护以 Markdown 内的元数据为准，不需要再次运行迁移。难度和预计时间是可编辑的学习建议，不是客观难度评分。

修改题目时保留 ID；删除题目后历史记录仍保留，当前统计只计算当前题库。新增题目在下一次构建后自动进入搜索、筛选、练习与分类统计。
