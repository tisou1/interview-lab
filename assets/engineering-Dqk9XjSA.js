var e=[{id:82,slug:`question-82`,title:`tree shaking 为什么可能失败？`,category:`engineering`,type:`theory`,difficulty:`intermediate`,tags:[`工程化`],estimatedMinutes:5,promptHtml:``,answerSections:[{id:`q82-section-0`,title:`答案`,html:`
<p>tree shaking 依赖 ESM 静态结构、打包器分析和副作用信息。CommonJS 动态 require、顶层副作用、错误的 <code>sideEffects</code> 声明、整包聚合导入、库发布格式等都可能妨碍消除。</p>
<p>不要只看源代码 import 写法，要分析生产 bundle，并验证功能没有因错误 sideEffects 配置被移除。</p>
`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:1620}},{id:83,slug:`question-83`,title:`source map 有什么价值和安全风险？`,category:`engineering`,type:`theory`,difficulty:`intermediate`,tags:[`工程化`],estimatedMinutes:5,promptHtml:``,answerSections:[{id:`q83-section-0`,title:`答案`,html:`
<p>source map 把压缩构建代码位置映射回源码，便于线上错误定位。可将 map 上传到监控平台但不公开部署，按 release/version 对应；若公开 map，可能暴露源码、内部路径或注释。无论是否有 map，浏览器 bundle 中都不能包含 secret。</p>
`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:1635}},{id:84,slug:`question-84`,title:`前端监控应采集什么？`,category:`engineering`,type:`theory`,difficulty:`intermediate`,tags:[`工程化`],estimatedMinutes:5,promptHtml:``,answerSections:[{id:`q84-section-0`,title:`答案`,html:`
<p>错误：JS error、unhandled rejection、资源失败、接口失败、白屏；性能：Web Vitals、关键业务耗时；行为：最少必要的操作上下文。每条记录附 release、route、device/network、trace/request id，并做采样、聚合与脱敏。</p>
<p>监控不是越多越好。要控制数据量、性能开销和个人信息；告警应基于影响面、错误率和持续时间，避免单条错误制造噪声。</p>
`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:1649}},{id:85,slug:`question-85`,title:`CI 中前端项目最小质量门禁是什么？`,category:`engineering`,type:`theory`,difficulty:`intermediate`,tags:[`工程化`],estimatedMinutes:5,promptHtml:``,answerSections:[{id:`q85-section-0`,title:`答案`,html:`
<p>依项目风险，通常包含 lockfile 安装、lint、typecheck、targeted tests、production build。关键项目再增加 E2E、bundle budget、安全扫描和预览环境。</p>
<p>任务应可缓存、可并行且结果可复现。不能只在 CI 修问题，本地脚本应与 CI 使用同一入口；失败日志要能定位，测试不应依赖不稳定第三方数据。</p>
`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:1664}}];export{e as default};