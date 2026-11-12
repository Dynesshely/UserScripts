const path = require("path");
const UserscriptPlugin = require("webpack-userscript").default;

module.exports = {
  mode: "production",
  entry: "./src/index.cjs",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "auto-login.user.js",
  },
  plugins: [
    new UserscriptPlugin({
      headers: {
        name: "Auto Login",
        namespace: "http://scriptcat.org/",
        version: "2025-08-22",
        description: "Let you auto login to your sites with local storage",
        author: "Dynesshely",
        match: ["*", "*://*/*"],
        icon: "https://img.catrol.cn/icons/projects/user-scripts/auto-login.png",
        require: ["https://openuserjs.org/src/libs/sizzle/GM_config.js"],
        grant: [
          "GM_setValue",
          "GM_getValue",
          "GM.getValue",
          "GM.setValue",
          "GM_registerMenuCommand",
        ],
        "run-at": "document-idle",
      },
      // 可选配置
      metajs: false, // 不生成.meta.js文件
      pretty: true, // 格式化头部信息
      renameExt: false, // 保持.user.js扩展名
      // 开发服务器配置（可选）
      // server: {
      //   port: 11919, // 开发服务器端口
      //   host: "127.0.0.1", // 开发服务器主机
      // },
    }),
  ],
};
