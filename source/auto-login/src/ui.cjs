"use strict";

const config = require("./config.cjs");
const selectors = require("./selectors.cjs");
const picker = require("./picker.cjs");

const STYLE_TEXT = [
  ":host { all: initial; }",
  ":host, :host * { box-sizing: border-box; }",
  ".al-fab {",
  "  position: fixed; right: 22px; bottom: 22px; width: 52px; height: 52px;",
  "  display: flex; align-items: center; justify-content: center;",
  "  border: 1px solid rgba(120, 120, 135, .28); border-radius: 50%;",
  "  background: #ffffff; color: #2563eb; cursor: pointer;",
  "  box-shadow: 0 10px 30px rgba(15, 23, 42, .18);",
  "  transition: transform .18s ease, box-shadow .18s ease; z-index: 2147483646;",
  "  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;",
  "}",
  ".al-fab:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 14px 34px rgba(15, 23, 42, .24); }",
  ".al-fab svg { width: 24px; height: 24px; }",
  ".al-layer { position: fixed; inset: 0; z-index: 2147483647; display: flex; align-items: center; justify-content: center; padding: 24px; }",
  ".al-layer[hidden] { display: none !important; }",
  ".al-mask { position: absolute; inset: 0; background: rgba(15, 23, 42, .45); backdrop-filter: blur(3px); animation: al-fade .18s ease; }",
  ".al-panel {",
  "  position: relative; width: min(520px, 100%); max-height: min(88vh, 760px); overflow: auto;",
  "  background: #ffffff; color: #0f172a; border-radius: 18px;",
  "  box-shadow: 0 30px 80px rgba(15, 23, 42, .35);",
  "  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;",
  "  animation: al-pop .2s cubic-bezier(.2, .9, .3, 1.2);",
  "}",
  "@keyframes al-fade { from { opacity: 0; } to { opacity: 1; } }",
  "@keyframes al-pop { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: none; } }",
  ".al-head { display: flex; align-items: center; justify-content: space-between; padding: 22px 24px 10px; }",
  ".al-brand { display: flex; align-items: center; gap: 12px; }",
  ".al-title { font-size: 17px; font-weight: 700; line-height: 1.2; }",
  ".al-host { margin-top: 3px; font-size: 12px; color: #64748b; }",
  ".al-close {",
  "  width: 34px; height: 34px; border: none; border-radius: 10px; cursor: pointer;",
  "  background: transparent; color: #64748b; font-size: 22px; line-height: 1;",
  "  transition: background .15s ease, color .15s ease;",
  "}",
  ".al-close:hover { background: #f1f5f9; color: #0f172a; }",
  ".al-steps { display: flex; gap: 6px; padding: 6px 24px 0; margin: 0; list-style: none; }",
  ".al-step { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; font-size: 12px; color: #94a3b8; }",
  ".al-step i {",
  "  width: 20px; height: 20px; border-radius: 50%; flex: none;",
  "  display: flex; align-items: center; justify-content: center;",
  "  border: 1px solid #cbd5e1; font-style: normal; font-size: 11px; font-weight: 600;",
  "  transition: all .18s ease;",
  "}",
  ".al-step span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
  ".al-step.is-active { color: #2563eb; font-weight: 600; }",
  ".al-step.is-active i { background: #2563eb; border-color: #2563eb; color: #fff; }",
  ".al-step.is-done { color: #16a34a; }",
  ".al-step.is-done i { background: #16a34a; border-color: #16a34a; color: #fff; }",
  ".al-form { padding: 16px 24px 22px; display: flex; flex-direction: column; gap: 14px; }",
  ".al-field { display: flex; flex-direction: column; gap: 6px; }",
  ".al-label { font-size: 12px; font-weight: 600; color: #475569; }",
  ".al-input {",
  "  width: 100%; height: 42px; padding: 0 12px; border-radius: 10px;",
  "  border: 1px solid #dbe2ea; background: #f8fafc; color: #0f172a;",
  "  font-size: 14px; outline: none; transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;",
  "}",
  ".al-input:focus { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 3px rgba(37, 99, 235, .16); }",
  ".al-field.is-guide .al-input { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, .14); animation: al-pulse 1.6s ease-in-out infinite; }",
  "@keyframes al-pulse { 0%, 100% { box-shadow: 0 0 0 3px rgba(37, 99, 235, .12); } 50% { box-shadow: 0 0 0 6px rgba(37, 99, 235, .06); } }",
  ".al-field.is-invalid .al-input { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220, 38, 38, .12); }",
  ".al-pass { position: relative; display: block; }",
  ".al-pass .al-input { padding-right: 62px; }",
  ".al-eye {",
  "  position: absolute; top: 50%; right: 8px; transform: translateY(-50%);",
  "  height: 28px; padding: 0 10px; border: none; border-radius: 7px; cursor: pointer;",
  "  background: transparent; color: #2563eb; font-size: 12px; font-weight: 600;",
  "}",
  ".al-eye:hover { background: #eff6ff; }",
  ".al-row { display: flex; gap: 12px; }",
  ".al-field-half { flex: 1; min-width: 0; }",
  ".al-select-wrap { position: relative; display: block; }",
  ".al-select { width: 100%; height: 42px; padding: 0 36px 0 12px; border-radius: 10px; border: 1px solid #dbe2ea; background: #f8fafc; color: #0f172a; font-size: 14px; font-family: inherit; appearance: none; -webkit-appearance: none; outline: none; cursor: pointer; transition: border-color .15s ease, box-shadow .15s ease, background .15s ease; }",
  ".al-select:focus { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 3px rgba(37, 99, 235, .16); }",
  ".al-select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #64748b; pointer-events: none; }",
  ".al-select option { background: #ffffff; color: #0f172a; }",
  ".al-switch { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }",
  ".al-switch input { position: absolute; opacity: 0; pointer-events: none; }",
  ".al-switch-track { width: 40px; height: 24px; border-radius: 999px; background: #e2e8f0; position: relative; transition: background .18s ease; flex: none; }",
  ".al-switch-thumb { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(15, 23, 42, .25); transition: transform .18s ease; }",
  ".al-switch input:checked + .al-switch-track { background: #2563eb; }",
  ".al-switch input:checked + .al-switch-track .al-switch-thumb { transform: translateX(16px); }",
  ".al-switch input:focus-visible + .al-switch-track { box-shadow: 0 0 0 3px rgba(37, 99, 235, .25); }",
  ".al-switch-text { font-size: 13px; color: #334155; }",
  ".al-terms { display: flex; gap: 10px; align-items: flex-start; padding: 12px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; cursor: pointer; }",
  ".al-terms input { width: 16px; height: 16px; margin: 2px 0 0; accent-color: #2563eb; flex: none; }",
  ".al-terms span { font-size: 12px; line-height: 1.6; color: #475569; }",
  ".al-terms.is-invalid { border-color: #dc2626; background: #fef2f2; }",
  ".al-actions { display: flex; gap: 10px; margin-top: 4px; flex-wrap: wrap; }",
  ".al-btn { height: 42px; padding: 0 18px; border-radius: 10px; border: 1px solid transparent; font-size: 14px; font-weight: 600; cursor: pointer; transition: transform .12s ease, background .15s ease, opacity .15s ease; }",
  ".al-btn:active { transform: scale(.98); }",
  ".al-btn-primary { flex: 1; background: #2563eb; color: #fff; }",
  ".al-btn-primary:hover { background: #1d4ed8; }",
  ".al-btn-ghost { background: transparent; color: #64748b; border-color: #dbe2ea; }",
  ".al-btn-ghost:hover { background: #f8fafc; color: #0f172a; }",
  ".al-hint { margin: 0; min-height: 18px; font-size: 12px; line-height: 1.5; color: #64748b; }",
  ".al-hint.is-error { color: #dc2626; }",
  ".al-hint.is-ok { color: #16a34a; }",
  ".al-btn-secondary { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }",
  ".al-btn-secondary:hover { background: #dbeafe; }",
  ".al-btn-block { width: 100%; margin-top: 2px; }",
  ".al-btn:disabled { opacity: .45; cursor: not-allowed; }",
  ".al-tour { position: fixed; inset: 0; pointer-events: none; z-index: 2147483647; }",
  ".al-tour-hole { position: fixed; display: none; border: 2px solid #2563eb; border-radius: 10px; box-shadow: 0 0 0 9999px rgba(15, 23, 42, .55); pointer-events: none; transition: left .15s ease, top .15s ease, width .15s ease, height .15s ease; }",
  ".al-tour-bubble { position: fixed; width: 360px; max-width: calc(100vw - 24px); background: #fff; color: #0f172a; border-radius: 14px; padding: 16px 18px; box-shadow: 0 20px 60px rgba(15, 23, 42, .4); pointer-events: auto; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }",
  ".al-tour-progress { font-size: 11px; font-weight: 700; letter-spacing: .08em; color: #2563eb; text-transform: uppercase; }",
  ".al-tour-title { margin-top: 6px; font-size: 15px; font-weight: 700; }",
  ".al-tour-text { margin-top: 6px; font-size: 13px; line-height: 1.6; color: #475569; }",
  ".al-tour-actions { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }",
  ".al-tour-actions .al-btn { height: 34px; padding: 0 12px; font-size: 13px; }",
  ".al-tour-actions .al-btn-primary { flex: 1; }",
  ".al-picker { position: fixed; inset: 0; pointer-events: none; z-index: 2147483647; }",
  ".al-pick-hole { position: fixed; display: none; border: 2px solid #2563eb; border-radius: 8px; background: rgba(37, 99, 235, .08); pointer-events: none; }",
  ".al-pick-label { position: fixed; display: none; padding: 3px 8px; border-radius: 6px; background: #0f172a; color: #fff; font: 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; pointer-events: none; white-space: nowrap; }",
  ".al-pick-bar { position: fixed; left: 50%; bottom: 20px; transform: translateX(-50%); width: min(560px, calc(100vw - 32px)); background: #fff; color: #0f172a; border-radius: 14px; box-shadow: 0 20px 60px rgba(15, 23, 42, .4); padding: 14px 18px; pointer-events: auto; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }",
  ".al-pick-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }",
  ".al-pick-badge { font-size: 11px; font-weight: 700; letter-spacing: .06em; color: #2563eb; }",
  ".al-pick-step { font-size: 11px; color: #64748b; }",
  ".al-pick-title { margin-top: 6px; font-size: 15px; font-weight: 700; }",
  ".al-pick-text { margin-top: 4px; font-size: 13px; line-height: 1.6; color: #475569; }",
  ".al-pick-actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }",
  ".al-pick-actions .al-btn { height: 36px; padding: 0 14px; font-size: 13px; }",
  ".al-toast {",
  "  position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%) translateY(8px);",
  "  padding: 10px 16px; border-radius: 10px; background: #0f172a; color: #fff;",
  "  font: 600 13px/1.4 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;",
  "  box-shadow: 0 10px 30px rgba(15, 23, 42, .3); opacity: 0; transition: opacity .18s ease, transform .18s ease;",
  "  z-index: 2147483647; pointer-events: none;",
  "}",
  ".al-toast.is-show { opacity: 1; transform: translateX(-50%) translateY(0); }",
  "@media (prefers-color-scheme: dark) {",
  "  .al-panel { background: #0f172a; color: #e2e8f0; }",
  "  .al-host, .al-label, .al-switch-text, .al-hint { color: #94a3b8; }",
  "  .al-input { background: #111c31; border-color: #24324a; color: #e2e8f0; }",
  "  .al-select { background: #111c31; border-color: #24324a; color: #e2e8f0; }",
  "  .al-select:focus { background: #0b1526; }",
  "  .al-select-arrow { color: #94a3b8; }",
  "  .al-select option { background: #0f172a; color: #e2e8f0; }",
  "  .al-input:focus { background: #0b1526; }",
  "  .al-close:hover { background: #1e293b; color: #e2e8f0; }",
  "  .al-switch-track { background: #334155; }",
  "  .al-terms { background: #111c31; border-color: #24324a; }",
  "  .al-terms span { color: #94a3b8; }",
  "  .al-terms.is-invalid { background: #2a1112; border-color: #7f1d1d; }",
  "  .al-btn-ghost { color: #94a3b8; border-color: #24324a; }",
  "  .al-btn-ghost:hover { background: #111c31; color: #e2e8f0; }",
  "  .al-step i { border-color: #334155; }",
  "  .al-eye:hover { background: #1e293b; }",
  "  .al-btn-secondary { background: #172554; color: #93c5fd; border-color: #1e3a8a; }",
  "  .al-btn-secondary:hover { background: #1e3a8a; }",
  "  .al-tour-bubble { background: #0f172a; color: #e2e8f0; }",
  "  .al-tour-text { color: #94a3b8; }",
  "  .al-pick-bar { background: #0f172a; color: #e2e8f0; }",
  "  .al-pick-text { color: #94a3b8; }",
  "}",
].join("\n");

