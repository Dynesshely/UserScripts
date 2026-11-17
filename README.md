<div align="center">
  <img src="assets/banner.svg" alt="UserScripts — 开源用户脚本合集" width="100%" />
</div>

# UserScripts

一组开源用户脚本合集。每个脚本都是 `source/` 下的一个独立小项目，使用
[webpack](https://webpack.js.org/) + [webpack-userscript](https://github.com/Jack-Works/webpack-userscript)
构建出带标准 UserScript 头的 `.user.js` 文件。

## 脚本列表

| 目录 | 脚本名 | 安装/更新源 | 许可 |
| --- | --- | --- | --- |
| [source/auto-login](source/auto-login) | Auto Login | release 分支 raw / 手动导入 ScriptCat | MIT |
| [source/disable-pcdn](source/disable-pcdn) | Disable Websites' PCDN | [GreasyFork 491421](https://greasyfork.org/zh-CN/scripts/491421) | MIT |
| [source/luogu-helper](source/luogu-helper) | 洛谷助手 | [GreasyFork 581027](https://greasyfork.org/zh-CN/scripts/581027) | MIT |
| [source/deepseek-ctrl-enter](source/deepseek-ctrl-enter) | DeepSeek: Ctrl+Enter to Send | release 分支 raw（GreasyFork 待发布） | MIT |
| [source/isometric-contributions](source/isometric-contributions) | Isometric Contributions | release 分支 raw | MIT |

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

## 脚本功能

### Auto Login

<img src="assets/functions/auto-login.svg" alt="Auto Login 功能说明" width="100%" />

源码：[source/auto-login](source/auto-login)

### Disable Websites' PCDN

<img src="assets/functions/disable-pcdn.svg" alt="Disable Websites' PCDN 功能说明" width="100%" />

源码：[source/disable-pcdn](source/disable-pcdn)

### 洛谷助手

<img src="assets/functions/luogu-helper.svg" alt="洛谷助手功能说明" width="100%" />

源码：[source/luogu-helper](source/luogu-helper)

### DeepSeek: Ctrl+Enter to Send

<img src="assets/functions/deepseek-ctrl-enter.svg" alt="DeepSeek Ctrl+Enter 功能说明" width="100%" />

源码：[source/deepseek-ctrl-enter](source/deepseek-ctrl-enter)

### Isometric Contributions

<img src="assets/functions/isometric-contributions.svg" alt="Isometric Contributions 功能说明" width="100%" />

源码：[source/isometric-contributions](source/isometric-contributions)

实现来自开源扩展 [jasonlong/isometric-contributions](https://github.com/jasonlong/isometric-contributions)
（MIT License，Copyright (c) 2014 Jason Long），仅做用户脚本环境适配。

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

## 持续集成

推送到 `main` 或提交 PR 时，GitHub Actions 会对每个脚本分别执行 `npm ci` + `npm run build`，
并检查 `dist/` 中的构建产物与源码一致（构建后工作区无差异），确保仓库里的产物始终可复现。

## 发布

打 `v*` 版本 tag 会触发 [Release workflow](.github/workflows/release.yml)：CI 重新构建全部脚本，
把产物以扁平文件名发布到 [`release` 分支](https://github.com/Dynesshely/UserScripts/tree/release)。
同时会创建 GitHub Release 并附带四个 `.user.js` 构建产物；脚本平台（GreasyFork 等）通过 GitHub webhook + raw URL 自动拉取更新。不使用 GitHub Package。

完整的仓库侧发布步骤与平台侧配置见 [docs/RELEASING.md](docs/RELEASING.md)。

发布后可直接用 raw 地址安装：

- <https://raw.githubusercontent.com/Dynesshely/UserScripts/release/auto-login.user.js>
- <https://raw.githubusercontent.com/Dynesshely/UserScripts/release/disable-pcdn.user.js>
- <https://raw.githubusercontent.com/Dynesshely/UserScripts/release/luogu-helper.user.js>
- <https://raw.githubusercontent.com/Dynesshely/UserScripts/release/deepseek-ctrl-enter.user.js>
- <https://raw.githubusercontent.com/Dynesshely/UserScripts/release/isometric-contributions.user.js>