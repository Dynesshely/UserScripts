import { isoCss } from "./vendor/iso-css.js";

(function injectStyles() {
  try {
    if (typeof GM_addStyle === "function") {
      GM_addStyle(isoCss);
      return;
    }
  } catch (error) {
    /* ignore */
  }
  var style = document.createElement("style");
  style.textContent = isoCss;
  (document.head || document.documentElement).appendChild(style);
})();
