# 为什么给 Body 设了色却无效？记一次语雀插件开发的“遇墙”与“破壁”

## 1. 诡异的“无效”现场

在开发语雀自定义背景色插件时，我们遇到了一个经典问题：
**代码逻辑看似完美，功能却完全失效。**

我们的 `content.js` 逻辑很简单：从 Storage 读取颜色，然后简单粗暴地给 `body` 加上背景色：

```javascript
// 初始版本 v1.0
document.body.style.backgroundColor = '#00ff00 !important'; 
```

**期望**：页面变成亮绿色。
**现实**：页面依然纹丝不动，洁白如初。

---

## 2. 深入现场：F12 侦探时间

通过 Chrome 开发者工具（Inspect Element），我们发现了两个主要问题：

### 问题 A：图层遮盖（Layering）
我们给 `body` 设置的颜色其实**生效了**。如果你在 Console 里把 `body` 的子元素全部删掉，你会发现背景确实是绿的。
但问题在于，语雀作为一款复杂的单页应用（SPA），由于其布局需要，在 `body` 之上覆盖了至少 3 层“全屏容器”：
1.  **`.lark`**：最外层的全局容器，硬编码了白色背景。
2.  **`#lark-container`**：另一个满屏容器。
3.  **布局层**：阅读器、编辑器各自又有独立的包裹层。

这些容器就像一张张不透明的白纸，严严实实地盖在了 `body` 上。

### 问题 B：动态类名（CSS Modules）
当我们试图去修改这些容器的样式时，发现了第二个拦路虎：
语雀使用了 **CSS Modules** 技术，生成的类名带有随机 Hash 后缀，例如：
*   `ReaderLayout-module_wrapper_rU4PQ`
*   `BookReader-module_wrapper_1d3eR`

这意味着我们不能写死 `.ReaderLayout-module_wrapper_rU4PQ`，因为下次发版（甚至刷新页面）这个后缀可能就变了。

---

## 3. 破壁行动：解决方案

针对上述问题，我们制定了新的 CSS 策略：

### 策略一：全面穿透（Drilling Down）
不能只修改 `body`，必须把所有可能覆盖背景的容器全部找出来，统一“刷漆”。

### 策略二：模糊匹配（Attribute Selectors）
针对动态类名，使用 CSS 属性选择器 `[class*="..."]` 进行模糊匹配。只要类名里包含固定部分即可命中。

### 策略三：透明化（Transparency）
对于侧边栏、大纲栏等辅助区域，与其给它们一个个上色，不如直接设为 **`transparent`（透明）**。这样它们就会自动透出底层的颜色，既统一了视觉，又简化了代码。

---

## 4. 最终代码

这是我们修正后的核心 CSS 注入逻辑：

```javascript
/* content.js 修正版 */
styleEl.textContent = `
  /* 1. 攻破全局容器：选中所有可能的根容器 */
  body,
  .lark,
  #lark-container,
  #react-root {
    background-color: ${color} !important;
  }

  /* 2. 攻破动态类名：使用通配符匹配 CSS Modules */
  [class*="ReaderLayout-module_wrapper"], /* 阅读器外壳 */
  [class*="BookReader-module_wrapper"],   /* 书籍文档容器 */
  [class*="DocReader-module_wrapper"],    /* 单篇文档容器 */
  .ne-viewer-body {                        /* Lake 编辑器核心 */
    background-color: ${color} !important;
  }

  /* 3. 侧边栏透明化：让背景色透出来 */
  [class*="ReaderLayout-module_aside"],
  [class*="sidePanel-module_panel"] {
    background-color: transparent !important;
  }
`;
```

## 5. 经验总结

开发浏览器插件修改第三方网站样式时，千万不要想当然。
1.  **相信 DevTools**：先在 Element 面板里手动改样式，确认生效了再写代码。
2.  **警惕 SPA 结构**：现代前端应用往往嵌套极深，`body` 往往只是个挂载点，真正的“画布”可能在很深的地方。
3.  **善用 CSS 匹配技巧**：属性选择器是处理 React/Vue Scoped CSS 的神器。

---
*Created by Antigravity*
