# JavaScript / React 原理与实战模拟面试题库

> 面向 3–4 年 React 前端求职；包含原理题、追问题、代码实战、评分点与模拟面试卷。
>
> 版本背景：2026-09-14，React 19.3。带版本色彩的内容会单独标注；基础原理适用于 React 18/19 及多数存量项目。

---

## 0. 使用方法

不要从第一页开始背答案。每次选择 5 道题：

1. 不看答案，先口述 2–3 分钟。
2. 写最小代码验证自己的判断。
3. 阅读答案后，用“结论 → 原理 → 例子 → 边界/反例 → 项目经验”重新回答。
4. 给自己评分，并把不会的题放入错题表。

评分标准：

- **0 分**：不知道或结论错误。
- **1 分**：知道结论，只会背术语。
- **2 分**：能解释运行过程，能写示例。
- **3 分**：能处理追问，说明边界、取舍和排查工具。
- **4 分**：能关联真实项目，给出数据或故障案例。

面试时不要一上来讲十分钟。先用 20–40 秒给结论，面试官追问后再展开。

---

# 第一部分：JavaScript 原理题

## 1. 执行上下文、词法环境和调用栈是什么关系？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>JavaScript 执行全局代码或调用函数时，会为这段代码建立执行所需的运行环境。规范层面可用 Execution Context、Lexical Environment、Environment Record 等概念描述；工程表达中可以理解为：</p>
<ul>
<li><strong>调用栈</strong>保存当前正在执行的上下文，函数调用入栈，返回后出栈。</li>
<li><strong>词法环境</strong>记录标识符到变量/函数的绑定，并通过 outer reference 形成作用域链。</li>
<li><strong>执行上下文</strong>还关联当前代码、词法环境、变量环境、<code>this</code> 等运行信息。</li>
</ul>
<p>查找变量时，先查当前词法环境；不存在就沿 outer reference 向外查，直到全局。这个链由代码的<strong>词法嵌套位置</strong>决定，不由函数在哪里调用决定。</p>
<h3 id="section-1">追问</h3>
<p>为什么递归太深会栈溢出？因为每次未完成的函数调用都占用调用栈空间；调用深度超过引擎限制会抛出 <code>RangeError</code>。</p>
<h3 id="section-2">易错点</h3>
<p>“创建阶段/执行阶段”“变量对象”等常见说法来自旧规范或教学抽象。可以用于理解，但面试时不要声称它们就是现代规范内部唯一实现。</p>
</div>
</details>

---

## 2. 什么是变量提升？`var`、`let`、`const` 和函数声明有什么区别？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>“提升”是观察现象，不是引擎真的把源码移动到顶部。进入作用域时，引擎会先建立绑定：</p>
<ul>
<li><code>var</code> 的绑定在函数/全局作用域创建并初始化为 <code>undefined</code>，声明前读取通常得到 <code>undefined</code>。</li>
<li><code>let</code>/<code>const</code> 创建块级绑定，但在执行声明前未初始化；此区域称 TDZ，读取会抛 <code>ReferenceError</code>。</li>
<li><code>const</code> 要求声明时初始化，限制的是绑定不能重新赋值，不代表对象内容不可变。</li>
<li>函数声明通常在作用域初始化阶段完成绑定，因此声明前可以调用；块级函数声明在不同历史环境中行为复杂，现代代码不要依赖模糊边界。</li>
</ul>
<pre><code class="language-js">console.log(a) // undefined
var a = 1

console.log(b) // ReferenceError
let b = 2
</code></pre>
<h3 id="section-1">追问</h3>
<p><code>typeof undeclared</code> 返回 <code>'undefined'</code>，但 <code>typeof tdzVariable</code> 仍会抛错，因为后者已经存在词法绑定，只是尚未初始化。</p>
</div>
</details>

---

## 3. 闭包到底保存了什么？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript","闭包"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>闭包是函数与其创建时可访问的词法环境之间的组合。它不是简单地“复制变量值”，而是让函数继续访问对应的绑定。</p>
<pre><code class="language-js">function createCounter() {
  let count = 0
  return () =&gt; ++count
}

const a = createCounter()
const b = createCounter()
a() // 1
a() // 2
b() // 1
</code></pre>
<p><code>a</code> 和 <code>b</code> 分别关联两次调用形成的不同环境，因此各有一份 <code>count</code>。</p>
<p>闭包本身不是内存泄漏。只有当闭包仍可达，并且不必要地引用大对象、DOM、监听器或缓存时，相关对象才可能长期无法回收。解决方式是缩小捕获范围、解除监听、清理定时器、删除缓存项，必要时用 Memory snapshot 验证。</p>
<h3 id="section-1">追问</h3>
<p>循环中 <code>var</code> 与 <code>let</code> 为什么结果不同？<code>var</code> 共享函数级绑定；<code>let</code> 在每次循环迭代建立新的绑定环境。</p>
</div>
</details>

---

## 4. `this` 的值如何确定？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>普通函数的 <code>this</code> 主要由<strong>调用方式</strong>决定：</p>
<ol>
<li><code>fn()</code>：严格模式为 <code>undefined</code>；非严格脚本环境可能是全局对象。</li>
<li><code>obj.fn()</code>：通常是点号左侧的 <code>obj</code>。</li>
<li><code>fn.call(x)</code> / <code>apply</code> / <code>bind</code>：显式指定。</li>
<li><code>new Fn()</code>：指向新创建的实例；若构造函数显式返回对象，则返回该对象。</li>
<li>箭头函数没有自己的 <code>this</code>，从外层词法环境捕获。</li>
</ol>
<pre><code class="language-js">const user = {
  name: 'A',
  normal() { return this.name },
  arrow: () =&gt; this?.name,
}
</code></pre>
<p><code>user.normal()</code> 能读取 <code>user.name</code>；<code>arrow</code> 不会因为作为对象属性调用就获得 <code>user</code>。</p>
<h3 id="section-1">易错点</h3>
<p>把方法赋值给变量后再调用会丢失 receiver：</p>
<pre><code class="language-js">const f = user.normal
f() // strict mode 下 this 为 undefined
</code></pre>
</div>
</details>

---

## 5. `new Foo()` 做了什么？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>可以用近似模型解释：</p>
<ol>
<li>创建新对象。</li>
<li>把新对象的 <code>[[Prototype]]</code> 指向 <code>Foo.prototype</code>。</li>
<li>以新对象为 <code>this</code> 调用 <code>Foo</code>。</li>
<li>如果 <code>Foo</code> 显式返回非 null 对象，则采用该对象；否则返回新对象。</li>
</ol>
<pre><code class="language-js">function myNew(Ctor, ...args) {
  const instance = Object.create(Ctor.prototype)
  const result = Ctor.apply(instance, args)
  return result !== null &amp;&amp;
    (typeof result === 'object' || typeof result === 'function')
    ? result
    : instance
}
</code></pre>
<p>真实语言语义还有 <code>new.target</code>、不可构造函数等细节，这段代码是教学近似实现。</p>
</div>
</details>

---

## 6. 原型链如何工作？`prototype` 与 `__proto__` 有什么区别？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript","原型链"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<ul>
<li>每个普通对象都有内部 <code>[[Prototype]]</code> 链接，可用 <code>Object.getPrototypeOf(obj)</code> 读取。</li>
<li>可构造函数通常有 <code>.prototype</code> 属性，用作通过 <code>new</code> 创建对象的原型。</li>
<li><code>__proto__</code> 是历史访问器，不建议在业务代码中依赖；优先使用 <code>Object.getPrototypeOf</code> / <code>Object.setPrototypeOf</code> / <code>Object.create</code>。</li>
</ul>
<p>读取 <code>obj.x</code> 时先查自身属性，再沿 <code>[[Prototype]]</code> 向上，直到找到或到 <code>null</code>。写入通常创建/修改自身属性，但原型上的 accessor setter 等情况会改变行为。</p>
<p><code>instanceof</code> 的核心是检查构造函数当前的 <code>.prototype</code> 是否出现在对象原型链上，因此它可能跨 realm 失效，也可被 <code>Symbol.hasInstance</code> 定制。</p>
</div>
</details>

---

## 7. JavaScript `class` 是不是传统面向对象语言里的类？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p><code>class</code> 建立在原型机制之上，提供更清晰的声明语法和一些独立语义：类声明存在 TDZ、类体默认严格模式、方法不可枚举、必须用 <code>new</code> 调用、支持 private fields 和 <code>super</code>。</p>
<p>实例方法位于 <code>Class.prototype</code>，不是每个实例复制一份；箭头函数类字段通常会成为实例自身属性，因此每个实例都会创建函数。</p>
<pre><code class="language-js">class User {
  method() {}       // User.prototype.method
  field = () =&gt; {}  // 每个实例自身的 field
}
</code></pre>
</div>
</details>

---

## 8. 属性描述符有什么用？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>数据属性包含 <code>value/writable/enumerable/configurable</code>；访问器属性包含 <code>get/set/enumerable/configurable</code>。这些标志会影响赋值、遍历、删除和重新定义。</p>
<pre><code class="language-js">const obj = {}
Object.defineProperty(obj, 'id', {
  value: 1,
  writable: false,
  enumerable: false,
  configurable: false,
})
</code></pre>
<p><code>Object.keys</code> 只返回自身可枚举字符串键；<code>Reflect.ownKeys</code> 返回自身字符串键和 symbol 键，不受 enumerable 过滤。对象展开也只复制自身可枚举属性，并且不会完整保留原描述符和原型。</p>
</div>
</details>

---

## 9. JavaScript 的值类型与引用语义应该怎样准确表述？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>JavaScript 参数传递始终是 <strong>pass by value</strong>。区别在于：原始值本身被复制；对象变量保存的是对象引用这个值，复制后两个变量指向同一对象。</p>
<pre><code class="language-js">function mutate(x) { x.name = 'B' }
function replace(x) { x = { name: 'C' } }

const user = { name: 'A' }
mutate(user)  // user.name === 'B'
replace(user) // user 仍指向原对象
</code></pre>
<p>不要说“对象是引用传递”，这会让人误以为函数能通过给参数重新赋值来替换调用方变量。</p>
</div>
</details>

---

## 10. `==`、`===` 与 `Object.is` 有什么差异？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<ul>
<li><code>===</code> 不做常规类型转换，但 <code>NaN !== NaN</code>，且 <code>0 === -0</code>。</li>
<li><code>Object.is(NaN, NaN)</code> 为 true，<code>Object.is(0, -0)</code> 为 false。</li>
<li><code>==</code> 会执行抽象相等比较和类型转换，规则复杂；业务代码通常优先 <code>===</code>，少量明确场景如 <code>x == null</code> 可同时匹配 null/undefined，但团队应统一约定。</li>
</ul>
<p>React 对 state、dependency 等多处相等判断采用 <code>Object.is</code> 语义，这解释了 <code>NaN</code> 和 <code>-0</code> 的边界行为。</p>
</div>
</details>

---

## 11. 隐式类型转换最容易错在哪里？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>对象转原始值通常经过 <code>Symbol.toPrimitive</code>，否则根据 hint 尝试 <code>valueOf</code> / <code>toString</code>。<code>+</code> 同时承担数字加法和字符串拼接，因此尤其容易产生意外：</p>
<pre><code class="language-js">1 + '2'       // '12'
'5' - 2       // 3
[] + []       // ''
Boolean('0')  // true
Number('')    // 0
</code></pre>
<p>面试重点不是背所有怪题，而是说明转换路径。工程中在输入边界显式解析，并注意 <code>Number.isNaN</code>、空字符串、<code>parseInt</code> radix、浮点精度和 BigInt 不能与 Number 混算。</p>
</div>
</details>

---

## 12. 浅拷贝、深拷贝与结构化克隆有什么区别？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>对象展开、<code>Object.assign</code>、数组 <code>slice</code> 只复制第一层引用。<code>JSON.stringify/parse</code> 不是可靠深拷贝：会丢失 <code>undefined</code>、function、symbol，改变 Date，无法处理 BigInt，并且循环引用会失败。</p>
<p>浏览器的 <code>structuredClone</code> 支持循环引用、Map、Set、Date、ArrayBuffer 等大量结构，也支持 transfer，但不能克隆函数和 DOM node；自定义类原型语义也要验证。</p>
<p>工程上更重要的问题是：真的需要复制整棵图吗？React state 更新通常只复制发生变化的路径，保留未变化部分的引用共享。</p>
</div>
</details>

