const path = require("path");
const UserscriptPlugin = require("webpack-userscript").default;

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "disable-pcdn.user.js",
  },
  plugins: [
    new UserscriptPlugin({
      headers: {
        name: "Disable Websites' PCDN",
        namespace: "http://tampermonkey.net/",
        version: "2025-04-17-2",
        description: "Disable websites to use PCDN to upload content",
        author: "Dyneeshely",
        license: "AGPL",
        match: "https://*.bilibili.com/*",
        icon: "https://img.catrol.cn/icons/projects/user-scripts/disable-pcdn.png",
        grant: "none",
        downloadURL:
          "https://update.greasyfork.org/scripts/491421/Disable%20Websites%27%20PCDN.user.js",
        updateURL:
          "https://update.greasyfork.org/scripts/491421/Disable%20Websites%27%20PCDN.meta.js",
      },
      metajs: false,
      pretty: true,
      renameExt: false,
    }),
  ],
};
