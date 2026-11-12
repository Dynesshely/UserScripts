# 洛谷助手

洛谷题目列表页的题目统计增强脚本：在页面右下角注入一个悬浮按钮，点开面板后按
「已通过 / 未通过 / 未做」分组列出当前列表里的题目编号，并支持一键复制题号。

- UserScript 名称：`洛谷助手`
- namespace：`com.luogu.userscript`
- version：`0.0.1`
- 安装 / 更新源：[GreasyFork 581027](https://greasyfork.org/zh-CN/scripts/581027)
- 匹配范围：`https://www.luogu.com.cn/*`（仅在 `/problem/list` 题目列表页显示界面）

## 功能

- 仅在题目列表页（`/problem/list`）注入界面，其他页面自动移除。
- 右下角悬浮按钮 `#lh-fab`，点击展开/收起统计面板 `#lh-panel`。
- 解析列表每行的 `.pid` 与 `.status svg[data-icon]`，分为：
  - 已通过（`check` 图标）
  - 未通过（`xmark` 图标）
  - 未做（无状态图标）
- 每个分组显示题号数量与题号列表，可一键复制该组题号到剪贴板（成功/失败有按钮反馈）。
- 点击面板外部或关闭按钮收起面板。
- 通过 patch `history.pushState` / `history.replaceState` 并监听 `popstate` 兼容洛谷的 SPA 路由切换，
  路由变化后自动显示或移除界面。

## 源码结构

| 文件 | 说明 |
| --- | --- |
| `src/index.js` | 脚本入口与全部逻辑（注入样式、解析列表、渲染面板、SPA 路由处理） |
| `src/styles.js` | 注入页面的 CSS 文本（`export const styles`） |
| `webpack.config.cjs` | 构建配置与 UserScript 头元数据 |
| `dist/luogu-helper.user.js` | 构建产物（安装用，带完整 `// ==UserScript==` 头） |

## 构建

```powershell
npm install
npm run build
```

输出：`dist/luogu-helper.user.js`。

构建依赖：`webpack ^5.101.3`、`webpack-cli ^6.0.1`、`webpack-userscript ^3.2.3`
（与同仓库 `source/auto-login` 一致）。
