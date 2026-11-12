# Auto Login

在浏览器里保存各站点的账号密码，匹配到对应登录页时自动填充并提交登录。

- UserScript 名称：`Auto Login`
- namespace：`http://scriptcat.org/`
- 安装方式：手动导入 ScriptCat / 其他脚本管理器（本仓库通过 `release` 分支分发）
- 匹配范围：`*`、`*://*/*`
- 图标：仓库内自绘资产 [assets/auto-login/logo.png](../../assets/auto-login/logo.png)，
  `@icon` 通过仓库 raw 链接引入（源文件为同目录下的 `logo.svg`）

## 功能

- 每个站点独立保存一份配置（按 hostname 隔离），保存在本机 GM 存储中，不上传任何服务器。
- 入口：脚本管理器菜单里的「Auto Login 设置」。默认**不在页面显示悬浮按钮**，避免打扰浏览。
- 内置站点类型：1Panel、JumpServer、DataEase、Portainer、OMV、TrueNAS。
- 配置面板支持用户名 / 密码（可切换显示）、站点类型（自绘下拉样式）、入口路径、启用开关、
  使用说明勾选，并提供填写步骤提示。面板不加载远程 logo 图片（避免站点 CSP / CSRF 限制导致加载失败），
  以纯文字标题呈现。

## 示教模式（支持脚本未内置的站点）

当站点不在内置列表里时，可以直接在页面上「教」脚本怎么登录：

1. 打开该站点的登录页，进入配置面板点击「示教模式」；
2. 按提示在页面上依次点击：
   1. **用户名输入框**
   2. （可选）输入用户名后需要点击的 **「下一步」按钮** —— 没有就点「跳过这一步」
   3. **密码输入框**
   4. **登录按钮**
3. 脚本会为每次点击生成稳定的 CSS 选择器，保存为当前站点的**自定义站点类型**；
4. 之后把站点类型选为「自定义（本页示教）」，填写账号并保存配置即可。

示教记录的是动作序列，因此天然支持两步式登录：先填用户名 → 点击「下一步」→ 等密码框出现 →
再填密码 → 点击登录。执行时会逐步等待目标元素出现（每步最多 15 秒），适配动态渲染的登录页。

示教数据保存在 `auto-login-custom-site-<hostname>`，每个站点独立。

## 源码结构

| 文件 | 说明 |
| --- | --- |
| `src/index.cjs` | 入口：配置读取、菜单、内置站点登录流程、自定义站点回放 |
| `src/config.cjs` | 配置模型、凭据与示教结果的存储、旧配置兼容 |
| `src/ui.cjs` | 配置面板（Shadow DOM 隔离）、站点类型选择、Toast、悬浮按钮 |
| `src/picker.cjs` | 示教拾取器：页面元素高亮、点击拾取、CSS 选择器生成、动作序列保存 |
| `src/actions.cjs` | 内置类型的前置动作 |
| `src/selectors.cjs` | 内置站点登录表单选择器 |
| `webpack.config.cjs` | 构建配置与 UserScript 头元数据 |
| `dist/auto-login.user.js` | 构建产物（安装用） |

## 构建

```powershell
npm install
npm run build
```

输出：`dist/auto-login.user.js`。