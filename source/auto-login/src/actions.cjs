module.exports = {
  prefix: [
    (_) => {
      console.log("👐 正在执行前置脚本 ...");
    },
    (current) => {
      if (current.site.type === "1Panel") {
        setTimeout(() => {
          const h1Elements = document.getElementsByTagName("h1");
          let found404 = false;

          for (let i = 0; i < h1Elements.length; i++) {
            if (h1Elements[i].innerText.trim() === "404 Not Found") {
              found404 = true;
              break;
            }
          }

          if (found404) {
            console.log("👉 当前页面需要重定向到独特入口 ...");
            const currentUrl = window.location.origin;
            const newUrl = currentUrl + current.site.entrance;
            window.location.href = newUrl;
          }
        }, 3000);
      }
    },
    (_) => {
      console.log("👍 前置脚本执行完毕 ...");
    },
  ],
};
