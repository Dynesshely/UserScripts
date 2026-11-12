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
        version: "2026-11-12-4",
        description: "Auto-login on configured sites with locally stored credentials",
        author: "Dynesshely",
        match: ["*", "*://*/*"],
        icon: "https://raw.githubusercontent.com/Dynesshely/UserScripts/main/assets/auto-login/logo.png",
        grant: [
          "GM_setValue",
          "GM_getValue",
          "GM.getValue",
          "GM.setValue",
          "GM_registerMenuCommand",
        ],
        "run-at": "document-idle",
      },
      metajs: false,
      pretty: true,
      renameExt: false,
    }),
  ],
};
