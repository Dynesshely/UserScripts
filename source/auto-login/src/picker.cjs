"use strict";

const config = require("./config.cjs");

/**
 * 示教拾取器（动作序列编辑器）
 *
 * 用户通过组合以下操作来教脚本处理当前站点的登录流程：
 *   - 填入用户名（选择页面元素）
 *   - 填入密码（选择页面元素）
 *   - 点击控件（选择页面元素）
 *   - 等待一定时间（不需要元素）
 *
 * 每一步都会保存到自定义站点配置里，登录时按顺序回放。
 */

const ACTION_DEFS = {
  "fill:username": { label: "填入用户名", needsElement: true },
  "fill:password": { label: "填入密码", needsElement: true },
  click: { label: "点击控件", needsElement: true },
  wait: { label: "等待一定时间", needsElement: false },
};

let state = null;

function escapeIdent(value) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return String(value).replace(/([^a-zA-Z0-9_-])/g, "\\$1");
}

function escapeAttr(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function isUnique(selector, element) {
  try {
    const list = document.querySelectorAll(selector);
    return list.length === 1 && list[0] === element;
  } catch (error) {
    return false;
  }
}

function buildSelector(element) {
  if (!element || element.nodeType !== 1) {
    return null;
  }

  if (element.id) {
    const idSelector = "#" + escapeIdent(element.id);
    if (isUnique(idSelector, element)) {
      return idSelector;
    }
  }

  const attrs = [
    "name",
    "placeholder",
    "aria-label",
    "data-testid",
    "data-test",
    "type",
    "autocomplete",
  ];

  for (let index = 0; index < attrs.length; index++) {
    const attr = attrs[index];
    const value = element.getAttribute(attr);
    if (value) {
      const selector =
        element.tagName.toLowerCase() +
        "[" +
        attr +
        '="' +
        escapeAttr(value) +
        '"]';
      if (isUnique(selector, element)) {
        return selector;
      }
    }
  }

  const parts = [];
  let node = element;

  while (node && node.nodeType === 1) {
    let part = node.tagName.toLowerCase();

    if (node.id) {
      parts.unshift("#" + escapeIdent(node.id));
      break;
    }

    const parent = node.parentElement;
    if (parent) {
      const siblings = Array.prototype.filter.call(
        parent.children,
        function (child) {
          return child.tagName === node.tagName;
        }
      );
      if (siblings.length > 1) {
        part += ":nth-of-type(" + (siblings.indexOf(node) + 1) + ")";
      }
    }

    parts.unshift(part);

    const candidate = parts.join(" > ");
    if (isUnique(candidate, element)) {
      return candidate;
    }

    if (node === document.body) {
      break;
    }

    node = node.parentElement;
  }

  const fallback = parts.join(" > ");
  return isUnique(fallback, element) ? fallback : null;
}

function describeElement(element) {
  const tag = element.tagName.toLowerCase();
  const type = element.getAttribute("type");
  const placeholder = element.getAttribute("placeholder");
  const text = (element.textContent || "").trim().slice(0, 20);

  let label = tag;
  if (type) {
    label += '[type="' + type + '"]';
  }
  if (placeholder) {
    label += " · " + placeholder;
  } else if (text) {
    label += " · " + text;
  }
  return label;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isOwnUi(event) {
  const path = event.composedPath ? event.composedPath() : [];
  return path.indexOf(state.hostEl) >= 0;
}

function isPickable(element) {
  if (!element || element.nodeType !== 1) {
    return false;
  }
  if (element === document.documentElement || element === document.body) {
    return false;
  }
  if (element === state.hostEl) {
    return false;
  }
  return true;
}

function stepText(step) {
  if (step.action === "wait") {
    return "等待 " + (step.ms / 1000) + " 秒";
  }
  const base =
    step.action === "fill"
      ? step.field === "username"
        ? "填入用户名"
        : "填入密码"
      : "点击控件";
  return step.label ? base + " · " + step.label : base;
}

function startPicker(options) {
  if (state) {
    return;
  }

  state = {
    hostEl: options.hostEl,
    shadowRoot: options.shadowRoot,
    hostname: options.hostname,
    onDone: options.onDone,
    onCancel: options.onCancel,
    mode: "edit",
    pickingAction: null,
    steps: [],
    waitSeconds: 1,
    root: null,
    hole: null,
    label: null,
    bar: null,
    raf: null,
    lastEvent: null,
    listeners: [],
  };

  buildUi();
  bindListeners();
  render();
}

function buildUi() {
  const root = document.createElement("div");
  root.className = "al-picker";
  root.innerHTML = [
    '<div class="al-pick-hole"></div>',
    '<div class="al-pick-label"></div>',
    '<div class="al-pick-bar"></div>',
  ].join("");

  state.shadowRoot.appendChild(root);
  state.root = root;
  state.hole = root.querySelector(".al-pick-hole");
  state.label = root.querySelector(".al-pick-label");
  state.bar = root.querySelector(".al-pick-bar");
}

function bindListeners() {
  const onMove = function (event) {
    if (state && state.mode === "picking") {
      scheduleHighlight(event);
    }
  };
  const onClick = function (event) {
    handleClick(event);
  };
  const onKey = function (event) {
    if (!state || event.key !== "Escape") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (state.mode === "picking") {
      state.mode = "edit";
      state.pickingAction = null;
      render();
    } else {
      cancel();
    }
  };
  const onScroll = function () {
    if (state && state.mode === "picking") {
      scheduleHighlight(null);
    }
  };

  document.addEventListener("mousemove", onMove, true);
  document.addEventListener("click", onClick, true);
  document.addEventListener("keydown", onKey, true);
  window.addEventListener("scroll", onScroll, true);
  window.addEventListener("resize", onScroll);

  state.listeners.push(
    function () {
      document.removeEventListener("mousemove", onMove, true);
    },
    function () {
      document.removeEventListener("click", onClick, true);
    },
    function () {
      document.removeEventListener("keydown", onKey, true);
    },
    function () {
      window.removeEventListener("scroll", onScroll, true);
    },
    function () {
      window.removeEventListener("resize", onScroll);
    }
  );
}

function scheduleHighlight(event) {
  if (!state || state.mode !== "picking") {
    return;
  }
  state.lastEvent = event;
  if (state.raf) {
    return;
  }
  state.raf = requestAnimationFrame(function () {
    if (!state) {
      return;
    }
    state.raf = null;
    updateHighlight();
  });
}

function currentHoverTarget() {
  const event = state.lastEvent;
  if (event && event.target && isPickable(event.target) && !isOwnUi(event)) {
    return event.target;
  }
  return null;
}

function updateHighlight() {
  if (!state || !state.hole) {
    return;
  }

  const target = state.mode === "picking" ? currentHoverTarget() : null;
  if (!target) {
    state.hole.style.display = "none";
    state.label.style.display = "none";
    return;
  }

  const rect = target.getBoundingClientRect();
  state.hole.style.display = "block";
  state.hole.style.left = rect.left - 4 + "px";
  state.hole.style.top = rect.top - 4 + "px";
  state.hole.style.width = rect.width + 8 + "px";
  state.hole.style.height = rect.height + 8 + "px";

  state.label.style.display = "block";
  state.label.textContent = describeElement(target);
  state.label.style.left = Math.max(8, rect.left) + "px";
  state.label.style.top = Math.max(8, rect.top - 30) + "px";
}

function handleClick(event) {
  if (!state || state.mode !== "picking") {
    return;
  }
  if (isOwnUi(event)) {
    return;
  }

  const target = event.target;
  if (!isPickable(target)) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  pickElement(target);
}

function pickElement(element) {
  const selector = buildSelector(element);
  if (!selector) {
    setStatus("无法为这个元素生成稳定的选择器，请换一个元素或换更具体的输入框 / 按钮。", true);
    return;
  }

  const actionKey = state.pickingAction;
  const label = describeElement(element);

  if (actionKey === "fill:username") {
    state.steps.push({ action: "fill", field: "username", selector: selector, label: label });
  } else if (actionKey === "fill:password") {
    state.steps.push({ action: "fill", field: "password", selector: selector, label: label });
  } else {
    state.steps.push({ action: "click", selector: selector, label: label });
  }

  state.mode = "edit";
  state.pickingAction = null;
  render();
}

function setStatus(message, isError) {
  const text = state && state.bar ? state.bar.querySelector(".al-pick-text") : null;
  if (text) {
    text.textContent = message;
    text.className = "al-pick-text" + (isError ? " is-error" : "");
  }
}

function render() {
  if (!state) {
    return;
  }
  if (state.mode === "picking") {
    renderPicking();
  } else {
    renderEditor();
  }
  bindBarButtons();
}

function renderEditor() {
  const bar = state.bar;
  const stepItems = state.steps.map(function (step, index) {
    return [
      '<li class="al-pick-step-item">',
      '  <span class="al-pick-step-no">' + (index + 1) + "</span>",
      '  <span class="al-pick-step-text">' + escapeHtml(stepText(step)) + "</span>",
      '  <span class="al-pick-step-ops">',
      '    <button type="button" class="al-pick-step-op" data-act="up" data-index="' + index + '" title="上移">↑</button>',
      '    <button type="button" class="al-pick-step-op" data-act="down" data-index="' + index + '" title="下移">↓</button>',
      '    <button type="button" class="al-pick-step-op is-danger" data-act="del" data-index="' + index + '" title="删除">×</button>',
      "  </span>",
      "</li>",
    ].join("");
  });

  bar.innerHTML = [
    '<div class="al-pick-head">',
    '  <span class="al-pick-badge">示教模式</span>',
    '  <span class="al-pick-step">已添加 ' + state.steps.length + " 步</span>",
    "</div>",
    '<div class="al-pick-title">组合登录步骤</div>',
    '<div class="al-pick-text">按顺序添加操作。需要选择元素的步骤会先切换到页面拾取；「等待」用于密码框延迟出现等动态加载场景。</div>',
    '<ul class="al-pick-steps">',
    stepItems.length
      ? stepItems.join("")
      : '<li class="al-pick-steps-empty">还没有添加步骤</li>',
    "</ul>",
    '<div class="al-pick-actions">',
    '  <button type="button" class="al-btn al-btn-secondary" data-act="pick-username">填入用户名</button>',
    '  <button type="button" class="al-btn al-btn-secondary" data-act="pick-password">填入密码</button>',
    '  <button type="button" class="al-btn al-btn-secondary" data-act="pick-click">点击控件</button>',
    '  <button type="button" class="al-btn al-btn-secondary" data-act="wait">等待</button>',
    "</div>",
    '<div class="al-pick-wait-row" hidden>',
    "  <span>等待</span>",
    '  <input type="number" class="al-pick-wait-input" min="0.1" max="30" step="0.1" value="' + state.waitSeconds + '" />',
    "  <span>秒</span>",
    '  <button type="button" class="al-btn al-btn-primary" data-act="add-wait">添加</button>',
    '  <button type="button" class="al-btn al-btn-ghost" data-act="cancel-wait">取消</button>',
    "</div>",
    '<div class="al-pick-actions">',
    '  <button type="button" class="al-btn al-btn-primary" data-act="save">保存示教结果</button>',
    '  <button type="button" class="al-btn al-btn-ghost" data-act="restart">重来</button>',
    '  <button type="button" class="al-btn al-btn-ghost" data-act="exit">退出</button>',
    "</div>",
  ].join("");
}

function renderPicking() {
  const actionKey = state.pickingAction;
  const label = ACTION_DEFS[actionKey] ? ACTION_DEFS[actionKey].label : "选择元素";

  state.bar.innerHTML = [
    '<div class="al-pick-head">',
    '  <span class="al-pick-badge">示教模式</span>',
    '  <span class="al-pick-step">拾取元素</span>',
    "</div>",
    '<div class="al-pick-title">' + escapeHtml(label) + "</div>",
    '<div class="al-pick-text">把鼠标移到页面上的目标元素上，点击它来选中。</div>',
    '<div class="al-pick-actions">',
    '  <button type="button" class="al-btn al-btn-ghost" data-act="cancel-pick">取消拾取</button>',
    "</div>",
  ].join("");
}

function bindBarButtons() {
  if (!state || !state.bar) {
    return;
  }

  state.bar.querySelectorAll("button[data-act]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      handleAction(button.getAttribute("data-act"), Number(button.getAttribute("data-index")));
    });
  });
}

