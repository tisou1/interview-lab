var e=[{id:73,slug:`question-73`,title:`从输入 URL 到页面显示发生了什么？`,category:`browser`,type:`theory`,difficulty:`basic`,tags:[`浏览器`],estimatedMinutes:3,promptHtml:``,answerSections:[{id:`q73-section-0`,title:`答案提纲`,html:`
<p>URL 解析 → HSTS/缓存/Service Worker 等可能介入 → DNS → 建连与 TLS → HTTP 请求响应 → HTML 流式解析 → DOM；CSS 形成 CSSOM；二者参与 render tree/layout/paint/composite；脚本加载和执行可能阻塞解析；资源继续发现与请求；React 可能创建根或 hydration；最终还要区分“看到内容”和“可顺畅交互”。</p>
<p>完整答案要讨论缓存、连接复用、preload、脚本属性、LCP/INP，而不是只背 DNS/TCP。</p>
`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:1469}},{id:74,slug:`question-74`,title:`强缓存与协商缓存如何工作？`,category:`browser`,type:`theory`,difficulty:`basic`,tags:[`浏览器`,`缓存`],estimatedMinutes:3,promptHtml:``,answerSections:[{id:`q74-section-0`,title:`答案`,html:`
<p>强缓存依据 Cache-Control 等在 freshness 生命周期内直接复用；过期后可带 ETag/If-None-Match 或 Last-Modified/If-Modified-Since 向服务端验证，未变化返回 304。</p>
<p>带 hash 的静态资源常使用长时间 immutable，HTML 使用较短或需验证策略，以便新 HTML 引用新 hash。<code>no-cache</code> 表示使用前验证，不等于不存储；<code>no-store</code> 才是不存储，但应考虑性能和 bfcache 影响。</p>
`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:1484}},{id:75,slug:`question-75`,title:`CORS 是什么？为什么 Postman 正常而浏览器失败？`,category:`browser`,type:`theory`,difficulty:`intermediate`,tags:[`浏览器`,`CORS`],estimatedMinutes:5,promptHtml:``,answerSections:[{id:`q75-section-0`,title:`答案`,html:`
<p>CORS 是浏览器在同源策略基础上允许服务器声明跨源读取权限的机制。Postman 不受浏览器页面同源策略限制，所以接口本身成功不代表浏览器允许 JS 读取响应。</p>
<p>非简单请求会先 preflight OPTIONS。携带 credentials 时不能使用通配 origin，客户端和服务端都要正确配置，Cookie 还受 SameSite/Secure 等限制。CORS 不是服务端鉴权，也不阻止其他服务端调用接口。</p>
`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:1499}},{id:76,slug:`question-76`,title:`XSS、CSRF 与 CSP 分别是什么？`,category:`browser`,type:`theory`,difficulty:`intermediate`,tags:[`浏览器`,`XSS`,`CSRF`,`CSP`],estimatedMinutes:5,promptHtml:``,answerSections:[{id:`q76-section-0`,title:`答案`,html:`
<ul>
<li>XSS：不可信内容作为可执行脚本/HTML 注入。防护靠上下文编码、安全 DOM API、富文本 sanitization、避免危险 sink、CSP 等。</li>
<li>CSRF：攻击者利用浏览器自动携带凭据，让用户对目标站发出非预期请求。防护包括 SameSite、CSRF token、Origin/Referer 检查和关键操作再认证等。</li>
<li>CSP：服务端声明允许加载/执行的资源策略，能降低部分注入危害，但不是替代输入输出安全处理。</li>
</ul>
<p>React 默认转义 JSX 插值，但 <code>dangerouslySetInnerHTML</code>、不安全 URL、第三方 DOM 操作仍需处理。</p>
`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:1514}},{id:77,slug:`question-77`,title:`layout、paint、composite 有什么区别？`,category:`browser`,type:`theory`,difficulty:`intermediate`,tags:[`浏览器`],estimatedMinutes:5,promptHtml:``,answerSections:[{id:`q77-section-0`,title:`答案`,html:`
<p>layout 计算元素几何位置/尺寸；paint 生成绘制指令/像素内容；composite 合成不同图层。修改 width/position 等可能触发布局，颜色/阴影可能触发绘制，transform/opacity 在合适条件下可主要走合成，但图层也有内存成本。</p>
<p>交替读取布局信息与写样式会造成 forced synchronous layout。解决是批量读、批量写，并用 Performance trace 确认，不靠属性清单猜测。</p>
`}],source:{file:`fe/JavaScript_React原理与实战模拟面试题库.md`,line:1533}}];export{e as default};