# Isometric Contributions

把 GitHub 个人主页的贡献热力图渲染成等轴测 3D 立方体视图，并提供 2D / 3D / Both 三种显示模式。

- UserScript 名称：`Isometric Contributions`
- namespace：`https://github.com/Dynesshely/UserScripts`
- 匹配范围：`https://github.com/*`
- 许可：MIT · 作者：Dynesshely

## 实现方式

**直接照搬开源扩展 [jasonlong/isometric-contributions](https://github.com/jasonlong/isometric-contributions)（MIT）的实现**，
在 `src/vendor/` 下原样引入其源码：

| 文件 | 作用 |
| --- | --- |
| `vendor/iso.js` | 扩展入口：DOM 注入、数据解析、统计块、2D/3D/Both 切换、历史 streak 补全 |
| `vendor/utils.js` | 贡献数据解析、设置读写、统计计算、统计块 markup 生成 |
| `vendor/history.js` | 通过 GitHub 历史贡献接口补全跨年 streak |
| `vendor/obelisk.min.js` | obelisk.js 等轴测渲染库（MIT） |
| `vendor/iso.css` | 2D/3D 显隐与布局样式 |

所见的 3D 视图、按钮位置、统计块、颜色与间距均来自扩展原始实现，没有自行重写渲染逻辑。

## 用户脚本环境适配（仅此几处）

- 用 `GM_addStyle`（或 style 标签）注入 `iso.css`；
- 设置存储：原扩展代码在 `chrome.storage.local` 不可用时自动回退 `localStorage`，用户脚本环境直接走该分支；
- 移除对旧版 GitHub `.vcard-names-container` 的依赖，改为等待贡献图出现（MutationObserver 兜底）；
- 容器 / 图表定位宽松化：优先 `.js-yearly-contributions` / `.js-calendar-graph`，找不到时回退到包含贡献单元格的最近元素；
- 统计块头部读取加空值保护（页面结构差异时不报错）。

## 功能

- 在个人主页贡献图区域渲染等轴测 3D 立方体（高度按当日贡献数，颜色沿用 GitHub 绿色梯度）；
- 右上角 **2D / 3D / Both** 切换：3D 隐藏原生热力图（默认），2D 只显示原生图，Both 两者都显示；
- 自动生成 Contributions / Streaks 统计块（总数、最佳日、平均、连击天数）；
- 页面加载后用 GitHub 历史贡献接口补全跨年 streak；
- 显示模式保存在 GM 存储中，下次访问沿用；
- 兼容 GitHub 的 Turbo 页面导航，自动适配暗色/浅色主题。

## 构建

```powershell
npm install
npm run build
```

输出：`dist/isometric-contributions.user.js`。
