const selectors = require("./selectors.cjs");
const config = require("./config.cjs");
const actions = require("./actions.cjs");

const manifest = {
  selectors: selectors.selectors,
  fields: config.fields,
};

let current = {
  username: null,
  password: null,
  site: {
    type: null,
    enabled: null,
    entrance: null,
  },
};

const configManager = new GM_config({
  id: `auto-login-config-${window.location.hostname}`,
  title: `Auto Login Configs for ${window.location.hostname}`,
  fields: manifest.fields,
  events: {
    init: function () {
      current.username = this.get("username");
      current.password = this.get("password");
      current.site.type = this.get("site_type");
      current.site.enabled = this.get("site_enabled");
      current.site.entrance = this.get("site_entrance");

      console.log("🔵 Auto Login 脚本已加载 ...");

      autoLogin_body();
    },
    save: function () {
      current.username = this.get("username");
      current.password = this.get("password");
      current.site.type = this.get("site_type");
      current.site.enabled = this.get("site_enabled");
      current.site.entrance = this.get("site_entrance");
    },
  },
});

const debug = (target) => {
  console.log(`🔍 Debugging: ${target}`);
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
};

const menuCommandsRegister = () => {
  GM_registerMenuCommand("Config", () => {
    configManager.open();
  });

  GM_registerMenuCommand("Debug Manifest", () => {
    debug("manifest");
  });

  GM_registerMenuCommand("Debug Current", () => {
    debug("current");
  });
};

menuCommandsRegister();

function autoLogin_body() {
  "use strict";

  if (current.site.enabled === false) {
    console.log("🔴 当前站点未启用自动登录");
    return;
  }

  if (current.username === manifest.fields.username.default) {
    configManager.open();
    return;
  }

  const AUTO_SUBMIT = true;
  const DEBOUNCE_TIME = 500;
  const OBSERVE_LIMIT = 15;

  var ObservedCount = 0;

  let debounceTimer;
  let observer;

  const SELECTOR = manifest.selectors.find((x) => x.Name === current.site.type);
  const USERNAME_SELECTOR = SELECTOR?.Selector.USERNAME;
  const PASSWORD_SELECTOR = SELECTOR?.Selector.PASSWORD;

  function fillInputs() {
    ObservedCount++;

    console.log(`😎 正在尝试 (${ObservedCount}/${OBSERVE_LIMIT})`);

    if (ObservedCount >= OBSERVE_LIMIT) {
      console.log("🔴 观察已超时");
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      stopObserver();

      return;
    }

    const usernameInput = document.querySelector(USERNAME_SELECTOR);
    const passwordInput = document.querySelector(PASSWORD_SELECTOR);

    if (usernameInput) {
      usernameInput.value = current.username;
      triggerInputEvent(usernameInput);
      console.log("✅ 已填充用户名");
    } else {
      console.log("❌ 未找到用户名输入框");
    }

    if (passwordInput) {
      passwordInput.value = current.password;
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

  function triggerInputEvent(input) {
    // 触发 input 事件（兼容 Vue/React）
    console.log("🔄 触发输入事件");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function submitForm() {
    const LOGIN = SELECTOR?.Login;
    const LOGIN_BUTTON_SELECTOR = LOGIN?.Selector;
    const LOGIN_TEXT = LOGIN?.InnerText;

    const submitButton = document.querySelector(LOGIN_BUTTON_SELECTOR);

    var needsValidation = LOGIN?.NeedsValidation;

    if (needsValidation) {
      try {
        const validator = document.querySelector(LOGIN?.Validator.Selector);
        if (validator) {
          needsValidation = true;
          console.log("❌ 该站点要求验证，请用户手动验证后自行登录");
        }
      } catch {
      } finally {
        console.log("❌ 无法找到验证器，将尝试为您点击登录按钮");
        needsValidation = false;
      }

      if (submitButton && !needsValidation) {
        submitButton.click();
        console.log("✅ 登录按钮点击成功");
      }
    } else {
      function findAndClickLoginButton() {
        const spans = document.querySelectorAll(LOGIN_BUTTON_SELECTOR);
        const targetSpan = Array.from(spans).find(
          (span) => span.textContent.trim() === LOGIN_TEXT
        );

        if (targetSpan) {
          const button = targetSpan.closest("button");
          if (button) {
            button.click();
            console.log("✅ 登录按钮点击成功");
          }
        }
        return false;
      }

      findAndClickLoginButton();
    }
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      console.log("🔴 已停止 DOM 观察");
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
      attributes: true, // 观察属性变化（如 placeholder 动态修改）
    });
    console.log("👀 开始监听 DOM 变化 ...");
  }

  function main() {
    console.log("🔵 Auto Login 脚本已启动 ...");

    actions.prefix.forEach((action) => action(current));

    // 先尝试直接填充
    fillInputs();

    // 如果没找到，启动观察
    if (
      !document.querySelector(USERNAME_SELECTOR) ||
      !document.querySelector(PASSWORD_SELECTOR)
    ) {
      initObserver();
    }
  }

  // 启动脚本
  main();
}
