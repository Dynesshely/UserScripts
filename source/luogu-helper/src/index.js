import { styles } from "./styles.js";

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