const FAB_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">' +
  '<circle cx="12" cy="8" r="3.2"></circle>' +
  '<path d="M5 20c.7-3.4 3.4-5.4 7-5.4s6.3 2 7 5.4" stroke-linecap="round"></path>' +
  "</svg>";

let hostEl = null;
let shadowRoot = null;
let fabEl = null;
let layerEl = null;
let toastTimer = null;


let currentHostname = "";
let onSavedCallback = null;

function ensureRoot() {
  if (hostEl && hostEl.isConnected) {
    return;
  }

  hostEl = document.createElement("div");
  hostEl.id = "auto-login-ui-host";
  hostEl.style.setProperty("all", "initial", "important");
  document.documentElement.appendChild(hostEl);

  shadowRoot = hostEl.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = STYLE_TEXT;
  shadowRoot.appendChild(style);

  layerEl = document.createElement("div");
  layerEl.className = "al-layer";
  layerEl.hidden = true;
  shadowRoot.appendChild(layerEl);
}

function stepMarkup() {
  return [
    '<ol class="al-steps">',
    '<li class="al-step" data-step="1"><i>1</i><span>填写账号</span></li>',
    '<li class="al-step" data-step="2"><i>2</i><span>确认站点</span></li>',
    '<li class="al-step" data-step="3"><i>3</i><span>勾选协议</span></li>',
    '<li class="al-step" data-step="4"><i>4</i><span>保存</span></li>',
    "</ol>",
  ].join("");
}

