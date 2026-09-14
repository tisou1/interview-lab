var e=[{id:110,slug:`question-110`,title:`如何设计一个前端 RBAC/数据权限系统？`,category:`architecture`,type:`scenario`,difficulty:`advanced`,tags:[`系统设计`,`RBAC`,`权限`],estimatedMinutes:8,promptHtml:``,answerSections:[{id:`q110-section-0`,title:`题解框架`,html:`
<ol>
<li>定义 subject、resource、action、scope，不把 role 判断散落 UI。</li>
<li>登录后获取能力集合或策略输入，统一 <code>can(action, resource)</code>。</li>
<li>路由、菜单、按钮都消费同一能力层，但服务端始终最终鉴权。</li>
<li>多租户请求绑定 tenant，服务端检查资源归属；前端不可只靠隐藏 tenant id。</li>
<li>权限缓存有版本/过期策略；收到 403 能刷新或安全降级。</li>
<li>用角色 × 资源 × 动作矩阵测试，记录审计事件。</li>
</ol>
`},{id:`q110-section-1`,title:`追问`,html:`
<p>RBAC 无法表达所有规则时可加入 resource attribute/ownership，演变为 ABAC 或 policy-based 模型；不要无限扩张 role 数量。</p>
`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:2684}},{id:111,slug:`question-111`,title:`多个请求同时返回 401，如何避免重复 refresh？`,category:`architecture`,type:`scenario`,difficulty:`advanced`,tags:[`系统设计`,`请求`],estimatedMinutes:8,promptHtml:``,answerSections:[{id:`q111-section-0`,title:`题解`,html:`
<p>客户端维护单个 in-flight refresh Promise。首个 401 创建 refresh，后续 401 等待同一个 Promise；成功后各自仅重试一次，失败则统一清理 session 并跳登录。必须防止 refresh 请求本身再次进入同一拦截逻辑形成死循环。</p>
<p>还要讨论：请求 body 是否可重放、mutation 幂等性、页面卸载、跨标签页协调、服务端 token rotation。若采用 HttpOnly Cookie，前端可能不直接接触 token，但过期协调问题仍存在。</p>
`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:2707}},{id:112,slug:`question-112`,title:`如何设计大文件分片上传？`,category:`architecture`,type:`scenario`,difficulty:`advanced`,tags:[`系统设计`],estimatedMinutes:8,promptHtml:``,answerSections:[{id:`q112-section-0`,title:`题解框架`,html:`
<p>文件选择 → 生成文件标识/协商上传 → 分片 → 并发限制 → 每片校验与重试 → 服务端记录已上传分片 → 断点恢复 → 合并 → 整体校验。</p>
<p>前端重点：</p>
<ul>
<li>不一次把整文件读入额外内存。</li>
<li>控制并发与失败重试，支持 AbortController 暂停/取消。</li>
<li>进度按字节计算，区分上传与服务端合并。</li>
<li>文件 hash 可增量计算并考虑 Worker，但不能只靠 hash 作为权限凭证。</li>
<li>服务端保证分片归属、幂等、过期清理和最终校验。</li>
</ul>
`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:2722}},{id:113,slug:`question-113`,title:`如何设计前端错误处理体系？`,category:`architecture`,type:`scenario`,difficulty:`advanced`,tags:[`系统设计`],estimatedMinutes:8,promptHtml:``,answerSections:[{id:`q113-section-0`,title:`题解框架`,html:`
<p>Transport error → HTTP client 标准化 → domain error → query/mutation layer → route/component UI → logging/trace。</p>
<p>错误至少区分 validation、business、authn/authz、network/timeout、rate limit、server、programming error。为每类定义：是否重试、用户提示、是否保留旧数据、日志级别、恢复入口。Error Boundary 不处理所有异步请求错误；toast 也不应成为唯一错误 UI。</p>
`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:2744}},{id:114,slug:`question-114`,title:`如何从零分析一次 React 页面卡顿？`,category:`architecture`,type:`scenario`,difficulty:`advanced`,tags:[`系统设计`,`React`],estimatedMinutes:8,promptHtml:``,answerSections:[{id:`q114-section-0`,title:`题解框架`,html:`
<ol>
<li>明确用户操作、数据规模、设备、网络、构建模式。</li>
<li>Performance 找 long task、layout/paint；React Profiler 找昂贵 commit 和组件。</li>
<li>区分 JS 计算、组件 render、DOM 数量、布局绘制、请求瀑布。</li>
<li>提出单一主要假设并修改。</li>
<li>相同条件复测，报告 p50/p95 或多次结果，而不是挑最好一次。</li>
<li>记录复杂度、包体积、内存、可访问性等副作用。</li>
</ol>
`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:2759}},{id:115,slug:`question-115`,title:`如何设计前端项目目录和模块边界？`,category:`architecture`,type:`scenario`,difficulty:`advanced`,tags:[`系统设计`,`模块`],estimatedMinutes:8,promptHtml:``,answerSections:[{id:`q115-section-0`,title:`题解`,html:`
<p>先按变化原因和业务能力分，而不是机械按文件类型。<code>features/project</code> 内聚 API、model、UI；<code>shared</code> 只容纳稳定的跨业务能力；<code>app</code> 负责 providers/bootstrap；routes 负责页面组合。</p>
<p>关键是依赖规则：shared 不依赖 feature；feature 间通过公共契约或上层协调；组件不直接散落 HTTP 调用；领域类型不被某个 UI 组件反向绑定。目录结构没有唯一正确答案，需根据团队规模、发布边界和复用频率调整。</p>
`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:2780}}];export{e as default};