function handleAction(action, index) {
  if (!state) {
    return;
  }

  if (action === "pick-username") {
    state.mode = "picking";
    state.pickingAction = "fill:username";
    render();
    return;
  }
  if (action === "pick-password") {
    state.mode = "picking";
    state.pickingAction = "fill:password";
    render();
    return;
  }
  if (action === "pick-click") {
    state.mode = "picking";
    state.pickingAction = "click";
    render();
    return;
  }
  if (action === "wait") {
    const row = state.bar.querySelector(".al-pick-wait-row");
    if (row) {
      row.hidden = false;
      const input = row.querySelector(".al-pick-wait-input");
      if (input) {
        input.focus();
      }
    }
    return;
  }
  if (action === "add-wait") {
    const input = state.bar.querySelector(".al-pick-wait-input");
    const seconds = input ? Number(input.value) : 1;
    const ms = Math.min(Math.max(Math.round((Number.isFinite(seconds) ? seconds : 1) * 1000), 100), 60000);
    state.waitSeconds = ms / 1000;
    state.steps.push({ action: "wait", ms: ms });
    render();
    return;
  }
  if (action === "cancel-wait") {
    const row = state.bar.querySelector(".al-pick-wait-row");
    if (row) {
      row.hidden = true;
    }
    return;
  }
  if (action === "del") {
    state.steps.splice(index, 1);
    render();
    return;
  }
  if (action === "up" && index > 0) {
    const item = state.steps[index];
    state.steps[index] = state.steps[index - 1];
    state.steps[index - 1] = item;
    render();
    return;
  }
  if (action === "down" && index < state.steps.length - 1) {
    const item = state.steps[index];
    state.steps[index] = state.steps[index + 1];
    state.steps[index + 1] = item;
    render();
    return;
  }
  if (action === "cancel-pick") {
    state.mode = "edit";
    state.pickingAction = null;
    render();
    return;
  }
  if (action === "restart") {
    state.steps = [];
    render();
    return;
  }
  if (action === "save") {
    save();
    return;
  }
  if (action === "exit") {
    cancel();
  }
}

function save() {
  const store = config.saveCustomSite(state.hostname, {
    steps: state.steps,
    updatedAt: Date.now(),
  });

  if (!store) {
    setStatus(
      "步骤不完整：至少需要「填入用户名」「填入密码」「点击控件」各一步。",
      true
    );
    return;
  }

  const onDone = state.onDone;
  cleanup();
  if (typeof onDone === "function") {
    onDone(store);
  }
}

function cancel() {
  const onCancel = state.onCancel;
  cleanup();
  if (typeof onCancel === "function") {
    onCancel();
  }
}

function cleanup() {
  if (!state) {
    return;
  }

  state.listeners.forEach(function (off) {
    off();
  });

  if (state.raf) {
    cancelAnimationFrame(state.raf);
  }

  if (state.root) {
    state.root.remove();
  }

  state = null;
}

module.exports = {
  startPicker,
  buildSelector,
};
