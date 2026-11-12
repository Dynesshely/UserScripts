// ==UserScript==
// @name        洛谷助手
// @description 洛谷题目页面增强脚本
// @version     0.0.1
// @author      Dynesshely
// @match       https://www.luogu.com.cn/*
// @downloadURL https://update.greasyfork.org/scripts/581027/%E6%B4%9B%E8%B0%B7%E5%8A%A9%E6%89%8B.user.js
// @icon        https://www.luogu.com.cn/favicon.ico
// @license     MIT
// @namespace   com.luogu.userscript
// @updateURL   https://update.greasyfork.org/scripts/581027/%E6%B4%9B%E8%B0%B7%E5%8A%A9%E6%89%8B.meta.js
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/styles.js
// 注入页面的样式文本（自原脚本内联模板字符串抽出，内容保持不变）
const styles = `#lh-fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #3498db;
  color: #fff;
  border: none;
  cursor: pointer;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 2px 10px rgba(0,0,0,.25);
  transition: transform .2s, background .2s, box-shadow .2s;
  user-select: none;
  padding: 0;
}
#lh-fab:hover {
  transform: scale(1.08);
  background: #2980b9;
  box-shadow: 0 4px 14px rgba(0,0,0,.3);
}
#lh-fab:active {
  transform: scale(.95);
}

#lh-panel {
  position: fixed;
  bottom: 84px;
  right: 28px;
  width: 380px;
  max-height: 55vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,.18);
  z-index: 99998;
  display: none;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  font-size: 14px;
  color: #333;
}
#lh-panel.show {
  display: flex;
}

#lh-panel .lh-panel-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  font-weight: 600;
  font-size: 15px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}
#lh-panel .lh-panel-close {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 0;
}
#lh-panel .lh-panel-close:hover {
  background: #f0f0f0;
  color: #333;
}

#lh-panel .lh-panel-body {
  overflow-y: auto;
  flex: 1;
}

#lh-panel .lh-section {
  padding: 10px 16px;
}
#lh-panel .lh-section + .lh-section {
  border-top: 1px solid #f0f0f0;
}

#lh-panel .lh-sec-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
#lh-panel .lh-sec-title {
  font-weight: 600;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
#lh-panel .lh-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
#lh-panel .lh-dot.ac  { background: #27ae60; }
#lh-panel .lh-dot.wa  { background: #e74c3c; }
#lh-panel .lh-dot.ud  { background: #95a5a6; }

#lh-panel .lh-copy {
  font-size: 11px;
  padding: 3px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fafafa;
  cursor: pointer;
  color: #888;
  transition: all .15s;
  white-space: nowrap;
  flex-shrink: 0;
}
#lh-panel .lh-copy:hover {
  background: #eee;
  border-color: #ccc;
  color: #555;
}
#lh-panel .lh-copy.ok {
  background: #27ae60;
  color: #fff;
  border-color: #27ae60;
}

#lh-panel .lh-pids {
  color: #555;
  line-height: 1.7;
  word-break: break-all;
  font-size: 13px;
  font-family: 'Consolas','Source Code Pro',monospace;
}
#lh-panel .lh-empty {
  color: #bbb;
  font-style: italic;
  font-size: 12px;
}
`;

;// ./src/index.js