---

## 13. 浏览器 Event Loop 如何运行？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript","Event Loop"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>简化模型：事件循环每轮取一个 task 执行；调用栈清空后清空 microtask queue；浏览器在合适时机更新渲染，然后进入下一轮。定时器回调、用户事件等进入 task；Promise reaction、<code>queueMicrotask</code> 进入 microtask。</p>
<p>关键点：</p>
<ul>
<li><code>setTimeout(fn, 0)</code> 表示最早达到阈值后进入任务队列，不保证立即执行。</li>
<li>microtask 会在当前 task 结束后、下一个 task 前运行。</li>
<li>microtask 持续自我追加可能饿死渲染和其他 task。</li>
<li><code>requestAnimationFrame</code> 与下一次绘制相关，不等同普通 task。</li>
<li>Node.js 的 event loop 阶段与浏览器不同，不应套用同一张顺序表。</li>
</ul>
</div>
</details>

---

## 14. 输出顺序题：同步代码、Promise 和定时器

<!-- question: {"category":"javascript","type":"theory","difficulty":"advanced","tags":["JavaScript","Promise"],"estimatedMinutes":8} -->

```js
console.log('A')

setTimeout(() => console.log('B'), 0)

Promise.resolve()
  .then(() => {
    console.log('C')
    queueMicrotask(() => console.log('D'))
  })
  .then(() => console.log('E'))

queueMicrotask(() => console.log('F'))
console.log('G')
```

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>输出：<code>A G C F D E B</code>。</p>
<p>同步先输出 A/G。初始 microtask queue 是第一个 <code>then(C)</code>、<code>F</code>。执行 C 时加入 D，并使下一个 <code>then(E)</code>在前一个 reaction 完成后入队；此时队列依次是 F、D、E。microtask 清空后才执行定时器 B。</p>
<h3 id="section-1">评分点</h3>
<p>不仅说顺序，还应能画出每一步队列变化。</p>
</div>
</details>

---

## 15. async/await 的本质是什么？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>async 函数总是返回 Promise。执行到 <code>await expression</code> 时，先求值 expression；函数的后续执行会作为异步 continuation，在相应 Promise settle 后恢复，调用方不会阻塞线程。</p>
<pre><code class="language-js">async function run() {
  console.log(1)
  await 0
  console.log(2)
}

console.log(3)
run()
console.log(4)
// 3 1 4 2
</code></pre>
<p>即使 await 的是非 Promise 值，后续也不会在当前同步栈内直接继续。<code>try/catch</code> 能捕获 await 的 rejection；如果忘记 await 或 return，对应 rejection 可能逃出当前 try/catch。</p>
</div>
</details>

---

## 16. Promise 链的值与错误如何传播？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript","Promise"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p><code>then/catch/finally</code> 都返回新 Promise：</p>
<ul>
<li>handler 返回普通值：下一个 Promise fulfilled 为该值。</li>
<li>返回 Promise/thenable：下一个 Promise 采用它的最终状态。</li>
<li>抛异常：下一个 Promise rejected。</li>
<li>缺少对应 handler：状态和值/原因向后穿透。</li>
<li><code>finally</code> 通常不改变原值；但若 finally 抛错或返回 rejected Promise，会覆盖原结果。</li>
</ul>
<pre><code class="language-js">Promise.resolve(1)
  .then(x =&gt; x + 1)
  .then(() =&gt; { throw new Error('x') })
  .catch(() =&gt; 10)
  .finally(() =&gt; 20)
  .then(console.log) // 10
</code></pre>
</div>
</details>

---

## 17. `Promise.all/allSettled/race/any` 如何选择？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript","Promise"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<ul>
<li><code>all</code>：全部成功才成功；任一拒绝就快速拒绝，适合结果缺一不可。</li>
<li><code>allSettled</code>：等待全部结束并返回每项状态，适合批处理汇总。</li>
<li><code>race</code>：第一个 settled 的结果决定，常用于超时竞争；不会自动取消其他任务。</li>
<li><code>any</code>：第一个 fulfilled 即成功；全部拒绝才以 <code>AggregateError</code> 拒绝。</li>
</ul>
<p>它们都不会自动取消底层网络请求。要终止 fetch，需要配合 <code>AbortController</code>；仅忽略结果与真正释放资源是两回事。</p>
</div>
</details>

---

## 18. 并发与并行有什么区别？JavaScript 是单线程吗？

