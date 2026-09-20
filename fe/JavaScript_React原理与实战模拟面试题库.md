# JavaScript / React 原理与实战模拟面试题库

> 面向 3–4 年 React 前端求职；包含原理题、追问题、代码实战、评分点与模拟面试卷。
>
> 版本背景：2026-09-14，React 19.3。带版本色彩的内容会单独标注；基础原理适用于 React 18/19 及多数存量项目。

---

## 0. 使用方法

不要从第一页开始背答案。每次选择 5 道题：

1. 不看答案，先口述 2–3 分钟。
2. 写最小代码验证自己的判断。
3. 阅读答案后，用"结论 → 原理 → 例子 → 边界/反例 → 项目经验"重新回答。
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

请说明执行上下文、词法环境与调用栈三者的关系，并解释标识符查找的顺序。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

执行上下文是「一次代码执行所需的全部运行信息」的抽象，可以理解为它关联当前代码、词法环境与 `this`；词法环境负责标识符绑定并沿 outer reference 形成作用域链；调用栈则是承载这些上下文的栈式结构。三者不是同一层概念，不要混着说。

### 原理与示例

- **词法环境**由环境记录和 outer reference 组成。环境记录分对象式（`var`、函数声明）与声明式（`let`、`const`、`class`）两类，这也是同一次执行里 `var` 与 `let` 行为不同的原因之一。
- **变量查找顺序**：先查当前环境记录，找不到就沿 outer reference 逐层向外，直到全局环境；仍找不到才抛 `ReferenceError`。
- **作用域链由源码的词法嵌套位置决定**，与函数在哪里被调用无关，这是闭包能读到外层变量的原因。
- **调用栈**只保存当前未返回的调用帧；每个帧持有对应上下文的 `this`、`new.target`、返回位置等信息。

```js
let size = 'global'

function outer() {
  let size = 'outer'
  return () => size // 沿词法环境向外找到 outer 的 size
}

console.log(outer()()) // 'outer'
```

### 边界与易错点

- 「创建阶段/执行阶段」「变量对象（VO）/活动对象（AO）」来自 ES5 之前或教学抽象，用来理解可以，但不要宣称它们是现代规范的内部实现；ES2015+ 之后规范使用 Lexical Environment 与 Environment Record 描述。
- 全局环境在浏览器中还有 `globalThis` 对象记录（`var` 与函数声明会成为其属性，`let`/`const` 不会），这与浏览器 `window` 同名属性可以互相覆盖有关。
- 调用栈溢出抛出的是 `RangeError`，不是 `ReferenceError`，也不要和堆内存不足（`RangeError: Invalid string length` 之类）混为一谈。

### 追问

- 递归太深为什么栈溢出？因为每次未返回的调用都占一个栈帧，深度超过引擎限制即抛错；改写成循环或显式栈可以把空间搬到堆上。
- `this` 和词法环境有什么关系？`this` 由调用方式决定（箭头函数除外，它继承外层），与变量沿作用域链查找是两套独立规则。

</details>

---

## 2. 什么是变量提升？`var`、`let`、`const` 和函数声明有什么区别？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

"提升"是"进入作用域时先建立绑定"这一行为的观察结果，不是引擎真的把源码搬到顶部。`var` 的绑定会被初始化为 `undefined`；`let`/`const` 的绑定在声明语句执行前处于未初始化状态（TDZ），访问会抛 `ReferenceError`。

### 原理与示例

- 环境记录分两类：对象式记录承载 `var` 与函数声明，声明式记录承载 `let`、`const`、`class`，这也是同一作用域内两者行为不同的根源。
- **函数声明**在进入作用域时即完成绑定初始化，所以声明前可调用；**函数表达式**本质是赋值，声明前是 `undefined` 或 TDZ。
- `const` 限制的是绑定不可重新赋值，对象内容仍然可变。
- `class` 与 `let` 一样存在 TDZ，`new C()` 写在类声明之前会抛错。

```js
console.log(a) // undefined
var a = 1

console.log(b) // ReferenceError: Cannot access 'b' before initialization
let b = 2

sayHi() // OK：函数声明已初始化
function sayHi() {}
```

### 边界与易错点

- `typeof undeclaredVar` 返回 `'undefined'` 不抛错；但 `typeof tdzVar` 会抛 `ReferenceError`，因为绑定已存在、只是尚未初始化。这两个"undefined"含义不同。
- 同一作用域内 `let` 与 `var` 重复声明同名变量是语法阶段的 `SyntaxError`（整段脚本都不执行），而重复 `var` 声明只是静默覆盖。
- 块级函数声明（`if (x) { function f() {} }`）在严格模式和历史 sloppy 模式、不同引擎中行为不一致，现代代码不要依赖这种边界。
- 顶层 `var` 与函数声明会成为 `globalThis` 的属性，`let`/`const` 不会。

### 追问

- **为什么要引入 TDZ？** 把"声明前使用"从静默拿到 `undefined` 变成显式报错，配合 `const` 帮助尽早暴露逻辑错误。
- **`for (let i...)` 为什么每轮都有独立的 `i`？** 规范为每次迭代创建新的环境记录并复制上一轮的值，因此闭包捕获到的是每一轮各自的绑定。

</details>

---

## 3. 闭包到底保存了什么？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript","闭包"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

闭包是函数与其创建时可访问的词法环境的组合。它保存的是**绑定本身**，不是值的快照；只要闭包仍可达，它引用的环境记录就不会被回收。

### 原理与示例

```js
function createCounter() {
  let count = 0
  return () => ++count
}

const a = createCounter()
const b = createCounter()
a() // 1
a() // 2
b() // 1
```

`a` 与 `b` 分别关联两次调用产生的不同环境记录，因此各有一份 `count`。同一环境被多个闭包共享时，它们看到的是同一个绑定：

```js
function pair() {
  let n = 0
  return [() => ++n, () => n]
}
const [inc, read] = pair()
inc()
read() // 1：两个闭包共享同一个 n
```

### 边界与易错点

- 闭包本身不是内存泄漏。只有当闭包长期可达，且不必要地引用大对象、DOM 节点、监听器或缓存时，相关对象才无法回收。
- 真实泄漏多半来自生命周期管理失误：定时器/监听器未清理、被闭包捕获的 DOM 引用、只增不减的全局缓存。定位靠 Memory 面板做前后 heap snapshot 对比，而不是凭感觉断言。
- 引擎会对闭包做逃逸分析，可能只保留被实际引用的绑定，但这是实现细节，不能作为正确性依赖。
- `for (var i = ...)` 共享函数级绑定，`for (let i = ...)` 每次迭代新建绑定，这是异步回调里"都打印同一个值"的根因。

### 追问

- **回调读到的变量为什么不对？** 通常是与外层共享了同一个绑定；用 `let` 或把当前值作为参数传入即可隔离。
- **闭包与 `this` 有关吗？** 无关。`this` 由调用方式在运行时决定，只有箭头函数例外（它不捕获 `this`，也不拥有自己的 `this`）。

</details>

---

## 4. `this` 的值如何确定？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

普通函数的 `this` 由**调用方式**在运行时决定，不由定义位置决定。判定优先级从高到低：`new` 调用 → 显式 `call`/`apply`/`bind` → 方法调用（`.` 或 `[]` 左侧的对象）→ 默认绑定。

### 原理与示例

- 默认绑定：严格模式下 `this` 是 `undefined`，非严格模式是全局对象。
- `bind` 返回绑定后的新函数，绑定结果不能再被 `call`/`apply` 覆盖。
- 箭头函数没有自己的 `this`（也没有 `arguments`、`new.target`），它沿用定义时外层函数的 `this`，因此不能作为构造函数。
- 类体默认严格模式；类字段中的箭头函数会捕获创建时实例的 `this`。

```js
const user = {
  name: 'A',
  normal() { return this.name },
  arrow: () => this?.name,
}

user.normal() // 'A'：调用点是 user
const detached = user.normal
detached() // undefined 或报错：丢失了接收者
user.arrow() // 取决于定义位置的外层 this，与 user 无关
```

### 边界与易错点

- 把方法当回调传递必然丢接收者（`setTimeout(user.normal, 0)`、`arr.map(user.normal)`），需要用 `bind` 或箭头函数包装。
- 事件监听器里的 `this` 是 `currentTarget`（普通函数），而 `event.target` 是实际触发元素；箭头函数拿不到 `this`，但可以用 `event.currentTarget`。
- 非严格模式与严格模式的默认绑定不同，而 ESM、类体、`"use strict"` 都是严格模式，所以不要再按"`this` 默认是 window"背结论。
- `new (obj.fn)()` 走 `new` 规则，`this` 是新建实例而不是 `obj`。

### 追问

- **怎样在回调里保住 `this`？** 首选箭头函数或显式 `bind`；避免用 `const self = this` 这类遗留写法。
- **箭头函数适合当对象方法吗？** 一般不适合，它拿不到调用者对象；适合用在需要固定外层 `this` 的回调里。

</details>

---

## 5. `new Foo()` 做了什么？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

`new Foo()` 的核心是四步：创建新对象 → 把新对象的 `[[Prototype]]` 指向 `Foo.prototype` → 以新对象为 `this` 执行 `Foo` → 若构造函数返回对象类型的值就采用它，否则返回新对象。

### 原理与示例

```js
function myNew(Ctor, ...args) {
  if (typeof Ctor !== 'function') throw new TypeError('Ctor is not a constructor')
  const instance = Object.create(Ctor.prototype ?? Object.prototype)
  const result = Ctor.apply(instance, args)
  return result !== null && (typeof result === 'object' || typeof result === 'function')
    ? result
    : instance
}
```

这段只是教学近似：真实语义还包含 `new.target` 的传递、类只能通过 `[[Construct]]` 调用、内置构造函数依赖 `new.target` 区分调用方式等。

### 边界与易错点

- 构造函数返回**原始值**（`return 1`）或 `null` 时会被忽略，仍然返回新对象；只有对象/函数类型的返回值才生效。
- 箭头函数没有 `[[Construct]]`，不能用 `new`；类构造函数不加 `new` 调用会抛 `TypeError`。
- `Foo.prototype` 不是对象时（如被赋值为 `1`），`new` 会退化为使用 `Object.prototype` 作为原型，这是规范行为但属于糟糕写法。
- 近似实现不能替代 `Reflect.construct`：类构造函数无法用 `apply` 调用，派生类的 `new.target` 语义也无法还原。
- 判断构造来源用 `new.target`，不要用 `this instanceof Foo`，后者在派生类中会误判。

### 追问

- **`new.target` 有什么用？** 区分"直接调用"与"`new` 调用"，实现抽象基类检查，或在派生类中把真正的构造目标继续传给父类。
- **`instanceof` 能替代类型判断吗？** 不能完全替代：它依赖原型链，跨 realm（iframe、worker 反序列化）会失效，也可能被 `Symbol.hasInstance` 改写。

</details>

---

## 6. 原型链如何工作？`prototype` 与 `__proto__` 有什么区别？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript","原型链"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

每个对象都有内部槽 `[[Prototype]]` 指向它的原型对象，属性读取沿这条链逐层向上直到 `null`。`prototype` 与 `[[Prototype]]` 是两个不同层次的东西：前者是**函数对象上的普通属性**，在 `new` 时被用作新实例的原型；后者是**对象自身的原型链接**，`__proto__` 只是访问它的历史遗留访问器。

### 原理与示例

```js
function User() {}
const u = new User()

Object.getPrototypeOf(u) === User.prototype // true
Object.getPrototypeOf(User.prototype) === Object.prototype // true
User.prototype.__proto__ === Object.prototype // true，与上一行是同一件事
Object.getPrototypeOf(Object.prototype) // null，链条终点
```

- **读取** `obj.x`：先查自身属性，再沿 `[[Prototype]]` 向上；沿链上访问到的 getter 会被执行。
- **写入** `obj.x = v`：通常创建/修改**自身**属性；如果链上存在同名 setter，会调用该 setter 而不创建自身属性；如果自身是不可写数据属性，严格模式抛 `TypeError`。

### 边界与易错点

- 不要用 `__proto__` 做业务代码的读写：它只是 `Object.prototype` 上的访问器，`Object.create(null)` 出来的对象根本没有它。应使用 `Object.getPrototypeOf` / `Object.setPrototypeOf` / `Object.create`。
- `Object.setPrototypeOf` 会破坏引擎对对象形状的优化，能通过 `Object.create` 确定原型的就不要事后改原型。
- `instanceof` 检查"构造函数的**当前** `prototype` 是否在对象原型链上"，因此替换 `Fn.prototype` 后旧实例会失效，跨 realm 也会失效。
- 遍历语义要区分：`for...in` 会枚举原型链上的可枚举属性，`Object.keys` 只看自身可枚举字符串键，`Reflect.ownKeys` 返回自身全部键（含 symbol）。

### 追问

- **`Object.create(null)` 有什么实际用途？** 创建无原型对象当纯字典，避免 `__proto__`、`constructor` 这类键造成原型污染，也避免误继承内置方法。
- **为什么推荐 `Object.hasOwn(obj, key)`？** 对象自身可能覆盖 `hasOwnProperty`，无原型对象上则不存在该方法；`Object.hasOwn` 是静态方法，不受这两点影响。

</details>

---

## 7. JavaScript `class` 是不是传统面向对象语言里的类？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

不是另一种运行机制：`class` 建立在原型继承之上，属于语法糖。但它带有一批独立的语言语义，因此也不能简单说"就是函数加 `prototype`"。

### 原理与示例

```js
class User {
  method() {}      // 定义在 User.prototype 上，不可枚举，各实例共享
  field = () => {} // 每个实例自身的属性，每次构造都新建一个函数
}
```

与手写构造函数 + `prototype` 的差异：

- 类声明存在 TDZ，不像函数声明那样声明前可用。
- 类体整体运行在严格模式。
- 原型方法默认 `enumerable: false`，手写挂载默认是可枚举的。
- 必须用 `new` 调用，内部走 `[[Construct]]`。
- 支持 `super`、私有字段 `#x`、静态块、`get`/`set`、以及 `extends` 内置类型（如 `Array`、`Error`）。

### 边界与易错点

- 字段初始化时机：必须先 `super()` 才能访问 `this`，而父类构造函数体内如果调用被子类字段"覆盖"的方法，会读到字段尚未初始化的状态。
- 类字段用箭头函数会为每个实例复制一个函数，内存上不如原型方法，但能自动绑定 `this`；按使用场景取舍，不要无脑统一。
- 私有字段 `#x` 是语法层面的真私有（外部无法访问、不能通过 `Reflect.get` 读取），与 `_x` 这种命名约定完全不同。
- `typeof MyClass` 在类声明之前会抛错（TDZ），不能靠 `typeof` 做"未定义"探测。

### 追问

- **子类不写 constructor 会怎样？** 等价于 `constructor(...args) { super(...args) }`，由默认派生构造完成。
- **`super` 的两种用法？** `super(...)` 调用父类构造函数；`super.method()` 在父类原型上查找方法，但 `this` 仍是当前实例。

</details>

---

## 8. 属性描述符有什么用？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

属性描述符精确控制一个属性的读、写、枚举与重定义能力。数据属性用 `value/writable/enumerable/configurable`，访问器属性用 `get/set/enumerable/configurable`，两类互斥，不能混写。

### 原理与示例

```js
const obj = {}
Object.defineProperty(obj, 'id', {
  value: 1,
  writable: false,
  enumerable: false,
  configurable: false,
})

obj.id = 2       // 非严格模式静默失败，严格模式抛 TypeError
Object.keys(obj) // []：不可枚举，不参与遍历与展开
delete obj.id    // 非严格模式静默失败，严格模式抛 TypeError
```

- `Object.defineProperty` 未显式给出的标志**默认为 `false`**；而对象字面量创建属性时四个标志默认都是 `true`。这是最容易踩的差异。
- `Object.freeze` 置为不可写且不可配置，`Object.seal` 只禁止增删、允许改值；两者都是**浅层**。
- 键的枚举层次：`Object.keys`（自身可枚举字符串键）⊂ `Object.getOwnPropertyNames`（自身字符串键）⊂ `Reflect.ownKeys`（再加 symbol 键）。

### 边界与易错点

- `writable: false` 不等于值不可变：如果值是对象，其内部属性仍可修改。真正的不可变需要递归冻结或使用不可变数据结构。
- `configurable: false` 无法恢复为 `true`；此时不能把数据属性改成访问器属性（反之亦然），只能修改 `value`（且 `writable` 为 `true` 时）。
- 展开与 `Object.assign` 只复制自身可枚举属性，会触发 getter、丢弃描述符与原型，且都是浅拷贝。
- `Object.freeze` 不会冻结 `Map`/`Set` 的内部内容，也不能阻止通过其他引用修改嵌套对象。

### 追问

- **`enumerable: false` 有什么用？** 让属性不参与遍历/展开（内置原型方法就是如此），也可用于隐藏内部状态。
- **响应式系统为什么关心描述符？** Vue 2 用 `Object.defineProperty` 递归改写 getter/setter 来收集依赖，因此无法侦测新增属性和数组下标赋值，需要 `Vue.set` 兜底；Vue 3 改用 `Proxy` 拦截整个对象来解决。

</details>

---

## 9. JavaScript 的值类型与引用语义应该怎样准确表述？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

JavaScript 的参数传递**始终是按值传递**。差异来自值本身是什么：原始值复制的是值本身；对象复制的是"指向该对象的引用"这个值，因此两个变量指向同一个对象。

### 原理与示例

```js
function mutate(x) { x.name = 'B' }
function replace(x) { x = { name: 'C' } }

const user = { name: 'A' }
mutate(user)  // user.name === 'B'：通过引用改到同一个对象
replace(user) // user 仍是 { name: 'B' }：给形参重新赋值不影响调用方
```

- 变量是绑定，保存的要么是原始值，要么是对象引用。
- `const` 约束的是绑定不能重新赋值，不约束对象内部状态的变化。

### 边界与易错点

- 不要说"对象是引用传递"。引用传递（如 C++ 的 `&`）意味着给形参赋值会改变调用方变量，JS 做不到——这正是 `replace(user)` 无效的原因。
- "原始值 vs 引用值"是常见简化说法；更准确的表述是"值本身是否为对象"，`typeof`/装箱等细节会带来偏差。
- 比较对象用 `===` 比较的是引用身份，不是内容；`Object.is` 的差异只在 `NaN` 与 `-0`。
- 字符串等原始值不可变，任何"修改"都是产生新值再重新绑定。

### 追问

- **为什么 `const` 声明的数组还能 `push`？** 绑定没变，变的是对象内部状态。
- **怎样避免共享引用带来的副作用？** 在边界处复制（浅/深拷贝，见第 12 题），或按不可变更新约定只替换变化路径。

</details>

---

## 10. `==`、`===` 与 `Object.is` 有什么差异？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

三者的差异集中在两点：是否做类型转换、如何处理 `NaN` 与 `-0`。`===` 不做类型转换，但 `NaN !== NaN` 且 `0 === -0`；`Object.is` 使用 SameValue 语义，`NaN` 等于自身、`0` 与 `-0` 不相等；`==` 会走抽象相等比较并按规则转换类型。

### 原理与示例

```js
0 === -0            // true
Object.is(0, -0)    // false
NaN === NaN         // false
Object.is(NaN, NaN) // true

null == undefined   // true
'' == 0             // true
'1' == 1            // true
[] == false         // true
```

`==` 的判定顺序：同类型直接比较；`null` 与 `undefined` 互相相等且不等于其他值；数字与字符串比较时转数字；布尔先转数字；对象与原始值比较时先用 `ToPrimitive` 转换对象。

### 边界与易错点

- `Object.is` 与 `===` **只在 `NaN` 和 `-0` 上有差异**，不要以为它是全面更严格的比较。它的语义是把 `NaN` 视为相等，因此常被用于"值是否相同"的判断。
- React 在 `useState` 的更新 bailout、`useEffect`/`useMemo` 的依赖比较中采用 `Object.is` 语义。这解释了：写入 `NaN` 不会被视为变化，而 `0` 与 `-0` 会被视为不同值。
- `x == null` 是少数被团队普遍接受的简写（同时匹配 `null` 和 `undefined`），其他场景优先 `===`，并用 lint 的 `eqeqeq` 规则约束。
- `==` 与 `<`、`>` 的转换规则并不完全一致，不要用同一套直觉推断。

### 追问

- **为什么 `[] == false` 为 true？** 布尔先转数字得到 `0`，`[]` 经 `ToPrimitive` 得到 `""` 再转成 `0`，于是相等。
- **什么时候必须用 `Object.is`？** 需要把 `NaN`/`-0` 纳入值语义比较时（如自定义缓存键、实现快照比较），或与框架的相等判断保持一致时。

</details>

---

## 11. 隐式类型转换最容易错在哪里？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

对象转原始值走 `ToPrimitive`：优先调用 `Symbol.toPrimitive`，否则按 hint（`number`、`string`、`default`）依次尝试 `valueOf` 和 `toString`。`+` 同时承担数字加法与字符串拼接，`-`、`*`、`>` 等则强制转数字，因此出错几乎都源自"没意识到发生了转换"。

### 原理与示例

```js
1 + '2'        // '12'：有字符串就是拼接
'5' - 2        // 3：算术运算强制转数字
[] + []        // ''
[] + {}        // '[object Object]'
Boolean('0')   // true：非空字符串是真
Number('')     // 0
Number(' 12 ') // 12
parseInt('12px') // 12：忽略尾部垃圾
Number('12px')   // NaN
```

### 边界与易错点

- 关系运算遇到字符串会按字典序比较：`'10' < '9'` 为 `true`，这是"数值比较"最常见的踩坑点。
- `Number('')`、`Number(' ')`、`Number(null)` 都是 `0`，但 `Number(undefined)` 是 `NaN`；`parseInt` 需要显式传 radix，虽然 ES5 后 `'08'` 不再按八进制解析。
- 浮点精度：`0.1 + 0.2 !== 0.3`；金额应按最小单位用整数或 `BigInt` 处理（见第 97 题）。
- `BigInt` 不能与 `Number` 隐式混算（`1n + 1` 抛 `TypeError`），`JSON.stringify` 遇到 `BigInt` 也会抛错。
- 面试重点不是背怪题结论，而是能说清转换路径；工程上应在输入边界显式解析并校验（`Number.isNaN`、`Number.isInteger`）。

### 追问

- **`[] == ![]` 为什么为 true？** `![]` 先得到 `false`，再走 `==`：一侧转数字 0，另一侧 `[]` 先 `ToPrimitive` 成 `""` 再转 0。
- **怎样系统性减少这类问题？** 统一用 `===`、开启 TypeScript `strict`、输入边界做显式解析与校验、用 lint 规则约束。

</details>

---

## 12. 浅拷贝、深拷贝与结构化克隆有什么区别？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

浅拷贝只复制第一层，嵌套对象仍与源共享引用；深拷贝递归复制整棵对象图；`structuredClone` 是平台提供的结构化克隆算法，支持循环引用和多数内置类型，但不支持函数、DOM 节点与原型语义。

### 原理与示例

```js
const shallow = { ...source }           // 一层；getter 会被求值，描述符与原型不保留
const cloned = structuredClone(source)  // 支持循环引用、Map/Set/Date/ArrayBuffer

function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value
  if (seen.has(value)) return seen.get(value) // 关键：显式处理循环引用
  const copy = Array.isArray(value) ? [] : {}
  seen.set(value, copy)
  for (const key of Reflect.ownKeys(value)) copy[key] = deepClone(value[key], seen)
  return copy
}
```

### 边界与易错点

- `JSON.parse(JSON.stringify(x))` **不是**可靠深拷贝：丢失 `undefined`、函数、symbol，`Date` 变字符串，`Map`/`Set` 变 `{}`，`BigInt` 抛错，循环引用抛错，`NaN`/`Infinity` 变 `null`。
- `structuredClone` 不能克隆函数、DOM 节点、`Proxy`；类实例会丢失原型变成普通对象，`getter`/`setter` 会被求值成普通属性。`ArrayBuffer` 可通过 `transfer` 转移所有权而非复制。
- 浅拷贝手段（展开、`Object.assign`、`slice`、`concat`）都只处理第一层，且不复制描述符与原型。
- React 场景中整体深拷贝通常是坏味道：既昂贵又会切断引用比较带来的性能收益，正确做法是只复制变化路径。

### 追问

- **`structuredClone` 为什么能处理循环引用？** 内部维护已访问对象的映射（与上面 `WeakMap` 的思路一致）。
- **什么时候真的需要深拷贝？** 跨边界传递会被外部修改的数据、需要独立快照、或必须切断引用共享时；其余情况优先不可变更新。

</details>

---

## 13. 浏览器 Event Loop 如何运行？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript","Event Loop"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

事件循环按轮推进：每轮取出一个宏任务执行完 → 清空微任务队列 → 浏览器在合适时机更新渲染 → 进入下一轮。宏任务包括定时器回调、用户事件、网络回调、`MessageChannel` 等；微任务包括 Promise reaction、`queueMicrotask`、`MutationObserver`。

### 原理与示例

- **微任务在当前宏任务结束后、渲染之前全部清空**，这是 Promise 回调总比 `setTimeout` 先执行的原因。
- `setTimeout(fn, 0)` 只保证"不早于阈值"：主线程被占用、后台标签页节流、嵌套超过 5 层后浏览器最小 4ms 延迟都会让它更晚。
- `requestAnimationFrame` 回调在下一帧渲染前执行，属于渲染步骤，不是普通宏任务；`requestIdleCallback` 只在空闲时段运行。
- 一次宏任务只取一个：长同步代码会阻塞渲染与输入响应。

```js
console.log('sync')
setTimeout(() => console.log('macro'), 0)
Promise.resolve().then(() => console.log('micro'))
// sync → micro → macro
```

### 边界与易错点

- 微任务里持续追加微任务会**饿死**渲染与后续宏任务（`while (true) await tick()` 会卡死页面）。
- 规范只规定"浏览器在合适时机渲染"，不保证每轮都渲染，也不保证每帧与宏任务一一对应。
- Node.js 的事件循环有独立阶段划分（timers、poll、check 等），不要用浏览器的顺序表解释 Node 行为。
- 微任务结束后立刻读取布局会强制同步布局，把读写混在一起会造成 layout thrashing。

### 追问

- **为什么 `setTimeout(fn, 0)` 有时明显延迟？** 主线程被长任务占用、页面处于后台被节流，或嵌套层级触发最小延迟。
- **微任务适合做什么？** 需要在"本轮同步代码全部结束、渲染之前"完成的一致性收尾，例如框架的批量更新，Vue 的 `nextTick` 就是这一思路。

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

输出 `A G C F D E B`。

### 原理与示例

按阶段推导，而不是靠直觉：

1. **同步阶段**：打印 `A`；注册宏任务（B）；`Promise.resolve().then(C)` 把 C 的反应入队；`queueMicrotask(F)` 把 F 入队；打印 `G`。
2. 此刻微任务队列为 `[C, F]`。
3. 执行 C：打印 `C`，并在回调里把 D 入队；C 的回调返回后，前一个 promise 落定，`.then(E)` 的反应才入队。队列变为 `[F, D, E]`。
4. 依次执行 F、D、E，打印 `F D E`。微任务队列清空。
5. 进入下一个宏任务，执行定时器回调，打印 `B`。

关键顺序点：E 要等 C 所在的 reaction 完成后由派生 promise 落定才入队，因此排在 D 之后，而不是紧随 C。

### 边界与易错点

- `then` 的回调总是异步执行，不存在"同步 then"。
- 这道题背顺序没有意义：把 `queueMicrotask` 换成 `setTimeout(…, 0)`、把链改成 `await`、或加上 `Promise.all`，结果都会变，必须能重新推导。
- `setTimeout` 的最小延迟与后台节流会让 B 更晚，但不改变其他元素的相对顺序。

### 追问

- **为什么 D 一定在 E 之前？** D 是在 C 回调里主动入队的；E 的入队时机是 C 所在 reaction 结束后。
- **如果第一个 then 里抛错会怎样？** E 被跳过，错误沿链穿透到下一个 catch 或全局 `unhandledrejection`。

### 评分点

不仅说出顺序，还能画出每一步的队列变化，并能口述"哪个操作导致哪个 reaction 入队"。

</details>

---

## 15. async/await 的本质是什么？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

`async` 函数的返回值总是 Promise（普通值被包装为 fulfilled，抛错变成 rejected）；`await` 把其后的代码变成"等 Promise settle 后由微任务恢复"的 continuation，因此不会阻塞线程。

### 原理与示例

```js
async function run() {
  console.log(1)
  await 0
  console.log(2)
}

console.log(3)
run()
console.log(4)
// 3 1 4 2
```

- 即使 `await` 的是非 Promise 值，后续代码也**不会**在当前同步执行栈里继续，而是被安排到微任务队列。
- `await p` 近似等于先对 `p` 做 `Promise.resolve(p)` 再 `then`，因此 thenable 会被展开，非 thenable 也会产生一次异步跳转。
- `async` 函数里 `throw` 等价于返回 rejected Promise，`return value` 等价于 resolve。

### 边界与易错点

- `try/catch` 能捕获 `await` 到的 rejection，但捕获不到"忘记 await 的 Promise"和回调内部抛出的错误——这类错误会变成 `unhandledrejection`。
- 循环里逐次 `await` 是**串行**等待、耗时叠加；要并发应先 `Promise.all(tasks.map(...))` 再统一等待。
- `return await promise` 与 `return promise` 语义不同：前者多一次微任务跳转，且能被本函数的 `try/catch`/`finally` 捕获；后者直接返回，外层才能接住错误。性能差异可忽略，关键是清楚错误归属。
- async 函数被调用时函数体**立即同步执行**到第一个 `await`，不是等到被 await 才启动。

### 追问

- **`await` 会阻塞主线程吗？** 不会，它只挂起当前函数并把控制权交回事件循环；但 `await` 右侧的表达式本身是同步求值的。
- **多个 `await` 为什么变慢？** 串行等待把延迟相加；只要能并发，就应先发起再统一等待。

</details>

---

## 16. Promise 链的值与错误如何传播？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript","Promise"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

`then`、`catch`、`finally` 每次都返回**新的 Promise**，新 Promise 的状态由回调的返回值或抛错决定；没有对应处理器的状态会沿链向后穿透。

### 原理与示例

- 回调返回普通值 → 新 Promise fulfilled 为该值。
- 回调返回 Promise 或 thenable → 新 Promise 采用它的最终状态（会等待）。
- 回调抛错 → 新 Promise rejected。
- 缺少对应 handler → 状态与原因直接穿透到下一个匹配的处理器。
- `finally` 不改变原值与原拒绝原因，但它在抛错或返回 rejected Promise 时**会覆盖**原结果。

```js
Promise.resolve(1)
  .then(x => x + 1)
  .then(() => { throw new Error('x') })
  .catch(() => 10)
  .finally(() => 20) // 返回的 20 被忽略，finally 不改变结果
  .then(console.log) // 10
```

### 边界与易错点

- `.catch()` 之后链条恢复为 fulfilled，错误不再往下传播；只想记日志时必须重新 `throw`，否则调用方以为成功。
- 在 `then` 里忘记 `return` 会产生"火忘"式并发，错误逃出当前链，变成 `unhandledrejection`。
- `finally` 里做异步清理必须 `return`，否则链不会等待清理完成。
- `.catch` 也属于 handler，它里面再抛错会让新 Promise 变成 rejected；`catch` 不是"错误终点"。

### 追问

- **`Promise.reject(e).then(fn)` 会执行 fn 吗？** 不会，缺少 onRejected 时直接穿透到下一个 catch 或全局兜底。
- **怎么保证错误一定能被观测？** 每条异步链路都要有归属：能处理的就地处理，不能处理的补上下文后抛出，并在应用边界统一上报。

</details>

---

## 17. `Promise.all/allSettled/race/any` 如何选择？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript","Promise"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

按"需要什么结果语义"来选：结果缺一不可用 `all`，需要逐项成败全量汇总用 `allSettled`，只关心最快结束用 `race`，只关心第一个成功用 `any`。四者都**不会取消**其余任务。

### 原理与示例

- `all`：全部 fulfilled 才 fulfilled；任一 rejected 立即 rejected（其余任务仍在跑，结果被丢弃）。
- `allSettled`：等全部 settled，返回 `{ status, value | reason }` 数组，永不 reject。
- `race`：第一个 settled 决定结果，成功或失败都可能赢，常用于超时竞争。
- `any`：第一个 fulfilled 即成功；全部 rejected 时以 `AggregateError` 拒绝。

