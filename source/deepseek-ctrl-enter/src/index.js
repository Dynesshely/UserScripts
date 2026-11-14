/**
 * DeepSeek Ctrl+Enter 发送
 *
 * chat.deepseek.com 默认 Enter 发送、Shift+Enter 换行。
 * 本脚本改为：
 *   - Enter          → 换行
 *   - Ctrl/Cmd+Enter  → 发送
 *   - Shift+Enter     → 保持原来的换行行为（不拦截）
 *
 * 实现方式：在 document 捕获阶段拦截原始按键，
 * 再向输入框派发一个等价的合成键盘事件，交给页面自身的发送/换行逻辑处理，
 * 这样不需要依赖页面内部按钮或组件实现。
 */

(function () {
  "use strict";

  const SYNTHETIC_FLAG = "__deepseek_ctrl_enter_synthetic__";
  const TEXTAREA_SEARCH_WORDS = ["搜索", "查找", "search"];

  function isEditable(element) {
    if (!element || element.nodeType !== 1) {
      return false;
    }

    if (element.tagName === "TEXTAREA") {
      if (element.getAttribute("type") === "search") {
        return false;
      }
      var placeholder = (element.getAttribute("placeholder") || "").toLowerCase();
      for (var index = 0; index < TEXTAREA_SEARCH_WORDS.length; index++) {
        if (placeholder.indexOf(TEXTAREA_SEARCH_WORDS[index]) >= 0) {
          return false;
        }
      }
      return true;
    }

    if (element.isContentEditable) {
      if (element.closest && element.closest('[role="search"]')) {
        return false;
      }
      return true;
    }

    return false;
  }

  function defineLegacyKeyCode(event) {
    // 部分页面仍会读取 keyCode / which，合成事件里手动补上
    Object.defineProperty(event, "keyCode", {
      get: function () {
        return 13;
      },
    });
    Object.defineProperty(event, "which", {
      get: function () {
        return 13;
      },
    });
  }

  function dispatchSyntheticEnter(target, shiftKey) {
    var event = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      shiftKey: shiftKey,
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    defineLegacyKeyCode(event);
    event[SYNTHETIC_FLAG] = true;
    target.dispatchEvent(event);

    var keyup = new KeyboardEvent("keyup", {
      key: "Enter",
      code: "Enter",
      shiftKey: shiftKey,
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    defineLegacyKeyCode(keyup);
    keyup[SYNTHETIC_FLAG] = true;
    target.dispatchEvent(keyup);
  }

  function isPlainEnter(event) {
    return (
      !event.shiftKey &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    );
  }

  function isSendCombo(event) {
    return (event.ctrlKey || event.metaKey) && !event.altKey;
  }

  function handleKeyDown(event) {
    if (event[SYNTHETIC_FLAG]) {
      return;
    }

    if (event.key !== "Enter") {
      return;
    }

    if (event.isComposing || event.keyCode === 229) {
      // 输入法组合中，Enter 用于确认候选词，不处理
      return;
    }

    var target = event.target;
    if (!isEditable(target)) {
      return;
    }

    if (isSendCombo(event)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      dispatchSyntheticEnter(target, false);
      return;
    }

    if (isPlainEnter(event)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      // 用 Shift+Enter 交给页面执行换行，保持页面原有行为
      dispatchSyntheticEnter(target, true);
    }
  }

  document.addEventListener("keydown", handleKeyDown, true);
  console.log("[DeepSeek Ctrl+Enter] 已启用：Enter 换行，Ctrl+Enter 发送");
})();
