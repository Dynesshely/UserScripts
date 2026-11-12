# Auto Login

让指定站点自动填充账号密码并登录的用户脚本。

- UserScript 名称：`Auto Login`
- namespace：`http://scriptcat.org/`
- 安装方式：手动导入 ScriptCat（未发布到 GreasyFork，因此没有自动更新源）
- 匹配范围：`*`、`*://*/*`

## 功能

通过 GM 存储保存每个站点的账号/密码与站点类型，匹配到对应登录页时自动执行登录动作。
内置的站点类型见 [src/selectors.cjs](src/selectors.cjs)（1Panel、JumpServer、DataEase、Portainer、OMV、TrueNAS 等）。
配置界面依赖 `GM_config.js`（openuserjs CDN）。

## 源码结构

| 文件 | 说明 |
| --- | --- |
| `src/index.cjs` | 入口：路由判断、登录流程 |
| `src/actions.cjs` | 登录动作执行 |
| `src/config.cjs` | GM_config 配置项定义 |
| `src/selectors.cjs` | 各站点登录表单选择器 |
| `webpack.config.cjs` | 构建配置与 UserScript 头元数据 |
| `dist/auto-login.user.js` | 构建产物（安装用） |

## 构建

```powershell
npm install
npm run build
```

输出：`dist/auto-login.user.js`。