```js
const results = await Promise.allSettled(urls.map(fetchJson))
const ok = results.filter(r => r.status === 'fulfilled').map(r => r.value)
```

### 边界与易错点

- 空数组的边界：`all`/`allSettled` 立即 fulfilled 为 `[]`，`race` 永远 pending，`any` 立即以 `AggregateError` 拒绝。
- 忽略结果不等于取消：真正释放连接需要 `AbortController`（或 `AbortSignal.timeout`），否则请求继续占用带宽与后端资源。
- `all` 快速失败后，其它请求的结果无人处理，容易出现"接口成功但状态没更新"的困惑。
- 手写实现必须**按输入顺序**写回结果（用索引赋值），不能 `push`，否则顺序会随完成时间变化。

### 追问

- **超时该用 `race` 还是 `AbortSignal.timeout`？** 优先 abort：`race` 只是忽略结果，不释放底层资源。
- **`AggregateError` 怎么取失败原因？** 遍历 `error.errors`；用 `all` 则拿不到全部失败，需要改用 `allSettled` 自行聚合。

</details>

---

## 18. 并发与并行有什么区别？JavaScript 是单线程吗？

<!-- question: {"category":"javascript","type":"theory","difficulty":"advanced","tags":["JavaScript","并发"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

并发指多个任务在时间上交错推进（可以只有一个执行单元）；并行指多个任务在同一时刻、不同执行单元上真正同时运行。JavaScript 的**执行模型是单线程**：同一时刻只有一段 JS 在某个调用栈上执行；但宿主环境（浏览器、Node）本身是多线程多进程的。

### 原理与示例

- 网络请求、HTML 解析、样式计算、栅格化、GC 等由浏览器其他线程/进程完成，通过事件循环把结果交回主线程执行回调。
- `Web Worker`/`Service Worker` 提供独立的 JS 执行线程，通过 `postMessage` 与结构化克隆通信，默认不共享内存；`SharedArrayBuffer` + `Atomics` 才共享内存。
- Node 侧对应 `worker_threads` 与 `cluster`。

```js
// 看起来"异步"，但仍然是同步的 CPU 占用，会阻塞主线程
await new Promise(resolve => setTimeout(resolve, 0))
heavyLoop()
```

### 边界与易错点

- 把大循环包进 `Promise` 或 `setTimeout` **不会**让计算并行，只是把它推到下一轮宏任务，依旧阻塞。
- Promise 的"并发"指同时发起、等待结果，与多线程并行无关。
- 时间切片（周期性让出事件循环）改善的是响应性，总耗时不变；要真正减少耗时必须优化算法、用 Worker 或挪到服务端。
- 渲染与 JS 共享主线程，长任务会直接恶化 INP 与动画流畅度。

### 追问

- **什么时候值得用 Worker？** CPU 密集、数据可序列化、不需要频繁访问 DOM 时；同时要把拷贝与通信成本算进收益。
- **`SharedArrayBuffer` 为什么需要跨源隔离？** 它允许真正共享内存，需要 COOP/COEP 响应头来降低 Spectre 类侧信道风险。

</details>

---

## 19. Iterator 与 Generator 解决什么问题？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

Iterator 是"逐步取值"的统一协议；Generator 提供了创建可暂停函数并自动实现该协议的语法，用来表达惰性序列、状态机与自定义遍历行为。

### 原理与示例

- **Iterator 协议**：对象有 `next()`，返回 `{ value, done }`。
- **Iterable 协议**：对象有 `[Symbol.iterator]()` 方法返回 iterator；`for...of`、展开、解构、`Promise.all`、`yield*` 都在消费 iterable。
- Generator 函数执行到 `yield` 暂停，`next(value)` 可把值送回函数，`return()`/`throw()` 可提前结束或注入错误。

```js
function* range(start, end) {
  for (let i = start; i < end; i++) yield i
}

[...range(1, 4)] // [1, 2, 3]
```

配合 `yield*` 委托给另一个 iterable，配合异步生成器 + `for await...of` 处理流式数据。

### 边界与易错点

- 数组的 `map`/`filter` 不消费迭代器协议；自定义 iterable 需要先转换，或自己实现惰性版本。
- 迭代器是**一次性**的：取完后 `done` 恒为 true，再次 `for...of` 必须重新获取 iterator。
- 惰性求值会让副作用执行时机变得不直观（generator 函数体内的副作用只在取值时发生）；调用生成器函数本身不会执行函数体，但参数会立即求值。
- 生成器不是异步的：它只提供暂停/恢复，异步能力要靠 async generator 或自行组合 Promise。

### 追问

- **普通对象为什么不能用 `for...of`？** 它默认不是 iterable，需要 `Object.entries()`/`Object.keys()` 或自己实现 `[Symbol.iterator]`。
- **异步生成器有什么用？** 分页流式取数、逐块处理流式响应，比一次性 `Promise.all` 更适合数据量大的场景。

</details>

---

## 20. Map、Set、WeakMap、WeakSet 如何选择？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

`Map`/`Set` 是强引用的键值集合与唯一值集合，可枚举、可遍历、有 `size`；`WeakMap`/`WeakSet` 弱持有**对象或非注册 symbol** 作为键，不可枚举，适合给对象挂元数据或做与对象生命周期绑定的缓存。

### 原理与示例

- `Map` 的键可以是任意值，对象键按身份比较，保留插入顺序，键不会被字符串化——这与对象字面量有本质区别。
- `Set` 保存唯一值，`NaN` 视为相等，`0` 与 `-0` 视为同一值。
- `WeakMap` 的键必须是可被弱引用的值（普通对象、函数、非注册 symbol）；不能是原始值，也不能是 `Symbol.for()` 注册的 symbol。
- 不可枚举是刻意设计：暴露遍历就会暴露 GC 时机，而 GC 是非确定的。

```js
const meta = new WeakMap()
function track(el) {
  meta.set(el, { clicks: 0 }) // el 被回收后，这条记录也自动消失
}
```

### 边界与易错点

- `WeakMap` **不是"永不泄漏"**：value 可以强引用大对象，key 在别处强可达时也不会被回收，且完全没有容量控制。
- 无法遍历 `WeakMap`/`WeakSet`，因此不能实现"清空"或 LRU 淘汰——需要容量控制时用 `Map` 加显式淘汰规则。
- `Map`/`Set` 是强引用，拿它当缓存就必须自己管容量与 TTL，否则就是泄漏源。
- 序列化差异：`JSON.stringify(new Map())` 得到 `{}`，需要手动 `[...map]`；`structuredClone` 可以克隆 `Map`/`Set`。

### 追问

- **什么时候用 `Map` 而不是普通对象？** 键类型不限、需要 `.size`、增删频繁、需要稳定插入顺序，或要避开原型链键名冲突时。
- **`WeakRef`/`FinalizationRegistry` 能当缓存用吗？** 不能依赖：回收与回调时机都不确定，只能作为可选优化，不能承载正确性。

</details>

---

## 21. 常见前端内存泄漏来源和排查方法是什么？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

泄漏的本质是：本该被回收的对象**仍然被强引用可达**。前端最常见的两类成因是生命周期没有收尾，以及只增不减的缓存。

### 原理与示例

常见来源：

- 未卸载的全局监听（`window`/`document`）、未清理的定时器与 `requestAnimationFrame`。
- `ResizeObserver`/`IntersectionObserver`/`MutationObserver` 未 `disconnect()`。
- 事件总线、全局 store、WebSocket 的订阅未取消。
- 只增不减的 `Map`/数组缓存、没有容量上限的 memo。
- 闭包捕获大对象、detached DOM 仍被 JS 引用。
- 未 abort 的请求回调持有组件状态（配合竞态处理，见第 43 题）。

排查闭环：

1. 定义可重复操作，例如"进入/退出页面 20 次"。
2. 用 Performance Monitor 观察 JS heap、DOM node、listener 数的趋势。
3. 采集两到三次 heap snapshot，用 Comparison 视图看 retained size 的增量。
4. 从 Retaining path 反查强引用链，定位真正的持有者。
5. 修掉 cleanup 或补上淘汰策略，用同一流程复测确认基线回落。

### 边界与易错点

- 内存短暂上涨**不能**直接判定泄漏：GC 时机不确定，判据应是"重复同一操作后基线不回落"。
- `detached` 节点持续增长是强信号，但节点只有仍被 JS 引用时才会 detached 后继续存活。
- 开发模式下的 HMR、Strict Mode 双执行、浏览器扩展都会造成噪声，尽量在生产构建下测量。
- 只修症状（例如手动清空缓存）而不切断持有链，问题通常会换一种形式回来。

### 追问

- **怎么区分泄漏和正常缓存？** 缓存应该有容量上限或淘汰策略；重复操作后观察基线是否回到同一水平。
- **React 里最典型的泄漏点？** 订阅与定时器没有在 Effect cleanup 中释放，以及忘记 abort 的请求。

</details>

---

## 22. ESM 与 CommonJS 的核心差异是什么？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript","ESM"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

核心差异在**时机**与**绑定语义**：ESM 是静态模块语法，依赖关系在执行前即可解析，导入是 live binding；CommonJS 是运行时包装函数，`require` 同步执行，导出传递的是值。

### 原理与示例

- 语法与位置：ESM 的 `import`/`export` 只能出现在模块顶层，会被提升；CJS 的 `require` 可写在任意位置，按执行顺序同步加载。
- 绑定语义：ESM 导入的是**活绑定**，导出方后续更新，导入方能读到新值（但不能重新赋值）；CJS 拿到的是一次求值结果，重新赋值 `module.exports` 不会影响已经导入方持有的旧引用。
- 静态分析：ESM 的结构让 tree shaking 与循环依赖分析更可行；CJS 需要运行时推断，容易整包保留。
- 环境判定：浏览器原生只支持 ESM；Node 根据 `package.json` 的 `type`、`.mjs`/`.cjs` 扩展名与 `exports` 条件决定解析方式。
- 其他差异：ESM 支持 top-level await、默认严格模式、顶层 `this` 为 `undefined`；CJS 顶层 `this` 是 `module.exports`。

### 边界与易错点

- "用了 ESM 就一定能 tree shaking"是错的：顶层副作用、错误的 `sideEffects` 声明、整包聚合导入、依赖只发布 CJS 都会让消除失败（见第 82 题）。
- 循环依赖不一定立即报错：ESM 先建立绑定，访问尚未初始化的绑定会抛 TDZ 错误；CJS 常见到执行未完成时的"部分导出"。
- 双包发布要小心 `exports` 条件顺序与"同一模块被加载两次"，后者会导致 `instanceof` 失效、单例重复。
- CJS 不能直接 `require` 纯 ESM（新版本 Node 已支持部分场景），但可以用动态 `import()` 加载。

### 追问

- **静态 `import` 与 `import()` 的区别？** 动态导入在运行时执行、返回 Promise，可用于条件加载与代码分割（见第 58 题）。
- **怎么消除循环依赖？** 重构模块边界，把共享部分抽成第三个模块，或用依赖注入替掉反向依赖。

</details>

---

## 23. 防抖和节流有什么区别？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

防抖把"连续触发"收敛为静默后的一次执行；节流把执行频率限制为固定时间窗口内至多一次。前者关心"最后一次"，后者关心"稳定节奏"。

### 原理与示例

- **防抖**：每次触发都重置计时器，停止触发一段时间后才执行；适合搜索输入、表单校验、窗口尺寸变化后的重算。
- **节流**：窗口内最多执行一次，常见形态是"首次立即执行 + 尾部补一次"；适合滚动位置、resize、拖拽、埋点上报。

```js
function debounce(fn, wait) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), wait)
  }
}
```

完整实现还需要 `cancel`/`flush`、透传 `this` 与参数、以及在组件卸载时清理。

### 边界与易错点

- 防抖**不解决竞态**：慢的旧响应仍可能后到并覆盖新结果，必须额外用 `AbortController` 或请求序号（见第 43 题）。
- 组件卸载时必须 `cancel`，否则定时器会在组件消失后触发更新、或长期持有旧闭包造成泄漏。
- leading/trailing 语义要显式定义并写测试，否则会出现"首次没反应"或"停止后不再更新"。
- 时间戳版节流会被系统时钟对齐影响产生边界抖动，计时器版更平滑，但要明确首次是否立即执行。
- 高频事件还应配合 `{ passive: true }`、批量读/写 DOM，避免回调本身造成掉帧。

### 追问

- **搜索框应该用哪个？** 通常防抖 + 请求取消；若要"输入即筛选本地数据"，节流或 `useDeferredValue` 更合适。
- **和 `requestAnimationFrame` 的关系？** rAF 天然按帧节流，适合与渲染同步的更新，但不保证固定间隔（后台标签页会暂停）。

</details>

---

## 24. 事件委托为什么有效？有什么边界？

<!-- question: {"category":"javascript","type":"theory","difficulty":"advanced","tags":["JavaScript"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

事件委托利用事件冒泡：把众多子元素的监听收敛到共同祖先，再用 `event.target.closest()` 定位真正被点击的元素。它同时减少监听器数量，并天然覆盖后来插入的节点。

### 原理与示例

- 冒泡路径由 DOM 树决定，祖先上的监听器可以接住任意后代触发的事件。
- `event.target` 是实际触发元素，`event.currentTarget` 是绑定监听器的元素，委托时用前者定位、后者做范围校验。

```js
list.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]')
  if (!button || !list.contains(button)) return // 关键：确认仍在容器内
  run(button.dataset.action)
})
```

### 边界与易错点

- 并非所有事件都冒泡：`focus`/`blur`（需用 `focusin`/`focusout`）、`mouseenter`/`mouseleave`、`load` 等不冒泡，部分只能在捕获阶段处理。
- Shadow DOM 会 retargeting：外部监听器看到的 `target` 是宿主元素，拿不到内部真实节点。
- `closest` 可能命中容器之外的祖先，必须用 `contains` 校验，否则嵌套组件会误触发。
- 滥用 `stopPropagation` 会破坏其他委托逻辑（模态框、埋点、埋点外的关闭行为），优先用条件判断替代。
- React 17 起把事件监听挂在根容器而不是 `document` 上，跨根节点与 Portal 的冒泡行为需要注意（见第 52 题）。

### 追问

- **为什么说委托"自动覆盖新节点"？** 监听器不在子节点上，新增节点无需重新绑定。
- **大量同类元素怎么进一步优化？** 委托到容器 + 虚拟化列表；减少监听数量通常比优化回调体收益更大。

</details>

---

## 25. 为什么不可变更新对 React 很重要？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript","React"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

不可变更新不是 JavaScript 的语言要求，而是一条更新纪律。新建引用让 React 只用一次浅比较就能判断"变了没有"，同时保留旧快照，为并发渲染、撤销、调试提供前提。

### 原理与示例

```js
// 错误：原地修改后传回同一个引用
user.name = 'B'
setUser(user)

// 正确：只复制变化路径
setUser(prev => ({ ...prev, name: 'B' }))
```

- `useState` 的更新 bailout 使用 `Object.is` 比较，传入同一引用会被判定为无变化。
- `memo`、`useMemo`、`useEffect` 的依赖比较同样依赖引用稳定；原地修改会让"依赖没变所以跳过"的判断失效。
- 旧快照不可变，才使并发渲染下的可中断与重放结果可预期。

### 边界与易错点

- 深拷贝整棵树既慢，又破坏未变化分支的引用稳定性，导致所有 memo 失效。正确做法是**只复制从根到变更点的路径**。
- 嵌套更新容易漏层（`{ ...prev, a: { ...prev.a, b: 1 } }`），可用 `useReducer` 集中管理，或用 immer 类工具生成结构共享结果。
- 与 class 组件的 `setState` 不同，`useState` 不做浅合并，必须自己展开。
- 不可变不等于"每层都复制"：未变化的分支必须沿用原引用，否则优化全部失效。

### 追问

- **为什么并发渲染更依赖不可变？** 渲染可能被中断后重放，若状态被原地修改，渲染读到的就不是同一份快照。
- **什么时候可以接受可变？** 纯计算的局部变量、`useRef` 持有的非渲染数据，以及明确不参与渲染的缓存。

</details>

---

## 26. 前端错误应该怎样分类和传播？

<!-- question: {"category":"javascript","type":"theory","difficulty":"advanced","tags":["JavaScript"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

先按"能否重试、谁能处理、用户该看到什么"分类，再为每类定义统一的传播与提示策略。核心原则：错误要么在本层被处理，要么补上下文后继续向上，绝不能静默吞掉。

### 原理与示例

至少区分：用户输入校验错误、业务拒绝（库存不足、状态不允许）、认证与授权错误、网络与超时、限流、服务端错误、程序 bug。每类都要定义：是否重试、是否提示用户、是否保留旧数据、日志级别、恢复到哪一步。

```js
class ApiError extends Error {
  constructor(message, { code, status, retryable } = {}) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.retryable = retryable
  }
}
```

传播路径：网络层标准化为带 `code`/`status` 的错误对象 → 数据层（query/mutation）决定重试与缓存失效 → 路由或组件边界决定 UI → 上报层补齐上下文（release、route、requestId）。

### 边界与易错点

- 空的 `catch {}` 是最严重的反模式：错误被吞掉，线上只剩"点了没反应"。
- 当前层无法处理时要补充上下文后重新抛出，而不是就地 `console.log` 后返回一个假成功。
- `window.onerror` 与 `unhandledrejection` 只是最后一道观测网，拿不到业务上下文，不能替代局部处理。
- Error Boundary 只覆盖渲染期错误，**不捕获**事件处理器与异步请求中的错误（见第 53 题）。
- toast 不能作为唯一错误 UI：可能被忽略，也无法承载重试入口。
- 日志必须脱敏，不上报手机号、token、完整请求体等个人信息。

### 追问

- **怎么避免同一错误刷屏？** 按错误指纹（message + stack + code）聚合计数与采样上报。
- **重试策略怎么定？** 只对幂等且可恢复的类型（网络抖动、超时、5xx）做指数退避加抖动，其余直接暴露给用户。

</details>

---

## 27. 垃圾回收可以手动触发吗？WeakRef 应该用来解决普通缓存吗？

<!-- question: {"category":"javascript","type":"theory","difficulty":"advanced","tags":["JavaScript","缓存"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

业务代码不能可靠地控制 GC 时机（`globalThis.gc()` 只在特定调试模式或 Node 的 `--expose-gc` 下存在），`WeakRef` 与 `FinalizationRegistry` 的回收和回调时机同样不确定，因此不能承载正确性、关键资源释放或普通业务缓存策略。

### 原理与示例

- 现代引擎采用分代加增量/并发标记清除，回收时机由内存压力与空闲时间决定。
- `WeakRef.deref()` 可能在任何时刻返回 `undefined`；`FinalizationRegistry` 的回调甚至可能到页面卸载都没执行。
- 需要释放的资源（连接、订阅、文件句柄、Worker）必须显式 `close()`/`unsubscribe()`/`terminate()`。

```js
const meta = new WeakMap() // 跟随对象生命周期，适合对象级元数据
```

普通缓存的正确做法是明确策略：容量上限 + 淘汰规则（LRU/LFU）+ TTL + 主动失效。

### 边界与易错点

- "内存会涨"不等于泄漏：先确认重复操作后基线是否回落（见第 21 题）。
- `WeakRef` 只在同一事件循环轮次内相对稳定，跨 `await` 后不能假定仍然有效。
- 用 `FinalizationRegistry` 做资源清理会形成"有时不执行"的泄漏，属于设计错误。
- 调试手段（DevTools Memory/Performance、`--expose-gc`）只用于本地验证，不应出现在产品逻辑里。

### 追问

- **`WeakMap` 能当缓存吗？** 它是"跟随对象生命周期的关联存储"，没有容量与淘汰语义，只能算缓存的一个特例。
- **什么可以依赖 GC？** 只有"对象图变为不可达"这一件事；外部资源的释放一律显式处理。

</details>

---

## 28. 为什么 `Array.prototype.sort` 可能带来 React bug？

<!-- question: {"category":"javascript","type":"theory","difficulty":"advanced","tags":["JavaScript","React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

因为 `sort` 是**原地修改**：它会直接改动 React 正在持有的 props 或 state 数组，破坏状态快照与引用比较的前提（见第 25 题）。

### 原理与示例

```js
// 错误：原地排序，state 数组本身已被改动
items.sort(compare)
setItems(items) // 同一引用，更新可能被跳过

// 正确：先复制再排序
const sorted = [...items].sort(compare)
// 现代运行环境也可以直接用 items.toSorted(compare)
```

同类的原地方法还有 `reverse`、`splice`、`fill`、`copyWithin`、`push`/`pop`/`shift`/`unshift`。

### 边界与易错点

- 原地排序后再 `setItems(items)` 传入同一引用，会被 `Object.is` 判定为无变化而跳过渲染——数据变了但 UI 不刷新。
- 破坏快照的影响不止少渲染一次：并发渲染、撤销、`memo` 比较、其他消费者读到的旧数据都会受影响。
- `sort` 默认按字符串比较，数字数组必须传比较函数，否则 `[10, 9]` 的结果不符合直觉。
- ES2019 起 `sort` 是稳定的，但稳定不代表可以省略比较函数，也不代表可以原地调用。
- `toSorted`/`toReversed`/`toSpliced` 需要较新的运行环境，兼容性不足时用 `[...arr]` 兜底。

### 追问

- **只排序不 setState 可以吗？** 不可以，会污染父组件或其他消费者共享的数据，属于跨组件副作用。
- **团队层面怎么防？** 约定"渲染输入只读"，在 code review 与 lint 层面禁止修改入参。

</details>

---

# 第二部分：React 原理题

## 29. JSX 和 React Element 是什么？

<!-- question: {"category":"react","type":"theory","difficulty":"basic","tags":["React"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

JSX 是语法扩展，编译后变成创建 element 的调用；React element 是普通的、**不可变的 UI 描述对象**，既不是 DOM 节点，也不是组件实例。

### 原理与示例

```jsx
const view = <Button color="red">Save</Button>

// 编译后近似为（现代 JSX 运行时）
const view = jsx(Button, { color: 'red', children: 'Save' })
```

- element 描述"想渲染什么"：包含 `type`（字符串标签或组件函数）与 `props`，`key`、`ref` 由 React 单独处理。
- 函数组件的 element 会被 React 调用，返回下一层描述；最终由宿主渲染器（react-dom）决定真正的 DOM 操作。
- 因为不可变，element 可以被安全地缓存、比较与重放。

### 边界与易错点

- `<Button />` 与 `Button()` **不等价**：前者让 React 管理组件身份、Hook 归属、调度与错误边界；直接调用只是普通函数调用，会破坏组件边界，Hook 也会挂到错误的组件上。
- JSX 不是 HTML：`className`、`htmlFor`、自闭合规则、`{}` 表达式插值都不同；`undefined`、`null`、布尔值不会渲染出内容，`0` 会。
- 返回多个相邻 element 必须有共同父级或 Fragment；数组元素一律需要 `key`。
- `props.children` 可能是数组、字符串或单个 element，遍历前要规范化。

### 追问

- **element 可以缓存吗？** 可以，它只是不可变描述，不含状态，缓存不影响渲染正确性。
- **`key`/`ref` 为什么不在 `props` 里？** 它们是 React 用于身份识别与实例访问的保留字段，因此组件内读不到 `props.key`。

</details>

---

## 30. React 一次更新经过哪些阶段？

<!-- question: {"category":"react","type":"theory","difficulty":"basic","tags":["React"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

高层模型分五步：触发与调度 → render phase（可中断、可重做）→ reconciliation（比较新旧描述）→ commit phase（同步应用 DOM 变化、处理 ref 与 layout effect）→ 浏览器绘制 → passive effect 执行。

### 原理与示例

1. **触发与调度**：初次挂载，或 state/props/context/external store 变化；React 按优先级安排工作。
2. **Render phase**：调用组件计算下一棵 UI。必须纯净，并在并发模式下可能暂停、放弃或重做。
3. **Reconciliation**：比较新旧 element 树，决定保留、更新、插入、删除，并标记副作用（见第 31 题）。
4. **Commit phase**：把确定的变化同步应用到 DOM，执行 `useLayoutEffect` 与 ref 回调；这一阶段不能被丢弃。
5. **绘制与 passive effects**：浏览器 paint 之后，React 再执行 `useEffect`。

### 边界与易错点

- "组件重新渲染"只表示组件函数再次执行，DOM 不一定变化；结构和属性都没变时 React 不会改 DOM。
- render 阶段可能被重复执行（Strict Mode 在开发环境会刻意双调用），因此不能有副作用；commit 必须是可预期的同步过程。
- `useLayoutEffect` 在 commit 后、绘制前同步执行，会阻塞绘制；`useEffect` 通常在本轮绘制之后运行。
- 并发渲染下 render 可以被中断，所以不要在这期间写入共享可变状态或修改 `ref`。

### 追问

- **为什么 commit 不能像 render 一样中断？** 中断会让 DOM 停在部分更新的中间态，用户可见且无法回滚；render 只是计算，丢弃成本低。
- **一次点击一定只更新一次吗？** 不一定，取决于更新优先级、是否被批处理，以及是否有多个状态来源同时变化。

</details>

---

## 31. reconciliation 是什么？Virtual DOM diff 的复杂度如何理解？

<!-- question: {"category":"react","type":"theory","difficulty":"basic","tags":["React"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

reconciliation（协调）是把新的 element 树与既有内部树对齐的过程。通用树编辑距离的代价过高（最优算法接近 O(n³)），React 用两条启发式规则把常见路径降到**同层线性扫描**。

### 原理与示例

启发式规则只有两条：

1. **类型不同视为不同子树**：`type` 不同（`div` → `span`，或不同组件函数）就卸载重建，不尝试复用子节点。
2. **同层同类型按 `key` 匹配身份**：兄弟节点之间用 `key`（未提供时用索引）识别旧节点与新节点的对应关系。

因此 cost 变成了"每个节点各扫一遍自己的子列表"，最坏情况仍需处理移动与插入，但常见更新近似线性。

### 边界与易错点

- 跨层级移动会被当作"删除 + 新建"，state 与 DOM 都会重建；这也是"状态尽量放在就近位置、列表要有稳定 key"的原因。
- 不要简化成"Virtual DOM 一定比直接操作 DOM 快"。它的价值在声明式模型、可中断调度、批量更新与跨平台抽象；真实性能取决于组件结构、计算量和实际 DOM 工作量。
- 协调的对象是 element 与 Fiber 节点，不是 DOM；只有 commit 阶段才写 DOM（见第 30 题）。
- React 不做跨层级的节点复用（例如把子节点上提），这是与其他实现的重要差异。

### 追问

- **为什么接受"同层比较"这个取舍？** 它放弃理论最优的重用率，换取可预测的线性开销，而 UI 更新通常只影响局部。
- **`key` 在协调里扮演什么角色？** 提供同层身份，让 diff 能识别重排与插入，而不是按位置盲目复用（见第 32 题）。

</details>

---

## 32. `key` 的真正作用是什么？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

`key` 与 `type` 一起决定 React 眼中"这个位置上的元素是谁"。它只影响**同一父节点下兄弟之间**的身份匹配，不会作为 DOM 属性渲染出来。

### 原理与示例

- 稳定且唯一的 key 让 React 在插入、删除、排序时把旧 state、DOM 节点、effect 与正确的新元素对应起来。
- key 只需在**同一父节点的兄弟之间**唯一，不必全局唯一。
- 改变 key 等于告诉 React"这是另一个元素"：旧树被卸载、新树被挂载，因此可以有意用它重置表单或强制重挂组件。

### 边界与易错点

- 用数组下标作 key：列表中间插入、删除、重排后，同一个下标可能对应另一条数据，导致非受控输入串行、局部 state 错位、动画错乱。
- 用 `Math.random()` 或每次新建的对象作 key，会导致每轮都重建，性能和 state 全部受损。
- key 不会出现在 `props` 里，子组件读不到；需要业务 id 时必须显式再传一个 prop。
- 只有"列表完全静态、不排序不过滤、行内没有需要保留的身份状态"时，用下标才相对可接受，属于例外而非常规。

### 追问

- **改 key 会触发什么？** 旧子树卸载（执行 cleanup），新子树挂载（state、ref、Effect 全部重建）。
- **Fragment 需要 key 吗？** 简写 `<>...</>` 无法接收 key；需要传 key 时用 `<Fragment key={...}>`，数组元素一律必须有 key。

</details>

---

## 33. state 保存在哪里？为什么说它是 snapshot？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React","state"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

state 不存在组件函数的局部变量里，而是由 React 按组件在树中的**位置与身份**维护；每次 render 都会拿到一份固定的 state 快照，这次 render 创建的事件处理器与闭包读到的也是这份快照。

### 原理与示例

```jsx
function Counter() {
  const [count, setCount] = useState(0)

  function handleClick() {
    setCount(count + 1)
    console.log(count) // 仍是本次 render 的快照值
  }

  return <button onClick={handleClick}>{count}</button>
}
```

- 位置决定身份：同一位置、同一 `type` 才复用同一份 state；`key` 或 `type` 变化都会导致重建。
- 调用 setter 是"请求未来更新"，不会改写当前 render 的局部常量。
- 因此连续写两次 `setCount(count + 1)` 只会 +1，需要基于前值时必须用函数式更新。

### 边界与易错点

- 不要解释成"setState 是异步的"：即使使用 `flushSync` 强制同步刷新，当前 render 中的 `count` 仍然是那次快照的值。
- 想在事件里读取"最新值"不能依赖局部变量，要用函数式更新或 ref（见第 46 题）。
- 依赖闭包捕获快照的 Effect 会读到旧值，这就是 stale closure（见第 42 题）。
- "快照按 render 固定"正是并发渲染可以中断与重放的前提（见第 25 题）。

### 追问

- **为什么不用普通局部变量存 state？** 组件函数每次 render 都会重新执行，局部变量无法跨 render 保留，也无法参与调度与一致性校验。
- **state 存在 DOM 上吗？** 不存在，它保存在 React 内部与元素关联的数据上，与 DOM 无关，所以 DOM 没变也可能有 state 变化。

</details>

---

## 34. batching 与 state update queue 如何工作？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React","state"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

React 把同一个处理边界内的多个更新排入队列，在一次 render 中按顺序回放，避免每个 setter 都触发一次完整渲染。

### 原理与示例

对同一个 state，队列条目分两类：

- `setX(value)`：加入"替换为 value"的更新。
- `setX(prev => next)`：加入基于队列中前一个结果计算的 updater。

```jsx
setNumber(number + 5) // 替换为 0 + 5 = 5
setNumber(n => n + 1) // 5 + 1 = 6
setNumber(42)         // 替换为 42
// 最终结果是 42
```

渲染时按入队顺序依次应用，因此最终值由最后一次写入决定，而 updater 能读到队列中前一步的结果。

### 边界与易错点

- React 18 起在 `createRoot` 下扩大了自动批处理范围（Promise、`setTimeout`、原生事件回调里也会批处理），但**不能**解释成"永远只 render 一次"：不同优先级的更新、`flushSync`、同步外部 store 都可能打破这个假设。
- 同一事件内的多个 setter 会被合并；不同事件之间仍是两次渲染。
- 需要基于前值时必须用函数式更新，直接写 `setNumber(number + 1)` 会读到陈旧快照（见第 33 题）。
- updater 必须是**纯函数**：开发模式下 React 可能重复调用它来验证纯性，在其中做副作用会出错。
- 批处理只减少渲染次数，不改变"同一次事件里所有值来自同一快照"的事实。

### 追问

- **`flushSync` 什么时候用？** 需要立刻读到 DOM 更新结果时（如测量后滚动定位）；它牺牲批处理与并发收益，能用 Effect 或事件处理解决就不要用。
- **为什么 updater 会被调用两次？** Strict Mode 在开发环境刻意双调用渲染函数与 updater，用于暴露非纯副作用。

</details>

---

## 35. props、state、普通变量和 ref 的区别是什么？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","state"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

四者的差别在三个问题：谁拥有、跨 render 是否保留、修改后是否触发渲染。

### 原理与示例

- **props**：父组件传入的当前 render 输入，只读；子组件不能直接改。
- **state**：由 React 按位置维护，setter 请求一次新的 render。
- **局部变量**：每次 render 重新计算，随 render 结束被丢弃；修改它既不保留也不触发渲染。
- **ref**：跨 render 保留同一个 `{ current }` 容器；修改 `.current` 不触发渲染。

选择标准：影响渲染输出且会变化的数据用 state；只用于跨 render 保存、不影响输出的命令式信息（DOM 引用、timer id、最近一次回调）用 ref；能由 props/state 推导的直接在 render 里算；状态迁移复杂时升级为 reducer。

### 边界与易错点

- 在 render 期间写 `ref.current` 是反模式：并发渲染下这次写入可能被丢弃或重复执行，应放在事件处理器或 Effect 中。
- 不要用 ref 绕过依赖数组：`useRef` 存最新值不会让订阅重新建立，读取时机必须自己想清楚（见第 99 题）。
- 把 props 复制进 state 会制造两个真相来源（见第 67 题）。
- `useState` 不做浅合并，更新对象时必须自己展开，这一点与 class 组件的 `setState` 不同。

### 追问

- **什么时候必须用 state 而不能用 ref？** 当数据要出现在渲染输出里时；ref 变化不会触发渲染，UI 不会更新。
- **props 是"不可变"还是"只读"？** 是约定上的只读：技术上能改对象内部，但那会破坏不可变前提，让 `memo` 与依赖比较失效。

</details>

---

## 36. 什么是派生状态？为什么经常不需要 Effect？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","Effect"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

能从当前 props/state 纯计算得到的值就是派生数据，应该在 render 中直接计算，而不是用 state + Effect 去"同步"。

### 原理与示例

```jsx
// 不推荐：多一份状态、可能闪一帧旧值、还多一次 render
useEffect(() => setFullName(`${first} ${last}`), [first, last])

// 推荐：没有第二份真相
const fullName = `${first} ${last}`
```

用 Effect 同步的链路是"render → commit → effect → setState → 再 render"，用户可能先看到旧值，且额外产生一次渲染。

### 边界与易错点

- 需要独立 state 的情况只有三类：用户可独立编辑的值（输入草稿）、需要保留的历史快照、与 props 无关的 UI 状态。其余多属派生数据。
- 昂贵计算应先测量再用 `useMemo`，并注意 memo 只在依赖不变时有效；没有证据的 memo 只增加复杂度。
- "props 变化时重置状态"不要用 Effect 里 setState，优先用 `key` 表达身份，让 React 重建组件。
- 多个 Effect 互相 setState 会形成扇出，任一环节出错就出现闪烁或不一致。

### 追问

- **什么情况必须用 state？** 值无法由现有 props/state 推导时，例如用户输入、服务端数据、需要跨 render 保留的选择。
- **`useMemo` 的价值是什么？** 依赖不变时复用计算结果并保持引用稳定，从而让下游 `memo`/依赖比较生效。

</details>

---

## 37. 受控组件与非受控组件如何选择？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

分界在"当前值由谁持有"：受控组件的值来自 React state，并通过 `onChange` 回写；非受控组件的值由 DOM 自己维护，通过 ref 或表单提交时读取。

### 原理与示例

- **受控适合**：即时校验、字段联动、输入格式化、需要统一重置或禁用、需要把值同步到其他 UI。
- **非受控适合**：简单表单（提交时一次性取值）、集成第三方 DOM 库、文件输入，以及逐键更新代价过高的输入。
- 文件输入是特例：`<input type="file">` 的值只能由用户设置，天然非受控，只能用 ref 读取。

### 边界与易错点

- 受控组件忘记传 `onChange` 会变成只读并在开发环境告警；只传 `onChange` 不传 `value` 则是非受控。
- 不要在组件生命周期内把同一字段从非受控切到受控（`value` 由 `undefined` 变为有值会告警），API 设计上要固定一种形态。
- `defaultValue`/`defaultChecked` 只在挂载时生效，后续 prop 变化不会更新 DOM，需要重置时靠 `key`。
- 非受控不等于"脱离 React"：仍要用 ref 或表单事件统一收集数据，并参与校验与提交。

### 追问

- **"组件受控"还能指什么？** 泛化为"父组件通过 prop 控制行为"，如 `open` + `onOpenChange` 的模态框；`defaultOpen` 对应非受控形态。
- **高频输入该选哪个？** 若每次按键都要重算大量 UI，可考虑非受控 + 提交取值，或用 `useDeferredValue` 降低渲染压力（见第 56 题）。

</details>

---

## 38. 为什么 Hooks 不能写在条件、循环或普通函数里？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","Hooks"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

因为 React 不靠名字识别 Hook，而是靠**每次 render 中的调用顺序**把 Hook 调用与该组件的状态槽位对应；某次 render 少调或多调一个 Hook，后面所有 Hook 的对应关系都会错位。

### 原理与示例

```jsx
// 错误：条件调用会让后续 Hook 的序号整体偏移
if (enabled) {
  const [x, setX] = useState(0)
}
const [y, setY] = useState(0) // 有时是第 2 个槽位，有时是第 1 个
```

规则：Hooks 只能在 React 函数组件或自定义 Hook 的**顶层**调用；条件逻辑要写在 Hook 内部，或放在所有 Hook 调用之后。

### 边界与易错点

- 典型报错是 "Rendered fewer/more hooks than expected"，根因几乎都是条件调用或提前 `return` 改变了调用顺序。
- 提前 `return` 同样会破坏顺序：`if (!user) return null` 必须放在所有 Hook 调用之后。
- 自定义 Hook 内部也受同一约束，且必须 `use` 开头，才能被 lint 识别并检查。
- `use` API 支持条件/循环调用（它读的是 context 或 Promise，不占 Hook 槽位），但这不改变其他 Hook 的顺序要求，不能当作豁免理由。
- 工程上依赖 `eslint-plugin-react-hooks` 的 `rules-of-hooks` 与 `exhaustive-deps`；不要靠人工记忆。

### 追问

- **状态真的"绑定在调用顺序"上吗？** 是的：mount 时按顺序创建记录，update 时按同一顺序读取，所以顺序必须稳定（见第 39 题）。
- **为什么自定义 Hook 要以 `use` 开头？** 让 lint 与协作者都能识别它内部包含 Hook，从而强制遵守调用规则。

</details>

---

## 39. Hooks 在内部为什么常被描述为链表？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","Hooks"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

因为 React 内部为每个函数组件维护一组**按调用顺序排列的 Hook 记录**：mount 时依次创建并串起来，update 时从头部开始按同一顺序取用。"链表"是对这种"顺序即身份"结构的直观描述。

### 原理与示例

- 每条记录保存该 Hook 自己的状态：`useState` 存值，`useEffect` 存依赖与 effect 对象，等等。
- mount 与 update 走同一条遍历路径，因此第 N 次 Hook 调用总是对到第 N 条记录。
- 于是"不能在条件/循环里调用 Hooks"不是风格约定，而是实现方式的直接结果（见第 38 题）。

### 边界与易错点

- 字段名（`memoizedState`、`next` 之类）属于实现细节，不要当成 API 保证来背；重点是"顺序对应"的机制和后果。
- 不同版本（含编译器优化后的实现）内部结构会变化，但"调用顺序必须稳定"这一约束不变。
- 说"就是链表"时最好补一句边界：它是特定实现下的单向链式结构，版本间可能调整，稳定结论是顺序决定对应关系。

### 追问

- **顺序错位为什么编译期发现不了？** 因为它是运行时数据结构的位置错配，类型系统无法察觉，只能靠 lint 规则与运行时校验兜住。
- **React Compiler 会改变这一点吗？** 不会。编译器自动插入缓存、减少手写 memo，但不改变 Hooks 的调用顺序约束。

</details>

---

## 40. `useEffect` 的本质用途是什么？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","Effect"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

Effect 的本质用途是让组件与 **React 之外的系统**保持同步：网络连接、订阅、定时器、命令式 DOM API、第三方库实例。它不是生命周期的等价替代，也不是"render 之后随便做点事"的钩子。

### 原理与示例

判断方法：先说清外部系统是什么。如果指不出来，通常应该改为直接计算、事件处理器、状态提升或 reducer。

```jsx
useEffect(() => {
  const connection = connect(roomId)
  return () => connection.disconnect()
}, [roomId])
```

- 依赖变化时：先用**旧值**执行 cleanup，再用新值 setup。
- 卸载时执行最后一次 cleanup。
- Effect 只在客户端运行，Server 渲染阶段不会执行。

### 边界与易错点

- 不要用它同步可推导的状态（见第 36 题），也不要处理"由用户操作直接引发"的副作用——那属于事件处理器。
- 没有清理函数是内存泄漏和重复订阅的主要来源（见第 21 题）。
- Effect 内的闭包捕获本次 render 的快照，异步回调里可能读到旧值（见第 42 题）。
- Strict Mode 在开发环境会执行 setup → cleanup → setup，用于暴露清理不完整的问题，不是 bug（见第 45 题）。
- 依赖数组必须写全；用空数组模拟"只运行一次"时，必须确认它真的不依赖任何会变化的值。

### 追问

- **Effect 与事件处理器如何分工？** 用户操作直接引起的副作用放事件处理器；需要与渲染结果保持同步的外部连接才放 Effect。
- **什么时候改用 `useLayoutEffect`？** 需要在浏览器绘制前同步测量或修改 DOM 时（见第 44 题）。

</details>

---

## 41. dependency array 应该怎样理解？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

依赖数组不是"我希望什么时候执行"的开关，而是对 Effect 读取的所有**响应式值**的声明；React 用 `Object.is` 逐项比较上一次与这一次的依赖，决定是否重新同步。

### 原理与示例

- **不写数组**：每次 commit 之后都可能重新执行。
- **空数组 `[]`**：声明该 Effect 不读取任何会随 render 变化的响应式值。它不是"只执行一次"的语义保证——开发环境的 Strict Mode 仍会额外跑一轮 setup/cleanup（见第 45 题）。
- **`[a, b]`**：`a` 或 `b` 变化时重建同步。

响应式值包括 props、state，以及组件内部定义的函数与对象。

### 边界与易错点

- 对象/函数依赖频繁变化时，应先改结构：把只给 Effect 用的对象**搬进 Effect 内部**、把非响应逻辑移出组件、按职责拆分 Effect，而不是靠 memo 硬压。
- 为了让 Effect"少跑"而删依赖或关闭 `exhaustive-deps`，等于主动制造 stale closure。
- 依赖比较是**引用比较**：`[{ id }]` 里每次都是新对象，等于每次都重新同步。
- `ref.current` 不是响应式值，放进依赖数组不会按预期触发。
- 空数组但读了 props/state 是最典型错误，只有在该值确实永不变化时才合法。

### 追问

- **怎样既少运行又不漏依赖？** 把不变的值提到组件或模块之外，把变化的部分作为参数传入，用函数式更新消除对当前 state 的读取。
- **依赖顺序重要吗？** 不影响行为，React 按位置逐项比较；但按语义分组更易读。

</details>

---

## 42. 什么是 stale closure？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

每次 render 都会创建新的局部变量与函数闭包。如果某个回调仍然引用**创建它那次 render** 的快照，就会读到旧值。

### 原理与示例

```jsx
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1) // 依赖为空时，count 永远是初始快照值
  }, 1000)
  return () => clearInterval(id)
}, [])
```

修复分三类，按优先级选择：

1. 更新只依赖前值 → 用函数式更新 `setCount(c => c + 1)`。
2. 该值确实是响应式依赖 → 补进依赖数组，让资源随值重建。
3. 需要在**不重建订阅**的前提下读取最新值 → 使用 ref 或 Effect Event 这类明确机制。

### 边界与易错点

- 不要把所有值都塞进 ref 来"解决"问题：那会绕过响应式数据流，组件不再对变化作出正确反应。
- 补依赖数组会引起资源重建与重订阅，必须同时保证 setup/cleanup 对称，否则会出现重复订阅或漏清理。
- 事件处理器一般没有这个问题：每次 render 都会创建新的处理器。有风险的是被长期保存的回调——订阅、定时器、缓存、Promise 链。
- 典型表现：定时器计数不增长、订阅里拿到旧 props、请求用了旧参数。

### 追问

- **为什么 reducer 能缓解这个问题？** `dispatch` 引用稳定且不依赖当前 state，reducer 在最新状态上执行，天然避开快照。
- **Effect Event 解决什么？** 让回调读取最新值但不成为响应式依赖，从而不必重建订阅。

</details>

---

## 43. 如何处理 Effect 中的请求竞态？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React","Effect","请求"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

竞态指"先发出的请求后返回"，导致旧响应覆盖新结果。处理要分两层：用 `AbortController` **真正取消**请求，同时用 cleanup 标记该次 Effect 已失效，忽略任何迟到的结果。

### 原理与示例

```jsx
useEffect(() => {
  const controller = new AbortController()
  let active = true

  async function load() {
    try {
      const response = await fetch(`/api?q=${query}`, { signal: controller.signal })
      const data = await response.json()
      if (active) setData(data)
    } catch (error) {
      if (error.name !== 'AbortError' && active) setError(error)
    }
  }

  load()
  return () => {
    active = false
    controller.abort()
  }
}, [query])
```

只用 `active` 标记不取消请求，仍会浪费带宽与后端资源；只 abort 而不判断 `active`，在 abort 无效或响应已进入回调的场景仍可能写入过期数据。

### 边界与易错点

- 必须显式排除 `AbortError`，否则用户每次切换输入都会看到"请求被取消"的错误提示。
- 组件卸载后 setState 在 React 18 已不再告警，但仍是无效写入与潜在泄漏来源。
- 竞态不只出现在 Effect：任何"后写覆盖先写"的异步流程（并发 mutation、批量操作、乐观更新）都要处理。
- 防抖/节流不能替代竞态处理：它们只减少触发次数，两次请求都发出后返回顺序仍不确定。
- 成熟项目通常交给路由 loader 或 server-state 库统一处理缓存、去重、重试与竞态，避免每个组件重复实现请求生命周期。

### 追问

- **`AbortSignal.timeout` 有什么用？** 为请求加超时上限；它与取消共用同一套 signal 机制，可以组合使用。
- **为什么竞态在客户端常见而服务端少见？** 客户端请求由用户操作频繁触发且无序返回，服务端通常按请求隔离处理。

</details>

---

## 44. `useEffect` 与 `useLayoutEffect` 有什么区别？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React","Effect"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

两者都在 commit 之后、客户端运行，差别在**时机**：`useLayoutEffect` 在浏览器绘制前同步执行（会阻塞绘制），`useEffect` 通常允许浏览器先绘制再执行。

### 原理与示例

- `useLayoutEffect` 适合"先测量、再修正、然后才让用户看到"的工作：读取布局后立即调整 tooltip 位置、按尺寸设置 transform、同步滚动位置，从而避免一帧闪烁。
- `useEffect` 适合绝大多数外部同步：订阅、请求、日志、不阻塞绘制的 DOM 操作。
- cleanup 的时机随之不同：layout effect 的清理发生在下一次 commit 前的同步阶段。

### 边界与易错点

- 默认选 `useEffect`。为了"更早执行"而把逻辑整体换成 layout effect 会推迟页面展示，长任务会直接恶化首屏与交互体验。
- SSR 环境下 `useLayoutEffect` 会在服务端渲染时告警（它只能在客户端运行），需要条件化处理。
- layout effect 中的同步测量会强制布局计算，不要在其中做重计算或大量 DOM 操作。
- 需要"避免闪烁"时，纯视觉问题可以先用 CSS 或条件渲染解决，不必依赖 layout effect。

### 追问

- **测量元素尺寸该用哪个？** 要在用户看到前完成调整就用 `useLayoutEffect`；只是记录数据用 `useEffect` 配合 `ResizeObserver`。
- **为什么它会阻塞绘制？** 因为它在浏览器准备绘制之前同步执行，React 必须等它结束才能让出主线程。

</details>

---

## 45. Strict Mode 为什么会看到组件或 Effect 多执行一次？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React","Effect"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

Strict Mode 只在**开发环境**刻意重复执行部分行为，用来提前暴露不纯的 render、缺失的 cleanup 与 ref 清理问题；生产构建不会因此多执行。

### 原理与示例

- 组件函数会被双调用：用于检测 render 中的副作用（写外部变量、改 ref、非幂等初始化）。
- Effect 会被压测成 setup → cleanup → setup：用于检查清理是否完整、订阅是否对称。
- 这些额外执行只发生在开发模式，且调用次数不保证固定，不要依赖"恰好两次"。

### 边界与易错点

- 正确处理不是关掉 Strict Mode，而是三件事：render 保持纯净、setup/cleanup 严格对称、外部写操作具备幂等或取消策略。
- 压测暴露出的重复订阅，通常在真实路由切换或 remount 时也会出问题，属于真 bug 而非"开发环境的怪现象"。
- 不要在 render 中做一次性初始化（例如 `if (!ref.current) ref.current = ...`），并发渲染与严格模式都可能让它出错。
- Strict Mode 不检测异步请求的竞态，仍需按第 43 题自行处理。

### 追问

- **为什么生产环境也要保证幂等？** remount、并发渲染的重放、标签页恢复都可能让 setup 再次执行。
- **可以关掉吗？** 可以，但会丢掉一类问题的早期信号；推荐的用法是开发环境保留、生产构建中 Strict Mode 不产生额外行为。

</details>

---

## 46. ref 有哪些用途和风险？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

ref 是跨 render 保留的可变容器，用于三件事：访问 DOM、保存命令式实例（timer、`AbortController`、第三方库实例）、存放不参与 UI 输出的值。修改 `.current` **不会**触发渲染。

### 原理与示例

```jsx
const inputRef = useRef(null)
useEffect(() => {
  inputRef.current?.focus()
}, [])
```

- 读取或调用 DOM 方法：`focus()`、`scrollIntoView()`、`getBoundingClientRect()`。
- 保存生命周期资源：定时器 id、订阅实例、WebSocket。
- 保存"最新值"快照（属于刻意使用的逃生舱，见第 99 题）。

### 边界与易错点

- 把影响 UI 的数据放进 ref 会造成界面与实际值不同步，这类数据必须用 state。
- 在 render 期间读写 `ref.current` 破坏纯度：并发渲染下这次执行可能被丢弃或重跑。
- 回调 ref（`ref={el => ...}`）要做清理，避免长期引用已卸载的节点；React 19 起回调 ref 可以返回清理函数。
- ref 传递：React 19 起函数组件可以像普通 prop 一样接收 `ref`；面向 React 18 存量代码仍需理解 `forwardRef`。
- `ref.current` 不是响应式值，放进依赖数组不会按预期触发（见第 41 题）。

### 追问

- **能用 ref 替代 state 吗？** 只在"变化不需要体现在 UI 上"时可以，例如埋点用的累计计数、上一次的值。
- **多个 DOM 节点怎么收集？** 用 `Map` 保存，或在回调 ref 中写入集合；不要用数组下标模拟 DOM 集合。

</details>

---

## 47. `memo`、`useMemo`、`useCallback` 分别做什么？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

三者都是**性能优化**，不是正确性工具：`memo` 让组件在 props 浅比较相同时跳过重渲染，`useMemo` 缓存计算结果，`useCallback` 缓存函数引用（近似 `useMemo(() => fn, deps)`）。

### 原理与示例

```jsx
const Chart = memo(function Chart({ rows }) { /* ... */ })

const total = useMemo(() => rows.reduce((sum, row) => sum + row.value, 0), [rows])

const handleSelect = useCallback((id) => setSelected(id), [])
```

- `memo` 默认只做 props 浅比较，**不阻止**组件因自身 state 或读取的 context 变化而重渲染。
- `useCallback` 的收益主要来自三个方面：作为 props 传给 `memo` 子组件、作为 Effect 依赖、作为其他 Hook 的输入。

### 边界与易错点

- 常见无效场景：计算本来就便宜；父组件每次传新对象或新函数让 memo 失效；组件自身 state/context 频繁变化；比较成本接近甚至超过渲染成本。
- 依赖数组写错会让缓存永远失效或永不更新，比不用 memo 更糟。
- 加 memo 会引入额外比较、内存占用与可读性成本，不要无差别套用。
- 正确流程：用 Profiler 找到昂贵且重复的渲染 → 先调整状态位置、组件边界与订阅范围 → 仍有收益再 memoize → 同条件复测。
- React Compiler 能自动插入一部分缓存，但不替代正确的数据流设计与测量。

### 追问

- **什么时候必须用 `useCallback`？** 当函数引用本身具有语义时（Effect 依赖、`memo` 子组件的 props、其他缓存的输入），而不是"看起来更快"。
- **`memo` 能挡住 Context 引起的重渲染吗？** 不能，组件自己读取的 Context 变化会绕过 `memo`（见第 48 题）。

</details>

---

## 48. Context 为什么可能引起大范围更新？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React","Context"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

Context 的消费者在 Provider 的 `value` 变化时会重新渲染，而且**无法只订阅其中一部分字段**。因此"一个大 Context 装下所有全局状态"或"value 每次都是新对象"会直接放大更新范围。

### 原理与示例

- `value` 变化（`Object.is` 比较）会通知该 Context 的所有消费者。
- 即使组件只用到其中一个字段，value 变了它也会重渲染——Context 没有 selector 机制。
- `value={{ user, theme }}` 每次 render 都产生新对象，等于每次都通知所有消费者。

优化顺序：

1. 把 state 放到离实际使用者最近的位置（第一位，而且往往已经够用）。
2. 按变化频率与职责拆分 Context（主题与用户信息分开）。
3. 用 `useMemo` 稳定 Provider 的 value，并确保依赖写全。
4. 高频、细粒度订阅需求改用支持 selector 的外部 store。

### 边界与易错点

- `memo` 无法阻止组件因自己读取的 Context 变化而更新，这是最常见的误解。
- 拆分 Context 会带来 provider 嵌套与 API 复杂度，不要为一两个消费者就大改结构。
- 把函数放进 value 时必须保证引用稳定，否则第 3 步形同没做。
- Context 只是依赖注入机制，不是状态管理方案；不要默认"所有全局状态都放 Context"。

### 追问

- **Context 与外部 store 怎么分界？** 低频、范围明确的配置/主题用 Context；高频更新、需要按字段订阅、需要跨组件读写用外部 store（见第 54 题）。
- **怎么确认确实是大范围更新？** 用 React Profiler 看这次 commit 执行了哪些组件，以及触发渲染的原因属于哪个 Context。

</details>

---

## 49. `useReducer` 什么时候比 `useState` 合适？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

当多个字段围绕同一业务事件一起变化、状态转换有规则需要集中校验、或希望把"发生了什么"与"如何变化"分离时，reducer 比 `useState` 更合适。

### 原理与示例

```ts
type State = { status: 'idle' | 'submitting' | 'done'; error: Error | null }
type Action = { type: 'submit' } | { type: 'success' } | { type: 'failure'; error: Error }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'submit':
      return { status: 'submitting', error: null }
    // ...
  }
}
```

- 转换逻辑集中在一处，非法状态组合更难写出来；配合 discriminated union 可以做穷尽检查。
- reducer 是纯函数，可以直接写单元测试，不需要渲染组件。
- `dispatch` 引用稳定，作为 props 传给子组件时不会引发依赖变化。

### 边界与易错点

- reducer **必须是纯函数**：不能发请求、写日志、读时间或随机数；副作用放在事件处理器或 Effect 中。
- 需要外部数据参与计算时，不要改 reducer 签名，可通过闭包或 action 传参，但会降低可测试性。
- 状态彼此独立且更新简单时，`useState` 更直接；强行 reducer 只会增加样板。
- `useReducer` 不等于全局状态管理：它只是组件内的状态组织方式，跨组件共享仍需 `useContext` 或外部 store。

### 追问

- **reducer 什么时候会失控？** action 数量膨胀、类型与实现不同步、UI 状态与业务状态混在一起时；此时应拆分子 reducer 或引入状态机。
- **和状态机的关系？** 显式枚举状态与事件时，状态机库能进一步禁止非法转换；reducer 是更轻量的近似方案。

</details>

---

## 50. 如何设计一个好的自定义 Hook？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React","Hook"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

自定义 Hook 复用的是**有状态逻辑**，不是共享同一份状态——每次调用都有独立的 Hook 状态。好的 Hook 有业务语义、API 收敛、清理对称、边界清晰。

### 原理与示例

```jsx
function useOnlineStatus() {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return online
}
```

评判标准：

- 名称表达**业务能力**而不是生命周期，`useChatConnection` 优于 `useMountEffect`。
- API 收敛：暴露业务动作与状态，而不是一堆内部 setter。
- setup/cleanup 严格对称，依赖写全，卸载后不再写状态。
- 返回值引用有意控制稳定，但不为"稳定"而堆 memo。
- 对错误、取消、并发与 SSR 有明确的行为约定。

### 边界与易错点

- 只是包一行 `useState`、没有形成稳定抽象，属于过度封装，价值有限。
- 不要用 Hook 隐藏巨大的状态耦合：8 个参数、10 个返回值通常意味着边界没切好。
- Hook 内部读取的值必须写进依赖数组，省略依赖会埋下 stale closure。
- 每次调用都是独立状态这一点常被误解：两个组件用同一个 Hook 不会共享数据，需要共享应提升状态或用外部 store。
- Hook 不能用来绕过调用规则（见第 38 题），也不能替代条件逻辑。

### 追问

- **什么时候该抽 Hook？** 出现第二处相同的有状态逻辑，或这段逻辑需要一个能命名的业务概念时。
- **Hook 与工具函数怎么分工？** 无状态的纯逻辑放模块里的普通函数，便于独立测试；涉及 Hook 与生命周期才包装成 Hook。

</details>

---

## 51. React 事件和原生 DOM 事件有什么关系？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

React 提供跨浏览器一致的合成事件系统。现代 React 把事件监听挂在**根容器**上（React 17 起不再挂 `document`），并按 React 树派发；事件对象对外接口与原生事件相似，但不是同一个对象。

### 原理与示例

- **监听位置**：React 17 之前挂在 `document`，17 起挂在 `createRoot` 的根容器上，使多根、微前端与跨根 Portal 的行为更可预测。
- **传播顺序**：React 按 React 树（逻辑父子）模拟捕获与冒泡；Portal 中的事件也沿 React 树传播（见第 52 题）。
- **事件对象**：`SyntheticEvent` 包装原生事件，提供 `nativeEvent`、`preventDefault()`、`stopPropagation()`；React 17 起不再需要 `persist()` 也能在异步代码中读取。
- **混用顺序**：挂在根容器或 `document` 上的原生捕获监听会先于 React 的回调执行。

### 边界与易错点

- `stopPropagation()` 只阻止合成事件的传播，**无法**阻止已经注册在 `document` 或根容器上的原生监听；需要时在原生层处理。
- 想阻止所有原生传播可用 `event.nativeEvent.stopImmediatePropagation()`，但它会影响同层的其他监听器，谨慎使用。
- 原生 `addEventListener` 注册在根容器**之外**时，React 的 `stopPropagation` 拦不住它。
- `preventDefault()` 与 `stopPropagation()` 是两件事：前者取消默认行为（表单提交、链接跳转），后者只影响传播。
- 事件对象的 `currentTarget` 在异步回调中会变成 `null`，需要提前保存引用。

### 追问

- **为什么 React 要自建事件系统？** 统一跨浏览器差异、让传播与 React 树一致、便于批量更新与优先级调度，并减少实际注册的监听器数量。
- **测试里该用哪个？** 优先用 Testing Library 的用户交互 API（底层是真实事件），而不是直接构造合成事件对象。

</details>

---

## 52. Portal 中的事件为什么可能冒泡到视觉上不相邻的父组件？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

Portal 只改变 **DOM 放置位置**，不改变它在 **React 树中的逻辑父子关系**。所以 Context 仍然可用，事件也按 React 树传播——看起来"不相关"的父组件会收到事件。

### 原理与示例

```jsx
function Modal({ children }) {
  return createPortal(<div role="dialog">{children}</div>, document.body)
}

<Card onClick={handleCardClick}>
  <Modal>...</Modal> {/* 点击 Portal 内容也会触发 Card 的 onClick */}
</Card>
```

### 边界与易错点

- 只按 DOM 层级判断会出错，例如"点击外部关闭"需要判断事件目标是否属于 Portal 内的容器，而不是比较 DOM 祖先关系。
- Portal 是独立的 DOM 子树，因此层叠上下文、`overflow` 裁剪、`z-index` 都要重新考虑，样式隔离不能只靠父级。
- 可访问性与焦点必须手工维护：`role="dialog"`、`aria-modal`、focus trap、Esc 关闭、关闭后焦点归还触发元素。
- 还要处理滚动锁定与卸载清理；Portal 只是"渲染到别处"，不负责这些行为。
- 事件传播绕过 DOM 层级，但**原生**监听（如 `document` 上的点击）看到的是真实 DOM 路径，两套模型要分开推理。

### 追问

- **什么时候需要 Portal？** 模态框、Tooltip、下拉菜单、Toast 等需要脱离层叠上下文或被 `overflow: hidden` 裁剪的元素。
- **怎么避免父级被动响应？** 在 Portal 内容根节点上停止传播，或把交互处理完全下沉到 Portal 内的组件。

</details>

---

## 53. Error Boundary 能捕获哪些错误？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

Error Boundary 捕获**其子树的渲染期错误**（render、构造函数、部分生命周期）以及 `lazy` 加载失败等由渲染触发的问题，然后渲染 fallback。

### 原理与示例

```jsx
class ErrorBoundary extends React.Component {
  state = { error: null }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    report(error, info.componentStack)
  }
  render() {
    if (this.state.error) return this.props.fallback
    return this.props.children
  }
}
```

目前没有等价的 Hook，错误边界仍需 class 组件或框架/库提供的封装。

### 边界与易错点

- **不捕获**：事件处理器里的错误、`setTimeout`/Promise 回调错误、请求 rejection、服务端渲染错误、以及边界自身的错误。
  → 请求错误交给数据层的 error 状态，事件与异步错误用 `try/catch` 或全局兜底（见第 26 题）。
- 边界要放在**路由级与关键区域**（例如列表区域独立），粒度太粗会让一个局部错误清空整页。
- 必须在 `componentDidCatch` 里上报错误、组件栈、版本与路由，否则用户只看到"页面出错了"。
- 边界不会自动重试：需要通过改变 `key` 或重置状态重建子树，并给用户提供入口。
- 开发环境的错误浮层会掩盖真实的 fallback 表现，验证降级效果要确认生产行为。

### 追问

- **为什么没有 Error Boundary Hook？** 它需要"捕获错误后回退并重新渲染整棵子树"的生命周期语义，目前由 class 承担。
- **和全局监听的关系？** `window.onerror`/`unhandledrejection` 只能兜底观测，无法恢复 UI；边界提供局部降级。

</details>

---

## 54. 外部 store 为什么需要 `useSyncExternalStore`？什么是 tearing？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

并发渲染可能分多次、跨时间片地读取外部可变数据。如果同一次提交中不同组件读到**不同版本**的数据，界面内部就不一致，这就是 tearing（撕裂）。`useSyncExternalStore` 让 React 通过 `subscribe` + `getSnapshot` 协议读取外部数据，并在必要时同步刷新以消除不一致。

### 原理与示例

```js
const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
```

- `subscribe(callback)` 注册监听并返回取消函数。
- `getSnapshot()` 必须返回**不可变快照**，并在数据未变化时返回**同一个引用**。
- `getServerSnapshot` 供 SSR 使用，保证服务端与首次客户端渲染一致。
- 检测到快照在渲染期间被改写时，React 会同步重渲染来避免撕裂。

### 边界与易错点

- `getSnapshot` 每次返回新对象（`{...state}`、`.map()`、`.filter()` 的结果）会导致无限重渲染；必须返回 store 内部缓存的引用，这也是 selector 需要 memo 的原因。
- 它只提供一致的读取协议，不负责缓存、选择器优化与订阅粒度。
- 普通业务不需要手写 store：它是给状态库作者与浏览器 API 封装（`matchMedia`、`online` 事件）使用的底层能力。
- 它只解决读取一致性，**不解决**写入协调：多标签页、Worker 场景的同步策略仍需自己设计。

### 追问

- **tearing 在什么条件下出现？** 并发渲染开启 + 数据源在渲染过程中被外部修改 + 读取路径未走 React 的订阅协议。
- **状态库为什么需要它？** 因为 store 在 React 之外，必须通过这套协议安全接入并发渲染（见第 48 题）。

</details>

---

## 55. `startTransition/useTransition` 解决什么问题？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>
把某些更新标记为**非紧急的 transition**，让输入、点击等紧急交互优先响应；后台渲染可被更高优先级的更新打断并重做，从而减少可感知的卡顿。

### 原理与示例

```jsx
const [isPending, startTransition] = useTransition()

function handleChange(event) {
  const next = event.target.value
  setInput(next) // 紧急：受控输入必须立即更新
  startTransition(() => {
    setFilter(next) // 非紧急：昂贵列表可以后台更新
  })
}
```

`isPending` 用来给出"结果稍后更新"的视觉反馈，避免用户误以为界面卡死。

### 边界与易错点

- transition **不会让计算变快**，也不是防抖/节流：它只改变调度优先级，总计算量不变。
- 不能用 transition 控制受控输入的值，否则光标与输入字符会滞后。
- 被 transition 包裹的更新若触发 Suspense，会显示 fallback；要设计 reveal 顺序，避免已展示内容被大 spinner 替换。
- 跨 `await` 之后的更新是否仍属于 transition 取决于调用方式与版本，通常需要重新包裹，以当前官方文档为准。
- 用 transition 掩盖真正的性能问题（未虚拟化的长列表、循环内同步计算）只是推迟暴露。

### 追问

- **什么时候不该用？** 更新必须立即体现用户操作结果时，例如输入、开关、拖拽。
- **和 `useDeferredValue` 怎么选？** 能直接控制 `setState` 就用 transition；只能拿到值或不想改父组件时用 deferred value（见第 56 题）。

</details>

---

## 56. `useDeferredValue` 与 debounce 有什么区别？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","debounce"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

`useDeferredValue` 让某个值的**消费方**延后更新，属于渲染调度层面：没有固定延迟，可被紧急更新打断。debounce 属于时间层面：用于减少回调或请求的触发次数。

### 原理与示例

```jsx
const deferredQuery = useDeferredValue(query)
const results = useMemo(() => search(items, deferredQuery), [items, deferredQuery])
// 输入框用 query 保持即时响应，结果列表用 deferredQuery 延后渲染
```

- 首次渲染时 deferred value 等于当前值，后续更新中它"落后一拍"，在紧急更新结束后补上。
- 可以用 `query !== deferredQuery` 表示"结果正在追赶"，用来做透明度或加载提示。

### 边界与易错点

- 它**不会减少网络请求**：请求节流与缓存仍要自己做（debounce、缓存层或 server-state 库）。
- 没有时间参数，因此无法表达"300ms 后才请求"这类产品需求。
- 与 `memo` 配合才有意义：结果组件必须能按 props 引用跳过渲染，否则延后渲染无从体现。
- 常见组合：输入 state 立即更新 + 结果渲染用 deferred + 请求按产品需求 debounce 或走缓存。

### 追问

- **两者能互换吗？** 不能：一个是渲染优先级的推迟，一个是时间上的合并，解决的问题不同。
- **什么时候 debounce 仍不可替代？** 需要真正降低请求频率、保护后端时。

</details>

---

## 57. Suspense 是什么？它是否会自动请求数据？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","Suspense","请求"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

Suspense 是"子树尚未准备好"时展示 fallback 的 **UI 边界**与协调机制。它本身不是数据请求库——把普通 `fetch` 写进 Effect 不会因此触发 Suspense。

### 原理与示例

会触发 Suspense 的常见来源：

- `lazy(() => import(...))` 的代码加载。
- 支持 Suspense 的数据层或框架（路由 loader、RSC 数据获取）。
- `use(promise)` 读取 Promise。

```jsx
<Suspense fallback={<Skeleton />}>
  <Comments />
</Suspense>
```

### 边界与易错点

- 边界位置决定体验：局部边界只替换局部，外层边界会把已展示内容整体换成 fallback。
- 必须同时有 Error Boundary 处理加载失败，否则失败会冒泡到最近的错误边界之外。
- 避免"已展示内容被大 spinner 替换"：用嵌套边界、`useTransition` 或 deferred value 让旧内容保留到新内容就绪（见第 55 题）。
- 流式 SSR 场景下，边界的划分直接影响首屏可交互时间与内容的 reveal 顺序。
- 并发能力（中断、复用旧内容）依赖具体渲染模式，不要假设任何环境下都具备同样效果。

### 追问

- **Suspense 与手写 loading 状态的区别？** 它把"加载中"交给组件边界与调度统一处理，而不是让每个组件各自维护 `isLoading`。
- **为什么普通 fetch 不行？** 它不会"抛出 Promise"告诉 React 何时就绪，React 无从知道何时重试渲染。

</details>

---

## 58. `lazy` 与动态 import 如何实现代码分割？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

动态 `import()` 给打包器一个**异步 chunk 边界**；`lazy(() => import(...))` 把这个 Promise 交给 React，让组件在真正需要渲染时才加载，并用最近的 Suspense 边界展示 fallback。

### 原理与示例

```jsx
const Report = lazy(() => import('./Report'))

<Suspense fallback={<Skeleton />}>
  <Report />
</Suspense>
```

- 路由级分割通常是最佳起点：一次只加载当前页面所需代码。
- 需要预加载时，可以在空闲时机提前调用同一个 `import()`，模块缓存会复用。

### 边界与易错点

- 过度细分会产生大量小请求与 fallback 抖动，收益被抵消；应按路由与重型功能模块切分。
- 加载失败（离线、发布更新导致旧 chunk 404）必须配 Error Boundary 与重试/刷新策略，否则用户会白屏。
- `lazy` 只接受默认导出，具名导出需要先 `then` 转换。
- 分割减少首屏体积，但增加额外往返延迟；关键路径可考虑预加载或服务端渲染。
- 要验证 chunk 命名与长期缓存策略，避免发版后旧 chunk 被移除导致失败。

### 追问

- **`lazy` 会自动预加载吗？** 不会，只在渲染时触发加载；需要提前加载就自己调用 `import()`。
- **怎么判断切分是否有效？** 分析构建产物与首屏网络请求，确认入口体积与关键 chunk 符合预算（见第 82 题）。

</details>

---

## 59. SSR、hydration、streaming SSR 分别是什么？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","SSR"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

三者是不同层面的概念：SSR 是"服务端为这次请求生成 HTML"；hydration 是"客户端在已有 HTML 上接管并建立交互能力"；streaming SSR 是"服务端分块发送 HTML，让先就绪的部分先到达"。

### 原理与示例

- **SSR**：返回可立即展示的 HTML，改善首屏可见内容与部分 SEO/分享场景；但 hydration 完成前页面不可交互。
- **Hydration**：React 复用现有 DOM 而不是重建，要求服务端与客户端首次输出一致，否则出现 mismatch。
- **Streaming SSR**：服务端按块刷出 HTML，配合 Suspense 边界让已就绪部分先展示、先 hydration。

### 边界与易错点

- 常见 mismatch 原因：render 中使用 `Date.now()`/`Math.random()`、直接读取 `window`/`localStorage`、时区与本地化差异、非法 HTML 嵌套、服务端与客户端初始数据不一致。
- 不要用 `suppressHydrationWarning` 掩盖真实不一致，它只适用于极少数确定无风险的场景。
- hydration 需要下载并执行 JS，直接影响 TBT/INP；SSR 不等于更快的可交互时间。
- 第三方库要确认能在服务端执行（不访问 `document`），否则需动态导入或挪到 Effect 中。
- 数据获取位置要设计清楚：服务端预取的数据需要以可序列化形式传给客户端，避免"服务端拿一份、客户端再取一份"。

### 追问

- **SSR 一定优于 CSR 吗？** 不一定：静态托管、内网后台、重交互应用可能用 CSR 或静态生成更简单，要按首屏与 SEO 需求权衡。
- **streaming 的关键收益？** 慢数据不再阻塞整页首字节，已就绪区域可以更早展示并更早可交互。

</details>

---

## 60. Server Component 与 SSR 是同一个概念吗？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","SSR"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

不是同一个概念。SSR 关注"某次渲染输出 HTML"，是运行时选择；Server Component 是**组件模块边界与传输模型**：部分组件只允许在服务端执行，其渲染结果以特定表示传给客户端。

### 原理与示例

- Server Component 的代码不会进入客户端 bundle，可以直接访问数据库、文件系统与环境变量。
- Client Component 需要显式声明（如 `"use client"`），承载 state、Effect、事件与浏览器 API。
- 两者可以组合：Server Component 渲染 Client Component，并传入可序列化的 props。

因此 Server Component 既减少客户端 JS，又把数据获取放到靠近数据源的位置。

### 边界与易错点

- Server Component 不能使用 `useState`/`useEffect`/DOM API/事件处理；需要交互的部分必须下沉为 Client Component。
- 跨边界的 props 需要**可序列化**：函数、类实例、Symbol 都不能直接传递（Server Action 传的是引用而非函数体，属于例外）。
- 它强依赖框架与构建实现（路由约定、打包器、RSC 协议），不建议在无框架项目里自行拼装。
- 与 SSR 是"可以共存但不互为前提"：Client Component 也能被 SSR，Server Component 的输出也需要传输与渲染。

### 追问

- **Server Component 能替代 SSR 吗？** 不能，它解决的是代码归属与数据传输，首屏 HTML 仍由服务端渲染完成。
- **什么时候不该用？** 纯静态站点、纯客户端应用，或团队缺少对应框架与运维支撑时。

</details>

---

## 61. React 19 的 Actions、`useActionState`、`useOptimistic` 解决什么问题？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

它们围绕**异步 mutation**统一了 pending、错误、表单提交与乐观反馈的写法，把原本散落在组件里的多个状态收敛成一条 action 流程。

### 原理与示例

- **Actions**：可以是异步函数，交给表单或 `startTransition` 调用；React 负责维护提交期间的 pending 状态并协调错误。
- **`useActionState(action, initialState)`**：返回 `[state, formAction, isPending]`，action 的返回值成为新状态。
- **`useOptimistic(state, reducer)`**：请求进行中展示预期结果，真实结果到达后自动覆盖或回滚。
- **`useFormStatus()`**：在子组件中读取父级 `<form>` 的提交状态，不必层层传 props。

```jsx
const [error, submit, isPending] = useActionState(async (_prev, formData) => {
  const result = await save(formData)
  return result.error ?? null
}, null)
```

### 边界与易错点

- 它们减少样板，但**不解决**业务幂等、权限校验、服务端验证、冲突合并与缓存一致性，这些仍要自己设计。
- 乐观更新前要判断失败概率、回滚成本与用户能否理解冲突；库存、余额类操作不应乐观。
- 失败要有明确 UI：action 抛错不会自动变成用户可读的提示，`useActionState` 返回的状态必须渲染出来。
- 状态仍属于组件内部，不是全局数据层；与 server-state 缓存的失效、重取配合时要划清职责。
- 这些 API 需要 React 19+；面向存量版本要能说明替代写法（手写 pending/error 状态）。

### 追问

- **乐观更新什么时候不该用？** 结果不可逆、失败代价高，或必须强一致确认时。
- **和 `useTransition` 的关系？** action 提交本质上是一次 transition，因此可以用 `isPending` 做非阻塞反馈（见第 55 题）。

</details>

---

## 62. React Compiler 会让 `useMemo/useCallback` 消失吗？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

Compiler 能在构建时分析组件并自动插入一部分 memoization，从而减少手写缓存。但它**不会**消除所有性能问题，也不改变"组件必须纯净、Hook 调用规则、状态边界、订阅粒度、算法复杂度"这些根本约束。

### 原理与示例

- 它依据组件的静态可分析性自动缓存计算值与 JSX，效果上等价于自动生成细粒度 memo。
- 代码必须符合规则（渲染纯净、不违反 Hook 规则）才会被优化；不合规的部分会被跳过，而不是被强行改写。

### 边界与易错点

- 手写 `memo`/`useMemo` 仍然有效，有时仍然必要：跨组件边界的 `memo`、需要精确控制依赖、或代码不在 Compiler 处理范围内。
- 它不修复错误的数据流设计：状态位置不合理、Context 粒度过粗、列表未虚拟化，都不会因此变快（见第 48、68 题）。
- 启用需要评估编译兼容性、第三方库、构建链与回归测试成本，并保留前后性能对照数据。
- 面试回答应落在"先写正确且纯净的组件、用测量决定是否优化"，而不是声称可以全面删除 memo API。

### 追问

- **有了 Compiler 还需要 Profiler 吗？** 需要，优化效果与回归都靠测量证明。
- **它会改变 Hook 语义吗？** 不会，调用顺序约束与状态归属不变（见第 39 题）。

</details>

---

## 63. React 19.3 有哪些需要了解但不用死背的变化？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

这类题考的不是背版本号，而是能否说明"每个变化解决什么问题、有什么前置条件、在哪个版本可用，以及对迁移的影响"。以本文档更新时的 React 19.3 为例，发布说明中值得关注的是 View Transitions、Fragment Refs、`browser()`、Trusted Types 支持，以及持续演进的 Server Component 能力。

### 原理与示例

- **View Transitions**：把浏览器原生视图过渡能力接入 React 的更新流程，用于路由切换、列表重排这类过渡动画；依赖浏览器支持，并且必须尊重用户的 reduced motion 偏好。
- **Fragment Refs**：允许把 ref 关联到 Fragment，便于测量或统一管理一组子节点。
- **`browser()`**：面向前端浏览器环境的 API 封装，具体用法以官方发布说明为准。
- **Trusted Types**：配合 CSP 的 Trusted Types 策略降低 DOM XSS 风险，属于安全加固方向。
- **Server Component**：能力持续演进，与框架和构建实现强相关（见第 60 题）。

具体 API 签名与限制请以官方发布说明为准，不要在不确定的情况下编造调用方式。

### 边界与易错点

- 不要编造使用经验，也不要把新 API 当作通用基础题答案；能说清"解决的问题 + 前置条件 + 最小示例"即可。
- 要能区分"19 引入"与"19.3 新增或稳定化"，区分不了就明确说"以官方说明为准"，而不是硬猜。
- 面试官更关心升级评估：破坏性变更、依赖与构建插件兼容、并发相关行为变化、回归测试成本。
- 国内存量岗位可能仍基于较早版本，能说明"旧写法 → 新写法"的迁移路径，比背版本号有价值得多。

### 追问

- **升级前要检查什么？** 官方破坏性变更清单、依赖与构建链兼容性、测试覆盖的关键流程，以及是否需要灰度发布。
- **怎样避免"背了没用"？** 每个特性只记三件事：解决什么问题、前置条件、一个最小示例；其余细节查阅官方文档。

资料来源：[React 19.3 官方发布说明](https://react.dev/blog/2026/09/09/react-19-3)、[React Versions](https://react.dev/versions)。

</details>

---

## 64. 为什么 render 中不能产生副作用？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

render 的产物只能是"根据 props/state/context 计算出的 element"。它可能被调用多次、被暂停、被丢弃，或以不同优先级重新执行，因此任何副作用都可能产生**不可撤销且次数不可预期**的外部影响。

### 原理与示例

render 被重复执行的典型场景：

- Strict Mode 在开发环境刻意双调用组件函数。
- 并发渲染中的中断与重放：低优先级渲染被打断后会重新开始。
- Suspense 相关流程中组件可能先渲染再被丢弃。

因此 render 中不允许：发请求、写 DOM、修改全局或外部变量、修改 `ref`、写日志、把时间或随机数当作唯一真相。

```jsx
// 错误：每次 render 都发请求，次数不可控
function Profile({ id }) {
  fetch(`/api/user/${id}`)
  return <div />
}
```

### 边界与易错点

- 触发来源决定位置：用户操作直接引发 → 事件处理器；渲染结果需要同步外部系统 → Effect；纯计算 → render 内直接算（见第 40 题）。
- render 中调用 `Math.random()`/`Date.now()` 会破坏可预测性与 hydration 一致性；需要这类值应在事件或 Effect 中生成。
- 修改 `ref.current` 同样属于副作用（见第 46 题）。
- 缓存与去重不能依赖"render 只跑一次"的假设，应放到数据层或 Effect 处理。
- 开发与生产的行为差异不能作为"安全"的依据：生产环境同样可能重复执行 render。

### 追问

- **怎么判断一段逻辑该放哪？** 先问触发来源：用户操作放事件处理器，外部同步放 Effect，纯计算留在 render。
- **为什么强调"纯"而不只是"幂等"？** 纯函数同时保证可缓存、可重放、可比较，是并发渲染能够中断并重做的前提。

</details>

---

## 65. 父组件 render，子组件一定 render 吗？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

不一定。讨论这个问题前必须把"render"拆成三层：**组件函数是否执行**、**React 是否做了协调工作**、**DOM 是否变化**。父组件重新执行并返回新的子 element 时，React 通常会让子组件进入协调，但存在可以跳过的情形。

### 原理与示例

可能跳过或减少工作的情况：

- 子组件被 `memo` 包裹，且 props 浅比较相等。
- 父组件把**已存在的 element** 作为 `children` 传入：element 对象引用未变，该子树可以跳过重新协调。
- 子组件自身没有更新需求（自己的 state/context 未变）。
- 编译器自动缓存了组件或计算结果。

```jsx
// 每次 render 都新建 element，Child 无法跳过
<Child items={items} />
```

### 边界与易错点

- 即使子组件函数执行了，**DOM 也可能完全不变**：协调结果相同就不会产生 DOM 操作。
- 优化前必须用 Profiler 证明这部分渲染昂贵且重复，否则只是增加复杂度（见第 47 题）。
- 用 `useMemo` 稳定 `children` 是有效手段，但前提是父组件确实频繁重渲染。
- 不要为了减少子组件渲染而把状态提到不合理的位置：状态所在层级本身就决定了更新范围（见第 71 题）。

### 追问

- **`memo` 之后仍然重渲染的原因？** props 中含有每次新建的对象或函数、组件自身 state 变化、或它读取的 context 变化。
- **怎么快速定位重复渲染？** React DevTools Profiler 的 Highlight updates 与 commit 记录。

</details>

---

## 66. 为什么把组件定义在另一个组件内部可能丢失 state？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","state"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

因为外层组件每次 render 都会创建一个**新的函数对象**。React 在协调时按"位置 + type"判断元素身份，type 变了就把该位置视为另一个组件：卸载旧树、挂载新树，局部 state、ref 与 Effect 全部重建。

### 原理与示例

```jsx
function Parent() {
  function Child() { /* 每次 Parent render 都是不同的 type */ }
  return <Child />
}
```

同类问题还包括：在 render 中调用 `React.memo(...)` 或 `lazy(...)` 生成组件、以及使用每次新建的组件标识。

### 边界与易错点

- 症状不只是"state 丢失"：输入焦点、滚动位置、子组件内部请求、动画状态都会重置。
- 如果子组件确实需要父作用域的数据，应通过 props 传入，而不是把组件定义在内部。
- 需要"切换实体时重置状态"时，应该用 `key` 显式表达身份，而不是依赖 type 变化这种隐式行为（见第 32 题）。
- 这类问题通常不会报错，常见表现是"输入框莫名清空""列表滚动位置跳动"。

### 追问

- **定义在内部一定不行吗？** 只要它不作为独立组件被协调复用就可以；但实际项目中应默认移到模块顶层，避免依赖这种脆弱假设。
- **和改 `key` 有区别吗？** 二者都是卸载重建；区别是 type 变化通常是意外，`key` 变化是有意为之。

</details>

---

## 67. React 中为什么不建议把 props 复制到 state？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","state"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

复制会制造**两个真相来源**：prop 变化时 state 该不该跟着变？用户的本地编辑该不该保留？语义无法判定，通常还要用 Effect 去同步，带来额外渲染与一帧旧值。

### 原理与示例

```jsx
// 反模式：语义含糊，用户输入还可能被覆盖
function Editor({ value }) {
  const [text, setText] = useState(value)
  useEffect(() => setText(value), [value])
}
```

对应替代方案：

- **只是派生** → 在 render 中直接计算，不存 state（见第 36 题）。
- **"初始值之后可独立编辑"** → 用 `defaultValue`/`initialX` 命名明确语义，只在挂载时生效。
- **切换实体时需要重置** → 用 `key` 表达身份，让 React 重建组件。

### 边界与易错点

- 用 Effect 同步 props → state 会把组件变成"受控与不受控混合体"：用户输入可能被 props 覆盖，且多一次渲染。
- 只在 props 变化时更新的 state，往往说明它应该整体上移或下移（见第 71 题）。
- 组件要同时支持受控与非受控时，API 必须显式区分（`value` 与 `defaultValue`），不要让开发者猜（见第 105 题）。
- 派生数据计算昂贵时用 `useMemo`，而不是把它存成 state（见第 47 题）。

### 追问

- **表单初始值怎么处理？** 用 `defaultValue`/`initialValues` 并在文档中写明"仅初始生效"，或直接用 `key` 重建表单。
- **什么时候真的要复制？** 需要保留历史快照（对比、撤销）时——那时它是独立数据，而非"props 的副本"。

</details>

---

## 68. React 列表性能差，应按什么顺序排查？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","性能"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

先测量再优化。顺序是：在可复现条件下采集数据 → 判断瓶颈在哪一层 → 检查 `key` 与状态位置 → 再考虑虚拟化或 memo。

### 原理与示例

1. 在 production build、可复现数据与设备下，用 React Profiler 与 Performance 面板录制。
2. 判断瓶颈层级：JS 计算、组件 render 次数、DOM 节点数量、layout/paint，还是请求瀑布。
3. 检查 `key` 是否稳定、state 是否放得太高、Context/selector 订阅范围是否过大。
4. 数据量巨大先分页或虚拟化；确认是纯计算昂贵再上 memo。
5. 把高频更新的输入与整表拆开，避免整张表跟随一个受控输入重渲染。
6. 同条件复测，并记录 trade-off（复杂度、可访问性、内存）。

### 边界与易错点

- 虚拟化减少 DOM，但会引入动态高度、可访问性、浏览器内查找（Ctrl+F）、打印与滚动定位的复杂度，不是所有列表都需要。
- 先修 `key` 与状态位置，收益通常比加 memo 更大。
- 不要只盯"渲染次数"：渲染本身便宜时，次数多未必是问题。
- 行内创建对象/函数会让 `memo` 失效，但只有子组件确实昂贵时才值得处理（见第 47 题）。

### 追问

- **怎么证明确实变快？** 用相同数据与设备对比 commit 时长、长任务数量与 INP，而不是凭感觉（见第 114 题）。
- **虚拟化和分页怎么选？** 需要滚动浏览完整数据用虚拟化；只需要分段查看用分页更简单。

</details>

---

## 69. React 测试应该测试什么？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","测试"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

优先测试**用户可观察的行为与高风险边界**：用户看到什么、点击输入什么、最终状态是什么。避免断言内部 state、私有方法、CSS 类名与 Hook 调用次数。

### 原理与示例

分层策略：

- 纯逻辑（reducer、权限判断、数据转换）：单元测试，快且稳定。
- 组件与集成（表单、请求状态、交互）：用 Testing Library 走真实交互路径。
- 关键链路（登录、下单、支付）：E2E 覆盖少量高频主路径。

```tsx
await userEvent.type(screen.getByLabelText('邮箱'), 'a@example.com')
await userEvent.click(screen.getByRole('button', { name: '提交' }))
expect(await screen.findByText('提交成功')).toBeVisible()
```

### 边界与易错点

- 用语义查询（`getByRole`、`getByLabelText`）而不是 `container.querySelector`：前者同时验证了可访问性。
- 异步用 `findBy*`/`waitFor`，不要用固定 `setTimeout` 等待，否则会产生 flaky 测试。
- 断言实现细节（state 值、内部方法调用次数、CSS 类）会让重构变成"改测试"，而不是暴露真实回归。
- 网络与时间要可控：mock 放在 HTTP 或数据层边界，不要 mock 组件内部实现。
- 覆盖率不是目标；失败时能否指出业务风险更重要。

### 追问

- **快照测试该用吗？** 大量快照会变成"一改就批量更新"的噪声，只对少量稳定结构使用。
- **E2E 应该覆盖多少？** 少量关键路径即可，过多会带来运行时长与稳定性问题（见第 85 题）。

</details>

---

## 70. React 项目中 server state 与 client state 如何划分？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","state"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

按"**数据由谁拥有、生命周期由谁决定**"来划分：server state 由服务端拥有，异步、共享、可能过期；client state 属于当前 UI；URL state 承载需要可分享与可恢复的状态。

### 原理与示例

- **server state**：列表、详情、统计结果。核心特征是"可能过期"，因此需要缓存、失效、去重与重试策略。
- **client state**：弹窗开关、当前步骤、临时草稿、选中项，生命周期与页面一致。
- **URL state**：筛选条件、分页、当前 tab，需要可分享、刷新保留、前进后退可用。
- **表单状态**：通常属于 client state，但要明确以 URL 或 server state 作为权威来源。

划分原则：为每类数据指定**唯一权威来源**，其他位置只做派生或缓存。

### 边界与易错点

- 不要把请求结果同时写进 query cache 和全局 store：两个真相来源会带来不一致与双份维护。
- mutation 之后有三种策略：精确写入缓存、invalidate 触发重取、直接采用服务端返回结果。选择取决于一致性要求与请求成本，不能一律全量 invalidate。
- 把筛选/分页放在组件 state 会导致无法分享、刷新丢失，应放进 URL。
- 把 server state 全量搬进全局 store 会丢掉过期与去重能力，等于自己重写一套缓存语义。
- 乐观更新必须与缓存失效策略配合，否则会出现"界面更新了但列表仍是旧数据"。

### 追问

- **要不要引入 server-state 库？** 多出共享请求结果、需要统一的失效与重试策略时值得；只有零星请求时自定义 Hook 也够。
- **URL 里该放多少？** 只放可分享、可恢复的必要条件；弹窗、临时展开态不要进 URL。

</details>

---

## 71. React 中"状态下沉"为什么常比 memo 更有效？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

因为**状态所在的层级直接决定更新范围**。把高频状态放到真正使用它的组件里，不相关的兄弟子树根本不会参与协调；而 `memo` 只是"更新已经发生之后"的跳过机制。

### 原理与示例

```jsx
// 状态在顶层：每次输入都让整棵树重新执行
function Page() {
  const [query, setQuery] = useState('')
  return (
    <>
      <SearchInput value={query} onChange={setQuery} />
      <ExpensiveChart /> {/* 不依赖 query，却一起重渲染 */}
    </>
  )
}

// 状态下沉：ExpensiveChart 不再受影响
function Page() {
  return (
    <>
      <SearchInput />
      <ExpensiveChart />
    </>
  )
}
```

另一种常用手法是"状态包装组件 + 稳定 children"：外层只持有状态，把不变的 `children` 原样透传，使该子树的 element 引用保持稳定。

### 边界与易错点

- 状态下沉的收益来自**结构本身**，不依赖调用方维护 props 引用稳定性，因此更易读、更少隐式约定。
- 不要过度下沉：如果多个分支都需要这份状态，就会被提升回来，形成来回搬运。
- `memo` 仍然有用：状态确实必须在高层、且子组件昂贵时才需要它配合稳定 props 生效（见第 47 题）。
- 如果把状态下沉后又放进 Context 供深层消费，更新范围会重新放大（见第 48 题）。

### 追问

- **为什么"稳定 children"能生效？** element 引用未变时可以跳过该子树的重新协调（见第 65 题）。
- **什么时候该改结构而不是加 memo？** 只要看到不相关组件跟着更新，先动结构；结构无法再调时才 memo。

</details>

---

## 72. React 中如何避免重复提交？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

前端可以做 pending 禁用、忽略重复点击、生成请求 id；但**真正保证"只有一次副作用"的是服务端的幂等键或唯一约束**。前端防护属于体验层，不是安全边界。

### 原理与示例

前端手段：

- 提交期间把按钮置为 pending 并禁用，同时给出明确反馈。
- 在 handler 里用 ref 防御双击竞态（`isPending` 状态在同一事件循环内可能还没更新）。
- 为每次提交生成唯一请求 id（幂等键）随请求一起发送。

```jsx
const submittingRef = useRef(false)

async function handleSubmit() {
  if (submittingRef.current) return
  submittingRef.current = true
  try {
    await submit({ idempotencyKey: crypto.randomUUID() })
  } finally {
    submittingRef.current = false
  }
}
```

服务端手段：幂等键去重、唯一约束、状态机校验（例如订单状态不允许重复流转）。

### 边界与易错点

- 只禁用按钮不够：刷新页面、多标签页、多个入口、弱网自动重试都会绕过前端限制。
- 失败时不要永久禁用按钮，必须提供重试入口，并区分"业务拒绝"与"网络失败"（见第 26 题）。
- 乐观更新失败要回滚或重新拉取权威状态，否则 UI 与服务端不一致（见第 61 题）。
- 重试必须幂等：可安全重试的配合幂等键与指数退避；不可重试的直接暴露错误。
- 提交状态要与 UI 三态（pending/success/error）对应，避免用户靠反复点击试探结果。

### 追问

- **幂等键由谁生成？** 前端生成，并在重试时复用同一个 key；服务端按 key 去重，这样重试不会产生重复副作用。
- **弱网下怎样体验更好？** 明确 pending 反馈、支持取消，并保证刷新后能查到最终状态（以服务端查询为准）。

</details>

---

# 第三部分：浏览器、TypeScript 与工程补充题

## 73. 从输入 URL 到页面显示发生了什么？

<!-- question: {"category":"browser","type":"theory","difficulty":"basic","tags":["浏览器"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

这不是一条固定流水线，而是"解析 → 缓存/网络 → 构建渲染树 → 布局绘制合成 → 执行脚本并持续更新"的循环。回答必须区分**看到内容**与**可顺畅交互**两个阶段。

### 原理与示例

1. **导航与预检**：解析 URL；HSTS 升级、Service Worker 拦截、强缓存命中都可能直接短路后续步骤。
2. **网络**：DNS → TCP/TLS（HTTP/2、HTTP/3 可复用连接）→ 请求响应（含压缩与协商缓存）。
3. **解析与构建**：HTML 流式解析成 DOM，CSS 形成 CSSOM，二者合成渲染树；脚本按 `async`/`defer`/默认规则影响解析阻塞。
4. **布局与绘制**：layout 计算几何 → paint 生成绘制指令 → composite 合成图层。
5. **资源发现与继续加载**：图片、字体继续请求，preload/preconnect 可提前介入。
6. **脚本执行**：React 创建根或 hydration，页面开始响应交互。
7. **持续迭代**：交互触发新更新，重复"计算 → 布局 → 绘制 → 合成"。

### 边界与易错点

- 只背 DNS/TCP 会被追问打回：要能说明缓存层、连接复用、脚本阻塞与资源优先级。
- 强缓存命中或 Service Worker 接管时，DNS/TCP 根本不发生——顺序不是固定的。
- "看到内容"（LCP 相关）与"可顺畅交互"（INP/TBT 相关）是两个阶段：SSR 改善前者，却可能因 hydration 拖慢后者。
- 现代优化点：`preconnect`/`preload`、`fetchpriority`、字体策略、关键 CSS 内联、减少阻塞脚本。

### 追问

- **哪个阶段最影响首屏？** 依次看 TTFB（网络与后端）、阻塞资源、以及 LCP 元素的发现与加载时机。
- **为什么强调流式解析？** HTML 不必下载完就能构建 DOM 并开始发现资源，这正是 early hints 与流式 SSR 的价值。

</details>

---

## 74. 强缓存与协商缓存如何工作？

<!-- question: {"category":"browser","type":"theory","difficulty":"basic","tags":["浏览器","缓存"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

强缓存在有效期内**直接复用**、不发请求；协商缓存需要在过期后向服务端验证，未变化时返回 304 并复用本地副本。

### 原理与示例

- 强缓存由 `Cache-Control` 的 `max-age`、`s-maxage`、`immutable` 等控制。
- 协商缓存依靠 `ETag`/`If-None-Match`（精确到内容）或 `Last-Modified`/`If-Modified-Since`（精确到秒）。
- 推荐策略：

| 资源 | 策略 |
| --- | --- |
| 带内容 hash 的 JS/CSS | 长 `max-age` + `immutable` |
| HTML | 短缓存或 `no-cache`，保证引用到新 hash |
| 接口数据 | 按业务容忍度或用 `no-store` 交给应用层缓存 |

（表格在移动端较窄时可改用列表呈现。）

### 边界与易错点

- `no-cache` ≠ 不缓存：它是"使用前必须验证"；`no-store` 才是不存储，但会影响 bfcache 与性能，慎用。
- `must-revalidate`、`max-age=0`、`no-cache` 语义不同，不要混用。
- 刷新（F5 / Ctrl+F5）与普通导航触发的缓存策略不同，测试时要说明操作方式，必要时用 DevTools 禁用缓存做对照。
- 304 仍然是一次网络往返，跨地域场景下收益不如本地强缓存。
- CDN 有独立的边缘缓存（`s-maxage`、`stale-while-revalidate`），排查"改了没生效"时先确认命中的是哪一层。

### 追问

- **怎样保证发版后用户拿到新资源？** HTML 不缓存或短缓存 + 静态资源用内容 hash + 发布时更新 HTML 引用。
- **"ETag 每次都变"为什么是问题？** 它会让协商缓存永远无法命中 304，退化为完整下载，常见于每次都重新生成的 ETag。

</details>

---

## 75. CORS 是什么？为什么 Postman 正常而浏览器失败？

<!-- question: {"category":"browser","type":"theory","difficulty":"intermediate","tags":["浏览器","CORS"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

CORS 是浏览器在同源策略之上提供的**受控放宽机制**：服务端用响应头声明哪些来源可以读取跨源响应。Postman 不受页面同源策略约束，所以"接口本身成功"不能说明浏览器端允许 JS 读取响应。

### 原理与示例

- **简单请求**：直接发送，浏览器检查 `Access-Control-Allow-Origin` 是否允许当前源。
- **非简单请求**：先发 `OPTIONS` preflight，校验 `Allow-Origin`、`Allow-Methods`、`Allow-Headers` 后再发真实请求。
- **携带凭据**（`credentials: 'include'`）：`Allow-Origin` 必须是具体来源、不能是 `*`，同时需要 `Allow-Credentials: true`。
- 需要读取额外响应头时用 `Access-Control-Expose-Headers`。

### 边界与易错点

- 报错信息常统一显示为"被 CORS 策略阻止"，但真实原因可能是 5xx、证书问题、重定向链或 `Allow-Origin` 不匹配，必须结合 Network 面板判断。
- CORS 是浏览器对**读取**的限制，**不是鉴权**：它不阻止其他服务端调用接口，服务端鉴权与防重放不能省。
- Cookie 还受 `SameSite`/`Secure`/`Domain` 约束，跨站场景下即使 CORS 通过也可能不带凭据。
- 同源由协议 + 域名 + 端口共同决定，`localhost` 与 `127.0.0.1` 不同源。
- 开发环境常靠代理绕过跨源，上线后必须验证真实 CORS 配置，否则会出现"本地正常、线上失败"。

### 追问

- **preflight 会被缓存吗？** 会，由 `Access-Control-Max-Age` 控制；设置过短会导致 OPTIONS 频繁往返。
- **怎样减少 preflight 次数？** 让请求保持"简单请求"形态（受限的方法、请求头与 Content-Type），或把跨源调用收敛到同一来源。

</details>

---

## 76. XSS、CSRF 与 CSP 分别是什么？

<!-- question: {"category":"browser","type":"theory","difficulty":"intermediate","tags":["浏览器","XSS","CSRF","CSP"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

三者解决的是不同问题：XSS 是"不可信内容被当作代码执行"；CSRF 是"攻击者利用浏览器自动携带的凭据发出非预期请求"；CSP 是服务端下发的资源与执行策略，用来降低注入类攻击的影响面。

### 原理与示例

- **XSS 防护**：按上下文编码（HTML、属性、URL、JS），使用安全 DOM API，富文本必须做白名单 sanitize，避免危险 sink（`innerHTML`、`eval`、`document.write`）。
- **CSRF 防护**：`SameSite` Cookie、CSRF token、校验 `Origin`/`Referer`、关键操作二次确认。
- **CSP**：限制脚本来源、禁止内联脚本与 `eval`、控制 `frame-ancestors` 等，属于纵深防御。

```jsx
// 危险：把用户输入当 HTML 注入
element.innerHTML = userInput

// 安全：交给 React 作为文本渲染
return <p>{userInput}</p>
```

### 边界与易错点

- React 默认转义 JSX 插值，但 `dangerouslySetInnerHTML`、直接操作 DOM、`href={userInput}`（`javascript:` 协议）、以及第三方库写入的 HTML 都会绕过保护。
- sanitize 必须用成熟库做白名单，同时过滤危险 URL 协议与非白名单属性；自己写黑名单几乎必然漏。
- CSRF token 要绑定会话并在服务端校验，不能只放前端隐藏字段；`SameSite=Lax` 已是现代浏览器的常见默认值，跨站场景仍需显式评估。
- CSP 上线应先 `report-only` 收集违规，避免直接阻断业务；内联脚本与第三方脚本是主要阻力。
- 三者边界不同：XSS 是内容注入，CSRF 是请求伪造，CSP 是策略加固，不要混为一谈。

### 追问

- **`httpOnly` Cookie 能防 XSS 吗？** 它能避免脚本直接读取凭据，但无法阻止 XSS 冒用用户身份发请求；XSS 一旦发生，危害远超读取 token。
- **前后端如何分工？** 前端负责编码与安全 DOM 操作、依赖 CSP；后端负责输入校验、输出编码、鉴权与 CSRF 校验。

</details>

---

## 77. layout、paint、composite 有什么区别？

<!-- question: {"category":"browser","type":"theory","difficulty":"intermediate","tags":["浏览器"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

三者是渲染流水线的不同阶段：layout 计算元素的几何位置与尺寸；paint 生成绘制指令（把元素画成像素内容）；composite 把多个图层合成到屏幕。

### 原理与示例

- 触发到哪一步取决于改动内容：几何类（`width`、`top`、`margin`、字体变化）会触发布局及之后；视觉类（`color`、`box-shadow`）主要触发绘制；`transform`、`opacity` 在满足条件时可以只走合成。
- 交替读取布局信息（`offsetHeight`、`getBoundingClientRect`）与写样式会造成**强制同步布局**。

```js
// 反模式：读 → 写 → 读 → 写，每轮都强制布局
items.forEach((el) => {
  el.style.width = el.offsetWidth + 10 + 'px'
})

// 正确：先批量读，再批量写
const widths = items.map((el) => el.offsetWidth)
items.forEach((el, i) => {
  el.style.width = widths[i] + 10 + 'px'
})
```

### 边界与易错点

- "改动几何必定重排"是简化说法：浏览器会合并同一帧内的读写，但被脚本连续打断的强制同步布局是真实成本。
- 提升为合成层不是免费的：图层占用显存并增加合成开销，滥用 `will-change` 会造成内存压力。
- `transform`/`opacity` 的"只走合成"有前提（不影响布局、不被祖先的 `filter`/`overflow` 等打断），不要当作绝对规则。
- 用 Performance 面板的 Layout/Paint 时长与布局偏移计数验证，而不是靠属性清单猜。
- 动画优先使用 `transform`/`opacity` 并配合 `requestAnimationFrame`，高频监听器加 `{ passive: true }`。

### 追问

- **怎么定位强制同步布局？** 在 Performance 面板看 `Recalculate Style`/`Layout` 是否被脚本的读写交替触发。
- **`contain`/`content-visibility` 有什么用？** 限制布局与绘制的计算范围，减少大范围重排，适合长列表与复杂区域。

</details>

---

## 78. `any`、`unknown`、`never` 如何区分？

<!-- question: {"category":"typescript","type":"theory","difficulty":"basic","tags":["TypeScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

`any` 关闭该值的类型检查并向外传染；`unknown` 表示"未知但安全"，使用前必须收窄；`never` 表示"不可能存在"，常用于穷尽检查与永不返回的函数。

### 原理与示例

```ts
function parse(input: unknown) {
  if (typeof input !== 'string') throw new TypeError('expect string')
  return input.toUpperCase() // 收窄之后才能用
}

function assertNever(value: never): never {
  throw new Error(`Unexpected: ${String(value)}`)
}
```

- `unknown` 可以接受任何值，但只能赋值给 `unknown`/`any`，且不能直接访问属性。
- `never` 是所有类型的子类型，可以赋值给任何类型，但没有任何值属于它。

### 边界与易错点

- `any` 会沿赋值与调用链扩散，让上游的错误在整条链路上消失；团队内应尽量禁用或严格限制。
- "用 `as` 断言一下"会丢掉与 `any` 同等的检查，只是形式更隐蔽；能用类型守卫或收窄就不要断言。
- 类型在运行时被擦除，外部输入（HTTP、`localStorage`、`postMessage`）必须做运行时校验，类型声明不能替代校验。
- `never` 的典型用途是穷尽检查：联合类型新增成员时，未处理的 `switch` 分支会直接编译报错。
- `string & number` 这类"不可能成立"的交叉类型也能表达不可达，但通常说明类型设计本身有问题。

### 追问

- **`unknown` 与泛型怎么选？** 要保留调用方传入的具体类型用泛型；只表示"外部来的未知输入"用 `unknown`。
- **怎么发现 `any` 扩散？** 打开 `noImplicitAny`，用 lint 规则限制显式 `any`，并排查第三方类型缺失处。

</details>

---

## 79. `type` 与 `interface` 怎么选？

<!-- question: {"category":"typescript","type":"theory","difficulty":"basic","tags":["TypeScript"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

两者都能描述对象形状并支持扩展，差别集中在**能力与语义**：`interface` 支持声明合并，适合可扩展的公开契约；`type` 能直接表达联合、元组、条件、映射等类型运算。

### 原理与示例

```ts
interface UserDTO {
  id: string
  name: string // 同名接口会被合并
}

// 只能声明一次，但能表达联合与类型运算
type Result = { ok: true } | { ok: false; error: Error }
type UserId = UserDTO['id']
```

- `interface extends` 与 `type` 的交叉在冲突场景下行为不同：接口冲突会直接报错，交叉可能得到 `never`。
- 两个在对象形状描述上的性能差异通常可忽略，不要把它当决策依据。

### 边界与易错点

- "`interface` 性能一定更好"站不住脚，现实中几乎不构成选型理由。
- 声明合并是双刃剑：它让扩展第三方类型成为可能，也可能让同名接口意外合并出难以排查的类型。
- 需要约束类实现时 `interface` 更自然；需要联合、条件、映射类型时只能用 `type`。
- 公共库中要谨慎使用声明合并，避免使用者无意改变类型形状。
- 团队约定优先：混用没问题，但同一项目里应保持一致，避免同一概念两种写法。

### 追问

- **`type` 能被 `implements` 吗？** 能，类可以实现对象类型别名，只要形状可用。
- **什么时候必须用 `interface`？** 需要声明合并时，例如扩展第三方库的全局类型声明。

</details>

---

## 80. 泛型的本质是什么？

<!-- question: {"category":"typescript","type":"theory","difficulty":"intermediate","tags":["TypeScript","泛型"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

泛型用**类型参数**保留多个位置之间的类型关系，而不是把具体类型写死或退化成 `unknown`。它的价值在于让"输入与输出之间的依赖关系"被类型系统表达出来。

### 原理与示例

```ts
function first<T>(items: readonly T[]): T | undefined {
  return items[0]
}

const value = first([1, 2, 3]) // number | undefined

function pick<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
```

- 好的泛型 API 让调用方通过参数**推导**类型参数，不需要手写 `<T>`。
- 约束（`extends`）表达"所需的最小能力"，而不是提前写死具体实现类型。

### 边界与易错点

- 类型参数只出现一次、没有建立任何关系时，它通常没有意义（等价于 `unknown`）。
- 泛型不能替代运行时校验：外部数据仍要在边界处校验（见第 78 题）。
- 推导失败时不要立刻显式传 `<T>`，先检查参数类型是否丢失了信息（例如被写成 `unknown[]`）。
- 过深的类型运算会拖慢 tsc 并降低可读性；能用简单联合表达就不要上条件类型。
- 默认类型参数与约束要写清楚，避免调用方被迫传多余参数。

### 追问

- **泛型与重载怎么选？** 优先用"参数对象 + 判别联合"表达多形态；参数列表确实不同时才用重载。
- **`extends` 在泛型里有两种含义？** 泛型约束（限制类型参数）与条件类型（`T extends U ? X : Y`），语境不同。

</details>

---

## 81. discriminated union 为什么适合 UI 状态？

<!-- question: {"category":"typescript","type":"theory","difficulty":"intermediate","tags":["TypeScript"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

用共同的字面量字段区分状态，让每个分支只携带该状态下合法的数据，并通过 `never` 做穷尽检查。它从类型层面排除了"多个布尔同时为真"这类非法组合。

### 原理与示例

```ts
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Item[] }
  | { status: 'error'; error: Error }

switch (state.status) {
  case 'success':
    state.data // 只有这个分支能访问 data
}
```

- 分支专属字段只在对应状态下存在，访问时无需可选链或断言。
- 新增状态后，未处理的分支会被穷尽检查暴露出来。

### 边界与易错点

- 相比多个布尔（`isLoading`/`isSuccess`/`hasError`），联合类型从结构上禁止非法组合，也避免"忘记重置某个标志"的 bug。
- 当状态确有正交维度（如"加载中"与"是否有下一页"）时，强行扁平化为单一联合会让转换逻辑变复杂，需要权衡。
- 穷尽检查要用 `default: assertNever(state)` 之类的兜底，否则新增成员不会报错。
- 适合 reducer action、请求状态、WebSocket 状态、审批流；状态转换非常复杂时进一步引入状态机。
- 服务端返回的多个布尔字段要在数据层转换成联合类型，不要直接把接口形状泄进 UI。

### 追问

- **需要同时表达多个维度怎么办？** 组合两个联合（如 `status` × `hasNext`），或显式建立状态机，避免组合爆炸。
- **它能替代测试吗？** 不能，但能大幅减少"非法状态"相关的分支测试。

</details>

---

## 82. tree shaking 为什么可能失败？

<!-- question: {"category":"engineering","type":"theory","difficulty":"intermediate","tags":["工程化"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

tree shaking 依赖**静态可分析的 ESM 结构**与准确的副作用信息。动态导入方式、顶层副作用、错误的 `sideEffects` 声明、整包聚合导入、以及只发布 CJS 的依赖都会让消除失败。

### 原理与示例

- ESM 的 `import`/`export` 是静态的，打包器才能判断哪些导出未被使用。
- 打包器需要知道模块是否有副作用，`package.json` 的 `sideEffects: false` 声明才允许安全删除未被引用的模块。
- 常见失败原因：
  - `require()` 或运行时拼接的导入路径。
  - 模块顶层执行副作用（注册全局、改写原型、polyfill）。
  - `sideEffects` 声明错误，或依赖只提供 CJS 产物。
  - `import * as X` 后动态访问成员，或从包入口整体导入。
  - 构建目标或输出格式不对（例如把 ESM 编译成 CJS 再打包）。

### 边界与易错点

- `sideEffects: false` 声明错误会**删掉必要的初始化代码**，属于危险操作，发布前必须验证。
- "体积没降"不一定是消除失败：也可能代码确实被引用，或被 CSS/资源引用链拉回来。
- 验证要看生产产物与可视化分析，而不是只看源码里的 import 写法。
- 动态 `import()` 是有意的分割点，不属于消除失败；它与静态消除是两件事（见第 58 题）。
- 类的方法、装饰器、反射式访问会让静态分析失效。

### 追问

- **怎么排查某个依赖没被摇掉？** 用分析工具看模块归属，再检查它的 `sideEffects` 声明、产物格式与你的导入方式。
- **`export * from` 有什么影响？** 它让静态分析更难，容易把整包导出拉进依赖图；必要时改为精确导出。

</details>

---

## 83. source map 有什么价值和安全风险？

<!-- question: {"category":"engineering","type":"theory","difficulty":"intermediate","tags":["工程化"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

source map 把压缩混淆后的代码位置映射回源码，用于线上错误定位。风险在于它可能暴露源码、内部路径、注释甚至接口信息，因此**不应公开部署**，而应上传到监控平台并按版本关联。

### 原理与示例

- 构建产出 `.map` 文件（或内联），其中包含源码路径，通常还包含 `sourcesContent`。
- 推荐做法：构建时生成并上传监控平台，线上服务器不对外提供 `.map`，或仅在内网并加鉴权。
- 错误堆栈必须与 release/sourcemap 版本对应，否则映射会错位。

### 边界与易错点

- 公开的 source map 会让任何人还原业务逻辑，包括内部接口、字段命名与注释。
- 无论有没有 source map，前端 bundle 里都不能出现密钥：两者是独立问题（见第 84 题的脱敏要求）。
- 内联 source map 会显著增大包体积，通常只在开发环境使用。
- 上传的 map 要按 release 归档并设置保留策略，否则历史版本错误无法定位。
- 混淆不是安全措施，只提高阅读成本；真正的防护在服务端校验与权限控制。

### 追问

- **线上错误怎么定位？** 上报 release 版本 + 错误堆栈 + 路由 + trace id，平台侧用对应 source map 还原（见第 84 题）。
- **能降低 map 精度吗？** 可以只保留部分映射信息，代价是定位准确度下降。

</details>

---

## 84. 前端监控应采集什么？

<!-- question: {"category":"engineering","type":"theory","difficulty":"intermediate","tags":["工程化"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

采集应围绕"**能定位问题**"设计：错误、性能指标、关键业务耗时与少量行为上下文，并统一附带 release、路由、设备与 trace/request id；同时对数据量、性能开销与个人信息做控制。

### 原理与示例

- **错误**：JS error、`unhandledrejection`、资源加载失败、接口失败、白屏检测（根节点无内容或首屏渲染超时）。
- **性能**：Core Web Vitals（LCP、INP、CLS）、TTFB，以及关键业务流程耗时（下单、支付、上传）。
- **行为**：关键操作路径与页面停留，只采最少必要信息。
- **标注**：release 版本、路由、设备与网络类型、trace/request id、脱敏后的用户标识。

### 边界与易错点

- 不是越多越好：全量采集会带来性能开销、存储成本与隐私风险，需要采样、聚合与分级上报。
- 错误要按指纹（message + stack + code）聚合，否则同一问题会刷出成千上万条记录。
- 告警应基于影响面（错误率、受影响用户数、持续时间），单条错误直接告警只会造成噪声疲劳。
- 个人信息必须脱敏：手机号、身份证、token、完整请求体不得上报，埋点同样受约束。
- 上报必须异步、可降级、有队列上限，采集失败不能影响业务流程。
- 数据要与 source map、发布记录关联，否则定位效率大打折扣（见第 83 题）。

### 追问

- **白屏检测怎么做？** 结合根节点内容检查、关键资源是否加载成功、首屏是否超时等多信号判断，避免误报。
- **怎么衡量监控自身的成本？** 观察它对 TBT 与长任务的影响，并统计上报体积占比。

</details>

---

## 85. CI 中前端项目最小质量门禁是什么？

<!-- question: {"category":"engineering","type":"theory","difficulty":"intermediate","tags":["工程化"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

最小门禁是"能在合并前拦住明显坏掉的提交"：可复现的依赖安装、lint、类型检查、与改动相关的测试，以及生产构建。风险更高的项目再叠加 E2E、bundle 预算、安全扫描与预览环境。

### 原理与示例

- **安装**：基于 lockfile 的可复现安装，保证 CI 与本地一致。
- **静态检查**：lint 与类型检查放在最前，快速失败。
- **测试**：优先跑与改动相关的范围；全量测试按需触发或分片并行。
- **构建**：执行生产构建，验证打包配置与体积预算（见第 82 题）。
- **增强项**：E2E、体积预算、依赖与安全扫描、预览环境、可访问性检查。

### 边界与易错点

- 门禁必须与本地命令一致：不能只在 CI 生效，否则会陷入"本地绿、CI 红"的来回折腾。
- 任务要可缓存、可并行、结果可复现；依赖未锁定的 CI 会随机失败并迅速失去信任。
- 测试不能依赖真实网络或不稳定的第三方环境；不稳定的 E2E 会让人习惯性重跑，门禁就形同虚设。
- 不要用门禁数量衡量质量，关键流程的覆盖与失败日志的可定位性更重要（见第 69 题）。
- 把最快的检查放前面，避免低级错误要等到 E2E 才暴露。

### 追问

- **怎样减少 CI 时间？** 依赖缓存、任务并行与分片、只跑受影响范围，把重活放到定时任务。
- **E2E 什么时候跑？** 关键分支与合并前跑核心用例，全量矩阵可放在夜间任务。

</details>

---

# 第四部分：JavaScript 代码实战题

代码题建议先澄清输入、输出、异常和规模，再写主路径，最后补边界与测试。以下实现以展示思路为主；生产代码还要结合项目规范。

## 86. 实现 debounce，支持 cancel 和 flush

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript","debounce"],"estimatedMinutes":10} -->

实现 `debounce(fn, wait)`：连续调用只在停止 `wait` 毫秒后执行最后一次，并保留最后一次的实参与 `this`；支持 `cancel()` 与 `flush()`。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

思路：用闭包维护定时器与"最后一次调用信息"，把"是否还有待执行调用"编码为 `timer !== null`。

### 参考实现

```js
function debounce(fn, wait) {
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

  debounced.cancel = () => {
    if (timer !== null) clearTimeout(timer)
    timer = null
    lastArgs = lastThis = undefined
  }

  debounced.flush = invoke

  return debounced
}
```

### 边界与易错点

- 必须保留**最后一次**实参与 `this`，否则作为对象方法或带参调用时会出错。
- `cancel()` 之后 `flush()` 不应再执行：`invoke` 用 `timer === null` 做守卫，并在执行后清空缓存的参数。
- `flush()` 的语义是"立即执行待执行的调用"，要明确它是否重置计时（本实现是执行完毕即清零）。
- 定时器回调本身不能抛出未捕获异常，否则会变成全局错误；必要时在 `invoke` 内部做错误边界。

### 追问

- **如何扩展 leading/trailing/maxWait？** leading 表示首次立即执行，trailing 表示尾部补一次，maxWait 用于持续触发时强制执行一次，三者组合需要额外记录"上次执行时间"。
- **React 中怎么用？** 组件卸载必须 `cancel()`，否则会在组件消失后触发更新并持有旧闭包。
- **搜索场景够用吗？** 不够：debounce 只减少调用次数，慢的旧响应仍可能覆盖新结果，需要配合取消或请求序号（见第 43 题）。

</details>

---

## 87. 实现 throttle，支持 trailing

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript","throttle"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

思路：记录上次执行时间，用"剩余时间"决定是立即执行还是安排尾部执行。

### 参考实现

```js
function throttle(fn, wait) {
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
    lastArgs = args
    lastThis = this

    const remaining = wait - (now - lastInvokeTime)
    if (remaining <= 0 || remaining > wait) {
      // 已过窗口，或系统时间回拨导致 remaining 异常
      if (timer !== null) clearTimeout(timer)
      return invoke(now)
    }

    if (timer === null) {
      timer = setTimeout(() => invoke(Date.now()), remaining)
    }
  }

  throttled.cancel = () => {
    if (timer !== null) clearTimeout(timer)
    timer = null
    lastInvokeTime = 0
    lastArgs = lastThis = undefined
  }

  return throttled
}
```

### 边界与易错点

- 系统时间回拨会让 `remaining` 变成异常大的值，因此要额外判断 `remaining > wait`，否则可能长期不再执行。
- 首次调用立即执行（`lastInvokeTime = 0`），尾部调用合并在窗口结束时执行一次；这两点必须显式说明，不能含糊。
- `cancel()` 应同时清掉待执行的尾部调用，否则取消后仍会触发一次。
- 用 `Date.now()` 的节流是按挂钟时间对齐，页面切到后台再回来可能出现"补执行"；如果只是为了让动画跟帧同步，直接用 `requestAnimationFrame`。

### 追问

- **节流和 `requestAnimationFrame` 怎么选？** 需要固定时间间隔（限流上报、滚动采样）用节流；与渲染帧对齐用 rAF。
- **怎样避免高频回调本身造成卡顿？** 回调里批量读、批量写 DOM，并给监听器加 `{ passive: true }`（见第 77 题）。

</details>

---

## 88. 实现并发限制器 `mapLimit`

<!-- question: {"category":"javascript","type":"coding","difficulty":"advanced","tags":["JavaScript","并发"],"estimatedMinutes":10} -->

给定输入数组、最大并发数与异步 mapper，按输入顺序返回结果。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

思路：启动 `limit` 个"工人"，每个工人循环从共享游标领取下一个下标，天然实现"完成即补位"。

### 参考实现

```js
async function mapLimit(items, limit, mapper) {
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new RangeError('limit must be a positive integer')
  }

  const results = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (true) {
      const index = nextIndex++
      if (index >= items.length) return
      results[index] = await mapper(items[index], index)
    }
  }

  const workerCount = Math.min(limit, items.length)
  await Promise.all(Array.from({ length: workerCount }, worker))
  return results
}
```

### 复杂度与取舍

- 时间复杂度由 mapper 的工作量决定；调度额外空间 O(n)（结果数组），同时最多有 `limit` 个任务在途。
- 结果按输入顺序写回下标位置，与完成顺序无关——这是与"完成即 push"的关键区别。
- 因为 `nextIndex++` 是同步操作，单线程下不需要额外加锁，不会出现两个工人领到同一下标。

### 边界与易错点

- 任一任务拒绝时 `Promise.all` 会快速拒绝，但**已启动的任务不会自动取消**；需要取消时必须传入 `AbortSignal`。
- `limit` 大于数组长度时只启动 `items.length` 个工人，避免创建空转任务。
- 空数组应当直接返回 `[]`，不要因为 `workerCount` 为 0 而产生 `Promise.all([])` 的假成功歧义。
- 生产实现通常还要支持：错误策略（fail-fast 与 all-settled）、重试、进度回调与总超时。

### 追问

- **为什么不用"分批 `Promise.all`"？** 分批会让慢任务拖住整批，利用率低于流水线式领取。
- **怎么加速？** 提高 `limit` 之前先确认瓶颈在下游（接口限流、数据库连接数），盲目提高并发只会制造更多失败。

</details>

---

## 89. 手写 `Promise.all`

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript","Promise"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

思路：收集计数 + 按索引写入结果，先到的不影响顺序，全部完成才 resolve。

### 参考实现

```js
function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const values = Array.from(iterable)
    if (values.length === 0) {
      resolve([])
      return
    }

    const results = new Array(values.length)
    let fulfilledCount = 0

    values.forEach((value, index) => {
      Promise.resolve(value).then(
        (result) => {
          results[index] = result
          fulfilledCount += 1
          if (fulfilledCount === values.length) resolve(results)
        },
        reject,
      )
    })
  })
}
```

### 复杂度与取舍

- 时间由最慢的任务决定，空间 O(n)。
- 用计数器而不是 `results.length` 判断完成，因为"先失败"或稀疏赋值都会让长度不可靠。

### 评分点

- 接受 iterable，并把普通值与 thenable 都统一交给 `Promise.resolve` 处理。
- 空输入立即 fulfilled 为 `[]`。
- 结果**按输入顺序**排列，而不是完成顺序。
- 首个 rejection 让整体拒绝；其余底层任务不会被取消（真正取消要 `AbortController`，见第 17 题）。
- 明确说明这是行为近似实现，不等价于完整复刻 ECMAScript 内部算法与 subclass/species 语义。

### 追问

- **为什么不能用 `results.push`？** 完成顺序与输入顺序不一致，结果会错位。
- **`Promise.all` 会等到所有任务结束吗？** 不会，首个 rejection 后立即拒绝，但其他任务仍在后台运行。

</details>

---

## 90. 实现 EventEmitter

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

思路：用 `Map<type, Set<listener>>` 存储，`emit` 遍历快照以防遍历期间被修改。

### 参考实现

```js
class EventEmitter {
  #events = new Map()

  on(type, listener) {
    const listeners = this.#events.get(type) ?? new Set()
    listeners.add(listener)
    this.#events.set(type, listeners)
    return () => this.off(type, listener)
  }

  once(type, listener) {
    const off = this.on(type, (...args) => {
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

    // 快照：避免监听器在 emit 过程中增删导致本轮遍历异常
    for (const listener of [...listeners]) {
      listener(...args)
    }
    return true
  }
}
```

### 边界与易错点

- 必须对监听器集合做**快照**：直接遍历原集合时，监听器内部调用 `off` 可能跳过元素或产生意外。
- `off` 后若集合为空应删除该 key，否则长时间运行会残留大量空集合（见第 21 题）。
- 用 `Set` 意味着同一函数重复注册会被去重；如果业务需要"注册两次触发两次"，应改用数组并实现按引用移除。
- `once` 必须在调用前先移除，否则监听器内部再次 emit 会递归触发。
- 私有字段 `#events` 防止外部直接改写内部结构。

### 追问

- **监听器抛错怎么办？** 需要明确策略：抛出中断后续（默认）还是逐个 `try/catch` 并汇总上报。生产库通常选择隔离错误并上报，避免一个订阅者拖垮所有订阅者。
- **要不要支持 async 监听器？** 若支持，要明确 `emit` 是否等待所有监听器完成；混用"部分 await、部分不 await"是最容易出错的设计。

</details>

---

## 91. 实现 O(1) 的 LRU Cache

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript","LRU"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

思路：`Map` 保留插入顺序，用"删除后重新插入"把 key 标记为最近使用，`keys().next()` 得到最久未使用的 key。

### 参考实现

```js
class LRUCache {
  constructor(capacity) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new RangeError('capacity must be positive')
    }
    this.capacity = capacity
    this.cache = new Map()
  }

  get(key) {
    if (!this.cache.has(key)) return undefined
    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value) // 视为最近使用
    return value
  }

  set(key, value) {
    if (this.cache.has(key)) this.cache.delete(key)
    this.cache.set(key, value)

    if (this.cache.size > this.capacity) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
    return this
  }
}
```

### 复杂度与取舍

- `get`/`set` 均为均摊 O(1)：`Map` 的删除与插入、`keys().next()` 取首元素都是常数级。
- 依赖 `Map` 的插入顺序保证，并非所有语言的字典都有这个性质。
- 相比"双向链表 + 哈希表"的经典实现，这版代码量小很多，代价是依赖引擎对 `Map` 顺序的实现。

### 边界与易错点

- 缓存值为 `undefined` 时，`get` 返回 `undefined` 无法区分"未命中"与"命中但值为 undefined"；应额外提供 `has` 或返回标记对象。
- `capacity` 必须校验为**正**整数，否则 `set` 会立刻把刚写入的值淘汰掉。
- 生产缓存还要考虑 TTL、按内存大小而非条数淘汰、统计命中率、以及并发请求去重（single-flight，见第 111 题）。
- `set` 返回 `this` 便于链式调用；如果 API 约定不返回内容，要显式说明，避免调用方误用返回值。

### 追问

- **为什么不用对象当缓存？** 对象键会被字符串化，无法区分 `1` 与 `'1'`，也没有插入顺序语义。
- **怎么加 TTL？** 存 `{ value, expiresAt }`，读取时判断过期；注意过期清理与容量淘汰的顺序要一致。

</details>

---

## 92. 实现支持循环引用的 deepClone

<!-- question: {"category":"javascript","type":"coding","difficulty":"advanced","tags":["JavaScript"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

思路：用 `WeakMap` 记录"原对象 → 副本"的映射，既解决循环引用，也保证同一对象在图里只被复制一次。

### 参考实现

```js
function deepClone(value, seen = new WeakMap()) {
  if (typeof value !== 'object' || value === null) return value
  if (seen.has(value)) return seen.get(value)

  if (value instanceof Date) return new Date(value.getTime())
  if (value instanceof RegExp) return new RegExp(value.source, value.flags)

  if (value instanceof Map) {
    const result = new Map()
    seen.set(value, result)
    for (const [k, v] of value) result.set(deepClone(k, seen), deepClone(v, seen))
    return result
  }

  if (value instanceof Set) {
    const result = new Set()
    seen.set(value, result)
    for (const item of value) result.add(deepClone(item, seen))
    return result
  }

  const result = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value))
  seen.set(value, result)

  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if ('value' in descriptor) descriptor.value = deepClone(descriptor.value, seen)
    Object.defineProperty(result, key, descriptor)
  }

  return result
}
```

### 复杂度与取舍

- 时间与空间均为 O(n)（n 为可达属性数）；`WeakMap` 不阻止原对象被回收。
- 用属性描述符复制而非简单赋值，因此能保留 getter/setter、不可枚举与 symbol 键；代价是复杂度上升。
- 用 `Object.create(Object.getPrototypeOf(value))` 保留原型，比 `{...value}` 更接近原语义。

### 边界与易错点

- 仍未覆盖：`WeakMap`/`WeakSet`、`Promise`、`Error` 的内部槽、`ArrayBuffer` 与视图、DOM 节点、函数闭包。
- 自定义类若依赖构造函数参数或私有字段（`#x`），简单复制属性无法还原，需要类自己提供克隆方法。
- `seen` 必须在**递归之前**写入，否则循环引用会无限递归或栈溢出。
- 面试的加分回答是：先问数据范围与是否需要保留原型；平台支持时优先评估 `structuredClone`（见第 12 题）；React 状态更新通常不该深拷贝整棵树（见第 25 题）。

### 追问

- **为什么用 `WeakMap` 而不是 `Map`？** 克隆结束后映射就应释放，弱引用不会阻止原对象回收。
- **`structuredClone` 能替代吗？** 大多数数据场景可以，但它不支持函数、DOM 与自定义原型语义。

</details>

---

## 93. 实现带 AbortSignal 和指数退避的 retry

<!-- question: {"category":"javascript","type":"coding","difficulty":"advanced","tags":["JavaScript"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

思路：把"可中断的等待"和"重试决策"拆成两件事——`sleep` 负责响应 `AbortSignal`，`retry` 负责次数、退避与是否值得重试。

### 参考实现

```js
function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
      return
    }

    const id = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(id)
        reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

async function retry(task, options = {}) {
  const { retries = 3, baseDelay = 200, signal, shouldRetry = () => true } = options

  let lastError
  for (let attempt = 0; attempt <= retries; attempt++) {
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
```

### 边界与易错点

- **不能默认重试所有失败**：认证失败、参数错误、业务拒绝重试没有意义；只有网络抖动、超时、5xx 这类才值得。
- 非幂等 mutation（下单、支付）重试可能重复写入，必须配合服务端幂等键（见第 72 题）。
- 退避要加**抖动**，否则大量客户端会在同一时刻重试，形成惊群。
- 服务端返回 429/503 时优先参考 `Retry-After`，不要用固定策略覆盖服务端意图。
- `sleep` 必须响应 abort 并清理定时器，否则取消后仍会占着计时器资源。
- 需要设置**总超时上限**，避免"每次重试都很快失败但次数很多"导致长时间挂起。

### 追问

- **和 `AbortSignal.timeout` 怎么配合？** 它可以给单次请求设超时，外层 retry 用另一个 signal 控制整体取消，两者可以组合。
- **怎样观测重试效果？** 记录 attempt 次数与最终结果分布，重试率异常升高通常意味着下游已劣化。

</details>

---

## 94. 实现"只采用最新请求结果"

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript","请求"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

思路：双重保险——用 `AbortController` 取消旧任务释放资源，用单调递增的 `version` 作为"谁是最新"的最终判据。

### 参考实现

```js
function createLatestRunner() {
  let version = 0
  let controller = null

  return async function run(task) {
    const currentVersion = ++version
    controller?.abort()
    controller = new AbortController()

    try {
      const value = await task(controller.signal)
      if (currentVersion !== version) return { status: 'stale' }
      return { status: 'success', value }
    } catch (error) {
      if (controller.signal.aborted || currentVersion !== version) {
        return { status: 'stale' }
      }
      return { status: 'error', error }
    }
  }
}
```

### 复杂度与取舍

- 每次调用新增一次 `AbortController`，空间开销可忽略；判定为 O(1)。
- 返回值显式区分 `success`/`error`/`stale`，调用方不需要靠"结果是否为空"猜状态。

### 评分点

- 取消旧任务只能**尽力而为**：底层任务可能不支持取消，所以必须有 version 判据兜底。
- `catch` 里要区分"被自己取消"与"真实错误"，否则会把正常取消当成错误上报（见第 43 题）。
- 不要用共享的 `controller` 变量判断当前调用是否被取消——它在连续调用中已被替换成新的实例；本实现用 `currentVersion` 做最终判断正是为了避免这个坑。
- 返回值约定要与调用方对齐：是抛错、返回 `null`，还是返回状态对象。

### 追问

- **和 Effect 里的竞态处理有何不同？** 这里把竞态封装成可复用工具，Effect 版本还需要在 cleanup 中触发取消。
- **服务端渲染场景会怎样？** 没有 `AbortController` 语义时退化为纯 version 判断，因此这条路径必须保留。

</details>

---

## 95. 数组转树与树转数组

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

思路：数组转树用"一次建索引 + 一次挂接"；树转数组用显式栈做深度优先遍历，避免递归深度限制。

### 参考实现

```js
function arrayToTree(items) {
  const nodes = new Map(items.map((item) => [item.id, { ...item, children: [] }]))
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

    for (let i = children.length - 1; i >= 0; i--) {
      stack.push(children[i])
    }
  }

  return result
}
```

### 复杂度与取舍

- 两者时间都是 O(n)，额外空间 O(n)（索引表/栈）。
- 用 Map 建索引避免每次查找都遍历数组，否则会退化成 O(n²)。
- 用显式栈而非递归，避免深层树导致栈溢出，也便于改成"带层级信息"的输出。

### 边界与易错点

- 必须先澄清：id 是否唯一、parentId 缺失时抛错还是忽略、是否允许多个根、children 的输出顺序。
- 基础实现**无法检测环**：存在环时会得到"没有根"或丢节点，需要额外的访问状态（如三色标记）才能报错。
- 缺失 parent 时直接抛错比静默忽略更好，否则会悄悄丢数据；确实需要容错时应显式记录丢弃项。
- `flattenTree` 用解构去掉 `children` 生成新对象；如果调用方需要引用复用，先说明语义再决定是否浅拷贝。
- 大树的原地挂接会共享输入对象属性，若 `items` 后续被修改，树的节点也会变化。

### 追问

- **需要保持原数组顺序吗？** 需要时用 `children` 的顺序对齐输入顺序，这要求输入本身有序。
- **超大树怎么优化？** 避免创建中间对象，直接复用节点并按需缓存父级引用；必要时改为流式处理。

</details>

---

## 96. 实现 compose

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

思路：`compose(f, g, h)(x)` 等价于 `f(g(h(x)))`，因此用 `reduceRight` 从右向左依次喂入结果。

### 参考实现

```js
const compose = (...functions) => (input) =>
  functions.reduceRight((value, fn) => fn(value), input)

const trim = (value) => value.trim()
const lower = (value) => value.toLowerCase()
const slug = (value) => value.replaceAll(/\s+/g, '-')

compose(slug, lower, trim)('  Hello World  ') // 'hello-world'
```

### 边界与易错点

- 这版只处理**单参数同步**函数，也不做空数组校验：`compose()(x)` 会直接返回 `x`，需要明确这是否符合预期。
- `pipe` 与 `compose` 方向相反（从左到右），命名必须在项目里统一，否则极易读错顺序。
- 若第一个函数需要多个参数，签名要重新设计（例如返回 `(...args) => ...`）。
- 异步场景需要专门的 `composeAsync` 并串行 await，混用同步与异步会让错误传播难以推理。
- TypeScript 下要给出重载或可变元组类型，否则类型会退化为 `any → any`，失去推导价值。
- 不要为了函数式术语牺牲可读性：两三个清晰的局部变量有时比一层 compose 更好维护。

### 追问

- **为什么用 `reduceRight`？** 它天然对应"从最内层开始求值"的顺序，避免手写反向循环。
- **中间件是同一种模式吗？** 思想相近，但中间件还涉及 `next` 控制流与异步，不能简单套用这个实现。

</details>

---

## 97. 实现并解释大数金额相加

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

金额不能用二进制浮点小数直接运算：

```js
0.1 + 0.2 // 0.30000000000000004
0.1 + 0.2 === 0.3 // false
```

正确做法是**以最小单位整数表示金额**（分），在安全整数范围内用 `Number`，超出范围或需要更大精度用 `BigInt`：

```js
function addCents(a, b) {
  return BigInt(a) + BigInt(b)
}

// 展示时再转成小数文本，避免中途回到浮点
function formatCents(cents, currency = 'CNY') {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency }).format(Number(cents) / 100)
}
```

### 边界与易错点

- `Number.MAX_SAFE_INTEGER` 是 `2^53 - 1`，约 9007 万亿分（约 900 亿元）；超过后整数运算会丢精度，此时必须用 `BigInt`。
- `BigInt` 不能与 `Number` 混算（`1n + 1` 抛 `TypeError`），`JSON.stringify` 也会抛错，需要自己序列化成字符串。
- 舍入规则必须**先定义再实现**：四舍五入、银行家舍入（round half to even）、截断在不同业务里结果不同，且税务/计息场景有明确要求。
- 乘法与除法是精度最容易失控的地方：应保持"整数运算 + 最后一次舍入"，中间不要过早转成小数。
- 如果使用第三方 decimal 方案，要确认版本维护状态、序列化方式与团队其他服务的对齐情况，避免前后端对不齐。

### 追问

- **为什么不直接用 `toFixed(2)`？** 它是对浮点结果做格式化，误差已经发生；只能用于展示末端的兜底，不能作为计算手段。
- **前后端金额怎么传？** 统一传最小单位整数或字符串，避免 JSON 数字在不同语言间被解析成浮点。
- **多币种怎么办？** 币种精度不同（JPY 无小数位，部分币种三位），必须把币种与精度一起建模，不能硬编码两位。

</details>

---

# 第五部分：React 代码与场景实战题

## 98. 修复异步计数器的 stale state

<!-- question: {"category":"react","type":"debugging","difficulty":"intermediate","tags":["React","state"],"estimatedMinutes":5} -->

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

每个 handler 闭包读取的都是**触发时那次 render 的 state 快照**，快速点击时后一次调用仍基于旧值计算。修复分两处：用函数式更新消除对快照的依赖，并用 `try/finally` 保证失败时也归位 pending。

### 参考实现

```jsx
async function handleBuy() {
  setPending((value) => value + 1)
  try {
    await buy()
    setCompleted((value) => value + 1)
  } finally {
    setPending((value) => value - 1)
  }
}
```

### 边界与易错点

- 只在成功分支递减 pending 会造成失败后"永远加载中"，`finally` 是必需而不是可选。
- 函数式更新解决了计数错乱，但**不解决重复提交本身**：真正保证只有一次副作用仍需服务端幂等键（见第 72 题）。
- 计数器与服务端状态可能长期不一致；如果业务要求精确，应以服务端返回的权威数据为准，而不是靠前端累加。
- 组件卸载后 setState 虽然不再告警，仍是无效写入，配合 `AbortController` 或标记忽略（见第 43 题）。
- 提交逻辑变复杂（成功/失败/重试/取消）时，改用判别联合 + reducer 组织状态更清晰（见第 103 题）。

### 追问

- **为什么 `setPending(pending + 1)` 会错？** 它读取的是本次 render 的快照，连续点击时每次都在旧值上加一。
- **`finally` 里也能用函数式更新吗？** 可以，而且应该：它同样依赖前值。

</details>

---

## 99. 实现 `useLatest`

<!-- question: {"category":"react","type":"coding","difficulty":"intermediate","tags":["React"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

思路：用一个 ref 承载"最新值"，调用方在异步回调或订阅里读取 `ref.current`，从而不必因为值变化而重建订阅。

### 参考实现

```jsx
import { useRef } from 'react'

function useLatest(value) {
  const ref = useRef(value)
  ref.current = value // 每次 render 同步到最新
  return ref
}
```

### 边界与易错点

- 它**不会触发渲染**，因此不能替代 state 保存需要展示的数据（见第 35 题）。
- 不要用它来"绕过依赖数组"：订阅回调读取最新值是合理用途，但组件真正依赖的响应式值仍必须显式声明，否则行为难以推理（见第 41 题）。
- 在 render 期间写 ref 违反了"渲染纯净"的约定，这是被广泛接受的例外，但必须限定用途：仅供回调读取，不参与渲染输出。
- 并发渲染下同一组件可能被多次执行，`ref.current` 会停在最后一次渲染的值上；不要用它当作"副作用只执行一次"的标记（见第 45 题）。
- 多数"读取最新值但不重建订阅"的场景，较新版本有更明确的官方机制（Effect Event），应按项目版本选择并说明理由。

### 追问

- **和 `useCallback` + 空依赖的区别？** 后者捕获首次 render 的闭包，读到的是旧值；`useLatest` 永远读到最新一次 render 的值。
- **什么时候不该用？** 当值本身应参与渲染输出，或应该触发订阅重建时。

</details>

---

## 100. 实现 `useDebouncedValue`

<!-- question: {"category":"react","type":"coding","difficulty":"intermediate","tags":["React"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

思路：把输入值当作 Effect 依赖，延迟写入内部 state；新输入到来时清理上一次定时器。

### 参考实现

```jsx
import { useEffect, useState } from 'react'

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
```

### 边界与易错点

- **首次渲染返回的是原始值**（不是延迟后的值），所以首屏没有额外延迟；如果产品要求首屏为空，需要额外初始化参数。
- `delay` 变化会重启计时；把 `delay` 传成每次新建的对象或函数会导致反复重启。
- 它只延迟值的更新，**不会取消已发出的请求，也不会减少请求次数**——那需要请求层自己 debounce（见第 23 题）。
- 返回值可能永远落后于最后一次输入（例如输入后立刻卸载）；用它做"最终值"判断时要注意这一点。
- 目标是"让昂贵渲染延后"而不是"降低调用频率"时，应使用 `useDeferredValue`（见第 56 题）。

### 追问

- **和用于搜索的 debounce 有何不同？** 这里延迟的是**值**，请求仍要在值变化后发出；防抖请求延迟的是**调用**，两者常配合使用。
- **为什么用 Effect 而不是 `useMemo`？** 延迟本身就是副作用，必须在提交后安排定时器。

</details>

---

## 101. 实现稳定的 `useEventListener`

<!-- question: {"category":"react","type":"coding","difficulty":"intermediate","tags":["React"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

思路：用 ref 保存最新 listener，使订阅只依赖 `target`/`type` 这类真正需要重建的入参；调用时通过 `listenerRef.current` 转发。

### 参考实现

```jsx
import { useEffect, useRef } from 'react'

function useEventListener(target, type, listener, options) {
  const listenerRef = useRef(listener)
  listenerRef.current = listener

  useEffect(() => {
    const node = target?.current ?? target
    if (!node?.addEventListener) return

    const handler = (event) => listenerRef.current(event)
    node.addEventListener(type, handler, options)

    return () => node.removeEventListener(type, handler, options)
  }, [target, type, options])
}
```

### 边界与易错点

- `removeEventListener` 只按 **type、listener、capture** 匹配，因此必须复用同一个 `handler` 引用；本实现把 `handler` 定义在 Effect 内并在 cleanup 中复用，是正确的。
- `options` 若是每次 render 新建的对象字面量，引用变化会导致反复订阅与退订：可只提取 `capture`/`passive`/`once` 作为依赖，或要求调用方稳定它。
- `target` 支持 ref 对象或直接传 DOM/`window`，必须在文档里写清约定；SSR 中没有 `window`/节点时必须安全跳过。
- listener 逻辑变化不会重建订阅（这正是本 Hook 的目的），但读取到的是**最新一次 render** 的函数，不要指望它能读到旧快照。
- 高频事件（`scroll`、`touchmove`）应传 `{ passive: true }`，避免滚动被阻塞。

### 追问

- **为什么不用 `useCallback` 包 listener 作为依赖？** 那样每次调用方重新创建函数都会重订阅，失去"稳定订阅"的意义。
- **要支持多个事件类型吗？** 可以循环注册，但要注意 cleanup 时逐个移除，并明确是否共享同一个 handler。

</details>

---

## 102. 实现一个可被 `useSyncExternalStore` 订阅的 store

<!-- question: {"category":"react","type":"coding","difficulty":"advanced","tags":["React"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

思路：store 对外提供稳定的 `getSnapshot` 与 `subscribe`，写入时替换整个状态对象并通知所有订阅者。

### 参考实现

```js
function createStore(initialState) {
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
      return () => listeners.delete(listener)
    },
  }
}
```

```jsx
import { useSyncExternalStore } from 'react'

const counterStore = createStore({ count: 0 })

function Counter() {
  const snapshot = useSyncExternalStore(
    counterStore.subscribe,
    counterStore.getSnapshot,
    counterStore.getSnapshot,
  )

  return <button type="button">{snapshot.count}</button>
}
```

### 评分点

- `getSnapshot` 在状态未变化时必须返回**同一引用**；否则 React 会认为数据一直在变，导致无限重渲染。
- 状态变化必须创建**新对象**（不可变更新），否则 `Object.is` 判断不出变化，订阅者不会被通知。
- `subscribe` 必须返回取消订阅函数；通知时对监听器集合做快照，避免订阅者在通知过程中增删导致遗漏或重复。
- 第三个参数 `getServerSnapshot` 要与 SSR/hydration 的数据策略一致，否则会出现不一致（见第 59 题）。
- 这是最小实现：真实 store 还需要 selector 订阅、批量通知与错误隔离，那属于状态库的职责（见第 54 题）。

### 追问

- **为什么通知要遍历快照？** 监听器可能在其中取消订阅，直接遍历原集合会跳过元素。
- **selector 怎么优化？** 让 `getSnapshot` 返回选择后的稳定引用（配合缓存），否则每次返回新对象会破坏引用判断。

</details>

---

## 103. 设计一个请求状态 reducer

<!-- question: {"category":"react","type":"coding","difficulty":"intermediate","tags":["React","请求","reducer"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

思路：用判别联合表达四个状态，用单调递增的 `requestId` 让"旧响应"无法污染新状态。

### 参考实现

```ts
type State<T> =
  | { status: 'idle' }
  | { status: 'loading'; requestId: number }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

type Action<T> =
  | { type: 'start'; requestId: number }
  | { type: 'success'; requestId: number; data: T }
  | { type: 'error'; requestId: number; error: Error }
  | { type: 'reset' }

function reducer<T>(state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case 'start':
      return { status: 'loading', requestId: action.requestId }
    case 'success':
      if (state.status !== 'loading' || state.requestId !== action.requestId) return state
      return { status: 'success', data: action.data }
    case 'error':
      if (state.status !== 'loading' || state.requestId !== action.requestId) return state
      return { status: 'error', error: action.error }
    case 'reset':
      return { status: 'idle' }
    default: {
      const neverAction: never = action
      return neverAction
    }
  }
}
```

### 设计要点与边界

- union 从结构上排除了"同时 loading 与 success"这类非法组合（见第 81 题）。
- `success`/`error` 必须校验 `requestId` 与当前一致，否则迟到的响应会覆盖新状态（见第 43 题）。
- reducer 必须**纯粹**：请求、日志、时间戳都不应出现在里面；它们放在事件处理器、Effect 或数据层（见第 49 题）。
- `default` 分支用 `never` 做穷尽检查，新增 action 时会被编译期发现。
- 若产品需要"保留旧数据并局部刷新"，应扩展为显式的 `{ status, data, isRefreshing }` 形态，而不是偷偷在 `loading` 上携带旧数据。
- 切换实体时用 `key` 重建组件，比在 Effect 里发 `reset` 更清晰。

### 追问

- **为什么不用 `requestId` 直接用 `AbortController`？** 二者互补：取消能释放资源，requestId 是"底层不支持取消"时的最终防线。
- **怎样单测？** reducer 是纯函数，直接构造 state/action 断言即可，不需要渲染组件。

</details>

---

## 104. 修复搜索组件的竞态、错误与卸载问题

<!-- question: {"category":"react","type":"debugging","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

三类问题要一起解决：用 `AbortController` 取消旧请求释放资源，用 `active` 标记忽略迟到结果，用 `response.ok` 与错误类型区分"业务失败"和"主动取消"。

### 参考实现

```jsx
function Search({ query }) {
  const [state, setState] = useState({ status: 'idle' })

  useEffect(() => {
    if (!query.trim()) {
      setState({ status: 'idle' })
      return
    }

    const controller = new AbortController()
    let active = true
    setState({ status: 'loading' })

    async function load() {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = await response.json()
        if (active) setState({ status: 'success', data })
      } catch (error) {
        if (active && error.name !== 'AbortError') {
          setState({ status: 'error', error })
        }
      }
    }

    load()

    return () => {
      active = false
      controller.abort()
    }
  }, [query])

  // 按 state.status 渲染 idle / loading / error / empty / success
}
```

### 边界与易错点

- 必须显式忽略 `AbortError`，否则用户每次修改输入都会看到"请求被取消"的错误提示。
- `active` 与 `abort()` 要**同时**使用：取消只对支持取消的请求生效，标记是最终防线。
- 空查询要回到 `idle`，同时确认上一轮的 cleanup 已经把旧请求取消，避免残留 loading 状态。
- `response.ok` 只覆盖 HTTP 层；业务错误码（200 但 code 非 0）要在数据层统一转换（见第 26 题）。
- 每个字符都发请求时仍需 debounce 或结果缓存——取消只是止损，不是节流。
- 结果列表渲染慢时再考虑 `useDeferredValue`/transition，不要与竞态处理混为一谈（见第 55、56 题）。

### 追问

- **生产项目该怎么写？** 优先评估路由 loader 或 server-state 库，直接获得缓存、去重、失效与 SSR 集成，避免每个组件重复实现请求生命周期（见第 70 题）。
- **怎么测这段逻辑？** 模拟"慢的旧请求 + 快的新请求"，断言界面显示新参数对应的结果。

</details>

---

## 105. 设计一个 controlled/uncontrolled 通用组件 Hook

<!-- question: {"category":"react","type":"coding","difficulty":"advanced","tags":["React","Hook"],"estimatedMinutes":10} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

思路：用 `value === undefined` 判断是否受控；受控时完全由外部驱动，非受控时用内部 state 兜底，变更时统一通知 `onChange`。

### 参考实现

```jsx
function useControllableState({ value, defaultValue, onChange }) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : internalValue

  const setValue = useCallback(
    (next) => {
      const resolved = typeof next === 'function' ? next(current) : next
      if (!controlled) setInternalValue(resolved)
      if (!Object.is(resolved, current)) onChange?.(resolved)
    },
    [controlled, current, onChange],
  )

  return [current, setValue]
}
```

### 边界与易错点

- 受控模式下 Hook 只发出通知，**不会改变界面**：必须由外部把新的 `value` 传回来，这是受控契约而非缺陷。
- 用 `undefined` 表示"非受控"，因此 `null` 会被视为有意义的受控值；两者语义必须在 API 文档中写清。
- 应在开发环境警告组件在受控与非受控之间切换（见第 37 题）。
- 函数式更新读取的是本次 render 的 `current` 快照：同一事件里连续调用两次并期望累加会失败。
- `onChange` 引用变化会让 `setValue` 变化；传给子组件时要注意依赖稳定性。
- 无法用 `undefined` 表达"显式清空"，需要哨兵值或改用 `null` 约定。

### 追问

- **为什么以 `undefined` 而不是 `null` 作判据？** 因为 `null` 常被业务用来表示"已清空"，把它当非受控会让人无法清空受控值。
- **组件库怎么用？** 与 `defaultX` 命名约定配合：`value` + `onChange` 为受控形态，`defaultValue` 为非受控形态。

</details>

---

## 106. 如何让 10,000 行列表的搜索输入保持响应？

<!-- question: {"category":"react","type":"scenario","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

先测量再动手，不要一上来就答"加 `useMemo`"。按"减少工作量 → 减少渲染范围 → 降低更新优先级"的顺序处理。

### 设计框架

1. 把输入 state 与筛选计算/结果渲染分开，保证输入本身不被筛选阻塞。
2. 数据量大时优先服务端搜索/分页，或客户端虚拟化减少 DOM 数量。
3. 纯 CPU 筛选可预处理索引，必要时移到 Worker。
4. 用 `useDeferredValue` 或 transition 让输入优先，但它**不减少总计算量**。
5. 只有 Profiler 证明存在昂贵且重复的计算时才上 `useMemo`。
6. 稳定 `key`，缩小 Context/全局 store 的订阅范围。
7. 用相同条件记录输入延迟、render/commit 时长与内存占用。

### 参考实现

```jsx
function SearchableList({ items }) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  const filtered = useMemo(() => filterItems(items, deferredQuery), [items, deferredQuery])

  return (
    <>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      <VirtualList items={filtered} />
    </>
  )
}
```

### 边界与易错点

- 示例只是**候选方案**：每一层优化都必须有测量支撑（见第 68 题）。
- 不虚拟化时，10,000 行 DOM 的创建与布局本身就是主要成本，memo 起不了决定作用。
- 虚拟化会改变可访问性、浏览器内查找（Ctrl+F）与打印行为，需要评估后再采用。
- 把筛选放到服务端会引入网络延迟与竞态，需配合取消与结果缓存（见第 43 题）。
- `useDeferredValue` 不减少计算量，也不减少请求次数，只改变渲染优先级（见第 56 题）。

### 追问

- **怎么证明改好了？** 对比相同数据下的输入延迟与 INP，并确认长任务时长下降。
- **为什么最后才考虑 memo？** 因为它的收益依赖"依赖稳定 + 计算昂贵"两个前提，先改结构往往更划算（见第 71 题）。

</details>

---

## 107. 如何测试一个异步表单？

<!-- question: {"category":"react","type":"scenario","difficulty":"intermediate","tags":["React","测试"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

思路：用用户级交互 API 走真实操作路径，断言**最终可见结果**；网络在边界处 mock，不 mock 组件内部实现。

### 参考实现

```tsx
test('提交成功后展示成功状态', async () => {
  const user = userEvent.setup()

  server.use(
    http.post('/api/projects', async ({ request }) => {
      const body = await request.json()
      return HttpResponse.json({ id: 'p1', ...body })
    }),
  )

  render(<ProjectForm />)

  await user.type(screen.getByRole('textbox', { name: /名称/ }), 'Alpha')
  await user.click(screen.getByRole('button', { name: /创建/ }))

  expect(await screen.findByText(/创建成功/)).toBeVisible()
})
```

### 评分点

- 按角色/label 查询，不依赖 class 名或内部 state（见第 69 题）。
- 使用用户级交互与**可等待断言**（`findBy*`/`waitFor`），不用固定延时。
- mock 放在网络或数据层边界，而不是 mock Hook 实现。
- 必须另测：失败提示、重复提交防护、必填校验、提交中禁用状态。
- 测试之间数据与 store 要隔离，避免相互污染导致 flaky。

### 追问

- **为什么不用快照？** 表单快照随样式与文案频繁变化，维护成本高、对回归价值低。
- **要测焦点与键盘行为吗？** 与用户可感知流程相关时值得，例如校验失败后焦点回到错误字段。

</details>

---

## 108. 设计权限组件时怎样避免"前端鉴权"误区？

<!-- question: {"category":"react","type":"scenario","difficulty":"intermediate","tags":["React","权限"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

前端权限组件只是**展示控制**，不是安全边界。真正的鉴权必须在服务端按用户、租户、资源与动作执行。

### 设计框架

```tsx
function Can({ permission, children, fallback = null }) {
  const allowed = usePermission(permission)
  return allowed ? children : fallback
}
```

- 权限数据必须来自受信任的会话或服务端下发的权限响应，不能来自可篡改的本地数据（见第 110 题）。
- 统一为一个能力查询入口（如 `can(action, resource)`）：路由、菜单、按钮消费同一层，规则不散落。
- 处理权限动态变化：会话刷新、权限被移除、多标签页同步；收到 403 时安全降级（提示 + 刷新权限 + 引导重新登录）。
- 隐藏入口不等于安全：接口必须独立鉴权，并校验资源归属，防水平越权。

### 边界与易错点

- 把判断写进组件内部会让规则分散且无法测试；应抽到可独立验证的纯函数层（见第 115 题）。
- 直接用 `role === 'admin'` 判断会让权限模型无法演进，应基于**能力**而非角色名。
- 前端缓存的权限要有版本与失效策略，不能只依赖登录时的一次快照。
- 测试至少要覆盖"角色 × 资源 × 动作"矩阵，并包含越权用例；只测 admin 是最常见的漏测。
- 权限未知时应保守处理（不展示操作），不要乐观放行。

### 追问

- **"前端鉴权"这个说法哪里有问题？** 前端只能控制"是否展示与是否发起请求"，最终裁决永远在服务端。
- **为什么强调资源归属？** 只校验动作不校验资源归属，会造成"能改别人的数据"这类水平越权。

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

这段代码同时踩了四个坑：修改 props、用 state 存派生数据、依赖数组漏项、用下标作 key。

### 原理与示例

1. `users.sort(...)` 原地修改了 props，污染父组件与其他消费者（见第 28 题）。
2. `filtered` 完全可由 `users`/`query` 派生，用 `state + Effect` 制造了第二份真相与一次额外渲染（见第 36 题）。
3. 依赖数组漏了 `query`，查询词变化时结果不会更新（见第 41 题）。
4. 用数组下标作 `key`，过滤或重排后身份错位（见第 32 题）。
5. 没有空状态：用户无法区分"没有数据"与"查询无结果"。

### 参考实现

```jsx
function UserList({ users, query }) {
  const filtered = users
    .filter((user) => user.name.includes(query))
    .toSorted((a, b) => a.name.localeCompare(b.name))

  if (filtered.length === 0) return <Empty />

  return filtered.map((user) => <User key={user.id} user={user} />)
}
```

### 边界与易错点

- 环境不支持 `toSorted` 时用 `[...users].sort(...)`；两者都创建新数组，不修改 props。
- `includes` 是区分大小写的子串匹配；产品需要模糊搜索时应显式定义规则，而不是依赖默认行为。
- 排序属于派生计算，放在 render 中完成，不要写在 Effect 里改数据。
- 数据量很大时再测量并考虑 memo、索引、虚拟化或服务端处理（见第 68 题）。

### 追问

- **为什么"渲染输入只读"这么重要？** 输入被修改后，其他消费者与 React 的引用比较都会失真（见第 25 题）。
- **派生计算什么时候需要 memo？** 测量显示它是瓶颈且依赖稳定时（见第 47 题）。

</details>

---

# 第六部分：系统与项目场景题

## 110. 如何设计一个前端 RBAC/数据权限系统？

<!-- question: {"category":"architecture","type":"scenario","difficulty":"advanced","tags":["系统设计","RBAC","权限"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

把权限建模为"主体 + 资源 + 动作（+ 数据范围）"的能力判断；前端只消费统一的能力层做展示控制，服务端始终是最终鉴权边界。

### 设计框架

1. 明确定义模型：subject（用户/角色/部门）、resource（资源类型与实例）、action（读/写/审批…）、scope（全部/本部门/本人）。
2. 登录后获取能力集合或策略输入，统一入口 `can(action, resource)`，不让 role 判断散落在组件里。
3. 路由、菜单、按钮、表格列都消费同一能力层，保证前后行为一致。
4. 多租户场景请求绑定 tenant，服务端校验资源归属；前端不能只靠隐藏 tenant id 来隔离数据。
5. 权限缓存要有版本与过期策略；收到 403 能刷新权限或安全降级，而不是白屏。
6. 用"角色 × 资源 × 动作"矩阵做测试，并对敏感操作记录审计事件。

### 边界与易错点

- RBAC 表达不了所有规则：需要资源属性与归属判断时会演进为 ABAC 或策略引擎，不要靠无限扩张角色数量硬撑。
- 功能权限与数据权限要分开建模：能进页面 ≠ 能看全部数据（见第 108 题）。
- 前端只做展示控制，越权拦截必须在服务端完成，并校验资源归属以防御水平越权。
- 降权、离职、切换租户等变化要有失效机制，否则会长期保留过期能力。
- 权限模型必须可测试、可审计，避免"读代码才知道谁能做什么"。

### 追问

- **数据范围为什么单独建模？** 它由组织架构与资源归属共同决定，塞进角色名会让模型迅速失控。
- **前端权限要缓存吗？** 要，但必须配合版本与失效策略，并在 403 时能自我纠正。

</details>

---

## 111. 多个请求同时返回 401，如何避免重复 refresh？

<!-- question: {"category":"architecture","type":"scenario","difficulty":"advanced","tags":["系统设计","请求"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

客户端维护**唯一的 in-flight refresh Promise**：首个 401 发起刷新，后续 401 复用同一个 Promise，成功后各自只重试一次；失败则统一清理会话并跳登录。

### 参考实现

```js
let refreshPromise = null

function refreshOnce() {
  refreshPromise ??= doRefresh().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

async function request(config) {
  const response = await fetch(config)
  if (response.status !== 401) return response

  // 刷新接口自身不能再进入这段逻辑，否则会死循环
  if (config.url === '/api/refresh') throw new UnauthorizedError()

  await refreshOnce()
  return fetch(config) // 只重试一次
}
```

### 边界与易错点

- 必须防止 refresh 请求本身再次进入同一拦截逻辑，这是最常见的死循环来源。
- **只重试一次**：重试后仍 401 就按失败处理，不能无限循环。
- 请求体可能已被消费（表单、流式 body），重试前要确认可重放；不可重放的请求应标记为不重试。
- 重试必须保证幂等：非幂等写操作可能重复提交，需要幂等键（见第 72 题）。
- 使用 HttpOnly Cookie 时前端可能不直接接触 token，但过期协调问题依然存在。
- 多标签页并发刷新需要协调：可用 `BroadcastChannel` 或 `storage` 事件让一个标签页刷新、其他等待。

### 追问

- **并发量大时怎么避免惊群？** 所有请求共享同一个 refresh Promise，配合服务端 token rotation 的宽限期设计。
- **失败后做什么？** 清理本地会话状态、跳转登录并保留原始目标地址，避免用户丢失操作上下文。

</details>

---

## 112. 如何设计大文件分片上传？

<!-- question: {"category":"architecture","type":"scenario","difficulty":"advanced","tags":["系统设计"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

分片上传的核心是"**可恢复 + 幂等 + 可取消**"：前端切片并控制并发，服务端记录已上传分片并保证合并幂等与最终校验。

### 设计框架

整体流程：文件选择 → 计算文件标识并与服务端协商（秒传/续传）→ 分片 → 并发上传 → 每片校验与重试 → 服务端记录进度 → 断点恢复 → 合并 → 整体校验。

前端重点：

- 不把整个文件读入额外内存：用 `File.slice` 分片，直接以 `Blob` 上传。
- 限制并发并支持重试，用 `AbortController` 实现暂停与取消（并发控制见第 88 题）。
- 进度按**已确认上传的字节**计算，并区分"分片上传完成"与"服务端合并完成"。
- 文件 hash 用增量计算并放到 Worker，避免阻塞主线程；hash 只能用于去重，不能作为权限凭证。
- 服务端必须保证分片归属、幂等写入、过期清理与最终完整性校验。

### 边界与易错点

- 并发过高会打满带宽并触发网关限流，应根据网络与后端能力设定上限。
- 弱网下必须能续传：服务端返回已上传分片列表，前端只补缺失部分。
- 大文件 hash 计算本身很耗 CPU，必须 Worker 化并提供进度反馈。
- 合并要幂等：失败重试不能生成半截文件或重复文件。
- 分片接口同样需要鉴权，并限制文件类型与大小，防止被当作存储滥用入口。
- 多标签页或多个客户端上传同一文件时，要明确是否允许并发写同一上传会话。

### 追问

- **秒传怎么实现？** 服务端按内容 hash 判断是否已存在同一文件并返回引用；同时要注意 hash 冲突与权限校验。
- **进度为什么会回跳？** 通常是用"已发送"而非"已确认"计算进度；重试时应保持已完成计数不回退。

</details>

---

## 113. 如何设计前端错误处理体系？

<!-- question: {"category":"architecture","type":"scenario","difficulty":"advanced","tags":["系统设计"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

按"网络层标准化 → 数据层决策 → UI 层展示 → 上报层补上下文"分层，并为每类错误明确：是否重试、提示什么、是否保留旧数据。

### 设计框架

```
transport error → HTTP client 标准化 → domain error → query/mutation 层
→ 路由 / 组件边界 → 日志与追踪
```

- 至少区分：校验错误、业务拒绝、认证与授权、网络与超时、限流、服务端错误、程序 bug。
- 为每类定义：是否重试、用户提示、是否保留旧数据、日志级别、恢复入口。
- 认证失败统一走会话刷新或跳登录；业务拒绝在表单或局部提示；渲染期程序错误交给 Error Boundary（见第 53 题）。
- 上报统一在边界处补齐版本、路由、requestId，并按指纹聚合（见第 84 题）。

### 边界与易错点

- Error Boundary **不处理**异步请求错误；toast 也不应成为唯一错误 UI，它可能被忽略且无法承载重试。
- 空的 `catch {}` 会让问题彻底消失；当前层处理不了就要补上下文后抛出（见第 26 题）。
- 重试必须幂等：只对可恢复类型做退避重试，非幂等写操作配合幂等键（见第 72、93 题）。
- "保留旧数据还是清空"是产品与体验决策，必须显式约定，否则会出现加载失败后整页空白。
- 面向用户的文案不要暴露堆栈、SQL 或内部标识，但这些信息要保留在日志中。

### 追问

- **局部与全局错误怎么分界？** 能就近恢复的放局部（列表、表单），影响整页渲染的交给路由级边界。
- **怎样减少重复上报？** 在数据层统一转换错误类型，避免同一问题在多层各报一次。

</details>

---

## 114. 如何从零分析一次 React 页面卡顿？

<!-- question: {"category":"architecture","type":"scenario","difficulty":"advanced","tags":["系统设计","React"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

先复现并量化，再定位瓶颈层级，最后"单一假设 → 修改 → 同条件复测"。核心是不靠猜，也不靠一次样本下结论。

### 设计框架

1. 明确用户操作、数据规模、设备、网络与构建模式（**必须是生产构建**）。
2. 用 Performance 面板找长任务、layout/paint 与请求瀑布；用 React Profiler 找昂贵 commit 与重复渲染的组件。
3. 判断瓶颈属于哪一层：JS 计算、组件渲染次数、DOM 数量、布局绘制，还是请求瀑布。
4. 提出**单一主要假设**，只改这一处。
5. 同条件复测，报告 p50/p95 或多次结果，不要挑最好的一次（见第 68 题）。
6. 记录副作用：包体积、内存、可访问性、代码复杂度。

### 边界与易错点

- 开发构建下的结论不可移植：React 开发模式有额外检查与双调用，必须在生产构建下测量（见第 45 题）。
- 只看"渲染次数"会误判：渲染便宜时次数多不是问题（见第 65 题）。
- 卡顿可能根本不在 React：第三方脚本、埋点、同步存储读写、大数组计算都会制造长任务。
- 优化后要回归功能正确性，性能改动是最容易引入 bug 的一类改动。
- 结论必须包含复现条件与数据，否则无法被他人验证。

### 追问

- **怎么定位 INP 问题？** 关注交互到下一帧的耗时、事件处理时长与长任务，而不只是首屏指标（见第 119 题）。
- **什么时候更该怀疑渲染而非计算？** Profiler 显示 commit 时间长、组件重复渲染多，而纯 JS 自测耗时不高时。

</details>

---

## 115. 如何设计前端项目目录和模块边界？

<!-- question: {"category":"architecture","type":"scenario","difficulty":"advanced","tags":["系统设计","模块"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

先按**变化原因与业务能力**切分，再定义依赖方向；结构服务于边界，而不是按文件类型机械分层。

### 设计框架

- 按业务能力组织：`features/<domain>` 内聚 API、状态、UI 与测试；`shared` 只放稳定的跨业务能力；`app` 负责 providers 与启动；路由层只做页面组合。
- 定义明确的依赖规则：
  - `shared` 不依赖任何 feature；
  - feature 之间通过公共契约或上层协调，不直接引入彼此的内部实现；
  - 组件不直接散落 HTTP 调用，统一走各自的数据层（见第 70 题）；
  - 领域类型不被某个 UI 组件反向绑定。
- 用 lint 规则或目录约定把依赖规则固化，而不是依赖口头约定。

### 边界与易错点

- 目录结构**没有唯一正确答案**：要按团队规模、发布边界与复用频率调整，照搬他人的分层往往适得其反。
- 过度提前抽象（一上来就建 `utils`/`hooks`/`types` 大杂烩）会制造隐式耦合。
- 按文件类型分层（`components`/`services`/`store`）在小项目里可行，规模变大后容易出现"改一个功能要动十个目录"。
- 边界要与测试策略一致：可独立验证的业务规则应放在纯逻辑层（见第 69 题）。
- 不要为了"看起来整洁"做大范围目录重构，收益必须对应到具体的耦合问题。

### 追问

- **什么时候值得引入 monorepo？** 只有多应用共享代码、需要独立发布节奏时（见第 146 题）。
- **怎么判断边界错了？** 常见信号是改动频繁跨多个目录、出现循环依赖、以及模块无法独立测试。

</details>

---

# 第七部分：现代 React、浏览器性能与工程化扩展题

以下 35 道题（编号 116–150）为扩展题，聚焦现代 React 特性、浏览器与网络性能、以及工程化实践，结构与本库其余题目一致。

## 116. React 的优先级（lane）模型如何影响更新调度？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","并发"],"estimatedMinutes":8} -->

请说明 React 内部的优先级模型与"可中断渲染"的关系，以及它如何解释 transition 与紧急更新共存时的行为。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

React 用按位表示的**lane 集合**给每个更新打上优先级标记，调度器据此决定先渲染哪一批、进行中的低优先级渲染能否被更高优先级的更新打断。它是内部实现机制而非公开 API，但决定了 transition 与紧急更新共存时的可观察行为。

### 原理与示例

- 每个更新被分配到某个 lane（如离散输入、默认、transition），同一 lane 的更新可以在一次渲染中合并处理。
- 高优先级工作就绪时，进行中的低优先级渲染会被打断并重做，从而不让输入被阻塞（见第 55 题）。
- `useTransition`、`useDeferredValue` 本质是把更新分配到较低优先级的 lane；`flushSync` 则要求同步完成。
- 批处理发生在同一 lane 内：不同优先级的更新不会被合并成一次渲染（见第 34 题）。

### 边界与易错点

- lane 的具体名称与位数属于实现细节，会随版本变化，不要背数值。
- "优先级"不等于抢占式多线程：JS 仍是单线程，只是渲染工作被切成可中断的时间片。
- 低优先级更新可能被持续的高优先级更新"饿死"，因此 transition 需要 `isPending` 之类的反馈。
- 不要用它解释所有现象：DOM 更新、Effect 顺序、事件批处理仍各有规则。

### 追问

- **为什么 commit 不能被打断？** 中断会让 DOM 停在中间态，对用户可见且无法回滚（见第 30 题）。
- **什么时候必须用 `flushSync`？** 需要在提交后立刻读取布局结果且无法用 Effect 表达时；代价是放弃批处理与可中断性。

</details>

---

## 117. `use()` 能读取什么？它和 Hooks 调用规则有什么不同？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","Suspense"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

`use` 可以读取 Promise 与 Context，并且支持在条件与循环中调用——因为它读取的是"资源"，不占用按调用顺序编号的 Hook 槽位。

### 原理与示例

```jsx
function Comments({ commentsPromise }) {
  const comments = use(commentsPromise) // pending 时挂起到最近的 Suspense
  return <ul>{comments.map((item) => <li key={item.id}>{item.text}</li>)}</ul>
}
```

- `use(Promise)` 在 pending 时抛出（挂起），由最近的 Suspense 边界展示 fallback，resolve 后重新渲染。
- `use(Context)` 等价于读取 Context，但可以在条件分支中使用。
- Promise 必须来自**稳定来源**（父组件或数据层创建并传入），否则每次 render 新建 Promise 会导致反复挂起。

### 边界与易错点

- 不能在组件外调用；输入只支持 Promise 与 Context，不是"任意异步都能用"。
- 它不改变其他 Hooks 的顺序约束（见第 38 题），不能作为放宽调用规则的理由。
- 在客户端组件里写 `use(fetch(...))` 是典型误用：每次 render 都会新建 Promise 并反复挂起。
- 失败仍需要 Error Boundary；Suspense 只负责"未就绪"（见第 57 题）。

### 追问

- **相比 Effect + state 的优势？** 把加载态交给边界统一处理，避免每个组件维护 `isLoading`/`data`/`error` 三元状态。
- **SSR 下有什么不同？** 依赖框架的流式与序列化能力，不能假设与纯客户端一致。

</details>

---

## 118. React 19 中把 ref 作为普通 prop 传递解决了什么问题？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

React 19 起函数组件可以像普通 prop 一样接收 `ref`，不再必须用 `forwardRef` 包裹；这减少了一层包装，也让类型标注更直接。`forwardRef` 仍然有效，存量代码不必立即迁移。

### 原理与示例

```jsx
// React 19
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />
}

// React 18 及以前的等价写法
const Input = forwardRef(function Input(props, ref) {
  return <input ref={ref} {...props} />
})
```

### 边界与易错点

- `ref` 仍是保留字段：它不会随 `{...props}` 被当作普通属性透传，必须显式接收。
- 同时支持 18/19 的库不能依赖新写法，仍需评估是否保留 `forwardRef`。
- 自定义组件接收 ref 意味着"把 ref 交给某个内部节点"，要明确是根节点还是特定子节点。
- 与 Server Component 交互时，ref 只能在客户端组件边界内使用。

### 追问

- **为什么以前需要 `forwardRef`？** 早期实现中 `ref` 是特殊字段，不进入 props，只能通过专门 API 透传。
- **要不要做迁移？** 新代码可用新写法；存量代码取决于类型声明与依赖库兼容性。

</details>

---

## 119. `useOptimistic` 的失败回滚应该怎么设计？

<!-- question: {"category":"react","type":"scenario","difficulty":"advanced","tags":["React","乐观更新"],"estimatedMinutes":8} -->

乐观更新让界面在请求完成前先呈现预期结果。请说明它的适用范围，以及失败时回滚方案应该包含哪些内容。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

`useOptimistic` 只应覆盖"成功概率高 + 回滚成本低"的操作；失败回滚必须由产品与数据层共同设计，hook 只负责把乐观状态还原为基准状态。

### 原理与示例

```jsx
const [optimisticItems, addOptimistic] = useOptimistic(items, (state, next) => [...state, next])

async function submit(formData) {
  addOptimistic({ id: 'temp', name: formData.get('name') })
  await createItem(formData) // 失败时基准状态不变，乐观项自动消失
}
```

- 需要明确"基准状态是什么"：通常来自服务端数据，而不是另一个乐观值。
- 需要明确"失败后用户看到什么"：提示、保留已输入内容、以及可重试入口。

### 边界与易错点

- 乐观项消失不等于处理完毕：必须给出明确失败提示，否则用户以为保存成功。
- 不可逆或强一致操作（支付、扣库存、审批）不应乐观，失败代价高于体验收益。
- 乐观项通常带临时身份（如临时 id），后续操作若引用它，需要等待真实 id 替换完成。
- 成功后的缓存一致性要单独处理：精确写入或失效相关查询，否则列表仍是旧数据（见第 70 题）。
- 并发提交同一实体时要有冲突策略（覆盖、合并或拒绝）。

### 追问

- **回滚由谁负责？** React 负责把乐观状态还原到基准状态；业务提示、重试与冲突合并仍需自己实现。
- **如何避免闪烁？** 保持乐观项 key 稳定，并让成功路径尽量不触发整表重取。

</details>

---

## 120. Server Component 与 Client Component 的边界应该如何划分？

<!-- question: {"category":"react","type":"scenario","difficulty":"advanced","tags":["React","RSC"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

按"是否需要浏览器能力"划分：需要 state、Effect、事件与 DOM API 的是 Client Component，其余尽量留在 Server Component；边界越贴近叶子交互，进入客户端 bundle 的代码越少。

### 设计框架

- 数据获取尽量放在 Server Component，靠近数据源，避免客户端请求瀑布。
- 交互点（按钮、输入、拖拽）抽成 Client Component，需要的可序列化数据通过 props 传入。
- 不要在 Server Component 里写兜底的客户端分支，也不要为了"省事"把整页标成客户端组件。
- 跨边界 props 必须可序列化：函数、类实例与 Symbol 不能传（Server Action 传的是引用，属于例外）。

### 边界与易错点

- 边界下沉后仍要注意 element 稳定性，父级重渲染会带着 `children` 一起传递（见第 65 题）。
- 加载与错误要分类型处理：服务端数据错误与客户端交互错误不是一类问题（见第 26 题）。
- 权限与租户校验必须在服务端完成，不能靠在客户端隐藏入口（见第 108 题）。
- 与 SSR 不是同一件事：Client Component 同样会被服务端渲染出首屏 HTML（见第 60 题）。
- 缓存与失效策略要显式设计，否则"服务端数据"会变成难以追踪的隐式全局状态。

### 追问

- **什么时候不该用 RSC？** 纯静态站点或没有框架支撑时，引入的复杂度往往大于收益。
- **怎么验证边界合理？** 看客户端 bundle 里还剩多少业务代码，以及客户端组件是否只承担交互。

</details>

---

## 121. Server Action 与普通 API 请求相比有哪些取舍？

<!-- question: {"category":"react","type":"scenario","difficulty":"advanced","tags":["React","RSC"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

Server Action 把"提交"变成一次由框架管理序列化的服务端调用，省掉手写接口与 pending/错误状态；代价是与框架强绑定，可观测性与跨端复用性不如显式 API。

### 原理与示例

- 表单可以直接 `action={serverAction}`，React 负责 pending、错误与刷新协调；配合 `useActionState` 还能拿到返回值（见第 61 题）。
- 它**本质仍是网络调用**：一样会失败、超时、被篡改，也必须在服务端做鉴权与校验。

### 边界与易错点

- Server Action 是对外公开入口，不能因为"只在本应用内调用"就信任入参；鉴权、参数校验与幂等控制一个都不能少（见第 72 题）。
- 不适合给移动端或其他服务复用：它没有稳定的 HTTP 契约，跨端复用成本高。
- 可观测性较弱：需要额外埋点才能获得完整 trace 与耗时分布（见第 150 题）。
- 它不解决跨页面数据一致性，缓存失效仍要自己设计。
- 部署形态要确认：某些网关/CDN 配置下 Action 路由需要额外支持。

### 追问

- **什么时候优先用普通 API？** 需要跨端复用、需要独立版本管理，或团队已有成熟接口层时。
- **混用怎么分工？** 面向本应用的写操作可用 Action，对外能力与复杂接口仍走显式 API。

</details>

---

## 122. Transition 与 Suspense 配合时，如何设计内容的 reveal 顺序？

<!-- question: {"category":"react","type":"scenario","difficulty":"advanced","tags":["React","Suspense"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

目标是让**已经展示的内容保留到新内容就绪**，避免整块被 fallback 替换；做法是把 Suspense 边界放细，并用 transition 让更新可中断、可延后。

### 设计框架

- 边界粒度决定体验：细粒度边界只替换局部区域，粗粒度边界会让整页闪回骨架屏。
- 用 `startTransition` 或 `useDeferredValue` 把数据更新标记为非紧急，从而允许 React 在新内容就绪前保留旧内容（见第 55、56 题）。
- 给"正在更新"设计低干扰反馈（顶部进度条、区域变淡），而不是全屏 loading。
- 首屏与后续切换分开设计：首屏可以接受骨架屏，后续切换应尽量保留旧内容。

### 边界与易错点

- 没有 Suspense 边界时，挂起会冒泡到最近边界，容易出现"一闪全屏"。
- 边界内的失败要配 Error Boundary，否则会波及更大范围（见第 53 题）。
- 过早显示骨架屏会让用户感觉更慢；骨架屏应贴近最终布局以减少 CLS（见第 137 题）。
- reveal 顺序受数据依赖影响：先等慢数据再渲染快数据，等于浪费已就绪的部分。

### 追问

- **怎样避免"看到的内容又消失"？** 把变化限制在小边界内，并用 transition 保持旧内容直到新内容准备好。
- **SSR 场景有什么不同？** 流式渲染下边界划分直接影响首屏可交互时间（见第 59 题）。

</details>

---

## 123. 如何定位组件频繁重渲染？

<!-- question: {"category":"react","type":"debugging","difficulty":"intermediate","tags":["React","性能"],"estimatedMinutes":8} -->

某页面在输入时会频繁重渲染。请给出定位步骤，并说明在什么条件下才应该使用 `memo`。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

先用 Profiler 确认"谁在渲染、为什么渲染、代价多大"，再按"状态位置 → 订阅范围 → props 稳定性 → memo"的顺序处理。

### 排查步骤

1. 用 React DevTools Profiler 录制一次具体交互，只关注这次交互产生的提交。
2. 找出渲染次数多且 commit 耗时的组件，区分是"函数执行便宜"还是"DOM 操作昂贵"。
3. 检查状态位置：高频状态是否放在过高层级（见第 71 题）。
4. 检查订阅范围：Context 粒度过粗或 selector 过宽（见第 48 题）。
5. 检查 props 稳定性：对象/函数每次新建导致 `memo` 失效（见第 47 题）。
6. 只在有测量证据时加 memo，并用相同条件复测。

### 边界与易错点

- "渲染次数多"不等于性能问题：渲染便宜时次数多也可能无妨（见第 65 题）。
- 必须在生产构建下测量，开发模式有额外检查与双调用（见第 45 题）。
- 不要用 `console.log` 代替 Profiler：它自身影响性能且没有耗时分布。
- 过度 memo 会让依赖关系难维护，收益可能微乎其微。

### 追问

- **组件为什么"无缘无故"重渲染？** 常见原因是父级状态位置过高、Context 变化、或 props 中存在每次新建的值。
- **定位到之后先改哪个？** 先动结构与订阅范围，memo 放最后。

</details>

---

## 124. 修复 Context 造成的整页重渲染

<!-- question: {"category":"react","type":"debugging","difficulty":"advanced","tags":["React","Context"],"estimatedMinutes":8} -->

一个 Provider 同时提供主题与用户信息，且 `value` 每次都新建对象；输入框每次按键都会让整页重渲染。请给出诊断与修复方案。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

问题几乎都来自"粒度太粗"与"value 不稳定"；修复顺序是先下沉状态，再拆分 Context，最后才考虑换成外部 store。

### 参考实现

```jsx
// 问题写法：每次 render 都是新对象，所有消费者都会更新
<AppContext.Provider value={{ theme, user, setTheme }}>{children}</AppContext.Provider>

// 修复：拆分 Context + 稳定 value
const themeValue = useMemo(() => ({ theme, setTheme }), [theme, setTheme])
const userValue = useMemo(() => ({ user }), [user])

<ThemeContext.Provider value={themeValue}>
  <UserContext.Provider value={userValue}>{children}</UserContext.Provider>
</ThemeContext.Provider>
```

### 边界与易错点

- `setTheme` 本身引用稳定，但包进新对象后 value 仍然每次都变，所以必须 memo。
- 只 memo value 而不拆分 Context，用户信息变化仍会让主题消费者重渲染（见第 48 题）。
- 消费者只需要"按字段订阅"时，Context 表达能力不足，应改用支持 selector 的外部 store（见第 54 题）。
- 拆分有成本：provider 嵌套变深、API 变多，要评估是否值得。

### 追问

- **怎么证明修好了？** 用 Profiler 对比同一次输入触发的提交范围与耗时。
- **状态下沉能替代拆分吗？** 很多时候可以，而且更简单（见第 71 题）。

</details>

---

## 125. 实现 `useMediaQuery`

<!-- question: {"category":"react","type":"coding","difficulty":"intermediate","tags":["React","Hook"],"estimatedMinutes":10} -->

实现 `useMediaQuery(query)`，返回当前媒体查询是否匹配，并保证 SSR 下首次渲染结果一致。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

### 参考实现

```jsx
import { useSyncExternalStore } from 'react'

function useMediaQuery(query) {
  const subscribe = (onStoreChange) => {
    const list = window.matchMedia(query)
    list.addEventListener('change', onStoreChange)
    return () => list.removeEventListener('change', onStoreChange)
  }

  const getSnapshot = () => window.matchMedia(query).matches
  const getServerSnapshot = () => false

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
```

`matchMedia` 正是"React 之外的可变数据源"，因此用 `useSyncExternalStore` 最合适（见第 54 题）。

### 边界与易错点

- 服务端没有 `window`，访问必须放在 `getSnapshot` 内（只在客户端调用）。
- `getSnapshot` 必须返回稳定值：`matches` 是布尔值，天然满足引用稳定要求。
- `query` 变化时应重新订阅，因此在 `subscribe` 内重新获取 `MediaQueryList`。
- 不要用它替代纯布局适配的 CSS 媒体查询：能交给 CSS 的就别进 JS，否则容易出现首屏闪烁。
- 服务端快照要选一个确定性默认值，并在客户端纠正，避免 hydration 不一致（见第 59 题）。

### 追问

- **为什么不用 `useState` + Effect？** 那会在订阅建立前后各渲染一次，且容易与 SSR 不一致。
- **断点很多怎么办？** 用一个订阅覆盖所有断点的 store，避免每个断点各建监听。

</details>

---

## 126. 实现 `useIntersectionObserver`

<!-- question: {"category":"react","type":"coding","difficulty":"intermediate","tags":["React","Hook"],"estimatedMinutes":10} -->

实现 `useIntersectionObserver(ref, options, onChange)`：当目标元素与视口相交时回调，并保证回调读取最新逻辑、组件卸载时释放观察器。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

### 参考实现

```jsx
function useIntersectionObserver(ref, options = {}, onChange) {
  const onChangeRef = useLatest(onChange) // 见第 99 题

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver((entries) => {
      onChangeRef.current?.(entries)
    }, options)

    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, options.root, options.rootMargin, options.threshold])
}
```

### 边界与易错点

- `options` 若每次新建对象，会成为"永远变化"的依赖；只提取真正影响观察行为的字段。
- 必须在 cleanup 中 `disconnect()`，否则观察器会持续持有 DOM 与回调（见第 21 题）。
- 回调通常需要读取最新逻辑，用 `useLatest` 转发可避免因回调变化重建观察器。
- 元素可能因条件渲染暂不存在：依赖 `ref.current` 的 Effect 需要在元素出现后重新执行。
- 一次性可见（例如懒加载）应显式 `unobserve`，避免重复触发。

### 追问

- **懒加载图片为什么不直接写？** 原生 `loading="lazy"` 往往已足够；需要自定义占位、动画或曝光统计时才用观察器（见第 140 题）。
- **为什么不用 `scroll` 事件？** 高频事件加同步布局计算代价高，观察器由浏览器统一优化。

</details>

---

## 127. 实现 `useEventCallback`（稳定引用 + 读取最新值）

<!-- question: {"category":"react","type":"coding","difficulty":"intermediate","tags":["React","Hook"],"estimatedMinutes":10} -->

实现一个 `useEventCallback(fn)`：返回的函数引用稳定，但调用时执行的是最新一次 render 传入的实现。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

### 参考实现

```jsx
import { useCallback, useRef } from 'react'

function useEventCallback(fn) {
  const fnRef = useRef(fn)
  fnRef.current = fn
  return useCallback((...args) => fnRef.current(...args), [])
}
```

### 边界与易错点

- 它解决"引用稳定 + 读取最新逻辑"的组合需求，适合作为订阅回调、事件处理器，或传给 `memo` 子组件的 props（见第 47 题）。
- 不要把它用在 render 阶段直接调用的函数上：渲染期间读取 ref 会破坏纯度假设（见第 64 题）。
- 与 `useLatest` 的区别：后者返回 ref 由调用方自行读取，前者返回可直接调用的函数（见第 99 题）。
- 较新版本提供了语义更明确的官方机制（Effect Event），新项目应优先评估。
- 被包装的函数若引用即将卸载的组件状态，生命周期问题仍要自己处理。

### 追问

- **为什么不能靠 `useCallback` 写全依赖？** 那样引用会随依赖变化，违背"稳定引用"的目的；两者解决的问题不同。
- **什么时候必须稳定引用？** 作为 Effect 依赖、或传入 `memo` 子组件时。

</details>

---

## 128. 实现可取消的异步请求 Hook

<!-- question: {"category":"react","type":"coding","difficulty":"advanced","tags":["React","请求"],"estimatedMinutes":10} -->

实现 `useAsync(asyncFn, deps)`：依赖变化时重新请求，自动取消旧请求，并保证只有最新结果会写入状态。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

### 参考实现

```jsx
function useAsync(asyncFn, deps) {
  const [state, setState] = useState({ status: 'idle' })
  const latestIdRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    const requestId = Symbol('request')
    latestIdRef.current = requestId
    setState({ status: 'loading' })

    asyncFn({ signal: controller.signal })
      .then((data) => {
        if (latestIdRef.current === requestId) setState({ status: 'success', data })
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        if (latestIdRef.current === requestId) setState({ status: 'error', error })
      })

    return () => controller.abort()
  }, deps)

  return state
}
```

### 复杂度与取舍

- 每次依赖变化都会重新发起请求，因此 `deps` 必须稳定；这属于调用契约而非实现细节。
- 状态用判别联合表达，避免 `isLoading`/`error` 组合出非法状态（见第 81 题）。

### 边界与易错点

- 让调用方传依赖数组存在误用风险（传错会死循环或拿到旧数据）；更稳的设计是显式接收参数并在内部构造依赖。
- 必须排除 `AbortError`，否则取消会被当成失败（见第 43 题）。
- 只覆盖"最新为准"的场景；需要缓存、去重与跨组件共享时应改用 server-state 库（见第 70 题）。
- 卸载后不应写状态；abort 与 requestId 双保险更接近生产可用。

### 追问

- **为什么还要 requestId？** 有些底层实现不支持取消，或响应已进入回调；标记是最终防线。
- **和 Suspense 方案的区别？** Suspense 把加载态交给边界，本方案把状态留在组件内。

</details>

---

## 129. 设计一个虚拟列表方案

<!-- question: {"category":"react","type":"scenario","difficulty":"advanced","tags":["React","性能"],"estimatedMinutes":8} -->

页面需要展示上万行数据。请说明虚拟列表的设计要点，以及它带来的代价。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

虚拟列表的核心是"只渲染可视区域 + 少量缓冲"，难点在滚动位置、动态高度与可访问性，而不在 React 本身。

### 设计框架

1. 固定行高时用"滚动偏移 ÷ 行高"直接计算可视区间，并用一个撑高的占位容器维持滚动条。
2. 渲染项目放在一个内部容器里整体偏移，避免逐项绝对定位造成布局抖动。
3. 上下各预留几行缓冲，减少快速滚动时的白屏。
4. 动态高度需要测量并缓存每项高度，配合累计偏移表与二分查找定位起点。
5. 保持 `key` 稳定；"回到顶部"、锚点定位等交互要单独设计。

### 边界与易错点

- 动态高度下滚动位置容易跳动：需要锚定当前可见项并补偿偏移量。
- 可访问性会受影响：屏幕阅读器与键盘导航看不到未渲染内容，需要补充语义与跳转手段。
- 浏览器内查找（Ctrl+F）与打印无法覆盖未渲染内容，必要时应提供"渲染全部/导出"入口。
- 行高变化（字体加载、图片加载）会让已有测量失效，需要重新计算并保持稳定。
- 数据量不是唯一判据：交互简单时，分页可能更省事（见第 68 题）。

### 追问

- **什么时候不该虚拟化？** 列表不长、需要浏览器内查找，或打印/导出是核心场景时。
- **怎么验证效果？** 对比 DOM 节点数、长任务时长与滚动帧率，而不是只看"感觉变快"。

</details>

---

## 130. 如何让全局状态与 URL 保持一致？

<!-- question: {"category":"react","type":"scenario","difficulty":"intermediate","tags":["React","状态"],"estimatedMinutes":8} -->

列表页包含筛选、分页、排序与弹窗状态。请说明哪些状态应该放进 URL，以及如何避免双向同步问题。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

把"可分享、可恢复、与导航相关"的状态交给 URL，其余留在组件或全局 store；关键是确定唯一权威来源，避免双向同步。

### 设计框架

- 筛选条件、分页、排序、当前 tab 放 URL（路径参数或 query），从而支持分享、刷新保留与前进后退。
- 组件从 URL 读取并派生出实际查询条件；用户操作通过**导航**更新 URL，而不是先写 state 再同步。
- 弹窗开关、临时草稿、未提交表单留在组件内状态。
- 少数需要跨页面共享的状态放全局 store，但不要把它当作 URL 的镜像（见第 70 题）。

### 边界与易错点

- 双向同步（URL → state → URL）极易产生循环更新与历史记录污染，例如每次按键都 push 一条历史。
- 高频输入（搜索框）通常先用本地 state，防抖后再以 replace 方式写入 URL。
- URL 参数是不可信输入：必须校验并给默认值，非法值应回退而不是崩溃（见第 78 题）。
- 序列化要稳定：对象键顺序、数组编码方式变化会导致"看起来一样的 URL 不相等"。
- SSR 场景下服务端也要能解析同一套参数，避免首屏与客户端不一致。

### 追问

- **什么不该进 URL？** 敏感信息、体积过大的数据，以及纯 UI 的瞬时状态。
- **怎么判断放对位置了？** 把 URL 复制给同事能还原同样的视图，就算放对了。

</details>

---

## 131. HTML、静态资源与接口的缓存策略应如何分别设计？

<!-- question: {"category":"browser","type":"theory","difficulty":"intermediate","tags":["浏览器","缓存"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

三者更新频率与可失效性不同，因此策略不同：静态资源用内容 hash 加长缓存，HTML 用短缓存或协商缓存，接口按业务容忍度设计。

### 原理与示例

- **带 hash 的 JS/CSS**：`Cache-Control: public, max-age=31536000, immutable`；文件名变化即失效。
- **HTML**：`no-cache`（使用前验证）或较短的 `max-age`，保证能引用到新的资源 hash。
- **接口数据**：读多写少的配置类可缓存并配合失效；用户相关数据通常 `no-store` 或交给应用层缓存。
- 需要"先给旧的再后台更新"时可用 `stale-while-revalidate`（见第 74 题）。

### 边界与易错点

- 接口缓存最容易出错：带 `Authorization` 的响应若被共享缓存命中会造成越权，必须区分 `private` 与 `public`。
- 只改 HTML 缓存而不给静态资源加 hash，会出现"新 HTML 引用旧资源"或"旧 HTML 引用已删除资源"。
- CDN 与浏览器是两层缓存：改策略时要同时考虑 `s-maxage` 与刷新方式（见第 138 题）。
- `no-store` 会禁用 bfcache 与部分优化，不要无差别全站开启（见第 139 题）。

### 追问

- **怎么验证生效？** 用 Network 面板看 `Cache-Control`、是否命中内存/磁盘缓存，以及 304 与 `from disk cache` 的区别。
- **发版后正在使用的用户怎么办？** HTML 短缓存 + hash 资源 + 保留旧资源一段时间，避免加载不到旧 chunk（见第 58 题）。

</details>

---

## 132. HTTP/2 与 HTTP/3 分别解决了什么队头阻塞？

<!-- question: {"category":"browser","type":"theory","difficulty":"advanced","tags":["浏览器","网络"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

HTTP/1.1 的连接级队头阻塞由 HTTP/2 的多路复用解决；但 TCP 层丢包仍会阻塞同一连接上的所有流，HTTP/3 改用基于 UDP 的 QUIC 让每个流独立传输，从而减少这种传输层阻塞。

### 原理与示例

- **HTTP/1.1**：一个连接同时只能处理一个请求，浏览器靠"每域名若干连接"缓解，代价是连接开销与并发上限。
- **HTTP/2**：一个连接上多路复用多个流，配合头部压缩（HPACK）；服务端推送在实践中已基本弃用。
- **HTTP/3**：以 QUIC 承载，流之间独立重传，避免"丢一个包整条连接等待"，同时内建 TLS 1.3，握手更快。

### 边界与易错点

- HTTP/2 不能消除**应用层**阻塞：串行依赖、服务端排队、慢接口依旧会拖慢首屏。
- 多路复用下"域名分片"反而有害，会拆散连接与优先级。
- HTTP/3 需要客户端与服务端同时支持，部分企业网络会限制 UDP。
- 优先级机制在两种协议下实现不同，不要沿用 HTTP/1.1 时代的直觉（见第 133 题）。

### 追问

- **什么时候收益最明显？** 高延迟、高丢包的移动网络下 HTTP/3 改善更明显。
- **还要做域名分片吗？** 不需要，现代实践是减少域名数量、复用连接。

</details>

---

## 133. `preload`、`prefetch`、`preconnect` 与 `fetchpriority` 分别用在什么场景？

<!-- question: {"category":"browser","type":"theory","difficulty":"intermediate","tags":["浏览器","性能"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

四者都影响资源加载，但目标不同：`preconnect` 提前建连，`preload` 提前加载当前页面必需资源，`prefetch` 预取未来可能用到的资源，`fetchpriority` 调整单个资源的相对优先级。

### 原理与示例

- `preconnect`：提前完成 DNS/TCP/TLS，适合关键的第三方源（字体、CDN）。
- `preload`：声明"本轮就会用到"，必须带正确的 `as`/`type`，否则可能触发重复请求。
- `prefetch`：低优先级预取，用于下一步很可能访问的路由或数据。
- `fetchpriority`：把 LCP 图片或关键脚本提权，把非关键资源降级（见第 135 题）。

### 边界与易错点

- 什么都 `preload` 等于什么都没优化：会挤占带宽、推迟真正关键的资源。
- `preload` 参数不匹配（缺 `as`、`crossorigin` 不一致）会导致加载两次，反而更慢。
- 预取未使用的字体或图片会浪费流量，移动端更明显。
- `fetchpriority` 只是提示而非保证，不能替代资源体积优化。
- 效果要用网络面板与现场数据验证，不能只看实验室分数。

### 追问

- **为什么 `preload` 有时反而更慢？** 提权后抢占更关键资源，或发生重复下载。
- **字体怎么处理？** 子集化 + `font-display`，只 preload 首屏真正使用的字重（见第 140 题）。

</details>

---

## 134. Core Web Vitals 三个指标分别反映什么？

<!-- question: {"category":"browser","type":"theory","difficulty":"basic","tags":["浏览器","性能"],"estimatedMinutes":3} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

LCP 反映"主要内容何时可见"，INP 反映"交互响应有多快"，CLS 反映"布局有多稳定"。三者分别对应加载、交互与视觉稳定性，不能互相替代。

### 原理与示例

- **LCP**：视口内最大内容元素（大图、标题、视频封面）的渲染时间，受 TTFB、资源发现与阻塞资源影响（见第 135 题）。
- **INP**：一次交互到下一帧呈现的耗时，涵盖事件处理、渲染与主线程排队；长任务是主要敌人（见第 136 题）。
- **CLS**：生命周期内意外布局偏移的累计分数，来自无尺寸的图片/广告、字体替换与动态插入内容（见第 137 题）。

指标要看分布而非单值：关注 p75 等分位，并在真实用户监控中按设备与网络分桶（见第 84 题）。

### 边界与易错点

- 实验室数据（Lighthouse）与现场数据（RUM）会不一致，优化应以现场 p75 为准。
- INP 只在真实交互时产生，没有交互的页面拿不到有效值。
- 把 LCP 元素换成更小的元素来"降指标"是作弊，不解决体验问题。
- 只盯三个指标会忽略错误率、可访问性等其他体验维度。

### 追问

- **"能看到"与"能用"分别对应哪个指标？** 前者接近 LCP，后者更接近 INP/TBT。
- **怎么让指标与业务挂钩？** 记录指标与转化、留存的关系，避免为了分数而优化。

</details>

---

## 135. LCP 慢应该怎么排查？

<!-- question: {"category":"browser","type":"scenario","difficulty":"advanced","tags":["浏览器","性能"],"estimatedMinutes":8} -->

线上页面 LCP 在 p75 上明显超标。请给出排查与优化步骤。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

LCP 可以拆成四段：TTFB、资源加载延迟、资源加载时长、元素渲染延迟。先定位卡在哪一段，再针对性优化。

### 排查步骤

1. 在 Network 面板找出真正的 LCP 元素及其资源请求（DevTools 会标注 LCP badge）。
2. 判断是 TTFB 高（服务端或网络）、发现晚（被阻塞或依赖链过长）、加载慢（资源过大），还是渲染被阻塞（字体、同步脚本）。
3. 常见优化：关键内容尽早返回、用 `preload` + `fetchpriority="high"` 提权 LCP 图、图片改用现代格式与正确尺寸、内联关键 CSS、延迟非关键脚本（见第 133、140 题）。
4. 复测并确认 LCP 元素没有变化，否则前后数据不可比。

### 边界与易错点

- 客户端渲染的页面 LCP 天然偏晚，需要评估 SSR 或静态生成（见第 59 题）。
- 给 LCP 图片加 `loading="lazy"` 是典型反模式，会显著推迟加载。
- 首屏大体积字体文件会阻塞文本渲染，考虑子集化与 `font-display`。
- 只优化实验室数据可能无效：真实设备与网络下的瓶颈往往不同（见第 134 题）。

### 追问

- **TTFB 高怎么办？** 从服务端响应时间、缓存命中率与 CDN 边缘覆盖入手，前端能做的有限。
- **为什么 LCP 图不能懒加载？** 它是首屏主要内容，懒加载等于把"主要内容可见"推迟到滚动之后。

</details>

---

## 136. INP 差应该怎么排查？

<!-- question: {"category":"browser","type":"scenario","difficulty":"advanced","tags":["浏览器","性能"],"estimatedMinutes":8} -->

用户反馈"点击后没反应"。指标显示 INP 偏高，请给出排查与优化步骤。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

INP 由"交互处理时间 + 主线程排队"决定。治理重点是消灭长任务、把非紧急工作延后，并确保交互反馈在下一帧内出现。

### 排查步骤

1. 用 Performance 面板录制一次交互，看 `Event: click/input` 的处理总时长与前后长任务。
2. 区分"事件处理本身很慢"与"主线程已被其他长任务占满"（后者是排队问题）。
3. 减少事件处理中的同步工作：复杂计算切片、移到 Worker，或用 transition/deferred value 延后非紧急更新（见第 55、56 题）。
4. 避免强制同步布局：批量读、批量写（见第 77 题）。
5. 检查第三方脚本与埋点是否在交互路径上同步执行。

### 边界与易错点

- 输入延迟也可能来自框架之外的阻塞：同步存储读写、大数组排序、正则回溯。
- 用 `setTimeout` 把工作延后只是挪到下一个任务，仍可能制造卡顿。
- 只看平均耗时不够：INP 取的是最差交互，应看 p75/p95（见第 134 题）。
- 交互必须有即时视觉反馈，否则用户会把"没反应"感知为卡顿，即使指标尚可。

### 追问

- **为什么首屏指标好但用起来卡？** LCP 与 INP 测的是不同阶段；用起来卡通常来自长任务与高频更新。
- **怎么验证改善？** 对比同一交互的处理时长、长任务数量与 p75 INP。

</details>

---

## 137. CLS 的来源与治理方法是什么？

<!-- question: {"category":"browser","type":"theory","difficulty":"intermediate","tags":["浏览器","性能"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

CLS 来自"没有预留空间的动态变化"：无尺寸的图片/iframe/广告、字体替换引起的文本重排，以及渲染后插入或移除内容。

### 原理与示例

- 图片、视频、iframe 显式设置 `width`/`height` 或 `aspect-ratio`，让浏览器提前占位。
- 字体配合 `font-display` 与回退字体度量匹配，减少替换时的位移。
- 骨架屏尺寸贴近最终内容；不要让占位容器高度为 0 再突然撑开。
- 动态插入的提示条、banner 应预留空间或使用覆盖式布局。

### 边界与易错点

- CLS 只统计**意外**偏移：由用户交互直接引起的位移不计入，但仍影响体验。
- 用 `visibility: hidden` 再显示、或绝对定位遮盖被移除内容，可能"骗过"指标而不解决体验。
- 移动端软键盘与系统字体缩放会带来额外位移，需要真机验证。
- 用 `object-fit` 掩盖图片比例问题，本质仍是布局问题。

### 追问

- **为什么图片必须有宽高？** 浏览器需要提前知道占位尺寸，否则只能等图片加载后重排。
- **怎么定位具体元素？** 用 Performance 面板的 Layout Shift 记录查看"谁移动了"。

</details>

---

## 138. Service Worker 的缓存策略与更新陷阱有哪些？

<!-- question: {"category":"browser","type":"theory","difficulty":"advanced","tags":["浏览器","缓存"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

Service Worker 是一层可编程代理，能力强但更新流程复杂；最典型的陷阱是"用户长期拿到旧版本"，因此缓存版本与激活策略必须显式设计。

### 原理与示例

- 常见策略：`cache-first`（静态资源）、`network-first`（HTML 与接口）、`stale-while-revalidate`（可接受短暂陈旧）。
- 生命周期：安装 → 激活 → 接管页面；新版本默认处于 waiting，直到旧页面全部关闭。
- 更新实践：用构建版本号命名缓存、激活时清理旧缓存、必要时提示用户刷新；关键数据不要长期缓存。

### 边界与易错点

- 缓存优先且不更新会造成"改了代码用户看不到"，排查时极易误判为后端问题。
- Service Worker 脚本自身也被缓存，更新探测逻辑要正确，否则永远发现不了新版本。
- 它可能缓存多个用户的数据，共享设备上会串号；敏感响应必须走网络或按用户分区（见第 141 题）。
- 调试必须用 Application 面板的 Service Worker 工具，普通"禁用缓存"不生效。

### 追问

- **什么时候真的需要它？** 离线优先、推送、后台同步，或需要精细控制缓存策略时。
- **不用会怎样？** HTTP 缓存通常已够用；引入 Service Worker 会显著增加调试与运维复杂度（见第 131 题）。

</details>

---

## 139. bfcache 是什么？哪些做法会阻止它？

<!-- question: {"category":"browser","type":"theory","difficulty":"intermediate","tags":["浏览器","性能"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

bfcache（往返缓存）让浏览器在导航离开时**冻结整个页面**而不是销毁，返回时瞬间恢复；它能显著改善返回体验，但会被某些监听器与缓存指令破坏。

### 原理与示例

- 进入 bfcache 时触发 `pagehide`，恢复时触发 `pageshow`（`event.persisted` 为 `true`）。
- 常见阻碍：`unload` 监听、`beforeunload`、`Cache-Control: no-store`、打开中的 IndexedDB 事务或未完成请求，以及部分长连接。

### 边界与易错点

- 不要用 `unload` 做清理，改用 `pagehide`/`visibilitychange`：既兼容 bfcache，也能覆盖移动端切后台。
- 恢复后的页面是冻结前的快照，数据可能已过期，需要监听 `pageshow` 重新校验。
- 定时器与动画在冻结期间不推进，恢复时会"跳时间"，依赖时间差的逻辑要重算。
- 全站 `no-store` 会同时牺牲 bfcache 与性能，应按资源类型区分（见第 131 题）。

### 追问

- **怎么验证没被禁用？** DevTools 的 back-forward cache 测试会指出具体阻碍原因。
- **为什么改监听器就能恢复？** 浏览器无法安全冻结仍持有未完成副作用的页面，监听器是它判断风险的信号之一。

</details>

---

## 140. 图片优化：格式、尺寸、懒加载与 LCP 的关系是什么？

<!-- question: {"category":"browser","type":"theory","difficulty":"intermediate","tags":["浏览器","性能","图片"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

优化顺序是"用对尺寸 → 用对格式 → 正确的解码与加载策略"。首屏 LCP 图必须立即加载并提权，首屏之外的图才适合懒加载。

### 原理与示例

- **尺寸**：用 `srcset`/`sizes` 按视口与 DPR 提供合适分辨率，避免下载后缩放。
- **格式**：AVIF/WebP 通常优于 JPEG/PNG，但要保留降级路径；图标优先 SVG。
- **加载**：首屏 LCP 图用 `fetchpriority="high"`，**不要**加 `loading="lazy"`；首屏以下的图用 `loading="lazy"` 并显式设置宽高。
- **解码**：配合 `decoding="async"` 减少主线程阻塞。

### 边界与易错点

- 只换格式不换尺寸，收益有限；尺寸正确往往比格式收益更大。
- `loading="lazy"` 用在 LCP 图上会明显恶化指标（见第 135 题）。
- 没有宽高会造成 CLS（见第 137 题）。
- 图片 CDN 的自动格式转换要与缓存策略配合，避免同一 URL 返回不同内容导致缓存混乱。
- 装饰性图片应让屏幕阅读器忽略（`alt=""`），内容图片必须有有意义的 `alt`。

### 追问

- **什么时候用 `<picture>`？** 需要按格式或媒体条件提供不同来源时。
- **要预加载几张图？** 只有一张 LCP 图值得 `preload`，多了会挤占带宽（见第 133 题）。

</details>

---

## 141. 存储分区与 Cookie 的现代限制有哪些？

<!-- question: {"category":"browser","type":"theory","difficulty":"advanced","tags":["浏览器","存储"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

现代浏览器在隐私方向上收紧了三件事：第三方 Cookie 与存储被分区、Cookie 默认 `SameSite=Lax`、以及存储配额按源管理且可能被清理。跨站嵌入场景必须重新设计。

### 原理与示例

- **存储分区**：iframe 中的 `localStorage`/`IndexedDB` 按"顶层站点 + 嵌入站点"分区，同一 iframe 在不同站点下看不到同一份数据。
- **Cookie**：`SameSite=None` 必须同时 `Secure`；未声明时默认 `Lax`，跨站 POST 不会携带（见第 75 题）。
- **配额与持久化**：`navigator.storage.estimate()` 查看用量，`navigator.storage.persist()` 申请持久化以减少被清理概率。

### 边界与易错点

- 依赖第三方 Cookie 的跨站登录、埋点与广告会失效，应改用服务端回传或第一方方案。
- `localStorage` 是同步 API，写入大对象会阻塞主线程；大量数据应用 IndexedDB。
- 无痕模式与"清理站点数据"会随时清空存储，关键状态必须有服务端权威来源。
- 敏感数据不要长期放在前端存储；凭据用 `HttpOnly` Cookie 可降低 XSS 危害（见第 76 题）。

### 追问

- **怎么检测存储可用？** 做一次写入-读取自检并处理异常，不要假设一定可用。
- **跨标签页同步怎么做？** 可用 `BroadcastChannel` 或 `storage` 事件，但要注意分区与权限限制（见第 111 题）。

</details>

---

## 142. 弱网与离线优先应该怎么设计？

<!-- question: {"category":"browser","type":"scenario","difficulty":"advanced","tags":["浏览器","性能"],"estimatedMinutes":8} -->

业务需要支持移动端弱网场景（例如外勤人员提交表单）。请说明离线优先的设计思路与风险。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

先明确"哪些能力必须在线"，再用"本地优先 + 后台同步 + 显式冲突策略"补齐弱网体验，不要假设网络总是可用。

### 设计框架

1. 定义离线能力边界：只读缓存、本地保存草稿，还是允许完整离线提交。
2. 用户输入先落本地（IndexedDB），提交改为"入队 + 后台重试"，避免数据丢失。
3. 提供明确的网络状态反馈与重试入口，并区分"请求失败"与"尚未提交"。
4. 恢复网络后按顺序重放队列，服务端用幂等键去重（见第 72 题）。
5. 冲突策略必须显式：以服务端为准、以本地为准，还是交给用户选择。

### 边界与易错点

- 队列重放顺序影响业务语义（先创建后修改），需要保序或建立依赖关系。
- 弱网下超时与重试会放大后端压力，必须配合退避与抖动（见第 93 题）。
- 本地草稿可能包含敏感信息，要考虑加密、过期清理与共享设备场景（见第 141 题）。
- 离线缓存存在版本问题：缓存内容与代码不匹配时更容易出错（见第 138 题）。
- 不要用乐观 UI 掩盖提交失败，用户会以为数据已经保存（见第 119 题）。

### 追问

- **怎么测量弱网体验？** 用网络限速模拟与真实设备在弱信号下的现场数据（见第 84 题）。
- **什么时候值得做完整离线？** 核心场景本身在移动/外勤，且业务能接受最终一致性时。

</details>

---

## 143. monorepo 什么时候值得引入？

<!-- question: {"category":"engineering","type":"theory","difficulty":"advanced","tags":["工程化","monorepo"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

当多个应用或包需要共享代码、统一发布节奏，或需要原子化的跨包改动时，monorepo 才有价值；否则只会增加工具链复杂度。

### 原理与示例

- **收益**：跨包原子提交与统一版本、代码复用成本低、依赖与工具链统一、大范围重构可一次性完成。
- **成本**：构建与 CI 复杂度上升（需要增量与缓存）、权限与发布流程更复杂、仓库体积膨胀。
- **常见做法**：包管理器的 workspace + 任务编排工具，配合"只构建受影响包"的增量策略（见第 145 题）。

### 边界与易错点

- 包边界不清时，monorepo 会把耦合放大，需要配套依赖规则与 lint 约束（见第 115 题）。
- 没有增量构建与远程缓存，CI 时间会随仓库增长迅速恶化。
- 版本策略要先选：统一版本简单但耦合，独立版本灵活但发布复杂。
- 只有一两个应用且几乎不共享代码时，多仓库更简单。

### 追问

- **怎么判断"共享代码"是不是借口？** 看是否真有多个消费者与独立发布需求；只有一处使用的包通常不值得独立。
- **先做什么准备？** 先梳理依赖边界与构建产物，再引入工具，避免"先上工具再补规则"。

</details>

---

## 144. lockfile 与依赖解析为什么会造成"本地正常、CI 失败"？

<!-- question: {"category":"engineering","type":"theory","difficulty":"intermediate","tags":["工程化","依赖"],"estimatedMinutes":5} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

因为本地与 CI 解析出的依赖树可能不同：lockfile 未提交或被忽略、Node 与包管理器版本不一致、以及 semver 范围内的传递依赖漂移，都会造成差异。

### 原理与示例

- lockfile 必须提交，CI 使用冻结安装（而不是静默更新），保证解析结果一致。
- 用 `packageManager`、`.nvmrc` 之类固定包管理器与 Node 版本，避免解析算法差异。
- 传递依赖在 `^`/`~` 范围内可能升到不同次版本，行为变化可能来自这里而不是业务代码。

### 边界与易错点

- 在 CI 里"顺手更新 lockfile"会掩盖问题，让本地与线上产物不一致。
- 只锁直接依赖不够：必须锁整棵依赖树的解析结果。
- 私有 registry 与镜像配置差异也会造成"某个包找不到"，要在 CI 与本地统一。
- 排查时先对比依赖版本解析结果，而不是先怀疑业务代码。

### 追问

- **依赖升级怎么更安全？** 小步升级 + 审查锁文件变更 + 关键路径回归测试（见第 85 题）。
- **要不要把版本写死？** 直接依赖用范围 + lockfile 锁定解析结果，通常比全部写死更可维护。

</details>

---

## 145. 构建缓存与增量构建应该怎么设计？

<!-- question: {"category":"engineering","type":"theory","difficulty":"intermediate","tags":["工程化","构建"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

缓存是否有效取决于**输入指纹是否准确**：源文件、依赖版本、构建配置与环境变量共同构成 hash，任一项变化都必须让缓存失效。

### 原理与示例

- **任务级缓存**：以输入 hash 为 key 缓存产物，命中则跳过；monorepo 中还需声明包之间的依赖关系（见第 143 题）。
- **打包器缓存**：复用模块转换结果，可显著加快二次构建。
- **远程缓存**：CI 之间共享命中结果，但必须保证不同分支与环境的产物语义一致。

### 边界与易错点

- 输入声明不全是最常见的坑：环境变量、生成代码、外部资源未纳入指纹，会出现"改了没生效"。
- 产物可移植性要验证：绝对路径、平台差异、时间戳都会破坏跨机器命中。
- 构建失败不应写入缓存，否则会持续失败或产生"假成功"。
- 缓存不是免费的：命中率低时哈希与上传成本会超过收益。

### 追问

- **怎么判断缓存有效？** 做对照实验：改无关文件应命中，改相关文件必须失效。
- **什么时候该放弃缓存？** 构建本身很短，或调试产物不一致的成本高于节省的时间时。

</details>

---

## 146. 前端包体积治理应该怎么做？

<!-- question: {"category":"engineering","type":"theory","difficulty":"intermediate","tags":["工程化","体积"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

先量化（入口体积、路由分包、重复依赖），再按"删、拆、换、延"治理：删掉无用依赖、拆分代码、替换更小的实现、延迟非关键代码。

### 排查步骤

1. 用体积分析工具查看产物构成，区分自有代码与第三方依赖。
2. 找出重复的多版本依赖与整包引入的聚合包（见第 82 题）。
3. 按路由与重型功能模块拆分动态导入（见第 58 题）。
4. 替换体积与收益不成比例的依赖，或改为按需引入。
5. 把非首屏能力（图表、编辑器、导出）延迟加载；字体与图片同样要治理（见第 140 题）。
6. 在 CI 中设置体积预算，避免无感回退（见第 85 题）。

### 边界与易错点

- 只看 gzip 后的入口体积不够，还要看解析执行成本与关键路径上的阻塞资源。
- 盲目拆包会增加请求与缓存碎片，收益要用真实网络数据验证。
- polyfill 与兼容目标是常见"隐形体积"，应按实际浏览器支持范围裁剪。
- tree shaking 失败往往源于依赖发布形态，而不是调用方的写法（见第 147 题）。

### 追问

- **预算怎么定？** 以当前基线为起点设小幅下降目标，并在 CI 中固定检查方式与阈值。
- **体积越小越好吗？** 不是，要与功能价值权衡；但增长必须是显式决策，而非意外漂移。

</details>

---

## 147. ESM/CJS 双发布与 `exports` 字段有哪些坑？

<!-- question: {"category":"engineering","type":"theory","difficulty":"advanced","tags":["工程化","依赖"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

`exports` 用条件（`types`/`import`/`require`/`browser`/`node`）把不同消费方式映射到不同产物；条件**顺序即优先级**，写错会导致类型找不到，或同一个包被加载两次。

### 原理与示例

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

- `types` 必须放在最前，否则某些解析顺序会先匹配运行时条件而丢失类型。
- 同时提供 `require` 与 `import` 产物可兼容旧环境，但要警惕"双包"：同一包被两种方式各加载一次，导致 `instanceof` 失效与单例重复。

### 边界与易错点

- 只写 `main`/`module` 而不写 `exports`，会让深层导入与条件解析行为不可控。
- 一旦声明 `exports`，未列出的子路径默认**不可访问**，会破坏使用者的深层导入。
- 相对路径必须以 `./` 开头，拼写错误往往安装后才暴露。
- 类型声明与运行时产物版本不匹配会造成"类型通过、运行报错"。
- 打包库时不要把依赖打进去，否则消费者会重复依赖（见第 146 题）。

### 追问

- **要不要同时发布 CJS？** 消费方仍有 CJS 需求时提供，但应长期收敛到 ESM；只发 ESM 需确认使用方环境。
- **怎么验证产物正确？** 在独立的 ESM 与 CJS 项目中各写一个最小冒烟用例。

</details>

---

## 148. 如何治理 flaky 测试？

<!-- question: {"category":"engineering","type":"theory","difficulty":"intermediate","tags":["工程化","测试"],"estimatedMinutes":8} -->

<details>
<summary><strong>展开参考答案与解析</strong></summary>

flaky 的根因几乎都是"不确定性"：时间、并发、网络、共享状态与随机数据。治理必须先量化，再逐个消除来源，而不是靠重跑掩盖。

### 排查步骤

1. 记录"重跑才通过"的比例，把 flaky 当作缺陷而不是噪声。
2. 分类根因：固定 `setTimeout` 等待、真实网络、共享数据库或本地存储、随机数据与时钟、用例间顺序依赖。
3. 改造方式：用可等待断言替代固定延时、mock 网络边界、每个用例隔离状态、注入可控时钟与固定随机种子（见第 69 题）。
4. 对确实无法稳定的用例明确标记并限期修复，而不是长期自动重跑。

### 边界与易错点

- 提高超时时间只是掩盖问题，会让失败更难定位。
- 全局共享的测试数据会让用例互相影响，并行执行时更容易暴露。
- E2E 依赖真实第三方环境必然不稳定，应使用测试替身或稳定的预发环境（见第 85 题）。
- 删除失败用例是最坏的处理：既没解决根因，也丢掉了覆盖。

### 追问

- **能不能自动重试？** 可以用于收集数据，但必须上报重试次数，否则问题会被长期隐藏。
- **怎么防止新增 flaky？** 在 code review 中禁止固定延时与真实网络访问，并提供可复用的测试工具。

</details>

---

## 149. 前端灰度发布与 feature flag 应该怎么设计？

<!-- question: {"category":"engineering","type":"scenario","difficulty":"advanced","tags":["工程化","发布"],"estimatedMinutes":8} -->

新功能需要按用户分批放量并能快速回滚。请给出灰度与 feature flag 的设计要点。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

灰度是"控制暴露面"，flag 是"控制代码路径"；两者都必须有明确的生命周期管理，否则会沉淀成难以清理的技术债。

### 设计框架

1. 明确灰度维度：用户 id、租户、地域、设备或百分比；维度在客户端与服务端必须一致，避免同一用户看到两种结果。
2. flag 取值可缓存但要能快速失效，并保证**默认值安全**（拉取失败时回退到旧路径）。
3. 新功能要配可观测指标与快速回滚路径；灰度期间对比错误率与核心转化（见第 84 题）。
4. 每个 flag 记录负责人、创建时间与清理期限，稳定后必须移除代码分支。

### 边界与易错点

- 长期存在的 flag 会让分支与测试矩阵膨胀，把清理纳入发布流程才能控制。
- 客户端 flag 可被绕过，安全相关逻辑必须服务端判定（见第 108 题）。
- flag 拉取失败要有确定性回退，不能出现"一部分用户直接挂掉"。
- 灰度期间的数据分析要按分组统计，否则结论会被污染。
- 不要在渲染关键路径上同步等待 flag，避免恶化 LCP/INP（见第 134 题）。

### 追问

- **怎么选灰度维度？** 优先选能代表真实用户分布的维度，并保证同一用户分组稳定。
- **回滚要准备什么？** 开关、旧版本静态资源与数据兼容策略；只回滚代码而缺少数据兼容方案经常会失败。

</details>

---

## 150. 如何把前端错误与后端 trace 串起来？

<!-- question: {"category":"engineering","type":"scenario","difficulty":"advanced","tags":["工程化","监控"],"estimatedMinutes":8} -->

线上出现前端报错，需要快速定位到对应的后端链路。请说明如何打通两端的可观测性。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

让每个请求携带可跨端传播的标识（traceId/requestId），在客户端错误上报中带上它，服务端与网关记录同一标识，从而把前端现象与后端链路关联起来。

### 设计框架

1. 请求发起时生成或透传 `traceparent`/`requestId`，并确认响应头能回传该标识。
2. 前端错误上报统一附带：release、路由、traceId、用户操作上下文、设备与网络信息（见第 84 题）。
3. 后端与网关记录同一标识，日志与链路追踪按它串联。
4. 在监控平台配置"前端错误 → 后端链路"的跳转，缩短定位时间。

### 边界与易错点

- 只在客户端生成而不透传到服务端，就无法串联；必须确认中间层不会丢弃该请求头。
- 采样策略要跨端一致，否则出现"前端采到了、后端没采到"。
- 标识本身不能包含隐私信息，避免成为新的泄露点。
- 跨域时需要服务端允许读取该响应头（见第 75 题）。
- 渲染错误、脚本异常常常没有对应后端链路，这类要靠 release + source map 定位（见第 83 题）。

### 追问

- **为什么必须一起上报 release？** 它是指向 source map 与发布记录的钥匙。
- **怎么降低上报成本？** 采样 + 按指纹聚合 + 分级上报，而不是每条错误都完整上报（见第 84 题）。

</details>

---

# 第八部分：模拟面试卷

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

能始终区分"组件函数执行""reconciliation""DOM commit"；Effect 回答不使用"模拟生命周期"作为唯一解释。

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

回答包含业务约束、前后端边界、失败模式、监控和 trade-off；不把"用了某库"当成结果。

---

# 第九部分：面试官评分表与错题表

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
| 个人贡献 | 一直说"我们" | 说明负责部分 | 说明协作和决策边界 |
| 方案 | 只报技术名 | 说明实现 | 比较候选方案与代价 |
| 结果 | "效果很好" | 有可验证结果 | 有前后指标与复现条件 |
| 风险 | 不提失败 | 有错误处理 | 有监控、降级、回滚 |
| 复盘 | 没有 | 说出不足 | 能提出下一阶段设计 |

---

# 第十部分：官方查证资料

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

当你能把同一个原理连接到 bug、性能、架构和用户体验时，才真正从"会用 API"进入了"有技术深度"。