<!-- question: {"category":"javascript","type":"theory","difficulty":"advanced","tags":["JavaScript","并发"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>并发指多个任务在时间上交错推进；并行指多个任务同一时刻在不同执行资源上运行。页面主线程上的 JavaScript 通常一次执行一个调用栈，但浏览器还拥有网络、渲染、其他线程/进程；Web Worker 可以在另一个线程执行 JS。</p>
<p>Promise 不会自动让 CPU 计算并行。把大循环包进 Promise 仍会阻塞主线程；CPU 密集任务可切片、优化算法、使用 Worker，或移到服务端。</p>
</div>
</details>

---

## 19. Iterator 与 Generator 解决什么问题？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>Iterator 定义逐步取值协议：对象具有 <code>next()</code>，返回 <code>{ value, done }</code>。Iterable 通过 <code>[Symbol.iterator]()</code> 提供 iterator，因此可用于 <code>for...of</code>、展开等。</p>
<p>Generator 用 <code>function*</code>/<code>yield</code> 更方便地创建可暂停的 iterator。它适合惰性序列、状态机、遍历器；早期也用于组织异步流程，现在普通异步业务多用 async/await。</p>
<pre><code class="language-js">function* range(start, end) {
  for (let i = start; i &lt; end; i++) yield i
}

[...range(1, 4)] // [1, 2, 3]
</code></pre>
</div>
</details>

---

## 20. Map、Set、WeakMap、WeakSet 如何选择？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<ul>
<li>Map 键可为任意值，保留插入顺序，有明确 size/iteration API。</li>
<li>Set 保存唯一值。</li>
<li>WeakMap 只接受对象或非注册 symbol 等可被弱引用的键（按当前语言支持），键不会因 WeakMap 自身而被强制保活，且不可枚举。</li>
<li>WeakSet 类似地弱持有对象集合。</li>
</ul>
<p>WeakMap 适合把元数据关联到对象、私有缓存等；不可枚举是为了避免观察垃圾回收的非确定性。它不是“不会泄漏”的万能缓存，value 仍可能引用其他大对象，key 若在别处强可达也不会回收。</p>
</div>
</details>

---

## 21. 常见前端内存泄漏来源和排查方法是什么？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>常见来源：未解除的全局监听、定时器、观察器、订阅、WebSocket；无限增长的 Map/数组缓存；detached DOM；闭包捕获大对象；未终止请求和第三方库实例。</p>
<p>排查闭环：</p>
<ol>
<li>定义可重复操作，例如进入/退出页面 20 次。</li>
<li>Performance Monitor 观察 heap/node/listener 趋势。</li>
<li>采集两到三次 heap snapshot，对比 retained objects。</li>
<li>从 retaining path 找到强引用链。</li>
<li>修复 cleanup/缓存淘汰，再用同流程复测。</li>
</ol>
<p>仅看到内存暂时上涨不能直接判定泄漏，因为 GC 时机不确定。</p>
</div>
</details>

---

## 22. ESM 与 CommonJS 的核心差异是什么？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript","ESM"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<ul>
<li>ESM 使用静态 <code>import/export</code>，依赖关系可在执行前分析，导入是 live binding；支持浏览器原生模块和 top-level await。</li>
<li>CommonJS 通过 <code>require/module.exports</code>，通常在运行时同步加载，导出常表现为对象值。</li>
<li>ESM 的静态结构有利于 tree shaking，但 tree shaking 是否成功还取决于副作用、打包器和代码形态。</li>
<li>Node 中模块类型受扩展名与 <code>package.json type/exports</code> 等影响；不要仅凭语法猜最终解析方式。</li>
</ul>
<h3 id="section-1">追问</h3>
<p>循环依赖不一定立即报错。ESM 绑定会先建立，但在初始化前访问可能触发 TDZ；CJS 常看到尚未执行完成的部分导出。最好通过重新划分模块边界消除循环。</p>
</div>
</details>

---

## 23. 防抖和节流有什么区别？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<ul>
<li>防抖：连续触发期间重置等待，停止一段时间后执行，适合搜索建议、表单校验。</li>
<li>节流：固定时间窗口最多执行一次，适合滚动位置、resize 等持续事件。</li>
</ul>
<p>完整实现需要考虑 leading/trailing、参数、<code>this</code>、返回值、cancel/flush；搜索请求还需要取消旧请求或忽略旧响应，防抖本身不解决竞态。</p>
</div>
</details>

---

## 24. 事件委托为什么有效？有什么边界？

<!-- question: {"category":"javascript","type":"theory","difficulty":"advanced","tags":["JavaScript"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>利用事件冒泡，在共同祖先监听，再通过 <code>event.target.closest()</code> 找到目标，可减少大量同类监听，并自然覆盖后来插入的子节点。</p>
<p>边界：不是所有事件都按相同方式冒泡；<code>target</code> 与 <code>currentTarget</code> 不同；Shadow DOM 会发生 retargeting；需要处理目标是否仍在容器内；不要用脆弱 DOM 层级判断。</p>
</div>
</details>

---

## 25. 为什么不可变更新对 React 很重要？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript","React"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>不可变不是 JavaScript 强制要求，而是一种更新纪律。创建新引用能让 React 和状态库通过浅比较快速判断变化，保留旧快照也利于并发渲染、撤销、日志和调试。</p>
<pre><code class="language-js">// 错误：修改已有对象，并把同一引用传回
user.name = 'B'
setUser(user)

// 正确：只复制变化路径
setUser(prev =&gt; ({ ...prev, name: 'B' }))
</code></pre>
<p>深度复制整棵对象既慢又破坏未变化节点的引用稳定性。应该只复制从根到变更点的路径，或使用能生成结构共享结果的工具。</p>
</div>
</details>

---

## 26. 前端错误应该怎样分类和传播？

<!-- question: {"category":"javascript","type":"theory","difficulty":"advanced","tags":["JavaScript"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>至少区分：用户输入错误、业务拒绝、认证/授权错误、网络/超时、服务端错误、程序 bug。不同类别的重试、提示、日志级别和恢复方式不同。</p>
<p>在 Promise 链中不要空 <code>catch</code>；如果当前层无法处理，应补充上下文后重新抛出。全局 unhandled rejection 只能作为最后观测网，不代替局部错误处理。日志要脱敏，并附版本、路由、请求 id 等排查上下文。</p>
</div>
</details>

---

## 27. 垃圾回收可以手动触发吗？WeakRef 应该用来解决普通缓存吗？

<!-- question: {"category":"javascript","type":"theory","difficulty":"advanced","tags":["JavaScript","缓存"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>标准业务代码不能可靠控制 GC 时机。WeakRef/FinalizationRegistry 的回收和回调都不确定，不适合承载正确性、关键资源释放或普通业务缓存策略。缓存应优先有明确容量、TTL 和淘汰规则；外部资源必须显式 close/unsubscribe。</p>
</div>
</details>

---

## 28. 为什么 `Array.prototype.sort` 可能带来 React bug？

<!-- question: {"category":"javascript","type":"theory","difficulty":"advanced","tags":["JavaScript","React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p><code>sort</code> 会原地修改数组。如果 props/state 数组被直接排序，会破坏旧快照，并可能导致 memoization、撤销或其他消费者看到意外变化。</p>
<pre><code class="language-js">const sorted = [...items].sort(compare)
// 或现代环境使用 items.toSorted(compare)
</code></pre>
<p>同类原地方法还包括 <code>reverse</code>、<code>splice</code>、<code>fill</code> 等。重点不是全部禁用，而是不要直接修改 React 正在持有的 state/props。</p>
</div>
</details>

---

# 第二部分：React 原理题

## 29. JSX 和 React Element 是什么？

<!-- question: {"category":"react","type":"theory","difficulty":"basic","tags":["React"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>JSX 是语法扩展，经编译转换为创建 element 描述的调用。React element 是普通、不可变的 UI 描述对象，不是 DOM 节点，也不是组件实例。</p>
<pre><code class="language-jsx">const view = &lt;Button color=&quot;red&quot;&gt;Save&lt;/Button&gt;
</code></pre>
<p>它描述“希望渲染 Button，并传入哪些 props”。函数组件随后被 React 调用，返回另一棵 element 描述。React 根据这些描述决定宿主环境中的实际操作。</p>
<p><code>&lt;Button /&gt;</code> 与 <code>Button()</code> 不等价：前者让 React 管理组件身份、Hooks、调度和错误边界；直接调用只是普通函数调用，会破坏组件边界和 Hook 归属。</p>
</div>
</details>

---

## 30. React 一次更新经过哪些阶段？

<!-- question: {"category":"react","type":"theory","difficulty":"basic","tags":["React"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>高层模型：</p>
<ol>
<li><strong>Trigger/Schedule</strong>：初次挂载或 state/props/context/external store 变化触发工作。</li>
<li><strong>Render phase</strong>：React 调用组件，计算下一棵 UI；这一阶段应纯粹，在并发模式下可能暂停、重做或放弃。</li>
<li><strong>Reconciliation</strong>：比较新旧描述，决定保留、更新、插入和删除哪些节点。</li>
<li><strong>Commit phase</strong>：把确定的变化应用到 DOM，并处理 ref、layout effect 等；该阶段不能像 render 一样随意丢弃。</li>
<li>浏览器绘制；普通 Effect 通常在合适时机执行。</li>
</ol>
<p>“组件重新渲染”只表示组件函数再次执行以计算 UI，不等于 DOM 一定变化。React 可能发现宿主节点属性和结构都没变，因此无需改 DOM。</p>
</div>
</details>

---

## 31. reconciliation 是什么？Virtual DOM diff 的复杂度如何理解？

<!-- question: {"category":"react","type":"theory","difficulty":"basic","tags":["React"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>通用树编辑距离代价很高。React 基于 UI 的常见结构采用启发式：不同 element type 通常视为不同子树；同层列表借助 key 匹配身份。这样可以在线性扫描同级子节点的常见路径中完成协调。</p>
<p>不要把它简化为“Virtual DOM 一定比直接 DOM 快”。Virtual DOM 的主要价值是声明式模型、跨更新协调、批处理和调度空间；具体性能仍取决于组件结构、计算量和真实 DOM 工作。</p>
</div>
</details>

---

## 32. `key` 的真正作用是什么？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>key 与 element type 一起帮助 React 识别<strong>同一父节点下兄弟元素的身份</strong>。稳定 key 让 React 在插入、删除、排序时把旧 state/DOM 与正确的新元素对应。</p>
<p>使用 index 的风险：列表中间插入、删除或重排后，同一个 index 可能代表另一条业务数据，导致输入值、局部 state 或动画错位。只有列表静态、不会排序/过滤，且元素没有需要保留的身份状态时，index 才相对安全。</p>
<p>改变 key 会让 React 把元素视为新身份，因此可以有意重置表单 state。key 不会作为普通 prop 传给组件。</p>
</div>
</details>

---

## 33. state 保存在哪里？为什么说它是 snapshot？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React","state"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>state 不存于组件函数局部变量里，而由 React 根据组件在树中的位置/身份维护。每次 React 调用组件，会给这次 render 一份 state 快照；该次 render 创建的事件处理器和闭包读取的也是这份快照。</p>
<p>调用 setter 是请求未来更新，不会修改已经运行中的局部变量：</p>
<pre><code class="language-jsx">function Counter() {
  const [count, setCount] = useState(0)

  function handleClick() {
    setCount(count + 1)
    console.log(count) // 当前 render 的快照，仍为 0
  }
}
</code></pre>
<p>这不是“异步变量赋值”的简单问题，而是 React render 模型：每次 render 的值保持一致，让代码可推理。</p>
</div>
</details>

---

## 34. batching 与 state update queue 如何工作？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React","state"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>React 会把一个处理边界中的多个更新排队，避免每个 setter 都立即产生一次完整 render。对同一个 state：</p>
<ul>
<li><code>setX(value)</code> 可理解为加入“替换为 value”的更新。</li>
<li><code>setX(prev =&gt; next)</code> 加入基于队列前一结果计算的 updater。</li>
</ul>
<pre><code class="language-jsx">setNumber(number + 5)
setNumber(n =&gt; n + 1)
setNumber(42)
</code></pre>
<p>若当前 number 为 0，队列大致得到：替换 5 → updater 得 6 → 替换 42，最终是 42。</p>
<p>React 18+ 在 <code>createRoot</code> 下扩大了自动 batching 范围，但不要把“自动批处理”解释成永远只 render 一次。不同用户事件、<code>flushSync</code>、优先级和同步外部 store 等边界会影响行为。需要基于前一值时始终用函数式更新。</p>
</div>
</details>

---

## 35. props、state、普通变量和 ref 的区别是什么？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","state"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<ul>
<li>props：父组件传入的当前 render 输入，只读。</li>
<li>state：由 React 管理，setter 会请求 render。</li>
<li>普通局部变量：每次 render 重新计算，修改不会保留也不会触发 render。</li>
<li>ref：跨 render 保留同一个容器，修改 <code>.current</code> 不触发 render。</li>
</ul>
<p>选择标准：影响页面输出且会变化的数据用 state；仅需跨 render 保存但不参与渲染的 imperative 信息（DOM、timer id、latest value）可用 ref；能由 props/state 计算出的值通常直接计算，不另存 state。</p>
</div>
</details>

---

## 36. 什么是派生状态？为什么经常不需要 Effect？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","Effect"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>如果一个值能从当前 props/state 纯计算得到，它就是派生数据，通常应在 render 中计算：</p>
<pre><code class="language-jsx">// 不推荐：多一份状态、一次旧 UI、额外 render
useEffect(() =&gt; setFullName(`${first} ${last}`), [first, last])

// 推荐
const fullName = `${first} ${last}`
</code></pre>
<p>昂贵计算可在测量后用 memoization，但不要用 Effect 同步两份可推导状态。真正需要 state 的情况通常是要保留用户独立编辑的值，或保存某个历史快照，而不是当前输入的函数。</p>
</div>
</details>

---

## 37. 受控组件与非受控组件如何选择？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>受控输入的当前值来自 React state，并通过 <code>onChange</code> 更新；非受控输入主要由 DOM 保持值，通过 ref 或提交时读取。</p>
<p>受控适合即时校验、联动、格式化和统一状态；非受控适合简单表单、第三方 DOM 集成或减少逐键状态协调。文件输入天然主要由用户和 DOM 控制。</p>
<p>“组件受控”也可泛指父组件通过 prop 控制某个行为。设计组件 API 时避免同一状态在受控/非受控之间切换，并明确 <code>value/defaultValue</code> 语义。</p>
</div>
</details>

---

## 38. 为什么 Hooks 不能写在条件、循环或普通函数里？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","Hooks"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>React 需要在每次 render 中按稳定顺序把 Hook 调用与该组件的 Hook 状态对应。条件调用会让后续 Hook 的位置错位。</p>
<pre><code class="language-jsx">// 错误
if (enabled) {
  const [x, setX] = useState(0)
}
</code></pre>
<p>Hooks 只能在 React 函数组件或自定义 Hook 顶层调用。<code>use</code> API 在支持的场景有不同规则，但不能据此推翻其他 Hooks 的顺序要求。实际项目使用 eslint-plugin-react-hooks 自动检查。</p>
</div>
</details>

---

## 39. Hooks 在内部为什么常被描述为链表？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","Hooks"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>在常见 React 实现中，函数组件对应的 Fiber 会关联一组按调用顺序组织的 Hook 记录；mount 时创建，update 时按顺序复用。链表是源码实现细节，真正稳定的设计约束是：React 依赖调用顺序把某次 <code>useState/useEffect</code> 与之前那一项状态对应。</p>
<p>面试回答不要把某版本字段名当 API 保证。解释“顺序对应”以及条件 Hook 为什么会错位，比背 <code>memoizedState/next</code> 更重要。</p>
</div>
</details>

---

## 40. `useEffect` 的本质用途是什么？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","Effect"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>Effect 用于让组件与 React 外部系统同步，例如网络连接、DOM imperative API、订阅、定时器、第三方组件。它不是通用生命周期替代品，也不是“render 后随便做点事”。</p>
<p>判断方法：先指出外部系统。如果没有外部系统，通常考虑直接计算、事件处理、状态提升或 reducer。</p>
<pre><code class="language-jsx">useEffect(() =&gt; {
  const connection = connect(roomId)
  return () =&gt; connection.disconnect()
}, [roomId])
</code></pre>
<p>当依赖变化时，React 先用旧值执行 cleanup，再用新值 setup；卸载时最后 cleanup。Effect 只在客户端运行，不在 server render 中运行。</p>
</div>
</details>

---

## 41. dependency array 应该怎样理解？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>它不是“我希望什么时候执行”的开关，而是 Effect 代码读取的所有 reactive value 的声明。React 使用 <code>Object.is</code> 比较依赖。</p>
<ul>
<li>无数组：每次 commit 后都可能执行。</li>
<li><code>[]</code>：此 Effect 不读取会随 render 变化的 reactive value；不是“强制只执行一次”的语义承诺，Strict Mode 开发期还会额外 setup/cleanup。</li>
<li><code>[a, b]</code>：a/b 变化时重新同步。</li>
</ul>
<p>遇到对象/函数依赖频繁变化，先调整代码结构：把只供 Effect 使用的对象放进 Effect，把非响应逻辑移出组件，或拆分 Effect。不要关闭 lint 或随意删依赖掩盖 stale closure。</p>
</div>
</details>

---

## 42. 什么是 stale closure？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>每次 render 都创建新的局部变量和函数闭包。旧回调仍引用创建它时的快照，就会读取旧值：</p>
<pre><code class="language-jsx">useEffect(() =&gt; {
  const id = setInterval(() =&gt; {
    setCount(count + 1) // 若依赖为空，count 可能一直是初始值
  }, 1000)
  return () =&gt; clearInterval(id)
}, [])
</code></pre>
<p>若更新只依赖前值：</p>
<pre><code class="language-jsx">setCount(c =&gt; c + 1)
</code></pre>
<p>如果确实需要最新值但不希望重新订阅，可根据场景使用 ref，或当前 React 提供的 Effect Event 等明确机制。不要把所有值都塞进 ref，因为那会绕过响应式数据流。</p>
</div>
</details>

---

## 43. 如何处理 Effect 中的请求竞态？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React","Effect","请求"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>当参数 A 请求先发后回、参数 B 后发先回时，A 可能覆盖 B。两类处理：</p>
<ol>
<li>使用 <code>AbortController</code> 真正取消支持取消的请求。</li>
<li>cleanup 标记当前 Effect 已失效，忽略旧结果。</li>
</ol>
<pre><code class="language-jsx">useEffect(() =&gt; {
  const controller = new AbortController()
  let active = true

  async function load() {
    try {
      const res = await fetch(`/api?q=${query}`, {
        signal: controller.signal,
      })
      const data = await res.json()
      if (active) setData(data)
    } catch (error) {
      if (error.name !== 'AbortError' &amp;&amp; active) setError(error)
    }
  }

  load()
  return () =&gt; {
    active = false
    controller.abort()
  }
}, [query])
</code></pre>
<p>成熟项目通常还会通过 router loader 或 server-state library 处理缓存、去重、重试与竞态，避免每个组件重复造请求生命周期。</p>
</div>
</details>

---

## 44. `useEffect` 与 `useLayoutEffect` 有什么区别？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React","Effect"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>两者都在 commit 后运行于客户端。<code>useLayoutEffect</code> 在浏览器绘制前同步执行，并可能阻塞绘制，适合读取布局后立即修正 tooltip 等必须避免闪烁的视觉工作；<code>useEffect</code> 通常允许浏览器先绘制，适合大多数外部同步。</p>
<p>默认选择 <code>useEffect</code>。不要为了“更早”把所有逻辑换成 layout effect；它会延迟页面展示。SSR 环境还要注意 layout effect 只在客户端执行。</p>
</div>
</details>

---

## 45. Strict Mode 为什么会看到组件或 Effect 多执行一次？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React","Effect"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>在开发环境，Strict Mode 会额外执行某些行为来发现不纯 render、缺失 cleanup 和 ref callback 清理问题。Effect 会经历额外的 setup → cleanup → setup 压力测试；生产环境不会因此机械地执行两次。</p>
<p>正确处理不是关闭 Strict Mode，而是让 render 纯粹、让 setup/cleanup 对称、让网络或写操作具备幂等/取消策略。若额外执行暴露重复订阅，它通常说明真实导航或 remount 时也可能出错。</p>
</div>
</details>

---

## 46. ref 有哪些用途和风险？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>用途：访问 DOM、保存 timer/request/third-party instance、保存不参与 UI 的可变值。修改 <code>.current</code> 不触发 render，因此把页面显示依赖的数据放 ref 会造成 UI 不同步。</p>
<p>读取或写入 ref 通常应在事件或 Effect 中进行；render 中随意改变 ref 会破坏纯度。回调 ref 也要清理。React 19 中 function component 可将 <code>ref</code> 作为 prop 使用；面对 React 18 存量代码仍要理解 <code>forwardRef</code>。</p>
</div>
</details>

---

## 47. `memo`、`useMemo`、`useCallback` 分别做什么？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<ul>
<li><code>memo(Component)</code>：props 按浅层 <code>Object.is</code> 语义相同时，允许 React 跳过该组件的部分重复 render。</li>
<li><code>useMemo(factory, deps)</code>：缓存一次计算结果。</li>
<li><code>useCallback(fn, deps)</code>：缓存函数引用，近似 <code>useMemo(() =&gt; fn, deps)</code>。</li>
</ul>
<p>它们是性能优化，不是正确性工具。常见无效情况：计算本来很便宜；父组件每次传新对象使 memo 失效；组件自身 state/context 更新；比较成本接近或超过 render；依赖频繁变化。</p>
<p>正确流程：Profiler 找到昂贵且重复的 render → 调整状态/组件/订阅边界 → 必要时 memoize → 复测。React Compiler 可自动做一部分 memoization，但仍不替代正确的数据流和性能测量。</p>
</div>
</details>

---

## 48. Context 为什么可能引起大范围更新？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React","Context"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>Provider 的 value 变化时，读取该 Context 的消费者需要获得新值。若 value 每次 render 都是新对象，或一个大 Context 同时包含高频和低频字段，会扩大更新范围。</p>
<p>优化顺序：</p>
<ol>
<li>将 state 放到离消费者最近的位置。</li>
<li>拆分不同变化频率/职责的 Context。</li>
<li>保持 Provider value 合理稳定。</li>
<li>高频、大规模、细粒度订阅需求考虑 external store/selector。</li>
</ol>
<p><code>memo</code> 不能阻止组件因自己读取的 Context 变化而更新。不要默认“所有全局状态都用 Context”。</p>
</div>
</details>

---

## 49. `useReducer` 什么时候比 `useState` 合适？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>当多个字段围绕同一业务事件一起变化、状态转换复杂、需要集中验证不变量或便于测试时，reducer 更合适。它把“发生了什么”与“如何变化”分离。</p>
<pre><code class="language-ts">type Action =
  | { type: 'submit' }
  | { type: 'success'; data: Data }
  | { type: 'failure'; error: Error }
</code></pre>
<p>reducer 必须纯，不应在其中请求接口或写日志。简单且彼此独立的状态无需强行 reducer。<code>useReducer</code> 也不自动等于全局状态管理。</p>
</div>
</details>

---

## 50. 如何设计一个好的自定义 Hook？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React","Hook"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>自定义 Hook 复用的是有状态逻辑，不是共享同一份 state。每次调用仍有独立 Hook 状态。</p>
<p>好 Hook：</p>
<ul>
<li>名称表达能力而非生命周期，例如 <code>useChatConnection</code>。</li>
<li>API 小而明确，暴露业务动作而非大量内部 setter。</li>
<li>setup/cleanup 对称，依赖清晰。</li>
<li>返回值稳定性有意识，但不为稳定而过度 memo。</li>
<li>对错误、取消、并发和 SSR 有明确边界。</li>
</ul>
<p>如果 Hook 只是包一行 <code>useState</code> 且没有形成稳定抽象，价值有限。</p>
</div>
</details>

---

## 51. React 事件和原生 DOM 事件有什么关系？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>React 提供跨浏览器一致的事件接口，并通常通过根容器上的事件系统处理。事件仍遵循捕获/冒泡概念，但 React tree 与 DOM tree 可能因 Portal 等不完全一致。</p>
<p><code>stopPropagation</code> 阻止传播，<code>preventDefault</code> 阻止默认行为，两者不同。现代 SyntheticEvent 不再需要 <code>persist()</code> 才能异步读取。混用原生监听和 React handler 时，要明确监听位置、阶段和调用顺序。</p>
</div>
</details>

---

## 52. Portal 中的事件为什么可能冒泡到视觉上不相邻的父组件？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>Portal 只改变 DOM 放置位置，不改变它在 React tree 中的逻辑父子关系。因此 Context 仍可用，事件也按 React tree 传播。这适合 modal/tooltip，但可能让只看 DOM 的事件判断产生误解。</p>
<p>Portal 还需处理 focus management、aria、scroll lock、层级和卸载 cleanup，不能只解决 <code>z-index</code>。</p>
</div>
</details>

---

## 53. Error Boundary 能捕获哪些错误？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>Error Boundary 捕获其子树在 render、构造和部分生命周期中的错误，并显示 fallback。它通常不捕获：事件处理器错误、任意异步 callback 错误、服务端渲染错误，以及 boundary 自身错误。</p>
<p>请求错误一般进入数据层的 error state；事件错误在事件边界 <code>try/catch</code>；程序 render 错误交给 Error Boundary。错误边界应按路由/关键区域合理布置，并记录错误、组件栈、版本等信息。</p>
</div>
</details>

---

## 54. 外部 store 为什么需要 `useSyncExternalStore`？什么是 tearing？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>并发 render 可能在不同时间读取外部可变数据。如果同一次 UI 计算的不同组件看到不同版本，就可能 tearing。<code>useSyncExternalStore</code> 提供 React 能正确协调的 subscribe/getSnapshot 协议，并支持 server snapshot。</p>
<p>要求：<code>getSnapshot</code> 在 store 未变化时返回稳定结果；变化时返回新的不可变 snapshot；<code>subscribe</code> 返回 unsubscribe。它主要面向状态库作者和浏览器外部数据源封装，普通业务不必手写 store。</p>
</div>
</details>

---

## 55. `startTransition/useTransition` 解决什么问题？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>Transition 将某些更新标记为非紧急，让输入、点击等紧急交互优先。后台 render 可被更高优先级更新打断并重做，减少界面卡顿。</p>
<pre><code class="language-jsx">const [isPending, startTransition] = useTransition()

function handleChange(e) {
  const next = e.target.value
  setInput(next) // 紧急：输入必须立即更新
  startTransition(() =&gt; {
    setFilter(next) // 非紧急：昂贵列表可后台更新
  })
}
</code></pre>
<p>Transition 不会让计算变快，也不是 debounce；它改变调度优先级。不能用 Transition 控制文本输入值。异步 action 中 await 后的更新在某些版本/场景仍需再次包裹，应以当前官方文档为准。</p>
</div>
</details>

---

## 56. `useDeferredValue` 与 debounce 有什么区别？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","debounce"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p><code>useDeferredValue</code> 让某个值的消费方落后更新，后台 render 可中断，没有固定毫秒延迟；debounce 在时间层面减少回调/请求触发次数。</p>
<p><code>useDeferredValue</code> 自身不会减少网络请求。常见组合：输入 state 立即更新，查询请求按产品需求 debounce/cache，昂贵结果渲染使用 deferred value 保持输入响应。</p>
</div>
</details>

---

## 57. Suspense 是什么？它是否会自动请求数据？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","Suspense","请求"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>Suspense 是协调“子树尚未准备好”时 fallback 与 reveal 的 UI 边界。它本身不是数据请求库，不会因为把普通 fetch 写进 Effect 就自动工作。</p>
<p>常见支持来源：<code>lazy</code> 代码加载、支持 Suspense 的框架/数据层、<code>use</code> 读取 Promise 等。边界位置决定用户看到局部 skeleton、保留旧内容还是整页 fallback。设计重点是 reveal 顺序、错误边界和避免已展示内容反复被大 spinner 替换。</p>
</div>
</details>

---

## 58. `lazy` 与动态 import 如何实现代码分割？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>动态 <code>import()</code> 给 bundler 创建异步 chunk 的边界，<code>lazy(() =&gt; import(...))</code> 让 React 在需要组件时加载模块，并通过 Suspense 展示 fallback。</p>
<p>路由级通常是合理起点；过细拆分会增加请求、fallback 和复杂度。模块加载失败要配 Error Boundary/重试或刷新策略。chunk 命名和长期缓存要结合构建工具分析。</p>
</div>
</details>

---

## 59. SSR、hydration、streaming SSR 分别是什么？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","SSR"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<ul>
<li>SSR：服务器为请求生成 HTML，让用户更早看到内容，也有利于部分 SEO/分享场景。</li>
<li>hydration：客户端 React 在已有 HTML 上建立事件和组件能力；服务端和客户端首个输出必须匹配。</li>
<li>streaming SSR：服务器分块发送 HTML，让已准备部分先到达，常与 Suspense 边界协调。</li>
</ul>
<p>常见 hydration mismatch：render 中使用 <code>Date.now/random</code>、直接读取浏览器环境、本地化/时区不同、非法 HTML 嵌套、服务端和客户端数据不一致。不要用 suppress warning 掩盖真实不一致。</p>
</div>
</details>

---

## 60. Server Component 与 SSR 是同一个概念吗？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","SSR"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>不是。SSR 关注把某次 UI 渲染成 HTML；Server Component 是组件模块边界与传输模型，一些组件只在服务器执行，其结果以特定表示传给客户端，减少客户端 JS 并允许靠近数据源。</p>
<p>Server Component 不能使用仅客户端的 state/effect/DOM API；Client Component 边界需要明确，传递数据通常要求可序列化。它强依赖框架和构建实现，不建议在无框架业务里自行拼装。</p>
</div>
</details>

---

## 61. React 19 的 Actions、`useActionState`、`useOptimistic` 解决什么问题？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>Actions 围绕异步 mutation 组织 pending、错误、表单提交和乐观反馈。<code>useActionState</code> 管理 action 返回状态与 pending；<code>useOptimistic</code> 在操作进行中展示预期结果，并在真实结果到达后协调；<code>useFormStatus</code> 可读取父 form 提交状态。</p>
<p>它们减少重复样板，但不会替你解决业务幂等、权限、服务端验证、冲突合并和缓存一致性。乐观更新前要判断失败概率、回滚成本和用户是否能理解冲突。</p>
</div>
</details>

---

## 62. React Compiler 会让 `useMemo/useCallback` 消失吗？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>Compiler 可以在构建时分析并自动 memoize 一部分组件和值，减少手写 memoization。它不意味着所有性能问题消失，也不改变组件必须纯、Hook 规则、状态边界、订阅粒度和算法复杂度。</p>
<p>存量项目是否启用要看编译兼容、第三方库、lint、构建链和回归测试。面试中应说“先写正确纯粹的组件并测量，再决定 Compiler/手工 memo”，不要声称全面删除所有 memo API。</p>
</div>
</details>

---

## 63. React 19.3 有哪些需要了解但不用死背的变化？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>截至 2026-09-14，官方最新稳定版本为 React 19.3，新增或稳定化了 View Transitions、Fragment Refs、<code>browser()</code>、Trusted Types 支持等，并继续演进 Server Component 能力。</p>
<p>求职策略：</p>
<ul>
<li>知道这些能力解决什么问题、对构建/框架有什么要求。</li>
<li>不把新 API 当通用基础题，更不要假装在生产中使用过。</li>
<li>国内存量岗位仍可能基于较早版本，应能区分当前推荐写法和旧代码迁移。</li>
</ul>
<p>资料：<a href="https://react.dev/blog/2026/09/09/react-19-3">React 19.3 官方发布说明</a>、<a href="https://react.dev/versions">React Versions</a>。</p>
</div>
</details>

---

## 64. 为什么 render 中不能产生副作用？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>render 可能被 React 调用多次、暂停、丢弃或为不同优先级重新开始。如果在 render 中修改外部变量、发请求、操作 DOM，就可能在没有 commit 的情况下产生不可撤销影响，导致重复写入和 UI/外部世界不一致。</p>
<p>render 只根据 props/state/context 计算 element。由用户操作直接引发的写操作通常放事件处理器；需要与渲染结果保持同步的外部连接放 Effect。</p>
</div>
</details>

---

## 65. 父组件 render，子组件一定 render 吗？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>默认情况下，父组件重新执行并返回子 element，React 通常会继续处理其子组件；如果子组件是 <code>memo</code> 且 props 相等，或已有 element 对象被作为稳定 children 等，React可能跳过部分工作。子组件自己的 state/context 变化也会使其更新。</p>
<p>但“render”必须区分：组件函数执行、Fiber 工作、DOM commit。即使子函数执行，DOM 也可能完全不变。优化前应由 Profiler 证明子 render 昂贵且重复。</p>
</div>
</details>

---

## 66. 为什么把组件定义在另一个组件内部可能丢失 state？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","state"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>外层每次 render 都会创建一个新的函数对象作为 element type。React 看到当前位置的 type 改变，会把它当成新组件，卸载旧树并挂载新树，局部 state 随之重置。</p>
<pre><code class="language-jsx">function Parent() {
  function Child() { /* 每次 Parent render 都是新 type */ }
  return &lt;Child /&gt;
}
</code></pre>
<p>应把组件定义移到模块顶层；需要捕获数据时通过 props 传递。</p>
</div>
</details>

---

## 67. React 中为什么不建议把 props 复制到 state？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","state"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>复制后会形成两个真相来源：prop 更新时 state 是否覆盖？用户本地编辑是否保留？Effect 同步常带来一帧旧值和额外 render。</p>
<p>如果只是派生，直接计算；如果要保留“初始值后独立编辑”，使用 <code>initialX/defaultX</code> 命名明确语义；若切换实体需要重置，可由 key 表达身份，或在事件/状态机中显式处理。</p>
</div>
</details>

---

## 68. React 列表性能差，应按什么顺序排查？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","性能"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<ol>
<li>在 production build 和可复现数据下用 React Profiler/Performance 记录。</li>
<li>判断瓶颈是数据计算、组件 render、DOM 数量、layout/paint 还是网络。</li>
<li>检查 key、state 位置、Context/selector 订阅范围。</li>
<li>数据量巨大先考虑分页或虚拟化；昂贵计算再考虑 memo。</li>
<li>拆分高频更新区域，避免整表跟随一个输入更新。</li>
<li>同条件复测并记录 trade-off。</li>
</ol>
<p>虚拟化能减少 DOM，但引入动态高度、可访问性、查找、打印和滚动定位复杂度，不是所有列表都需要。</p>
</div>
</details>

---

## 69. React 测试应该测试什么？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","测试"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>优先测试用户可观察行为和高风险边界：用户看到什么、点击/输入什么、最终状态是什么。避免断言内部 state、私有方法、CSS 类或 Hook 调用次数。</p>
<ul>
<li>reducer/权限/转换：unit。</li>
<li>表单、请求状态、交互：component/integration。</li>
<li>登录、创建、支付等关键链路：E2E。</li>
</ul>
<p>异步测试使用语义查询和可等待断言，控制接口数据，保持测试隔离。测试数量和 coverage 不是唯一目标，失败时能否指出业务风险更重要。</p>
</div>
</details>

---

## 70. React 项目中 server state 与 client state 如何划分？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","state"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>server state 由服务端拥有，具有异步、共享、可能过期、缓存/重试/失效等特点；client state 由当前 UI 拥有，如弹窗、草稿、当前 tab。URL state 用于可分享、刷新保留和导航相关状态。</p>
<p>不要把请求结果同时复制进 query cache 和全局 store。先定义唯一权威来源；需要组合展示时使用 selector/派生。mutation 后采用精确 cache update、invalidation 或服务端返回结果，策略取决于一致性和请求成本。</p>
</div>
</details>

---

## 71. React 中“状态下沉”为什么常比 memo 更有效？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>如果高频 state 位于大组件顶部，每次更新都会让整个子树参与 render。把状态移动到真正使用它的小组件，或让包装组件接收稳定 children，可以从源头缩小更新范围。</p>
<p>memo 是更新发生后的跳过机制；状态下沉减少了需要考虑的子树，通常更易读、依赖更少，也不要求调用方维护引用稳定性。</p>
</div>
</details>

---

## 72. React 中如何避免重复提交？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>前端可在 pending 时禁用触发器、合并同一操作、生成请求 id；但仅禁用按钮不能解决双击竞态、刷新重试或多端请求。服务端应使用幂等键、唯一约束或状态机确保最终安全。</p>
<p>UI 需要明确 pending/success/error，并避免错误时永久禁用。乐观更新失败要回滚或重新拉取权威状态。</p>
</div>
</details>

---

# 第三部分：浏览器、TypeScript 与工程补充题

## 73. 从输入 URL 到页面显示发生了什么？

<!-- question: {"category":"browser","type":"theory","difficulty":"basic","tags":["浏览器"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案提纲</h3>
<p>URL 解析 → HSTS/缓存/Service Worker 等可能介入 → DNS → 建连与 TLS → HTTP 请求响应 → HTML 流式解析 → DOM；CSS 形成 CSSOM；二者参与 render tree/layout/paint/composite；脚本加载和执行可能阻塞解析；资源继续发现与请求；React 可能创建根或 hydration；最终还要区分“看到内容”和“可顺畅交互”。</p>
<p>完整答案要讨论缓存、连接复用、preload、脚本属性、LCP/INP，而不是只背 DNS/TCP。</p>
</div>
</details>

---

## 74. 强缓存与协商缓存如何工作？

<!-- question: {"category":"browser","type":"theory","difficulty":"basic","tags":["浏览器","缓存"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>强缓存依据 Cache-Control 等在 freshness 生命周期内直接复用；过期后可带 ETag/If-None-Match 或 Last-Modified/If-Modified-Since 向服务端验证，未变化返回 304。</p>
<p>带 hash 的静态资源常使用长时间 immutable，HTML 使用较短或需验证策略，以便新 HTML 引用新 hash。<code>no-cache</code> 表示使用前验证，不等于不存储；<code>no-store</code> 才是不存储，但应考虑性能和 bfcache 影响。</p>
</div>
</details>

---

## 75. CORS 是什么？为什么 Postman 正常而浏览器失败？

<!-- question: {"category":"browser","type":"theory","difficulty":"intermediate","tags":["浏览器","CORS"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>CORS 是浏览器在同源策略基础上允许服务器声明跨源读取权限的机制。Postman 不受浏览器页面同源策略限制，所以接口本身成功不代表浏览器允许 JS 读取响应。</p>
<p>非简单请求会先 preflight OPTIONS。携带 credentials 时不能使用通配 origin，客户端和服务端都要正确配置，Cookie 还受 SameSite/Secure 等限制。CORS 不是服务端鉴权，也不阻止其他服务端调用接口。</p>
</div>
</details>

---

## 76. XSS、CSRF 与 CSP 分别是什么？

<!-- question: {"category":"browser","type":"theory","difficulty":"intermediate","tags":["浏览器","XSS","CSRF","CSP"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<ul>
<li>XSS：不可信内容作为可执行脚本/HTML 注入。防护靠上下文编码、安全 DOM API、富文本 sanitization、避免危险 sink、CSP 等。</li>
<li>CSRF：攻击者利用浏览器自动携带凭据，让用户对目标站发出非预期请求。防护包括 SameSite、CSRF token、Origin/Referer 检查和关键操作再认证等。</li>
<li>CSP：服务端声明允许加载/执行的资源策略，能降低部分注入危害，但不是替代输入输出安全处理。</li>
</ul>
<p>React 默认转义 JSX 插值，但 <code>dangerouslySetInnerHTML</code>、不安全 URL、第三方 DOM 操作仍需处理。</p>
</div>
</details>

---

## 77. layout、paint、composite 有什么区别？

<!-- question: {"category":"browser","type":"theory","difficulty":"intermediate","tags":["浏览器"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>layout 计算元素几何位置/尺寸；paint 生成绘制指令/像素内容；composite 合成不同图层。修改 width/position 等可能触发布局，颜色/阴影可能触发绘制，transform/opacity 在合适条件下可主要走合成，但图层也有内存成本。</p>
<p>交替读取布局信息与写样式会造成 forced synchronous layout。解决是批量读、批量写，并用 Performance trace 确认，不靠属性清单猜测。</p>
</div>
</details>

---

## 78. `any`、`unknown`、`never` 如何区分？

<!-- question: {"category":"typescript","type":"theory","difficulty":"basic","tags":["TypeScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<ul>
<li><code>any</code> 基本关闭该值的类型检查，并传播不安全。</li>
<li><code>unknown</code> 表示未知，使用前必须收窄，适合接口/异常等边界。</li>
<li><code>never</code> 表示不可能出现的值，可用于穷尽检查或永不返回函数。</li>
</ul>
<pre><code class="language-ts">function assertNever(x: never): never {
  throw new Error(`Unexpected: ${String(x)}`)
}
</code></pre>
<p>TypeScript 类型在运行时被擦除，因此外部 JSON 仍需 runtime validation。</p>
</div>
</details>

---

## 79. `type` 与 `interface` 怎么选？

<!-- question: {"category":"typescript","type":"theory","difficulty":"basic","tags":["TypeScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>两者都能描述对象形状并支持扩展。interface 支持 declaration merging，适合公开可扩展契约；type 能直接表达 union、tuple、conditional、mapped 等组合。</p>
<p>不要背“interface 性能一定更好”或“所有对象必须 interface”。遵循团队约定，遇到 union/类型运算用 type，需要声明合并时用 interface；公共库要谨慎设计可扩展性。</p>
</div>
</details>

---

## 80. 泛型的本质是什么？

<!-- question: {"category":"typescript","type":"theory","difficulty":"intermediate","tags":["TypeScript","泛型"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>泛型用类型参数保留多个位置之间的类型关系，而不是把具体类型写死或退化成 unknown。</p>
<pre><code class="language-ts">function first&lt;T&gt;(items: readonly T[]): T | undefined {
  return items[0]
}
</code></pre>
<p>好的 API 尽量让调用方通过参数推导 T；泛型约束表达所需最小能力。若类型参数只出现一次、没有建立关系，它可能没有必要。</p>
</div>
</details>

---

## 81. discriminated union 为什么适合 UI 状态？

<!-- question: {"category":"typescript","type":"theory","difficulty":"intermediate","tags":["TypeScript"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>用共同字面量字段区分状态，可让每个分支只携带合法数据，并通过 <code>never</code> 做穷尽检查。这比多个 boolean（<code>loading/error/success</code> 可能同时为 true）更能排除非法组合。</p>
<p>它也适合 reducer action、WebSocket 状态、审批流等有限状态。状态转换非常复杂时可进一步用状态机建模。</p>
</div>
</details>

---

## 82. tree shaking 为什么可能失败？

<!-- question: {"category":"engineering","type":"theory","difficulty":"intermediate","tags":["工程化"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>tree shaking 依赖 ESM 静态结构、打包器分析和副作用信息。CommonJS 动态 require、顶层副作用、错误的 <code>sideEffects</code> 声明、整包聚合导入、库发布格式等都可能妨碍消除。</p>
<p>不要只看源代码 import 写法，要分析生产 bundle，并验证功能没有因错误 sideEffects 配置被移除。</p>
</div>
</details>

---

## 83. source map 有什么价值和安全风险？

<!-- question: {"category":"engineering","type":"theory","difficulty":"intermediate","tags":["工程化"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>source map 把压缩构建代码位置映射回源码，便于线上错误定位。可将 map 上传到监控平台但不公开部署，按 release/version 对应；若公开 map，可能暴露源码、内部路径或注释。无论是否有 map，浏览器 bundle 中都不能包含 secret。</p>
</div>
</details>

---

## 84. 前端监控应采集什么？

<!-- question: {"category":"engineering","type":"theory","difficulty":"intermediate","tags":["工程化"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>错误：JS error、unhandled rejection、资源失败、接口失败、白屏；性能：Web Vitals、关键业务耗时；行为：最少必要的操作上下文。每条记录附 release、route、device/network、trace/request id，并做采样、聚合与脱敏。</p>
<p>监控不是越多越好。要控制数据量、性能开销和个人信息；告警应基于影响面、错误率和持续时间，避免单条错误制造噪声。</p>
</div>
</details>

---

## 85. CI 中前端项目最小质量门禁是什么？

<!-- question: {"category":"engineering","type":"theory","difficulty":"intermediate","tags":["工程化"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>依项目风险，通常包含 lockfile 安装、lint、typecheck、targeted tests、production build。关键项目再增加 E2E、bundle budget、安全扫描和预览环境。</p>
<p>任务应可缓存、可并行且结果可复现。不能只在 CI 修问题，本地脚本应与 CI 使用同一入口；失败日志要能定位，测试不应依赖不稳定第三方数据。</p>
</div>
</details>

---

# 第四部分：JavaScript 代码实战题

代码题建议先澄清输入、输出、异常和规模，再写主路径，最后补边界与测试。以下实现以展示思路为主；生产代码还要结合项目规范。

## 86. 实现 debounce，支持 cancel 和 flush

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript","debounce"],"estimatedMinutes":10} -->

### 题目

实现 `debounce(fn, wait)`：连续调用只在停止 wait 毫秒后执行最后一次；支持 `cancel()` 和 `flush()`。

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">参考实现</h3>
<pre><code class="language-js">function debounce(fn, wait) {
  let timer = null
  let lastArgs
  let lastThis

  function invoke() {
    if (timer === null) return
    clearTimeout(timer)
    timer = null

    const args = lastArgs
    const thisArg = lastThis
    lastArgs = lastThis = undefined
    return fn.apply(thisArg, args)
  }

  function debounced(...args) {
    lastArgs = args
    lastThis = this

    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(invoke, wait)
  }

  debounced.cancel = () =&gt; {
    if (timer !== null) clearTimeout(timer)
    timer = null
    lastArgs = lastThis = undefined
  }

  debounced.flush = invoke
  return debounced
}
</code></pre>
<h3 id="section-1">追问与评分点</h3>
<ul>
<li>是否保留最后一次参数和 <code>this</code>？</li>
<li><code>cancel</code> 后 <code>flush</code> 不应执行。</li>
<li>可继续扩展 leading/trailing/maxWait。</li>
<li>React 中组件卸载要 cancel；搜索还要处理请求竞态，debounce 只减少调用次数。</li>
</ul>
</div>
</details>

---

## 87. 实现 throttle，支持 trailing

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript","throttle"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">参考实现</h3>
<pre><code class="language-js">function throttle(fn, wait) {
  let lastInvokeTime = 0
  let timer = null
  let lastArgs
  let lastThis

  function invoke(time) {
    lastInvokeTime = time
    timer = null
    const args = lastArgs
    const thisArg = lastThis
    lastArgs = lastThis = undefined
    return fn.apply(thisArg, args)
  }

  function throttled(...args) {
    const now = Date.now()
    const remaining = wait - (now - lastInvokeTime)
    lastArgs = args
    lastThis = this

    if (remaining &lt;= 0 || remaining &gt; wait) {
      if (timer !== null) clearTimeout(timer)
      return invoke(now)
    }
    
    if (timer === null) {
      timer = setTimeout(() =&gt; invoke(Date.now()), remaining)
    }
  }

  throttled.cancel = () =&gt; {
    if (timer !== null) clearTimeout(timer)
    timer = null
    lastInvokeTime = 0
    lastArgs = lastThis = undefined
  }

  return throttled
}
</code></pre>
<h3 id="section-1">追问</h3>
<p>系统时间回拨可能导致 remaining 异常，因此代码处理了 <code>remaining &gt; wait</code>。高精度动画更适合 <code>requestAnimationFrame</code>，不要用时间节流代替渲染调度。</p>
</div>
</details>

---

## 88. 实现并发限制器 `mapLimit`

<!-- question: {"category":"javascript","type":"coding","difficulty":"advanced","tags":["JavaScript","并发"],"estimatedMinutes":10} -->

### 题目

给定输入数组、最大并发数和异步 mapper，按输入顺序返回结果。

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">参考实现</h3>
<pre><code class="language-js">async function mapLimit(items, limit, mapper) {
  if (!Number.isInteger(limit) || limit &lt;= 0) {
    throw new RangeError('limit must be a positive integer')
  }

  const results = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (true) {
      const index = nextIndex++
      if (index &gt;= items.length) return
      results[index] = await mapper(items[index], index)
    }
  }

  const workerCount = Math.min(limit, items.length)
  await Promise.all(Array.from({ length: workerCount }, worker))
  return results
}
</code></pre>
<h3 id="section-1">复杂度与边界</h3>
<ul>
<li>时间复杂度由 mapper 工作量决定，调度额外空间 O(n) 用于结果。</li>
<li>任一任务拒绝时外层快速拒绝，但已启动任务不会自动取消。</li>
<li>生产版可接受 <code>AbortSignal</code>、错误策略（fail-fast/all-settled）、重试和进度回调。</li>
</ul>
</div>
</details>

---

## 89. 手写 `Promise.all`

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript","Promise"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">参考实现</h3>
<pre><code class="language-js">function promiseAll(iterable) {
  return new Promise((resolve, reject) =&gt; {
    const values = Array.from(iterable)
    if (values.length === 0) {
      resolve([])
      return
    }

    const results = new Array(values.length)
    let fulfilledCount = 0
    
    values.forEach((value, index) =&gt; {
      Promise.resolve(value).then(
        result =&gt; {
          results[index] = result
          fulfilledCount += 1
          if (fulfilledCount === values.length) resolve(results)
        },
        reject,
      )
    })
  })
}
</code></pre>
<h3 id="section-1">评分点</h3>
<ul>
<li>接受 iterable 和普通值/thenable。</li>
<li>空输入得到空数组。</li>
<li>结果保持输入顺序，而不是完成顺序。</li>
<li>首个 rejection 使结果拒绝；底层任务不会自动取消。</li>
<li>这是行为近似实现，不等于完整复刻 ECMAScript 内部算法与 subclass/species 语义。</li>
</ul>
</div>
</details>

---

## 90. 实现 EventEmitter

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">参考实现</h3>
<pre><code class="language-js">class EventEmitter {
  #events = new Map()

  on(type, listener) {
    const listeners = this.#events.get(type) ?? new Set()
    listeners.add(listener)
    this.#events.set(type, listeners)
    return () =&gt; this.off(type, listener)
  }

  once(type, listener) {
    const off = this.on(type, (...args) =&gt; {
      off()
      listener(...args)
    })
    return off
  }

  off(type, listener) {
    const listeners = this.#events.get(type)
    if (!listeners) return
    listeners.delete(listener)
    if (listeners.size === 0) this.#events.delete(type)
  }

  emit(type, ...args) {
    const listeners = this.#events.get(type)
    if (!listeners) return false

    // 快照避免监听器在 emit 中增删导致本轮遍历异常
    for (const listener of [...listeners]) {
      listener(...args)
    }
    return true
  }
}
</code></pre>
<h3 id="section-1">追问</h3>
<p>需要明确：监听器异常是否阻断后续？是否支持 async listener？同一函数重复注册是否允许？Set 的选择意味着重复注册会去重。这些都是 API 设计，不存在唯一答案。</p>
</div>
</details>

---

## 91. 实现 O(1) 的 LRU Cache

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript","LRU"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">参考实现</h3>
<p>现代 JavaScript 的 Map 保留插入顺序，可用删除后重插表示“最近使用”：</p>
<pre><code class="language-js">class LRUCache {
  constructor(capacity) {
    if (!Number.isInteger(capacity) || capacity &lt;= 0) {
      throw new RangeError('capacity must be positive')
    }
    this.capacity = capacity
    this.cache = new Map()
  }

  get(key) {
    if (!this.cache.has(key)) return undefined
    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  set(key, value) {
    if (this.cache.has(key)) this.cache.delete(key)
    this.cache.set(key, value)

    if (this.cache.size &gt; this.capacity) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
    return this
  }
}
</code></pre>
<h3 id="section-1">追问</h3>
<p>若业务需要缓存 <code>undefined</code>，<code>get</code> 的未命中返回值会歧义，应增加 <code>has</code> 或返回 tagged result。生产缓存还要考虑 TTL、按内存大小淘汰、并发请求去重和统计。</p>
</div>
</details>

---

## 92. 实现支持循环引用的 deepClone

<!-- question: {"category":"javascript","type":"coding","difficulty":"advanced","tags":["JavaScript"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">参考实现</h3>
<pre><code class="language-js">function deepClone(value, seen = new WeakMap()) {
  if (typeof value !== 'object' || value === null) return value
  if (seen.has(value)) return seen.get(value)

  if (value instanceof Date) return new Date(value.getTime())
  if (value instanceof RegExp) return new RegExp(value.source, value.flags)

  if (value instanceof Map) {
    const result = new Map()
    seen.set(value, result)
    for (const [k, v] of value) {
      result.set(deepClone(k, seen), deepClone(v, seen))
    }
    return result
  }

  if (value instanceof Set) {
    const result = new Set()
    seen.set(value, result)
    for (const item of value) result.add(deepClone(item, seen))
    return result
  }

  const result = Array.isArray(value)
    ? []
    : Object.create(Object.getPrototypeOf(value))

  seen.set(value, result)

  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if ('value' in descriptor) {
      descriptor.value = deepClone(descriptor.value, seen)
    }
    Object.defineProperty(result, key, descriptor)
  }

  return result
}
</code></pre>
<h3 id="section-1">边界</h3>
<p>这仍未处理 WeakMap、Promise、Error 内部槽、DOM、函数闭包、ArrayBuffer transfer 等全部类型。面试加分回答是：先询问数据范围；浏览器支持时优先评估 <code>structuredClone</code>；React state 更新通常不应深拷贝整棵对象。</p>
</div>
</details>

---

## 93. 实现带 AbortSignal 和指数退避的 retry

<!-- question: {"category":"javascript","type":"coding","difficulty":"advanced","tags":["JavaScript"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">参考实现</h3>
<pre><code class="language-js">function sleep(ms, signal) {
  return new Promise((resolve, reject) =&gt; {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
      return
    }

    const id = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () =&gt; {
        clearTimeout(id)
        reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

async function retry(task, options = {}) {
  const {
    retries = 3,
    baseDelay = 200,
    signal,
    shouldRetry = () =&gt; true,
  } = options

  let lastError

  for (let attempt = 0; attempt &lt;= retries; attempt++) {
    if (signal?.aborted) throw signal.reason

    try {
      return await task({ attempt, signal })
    } catch (error) {
      lastError = error
      if (attempt === retries || !shouldRetry(error)) throw error
    
      const exponential = baseDelay * 2 ** attempt
      const jitter = Math.random() * exponential * 0.2
      await sleep(exponential + jitter, signal)
    }
  }

  throw lastError
}
</code></pre>
<h3 id="section-1">追问</h3>
<p>不能默认重试所有请求。认证失败、参数错误通常不应重试；非幂等 mutation 重试可能重复写入，需服务端幂等键。429/503 可参考 <code>Retry-After</code>。还要给总超时上限。</p>
</div>
</details>

---

## 94. 实现“只采用最新请求结果”

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript","请求"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">参考实现</h3>
<pre><code class="language-js">function createLatestRunner() {
  let version = 0
  let controller = null

  return async function run(task) {
    const currentVersion = ++version
    controller?.abort()
    controller = new AbortController()

    try {
      const value = await task(controller.signal)
      if (currentVersion !== version) {
        return { status: 'stale' }
      }
      return { status: 'success', value }
    } catch (error) {
      if (controller.signal.aborted || currentVersion !== version) {
        return { status: 'stale' }
      }
      return { status: 'error', error }
    }
  }
}
</code></pre>
<h3 id="section-1">评分点</h3>
<p>取消旧任务可以释放资源，version 检查保证即使底层任务不支持取消也不采用旧结果。生产中还要避免闭包里的共享 controller 判断错对象，可为每次调用保存局部 signal；上面通过 version 作为最终权威判断。</p>
</div>
</details>

---

## 95. 数组转树与树转数组

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">参考实现</h3>
<pre><code class="language-js">function arrayToTree(items) {
  const nodes = new Map(items.map(item =&gt; [item.id, { ...item, children: [] }]))
  const roots = []

  for (const item of items) {
    const node = nodes.get(item.id)
    if (item.parentId == null) {
      roots.push(node)
      continue
    }

    const parent = nodes.get(item.parentId)
    if (!parent) throw new Error(`Missing parent: ${item.parentId}`)
    parent.children.push(node)
  }

  return roots
}

function flattenTree(roots) {
  const result = []
  const stack = [...roots].reverse()

  while (stack.length) {
    const node = stack.pop()
    const { children = [], ...rest } = node
    result.push(rest)
    for (let i = children.length - 1; i &gt;= 0; i--) {
      stack.push(children[i])
    }
  }

  return result
}
</code></pre>
<h3 id="section-1">复杂度与边界</h3>
<p>时间 O(n)，额外空间 O(n)。需要澄清重复 id、缺失 parent、环、输出顺序和是否允许多个根。检测环需要额外访问状态，不能只靠这段基础实现。</p>
</div>
</details>

---

## 96. 实现 compose

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<pre><code class="language-js">const compose = (...functions) =&gt; input =&gt;
  functions.reduceRight((value, fn) =&gt; fn(value), input)

const trim = value =&gt; value.trim()
const lower = value =&gt; value.toLowerCase()
const slug = value =&gt; value.replaceAll(/\s+/g, '-')

compose(slug, lower, trim)('  Hello World  ') // hello-world
</code></pre>
<h3 id="section">追问</h3>
<p>这版只处理单参数同步函数。若第一个函数多参数、支持 async、错误通道或 TypeScript 完整推导，需要重新设计签名。不要为了函数式术语忽略可读性。</p>
</div>
</details>

---

## 97. 实现并解释大数金额相加

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">答案</h3>
<p>金融金额不应直接依赖二进制浮点小数：</p>
<pre><code class="language-js">0.1 + 0.2 !== 0.3
</code></pre>
<p>如果币种固定两位小数，可在输入边界转为最小单位整数，并在安全整数范围内计算；更大范围可用 BigInt：</p>
<pre><code class="language-js">function addCents(a, b) {
  return BigInt(a) + BigInt(b)
}
</code></pre>
<p>实际业务必须明确精度、舍入规则、币种和序列化。BigInt 不能直接 JSON.stringify，也不能与 Number 混算。复杂金融场景采用经过验证的 decimal 方案并由业务规则决定。</p>
</div>
</details>

---

# 第五部分：React 代码与场景实战题

## 98. 修复异步计数器的 stale state

<!-- question: {"category":"react","type":"debugging","difficulty":"intermediate","tags":["React","state"],"estimatedMinutes":5} -->

### 题目

```jsx
async function handleBuy() {
  setPending(pending + 1)
  await buy()
  setPending(pending - 1)
  setCompleted(completed + 1)
}
```

快速点击时计数错误，如何修复？

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">参考答案</h3>
<pre><code class="language-jsx">async function handleBuy() {
  setPending(value =&gt; value + 1)
  try {
    await buy()
    setCompleted(value =&gt; value + 1)
  } finally {
    setPending(value =&gt; value - 1)
  }
}
</code></pre>
<p>每个 handler 闭包读取的是触发时的 snapshot。下一值依赖前值时使用 updater；<code>finally</code> 确保失败也减少 pending。生产中还应决定失败计数、重复提交和卸载后的结果处理。</p>
</div>
</details>

---

## 99. 实现 `useLatest`

<!-- question: {"category":"react","type":"coding","difficulty":"intermediate","tags":["React"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<pre><code class="language-jsx">import { useRef } from 'react'

function useLatest(value) {
  const ref = useRef(value)
  ref.current = value
  return ref
}
</code></pre>
<h3 id="section">使用边界</h3>
<p>它让异步回调读取最新值，但不会触发 render，也不应拿来逃避 Effect dependency。适合保存 latest callback/value 供事件或订阅回调读取。对当前 React 的 Effect Event 能力也应了解，并根据项目版本选择。</p>
</div>
</details>

---

## 100. 实现 `useDebouncedValue`

<!-- question: {"category":"react","type":"coding","difficulty":"intermediate","tags":["React"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<pre><code class="language-jsx">import { useEffect, useState } from 'react'

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() =&gt; {
    const id = setTimeout(() =&gt; setDebounced(value), delay)
    return () =&gt; clearTimeout(id)
  }, [value, delay])

  return debounced
}
</code></pre>
<h3 id="section">追问</h3>
<ul>
<li>首次是否立即返回原值？这版是。</li>
<li>delay 变化是否重启计时？这版会。</li>
<li>它不会取消基于旧值已经发出的请求。</li>
<li>如果目的是延迟昂贵 render 而不是减少调用次数，应比较 <code>useDeferredValue</code>。</li>
</ul>
</div>
</details>

---

## 101. 实现稳定的 `useEventListener`

<!-- question: {"category":"react","type":"coding","difficulty":"intermediate","tags":["React"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<pre><code class="language-jsx">import { useEffect, useRef } from 'react'

function useEventListener(target, type, listener, options) {
  const listenerRef = useRef(listener)
  listenerRef.current = listener

  useEffect(() =&gt; {
    const node = target?.current ?? target
    if (!node?.addEventListener) return

    const handler = event =&gt; listenerRef.current(event)
    node.addEventListener(type, handler, options)
    
    return () =&gt; node.removeEventListener(type, handler, options)
  }, [target, type, options])
}
</code></pre>
<h3 id="section">边界与改进</h3>
<p>对象形式 options 若每次创建新引用会重复订阅，可让调用方稳定它，或只提取 <code>capture/passive/once</code> 等字段。<code>removeEventListener</code> 的匹配重点是 type、listener 和 capture。SSR 时 target 不存在应安全跳过。</p>
</div>
</details>

---

## 102. 实现一个可被 `useSyncExternalStore` 订阅的 store

<!-- question: {"category":"react","type":"coding","difficulty":"advanced","tags":["React"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<pre><code class="language-js">function createStore(initialState) {
  let state = initialState
  const listeners = new Set()

  return {
    getSnapshot() {
      return state
    },
    setState(updater) {
      const next = typeof updater === 'function' ? updater(state) : updater
      if (Object.is(next, state)) return
      state = next
      for (const listener of [...listeners]) listener()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () =&gt; listeners.delete(listener)
    },
  }
}
</code></pre>
<pre><code class="language-jsx">import { useSyncExternalStore } from 'react'

const counterStore = createStore({ count: 0 })

function Counter() {
  const snapshot = useSyncExternalStore(
    counterStore.subscribe,
    counterStore.getSnapshot,
    counterStore.getSnapshot,
  )

  return &lt;button&gt;{snapshot.count}&lt;/button&gt;
}
</code></pre>
<h3 id="section">评分点</h3>
<p>snapshot 未变化时必须保持同一引用；状态变化应创建新 snapshot。SSR 的 <code>getServerSnapshot</code> 必须与 hydration 数据策略一致。真实 store 还要 selector、批处理和错误隔离。</p>
</div>
</details>

---

## 103. 设计一个请求状态 reducer

<!-- question: {"category":"react","type":"coding","difficulty":"intermediate","tags":["React","请求","reducer"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<pre><code class="language-ts">type State&lt;T&gt; =
  | { status: 'idle' }
  | { status: 'loading'; requestId: number }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

type Action&lt;T&gt; =
  | { type: 'start'; requestId: number }
  | { type: 'success'; requestId: number; data: T }
  | { type: 'error'; requestId: number; error: Error }
  | { type: 'reset' }

function reducer&lt;T&gt;(state: State&lt;T&gt;, action: Action&lt;T&gt;): State&lt;T&gt; {
  switch (action.type) {
    case 'start':
      return { status: 'loading', requestId: action.requestId }
    case 'success':
      if (state.status !== 'loading' || state.requestId !== action.requestId) {
        return state
      }
      return { status: 'success', data: action.data }
    case 'error':
      if (state.status !== 'loading' || state.requestId !== action.requestId) {
        return state
      }
      return { status: 'error', error: action.error }
    case 'reset':
      return { status: 'idle' }
    default: {
      const neverAction: never = action
      return neverAction
    }
  }
}
</code></pre>
<h3 id="section">设计点</h3>
<p>union 排除了同时 loading/success/error 的非法状态，requestId 防止旧请求覆盖新请求。reducer 纯粹，请求副作用放事件/Effect/数据层。</p>
</div>
</details>

---

## 104. 修复搜索组件的竞态、错误与卸载问题

<!-- question: {"category":"react","type":"debugging","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">参考实现</h3>
<pre><code class="language-jsx">function Search({ query }) {
  const [state, setState] = useState({ status: 'idle' })

  useEffect(() =&gt; {
    if (!query.trim()) {
      setState({ status: 'idle' })
      return
    }

    const controller = new AbortController()
    let active = true
    setState({ status: 'loading' })
    
    ;(async () =&gt; {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        if (active) setState({ status: 'success', data })
      } catch (error) {
        if (active &amp;&amp; error.name !== 'AbortError') {
          setState({ status: 'error', error })
        }
      }
    })()
    
    return () =&gt; {
      active = false
      controller.abort()
    }
  }, [query])

  // 根据 discriminated state 渲染 idle/loading/error/empty/success
}
</code></pre>
<h3 id="section-1">进一步回答</h3>
<p>实际应用优先评估 router loader/server-state library，以获得缓存、请求去重、失效和 SSR 集成。若输入每个字符都请求，还需 debounce；如果结果列表 render 很慢，再考虑 deferred value/transition。</p>
</div>
</details>

---

## 105. 设计一个 controlled/uncontrolled 通用组件 Hook

<!-- question: {"category":"react","type":"coding","difficulty":"advanced","tags":["React","Hook"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<pre><code class="language-jsx">function useControllableState({ value, defaultValue, onChange }) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : internalValue

  const setValue = useCallback(
    next =&gt; {
      const resolved = typeof next === 'function' ? next(current) : next
      if (!controlled) setInternalValue(resolved)
      if (!Object.is(resolved, current)) onChange?.(resolved)
    },
    [controlled, current, onChange],
  )

  return [current, setValue]
}
</code></pre>
<h3 id="section">追问</h3>
<p>应在开发期警告组件从 controlled 切换为 uncontrolled 或反向切换；函数式更新在并发场景还要谨慎，因为 <code>current</code> 是当前 render snapshot。组件库需定义清楚 <code>undefined</code> 是否代表非受控，以及 <code>null</code> 的业务语义。</p>
</div>
</details>

---

## 106. 如何让 10,000 行列表的搜索输入保持响应？

<!-- question: {"category":"react","type":"scenario","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">合格答案</h3>
<p>先测量，不能直接回答“加 useMemo”。分层解决：</p>
<ol>
<li>输入 state 与筛选结果 state/计算分开。</li>
<li>数据非常大时优先服务端搜索/分页，或客户端虚拟化减少 DOM。</li>
<li>纯 CPU 筛选可索引、预处理，必要时 Worker。</li>
<li>使用 <code>useDeferredValue</code> 或 Transition 让输入优先，但它不减少总计算。</li>
<li>只有 Profiler 证明重复昂贵计算时才 <code>useMemo</code>。</li>
<li>稳定 key，缩小 Context/全局 store 的订阅范围。</li>
<li>同条件记录输入延迟、render/commit 时间和 memory。</li>
</ol>
<h3 id="section-1">示例骨架</h3>
<pre><code class="language-jsx">function SearchableList({ items }) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  const filtered = useMemo(
    () =&gt; filterItems(items, deferredQuery),
    [items, deferredQuery],
  )

  return (
    &lt;&gt;
      &lt;input value={query} onChange={e =&gt; setQuery(e.target.value)} /&gt;
      &lt;VirtualList items={filtered} /&gt;
    &lt;/&gt;
  )
}
</code></pre>
<p>代码只是候选方案，是否使用每个优化必须由测量决定。</p>
</div>
</details>

---

## 107. 如何测试一个异步表单？

<!-- question: {"category":"react","type":"scenario","difficulty":"intermediate","tags":["React","测试"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">参考思路</h3>
<pre><code class="language-tsx">test('submits and shows success state', async () =&gt; {
  const user = userEvent.setup()
  server.use(
    http.post('/api/projects', async ({ request }) =&gt; {
      const body = await request.json()
      return HttpResponse.json({ id: 'p1', ...body })
    }),
  )

  render(&lt;ProjectForm /&gt;)

  await user.type(screen.getByRole('textbox', { name: /name/i }), 'Alpha')
  await user.click(screen.getByRole('button', { name: /create/i }))

  expect(await screen.findByText(/created/i)).toBeVisible()
})
</code></pre>
<h3 id="section-1">评分点</h3>
<ul>
<li>按角色/label 查询，不依赖 class 或内部 state。</li>
<li>使用用户级交互和等待式断言。</li>
<li>mock 自己的网络边界，而不是 mock React Hook 实现。</li>
<li>另测失败、重复提交和校验；测试之间数据隔离。</li>
</ul>
</div>
</details>

---

## 108. 设计权限组件时怎样避免“前端鉴权”误区？

<!-- question: {"category":"react","type":"scenario","difficulty":"intermediate","tags":["React","权限"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">参考设计</h3>
<pre><code class="language-tsx">function Can({ permission, children, fallback = null }) {
  const allowed = usePermission(permission)
  return allowed ? children : fallback
}
</code></pre>
<p>这只是展示控制。真正 API 必须在服务端按用户、租户、资源和动作鉴权。前端权限模型应来自受信任 session/permission response，并处理权限动态变化和 403。测试至少覆盖角色 × 权限矩阵，而不是只测 admin。</p>
</div>
</details>

---

## 109. React 代码审查题：找出问题

<!-- question: {"category":"react","type":"debugging","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

```jsx
function UserList({ users, query }) {
  const [filtered, setFiltered] = useState([])

  useEffect(() => {
    users.sort((a, b) => a.name.localeCompare(b.name))
    setFiltered(users.filter(user => user.name.includes(query)))
  }, [users])

  return filtered.map((user, index) => (
    <User key={index} user={user} />
  ))
}
```

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">题解</h3>
<ol>
<li><code>sort</code> 修改 props。</li>
<li>filtered 可由 props/query 派生，不需 state + Effect。</li>
<li>dependency 漏了 query，产生旧结果。</li>
<li>Effect 使 UI 先 render 一次旧 filtered，再额外 render。</li>
<li>index key 在重排时破坏身份。</li>
<li>大数据量才考虑 memo，不能默认需要。</li>
</ol>
<pre><code class="language-jsx">function UserList({ users, query }) {
  const filtered = users
    .filter(user =&gt; user.name.includes(query))
    .toSorted((a, b) =&gt; a.name.localeCompare(b.name))

  return filtered.map(user =&gt; &lt;User key={user.id} user={user} /&gt;)
}
</code></pre>
<p>若环境不支持 <code>toSorted</code>，用 <code>[...array].sort(...)</code>。数据很大时再测量并决定 memo、索引、服务端处理或虚拟化。</p>
</div>
</details>

---

# 第六部分：系统与项目场景题

## 110. 如何设计一个前端 RBAC/数据权限系统？

<!-- question: {"category":"architecture","type":"scenario","difficulty":"advanced","tags":["系统设计","RBAC","权限"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">题解框架</h3>
<ol>
<li>定义 subject、resource、action、scope，不把 role 判断散落 UI。</li>
<li>登录后获取能力集合或策略输入，统一 <code>can(action, resource)</code>。</li>
<li>路由、菜单、按钮都消费同一能力层，但服务端始终最终鉴权。</li>
<li>多租户请求绑定 tenant，服务端检查资源归属；前端不可只靠隐藏 tenant id。</li>
<li>权限缓存有版本/过期策略；收到 403 能刷新或安全降级。</li>
<li>用角色 × 资源 × 动作矩阵测试，记录审计事件。</li>
</ol>
<h3 id="section-1">追问</h3>
<p>RBAC 无法表达所有规则时可加入 resource attribute/ownership，演变为 ABAC 或 policy-based 模型；不要无限扩张 role 数量。</p>
</div>
</details>

---

## 111. 多个请求同时返回 401，如何避免重复 refresh？

<!-- question: {"category":"architecture","type":"scenario","difficulty":"advanced","tags":["系统设计","请求"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">题解</h3>
<p>客户端维护单个 in-flight refresh Promise。首个 401 创建 refresh，后续 401 等待同一个 Promise；成功后各自仅重试一次，失败则统一清理 session 并跳登录。必须防止 refresh 请求本身再次进入同一拦截逻辑形成死循环。</p>
<p>还要讨论：请求 body 是否可重放、mutation 幂等性、页面卸载、跨标签页协调、服务端 token rotation。若采用 HttpOnly Cookie，前端可能不直接接触 token，但过期协调问题仍存在。</p>
</div>
</details>

---

## 112. 如何设计大文件分片上传？

<!-- question: {"category":"architecture","type":"scenario","difficulty":"advanced","tags":["系统设计"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">题解框架</h3>
<p>文件选择 → 生成文件标识/协商上传 → 分片 → 并发限制 → 每片校验与重试 → 服务端记录已上传分片 → 断点恢复 → 合并 → 整体校验。</p>
<p>前端重点：</p>
<ul>
<li>不一次把整文件读入额外内存。</li>
<li>控制并发与失败重试，支持 AbortController 暂停/取消。</li>
<li>进度按字节计算，区分上传与服务端合并。</li>
<li>文件 hash 可增量计算并考虑 Worker，但不能只靠 hash 作为权限凭证。</li>
<li>服务端保证分片归属、幂等、过期清理和最终校验。</li>
</ul>
</div>
</details>

---

## 113. 如何设计前端错误处理体系？

<!-- question: {"category":"architecture","type":"scenario","difficulty":"advanced","tags":["系统设计"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">题解框架</h3>
<p>Transport error → HTTP client 标准化 → domain error → query/mutation layer → route/component UI → logging/trace。</p>
<p>错误至少区分 validation、business、authn/authz、network/timeout、rate limit、server、programming error。为每类定义：是否重试、用户提示、是否保留旧数据、日志级别、恢复入口。Error Boundary 不处理所有异步请求错误；toast 也不应成为唯一错误 UI。</p>
</div>
</details>

---

## 114. 如何从零分析一次 React 页面卡顿？

<!-- question: {"category":"architecture","type":"scenario","difficulty":"advanced","tags":["系统设计","React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">题解框架</h3>
<ol>
<li>明确用户操作、数据规模、设备、网络、构建模式。</li>
<li>Performance 找 long task、layout/paint；React Profiler 找昂贵 commit 和组件。</li>
<li>区分 JS 计算、组件 render、DOM 数量、布局绘制、请求瀑布。</li>
<li>提出单一主要假设并修改。</li>
<li>相同条件复测，报告 p50/p95 或多次结果，而不是挑最好一次。</li>
<li>记录复杂度、包体积、内存、可访问性等副作用。</li>
</ol>
</div>
</details>

---

## 115. 如何设计前端项目目录和模块边界？

<!-- question: {"category":"architecture","type":"scenario","difficulty":"advanced","tags":["系统设计","模块"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
<div>
<h3 id="section">题解</h3>
<p>先按变化原因和业务能力分，而不是机械按文件类型。<code>features/project</code> 内聚 API、model、UI；<code>shared</code> 只容纳稳定的跨业务能力；<code>app</code> 负责 providers/bootstrap；routes 负责页面组合。</p>
<p>关键是依赖规则：shared 不依赖 feature；feature 间通过公共契约或上层协调；组件不直接散落 HTTP 调用；领域类型不被某个 UI 组件反向绑定。目录结构没有唯一正确答案，需根据团队规模、发布边界和复用频率调整。</p>
</div>
</details>

---

# 第七部分：模拟面试卷

每套控制在 60–75 分钟。找同伴追问，或录音后按评分表复盘。

## 模拟卷 A：JavaScript 原理轮

### 题目

1. 用调用栈和词法环境解释闭包。
2. 现场判断第 14 题输出，并画 microtask queue。
3. async/await 的错误如何传播？忘记 await 会怎样？
4. 原型链、`prototype`、`instanceof` 的关系。
5. 手写 `Promise.all`。
6. 手写带 cancel 的 debounce。
7. 一个页面反复进入退出后内存上涨，如何证明是泄漏？
8. ESM 循环依赖为什么会出现未初始化访问？

### 时间

- 原理题 30 分钟。
- 手写题 25 分钟。
- 项目关联 10 分钟。

### 通过标准

至少 6 题达到 2 分；Event Loop 和 Promise 实现不能有结论性错误；能主动说出最小验证方式。

---

## 模拟卷 B：React 原理轮

### 题目

1. 从点击按钮到 DOM 更新，完整描述一次 React 更新。
2. 为什么 state 是 snapshot？解释三次 setState。
3. reconciliation 和 key 如何影响输入框 state？
4. Hooks 为什么不能条件调用？
5. Effect 的准确用途是什么？找出一个不需要 Effect 的例子。
6. Strict Mode 为什么重复 setup/cleanup？
7. memo/useMemo/useCallback 的失败案例。
8. Context 大范围更新怎样定位和优化？
9. Transition、deferred value 和 debounce 的区别。
10. SSR hydration mismatch 如何定位？

### 追问压力测试

- render 可以中断，为什么 commit 不可以随意中断？
- `memo` 后 Context 变了会怎样？
- Suspense 是否自动请求数据？
- React Compiler 是否解决所有重渲染？

### 通过标准

能始终区分“组件函数执行”“reconciliation”“DOM commit”；Effect 回答不使用“模拟生命周期”作为唯一解释。

---

## 模拟卷 C：React 实战与排障轮

### 题目

1. Review 第 109 题代码并重构。
2. 实现带竞态保护的搜索组件。
3. 10,000 行列表输入卡顿，现场给诊断步骤。
4. 多请求同时 401 如何协调？
5. 如何划分 URL/client/server state？
6. 设计一个 permission-based RBAC。
7. 给异步表单写三个高价值测试。
8. 线上白屏但本地正常，怎样止损和排查？

### 通过标准

先问复现条件和业务约束，再提出方案；性能题必须先测量；认证/权限题明确服务端是最终安全边界。

---

## 模拟卷 D：中国中后台项目深挖轮

### 题目

1. 介绍项目时只给 3 分钟，你如何组织？
2. 大表格包含筛选、固定列、批量编辑和导出，状态如何划分？
3. 部门、角色、岗位、数据范围组合后，权限如何建模？
4. Excel 导入 5 万行，如何校验、反馈错误并避免页面卡死？
5. 用户手机号如何在展示、日志、埋点和导出中保护？
6. 弱网下提交审批，怎样避免重复提交和状态不确定？
7. React 17 + webpack 老项目迁移，如何评估是否值得？
8. AI 生成任务功能如何处理 streaming、取消、不可信输出和权限？

### 通过标准

回答包含业务约束、前后端边界、失败模式、监控和 trade-off；不把“用了某库”当成结果。

---

# 第八部分：面试官评分表与错题表

## 单题评分模板

```md
## 题目

### 第一次回答

### 结论是否正确（0/1）

### 原理是否完整（0/1）

### 是否说明边界/反例（0/1）

### 是否关联项目或工具证据（0/1）

### 漏掉的追问

### 24 小时后的第二次回答
```

## 项目题评分维度

| 维度 | 不合格 | 合格 | 优秀 |
|---|---|---|---|
| 问题 | 只讲需求 | 讲清问题 | 有规模和证据 |
| 个人贡献 | 一直说“我们” | 说明负责部分 | 说明协作和决策边界 |
| 方案 | 只报技术名 | 说明实现 | 比较候选方案与代价 |
| 结果 | “效果很好” | 有可验证结果 | 有前后指标与复现条件 |
| 风险 | 不提失败 | 有错误处理 | 有监控、降级、回滚 |
| 复盘 | 没有 | 说出不足 | 能提出下一阶段设计 |

---

# 第九部分：官方查证资料

## JavaScript / Browser

- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [MDN JavaScript execution model](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model)
- [MDN Microtask 深入指南](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide/In_depth)
- [ECMAScript Specification](https://tc39.es/ecma262/)
- [MDN HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

## React

- [React Learn](https://react.dev/learn)
- [Render and Commit](https://react.dev/learn/render-and-commit)
- [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot)
- [Queueing State Updates](https://react.dev/learn/queueing-a-series-of-state-updates)
- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [useEffect](https://react.dev/reference/react/useEffect)
- [StrictMode](https://react.dev/reference/react/StrictMode)
- [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
- [React 19.3 Release](https://react.dev/blog/2026/09/09/react-19-3)
- [React Source](https://github.com/facebook/react)

## TypeScript / Testing / Security

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

---

## 最后提醒

题库的用途不是把回答训练成固定台词。真正有说服力的答案始终包含三样东西：

1. 一个准确、简洁的原理模型。
2. 一个自己运行过的最小实验或工具证据。
3. 一个真实项目中的选择、失败或取舍。

当你能把同一个原理连接到 bug、性能、架构和用户体验时，才真正从“会用 API”进入了“有技术深度”。
