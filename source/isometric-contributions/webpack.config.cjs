const path = require("path");
const UserscriptPlugin = require("webpack-userscript").default;

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "isometric-contributions.user.js",
  },
  plugins: [
    new UserscriptPlugin({
      headers: {
        name: "Isometric Contributions",
        namespace: "https://github.com/Dynesshely/UserScripts",
        version: "0.0.2",
        description:
          "Render GitHub contribution graphs as an isometric 3D view with 2D/3D/Both toggle",
        author: "Dynesshely",
        license: "MIT",
        match: "https://github.com/*",
        icon: "https://github.com/favicon.ico",
        grant: ["GM_getValue", "GM_setValue", "GM_addStyle"],
        "run-at": "document-idle",
      },
      metajs: false,
      pretty: true,
      renameExt: false,
    }),
  ],
};
