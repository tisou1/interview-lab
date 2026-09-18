var e=[{id:78,slug:`question-78`,title:`any、unknown、never 如何区分？`,category:`typescript`,type:`theory`,difficulty:`basic`,tags:[`TypeScript`],estimatedMinutes:3,promptHtml:``,answerSections:[{id:`q78-section-0`,title:`核心答案`,html:`<p><code>any</code> 关闭该值的类型检查并向外传染；<code>unknown</code> 表示"未知但安全"，使用前必须收窄；<code>never</code> 表示"不可能存在"，常用于穷尽检查与永不返回的函数。</p>
`},{id:`q78-section-1`,title:`原理与示例`,html:`
<pre><code class="language-ts">function parse(input: unknown) {\r
  if (typeof input !== 'string') throw new TypeError('expect string')\r
  return input.toUpperCase() // 收窄之后才能用\r
}\r
\r
function assertNever(value: never): never {\r
  throw new Error(\`Unexpected: \${String(value)}\`)\r
}
</code></pre>
<ul>
<li><code>unknown</code> 可以接受任何值，但只能赋值给 <code>unknown</code>/<code>any</code>，且不能直接访问属性。</li>
<li><code>never</code> 是所有类型的子类型，可以赋值给任何类型，但没有任何值属于它。</li>
</ul>
`},{id:`q78-section-2`,title:`边界与易错点`,html:`
<ul>
<li><code>any</code> 会沿赋值与调用链扩散，让上游的错误在整条链路上消失；团队内应尽量禁用或严格限制。</li>
<li>"用 <code>as</code> 断言一下"会丢掉与 <code>any</code> 同等的检查，只是形式更隐蔽；能用类型守卫或收窄就不要断言。</li>
<li>类型在运行时被擦除，外部输入（HTTP、<code>localStorage</code>、<code>postMessage</code>）必须做运行时校验，类型声明不能替代校验。</li>
<li><code>never</code> 的典型用途是穷尽检查：联合类型新增成员时，未处理的 <code>switch</code> 分支会直接编译报错。</li>
<li><code>string &#x26; number</code> 这类"不可能成立"的交叉类型也能表达不可达，但通常说明类型设计本身有问题。</li>
</ul>
`},{id:`q78-section-3`,title:`追问`,html:`
<ul>
<li><strong><code>unknown</code> 与泛型怎么选？</strong> 要保留调用方传入的具体类型用泛型；只表示"外部来的未知输入"用 <code>unknown</code>。</li>
<li><strong>怎么发现 <code>any</code> 扩散？</strong> 打开 <code>noImplicitAny</code>，用 lint 规则限制显式 <code>any</code>，并排查第三方类型缺失处。</li>
</ul>`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:3089}},{id:79,slug:`question-79`,title:`type 与 interface 怎么选？`,category:`typescript`,type:`theory`,difficulty:`basic`,tags:[`TypeScript`],estimatedMinutes:3,promptHtml:``,answerSections:[{id:`q79-section-0`,title:`核心答案`,html:`<p>两者都能描述对象形状并支持扩展，差别集中在<strong>能力与语义</strong>：<code>interface</code> 支持声明合并，适合可扩展的公开契约；<code>type</code> 能直接表达联合、元组、条件、映射等类型运算。</p>
`},{id:`q79-section-1`,title:`原理与示例`,html:`
<pre><code class="language-ts">interface UserDTO {\r
  id: string\r
  name: string // 同名接口会被合并\r
}\r
\r
// 只能声明一次，但能表达联合与类型运算\r
type Result = { ok: true } | { ok: false; error: Error }\r
type UserId = UserDTO['id']
</code></pre>
<ul>
<li><code>interface extends</code> 与 <code>type</code> 的交叉在冲突场景下行为不同：接口冲突会直接报错，交叉可能得到 <code>never</code>。</li>
<li>两个在对象形状描述上的性能差异通常可忽略，不要把它当决策依据。</li>
</ul>
`},{id:`q79-section-2`,title:`边界与易错点`,html:`
<ul>
<li>"<code>interface</code> 性能一定更好"站不住脚，现实中几乎不构成选型理由。</li>
<li>声明合并是双刃剑：它让扩展第三方类型成为可能，也可能让同名接口意外合并出难以排查的类型。</li>
<li>需要约束类实现时 <code>interface</code> 更自然；需要联合、条件、映射类型时只能用 <code>type</code>。</li>
<li>公共库中要谨慎使用声明合并，避免使用者无意改变类型形状。</li>
<li>团队约定优先：混用没问题，但同一项目里应保持一致，避免同一概念两种写法。</li>
</ul>
`},{id:`q79-section-3`,title:`追问`,html:`
<ul>
<li><strong><code>type</code> 能被 <code>implements</code> 吗？</strong> 能，类可以实现对象类型别名，只要形状可用。</li>
<li><strong>什么时候必须用 <code>interface</code>？</strong> 需要声明合并时，例如扩展第三方库的全局类型声明。</li>
</ul>`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:3131}},{id:80,slug:`question-80`,title:`泛型的本质是什么？`,category:`typescript`,type:`theory`,difficulty:`intermediate`,tags:[`TypeScript`,`泛型`],estimatedMinutes:5,promptHtml:``,answerSections:[{id:`q80-section-0`,title:`核心答案`,html:`<p>泛型用<strong>类型参数</strong>保留多个位置之间的类型关系，而不是把具体类型写死或退化成 <code>unknown</code>。它的价值在于让"输入与输出之间的依赖关系"被类型系统表达出来。</p>
`},{id:`q80-section-1`,title:`原理与示例`,html:`
<pre><code class="language-ts">function first&#x3C;T>(items: readonly T[]): T | undefined {\r
  return items[0]\r
}\r
\r
const value = first([1, 2, 3]) // number | undefined\r
\r
function pick&#x3C;T, K extends keyof T>(obj: T, key: K): T[K] {\r
  return obj[key]\r
}
</code></pre>
<ul>
<li>好的泛型 API 让调用方通过参数<strong>推导</strong>类型参数，不需要手写 <code>&#x3C;T></code>。</li>
<li>约束（<code>extends</code>）表达"所需的最小能力"，而不是提前写死具体实现类型。</li>
</ul>
`},{id:`q80-section-2`,title:`边界与易错点`,html:`
<ul>
<li>类型参数只出现一次、没有建立任何关系时，它通常没有意义（等价于 <code>unknown</code>）。</li>
<li>泛型不能替代运行时校验：外部数据仍要在边界处校验（见第 78 题）。</li>
<li>推导失败时不要立刻显式传 <code>&#x3C;T></code>，先检查参数类型是否丢失了信息（例如被写成 <code>unknown[]</code>）。</li>
<li>过深的类型运算会拖慢 tsc 并降低可读性；能用简单联合表达就不要上条件类型。</li>
<li>默认类型参数与约束要写清楚，避免调用方被迫传多余参数。</li>
</ul>
`},{id:`q80-section-3`,title:`追问`,html:`
<ul>
<li><strong>泛型与重载怎么选？</strong> 优先用"参数对象 + 判别联合"表达多形态；参数列表确实不同时才用重载。</li>
<li><strong><code>extends</code> 在泛型里有两种含义？</strong> 泛型约束（限制类型参数）与条件类型（<code>T extends U ? X : Y</code>），语境不同。</li>
</ul>`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:3173}},{id:81,slug:`question-81`,title:`discriminated union 为什么适合 UI 状态？`,category:`typescript`,type:`theory`,difficulty:`intermediate`,tags:[`TypeScript`],estimatedMinutes:5,promptHtml:``,answerSections:[{id:`q81-section-0`,title:`核心答案`,html:`<p>用共同的字面量字段区分状态，让每个分支只携带该状态下合法的数据，并通过 <code>never</code> 做穷尽检查。它从类型层面排除了"多个布尔同时为真"这类非法组合。</p>
`},{id:`q81-section-1`,title:`原理与示例`,html:`
<pre><code class="language-ts">type State =\r
  | { status: 'idle' }\r
  | { status: 'loading' }\r
  | { status: 'success'; data: Item[] }\r
  | { status: 'error'; error: Error }\r
\r
switch (state.status) {\r
  case 'success':\r
    state.data // 只有这个分支能访问 data\r
}
</code></pre>
<ul>
<li>分支专属字段只在对应状态下存在，访问时无需可选链或断言。</li>
<li>新增状态后，未处理的分支会被穷尽检查暴露出来。</li>
</ul>
`},{id:`q81-section-2`,title:`边界与易错点`,html:`
<ul>
<li>相比多个布尔（<code>isLoading</code>/<code>isSuccess</code>/<code>hasError</code>），联合类型从结构上禁止非法组合，也避免"忘记重置某个标志"的 bug。</li>
<li>当状态确有正交维度（如"加载中"与"是否有下一页"）时，强行扁平化为单一联合会让转换逻辑变复杂，需要权衡。</li>
<li>穷尽检查要用 <code>default: assertNever(state)</code> 之类的兜底，否则新增成员不会报错。</li>
<li>适合 reducer action、请求状态、WebSocket 状态、审批流；状态转换非常复杂时进一步引入状态机。</li>
<li>服务端返回的多个布尔字段要在数据层转换成联合类型，不要直接把接口形状泄进 UI。</li>
</ul>
`},{id:`q81-section-3`,title:`追问`,html:`
<ul>
<li><strong>需要同时表达多个维度怎么办？</strong> 组合两个联合（如 <code>status</code> × <code>hasNext</code>），或显式建立状态机，避免组合爆炸。</li>
<li><strong>它能替代测试吗？</strong> 不能，但能大幅减少"非法状态"相关的分支测试。</li>
</ul>`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:3216}}];export{e as default};