function panelMarkup() {
  return [
    '<div class="al-mask"></div>',
    '<section class="al-panel" role="dialog" aria-modal="true" aria-label="Auto Login 配置">',
    '  <header class="al-head">',
    '    <div class="al-brand">',
    '      <div><div class="al-title">Auto Login</div><div class="al-host"></div></div>',
    "    </div>",
    '    <button class="al-close" type="button" aria-label="关闭">×</button>',
    "  </header>",
    stepMarkup(),
    '  <form class="al-form" novalidate>',
    '    <label class="al-field" data-field="username">',
    '      <span class="al-label">用户名</span>',
    '      <input class="al-input" id="al-username" type="text" autocomplete="off" spellcheck="false" placeholder="请输入用户名或邮箱" />',
    "    </label>",
    '    <label class="al-field" data-field="password">',
    '      <span class="al-label">密码</span>',
    '      <span class="al-pass">',
    '        <input class="al-input" id="al-password" type="password" autocomplete="off" placeholder="请输入密码" />',
    '        <button class="al-eye" type="button" aria-label="显示密码">显示</button>',
    "      </span>",
    "    </label>",
    '    <div class="al-row">',
    '      <label class="al-field al-field-half" data-field="site_type">',
    '        <span class="al-label">站点类型</span>',
    '        <span class="al-select-wrap">',
    '          <select class="al-select" id="al-site-type"></select>',
    '          <svg class="al-select-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    '        </span>',
    "      </label>",
    '      <label class="al-field al-field-half" data-field="site_entrance">',
    '        <span class="al-label">入口路径（可选）</span>',
    '        <input class="al-input" id="al-entrance" type="text" placeholder="如 /login" />',
    "      </label>",
    "    </div>",
    '    <label class="al-switch">',
    '      <input id="al-enabled" type="checkbox" />',
    '      <span class="al-switch-track"><span class="al-switch-thumb"></span></span>',
    '      <span class="al-switch-text">启用该站点的自动登录</span>',
    "    </label>",
    '    <label class="al-terms" data-field="terms">',
    '      <input id="al-terms" type="checkbox" />',
    "      <span></span>",
    "    </label>",
    '    <div class="al-actions">',
    '      <button class="al-btn al-btn-primary" type="submit">保存配置</button>',
    '      <button class="al-btn al-btn-secondary" id="al-tour" type="button">示教模式</button>',
    "    </div>",
    '    <button class="al-btn al-btn-ghost al-btn-block" id="al-clear" type="button">清除该站点配置</button>',
    '    <p class="al-hint"></p>',
    "  </form>",
    "</section>",
  ].join("");
}

