"use strict";

const config = require("./config.cjs");

/**
 * 示教拾取器
 *
 * 让用户直接在页面上点击元素，教会脚本当前站点的登录表单结构：
 *   1. 用户名输入框
 *   2. （可选）输入用户名后需要点击的「下一步」按钮
 *   3. 密码输入框
 *   4. 登录按钮
 *
 * 结果保存为该 hostname 下的自定义站点类型，登录时交给自定义执行器回放。
 */

const STEP_DEFS = [
  {
    key: "username",
    title: "选择用户名输入框",
    text: "把鼠标移到页面上的用户名输入框上，点击选中它。",
    skippable: false,
  },
  {
    key: "next",
    title: "选择「下一步」按钮（可选）",
    text: "如果先填用户名、点一个按钮后才会出现密码框，请点击那个按钮；没有这样的按钮就点「跳过」。",
    skippable: true,
  },
  {
    key: "password",
    title: "选择密码输入框",
    text: "点击页面上的密码输入框。",
    skippable: false,
  },
  {
    key: "login",
    title: "选择登录按钮",
    text: "点击提交登录的按钮（两步式站点通常是最后出现的那个提交按钮）。",
    skippable: false,
  },
];

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
    stepIndex: 0,
    actionsByStep: [undefined, undefined, undefined, undefined],
    finished: false,
    root: null,
    hole: null,
    label: null,
    bar: null,
    raf: null,
    listeners: [],
  };

  buildUi();
  bindListeners();
  renderBar();
}

function buildUi() {
  const root = document.createElement("div");
  root.className = "al-picker";
  root.innerHTML = [
    '<div class="al-pick-hole"></div>',
    '<div class="al-pick-label"></div>',
    '<div class="al-pick-bar">',
    '  <div class="al-pick-head">',
    '    <span class="al-pick-badge">示教模式</span>',
    '    <span class="al-pick-step"></span>',
    "  </div>",
    '  <div class="al-pick-title"></div>',
    '  <div class="al-pick-text"></div>',
    '  <div class="al-pick-actions"></div>',
    "</div>",
  ].join("");

  state.shadowRoot.appendChild(root);
  state.root = root;
  state.hole = root.querySelector(".al-pick-hole");
  state.label = root.querySelector(".al-pick-label");
  state.bar = root.querySelector(".al-pick-bar");
}

function bindListeners() {
  const onMove = function (event) {
    scheduleHighlight(event);
  };
  const onClick = function (event) {
    handleClick(event);
  };
  const onKey = function (event) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      cancel();
    }
  };
  const onScroll = function () {
    scheduleHighlight(null);
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
  if (!state || state.finished) {
    return;
  }
  state.lastEvent = event;
  if (state.raf) {
    return;
  }
  state.raf = requestAnimationFrame(function () {
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

  const target = currentHoverTarget();
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
  if (!state) {
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

  if (state.finished) {
    return;
  }

  record(target);
}

function record(element) {
  const step = STEP_DEFS[state.stepIndex];
  const selector = buildSelector(element);

  if (!selector) {
    setText("无法为这个元素生成稳定的选择器，请换一个元素或点击更具体的输入框 / 按钮。");
    return;
  }

  if (step.key === "username") {
    state.actionsByStep[state.stepIndex] = {
      action: "fill",
      field: "username",
      selector: selector,
    };
  } else if (step.key === "password") {
    state.actionsByStep[state.stepIndex] = {
      action: "fill",
      field: "password",
      selector: selector,
    };
  } else {
    state.actionsByStep[state.stepIndex] = {
      action: "click",
      selector: selector,
    };
  }

  state.stepIndex += 1;
  advance();
}

function skip() {
  const step = STEP_DEFS[state.stepIndex];
  if (!step || !step.skippable) {
    return;
  }
  state.actionsByStep[state.stepIndex] = null;
  state.stepIndex += 1;
  advance();
}

function back() {
  if (state.stepIndex <= 0) {
    return;
  }
  state.stepIndex -= 1;
  state.actionsByStep[state.stepIndex] = undefined;
  renderBar();
}

function advance() {
  if (state.stepIndex >= STEP_DEFS.length) {
    state.finished = true;
    renderBar();
    return;
  }
  renderBar();
}

function renderBar() {
  if (!state || !state.bar) {
    return;
  }

  const finished = state.finished;
  const step = STEP_DEFS[Math.min(state.stepIndex, STEP_DEFS.length - 1)];

  state.root.querySelector(".al-pick-step").textContent = finished
    ? "已完成"
    : "第 " + (state.stepIndex + 1) + " / " + STEP_DEFS.length + " 步";
  state.root.querySelector(".al-pick-title").textContent = finished
    ? "示教完成"
    : step.title;
  state.root.querySelector(".al-pick-text").textContent = finished
    ? "脚本已记录本页的登录流程，保存后即可用于自动登录。"
    : step.text;

  const actions = state.root.querySelector(".al-pick-actions");
  actions.innerHTML = "";

  if (finished) {
    addButton(actions, "保存示教结果", "primary", save);
    addButton(actions, "重新示教", "ghost", restart);
    addButton(actions, "退出", "ghost", cancel);
  } else {
    if (state.stepIndex > 0) {
      addButton(actions, "上一步", "ghost", back);
    }
    if (step.skippable) {
      addButton(actions, "跳过这一步", "secondary", skip);
    }
    addButton(actions, "退出示教", "ghost", cancel);
  }

  state.hole.style.display = "none";
  state.label.style.display = "none";
}

function addButton(container, text, kind, handler) {
  const button = document.createElement("button");
  button.type = "button";
  button.className =
    "al-btn " +
    (kind === "primary"
      ? "al-btn-primary"
      : kind === "secondary"
      ? "al-btn-secondary"
      : "al-btn-ghost");
  button.textContent = text;
  button.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    handler();
  });
  container.appendChild(button);
}

function setText(message) {
  if (state) {
    state.root.querySelector(".al-pick-text").textContent = message;
  }
}

function restart() {
  state.stepIndex = 0;
  state.actionsByStep = [undefined, undefined, undefined, undefined];
  state.finished = false;
  renderBar();
}

function save() {
  const steps = state.actionsByStep.filter(Boolean);
  const store = config.saveCustomSite(state.hostname, {
    steps: steps,
    updatedAt: Date.now(),
  });

  if (!store) {
    setText("示教数据不完整：至少需要用户名、密码和登录按钮各一步。");
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
