"use strict";

/**
 * 登录前置动作（按顺序执行）
 * 新的配置结构是扁平的：site_type / site_entrance
 */
module.exports = {
  prefix: [
    function () {
      console.log("👐 正在执行前置脚本 ...");
    },
    function (current) {
      if (current.site_type !== "1Panel") {
        return;
      }

      setTimeout(function () {
        const headings = document.getElementsByTagName("h1");
        let found404 = false;

        for (let index = 0; index < headings.length; index++) {
          if (headings[index].innerText.trim() === "404 Not Found") {
            found404 = true;
            break;
          }
        }

        if (found404) {
          console.log("👉 当前页面需要重定向到独立入口 ...");
          const currentUrl = window.location.origin;
          const entrance = current.site_entrance || "";
          if (entrance) {
            window.location.href = currentUrl + entrance;
          }
        }
      }, 3000);
    },
    function () {
      console.log("👍 前置脚本执行完毕 ...");
    },
  ],
};