(function () {
  'use strict';

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = styles;
    document.head.appendChild(style);
  }
  function findRowWrap() {
    const sel = ".row-wrap";
    const byClass = document.querySelector(sel);
    if (byClass) return byClass;
    const xpath = "/html/body/div[1]/div[4]/main/div/div/div/div[2]/div/div[1]/div[2]";
    const byXPath = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    return byXPath;
  }
  function parseStatus(row) {
    const svg = row.querySelector(".status svg");
    if (!svg) return "undone";
    const icon = svg.getAttribute("data-icon");
    if (icon === "check") return "ac";
    if (icon === "xmark") return "failed";
    return "undone";
  }
  function parsePid(row) {
    var _a, _b;
    return ((_b = (_a = row.querySelector(".pid")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim()) ?? "";
  }
  function collectProblems() {
    const groups = { ac: [], failed: [], undone: [] };
    const rowWrap = findRowWrap();
    if (!rowWrap) return groups;
    const rows = rowWrap.querySelectorAll(":scope > .row");
    for (const row of rows) {
      const pid = parsePid(row);
      if (!pid) continue;
      const status = parseStatus(row);
      groups[status].push({ pid, status });
    }
    return groups;
  }
  let fabEl = null;
  let panelEl = null;
  let panelVisible = false;
  function hidePanel() {
    panelVisible = false;
    panelEl == null ? void 0 : panelEl.classList.remove("show");
  }
  function showPanel() {
    if (!panelEl) return;
    const groups = collectProblems();
    renderPanelContent(panelEl, groups);
    panelVisible = true;
    panelEl.classList.add("show");
  }
  function togglePanel() {
    if (panelVisible) {
      hidePanel();
    } else {
      showPanel();
    }
  }
  function buildSection(status, label, colorClass, pids) {
    const n = pids.length;
    const joined = pids.join(", ");
    const has = n > 0;
    return `
<div class="lh-section">
  <div class="lh-sec-hd">
    <span class="lh-sec-title">
      <span class="lh-dot ${colorClass}"></span>${label} (${n})
    </span>
    ${has ? `<button class="lh-copy" data-pids="${escapeAttr(joined)}">复制</button>` : ""}
  </div>
  <div class="lh-pids">${has ? joined : '<span class="lh-empty">暂无</span>'}</div>
</div>`;
  }
  function escapeAttr(s) {
    return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  }
  function renderPanelContent(panel, groups) {
    const acPids = groups.ac.map((p) => p.pid);
    const failedPids = groups.failed.map((p) => p.pid);
    const undonePids = groups.undone.map((p) => p.pid);
    const total = acPids.length + failedPids.length + undonePids.length;
    panel.innerHTML = `
<div class="lh-panel-hd">
  <span>题目统计（共 ${total} 题）</span>
  <button class="lh-panel-close" title="关闭">✕</button>
</div>
<div class="lh-panel-body">
  ${buildSection("ac", "已通过", "ac", acPids)}
  ${buildSection("failed", "未通过", "wa", failedPids)}
  ${buildSection("undone", "未做", "ud", undonePids)}
</div>`;
    const closeBtn = panel.querySelector(".lh-panel-close");
    closeBtn == null ? void 0 : closeBtn.addEventListener("click", hidePanel);
    panel.querySelectorAll(".lh-copy").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pids = btn.dataset.pids ?? "";
        navigator.clipboard.writeText(pids).then(() => {
          btn.classList.add("ok");
          btn.textContent = "已复制!";
          setTimeout(() => {
            btn.classList.remove("ok");
            btn.textContent = "复制";
          }, 1500);
        }).catch(() => {
          btn.textContent = "失败";
          setTimeout(() => {
            btn.textContent = "复制";
          }, 1e3);
        });
      });
    });
  }
  function createUI() {
    fabEl = document.createElement("button");
    fabEl.id = "lh-fab";
    fabEl.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 4-6"/></svg>';
    fabEl.title = "题目统计";
    panelEl = document.createElement("div");
    panelEl.id = "lh-panel";
    fabEl.addEventListener("click", togglePanel);
    document.addEventListener("click", (e) => {
      if (!panelVisible) return;
      const t = e.target;
      if (!(fabEl == null ? void 0 : fabEl.contains(t)) && !(panelEl == null ? void 0 : panelEl.contains(t))) {
        hidePanel();
      }
    });
    document.body.appendChild(fabEl);
    document.body.appendChild(panelEl);
  }
  function removeUI() {
    fabEl == null ? void 0 : fabEl.remove();
    fabEl = null;
    panelEl == null ? void 0 : panelEl.remove();
    panelEl = null;
    panelVisible = false;
  }
  function isListPage() {
    return /^\/problem\/list(\?|$)/.test(window.location.pathname + window.location.search) || window.location.pathname === "/problem/list";
  }
  function handleRoute() {
    if (isListPage()) {
      if (!fabEl || !document.body.contains(fabEl)) {
        createUI();
      }
    } else {
      removeUI();
    }
  }
  function patchHistory(fn) {
    return function(...args) {
      const result = fn.apply(this, args);
      setTimeout(handleRoute, 80);
      return result;
    };
  }
  function setupSPA() {
    history.pushState = patchHistory(history.pushState);
    history.replaceState = patchHistory(history.replaceState);
    window.addEventListener("popstate", () => setTimeout(handleRoute, 80));
  }
  function main() {
    injectStyles();
    setupSPA();
    handleRoute();
  }
  main();

})();

/******/ })()
;