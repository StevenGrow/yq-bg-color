# 从零开发语雀背景色自定义 Chrome 插件：复盘与技术总结

## 一、 项目背景与目标

**目标**：
在使用语雀 (Yuque) 阅读或写作时，默认的白色背景在长时间使用下可能产生视觉疲劳。本项目的目标是开发一个轻量级的 Chrome 浏览器扩展 (Extension)，允许用户自定义语雀及其子页面的背景颜色，提升阅读体验。

**核心需求**：
1.  **特定作用域**：仅在 `https://www.yuque.com/*` 生效。
2.  **交互便捷**：通过浏览器右上角插件弹窗 (Popup) 实时选择颜色。
3.  **持久化存储**：用户设置的颜色需自动保存，并在刷新或下次打开时生效。
4.  **即时响应**：修改颜色后，页面无需刷新即可实时预览效果。

---

## 二、 技术选型与架构设计

### 1. 核心技术栈
*   **Manifest V3**：Chrome 扩展的最新标准，安全性更高，性能更好。
*   **原生 JavaScript + CSS**：项目逻辑简单，无需引入 Vue/React 等重型框架，保持插件轻量（最终体积仅几 KB）。
*   **Chrome Storage Sync**：用于跨设备同步用户配置。

### 2. 架构设计
Chrome 扩展本质上是多个独立组件的协作。本项目采用了经典的 **Popup + Content Script** 模式：

*   **Manifest.json**：所有配置的入口，定义权限、脚本路径和作用域。
*   **Popup (popup.html/js)**：用户界面。负责接收用户输入（颜色选择），并将数据写入 `storage`。
*   **Content Script (content.js)**：注入到目标网页的脚本。负责读取 `storage` 中的配置，并操作 DOM 修改网页样式。
*   **Storage**：作为 Popup 和 Content Script 之间的“桥梁”和数据中心。

---

## 三、 关键实现步骤

### 1. 配置 Manifest V3
这是项目的基石。关键点在于权限声明和 Host 匹配：
```json
{
  "manifest_version": 3,
  "permissions": ["storage"], // 需要存储权限
  "host_permissions": ["https://www.yuque.com/*"], // 明确申请的主机权限
  "content_scripts": [
    {
      "matches": ["https://www.yuque.com/*"], // 仅在该域名下注入
      "js": ["content.js"],
      "run_at": "document_idle" // 页面加载完成后注入，避免阻塞
    }
  ]
}
```

### 2. 构建 UI (Popup)
使用原生 `<input type="color">` 实现了极简的颜色选择器。
逻辑非常简单：初始化时从 storage 读取颜色赋值给 input，监听 input 事件将新颜色写入 storage。

### 3.Content Script 注入样式 (核心逻辑)
这是实现功能最关键的一步。为了保证样式能覆盖语雀原有的复杂样式，我采用了 **动态注入 Style 标签** 的方案，而不是直接修改元素的 `style` 属性。

**为什么这样做？**
直接修改 `document.body.style` 容易被网页自身的 JS 覆盖或重置。创建一个 ID 固定的 `<style>` 标签，可以集中管理样式，且方便更新。

```javascript
function applyBackgroundColor(color) {
  let styleEl = document.getElementById('yuque-bg-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    // ... append to head
  }
  // 使用 !important 确保优先级
  styleEl.textContent = `
    body, .layout-container {
      background-color: ${color} !important;
    }
  `;
}
```

### 4. 实现通信与实时更新
为了实现“用户选色，网页立变”的效果，利用了 `chrome.storage.onChanged` 事件。

*   **Popup**：只负责 `set` 数据，不直接给 Content Script 发消息。
*   **Content Script**：监听 `storage` 变化。
    ```javascript
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (changes.yuqueBgColor) {
        applyBackgroundColor(changes.yuqueBgColor.newValue);
      }
    });
    ```
这种**响应式**的数据流设计解耦了 UI 和 业务逻辑，非常优雅。

---

## 四、 技术卡点与解决方案

### 1. SPA (单页应用) 的页面切换问题
**问题**：语雀是一个复杂的 SPA。页面跳转时，DOM 结构可能会被 React 彻底重绘，导致我们要么找不到元素，要么样式丢失。
**解决**：
*   **策略一（CSS 优先）**：尽量通过 CSS 选择器匹配顶层容器（如 `body` 或 `#react-root`），这些容器通常在 SPA 生命周期中保持稳定。
*   **策略二（持久化样式）**：我们将 `<style>` 标签注入到 `<head>` 中。在 SPA 内部路由跳转时，`<head>` 中的内容通常不会被清空，从而保证样式持续生效。

### 2. 样式优先级冲突
**问题**：网页本身有极其具体的 CSS 规则（例如 `.classA .classB { background: white }`），简单的 `body { background: red }` 无法生效。
**解决**：
*   使用了 `!important` 强制覆盖。
*   分析了语雀的 DOM 结构，发现 `.layout-container` 是主要的内容承载层，因此同时对 `body` 和该容器应用了背景色，确保覆盖无死角。

---

## 五、 总结与复盘

### 1. 开发流程方法论
下次开发类似插件，可以遵循以下“三步走”流程：
1.  **Scope（定范围）**：先写 Manifest，圈定权限和域名，避免最后改不动。
2.  **Bridge（搭桥梁）**：先打通 Storage 的读写和监听，确保数据流是通的。
3.  **Paint（绘界面）**：最后去调试 Content Script 里的 CSS/DOM 操作，这是最耗时的部分。

### 2. 也是一次“小而美”的实践
这个项目虽然代码量不到 200 行，但正好覆盖了 Chrome 插件开发最核心的知识点（Manifest, Popup, Content Script, Storage）。它证明了解决痛点不一定需要复杂的架构，简单的原生工具往往最有效。

---
*Created by Antigravity*