function buildPanel() {
  ensureRoot();
  layerEl.innerHTML = panelMarkup();
  layerEl.querySelector(".al-host").textContent = currentHostname;
  layerEl.querySelector(".al-host").title = currentHostname;

  const termsText = layerEl.querySelector(".al-terms span");
  termsText.textContent = config.TERMS_TEXT;


  const typeSelect = layerEl.querySelector("#al-site-type");
  config.SITE_TYPES.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    typeSelect.appendChild(option);
  });

  const customOption = document.createElement("option");
  customOption.value = config.CUSTOM_SITE_TYPE;
  customOption.textContent = "自定义（本页示教）";
  typeSelect.appendChild(customOption);

  const toast = document.createElement("div");
  toast.className = "al-toast";
  layerEl.appendChild(toast);

  bindPanelEvents();
  return layerEl;
}

function cachedElements() {
  return {
    layer: layerEl,
    panel: layerEl.querySelector(".al-panel"),
    username: layerEl.querySelector("#al-username"),
    password: layerEl.querySelector("#al-password"),
    siteType: layerEl.querySelector("#al-site-type"),
    entrance: layerEl.querySelector("#al-entrance"),
    enabled: layerEl.querySelector("#al-enabled"),
    terms: layerEl.querySelector("#al-terms"),
    eye: layerEl.querySelector(".al-eye"),
    save: layerEl.querySelector(".al-btn-primary"),
    clear: layerEl.querySelector("#al-clear"),
    tour: layerEl.querySelector("#al-tour"),
    close: layerEl.querySelector(".al-close"),
    mask: layerEl.querySelector(".al-mask"),
    hint: layerEl.querySelector(".al-hint"),
    toast: layerEl.querySelector(".al-toast"),
    steps: Array.from(layerEl.querySelectorAll(".al-step")),
    fields: {
      username: layerEl.querySelector('[data-field="username"]'),
      password: layerEl.querySelector('[data-field="password"]'),
      terms: layerEl.querySelector('[data-field="terms"]'),
    },
  };
}

