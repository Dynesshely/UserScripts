/**
 * DeepSeek Ctrl+Enter 发送
 *
 * chat.deepseek.com 默认 Enter 发送、Shift+Enter 换行。
 * 本脚本改为：
 *   - Enter          → 换行
 *   - Ctrl/Cmd+Enter  → 发送
 *   - Shift+Enter     → 保持原来的换行行为（不拦截）
 *
 * 实现说明：
 *   - 换行属于浏览器默认的编辑行为，合成的键盘事件（isTrusted=false）
 *     不会触发它，因此普通 Enter 直接向输入框插入换行：
 *     textarea 用 setRangeText，contenteditable 用 execCommand。
 *   - 发送由页面 JS 处理，因此 Ctrl/Cmd+Enter 通过向输入框派发
 *     一个合成的普通 Enter 交给页面完成。
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

  function fireInput(target, inputType) {
    var event;
    try {
      event = new InputEvent("input", {
        bubbles: true,
        inputType: inputType,
        data: null,
      });
    } catch (error) {
      event = new Event("input", { bubbles: true });
    }
    target.dispatchEvent(event);
  }

  function insertTextareaNewline(target) {
    var value = target.value;
    var start =
      typeof target.selectionStart === "number"
        ? target.selectionStart
        : value.length;
    var end =
      typeof target.selectionEnd === "number" ? target.selectionEnd : start;

    target.setRangeText("\n", start, end, "end");
    fireInput(target, "insertLineBreak");
  }

  function insertEditableNewline(target) {
    var inserted = false;

    try {
      inserted = document.execCommand("insertLineBreak");
    } catch (error) {
      inserted = false;
    }

    if (!inserted) {
      try {
        inserted = document.execCommand("insertText", false, "\n");
      } catch (error) {
        inserted = false;
      }
    }

    if (inserted) {
      return;
    }

    // 兜底：手动在选区插入 <br>
    var selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    var range = selection.getRangeAt(0);
    range.deleteContents();

    var br = document.createElement("br");
    range.insertNode(br);

    range.setStartAfter(br);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    fireInput(target, "insertLineBreak");
  }

  function insertNewline(target) {
    if (target.tagName === "TEXTAREA") {
      insertTextareaNewline(target);
      return;
    }
    if (target.isContentEditable) {
      insertEditableNewline(target);
    }
  }

  function defineLegacyKeyCode(event) {
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

  function dispatchSyntheticEnter(target) {
    var event = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
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
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    defineLegacyKeyCode(keyup);
    keyup[SYNTHETIC_FLAG] = true;
    target.dispatchEvent(keyup);
  }

  function isPlainEnter(event) {
    return !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey;
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
      dispatchSyntheticEnter(target);
      return;
    }

    if (isPlainEnter(event)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      insertNewline(target);
    }
  }

  document.addEventListener("keydown", handleKeyDown, true);
  console.log("[DeepSeek Ctrl+Enter] 已启用：Enter 换行，Ctrl+Enter 发送");
})();
