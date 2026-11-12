# Auto Login

在浏览器里保存各站点的账号密码，匹配到对应登录页时自动填充并提交登录。

- UserScript 名称：`Auto Login`
- namespace：`http://scriptcat.org/`
- 安装方式：手动导入 ScriptCat（未发布到 GreasyFork，因此没有自动更新源）
- 匹配范围：`*`、`*://*/*`

## 功能

- 每个站点独立保存一份配置（按 hostname 隔离），保存在本机 GM 存储中，不上传任何服务器。
- 首次使用：页面右下角会显示悬浮按钮（未配置时出现），或通过脚本管理器菜单里的
  「Auto Login 设置」打开配置面板。
- 配置面板支持：
  - 用户名 / 密码输入（密码可切换显示）
  - 站点类型选择（1Panel、JumpServer、DataEase、Portainer、OMV、TrueNAS）
  - 入口路径（可选，用于 1Panel 这类需要跳转独立入口的站点）
  - 启用开关
  - 使用说明与协议勾选
  - 分步示教提示：填写账号 → 确认站点 → 勾选协议 → 保存，步骤会随输入自动推进
- 保存后配置立即持久化；再次打开对应站点的登录页时会自动填充并点击登录按钮。
- 兼容旧版（GM_config 时期）保存的配置，无需手动迁移。

## 源码结构

| 文件 | 说明 |
| --- | --- |
| `src/index.cjs` | 入口：读取配置、注册菜单、自动登录流程 |
| `src/config.cjs` | 配置模型、存储读写与旧配置兼容 |
| `src/ui.cjs` | 配置面板（Shadow DOM 隔离）、示教步骤、Toast、悬浮按钮 |
| `src/actions.cjs` | 登录前置动作 |
| `src/selectors.cjs` | 各站点登录表单选择器 |
| `webpack.config.cjs` | 构建配置与 UserScript 头元数据 |
| `dist/auto-login.user.js` | 构建产物（安装用） |

## 构建

```powershell
npm install
npm run build
```

输出：`dist/auto-login.user.js`。