function bindPanelEvents() {
  const el = cachedElements();

  el.mask.addEventListener("click", closePanel);
  el.close.addEventListener("click", closePanel);

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && layerEl && !layerEl.hidden) {
        closePanel();
      }
    },
    true
  );

  el.eye.addEventListener("click", () => {
    const show = el.password.type === "password";
    el.password.type = show ? "text" : "password";
    el.eye.textContent = show ? "隐藏" : "显示";
    el.eye.setAttribute("aria-label", show ? "隐藏密码" : "显示密码");
  });

  const refresh = () => refreshSteps();
  el.username.addEventListener("input", refresh);
  el.password.addEventListener("input", refresh);
  el.terms.addEventListener("change", refresh);
  el.siteType.addEventListener("change", refresh);
  el.enabled.addEventListener("change", refresh);
  el.entrance.addEventListener("input", refresh);

  layerEl.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    savePanel();
  });

  el.tour.addEventListener("click", startInstruct);

  el.clear.addEventListener("click", () => {
    const next = config.clearConfig(currentHostname);
    showToast("已清除该站点的配置");
    if (typeof onSavedCallback === "function") {
      onSavedCallback(next);
    }
    closePanel();
  });
}

function setInvalid(fieldName, invalid) {
  const el = cachedElements();
  const target = el.fields[fieldName];
  if (!target) {
    return;
  }
  target.classList.toggle("is-invalid", Boolean(invalid));
}

