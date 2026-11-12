# Disable Websites' PCDN

阻止网站把访问者当成 PCDN 上传节点。

## 脚本作用

脚本以 IIFE 形式在页面中执行，先打印一条日志，然后直接删除页面上下文里的
WebRTC / DataChannel 全局构造器：

- `RTCPeerConnection`
- `mozRTCPeerConnection`
- `webkitRTCPeerConnection`
- `RTCDataChannel`
- `DataChannel`

这些接口是 PCDN 类方案用来在浏览器之间建立点对点通道的依赖。删除之后，网站的
PCDN SDK 无法建立连接，也就无法使用本机带宽为其他访问者上传内容。

## 匹配站点

- `https://*.bilibili.com/*`

## 安装

GreasyFork 安装页：[脚本 491421](https://greasyfork.org/zh-CN/scripts/491421)，
或直接访问更新地址：

<https://update.greasyfork.org/scripts/491421/Disable%20Websites%27%20PCDN.user.js>

仓库内构建产物为 [dist/disable-pcdn.user.js](dist/disable-pcdn.user.js)，也可以
在浏览器扩展中直接导入安装。

## 构建

```powershell
npm install
npm run build
```

构建由 [webpack](https://webpack.js.org/) + [webpack-userscript](https://github.com/Jack-Works/webpack-userscript)
完成，UserScript 元数据（`name` / `namespace` / `version` / `match` 等）在
[webpack.config.cjs](webpack.config.cjs) 中维护。产物输出到 `dist/disable-pcdn.user.js`。

## 许可

AGPL
