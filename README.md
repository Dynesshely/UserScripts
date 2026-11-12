# UserScripts

Dynesshely 的个人用户脚本仓库。每个脚本都是 `source/` 下一个独立的小项目，
通过 [webpack](https://webpack.js.org/) + [webpack-userscript](https://github.com/Jack-Works/webpack-userscript)
生成带标准 UserScript 头的 `.user.js` 文件。

## 脚本列表

| 目录 | 脚本名 | 安装/更新源 | 许可 |
| --- | --- | --- | --- |
| [source/auto-login](source/auto-login) | Auto Login | 手动安装（ScriptCat） | - |
| [source/disable-pcdn](source/disable-pcdn) | Disable Websites' PCDN | [GreasyFork 491421](https://greasyfork.org/zh-CN/scripts/491421) | AGPL |
| [source/luogu-helper](source/luogu-helper) | 洛谷助手 | [GreasyFork 581027](https://greasyfork.org/zh-CN/scripts/581027) | MIT |

## 构建

每个子项目独立安装依赖、独立构建：

```powershell
cd source/<script>
npm install
npm run build
```

产物输出到各项目的 `dist/<script>.user.js`。也可以在仓库根目录执行：

```powershell
npm run build
```

## 目录约定

```
source/<slug>/
├─ src/                 # 可编辑源码
├─ dist/<slug>.user.js  # 构建产物（提交，可直接安装）
├─ webpack.config.cjs   # 构建与 UserScript 头元数据
├─ package.json
└─ README.md
```

`<slug>` 统一使用小写连字符格式。
