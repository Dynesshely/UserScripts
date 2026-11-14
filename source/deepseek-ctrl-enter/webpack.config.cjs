const path = require("path");
const UserscriptPlugin = require("webpack-userscript").default;

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "deepseek-ctrl-enter.user.js",
  },
  plugins: [
    new UserscriptPlugin({
      headers: {
        name: "DeepSeek: Ctrl+Enter to Send",
        namespace: "com.deepseek.userscript",
        version: "0.0.2",
        description: "Send messages with Ctrl+Enter and use Enter for line breaks on chat.deepseek.com",
        author: "Dynesshely",
        license: "MIT",
        match: "https://chat.deepseek.com/*",
        icon: "https://chat.deepseek.com/favicon.ico",
        grant: "none",
        "run-at": "document-idle",
      },
      metajs: false,
      pretty: true,
      renameExt: false,
    }),
  ],
};
