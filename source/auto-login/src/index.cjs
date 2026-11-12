"use strict";

const selectors = require("./selectors.cjs");
const config = require("./config.cjs");
const actions = require("./actions.cjs");
const ui = require("./ui.cjs");

const hostname = window.location.hostname;
const manifest = {
  selectors: selectors.selectors,
  fields: {
    username: config.FIELD_DEFAULTS.username,
    password: config.FIELD_DEFAULTS.password,
    site_type: config.FIELD_DEFAULTS.site_type,
    site_enabled: config.FIELD_DEFAULTS.site_enabled,
    site_entrance: config.FIELD_DEFAULTS.site_entrance,
  },
};

let current = config.loadConfig(hostname);

function debug(target) {
  console.log("[Auto Login] Debugging: " + target);
  switch (target) {
    case "manifest":
      console.log(manifest);
      break;
    case "current":
      console.log(current);
      break;
    default:
      console.log("Unknown target");
      break;
  }
}

function openSettings() {
  const cfg = config.loadConfig(hostname);
  ui.openPanel(hostname, cfg, function (next) {
    current = next;
    ui.mountSetupFab(hostname, next, openSettings);
    console.log("[Auto Login] 配置已更新", next.site_enabled);
  });
}

function registerMenus() {
  if (typeof GM_registerMenuCommand !== "function") {
    return;
  }

  GM_registerMenuCommand("Auto Login 设置", openSettings);

  GM_registerMenuCommand("Debug Manifest", function () {
    debug("manifest");
  });

  GM_registerMenuCommand("Debug Current", function () {
    debug("current");
  });
}

function autoLoginBody(cfg) {
  if (cfg.site_enabled === false) {
    console.log("🔴 当前站点未启用自动登录");
    return;
  }

  const AUTO_SUBMIT = true;
  const DEBOUNCE_TIME = 500;
  const OBSERVE_LIMIT = 15;

  var observedCount = 0;

  let debounceTimer;
  let observer;

  const selector = manifest.selectors.find(function (item) {
    return item.Name === cfg.site_type;
  });
  const usernameSelector = selector && selector.Selector ? selector.Selector.USERNAME : null;
  const passwordSelector = selector && selector.Selector ? selector.Selector.PASSWORD : null;

  if (!usernameSelector || !passwordSelector) {
    console.log("❌ 未找到站点类型「" + cfg.site_type + "」的登录选择器");
    return;
  }

  function triggerInputEvent(input) {
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function submitForm() {
    const login = selector.Login;
    const loginButtonSelector = login && login.Selector;
    const loginText = login && login.InnerText;

    if (!loginButtonSelector) {
      return;
    }

    const submitButton = document.querySelector(loginButtonSelector);
    var needsValidation = login.NeedsValidation;

    if (needsValidation) {
      try {
        const validator = login.Validator
          ? document.querySelector(login.Validator.Selector)
          : null;
        if (validator) {
          needsValidation = true;
          console.log("❌ 该站点要求验证，请用户手动验证后自行登录");
        }
      } catch (error) {
        needsValidation = false;
      }

      if (submitButton && !needsValidation) {
        submitButton.click();
        console.log("✅ 登录按钮点击成功");
      }

      return;
    }

    const spans = document.querySelectorAll(loginButtonSelector);
    const targetSpan = Array.from(spans).find(function (span) {
      return span.textContent.trim() === loginText;
    });

    if (targetSpan) {
      const button = targetSpan.closest("button");
      if (button) {
        button.click();
        console.log("✅ 登录按钮点击成功");
      }
      return;
    }

    if (submitButton) {
      submitButton.click();
      console.log("✅ 登录按钮点击成功");
    }
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
      console.log("🔴 已停止 DOM 观察");
    }
  }

  function fillInputs() {
    observedCount++;

    console.log("😎 正在尝试 (" + observedCount + "/" + OBSERVE_LIMIT + ")");

    if (observedCount >= OBSERVE_LIMIT) {
      console.log("🔴 观察已超时");
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      stopObserver();
      return;
    }

    const usernameInput = document.querySelector(usernameSelector);
    const passwordInput = document.querySelector(passwordSelector);

    if (usernameInput) {
      usernameInput.value = cfg.username;
      triggerInputEvent(usernameInput);
      console.log("✅ 已填充用户名");
    } else {
      console.log("❌ 未找到用户名输入框");
    }

    if (passwordInput) {
      passwordInput.value = cfg.password;
      triggerInputEvent(passwordInput);
      console.log("✅ 已填充密码");
    } else {
      console.log("❌ 未找到密码输入框");
    }

    if (usernameInput && passwordInput) {
      if (AUTO_SUBMIT) {
        console.log("🚀 自动提交表单 ...");
        submitForm();
      }

      stopObserver();
      console.log("🔴 停止观察 DOM 变化");
    }
  }

  function debouncedFill() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fillInputs, DEBOUNCE_TIME);
  }

  function initObserver() {
    observer = new MutationObserver(debouncedFill);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
    console.log("👀 开始监听 DOM 变化 ...");
  }

  actions.prefix.forEach(function (action) {
    action(cfg);
  });

  fillInputs();

  if (
    !document.querySelector(usernameSelector) ||
    !document.querySelector(passwordSelector)
  ) {
    initObserver();
  }
}

function bootstrap() {
  console.log("🔵 Auto Login 脚本已加载 ...");
  registerMenus();
  ui.mountSetupFab(hostname, current, openSettings);

  if (current.site_enabled === false) {
    console.log("🔴 当前站点未启用自动登录");
    return;
  }

  if (!current.terms_accepted) {
    console.log("🟡 尚未同意使用说明");
    return;
  }

  if (
    !current.username ||
    current.username === config.FIELD_DEFAULTS.username ||
    !current.password
  ) {
    console.log("🟡 尚未配置账号，点击页面右下角按钮或菜单项进行设置");
    return;
  }

  autoLoginBody(current);
}

bootstrap();
