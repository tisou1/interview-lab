# JavaScript / React 原理与实战模拟面试题库

> 面向 3–4 年 React 前端求职；包含原理题、追问题、代码实战、评分点与模拟面试卷。
>
> 版本背景：2026-09-14，React 19.3；内容审校：2026-10-12。版本相关内容单独标注并附一手资料；基础原理适用于 React 18/19 及多数存量项目。

---

> 本次审校覆盖原有 1–150 题，补充题干、机制、边界与参考实现；新增 151–156 题，覆盖异步控制、原型污染与 TypeScript 类型操作。原编号保持稳定。

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

请区分规范抽象与引擎实现，说明三者如何协作；函数在另一作用域调用时，标识符查找顺序是否改变？

<details>
<summary><strong>展开参考答案与解析</strong></summary>

执行上下文是「一次代码执行所需的全部运行信息」的抽象，可以理解为它关联当前代码、词法环境与 `this`；词法环境负责标识符绑定并沿 outer reference 形成作用域链；调用栈则是承载这些上下文的栈式结构。三者不是同一层概念，不要混着说。

### 原理与示例

- **词法环境**在教学上可理解为绑定记录及外层链接；现代规范以 Environment Record 及 `[[OuterEnv]]` 描述。记录还有函数、全局、模块等种类，不能把 `var` 一律归为对象式记录：函数内 `var` 由函数环境记录承载，全局经典脚本的 `var` 才主要关联全局对象记录。
- **变量查找顺序**：先查当前环境记录，找不到就沿 outer reference 逐层向外，直到全局环境；仍找不到才抛 `ReferenceError`。
- **作用域链由源码的词法嵌套位置决定**，与函数在哪里被调用无关，这是闭包能读到外层变量的原因。
- **执行上下文栈**描述当前及被挂起的执行；函数调用通常对应入栈、返回对应出栈。`this` / `new.target` 等通过函数环境记录关联，规范抽象不等于引擎实际的机器栈内存布局。

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
- 浏览器**经典脚本**的全局环境包含对象记录与声明式记录；顶层 `var` / 函数声明通常关联全局对象属性，`let` / `const` 不会。ESM 顶层声明属于模块环境，不能照搬这条规则。
- 调用栈溢出抛出的是 `RangeError`，不是 `ReferenceError`，也不要和堆内存不足（`RangeError: Invalid string length` 之类）混为一谈。

### 追问

- 递归太深为什么栈溢出？因为每次未返回的调用都占一个栈帧，深度超过引擎限制即抛错；改写成循环或显式栈可以把空间搬到堆上。
- `this` 和词法环境有什么关系？`this` 由调用方式决定（箭头函数除外，它继承外层），与变量沿作用域链查找是两套独立规则。

参考：[环境记录](https://tc39.es/ecma262/multipage/executable-code-and-execution-contexts.html#sec-environment-records)。

</details>

---

## 2. 什么是变量提升？`var`、`let`、`const` 和函数声明有什么区别？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

以浏览器经典脚本与 ESM 为背景，解释作用域、绑定建立与初始化、TDZ；分析声明前读取、重复声明及函数表达式。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

"提升"是"进入作用域时先建立绑定"这一行为的观察结果，不是引擎真的把源码搬到顶部。`var` 的绑定会被初始化为 `undefined`；`let`/`const` 的绑定在声明语句执行前处于未初始化状态（TDZ），访问会抛 `ReferenceError`。

### 原理与示例

- 差别主要来自绑定作用域及初始化时机，不是「var 用对象记录、let 用声明式记录」的简单分类。函数内 var 是函数作用域，let / const 是块作用域；ESM 顶层声明不会自动变成全局对象属性。
- **函数声明**在进入作用域时即完成绑定初始化，所以声明前可调用；**函数表达式**本质是赋值，声明前是 `undefined` 或 TDZ。
- `const` 限制的是绑定不可重新赋值，对象内容仍然可变。
- `class` 与 `let` 一样存在 TDZ，`new C()` 写在类声明之前会抛错。

```js
console.log(a) // undefined
var a = 1

sayHi() // OK：函数声明已初始化
function sayHi() {}

console.log(b) // ReferenceError：本段执行在此中断
let b = 2
```

### 边界与易错点

- `typeof undeclaredVar` 返回 `'undefined'` 不抛错；但 `typeof tdzVar` 会抛 `ReferenceError`，因为绑定已存在、只是尚未初始化。这两个"undefined"含义不同。
- 同一作用域内 `let` 与 `var` 重复声明同名变量是语法阶段的 `SyntaxError`（整段脚本都不执行），而重复 var 声明本身不会重新赋值，只有执行初始化表达式才改变已有值。
- 严格模式与 ESM 中块级函数声明是块作用域绑定；非严格经典脚本可能应用 Annex B 的兼容规则，增加函数/全局作用域绑定。不要把这些不同环境的规则混用。
- 浏览器经典脚本顶层 var / 函数声明通常关联全局对象属性；ESM 和 Node CommonJS 文件有模块作用域，不能套用。

### 追问

- **为什么要引入 TDZ？** 把"声明前使用"从静默拿到 `undefined` 变成显式报错，配合 `const` 帮助尽早暴露逻辑错误。
- **`for (let i...)` 为什么每轮都有独立的 `i`？** 规范为每次迭代创建新的环境记录并复制上一轮的值，因此闭包捕获到的是每一轮各自的绑定。

参考：[声明实例化](https://tc39.es/ecma262/multipage/executable-code-and-execution-contexts.html#sec-functiondeclarationinstantiation)。

</details>

---

## 3. 闭包到底保存了什么？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript","闭包"],"estimatedMinutes":3} -->

用计数器与共享变量说明闭包捕获绑定还是值、何时保留环境，以及闭包与内存泄漏的区别。

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
- **闭包与 this 有关吗？** 词法变量捕获不决定普通函数的 this；箭头函数没有自己的 this 绑定，会沿词法环境读取外层 this，常称为捕获词法 this。

</details>

---

## 4. `this` 的值如何确定？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

分析严格模式独立调用、方法、call/apply/bind、new 与箭头函数的 this，并说明方法回调和绑定函数被 new 调用的边界。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

普通函数的 `this` 由**调用方式**在运行时决定，不由定义位置决定。先区分构造调用、绑定函数、方法调用与独立调用；「new > 显式绑定 > 隐式绑定」是记忆法，不能覆盖箭头函数及宿主回调的全部规则。

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
detached() // 严格模式因 this === undefined 抛 TypeError；非严格模式读全局 name
user.arrow() // 取决于定义位置的外层 this，与 user 无关
```

### 边界与易错点

- 单独传出方法值会失去原方法调用的接收者；回调 API 可能指定自己的 this / thisArg（例如 arr.map(fn, receiver)）。需要保留原对象时用 bind 或箭头函数包装。
- 事件监听器里的 `this` 是 `currentTarget`（普通函数），而 `event.target` 是实际触发元素；箭头函数拿不到 `this`，但可以用 `event.currentTarget`。
- 非严格模式与严格模式的默认绑定不同，而 ESM、类体、`"use strict"` 都是严格模式，所以不要再按"`this` 默认是 window"背结论。
- `new (obj.fn)()` 走 `new` 规则，`this` 是新建实例而不是 `obj`。

- new 调用可构造的绑定函数时忽略绑定的 thisArg，仍保留预绑定参数；给箭头函数 bind 不会赋予它构造能力。

### 追问

- **怎样在回调里保住 `this`？** 首选箭头函数或显式 `bind`；避免用 `const self = this` 这类遗留写法。
- **箭头函数适合当对象方法吗？** 一般不适合，它拿不到调用者对象；适合用在需要固定外层 `this` 的回调里。

</details>

---

## 5. `new Foo()` 做了什么？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

说明普通基类构造的创建、原型、this 与返回值规则；解释派生类例外及 Object.create + apply 无法覆盖的语义。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

`new Foo()` 的核心是四步：创建新对象 → 把新对象的 `[[Prototype]]` 指向 `Foo.prototype` → 以新对象为 `this` 执行 `Foo` → 若构造函数返回对象类型的值就采用它，否则返回新对象。

### 原理与示例

```js
function construct(Ctor, ...args) {
  // 标准内建负责校验 [[Construct]]，支持 class 与内置构造函数
  return Reflect.construct(Ctor, args)
}
```

四步描述适用于普通基类构造。Reflect.construct(Ctor, args, NewTarget) 可显式指定 new.target；Object.create + apply 只能近似普通函数，无法完整实现 new。

### 边界与易错点

- 构造函数返回**原始值**（`return 1`）或 `null` 时会被忽略，仍然返回新对象；只有对象/函数类型的返回值才生效。
- 箭头函数没有 `[[Construct]]`，不能用 `new`；类构造函数不加 `new` 调用会抛 `TypeError`。
- `Foo.prototype` 不是对象时（如被赋值为 `1`），new 会退化为使用构造目标所属 realm 的 Object.prototype 作为原型，这是规范行为但属于糟糕写法。
- 近似实现不能替代 `Reflect.construct`：类构造函数无法用 `apply` 调用，派生类的 `new.target` 语义也无法还原。
- 判断是否经构造调用用 new.target；this instanceof Foo 只检查原型关系，普通调用也能通过 call 传入已有实例而得到 true。

- 派生类在 super() 前没有已初始化的 this；返回对象可替代实例，显式返回非 undefined 原始值则抛 TypeError，不能套用基类「忽略原始返回值」。

### 追问

- **`new.target` 有什么用？** 区分"直接调用"与"`new` 调用"，实现抽象基类检查，或在派生类中把真正的构造目标继续传给父类。
- **`instanceof` 能替代类型判断吗？** 不能完全替代：它依赖原型链，跨 realm（例如 iframe）可能失效；Worker 消息通常在接收方重新结构化克隆，不能与直接引用另一 realm 的实例混为一谈，也可能被 `Symbol.hasInstance` 改写。

参考：[构造语义](https://tc39.es/ecma262/multipage/ordinary-and-exotic-objects-behaviours.html#sec-ecmascript-function-objects-construct-argumentslist-newtarget)。

</details>

---

## 6. 原型链如何工作？`prototype` 与 `__proto__` 有什么区别？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript","原型链"],"estimatedMinutes":3} -->

区分内部原型、构造函数 prototype 和 __proto__；同时分析读取、继承 setter 和不可写属性对赋值的影响。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

普通对象通过内部槽 `[[Prototype]]` 关联原型，属性读取沿链逐层查找到 null；Proxy 等特殊对象还可能通过内部方法/陷阱自定义行为。`prototype` 与 `[[Prototype]]` 是两个不同层次的东西：前者是**函数对象上的普通属性**，在 `new` 时被用作新实例的原型；后者是**对象自身的原型链接**，`__proto__` 只是访问它的历史遗留访问器。

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

- 原型链上的不可写数据属性也会阻止普通赋值创建同名自身属性；继承访问器没有 setter 同样阻止写入。严格模式抛错，非严格模式通常静默失败。

### 追问

- **`Object.create(null)` 有什么实际用途？** 无原型字典可减少继承属性和特殊访问器冲突；它不保证后续递归合并到普通对象时安全，仍需校验不可信路径键或使用 Map（见第 153 题）。
- **为什么推荐 `Object.hasOwn(obj, key)`？** 对象自身可能覆盖 `hasOwnProperty`，无原型对象上则不存在该方法；`Object.hasOwn` 是静态方法，不受这两点影响。

参考：[OrdinarySet](https://tc39.es/ecma262/multipage/ordinary-and-exotic-objects-behaviours.html#sec-ordinarysetwithowndescriptor)。

</details>

---

## 7. JavaScript `class` 是不是传统面向对象语言里的类？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

解释 class 的原型模型及 TDZ、严格模式、私有字段、super 与字段初始化，说明「语法糖」这一说法的限制。

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

- 基类实例字段先于基类 constructor 正文初始化；派生类字段在 super() 返回后、后续语句前初始化。父类 constructor 调用子类原型方法时，子类字段还未初始化。
- 类字段用箭头函数会为每个实例复制一个函数，内存上不如原型方法，但能自动绑定 `this`；按使用场景取舍，不要无脑统一。
- 私有字段 `#x` 是语法层面的真私有（外部无法访问、不能通过 `Reflect.get` 读取），与 `_x` 这种命名约定完全不同。
- `typeof MyClass` 在类声明之前会抛错（TDZ），不能靠 `typeof` 做"未定义"探测。

### 追问

- **子类不写 constructor 会怎样？** 默认派生构造转发参数并初始化派生字段，可用 constructor(...args) { super(...args) } 近似理解；规范在参数迭代等细节上不完全等价。
- **`super` 的两种用法？** `super(...)` 调用父类构造函数；`super.method()` 在父类原型上查找方法，但 `this` 仍是当前实例。

</details>

---

## 8. 属性描述符有什么用？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

区分数据属性与访问器属性，分析 defineProperty 默认值、枚举、重定义、seal/freeze 及对象展开的边界。

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

- Object.defineProperty 创建新属性时，未给出的布尔标志默认为 false；重新定义已有属性时，省略的字段通常维持原值；对象字面量的普通数据属性，其 writable / enumerable / configurable 三个布尔标志通常都是 true，value 不是标志。这是最容易踩的差异。
- `Object.freeze` 置为不可写且不可配置，`Object.seal` 阻止新增并令已有属性不可配置，数据属性仍按原 writable 决定能否改值；两者都是**浅层**。
- 键的枚举层次：`Object.keys`（自身可枚举字符串键）⊂ `Object.getOwnPropertyNames`（自身字符串键）⊂ `Reflect.ownKeys`（再加 symbol 键）。

### 边界与易错点

- `writable: false` 不等于值不可变：如果值是对象，其内部属性仍可修改。真正的不可变需要递归冻结或使用不可变数据结构。
- `configurable: false` 无法恢复为 `true`；此时不能把数据属性改成访问器属性（反之亦然），不可写数据属性不能恢复可写；可写属性仍能改 value，或单向把 writable 改为 false；访问器的 get/set 不能任意替换。
- 展开与 `Object.assign` 只复制自身可枚举属性，会触发 getter、丢弃描述符与原型，且都是浅拷贝。
- `Object.freeze` 不会冻结 `Map`/`Set` 的内部内容，也不能阻止通过其他引用修改嵌套对象。

- freeze 不撤掉访问器 setter，setter 仍可能修改其他对象或闭包状态；它也不冻结 Map / Set 内部集合状态。

### 追问

- **`enumerable: false` 有什么用？** 让属性不参与 Object.keys、展开等可枚举遍历；Reflect.ownKeys 和直接读取仍能发现它，不能作为私有状态或安全隔离。
- **响应式系统为什么关心描述符？** Vue 2 用 `Object.defineProperty` 递归改写 getter/setter 来收集依赖，因此无法侦测新增属性和数组下标赋值，需要 `Vue.set` 兜底；Vue 3 改用 `Proxy` 拦截整个对象来解决。

</details>

---

## 9. JavaScript 的值类型与引用语义应该怎样准确表述？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

列出原始值与对象，以修改形参对象和重新赋值形参区分按值传递与共享身份，不用栈/堆位置代替语义。

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

- 七类原始值是 undefined、null、boolean、number、bigint、string、symbol；函数是可调用对象。typeof null 返回 object 是历史行为，不代表 null 属于对象。

### 追问

- **为什么 `const` 声明的数组还能 `push`？** 绑定没变，变的是对象内部状态。
- **怎样避免共享引用带来的副作用？** 在边界处复制（浅/深拷贝，见第 12 题），或按不可变更新约定只替换变化路径。

</details>

---

## 10. `==`、`===` 与 `Object.is` 有什么差异？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

比较类型转换、NaN、±0 和对象身份，并补充 SameValueZero、Map/Set 与 React 的相等语义。

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

- Map / Set / includes 使用 SameValueZero：NaN 相等且 ±0 相等；indexOf 用严格相等，因此找不到 NaN。对象仍按身份比较。
- 上述 == 规则是常见子集，还存在 BigInt 比较及浏览器 document.all 的历史例外，工程代码不要依赖例外表达空值。

### 追问

- **为什么 `[] == false` 为 true？** 布尔先转数字得到 `0`，`[]` 经 `ToPrimitive` 得到 `""` 再转成 `0`，于是相等。
- **什么时候必须用 `Object.is`？** 需要把 `NaN`/`-0` 纳入值语义比较时（如自定义缓存键、实现快照比较），或与框架的相等判断保持一致时。

参考：[相等比较](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-testing-and-comparison-operations)。

</details>

---

## 11. 隐式类型转换最容易错在哪里？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

按 ToPrimitive、拼接、数值转换和关系比较推导例子；说明 BigInt、Symbol、空字符串与业务输入校验。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

对象转原始值走 `ToPrimitive`：优先调用 `Symbol.toPrimitive`，否则按 hint（`number`、`string`、`default`）依次尝试 `valueOf` 和 `toString`。`+` 同时承担数字加法与字符串拼接，`-` / `*` 走数值转换；`<` / `>` 先转原始值，双方是字符串时按 UTF-16 码元序列比较，否则进入数值比较，因此出错几乎都源自"没意识到发生了转换"。

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

- Symbol.toPrimitive 必须返回原始值，否则抛 TypeError；普通对象 string hint 先尝试 toString，number / default hint 通常先尝试 valueOf，Date 对 default 有特殊处理。
- 转 Number 后仍要校验：Number.isFinite 排除 NaN / Infinity，但不替你判断业务范围、空输入、单位与小数位。

### 追问

- **`[] == ![]` 为什么为 true？** `![]` 先得到 `false`，再走 `==`：一侧转数字 0，另一侧 `[]` 先 `ToPrimitive` 成 `""` 再转 0。
- **怎样系统性减少这类问题？** 统一用 `===`、开启 TypeScript `strict`、输入边界做显式解析与校验、用 lint 规则约束。

参考：[ToPrimitive](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-toprimitive)。

</details>

---

## 12. 浅拷贝、深拷贝与结构化克隆有什么区别？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript"],"estimatedMinutes":3} -->

用嵌套、共享子对象和循环引用比较三种复制方式，说明类型支持、原型、描述符与 transfer 的限制。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

浅拷贝只复制第一层，嵌套对象仍与源共享引用；深拷贝按约定复制对象图中的节点与关联；`structuredClone` 是平台提供的结构化克隆算法，支持循环引用和多数内置类型，但不支持函数、DOM 节点与原型语义。

### 原理与示例

```js
const source = { child: { count: 1 } }
source.self = source
const shallow = { ...source }
const cloned = structuredClone(source)

shallow.child === source.child // true：共享嵌套对象
cloned.child !== source.child // true：克隆嵌套对象
cloned.self === cloned // true：保留循环关系
```

### 边界与易错点

- `JSON.parse(JSON.stringify(x))` **不是**可靠深拷贝：丢失 `undefined`、函数、symbol，`Date` 变字符串，`Map`/`Set` 变 `{}`，`BigInt` 抛错，循环引用抛错，`NaN`/`Infinity` 变 `null`。
- `structuredClone` 不能克隆函数、DOM 节点、`Proxy`；类实例会丢失原型变成普通对象，普通对象的可枚举自身字符串属性会被读取，getter 可能执行，setter 与访问器描述符不保留。`ArrayBuffer` 可通过 `transfer` 转移所有权而非复制。
- 浅拷贝手段（展开、`Object.assign`、`slice`、`concat`）都只处理第一层，且不复制描述符与原型。
- React 场景中整体深拷贝通常是坏味道：既昂贵又会切断引用比较带来的性能收益，正确做法是只复制变化路径。

- 深拷贝应保持共享关系：源中 a === b 的两条边通常指向同一个副本，而不只是防递归。结构化克隆不保留 symbol 键、描述符及所有内置状态（例如 RegExp.lastIndex）。
- ArrayBuffer 使用 transfer 后原缓冲区被分离，源数据不再可用，不能当作无副作用复制。

### 追问

- **`structuredClone` 为什么能处理循环引用？** 内部维护已访问对象的映射（与第 92 题用 WeakMap 保存源对象到副本映射的思路相同）。
- **什么时候真的需要深拷贝？** 跨边界传递会被外部修改的数据、需要独立快照、或必须切断引用共享时；其余情况优先不可变更新。

参考：[结构化克隆](https://html.spec.whatwg.org/multipage/structured-data.html#safe-passing-of-structured-data)。

</details>

---

## 13. 浏览器 Event Loop 如何运行？

<!-- question: {"category":"javascript","type":"theory","difficulty":"basic","tags":["JavaScript","Event Loop"],"estimatedMinutes":3} -->

限定浏览器环境，解释 task、微任务检查点和渲染机会；分析多个 task source、定时器阈值与微任务饥饿。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

事件循环按轮推进：每轮取出一个宏任务执行完 → 清空微任务队列 → 浏览器在合适时机更新渲染 → 进入下一轮。宏任务包括定时器回调、用户事件、网络回调、`MessageChannel` 等；微任务包括 Promise reaction、`queueMicrotask`、`MutationObserver`。

### 原理与示例

- **微任务检查点**按队列执行至空，包含新追加的微任务；当前 task 结束后通常有检查点，某些回调结束且执行栈为空时也会触发，不能记成「每个 task 恰好一次」。
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

- HTML 规范称 task，「宏任务」是教学称呼。浏览器存在多个 task source / queue，不保证网络、输入与定时器都在一个全局 FIFO 队列。
- Promise reaction 先于定时器适用于本任务内已入队的示例；若 Promise 尚未落定，定时器可以先执行。

### 追问

- **为什么 `setTimeout(fn, 0)` 有时明显延迟？** 主线程被长任务占用、页面处于后台被节流，或嵌套层级触发最小延迟。
- **微任务适合做什么？** 需要在"本轮同步代码全部结束、渲染之前"完成的一致性收尾，例如框架的批量更新，Vue 的 `nextTick` 就是这一思路。

参考：[事件循环](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)。

</details>

---

## 14. 输出顺序题：同步代码、Promise 和定时器

<!-- question: {"category":"javascript","type":"theory","difficulty":"advanced","tags":["JavaScript","Promise"],"estimatedMinutes":8} -->

假设以下代码在浏览器同一同步任务内执行，给出输出及每一步微任务队列，解释链式 then 与 queueMicrotask 的入队时机。

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

- `then` 在标准 Promise 上注册的 reaction 异步执行；任意自定义 thenable 的 then 方法本身可以同步调用，二者不同。
- 这道题背顺序没有意义：把 `queueMicrotask` 换成 `setTimeout(…, 0)`、把链改成 `await`、或加上 `Promise.all`，结果都会变，必须能重新推导。
- `setTimeout` 的最小延迟与后台节流会让 B 更晚，但不改变其他元素的相对顺序。

### 追问

- **为什么 D 一定在 E 之前？** D 是在 C 回调里主动入队的；E 的入队时机是 C 所在 reaction 结束后。
- **如果第一个 then 里抛错会怎样？** E 被跳过，错误沿链穿透到下一个 catch 或全局 `unhandledrejection`。

### 评分点

不仅说出顺序，还能画出每一步的队列变化，并能口述"哪个操作导致哪个 reaction 入队"。

参考：[微任务检查点](https://html.spec.whatwg.org/multipage/webappapis.html#perform-a-microtask-checkpoint)。

</details>

---

## 15. async/await 的本质是什么？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":5} -->

说明 async 启动与返回值、await 暂停/恢复、错误归属及 return await 的差异，不固定断言微任务数量。

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

- try/catch 能捕获 await 的拒绝和当前同步求值抛错，接不住未关联链的异步错误。遗漏 Promise 的拒绝可能触发 unhandledrejection；定时器回调的同步 throw 则通常走全局 error。
- 循环里逐次 `await` 是**串行**等待、耗时叠加；要并发应先 `Promise.all(tasks.map(...))` 再统一等待。
- return await 在本函数内等待，拒绝进入本层 catch，finally 在等待结束后执行；直接 return promise 时本层 finally 先执行，后续拒绝由返回的 Promise 传播。现代引擎会优化 await，不能固定断言 return await 多一次微任务或一定更慢。
- async 函数被调用时函数体**立即同步执行**到第一个 `await`，不是等到被 await 才启动。

- async 函数采用返回 Promise 的状态，但对象身份不同：async function f(p) { return p } 中 f(p) !== p。启动时机、状态传播与对象身份应分别判断。

### 追问

- **`await` 会阻塞主线程吗？** 不会，它只挂起当前函数并把控制权交回事件循环；但 `await` 右侧的表达式本身是同步求值的。
- **多个 `await` 为什么变慢？** 串行等待把延迟相加；只要能并发，就应先发起再统一等待。

参考：[V8 async 优化](https://v8.dev/blog/fast-async)。

</details>

---

## 16. Promise 链的值与错误如何传播？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript","Promise"],"estimatedMinutes":5} -->

解释派生 Promise、返回值、thenable、抛错、缺少 handler 与异步清理如何影响链的状态。

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

- catch 处理器正常返回普通值或 fulfilled thenable 才恢复成功；处理器缺失、再次 throw、返回 rejected Promise 都继续拒绝。只想记日志时应重新 throw。
- 在 `then` 里忘记 `return` 会产生"火忘"式并发，错误逃出当前链，变成 `unhandledrejection`。
- `finally` 里做异步清理必须 `return`，否则链不会等待清理完成。
- `.catch` 也属于 handler，它里面再抛错会让新 Promise 变成 rejected；`catch` 不是"错误终点"。

- p.then(success, failure) 中 failure 接不住同次 success 抛错；p.then(success).catch(failure) 才能覆盖后者。
- new Promise(async executor) 是反模式：构造器忽略 executor 返回的 Promise，await 后异常可能与外层脱离，使外层永远 pending。

### 追问

- **`Promise.reject(e).then(fn)` 会执行 fn 吗？** 不会，缺少 onRejected 时直接穿透到下一个 catch 或全局兜底。
- **怎么保证错误一定能被观测？** 每条异步链路都要有归属：能处理的就地处理，不能处理的补上下文后抛出，并在应用边界统一上报。

参考：[Promise 方法](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-properties-of-the-promise-prototype-object)。

</details>

---

## 17. `Promise.all/allSettled/race/any` 如何选择？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript","Promise"],"estimatedMinutes":5} -->

比较结果条件、输入顺序、空 iterable、非法输入及取消，分别为全量汇总、最快结束与首个成功选择 API。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

按"需要什么结果语义"来选：结果缺一不可用 `all`，需要逐项成败全量汇总用 `allSettled`，只关心最快结束用 `race`，只关心第一个成功用 `any`。四者都**不会取消**其余任务。

### 原理与示例

- `all`：全部 fulfilled 才 fulfilled；任一 rejected 立即 rejected（其余任务仍在跑，结果被丢弃）。
- `allSettled`：等全部 settled，返回 { status, value | reason } 数组；单个输入拒绝变成 reason，但非法 iterable、迭代过程抛错仍可让聚合 Promise 拒绝。
- `race`：第一个 settled 决定结果，成功或失败都可能赢，常用于超时竞争。
- `any`：第一个 fulfilled 即成功；全部 rejected 时以 `AggregateError` 拒绝。

```js
const results = await Promise.allSettled(urls.map(fetchJson))
const ok = results.filter(r => r.status === 'fulfilled').map(r => r.value)
```

### 边界与易错点

- 空数组的边界：`all`/`allSettled` 立即 fulfilled 为 `[]`，`race` 永远 pending，`any` 立即以 `AggregateError` 拒绝。
- 忽略结果不等于取消：AbortController / AbortSignal.timeout 可通知支持取消的请求停止等待或传输；不保证撤销服务端已经开始的工作，更不代表关闭整个复用连接。
- all 快速失败不取消其他任务；它已给正常迭代到的输入注册拒绝处理器，因此随后拒绝不会仅因聚合器已失败就自动触发 unhandledrejection，独立派生链仍需处理。
- 手写实现必须**按输入顺序**写回结果（用索引赋值），不能 `push`，否则顺序会随完成时间变化。

- all / allSettled 结果及 AggregateError.errors 按输入顺序排列。空 iterable 可使返回 Promise 已落定，之后注册的 then / catch 仍异步执行。
- 这些 API 消费 iterable，不负责调用函数数组；传入 [() => fetch(url)] 得到的是函数值。限流需控制任务启动时机（见第 88 题）。

### 追问

- **超时该用 `race` 还是 `AbortSignal.timeout`？** 优先 abort：`race` 只是忽略结果，不释放底层资源。
- **`AggregateError` 怎么取失败原因？** 遍历 `error.errors`；用 `all` 则拿不到全部失败，需要改用 `allSettled` 自行聚合。

参考：[Promise 聚合](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-properties-of-the-promise-constructor)。

</details>

---

## 18. 并发与并行有什么区别？JavaScript 是单线程吗？

<!-- question: {"category":"javascript","type":"theory","difficulty":"advanced","tags":["JavaScript","并发"],"estimatedMinutes":8} -->

以单个 agent 为单位区分并发/并行，说明宿主 I/O、Worker、时间切片和共享内存对响应性与耗时的影响。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

并发指多个任务在时间上交错推进（可以只有一个执行单元）；并行指多个任务在同一时刻、不同执行单元上真正同时运行。同一 JavaScript agent 通常遵循 run-to-completion；多个 Worker / agent 可同时执行 JS，「单线程」必须限定到一个 agent，不能泛指整个应用。

### 原理与示例

- 网络 I/O、部分栅格化与 GC 工作可由宿主其他线程/进程推进；HTML 解析、样式计算、布局等仍常占用主线程，不能断言这些步骤全在后台。
- `Web Worker`/`Service Worker` 提供独立的 JS 执行线程，通过 `postMessage` 与结构化克隆通信，默认不共享内存；`SharedArrayBuffer` + `Atomics` 才共享内存。
- Node 侧对应 `worker_threads` 与 `cluster`。

```js
// 看起来"异步"，但仍然是同步的 CPU 占用，会阻塞主线程
await new Promise(resolve => setTimeout(resolve, 0))
heavyLoop()
```

### 边界与易错点

- 把大循环包进 `Promise` 或 `setTimeout` **不会**让计算并行，Promise executor 本身立即同步执行；setTimeout 延后执行，二者中的计算都可能阻塞所在 agent。
- Promise 的"并发"指同时发起、等待结果，与多线程并行无关。
- 时间切片（周期性让出事件循环）主要改善响应性，调度可能增加总耗时；Worker 移走主线程计算，能否降低完成耗时取决于并行程度与通信成本。
- 渲染与 JS 共享主线程，长任务会直接恶化 INP 与动画流畅度。

### 追问

- **什么时候值得用 Worker？** CPU 密集、数据可序列化、不需要频繁访问 DOM 时；同时要把拷贝与通信成本算进收益。
- **`SharedArrayBuffer` 为什么需要跨源隔离？** 它允许真正共享内存，需要 COOP/COEP 响应头来降低 Spectre 类侧信道风险。

</details>

---

## 19. Iterator 与 Generator 解决什么问题？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":5} -->

区分 Iterator 与 Iterable，解释 Generator 惰性启动、next/yield、提前收尾、异步遍历及重复遍历条件。

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
- 常见数组迭代器 / Generator 有状态且不可重置；Iterable 能否重复遍历取决于每次 Symbol.iterator 是否返回新的 iterator。协议不能替所有自定义迭代器保证永久耗尽，应看具体契约。
- 惰性求值会让副作用执行时机变得不直观（generator 函数体内的副作用只在取值时发生）；调用生成器函数本身不会执行函数体，但参数会立即求值。
- 生成器不是异步的：它只提供暂停/恢复，异步能力要靠 async generator 或自行组合 Promise。

- for...of 因 break / return / 循环体抛错提前结束时，尝试调用 iterator.return() 收尾；Generator 可在 finally 释放资源。第一次 next(value) 的 value 不会成为首个 yield 的返回值。

### 追问

- **普通对象为什么不能用 `for...of`？** 它默认不是 iterable，需要 `Object.entries()`/`Object.keys()` 或自己实现 `[Symbol.iterator]`。
- **异步生成器有什么用？** 分页流式取数、逐块处理流式响应，比一次性 `Promise.all` 更适合数据量大的场景。

</details>

---

## 20. Map、Set、WeakMap、WeakSet 如何选择？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":5} -->

从键类型、比较、顺序、强弱引用、枚举、序列化与容量治理选择集合，并说明非注册 symbol 的边界。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

`Map`/`Set` 是强引用的键值集合与唯一值集合，可枚举、可遍历、有 `size`；`WeakMap`/`WeakSet` 弱持有**对象或非注册 symbol** 作为键，不可枚举，适合给对象挂元数据或做与对象生命周期绑定的缓存。

### 原理与示例

- `Map` 的键可以是任意值，对象键按身份比较，保留插入顺序，键不会被字符串化——这与对象字面量有本质区别。
- `Set` 保存唯一值，`NaN` 视为相等，`0` 与 `-0` 视为同一值。
- `WeakMap` 的键必须是可被弱引用的值（普通对象、函数、非注册 symbol）；不能是字符串、数字等其他原始值，也不能是 Symbol.for() 注册的 symbol；非注册 symbol 本身仍是原始值。
- 不可枚举是刻意设计：暴露遍历就会暴露 GC 时机，而 GC 是非确定的。

```js
const meta = new WeakMap()
function track(el) {
  meta.set(el, { clicks: 0 }) // el 被回收后，这条记录也自动消失
}
```

### 边界与易错点

- `WeakMap` **不是"永不泄漏"**：value 可以强引用大对象，key 在别处强可达时也不会被回收，且完全没有容量控制。
- WeakMap / WeakSet 无 clear 方法，也不能靠枚举实现 LRU；整体丢弃或替换集合引用可清除本层关联——需要容量控制时用 `Map` 加显式淘汰规则。
- `Map`/`Set` 是强引用，拿它当缓存就必须自己管容量与 TTL，否则就是泄漏源。
- 序列化差异：`JSON.stringify(new Map())` 得到 `{}`，需要手动 `[...map]`；`structuredClone` 可以克隆 `Map`/`Set`。

- Map 与 Set 都用 SameValueZero：NaN 命中，±0 相同，对象按身份。规范要求访问平均次线性，不保证任何引擎和所有输入下严格 O(1)。

### 追问

- **什么时候用 `Map` 而不是普通对象？** 键类型不限、需要 `.size`、增删频繁、需要稳定插入顺序，或要避开原型链键名冲突时。
- **`WeakRef`/`FinalizationRegistry` 能当缓存用吗？** 不能依赖：回收与回调时机都不确定，只能作为可选优化，不能承载正确性。

参考：[WeakMap](https://tc39.es/ecma262/multipage/keyed-collections.html#sec-weakmap-objects)。

</details>

---

## 21. 常见前端内存泄漏来源和排查方法是什么？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":5} -->

设计重复进出页面的复现流程，从 heap 趋势、snapshot 与 retaining path 定位持有者，并排除正常缓存和工具噪声。

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

- DevTools console、被选中的 DOM 节点与调试变量也可能保留对象，测量时排除工具影响；有限请求结束后能释放引用的增长与持续泄漏应区分。

### 追问

- **怎么区分泄漏和正常缓存？** 缓存应该有容量上限或淘汰策略；重复操作后观察基线是否回到同一水平。
- **React 里最典型的泄漏点？** 订阅与定时器没有在 Effect cleanup 中释放，以及持续请求流未取消。会结束的请求暂时持有闭包通常是生命周期或竞态问题，不能只凭卸载后有回调断定永久泄漏。

参考：[DevTools 内存排查](https://developer.chrome.com/docs/devtools/memory-problems)。

</details>

---

## 22. ESM 与 CommonJS 的核心差异是什么？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript","ESM"],"estimatedMinutes":5} -->

比较依赖解析、加载、导出绑定与循环依赖，并说明浏览器 ESM 和现代 Node 的 CJS/ESM 互操作条件。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

核心差异在**时机**与**绑定语义**：ESM 是静态模块语法，依赖关系在执行前即可解析，导入是 live binding；CommonJS 是运行时包装函数，`require` 同步加载并返回当时的 module.exports 值；若是对象，双方共享对象，不能理解成内容快照或自动拷贝。

### 原理与示例

- 语法与位置：ESM 的 `import`/`export` 只能出现在模块顶层，会被提升；CJS 的 `require` 可写在任意位置，按执行顺序同步加载。
- 绑定语义：ESM 导入的是**活绑定**，导出方后续更新，导入方能读到新值（但不能重新赋值）；CJS 拿到的是一次求值结果，重新赋值 `module.exports` 不会影响已经导入方持有的旧引用。
- 静态分析：ESM 的结构让 tree shaking 与循环依赖分析更可行；CJS 需要运行时推断，容易整包保留。
- 环境判定：浏览器原生只支持 ESM；Node 根据 type、.mjs/.cjs 等判定模块格式，并用 exports 条件选择入口；部分版本还会对未明确标记的 .js 检测模块语法。条件名本身不直接改变文件格式。
- 其他差异：ESM 支持 top-level await、默认严格模式、顶层 `this` 为 `undefined`；CJS 顶层 `this` 是 `module.exports`。

### 边界与易错点

- "用了 ESM 就一定能 tree shaking"是错的：顶层副作用、错误的 `sideEffects` 声明、整包聚合导入、依赖只发布 CJS 都会让消除失败（见第 82 题）。
- 循环依赖不一定立即报错：ESM 先建立绑定，访问尚未初始化的绑定会抛 TDZ 错误；CJS 常见到执行未完成时的"部分导出"。
- 双包发布要小心 `exports` 条件顺序与"同一模块被加载两次"，后者会导致 `instanceof` 失效、单例重复。
- 现代 Node 支持 require 加载满足条件且整个依赖图不含 top-level await 的同步 ESM，通常返回模块命名空间；带 TLA 的图需 import()。旧 Node 与工具链能力不同，应查目标版本文档。

- ESM 活绑定不可被导入方重新赋值，导出对象内容仍可变化；CJS exports 起初只是 module.exports 别名，exports = newValue 不会替换真正导出。

### 追问

- **静态 `import` 与 `import()` 的区别？** 动态导入在运行时执行、返回 Promise，可用于条件加载与代码分割（见第 58 题）。
- **怎么消除循环依赖？** 重构模块边界，把共享部分抽成第三个模块，或用依赖注入替掉反向依赖。

参考：[Node require(esm)](https://nodejs.org/api/modules.html#loading-ecmascript-modules-using-require)。

</details>

---

## 23. 防抖和节流有什么区别？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":5} -->

定义 leading/trailing、cancel/flush 与窗口语义，比较搜索、滚动和拖拽的选择，解释为何防抖不能解决竞态。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

防抖把"连续触发"收敛为静默后的一次执行；节流按约定窗口或相邻间隔限制频率，窗口边界与 leading / trailing 需明确。前者关心"最后一次"，后者关心"稳定节奏"。

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
- Date.now 可能受系统时钟调整影响，测量间隔优先使用单调的 performance.now；定时器也会受调度/节流延迟影响，不能保证更平滑或精确。
- touch / wheel 在不需 preventDefault 时可用 passive，但它不降低回调计算量；scroll 等不可取消事件不靠 passive 提速。DOM 测量与写入应分批。

### 追问

- **搜索框应该用哪个？** 通常防抖 + 请求取消；若要"输入即筛选本地数据"，节流或 `useDeferredValue` 更合适。
- **和 `requestAnimationFrame` 的关系？** rAF 不会合并多次注册；配合 pending 标志只注册一次，才能每帧最多更新一次，适合与渲染同步的更新，但不保证固定间隔（后台标签页会暂停）。

</details>

---

## 24. 事件委托为什么有效？有什么边界？

<!-- question: {"category":"javascript","type":"theory","difficulty":"advanced","tags":["JavaScript"],"estimatedMinutes":8} -->

解释 target/currentTarget、closest 与范围校验，给出委托代码，分析不冒泡事件、Shadow DOM 与 stopPropagation。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

事件委托利用事件冒泡：把众多子元素的监听收敛到共同祖先，再用 `event.target.closest()` 定位真正被点击的元素。它同时减少监听器数量，并天然覆盖后来插入的节点。

### 原理与示例

- 冒泡路径由 DOM 树决定，祖先上的监听器可以接住任意后代触发的事件。
- `event.target` 是实际触发元素，`event.currentTarget` 是绑定监听器的元素，委托时用前者定位、后者做范围校验。

```js
list.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return
  const button = event.target.closest('[data-action]')
  if (!button || !list.contains(button)) return // 关键：确认仍在容器内
  run(button.dataset.action)
})
```

### 边界与易错点

- 并非所有事件都冒泡：`focus`/`blur`（需用 `focusin`/`focusout`）、`mouseenter`/`mouseleave`、`load` 等不冒泡，部分只能在捕获阶段处理。
- Shadow DOM 可能重定向 target，composed 决定能否按规则穿越边界；composedPath() 可检查开放 shadow root 的路径，closed root 内部不会完整暴露。
- `closest` 可能命中容器之外的祖先，必须用 `contains` 校验，否则嵌套组件会误触发。
- 滥用 `stopPropagation` 会破坏其他委托逻辑（模态框、埋点、埋点外的关闭行为），优先用条件判断替代。
- React 17 起把事件监听挂在根容器而不是 `document` 上，跨根节点与 Portal 的冒泡行为需要注意（见第 52 题）。

### 追问

- **为什么说委托"自动覆盖新节点"？** 监听器不在子节点上，新增节点无需重新绑定。
- **大量同类元素怎么进一步优化？** 委托到容器 + 虚拟化列表；先测量监听器、DOM 数量和回调计算成本；委托降低注册开销，不消除大型 DOM 与重计算。

参考：[DOM 事件分发](https://dom.spec.whatwg.org/#concept-event-dispatch)。

</details>

---

## 25. 为什么不可变更新对 React 很重要？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["JavaScript","React"],"estimatedMinutes":5} -->

解释 Object.is、逐项 props/依赖比较与快照，演示只复制变化路径，分析深拷贝及原地修改的代价。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

不可变更新不是 JavaScript 的语言要求，而是一条更新纪律。变化路径的新引用让 React 的 Object.is 状态和依赖比较观测到变更；memo 默认逐项比较 props，不做整棵对象深比较，同时保留旧快照，为并发渲染、撤销、调试提供前提。

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

- 深拷贝整棵树既慢，又破坏未变化分支的引用稳定性，可能让接收这些引用的 memo 边界失去收益。正确做法是**只复制从根到变更点的路径**。
- 嵌套更新容易漏层（`{ ...prev, a: { ...prev.a, b: 1 } }`），可用 `useReducer` 集中管理，或用 immer 类工具生成结构共享结果。
- 与 class 组件的 `setState` 不同，`useState` 不做浅合并，必须自己展开。
- 不可变不等于"每层都复制"：未变化的分支必须沿用原引用，以保留这些分支的引用稳定与缓存收益。

### 追问

- **为什么并发渲染更依赖不可变？** 渲染可能被中断后重放，若状态被原地修改，渲染读到的就不是同一份快照。
- **什么时候可以接受可变？** 纯计算的局部变量、`useRef` 持有的非渲染数据，以及明确不参与渲染的缓存。

</details>

---

## 26. 前端错误应该怎样分类和传播？

<!-- question: {"category":"javascript","type":"theory","difficulty":"advanced","tags":["JavaScript"],"estimatedMinutes":8} -->

区分校验、业务、鉴权、HTTP、网络、取消与程序错误，定义传播、重试、UI 恢复及上报的职责。

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
- Error Boundary 覆盖后代渲染及相应生命周期等错误，普通事件处理器、定时器、请求 Promise 的拒绝需自行处理（见第 53 题的版本与 Actions 边界）。
- toast 不能作为唯一错误 UI：可能被忽略，也无法承载重试入口。
- 日志必须脱敏，不上报手机号、token、完整请求体等个人信息。

- fetch 遇到 HTTP 4xx / 5xx 通常仍 fulfilled，需检查 response.ok / status；网络失败、取消、解析失败与业务拒绝应分别归类。主动取消或过期结果通常无需 toast。
- 不能把所有 5xx 视为可重试，应结合幂等性、服务端契约、重试预算与 Retry-After；new Error(message, { cause: original }) 可保留原始原因与堆栈链。

### 追问

- **怎么避免同一错误刷屏？** 按错误指纹（message + stack + code）聚合计数与采样上报。
- **重试策略怎么定？** 只对幂等且可恢复的类型（网络抖动、超时、5xx）做指数退避加抖动，其余直接暴露给用户。

参考：[Fetch 标准](https://fetch.spec.whatwg.org/#fetch-method)。

</details>

---

## 27. 垃圾回收可以手动触发吗？WeakRef 应该用来解决普通缓存吗？

<!-- question: {"category":"javascript","type":"theory","difficulty":"advanced","tags":["JavaScript","缓存"],"estimatedMinutes":8} -->

区分不可达与立即回收，说明弱引用非确定性与 kept-alive 保证，为普通缓存和外部资源设计确定策略。

<details>
<summary><strong>展开参考答案与解析</strong></summary>

业务代码不能可靠地控制 GC 时机（`globalThis.gc()` 只在特定调试模式或 Node 的 `--expose-gc` 下存在），`WeakRef` 与 `FinalizationRegistry` 的回收和回调时机同样不确定，因此不能承载正确性、关键资源释放或普通业务缓存策略。

### 原理与示例

- 现代引擎采用分代加增量/并发标记清除，回收时机由内存压力与空闲时间决定。
- deref() 可能返回 undefined；成功解引用后，目标在规范 kept-alive job 范围内不会被回收，不能说同一同步执行中随时消失。FinalizationRegistry 回调可能永不运行。
- 需要释放的资源（连接、订阅、文件句柄、Worker）必须显式 `close()`/`unsubscribe()`/`terminate()`。

```js
const meta = new WeakMap() // 跟随对象生命周期，适合对象级元数据
```

普通缓存的正确做法是明确策略：容量上限 + 淘汰规则（LRU/LFU）+ TTL + 主动失效。

### 边界与易错点

- "内存会涨"不等于泄漏：先确认重复操作后基线是否回落（见第 21 题）。
- kept-alive 保证不粗略等同事件循环一轮；跨异步边界再次 deref 必须重新检查。若跨 await 使用已取得的目标，保存在局部变量并继续引用可形成强引用。
- 用 `FinalizationRegistry` 做资源清理会形成"有时不执行"的泄漏，属于设计错误。
- 调试手段（DevTools Memory/Performance、`--expose-gc`）只用于本地验证，不应出现在产品逻辑里。

### 追问

- **`WeakMap` 能当缓存吗？** 它是"跟随对象生命周期的关联存储"，没有容量与淘汰语义，只能算缓存的一个特例。
- **什么可以依赖 GC？** 自动管理普通 JS 对象内存；不可达不保证立即回收，外部资源仍应显式释放。

参考：[WeakRef](https://tc39.es/ecma262/multipage/managing-memory.html#sec-weak-ref-objects)。

</details>

---

## 28. 为什么 `Array.prototype.sort` 可能带来 React bug？

<!-- question: {"category":"javascript","type":"theory","difficulty":"advanced","tags":["JavaScript","React"],"estimatedMinutes":8} -->

分析原地排序对 props/state 的影响，给出不可变写法，并说明默认排序、稳定性、比较器与浅复制的边界。

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

- 比较器需保持一致结果、相等、反对称与传递性，不用 Math.random() 或只返回 0 / 1；(a, b) => a - b 适合有效数值，NaN / 空值需定义位置。
- 稳定排序只表示相等元素维持相对顺序，不保证时间/空间复杂度；复制数组仍共享元素对象，比较器应避免修改元素。

### 追问

- **只排序不 setState 可以吗？** 不可以，会污染父组件或其他消费者共享的数据，属于跨组件副作用。
- **团队层面怎么防？** 约定"渲染输入只读"，在 code review 与 lint 层面禁止修改入参。

参考：[数组排序](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.sort)。

</details>

---

# 第二部分：React 原理题

## 29. JSX 和 React Element 是什么？

<!-- question: {"category":"react","type":"theory","difficulty":"basic","tags":["React"],"estimatedMinutes":3} -->

请区分 JSX、React element、组件函数与 DOM 节点，并说明现代 JSX transform、key 和 React 19 的 ref 语义。

<details>
<summary>展开参考答案与解析</summary>

JSX 是语法扩展，编译后变成创建 element 的调用；React element 是普通的、**不可变的 UI 描述对象**，既不是 DOM 节点，也不是组件实例。

### 原理与示例

```jsx
const view = <Button color="red">Save</Button>

// 编译后近似为（现代 JSX 运行时）
const view = jsx(Button, { color: 'red', children: 'Save' })
```

- element 描述"想渲染什么"：包含 `type`（字符串标签或组件函数）与 `props`，`key` 用于身份识别，不传给组件；React 19 起函数组件的 `ref` 可以作为 prop 接收。element 的内部字段不应作为业务接口读取。
- React 遇到函数组件类型的 element 时会调用组件函数，返回下一层描述；最终由宿主渲染器（react-dom）决定真正的 DOM 操作。
- 因为不可变，element 可以被安全地缓存、比较与重放。

### 边界与易错点

- `<Button />` 与 `Button()` **不等价**：前者让 React 管理组件身份、Hook 归属、调度与错误边界；直接调用只是普通函数调用，会破坏组件边界，Hook 也会挂到错误的组件上。
- JSX 不是 HTML：`className`、`htmlFor`、自闭合规则、`{}` 表达式插值都不同；`undefined`、`null`、布尔值不会渲染出内容，`0` 会。
- 返回多个相邻 element 必须有共同父级或 Fragment；动态列表中的兄弟 element 应有稳定 key；文本数组项不需要 key。
- `props.children` 可能是数组、字符串或单个 element，遍历前要规范化。

### 追问

- **element 可以缓存吗？** 可以按正确依赖缓存 JSX；element 本身不拥有 state，但缓存过期 props 会显示旧 UI。状态由 React 按组件身份维护。
- **key 与 ref 的规则一样吗？** 不一样：props.key 仍不可读，需要另传业务 id；React 19 函数组件可读 props.ref，class 组件的 ref 仍指向实例。

资料来源：[React 官方文档](https://react.dev/reference/react/createElement)、[React 19 ref as a prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)。

</details>

---

## 30. React 一次更新经过哪些阶段？

<!-- question: {"category":"react","type":"theory","difficulty":"basic","tags":["React"],"estimatedMinutes":3} -->

以一次 state 更新为例，说明 trigger、render、reconciliation、commit 和 Effect 的关系。哪些工作可能被放弃？useEffect 是否一定在 paint 后执行？

<details>
<summary>展开参考答案与解析</summary>

一次更新可按“触发 → render（含 reconciliation）→ commit”理解。render 计算下一棵 UI，可暂停、重试或放弃；commit 应用选定结果。DOM 更新后的 layout Effect 与浏览器 paint、passive Effect 需要分别讨论，不能把 useEffect 固定写成“paint 之后”。

### 原理与示例

1. 初次挂载或 state、Context、外部订阅变化安排更新；父组件 render 会产生新的子组件 props。
2. render 调用组件，根据输入计算 element；reconciliation 在这一阶段匹配 type、key 与位置，标记需要提交的变化。
3. commit 更新 DOM、处理 ref 和相应清理/setup；useLayoutEffect 在浏览器重新绘制前执行。
4. useEffect 通常允许浏览器先绘制，但交互触发的 Effect 可能在 paint 前执行；layout Effect 内触发更新也可能让剩余 Effect 提前执行。

setCount(c => c + 1) 请求更新，不等于改写当前闭包里的 count；组件函数再次执行也不等于 DOM 必定变化。

### 边界与易错点

- reconciliation 是 render 的一部分，不是 render 完成后的独立协调阶段。
- 并发渲染是协作调度：在工作单元之间让出执行权，不能中断正在执行的一段同步 JavaScript。
- 同一次 commit 的 DOM 变更不会像后台 render 一样暂停后弃用；不要在 render 写 DOM 或共享可变数据。
- Effect 只在客户端执行；未提交的 render 不运行对应 Effect setup。

### 追问

- **怎样保证测量与修正在用户看到之前完成？** 用短小的 layout Effect；只需外部同步时优先 useEffect。
- **DOM 没变能否有 Effect 执行？** 能。是否重同步取决于依赖，不取决于是否产生 DOM 属性变化。

资料来源：[React 官方文档](https://react.dev/learn/render-and-commit)、[React useEffect 时机](https://react.dev/reference/react/useEffect)。

</details>

---

## 31. reconciliation 是什么？Virtual DOM diff 的复杂度如何理解？

<!-- question: {"category":"react","type":"theory","difficulty":"basic","tags":["React"],"estimatedMinutes":3} -->

请解释 reconciliation 的目标、type 与 key 的匹配规则，以及常说的 O(n) diff 成立的范围。Virtual DOM 是否保证比直接操作 DOM 快？

<details>
<summary>展开参考答案与解析</summary>

reconciliation（协调）是把新的 element 树与既有内部树对齐的过程。传统通用树比较算法可能需要 O(n³) 量级的工作（这是旧版 React 文档中的背景解释，不是所有树编辑算法的下界），React 用两条启发式规则把常见路径降到**同层线性扫描**。

### 原理与示例

常用解释基于两条启发式规则：

1. **类型不同视为不同子树**：`type` 不同（`div` → `span`，或不同组件函数）就卸载重建，不尝试复用子节点。
2. **同层同类型按 `key` 匹配身份**：兄弟节点之间用 `key`（未提供时用索引）识别旧节点与新节点的对应关系。

因此 cost 变成了"每个节点各扫一遍自己的子列表"，最坏情况仍需处理移动与插入，但常见更新近似线性。

### 边界与易错点

- O(n) 是常见协调遍历的粗略模型，不包含组件排序、过滤、重复 render、布局或绘制成本，也不保证最少 DOM 移动。

- 跨层级移动会被当作"删除 + 新建"，state 与 DOM 都会重建；这也是"状态尽量放在就近位置、列表要有稳定 key"的原因。
- 不要简化成"Virtual DOM 一定比直接操作 DOM 快"。它的价值在声明式模型、可中断调度、批量更新与跨平台抽象；真实性能取决于组件结构、计算量和实际 DOM 工作量。
- 协调的对象是 element 与 Fiber 节点，不是 DOM；只有 commit 阶段才写 DOM（见第 30 题）。
- React 不做跨层级的节点复用（例如把子节点上提），这是与其他实现的重要差异。

### 追问

- **为什么接受"同层比较"这个取舍？** 它放弃理论最优的重用率，换取可预测的线性开销，而 UI 更新通常只影响局部。
- **`key` 在协调里扮演什么角色？** 提供同层身份，让 diff 能识别重排与插入，而不是按位置盲目复用（见第 32 题）。

资料来源：[React reconciliation（旧版原理说明）](https://legacy.reactjs.org/docs/reconciliation.html)。

</details>

---

## 32. `key` 的真正作用是什么？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

列表支持插入、删除和重排，行内有输入框。请说明稳定 key 如何影响 state 与 DOM 的复用，并分析 index、随机数和对象作为 key 的风险。

<details>
<summary>展开参考答案与解析</summary>

`key` 与 `type` 一起决定 React 眼中"这个位置上的元素是谁"。它只影响**同一父节点下兄弟之间**的身份匹配，不会作为 DOM 属性渲染出来。

### 原理与示例

- 稳定且唯一的 key 让 React 在插入、删除、排序时把旧 state、DOM 节点、effect 与正确的新元素对应起来。
- key 只需在**同一父节点的兄弟之间**唯一，不必全局唯一。
- 改变 key 等于告诉 React"这是另一个元素"：旧树被卸载、新树被挂载，因此可以有意用它重置表单或强制重挂组件。

### 边界与易错点

- `rows.map(row => <Row key={row.id} row={row} />)` 保持行与实体对应；key={index} 保持的是位置，重排可能把草稿交给另一实体。

- 用数组下标作 key：列表中间插入、删除、重排后，同一个下标可能对应另一条数据，导致非受控输入串行、局部 state 错位、动画错乱。
- 每轮 Math.random() 生成的 key 会重建子树；普通对象作为 key 常被转换成相同字符串而冲突，应使用稳定业务主键。
- key 不会出现在 `props` 里，子组件读不到；需要业务 id 时必须显式再传一个 prop。
- 只有"列表完全静态、不排序不过滤、行内没有需要保留的身份状态"时，用下标才相对可接受，属于例外而非常规。

### 追问

- **改 key 会触发什么？** 旧子树卸载（执行 cleanup），新子树挂载（state、ref、Effect 全部重建）。
- **Fragment 需要 key 吗？** 简写 `<>...</>` 无法接收 key；需要传 key 时用 `<Fragment key={...}>`，动态列表中的兄弟 element 应有 key；文本值不是需要身份匹配的组件。

资料来源：[React 官方文档](https://react.dev/learn/preserving-and-resetting-state)。

</details>

---

## 33. state 保存在哪里？为什么说它是 snapshot？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React","state"],"estimatedMinutes":5} -->

组件中连续调用 setCount(count + 1) 后立刻读取 count，会得到什么？请从组件身份、state snapshot 与闭包解释，而不只回答“异步”。

<details>
<summary>展开参考答案与解析</summary>

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

- setter 对新旧 state 使用 Object.is；相等时 React 通常跳过更新。修改对象后传回原引用既破坏旧快照，也可能使界面不更新。

- 不要解释成"setState 是异步的"：即使使用 `flushSync` 强制同步刷新，当前 render 中的 `count` 仍然是那次快照的值。
- 想在事件里读取"最新值"不能依赖局部变量，只需由前值计算新值时用函数式更新；异步命令式回调确需读取最近已提交值时，可用事件/Effect 同步的 ref，并说明时机（见第 46 题）。
- 依赖闭包捕获快照的 Effect 会读到旧值，若本应响应变化的依赖被漏掉，长期保存的回调就会出现 stale closure（见第 42 题）。
- "快照按 render 固定"正是并发渲染可以中断与重放的前提；不要直接修改快照中的嵌套对象（见第 25 题）。

### 追问

- **为什么不用普通局部变量存 state？** 组件函数每次 render 都会重新执行，局部变量无法跨 render 保留，也无法参与调度与一致性校验。
- **state 存在 DOM 上吗？** 不存在，它保存在 React 内部与元素关联的数据上，与 DOM 无关，所以 DOM 没变也可能有 state 变化。

资料来源：[React 官方文档](https://react.dev/learn/state-as-a-snapshot)。

</details>

---

## 34. batching 与 state update queue 如何工作？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React","state"],"estimatedMinutes":5} -->

假设 number 为 0，依次调用 setNumber(number + 5)、setNumber(n => n + 1)、setNumber(42)。结果是什么？请说明更新队列与自动批处理的边界。

<details>
<summary>展开参考答案与解析</summary>

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

渲染时按入队顺序依次应用，此例最后一项替换为 42，所以结果是 42；一般要回放整个队列，不能理解成“只保留最后一次 setter”，updater 读取前一步结果。

### 边界与易错点

- updater 在 render 期间参与计算，不要在其中请求或调用其他 setter；严格模式或调度重试可能重新调用它。

- React 18 起在 `createRoot` 下扩大了自动批处理范围（Promise、`setTimeout`、原生事件回调里也会批处理），但**不能**解释成"永远只 render 一次"：不同优先级的更新、`flushSync`、同步外部 store 都可能打破这个假设。
- React 通常批处理同一事件的更新，不跨不同有意用户事件（如两次点击）做同一次事件批处理；不保证每个事件恰好一次组件执行。
- 需要基于前值时必须用函数式更新，直接写 `setNumber(number + 1)` 会读到陈旧快照（见第 33 题）。
- updater 必须是**纯函数**：开发模式下 React 可能重复调用它来验证纯性，在其中做副作用会出错。
- 批处理只减少渲染次数，不改变"同一次事件里所有值来自同一快照"的事实。

### 追问

- **`flushSync` 什么时候用？** 需要立刻读到 DOM 更新结果时（如测量后滚动定位）；它牺牲批处理与并发收益，能用 Effect 或事件处理解决就不要用。
- **为什么 updater 会被调用两次？** Strict Mode 在开发环境刻意双调用渲染函数与 updater，用于暴露非纯副作用。

资料来源：[React 官方文档](https://react.dev/learn/queueing-a-series-of-state-updates)。

</details>

---

## 35. props、state、普通变量和 ref 的区别是什么？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","state"],"estimatedMinutes":8} -->

请比较 props、state、组件局部变量与 ref 的所有权、跨 render 保留能力和更新行为，并说明对象不可变更新与 ref 惰性初始化的限制。

<details>
<summary>展开参考答案与解析</summary>

四者的差别在三个问题：谁拥有、跨 render 是否保留、修改后是否触发渲染。

### 原理与示例

- **props**：父组件传入的当前 render 输入，只读；子组件不能直接改。
- **state**：由 React 按位置维护，setter 请求一次新的 render。
- **局部变量**：每次 render 重新计算，下次调用重新创建（被闭包引用时可继续存活）；修改它既不保留也不触发渲染。
- **ref**：跨 render 保留同一个 `{ current }` 容器；修改 `.current` 不触发渲染。

选择标准：影响渲染输出且会变化的数据用 state；只用于跨 render 保存、不影响输出的命令式信息（DOM 引用、timer id、最近一次回调）用 ref；能由 props/state 推导的直接在 render 里算；状态迁移复杂时升级为 reducer。

### 边界与易错点

- state setter 对整个新旧值使用 Object.is，不是深比较或通用浅比较；更新嵌套对象要复制变更路径，保留未变分支引用。

- 通常不要在 render 读写 ref.current；可预测、无外部副作用且只在初始化时发生的惰性初始化是官方允许的例外。连接、计时器等资源仍应在事件/Effect 中创建。
- 不要用 ref 绕过依赖数组：`useRef` 存最新值不会让订阅重新建立，读取时机必须自己想清楚（见第 99 题）。
- 把 props 复制进 state 会制造两个真相来源（见第 67 题）。
- `useState` 不做浅合并，更新对象时必须自己展开，这一点与 class 组件的 `setState` 不同。

### 追问

- **什么时候必须用 state 而不能用 ref？** 当数据要出现在渲染输出里时；ref 变化不会触发渲染，UI 不会更新。
- **props 是"不可变"还是"只读"？** 是约定上的只读：技术上能改对象内部，但那会破坏不可变前提，让 `memo` 与依赖比较失效。

资料来源：[React 官方文档](https://react.dev/reference/react/useRef)、[React useState](https://react.dev/reference/react/useState)。

</details>

---

## 36. 什么是派生状态？为什么经常不需要 Effect？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","Effect"],"estimatedMinutes":8} -->

fullName 可以由 firstName 与 lastName 计算。是否需要用 Effect 写入另一个 state？请区分派生数据、独立草稿与需要重置的组件状态。

<details>
<summary>展开参考答案与解析</summary>

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

- 派生计算保持纯净：例如 `[...items].sort(compare)`，不要用 items.sort() 修改 props/state。

- 需要独立 state 的常见情况包括：用户可独立编辑的值（输入草稿）、需要保留的历史快照、与 props 无关的 UI 状态。其余多属派生数据。
- 昂贵计算应先测量再用 `useMemo`，并注意 memo 只在依赖不变时有效；没有证据的 memo 只增加复杂度。
- “切换实体时重置整个子树”优先用 key 表达身份；部分状态调整需按语义设计，不能把所有 prop 变化都变成重挂载。
- 多个 Effect 互相 setState 会形成扇出，任一环节出错就出现闪烁或不一致。

### 追问

- **什么情况必须用 state？** 值无法由现有 props/state 推导时，例如用户输入、服务端数据、需要跨 render 保留的选择。
- **`useMemo` 的价值是什么？** 依赖不变时复用计算结果并保持引用稳定，从而让下游 `memo`/依赖比较生效。

资料来源：[React 官方文档](https://react.dev/learn/you-might-not-need-an-effect)。

</details>

---

## 37. 受控组件与非受控组件如何选择？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

请给出受控与非受控输入的最小示例，说明 text、checkbox、file 的取值方式，以及切换受控模式和使用 defaultValue 的限制。

<details>
<summary>展开参考答案与解析</summary>

受控输入的当前值由 React 状态驱动，事件负责同步更新；非受控输入的值由 DOM 维护，可在提交时读取。选择取决于是否需要逐次校验、联动与统一控制。

### 原理与示例

```jsx
const [name, setName] = useState('')
<input value={name} onChange={e => setName(e.target.value)} />

const [agreed, setAgreed] = useState(false)
<input type="checkbox" checked={agreed}
  onChange={e => setAgreed(e.target.checked)} />

function handleSubmit(e) {
  e.preventDefault()
  const data = new FormData(e.currentTarget)
  console.log(data.get('name'))
}
<form onSubmit={handleSubmit}>
  <input name="name" defaultValue="Alice" />
  <input name="avatar" type="file" />
  <button type="submit">提交</button>
</form>
```

上述分别是受控 text、checkbox 与非受控表单的片段。

### 边界与易错点

- 受控文本 value 始终为字符串，checkbox checked 始终为布尔值；undefined/null 切为有值会改变受控模式。
- value/checked 配合 readOnly 可有意只读；需要编辑时 onChange 应同步更新，否则输入回退。
- defaultValue/defaultChecked 指定初始值，不驱动当前编辑值；重置按场景使用 form.reset() 或 key 重挂载。
- 文件选择不能由字符串 state 控制，可用 FormData 或 input.files 读取，也可程序化清空；不能说只能用 ref 读取。
- 高频输入先缩小更新范围；延后昂贵结果时，输入框仍消费即时值。

### 追问

- **弹窗受控是什么？** 父级提供 open 与 onOpenChange，defaultOpen 则指定内部状态初值。
- **非受控能校验吗？** 能，使用浏览器约束校验、提交校验或事件读取，不必逐键复制进 state。

资料来源：[React 官方文档](https://react.dev/reference/react-dom/components/input)。

</details>

---

## 38. 为什么 Hooks 不能写在条件、循环或普通函数里？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","Hooks"],"estimatedMinutes":8} -->

请用条件调用 useState 的例子解释 Rules of Hooks，并说明提前 return、自定义 Hook 与 use API 的规则分别是什么。

<details>
<summary>展开参考答案与解析</summary>

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

- use 也必须在组件/自定义 Hook 渲染期间调用，不能放在普通回调或 try/catch 中；拒绝的 Promise 由错误边界处理。

- 典型报错是 "Rendered fewer/more hooks than expected"，根因几乎都是条件调用或提前 `return` 改变了调用顺序。
- 条件提前 return 若让某次 render 跳过后续普通 Hook，会破坏顺序；可拆为独立组件。没有后续 Hook 的提前返回并无此问题。
- 自定义 Hook 内部也受同一约束，且必须 `use` 开头，才能被 lint 识别并检查。
- `use` API 支持条件/循环调用（这是该 API 公开允许的例外），但这不改变其他 Hook 的顺序要求，不能当作豁免理由。
- 工程上依赖 `eslint-plugin-react-hooks` 的 `rules-of-hooks` 与 `exhaustive-deps`；不要靠人工记忆。

### 追问

- **状态真的"绑定在调用顺序"上吗？** 是的：mount 时按顺序创建记录，update 时按同一顺序读取，所以顺序必须稳定（见第 39 题）。
- **为什么自定义 Hook 要以 `use` 开头？** 让 lint 与协作者都能识别它内部包含 Hook，从而强制遵守调用规则。

资料来源：[React 官方文档](https://react.dev/reference/rules/rules-of-hooks)。

</details>

---

## 39. Hooks 在内部为什么常被描述为链表？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","Hooks"],"estimatedMinutes":8} -->

“Hooks 在 Fiber 上以链表保存”描述了什么？请区分特定版本的内部实现与公开调用规则，并解释状态为何依赖调用顺序。

<details>
<summary>展开参考答案与解析</summary>

因为 React 内部为每个函数组件维护一组**按调用顺序排列的 Hook 记录**：mount 时依次创建并串起来，update 时从头部开始按同一顺序取用。"链表"是对这种"顺序即身份"结构的直观描述。

### 原理与示例

- useState 的记录保存状态与更新队列信息，Effect 相关记录保存依赖/effect；并非每个 API 都对应一条状态记录，useContext、use 等应按各自规则理解。
- mount 与 update 走同一条遍历路径，因此第 N 次 Hook 调用总是对到第 N 条记录。
- 于是"不能在条件/循环里调用 Hooks"不是风格约定，而是实现方式的直接结果（见第 38 题）。

### 边界与易错点

- 字段名（`memoizedState`、`next` 之类）属于实现细节，不要当成 API 保证来背；重点是"顺序对应"的机制和后果。
- 不同版本（含编译器优化后的实现）内部结构会变化，但"调用顺序必须稳定"这一约束不变。
- 说"就是链表"时最好补一句边界：它是特定实现下的单向链式结构，版本间可能调整，稳定结论是顺序决定对应关系。

### 追问

- **顺序错位为什么编译期发现不了？** TypeScript 不能充分分析所有运行时调用路径；lint/Compiler 能发现许多违规，动态路径仍需运行时校验。不能说编译期完全发现不了。
- **React Compiler 会改变这一点吗？** 不会。编译器自动插入缓存、减少手写 memo，但不改变 Hooks 的调用顺序约束。

资料来源：[React 19.3 官方源码（实现细节）](https://github.com/facebook/react/blob/v19.3.0/packages/react-reconciler/src/ReactFiberHooks.js)。

</details>

---

## 40. `useEffect` 的本质用途是什么？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","Effect"],"estimatedMinutes":8} -->

聊天室组件需要随 roomId 变化建立连接。请说明 Effect 的职责、setup/cleanup 顺序、依赖，以及如何区分 Effect 与事件处理器。

<details>
<summary>展开参考答案与解析</summary>

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

- Effect setup 不应声明 async：React 需要其返回 cleanup 或 undefined；在内部声明并调用 async 函数，同步返回清理函数。

- 不要用它同步可推导的状态（见第 36 题），也不要处理"由用户操作直接引发"的副作用——那属于事件处理器。
- 获得订阅、连接、计时器等资源时需对应清理；不是每个 Effect 都必须有 cleanup，例如同步 document.title 通常不需要（见第 21 题）。
- Effect 内的闭包捕获本次 render 的快照，异步回调里可能读到旧值（见第 42 题）。
- Strict Mode 在开发环境会执行 setup → cleanup → setup，用于暴露清理不完整的问题，不是 bug（见第 45 题）。
- 依赖数组必须写全；用空数组模拟"只运行一次"时，必须确认没有遗漏响应式依赖；“运行时暂未变化”不证明省略依赖合法。

### 追问

- **Effect 与事件处理器如何分工？** 用户操作直接引起的副作用放事件处理器；需要与渲染结果保持同步的外部连接才放 Effect。
- **什么时候改用 `useLayoutEffect`？** 需要在浏览器绘制前同步测量或修改 DOM 时（见第 44 题）。

资料来源：[React 官方文档](https://react.dev/reference/react/useEffect)。

</details>

---

## 41. dependency array 应该怎样理解？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

请解释 useEffect 的三种依赖数组写法、响应式值与逐项 Object.is 比较。为什么不能随意省略依赖或把 ref.current 当成响应式依赖？

<details>
<summary>展开参考答案与解析</summary>

依赖数组不是"我希望什么时候执行"的开关，而是对 Effect 读取的所有**响应式值**的声明；React 用 `Object.is` 逐项比较上一次与这一次的依赖，决定是否重新同步。

### 原理与示例

- **不写数组**：每次 commit 之后都可能重新执行。
- **空数组 `[]`**：声明该 Effect 不读取任何会随 render 变化的响应式值。它不是"只执行一次"的语义保证——开发环境的 Strict Mode 仍会额外跑一轮 setup/cleanup（见第 45 题）。
- **`[a, b]`**：`a` 或 `b` 变化时重建同步。

响应式值包括 props、state，以及组件内部定义的函数与对象。

### 边界与易错点

- 对象/函数依赖频繁变化时，应先改结构：把只给 Effect 用的对象**搬进 Effect 内部**、把非响应逻辑移出组件、按职责拆分 Effect，而不是靠 memo 硬压。
- 为了让 Effect"少跑"而删依赖或关闭 `exhaustive-deps`，等于主动制造 stale closure。
- 依赖按位置用 **Object.is** 比较；对象/函数体现为引用比较，原始值也参与比较：`[{ id }]` 里每次都是新对象，等于每次都重新同步。
- `ref.current` 不是响应式值，放进依赖数组不会按预期触发。
- 空数组但读了 props/state 是最典型错误，即使目前约定 prop 不变，也应声明依赖或重构为非响应式值，不能靠约定绕过检查。

### 追问

- **怎样既少运行又不漏依赖？** 把不变的值提到组件或模块之外，把变化的部分作为参数传入，用函数式更新消除对当前 state 的读取。
- **依赖顺序重要吗？** 不同 render 之间保持固定长度与顺序。React 按位置比较，交换 a、b 位置也可能触发重同步；不能动态构造或排序依赖数组。

资料来源：[React 官方文档](https://react.dev/reference/react/useEffect)。

</details>

---

## 42. 什么是 stale closure？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

一个空依赖 Effect 中的定时器调用 setCount(count + 1)，计数只增长一次。请说明原因，比较函数式更新、补依赖、ref 与 Effect Event 的适用范围。

<details>
<summary>展开参考答案与解析</summary>

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
- DOM 接收的新事件处理器通常来自最近提交；处理器内部的 async/await、延时任务和长期保存回调仍保留启动那次 render 的快照。
- 典型表现：定时器计数不增长、订阅里拿到旧 props、请求用了旧参数。

### 追问

- **为什么 reducer 能缓解这个问题？** `dispatch` 引用稳定且不依赖当前 state，reducer 在最新状态上执行，天然避开快照。
- **Effect Event 解决什么？** 提取 Effect 中确实非响应式的逻辑并读取最新已提交值；只从 Effect 及其回调链调用，不能用于普通点击、跨组件传递或逃避真实依赖。确认版本支持 useEffectEvent。

资料来源：[React 官方文档](https://react.dev/reference/react/useEffectEvent)。

</details>

---

## 43. 如何处理 Effect 中的请求竞态？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React","Effect","请求"],"estimatedMinutes":5} -->

搜索词快速变化时，旧请求可能晚于新请求返回。请写出 Effect 的取消与忽略过期响应方案，同时处理 HTTP 错误、loading 和卸载。

<details>
<summary>展开参考答案与解析</summary>

取消可减少无用客户端工作，失效标记决定旧响应能否写入 UI。cleanup 令该次 Effect 失效，并对支持 AbortSignal 的请求调用 abort；成功、错误与 finally 都要检查是否仍有效。

### 原理与示例

```jsx
useEffect(() => {
  const controller = new AbortController()
  let active = true
  setLoading(true)
  setError(null)

  async function load() {
    try {
      const url = `/api/search?q=${encodeURIComponent(query)}`
      const response = await fetch(url, { signal: controller.signal })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      if (active) setData(data)
    } catch (error) {
      if (active && !controller.signal.aborted) setError(error)
    } finally {
      if (active) setLoading(false)
    }
  }

  load()
  return () => {
    active = false
    controller.abort()
  }
}, [query])
```

### 边界与易错点

- HTTP 4xx/5xx 通常仍使 fetch resolve，需要检查 response.ok；旧请求也能覆盖 error/loading。
- abort 不等于服务端撤销请求或事务；服务端可能已执行，mutation 仍需幂等与查询结果。
- 不支持 signal 的异步转换或已完成请求仍需失效检查。取消也可能有自定义 reason，signal.aborted 可判断是否主动取消。
- React 18 移除了部分卸载后 setState 告警；迟到的一次性 Promise 不自动等于泄漏，持续未清理的订阅才是典型来源。
- debounce 减少触发次数，不保证已发请求的顺序。共享缓存按查询 key 隔离结果。

### 追问

- **忽略结果为何还要 abort？** 失效检查保障正确，abort 尽可能减少下载/解析；不保证后端工作停止。
- **服务端会竞态吗？** 会，多个写请求或共享资源更新也可能乱序，需事务、版本条件或串行化。

资料来源：[React 官方文档](https://react.dev/reference/react/useEffect)、[MDN Fetch 取消与错误](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)。

</details>

---

## 44. `useEffect` 与 `useLayoutEffect` 有什么区别？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React","Effect"],"estimatedMinutes":5} -->

Tooltip 首次出现时需要根据 DOM 尺寸调整位置。请比较 useLayoutEffect 与 useEffect 的执行时机、绘制影响和服务端限制。

<details>
<summary>展开参考答案与解析</summary>

两者都在 commit 之后、客户端运行，差别在**时机**：`useLayoutEffect` 在浏览器绘制前同步执行（会阻塞绘制），`useEffect` 通常允许浏览器先绘制再执行。

### 原理与示例

- `useLayoutEffect` 适合"先测量、再修正、然后才让用户看到"的工作：读取布局后立即调整 tooltip 位置、按尺寸设置 transform、同步滚动位置，从而避免一帧闪烁。
- `useEffect` 适合绝大多数外部同步：订阅、请求、日志、不阻塞绘制的 DOM 操作。
- cleanup 的时机随之不同：依赖变化时，layout Effect 旧 cleanup 在 commit 中同步执行，然后运行新 setup；不能笼统说所有清理都发生在 commit 前。

### 边界与易错点

- useEffect 不是严格的 paint 后回调，交互触发或 layout Effect 更新可能令其提前。layout Effect 及其中安排的更新会阻塞重新绘制。

- 默认选 `useEffect`。为了"更早执行"而把逻辑整体换成 layout effect 会推迟页面展示，长任务会直接恶化首屏与交互体验。
- 两种 Effect 都不在服务端执行；无服务器 DOM 可测，可改 useEffect 或设计客户端区域与占位。不要根据 window 是否存在条件调用 Hook。
- layout effect 中的同步测量会强制布局计算，不要在其中做重计算或大量 DOM 操作。
- 需要"避免闪烁"时，纯视觉问题可以先用 CSS 或条件渲染解决，不必依赖 layout effect。

### 追问

- **测量元素尺寸该用哪个？** 要在用户看到前完成调整就用 `useLayoutEffect`；只是记录数据用 `useEffect` 配合 `ResizeObserver`。
- **为什么它会阻塞绘制？** 因为它在浏览器准备绘制之前同步执行，React 必须等它结束才能让出主线程。

资料来源：[React 官方文档](https://react.dev/reference/react/useLayoutEffect)。

</details>

---

## 45. Strict Mode 为什么会看到组件或 Effect 多执行一次？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React","Effect"],"estimatedMinutes":5} -->

开发环境开启 Strict Mode 后，组件、Effect 与 callback ref 出现额外调用。请说明它检查什么、哪些行为不会被重复，以及正确修复方式。

<details>
<summary>展开参考答案与解析</summary>

Strict Mode 只在**开发环境**刻意重复执行部分行为，用来提前暴露不纯的 render、缺失的 cleanup 与 ref 清理问题；生产构建不会因此多执行。

### 原理与示例

- 组件函数会被双调用：用于检测 render 中的副作用（写外部变量、改 ref、非幂等初始化）。
- Effect 会被压测成 setup → cleanup → setup：用于检查清理是否完整、订阅是否对称。
- 这些额外执行只发生在开发模式，且调用次数不保证固定，不要依赖"恰好两次"。

### 边界与易错点

- 事件处理器不会因此自动调用两次；state initializer/updater、reducer、callback ref 等会被额外检查。Strict Mode 只包非根子树时，初次 Effect 额外重跑还受开启位置影响。

- 正确处理不是关掉 Strict Mode，而是三件事：render 保持纯净、setup/cleanup 严格对称、外部写操作具备幂等或取消策略。
- 压测暴露出的重复订阅，通常在真实路由切换或 remount 时也会出问题，属于真 bug 而非"开发环境的怪现象"。
- 官方允许只在初始化发生、结果可预测且无外部副作用的 ref 惰性初始化；连接、计时器、监听器仍在 Effect/事件中创建。
- 它不是完整竞态检测器，但额外 cleanup/setup 可能暴露请求清理问题；仍需显式处理乱序响应（见第 43 题）。

### 追问

- **为什么生产环境也要保证幂等？** remount、并发渲染的重放、标签页恢复都可能让 setup 再次执行。
- **可以关掉吗？** 可以，但会丢掉一类问题的早期信号；推荐的用法是开发环境保留、生产构建中 Strict Mode 不产生额外行为。

资料来源：[React 官方文档](https://react.dev/reference/react/StrictMode)。

</details>

---

## 46. ref 有哪些用途和风险？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

请说明 ref 在 DOM 访问、资源句柄与最新值保存中的用途，为什么修改 current 不会更新 UI，以及 React 19 callback ref 的清理规则。

<details>
<summary>展开参考答案与解析</summary>

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

- React 19 callback ref 返回 cleanup 时，卸载调用该 cleanup 并跳过再传 null 的旧路径；未返回 cleanup 时需处理 null。避免箭头函数隐式返回赋值表达式的节点。

- 把影响 UI 的数据放进 ref 会造成界面与实际值不同步，这类数据必须用 state。
- 通常不要在 render 读写 ref；可预测的惰性初始化是例外，但初始化不得启动外部资源或影响已提交的共享实例。
- 回调 ref（`ref={el => ...}`）要做清理，避免长期引用已卸载的节点；React 19 起回调 ref 可以返回清理函数。
- ref 传递：React 19 起函数组件可以像普通 prop 一样接收 `ref`；面向 React 18 存量代码仍需理解 `forwardRef`。
- `ref.current` 不是响应式值，放进依赖数组不会按预期触发（见第 41 题）。

### 追问

- **能用 ref 替代 state 吗？** 只在"变化不需要体现在 UI 上"时可以，例如埋点用的累计计数、上一次的值。
- **多个 DOM 节点怎么收集？** 用 `Map` 保存，或在回调 ref 中写入集合；按业务 id 索引并在节点移除时删除记录；仅按位置保存容易在重排后失去业务对应。

资料来源：[React 官方文档](https://react.dev/reference/react/useRef)。

</details>

---

## 47. `memo`、`useMemo`、`useCallback` 分别做什么？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

请比较 memo、useMemo 与 useCallback，说明各自比较或缓存什么。何时有收益，何时会因新引用、Context、自定义比较器或缓存丢弃失效？

<details>
<summary>展开参考答案与解析</summary>

三者都是**性能优化**，不是正确性工具：`memo` 默认以 Object.is 逐个比较 prop，相等时通常跳过父级引起的重渲染，`useMemo` 缓存计算结果，`useCallback` 缓存函数引用（近似 `useMemo(() => fn, deps)`）。

### 原理与示例

```jsx
const Chart = memo(function Chart({ rows }) { /* ... */ })

const total = useMemo(() => rows.reduce((sum, row) => sum + row.value, 0), [rows])

const handleSelect = useCallback((id) => setSelected(id), [])
```

- `memo` 默认逐个 prop 做 Object.is 比较，**不阻止**组件因自身 state 或读取的 context 变化而重渲染。
- `useCallback` 的收益主要来自三个方面：作为 props 传给 `memo` 子组件、作为 Effect 依赖、作为其他 Hook 的输入。

### 边界与易错点

- 缓存可能因首次挂起、开发编辑等被丢弃，正确性不能依赖缓存永远存在。自定义 memo 比较器必须比较函数 prop，否则可保留旧闭包；深比较可能比渲染更慢。

- 常见无效场景：计算本来就便宜；父组件每次传新对象或新函数让 memo 失效；组件自身 state/context 频繁变化；比较成本接近甚至超过渲染成本。
- 依赖数组写错会让缓存永远失效或永不更新，比不用 memo 更糟。
- 加 memo 会引入额外比较、内存占用与可读性成本，不要无差别套用。
- 正确流程：用 Profiler 找到昂贵且重复的渲染 → 先调整状态位置、组件边界与订阅范围 → 仍有收益再 memoize → 同条件复测。
- React Compiler 能自动插入一部分缓存，但不替代正确的数据流设计与测量。

### 追问

- **什么时候值得 useCallback？** 昂贵 memo 子组件或确需稳定引用的 Hook 输入可能受益。它不是永久身份保证；Effect 专用函数能移进 Effect 时更简单。
- **`memo` 能挡住 Context 引起的重渲染吗？** 不能，组件自己读取的 Context 变化会绕过 `memo`（见第 48 题）。

资料来源：[React 官方文档](https://react.dev/reference/react/memo)、[React useMemo](https://react.dev/reference/react/useMemo)。

</details>

---

## 48. Context 为什么可能引起大范围更新？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React","Context"],"estimatedMinutes":5} -->

Provider 的 value 为 { user, theme }，某消费者只读取 theme。user 改变时它会更新吗？请说明 Object.is、memo 与细粒度订阅的关系。

<details>
<summary>展开参考答案与解析</summary>

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

- 稳定 value 只消除不必要 Context 广播，不消除普通父级 render。可在外层读取 Context，再把所需字段传给 memo 子组件，缩小昂贵部分的工作。

- `memo` 无法阻止组件因自己读取的 Context 变化而更新，这是最常见的误解。
- 拆分 Context 会带来 provider 嵌套与 API 复杂度，不要为一两个消费者就大改结构。
- 把函数放进 value 时必须保证引用稳定，否则第 3 步形同没做。
- Context 负责跨树传值，状态由 useState/useReducer 或外部源维护；Context + reducer 可组成状态管理方案，但 Context 自身不提供细粒度 selector；不要默认"所有全局状态都放 Context"。

### 追问

- **Context 与外部 store 怎么分界？** 低频、范围明确的配置/主题用 Context；高频更新、需要按字段订阅、需要跨组件读写用外部 store（见第 54 题）。
- **怎么确认确实是大范围更新？** 用 React Profiler 看这次 commit 执行了哪些组件，以及触发渲染的原因属于哪个 Context。

资料来源：[React 官方文档](https://react.dev/reference/react/useContext)。

</details>

---

## 49. `useReducer` 什么时候比 `useState` 合适？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

表单有 idle、submitting、done、error 状态。请说明何时使用 reducer，并给出纯函数、完整转换与非法事件处理的示例。

<details>
<summary>展开参考答案与解析</summary>

多个字段围绕同一事件一起变化、状态转换有规则或需独立测试时，useReducer 把事件与转换逻辑分离。简单独立状态仍适合 useState；reducer 不自动成为全局 store 或完整状态机。

### 参考实现

```ts
type State =
  | { status: 'idle' | 'submitting' | 'done'; error: null }
  | { status: 'error'; error: string }
type Action =
  | { type: 'submit' }
  | { type: 'success' }
  | { type: 'failure'; error: string }
  | { type: 'reset' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'submit':
      return state.status === 'submitting'
        ? state
        : { status: 'submitting', error: null }
    case 'success':
      return state.status === 'submitting'
        ? { status: 'done', error: null }
        : state
    case 'failure':
      return state.status === 'submitting'
        ? { status: 'error', error: action.error }
        : state
    case 'reset':
      return { status: 'idle', error: null }
    default: {
      const unreachable: never = action
      return unreachable
    }
  }
}
```

请求在事件/数据层发起，完成后 dispatch success/failure；错误等外部数据通过 action 输入。

### 边界与易错点

- reducer/initializer 必须纯净、不改旧 state；React 可能重复调用。dispatch 后当前闭包仍读旧快照。
- dispatch 身份稳定；新旧状态按 Object.is 比较，不是深比较。
- 示例忽略非 submitting 状态的完成事件；若允许取消后再提交，还需 requestId 防止旧响应完成新任务。
- 是否通过 Context 共享是另一架构决定；可以单测事件序列与不变量。

### 追问

- **与状态机差在哪？** reducer 可编码状态机，但需显式枚举状态、事件和转换规则，才会禁止非法转换。
- **外部数据怎样输入？** 用 action payload，保持 reducer 可独立测试。

资料来源：[React 官方文档](https://react.dev/reference/react/useReducer)。

</details>

---

## 50. 如何设计一个好的自定义 Hook？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React","Hook"],"estimatedMinutes":5} -->

请设计一个 useOnlineStatus，说明订阅清理、SSR 初始快照与调用独立性，并解释“复用逻辑”为什么不等于“共享状态”。

<details>
<summary>展开参考答案与解析</summary>

好的自定义 Hook 封装可命名的有状态能力，说明输入、输出与清理边界。每次调用的本地 Hook 状态独立；若读取同一外部 store，调用者可观察同一数据源，这是数据源决定的。

### 参考实现

```jsx
import { useSyncExternalStore } from 'react'

function subscribe(onChange) {
  window.addEventListener('online', onChange)
  window.addEventListener('offline', onChange)
  return () => {
    window.removeEventListener('online', onChange)
    window.removeEventListener('offline', onChange)
  }
}

const getSnapshot = () => navigator.onLine
const getServerSnapshot = () => true

function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
```

服务端与 hydration 首次使用 true 作为约定占位快照，浏览器状态随后由客户端快照更新。subscribe 在模块级保持稳定，返回对称清理函数。

### 边界与易错点

- navigator.onLine 是网络状态提示，不证明业务接口可达；提交失败仍需反馈。
- SSR 不能在模块顶层读取 navigator/window；此例只在客户端 getSnapshot/subscribe 执行访问。
- 名称用 use 开头；纯计算用普通函数。不要用生命周期包装隐藏依赖。
- 返回业务动作与状态，避免很多无关参数/setter；需要稳定引用时说明原因。

### 追问

- **两个调用是否共享 state？** 不共享本地 useState，但订阅同一个浏览器状态，所以值可能一致。
- **什么时候抽 Hook？** 能命名为独立能力、需要复用或隔离有状态副作用时。

资料来源：[React 官方文档](https://react.dev/reference/react/useSyncExternalStore)。

</details>

---

## 51. React 事件和原生 DOM 事件有什么关系？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

请解释现代 React DOM 的合成事件、根容器委托与 nativeEvent。混用原生捕获/冒泡监听时，stopPropagation 能阻止哪些监听？

<details>
<summary>展开参考答案与解析</summary>

React DOM 的合成事件提供统一接口和 nativeEvent；多数事件通过根容器委托并按 React 树派发。混用原生监听时要看捕获/冒泡阶段、位置和同节点注册顺序，不能把合成传播和原生传播完全割裂。

### 原理与示例

```jsx
<button onClick={e => {
  const button = e.currentTarget
  e.stopPropagation()
  queueMicrotask(() => console.log(button))
}}>操作</button>
```

React 17 起 React DOM 通常在根容器而非 document 委托。React DOM 不再池化这些事件对象，但 currentTarget 只在处理器执行期间表示当前节点，异步前需保存引用。

### 边界与易错点

- 并非所有事件的委托规则相同，例如 onScroll 不按一般冒泡模型传播；Portal 还涉及实际挂载容器。
- React DOM stopPropagation 也调用原生 stopPropagation，能阻止尚未发生的更高层原生冒泡；不能撤销已执行的 document 捕获监听，也不阻止同原生节点的其他监听。
- stopImmediatePropagation 影响同节点后续原生监听，也不能撤销已执行监听；优先设计清楚的边界。
- preventDefault 取消可取消的默认行为，不停止传播；return false 不自动执行这两者。

### 追问

- **document 原生监听能被阻止吗？** 已执行的捕获不能，尚未发生的冒泡通常能；按具体事件路径验证。
- **Portal 为什么特殊？** React onClick 沿 React 树，原生监听沿真实 DOM 路径。

资料来源：[React 19.3 官方源码（实现细节）](https://github.com/facebook/react/blob/v19.3.0/packages/react-dom-bindings/src/events/SyntheticEvent.js)。

</details>

---

## 52. Portal 中的事件为什么可能冒泡到视觉上不相邻的父组件？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

一个 Modal 通过 Portal 渲染到 document.body，点击弹窗仍触发外层 Card 的 onClick。为什么？请说明传播模型、焦点与可访问性要求。

<details>
<summary>展开参考答案与解析</summary>

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

- 多 Portal/Shadow DOM 的点击外部判断应维护实际容器集合并查看事件真实路径，不能只根据 React 父子关系判断 DOM contains。

- 只按 DOM 层级判断会出错，例如"点击外部关闭"需要判断事件目标是否属于 Portal 内的容器，而不是比较 DOM 祖先关系。
- Portal 是独立的 DOM 子树，因此层叠上下文、`overflow` 裁剪、`z-index` 都要重新考虑，样式隔离不能只靠父级。
- 可访问性与焦点必须手工维护：`role="dialog"`、`aria-modal`、focus trap、Esc 关闭、关闭后焦点归还触发元素。
- 还要处理滚动锁定与卸载清理；Portal 只是"渲染到别处"，不负责这些行为。
- 事件传播绕过 DOM 层级，但**原生**监听（如 `document` 上的点击）看到的是真实 DOM 路径，两套模型要分开推理。

### 追问

- **什么时候需要 Portal？** 模态框、Tooltip、下拉菜单、Toast 等需要脱离层叠上下文或被 `overflow: hidden` 裁剪的元素。
- **怎么避免父级被动响应？** 在 Portal 内容根节点上停止传播，或把交互处理完全下沉到 Portal 内的组件。

资料来源：[React 官方文档](https://react.dev/reference/react-dom/createPortal)。

</details>

---

## 53. Error Boundary 能捕获哪些错误？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

请实现一个 Error Boundary，并区分渲染、同步 Effect、普通事件、异步请求、Action 与服务端错误的处理方式。局部失败如何重试？

<details>
<summary>展开参考答案与解析</summary>

Error Boundary 捕获**其子树的渲染期错误**（render、构造函数、生命周期及同步 Effect 回调）以及 `lazy` 加载失败等由渲染触发的问题，然后渲染 fallback。

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

- 校验失败优先返回可渲染业务结果；数据层在 render 重抛请求错误（如 use(promise) 拒绝）才进入渲染边界。重试也需处理资源/请求缓存，单纯重置边界未必足够。

- **通常不捕获**：普通事件处理器、未受 React 管理的 setTimeout/Promise 回调、请求 rejection、SSR 和边界自身错误。React 19 useActionState 抛错、useTransition 返回的 startTransition 中 Action 抛错，可进入边界；不能泛化到所有异步代码或独立 startTransition。
  → 请求错误交给数据层的 error 状态，事件与异步错误用 `try/catch` 或全局兜底（见第 26 题）。
- 边界要放在**路由级与关键区域**（例如列表区域独立），粒度太粗会让一个局部错误清空整页。
- 可在 componentDidCatch 或统一框架入口上报错误、组件栈、版本与路由，避免敏感字段，否则用户只看到"页面出错了"。
- 边界不会自动重试：需要通过改变 `key` 或重置状态重建子树，并给用户提供入口。
- 开发环境的错误浮层会掩盖真实的 fallback 表现，验证降级效果要确认生产行为。

### 追问

- **为什么没有 Error Boundary Hook？** 它需要"捕获错误后回退并重新渲染整棵子树"的生命周期语义，目前由 class 承担。
- **和全局监听的关系？** `window.onerror`/`unhandledrejection` 只能兜底观测，无法恢复 UI；边界提供局部降级。

资料来源：[React 官方文档](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)。

</details>

---

## 54. 外部 store 为什么需要 `useSyncExternalStore`？什么是 tearing？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

两个组件在同一次并发提交中读取外部 store 的不同版本，会有什么问题？请说明 subscribe、getSnapshot 与 getServerSnapshot 的契约。

<details>
<summary>展开参考答案与解析</summary>

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

- 快照按 Object.is 比较。非阻塞更新提交 DOM 前会再次校验，变化时可改为阻塞重试；Effect 订阅 + render 裸读会留下漏通知窗口。

- `getSnapshot` 每次返回新对象（`{...state}`、`.map()`、`.filter()` 的结果）会导致无限重渲染；未变化时返回同一快照；可来自不可变 store，也可按版本缓存可变 store 的派生对象。selector 策略由库负责，不能说每个 selector 都需手写 memo。
- 它只提供一致的读取协议，不负责缓存、选择器优化与订阅粒度。
- 普通业务不需要手写 store：它是给状态库作者与浏览器 API 封装（`matchMedia`、`online` 事件）使用的底层能力。
- 它只解决读取一致性，**不解决**写入协调：多标签页、Worker 场景的同步策略仍需自己设计。

### 追问

- **tearing 在什么条件下出现？** 并发渲染开启 + 数据源在渲染过程中被外部修改 + 读取路径未走 React 的订阅协议。
- **状态库为什么需要它？** 因为 store 在 React 之外，必须通过这套协议安全接入并发渲染（见第 48 题）。

资料来源：[React 官方文档](https://react.dev/reference/react/useSyncExternalStore)。

</details>

---

## 55. `startTransition/useTransition` 解决什么问题？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

搜索框需要即时显示输入，同时更新昂贵的结果列表。请说明 startTransition 与 useTransition 的分工、isPending、Suspense 和 await 后更新的限制。

<details>
<summary>展开参考答案与解析</summary>

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

- useTransition 提供组件关联的 isPending；独立 startTransition 只标记更新。自行编排 async Action 仍需处理请求乱序，transition 不等于取消或防重。

- transition **不会让计算变快**，也不是防抖/节流：它只改变调度优先级，计算复杂度不变，重试甚至增加工作量。
- 不能用 transition 控制受控输入的值，否则光标与输入字符会滞后。
- transition 挂起时尽量保留已显示内容，避免已有边界退回 fallback；首次显示、新建或 key 重置边界仍可显示 fallback。
- 当前 React 19 官方文档要求 await 后需要标记 transition 的 setter 再包 startTransition。action 本身立即执行，await 前同步重计算不会自动进入后台。
- 用 transition 掩盖真正的性能问题（未虚拟化的长列表、循环内同步计算）只是推迟暴露。

### 追问

- **什么时候不该用？** 更新必须立即体现用户操作结果时，例如输入、开关、拖拽。
- **和 `useDeferredValue` 怎么选？** 能直接控制 `setState` 就用 transition；只能拿到值或不想改父组件时用 deferred value（见第 56 题）。

资料来源：[React 官方文档](https://react.dev/reference/react/useTransition)。

</details>

---

## 56. `useDeferredValue` 与 debounce 有什么区别？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","debounce"],"estimatedMinutes":8} -->

请比较 useDeferredValue 与 300ms debounce 在渲染、网络请求与延迟上的不同，并给出保持输入即时、结果延后更新的组件结构。

<details>
<summary>展开参考答案与解析</summary>

`useDeferredValue` 让某个值的**消费方**延后更新，属于渲染调度层面：没有固定延迟，可被紧急更新打断。debounce 属于时间层面：用于减少回调或请求的触发次数。

### 原理与示例

```jsx
const deferredQuery = useDeferredValue(query)
const results = useMemo(() => search(items, deferredQuery), [items, deferredQuery])
// 输入框用 query 保持即时响应，结果列表用 deferredQuery 延后渲染
```

- 未指定 initialValue 时首次 deferred value 等于当前值；React 19 支持显式 initialValue，后续更新中它"落后一拍"，在紧急更新结束后补上。
- 可以用 `query !== deferredQuery` 表示"结果正在追赶"，用来做透明度或加载提示。

### 边界与易错点

- 输入消费 query，独立 Results 消费 deferredQuery；Results 在值未变时跳过昂贵工作。每轮新建对象作为 deferred 输入会制造多余后台更新。

- 它**不会减少网络请求**：请求节流与缓存仍要自己做（debounce、缓存层或 server-state 库）。
- 没有时间参数，因此无法表达"300ms 后才请求"这类产品需求。
- 跳过昂贵结果渲染时，需让子树在 deferred 值未变时可复用（memo/Compiler）；协调 Suspense 旧内容也是用途，不能说无 memo 就无意义。
- 常见组合：输入 state 立即更新 + 结果渲染用 deferred + 请求按产品需求 debounce 或走缓存。

### 追问

- **两者能互换吗？** 不能：一个是渲染优先级的推迟，一个是时间上的合并，解决的问题不同。
- **什么时候 debounce 仍不可替代？** 需要真正降低请求频率、保护后端时。

资料来源：[React 官方文档](https://react.dev/reference/react/useDeferredValue)。

</details>

---

## 57. Suspense 是什么？它是否会自动请求数据？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","Suspense","请求"],"estimatedMinutes":8} -->

把 fetch 放在 useEffect 中，再给组件包上 Suspense，是否会自动显示 fallback？请说明触发来源、边界粒度与错误处理。

<details>
<summary>展开参考答案与解析</summary>

Suspense 是"子树尚未准备好"时展示 fallback 的 **UI 边界**与协调机制。它本身不是数据请求库——把普通 `fetch` 写进 Effect 不会因此触发 Suspense。

### 原理与示例

会触发 Suspense 的常见来源：

- `lazy(() => import(...))` 的代码加载。
- 支持 Suspense 的数据层/框架；普通路由 loader 不自动挂起，仍需支持的资源读取方式。
- `use(promise)` 读取 Promise。

```jsx
<Suspense fallback={<Skeleton />}>
  <Comments />
</Suspense>
```

### 边界与易错点

- 首次挂起且未挂载的树不保留那次 state，React 重新尝试。19.3 的样式资源、与 ViewTransition 集成的字体/图片有支持的等待行为；不会检测任意 Promise。

- 边界位置决定体验：局部边界只替换局部，外层边界在普通挂起更新时可能替换大区域；transition/deferred 可保留已有内容，新边界仍可占位。
- 客户端加载失败需错误处理，通常配 Error Boundary 局部降级。Suspense 处理等待，不为 rejection 自动提供错误文案。
- 避免"已展示内容被大 spinner 替换"：用嵌套边界、`useTransition` 或 deferred value 让旧内容保留到新内容就绪（见第 55 题）。
- 流式 SSR 场景下，边界的划分直接影响首屏可交互时间与内容的 reveal 顺序。
- 并发能力（中断、复用旧内容）依赖具体渲染模式，不要假设任何环境下都具备同样效果。

### 追问

- **Suspense 与手写 loading 状态的区别？** 它把"加载中"交给组件边界与调度统一处理，而不是让每个组件各自维护 `isLoading`。
- **为什么普通 fetch 不行？** Effect 提交后才请求，render 未通过受支持资源告诉 React“未就绪”。不要随意自制抛 Promise 协议，使用 use 与框架支持。

资料来源：[React 官方文档](https://react.dev/reference/react/Suspense)。

</details>

---

## 58. `lazy` 与动态 import 如何实现代码分割？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

请给出路由组件的 lazy + import + Suspense 示例，并说明模块导出要求、加载失败、预加载和重复定义 lazy 的风险。

<details>
<summary>展开参考答案与解析</summary>

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

- lazy 在模块顶层声明；render 内创建新 lazy type 会重置子树。React 缓存加载 Promise 和拒绝结果，重置 Error Boundary 未必重试同一失败 lazy 资源。

- 过度细分会产生大量小请求与 fallback 抖动，收益被抵消；应按路由与重型功能模块切分。
- 加载失败（离线、发布更新导致旧 chunk 404）必须配 Error Boundary 与重试/刷新策略，否则用户会白屏。
- 加载结果须有 default 属性且为组件；具名导出可 `.then(m => ({ default: m.Report }))`。
- 分割减少首屏体积，但增加额外往返延迟；关键路径可考虑预加载或服务端渲染。
- 要验证 chunk 命名与长期缓存策略，避免发版后旧 chunk 被移除导致失败。

### 追问

- **`lazy` 会自动预加载吗？** 不会，只在渲染时触发加载；需要提前加载就自己调用 `import()`。
- **怎么判断切分是否有效？** 分析构建产物与首屏网络请求，确认入口体积与关键 chunk 符合预算（见第 82 题）。

资料来源：[React 官方文档](https://react.dev/reference/react/lazy)。

</details>

---

## 59. SSR、hydration、streaming SSR 分别是什么？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","SSR"],"estimatedMinutes":8} -->

请区分 SSR、hydration 与 streaming SSR，说明 HTML 可见与 React 交互就绪的区别，以及 mismatch 的来源和流式传输的限制。

<details>
<summary>展开参考答案与解析</summary>

三者是不同层面的概念：SSR 是"服务端为这次请求生成 HTML"；hydration 是"客户端在已有 HTML 上接管并建立交互能力"；streaming SSR 是"服务端分块发送 HTML，让先就绪的部分先到达"。

### 原理与示例

- **SSR**：返回可立即展示的 HTML，改善首屏可见内容与部分 SEO/分享场景；但 React 事件处理需相关区域 hydration；链接、原生表单等行为可能已可用，不能说整页完全不可交互。
- **Hydration**：React 复用现有 DOM 而不是重建，要求服务端与客户端首次输出一致，否则出现 mismatch。
- **Streaming SSR**：服务端按块刷出 HTML，配合 Suspense 边界让已就绪部分先展示、先 hydration。

### 边界与易错点

- shell 的阻塞请求仍推迟首字节；输出也可能被代理/CDN 缓冲。SSR 不保证减少客户端 JS，RSC 模块边界才解决部分代码传输。

- 常见 mismatch 原因：render 中使用 `Date.now()`/`Math.random()`、直接读取 `window`/`localStorage`、时区与本地化差异、非法 HTML 嵌套、服务端与客户端初始数据不一致。
- 不要用 `suppressHydrationWarning` 掩盖真实不一致，它只适用于极少数确定无风险的场景。
- hydration 需要下载并执行 JS，直接影响 TBT/INP；SSR 不等于更快的可交互时间。
- 第三方库要确认能在服务端执行（不访问 `document`），否则需动态导入或挪到 Effect 中。
- 数据获取位置要设计清楚：服务端预取的数据需要以可序列化形式传给客户端，避免"服务端拿一份、客户端再取一份"。

### 追问

- **SSR 一定优于 CSR 吗？** 不一定：静态托管、内网后台、重交互应用可能用 CSR 或静态生成更简单，要按首屏与 SEO 需求权衡。
- **streaming 的关键收益？** 慢数据隔离在 Suspense 后，shell 可先发送；是否更早交互仍取决于 JS、选择性 hydration、网关缓冲与依赖。

资料来源：[React 官方文档](https://react.dev/reference/react-dom/client/hydrateRoot)、[React renderToPipeableStream](https://react.dev/reference/react-dom/server/renderToPipeableStream)。

</details>

---

## 60. Server Component 与 SSR 是同一个概念吗？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","SSR"],"estimatedMinutes":8} -->

请区分 Server Component 的执行与传输模型和 SSR 的 HTML 输出。Client Component 是否可能 SSR？静态站点是否一定不能使用 RSC？

<details>
<summary>展开参考答案与解析</summary>

不是同一个概念。SSR 关注"某次渲染输出 HTML"，是运行时选择；Server Component 是**组件模块边界与传输模型**：部分组件只在构建时或服务端环境执行，其渲染结果以特定表示传给客户端。

### 原理与示例

- Server Component 的代码不会进入客户端 bundle，可以直接访问数据库、文件系统与环境变量。
- Client Component 需要显式声明（如 `"use client"`），承载 state、Effect、事件与浏览器 API。
- 两者可以组合：Server Component 渲染 Client Component，并传入可序列化的 props。

因此 Server Component 既减少客户端 JS，又把数据获取放到靠近数据源的位置。

### 边界与易错点

- use client 标记模块及传递依赖的客户端导入图，不按视觉树简单传播；服务端可把已构造 JSX 作为 children 传给客户端包装。use server 标记 Server Function，不是组件开关。

- Server Component 不能使用 `useState`/`useEffect`/DOM API/事件处理；需要交互的部分必须下沉为 Client Component。
- 跨边界的 props 需要**可序列化**：按 RSC 协议而非仅 JSON 判断；Date/Map/Set/Promise/JSX 与 Symbol.for 注册的 Symbol 等受支持。普通函数、自定义 class 实例和未注册 Symbol 不支持；Server Function 传引用。
- 它强依赖框架与构建实现（路由约定、打包器、RSC 协议），不建议在无框架项目里自行拼装。
- 与 SSR 是"可以共存但不互为前提"：Client Component 也能被 SSR，Server Component 的输出也需要传输与渲染。

### 追问

- **RSC 一定需要 SSR 吗？** 不一定，RSC 数据与 HTML 是不同表示；框架通常组合，但也可在构建时产出 RSC 数据。
- **静态站点能用 RSC 吗？** 能在构建时执行；取决于内容/bundle 收益和工具复杂度。无配套框架的纯客户端项目通常无需自制 RSC 管线。

资料来源：[React 官方文档](https://react.dev/reference/rsc/server-components)、[React use client 序列化](https://react.dev/reference/rsc/use-client)。

</details>

---

## 61. React 19 的 Actions、`useActionState`、`useOptimistic` 解决什么问题？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

请说明 React 19 的 Action、useActionState、useOptimistic 与 useFormStatus 各自的职责，并给出有校验结果和 pending UI 的表单示例。

<details>
<summary>展开参考答案与解析</summary>

Action 把提交或非紧急异步流程交给 React 协调；useActionState 管理返回状态与 pending，useOptimistic 在 Action 期间显示临时视图，useFormStatus 让 form 后代读取提交状态。Action 可以在客户端执行，不必是 Server Action。

### 原理与示例

```jsx
function ProfileForm() {
  const [result, submitAction, pending] = useActionState(
    async (_previous, formData) => {
      const name = String(formData.get('name') ?? '').trim()
      if (!name) return { message: '请输入姓名' }
      const response = await saveProfile({ name })
      return { message: response.ok ? '保存成功' : response.message }
    },
    { message: '' },
  )

  return (
    <form action={submitAction}>
      <input name="name" />
      <button disabled={pending}>保存</button>
      <p role="status">{result.message}</p>
    </form>
  )
}
```

saveProfile 是示意数据层；业务错误以结果返回，未知异常由错误边界降级。action 首参是前一次返回状态，第二参才是 FormData/payload。

### 边界与易错点

- form function action 提供 Action 上下文；手工调用 useActionState 返回函数要放 startTransition 内，以正确跟踪 pending。
- useFormStatus 来自 react-dom，只读父级 form；在创建 form 的同一组件调用，不能读取自己返回的 form。
- useOptimistic setter 在 Action/Transition 内调用；结束后回到当前基准状态，成功必须更新基准/缓存，失败仍需提示与草稿。
- function form action 成功后会重置非受控字段；业务校验结果需渲染，需保留失败草稿时设计受控值或恢复流程。
- 幂等、鉴权、服务端校验、缓存失效与冲突处理仍由业务/数据层负责。

### 追问

- **所有 async 函数都是 Action 吗？** 不是，要通过 React Action/Transition 机制调用，命名不赋予能力。
- **库存或余额能否乐观？** 可以显示 pending，但权威结果需确认，不把未确认结果当作已完成。

资料来源：[React 官方文档](https://react.dev/reference/react/useActionState)、[React form](https://react.dev/reference/react-dom/components/form)、[React useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus)。

</details>

---

## 62. React Compiler 会让 `useMemo/useCallback` 消失吗？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

项目启用了 React Compiler。是否可以直接删除所有 memo、useMemo 和 useCallback？请说明构建期优化范围、语义限制和迁移验证方法。

<details>
<summary>展开参考答案与解析</summary>

Compiler 能在构建时分析组件并自动插入一部分 memoization，从而减少手写缓存。但它**不会**消除所有性能问题，也不改变"组件必须纯净、Hook 调用规则、状态边界、订阅粒度、算法复杂度"这些根本约束。

### 原理与示例

- 它依据组件的静态可分析性自动缓存计算值与 JSX，效果上等价于自动生成细粒度 memo。
- 代码必须符合规则（渲染纯净、不违反 Hook 规则）才会被优化；不合规的部分会被跳过，而不是被强行改写。

### 边界与易错点

- Compiler 是可选构建期工具，不是升级 React 19 就自动启用。存量缓存先保留或逐步移除并测试；缓存不承担永久引用身份或资源生命周期的正确性。

- 手写 `memo`/`useMemo` 仍然有效，有时仍然必要：需要精确控制缓存边界、代码未被编译、或特定优化需实测确认。
- 它不修复错误的数据流设计：状态位置不合理、Context 粒度过粗、列表未虚拟化，不会自动获得正确状态划分或更优复杂度；部分重复渲染可减少，但需测量（见第 48、68 题）。
- 启用需要评估编译兼容性、第三方库、构建链与回归测试成本，并保留前后性能对照数据。
- 面试回答应落在"先写正确且纯净的组件、用测量决定是否优化"，而不是声称可以全面删除 memo API。

### 追问

- **有了 Compiler 还需要 Profiler 吗？** 需要，优化效果与回归都靠测量证明。
- **它会改变 Hook 语义吗？** 不会，调用顺序约束与状态归属不变（见第 39 题）。

资料来源：[React 官方文档](https://react.dev/learn/react-compiler/introduction)。

</details>

---

## 63. React 19.3 有哪些需要了解但不用死背的变化？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

请结合 React 19.3 官方发布说明，解释 ViewTransition、Fragment ref、browser() 和 Trusted Types 支持分别解决什么问题，以及升级前应验证哪些条件。

<details>
<summary>展开参考答案与解析</summary>

React 19.3 于 2026-09-09 正式发布。应把变化与问题对应：ViewTransition 和 Fragment ref 在该版本稳定，browser 提供服务端挂起、客户端继续的入口，Trusted Types 支持保留可信类型值；都不是升级后自动改善所有页面的开关。

### 原理与示例

- ViewTransition：通过浏览器 View Transition API 协调进入、退出和共享过渡，配合受支持的 Transition 等更新；评估浏览器支持与 reduced-motion。
- Fragment ref：显式 Fragment 的 ref 得到 FragmentInstance，可聚合测量、焦点或事件/观察操作；不是新增真实 DOM 包装。
- browser：从 react-dom 导入。use(browser()) 在服务端挂起，由最近 Suspense 输出占位；客户端不因此挂起，可读取浏览器专属数据。
- Trusted Types：React 不再把可信类型对象强制转字符串传给 DOM。应用仍负责 CSP、策略与清洗，不等于自动清洗 dangerouslySetInnerHTML。

```jsx
import { Suspense, use } from 'react'
import { browser } from 'react-dom'

function BrowserTimeZone() {
  use(browser())
  return <p>{Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
}

<Suspense fallback={<p>读取时区…</p>}>
  <BrowserTimeZone />
</Suspense>
```

### 边界与易错点

- React 19 的 ref prop、Actions 不是 19.3 首次新增；先确认 react/react-dom、类型包和框架版本。
- browser 令该区域放弃服务端内容，可能牺牲首屏/SEO；能传一致初始数据时优先保留 SSR。
- Fragment 简写不能接 ref，FragmentInstance 也不是 HTMLElement。
- 升级前核对 peer ranges、构建插件、CSP、关键流程与回滚；RSC 底层框架 API 不保证跨 minor 完全稳定。

### 追问

- **如何证明值得升级？** 明确要解决的问题，小范围验证，对比行为/性能/兼容性，保留回滚版本。
- **不支持动画怎么办？** 核对降级行为、保持状态正确提交；业务更新不依赖动画完成回调。

资料来源：[React 19.3 官方发布说明](https://react.dev/blog/2026/09/09/react-19-3)、[React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)。

</details>

---

## 64. 为什么 render 中不能产生副作用？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

React render 可能被重复执行、暂停或放弃。请说明为何不能在 render 中发送写请求或修改共享数据，并区分局部可变值与可预测的 ref 初始化。

<details>
<summary>展开参考答案与解析</summary>

render 的产物只能是"根据 props/state/context 计算出的 element"。它可能被调用多次、被暂停、被丢弃，或以不同优先级重新执行，因此任何副作用都可能产生**不可撤销且次数不可预期**的外部影响。

### 原理与示例

render 被重复执行的典型场景：

- Strict Mode 在开发环境刻意双调用组件函数。
- 并发渲染中的中断与重放：低优先级渲染被打断后会重新开始。
- Suspense 相关流程中组件可能先渲染再被丢弃。

不要在客户端 render 直接发写请求、启动订阅/计时器、写 DOM 或修改共享输入。时间、随机值与调试日志不能承担“只发生一次”的业务语义。框架的 Server Component 异步读取与缓存资源读取遵循专门契约。

```jsx
// 错误：每次 render 都发请求，次数不可控
function Profile({ id }) {
  fetch(`/api/user/${id}`)
  return <div />
}
```

### 边界与易错点

- 可修改本次新创建、未泄露的局部数组，这是纯计算；不能修改 props/state/跨 render 共享数组。幂等外部写入仍是副作用，不能因幂等而放进 render。

- 触发来源决定位置：用户操作直接引发 → 事件处理器；渲染结果需要同步外部系统 → Effect；纯计算 → render 内直接算（见第 40 题）。
- render 中调用 `Math.random()`/`Date.now()` 会破坏可预测性与 hydration 一致性；需要这类值应在事件或 Effect 中生成。
- 通常不在 render 读写 ref；无外部副作用且可预测的惰性初始化是例外（见第 46 题）。
- 缓存与去重不能依赖"render 只跑一次"的假设，应放到数据层或 Effect 处理。
- 开发与生产的行为差异不能作为"安全"的依据：生产环境同样可能重复执行 render。

### 追问

- **怎么判断一段逻辑该放哪？** 先问触发来源：用户操作放事件处理器，外部同步放 Effect，纯计算留在 render。
- **为什么强调"纯"而不只是"幂等"？** 纯函数同时保证可缓存、可重放、可比较，是并发渲染能够中断并重做的前提。

资料来源：[React 官方文档](https://react.dev/reference/rules/components-and-hooks-must-be-pure)。

</details>

---

## 65. 父组件 render，子组件一定 render 吗？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

父组件 setState 后，子组件函数一定再次执行吗？请分别讨论普通 JSX、memo、稳定 children、自身 state/Context 更新与 DOM 变化。

<details>
<summary>展开参考答案与解析</summary>

不一定。讨论这个问题前必须把"render"拆成三层：**组件函数是否执行**、**React 是否做了协调工作**、**DOM 是否变化**。父组件重新执行并返回新的子 element 时，React 通常会让子组件进入协调，但存在可以跳过的情形。

### 原理与示例

可能跳过或减少工作的情况：

- 子组件被 `memo` 包裹，且 props 浅比较相等。
- 父组件把**已存在的 element** 作为 `children` 传入：element 对象引用未变可复用已有工作；子树自己的 state/Context 更新仍可继续处理。
- 自身没有更新是复用缓存子树的前提之一；仅此条件不能让普通未缓存 JSX 的子组件自动跳过父级带来的执行。
- 编译器自动缓存了组件或计算结果。

```jsx
// 普通 JSX 每次创建新 element，无其他复用机制时 Child 通常重新执行
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

资料来源：[React 官方文档](https://react.dev/reference/react/memo)。

</details>

---

## 66. 为什么把组件定义在另一个组件内部可能丢失 state？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","state"],"estimatedMinutes":8} -->

为什么在 Parent 内定义 Child 后，每次 Parent 更新都可能让 Child 的输入与 state 重置？如何保持组件身份，同时把父级数据传进去？

<details>
<summary>展开参考答案与解析</summary>

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

- 修复为模块级 `function Child({ value }) { ... }`，Parent 返回 `<Child value={value} />`。render 中临时 memo(Child) 也不能保持 type 身份。

- 症状不只是"state 丢失"：输入焦点、滚动位置、子组件内部请求、动画状态都会重置。
- 如果子组件确实需要父作用域的数据，应通过 props 传入，而不是把组件定义在内部。
- 需要"切换实体时重置状态"时，应该用 `key` 显式表达身份，而不是依赖 type 变化这种隐式行为（见第 32 题）。
- 这类问题通常不会报错，常见表现是"输入框莫名清空""列表滚动位置跳动"。

### 追问

- **普通 render 辅助函数也不行吗？** 无 Hook、只返回 JSX 的普通函数不形成新组件 type；作为 `<Child />` 使用的组件定义应放模块级。不要直接 Child() 绕过组件边界。
- **和改 `key` 有区别吗？** 二者都是卸载重建；区别是 type 变化通常是意外，`key` 变化是有意为之。

资料来源：[React 官方文档](https://react.dev/learn/preserving-and-resetting-state)。

</details>

---

## 67. React 中为什么不建议把 props 复制到 state？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","state"],"estimatedMinutes":8} -->

Editor 用 useState(value) 保存 prop，并用 Effect 随 value 重置。会出现什么问题？请区分受控数据、initialValue 草稿与实体切换重置。

<details>
<summary>展开参考答案与解析</summary>

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

- useState(initialValue) 只用于初始化，后续 prop 不自动替换 state。独立草稿可合法初始化于 prop，但应明确服务器更新时保留、提示冲突或覆盖，而非机械同步。

- 用 Effect 同步 props → state 会把组件变成"受控与不受控混合体"：用户输入可能被 props 覆盖，且多一次渲染。
- 只在 props 变化时更新的 state，往往说明它应该整体上移或下移（见第 71 题）。
- 组件要同时支持受控与非受控时，API 必须显式区分（`value` 与 `defaultValue`），不要让开发者猜（见第 105 题）。
- 派生数据计算昂贵时用 `useMemo`，而不是把它存成 state（见第 47 题）。

### 追问

- **表单初始值怎么处理？** 用 `defaultValue`/`initialValues` 并在文档中写明"仅初始生效"，或直接用 `key` 重建表单。
- **什么时候真的要复制？** 需要保留历史快照（对比、撤销）时——那时它是独立数据，而非"props 的副本"。

资料来源：[React 官方文档](https://react.dev/learn/you-might-not-need-an-effect)。

</details>

---

## 68. React 列表性能差，应按什么顺序排查？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","性能"],"estimatedMinutes":8} -->

包含大量行的列表在搜索、滚动或选中时变慢。请按证据给出排查顺序，区分 JS、React render、DOM/layout、网络瓶颈与优化取舍。

<details>
<summary>展开参考答案与解析</summary>

先测量再优化。顺序是：在可复现条件下采集数据 → 判断瓶颈在哪一层 → 检查 `key` 与状态位置 → 再考虑虚拟化或 memo。

### 原理与示例

1. 开发版 DevTools 定位原因；耗时用生产浏览器 Performance 或专用 profiling 构建测量，保持同设备/数据/交互。普通生产构建默认不启用 Profiler。
2. 判断瓶颈层级：JS 计算、组件 render 次数、DOM 节点数量、layout/paint，还是请求瀑布。
3. 检查 `key` 是否稳定、state 是否放得太高、Context/selector 订阅范围是否过大。
4. 数据量巨大先分页或虚拟化；确认是纯计算昂贵再上 memo。
5. 把高频更新的输入与整表拆开，避免整张表跟随一个受控输入重渲染。
6. 同条件复测，并记录 trade-off（复杂度、可访问性、内存）。

### 边界与易错点

- CPU 算法可优化复杂度、分块或移到 Worker；transition 不抢占单次长函数，memo 不优化首次计算。布局/绘制瓶颈先减少 DOM 与布局抖动。

- 虚拟化减少 DOM，但会引入动态高度、可访问性、浏览器内查找（Ctrl+F）、打印与滚动定位的复杂度，不是所有列表都需要。
- 发现 key/状态位置问题先修；收益取决于瓶颈，未测量不能断言一定超过 memo。
- 不要只盯"渲染次数"：渲染本身便宜时，次数多未必是问题。
- 行内创建对象/函数会让 `memo` 失效，但只有子组件确实昂贵时才值得处理（见第 47 题）。

### 追问

- **怎么证明确实变快？** 用相同数据与设备对比 commit 时长、长任务数量与 INP，而不是凭感觉（见第 114 题）。
- **虚拟化和分页怎么选？** 需要滚动浏览完整数据用虚拟化；只需要分段查看用分页更简单。

资料来源：[React 官方文档](https://react.dev/reference/react/Profiler)。

</details>

---

## 69. React 测试应该测试什么？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","测试"],"estimatedMinutes":8} -->

请为带校验与异步提交的 React 表单设计测试层次，说明语义查询、等待方式、失败分支，以及哪些实现细节不应成为主要断言。

<details>
<summary>展开参考答案与解析</summary>

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

- 异步表单覆盖校验阻止请求、pending、成功、失败保留输入/重试与防重。userEvent 通常先 setup() 创建实例，等待可见结果，不以 Hook 调用次数证明业务幂等。

- 用语义查询（`getByRole`、`getByLabelText`）而不是 `container.querySelector`：前者能发现部分语义/可访问性问题，但不替代完整评估。
- 异步用 `findBy*`/`waitFor`，不要用固定 `setTimeout` 等待，否则会产生 flaky 测试。
- 断言实现细节（state 值、内部方法调用次数、CSS 类）会让重构变成"改测试"，而不是暴露真实回归。
- 网络与时间要可控：mock 放在 HTTP 或数据层边界，不要 mock 组件内部实现。
- 覆盖率不是目标；失败时能否指出业务风险更重要。

### 追问

- **快照测试该用吗？** 大量快照会变成"一改就批量更新"的噪声，只对少量稳定结构使用。
- **E2E 应该覆盖多少？** 少量关键路径即可，过多会带来运行时长与稳定性问题（见第 85 题）。

资料来源：[Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles/)。

</details>

---

## 70. React 项目中 server state 与 client state 如何划分？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","state"],"estimatedMinutes":8} -->

列表数据、查询条件、编辑草稿和弹窗分别由谁维护？请区分 server state、client state、URL state，并说明 mutation 后的一致性方案。

<details>
<summary>展开参考答案与解析</summary>

按"**数据由谁拥有、生命周期由谁决定**"来划分：server state 由服务端拥有，异步、共享、可能过期；client state 属于当前 UI；URL state 承载需要可分享与可恢复的状态。

### 原理与示例

- **server state**：列表、详情、统计结果。核心特征是"可能过期"，因此需要缓存、失效、去重与重试策略。
- **client state**：弹窗开关、当前步骤、临时草稿、选中项，生命周期与页面一致。
- **URL state**：筛选条件、分页、当前 tab，需要可分享、刷新保留、前进后退可用。
- **表单状态**：通常属于 client state。服务器记录是基准，未提交草稿由表单拥有；它们不是同一个需双向同步的值。

划分原则：为每类数据指定**唯一权威来源**，其他位置只做派生或缓存。

### 边界与易错点

- server/client state 区分权威来源，不是运行机器；纯本地应用不应为套分类把本地学习记录称为 server state。

- 不要把请求结果同时写进 query cache 和全局 store：两个真相来源会带来不一致与双份维护。
- mutation 之后有三种策略：精确写入缓存、invalidate 触发重取、直接采用服务端返回结果。选择取决于一致性要求与请求成本，不能一律全量 invalidate。
- 需要分享、刷新恢复或导航历史的筛选/分页放 URL；局部临时查询可放组件 state，按产品语义决定。
- 把 server state 全量搬进全局 store 未额外实现缓存契约时缺少过期与去重能力，等于自己重写一套缓存语义。
- 乐观更新必须与缓存失效策略配合，否则会出现"界面更新了但列表仍是旧数据"。

### 追问

- **要不要引入 server-state 库？** 多出共享请求结果、需要统一的失效与重试策略时值得；只有零星请求时自定义 Hook 也够。
- **URL 里该放多少？** 只放可分享、可恢复的必要条件；临时展开态通常留本地；代表可分享详情/编辑导航的弹窗也可由路由表达。

资料来源：[TanStack Query Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)。

</details>

---

## 71. React 中"状态下沉"为什么常比 memo 更有效？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

页面顶层存放输入框状态，旁边有不依赖输入的昂贵图表。如何通过状态下沉或 children 组合缩小更新范围？什么时候仍需要提升状态或 memo？

<details>
<summary>展开参考答案与解析</summary>

因为**状态所在的层级直接决定更新范围**。把高频状态放到真正使用它的组件里，没有其他更新来源时，不相关兄弟子树可避免由局部 state 更新引起的重复组件执行；而 `memo` 只是"更新已经发生之后"的跳过机制。

### 原理与示例

```jsx
// 状态在顶层：未应用其他复用机制时输入会让不相关图表也进入更新路径
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

- 保留业务能力：结果若依赖输入，可让 SearchInput 和 Results 的共同 SearchPanel 持有状态，Chart 仍独立；不能用下沉丢掉筛选联动。

- 状态下沉的收益来自**结构本身**，不依赖调用方维护 props 引用稳定性，因此更易读、更少隐式约定。
- 不要过度下沉：如果多个分支都需要这份状态，就会被提升回来，形成来回搬运。
- `memo` 仍然有用：状态确实必须在高层、且子组件昂贵时才需要它配合稳定 props 生效（见第 47 题）。
- 如果把状态下沉后又放进 Context 供深层消费，仍可能广播到读取该 Context 的消费者，需控制职责与频率（见第 48 题）。

### 追问

- **为什么"稳定 children"能生效？** element 引用未变时可以跳过该子树的重新协调（见第 65 题）。
- **什么时候该改结构而不是加 memo？** 只要看到不相关组件跟着更新，先动结构；结构无法再调时才 memo。

资料来源：[React 官方文档](https://react.dev/learn/choosing-the-state-structure)。

</details>

---

## 72. React 中如何避免重复提交？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

异步表单可能被双击、重试或多标签页提交。请分别设计前端即时防重、pending UI 与服务端幂等机制；网络超时后应复用还是重新生成幂等键？

<details>
<summary>展开参考答案与解析</summary>

前端即时锁与 pending 禁用减少误触；服务端幂等键、唯一约束与事务才避免重复业务副作用。同一操作结果未知时，重试复用同一键与载荷，不能每次 retry 生成新键。

### 原理与示例

```jsx
const inFlightRef = useRef(false)
const operationRef = useRef(null)
const [pending, setPending] = useState(false)

async function handleSubmit(payload) {
  if (inFlightRef.current) return
  // 超时重试期间禁止更改这一操作的载荷
  if (operationRef.current === null) {
    operationRef.current = {
      key: crypto.randomUUID(),
      payload: structuredClone(payload),
    }
  }
  const operation = operationRef.current
  inFlightRef.current = true
  setPending(true)
  try {
    const result = await submit(operation.payload, {
      idempotencyKey: operation.key,
    })
    setResult(result)
    // 本例约定 resolve 表示服务器已确认业务成功
    operationRef.current = null
  } catch (error) {
    setError(error)
    // 结果未知：保留 operation，重试同键同载荷
  } finally {
    inFlightRef.current = false
    setPending(false)
  }
}
```

服务端将键与用户/操作及请求摘要关联，原子执行“领取键 → 执行业务 → 保存结果”；重复返回既有结果，同键不同载荷拒绝。

### 边界与易错点

- React 已保证有意用户事件的基本处理边界；ref 锁主要防同轮程序化重入/多个入口，不应说普通双击必定有 state 竞态。
- resolve 不等于 HTTP/业务成功，数据层需检查 response.ok 与业务结果；示例接口成功契约须明确。
- 超时不能证明未执行，取消 HTTP 不回滚事务；先查结果，未知时同键重试。
- 真正新操作或确认终结后改变载荷，建立新操作/新键。刷新和多标签页恢复需保存操作标识或服务器查询入口。
- “先查键再写入”有竞态，需唯一约束/事务/状态规则；约定 TTL、并发处理中响应与错误缓存。

### 追问

- **ref 锁能提供安全保证吗？** 不能，可绕过；服务端每次鉴权、校验与幂等处理。
- **POST 都能自动重试吗？** 不能，需明确幂等契约与策略；确定的业务拒绝通常让用户修正。

资料来源：[Stripe Idempotent Requests](https://docs.stripe.com/api/idempotent_requests)。

</details>

---

# 第三部分：浏览器、TypeScript 与工程补充题

## 73. 从输入 URL 到页面显示发生了什么？

<!-- question: {"category":"browser","type":"theory","difficulty":"basic","tags":["浏览器"],"estimatedMinutes":3} -->

以首次访问一个 HTTPS 页面为例，说明导航、网络、资源加载与渲染的主要过程，并解释缓存、脚本和 HTTP/3 会怎样改变这条路径。

<details>
<summary>展开参考答案与解析</summary>

浏览器先处理导航，再按需获取 HTML 和子资源，边解析边构建 DOM 与样式信息，经过样式计算、layout、paint、raster 和 composite 显示内容。网络、解析和渲染可以交错进行；缓存命中、连接复用、Service Worker 或 bfcache 会改变甚至省略部分步骤。

### 原理与示例

1. **导航**：解析 URL，处理权限、HSTS 升级和重定向；同文档 fragment 导航通常不重新加载 HTML。
2. **获取文档**：可能由 Service Worker、HTTP 缓存或网络提供。需要新连接时，解析域名；HTTPS 的 HTTP/1.1、HTTP/2 通常建立 TCP 与 TLS，HTTP/3 使用 QUIC over UDP 并集成 TLS 1.3。可复用连接时无需重新握手。
3. **流式解析**：HTML 字节解码后生成 token 和 DOM；同时发现 CSS、图片、脚本，预加载扫描器也可提前发现资源。
4. **脚本与样式**：匹配的阻塞样式表会影响首次渲染。解析器插入的普通经典脚本通常阻塞 HTML 解析；外部 `defer` 脚本解析后按序执行，`async` 下载完成即尽快执行、顺序不保证；模块脚本默认具有类似 defer 的行为。
5. **显示与交互**：计算样式和盒几何，生成绘制记录、栅格化并合成画面。CSR 需脚本生成内容，SSR 可先显示 HTML，再 hydration；后续 DOM/样式更新按需要重新走这些阶段。

### 边界与易错点

- CSS 通常不阻塞 HTML tokenization，但阻塞样式表可能使后续需要执行的脚本等待，从而间接停住解析。
- 页面不必等所有资源加载完才绘制；`DOMContentLoaded`、`load`、LCP 和交互响应衡量的时机也不同。
- INP 衡量发生交互时到下一次呈现的延迟，不能理解成页面“从此完全可用”的时间点。

### 追问

- **为何首屏可见仍会点击卡顿？** 可见内容已经绘制，但 hydration、第三方脚本或长任务仍占用主线程；应分别观察加载关键路径和交互延迟。
- **先优化哪一段？** 先找实际 LCP 元素与耗时归因：服务端响应、资源发现、传输还是渲染延迟，再选择缓存、预加载或减少脚本等手段。

参考：[HTML parsing](https://html.spec.whatwg.org/multipage/parsing.html)、[HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html)。

</details>

---

## 74. 强缓存与协商缓存如何工作？

<!-- question: {"category":"browser","type":"theory","difficulty":"basic","tags":["浏览器","缓存"],"estimatedMinutes":3} -->

解释浏览器何时直接复用缓存、何时发送条件请求，以及 `no-cache`、`no-store`、`max-age=0`、`must-revalidate` 的区别。

<details>
<summary>展开参考答案与解析</summary>

HTTP 缓存先判断响应能否存储、缓存键是否匹配和副本是否新鲜。允许直接复用的新鲜响应无需网络请求；需要验证且有 validator 时发送条件请求，未改变则收到 304，合并缓存元数据并复用原响应体，改变则通常返回新的 200 响应。

### 原理与示例

- `max-age` 指定新鲜期；年龄计算会考虑 `Date`、`Age` 等，不能简单等同于从本地收到响应开始计时。`s-maxage` 面向 CDN 等共享缓存，覆盖共享缓存的 `max-age`。
- 有 `ETag` 时用 `If-None-Match`；有 `Last-Modified` 时可用 `If-Modified-Since`。同时存在时 `If-None-Match` 优先；ETag 是服务端定义的不透明 validator，不保证一定由内容 hash 生成。
- `Expires` 是绝对过期时间，存在 `max-age` 时以 `max-age` 为准；`immutable` 表示新鲜期内资源预期不会变化，适合内容 hash 文件。
- 一个例子：响应 `Cache-Control: max-age=60`、`ETag: "v1"`；60 秒内可直接复用，过期后带 `If-None-Match: "v1"` 验证，304 省下响应体但仍有网络往返。

### 边界与易错点

- `no-cache` 允许存储，但复用前必须成功验证；`no-store` 要求 HTTP 缓存不存储该次请求/响应，不能据此推断会清除此前所有副本或应用自行写入的 Cache Storage。
- `max-age=0` 令响应立即过期；`must-revalidate` 约束过期后的复用；`no-cache` 则要求每次复用前验证。这些指令不是同义词。
- `private` 禁止共享缓存存储，但允许浏览器私有缓存；`Vary` 指定参与匹配的请求头，语言、编码或来源差异要正确区分。
- HTTP cache 与 bfcache 不同。`no-store` 对 bfcache 的影响依浏览器和条件变化，不能说它在所有现代浏览器中必定禁用返回快照。

### 追问

- **验证失败还能用旧副本吗？** 取决于是否允许 stale、是否设置 `must-revalidate`/`no-cache` 以及相关扩展策略；不能把任何网络失败都当成允许读旧缓存。
- **发版怎样避免旧代码？** HTML 设置合适的验证策略，资源使用内容 hash 并保留旧版本一段时间；不要仅靠清理用户缓存。

参考：[RFC 9111 HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111.html)、[Chrome 的 no-store 与 bfcache 行为](https://developer.chrome.com/docs/web-platform/bfcache-ccns)。

</details>

---

## 75. CORS 是什么？为什么 Postman 正常而浏览器失败？

<!-- question: {"category":"browser","type":"theory","difficulty":"intermediate","tags":["浏览器","CORS"],"estimatedMinutes":5} -->

跨源接口在 Postman 中成功，浏览器中的 `fetch` 却报 CORS 错误。请解释同源、预检、凭据和响应读取限制，并说明应如何排查。

<details>
<summary>展开参考答案与解析</summary>

CORS 是 Fetch 在同源策略下允许服务端授权跨源读取响应的协议。Postman 不受页面同源策略约束。CORS 失败既可能是已发送请求的响应不可供 JS 读取，也可能是预检未通过、真实请求尚未发送；因此不能把它概括成“请求一定没发出”或“只限制读取、永不拦请求”。

### 原理与示例

- 同源比较 scheme、host、port；不同子域、端口，或 `localhost` 与 `127.0.0.1` 都可能跨源。“同站”是另一概念，主要用于 Cookie 等策略。
- 满足 CORS safelist 的请求通常直接发送：方法为 `GET`、`HEAD`、`POST`，请求头及其值也须符合限制。`Content-Type` 的 safelisted MIME type 为 `application/x-www-form-urlencoded`、`multipart/form-data` 或 `text/plain`；`application/json` 和 `Authorization` 一般会触发预检。
- 预检 `OPTIONS` 携带 `Origin`、`Access-Control-Request-Method` 及必要的请求头列表。服务端通过 `Access-Control-Allow-Origin/Methods/Headers` 授权，浏览器检查通过后才发送真实请求；真实响应仍须满足 CORS。
- 携带跨源 Cookie 需 `credentials: 'include'`；响应的 `Access-Control-Allow-Origin` 须为具体来源，且 `Access-Control-Allow-Credentials: true`。还要满足 Cookie 的 SameSite、Secure 与浏览器隐私策略。
- 非 safelisted 响应头需通过 `Access-Control-Expose-Headers` 暴露；按 Origin 动态返回授权头时通常还需 `Vary: Origin`，并先匹配可信来源白名单。

### 边界与易错点

- CORS 不是服务端鉴权或 CSRF 防护：无需预检的跨站请求仍可能产生副作用；非浏览器客户端也可直接调用。
- `mode: 'no-cors'` 会限制请求形态并返回 opaque 响应，不能让 JS 正常读取 JSON；客户端自行添加 `Access-Control-Allow-Origin` 请求头也无效。
- 先检查 OPTIONS 是否出现及通过，再检查真实响应、重定向和错误响应是否带授权头；网络、证书或网关错误也可能表现为前端无法读取响应。

### 追问

- **预检可缓存吗？** 可通过 `Access-Control-Max-Age` 设置专用预检缓存的有效期，但浏览器有自己的上限；它不是普通 HTTP cache。
- **如何减少预检开销？** 优先统一 API 来源或合理缓存预检，不能为了省 OPTIONS 改坏业务语义、删除认证头或放宽来源授权。

参考：[Fetch Standard 的 CORS protocol](https://fetch.spec.whatwg.org/#http-cors-protocol)。

</details>

---

## 76. XSS、CSRF 与 CSP 分别是什么？

<!-- question: {"category":"browser","type":"theory","difficulty":"intermediate","tags":["浏览器","XSS","CSRF","CSP"],"estimatedMinutes":5} -->

分别说明 XSS、CSRF 和 CSP 的攻击或防护机制，结合 React 文本渲染、富文本、Cookie 与服务端校验说明各自边界。

<details>
<summary>展开参考答案与解析</summary>

XSS 是不可信内容进入代码执行上下文；CSRF 是攻击者借浏览器自动附带的凭据诱导受害者发起非预期操作；CSP 是限制资源加载和代码执行的策略，可降低注入影响，但不能替代安全输出、鉴权或 CSRF 校验。

### 原理与示例

- **XSS**：按 HTML、属性、URL 等具体上下文安全编码，文本使用 `textContent` 或 React 插值；富文本用维护良好的 allowlist sanitizer，同时检查 URL scheme。存储型、反射型和 DOM XSS 是不同入口。
- **CSRF**：状态变更不使用 GET；会话型应用验证 CSRF token，按部署方式配合 SameSite Cookie、Origin/Referer 或 Fetch Metadata 校验。校验必须在服务端，token 应不可预测并绑定会话或采用正确签名的 double-submit 方案。
- **CSP**：`script-src` 配合随机 nonce 或 hash 限制可信脚本，避免 `unsafe-inline`/`unsafe-eval`；`object-src`、`base-uri`、`frame-ancestors` 等各管不同范围。可先用 report-only 收集违规再逐步强制执行。

```jsx
// React 将普通字符串插值作为文本处理
function Comment({ text }) {
  return <p>{text}</p>
}
```

### 边界与易错点

- React 文本转义不覆盖 `dangerouslySetInnerHTML`、第三方 HTML 写入或所有 URL 上下文；链接仍应校验允许的协议，不要依赖框架替代安全边界。
- `HttpOnly` 降低 Cookie 被脚本直接读取的风险，XSS 仍可在页面中冒用用户发请求。
- SameSite 按“站”判断，不等于同源；同站不同子域、需要跨站的登录流程和浏览器兼容差异仍要评估。
- 二次确认只有在攻击者无法伪造且服务端验证的前提下才是安全控制；单纯弹一个前端确认框不能防 CSRF。
- CSP nonce 应每响应随机生成，不能使用固定值；受信第三方脚本本身被攻破时，allowlist 也可能失效。

### 追问

- **Bearer token 能消除 CSRF 吗？** 仅由应用主动加入 Authorization 且不会被浏览器自动附带的凭据降低传统 CSRF 风险，但需核对实际认证路径；把 token 放 localStorage 又会增加 XSS 窃取风险。
- **CSP 和 sanitize 为何都要做？** sanitize 防止危险内容到达 sink，CSP 在漏网时约束执行，两层失败模式不同。

参考：[OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)、[OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)、[CSP Level 3](https://www.w3.org/TR/CSP3/)。

</details>

---

## 77. layout、paint、composite 有什么区别？

<!-- question: {"category":"browser","type":"theory","difficulty":"intermediate","tags":["浏览器"],"estimatedMinutes":5} -->

解释 layout、paint、raster 和 composite 的区别，并分析反复读取 `offsetWidth` 后修改样式为什么可能造成卡顿。

<details>
<summary>展开参考答案与解析</summary>

layout 计算盒子的尺寸与位置；paint 记录文本、背景等如何绘制；raster 把绘制记录转成图块像素；composite 将这些内容按图层、变换与裁剪合成。属性变化是否触发某阶段取决于浏览器实际依赖与图层状态，不能只靠属性表下结论。

### 原理与示例

- `width`、字体等几何变化通常需要 style/layout；颜色变化通常可跳过 layout，但需 paint/raster；适当图层上的 `transform`、`opacity` 动画可复用像素并在合成阶段更新。
- 样式写入使布局失效后，读取 `offsetWidth`、`getBoundingClientRect()` 等几何信息可能迫使浏览器立即同步计算；反复交替读写形成 layout thrashing。

```js
// 批量读，再批量写，避免每轮写完又要求重新计算布局
const widths = items.map((el) => el.offsetWidth)
items.forEach((el, index) => {
  el.style.width = `${widths[index] + 10}px`
})
```

### 边界与易错点

- 读取几何不必然触发新 layout；布局已有效时可直接返回。批量读取也可能有一次必要的同步布局，目的是避免反复触发。
- `requestAnimationFrame` 把工作安排到帧前，并不自动消除同步布局；回调里长时间计算或读写交错仍会阻塞呈现。
- `will-change` 是优化提示，会增加图层与内存开销，应按需启用；`transform` 并不保证所有效果、尺寸与浏览器下都只走 composite。
- `{ passive: true }` 适合不调用 `preventDefault()` 的可取消触摸/滚轮监听，不能无条件给所有事件加上。

### 追问

- **怎么确认瓶颈？** 录制 Performance，关联脚本调用栈、强制布局、paint/raster 与帧耗时；布局偏移分数不能代替 layout 成本。
- **`contain` 和 `content-visibility` 有何取舍？** 可限制计算范围或跳过屏外渲染，但影响尺寸推导等语义；要提供合理占位并检查可访问性和功能。

参考：[Rendering performance](https://web.dev/articles/rendering-performance)、[Layout thrashing](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing)。

</details>

---

## 78. `any`、`unknown`、`never` 如何区分？

<!-- question: {"category":"typescript","type":"theory","difficulty":"basic","tags":["TypeScript"],"estimatedMinutes":3} -->

比较 `any`、`unknown`、`never` 的赋值和使用规则，说明类型断言与运行时校验的区别，并给出穷尽检查的用途。

<details>
<summary>展开参考答案与解析</summary>

`any` 允许不受常规类型检查约束的操作；`unknown` 可以接收任意类型的值，但操作前需收窄；`never` 表示没有可能值的类型，用于不可达分支和永不正常返回的函数。三者都是静态类型，不产生运行时校验。

### 原理与示例

```ts
function parse(input: unknown): string {
  if (typeof input !== 'string') throw new TypeError('expect string')
  return input.toUpperCase()
}

function assertNever(value: never): never {
  throw new Error(`Unexpected: ${String(value)}`)
}
```

- 任意类型可赋给 `unknown`；未收窄的 `unknown` 通常只能赋给 `unknown` 或 `any`，不能直接访问属性或当函数调用。
- `never` 可赋给任何类型，但正常值无法赋给 `never`，连 `any` 也不能直接赋给 `never`；永远抛错或无限循环的函数可返回 `never`。
- 判别联合处理完所有成员后，剩余分支收窄为 `never`；新增成员而未处理时，`assertNever(value)` 会报静态错误。

### 边界与易错点

- `as User` 是告诉编译器采用某个类型，并不验证或转换实际数据；后续访问仍受 `User` 约束，所以不等同于把所有检查都关掉的 `any`。
- 双重断言 `as unknown as T` 更容易越过兼容性约束，但仍没有运行时保障。外部 JSON、存储和消息应验证结构后再使用。
- `noImplicitAny` 拦住隐式 any，不禁止显式 any；显式 any 与不安全传播需另外审查或 lint 约束。
- `void` 表示调用方不使用返回值，或函数没有有意义的返回值，不等于函数永不返回。

### 追问

- **泛型与 unknown 怎么选？** 保留输入输出之间的具体类型关系用泛型；未知外部输入的边界用 unknown，再收窄。
- **为什么 `JSON.parse` 结果仍不可信？** 解析只保证 JSON 语法有效，不保证业务字段或约束有效；应先视为 unknown 做校验。

参考：[TypeScript More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)、[TypeScript Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)。

</details>

---

## 79. `type` 与 `interface` 怎么选？

<!-- question: {"category":"typescript","type":"theory","difficulty":"basic","tags":["TypeScript"],"estimatedMinutes":3} -->

比较 `type` 与 `interface` 在对象建模、扩展、声明合并和复杂类型运算方面的差异，并说明类能否 `implements` 类型别名。

<details>
<summary>展开参考答案与解析</summary>

`interface` 和 `type` 都能描述对象和函数形状。需要开放扩展、声明合并时常用 interface；需要联合、元组、条件或映射类型等表达式时常用 type。它们描述对象时主要是结构类型，不存在“一个只能对象、另一个什么都更好”的统一结论。

### 原理与示例

```ts
interface User {
  id: string
}
interface User {
  name: string
}
// User 合并后同时要求 id 和 name

type Result = { ok: true; value: string } | { ok: false; error: Error }
type UserId = User['id']
```

- `interface extends` 会检查继承成员冲突；交叉类型允许表达组合，冲突属性可能收敛为 `never`，例如 `{ id: string } & { id: number }`。
- interface 可以继承可静态确定成员的对象类型别名；类型别名也可以通过交叉引用 interface。
- 类可 `implements` interface 或成员可静态确定的对象类型别名，不能直接 implements 任意联合类型。

### 边界与易错点

- 同名 interface 合并对成员也有兼容规则，不是任意定义都能自动兼容；同一作用域的 type 别名不能重复声明。
- “类只能实现 interface”“type 不可扩展”都不准确；而 `implements` 只检查实例契约，不自动推导方法体参数类型。
- 复杂交叉可能增加类型检查成本；简单业务形状通常优先遵循团队习惯，性能问题应依据 tsc 分析结果，而非一概否认或夸大差异。

### 追问

- **扩展第三方全局类型怎么做？** 在库允许的扩展点使用声明合并或模块 augmentation，遵循该库声明格式，不直接修改安装目录。
- **冲突为何不总是整个 never？** 普通属性冲突可能仅使该属性变 never；判别属性等冲突可能使整个交叉不可达，需看具体结构。

参考：[TypeScript Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)。

</details>

---

## 80. 泛型的本质是什么？

<!-- question: {"category":"typescript","type":"theory","difficulty":"intermediate","tags":["TypeScript","泛型"],"estimatedMinutes":5} -->

说明泛型如何保留类型关系，给出受约束的属性读取例子，并讨论泛型、联合和重载的适用边界。

<details>
<summary>展开参考答案与解析</summary>

泛型让类型参数连接多个位置，例如输入元素类型决定输出类型、对象类型决定合法 key 和属性返回类型。它提供可复用的静态契约，不会在运行时保留类型参数，也不能让任意外部数据自动符合声明。

### 原理与示例

```ts
function first<T>(items: readonly T[]): T | undefined {
  return items[0]
}

function pick<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const name = pick({ name: 'Ada', age: 30 }, 'name') // string
// pick({ name: 'Ada' }, 'missing') // 编译错误
```

- `extends` 约束表达参数需要的能力，`K extends keyof T` 约束 key；条件类型里的 `T extends U ? X : Y` 则是类型计算。
- 推导通常来自参数与上下文，调用方能省略 `<T>`；把输入过早写成 `unknown[]` 等宽类型会丢失可推导信息。

### 边界与易错点

- “类型参数只出现一次就一定等价 unknown”过于绝对；它是检查 API 是否真的建立类型关系的经验规则。约束、显式参数、回调或容器类型仍可能体现不同用途。
- `parseJson<T>(text): T` 若只调用 `JSON.parse`，实际并没有验证 T；可返回 unknown，或要求传入运行时 validator。
- 要表达输入输出关联用泛型；几种独立固定形状常用判别联合；确实需要多个调用签名或返回关联时可用重载，不必强行统一成复杂泛型。

### 追问

- **为何 first 返回 `T | undefined`？** 数组可能为空，泛型不会证明非空；若契约要求至少一个元素，可用非空元组参数。
- **约束能否保证返回与参数完全同型？** 不能。`T extends { length: number }` 只保证有 length，不能把任何带 length 的新对象当成 T 返回。

参考：[TypeScript More on Functions：Generics](https://www.typescriptlang.org/docs/handbook/2/functions.html#generic-functions)。

</details>

---

## 81. discriminated union 为什么适合 UI 状态？

<!-- question: {"category":"typescript","type":"theory","difficulty":"intermediate","tags":["TypeScript"],"estimatedMinutes":5} -->

用 discriminated union 建模请求的 idle、loading、success、error 状态，说明如何避免非法组合并做穷尽检查。

<details>
<summary>展开参考答案与解析</summary>

判别联合用共同的字面量字段区分互斥状态，让成功状态必须有数据、失败状态必须有错误。检查判别字段会收窄整个对象；再用 never 校验穷尽分支，可使新增状态触发编译错误。但它只约束状态形状，不自动证明状态转换合法。

### 原理与示例

```ts
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: string[] }
  | { status: 'error'; error: Error }

function describe(state: State): string {
  switch (state.status) {
    case 'idle': return '未开始'
    case 'loading': return '加载中'
    case 'success': return `${state.data.length} 项`
    case 'error': return state.error.message
    default: {
      const unreachable: never = state
      return unreachable
    }
  }
}
```

### 边界与易错点

- 多个布尔可能表达 `loading && success && error`，联合则排除这些未定义组合；前提是构造数据没有使用 any 或不可信断言绕过检查。
- 若要保留旧数据并后台刷新，应显式增加 refresh 状态或把“数据是否存在”“刷新状态”设计为正交维度，不要把所有业务强行挤成四种状态。
- 联合不防止旧请求覆盖新请求，仍需 request id、取消或版本比较；复杂流转也要 reducer/状态机与测试约束。

### 追问

- **添加 cancelled 状态怎样暴露漏处理？** 把它加入 State，default 中的 `never` 赋值就会报错，要求补分支。
- **服务端输入已声明 State 是否安全？** 不安全，运行时 JSON 应先验证 status 与对应字段，类型声明本身不会过滤非法组合。

参考：[TypeScript Narrowing：Discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)。

</details>

---

## 82. tree shaking 为什么可能失败？

<!-- question: {"category":"engineering","type":"theory","difficulty":"intermediate","tags":["工程化"],"estimatedMinutes":5} -->

为什么只 import 一个函数，生产包里仍可能包含很多无用代码？请区分静态导出分析、模块副作用消除和代码分割。

<details>
<summary>展开参考答案与解析</summary>

tree shaking 根据模块依赖和导出使用情况消除可证明不需要的代码；静态 ESM 通常最易分析，副作用会使模块或语句必须保留。`sideEffects` 是打包器消费的模块级声明，不是 ESM 标准，也不是所有消除的必需开关；从聚合入口导入或 `export *` 本身不必然失败。

### 原理与示例

```js
// math.js：只使用 add 时，未使用的 multiply 可以被消除
export const add = (a, b) => a + b
export const multiply = (a, b) => a * b

// app.js
import { add } from './math.js'
console.log(add(1, 2))
```

- ESM 绑定静态可知；转成 CJS、运行时拼接路径或对 namespace 做未知成员访问，会让分析更保守，具体能力取决于打包器。
- 顶层注册、polyfill 和 CSS 导入具有副作用，不能仅因没有导出被使用就删除。webpack 的 `sideEffects: ['**/*.css', './register.js']` 可以声明需保留的文件。
- unused exports 标记、整模块副作用消除、压缩器删除语句是相关但不同的步骤；要检查实际生产配置和最终产物。

### 边界与易错点

- 错误地设置 `sideEffects: false` 可能删掉 CSS 或必要初始化，导致“包小了但功能坏了”。
- 静态 re-export、命名导入、`import * as math` 后只访问 `math.add` 都可能被优化；未知动态访问 `math[key]` 才更可能扩大保留范围。
- `import()` 建立异步分割点，并不自动证明内部代码未使用；一个 lazy chunk 也能继续 tree shake。
- 正确保留的依赖、重复版本、polyfill 或开发产物都会影响体积，不能看到大包就归因于 import 写法。

### 追问

- **怎么排查一个依赖为何留在包里？** 从生产模块图找引入链，再检查实际条件入口、副作用声明、ESM 是否保留及动态使用位置。
- **改成深层导入有风险吗？** 可能绕过初始化或依赖未公开内部路径；应使用包声明支持的 exports，而非盲目穿透目录。

参考：[webpack Tree Shaking](https://webpack.js.org/guides/tree-shaking/)。

</details>

---

## 83. source map 有什么价值和安全风险？

<!-- question: {"category":"engineering","type":"theory","difficulty":"intermediate","tags":["工程化"],"estimatedMinutes":5} -->

source map 如何帮助线上定位？比较普通、inline、hidden 产物，并说明如何部署、匹配版本和控制源码暴露。

<details>
<summary>展开参考答案与解析</summary>

source map 将构建后文件的行列位置映射回原始源位置，可帮助还原压缩代码堆栈。是否公开 map 是部署策略：私有应用常只上传监控平台，公开项目也可有意提供；无论采用哪种策略，前端代码都不能包含秘密。

### 原理与示例

- map 记录源文件、名称和位置映射，可能含 `sourcesContent`；能恢复到什么程度取决于构建链和映射质量，不保证完全还原原项目。
- Vite 的 `build.sourcemap: true` 生成独立文件，`inline` 把 map 写入 bundle，`hidden` 生成独立文件但省略 bundle 中的 sourceMappingURL 注释。
- 按 release、构建标识及实际 chunk 文件关联上传，保留线上仍可能使用的旧版本 map；平台支持 debug id 时也可按其关联。

### 边界与易错点

- `hidden` 只隐藏引用，不限制 HTTP 访问；若把 `.map` 一起部署到公开目录，猜到 URL 的人仍可下载。
- map 可能暴露路径、注释和嵌入源码，应检查访问权限；删除 `sourcesContent` 只能减少部分暴露，bundle 本身仍可分析。
- 多级转换链中某一步没有传递映射，会造成错位；必须用真实发布产物和对应 source map 验证一条已知堆栈。
- 内联 map 增加下载体积，不应只因便于调试就默认用于生产；保留策略需兼顾旧缓存页面和存储成本。

### 追问

- **为什么 release 匹配仍会失败？** 同一 release 若对应多次构建、文件被 CDN 再处理或 map 上传不全，行列映射仍可能不同；应关联精确产物。
- **不公开 map 就安全吗？** 只能降低源码暴露，客户端鉴权、混淆或隐藏路径均不能替代服务端权限控制。

参考：[Vite build.sourcemap](https://vite.dev/config/build-options.html#build-sourcemap)。

</details>

---

## 84. 前端监控应采集什么？

<!-- question: {"category":"engineering","type":"theory","difficulty":"intermediate","tags":["工程化"],"estimatedMinutes":5} -->

设计前端监控的最小采集范围，说明错误、性能、业务指标的采集入口、聚合维度、上报时机与隐私边界。

<details>
<summary>展开参考答案与解析</summary>

围绕可定位的问题采集错误、真实用户性能、关键业务结果与少量上下文。统一带上 release、页面或路由、时间及可关联的 request/trace id，并定义采样、脱敏、队列上限和告警口径；监控失败不得拖垮业务。

### 原理与示例

- **错误**：`error` 和 `unhandledrejection`；资源加载失败需要 capture 阶段监听并区分目标；请求层记录网络失败、HTTP 错误和业务错误。React 组件边界另补渲染错误上下文。
- **性能**：LCP、INP、CLS 用合适的测量实现；结合 TTFB、长任务与自定义 mark/measure 记录搜索、上传等流程，按设备、页面、网络和版本分组。
- **业务**：分开统计成功率、失败原因和完成耗时，避免“请求 200”被当成“业务成功”。错误率需要以访问或请求量为分母。
- **上报**：异步批量、采样、去重及退避；页面转为 hidden 时可用 sendBeacon 或 keepalive fetch 尽力送达，均不保证可靠交付。

### 边界与易错点

- 白屏应结合关键节点、错误和资源超时，合法空状态、尚在加载或用户后台切换不能直接判为事故。
- 全局监听覆盖不了所有已捕获错误、跨源 iframe 或跨源脚本细节；跨源脚本堆栈需正确 crossorigin 与 CORS 配置。
- 不采 token、完整请求体、用户输入或含秘密的 URL query；用户标识也需最小化、访问控制和保留期限。
- CWV 是每次页面访问的指标，再计算访问间分位；后台期间的重复上报需按 metric id 去重或更新，不能重复计数。
- 按异常类型、堆栈和版本归一化指纹；动态用户 id 混入 message 会让同类问题被拆成大量事件。

### 追问

- **告警怎样减少噪声？** 根据错误率、受影响用户数、持续时间和灰度组变化触发，设置最低样本量并关联发布。
- **怎样检查监控成本？** 比较开启前后主线程耗时、内存、上报流量与丢弃率，给采集量设置预算。

参考：[Web Vitals 的测量与上报](https://web.dev/articles/vitals)、[OpenTelemetry Browser](https://opentelemetry.io/docs/languages/js/getting-started/browser/)。

</details>

---

## 85. CI 中前端项目最小质量门禁是什么？

<!-- question: {"category":"engineering","type":"theory","difficulty":"intermediate","tags":["工程化"],"estimatedMinutes":5} -->

为前端项目设计合并前的最小 CI 门禁，说明可复现安装、静态检查、测试、生产构建如何分层，哪些检查应按风险扩展。

<details>
<summary>展开参考答案与解析</summary>

最小门禁应覆盖可复现安装、静态检查、关键行为测试和可部署产物构建，并让失败结果真正阻止合并。检查范围随改动与产品风险变化；门禁多不代表质量高，关键是能发现错误、稳定运行并提供可定位日志。

### 原理与示例

1. 固定 Node 与包管理器版本、提交 lockfile，在 CI 运行如 `pnpm install --frozen-lockfile`，让 manifest 与 lockfile 不一致时失败。
2. 尽早执行 lint、格式检查和 typecheck；类型通过不代表运行逻辑正确。
3. 跑与变更相关的行为测试及必要的跨模块回归；筛选受影响范围时也要把共享逻辑、配置和内容管线变更算进去。
4. 验证生产构建和项目规定的 budget，不能以开发服务器能启动替代；构建完成仍需检查最终部署路径或必要的冒烟流程。
5. 高风险变更加关键 E2E、可访问性或安全检查；较重矩阵可按分支、夜间或发布前运行，避免只在发布后发现关键缺陷。

### 边界与易错点

- 门禁在 CI 中可以固定运行生产构建，但本地每次低风险文档改动不必重复整套构建；两者目标和触发范围不同。
- 缓存必须基于正确输入并避免旧产物伪装成功；“允许失败”的 job 不能被当成阻断式门禁。
- 核心用例需可控数据与隔离状态；涉及真实第三方的契约检查可单独安排，不应让不可控外部故障随机阻止普通合并。
- 本地与 CI 复用相同命令，并保存报告和复现信息；重跑才过也要记为 flaky，而非直接视为正常。

### 追问

- **怎样缩短 CI？** 独立检查并行、复用依赖/任务缓存、合理分片，并先用耗时数据找瓶颈。
- **能否只跑变更文件测试？** 可以作为快速层，但共享依赖或全局配置变化要扩大范围，核心回归层不能依赖脆弱的文件名映射。

参考：[pnpm install](https://pnpm.io/cli/install)、[Playwright Best Practices](https://playwright.dev/docs/best-practices)。

</details>

---

# 第四部分：JavaScript 代码实战题

代码题建议先澄清输入、输出、异常和规模，再写主路径，最后补边界与测试。以下实现以展示思路为主；生产代码还要结合项目规范。

## 86. 实现 debounce，支持 cancel 和 flush

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript","debounce"],"estimatedMinutes":10} -->

实现 trailing-only 的 `debounce(fn, wait)`：连续调用只在停止至少 `wait` 毫秒后执行最后一次，保留实参与 `this`。`wait` 为非负整数毫秒数；`cancel()` 丢弃尚未执行的调用，`flush()` 立即执行待处理调用并返回其结果，无待处理调用时返回 `undefined`。需允许 `fn` 内再次调用该包装函数。

<details>
<summary>展开参考答案与解析</summary>

用一个定时器和最后一次调用信息实现尾部防抖。执行前先把参数取到局部变量并清空旧状态，才能让回调中的重入创建独立的新一轮任务。

### 参考实现

```js
function debounce(fn, wait) {
  if (typeof fn !== 'function') throw new TypeError('fn must be a function')
  if (!Number.isInteger(wait) || wait < 0 || wait > 2 ** 31 - 1) {
    throw new RangeError('wait must be a supported non-negative delay')
  }
  let timer = null
  let lastArgs
  let lastThis

  function invoke() {
    if (timer === null) return undefined
    clearTimeout(timer)
    timer = null
    const args = lastArgs
    const thisArg = lastThis
    lastArgs = lastThis = undefined
    return fn.apply(thisArg, args)
  }

  function debounced(...args) {
    if (timer !== null) clearTimeout(timer)
    lastArgs = args
    lastThis = this
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

- `flush()` 后旧定时器被清除；若 `fn` 重入，不能在 `fn` 返回后再次清空参数或定时器，否则会误删新任务。`cancel()` 无法中断已开始执行的函数或请求。
- 包装函数的普通调用返回 `undefined`；只有 `flush()` 返回本次执行结果。若 `fn` 返回 Promise，调用方需要处理其 rejection；定时器路径的同步异常也需要业务层明确处理，不能静默吞掉。
- `wait = 0` 仍是异步定时器任务。定时器会受任务队列、最小延迟和后台限速影响，不能保证精确在指定毫秒执行。[HTML 定时器规范](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers)
- 每次调用调度开销 O(1)，额外空间 O(k)，k 是最后一次实参数量及其引用；这里只实现 trailing，不包含 leading/maxWait。

### 追问

- **如何支持 maxWait？** 另外记录本轮首次触发时间和最大等待期限；持续输入时仍需按最大期限执行，并与普通尾部定时器一起取消。
- **搜索只做 debounce 够吗？** 它减少请求触发频率，已发请求仍可能乱序；还需取消或最新请求标记，见第 94 题。

</details>

---

## 87. 实现 throttle，支持 trailing

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript","throttle"],"estimatedMinutes":10} -->

实现 `throttle(fn, wait)`，`wait` 为正整数毫秒数：首次立即执行，之后相邻执行间隔至少为 `wait`；窗口内多次调用合并为一次 trailing，使用最后一次实参与 `this`。提供 `cancel()`，取消后下一次调用视为首次。需处理回调重入。

<details>
<summary>展开参考答案与解析</summary>

用单调时钟记录最近执行时间，未到期限时只安排一个尾部定时器。执行前清理当前批次，既保留最后一次调用信息，也不会覆盖回调重入产生的新批次。

### 参考实现

```js
function throttle(fn, wait) {
  if (typeof fn !== 'function') throw new TypeError('fn must be a function')
  if (!Number.isInteger(wait) || wait <= 0 || wait > 2 ** 31 - 1) {
    throw new RangeError('wait must be a supported positive delay')
  }
  let lastInvokeTime = null
  let timer = null
  let lastArgs
  let lastThis

  function invoke(now) {
    if (timer !== null) clearTimeout(timer)
    timer = null
    lastInvokeTime = now
    const args = lastArgs
    const thisArg = lastThis
    lastArgs = lastThis = undefined
    return fn.apply(thisArg, args)
  }

  function schedule() {
    const remaining = wait - (performance.now() - lastInvokeTime)
    timer = setTimeout(() => {
      timer = null
      if (performance.now() - lastInvokeTime < wait) schedule()
      else invoke(performance.now())
    }, Math.max(0, remaining))
  }

  function throttled(...args) {
    const now = performance.now()
    lastArgs = args
    lastThis = this
    if (lastInvokeTime === null || now - lastInvokeTime >= wait) return invoke(now)
    if (timer === null) schedule()
    return undefined
  }

  throttled.cancel = () => {
    if (timer !== null) clearTimeout(timer)
    timer = null
    lastInvokeTime = null
    lastArgs = lastThis = undefined
  }
  return throttled
}
```

### 边界与易错点

- 用 `null` 表示从未执行，不能假定时间戳初值 `0` 一定早于当前时间一个窗口。`performance.now()` 基于单调时钟，避免系统挂钟调整影响间隔。[High Resolution Time](https://w3c.github.io/hr-time/#dom-performance-now)
- 只有窗口内确实出现新调用才补 trailing；一次孤立调用只执行一次。定时器可能晚到；回调中重查期限避免毫秒取整导致提前执行。
- 立即执行的调用返回 `fn` 结果，合并的调用返回 `undefined`。回调重入会在新窗口排队；`cancel()` 无法撤销已发生的副作用。
- 调度时间 O(1)，额外空间 O(k)，不计 `fn`；与渲染帧同步的视觉更新可选择 `requestAnimationFrame`，它不保证指定的毫秒限流间隔。

### 追问

- **leading 和 trailing 都开启会执行两次吗？** 孤立调用不会；首次之后窗口内有额外调用时，才执行尾部合并调用。
- **节流能防止慢请求堆积吗？** 不能。它限制发起频率，不限制在途数量；需要并发限制器或取消策略。

</details>

---

## 88. 实现并发限制器 `mapLimit`

<!-- question: {"category":"javascript","type":"coding","difficulty":"advanced","tags":["JavaScript","并发"],"estimatedMinutes":10} -->

实现 `mapLimit(items, limit, mapper)`：输入是调用期间不被修改的数组，`limit` 是正整数；`mapper(item, index)` 可返回普通值或 Promise，也可能同步抛错。按输入顺序返回结果；首个被观察到的失败使整体拒绝，并停止领取新任务，但不要求取消已启动任务。空数组返回 `[]`。

<details>
<summary>展开参考答案与解析</summary>

启动至多 `limit` 个 worker，通过同步游标领取下标，任务完成后立即补位。用共享失败标志停止后续调度，并按原下标存放结果。

### 参考实现

```js
async function mapLimit(items, limit, mapper) {
  if (!Array.isArray(items)) throw new TypeError('items must be an array')
  if (!Number.isInteger(limit) || limit <= 0) throw new RangeError('invalid limit')
  if (typeof mapper !== 'function') throw new TypeError('mapper must be a function')
  const length = items.length
  const results = new Array(length)
  let nextIndex = 0
  let stopped = false

  async function worker() {
    while (!stopped) {
      const index = nextIndex++
      if (index >= length) return
      try {
        results[index] = await mapper(items[index], index)
      } catch (error) {
        stopped = true
        throw error
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, length) }, () => worker()))
  return results
}
```

### 复杂度与取舍

- 调度总工作 O(n)，结果空间 O(n)，同时至多 `min(limit, n)` 个 mapper 在途；实际耗时取决于任务时长和下游资源。
- 同步的游标领取在同一个 JavaScript agent 中不会被另一个 worker 的 continuation 打断；这不是跨线程共享内存锁。
- 分批 `Promise.all` 会等整批最慢任务再补位，worker 模式利用率更高。`Promise.all([])` 合法且 fulfilled 为 `[]`，空数组无歧义。[ECMAScript Promise.all](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-promise.all)

### 边界与易错点

- fail-fast 只描述返回 Promise；已启动任务仍可能完成或产生副作用。停止标志只能阻止失败被观察到之后的新领取。
- 输入若已是启动中的 Promise，限制 mapper 的并发不会限制它们的执行；任务必须按需在 mapper 内启动。稀疏数组的空位按 `undefined` 处理。
- 若需要取消，把 `AbortSignal` 传给 mapper 并让其合作响应；若需要所有结果，改为记录每个下标的 fulfilled/rejected 状态，而非直接拒绝。

### 追问

- **为什么不能完成后直接 push？** 那会按完成顺序排列，破坏与输入下标的对应关系。
- **如何选择 limit？** 根据接口限流、连接数和任务资源占用测量；提高并发并不保证更快。

</details>

---

## 89. 手写 `Promise.all`

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript","Promise"],"estimatedMinutes":10} -->

实现返回原生 Promise 的 `promiseAll(iterable)`。接受有限的同步 iterable，元素可以是普通值、Promise 或 thenable；保持输入顺序，空 iterable 返回 `[]`，元素拒绝或迭代抛错时拒绝。非 iterable（包括只有 `length` 的 array-like）应拒绝。不要求支持 Promise 子类或被改写的原生方法。

<details>
<summary>展开参考答案与解析</summary>

同步遍历输入并立即给每个元素注册处理器，用下标保存结果，用剩余计数决定完成。计数初始为 1 作为“遍历尚未结束”的哨兵，避免把空输入或收集中途当成已完成。

### 参考实现

```js
function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const results = []
    let remaining = 1
    let index = 0

    for (const value of iterable) {
      const currentIndex = index++
      results.push(undefined)
      remaining += 1
      Promise.resolve(value).then(
        (result) => {
          results[currentIndex] = result
          remaining -= 1
          if (remaining === 0) resolve(results)
        },
        reject,
      )
    }

    remaining -= 1
    if (remaining === 0) resolve(results)
  })
}
```

### 边界与易错点

- `for...of` 要求同步 iterable，不能用 `Array.from` 无条件替代：后者还接受非 iterable 的 array-like，甚至会把 `{}` 当作空数组，改变错误契约。
- 迭代器抛错发生在 Promise executor 内，会转成 rejection；已经取出的元素已注册 rejection handler。thenable 的访问、采用和值归一交给原生 `Promise.resolve`。
- 空输入返回的 Promise 当场 fulfilled，但 `.then` 回调仍异步执行；非空普通值输入也经 Promise reactions 完成。
- 第一个使聚合 Promise settle 的 rejection 生效，其他任务不会取消；迭代器中同步抛出的错误可能先于已拒绝元素的 reaction 生效。[ECMAScript Promise.all 算法](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-promise.all)
- 这是教学实现，不复刻原生方法的构造器泛型调用、iterator record 全部细节或原生方法被改写后的行为；无限 iterable 会同步阻塞。

### 复杂度与取舍

遍历与收集 O(n)，空间 O(n)，不计任务本身；拒绝时不必等最慢任务，只有全部成功时才等待全部完成。

### 追问

- **为什么不能看 `results.length`？** 结果槽在收集时已分配，长度表示输入数量，不表示成功完成数量。
- **Promise.all 会启动任务吗？** 它消费并聚合输入；普通 Promise 通常在创建时已经开始执行，生成器也可能在迭代时创建任务。

</details>

---

## 90. 实现 EventEmitter

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":10} -->

实现同步 `EventEmitter`，提供 `on`、`off`、`once`、`emit`。同一事件重复注册同一函数去重；按注册顺序调用，监听器的 `this` 是 emitter。`emit` 固定本轮快照；期间新增监听器留到下一轮，移除的普通监听器仍可在本轮执行。`once` 在嵌套 emit 下也最多执行一次；监听器异常向调用方传播并中断本轮。

<details>
<summary>展开参考答案与解析</summary>

用 `Map<type, Set<listener>>` 保存注册顺序，emit 遍历快照。once 除了执行前退订，还要有已执行标记：嵌套 emit 可能先消费它，而外层快照仍持有同一个 wrapper。

### 参考实现

```js
class EventEmitter {
  #events = new Map()

  on(type, listener) {
    if (typeof listener !== 'function') throw new TypeError('invalid listener')
    const listeners = this.#events.get(type) ?? new Set()
    listeners.add(listener)
    this.#events.set(type, listeners)
    return () => this.off(type, listener)
  }

  once(type, listener) {
    if (typeof listener !== 'function') throw new TypeError('invalid listener')
    let fired = false
    const off = this.on(type, (...args) => {
      if (fired) return
      fired = true
      off()
      return listener.apply(this, args)
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
    for (const listener of [...listeners]) listener.apply(this, args)
    return true
  }
}
```

### 边界与易错点

- 快照是本题选择的变更语义，不能笼统说“删除 Set 元素一定会跳过后续元素”。直接遍历还会观察迭代期间的新增项，才是此处要避免的行为。
- 两次 `once(type, fn)` 创建两个 wrapper，属于两个独立的一次性注册；使用返回的退订函数删除各自 wrapper。本实现不支持通过 `off(type, fn)` 删除 once 注册。
- `emit` 同步执行，不等待 async listener。async listener 的 rejection 需要调用方另定捕获策略；不要假装同步 try/catch 能捕获 Promise rejection。
- 普通监听器递归 emit 可无限递归；once 守卫只保护 once，并不限制其他监听器。

### 复杂度与取舍

典型 Map/Set 实现下注册、移除为平均 O(1)；emit 时间与快照空间均 O(k)，k 为本事件监听器数。此处是自定义契约，不能当作 Node.js EventEmitter 或 DOM EventTarget 的完整替代。

### 追问

- **要隔离监听器异常怎么办？** 对每个同步 listener 单独捕获并收集错误，明确 emit 的返回/抛错策略；async 版本则需显式 await 或汇总 Promise。
- **如何支持重复注册？** 用数组或独立注册 token，使每次注册有独立身份，并定义 off 是移除一次还是全部。

</details>

---

## 91. 实现 O(1) 的 LRU Cache

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript","LRU"],"estimatedMinutes":10} -->

实现按条数淘汰的 LRU Cache：容量是正整数；`get(key)` 命中时刷新最近使用顺序，未命中返回 `undefined`；`set` 写入/覆盖也刷新顺序，超过容量淘汰最久未用项。允许任意 Map key 和 `undefined` value，提供 `has` 区分未命中。

<details>
<summary>展开参考答案与解析</summary>

利用 Map 的插入顺序，命中或覆盖时先删后插，把该 key 移到末尾。容量溢出时移除迭代顺序里的第一个 key；O(1) 是通常哈希表实现下的平均复杂度假设，不是 ECMAScript 对 Map 的严格保证。

### 参考实现

```js
class LRUCache {
  #capacity
  #cache = new Map()

  constructor(capacity) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new RangeError('capacity must be a positive integer')
    }
    this.#capacity = capacity
  }

  has(key) {
    return this.#cache.has(key)
  }

  get(key) {
    if (!this.#cache.has(key)) return undefined
    const value = this.#cache.get(key)
    this.#cache.delete(key)
    this.#cache.set(key, value)
    return value
  }

  set(key, value) {
    this.#cache.delete(key)
    this.#cache.set(key, value)
    if (this.#cache.size > this.#capacity) {
      this.#cache.delete(this.#cache.keys().next().value)
    }
    return this
  }
}
```

### 复杂度与取舍

- 典型引擎下 get/set 以平均 O(1) 分析，空间 O(capacity)。标准要求 Map 平均访问时间随元素数次线性增长，并未承诺严格或摊还 O(1)，也不规定 `keys().next()` 的复杂度。[ECMAScript Map](https://tc39.es/ecma262/multipage/keyed-collections.html#sec-map-objects)
- 经典“哈希表 + 双向链表”方案把查找和使用顺序显式分开，适合实现 TTL、按权重淘汰；同样需要说明哈希表复杂度假设。

### 边界与易错点

- `has` 不刷新顺序；`get` 才刷新。本题缺失和缓存 `undefined` 都返回 `undefined`，调用方可配合 `has` 判断。
- 普通对象也有标准化属性顺序，但整数索引会特殊排序，并且普通对象 key 仅为 string/symbol；不能说“对象完全没有顺序”。Map 可区分 `1` 与 `'1'`，对象 key 按引用区分。
- 容量按条数不等于内存上限；缓存对象及 Promise 都有资源占用。TTL 和请求去重需要另外设计。

### 追问

- **为什么覆盖时不能只调用 Map.set？** 已存在 key 的 set 不会把它移动到末尾，必须先 delete。
- **如何添加 TTL？** 每条记录保存 expiresAt，get 时先检查过期再刷新 LRU；还应明确惰性清理或主动扫描策略。

</details>

---

## 92. 实现支持循环引用的 deepClone

<!-- question: {"category":"javascript","type":"coding","difficulty":"advanced","tags":["JavaScript"],"estimatedMinutes":10} -->

实现 `deepClone`，支持同一 realm 的普通对象（Object.prototype 或 null 原型）、普通数组、Date、RegExp、Map、Set，以及循环/共享引用。保留自有属性描述符、symbol/不可枚举属性、数组空洞和 RegExp.lastIndex；getter/setter 保留函数引用而不调用。函数值、类实例、内置类型子类及其他宿主/内置对象均不在支持范围，显式报错；输入不是 Proxy，不改写内置方法。

<details>
<summary>展开参考答案与解析</summary>

深拷贝处理的是对象图：先按支持类型分配副本并登记原对象到副本的映射，再递归内容。Date/RegExp 同样必须登记，否则同一个实例被多次引用时会错误生成多个副本；仅复制原型不能制造带有正确内部槽的任意对象。

### 参考实现

```js
function deepClone(value, seen = new WeakMap()) {
  if (typeof value === 'function') throw new TypeError('Functions are not supported')
  if (typeof value !== 'object' || value === null) return value
  if (seen.has(value)) return seen.get(value)

  const proto = Object.getPrototypeOf(value)
  let result
  if (proto === Object.prototype || proto === null) result = Object.create(proto)
  else if (Array.isArray(value) && proto === Array.prototype) result = []
  else if (proto === Date.prototype) result = new Date(Date.prototype.getTime.call(value))
  else if (proto === RegExp.prototype) {
    const source = Object.getOwnPropertyDescriptor(RegExp.prototype, 'source').get.call(value)
    const flags = [
      ['hasIndices', 'd'], ['global', 'g'], ['ignoreCase', 'i'], ['multiline', 'm'],
      ['dotAll', 's'], ['unicode', 'u'], ['unicodeSets', 'v'], ['sticky', 'y'],
    ].map(([key, flag]) => {
      const getter = Object.getOwnPropertyDescriptor(RegExp.prototype, key)?.get
      return getter?.call(value) ? flag : ''
    }).join('')
    result = new RegExp(source, flags)
  } else if (proto === Map.prototype) result = new Map()
  else if (proto === Set.prototype) result = new Set()
  else throw new TypeError('Unsupported object type')

  seen.set(value, result)
  if (proto === Map.prototype) {
    for (const [key, item] of Map.prototype.entries.call(value)) {
      result.set(deepClone(key, seen), deepClone(item, seen))
    }
  } else if (proto === Set.prototype) {
    for (const item of Set.prototype.values.call(value)) result.add(deepClone(item, seen))
  }
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if ('value' in descriptor) descriptor.value = deepClone(descriptor.value, seen)
    Object.defineProperty(result, key, descriptor)
  }
  if (!Object.isExtensible(value)) Object.preventExtensions(result)
  return result
}
```

### 边界与易错点

- 所有支持类型都递归复制自有属性；Map 的 key 也复制，因此原 key 无法直接查到克隆后的对象 key，但克隆图内部的共享关系保留。
- Accessor 函数和它捕获的闭包仍共享；不触发 getter 不等于把闭包状态深拷贝。只复制私有字段类的原型会得到不可用的伪实例，所以本题拒绝类实例。
- 本实现不支持跨 realm 内置对象、ArrayBuffer/TypedArray、WeakMap/WeakSet、Promise、Error、DOM 等。普通 Proxy 无可靠通用检测，此处按输入契约排除。
- `structuredClone` 对循环、Map/Set、buffer 等数据提供平台支持，但不能保留本题要求的自定义描述符/原型语义，也不能克隆函数。应先确定克隆契约再选择工具。[HTML 结构化序列化](https://html.spec.whatwg.org/multipage/structured-data.html#structuredserializeinternal)

### 复杂度与取舍

按通常弱映射查找成本，时间 O(V + E)，映射空间 O(V)，递归栈 O(depth)，V/E 是对象图节点与属性/集合边数。循环被解决仍不等于极深嵌套不会栈溢出；超深数据需显式栈。

### 追问

- **为什么一定要先 seen.set 再递归？** 自引用或互引用需要立即找到尚未填完的副本，否则无限递归。
- **必须用 WeakMap 吗？** 一次调用内的局部 Map 也正确，调用结束可释放；WeakMap 的弱引用有利于映射长时间保留时不延长原对象生命周期，不是算法正确性的前提。

</details>

---

## 93. 实现带 AbortSignal 和指数退避的 retry

<!-- question: {"category":"javascript","type":"coding","difficulty":"advanced","tags":["JavaScript"],"estimatedMinutes":10} -->

实现 `retry(task, options)`：`task({ attempt, signal })` 可同步抛错或返回 Promise；retries 为非负安全整数，表示首次之后的额外尝试次数。只重试 `shouldRetry(error, attempt)` 明确允许的失败，使用有上限的指数退避和 jitter。取消等待时清理定时器及 abort listener；取消后不再尝试，也不接受迟到成功。task 的在途取消由 task 合作实现。

<details>
<summary>展开参考答案与解析</summary>

把可取消等待、尝试次数和重试判定分开。abort reason 可以是任何 JavaScript 值，不能只看 `error.name`；等待成功和取消两条路径都要移除监听器。

### 参考实现

```js
function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted()
    let timer
    const cleanup = () => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
    }
    const onAbort = () => {
      cleanup()
      reject(signal.reason)
    }
    timer = setTimeout(() => {
      cleanup()
      resolve()
    }, ms)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

async function retry(task, options = {}) {
  const {
    retries = 3, baseDelay = 200, maxDelay = 30000, signal,
    shouldRetry = (error) => error?.retryable === true,
  } = options
  if (typeof task !== 'function' || typeof shouldRetry !== 'function') {
    throw new TypeError('task and shouldRetry must be functions')
  }
  if (!Number.isSafeInteger(retries) || retries < 0) throw new RangeError('invalid retries')
  if (![baseDelay, maxDelay].every((n) => Number.isFinite(n) && n >= 0 && n <= 2 ** 31 - 1)) {
    throw new RangeError('invalid delay')
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    signal?.throwIfAborted()
    try {
      const value = await task({ attempt, signal })
      signal?.throwIfAborted()
      return value
    } catch (error) {
      signal?.throwIfAborted()
      if (attempt === retries || !shouldRetry(error, attempt)) throw error
      signal?.throwIfAborted()
      const cap = baseDelay === 0 ? 0 : Math.min(maxDelay, baseDelay * 2 ** attempt)
      await sleep(Math.random() * cap, signal)
    }
  }
}
```

### 边界与易错点

- `{ once: true }` 仅在 abort 发生时自动移除，正常完成仍需主动清理。预先 aborted 的 signal 要立即拒绝，且保留自定义 reason。[DOM AbortSignal](https://dom.spec.whatwg.org/#interface-abortsignal)
- task 忽略 signal 且永不 settle 时，retry 也无法立即结束；若需要返回 Promise 立即拒绝，另做 abort race，并仍持续处理底层拒绝与资源释放。
- fetch 对 HTTP 429/5xx 通常仍 fulfilled；task 必须检查 response.ok，把可重试错误显式标记。参数、认证和业务错误不应默认重试。
- 重试写操作要有服务端幂等契约；网络错误不代表服务端没执行。退避不应超过服务端 Retry-After 或业务总时限的约束。
- 示例是 full jitter（0 到 cap），maxDelay 限制单次等待，不限制总耗时；任务时限和总 deadline 需要独立设计。

### 复杂度与取舍

最多 retries + 1 次调用，调度额外空间 O(1)；总耗时为任务执行与等待之和，不能仅由指数公式保证。

### 追问

- **如何区分总超时与用户取消？** 用不同 reason 标识；支持时可组合 AbortSignal.timeout/any，但超时策略和重试次数仍要清楚区分。
- **shouldRetry 可以异步吗？** 此版本必须同步返回 boolean；若改成异步判定，需要 await，并在判定后重新检查取消。

</details>

---

## 94. 实现"只采用最新请求结果"

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript","请求"],"estimatedMinutes":10} -->

实现 `createLatestRunner()`，返回 `run(task)`：启动新调用时取消旧调用，task 接收本次的 AbortSignal。每个 run 返回 `{ status: 'success', value }`、`{ status: 'error', error }` 或 `{ status: 'stale' }`；过期调用的成功和拒绝都归为 stale。提供 `run.cancel()` 使当前调用失效，并考虑 abort listener 引发重入。

<details>
<summary>展开参考答案与解析</summary>

取消用来尽力释放资源，版本号决定结果是否有效。每次调用必须捕获自己的 controller，不能在 catch 中读取已经被后一次调用替换的共享实例。

### 参考实现

```js
function createLatestRunner() {
  let version = 0
  let controller = null

  async function run(task) {
    const currentVersion = ++version
    const currentController = new AbortController()
    const previous = controller
    controller = currentController
    previous?.abort()
    if (currentVersion !== version) return { status: 'stale' }

    try {
      const value = await task(currentController.signal)
      if (currentVersion !== version || currentController.signal.aborted) {
        return { status: 'stale' }
      }
      return { status: 'success', value }
    } catch (error) {
      if (currentVersion !== version || currentController.signal.aborted) {
        return { status: 'stale' }
      }
      return { status: 'error', error }
    } finally {
      if (controller === currentController) controller = null
    }
  }

  run.cancel = () => {
    version += 1
    const previous = controller
    controller = null
    previous?.abort()
  }
  return run
}
```

### 边界与易错点

- abort 会触发监听器；先发布新 controller 再取消旧 controller，并在取消后重查 version，避免重入覆盖最新任务。
- task 同步抛错、拒绝和成功均经过 try/catch；不要只在成功分支判 stale，否则旧请求失败也会污染错误状态。
- task 不支持取消时仍可判 stale，但它必须先 settle，旧 run 才能返回；版本号不能让永不完成的任务自动结束。[DOM 取消语义](https://dom.spec.whatwg.org/#aborting-ongoing-activities)
- run 只判定返回时的有效性；调用方只提交 success/error，并在额外异步处理之后再次考虑是否过期。工具不能撤销 task 内已经执行的写操作。
- 每次 run 的管理成本 O(1)，在途任务数量取决于底层是否合作取消，不能笼统称总空间 O(1)。

### 追问

- **为什么 finally 也要检查 controller 身份？** 旧任务结束时直接清空共享 controller，会破坏新任务的取消能力。
- **组件卸载怎么处理？** cleanup 调用 run.cancel；仅在输入变化时启动新 run，不能覆盖卸载路径。

</details>

---

## 95. 数组转树与树转数组

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":10} -->

实现 `arrayToTree(items)` 与 `flattenTree(roots)`。id 为非空字符串或有限数字且唯一；parentId 为父 id，null/undefined 表示根。允许多根，保持输入中的兄弟顺序；重复 id、缺失父节点或环应报错。flatten 采用前序遍历，按实际树结构输出 parentId（根归一为 null），去掉 children，并拒绝循环和重复节点。

<details>
<summary>展开参考答案与解析</summary>

数组转树先建索引，再沿父链做访问状态校验，最后挂接。树转数组用显式栈维持前序顺序，并记录已见对象/id，避免循环或共享节点被误当成合法树。

### 参考实现

```js
const validId = (id) =>
  (typeof id === 'string' && id.length > 0) ||
  (typeof id === 'number' && Number.isFinite(id))

function arrayToTree(items) {
  if (!Array.isArray(items)) throw new TypeError('items must be an array')
  const nodes = new Map()
  for (const item of items) {
    if (!item || !validId(item.id) || (item.parentId != null && !validId(item.parentId))) {
      throw new TypeError('invalid id or parentId')
    }
    if (nodes.has(item.id)) throw new Error('Duplicate id')
    nodes.set(item.id, { ...item, children: [] })
  }

  const state = new Map()
  for (const id of nodes.keys()) {
    const path = []
    let current = id
    while (current != null && state.get(current) !== 2) {
      if (state.get(current) === 1) throw new Error('Cycle detected')
      const node = nodes.get(current)
      if (!node) throw new Error('Missing parent')
      state.set(current, 1)
      path.push(current)
      current = node.parentId
    }
    for (const visited of path) state.set(visited, 2)
  }

  const roots = []
  for (const node of nodes.values()) {
    if (node.parentId == null) roots.push(node)
    else nodes.get(node.parentId).children.push(node)
  }
  return roots
}

function flattenTree(roots) {
  if (!Array.isArray(roots)) throw new TypeError('roots must be an array')
  const result = []
  const seenNodes = new Set()
  const seenIds = new Set()
  const stack = roots.map((node) => ({ node, parentId: null })).reverse()
  while (stack.length) {
    const { node, parentId } = stack.pop()
    if (!node || !validId(node.id)) throw new TypeError('invalid node')
    if (seenNodes.has(node) || seenIds.has(node.id)) throw new Error('Cycle or duplicate node')
    seenNodes.add(node)
    seenIds.add(node.id)
    const { children = [], ...rest } = node
    if (!Array.isArray(children)) throw new TypeError('children must be an array')
    result.push({ ...rest, parentId })
    for (let i = children.length - 1; i >= 0; i--) {
      stack.push({ node: children[i], parentId: node.id })
    }
  }
  return result
}
```

### 复杂度与取舍

按典型 Map/Set 成本且每节点载荷字段数有界，两者时间 O(n)、额外空间 O(n)。父链检查在已完成节点处停止，每个节点不会被反复完整遍历；显式栈也避免深层递归栈溢出。

### 边界与易错点

- 只有环、没有根的输入也必须报错；从 roots 开始校验会漏掉整段不可达的环。
- 输出节点是新对象，原节点顶层字段修改不会同步影响树；嵌套载荷仍共享引用，这是浅拷贝而不是完整深克隆。
- 输出顺序是前序，不保证还原原数组的全局排列。children 字段会按结构生成/去除；父节点结构由 flatten 重新推导。
- 一棵树不允许一个对象属于两个父节点；若业务需要共享子节点，应建模为 DAG，并另定遍历/去重语义。

### 追问

- **为什么不能边遍历边只找已有父节点？** 子节点可能先于父节点出现；先完整建索引才能处理任意输入顺序。
- **找不到父节点应作为根吗？** 可以选择这种容错契约，但必须显式返回诊断；本题采用严格报错，避免静默改写结构。

</details>

---

## 96. 实现 compose

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":10} -->

实现同步、单参数函数的 `compose(...functions)`，满足 `compose(f, g, h)(x) = f(g(h(x)))`。空函数列表返回 identity；非函数参数在创建时抛错，不要求传递 this 或自动 await Promise。

<details>
<summary>展开参考答案与解析</summary>

`compose` 从右到左把上一层结果交给下一层函数，`reduceRight` 正好表达这个顺序；带初始值的空列表自然得到 identity。

### 参考实现

```js
function compose(...functions) {
  if (functions.some((fn) => typeof fn !== 'function')) {
    throw new TypeError('compose expects functions')
  }
  return (input) => functions.reduceRight((value, fn) => fn(value), input)
}

const trim = (value) => value.trim()
const lower = (value) => value.toLowerCase()
const slug = (value) => value.replaceAll(/\s+/g, '-')
compose(slug, lower, trim)('  Hello World  ') // 'hello-world'
compose()(42) // 42
```

### 边界与易错点

- 本题是同步单参契约；某函数返回 Promise 时，左侧函数收到的是 Promise 对象，不会自动等待。函数异常立即向调用方传播。
- 如果扩展多参，应是最右侧、最先被调用的函数接收 `...args`，其他函数接收单个前一步结果，不能含糊地说“第一个函数”。
- `pipe(f, g)(x)` 从左到右，是 `g(f(x))`。函数组合不同于带 next 和控制权转移的中间件组合。
- n 个函数的组合开销 O(n)、额外计算空间 O(1)，不计函数本身；闭包存储函数列表需要 O(n)。[ECMAScript reduceRight](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.reduceright)

### 追问

- **如何支持异步串行组合？** 返回 async 函数，从右到左循环 `value = await fn(value)`，统一同步/异步返回；错误向外拒绝。
- **TypeScript 如何保证相邻签名匹配？** 用有界重载或递归可变元组校验前一个输出能作为下一个输入；简单 `Function[]` 无法提供这一保证。

</details>

---

## 97. 实现并解释大数金额相加

<!-- question: {"category":"javascript","type":"coding","difficulty":"intermediate","tags":["JavaScript"],"estimatedMinutes":10} -->

实现人民币最小单位“分”的任意精度相加及展示。输入为 bigint 或规范十进制整数字符串，可为负；禁止先接收可能已失真的 Number。输出相加结果的 bigint，以及固定两位小数的元字符串，例如 `formatCents(addCents('10', '20')) === '0.30'`。不要求计算税率或币种转换。

<details>
<summary>展开参考答案与解析</summary>

金额用最小单位整数运算，大整数始终保存在 BigInt 中；展示时也用整数除法和余数拼接字符串。把大额 cents 转为 Number 再除以 100，会在最后一步重新丢失精度。

### 参考实现

```js
function parseCents(value) {
  if (typeof value === 'bigint') return value
  if (typeof value !== 'string' || !/^-?(0|[1-9]\d*)$/.test(value)) {
    throw new TypeError('cents must be bigint or an integer string')
  }
  return BigInt(value)
}

function addCents(a, b) {
  return parseCents(a) + parseCents(b)
}

function formatCents(value) {
  const cents = parseCents(value)
  const sign = cents < 0n ? '-' : ''
  const absolute = cents < 0n ? -cents : cents
  return `${sign}${absolute / 100n}.${String(absolute % 100n).padStart(2, '0')}`
}

formatCents(addCents('9007199254740991', '1')) // '90071992547409.92'
formatCents(-1n) // '-0.01'
```

### 边界与易错点

- Number.MAX_SAFE_INTEGER 是 `9007199254740991`；按分存储对应 `90071992547409.91` 元。输入超过安全范围后再执行 `BigInt(number)` 无法恢复之前已经丢失的位。[ECMAScript MAX_SAFE_INTEGER](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-number.max_safe_integer)
- 即使每个 Number 输入都安全，和也可能超过安全范围；本题从输入到展示都避免这种问题。BigInt 不能与 Number 混合算术，JSON 默认不能序列化 BigInt，传输时用约定的整数字符串。
- 本题已明确“两位小数的人民币分”；多币种需携带单位精度，不能把所有币种除以 100。
- 十进制元字符串应逐位解析为分，并明确超出两位时拒绝还是舍入；不要 `parseFloat(value) * 100`。乘除、税率和分摊需单独定义舍入与尾差规则。

### 复杂度与取舍

设输入位数为 d，解析、相加和文本输出通常按 O(d) 分析，空间 O(d)；BigInt 运算不是与位数无关的 O(1)。

### 追问

- **为什么 toFixed(2) 不解决计算问题？** 它只格式化已有的浮点值，无法保证此前计算和大整数转换都保持精度。
- **能直接用 Intl.NumberFormat 吗？** BigInt 的整数展示可用它；含小数的大金额是否能用精确十进制字符串取决于目标环境支持，应验证，不应无条件先转 Number。

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

假设允许多个购买请求并发，pending 表示在途数、completed 表示成功数。快速点击或 buy 拒绝时计数错误，如何修复，并处理事件处理器的异步错误？

<details>
<summary>展开参考答案与解析</summary>

await 之后的代码仍读取触发该 handler 的 render 快照，而非最新 state。所有依赖旧值的计数都改为函数式更新；成功才增加 completed，finally 保证 pending 归位，catch 显式处理拒绝。

### 参考实现

```jsx
async function handleBuy() {
  setPending((value) => value + 1)
  try {
    await buy()
    setCompleted((value) => value + 1)
  } catch (error) {
    setError(error instanceof Error ? error.message : '购买失败')
  } finally {
    setPending((value) => value - 1)
  }
}
```

### 边界与易错点

- React 排队处理函数式 updater；多个并发 handler 即使捕获不同快照，也按最新队列状态累加。updater 必须纯粹，不能在其中请求、日志或发送通知。[React useState](https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state)
- await 之后旧闭包仍存在；错误并不限于“连续点击总是读取同一快照”。两个请求分别完成时，减 pending 和加 completed 都可能覆盖其他请求的更新。
- finally 只保障清理，不处理 rejection；如果没有 catch，必须由调用方捕获，React 不会自动把 async 事件处理器的拒绝交给 Error Boundary。
- 修好计数不代表防止重复购买；本题允许并发。若产品不允许，应增加提交互斥和服务端幂等键。取消和组件卸载需另行停止/忽略结果。
- 示例的单个 error 字段仅展示最近一次失败；需要逐请求追踪或精确业务总数时，以请求记录或服务端权威数据建模。

### 追问

- **为什么 finally 也用函数式更新？** 它同样依赖当前在途数，不能读取 await 之前的快照。
- **全部失败时 completed 会增加吗？** 不会；增加语句位于 await 成功之后，pending 则无论成败都递减。

</details>

---

## 99. 实现 `useLatest`

<!-- question: {"category":"react","type":"coding","difficulty":"intermediate","tags":["React"],"estimatedMinutes":10} -->

实现 `useLatest(value)`，返回稳定 ref，供事件处理器或订阅读取最近一次已提交的 value。不要让被放弃的并发 render 提前暴露值，也不要在 render 阶段读写 ref；此 Hook 不用于生成 JSX。

<details>
<summary>展开参考答案与解析</summary>

“最新”应限定为最近一次已提交的值。在客户端的 layout Effect 中更新 ref，避免 render 阶段写 ref 把未提交渲染泄漏给外部回调。

### 参考实现

```jsx
import { useEffect, useLayoutEffect, useRef } from 'react'

const useCommitEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

function useLatest(value) {
  const ref = useRef(value)
  useCommitEffect(() => {
    ref.current = value
  }, [value])
  return ref
}
```

### 边界与易错点

- React 官方明确要求除初始化外不要在 render 中读写 ref；“广泛接受的例外”不能当作并发安全保证。[React useRef](https://react.dev/reference/react/useRef#caveats)
- 更新 ref 不触发 render。事件中 setState 后、下一次提交之前读取它，仍是上一提交值，这是快照语义。
- layout Effect 在浏览器重绘前运行；服务端使用 useEffect 避免 layout Effect 的服务端限制，两者都不会在 SSR 期间更新 ref。[React useLayoutEffect](https://react.dev/reference/react/useLayoutEffect)
- 它适用于本组件提交同步之后触发的外部回调；不能保证子组件更早执行的 layout Effect 或 ref callback 已看到父组件本轮更新，也不能在这些时机滥用“最新”的承诺。
- ref 不是依赖数组豁免工具；决定是否重新订阅的值仍需作为依赖。卸载时的退订由订阅 Hook 自己负责。

### 追问

- **和 useCallback(fn, []) 的区别？** 空依赖 callback 保留首次闭包；此 ref 在提交后更新，稳定包装函数可在事件中读取它。
- **可以换成 useEffectEvent 吗？** 仅在 Effect 内发起的非响应式回调场景可评估；Effect Event 有调用位置约束，不能作为通用回调传给子组件，见第 127 题。

</details>

---

## 100. 实现 `useDebouncedValue`

<!-- question: {"category":"react","type":"coding","difficulty":"intermediate","tags":["React"],"estimatedMinutes":10} -->

实现 `useDebouncedValue(value, delay)`：首次返回 value；后续 value 或 delay 改变时，等待至少 delay 毫秒再发布最新值，新变化及卸载取消旧计时。delay 为非负整数毫秒数。说明它用于搜索时能否减少请求。

<details>
<summary>展开参考答案与解析</summary>

让 Effect 管理定时器生命周期：新输入提交后取消旧定时器并重启，延迟更新返回值。若请求 Effect 只依赖这个防抖值，快速输入产生的中间请求就会减少；它不会取消已发出的请求。

### 参考实现

```jsx
import { useEffect, useState } from 'react'

function useDebouncedValue(value, delay) {
  if (!Number.isInteger(delay) || delay < 0 || delay > 2 ** 31 - 1) {
    throw new RangeError('invalid delay')
  }
  const [debounced, setDebounced] = useState(() => value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(() => value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
```

### 边界与易错点

- 初始化与 setter 都使用包装函数，因此 value 即使是函数也当作值存储，不被误认为 lazy initializer/updater。[React useState 参数约定](https://react.dev/reference/react/useState)
- delay 改变会重启计时；value 是每次重建的对象时也会重启，应按业务稳定引用或改为明确的原始字段。
- 初次挂载不会延迟 value，搜索若已有初始查询会立即请求。delay=0 仍经定时器任务，而非同步更新。
- 此 Hook 减少“防抖值驱动的副作用”次数；若请求仍依赖原始输入，它不会生效。已发请求需另外取消/判定最新。
- 防抖是固定等待策略，useDeferredValue 是调度策略且没有固定等待时间；两者都不能把单段长同步计算变成可中断任务。

### 追问

- **为什么 cleanup 必须取消计时器？** 避免旧值在新值之后发布，也避免卸载后继续保留回调。
- **需要提交时立刻得到最终值怎么办？** 提交直接使用原始 value，或设计明确的 flush API；不能依赖防抖值已经追上。

</details>

---

## 101. 实现稳定的 `useEventListener`

<!-- question: {"category":"react","type":"coding","difficulty":"intermediate","tags":["React"],"estimatedMinutes":10} -->

实现 `useEventListener(target, type, listener, options)`，target 是实际 EventTarget 或 null，不接受 `.current` 变化不触发 render 的 ref 对象。事件读取最近提交的 listener，listener 改变不重建订阅；target、type 或 capture/passive/once/signal 改变时重建，卸载退订。DOM 条件挂载时通过 callback ref 将节点存为 state。

<details>
<summary>展开参考答案与解析</summary>

把“订阅身份”与“回调逻辑”分开：Effect 依赖实际 target 和订阅选项，事件通过第 99 题的提交后更新 ref 转发。不要在 render 中更新 listenerRef，也不能把 ref.current 当作响应式依赖。

### 参考实现

以下复用第 99 题的 `useLatest`。

```jsx
import { useEffect } from 'react'

function useEventListener(target, type, listener, options) {
  const listenerRef = useLatest(listener)
  const { capture = false, passive, once = false, signal } =
    typeof options === 'boolean' ? { capture: options } : (options ?? {})

  useEffect(() => {
    if (!target) return
    const handler = (event) => listenerRef.current(event)
    const settings = { capture, once, signal }
    if (passive !== undefined) settings.passive = passive
    target.addEventListener(type, handler, settings)
    return () => target.removeEventListener(type, handler, capture)
  }, [target, type, capture, passive, once, signal, listenerRef])
}
```

以下用法片段位于组件内部，在顶层调用 Hook：

```jsx
const [node, setNode] = useState(null)
useEventListener(node, 'click', onClick)
// 返回 JSX 时使用 <button ref={setNode}>...</button>
```

### 边界与易错点

- removeEventListener 匹配 type、callback、capture；使用同一 handler 和 capture 即可。passive/once/signal 改变也应重建，因为它们会改变注册行为。[DOM EventTarget](https://dom.spec.whatwg.org/#interface-eventtarget)
- `{ passive: true }` 表示承诺不调用 preventDefault，适合不阻止默认行为的 wheel/touch 监听；不是所有高频事件都必须设置，scroll 本身不可取消。
- once 触发后自动移除，listener 改变不会重新启用；需重新启用时改变明确的订阅条件。预先 aborted 的 signal 不会建立监听。
- SSR 时 target 传 null；不要在服务器代码中直接求值 window。传入节点的 callback ref 会在节点出现、替换和移除时触发状态更新。
- Effect 建立前的事件不会被捕获；需在提交阶段更早绑定时评估 layout Effect，明确时机成本。

### 追问

- **为什么 `[ref]` 不够？** ref 对象稳定，current 替换不触发 render；Effect 不能知道目标已变化。
- **为什么不直接 listener 作为依赖？** 可以，这是更简单的替代契约，但会因回调引用变化重新注册；本题要求把两者分离。

</details>

---

## 102. 实现一个可被 `useSyncExternalStore` 订阅的 store

<!-- question: {"category":"react","type":"coding","difficulty":"advanced","tags":["React"],"estimatedMinutes":10} -->

实现最小 store，支持 `getSnapshot`、`subscribe`、替换式 `setState(value | updater)`，可被 useSyncExternalStore 消费。相同状态不通知，改变时以不可变新快照通知；解释 SSR 的 store 隔离和服务端快照，不要求 selector/批处理。

<details>
<summary>展开参考答案与解析</summary>

store 保存当前快照和监听器集合。getSnapshot 在状态未改变时返回同一个值，setState 替换引用并通知；任何调用方都不能直接改动已发布的快照。

### 参考实现

```js
function createStore(initialState) {
  let state = initialState
  const listeners = new Set()
  return {
    getSnapshot: () => state,
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

// 客户端演示；SSR 应为每个请求创建对应实例和初始快照。
const serverSnapshot = { count: 0 }
const counterStore = createStore(serverSnapshot)
const getServerSnapshot = () => serverSnapshot

function Counter() {
  const snapshot = useSyncExternalStore(
    counterStore.subscribe,
    counterStore.getSnapshot,
    getServerSnapshot,
  )
  return (
    <button onClick={() => counterStore.setState((prev) => ({ count: prev.count + 1 }))}>
      {snapshot.count}
    </button>
  )
}
```

### 边界与易错点

- 每次 getSnapshot 都返回新对象会让 React 持续认为变化；原地修改同一对象又会导致 Object.is 看不出更新。本实现依赖调用方遵守不可变约定，不自动深冻结。[React useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
- getServerSnapshot 在 SSR 和 hydration 时应描述同一份初始数据；不能无条件读一份已经变化的客户端 live store。服务端实例按请求隔离，不能让用户数据共享模块级可变 store。
- setState 是全量替换，不是浅合并；函数被视为 updater，若状态本身是函数要额外包装。subscribe 重复同一函数会被 Set 去重。
- 通知快照避免本轮继续访问新增监听器；被本轮移除的监听器仍可能在快照中被调用。监听器假定不抛错、不递归写入；错误隔离/批处理属于扩展需求。

### 复杂度与取舍

读快照 O(1)，写入并通知 O(k)，k 是订阅者数；通知快照额外空间 O(k)。只有相关字段更新时才 render 的 selector 订阅，需要缓存 selector 结果和明确相等比较。

### 追问

- **为什么普通 useEffect 订阅更难？** 必须额外处理 render 到订阅之间的变化；useSyncExternalStore 提供 React 与外部快照的一致性协议。
- **直接给 selector 返回新对象可以吗？** 不行；未变化时仍必须返回稳定快照，需复用已缓存的选择结果。

</details>

---

## 103. 设计一个请求状态 reducer

<!-- question: {"category":"react","type":"coding","difficulty":"intermediate","tags":["React","请求","reducer"],"estimatedMinutes":10} -->

设计 TypeScript 请求 reducer，状态为 idle/loading/success/error，start、success、error 携带唯一 requestId；过期 success/error 忽略，reset 清空状态。start 在发起请求时同步 dispatch，id 由 reducer 外生成且不复用；错误值可能不是 Error。

<details>
<summary>展开参考答案与解析</summary>

判别联合约束可表达的状态，终态 action 只有匹配当前 loading.requestId 才生效。reducer 只计算状态，取消请求和生成 id 留在副作用层。

### 参考实现

```ts
type State<T> =
  | { status: 'idle' }
  | { status: 'loading'; requestId: number }
  | { status: 'success'; data: T }
  | { status: 'error'; error: unknown }

type Action<T> =
  | { type: 'start'; requestId: number }
  | { type: 'success'; requestId: number; data: T }
  | { type: 'error'; requestId: number; error: unknown }
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
      const exhaustive: never = action
      throw new Error(`Unknown action: ${String(exhaustive)}`)
    }
  }
}
```

### 边界与易错点

- 同一请求的重复终态在第一次之后不再处于 loading，所以被忽略。reset 后旧响应也忽略；重置 id 计数并复用旧 id 则会破坏隔离。
- 唯一 id 不自动保证 start 新旧顺序；本题约定 start 同步 dispatch。若来自跨线程/远端且可能乱序，应在所有状态保留最新版本并对 start 本身校验。
- `unknown` 承认 JavaScript 可 throw 任意值，显示错误前再归一为用户文案；不能直接读取未知值的 message/name。
- 需要保留旧数据刷新时，显式加入带 data 的 refreshing 分支即可；联合类型也能表达此需求，并不必须改为松散布尔组合。
- never 做编译期穷尽检查；它不校验运行时 JSON，外部输入仍应先解析校验。

### 追问

- **为什么还需要 AbortController？** reducer 只防止旧结果提交，不释放请求资源；取消和结果标记相互补充。
- **如何测试？** 覆盖 start(A)→start(B)→success(A)、重复终态、reset 后迟到结果和实际 error 值；直接调用纯 reducer 即可。

</details>

---

## 104. 修复搜索组件的竞态、错误与卸载问题

<!-- question: {"category":"react","type":"debugging","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

搜索组件接收 query，下面的 Effect 有哪些问题？请补齐加载/成功/空结果/错误/空查询状态，避免旧响应覆盖和卸载更新。假设 `/api/search` 成功响应是 `{ id: string, title: string }[]`。

```jsx
useEffect(() => {
  fetch(`/api/search?q=${query}`)
    .then((response) => response.json())
    .then(setResults)
}, [query])
```

<details>
<summary>展开参考答案与解析</summary>

编码参数、检查 HTTP 与数据形状，用每轮 active 标记忽略过期回调，并以 AbortController 尽力取消。状态保存对应 query，render 时不把旧查询结果误展示成新查询结果。

### 参考实现

```jsx
import { useEffect, useState } from 'react'

function Search({ query }) {
  const [state, setState] = useState({ query: '', status: 'idle' })
  useEffect(() => {
    if (!query.trim()) {
      setState({ query, status: 'idle' })
      return
    }
    const controller = new AbortController()
    let active = true
    setState({ query, status: 'loading' })

    async function load() {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        if (!Array.isArray(data) || data.some((item) =>
          !item || typeof item.id !== 'string' || typeof item.title !== 'string')) {
          throw new Error('Invalid search response')
        }
        if (active && !controller.signal.aborted) setState({ query, status: 'success', data })
      } catch (error) {
        if (active && !controller.signal.aborted) setState({ query, status: 'error', error })
      }
    }
    void load()
    return () => {
      active = false
      controller.abort()
    }
  }, [query])

  const view = state.query === query ? state : { status: query.trim() ? 'loading' : 'idle' }
  if (view.status === 'idle') return <p>请输入搜索词</p>
  if (view.status === 'loading') return <p role="status">搜索中</p>
  if (view.status === 'error') return <p role="alert">搜索失败，请重试</p>
  if (view.data.length === 0) return <p>没有匹配结果</p>
  return <ul>{view.data.map((item) => <li key={item.id}>{item.title}</li>)}</ul>
}
```

### 边界与易错点

- fetch 不因普通 HTTP 错误状态自动 reject；response.ok 是 HTTP 层判断，200 响应仍需检查业务协议和数据形状。[Fetch API](https://fetch.spec.whatwg.org/#fetch-api)
- 取消原因不一定名为 AbortError；自己的 signal.aborted 是可靠判据。active 在 abort 之前失效，即使底层忽略取消、同步拒绝或 json 解析晚到也不提交。
- React 在新 Effect setup 前执行旧 cleanup，卸载也 cleanup；Strict Mode 的额外 setup/cleanup 不应改变最终结果。[React 请求 Effect](https://react.dev/learn/synchronizing-with-effects#fetching-data)
- 仅清理旧请求不保证网络副作用没有发生。若对每个输入字符请求不合适，再使用防抖值、缓存或数据层去重。

### 追问

- **为什么 state 里还记录 query？** 输入变化到新 Effect setup 之间，旧成功状态可能仍在；标注来源可在 render 时隐藏不属于当前参数的结果。
- **怎么验证竞态？** 用可控 Promise，让 B 先完成、A 后成功/失败，以及卸载后完成，均不允许旧结果覆盖。

</details>

---

## 105. 设计一个 controlled/uncontrolled 通用组件 Hook

<!-- question: {"category":"react","type":"coding","difficulty":"advanced","tags":["React","Hook"],"estimatedMinutes":10} -->

设计 `useControllableState({ value, defaultValue, onChange })`。value 不为 undefined 时受控，否则非受控；模式在实例生命周期内固定，defaultValue 只用于初始化。此版本 `setValue(nextValue)` 只接收非函数的直接值，不承诺 React setState 的函数式更新语义；null 可表示显式清空。

<details>
<summary>展开参考答案与解析</summary>

受控状态从 value 读取，只通知 onChange；非受控状态从内部 state 读取并写入，同时通知。先把 setter 契约说清楚，不能提供看似支持 updater、实际却基于同一 render 快照重复计算的实现。

### 参考实现

```jsx
import { useCallback, useEffect, useRef, useState } from 'react'

function useControllableState({ value, defaultValue, onChange }) {
  const controlled = value !== undefined
  const initialMode = useRef(controlled)
  const [internalValue, setInternalValue] = useState(() => defaultValue)
  const current = controlled ? value : internalValue
  const setValue = useCallback((nextValue) => {
    if (typeof nextValue === 'function') throw new TypeError('updater functions are not supported')
    if (Object.is(nextValue, current)) return
    if (!controlled) setInternalValue(nextValue)
    onChange?.(nextValue)
  }, [controlled, current, onChange])

  // 模式校验在 Effect 中读取 ref，避免 render 读取 ref。
  useEffect(() => {
    if (initialMode.current !== controlled) {
      console.warn('Controlled/uncontrolled mode must remain fixed')
    }
  }, [controlled])
  return [current, setValue]
}
```

### 边界与易错点

- 初始模式 ref 仅在 Effect 中读取；如果允许模式切换，还需明确定义内部值如何迁移，单纯警告不是迁移方案。
- 受控 setter 不会自作主张更新 UI，父组件必须传回新 value。defaultValue 后续变化不重置内部 state；这是初始化语义。
- onChange 在调用时表达变更提议，不等于某次状态已提交。受控父组件可能拒绝或归一提议；连续直接赋值采用最后一次更新，回调次数不等于 render 次数。
- 此契约不允许存函数值，也不支持 updater。完整通用库若支持函数式更新，需要区分受控/非受控队列语义，并保持 updater 纯粹，不能在 React 可能重复执行的 updater 内调用 onChange。[React state updater](https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state)

### 追问

- **为什么用 undefined 而非 null 判断？** null 常代表清空的受控值；要允许 undefined 本身作为受控值，需改为显式 controlled 标志或属性存在性判定。
- **怎样支持连续两次 prev => prev + 1？** 非受控使用 React 函数式队列，另外设计提交后通知；受控由拥有 state 的父层排队，不能在 Hook 内靠同一 value 快照假装累加。

</details>

---

## 106. 如何让 10,000 行列表的搜索输入保持响应？

<!-- question: {"category":"react","type":"scenario","difficulty":"advanced","tags":["React"],"estimatedMinutes":8} -->

本地搜索包含 10,000 行数据，输入每个字符都触发筛选和列表渲染，键入明显卡顿。如何定位瓶颈并选择优化？给出能让输入优先更新的候选组件结构，并说明单段同步计算的限制。

<details>
<summary>展开参考答案与解析</summary>

先测量筛选 CPU、React render/commit 和 DOM 布局分别耗时，再减少计算与挂载数量。把输入和结果子树分开，用稳定 props 配合 memo，让紧急输入更新跳过慢子树；useDeferredValue 降低结果更新优先级，但不减少计算量。

### 设计框架

1. 用相同数据和设备记录输入延迟、长任务、React Profiler 和内存，确认主要成本。
2. 筛选重时预处理索引、缩小候选集；单段长同步计算移到 Worker 或拆成可让出主线程的小任务。
3. DOM 重时分页或虚拟化，保证稳定 key；评估屏幕阅读器、查找和打印需求。
4. 让输入 state 保持紧急，用 deferred 值驱动慢子树；服务端搜索仅在网络与架构允许时采用，并补缓存和竞态处理。

### 参考实现

`VirtualList` 表示已有的虚拟列表组件，`items` 引用在数据未变时应稳定。

```jsx
import { memo, useDeferredValue, useMemo, useState } from 'react'

const Results = memo(function Results({ items, query }) {
  const filtered = useMemo(
    () => items.filter((item) => item.name.includes(query)),
    [items, query],
  )
  return <VirtualList items={filtered} />
})

function SearchableList({ items }) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  return (
    <>
      <input aria-label="搜索" value={query} onChange={(event) => setQuery(event.target.value)} />
      {query !== deferredQuery && <p role="status">结果更新中</p>}
      <Results items={items} query={deferredQuery} />
    </>
  )
}
```

### 边界与易错点

- 只传 deferred 值但慢子树每次仍重渲染，可能看不到收益；memo 与稳定 items 让紧急更新期间跳过未变化的 Results。[React useDeferredValue](https://react.dev/reference/react/useDeferredValue#deferring-re-rendering-for-a-part-of-the-ui)
- React 可在调度工作单元之间让出主线程，无法抢占正在执行的一次 `.filter` 或用户函数；Worker/分块解决的才是单段 CPU 长任务。
- useMemo 只缓存重复计算，虚拟化只减少挂载行数，防抖只降低触发频率，各自目标不同。useDeferredValue 不自动限制网络请求。
- 优化后用同样条件复测响应和正确性，不因“行数很多”直接断言一定由 DOM 或 React 引起。

### 追问

- **为什么不把输入更新放进 transition？** 受控输入需要即时反馈，应延后结果更新，而非延后输入本身。
- **怎么证明效果？** 比较输入延迟/INP、长任务与渲染耗时，并检查旧结果提示、键盘操作和筛选一致性。

</details>

---

## 107. 如何测试一个异步表单？

<!-- question: {"category":"react","type":"scenario","difficulty":"intermediate","tags":["React","测试"],"estimatedMinutes":5} -->

异步表单包含名称输入和创建按钮，提交成功显示“创建成功”，失败显示可恢复错误。如何以用户行为验证成功、失败、加载中和重复提交防护，避免固定 sleep 和测试间污染？

<details>
<summary>展开参考答案与解析</summary>

用可访问角色/名称操作真实表单，在网络或数据边界控制结果，等待最终可见状态。加载态和重复提交必须用可控的延迟响应单独验证，不能让立即返回的成功 mock 掩盖过程状态。

### 参考实现

以下以 Vitest、Testing Library、user-event 和 MSW 为示例环境；ProjectForm 及已建立生命周期的 server 由测试工程提供。

```tsx
test('提交成功后展示成功状态', async () => {
  const user = userEvent.setup()
  server.use(
    http.post('/api/projects', async ({ request }) => {
      const body = await request.json() as { name: string }
      return HttpResponse.json({ id: 'p1', name: body.name }, { status: 201 })
    }),
  )
  render(<ProjectForm />)
  await user.type(screen.getByRole('textbox', { name: '名称' }), 'Alpha')
  await user.click(screen.getByRole('button', { name: '创建' }))
  expect(await screen.findByText('创建成功')).toBeVisible()
})
```

### 评分点

- userEvent.setup 后 await type/click，模拟一组用户事件；按角色或 label 查询，避免依赖 CSS 和组件内部 state。[user-event 文档](https://testing-library.com/docs/user-event/intro/)
- 等待出现用 findBy，等待断言满足用 waitFor；waitFor 回调可能重复执行，不能在其中点击或提交，也不能用“返回 false”代替抛出断言错误。[Testing Library 异步 API](https://testing-library.com/docs/dom-testing-library/api-async/)
- 用可控 Promise 暂停响应，断言按钮禁用、加载提示，再快速重复操作验证只发一次；随后 resolve/reject，断言成功或可恢复错误。
- MSW 在 beforeAll listen、afterEach resetHandlers、afterAll close；组件/store/测试数据同样隔离，未知请求应报告错误。[MSW Node 测试集成](https://mswjs.io/guides/integrations/node)
- 覆盖必填阻止请求、网络拒绝、HTTP/业务失败、重复点击、回车提交、失败后重试和必要的焦点移动。

### 边界与易错点

这段测试是成功路径示例，不等于完整测试矩阵。jsdom 不模拟真实布局或全部浏览器行为；关键键盘/可访问交互在风险需要时补浏览器验证。

### 追问

- **mock Hook 实现为什么不理想？** 容易绕过真实请求生命周期，无法验证取消、加载状态和错误传播；在网络/公开数据 API 边界控制行为更贴近用户。
- **快照有价值吗？** 可用于稳定结构，但不能替代提交结果、状态变化和键盘操作等行为断言。

</details>

---

## 108. 设计权限组件时怎样避免"前端鉴权"误区？

<!-- question: {"category":"react","type":"scenario","difficulty":"intermediate","tags":["React","权限"],"estimatedMinutes":5} -->

设计按能力决定路由、菜单和按钮展示的权限组件。说明权限加载中、权限变更和接口 403 的处理，并解释为什么用户即使绕过组件，也不能访问越权资源。

<details>
<summary>展开参考答案与解析</summary>

前端权限组件改善界面和操作体验；每个受保护请求的最终授权必须由服务端完成，校验用户、租户、资源归属和动作。客户端权限值即使来自服务器也可被用户修改，不能作为服务端信任依据。

### 设计框架

```tsx
function Can({ action, resource, children, fallback = null }) {
  const { status, can } = usePermissions()
  if (status !== 'ready') return fallback
  return can(action, resource) ? children : fallback
}
```

- 统一能力入口 `can(action, resource)`，权限数据来自可信会话/服务端响应；前端缓存只用于展示，不承担安全裁决。
- 权限未就绪、失效或加载失败时保守禁用/隐藏敏感操作，并提供明确的加载或失败反馈。
- 服务端每次请求独立检查授权，不能相信客户端传来的 role、allowed 或所属用户 id；直接修改 URL、请求 body 或跳过路由都不能绕过检查。[OWASP 授权建议](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- 权限撤销、租户切换和会话刷新时失效缓存；403 提示无权限并按策略刷新能力。403 不自动表示需要重新登录，认证失效通常另按 401 契约处理。

### 边界与易错点

- 前端下载的敏感数据无法靠“隐藏组件”收回；服务端应在发送数据之前控制访问，静态资源和文件下载也需要授权。
- role 只是模型之一；直接把 admin 字符串散落在组件会提高变更成本。按能力集中建模，同时保留服务端一致的资源规则。
- 测试矩阵覆盖允许/拒绝、不同租户和资源归属，以及权限变更；服务端还要验证手动构造请求的水平越权路径。

### 追问

- **用户改 localStorage 把角色设为 admin 会怎样？** 界面可能被改，但服务端仍按可信身份与策略拒绝；如果因此能读取资源，说明服务端授权缺失。
- **已经显示的按钮被撤权怎么办？** 接口拒绝后停止操作并刷新权限/数据，不能因为旧前端快照显示允许就重试越权动作。

</details>

---

## 109. React 代码审查题：找出问题

<!-- question: {"category":"react","type":"debugging","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

找出以下 React 代码的正确性问题并修复。users 的 id 唯一稳定，name 为字符串；query 是区分大小写的子串搜索。请区分状态/身份错误与可选的空状态体验改进。

```jsx
function UserList({ users, query }) {
  const [filtered, setFiltered] = useState([])
  useEffect(() => {
    users.sort((a, b) => a.name.localeCompare(b.name))
    setFiltered(users.filter(user => user.name.includes(query)))
  }, [users])
  return filtered.map((user, index) => <User key={index} user={user} />)
}
```

<details>
<summary>展开参考答案与解析</summary>

四个主要问题是原地修改 props、用 state/Effect 保存派生数据、漏掉 query 依赖、过滤重排后下标 key 身份错位。改为 render 中纯计算，用稳定 id；空状态属于可选的体验补充。

### 原理与示例

1. sort 修改共享 users，污染父层和其他使用者；不可变更新要求不要直接修改 props。
2. filtered 完全由 users/query 推导，额外 state 会在 Effect 前先展示旧结果，还增加一次更新。
3. Effect 漏 query，只有 query 改变时不重新过滤。
4. index 在过滤和排序时变化，使子组件 state/DOM 与用户身份错位。

### 参考实现

```jsx
function UserList({ users, query }) {
  const filtered = users
    .filter((user) => user.name.includes(query))
    .sort((a, b) => a.name.localeCompare(b.name))
  if (filtered.length === 0) return <p>没有匹配的用户</p>
  return filtered.map((user) => <User key={user.id} user={user} />)
}
```

### 边界与易错点

- filter 返回新数组，因此紧接着 sort 修改的不是原 users，不必再拷贝一遍；直接排序原数组时才需 toSorted 或 `[...users].sort`。
- 渲染时派生数据通常无需 Effect；计算昂贵且依赖稳定时再用 useMemo，而非为修复正确性默认引入缓存。[React 派生数据指南](https://react.dev/learn/you-might-not-need-an-effect#updating-state-based-on-props-or-state)
- includes 区分大小写，localeCompare 受语言环境影响；跨环境严格一致的顺序应明确 locale/规则。id 必须唯一稳定，不能每次 render 新生成。
- 对 m 个匹配结果，过滤 O(n)，常见比较排序 O(m log m)，额外数组 O(n)；比较字符串的成本还与文本长度有关。

### 追问

- **补上 query 依赖是否就够？** 只修一处，props 变更、冗余派生 state 和 key 问题仍在。
- **什么时候 index key 安全？** 列表身份与位置始终固定、不会插入删除过滤重排时才可能适用；本题明显不满足。

</details>

---

# 第六部分：系统与项目场景题

## 110. 如何设计一个前端 RBAC/数据权限系统？

<!-- question: {"category":"architecture","type":"scenario","difficulty":"advanced","tags":["系统设计","RBAC","权限"],"estimatedMinutes":8} -->

多租户后台需要控制菜单、按钮与“本人/本部门/全部”数据范围。请设计权限模型、前后端边界以及权限变更后的失效机制。

<details>
<summary>展开参考答案与解析</summary>

前端统一消费“主体、资源、动作、上下文”能力判断控制交互；RBAC 把角色映射到权限，数据范围还需资源归属或属性规则。服务端每次请求都做功能权限、对象权限和租户隔离检查，前端隐藏按钮只是体验控制。

### 设计框架

1. 定义用户、角色、权限与角色分配，动作采用稳定 permission id，如 `invoice.read`、`invoice.approve`；明确允许、拒绝和继承规则，默认拒绝。
2. 数据范围独立表达，如本人、本部门或全部；规则需要资源 owner、department、tenant 等可信属性时，可使用 ABAC/策略层，不能依赖前端传入的属性授权。
3. 登录或切租户后获取能力与版本，组件统一用 `can(action, resource)`；菜单、路由、按钮和表格操作共享判断，加载中避免闪现敏感内容。
4. 服务端按身份确定可用租户和过滤范围，并对详情、修改、批量操作逐个校验资源归属；猜中 id 也不能读到别人的对象。
5. 权限变化用版本、到期或事件失效，切账号/租户清理旧缓存；403 就近显示无权限并按契约刷新能力，不能自动视为 token 过期反复 refresh。
6. 以主体 × 动作 × 资源归属 × 租户建立允许/拒绝矩阵，覆盖直接 URL、伪造参数与批量请求，敏感操作在服务端审计。

### 边界与易错点

- 下载、导出和字段权限也必须在服务端限制；已经返回的敏感字段无法靠前端隐藏收回。
- 角色数量不断膨胀通常说明把数据属性塞进了角色；RBAC 与 ABAC 可以组合，不必无限增加角色名。
- 权限缓存即使暂时陈旧，服务端仍需实时拒绝越权；不能把长期离线能力快照当最终授权。

### 追问

- **前端 can 能否实现所有对象级规则？** 未加载可信属性时只能给粗粒度能力；详细授权由服务端或返回的对象能力决定，不应为了算权限先泄露数据。
- **如何避免切租户串号？** tenant 参与请求/查询缓存键，取消旧请求并在结果写入前核验当前会话与租户，服务端独立校验。

参考：[OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)。

</details>

---

## 111. 多个请求同时返回 401，如何避免重复 refresh？

<!-- question: {"category":"architecture","type":"scenario","difficulty":"advanced","tags":["系统设计","请求"],"estimatedMinutes":8} -->

同一会话的多个请求并发返回 401。请设计只刷新一次、最多重试一次的客户端，并处理迟到的 401、请求体重放、取消与跨标签页竞态。

<details>
<summary>展开参考答案与解析</summary>

对同一会话共享一个 in-flight refresh Promise，成功更新认证状态后再重试。还要记录请求发送时的认证版本，避免旧请求迟到的 401 在刷新完成后又触发刷新；刷新接口走原始客户端，重试最多一次，且原请求必须能够安全重放。

### 参考实现

以下示例使用同源 HttpOnly 会话 Cookie；`makeRequest` 每次构造新的 Request，`csrfToken` 由可信会话流程提供。它演示单页面、单会话的协调：

```js
function createAuthClient({ csrfToken, onExpired = () => {} }) {
  let refreshPromise = null
  let authVersion = 0
  let expired = false

  function expire() {
    if (!expired) {
      expired = true
      onExpired()
    }
  }

  function refreshOnce() {
    if (expired) return Promise.reject(new Error('Session expired'))
    refreshPromise ??= (async () => {
      // 直接 fetch，不进入下面的 401 处理
      const response = await fetch('/api/refresh', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'X-CSRF-Token': csrfToken },
      })
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) expire()
        throw new Error(`Refresh failed: ${response.status}`)
      }
      authVersion += 1
    })().finally(() => {
      refreshPromise = null
    })
    return refreshPromise
  }

  return async function request(makeRequest) {
    if (expired) throw new Error('Session expired')
    const sentVersion = authVersion
    const response = await fetch(makeRequest())
    if (response.status !== 401) return response

    if (expired) throw new Error('Session expired')
    if (sentVersion === authVersion) await refreshOnce()
    // 若版本已变化，说明这是旧认证版本的迟到 401
    const retried = await fetch(makeRequest())
    if (retried.status === 401) expire()
    return retried
  }
}
```

### 边界与易错点

- Bearer 方案应在 refresh 成功后写入新 token，并在每次 Request 创建时读取最新 token；复用旧 Authorization 会让重试再次失败。
- 已消费的 Request/ReadableStream body 不能直接 fetch 第二次。factory 需提供新的可重放 body；非幂等写请求要确认 401 不会在业务执行后返回，并配服务端幂等键。
- 示例未处理账号切换；生产中需会话 epoch，防止旧 refresh 在注销或切账号后写回凭据，并拒绝过期队列。refresh 还应有超时。
- 用户取消请求不应取消所有请求共享的 refresh；等待者须能退出等待，重试保留原 AbortSignal，已取消的操作不得继续提交。
- 临时网络/5xx 刷新失败可以让等待者失败并提供恢复入口，不一定应立即清空会话；明确 refresh 被拒绝才进入统一失效流程。
- BroadcastChannel 只能通知，不能互斥；跨标签页可按支持情况用 Web Locks/共享协调者，并在拿到锁后再检查版本。服务端 rotation/reuse detection 仍是安全边界。

### 追问

- **为什么只有共享 Promise 仍可能多次 refresh？** 第一轮已完成且 Promise 清空后，旧请求的 401 才到达；发送版本检查可识别它已被新认证覆盖。
- **refresh 请求自己也 401 怎么办？** 原始 fetch 不进拦截器，统一标记会话失效，所有等待者收到失败，不再递归刷新。

参考：[Fetch Request 与 body 规则](https://fetch.spec.whatwg.org/#request-class)、[RFC 9700 Refresh Token Protection](https://www.rfc-editor.org/rfc/rfc9700.html#section-4.14)。

</details>

---

## 112. 如何设计大文件分片上传？

<!-- question: {"category":"architecture","type":"scenario","difficulty":"advanced","tags":["系统设计"],"estimatedMinutes":8} -->

设计一个支持大文件分片、断点续传、暂停取消和秒传的上传方案，说明客户端并发控制、服务端幂等与完整性验证。

<details>
<summary>展开参考答案与解析</summary>

分片上传的核心是"**可恢复 + 幂等 + 可取消**"：前端切片并控制并发，服务端记录已上传分片并保证合并幂等与最终校验。

### 设计框架

整体流程：文件选择 → 计算文件标识并与服务端协商（秒传/续传）→ 分片 → 并发上传 → 每片校验与重试 → 服务端记录进度 → 断点恢复 → 合并 → 整体校验。

前端重点：

- 不把整个文件读入额外内存：用 `File.slice` 分片，直接以 `Blob` 上传。
- 限制并发并支持重试，用 `AbortController` 实现暂停与取消（并发控制见第 88 题）。
- 进度按**已确认上传的字节**计算，并区分"分片上传完成"与"服务端合并完成"。
- 需要全文件 hash 时按块增量计算，耗时较大可放到 Worker；`crypto.subtle.digest()` 本身不是流式增量 API，不能假定能零成本处理任意大文件。内容 hash 可用于内容标识与完整性校验，但不能作为权限凭证。
- 服务端必须保证分片归属、幂等写入、过期清理与最终完整性校验。

### 边界与易错点

- 并发过高会打满带宽并触发网关限流，应根据网络与后端能力设定上限。
- 弱网下必须能续传：服务端返回已上传分片列表，前端只补缺失部分。
- 大文件 hash 的 CPU 与内存成本应测量后控制；Worker 只转移执行位置，仍要避免一次读取整个文件。
- 合并要幂等：失败重试不能生成半截文件或重复文件。
- 分片接口同样需要鉴权，并限制文件类型与大小，防止被当作存储滥用入口。
- 多标签页或多个客户端上传同一文件时，要明确是否允许并发写同一上传会话。

- 服务端创建独立 `uploadId` 绑定用户、文件大小、分片规则和过期时间；分片以 `uploadId + partNumber` 幂等写入，完成时核对所有分片及整体 checksum，原子发布最终对象。
- 暂停只中止客户端传输，不保证服务端没有收到该片；续传以服务端已确认列表为准。取消还需终止上传会话并清理临时对象。
- Fetch 的通用上传进度能力不能一概假设；若使用 XHR 的 progress，展示“发送进度”与“服务端确认进度”应分开。

### 追问

- **秒传怎么实现？** 服务端可按内容 hash 找候选文件，但还需验证调用者授权或持有文件的证明，避免仅知道 hash 就获得他人文件；客户端 hash 不可信，最终内容仍需服务端验证。
- **进度为什么会回跳？** 通常是用"已发送"而非"已确认"计算进度；重试时应保持已完成计数不回退。

参考：[Amazon S3 Multipart upload 的会话、校验和终止流程](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html)。

</details>

---

## 113. 如何设计前端错误处理体系？

<!-- question: {"category":"architecture","type":"scenario","difficulty":"advanced","tags":["系统设计"],"estimatedMinutes":8} -->

为包含表单、列表和关键提交操作的前端设计分层错误处理，说明 HTTP/业务错误、重试、局部恢复、错误上报和 Error Boundary 的边界。

<details>
<summary>展开参考答案与解析</summary>

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

- Error Boundary 通常捕获子树渲染阶段错误，不会自动捕获事件处理器、普通 Promise 回调或 timer 的异常；数据层若把错误在渲染时抛出，才可能交由边界处理。toast 不应成为唯一恢复入口。
- 空的 `catch {}` 会让问题彻底消失；当前层处理不了就要补上下文后抛出（见第 26 题）。
- 重试必须幂等：只对可恢复类型做退避重试，非幂等写操作配合幂等键（见第 72、93 题）。
- "保留旧数据还是清空"是产品与体验决策，必须显式约定，否则会出现加载失败后整页空白。
- 面向用户的文案不要暴露堆栈、SQL 或内部错误细节；日志也须脱敏并控制访问，不能原样存入 token、敏感 SQL 参数或完整请求体。

- `fetch` 在 HTTP 4xx/5xx 时通常正常返回 Response，应检查 status/ok 并按业务契约分类；JSON 解析失败属于另一类错误。
- 主动 Abort 是用户取消或生命周期控制，通常不展示“网络异常”或自动重试；超时、中断和服务端拒绝应保留可区分的原因。
- 示例：保存表单失败保留用户输入；刷新列表失败保留旧数据并显示局部重试；首次加载失败显示空状态和重试入口。

### 追问

- **局部与全局错误怎么分界？** 能就近恢复的放局部（列表、表单），影响整页渲染的交给路由级边界。
- **怎样减少重复上报？** 在数据层统一转换错误类型，避免同一问题在多层各报一次。

参考：[Fetch Standard](https://fetch.spec.whatwg.org/#fetch-method)、[React Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)。

</details>

---

## 114. 如何从零分析一次 React 页面卡顿？

<!-- question: {"category":"architecture","type":"scenario","difficulty":"advanced","tags":["系统设计","React"],"estimatedMinutes":8} -->

一个 React 页面在输入和展开大列表时明显卡顿。请说明复现条件、工具归因、优化假设与如何证明改动有效。

<details>
<summary>展开参考答案与解析</summary>

先复现并量化，再定位瓶颈层级，最后"单一假设 → 修改 → 同条件复测"。核心是不靠猜，也不靠一次样本下结论。

### 设计框架

1. 明确用户操作、数据规模、设备、网络与构建模式。开发模式可用于初步定位，性能结论应在生产行为或专用 profiling 构建下复测。
2. 用 Performance 面板定位长任务、style/layout/paint 与请求瀑布；用 React DevTools/Profiler 看组件 render 成本及重复工作。Profiler 的 actualDuration 是渲染耗时，不能当成浏览器完整布局绘制或仅 commit 耗时。
3. 判断瓶颈属于哪一层：JS 计算、组件渲染次数、DOM 数量、布局绘制，还是请求瀑布。
4. 提出**单一主要假设**，只改这一处。
5. 同条件复测，报告 p50/p95 或多次结果，不要挑最好的一次（见第 68 题）。
6. 记录副作用：包体积、内存、可访问性、代码复杂度。

### 边界与易错点

- React 开发模式和 Strict Mode 检查有额外开销；普通生产构建默认不启用 Profiler 测量，必要时使用官方 profiling 构建，再以接近真实生产的浏览器 trace 校验。
- 只看"渲染次数"会误判：渲染便宜时次数多不是问题（见第 65 题）。
- 卡顿可能根本不在 React：第三方脚本、埋点、同步存储读写、大数组计算都会制造长任务。
- 优化后要回归功能正确性，性能改动是最容易引入 bug 的一类改动。
- 结论必须包含复现条件与数据，否则无法被他人验证。

- 输入延迟、事件处理和呈现延迟分别归因；INP 不等于 handler 执行时间。先确认同一次操作及同一数据量，再决定切分计算、虚拟化列表、稳定订阅或减少同步布局。
- Worker 适合可序列化计算，虚拟化减少 DOM，memo 降低重复 render；三者处理不同瓶颈，不能一次全加后无法归因。

### 追问

- **怎么定位 INP 问题？** 关注交互到下一帧的耗时、事件处理时长与长任务，而不只是首屏指标（见第 136 题）。
- **什么时候怀疑 React 渲染？** Profiler 显示交互涉及的组件 actualDuration 较高，且浏览器 trace 对应 render 工作；若 React render 很短而 layout/paint 很长，应优先查 DOM 和 CSS。

参考：[React Profiler](https://react.dev/reference/react/Profiler)、[Optimize INP](https://web.dev/articles/optimize-inp)。

</details>

---

## 115. 如何设计前端项目目录和模块边界？

<!-- question: {"category":"architecture","type":"scenario","difficulty":"advanced","tags":["系统设计","模块"],"estimatedMinutes":8} -->

随着业务增长，多个页面开始相互导入内部实现且共享目录膨胀。请设计模块边界和依赖规则，并说明何时值得拆包或使用 monorepo。

<details>
<summary>展开参考答案与解析</summary>

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

- 例子：`app → features/orders → shared`；订单模块只暴露页面、用例与公共类型，上层协调订单和支付，避免 `shared → orders` 及业务模块互相穿透内部目录。
- 公共入口不等于把所有文件 re-export；需要保持稳定契约，并对循环依赖、跨层导入和服务端专用代码进入浏览器设检查。
- TypeScript path alias 只改变解析/书写方式，不自动建立模块封装或禁止越界导入。

### 追问

- **什么时候值得引入 monorepo？** 多应用/包共享代码、统一工具链或需要跨包原子改动时再评估；不要求所有包独立发布，也不应仅为目录整齐引入（见第 143 题）。
- **怎么判断边界错了？** 常见信号是改动频繁跨多个目录、出现循环依赖、以及模块无法独立测试。

参考：[Turborepo Structuring a repository](https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository)。

</details>

---

# 第七部分：现代 React、浏览器性能与工程化扩展题

以下 35 道题（编号 116–150）为扩展题，聚焦现代 React 特性、浏览器与网络性能、以及工程化实践，结构与本库其余题目一致。

## 116. React 的优先级（lane）模型如何影响更新调度？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","并发"],"estimatedMinutes":8} -->

请说明 React 内部的优先级模型与"可中断渲染"的关系，以及它如何解释 transition 与紧急更新共存时的行为。

<details>
<summary>展开参考答案与解析</summary>

React 用按位表示的**lane 集合**给每个更新打上优先级标记，调度器据此决定先渲染哪一批、进行中的低优先级渲染能否被更高优先级的更新打断。它是内部实现机制而非公开 API，但决定了 transition 与紧急更新共存时的可观察行为。

### 原理与示例

- 每个更新被分配到某个 lane（如离散输入、默认、transition），同一 lane 的更新可以在一次渲染中合并处理。
- 高优先级工作就绪时，进行中的低优先级渲染会被打断并重做，从而不让输入被阻塞（见第 55 题）。
- `useTransition`、`useDeferredValue` 本质是把更新分配到较低优先级的 lane；`flushSync` 则要求同步完成。
- 一次 render 可选择多个 lane；集合选择、关联和过期影响共同处理范围。不能把同 lane 当唯一批处理条件，也不能说不同 lane 绝不一起提交（见第 34 题）。

### 边界与易错点

- lane 的具体名称与位数属于实现细节，会随版本变化，不要背数值。
- "优先级"不等于抢占式多线程：主线程 React 工作采用协作调度，通常在 Fiber 单元间让出执行权；不抢占正在执行的长组件函数或循环。
- 低优先级工作可能推迟/重试，内部也有防长期饥饿策略；反馈用 isPending 等 API，不依赖具体 lane 超时数值。
- 不要用它解释所有现象：DOM 更新、Effect 顺序、事件批处理仍各有规则。

### 追问

- **为什么 commit 不能被打断？** 中断会让 DOM 停在中间态，对用户可见且无法回滚（见第 30 题）。
- **什么时候必须用 `flushSync`？** 需要在提交后立刻读取布局结果且无法用 Effect 表达时；代价是放弃批处理与可中断性。

资料来源：[React 19.3 官方源码（实现细节）](https://github.com/facebook/react/blob/v19.3.0/packages/react-reconciler/src/ReactFiberLane.js)。

</details>

---

## 117. `use()` 能读取什么？它和 Hooks 调用规则有什么不同？

<!-- question: {"category":"react","type":"theory","difficulty":"advanced","tags":["React","Suspense"],"estimatedMinutes":8} -->

请说明 use 可以读取的资源、pending/rejection 的边界处理、条件调用规则，以及为什么客户端 render 中不能不断创建未缓存的 Promise。

<details>
<summary>展开参考答案与解析</summary>

`use` 可以读取 Promise 与 Context，并且支持在条件与循环中调用——这是 use 的公开调用规则例外，不应依赖“所有资源不占内部槽位”推导其他 API。

### 原理与示例

```jsx
function Comments({ commentsPromise }) {
  const comments = use(commentsPromise) // pending 时挂起到最近的 Suspense
  return <ul>{comments.map((item) => <li key={item.id}>{item.text}</li>)}</ul>
}
```

- `use(Promise)` 在 pending 时抛出（挂起），由最近的 Suspense 边界展示 fallback，resolve 后重新渲染。
- `use(Context)` 等价于读取 Context，但可以在条件分支中使用。
- Promise 必须来自**稳定来源**（例如服务端组件传入，或框架/数据层按资源 key 缓存），否则每次 render 新建 Promise 会导致反复挂起。

### 边界与易错点

- use 不放 try/catch；pending 交 Suspense、reject 交 Error Boundary，或对 Promise 明确 catch 返回降级数据。服务器支持 async/await，适合 await 的流程不必强换 use。

- 不能在组件外调用；输入只支持 Promise 与 Context，不是"任意异步都能用"。
- 它不改变其他 Hooks 的顺序约束（见第 38 题），不能作为放宽调用规则的理由。
- 在客户端组件里写 `use(fetch(...))` 是典型误用：每次 render 都会新建 Promise 并反复挂起。
- 失败仍需要 Error Boundary；Suspense 只负责"未就绪"（见第 57 题）。

### 追问

- **相比 Effect + state 的优势？** 把加载态交给边界统一处理，避免每个组件维护 `isLoading`/`data`/`error` 三元状态。
- **SSR 下有什么不同？** 依赖框架的流式与序列化能力，不能假设与纯客户端一致。

资料来源：[React 官方文档](https://react.dev/reference/react/use)。

</details>

---

## 118. React 19 中把 ref 作为普通 prop 传递解决了什么问题？

<!-- question: {"category":"react","type":"theory","difficulty":"intermediate","tags":["React"],"estimatedMinutes":5} -->

请比较 React 18 的 forwardRef 与 React 19 的 ref prop 写法，说明 props 展开透传、class 组件、类型声明和 callback ref 清理的边界。

<details>
<summary>展开参考答案与解析</summary>

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

- class ref 仍指向实例。类型包需匹配版本；callback ref 只返回 cleanup 或 undefined，避免隐式返回赋值表达式的节点。

- 19 的函数组件 ref 在 props 中；未解构时 `<input {...props} />` 可以透传。解构 `{ ref, ...props }` 后剩余 props 排除了 ref，才需显式传回。key 仍不在 props。
- 同时支持 18/19 的库不能依赖新写法，仍需评估是否保留 `forwardRef`。
- 自定义组件接收 ref 意味着"把 ref 交给某个内部节点"，要明确是根节点还是特定子节点。
- 与 Server Component 交互时，ref 只能在客户端组件边界内使用。

### 追问

- **为什么以前需要 `forwardRef`？** 早期实现中 `ref` 是特殊字段，不进入 props，只能通过专门 API 透传。
- **要不要做迁移？** 新代码可用新写法；存量代码取决于类型声明与依赖库兼容性。

资料来源：[React 官方文档](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)。

</details>

---

## 119. `useOptimistic` 的失败回滚应该怎么设计？

<!-- question: {"category":"react","type":"scenario","difficulty":"advanced","tags":["React","乐观更新"],"estimatedMinutes":8} -->

乐观更新让界面在请求完成前先呈现预期结果。请说明它的适用范围，以及失败时回滚方案应该包含哪些内容。

<details>
<summary>展开参考答案与解析</summary>

useOptimistic 管理 Action 期间的临时视图，结束后以当前基准状态为准。失败时基准未更新，乐观项会消失；错误、输入保留、重试、缓存与冲突策略仍由应用负责。

### 原理与示例

```jsx
const [optimisticItems, addOptimistic] = useOptimistic(
  items,
  (current, item) => [...current, item],
)

async function submitAction(formData) {
  const name = String(formData.get('name') ?? '').trim()
  const clientId = crypto.randomUUID()
  addOptimistic({ clientId, name, pending: true })
  try {
    const saved = await createItem({ clientId, name })
    startTransition(() => {
      setItems(current => [...current, { ...saved, clientId, pending: false }])
    })
  } catch (error) {
    setError(error)
    // 输入若需保留，由受控草稿持有
  }
}

<form action={submitAction}>
  {/* input 与按钮省略；列表使用 clientId 保持对应身份 */}
</form>
```

form function action 提供 Action 上下文；普通 onClick 发起时用 startTransition。items/setItems 是示意基准，createItem 是示意接口。

### 边界与易错点

- 临时 id 不能固定为 temp，否则并发项 key 冲突；成功对应真实 id，重取需一致合并规则。
- reducer 要纯净并基于最新基准重算；失败不能恢复整张旧列表，否则覆盖另一成功操作。
- Action 结束就结束临时状态；成功更新基准，失败提示并保留草稿。超时未知仍需幂等/结果查询。
- 高风险操作可展示 pending，但不宣称未确认支付/扣库存已完成。
- 稳定 key 不替代缓存精确更新、失效和重取策略。

### 追问

- **自动回滚到什么？** 最新传入的基准，不是数据库事务回滚，也不保证回到启动时旧快照。
- **并发失败怎么处理？** 逐操作维护身份和结果，按基准及待处理操作重算，避免覆盖整份缓存。

资料来源：[React 官方文档](https://react.dev/reference/react/useOptimistic)。

</details>

---

## 120. Server Component 与 Client Component 的边界应该如何划分？

<!-- question: {"category":"react","type":"scenario","difficulty":"advanced","tags":["React","RSC"],"estimatedMinutes":8} -->

一个页面包含数据查询、富文本内容、可交互表单与权限控制。请设计 Server/Client Component 边界，解释模块导入图、children 组合和跨边界序列化。

<details>
<summary>展开参考答案与解析</summary>

按"是否需要浏览器能力"划分：需要 state、Effect、事件与 DOM API 的是 Client Component，适合数据/内容渲染的部分可留在 Server Component；边界越贴近叶子交互，进入客户端 bundle 的代码越少。

### 设计框架

- 数据获取尽量放在 Server Component，靠近数据源，避免客户端请求瀑布。
- 交互点（按钮、输入、拖拽）抽成 Client Component，需要的可序列化数据通过 props 传入。
- 不要在 Server Component 里写兜底的客户端分支，也不要为了"省事"把整页标成客户端组件。
- 跨边界 props 必须可序列化：按 RSC 协议：Date/Map/Set/Promise/JSX 与 Symbol.for 注册 Symbol 等支持；普通函数、自定义类实例和未注册 Symbol 不支持，Server Function 传引用。

### 边界与易错点

- 跨边界数据最小化，避免把私密数据库记录整体传出；服务端运行不替代鉴权和输出字段筛选。按框架约定阻止专属模块误入 bundle。

- use client 影响模块导入图；不能普通导入服务器专属代码到客户端，但服务端父级可把已构造 Server Component JSX 作为 children 传入客户端包装。
- 加载与错误要分类型处理：服务端数据错误与客户端交互错误不是一类问题（见第 26 题）。
- 权限与租户校验必须在服务端完成，不能靠在客户端隐藏入口（见第 108 题）。
- 与 SSR 不是同一件事：Client Component 同样会被服务端渲染出首屏 HTML（见第 60 题）。
- 缓存与失效策略要显式设计，否则"服务端数据"会变成难以追踪的隐式全局状态。

### 追问

- **静态内容不该用 RSC 吗？** 构建时 RSC 可减少客户端依赖；无工具支持或具体收益的纯客户端应用通常不必引入。
- **怎么验证边界合理？** 看客户端 bundle 里还剩多少业务代码，以及客户端组件是否只承担交互。

资料来源：[React 官方文档](https://react.dev/reference/rsc/use-client)。

</details>

---

## 121. Server Action 与普通 API 请求相比有哪些取舍？

<!-- question: {"category":"react","type":"scenario","difficulty":"advanced","tags":["React","RSC"],"estimatedMinutes":8} -->

请比较 Server Action/Server Function 与显式 HTTP API 在提交、错误处理、鉴权、缓存失效、跨端复用和可观测性上的取舍。

<details>
<summary>展开参考答案与解析</summary>

Server Action 把"提交"变成一次由框架管理序列化的服务端调用，减少本应用接口胶水并协调 pending；业务错误/验证/缓存仍需设计。取舍主要在框架协议绑定和跨端契约，可观测性不必然更差。

### 原理与示例

- 表单可以直接 `action={serverAction}`，React/框架提供提交协调，pending 用 useActionState/useFormStatus 读取，业务结果与缓存刷新仍需设计；配合 `useActionState` 还能拿到返回值（见第 61 题）。
- 它**本质仍是网络调用**：一样会失败、超时、被篡改，也必须在服务端做鉴权与校验。

### 边界与易错点

- 当前称可调用的服务端函数为 Server Function，作为 Action 时称 Server Action。use server 不让函数私有；每次验证身份、租户、权限和资源 id，不能信任客户端入参。

- Server Action 是对外公开入口，不能因为"只在本应用内调用"就信任入参；鉴权、参数校验与幂等控制一个都不能少（见第 72 题）。
- 不适合给移动端或其他服务复用：它没有稳定的 HTTP 契约，跨端复用成本高。
- 可观测性依赖框架/部署集成；显式 API 也需关联请求 id、耗时、错误和后端调用（见第 150 题）。
- 它不解决跨页面数据一致性，缓存失效仍要自己设计。
- 部署形态要确认：某些网关/CDN 配置下 Action 路由需要额外支持。

### 追问

- **什么时候优先用普通 API？** 需要跨端复用、需要独立版本管理，或团队已有成熟接口层时。
- **混用怎么分工？** 面向本应用的写操作可用 Action，对外能力与复杂接口仍走显式 API。

资料来源：[React 官方文档](https://react.dev/reference/rsc/server-functions)。

</details>

---

## 122. Transition 与 Suspense 配合时，如何设计内容的 reveal 顺序？

<!-- question: {"category":"react","type":"scenario","difficulty":"advanced","tags":["React","Suspense"],"estimatedMinutes":8} -->

页面已有内容，切换筛选后部分区域需要重新等待数据。请设计 Suspense 的 reveal 粒度与 Transition 反馈，并说明首次显示和新实体导航的差别。

<details>
<summary>展开参考答案与解析</summary>

目标是让**已经展示的内容保留到新内容就绪**，避免整块被 fallback 替换；做法是按产品展示单元划分 Suspense，并用 transition 让更新可中断、可延后。

### 设计框架

- 边界粒度决定体验：同一边界整体等待，嵌套边界逐区揭示；过细会碎片化，过粗阻塞不相关快内容。
- 用 `startTransition` 或 `useDeferredValue` 把数据更新标记为非紧急，从而允许 React 在新内容就绪前保留旧内容（见第 55、56 题）。
- 给"正在更新"设计低干扰反馈（顶部进度条、区域变淡），而不是全屏 loading。
- 首屏与后续切换分开设计：首屏可以接受骨架屏，后续切换应尽量保留旧内容。

### 边界与易错点

- transition 避免已显示边界被隐藏，新挂载/重置边界仍可 fallback；另一实体导航可用实体 key 重置等待语义，不能无限保留不相关旧内容。

- 没有 Suspense 边界时，挂起会冒泡到最近边界，容易出现"一闪全屏"。
- 边界内的失败要配 Error Boundary，否则会波及更大范围（见第 53 题）。
- 过早显示骨架屏会让用户感觉更慢；骨架屏应贴近最终布局以减少 CLS（见第 137 题）。
- reveal 顺序受数据依赖影响：先等慢数据再渲染快数据，等于浪费已就绪的部分。

### 追问

- **怎样避免"看到的内容又消失"？** 把变化限制在小边界内，并用 transition 保持旧内容直到新内容准备好。
- **SSR 场景有什么不同？** 流式渲染下边界划分直接影响首屏可交互时间（见第 59 题）。

资料来源：[React 官方文档](https://react.dev/reference/react/Suspense)。

</details>

---

## 123. 如何定位组件频繁重渲染？

<!-- question: {"category":"react","type":"debugging","difficulty":"intermediate","tags":["React","性能"],"estimatedMinutes":8} -->

某页面在输入时会频繁重渲染。请给出定位步骤，并说明在什么条件下才应该使用 `memo`。

<details>
<summary>展开参考答案与解析</summary>

先用 Profiler 确认"谁在渲染、为什么渲染、代价多大"，再按"状态位置 → 订阅范围 → props 稳定性 → memo"的顺序处理。

### 排查步骤

1. 用 React DevTools Profiler 录制一次具体交互，只关注这次交互产生的提交。
2. 找出 render 计算昂贵、频繁提交或导致布局/绘制昂贵的区域，区分是"函数执行便宜"还是"DOM 操作昂贵"。
3. 检查状态位置：高频状态是否放在过高层级（见第 71 题）。
4. 检查订阅范围：Context 粒度过粗或 selector 过宽（见第 48 题）。
5. 检查 props 稳定性：对象/函数每次新建导致 `memo` 失效（见第 47 题）。
6. 只在有测量证据时加 memo，并用相同条件复测。

### 边界与易错点

- actualDuration 是该次 render 时间，不是 DOM commit 的精确耗时；布局/绘制结合浏览器 Performance。Highlight updates 看范围，不证明耗时瓶颈。

- "渲染次数多"不等于性能问题：渲染便宜时次数多也可能无妨（见第 65 题）。
- 开发版定位原因，耗时用生产 Performance 或专用 profiling 构建；普通生产默认关闭 Profiler，不能直接要求用它录制（见第 45 题）。
- 不要用 `console.log` 代替 Profiler：它自身影响性能且没有耗时分布。
- 过度 memo 会让依赖关系难维护，收益可能微乎其微。

### 追问

- **组件为什么"无缘无故"重渲染？** 常见原因是父级状态位置过高、Context 变化、或 props 中存在每次新建的值。
- **定位到之后先改哪个？** 先动结构与订阅范围，memo 放最后。

资料来源：[React 官方文档](https://react.dev/reference/react/Profiler)。

</details>

---

## 124. 修复 Context 造成的整页重渲染

<!-- question: {"category":"react","type":"debugging","difficulty":"advanced","tags":["React","Context"],"estimatedMinutes":8} -->

一个 Provider 同时提供主题与用户信息，且 `value` 每次都新建对象；输入框每次按键都会让整页重渲染。请给出诊断与修复方案。

<details>
<summary>展开参考答案与解析</summary>

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

- 输入导致普通父级 render 也会更新子组件，未必全是 Context。稳定 value 只消除 Context 通知；user 原地修改且引用不变又可能漏更新。

- `setTheme` 本身引用稳定，但包进新对象后 value 仍然每次都变，可 useMemo 稳定对象，也可传原始值或稳定状态引用，并非所有 value 都须 memo。
- 只 memo value 而不拆分 Context，用户信息变化仍会让主题消费者重渲染（见第 48 题）。
- 消费者只需要"按字段订阅"时，可拆 Context、外层消费者 + memo 子组件，复杂时再评估 selector 外部 store（见第 54 题）。
- 拆分有成本：provider 嵌套变深、API 变多，要评估是否值得。

### 追问

- **怎么证明修好了？** 用 Profiler 对比同一次输入触发的提交范围与耗时。
- **状态下沉能替代拆分吗？** 很多时候可以，而且更简单（见第 71 题）。

资料来源：[React 官方文档](https://react.dev/reference/react/useContext)。

</details>

---

## 125. 实现 `useMediaQuery`

<!-- question: {"category":"react","type":"coding","difficulty":"intermediate","tags":["React","Hook"],"estimatedMinutes":10} -->

实现 `useMediaQuery(query)`，返回媒体查询匹配布尔值；query 改变时重新订阅，普通重渲染不反复退订。SSR 与首次 hydration 都使用 false 快照，之后按客户端真实值纠正。以支持 MediaQueryList.addEventListener 的现代浏览器为范围。

<details>
<summary>展开参考答案与解析</summary>

媒体查询是 React 外部可变数据，用 useSyncExternalStore 读取/订阅，并缓存同一个 MediaQueryList 与订阅函数。false 是确定性的服务端快照，不代表服务器能推断用户视口。

### 参考实现

```jsx
import { useCallback, useMemo, useSyncExternalStore } from 'react'

const getServerMediaSnapshot = () => false

function useMediaQuery(query) {
  const list = useMemo(
    () => typeof window === 'undefined' ? null : window.matchMedia(query),
    [query],
  )
  const subscribe = useCallback((notify) => {
    if (!list) return () => {}
    list.addEventListener('change', notify)
    return () => list.removeEventListener('change', notify)
  }, [list])
  const getSnapshot = useCallback(() => list?.matches ?? false, [list])
  return useSyncExternalStore(subscribe, getSnapshot, getServerMediaSnapshot)
}
```

### 边界与易错点

- getSnapshot 返回布尔原始值，未变化时天然稳定；subscribe 引用稳定避免每次 render 重订阅，query 变化才替换 list。[React 外部订阅协议](https://react.dev/reference/react/useSyncExternalStore)
- SSR 不访问 window；hydration 先用同一服务端快照，随后客户端更新可能产生布局变化。响应式布局优先 CSS，不能承诺这一 Hook 完全消除首屏闪烁。
- matchMedia 返回的 MediaQueryList 会反映当前状态，change 事件表示匹配状态改变，不是每一次 resize 都回调。[CSSOM View matchMedia](https://drafts.csswg.org/cssom-view/#dom-window-matchmedia)
- 老环境只支持 addListener/removeListener 时需要配套适配；仅 mock window.matchMedia 不等于浏览器支持已验证。

### 追问

- **useState + Effect 一定错误吗？** 不一定，正确实现也能工作；但需要自行处理初始值、订阅窗口与 SSR 一致性，此 API 更直接表达外部 store。
- **能用请求头推断断点吗？** 可以选择近似服务端快照，但必须序列化给客户端 hydration 使用同一值，并考虑设备推断误差。

</details>

---

## 126. 实现 `useIntersectionObserver`

<!-- question: {"category":"react","type":"coding","difficulty":"intermediate","tags":["React","Hook"],"estimatedMinutes":10} -->

实现 `useIntersectionObserver(options, onChange)`，返回可直接传给 JSX ref 的 callback ref。目标元素条件挂载或替换时正确更换观察目标；回调读取最近提交的逻辑，卸载释放观察器。options 支持 root、rootMargin、threshold（合法有限数或数数组）；相同内容的 threshold 数组不应导致每次 render 重建。

<details>
<summary>展开参考答案与解析</summary>

不要仅把稳定 ref 对象放入 Effect 依赖：ref.current 变化不会触发 render。用 callback ref 把实际节点写入 state，节点与观察配置变化时重建 observer，最新回调通过第 99 题 useLatest 转发。

### 参考实现

以下复用第 99 题的 `useLatest`。

```jsx
import { useEffect, useState } from 'react'

function useIntersectionObserver(options = {}, onChange) {
  const [node, setNode] = useState(null)
  const callbackRef = useLatest(onChange)
  const { root = null, rootMargin = '0px', threshold = 0 } = options
  const thresholdKey = JSON.stringify(threshold)

  useEffect(() => {
    if (!node || typeof IntersectionObserver === 'undefined') return
    let active = true
    const observer = new IntersectionObserver((entries) => {
      if (active) callbackRef.current?.(entries, observer)
    }, { root, rootMargin, threshold: JSON.parse(thresholdKey) })
    observer.observe(node)
    return () => {
      active = false
      observer.disconnect()
    }
  }, [node, root, rootMargin, thresholdKey, callbackRef])
  return setNode
}
```

以下用法片段位于组件内部，在顶层调用 Hook：

```jsx
const observeRef = useIntersectionObserver({ threshold: [0, 0.5] }, (entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) reportVisible(entry.target)
  }
})
// 返回 JSX 时使用 <div ref={observeRef}>...</div>
```

### 边界与易错点

- thresholdKey 按数字内容稳定；输入契约限制为合法有限数，不能把 NaN/Infinity 序列化为 null 当作合法阈值。配置改变会重新观察并产生新的初始条目。
- observer 回调包含初始/阈值/相交状态变化条目，并非“只在进入视口时调用”。isIntersecting 为 true 也可能仅边缘相接、面积为 0；曝光比例需另查 intersectionRatio。[Intersection Observer 规范](https://w3c.github.io/IntersectionObserver/)
- disconnect 不替代业务失效标记；已排队旧回调也要通过 active 忽略。一次性加载可在 onChange 中使用传入 observer.unobserve(entry.target)。
- API 不受支持时示例不观察，产品需要定义 fallback；相交不等于视觉未被遮挡，更不等于用户已阅读。
- 若必须保留 `useIntersectionObserver(ref, ...)` 旧签名，需要另提供响应式 node/version，不能指望 `[ref.current]` 自行触发更新。

### 追问

- **图片懒加载何时需要 observer？** 原生 loading="lazy" 可满足基础场景；自定义曝光比例、分页哨兵或特殊占位流程才需额外观察。
- **为什么不在 render 时 observe？** 它是外部副作用，且 DOM 节点在提交后才确定；Effect/callback ref 生命周期才适合管理。

</details>

---

## 127. 实现 `useEventCallback`（稳定引用 + 读取最新值）

<!-- question: {"category":"react","type":"coding","difficulty":"intermediate","tags":["React","Hook"],"estimatedMinutes":10} -->

实现 `useEventCallback(fn)`：返回函数在同一挂载实例中引用稳定，浏览器事件或异步订阅调用时执行最近一次已提交的 fn，保留调用实参和 this。不要在 render 中更新 ref，也不承诺供 render、ref callback 或子组件更早的 layout Effect 调用。

<details>
<summary>展开参考答案与解析</summary>

把稳定 wrapper 与可变实现分开：第 99 题 useLatest 在提交后更新 fn ref，useCallback 只创建稳定转发函数。不能把未提交 render 的实现写入共享 ref，也不能把 Effect Event 当成可传子组件的通用稳定 callback。

### 参考实现

以下复用第 99 题的 `useLatest`。

```jsx
import { useCallback } from 'react'

function useEventCallback(fn) {
  const fnRef = useLatest(fn)
  return useCallback(function (...args) {
    return fnRef.current.apply(this, args)
  }, [fnRef])
}
```

### 边界与易错点

- fnRef 身份稳定，因此 wrapper 不随 fn 变化而变化；普通函数转发 this，返回值或异常原样传播。最近值指最近提交，不是 setState 后立刻得到新值。
- 外部订阅需正确退订；稳定 callback 不会自动解决卸载、请求取消或保留旧订阅造成的泄漏。
- 不用这种包装隐藏应该触发 Effect 重建的参数。若 roomId 变化必须重新连接，它仍需是依赖，不能因读取“最新”而忽略同步需求。
- 当前 React useEffectEvent 用于 Effect 发起的非响应式事件，只能按其规定位置调用，不能传给子组件或其他 Hook；官方也不承诺其返回函数身份稳定。[React useEffectEvent](https://react.dev/reference/react/useEffectEvent)
- render 期间读写 ref 违背 React 纯度规则；在提前执行的子组件 layout Effect/ref callback 中也不能保证父组件 ref 已更新，见第 99 题。

### 追问

- **useCallback(fn, 完整依赖) 不可以吗？** 可以且常更清晰；它会随逻辑依赖改变身份，本题额外要求稳定身份才需要转发。
- **传给 memo 子组件就一定更快吗？** 不一定，还要其他 props 稳定且重渲染确实有成本；稳定 callback 是性能条件之一，不是自动加速保证。

</details>

---

## 128. 实现可取消的异步请求 Hook

<!-- question: {"category":"react","type":"coding","difficulty":"advanced","tags":["React","请求"],"estimatedMinutes":10} -->

实现可取消 `useAsync(asyncFn)`，asyncFn 接收 `{ signal }`，可同步返回/抛错或返回 Promise。asyncFn 身份变化时重新请求，cleanup 取消并忽略旧结果；只有本轮有效结果写状态，卸载后不写状态。调用方用 useCallback 明确列出请求参数依赖，避免由 Hook 接收不可静态检查的任意 deps 数组。

<details>
<summary>展开参考答案与解析</summary>

Effect 依赖 asyncFn，调用方以完整依赖的 useCallback 表达请求输入。每轮局部 active 和 controller 同时防护：active 管结果有效性，signal 尽力取消；在 async try/catch 中调用任务，覆盖同步抛错和 Promise rejection。

### 参考实现

```jsx
import { useCallback, useEffect, useState } from 'react'

function useAsync(asyncFn) {
  const [result, setResult] = useState(() => ({
    task: asyncFn, state: { status: 'loading' },
  }))
  useEffect(() => {
    const controller = new AbortController()
    let active = true
    setResult({ task: asyncFn, state: { status: 'loading' } })
    const commit = (state) => {
      if (active && !controller.signal.aborted) setResult({ task: asyncFn, state })
    }

    async function execute() {
      try {
        const data = await asyncFn({ signal: controller.signal })
        commit({ status: 'success', data })
      } catch (error) {
        commit({ status: 'error', error })
      }
    }
    void execute()
    return () => {
      active = false
      controller.abort()
    }
  }, [asyncFn])
  return result.task === asyncFn ? result.state : { status: 'loading' }
}
```

以下用法片段位于组件内部，在顶层调用 Hook：

```jsx
const loadUser = useCallback(async ({ signal }) => {
  const response = await fetch(`/api/users/${encodeURIComponent(userId)}`, { signal })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}, [userId])
const state = useAsync(loadUser)
```

### 边界与易错点

- 直接传每次 render 新建的 asyncFn，会因 setState→render→新 fn 反复请求；调用方必须稳定函数且保留完整参数依赖。原 `useAsync(asyncFn, deps)` 让异步函数捕获值与外部 deps 分离，容易漏依赖，不作为本题推荐签名。
- 依赖数组不是要求“数组引用稳定”，React 比较其中各项；但项数必须固定。仅传入动态 deps 难以静态校验引用的响应式值。[React useEffect 依赖约定](https://react.dev/reference/react/useEffect#parameters)
- 卸载也先 active=false 再 abort；仅比较 requestId 而不在卸载时失效，会让忽略取消的旧任务继续尝试 setState。局部 active 已足够隔离各轮，不必额外堆叠全局 requestId。
- signal.reason 可为任意值，本实现按自己 signal 的取消状态忽略，而非直接访问 error.name。task 自行抛出的 AbortError 若不是本轮 cleanup 取消，仍是当前错误，需要显式错误策略。
- 用 task 标记隐藏新参数 render 到 Effect setup 之间的旧状态。不会缓存、去重、在 SSR 请求或撤销服务端副作用；这些需求由数据层扩展。

### 追问

- **task 不支持取消怎么办？** 它仍可运行，active 阻止迟到成功或失败写状态；如果永不完成，组件无法强制结束它。
- **怎么验证？** 覆盖同步 throw、旧请求先/后成功与拒绝、快速依赖切换、卸载后 settle、Strict Mode 重复 setup/cleanup。

</details>

---

## 129. 设计一个虚拟列表方案

<!-- question: {"category":"react","type":"scenario","difficulty":"advanced","tags":["React","性能"],"estimatedMinutes":8} -->

页面需要展示上万行数据。请说明虚拟列表的设计要点，以及它带来的代价。

<details>
<summary>展开参考答案与解析</summary>

虚拟列表的核心是"只渲染可视区域 + 少量缓冲"，难点在滚动位置、动态高度与可访问性，而不在 React 本身。

### 设计框架

1. 固定行高时用"滚动偏移 ÷ 行高"直接计算可视区间，并用一个撑高的占位容器维持滚动条。
2. 可整体偏移窗口，也可逐项 absolute + transform；均为常见实现，关键是稳定尺寸、批量测量和避免同步读写布局。
3. 上下各预留几行缓冲，减少快速滚动时的白屏。
4. 动态高度需要测量并缓存每项高度，配合累计偏移表与二分查找定位起点。
5. 保持 `key` 稳定；"回到顶部"、锚点定位等交互要单独设计。

### 边界与易错点

- 固定行高 h、滚动 s、视口 v、缓冲 b：start=max(0,floor(s/h)-b)，end=min(n,ceil((s+v)/h)+b)，end 为开区间；总高 n*h，窗口偏移 start*h。卸载行会丢本地 state，需保留草稿按 id 存窗口外。

- 动态高度下滚动位置容易跳动：需要锚定当前可见项并补偿偏移量。
- 可访问性会受影响：屏幕阅读器与键盘导航看不到未渲染内容，需要补充语义与跳转手段。
- 浏览器内查找（Ctrl+F）与打印无法覆盖未渲染内容，必要时应提供"渲染全部/导出"入口。
- 行高变化（字体加载、图片加载）会让已有测量失效，需要重新计算并保持稳定。
- 数据量不是唯一判据：交互简单时，分页可能更省事（见第 68 题）。

### 追问

- **什么时候不该虚拟化？** 列表不长、需要浏览器内查找，或打印/导出是核心场景时。
- **怎么验证效果？** 对比 DOM 节点数、长任务时长与滚动帧率，而不是只看"感觉变快"。

资料来源：[TanStack Virtual Virtualizer](https://tanstack.com/virtual/latest/docs/api/virtualizer)。

</details>

---

## 130. 如何让全局状态与 URL 保持一致？

<!-- question: {"category":"react","type":"scenario","difficulty":"intermediate","tags":["React","状态"],"estimatedMinutes":8} -->

列表页包含筛选、分页、排序与弹窗状态。请说明哪些状态应该放进 URL，以及如何避免双向同步问题。

<details>
<summary>展开参考答案与解析</summary>

把"可分享、可恢复、与导航相关"的状态交给 URL，其余留在组件或全局 store；关键是确定唯一权威来源，避免双向同步。

### 设计框架

- 筛选条件、分页、排序、当前 tab 放 URL（路径参数或 query），从而支持分享、刷新保留与前进后退。
- 组件从 URL 读取并派生出实际查询条件；用户操作通过**导航**更新 URL，而不是先写 state 再同步。
- 临时开关/草稿通常留本地；可分享详情/编辑弹窗可由路由表达。敏感或未提交内容不默认放 URL。
- 少数需要跨页面共享的状态放全局 store，但不要把它当作 URL 的镜像（见第 70 题）。

### 边界与易错点

- 路由 API 原子更新相关参数，如筛选改变同时重置 page。HashRouter 的路由路径/query 在 fragment，应交路由器解析，不能把 window.location.search 当视图 query。

- 双向同步（URL → state → URL）极易产生循环更新与历史记录污染，例如每次按键都 push 一条历史。
- 高频输入（搜索框）通常先用本地 state，防抖期间可 replace，提交/语义导航按需求 push；前进后退时协调尚未提交输入与新 URL 视图。
- URL 参数是不可信输入：必须校验并给默认值，非法值应回退而不是崩溃（见第 78 题）。
- 序列化要稳定：对象键顺序、数组编码方式变化会导致"看起来一样的 URL 不相等"。
- SSR 场景下服务端也要能解析同一套参数，避免首屏与客户端不一致。

### 追问

- **什么不该进 URL？** 敏感信息、体积过大的数据，以及纯 UI 的瞬时状态。
- **怎么判断放对位置了？** 把 URL 复制给同事能还原同样的视图，就算放对了。

资料来源：[React Router useSearchParams](https://reactrouter.com/api/hooks/useSearchParams)。

</details>

---

## 131. HTML、静态资源与接口的缓存策略应如何分别设计？

<!-- question: {"category":"browser","type":"theory","difficulty":"intermediate","tags":["浏览器","缓存"],"estimatedMinutes":5} -->

给 HTML、内容 hash 的 JS/CSS、公开接口和登录后私有接口分别制定缓存策略，并说明 CDN、应用缓存和旧 chunk 发布兼容的风险。

<details>
<summary>展开参考答案与解析</summary>

缓存策略取决于内容是否可共享、多久允许陈旧和是否有可版本化 URL。常见组合是内容 hash 资源长缓存、HTML 复用前验证、公开接口按容忍度缓存、私有数据显式隔离。HTTP cache、Service Worker Cache Storage、应用内缓存和 bfcache 是不同层。

### 原理与示例

| 内容 | 示例策略 | 前提 |
| --- | --- | --- |
| hash JS/CSS | `public, max-age=31536000, immutable` | 同一 URL 内容不再修改 |
| 公共 HTML | `no-cache`，配 ETag | 可存储，复用前验证 |
| 公共配置 API | 短 `max-age`，必要时 `s-maxage`/`stale-while-revalidate` | 允许相应陈旧窗口且共享安全 |
| 用户数据 API | 可私有缓存时 `private` 加明确新鲜期/验证；敏感且不应存储时 `no-store` | 身份、数据敏感度与更新要求已明确 |

带 Authorization 的请求有专门共享缓存限制，但 `public`、`s-maxage` 等可能授权共享缓存存储，不能只靠“请求带 token”认为安全。用户专属结果不应共享；语言、编码等表示差异还要正确设置 `Vary`。

### 边界与易错点

- `no-cache` 保留验证能力，`no-store` 禁止 HTTP 缓存存储；两者都不会自动管理应用层 JSON 缓存或自行调用 Cache API 的代码。
- `Vary: Cookie` 不能代替授权或私有数据隔离；CDN 必须按明确规则处理登录态和敏感路径。
- 发版要先上传新资源，再更新 HTML，并保留旧资源支持仍打开的页面。客户端版本检测可提示刷新，但不能强制丢掉未保存草稿。
- `no-store` 对 bfcache 的影响依浏览器及安全条件而异；Chrome 已允许部分 no-store 页面进入 bfcache，不能将它当成跨浏览器通用禁用开关。

### 追问

- **CDN TTL 与浏览器 TTL 能否不同？** 可以，用共享缓存专用策略区分；仍需确认平台覆盖规则、Age 及 purge 对哪一层生效。
- **接口返回旧数据先查哪里？** 沿应用查询缓存、SW、浏览器 HTTP cache、CDN 到服务端逐层确认 key、validator、TTL 和失效规则。

参考：[RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html)、[Chrome no-store/bfcache](https://developer.chrome.com/docs/web-platform/bfcache-ccns)。

</details>

---

## 132. HTTP/2 与 HTTP/3 分别解决了什么队头阻塞？

<!-- question: {"category":"browser","type":"theory","difficulty":"advanced","tags":["浏览器","网络"],"estimatedMinutes":8} -->

比较 HTTP/1.1、HTTP/2 和 HTTP/3 的多路复用与队头阻塞，说明 QUIC 的收益和仍然存在的限制。

<details>
<summary>展开参考答案与解析</summary>

HTTP/2 在一条连接里交错传输多个 HTTP stream，避免 HTTP/1.1 管线响应按序返回造成的应用协议队头阻塞；但 TCP 丢包使后续字节等待重传，影响所有流。HTTP/3 基于 QUIC，各流独立按序交付，避免一个流丢失数据直接阻塞无关流；它不消除所有延迟。

### 原理与示例

- HTTP/1.1 支持 keep-alive 和 pipelining，并不是协议规定“同时只能一个请求”；但管线化响应要按请求顺序返回，浏览器通常依赖多个连接而非广泛使用 pipelining。
- HTTP/2 使用二进制帧、多路复用和 HPACK。流在 HTTP 层可独立推进，却共享同一 TCP 有序字节流，丢包仍会造成传输层 HOL blocking。
- HTTP/3 用 QUIC over UDP，QUIC 自己提供可靠传输、拥塞控制和集成 TLS 1.3；HTTP 字段压缩用 QPACK。
- 例如图片流丢包时，另一条已收齐数据的 CSS 流可继续交付；丢包流内部仍需等待缺失字节。

### 边界与易错点

- 连接级拥塞控制、服务器计算/排队、串行资源依赖、连接或流级流控，以及 QPACK 动态表依赖仍可能增加等待。
- QUIC 不等于不可靠传输；HTTP/3 通常有可靠 stream。UDP 被限制时需回退，不能假定所有用户都能用 HTTP/3。
- 0-RTT 只适用于有恢复条件的连接，且有重放风险，不应一概声称任何首次访问零握手或所有请求都更快。
- 减少不必要域名分片通常利于连接复用，但应结合来源、证书、CDN 与实际性能验证，不保证所有域名都能合并连接。

### 追问

- **HTTP/3 在什么场景更有收益？** 高延迟或有丢包的网络可能更明显；真实收益还受实现、路由和服务端影响，需现场数据。
- **用了 HTTP/2 就无需拆包吗？** 仍需按使用时机减少传输和解析工作；多路复用不能消除 JavaScript 执行成本。

参考：[RFC 9114 HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html)、[RFC 9000 QUIC](https://www.rfc-editor.org/rfc/rfc9000.html)。

</details>

---

## 133. `preload`、`prefetch`、`preconnect` 与 `fetchpriority` 分别用在什么场景？

<!-- question: {"category":"browser","type":"theory","difficulty":"intermediate","tags":["浏览器","性能"],"estimatedMinutes":5} -->

当前页面有首屏大图、Web 字体和下一个路由。说明 preload、prefetch、preconnect、fetchpriority 的选择与参数匹配要求。

<details>
<summary>展开参考答案与解析</summary>

`preconnect` 提前为某个源准备连接；`preload` 提前取当前页面需要但发现较晚的资源；`prefetch` 为未来可能使用的资源做低优先级预取；`fetchpriority` 提示已被发现资源的相对优先级。它们解决的问题不同，且浏览器可调整或忽略提示。

### 原理与示例

```html
<link rel="preconnect" href="https://static.example.com" crossorigin>
<link rel="preload" href="/fonts/body.woff2" as="font" type="font/woff2" crossorigin>
<img src="/hero.webp" width="1200" height="600" fetchpriority="high" alt="课程介绍">
```

- preconnect 针对 origin，通常准备 DNS 和协议相关握手；连接已复用时收益可能很小，不应给所有第三方都建连。
- preload 需正确 `as`，`type` 是可选类型提示；与最终请求的 URL、destination、CORS/credentials 等匹配才能复用。字体通常需要 crossorigin，即使字体 URL 同源。
- preload 只取资源，不等同于应用 CSS 或执行 JS。ESM 图预加载可评估 `modulepreload`，其语义与普通脚本 preload 不同。
- prefetch 适合高概率的后续路由，受浏览器、缓存分区、流量和资源策略影响，不保证执行或可在下一页面复用。
- fetchpriority 不提前发现资源；发现很晚的 CSS 背景图可用合适 preload 配合提权。

### 边界与易错点

- 什么都提权或 preload 会竞争带宽并推迟关键内容；先根据瀑布识别发现延迟再加提示。
- 响应式图片预加载应匹配 `imagesrcset`/`imagesizes` 与实际选择，避免下载未使用的大图。
- 优先级提示不是业务完成保证，预取也不应触发状态变更或提前提交用户操作。

### 追问

- **已在 HTML 早期出现的 LCP 图还要 preload 吗？** 未必；提权可能已足够，preload 主要改善发现晚，应以实际 waterfall 确认。
- **字体 preload 几份？** 只预取首屏确实需要的字体/字重，配合子集化和 font-display，避免抢占其他关键资源。

参考：[HTML Link types](https://html.spec.whatwg.org/multipage/links.html)、[Fetch Priority](https://web.dev/articles/fetch-priority)。

</details>

---

## 134. Core Web Vitals 三个指标分别反映什么？

<!-- question: {"category":"browser","type":"theory","difficulty":"basic","tags":["浏览器","性能"],"estimatedMinutes":3} -->

给出 LCP、INP、CLS 的定义、良好阈值与统计口径，说明页面内聚合、页面访问间 p75 和实验室指标的区别。

<details>
<summary>展开参考答案与解析</summary>

Core Web Vitals 分别衡量加载体验、交互响应和视觉稳定性：LCP 看主要内容呈现，INP 看一页访问中的高延迟交互，CLS 看最大一组意外布局偏移。标准评估按真实页面访问的第 75 百分位，移动端与桌面分别判断，三项都达到良好阈值才通过。

### 原理与示例

| 指标 | 良好 | 需要改善 | 较差 |
| --- | --- | --- | --- |
| LCP | ≤ 2.5 s | > 2.5 s 且 ≤ 4 s | > 4 s |
| INP | ≤ 200 ms | > 200 ms 且 ≤ 500 ms | > 500 ms |
| CLS | ≤ 0.1 | > 0.1 且 ≤ 0.25 | > 0.25 |

- LCP 记录视口内符合条件的最大内容元素呈现时机；并非所有视觉元素都参与，也不是等全部资源完成。
- INP 从点击、触摸或键盘交互开始到下一次画面呈现，含输入延迟、处理时长和呈现延迟。页面内取高延迟交互，较多交互时按规则忽略部分极端值。
- CLS 是最大 session window 的 layout shift score 之和：窗口相邻偏移间隔小于 1 秒，最长 5 秒；不是把整页生命周期全部偏移无界累加。
- 页面内先得到一个指标值，再跨访问计算 p75；不能把所有 handler 耗时混到一起求 p75 后称为标准 INP。

### 边界与易错点

- 无合格交互可没有 INP，不能补 0 混入统计。滚动/悬停不直接属于 INP 的测量交互。
- TBT 是实验室长任务指标，可辅助定位，不是 Core Web Vital，也不能替代现场 INP。
- 普通 Lighthouse 导航审计主要看加载，未真实模拟整段用户交互；实验室 trace 用于定位，现场分布用于判断用户影响。
- SPA 路由切换和 bfcache 恢复有测量边界，优先使用了解这些规则的官方测量实现，而非简单相加 PerformanceObserver entry。

### 追问

- **为何不用平均值评估？** 平均值容易掩盖较慢用户，p75 更能约束大多数访问；p95 可补充尾部排查，但不是标准通过阈值。
- **页面首屏好为何仍难用？** LCP 不保证后续响应；长任务、复杂渲染和业务等待需要分别用 INP 与自定义流程指标观察。

参考：[Web Vitals](https://web.dev/articles/vitals)、[INP](https://web.dev/articles/inp)、[CLS](https://web.dev/articles/cls)。

</details>

---

## 135. LCP 慢应该怎么排查？

<!-- question: {"category":"browser","type":"scenario","difficulty":"advanced","tags":["浏览器","性能"],"estimatedMinutes":8} -->

线上页面 LCP 的 p75 超过 2.5 秒。请按 LCP 元素与耗时归因排查，并说明图片、文本和 CSR/SSR 场景的区别。

<details>
<summary>展开参考答案与解析</summary>

先确认真实 LCP 元素与慢用户分组，再把关键路径拆成 TTFB、资源加载延迟、资源加载时长和元素渲染延迟。四段模型尤其适合有独立资源的图片 LCP；文本没有独立图片下载段，可能主要等待字体、CSS 或渲染。

### 排查步骤

1. 从 RUM/CrUX 判断问题集中在哪些页面、设备和网络；在匹配场景录制 Performance，查看 LCP entry 与元素，不只在 Network 中猜最大图片。
2. **TTFB 高**：查导航重定向、网络、服务端处理及缓存命中。静态化或边缘缓存仅适用于可安全共享的内容。
3. **资源发现晚**：LCP 图藏在 CSS、JS 或后续 API 时尽量在初始 HTML 声明，必要时 preload；不要对 LCP 图 lazy load。
4. **传输慢**：提供正确分辨率、合理压缩/格式并使用 CDN；fetchpriority 可提高相对优先级，但不代替减小字节数。
5. **渲染晚**：查阻塞 CSS/字体、同步脚本、元素被隐藏、hydration 或主线程长任务；资源下载完不代表能马上显示。
6. 同条件复测并回看现场分布，记录 LCP 元素是否变化；真实内容调整可能合理改变元素，此时不能机械比较不同内容的单次样本。

### 边界与易错点

- 首屏 eager 图片也可能因晚发现或低优先级慢；lazy 图进入视口后可能自动加载，并不是必须等用户滚动才发请求，问题在于引入额外发现/调度延迟。
- CSR 常增加 JS/API 依赖链，SSR/SSG 可改善发现与内容返回，但后端 TTFB、阻塞资源和 hydration 仍可能抵消收益，不能说 CSR 必然慢或 SSR 保证快。
- 减少图片下载耗时若把剩余时间变成渲染等待，总 LCP 可能不降；优化应看四段和总时长。

### 追问

- **已经有 img 标签还需要 preload 吗？** 根据发现时间和优先级判断；额外 preload 不一定有收益，参数不匹配还会重复下载。
- **文本 LCP 主要怎么办？** 确认字体阻塞与回退策略、关键样式及渲染工作，避免把优化全押在图片压缩上。

参考：[Optimize LCP](https://web.dev/articles/optimize-lcp)、[LCP 定义](https://web.dev/articles/lcp)。

</details>

---

## 136. INP 差应该怎么排查？

<!-- question: {"category":"browser","type":"scenario","difficulty":"advanced","tags":["浏览器","性能"],"estimatedMinutes":8} -->

真实用户 INP 的 p75 偏高，点击后长时间没有反馈。请分别诊断输入延迟、处理时长和呈现延迟，并说明长任务如何拆解。

<details>
<summary>展开参考答案与解析</summary>

一次交互延迟由 input delay、processing duration、presentation delay 三部分构成。INP 覆盖整次页面访问的点击、触摸和键盘交互，通常取最慢交互；大量交互时会按规则忽略极端值。优化应先找真实慢交互，再减轻对应阶段。

### 排查步骤

1. RUM 记录慢交互类型、目标和分段耗时，在相近设备和数据规模下录制 Performance；标准 p75 是跨页面访问统计。
2. **输入延迟**：检查交互到 handler 开始前的主线程任务，如启动脚本、第三方脚本、同步存储或大数组计算。
3. **处理时长**：缩小 handler 的同步工作，及时更新按钮/加载反馈；计算可按块 yield 或移到 Worker，频繁更新可减少订阅与重复计算。
4. **呈现延迟**：检查 handler 结束后 microtask、style/layout/paint、大 DOM 与同步布局；即使 handler 很短，下一帧也可能被挡住。
5. 同一交互复测各阶段，再对比线上页面级 INP 分布；同时记录接口完成时间，避免快反馈掩盖业务一直未完成。

### 边界与易错点

- `await Promise.resolve()`/queueMicrotask 不让出给下一轮任务或绘制，连续微任务仍可能饿死渲染。
- `setTimeout` 可拆成后续任务，但不是把同一大块工作挪后就解决；应真正分块并考虑调度延迟。支持时可用 scheduler.yield，保留兼容回退。
- `startTransition` 调低 React 更新的紧急性，不能把普通同步计算搬到后台；输入值本身应及时更新。
- INP 不衡量整个网络请求完成时间，通常在下一次呈现处结束；优化即时反馈和最终完成是两个目标。

### 追问

- **长任务一定就是 INP 吗？** 超过 50 ms 的主线程任务是定位信号，但 INP 取决于任务与实际交互及下一次呈现的关系，不能把最长任务直接当 INP。
- **为何平均 handler 很快仍不达标？** 输入可能在别的任务后排队，或 handler 后渲染很重；还需检查尾部交互和呈现阶段。

参考：[Optimize INP](https://web.dev/articles/optimize-inp)、[Optimize long tasks](https://web.dev/articles/optimize-long-tasks)。

</details>

---

## 137. CLS 的来源与治理方法是什么？

<!-- question: {"category":"browser","type":"theory","difficulty":"intermediate","tags":["浏览器","性能"],"estimatedMinutes":5} -->

解释 CLS 的计算窗口与哪些偏移会被排除，给出图片、字体、广告和异步插入内容的治理方法。

<details>
<summary>展开参考答案与解析</summary>

CLS 衡量可见元素非预期移动带来的视觉稳定性。单次分数主要由受影响面积与移动距离占视口比例计算；最终取最大 session window 的分数总和，窗口相邻偏移间隔小于 1 秒且最长 5 秒，不是整段生命周期所有偏移相加。

### 原理与示例

- 图片、视频、iframe 提供与内容比例一致的 width/height 或 aspect-ratio；广告和异步区块预留合理槽位，避免先高 0 后撑开。
- 字体选择度量接近的 fallback，必要时用 size-adjust、ascent/descent/line-gap override；font-display 控制显示策略，却不自动消除替换后的重排。
- 骨架屏尽量匹配最终结构；顶部通知条可预留空间或合理覆盖显示，但不能遮住重要内容和焦点。
- 用 Performance 的 Layout Shift entry 看移动元素，再追溯是其自身变化还是上方插入/尺寸变化；被标注的元素不一定是根因。

### 边界与易错点

- 只有满足 recent input 规则的偏移才排除：离散用户输入如点击/按键后 500 ms 内可设置 hadRecentInput；几秒后异步返回造成的跳动仍会计分。
- 滚动等连续输入不按同样规则豁免，不能说“一切由用户操作引发的移动都不计 CLS”。
- transform 动画通常不改变 layout 几何，所以可能不计 layout shift，但仍需保证用户不误点和尊重 reduced motion。
- img 的尺寸属性在响应式 CSS 下提供固有比例，显示尺寸仍可调整；仅写 object-fit 不会给外层自动预留高度。

### 追问

- **为什么首屏无偏移，现场 CLS 仍高？** 延迟广告、后续字体或 SPA 内容更新可能发生在测量加载窗口之后，需观察完整访问。
- **用户点展开但接口很慢怎么办？** 先占位或及时展开稳定容器，避免超过 500 ms 后突然把已有内容推走。

参考：[CLS 定义](https://web.dev/articles/cls)、[Optimize CLS](https://web.dev/articles/optimize-cls)。

</details>

---

## 138. Service Worker 的缓存策略与更新陷阱有哪些？

<!-- question: {"category":"browser","type":"theory","difficulty":"advanced","tags":["浏览器","缓存"],"estimatedMinutes":8} -->

为离线应用选择 Service Worker 缓存策略，解释 install、waiting、activate、控制页面的关系，以及 skipWaiting 和 clients.claim 的版本风险。

<details>
<summary>展开参考答案与解析</summary>

Service Worker 在其控制的 scope 内拦截请求，可组合网络与 Cache Storage。策略要明确陈旧容忍度、用户隔离和更新流程：新 worker 安装成功并不意味着当前页面已由它控制，强制激活也可能让旧页面与新资源混用。

### 原理与示例

- **cache-first**：先找 cache，缺失再网络并写入，适合不可变 hash 资源；**network-first**：优先网络，失败再允许的缓存，适合需要较新内容的页面；**stale-while-revalidate**：立即给已有副本并后台更新，适合可接受陈旧的公开数据。
- install 用 `event.waitUntil()` 等待关键预缓存；失败时新 worker 不应取代仍能工作的旧版本。
- 更新 worker 安装后，若旧 active worker 仍控制客户端，通常处于 waiting；旧 worker 不再控制客户端后才能正常激活，不只是“所有浏览器窗口关掉”这么简单。
- 首次注册时，当前页面通常仍未被控制；之后在 scope 内导航可受控制。`clients.claim()` 可让激活后的 worker 接管符合条件的现有客户端。
- `skipWaiting()` 跳过等待以尽快激活，不跳过 install；用户确认更新后可发消息触发，再监听 controllerchange 做受控刷新。

### 边界与易错点

- 强制激活可能让旧 JS 页面通过新 worker 取资源；激活时立即删除所有旧 cache 可能破坏仍运行页面的 lazy chunk，需兼容窗口和资源保留策略。
- Cache API 的手工存储不会自动按 HTTP 的 max-age/no-store 管理新鲜度；fetch handler 应主动排除敏感/登录态响应，并处理 TTL、版本和登出清理。
- Service Worker 更新基于脚本字节变化与规范探测，不是“脚本有缓存就永远不会更新”；保持稳定脚本 URL，理解 updateViaCache 对脚本及 import 的影响。
- worker 可被终止，不能依靠内存变量或长期定时器保存关键队列；持久状态放 IndexedDB 等并处理存储失败。
- HTTPS（或受信本地环境）和 scope 限制需满足；普通 DevTools Disable cache 不等于绕过 fetch handler，需在 Application 面板分别检查。

### 追问

- **更新 UX 怎么做？** 完整预缓存新版本后提示，先保护未保存输入，再选择激活与刷新；失败时保留可工作的旧版本。
- **SW 与 HTTP cache 谁先？** 对被控制且有 fetch handler 的请求，SW 可自己返回缓存，也可调用 fetch 进入网络/HTTP cache；因此两层要分开观察。

参考：[Service worker lifecycle](https://web.dev/articles/service-worker-lifecycle)、[Service Workers specification](https://w3c.github.io/ServiceWorker/)。

</details>

---

## 139. bfcache 是什么？哪些做法会阻止它？

<!-- question: {"category":"browser","type":"theory","difficulty":"intermediate","tags":["浏览器","性能"],"estimatedMinutes":5} -->

解释 bfcache 与 HTTP cache 的区别，说明如何识别实际恢复、处理陈旧状态，以及 unload、beforeunload、no-store 的浏览器差异。

<details>
<summary>展开参考答案与解析</summary>

bfcache 保存页面的 DOM、JavaScript 堆等内存状态，后退/前进时可恢复而无需重新加载。HTTP cache 保存响应，两者用途与资格规则不同；bfcache 是否可用取决于浏览器、版本、资源状态和安全策略，不能靠单一响应头作统一判断。

### 原理与示例

- `pagehide` 的 `event.persisted === true` 表示浏览器有意保存页面，但以后仍可能淘汰；`pageshow` 的 persisted 为 true 才表示这次确实从 bfcache 恢复。
- 冻结时 JS 任务和定时器暂停，恢复后继续。计时应依据绝对时间/时间差重算，不能以 timer 执行次数代表经过时长。
- 在 pageshow 恢复时重新检查会话、权限和有陈旧风险的数据；保留表单输入等恢复价值，不必无条件整页 reload。

### 边界与易错点

- 避免 unload：不可靠且会在某些浏览器影响资格；未保存数据提示可按需添加 beforeunload，保存后移除，不能断言所有现代浏览器都因此禁用 bfcache。
- 页面持有长连接、IndexedDB 连接/事务等可能影响冻结或其他页面访问，按生命周期关闭或协调，并在恢复时重新连接；具体资格应看 DevTools 提供的原因。
- `no-store` 禁止 HTTP cache 存储。Chrome 已允许部分 no-store 页面进入 bfcache，Cookie/认证变化等安全条件会导致淘汰；其他浏览器规则不同。
- `pagehide` 也不能保证覆盖移动端进程被直接终止；重要草稿应及时保存，visibilitychange 可用于尽早上报而非等退出才操作。
- 返回快照不是重新通过鉴权；注销后恢复页面仍须安全处理，不能用 no-store 代替服务端授权和会话失效。

### 追问

- **如何验证？** 使用 DevTools 的 Back/forward cache 测试和真实后退/前进，结合 pageshow.persisted；navigation.type 为 back_forward 只说明历史导航，不保证命中快照。
- **为什么数据会旧但表单仍在？** 恢复的是冻结前的页面状态，原内存保存了输入；业务需选择哪些状态保留、哪些数据重新验证。

参考：[Back/forward cache](https://web.dev/articles/bfcache)、[Chrome no-store 的资格与淘汰条件](https://developer.chrome.com/docs/web-platform/bfcache-ccns)。

</details>

---

## 140. 图片优化：格式、尺寸、懒加载与 LCP 的关系是什么？

<!-- question: {"category":"browser","type":"theory","difficulty":"intermediate","tags":["浏览器","性能","图片"],"estimatedMinutes":5} -->

为包含首屏大图和长列表缩略图的页面设计图片方案，解释格式、srcset/sizes、懒加载、优先级、解码与 CLS/LCP 的关系。

<details>
<summary>展开参考答案与解析</summary>

先提供合适的像素尺寸和压缩质量，再选格式与加载策略。首屏主要内容应尽早发现，不要 lazy load LCP 图；屏外图可懒加载，所有动态尺寸内容要合理占位。提权、异步解码等是提示，需要实际验证收益。

### 原理与示例

```html
<img
  src="/hero-800.webp"
  srcset="/hero-800.webp 800w, /hero-1600.webp 1600w"
  sizes="(max-width: 800px) 100vw, 800px"
  width="1600" height="900"
  fetchpriority="high"
  alt="面试课程首页预览"
>
```

- `sizes` 描述实际布局宽度，浏览器结合视口与 DPR 从 srcset 选候选；值写大可能多下载。CSS 展示尺寸与固有 width/height 比例仍要匹配。
- AVIF/WebP 常有压缩优势，但需比较同等感知质量、解码成本、透明度与支持范围；不能保证比任意 JPEG/PNG 都更小。picture 可做格式或 art direction 来源选择。
- 非首屏图可用 loading="lazy"，浏览器通常提前一定距离加载，不是可见后才开始；关键图可评估 fetchpriority，发现晚时再有针对性 preload。
- decoding="async" 提示允许异步解码，不能保证无需 CPU 或一定改善 LCP；别用它替代正确尺寸与资源优化。

### 边界与易错点

- width/height 或 aspect-ratio 为布局预留空间，object-fit 只控制内容如何填盒，不会自动替外层占位。
- 按 Accept 返回不同格式的 CDN 需正确缓存 key/Vary 规则；响应式 preload 与实际 img 参数不匹配会浪费下载。
- SVG 适合可控图标和矢量图，不适合所有照片；不可信 SVG 还需安全处理，不能任意注入 DOM。
- 内容图片提供有意义 alt，装饰图 alt=""；并非每张图都应添加冗长描述。

### 追问

- **首屏应 preload 几张图？** 没有固定一张的规则；只对确认发现晚且关键的资源使用，避免抢带宽，已早发现的图未必需要。
- **只有换格式为什么改善小？** 真正瓶颈可能是错误分辨率、发现晚、TTFB 或渲染等待，应按 LCP 关键路径分段观察。

参考：[Responsive images](https://web.dev/articles/responsive-images)、[Fetch Priority](https://web.dev/articles/fetch-priority)。

</details>

---

## 141. 存储分区与 Cookie 的现代限制有哪些？

<!-- question: {"category":"browser","type":"theory","difficulty":"advanced","tags":["浏览器","存储"],"estimatedMinutes":8} -->

跨站 iframe 登录与本地存储在不同浏览器表现不同。请区分 SameSite、第三方 Cookie 策略、CHIPS、存储分区与持久化配额。

<details>
<summary>展开参考答案与解析</summary>

现代浏览器对第三方 Cookie 和存储的处理包括阻止、分区或按权限开放，不能概括为“所有第三方 Cookie 已统一禁用/自动分区”。SameSite 控制 Cookie 的跨站发送条件，CHIPS 提供分区 Cookie，其他存储也可能按顶层站点分区；具体行为需按目标浏览器验证。

### 原理与示例

- **同站与同源**：SameSite 按站判断，现代 schemeful site 包含 scheme 和可注册域，端口不参与；不同子域可同站但不同源。
- **Cookie**：显式 Lax 通常允许顶层安全方法导航，不允许普通跨站 iframe/fetch 或跨站 POST；Strict 更严格，None 允许跨站语义但必须 Secure，仍受第三方 Cookie 设置约束。
- **默认值**：很多浏览器把未声明 SameSite 视为 Lax，但存在实现和兼容例外，例如部分默认 Lax 对刚设置 Cookie 的顶层 POST 有宽限，不应写成所有跨站 POST 一定不带。
- **CHIPS**：使用 `Partitioned; Secure`；跨站嵌入常再需 `SameSite=None`，可用 `__Host-` 前缀限定 host。它按顶层站点保存独立 Cookie，不能提供跨多个站共享的全局登录身份。
- **存储分区**：第三方 iframe 的 localStorage/IndexedDB 等可能以嵌入源加顶层站点等信息分区，同一源不同顶层场景不保证共享；跨标签页通信也受分区约束。
- **配额**：estimate 返回估算，persist 请求持久存储权限且可能被拒绝；持久化降低自动驱逐风险，不是备份，也不能阻止用户清理。

### 边界与易错点

- `credentials: 'include'` 与 CORS 通过不保证 Cookie 被发送；还要检查 SameSite、Secure、Domain/Path、分区与浏览器隐私设置。
- Storage Access API 可在特定条件和用户授权下获得非分区访问，但不是自动通用豁免，需检测支持并提供失败路径。
- localStorage 同步读写且会抛异常；大数据用异步存储，并处理配额、无痕和禁用场景。离线草稿等关键本地数据应有导出/备份或合适同步策略。
- HttpOnly 只限制脚本直接读取 Cookie，XSS 仍能在页面内发请求；不要把敏感 token 长期散落在多个存储中。

### 追问

- **跨站登录怎么选？** 优先评估顶层重定向登录和明确的授权流程；嵌入登录再按目标浏览器选择分区会话/Storage Access，不能依赖未受限第三方 Cookie。
- **跨标签页何时可同步？** 同源且处于可通信的同一分区时可用 BroadcastChannel/storage，storage 通常不通知写入它自己的页面，且通知本身不是互斥锁。

参考：[Storage Partitioning](https://privacysandbox.google.com/cookies/storage-partitioning)、[CHIPS](https://privacysandbox.google.com/cookies/chips)、[SameSite cookies](https://web.dev/articles/samesite-cookies-explained)、[Storage Standard](https://storage.spec.whatwg.org/)。

</details>

---

## 142. 弱网与离线优先应该怎么设计？

<!-- question: {"category":"browser","type":"scenario","difficulty":"advanced","tags":["浏览器","性能"],"estimatedMinutes":8} -->

业务需要支持移动端弱网场景（例如外勤人员提交表单）。请说明离线优先的设计思路、同步协议、冲突处理和用户反馈。

<details>
<summary>展开参考答案与解析</summary>

先明确"哪些能力必须在线"，再用"本地优先 + 后台同步 + 显式冲突策略"补齐弱网体验，不要假设网络总是可用。

### 设计框架

1. 定义离线能力边界：只读缓存、本地保存草稿，还是允许完整离线提交。
2. 用户输入先落本地（IndexedDB），提交改为"入队 + 后台重试"，避免数据丢失。
3. 展示“已保存在本机”“等待同步”“服务端已确认”“同步失败”等状态，网络状态只是提示；navigator.onLine 或 online 事件不能证明目标 API 真正可达。
4. 用稳定 operationId、服务端幂等键和版本条件同步队列，成功确认后才移除；恢复在线、重新打开应用或手动操作时可触发重放（见第 72 题）。
5. 冲突策略必须显式：以服务端为准、以本地为准，还是交给用户选择。

### 边界与易错点

- 队列重放顺序影响业务语义（先创建后修改），需要保序或建立依赖关系。
- 弱网下超时与重试会放大后端压力，必须配合退避与抖动（见第 93 题）。
- 本地草稿可能包含敏感信息，应评估最小存储、过期清理与共享设备；若加密密钥也在同源可访问位置，加密不能单独防 XSS（见第 141 题）。
- 离线缓存存在版本问题：缓存内容与代码不匹配时更容易出错（见第 138 题）。
- 不要用乐观 UI 掩盖提交失败，用户会以为数据已经保存（见第 119 题）。

- IndexedDB 事务可把业务修改与 outbox 入队一起提交，避免只保存其中一半；跨标签页同步要协调，不能让多个队列消费者重复产生副作用。
- 超时可能发生在服务端已成功后，幂等键和查询结果协议必须处理“成功但响应丢失”；认证失效、参数错误和版本冲突不应无限重试。
- Background Sync 的支持和触发受浏览器/系统调度限制，不能承诺关闭应用后必定立即同步；必须有前台和手动恢复路径。

### 追问

- **怎么测量弱网体验？** 用网络限速模拟与真实设备在弱信号下的现场数据（见第 84 题）。
- **什么时候值得做完整离线？** 核心场景本身在移动/外勤，且业务能接受最终一致性时。

参考：[Web Background Synchronization](https://wicg.github.io/background-sync/spec/)、[Storage Standard](https://storage.spec.whatwg.org/)。

</details>

---

## 143. monorepo 什么时候值得引入？

<!-- question: {"category":"engineering","type":"theory","difficulty":"advanced","tags":["工程化","monorepo"],"estimatedMinutes":8} -->

团队有多个前端应用和共享包。请说明何时 monorepo 有收益，如何划定包边界、管理版本，并比较它引入的成本。

<details>
<summary>展开参考答案与解析</summary>

当多个应用或包需要共享代码、统一发布节奏，或需要原子化的跨包改动时，monorepo 才有价值；否则只会增加工具链复杂度。

### 原理与示例

- **收益**：跨包原子提交、共享契约与代码、统一工具链；版本可以统一也可以独立，monorepo 本身并不强制统一版本。
- **成本**：构建与 CI 复杂度上升（需要增量与缓存）、权限与发布流程更复杂、仓库体积膨胀。
- **常见做法**：包管理器的 workspace + 任务编排工具，配合"只构建受影响包"的增量策略（见第 145 题）。

### 边界与易错点

- 包边界不清时，monorepo 会把耦合放大，需要配套依赖规则与 lint 约束（见第 115 题）。
- 随仓库增长应评估增量任务与缓存；远程缓存不是所有 monorepo 的必需前提，收益需与上传、维护和安全成本比较。
- 版本策略要先选：统一版本简单但耦合，独立版本灵活但发布复杂。
- 只有一两个应用且共享很少时，先保持现有结构也可能更简单；仓库数量只是信号，不是唯一标准。

- workspace 负责本地包依赖与安装，任务编排负责构建图、顺序、输入/输出和缓存，两者不是同一个功能。
- 包应有稳定公共入口、明确依赖与构建产物；独立发布包的消费者不能意外依赖 workspace 内未发布文件。仓库目录约定也不等同于独立访问权限隔离。

### 追问

- **怎么判断"共享代码"是不是借口？** 看是否真有多个消费者与独立发布需求；只有一处使用的包通常不值得独立。
- **先做什么准备？** 先梳理依赖边界与构建产物，再引入工具，避免"先上工具再补规则"。

参考：[pnpm Workspaces](https://pnpm.io/workspaces)、[Turborepo Repository structure](https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository)。

</details>

---

## 144. lockfile 与依赖解析为什么会造成"本地正常、CI 失败"？

<!-- question: {"category":"engineering","type":"theory","difficulty":"intermediate","tags":["工程化","依赖"],"estimatedMinutes":5} -->

相同提交在本地通过、CI 安装或构建失败。请解释 lockfile 能保证什么、不能保证什么，并给出最小排查顺序。

<details>
<summary>展开参考答案与解析</summary>

相同源码不保证相同执行环境。缺失/变化的 lockfile、包管理器与 Node 版本差异、平台条件依赖、生命周期脚本、registry 或缓存状态都可能造成不同结果；有效且未变的锁文件配冻结安装时，不应再把原因笼统归为 semver 随机漂移。

### 原理与示例

- lockfile 必须提交，CI 使用冻结安装（而不是静默更新），保证解析结果一致。
- 用 packageManager 声明包管理器版本，并让 CI 实际安装该版本；.nvmrc 等文件要由工具读取才会生效，不能只提交文件而不核对运行版本。
- 不锁定或重新解析时，传递依赖可在允许版本范围内更新；CI 用 `pnpm install --frozen-lockfile`，避免自动修改解析结果。

### 边界与易错点

- 在 CI 里"顺手更新 lockfile"会掩盖问题，让本地与线上产物不一致。
- 只锁直接依赖不够：必须锁整棵依赖树的解析结果。
- 私有 registry 与镜像配置差异也会造成"某个包找不到"，要在 CI 与本地统一。
- 先保存完整失败日志、提交/lockfile hash 与 Node/pnpm 版本，确认安装参数和平台，再比较解析结果、registry、peer/optional dependencies 和脚本执行；不要先删除锁文件或清缓存。

- lockfile 固定解析版本与相关校验信息，但不冻结 OS、CPU、原生工具链、安装脚本的外部下载或应用环境变量；可复现性需一起控制。
- 应显式声明自己导入的依赖，不能依赖本地偶然提升的传递包；这种“幽灵依赖”常在不同安装布局中暴露。

### 追问

- **依赖升级怎么更安全？** 小步升级 + 审查锁文件变更 + 关键路径回归测试（见第 85 题）。
- **要不要把版本写死？** 直接依赖用范围 + lockfile 锁定解析结果，通常比全部写死更可维护。

参考：[pnpm install 与 frozen-lockfile](https://pnpm.io/cli/install)。

</details>

---

## 145. 构建缓存与增量构建应该怎么设计？

<!-- question: {"category":"engineering","type":"theory","difficulty":"intermediate","tags":["工程化","构建"],"estimatedMinutes":8} -->

为多个包的 CI 构建设计任务缓存和增量执行，说明 cache key、依赖图、输出恢复以及何时不能安全缓存。

<details>
<summary>展开参考答案与解析</summary>

缓存复用正确与否取决于相关输入、依赖图和输出声明是否完整：源文件、依赖/工具版本、构建配置及影响产物的环境值构成指纹。无关输入变化不必失效，漏掉相关输入则可能命中错误产物。

### 原理与示例

- **任务级缓存**：以输入 hash 为 key 缓存产物，命中则跳过；monorepo 中还需声明包之间的依赖关系（见第 143 题）。
- **打包器缓存**：复用模块转换结果，可显著加快二次构建。
- **远程缓存**：CI 之间共享命中结果，但必须保证不同分支与环境的产物语义一致。

### 边界与易错点

- 输入声明不全是最常见的坑：环境变量、生成代码、外部资源未纳入指纹，会出现"改了没生效"。
- 产物可移植性要验证：绝对路径、平台差异、时间戳都会破坏跨机器命中。
- 普通产物缓存只保存成功任务，并恢复所需完整 outputs；发布、部署、发消息等有外部副作用的任务不能靠重放旧日志视为已执行。
- 缓存不是免费的：命中率低时哈希与上传成本会超过收益。

- 例子：应用依赖 UI 包时，应用构建 key 应纳入 UI 构建结果/输入；应用使用的 PUBLIC_API_URL 改变要失效，无关 README 变化可命中。
- 外部生成输入应固定版本、下载后参与 hash 或禁用缓存；环境变量若含凭据，不要把原值写入 cache key、日志或可共享产物。
- 远程缓存需鉴权、校验和写入权限隔离，避免不可信 fork/任务写入会被生产 CI 使用的产物；缓存命中不能替代安全校验。

### 追问

- **怎么判断缓存有效？** 做对照实验：改无关文件应命中，改相关文件必须失效。
- **什么时候该放弃缓存？** 构建本身很短，或调试产物不一致的成本高于节省的时间时。

参考：[Turborepo Caching](https://turborepo.dev/docs/crafting-your-repository/caching)。

</details>

---

## 146. 前端包体积治理应该怎么做？

<!-- question: {"category":"engineering","type":"theory","difficulty":"intermediate","tags":["工程化","体积"],"estimatedMinutes":8} -->

首屏 JavaScript 和路由 chunk 逐渐增大。请给出测量、去重、拆包与预算方案，并说明如何避免只追求压缩体积。

<details>
<summary>展开参考答案与解析</summary>

先量化（入口体积、路由分包、重复依赖），再按"删、拆、换、延"治理：删掉无用依赖、拆分代码、替换更小的实现、延迟非关键代码。

### 排查步骤

1. 用体积分析工具查看产物构成，区分自有代码与第三方依赖。
2. 找出重复版本、polyfill 和被实际使用/副作用保留的模块；聚合入口不必然破坏 tree shaking，应追踪真实引入链（见第 82 题）。
3. 按路由与重型功能模块拆分动态导入（见第 58 题）。
4. 替换体积与收益不成比例的依赖，或改为按需引入。
5. 把非首屏能力（图表、编辑器、导出）延迟加载；字体与图片同样要治理（见第 140 题）。
6. 在 CI 中设置体积预算，避免无感回退（见第 85 题）。

### 边界与易错点

- 只看 gzip 后的入口体积不够，还要看解析执行成本与关键路径上的阻塞资源。
- 盲目拆包会增加请求与缓存碎片，收益要用真实网络数据验证。
- polyfill 与兼容目标是常见"隐形体积"，应按实际浏览器支持范围裁剪。
- tree shaking 同时取决于依赖发布形态、副作用声明、打包设置及调用方式，不能单方面归因于库或使用者（见第 82、147 题）。

- 分别记录原始/压缩传输字节、初始路由所需 chunk、后续 lazy chunk 与解析执行成本；入口小但同时拉取多个重型依赖仍可能首屏慢。
- 深层导入只使用公开 exports；拆包边界同时考虑并行依赖与 preload，避免组件级过细切分导致串行 waterfall。旧资源保留支持仍打开页面的懒加载。
- 去重应满足版本和 peer 兼容，不应为减少重复而强制不同主版本共用；优化后核验行为与目标设备实际指标。

### 追问

- **预算怎么定？** 以当前基线为起点设小幅下降目标，并在 CI 中固定检查方式与阈值。
- **体积越小越好吗？** 不是，要与功能价值权衡；但增长必须是显式决策，而非意外漂移。

参考：[webpack Tree Shaking](https://webpack.js.org/guides/tree-shaking/)、[Vite Build Options](https://vite.dev/config/build-options.html)。

</details>

---

## 147. ESM/CJS 双发布与 `exports` 字段有哪些坑？

<!-- question: {"category":"engineering","type":"theory","difficulty":"advanced","tags":["工程化","依赖"],"estimatedMinutes":8} -->

一个库要同时支持 ESM 与 CJS，并提供 TypeScript 类型。请设计 exports，解释条件顺序、声明文件格式、子路径封装和双包状态风险。

<details>
<summary>展开参考答案与解析</summary>

`exports` 声明公开入口与条件映射，解析器按对象顺序匹配自己支持的条件。ESM/CJS 双发布既要运行时模块格式正确，也要类型声明对应同一种模块格式；若两份独立产物维护同一状态，还可能产生双包单例和类身份问题。

### 原理与示例

```json
{
  "name": "example-lib",
  "type": "module",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.mts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  }
}
```

- 在匹配的分支内先放 types，再放 default；Node 通常忽略 types，TypeScript 解析它。条件不能笼统视为所有工具都支持，browser 等取决于运行时/打包器启用的条件。
- `.mjs`/`.d.mts` 为 ESM，`.cjs`/`.d.cts` 为 CJS；`.js`/`.d.ts` 还受最近 package.json 的 type 影响。不能用一份模式不匹配的声明掩盖不同入口。
- import 和 require 可以各指向独立代码；若分别创建 cache、singleton 或 class，两者可能不共享状态，`instanceof` 等也会不同。可用共享核心加 wrapper 等策略减少风险。

### 边界与易错点

- exports 优先于 main 的公开入口解析，未导出的包子路径通常不可导入；新增 exports 可能破坏既有深层导入，需按兼容性版本处理。
- exports 提供 API 封装，不是文件系统安全边界；目标路径通常必须以 `./` 开头且限制越出包目录。
- TypeScript 的 module/moduleResolution 与消费者环境须匹配；bundler 下通过不保证 Node ESM/CJS 下都能运行。
- peer dependency 如 React 通常应 external，避免多个运行时；普通依赖是否打包由库的分发目标决定，不能一概禁止任何依赖进入产物。
- CJS 支持是否必要取决于消费者环境；现代 Node 对部分 ESM 加载能力有所变化，不能沿用“require 永远不能加载任何 ESM”的断言。

### 追问

- **如何验收双发布？** 对实际发布 tarball 在独立 ESM/CJS 消费者里分别运行加载、类型检查与关键行为，检查 exports 路径和 types 是否存在。
- **能共享一份 d.ts 吗？** 只有格式与 API 契约确实一致并能被目标解析模式正确识别时才考虑；双模块入口通常应显式区分声明模式。

参考：[Node.js Packages](https://nodejs.org/api/packages.html)、[TypeScript Modules Reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html)。

</details>

---

## 148. 如何治理 flaky 测试？

<!-- question: {"category":"engineering","type":"theory","difficulty":"intermediate","tags":["工程化","测试"],"estimatedMinutes":8} -->

同一提交偶尔失败、重跑后通过。请设计 flaky 测试的定位与治理流程，说明重试、等待、环境隔离和外部依赖的取舍。

<details>
<summary>展开参考答案与解析</summary>

flaky 的根因几乎都是"不确定性"：时间、并发、网络、共享状态与随机数据。治理必须先量化，再逐个消除来源，而不是靠重跑掩盖。

### 排查步骤

1. 记录"重跑才通过"的比例，把 flaky 当作缺陷而不是噪声。
2. 分类根因：固定 `setTimeout` 等待、真实网络、共享数据库或本地存储、随机数据与时钟、用例间顺序依赖。
3. 改造方式：用可等待断言替代固定延时、mock 网络边界、每个用例隔离状态、注入可控时钟与固定随机种子（见第 69 题）。
4. 对确实无法稳定的用例明确标记并限期修复，而不是长期自动重跑。

### 边界与易错点

- 不应盲目加超时或固定 sleep；若测量证明环境在有效 SLA 内但超过现有阈值，可合理调整预算，同时定位真正慢因。
- 全局共享的测试数据会让用例互相影响，并行执行时更容易暴露。
- 真实第三方依赖增加不可控因素，常规门禁可用可控替身；仍需独立契约/集成验证覆盖真实交互，不能把所有网络一律 mock 后声称集成正确（见第 85 题）。
- 删除失败用例是最坏的处理：既没解决根因，也丢掉了覆盖。

- 保存首次失败的 trace、截图、日志、随机种子和并发/顺序信息，分别以重复运行、随机顺序和并行方式验证根因；只在本地单次通过不算修复证据。
- 等待应匹配用户可见状态或服务端确认，元素“存在”不等于可交互；取消、timer 和请求须在用例后清理，避免污染下一用例。
- 临时隔离用例应记录负责人、期限和风险，并保留失败可见性；重试次数与 flaky 比例仍需单独上报。

### 追问

- **能不能自动重试？** 可以用于收集数据，但必须上报重试次数，否则问题会被长期隐藏。
- **怎么防止新增 flaky？** 优先条件等待、独立上下文、可控数据和明确网络边界，按测试层级决定替身或真实服务；禁止无理由的固定延时，而非禁止一切网络验证。

参考：[Playwright Best Practices](https://playwright.dev/docs/best-practices)、[Playwright Test retries](https://playwright.dev/docs/test-retries)。

</details>

---

## 149. 前端灰度发布与 feature flag 应该怎么设计？

<!-- question: {"category":"engineering","type":"scenario","difficulty":"advanced","tags":["工程化","发布"],"estimatedMinutes":8} -->

新功能需要按用户分批放量并能快速回滚。请给出稳定分组、flag 获取、降级、指标评估与生命周期管理方案。

<details>
<summary>展开参考答案与解析</summary>

灰度是"控制暴露面"，flag 是"控制代码路径"；两者都必须有明确的生命周期管理，否则会沉淀成难以清理的技术债。

### 设计框架

1. 明确灰度维度：用户 id、租户、地域、设备或百分比；维度在客户端与服务端必须一致，避免同一用户看到两种结果。
2. flag 定义安全默认值、last-known-good 与有效期，获取失败按明确规则回退；远程开关传播有延迟，要为安全或高风险操作定义服务端实时边界。
3. 新功能要配可观测指标与快速回滚路径；灰度期间对比错误率与核心转化（见第 84 题）。
4. 每个 flag 记录负责人、创建时间与清理期限，稳定后必须移除代码分支。

### 边界与易错点

- 长期存在的 flag 会让分支与测试矩阵膨胀，把清理纳入发布流程才能控制。
- 客户端 flag 可被绕过，安全相关逻辑必须服务端判定（见第 108 题）。
- flag 拉取失败要有确定性回退，不能出现"一部分用户直接挂掉"。
- 灰度期间的数据分析要按分组统计，否则结论会被污染。
- 关键首屏可使用 bootstrap/服务端决策减少阻塞，SSR 与 hydration 使用一致初值以避免闪烁和不匹配；并非一律禁止等待，敏感能力可先保持安全不可用状态。

- 百分比分组可用稳定 subject key 与 flag salt 做一致 hash；同一用户不应每次随机抽签，匿名到登录或跨端时要定义身份切换规则。
- 记录实际曝光而非仅 flag 拉取，对照错误率、性能与业务指标；分组样本量、流量组成和实验干扰要核对，灰度并不自动等于可解释因果的 A/B 实验。
- 回滚前验证旧代码与新接口/schema 兼容，定义最大配置传播延迟；客户端开关只控制展示，权限和资金等风险由服务端保障。

### 追问

- **怎么选灰度维度？** 优先选能代表真实用户分布的维度，并保证同一用户分组稳定。
- **回滚要准备什么？** 开关、旧版本静态资源与数据兼容策略；只回滚代码而缺少数据兼容方案经常会失败。

参考：[OpenFeature Flag Evaluation API](https://openfeature.dev/specification/sections/flag-evaluation/)。

</details>

---

## 150. 如何把前端错误与后端 trace 串起来？

<!-- question: {"category":"engineering","type":"scenario","difficulty":"advanced","tags":["工程化","监控"],"estimatedMinutes":8} -->

线上前端请求失败后，需要跳转到对应的后端 trace。请设计标准上下文传播、日志关联、CORS、采样与隐私控制，并说明无后端请求的错误如何定位。

<details>
<summary>展开参考答案与解析</summary>

用标准 trace context 将浏览器请求 span 与服务端 span 关联，再在前端错误、服务端日志和发布记录里保留相应 traceId/spanId 与 release。requestId 可辅助关联单个请求，但它不等于完整分布式 trace；渲染或纯客户端异常也可能没有后端链路。

### 设计框架

1. 在可信第一方 API 的请求中由 tracing 实现注入 `traceparent`，需要时加 tracestate；网关、后端与下游按标准提取和继续传播，不只把字符串原样写进日志。
2. traceparent 包含 version、32 位十六进制 trace-id、16 位 parent-id/span-id 与 flags；一个 trace 可有多个请求，各自 span id 不同。重试可建新的子 span，而非把所有 span 合成一个 requestId。
3. 前端上报带 release、错误指纹、路由及实际关联的请求/span，上下文要能表达并发请求，不能只用一个全局“最后请求 id”。
4. 服务端/网关验证输入格式，记录 traceId、spanId、请求状态和受控日志。必要时返回独立 requestId 供用户报障；标准并不要求响应原样回显 traceparent。
5. 跨源时，自定义追踪请求头通常触发预检，需 Access-Control-Allow-Headers 授权；若 JS 读取回传的 requestId，还需 Access-Control-Expose-Headers。
6. 监控配置错误与 trace 的链接，统一时间、版本及保留策略；采样方案需协调并记录缺失原因，不能保证每条前端错误必定都有已保留后端 trace。

### 边界与易错点

- 只在前端生成 traceId 而中间层不传播无法建立完整父子关系；手拼错误头格式或把所有请求共用同一 span id 也会污染链路。
- 只向可信来源传播，避免把内部关联信息或 baggage 发给任意第三方；trace id 不含身份秘密，baggage 更不能放 token、手机号或业务敏感字段。
- 服务端不能把客户端提供的 id、采样 flags 或身份属性当作可信授权；限流、格式验证和信任边界独立处理。
- 前端异常若由多个请求共同导致，关联各相关 span；没有请求的错误使用 release、source map 和最少用户操作上下文定位。
- 错误日志与 trace 采样可以不同，但要考虑 head/tail sampling 的决策与保留时机；全量采错误不等于全量保留链路。

### 追问

- **查到 traceId 却无 trace 为什么？** 可能请求未到服务端、上下文被网关丢弃、后端未采样、数据仍未入库或已过期，逐层检查而非盲目重试。
- **怎样验证接通？** 用合成请求跨前端、网关和服务端检查共同 traceId、正确父子 span、日志关联与 CORS；再制造受控错误验证映射和跳转。

参考：[W3C Trace Context](https://www.w3.org/TR/trace-context/)、[OpenTelemetry Browser](https://opentelemetry.io/docs/languages/js/getting-started/browser/)。

</details>

---

## 151. 为什么 `forEach(async ...)` 不等待？串行、并发和限流如何选择？

<!-- question: {"category":"javascript","type":"theory","difficulty":"intermediate","tags":["async/await","Promise","数组遍历"],"estimatedMinutes":6} -->

解释下面函数为什么可能先返回空数组，以及回调异常为何不能被外层捕获。分别给出保持输入顺序的串行、并发方案，并说明何时必须限流。

```js
async function load(items) {
  const results = []
  items.forEach(async item => {
    results.push(await fetchItem(item))
  })
  return results
}
```

<details>
<summary>展开参考答案与解析</summary>

forEach 同步调用各个回调，但忽略回调返回值，因此不会等待 async 回调的 Promise；load 自身也没有 await 这些任务。串行用 for...of + await，并发用 Promise.all(items.map(...))，限流则控制任务函数的启动数量（见第 88 题）。

### 原理与示例

```js
async function serial(items, fetchItem) {
  const results = []
  for (const item of items) results.push(await fetchItem(item))
  return results
}

async function concurrent(items, fetchItem) {
  return Promise.all(items.map(async item => fetchItem(item)))
}
```

串行适合后一项依赖前一项或服务端要求顺序的流程；并发适合彼此独立且规模受控的任务。Promise.all 按输入顺序输出，不按完成顺序输出；原例的 push 则跟随完成顺序。

### 边界与易错点

- 原例把可变数组提前返回，后续回调仍可能继续修改它；即使某次控制台看到了填充后的数组，也不能证明 load 等待了所有任务。
- async 回调的拒绝不会由 forEach 传播，外面的同步 try/catch 接不住；返回聚合 Promise 或逐项 await，让错误有归属。
- map(async ...) 得到 Promise 数组，await 数组本身不会等待数组元素。filter(async ...) 会把 Promise 对象当 truthy，不能据此异步筛选。
- 用 async 包裹 map 回调，可把 mapper 的同步 throw 转成对应 Promise 拒绝，避免 map 在 Promise.all 注册处理器前中断。Promise.all 不会限流，也不会因首个失败自动取消其余任务；海量请求用任务队列，业务允许部分成功时用 allSettled。
- Promise.all 接受稀疏数组时，迭代到的空位按 undefined 处理；forEach / map 则跳过没有属性的数组索引，输入契约应避免隐式依赖空位。

### 追问

**必须并发但逐项处理错误怎么办？** 使用 allSettled，按输入索引关联结果，再分别展示成功、失败与重试；若需串行但不中断，用循环内 try/catch 收集每项状态。

参考：[ECMAScript forEach](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.foreach)、[Promise.all](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-promise.all)。

</details>

---

## 152. 实现带超时与外部取消的异步任务包装器

<!-- question: {"category":"javascript","type":"coding","difficulty":"advanced","tags":["Promise.race","AbortController","超时"],"estimatedMinutes":12} -->

实现 withTimeout(task, ms, { signal }?)，task 接收包装器自己的 AbortSignal。超时或外部取消时，包装器应及时拒绝并通知任务；即使任务忽略 signal 也不能让调用方无限等待。成功、失败、取消后都要清理定时器与监听器。假设现代平台支持 AbortController、signal.reason 和 throwIfAborted。

<details>
<summary>展开参考答案与解析</summary>

等待超时和取消底层工作是两件事：用拒绝分支参与 Promise.race 保证调用方停止等待，用 AbortSignal 通知配合取消的任务停止工作，并在 finally 释放定时器和监听器。若任务忽略 signal，其底层副作用仍可能继续。

### 参考实现

```js
async function withTimeout(task, ms, { signal } = {}) {
  if (typeof task !== 'function') throw new TypeError('task must be a function')
  if (!Number.isInteger(ms) || ms <= 0 || ms > 2 ** 31 - 1) {
    throw new RangeError('ms must be a positive 32-bit timer delay')
  }
  signal?.throwIfAborted()
  const controller = new AbortController()
  const forwardAbort = () => controller.abort(signal.reason)
  let onAbort
  const aborted = new Promise((_, reject) => {
    onAbort = () => reject(controller.signal.reason)
    controller.signal.addEventListener('abort', onAbort, { once: true })
  })
  signal?.addEventListener('abort', forwardAbort, { once: true })
  const timer = setTimeout(() => {
    controller.abort(new DOMException('Task timed out', 'TimeoutError'))
  }, ms)

  try {
    const work = Promise.resolve().then(() => {
      controller.signal.throwIfAborted()
      return task(controller.signal)
    })
    return await Promise.race([work, aborted])
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', forwardAbort)
    controller.signal.removeEventListener('abort', onAbort)
  }
}
```

### 边界与易错点

- task 的同步 throw、正常值与 Promise 都由 work 链统一接住；外部 signal 已取消时，不启动任务。
- race 已为 work 注册拒绝处理器，超时后 work 的迟到拒绝不会仅因输掉竞争而成为未处理拒绝；任务自己创建的独立异步链仍需处理。
- 取消原因可以是任意值，不保证是名为 AbortError 的 Error；保留 signal.reason 比只判断 error.name 更准确。
- 浏览器定时器受长任务与后台节流影响，超时不是实时中断；task 中的同步大循环会阻塞超时回调，应通过 Worker 或分段计算解决。
- signal 能让支持取消的 fetch 等操作停止等待或传输，不能撤销已在服务端发生的写操作；写入仍需服务端幂等与状态查询。

### 追问

**何时可用 AbortSignal.timeout / any？** 支持这些 API 的目标环境中可以组合信号来简化通知；但忽略 signal 的任务仍需竞争拒绝分支。选型要确认兼容性及 timeout 的计时语义。

参考：[DOM AbortController](https://dom.spec.whatwg.org/#interface-abortcontroller)、[HTML timers](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers)。

</details>

---

## 153. 原型污染如何发生？普通对象字典怎样处理不可信键？

<!-- question: {"category":"javascript","type":"scenario","difficulty":"advanced","tags":["原型链","安全","Map"],"estimatedMinutes":8} -->

外部 JSON 会被递归合并到默认配置。解释 __proto__、constructor.prototype 等路径的风险，区分 JSON.parse 本身与后续写入的行为，并给出字典与配置合并的防护策略。

<details>
<summary>展开参考答案与解析</summary>

风险通常出在把不可信键当作属性路径递归读取/写入，最终改到目标对象原型或共享原型。解析 JSON 不等于已污染 Object.prototype；危险往往来自后续赋值、Object.assign 或递归合并。纯字典优先 Map 或无原型对象；配置应按允许字段重建并逐层校验。

### 原理与示例

```js
const input = JSON.parse('{"__proto__":{"theme":"demo"}}')
Object.hasOwn(input, '__proto__') // true：JSON 的普通自身数据属性

const dictionary = new Map(Object.entries(input))
dictionary.get('__proto__') // { theme: 'demo' }：只是普通 Map 键

const record = Object.create(null)
for (const [key, value] of Object.entries(input)) record[key] = value
Object.getPrototypeOf(record) // null：此对象没有继承的 __proto__ setter
```

若把 input 赋值合并到普通对象，历史 __proto__ setter 可能改变该目标的原型；递归合并沿 constructor.prototype 继续写入时，还可能碰到共享原型。对象自身原型被改与全局 Object.prototype 被污染，影响范围不同。

### 边界与易错点

- 使用 Object.hasOwn 判断自身属性；for...in 会包含继承的可枚举键，不能直接作为安全配置字段列表。
- 只过滤最外层 __proto__ 不够。每一层都要验证允许的键和数据类型；不能把用户提供的点分路径直接映射到任意对象属性。
- 无原型对象只保护该字典的原型行为；之后把内容合并进普通对象仍需检查。对象展开采用创建数据属性语义，和 Object.assign 的目标 setter 行为不同，但浅复制也不能替代输入校验。
- TypeScript 的 Record 类型没有运行时保护，Object.freeze 单个目标也不能保护别处的共享原型；库版本更新需结合官方修复说明和回归用例。

### 追问

**配置合并怎样更稳妥？** 根据 schema 逐项读取明确允许的自身字段，验证类型与范围后创建新配置；对于任意用户键的业务数据使用 Map，避免将数据键解释成对象结构路径。

参考：[OWASP 原型污染防护](https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html)。

</details>

---

## 154. `keyof`、索引访问与 mapped type 如何协作？

<!-- question: {"category":"typescript","type":"coding","difficulty":"intermediate","tags":["keyof","mapped types","泛型"],"estimatedMinutes":8} -->

实现类型安全的 getProperty，并写出 MyReadonly、MyPartial、MyPick 类型。解释 K extends keyof T 为何使返回值 T[K] 与键关联，以及这些类型操作是否改变运行时对象。

<details>
<summary>展开参考答案与解析</summary>

keyof T 得到类型可访问键的联合，T[K] 获取对应属性类型，mapped type 逐个映射一组键，形成新对象类型。它们描述编译期关系，不在运行时复制、冻结或验证数据。

### 参考实现

```ts
function getProperty<T extends object, K extends keyof T>(object: T, key: K): T[K] {
  return object[key]
}

type MyReadonly<T> = { readonly [K in keyof T]: T[K] }
type MyPartial<T> = { [K in keyof T]?: T[K] }
type MyPick<T, K extends keyof T> = { [P in K]: T[P] }

const user = { id: 1, name: 'demo' }
const id = getProperty(user, 'id') // number
const name = getProperty(user, 'name') // string
// getProperty(user, 'missing') // 类型错误
```

### 边界与易错点

- keyof 的键可能是 string、number、symbol；字符串索引签名的 keyof 通常包含 string | number，不能总假设是几个字符串字面量。
- T[keyof T] 是所有对应属性类型的联合；K 被扩大为整个键联合时，返回值也扩大，想保持关联应保留具体 K。
- readonly 与 Partial 通常只描述当前层，不让嵌套对象自动只读/可选。readonly 不等于 Object.freeze，接口 JSON 仍需运行时校验。
- 映射时可用 -readonly / -? 去掉修饰符，用 as 重映射键；标准工具类型优先直接使用，手写主要用于解释机制。

### 追问

**为什么不能把 Object.keys(obj) 无条件断言成 (keyof T)[]？** 类型 T 可能只暴露对象的一部分字段，运行时还有额外自身属性；keys 只返回可枚举字符串键。需要限制运行时输入契约或逐项校验，不能用断言消除真实差异。

参考：[keyof](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html)、[Indexed Access](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)、[Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)。

</details>

---

## 155. 条件类型、`infer` 与分布式条件类型如何推导？

<!-- question: {"category":"typescript","type":"theory","difficulty":"advanced","tags":["conditional types","infer","never"],"estimatedMinutes":8} -->

解释裸类型参数 T extends U ? X : Y 对联合类型的行为，实现数组元素提取，并分析如何禁止分布、为什么 never 的结果容易与直觉不同。

<details>
<summary>展开参考答案与解析</summary>

条件类型按类型的可赋值关系选择分支；infer 在匹配结构时声明待推导的类型变量。当 extends 左边是裸类型参数，且实际参数是联合类型时，通常逐个成员判断并合并结果。用元组包装可改成判断整个联合。

### 原理与示例

```ts
type ElementOf<T> = T extends readonly (infer E)[] ? E : T
type A = ElementOf<readonly number[]> // number

type EachArray<T> = T extends unknown ? T[] : never
type TogetherArray<T> = [T] extends [unknown] ? T[] : never

type B = EachArray<string | number> // string[] | number[]
type C = TogetherArray<string | number> // (string | number)[]

type IsNever<T> = [T] extends [never] ? true : false
type D = IsNever<never> // true
```

### 边界与易错点

- 分布条件是 extends 左边的裸类型参数，不是所有联合比较都自动分布；T[]、[T] 或具体联合写在左边，语义不同。
- never 可视为没有成员的联合；在分布式条件类型里没有成员可展开，结果常为 never，因此判断 never 通常用 [T] 包装。
- infer 是类型匹配与推导，不做运行时解包；读取 Promise 的最终值类型优先用 Awaited<T>，它还能描述递归 thenable 解包等细节。
- any 会削弱分支确定性，递归类型也可能触及编译器深度限制；避免为了炫技把简单业务类型变成难以维护的递归计算。

### 追问

**typeof 与 infer 有什么区别？** 类型位置的 typeof 从现有值提取其静态类型；infer 在条件类型匹配结构时提取其中一部分，二者可协作，但都不替代运行时检查。

参考：[TypeScript Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)、[Awaited](https://www.typescriptlang.org/docs/handbook/utility-types.html#awaitedtype)。

</details>

---

## 156. `satisfies`、类型注解、`as` 与 `as const` 怎么选？

<!-- question: {"category":"typescript","type":"theory","difficulty":"intermediate","tags":["satisfies","类型断言","as const"],"estimatedMinutes":6} -->

用配置表说明四种写法的检查、推断与只读差异；配置需符合约定，又要保留路由路径等字面量信息时应如何书写？这些写法是否有运行时验证？

<details>
<summary>展开参考答案与解析</summary>

类型注解用声明的类型约束变量；satisfies 检查表达式可赋值给目标类型并保留更具体的表达式类型（仍会受上下文类型影响）；as 是类型断言，不能证明运行时正确。as const 保留字面量并给对象属性/数组元组只读类型，也不执行 Object.freeze。

### 原理与示例

```ts
type Route = { path: string; access: 'public' | 'private' }
type RouteTable = Record<'home' | 'settings', Route>

const routes = {
  home: { path: '/', access: 'public' },
  settings: { path: '/settings', access: 'private' },
} as const satisfies RouteTable

const homePath: '/' = routes.home.path // 保留字面量
// routes.home.path = '/new' // 只读属性：类型错误
// 缺少 settings 或 access 写成未知值，会在配置声明处报错
```

### 边界与易错点

- 不加 as const 时，某些属性仍可被推断为 string 等宽类型；satisfies 不保证所有字面量都保持原样，也不能声称对推断完全没有影响。
- 对新鲜对象字面量可做额外属性检查，但 TypeScript 是结构类型系统，不能把 satisfies 当成所有来源下的精确键白名单。
- as const 对表达式内直接构造的字面量建立只读视图；如果属性引用外部已有可变数组，不会递归冻结那个数组。运行时和其他别名仍可能修改对象。
- API 返回值写 as User 或 satisfies User 都不构成运行时校验；先把不可信数据视为 unknown，用解析/校验建立边界。

### 追问

**业务中怎样选择？** 公共函数参数和返回值通常明确注解；静态配置表可用 satisfies 检查形状，需要字面量/只读视图时组合 as const；as 只用于已有证据但编译器无法表达的窄边界，解释证据并避免双重断言。

参考：[TypeScript satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator)、[const assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)。

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
