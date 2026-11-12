const path = require("path");
const UserscriptPlugin = require("webpack-userscript").default;

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "luogu-helper.user.js",
  },
  // 不做压缩：产物需保留 collectProblems / renderPanelContent 等原始函数名，便于核对
  optimization: {
    minimize: false,
  },
  plugins: [
    new UserscriptPlugin({
      headers: {
        name: "洛谷助手",
        namespace: "com.luogu.userscript",
        version: "0.0.1",
        author: "Dynesshely",
        description: "洛谷题目页面增强脚本",
        license: "MIT",
        icon: "https://www.luogu.com.cn/favicon.ico",
        match: "https://www.luogu.com.cn/*",
        downloadURL:
          "https://update.greasyfork.org/scripts/581027/%E6%B4%9B%E8%B0%B7%E5%8A%A9%E6%89%8B.user.js",
        updateURL:
          "https://update.greasyfork.org/scripts/581027/%E6%B4%9B%E8%B0%B7%E5%8A%A9%E6%89%8B.meta.js",
      },
      metajs: false,
      pretty: true,
      renameExt: false,
    }),
  ],
};
