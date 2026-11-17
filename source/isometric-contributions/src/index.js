/**
 * Isometric Contributions (userscript)
 *
 * 在 GitHub 个人主页把贡献热力图渲染成等轴测 3D 立方体视图，
 * 并提供 2D / 3D / Both 三种显示模式（默认 3D）。
 *
 * 诊断：控制台过滤 "[Isometric Contributions]" 可查看初始化过程与失败原因。
 */

(function () {
  "use strict";

  var VERSION = "0.0.2";
  var MODE_KEY = "isometric-contributions-mode";
  var MODES = ["squares", "cubes", "both"];
  var DEFAULT_MODE = "cubes";
  var WRAPPER_ID = "isometric-contributions-wrapper";
  var CANVAS_ID = "isometric-contributions";
  var GRAPH_CLASS = "ic-contribution-graph";

  var COLOR_LIGHT = [
    { top: "#ebedf0", left: "#d7dbe0", right: "#e3e6ea" },
    { top: "#9be9a8", left: "#78c986", right: "#87d494" },
    { top: "#40c463", left: "#2f9e4c", right: "#37ae56" },
    { top: "#30a14e", left: "#237a3c", right: "#2a8c45" },
    { top: "#216e39", left: "#18552c", right: "#1c6132" }
  ];
  var COLOR_DARK = [
    { top: "#161b22", left: "#10151b", right: "#131920" },
    { top: "#0e4429", left: "#08301c", right: "#0b3a22" },
    { top: "#006d32", left: "#004e24", right: "#005d2a" },
    { top: "#26a641", left: "#1b7a30", right: "#209038" },
    { top: "#39d353", left: "#29a03e", right: "#31b949" }
  ];

  var CSS_TEXT = [
    ".ic-squares #" + WRAPPER_ID + " { display: none; }",
    ".ic-cubes ." + GRAPH_CLASS + " { display: none !important; }",
    "#" + WRAPPER_ID + " { margin-top: 8px; }",
    "#" + CANVAS_ID + " { display: block; width: 100%; }",
    ".ic-toolbar { display: flex; justify-content: flex-end; align-items: center; gap: 6px; margin-bottom: 4px; }",
    ".ic-toggle-options { display: inline-flex; }",
    ".ic-toggle-option { cursor: pointer; }",
    ".ic-toggle-option.is-selected { font-weight: 600; box-shadow: inset 0 0 0 1px currentColor; }",
    ".ic-tooltip { position: absolute; z-index: 30; pointer-events: none; padding: 4px 8px; border-radius: 6px; font-size: 12px; line-height: 1.4; background: rgba(15, 23, 42, 0.92); color: #fff; white-space: nowrap; }"
  ].join("\n");

  var mode = DEFAULT_MODE;
  var canvas = null;
  var wrapper = null;
  var tooltipEl = null;
  var blocks = [];
  var resizeTimer = null;
  var retries = 0;
  var observer = null;

  function log(message, data) {
    try {
      if (data === undefined) {
        console.info("[Isometric Contributions] " + message);
      } else {
        console.info("[Isometric Contributions] " + message, data);
      }
    } catch (error) {
      /* ignore */
    }
  }

  function warn(message, data) {
    try {
      if (data === undefined) {
        console.warn("[Isometric Contributions] " + message);
      } else {
        console.warn("[Isometric Contributions] " + message, data);
      }
    } catch (error) {
      /* ignore */
    }
  }

  function gmGet(key, fallback) {
    try {
      if (typeof GM_getValue === "function") {
        return GM_getValue(key, fallback);
      }
      var stored = window.localStorage.getItem(key);
      return stored === null ? fallback : stored;
    } catch (error) {
      return fallback;
    }
  }

  function gmSet(key, value) {
    try {
      if (typeof GM_setValue === "function") {
        GM_setValue(key, value);
        return;
      }
      window.localStorage.setItem(key, value);
    } catch (error) {
      /* ignore */
    }
  }

  function addStyle(css) {
    try {
      if (typeof GM_addStyle === "function") {
        GM_addStyle(css);
        return;
      }
    } catch (error) {
      /* ignore */
    }
    var style = document.createElement("style");
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  function isDarkMode() {
    var html = document.documentElement;
    var attr = html.getAttribute("data-color-mode");
    if (attr === "dark") {
      return true;
    }
    if (attr === "light") {
      return false;
    }
    return Boolean(document.body && document.body.classList.contains("dark"));
  }

  function cellSelector() {
    return (
      "td.ContributionCalendar-day[data-date], " +
      "td[data-date][data-level], " +
      "[data-date][data-level]"
    );
  }

  function findCells() {
    return document.querySelectorAll(cellSelector());
  }

  function findGraphRoot(cell) {
    var node = cell;
    while (node && node !== document.body) {
      if (
        node.classList &&
        (node.classList.contains("js-calendar-graph") ||
          /calendar-graph/i.test(node.className || ""))
      ) {
        return node;
      }
      if (node.tagName === "TABLE") {
        return node.parentElement || node;
      }
      node = node.parentElement;
    }
    return cell.parentElement || cell;
  }

  function findContainer(graphRoot) {
    var node = graphRoot;
    while (node && node !== document.body) {
      if (
        node.classList &&
        (node.classList.contains("js-yearly-contributions") ||
          /yearly-contributions/i.test(node.className || ""))
      ) {
        return node;
      }
      node = node.parentElement;
    }
    return graphRoot.parentElement || graphRoot;
  }

  function parseCount(cell) {
    var labelId = cell.getAttribute("aria-labelledby");
    if (labelId) {
      var tip = document.getElementById(labelId);
      if (tip) {
        var tipText = (tip.textContent || "").trim();
        var fromTip = parseCountText(tipText);
        if (fromTip !== null) {
          return fromTip;
        }
      }
    }

    var ariaLabel = cell.getAttribute("aria-label");
    if (ariaLabel) {
      var fromAria = parseCountText(ariaLabel);
      if (fromAria !== null) {
        return fromAria;
      }
    }

    var tooltipAttr = cell.getAttribute("data-tooltip");
    if (tooltipAttr) {
      var fromAttr = parseCountText(tooltipAttr);
      if (fromAttr !== null) {
        return fromAttr;
      }
    }

    return null;
  }

  function parseCountText(text) {
    if (!text) {
      return null;
    }
    if (/no contributions/i.test(text)) {
      return 0;
    }
    var match = text.match(/([\d,]+)\s+contribution/i);
    if (match) {
      return parseInt(match[1].replace(/,/g, ""), 10);
    }
    return null;
  }

  function readGrid(cells) {
    if (!cells || !cells.length) {
      return null;
    }

    var map = new Map();
    Array.prototype.forEach.call(cells, function (cell) {
      var dateStr = cell.getAttribute("data-date");
      if (!dateStr || map.has(dateStr)) {
        return;
      }
      var level = Number(cell.getAttribute("data-level") || "0");
      if (!isFinite(level)) {
        level = 0;
      }
      level = Math.max(0, Math.min(4, level));
      var count = parseCount(cell);
      if (count === null) {
        count = level;
      }
      map.set(dateStr, { dateStr: dateStr, level: level, count: count });
    });

    if (!map.size) {
      return null;
    }

    var dates = Array.from(map.keys()).sort();
    var first = new Date(dates[0] + "T00:00:00Z");
    var start = new Date(first.getTime());
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());
    var last = new Date(dates[dates.length - 1] + "T00:00:00Z");
    var cols = Math.floor((last.getTime() - start.getTime()) / 86400000 / 7) + 1;
    if (cols < 1) {
      cols = 1;
    }

    var grid = [];
    for (var index = 0; index < cols; index++) {
      grid.push(new Array(7));
    }

    var max = 0;
    map.forEach(function (item) {
      var date = new Date(item.dateStr + "T00:00:00Z");
      var colIndex = Math.floor((date.getTime() - start.getTime()) / 86400000 / 7);
      var rowIndex = date.getUTCDay();
      if (colIndex >= 0 && colIndex < cols) {
        grid[colIndex][rowIndex] = item;
      }
      if (item.count > max) {
        max = item.count;
      }
    });

    return { grid: grid, cols: cols, maxCount: max, days: map.size };
  }

  function drawCube(ctx, cx, cy, halfW, halfH, height, colors) {
    var topY = cy - height;

    ctx.beginPath();
    ctx.moveTo(cx, topY - halfH);
    ctx.lineTo(cx + halfW, topY);
    ctx.lineTo(cx, topY + halfH);
    ctx.lineTo(cx - halfW, topY);
    ctx.closePath();
    ctx.fillStyle = colors.top;
    ctx.fill();

    if (height > 0.5) {
      ctx.beginPath();
      ctx.moveTo(cx - halfW, topY);
      ctx.lineTo(cx, topY + halfH);
      ctx.lineTo(cx, cy + halfH);
      ctx.lineTo(cx - halfW, cy);
      ctx.closePath();
      ctx.fillStyle = colors.left;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, topY + halfH);
      ctx.lineTo(cx + halfW, topY);
      ctx.lineTo(cx + halfW, cy);
      ctx.lineTo(cx, cy + halfH);
      ctx.closePath();
      ctx.fillStyle = colors.right;
      ctx.fill();
    }
  }

  function render() {
    if (!canvas || !tooltipEl || !wrapper) {
      return;
    }

    var cells = findCells();
    var data = readGrid(cells);
    if (!data) {
      warn("未解析到贡献数据（单元格数量：" + cells.length + "）");
      return;
    }

    var ctx = canvas.getContext ? canvas.getContext("2d") : null;
    if (!ctx) {
      warn("canvas.getContext('2d') 不可用");
      return;
    }

    var width = Math.max(320, Math.round(wrapper.clientWidth || 900));
    var rows = 7;
    var cols = data.cols;
    var tileW = Math.max(6, Math.min(12, (width * 0.86) / (cols + rows)));
    var tileH = tileW * 0.55;
    var maxHeight = Math.round(width * 0.14);
    var gap = 0.88;
    var gridHeight = (cols + rows - 2) * tileH + maxHeight + 56;

    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(gridHeight * dpr);
    canvas.style.height = gridHeight + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, gridHeight);

    var norm = data.maxCount > 0 ? Math.sqrt(data.maxCount) : 1;
    var originX = width / 2 - ((cols - rows) * tileW) / 2;
    var originY = 28 + maxHeight;
    var palette = isDarkMode() ? COLOR_DARK : COLOR_LIGHT;

    blocks = [];
    var list = [];
    for (var col = 0; col < cols; col++) {
      for (var row = 0; row < rows; row++) {
        list.push({ col: col, row: row, item: data.grid[col][row] || null });
      }
    }
    list.sort(function (a, b) {
      return a.col + a.row - (b.col + b.row);
    });

    list.forEach(function (entry) {
      var item = entry.item;
      var level = item ? item.level : 0;
      var count = item ? item.count : 0;
      var height = count > 0 ? 1.5 + (Math.sqrt(count) / norm) * maxHeight : 0;
      var cx = originX + (entry.col - entry.row) * tileW;
      var cy = originY + (entry.col + entry.row) * tileH;
      drawCube(ctx, cx, cy, tileW * gap, tileH * gap, height, palette[level]);
      if (item) {
        blocks.push({
          x: cx,
          y: cy - height,
          halfW: tileW * gap,
          halfH: tileH * gap,
          item: item
        });
      }
    });

    log("渲染完成", {
      days: data.days,
      cols: cols,
      maxCount: data.maxCount,
      width: width,
      height: gridHeight
    });
  }

  function debouncedRender() {
    if (resizeTimer) {
      window.clearTimeout(resizeTimer);
    }
    resizeTimer = window.setTimeout(function () {
      resizeTimer = null;
      render();
    }, 200);
  }

  function onCanvasMove(event) {
    if (!tooltipEl || !canvas) {
      return;
    }
    var rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }
    var dpr = window.devicePixelRatio || 1;
    var x = ((event.clientX - rect.left) / rect.width) * (canvas.width / dpr);
    var y = ((event.clientY - rect.top) / rect.height) * (canvas.height / dpr);

    var found = null;
    for (var index = 0; index < blocks.length; index++) {
      var block = blocks[index];
      var dx = Math.abs(x - block.x);
      var dy = Math.abs(y - block.y);
      if (dx / (block.halfW * 1.1) + dy / (block.halfH * 1.6) <= 1.15) {
        found = block;
        break;
      }
    }

    if (!found) {
      tooltipEl.hidden = true;
      return;
    }

    var item = found.item;
    tooltipEl.hidden = false;
    tooltipEl.textContent =
      item.dateStr + " · " + item.count + " contribution" + (item.count === 1 ? "" : "s");
    tooltipEl.style.left =
      Math.min(rect.width - 160, Math.max(0, event.clientX - rect.left + 12)) + "px";
    tooltipEl.style.top = Math.max(0, event.clientY - rect.top - 32) + "px";
  }

  function updateToggleButtons() {
    var buttons = document.querySelectorAll(".ic-toggle-option");
    Array.prototype.forEach.call(buttons, function (button) {
      button.classList.toggle(
        "is-selected",
        button.getAttribute("data-ic-option") === mode
      );
    });
  }

  function applyMode(next) {
    mode = MODES.indexOf(next) >= 0 ? next : DEFAULT_MODE;
    document.body.classList.toggle("ic-squares", mode === "squares");
    document.body.classList.toggle("ic-cubes", mode === "cubes");
    document.body.classList.toggle("ic-both", mode === "both");
    updateToggleButtons();
    gmSet(MODE_KEY, mode);
    if (mode !== "squares") {
      render();
    }
  }

  function buildToolbar() {
    var toolbar = document.createElement("div");
    toolbar.className = "ic-toolbar";
    var group = document.createElement("span");
    group.className = "ic-toggle-options BtnGroup";
    [
      { label: "2D", value: "squares" },
      { label: "3D", value: "cubes" },
      { label: "Both", value: "both" }
    ].forEach(function (entry) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-sm ic-toggle-option";
      button.textContent = entry.label;
      button.setAttribute("data-ic-option", entry.value);
      button.addEventListener("click", function () {
        applyMode(entry.value);
      });
      group.appendChild(button);
    });
    toolbar.appendChild(group);
    return toolbar;
  }

  function cleanup() {
    var existing = document.getElementById(WRAPPER_ID);
    if (existing) {
      existing.remove();
    }
    document.body.classList.remove("ic-squares", "ic-cubes", "ic-both");
    blocks = [];
    canvas = null;
    wrapper = null;
    tooltipEl = null;
  }

  function init() {
    if (!document.body) {
      warn("document.body 还不存在，稍后重试");
      return false;
    }

    var cells = findCells();
    if (!cells.length) {
      if (retries < 40) {
        retries += 1;
        if (retries === 1 || retries % 5 === 0) {
          warn("尚未找到贡献图单元格，稍后重试（第 " + retries + " 次）", {
            cellSelectorHits: cells.length,
            dataDateHits: document.querySelectorAll("[data-date]").length,
            yearly: Boolean(document.querySelector(".js-yearly-contributions")),
            calendarGraph: Boolean(document.querySelector(".js-calendar-graph")),
            path: location.pathname
          });
        }
        window.setTimeout(function () {
          scheduleInit();
        }, 500);
        return false;
      }
      warn("多次重试后仍未找到贡献图，停止自动重试（可在个人主页刷新后重试）");
      return false;
    }

    if (document.getElementById(WRAPPER_ID)) {
      return true;
    }

    var graphRoot = findGraphRoot(cells[0]);
    var container = findContainer(graphRoot);
    if (!graphRoot) {
      warn("找到单元格但没有定位到图表容器");
      return false;
    }

    wrapper = document.createElement("div");
    wrapper.id = WRAPPER_ID;

    var toolbar = buildToolbar();
    canvas = document.createElement("canvas");
    canvas.id = CANVAS_ID;
    tooltipEl = document.createElement("div");
    tooltipEl.className = "ic-tooltip";
    tooltipEl.hidden = true;

    wrapper.appendChild(toolbar);
    wrapper.appendChild(canvas);
    wrapper.appendChild(tooltipEl);

    graphRoot.classList.add(GRAPH_CLASS);
    graphRoot.parentNode.insertBefore(wrapper, graphRoot);

    canvas.addEventListener("mousemove", onCanvasMove);
    canvas.addEventListener("mouseleave", function () {
      if (tooltipEl) {
        tooltipEl.hidden = true;
      }
    });

    log("已找到贡献图并注入 3D 视图", {
      cells: cells.length,
      graphRoot: graphRoot.tagName + "." + (graphRoot.className || ""),
      container: container.tagName + "." + (container.className || "")
    });

    applyMode(mode);
    window.addEventListener("resize", debouncedRender);
    return true;
  }

  function scheduleInit() {
    try {
      init();
    } catch (error) {
      console.error("[Isometric Contributions] 初始化失败", error);
    }
  }

  function startObserver() {
    if (observer || !document.body) {
      return;
    }
    var scheduled = null;
    observer = new MutationObserver(function () {
      if (scheduled) {
        return;
      }
      scheduled = window.setTimeout(function () {
        scheduled = null;
        scheduleInit();
      }, 400);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  addStyle(CSS_TEXT);
  log("脚本已加载 v" + VERSION, { path: location.pathname });

  try {
    mode = gmGet(MODE_KEY, DEFAULT_MODE);
  } catch (error) {
    mode = DEFAULT_MODE;
  }
  if (MODES.indexOf(mode) < 0) {
    mode = DEFAULT_MODE;
  }

  document.addEventListener("DOMContentLoaded", function () {
    startObserver();
    scheduleInit();
  });
  document.addEventListener("turbo:load", function () {
    scheduleInit();
  });
  document.addEventListener("turbo:render", function () {
    scheduleInit();
  });
  document.addEventListener("pjax:end", function () {
    scheduleInit();
  });
  window.addEventListener("popstate", function () {
    scheduleInit();
  });

  if (document.readyState !== "loading") {
    startObserver();
    scheduleInit();
  }
})();