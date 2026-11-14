# UserScripts

一组开源用户脚本合集。每个脚本都是 `source/` 下的一个独立小项目，使用
[webpack](https://webpack.js.org/) + [webpack-userscript](https://github.com/Jack-Works/webpack-userscript)
构建出带标准 UserScript 头的 `.user.js` 文件。

## 脚本列表

| 目录 | 脚本名 | 安装/更新源 | 许可 |
| --- | --- | --- | --- |
| [source/auto-login](source/auto-login) | Auto Login | 手动安装（ScriptCat） | - |
| [source/disable-pcdn](source/disable-pcdn) | Disable Websites' PCDN | [GreasyFork 491421](https://greasyfork.org/zh-CN/scripts/491421) | AGPL |
| [source/luogu-helper](source/luogu-helper) | 洛谷助手 | [GreasyFork 581027](https://greasyfork.org/zh-CN/scripts/581027) | MIT |
| [source/deepseek-ctrl-enter](source/deepseek-ctrl-enter) | DeepSeek: Ctrl+Enter to Send | 待发布（可从 release 分支安装） | MIT |

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

## 持续集成

推送到 `main` 或提交 PR 时，GitHub Actions 会对每个脚本分别执行 `npm ci` + `npm run build`，
并检查 `dist/` 中的构建产物与源码一致（构建后工作区无差异），确保仓库里的产物始终可复现。

## 发布

打 `v*` 版本 tag 会触发 [Release workflow](.github/workflows/release.yml)：CI 重新构建全部脚本，
把产物以扁平文件名发布到 [`release` 分支](https://github.com/Dynesshely/UserScripts/tree/release)。
脚本平台（GreasyFork 等）通过 GitHub webhook + raw URL 自动拉取更新，不使用 GitHub Release 或 Package。

完整的仓库侧发布步骤与平台侧配置见 [docs/RELEASING.md](docs/RELEASING.md)。

发布后可直接用 raw 地址安装：

- <https://raw.githubusercontent.com/Dynesshely/UserScripts/release/auto-login.user.js>
- <https://raw.githubusercontent.com/Dynesshely/UserScripts/release/disable-pcdn.user.js>
- <https://raw.githubusercontent.com/Dynesshely/UserScripts/release/luogu-helper.user.js>