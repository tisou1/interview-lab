var e=[{id:78,slug:`question-78`,title:`any、unknown、never 如何区分？`,category:`typescript`,type:`theory`,difficulty:`basic`,tags:[`TypeScript`],estimatedMinutes:3,promptHtml:``,answerSections:[{id:`q78-section-0`,title:`答案`,html:`
<ul>
<li><code>any</code> 基本关闭该值的类型检查，并传播不安全。</li>
<li><code>unknown</code> 表示未知，使用前必须收窄，适合接口/异常等边界。</li>
<li><code>never</code> 表示不可能出现的值，可用于穷尽检查或永不返回函数。</li>
</ul>
<pre><code class="language-ts">function assertNever(x: never): never {
  throw new Error(\`Unexpected: \${String(x)}\`)
}
</code></pre>
<p>TypeScript 类型在运行时被擦除，因此外部 JSON 仍需 runtime validation。</p>
`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:1548}},{id:79,slug:`question-79`,title:`type 与 interface 怎么选？`,category:`typescript`,type:`theory`,difficulty:`basic`,tags:[`TypeScript`],estimatedMinutes:3,promptHtml:``,answerSections:[{id:`q79-section-0`,title:`答案`,html:`
<p>两者都能描述对象形状并支持扩展。interface 支持 declaration merging，适合公开可扩展契约；type 能直接表达 union、tuple、conditional、mapped 等组合。</p>
<p>不要背“interface 性能一定更好”或“所有对象必须 interface”。遵循团队约定，遇到 union/类型运算用 type，需要声明合并时用 interface；公共库要谨慎设计可扩展性。</p>
`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:1571}},{id:80,slug:`question-80`,title:`泛型的本质是什么？`,category:`typescript`,type:`theory`,difficulty:`intermediate`,tags:[`TypeScript`,`泛型`],estimatedMinutes:5,promptHtml:``,answerSections:[{id:`q80-section-0`,title:`答案`,html:`
<p>泛型用类型参数保留多个位置之间的类型关系，而不是把具体类型写死或退化成 unknown。</p>
<pre><code class="language-ts">function first&#x3C;T>(items: readonly T[]): T | undefined {
  return items[0]
}
</code></pre>
<p>好的 API 尽量让调用方通过参数推导 T；泛型约束表达所需最小能力。若类型参数只出现一次、没有建立关系，它可能没有必要。</p>
`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:1586}},{id:81,slug:`question-81`,title:`discriminated union 为什么适合 UI 状态？`,category:`typescript`,type:`theory`,difficulty:`intermediate`,tags:[`TypeScript`],estimatedMinutes:5,promptHtml:``,answerSections:[{id:`q81-section-0`,title:`答案`,html:`
<p>用共同字面量字段区分状态，可让每个分支只携带合法数据，并通过 <code>never</code> 做穷尽检查。这比多个 boolean（<code>loading/error/success</code> 可能同时为 true）更能排除非法组合。</p>
<p>它也适合 reducer action、WebSocket 状态、审批流等有限状态。状态转换非常复杂时可进一步用状态机建模。</p>
`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:1605}}];export{e as default};