function currentDraft() {
  const el = cachedElements();
  return {
    username: el.username.value.trim(),
    password: el.password.value,
    site_type: el.siteType.value,
    site_enabled: el.enabled.checked,
    site_entrance: el.entrance.value.trim(),
    terms_accepted: el.terms.checked,
  };
}

function refreshSteps() {
  const el = cachedElements();
  const draft = currentDraft();

  const done = [
    draft.username !== "" && draft.username !== config.FIELD_DEFAULTS.username,
    draft.site_type !== "",
    draft.terms_accepted,
    false,
  ];

  const activeIndex = done.findIndex((value) => !value);
  const steps = el.steps;

  steps.forEach((step, index) => {
    step.classList.toggle("is-done", done[index]);
    step.classList.toggle("is-active", index === activeIndex);
  });

  const guiding =
    activeIndex === 0
      ? "username"
      : activeIndex === 1
      ? "site_type"
      : activeIndex === 2
      ? "terms"
      : null;

  Object.entries(el.fields).forEach(([name, field]) => {
    field.classList.toggle(
      "is-guide",
      name === guiding || (name === "terms" && guiding === "terms")
    );
  });

  const hints = [
    "第 1 步：填写该站点的用户名，保存后会与密码一起保存在本机。",
    "第 2 步：确认站点类型，脚本会按对应站点的登录表单选择器自动填充。",
    "第 3 步：勾选同意说明，账号密码只会保存在本机浏览器存储中。",
    "第 4 步：点击「保存配置」，配置完成后即可自动登录。",
  ];

  if (activeIndex >= 0) {
    el.hint.textContent = hints[activeIndex] || "";
    el.hint.className = "al-hint";
  } else {
    el.hint.textContent = "配置完整，点击「保存配置」生效。";
    el.hint.className = "al-hint is-ok";
  }

  setInvalid("username", false);
  setInvalid("password", false);
  setInvalid("terms", false);
}

function showToast(message) {
  const el = cachedElements();
  if (!el.toast) {
    return;
  }
  el.toast.textContent = message;
  el.toast.classList.add("is-show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.toast.classList.remove("is-show");
  }, 2200);
}

function savePanel() {
  const el = cachedElements();
  const draft = currentDraft();
  let hasError = false;

  if (draft.username === "" || draft.username === config.FIELD_DEFAULTS.username) {
    setInvalid("username", true);
    hasError = true;
  }

  if (draft.password === "") {
    setInvalid("password", true);
    hasError = true;
  }

  if (!draft.terms_accepted) {
    setInvalid("terms", true);
    hasError = true;
  }

  if (hasError) {
    el.hint.textContent = "请先补全带红色标记的必填项。";
    el.hint.className = "al-hint is-error";
    showToast("还有必填项未完成");
    return;
  }

  const next = config.saveConfig(currentHostname, {
    ...draft,
    site_enabled: el.enabled.checked,
  });

  if (typeof onSavedCallback === "function") {
    onSavedCallback(next);
  }

  el.hint.textContent = "配置已保存。刷新页面或重新进入登录页即可自动填充。";
  el.hint.className = "al-hint is-ok";
  el.save.textContent = "已保存";
  showToast("配置已保存");

  const steps = el.steps;
  steps.forEach((step) => {
    step.classList.remove("is-active");
    step.classList.add("is-done");
  });
  Object.values(el.fields).forEach((field) => {
    field.classList.remove("is-guide", "is-invalid");
  });

  updateFabVisibility(next);
}

