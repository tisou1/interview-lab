import{T as e,g as t,v as n,x as r}from"./index-DciViYoI.js";var i={html:`<h1>前端技术深度进阶路线（12 周 · 求职版 · 最终整合）</h1>
<blockquote>
<p>适用对象：3–4 年前端经验，以 React / TypeScript 为主，能独立完成常规业务，但知识较零散，希望补足原理、工程深度、问题诊断与技术表达。</p>
<p>建议投入：每周 12–15 小时。在职可安排工作日每天 1–1.5 小时，周末共 5–7 小时。</p>
<p>整理日期：2026-09-14。React 当前处于 19.x；新特性以官方稳定文档为准，重点仍是不会快速过时的渲染、状态、Effect、浏览器与工程原理。</p>
</blockquote>
<p>配套练习：<a href="./JavaScript_React%E5%8E%9F%E7%90%86%E4%B8%8E%E5%AE%9E%E6%88%98%E6%A8%A1%E6%8B%9F%E9%9D%A2%E8%AF%95%E9%A2%98%E5%BA%93.md">JavaScript / React 原理与实战模拟面试题库</a>。题解默认折叠，适合先口述或手写，再展开核对。</p>
<hr>
<h2>1. 这 12 周要解决什么问题</h2>
<p>目标不是再横向堆 React、Vue、Svelte、Electron、各种构建工具，而是让你逐步具备四层能力：</p>
<h3>Level 1：会使用</h3>
<p>能使用 React Hooks、路由、状态库、请求库、Vite 等完成业务。</p>
<h3>Level 2：能解释</h3>
<p>能解释：</p>
<ul>
<li><code>setState</code> 后为什么当前变量不立即变化？</li>
<li><code>key</code> 为什么不只是消除 warning？</li>
<li>Effect 到底解决什么问题？</li>
<li>server state 为什么不应全部放进全局 store？</li>
<li>ESM 与 CommonJS 的核心差异是什么？</li>
<li>Vite 开发环境为什么通常启动更快？</li>
</ul>
<h3>Level 3：能诊断</h3>
<p>面对重复请求、竞态、无效渲染、内存泄漏、长任务、构建变慢等问题，能使用 Network、Performance、Memory、React Profiler 和构建分析工具定位，而不是凭感觉修改。</p>
<h3>Level 4：能决策</h3>
<p>能根据数据所有权、更新频率、团队成本、性能、可靠性等约束说明：</p>
<ul>
<li>状态为什么放组件、URL、server cache 或全局 store？</li>
<li>为什么做或不做抽象、虚拟列表、乐观更新、微前端？</li>
<li>为什么某处需要 E2E，而另一个模块只需单元测试？</li>
<li>方案的收益、代价、失败模式和替代方案是什么？</li>
</ul>
<p>最终判断标准：</p>
<blockquote>
<p>能预测结果 → 能用实验验证 → 能解释原理 → 能说明边界与取舍。</p>
</blockquote>
<hr>
<h2>2. 开始前：用 60 分钟建立基线</h2>
<p>不要查资料，给每题最多 3 分钟，并把回答写到 <code>docs/baseline.md</code>。</p>
<h3>JavaScript 与浏览器</h3>
<ol>
<li>闭包保存的是什么？什么时候可能导致内存长期不能释放？</li>
<li>原型链如何查找属性？<code>class</code> 与 prototype 是什么关系？</li>
<li><code>Promise.then</code>、<code>queueMicrotask</code>、<code>setTimeout</code> 和浏览器渲染的顺序如何判断？</li>
<li>async/await 为什么不等于多线程？异常如何传播？</li>
<li>从输入 URL 到页面可交互，经历了什么？</li>
<li>HTTP 强缓存、协商缓存、Cookie、CORS 分别解决什么问题？</li>
<li>DOM/CSSOM 到像素显示经历了什么？什么容易触发 layout、paint、composite？</li>
</ol>
<h3>React</h3>
<ol>
<li>render phase 与 commit phase 各做什么？</li>
<li>state 存在组件函数里吗？React 如何识别某一份 state？</li>
<li>连续执行三次 <code>setCount(count + 1)</code> 为什么通常不是 <code>+3</code>？</li>
<li>哪些场景不需要 Effect？Effect cleanup 为什么重要？</li>
<li>stale closure 如何产生？为什么不能凭感觉删依赖？</li>
<li><code>memo</code>、<code>useMemo</code>、<code>useCallback</code> 分别优化什么？什么时候没有收益？</li>
<li>Context 为什么可能造成较大范围更新？</li>
<li>Suspense、Transition 分别改善什么体验？</li>
<li>CSR、SSR、SSG、streaming SSR、hydration 的差异是什么？</li>
</ol>
<h3>TypeScript 与工程</h3>
<ol>
<li><code>any</code>、<code>unknown</code>、<code>never</code> 有什么区别？</li>
<li>discriminated union 如何避免非法状态？</li>
<li>泛型如何保留输入和输出之间的类型关系？</li>
<li>ESM/CJS、tree shaking、code splitting 分别是什么？</li>
<li>unit、component、integration、E2E test 应如何分工？</li>
<li>如何证明一次性能优化真的有效？</li>
<li>怎样设计错误处理、监控、灰度与回滚？</li>
</ol>
<p>评分：</p>
<ul>
<li>0 分：不知道。</li>
<li>1 分：记得结论，解释不了原因。</li>
<li>2 分：能解释原因并写最小例子。</li>
<li>3 分：能说明边界、反例、取舍和排查方法。</li>
</ul>
<p>第 12 周重新回答。核心题稳定达到 2–3 分，比记住大量零散面试答案更有价值。</p>
<hr>
<h2>3. 12 周总览</h2>






































































<table><thead><tr><th>周</th><th>主线</th><th>可验证产出</th></tr></thead><tbody><tr><td>第 1 周</td><td>JavaScript 执行模型</td><td>闭包、原型、异步与 ESM 实验集</td></tr><tr><td>第 2 周</td><td>浏览器与网络</td><td>页面加载图、Network/Performance 分析</td></tr><tr><td>第 3 周</td><td>TypeScript 与模块</td><td>类型设计案例、TSConfig/Module 实验</td></tr><tr><td>第 4 周</td><td>React Rendering</td><td><code>react-render-lab</code> 与渲染心智模型图</td></tr><tr><td>第 5 周</td><td>State / Effect / Context</td><td>旧项目状态重构、竞态与订阅实验</td></tr><tr><td>第 6 周</td><td>React 调度、并发与源码</td><td>Transition 对比、外部 store、调用路径图</td></tr><tr><td>第 7 周</td><td>Server State / Router / Auth / RBAC</td><td>主项目完整数据与权限模块、ADR</td></tr><tr><td>第 8 周</td><td>工程化与测试</td><td>生产工程、CI、unit/component/E2E</td></tr><tr><td>第 9 周</td><td>性能</td><td>有前后数据的性能优化报告</td></tr><tr><td>第 10 周</td><td>Web 安全与稳定性</td><td>安全检查、统一错误模型、故障演练</td></tr><tr><td>第 11 周</td><td>中型项目架构与系统设计</td><td><code>ARCHITECTURE.md</code>、3 份设计题</td></tr><tr><td>第 12 周</td><td>项目包装与求职</td><td>README、简历、项目故事、模拟面试</td></tr></tbody></table>
<p>贯穿 12 周只维护两条线：</p>
<ol>
<li><strong>主线项目：TeamFlow 协作任务平台</strong>，体现 React 企业应用能力。</li>
<li><strong>可选特色项目：生词浏览器插件</strong>，用于体现浏览器 API 与差异化；时间紧时不做。</li>
</ol>
<p>不要等学完再投递：第 1 周整理简历和 JD，第 2 周开始小规模投递，第 4 周开始稳定投递。</p>
<hr>
<h2>4. 每周执行节奏</h2>
<p>一次学习 90–120 分钟：</p>
<ol>
<li>20 分钟：不看资料回忆昨天的模型。</li>
<li>30 分钟：围绕一个问题阅读官方资料。</li>
<li>40 分钟：写最小实验、打断点或记录性能。</li>
<li>20 分钟：写 200 字解释，或做 3–5 分钟口述。</li>
</ol>
<p>每周固定完成：</p>
<ul>
<li>1 篇原理笔记。</li>
<li>1 组可运行实验。</li>
<li>1 次主项目改进。</li>
<li>5 个面试问题的口述。</li>
<li>1 份工具证据或技术决策记录。</li>
</ul>
<p>时间比例建议：<strong>60% 写代码与实验，25% 阅读，15% 总结与表达</strong>。</p>
<hr>
<h1>5. 第 1 周：JavaScript 执行模型</h1>
<h2>学习重点</h2>
<ul>
<li>execution context、lexical scope、closure、<code>this</code></li>
<li>prototype chain、属性描述符、<code>new</code> 的过程</li>
<li>Promise、async/await、错误传播</li>
<li>task、microtask、event loop、浏览器渲染时机</li>
<li>Iterator / Generator 的基本思想</li>
<li>ESM 的静态结构与 live binding</li>
<li>垃圾回收的可达性模型与常见泄漏来源</li>
</ul>
<h2>必须能回答</h2>
<ul>
<li>函数执行完成后，闭包引用的变量为什么还存在？</li>
<li><code>this</code> 由定义位置还是调用方式决定？箭头函数有什么不同？</li>
<li>Promise callback 为什么不会立刻执行？</li>
<li>async 函数在哪里暂停，恢复任务如何进入队列？</li>
<li>ESM 为什么更利于静态分析？循环依赖会有什么现象？</li>
</ul>
<h2>动手任务</h2>
<p>建立：</p>
<pre><code class="language-text">playground/
  closure/
  prototype/
  event-loop/
  promise/
  esm/
</code></pre>
<ol>
<li>每类写 3–5 个最小实验，先写预测再运行。</li>
<li>写 10 道异步输出顺序题，并画 task/microtask 时间线。</li>
<li>不使用 <code>class</code>，用原型实现继承，再解释 <code>class</code> 替你做了什么。</li>
<li>用 Memory 面板观察一个未清理的监听器或定时器造成的对象滞留。</li>
<li>实现一个有最大并发数的 Promise 任务调度器。</li>
</ol>
<h2>资料</h2>
<ul>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" rel="noopener noreferrer" target="_blank">MDN JavaScript Guide</a></li>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model" rel="noopener noreferrer" target="_blank">MDN JavaScript execution model</a></li>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide/In_depth" rel="noopener noreferrer" target="_blank">MDN Microtask 深入指南</a></li>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules" rel="noopener noreferrer" target="_blank">MDN JavaScript Modules</a></li>
<li><a href="https://tc39.es/ecma262/" rel="noopener noreferrer" target="_blank">ECMAScript Specification</a>：查证相关章节，不从第一页通读。</li>
<li><a href="https://github.com/getify/You-Dont-Know-JS" rel="noopener noreferrer" target="_blank">You Don't Know JS Yet（作者仓库）</a></li>
</ul>
<h2>验收</h2>
<p>不查资料连续讲 10 分钟：“一段包含 Promise、setTimeout、事件回调和 async/await 的代码如何执行”。</p>
<hr>
<h1>6. 第 2 周：浏览器与网络</h1>
<h2>学习重点</h2>
<ul>
<li>DNS、TCP、TLS、HTTP 请求与响应的基本路径</li>
<li>HTTP method/status、HTTP/2 与 HTTP/3 基础、CDN</li>
<li>Cache-Control、强缓存、协商缓存</li>
<li>同源策略、CORS、Cookie 与 SameSite</li>
<li>HTML parsing、DOM、CSSOM、render tree、layout、paint、composite</li>
<li>LCP、INP、CLS；preload、preconnect、lazy loading</li>
<li>DevTools：Network、Performance、Memory、Application、Coverage</li>
</ul>
<h2>动手任务</h2>
<p>选择一个真实页面并回答：</p>
<ol>
<li>HTML 和关键资源什么时候加载？请求瀑布图是否合理？</li>
<li>最大 bundle 是哪个？有没有重复请求？</li>
<li>哪些资源命中缓存，依据是什么？</li>
<li>LCP 元素是什么？有没有 layout shift 或 long task？</li>
<li>页面何时达到可交互状态？主线程时间花在哪里？</li>
</ol>
<p>再完成三个实验：</p>
<ul>
<li>制造 layout thrashing，再通过批量读写 DOM 消除，保存 trace。</li>
<li>给搜索请求增加 <code>AbortController</code>，防止旧响应覆盖新结果。</li>
<li>演示 React 默认转义能防住的输入，以及 <code>dangerouslySetInnerHTML</code> 带来的 XSS 风险。</li>
</ul>
<h2>资料</h2>
<ul>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview" rel="noopener noreferrer" target="_blank">MDN HTTP Overview</a></li>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching" rel="noopener noreferrer" target="_blank">MDN HTTP Caching</a></li>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS" rel="noopener noreferrer" target="_blank">MDN CORS</a></li>
<li><a href="https://web.dev/learn/performance/" rel="noopener noreferrer" target="_blank">web.dev Learn Performance</a></li>
<li><a href="https://web.dev/articles/vitals" rel="noopener noreferrer" target="_blank">web.dev Web Vitals</a></li>
<li><a href="https://developer.chrome.com/docs/devtools/performance/" rel="noopener noreferrer" target="_blank">Chrome DevTools Performance</a></li>
</ul>
<h2>验收</h2>
<ul>
<li><code>docs/browser-loading.md</code>：一张“URL 到可交互”的流程图。</li>
<li><code>docs/browser-performance-note.md</code>：问题、证据、原因、修改、前后数据。</li>
</ul>
<hr>
<h1>7. 第 3 周：TypeScript 与模块系统</h1>
<h2>学习重点</h2>
<ul>
<li><code>any</code>、<code>unknown</code>、<code>never</code>、类型收窄</li>
<li>union/intersection、discriminated union、穷尽检查</li>
<li>泛型、约束、条件类型、映射类型、模板字面量类型、<code>infer</code></li>
<li><code>keyof</code>、indexed access、<code>satisfies</code> 与常用 utility types</li>
<li>结构化类型系统和协变/逆变的直觉</li>
<li><code>target</code>、<code>module</code>、<code>moduleResolution</code>、<code>lib</code>、<code>types</code></li>
<li><code>strict</code>、<code>isolatedModules</code>、<code>noUncheckedIndexedAccess</code></li>
<li>ESM/CJS、Node/bundler module resolution、<code>package.json exports</code></li>
</ul>
<h2>工程原则</h2>
<p>类型的目标是表达业务约束，而不是炫技。下面这种能排除非法状态的模型，通常比 20 层 conditional type 更有价值：</p>
<pre><code class="language-ts">type RequestState&#x3C;T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiError }
</code></pre>
<h2>动手任务</h2>
<ol>
<li>实现 <code>DeepReadonly&#x3C;T></code>、<code>ApiResult&#x3C;T></code>、<code>PaginatedResult&#x3C;T></code>、<code>FormErrors&#x3C;T></code>。</li>
<li>实现类型安全的 <code>EventEmitter&#x3C;EventMap></code>。</li>
<li>设计泛型 <code>Table&#x3C;T></code>：列名来自 <code>T</code>，render 能推导字段类型。</li>
<li>将旧项目 5 个 <code>any</code> 改成 <code>unknown</code>，在系统边界验证或显式收窄。</li>
<li>用两个最小项目比较 Node 与 bundler 的 module resolution。</li>
<li>给上述类型写类型测试，包含应当编译失败的案例。</li>
</ol>
<h2>资料</h2>
<ul>
<li><a href="https://www.typescriptlang.org/docs/handbook/intro.html" rel="noopener noreferrer" target="_blank">TypeScript Handbook</a></li>
<li><a href="https://www.typescriptlang.org/docs/handbook/2/narrowing.html" rel="noopener noreferrer" target="_blank">Narrowing</a></li>
<li><a href="https://www.typescriptlang.org/docs/handbook/2/generics.html" rel="noopener noreferrer" target="_blank">Generics</a></li>
<li><a href="https://www.typescriptlang.org/docs/handbook/2/types-from-types.html" rel="noopener noreferrer" target="_blank">Creating Types from Types</a></li>
<li><a href="https://www.typescriptlang.org/tsconfig/" rel="noopener noreferrer" target="_blank">TSConfig Reference</a></li>
<li><a href="https://nodejs.org/api/packages.html" rel="noopener noreferrer" target="_blank">Node.js Packages</a></li>
</ul>
<h2>验收</h2>
<ul>
<li><code>playground/typescript-patterns.ts</code>：至少 8 个可运行或可类型检查的例子。</li>
<li>能解释：“TypeScript 的类型安全边界在哪里？为什么不能自动保证接口运行时数据正确？”</li>
</ul>
<hr>
<h1>8. 第 4 周：React Rendering 心智模型</h1>
<h2>核心主线</h2>
<pre><code class="language-text">State / Props / Context change
             ↓
          Render
             ↓
       Reconciliation
             ↓
           Commit
             ↓
           Effect
</code></pre>
<p>重点理解：</p>
<ul>
<li>UI 是 state 的快照；组件与 Hook 必须保持纯粹</li>
<li>render 不等于 DOM update</li>
<li>state update queue、batching、函数式更新</li>
<li>reconciliation 的目标与 <code>key</code> 的身份语义</li>
<li>state 与组件树位置的关系，保留和重置 state</li>
<li>controlled/uncontrolled component</li>
<li>Strict Mode 的开发期检查</li>
</ul>
<h2>必须能回答</h2>
<ul>
<li>连续三次 <code>setCount(count + 1)</code> 为什么通常不是 <code>+3</code>？</li>
<li>父组件 render 后，子组件函数何时会重新执行？DOM 一定更新吗？</li>
<li><code>key</code> 为什么能重置 state？数组 index 什么时候会产生问题？</li>
<li>render 为什么必须纯？Strict Mode 为什么可能额外调用？</li>
<li>React 比较的是什么，为什么不是“整个页面重新生成”？</li>
</ul>
<h2>动手任务</h2>
<p>建立 <code>react-render-lab</code>：</p>
<pre><code class="language-text">01-state-snapshot
02-update-queue
03-batching
04-key-and-reset
05-parent-child-render
06-context-render
07-memo
08-controlled-uncontrolled
</code></pre>
<p>每个案例必须记录：现象、预测、结果、原因、边界。</p>
<p>额外实现一个极简 renderer，把虚拟节点转为 DOM，并根据两棵小树更新属性和子节点。目的只是理解树比较，不复刻 Fiber。</p>
<h2>资料</h2>
<ul>
<li><a href="https://react.dev/learn/thinking-in-react" rel="noopener noreferrer" target="_blank">Thinking in React</a></li>
<li><a href="https://react.dev/learn/render-and-commit" rel="noopener noreferrer" target="_blank">Render and Commit</a></li>
<li><a href="https://react.dev/learn/state-as-a-snapshot" rel="noopener noreferrer" target="_blank">State as a Snapshot</a></li>
<li><a href="https://react.dev/learn/queueing-a-series-of-state-updates" rel="noopener noreferrer" target="_blank">Queueing a Series of State Updates</a></li>
<li><a href="https://react.dev/learn/preserving-and-resetting-state" rel="noopener noreferrer" target="_blank">Preserving and Resetting State</a></li>
<li><a href="https://react.dev/reference/rules/components-and-hooks-must-be-pure" rel="noopener noreferrer" target="_blank">Components and Hooks must be pure</a></li>
</ul>
<h2>验收</h2>
<p>用一张图讲清“一次点击造成的 state 更新，从事件到页面变化发生了什么”。</p>
<hr>
<h1>9. 第 5 周：State / Effect / Context 设计</h1>
<h2>先分类状态</h2>
<pre><code class="language-text">State
├── Local UI State       → useState / useReducer
├── URL State            → router / search params
├── Server State         → request cache
├── Shared Client State  → Context / external store
└── Form State           → local/reducer/form library，按复杂度选择
</code></pre>
<p>不要因为“项目大”就把所有数据放进一个全局 store。先判断所有权、生命周期、更新频率和消费者范围。</p>
<h2>Effect 心智模型</h2>
<p>Effect 用于让 React 与外部系统同步，不是“组件变化后执行代码”的万能入口。</p>
<p>重点掌握：</p>
<ul>
<li>派生数据通常在 render 中计算</li>
<li>用户事件逻辑通常留在 event handler</li>
<li>setup/cleanup 必须对称</li>
<li>dependency 表达响应式依赖，不能靠关闭 lint 解决</li>
<li>stale closure、请求竞态、取消与忽略旧结果</li>
<li>ref 与 state 的区别</li>
<li>custom Hook 隐藏机制，但不隐藏数据流</li>
</ul>
<h2>动手任务</h2>
<ol>
<li>从旧组件中消灭至少 3 个不必要的 Effect。</li>
<li>写带取消、乱序保护、loading/error/empty 状态的搜索组件。</li>
<li>实现 <code>useOnlineStatus</code> 或 <code>useMediaQuery</code>，验证订阅 cleanup。</li>
<li>用 reducer 重构多步骤表单，并用联合类型约束状态迁移。</li>
<li>比较 Context 单一大对象与拆分 provider/订阅边界的更新范围。</li>
</ol>
<h2>资料</h2>
<ul>
<li><a href="https://react.dev/learn/choosing-the-state-structure" rel="noopener noreferrer" target="_blank">Choosing the State Structure</a></li>
<li><a href="https://react.dev/learn/you-might-not-need-an-effect" rel="noopener noreferrer" target="_blank">You Might Not Need an Effect</a></li>
<li><a href="https://react.dev/learn/lifecycle-of-reactive-effects" rel="noopener noreferrer" target="_blank">Lifecycle of Reactive Effects</a></li>
<li><a href="https://react.dev/learn/removing-effect-dependencies" rel="noopener noreferrer" target="_blank">Removing Effect Dependencies</a></li>
<li><a href="https://react.dev/learn/escape-hatches" rel="noopener noreferrer" target="_blank">Escape Hatches</a></li>
<li><a href="https://react.dev/learn/reusing-logic-with-custom-hooks" rel="noopener noreferrer" target="_blank">Reusing Logic with Custom Hooks</a></li>
</ul>
<h2>验收</h2>
<p>回答 Effect 题统一按四步：<strong>外部系统是什么 → 何时同步 → 如何清理 → 如何处理竞态</strong>。若没有外部系统，先判断是否不需要 Effect。</p>
<hr>
<h1>10. 第 6 周：React 调度、并发与源码阅读</h1>
<h2>学习重点</h2>
<ul>
<li>Fiber 的设计目标：把渲染工作表示为可管理的工作单元</li>
<li>render 可以中断、丢弃或重做，commit 必须保持一致性</li>
<li>更新优先级与并发渲染的用户体验目标</li>
<li><code>startTransition</code>、<code>useTransition</code>、<code>useDeferredValue</code>、Suspense</li>
<li>外部数据源与 <code>useSyncExternalStore</code></li>
<li>React 19.x 的 Actions、<code>use</code>、React Compiler：理解场景，不用追新替代基本功</li>
</ul>
<h2>源码阅读方式</h2>
<p>不要逐文件通读，也不要背内部函数名。选择问题沿调用路径追踪：</p>
<ol>
<li><code>useState</code> 如何定位当前 Hook？</li>
<li>更新如何进入队列并触发调度？</li>
<li>render 阶段如何构造或复用工作树？</li>
<li>commit 如何应用 DOM 变化并处理 Effect？</li>
<li>为什么 render 要求纯，而 commit 可以处理副作用？</li>
</ol>
<p>内部路径随版本变化，最终产出应是概念图，不是某版本的函数名表。</p>
<h2>动手任务</h2>
<ol>
<li>对 5,000 行可筛选列表比较普通更新与 <code>useDeferredValue</code>，录制 Profiler。</li>
<li>实现一个最小 external store，用 <code>useSyncExternalStore</code> 订阅。</li>
<li>对一次点击更新设置断点，记录调度、render、commit 的大致调用路径。</li>
<li>写一个 Suspense/Transition 实验，说明 pending UI 的体验差异和限制。</li>
</ol>
<h2>资料</h2>
<ul>
<li><a href="https://react.dev/reference/react" rel="noopener noreferrer" target="_blank">React API Reference</a></li>
<li><a href="https://react.dev/reference/react/useTransition" rel="noopener noreferrer" target="_blank">useTransition</a></li>
<li><a href="https://react.dev/reference/react/useDeferredValue" rel="noopener noreferrer" target="_blank">useDeferredValue</a></li>
<li><a href="https://react.dev/reference/react/Suspense" rel="noopener noreferrer" target="_blank">Suspense</a></li>
<li><a href="https://github.com/reactjs/rfcs/blob/main/text/0214-use-sync-external-store.md" rel="noopener noreferrer" target="_blank">useSyncExternalStore RFC</a></li>
<li><a href="https://github.com/reactjs/rfcs" rel="noopener noreferrer" target="_blank">React RFCs</a></li>
<li><a href="https://github.com/facebook/react" rel="noopener noreferrer" target="_blank">React Source</a></li>
<li><a href="https://react.dev/versions" rel="noopener noreferrer" target="_blank">React Versions</a></li>
</ul>
<h2>原理学习深度</h2>
<p>必须深入：render/commit、纯度、state/update queue、key、Effect、订阅传播、Profiler、Suspense/Transition。</p>
<p>理解动机即可：Fiber 工作单元、优先级、工作树、hydration、streaming SSR、Server Component 边界。</p>
<p>不值得死记：内部 flag 数值、随版本改变的文件名、脱离场景的全部 lane 细节。</p>
<hr>
<h1>11. 第 7 周：Server State / Router / Auth / RBAC</h1>
<h2>Server State</h2>
<p>理解：query key、fresh/stale、cache lifecycle、invalidation、retry、prefetch、pagination、optimistic update 与 rollback。</p>
<p>必须能解释：server state 与 client state 的生命周期为什么不同；为什么接口数据全部复制进 Zustand/Redux 往往会制造双份真相。</p>
<h2>Router 与 URL State</h2>
<p>掌握 nested routes、layout/outlet、params/search params、lazy route、route-level error 和路由保护。筛选、分页、排序等需要分享或刷新保留的状态，优先评估 URL。</p>
<h2>Authentication</h2>
<p>设计完整生命周期：</p>
<pre><code class="language-text">Login → Session → Expiration/Refresh → 401 coordination → Retry or Logout
</code></pre>
<p>比较 Cookie session 与 token 方案，不机械地认为 JWT 一定更先进。讨论：XSS、CSRF、HttpOnly、Secure、SameSite、过期、撤销、多请求同时 401、跨标签页同步。</p>
<h2>Authorization / RBAC</h2>
<p>把权限表达为能力：</p>
<pre><code class="language-ts">can('project:create')
can('project:update')
can('user:delete')
</code></pre>
<p>避免页面到处出现 <code>user.role === 'admin'</code>。前端权限只改善体验，服务端仍必须执行最终鉴权。</p>
<h2>动手任务</h2>
<p>在 TeamFlow 完成：</p>
<ul>
<li>列表、详情、搜索、筛选、分页。</li>
<li>请求缓存、取消、错误重试与一次乐观更新回滚。</li>
<li>nested route、URL state、route error。</li>
<li>登录/session/过期处理和并发 401 协调。</li>
<li>Admin/Manager/Member/Guest 权限矩阵与测试。</li>
</ul>
<p>写两份 ADR：</p>
<ul>
<li><code>ADR-001-state-boundaries.md</code></li>
<li><code>ADR-002-auth-and-rbac.md</code></li>
</ul>
<h2>资料</h2>
<ul>
<li><a href="https://react.dev/learn/scaling-up-with-reducer-and-context" rel="noopener noreferrer" target="_blank">React Reducer and Context</a></li>
<li><a href="https://react.dev/reference/react/useSyncExternalStore" rel="noopener noreferrer" target="_blank">useSyncExternalStore</a></li>
<li><a href="https://redux.js.org/style-guide/" rel="noopener noreferrer" target="_blank">Redux Style Guide</a></li>
<li><a href="https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults" rel="noopener noreferrer" target="_blank">TanStack Query Important Defaults</a></li>
<li><a href="https://reactrouter.com/" rel="noopener noreferrer" target="_blank">React Router Documentation</a></li>
<li><a href="https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html" rel="noopener noreferrer" target="_blank">OWASP Authentication Cheat Sheet</a></li>
<li><a href="https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html" rel="noopener noreferrer" target="_blank">OWASP Authorization Cheat Sheet</a></li>
</ul>
<hr>
<h1>12. 第 8 周：工程化与测试</h1>
<h2>构建链路</h2>
<p>建立下面的整体模型：</p>
<pre><code class="language-text">Source → Resolve → Load → Transform → Dependency Graph
       → Bundle → Code Split → Tree Shake → Minify → Output
</code></pre>
<p>重点掌握：</p>
<ul>
<li>ESM/CJS、静态分析、tree shaking 的成立条件</li>
<li>bundling、transpilation、minification、source map</li>
<li>Vite dev server、native ESM、dependency pre-bundling、HMR、plugin、build</li>
<li>dependencies/devDependencies/peerDependencies、lockfile、pnpm workspace</li>
<li>动态 import、chunk、缓存友好的文件名</li>
<li>环境变量注入时机；为什么浏览器代码不能保存 secret</li>
<li>monorepo 的收益与管理成本，不为“高级感”强行使用</li>
</ul>
<h2>测试分层</h2>
<ul>
<li>Unit：纯函数、权限判断、数据转换、复杂 reducer。</li>
<li>Component/Integration：用户看到什么、如何交互、最终发生什么。</li>
<li>E2E：登录、创建/修改任务、权限限制等关键业务路径。</li>
</ul>
<p>原则：测试用户可见行为，保持隔离，优先使用无障碍语义查询，不追求 100% coverage。</p>
<h2>动手任务</h2>
<ol>
<li>明确项目中 React、TypeScript、Vite、ESLint、Vitest、Testing Library、Playwright、Router、Query、store 等每个依赖的职责；不要求为了练习重新安装全部工具。</li>
<li>比较 dev 与 production 构建产物。</li>
<li>用 bundle analyzer 找出最大依赖，判断是否值得拆包或替换。</li>
<li>建立 CI：install → lint → typecheck → test → build。</li>
<li>至少完成 10–15 个 unit/component tests 和 3–5 条核心 E2E；质量优先于凑数量。</li>
</ol>
<h2>资料</h2>
<ul>
<li><a href="https://vite.dev/guide/" rel="noopener noreferrer" target="_blank">Vite Guide</a></li>
<li><a href="https://webpack.js.org/concepts/" rel="noopener noreferrer" target="_blank">webpack Concepts</a></li>
<li><a href="https://nodejs.org/api/packages.html" rel="noopener noreferrer" target="_blank">Node.js Packages</a></li>
<li><a href="https://vitest.dev/guide/" rel="noopener noreferrer" target="_blank">Vitest Guide</a></li>
<li><a href="https://testing-library.com/docs/guiding-principles" rel="noopener noreferrer" target="_blank">Testing Library Guiding Principles</a></li>
<li><a href="https://testing-library.com/docs/queries/about/" rel="noopener noreferrer" target="_blank">Testing Library Queries</a></li>
<li><a href="https://playwright.dev/docs/best-practices" rel="noopener noreferrer" target="_blank">Playwright Best Practices</a></li>
</ul>
<h2>验收</h2>
<p>任何人 clone 后能按 README 启动；CI 能拦截类型、测试和构建错误；你能解释每层测试保护了什么风险。</p>
<hr>
<h1>13. 第 9 周：性能分析与优化</h1>
<h2>正确流程</h2>
<pre><code class="language-text">定义用户场景和指标
      ↓
记录可复现基线
      ↓
使用工具定位瓶颈
      ↓
提出一个主要假设
      ↓
实施优化并同条件复测
      ↓
记录收益、代价和限制
</code></pre>
<h2>学习重点</h2>
<ul>
<li>Network、Performance、Memory、React Profiler、Lighthouse 的分工</li>
<li>render 成本与 DOM commit 成本</li>
<li>state 下沉、组件边界、children 模式、订阅粒度</li>
<li><code>memo</code>、<code>useMemo</code>、<code>useCallback</code> 的收益与成本</li>
<li>大列表、虚拟化、code splitting、lazy loading、request waterfall</li>
<li>LCP、INP、CLS 与真实用户监控</li>
</ul>
<h2>主项目实验</h2>
<p>在 TeamFlow 制造 10,000 行列表：</p>
<ol>
<li>直接渲染并记录 render、commit、interaction delay、memory。</li>
<li>使用 React Profiler 和 Performance 定位主要耗时。</li>
<li>按证据选择虚拟化、订阅拆分、状态下沉或缓存计算。</li>
<li>在同设备、同数据和同构建模式下复测。</li>
<li>记录代价：实现复杂度、包体积、滚动限制或缓存内存。</li>
</ol>
<h2>资料</h2>
<ul>
<li><a href="https://react.dev/reference/react/memo" rel="noopener noreferrer" target="_blank">React memo</a></li>
<li><a href="https://react.dev/reference/react/Profiler" rel="noopener noreferrer" target="_blank">React Profiler</a></li>
<li><a href="https://react.dev/reference/react/lazy" rel="noopener noreferrer" target="_blank">React lazy</a></li>
<li><a href="https://web.dev/learn/performance/" rel="noopener noreferrer" target="_blank">web.dev Learn Performance</a></li>
<li><a href="https://developer.chrome.com/docs/devtools/performance/" rel="noopener noreferrer" target="_blank">Chrome DevTools Performance</a></li>
</ul>
<h2>禁止做法</h2>
<ul>
<li>未测量就到处加 <code>useMemo</code>/<code>useCallback</code>。</li>
<li>把开发环境 Strict Mode 的额外执行直接当生产性能问题。</li>
<li>只给出 Lighthouse 总分，不说明测试条件和瓶颈证据。</li>
</ul>
<h2>验收</h2>
<p><code>docs/performance-report.md</code> 必须包含：场景、环境、指标、基线、trace、根因、方案、复测、trade-off。</p>
<hr>
<h1>14. 第 10 周：Web 安全与稳定性</h1>
<h2>安全重点</h2>
<ul>
<li>XSS、CSRF、CORS、CSP</li>
<li>Cookie、SameSite、HttpOnly、Secure</li>
<li>clickjacking、open redirect、敏感信息暴露</li>
<li>第三方依赖与供应链风险</li>
<li>权限绕过：前端隐藏按钮不等于鉴权</li>
</ul>
<h2>稳定性重点</h2>
<ul>
<li>输入校验、API error normalize、错误分级</li>
<li>401/403/404/429/500 与超时、断网的差异化处理</li>
<li>Error Boundary、route error、async request error 的边界</li>
<li>retry/backoff/idempotency，避免无脑重试</li>
<li>日志、版本标识、source map、告警、灰度、回滚</li>
<li>loading、empty、error、offline、partial success 状态</li>
</ul>
<h2>动手任务</h2>
<p>给 TeamFlow 增加：</p>
<ul>
<li>统一 <code>ApiError</code> 与用户可理解的错误 UI。</li>
<li>Error Boundary 和路由级错误处理。</li>
<li>可控的 retry/backoff；明确哪些操作不可自动重试。</li>
<li>401/403/404/500、断网、超时演练。</li>
<li>一份 XSS/CSRF/auth storage 威胁模型。</li>
<li><code>RUNBOOK.md</code>：坏版本识别、降级与回滚步骤。</li>
</ul>
<h2>资料</h2>
<ul>
<li><a href="https://cheatsheetseries.owasp.org/" rel="noopener noreferrer" target="_blank">OWASP Cheat Sheet Series</a></li>
<li><a href="https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" rel="noopener noreferrer" target="_blank">OWASP XSS Prevention Cheat Sheet</a></li>
<li><a href="https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html" rel="noopener noreferrer" target="_blank">OWASP CSRF Prevention Cheat Sheet</a></li>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP" rel="noopener noreferrer" target="_blank">MDN Content Security Policy</a></li>
<li><a href="https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary" rel="noopener noreferrer" target="_blank">React Error Boundary</a></li>
</ul>
<h2>验收</h2>
<p>随机关闭网络、让接口超时、返回 401/403/500，页面都能进入可理解、可恢复或可观测的状态。</p>
<hr>
<h1>15. 第 11 周：中型项目架构与前端系统设计</h1>
<h2>主项目架构整理</h2>
<p>不要继续无止境加功能，开始整理边界：</p>
<pre><code class="language-text">src/
  app/             # 启动、providers、全局配置
  routes/          # 路由入口
  features/        # auth/project/task/user 等业务模块
  shared/          # 稳定、跨业务复用的组件与工具
</code></pre>
<p>feature 内可按需包含：</p>
<pre><code class="language-text">features/project/
  api/
  components/
  hooks/
  model/
  types/
</code></pre>
<p>目录不是目的，重点是 cohesion、coupling、dependency direction 和 boundary。</p>
<p>数据访问建议保持清晰链路：</p>
<pre><code class="language-text">Component → Query/Mutation Hook → Domain API Service → HTTP Client
</code></pre>
<p>不要让原始 <code>fetch/axios</code> 和错误格式转换散落在几十个组件中。</p>
<h2>系统设计练习</h2>
<p>至少选择三题：</p>
<ul>
<li>十万行数据表格。</li>
<li>多人协作文档或看板。</li>
<li>图片分片上传与断点续传。</li>
<li>组件库与主题系统。</li>
<li>旧系统的微前端渐进迁移。</li>
</ul>
<h2>固定答题框架</h2>
<ol>
<li><strong>澄清需求</strong>：用户量、数据量、浏览器、SEO、实时性、无障碍、预算。</li>
<li><strong>数据模型</strong>：实体、状态归属、缓存键和一致性要求。</li>
<li><strong>模块边界</strong>：组件、feature、服务、依赖方向。</li>
<li><strong>数据流</strong>：请求、缓存、更新、错误、取消、冲突。</li>
<li><strong>性能</strong>：加载、渲染、交互、内存、指标与监控。</li>
<li><strong>可靠性与安全</strong>：降级、鉴权、攻击面、审计、回滚。</li>
<li><strong>测试与发布</strong>：测试层级、CI、灰度和观测。</li>
<li><strong>取舍</strong>：至少两个方案，以及当前约束下选择其中一个的原因。</li>
</ol>
<h2>项目文档</h2>
<p><code>ARCHITECTURE.md</code> 至少包含：</p>
<ul>
<li>Architecture Overview</li>
<li>Directory and Dependency Rules</li>
<li>State Ownership</li>
<li>Server State and API Layer</li>
<li>Authentication and Authorization</li>
<li>Error Handling and Observability</li>
<li>Testing Strategy</li>
<li>Performance</li>
<li>Technical Decisions and Trade-offs</li>
</ul>
<h2>验收</h2>
<ul>
<li>3 份 1–2 页系统设计文档。</li>
<li>每题做一次 30–40 分钟口述。</li>
<li>3 份 ADR，每份写清 Context、Decision、Alternatives、Consequences。</li>
</ul>
<hr>
<h1>16. 第 12 周：项目包装与求职转化</h1>
<h2>README</h2>
<p>不要只写 <code>pnpm install</code> 和 <code>pnpm dev</code>。应包含：</p>
<ul>
<li>Project Overview 与截图/演示</li>
<li>Architecture 与关键数据流</li>
<li>Tech Stack，以及每项技术存在的原因</li>
<li>State Design、Auth、RBAC、Error Handling</li>
<li>Testing、Performance、CI/CD</li>
<li>Trade-offs 与 Future Improvements</li>
<li>本地运行方式和演示账号说明</li>
</ul>
<h2>每个项目准备 8 个故事</h2>
<p>建议覆盖：</p>
<ol>
<li>状态边界设计。</li>
<li>Effect/竞态问题。</li>
<li>性能定位与优化。</li>
<li>权限模型演进。</li>
<li>错误处理与稳定性。</li>
<li>测试策略。</li>
<li>工程化或构建问题。</li>
<li>一次失败方案及后续取舍。</li>
</ol>
<p>每个故事按 STAR + 技术决策组织：</p>
<pre><code class="language-text">背景与约束
问题和证据
候选方案
选择与原因
实施过程
结果和指标
代价与下一步
</code></pre>
<h2>简历表达</h2>
<p>弱表达：</p>
<blockquote>
<p>负责后台管理系统开发，使用 React、TypeScript、Redux。</p>
</blockquote>
<p>强表达模板：</p>
<blockquote>
<p>在【业务场景】中发现【有证据的问题】，通过【关键设计/措施】，将【指标】从 A 改善到 B；并通过【测试/监控/发布措施】控制风险。</p>
</blockquote>
<p>没有历史数据不要编数字。可以重新建立可复现的实验基准并明确标注，或写清规模与结果，例如：</p>
<blockquote>
<p>将散落在页面中的 6 类角色判断收敛为 permission-based RBAC，并补充权限矩阵测试，降低新增角色时的修改范围。</p>
</blockquote>
<h2>求职时间分配</h2>
<ul>
<li>40%：项目深挖和系统设计。</li>
<li>25%：JavaScript、浏览器、网络。</li>
<li>20%：React 与 TypeScript。</li>
<li>15%：算法与手写题，按目标公司调整。</li>
</ul>
<h2>验收</h2>
<ul>
<li>重做第 2 节基线题并对比。</li>
<li>完成至少 2 次技术模拟面试和 1 次系统设计模拟。</li>
<li>简历上每个核心项目都能讲 30 分钟，并经得起连续追问。</li>
</ul>
<hr>
<h2>17. 贯穿 12 周的主项目：TeamFlow</h2>
<p>定位：简化版团队协作 SaaS。不要追求功能数量，重点展示状态设计、数据一致性、权限、性能、测试和可靠性。</p>
<h2>领域模型</h2>
<pre><code class="language-text">User
Organization
Workspace
Project
Task
Comment
Activity
</code></pre>
<h2>必做功能</h2>
<h3>Auth</h3>
<ul>
<li>Login / Logout / Session / Expiration</li>
<li>并发 401 协调</li>
<li>route protection</li>
</ul>
<h3>Project / Task</h3>
<ul>
<li>CRUD、搜索、筛选、分页</li>
<li>Kanban、状态、优先级、负责人、截止时间</li>
<li>URL 状态同步</li>
<li>optimistic update 与 rollback</li>
</ul>
<h3>RBAC</h3>
<ul>
<li>Admin / Manager / Member / Guest</li>
<li>权限矩阵和服务端鉴权说明</li>
</ul>
<h3>UI 与质量</h3>
<ul>
<li>responsive、loading、skeleton、empty、error、offline</li>
<li>unit/component/E2E、CI</li>
<li>Error Boundary 与 route error</li>
<li>一份性能报告和至少三份 ADR</li>
</ul>
<h3>可选</h3>
<ul>
<li>SSE/WebSocket 实时更新</li>
<li>audit log</li>
<li>dark mode</li>
<li>Next.js SSR/streaming/server-client boundary：仅目标岗位明显需要时添加</li>
</ul>
<h2>推荐仓库文档</h2>
<pre><code class="language-text">docs/
  baseline.md
  learning-log.md
  ARCHITECTURE.md
  performance-report.md
  testing-strategy.md
  threat-model.md
  RUNBOOK.md
  decisions/
    ADR-001-state-boundaries.md
    ADR-002-auth-and-rbac.md
    ADR-003-testing-strategy.md
</code></pre>
<hr>
<h2>18. 可选特色项目：生词浏览器插件</h2>
<p>如果你已经有浏览器插件方向，可以用 WXT + Svelte/React + TypeScript 做第二项目；若尚无相关积累或求职时间紧，跳过，不要分散主线。</p>
<p>重点不是 UI，而是：</p>
<ul>
<li>Chrome Extension Manifest V3</li>
<li>content script、extension page、background service worker</li>
<li>message passing、permissions、storage/IndexedDB</li>
<li>Selection API、context menu、keyboard shortcut</li>
<li>service worker 生命周期、执行上下文隔离、最小权限</li>
</ul>
<p>核心流程：</p>
<pre><code class="language-text">网页划词 → Selection API → Content Script → 词义浮层
       → Message Passing → Background → IndexedDB
       → Vocabulary Manager → Review
</code></pre>
<p>必须能回答：</p>
<ul>
<li>content script 为什么不能直接读取页面所有 JS 变量？</li>
<li>content script 与 service worker 为什么需要消息通信？</li>
<li>为什么不能假设 service worker 一直存活？</li>
<li>什么数据适合 IndexedDB，而不是 localStorage？</li>
</ul>
<p>官方资料：</p>
<ul>
<li><a href="https://developer.chrome.com/docs/extensions/" rel="noopener noreferrer" target="_blank">Chrome Extensions Documentation</a></li>
<li><a href="https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3" rel="noopener noreferrer" target="_blank">Manifest V3</a></li>
<li><a href="https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts" rel="noopener noreferrer" target="_blank">Content Scripts</a></li>
<li><a href="https://developer.chrome.com/docs/extensions/develop/concepts/messaging" rel="noopener noreferrer" target="_blank">Message Passing</a></li>
<li><a href="https://developer.chrome.com/docs/extensions/develop/concepts/service-workers" rel="noopener noreferrer" target="_blank">Extension Service Worker</a></li>
</ul>
<hr>
<h2>19. 面试高频 30 题</h2>
<h3>JavaScript</h3>
<ol>
<li>Event loop、task、microtask 如何协作？</li>
<li>Promise callback 与 async/await 如何调度？</li>
<li>闭包保存什么，如何引起内存问题？</li>
<li>原型链与 <code>class</code> 的关系是什么？</li>
<li><code>this</code> 的值如何确定？</li>
<li>ESM 与 CommonJS 有什么根本差异？</li>
</ol>
<h3>Browser / Network</h3>
<ol>
<li>输入 URL 到页面可交互发生了什么？</li>
<li>HTTP 强缓存与协商缓存如何工作？</li>
<li>CORS 是什么，简单请求和预检请求有什么区别？</li>
<li>Cookie 的 HttpOnly、Secure、SameSite 分别解决什么风险？</li>
<li>浏览器 render pipeline 如何工作？</li>
<li>LCP、INP、CLS 如何测量和改进？</li>
</ol>
<h3>TypeScript</h3>
<ol>
<li><code>any</code>、<code>unknown</code>、<code>never</code> 的区别是什么？</li>
<li>泛型解决的核心问题是什么？</li>
<li>如何使用 discriminated union 和 <code>never</code> 做穷尽检查？</li>
<li>TypeScript 为什么不能保证接口运行时数据安全？</li>
</ol>
<h3>React</h3>
<ol>
<li>一次 state 更新经过哪些阶段？</li>
<li>state snapshot、batching、函数式更新是什么关系？</li>
<li>reconciliation 与 <code>key</code> 如何影响 state？</li>
<li>什么情况下不需要 Effect？</li>
<li>stale closure 与 Effect race condition 如何处理？</li>
<li><code>memo</code>、<code>useMemo</code>、<code>useCallback</code> 何时有效或无效？</li>
<li>Context 为什么会引起较大范围 render？</li>
<li>Fiber、并发 render 与 commit 的关系是什么？</li>
<li>Suspense、Transition、<code>useDeferredValue</code> 分别适合什么场景？</li>
<li>SSR、streaming SSR、hydration 与 Server Component 有什么边界？</li>
</ol>
<h3>Architecture</h3>
<ol>
<li>client state、URL state、server state 如何划分？</li>
<li>如何设计认证过期、并发 401 和 RBAC？</li>
<li>如何设计十万行表格并证明优化有效？</li>
<li>如何设计前端错误处理、监控、灰度和回滚？</li>
</ol>
<p>每题的合格答案必须包含：<strong>结论、原理、例子、边界/反例、项目关联</strong>。</p>
<hr>
<h2>20. 算法怎么安排</h2>
<p>每周 6–8 题即可，重点：</p>
<ul>
<li>数组/字符串、哈希</li>
<li>双指针、滑动窗口</li>
<li>栈、队列、链表</li>
<li>二叉树、BFS/DFS</li>
<li>基础动态规划</li>
<li>前端常见手写：debounce、throttle、并发限制、event emitter、LRU</li>
</ul>
<p>做完必须能说出复杂度、边界条件和替代方案。除非目标公司明确高强度考算法，不要让刷题挤占项目深挖和系统设计。</p>
<hr>
<h2>21. 学习与面试复盘模板</h2>
<h3>单个知识点</h3>
<pre><code class="language-md">## 问题

我的原始理解：

最小实验：

实际结果与工具证据：

原理解释：

适用边界/反例：

如何关联到项目：
</code></pre>
<h3>每周复盘</h3>
<pre><code class="language-md"># Week N Review

## 本周解决的三个问题
1.
2.
3.

## 可验证产出
- 代码：
- 测试/性能记录：
- 文档/图：

## 我现在能讲清楚什么
-

## 仍然模糊的地方
-

## 一道面试题的完整回答
问题：
结论：
原理：
例子：
边界与取舍：

## 下周只做的三件事
1.
2.
3.
</code></pre>
<h3>面试后 30 分钟复盘</h3>
<pre><code class="language-md">## 问题

## 我的原回答

## 哪部分没有回答好

## 经查证后的正确理解

## 最小 Demo / 工具证据

## 如何关联自己的项目
</code></pre>
<hr>
<h2>22. 根据真实 JD 动态调整</h2>
<p>每周收集约 20 个目标 JD，维护能力矩阵：</p>



































<table><thead><tr><th>能力</th><th>JD 出现次数</th><th>当前证据</th><th>本周行动</th></tr></thead><tbody><tr><td>React 性能</td><td>12</td><td>有经验，无量化</td><td>完成 Profiler 优化报告</td></tr><tr><td>TypeScript</td><td>15</td><td>日常使用</td><td>补泛型组件与状态机案例</td></tr><tr><td>测试</td><td>9</td><td>零散单测</td><td>增加核心路径 E2E</td></tr><tr><td>工程化</td><td>11</td><td>使用过，解释不足</td><td>分析构建产物并完善 CI</td></tr></tbody></table>
<p>岗位调整建议：</p>
<ul>
<li>偏中后台：提高表格、表单、权限、稳定性、性能权重。</li>
<li>偏 Next.js：增加 SSR/streaming、Server/Client Component、缓存和部署。</li>
<li>偏基础设施：增加构建原理、组件库、monorepo、发布流程。</li>
<li>偏可视化：增加 Canvas/SVG/WebGL、数据量和交互性能。</li>
<li>偏浏览器插件：完成第 18 节，并强化权限、通信和生命周期。</li>
</ul>
<p>现阶段降低优先级：同时学多个新框架、无业务目标的复杂类型体操、背 React 内部字段、为了炫技强上微前端/monorepo、只刷题不整理项目。</p>
<hr>
<h2>23. 结合中国前端就业与项目环境的特别说明</h2>
<p>这一节用于校准学习重点，不代表“中国岗位只有一种标准答案”。不同城市、行业和公司差异很大，应以你实际收集的 30–50 个目标 JD 为最终依据。</p>
<h3>23.1 先选岗位主线，不要笼统投“所有前端”</h3>
<p>国内前端岗位可以先粗分为三类，每类简历证据不同：</p>

























<table><thead><tr><th>方向</th><th>常见业务</th><th>应重点展示</th></tr></thead><tbody><tr><td>企业应用 / 中后台</td><td>SaaS、ERP、CRM、运营平台、金融/制造数字化</td><td>表格表单、权限、多租户、复杂状态、稳定性、交付效率</td></tr><tr><td>C 端 / 平台业务</td><td>电商、内容、社区、交易、活动</td><td>首屏性能、弱网、埋点、实验、跨端、峰值流量与用户体验</td></tr><tr><td>AI 产品 / 新业务</td><td>对话、知识库、智能工作流、行业 AI 应用</td><td>streaming、SSE/WebSocket、请求取消、长任务状态、Markdown 安全、AI 结果评估</td></tr></tbody></table>
<p>截至 2025–2026 年的公开人才报告显示，新增机会更多与 AI、新能源、高端制造和传统行业数字化升级结合，企业也更强调“技术 + 行业/业务”的复合能力。对 React 前端而言，更现实的做法不是立刻转算法，而是证明自己能把复杂能力做成可靠产品：<a href="https://www.digitalchina.gov.cn/2025/xwzx/szkx/202503/t20250327_4995346.htm" rel="noopener noreferrer" target="_blank">数字中国建设峰会转引的 2025 AI 人才供需信息</a>、<a href="https://www.miit.gov.cn/zwgk/zcwj/wjfb/tz/art/2025/art_498e662f529545828a70f9ce343d7b97.html" rel="noopener noreferrer" target="_blank">工信部等关于新兴领域岗位拓展的通知</a>。</p>
<p>建议确定一个主标签，例如：</p>
<blockquote>
<p>React + TypeScript 中后台前端，擅长复杂表格、权限、性能和工程质量，并能完成 AI 功能的前端接入。</p>
</blockquote>
<p>它比“React/Vue/Node/小程序/可视化都会一点”更容易形成可信印象。</p>
<h3>23.2 React 主栈不等于只准备最新 React</h3>
<p>国内招聘中，新项目和存量系统会长期并存。面试或入职后可能遇到 React 17/18/19、class component、CRA/Umi/webpack、Vite，以及不同年代的状态管理方案。</p>
<p>学习策略：</p>
<ul>
<li>用当前 React 官方文档建立正确模型。</li>
<li>熟悉 Hooks、并发能力和现代构建工具。</li>
<li>能读 class component，并理解 lifecycle 到 Effect 的迁移关系。</li>
<li>能解释 webpack 与 Vite 的基本构建差异，但不要把时间花在背工具配置。</li>
<li>不为了简历好看强行升级旧项目；先说明升级收益、兼容风险、测试和回滚。</li>
</ul>
<p>对于 Vue：继续以 React 为主。如果目标城市/行业的 JD 中 Vue 明显更多，用 3–5 天学习 Vue 3 Composition API、响应式模型、生命周期和路由状态管理的概念映射，达到“能读、能改、能迁移”即可；不要在求职冲刺期重新投入一整套同等深度路线。</p>
<h3>23.3 国内 B 端项目比“漂亮页面”更看重复杂业务闭环</h3>
<p>如果目标是中后台或传统行业数字化，TeamFlow 建议增加以下中国企业场景中的两个，不要全部堆上：</p>
<ul>
<li>组织/部门/岗位/角色/数据权限的组合权限。</li>
<li>多租户和 tenant scope，防止跨租户数据泄漏。</li>
<li>大表格的服务端筛选、固定列、批量操作、导入导出。</li>
<li>审批流、操作日志、驳回与撤回。</li>
<li>手机号、身份证号等敏感字段的展示脱敏和导出授权。</li>
<li>Excel 导入的字段校验、错误行反馈和幂等提交。</li>
<li>中文搜索、时区、金额精度、打印等真实业务细节。</li>
</ul>
<p>面试时不要只说“用了 Ant Design”。重点讲：组件库覆盖不了的业务复杂度是什么、你的领域模型是什么、如何防错、怎样测试，以及失败后如何恢复。</p>
<h3>23.4 微信、企微、小程序和跨端能力按 JD 学</h3>
<p>国内业务常见微信内 H5、企业微信、公众号/小程序登录和分享，但不是所有 React 岗都要求。处理原则：</p>
<ul>
<li>目标 JD 高频出现再投入，不要把它变成第三条主线。</li>
<li>至少理解 WebView 环境、授权回调、签名、路由恢复、返回栈、文件上传和调试差异。</li>
<li>小程序重点理解双线程/通信、页面生命周期、分包和包体积限制，不必背 API。</li>
<li>跨端框架重点解释能力边界和平台差异，不要把“一套代码”理解为“没有平台成本”。</li>
</ul>
<p>官方入口：<a href="https://developers.weixin.qq.com/doc/" rel="noopener noreferrer" target="_blank">微信开放文档</a>、<a href="https://developer.work.weixin.qq.com/document/" rel="noopener noreferrer" target="_blank">企业微信开发文档</a>。</p>
<h3>23.5 性能测试要覆盖国内真实设备和网络</h3>
<p>只在高配开发机、localhost 和桌面 Chrome 上测，不能代表真实体验。至少增加一组：</p>
<ul>
<li>中低端 Android 或 DevTools CPU throttling。</li>
<li>Fast/Slow 4G、弱网、丢包或接口高延迟。</li>
<li>微信/企业微信 WebView（岗位涉及时）。</li>
<li>国内实际部署域名、CDN 和 API，而非只测海外资源。</li>
</ul>
<p>工程上避免把首屏关键资源绑定到不可控的境外 CDN、字体、统计脚本或 API；准备超时、fallback 和降级。性能报告必须写明设备、浏览器、网络、构建模式和数据规模。</p>
<h3>23.6 把 AI 能力做成“前端工程能力”，不要只做套壳聊天页</h3>
<p>若目标 JD 提及 AI，可在 TeamFlow 增加一个范围有限的功能，例如“自然语言生成任务草稿”或“项目周报摘要”。重点展示：</p>
<ul>
<li>SSE/streaming response 与增量 UI。</li>
<li>cancel/retry、超时、断线恢复、重复请求防护。</li>
<li>Markdown/富文本渲染的 XSS 防护。</li>
<li>长对话虚拟化和内存控制。</li>
<li>loading、thinking、partial、failed 等明确状态。</li>
<li>prompt/version、latency、错误率、用户采纳率等可观测信息。</li>
<li>输出不可信：确认、编辑、权限检查后才能执行有副作用的操作。</li>
</ul>
<p>这比仅调用一次模型 API 更能证明前端深度。不要把 API key 放在浏览器代码中。</p>
<h3>23.7 国内数据合规是工程要求，不只是法务工作</h3>
<p>中国项目处理手机号、定位、设备标识、行为日志、聊天记录等信息时，前端应理解最小必要、明确目的、告知/同意、敏感信息保护、删除/更正入口、权限控制和日志脱敏。2025 年 1 月 1 日起施行的《网络数据安全管理条例》还进一步细化了网络数据处理要求。</p>
<p>TeamFlow 的 <code>threat-model.md</code> 至少回答：</p>
<ul>
<li>收集哪些个人信息，业务目的是什么，是否可以少收？</li>
<li>哪些信息不得进入 URL、前端日志、埋点或错误上报？</li>
<li>浏览器存储、接口响应和导出文件如何控制权限与留存？</li>
<li>使用境外分析、监控或 AI 服务时，数据会流向哪里？</li>
<li>用户如何访问、更正、删除数据或撤回同意？</li>
</ul>
<p>权威资料：</p>
<ul>
<li><a href="https://www.cac.gov.cn/2021-08/20/c_1631050028355286.htm" rel="noopener noreferrer" target="_blank">《中华人民共和国个人信息保护法》</a></li>
<li><a href="https://www.cac.gov.cn/2024-09/30/c_1729384452307680.htm" rel="noopener noreferrer" target="_blank">《网络数据安全管理条例》</a></li>
<li><a href="https://www.cac.gov.cn/2026-06/18/c_1783525609815499.htm" rel="noopener noreferrer" target="_blank">《网络数据安全风险评估办法》</a></li>
</ul>
<p>以上只作为工程学习提示，不构成法律意见；真实上线应由公司法务、安全与合规负责人确认。</p>
<h3>23.8 国内部署、演示项目和可访问性</h3>
<p>如果网站部署在中国境内并通过域名提供互联网信息服务，应提前了解 ICP 备案等要求；2024 年修订的规定仍明确境内非经营性互联网信息服务应依法备案：<a href="https://www.miit.gov.cn/gyhxxhb/jgsj/cyzcyfgs/bmgz/xxtxl/art/2024/art_84a0cfa0ebd049bbbe751dca9a008e56.html" rel="noopener noreferrer" target="_blank">工信部《非经营性互联网信息服务备案管理办法》</a>。具体还要按服务性质、云厂商和属地要求确认。</p>
<p>求职演示建议同时准备：</p>
<ul>
<li>一个招聘方在国内网络能稳定打开的演示地址。</li>
<li>90–120 秒无声也能看懂的功能视频。</li>
<li>README 截图、架构图和性能前后对比。</li>
<li>可本地运行的 mock 数据；不要依赖已经失效的线上后端。</li>
<li>不上传前公司代码、接口、截图、客户名称、token 或真实业务数据。</li>
</ul>
<p>如果 GitHub 或演示站点临时访问不稳定，招聘方仍应能从简历附件、视频和 README 快速判断项目质量。</p>
<h3>23.9 国内面试的准备顺序</h3>
<p>3–4 年经验候选人通常要同时面对基础题、手写题、项目追问和系统设计。建议按以下顺序投入：</p>
<ol>
<li><strong>先打磨项目证据</strong>：真实问题、定位过程、指标、决策和结果。</li>
<li><strong>再建立原理主线</strong>：JS → 浏览器 → React，不背孤立结论。</li>
<li><strong>保持手写与算法手感</strong>：限流、debounce、Promise、树/数组常见题。</li>
<li><strong>按公司补专项</strong>：跨端、可视化、音视频、微前端、Node、Next.js。</li>
</ol>
<p>常见追问准备：</p>
<ul>
<li>“这个方案是你决定的吗？还有谁参与？”——明确个人贡献，不夸大。</li>
<li>“数据怎么来的？”——展示可复现测试环境，不编造线上指标。</li>
<li>“不用这个库怎么做？”——讲底层模型和最小实现。</li>
<li>“线上出过什么问题？”——讲发现、止损、根因、修复、预防。</li>
<li>“为什么不选另一方案？”——回答约束和 trade-off，而不是说“业界都这样”。</li>
</ul>
<h3>23.10 投递和简历的本地化动作</h3>
<ul>
<li>中文简历控制在 1–2 页，第一屏写清年限、方向、城市/到岗和核心能力。</li>
<li>项目 bullet 以业务问题与结果开头，技术名词放在措施中。</li>
<li>技术栈只写能被连续追问 10 分钟的内容。</li>
<li>对每个目标岗位改前 1/3：标题、技能排序、第一项目的前三条。</li>
<li>招聘平台首次沟通只写三件事：匹配年限/方向、最相关证据、可沟通时间；不要粘贴长自我介绍。</li>
<li>维护投递表：公司、岗位、来源、JD 关键词、进度、面试复盘、下次动作。</li>
<li>评估外包/驻场岗位时问清合同主体、工作地点、项目周期、加班、社保公积金、撤场安排和转正机制。</li>
</ul>
<h3>23.11 对 12 周路线的国内化微调</h3>













































<table><thead><tr><th>周</th><th>额外动作</th></tr></thead><tbody><tr><td>第 1–2 周</td><td>收集本城市 30 个 JD；浏览器实验增加 Android/弱网条件</td></tr><tr><td>第 3 周</td><td>类型案例加入国内常见 API code/data/message 与运行时校验边界</td></tr><tr><td>第 4–6 周</td><td>同时能解释现代 React 和存量 React 迁移问题</td></tr><tr><td>第 7 周</td><td>增加数据权限、并发 401、导出脱敏中的至少两项</td></tr><tr><td>第 8 周</td><td>确保国内网络安装依赖和 CI 可复现，但 lockfile 与来源治理优先</td></tr><tr><td>第 9 周</td><td>使用中低端移动设备或 throttling 记录一组性能数据</td></tr><tr><td>第 10 周</td><td>对照个人信息保护要求完成 threat model 与日志脱敏</td></tr><tr><td>第 11 周</td><td>系统设计题至少一题使用企业中后台/传统行业数字化场景</td></tr><tr><td>第 12 周</td><td>准备国内可访问演示、短视频和 1–2 页中文简历</td></tr></tbody></table>
<hr>
<h2>24. 资料使用顺序</h2>
<ol>
<li>官方教程和参考文档：建立准确的当前行为模型。</li>
<li>规范/RFC：理解边界和设计动机，只查相关章节。</li>
<li>源码与 DevTools 实验：验证具体问题。</li>
<li>高质量书籍或长文：补充叙事和案例。</li>
<li>面试题文章：仅作查漏清单，不作为主要知识来源。</li>
</ol>
<p>不要收藏几十篇资料却不产出。每个主题选 1 个主资料、1 个最小实验、1 次口述已经足够形成闭环。</p>
<hr>
<h2>25. 12 周完成标准</h2>
<p>最终至少拥有：</p>
<ul>
<li>一份前后对比的基础能力自测。</li>
<li>20 个左右可运行的原理实验。</li>
<li>一张 React state 更新心智模型图和一份源码调用路径图。</li>
<li>一份浏览器性能报告和一份 React 性能报告。</li>
<li>一个具备 Auth、RBAC、测试、CI、错误处理和架构说明的 React 项目。</li>
<li>3 份系统设计文档和 3 份 ADR。</li>
<li>8 个完整项目故事及 8–12 段口述录音。</li>
<li>一版以成果和证据为中心的简历。</li>
<li>一份由真实面试持续更新的错题清单。</li>
</ul>
<p>最终目标不是成为“背过 React 源码的人”，而是成为：</p>
<blockquote>
<p>能建立模型、能用证据定位问题、能做工程取舍，也能把这些讲清楚的前端工程师。</p>
</blockquote>`},a=e();function o(){return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(n,{eyebrow:`A PATH TO DEEPER UNDERSTANDING`,title:`12 周，走得更深入。`,description:`从执行模型到项目架构，把原理学习、动手实践与求职表达连起来。`}),(0,a.jsx)(`article`,{className:`${r.card} ${r.roadmap}`,children:(0,a.jsx)(t,{html:i.html})})]})}export{o as default};