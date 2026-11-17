# Isometric Contributions

把 GitHub 个人主页的贡献热力图渲染成等轴测 3D 立方体视图，并提供 2D / 3D / Both 三种显示模式。

- UserScript 名称：`Isometric Contributions`
- namespace：`https://github.com/Dynesshely/UserScripts`
- 匹配范围：`https://github.com/*`
- 许可：MIT · 作者：Dynesshely

## 功能

- 在个人主页（`https://github.com/<user>`）的贡献图区域插入等轴测 3D 视图；
- 每个贡献方块按当日贡献数绘制为不同高度的立方体，颜色沿用 GitHub 的绿色梯度（浅色/暗色主题分别配色）；
- 右上角提供 **2D / 3D / Both** 切换按钮：
  - **3D**：隐藏原生 2D 热力图，只显示 3D 视图（默认）；
  - **2D**：只显示原生热力图；
  - **Both**：两者同时显示；
- 鼠标悬停方块显示日期与贡献数；
- 显示模式保存在 GM 存储中，下次访问沿用；
- 兼容 GitHub 的 Turbo 页面导航。

## 实现说明

- 数据来自贡献图表格 `td.ContributionCalendar-day` 的 `data-date` / `data-level`，
  以及 `aria-labelledby` 指向的 `tool-tip` 文本（解析 `N contributions on ...`）；
- 使用 Canvas 2D 按等轴测投影绘制立方体（顶面 / 左面 / 右面三种明暗），
  不依赖任何第三方 3D 库；
- 通过 `body.ic-squares / .ic-cubes / .ic-both` 与 CSS 控制 2D 图的显隐。

## 构建

```powershell
npm install
npm run build
```

输出：`dist/isometric-contributions.user.js`。