function applyConfigToPanel(cfg) {
  const el = cachedElements();
  el.username.value = cfg.username === config.FIELD_DEFAULTS.username ? "" : cfg.username;
  el.password.value = cfg.password === config.FIELD_DEFAULTS.password ? "" : cfg.password;
  el.siteType.value = cfg.site_type;
  el.entrance.value = cfg.site_entrance || "";

  const configured = Boolean(
    cfg.username &&
      cfg.username !== config.FIELD_DEFAULTS.username &&
      cfg.password
  );
  // 首次配置时默认勾选启用，避免用户填完账号却忘记打开开关
  el.enabled.checked = Boolean(cfg.site_enabled) || !configured;
  el.terms.checked = Boolean(cfg.terms_accepted);
  el.password.type = "password";
  el.eye.textContent = "显示";
  el.save.textContent = "保存配置";
  refreshSteps();
}

function openPanel(hostname, cfg, onSaved) {
  ensureRoot();
  currentHostname = hostname;
  onSavedCallback = onSaved;

  if (!layerEl.querySelector(".al-panel")) {
    buildPanel();
  }

  layerEl.querySelector(".al-host").textContent = hostname;
  layerEl.querySelector(".al-host").title = hostname;

  applyConfigToPanel(cfg);
  layerEl.hidden = false;

  const el = cachedElements();
  setTimeout(() => {
    if (layerEl.hidden) {
      return;
    }
    if (!el.username.value) {
      el.username.focus();
    } else if (!el.password.value) {
      el.password.focus();
    } else if (!el.terms.checked) {
      el.terms.focus();
    } else {
      el.save.focus();
    }
  }, 60);
}

function closePanel() {
  if (!layerEl) {
    return;
  }
  layerEl.hidden = true;
}

function updateFabVisibility(cfg) {
  const incomplete =
    !cfg.terms_accepted ||
    !cfg.username ||
    cfg.username === config.FIELD_DEFAULTS.username ||
    !cfg.password;

  if (!incomplete) {
    if (fabEl) {
      fabEl.remove();
      fabEl = null;
    }
    return;
  }

  if (fabEl) {
    return;
  }

  ensureRoot();
  fabEl = document.createElement("button");
  fabEl.type = "button";
  fabEl.className = "al-fab";
  fabEl.title = "配置 Auto Login";
  fabEl.setAttribute("aria-label", "配置 Auto Login");
  fabEl.innerHTML = FAB_SVG;
  fabEl.addEventListener("click", () => {
    if (typeof fabEl.__open === "function") {
      fabEl.__open();
    }
  });
  shadowRoot.appendChild(fabEl);
}

function mountSetupFab(hostname, cfg, onOpen) {
  updateFabVisibility(cfg);
  if (fabEl) {
    fabEl.__open = () => onOpen(hostname);
  }
}

/* ---------- 示教：教脚本识别本页登录表单 ---------- */

function startInstruct() {
  if (layerEl) {
    layerEl.hidden = true;
  }

  picker.startPicker({
    hostEl: hostEl,
    shadowRoot: shadowRoot,
    hostname: currentHostname,
    onDone: function () {
      if (layerEl) {
        layerEl.hidden = false;
      }
      const el = cachedElements();
      el.siteType.value = config.CUSTOM_SITE_TYPE;
      el.hint.textContent =
        "示教完成：已记录本站点的登录步骤，站点类型已切换为「自定义（本页示教）」。填写账号后保存即可。";
      el.hint.className = "al-hint is-ok";
      showToast("示教完成");
      refreshSteps();
    },
    onCancel: function () {
      if (layerEl) {
        layerEl.hidden = false;
      }
    },
  });
}

module.exports = {
  openPanel,
  closePanel,
  mountSetupFab,
  updateFabVisibility,
};