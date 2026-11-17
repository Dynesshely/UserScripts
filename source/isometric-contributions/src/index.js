/**
 * Isometric Contributions (userscript)
 *
 * 在 GitHub 个人主页把贡献热力图渲染成等轴测 3D 立方体视图，
 * 并提供 2D / 3D / Both 三种显示模式（默认 3D）。
 *
 * 数据来源：GitHub 贡献图表格 td.ContributionCalendar-day（data-date / data-level）
 * 以及其 aria-labelledby 指向的 tool-tip 文本。
 */

(function () {
  "use strict";

  var MODE_KEY = "isometric-contributions-mode";
  var MODES = ["squares", "cubes", "both"];
  var DEFAULT_MODE = "cubes";
  var WRAPPER_ID = "isometric-contributions-wrapper";
  var CANVAS_ID = "isometric-contributions";

  var COLORS_LIGHT = [
    { top: "#ebedf0", left: "#d7dbe0", right: "#e3e6ea" },
    { top: "#9be9a8", left: "#78c986", right: "#87d494" },
    { top: "#40c463", left: "#2f9e4c", right: "#37ae56" },
    { top: "#30a14e", left: "#237a3c", right: "#2a8c45" },
    { top: "#216e39", left: "#18552c", right: "#1c6132" }
  ];

  var COLORS_DARK = [
    { top: "#161b22", left: "#10151b", right: "#131920" },
    { top: "#0e4429", left: "#08301c", right: "#0b3a22" },
    { top: "#006d32", left: "#004e24", right: "#005d2a" },
    { top: "#26a641", left: "#1b7a30", right: "#209038" },
    { top: "#39d353", left: "#29a03e", right: "#31b949" }
  ];

  var CSS_TEXT = [
    ".ic-squares #" + WRAPPER_ID + " { display: none; }",
    ".ic-cubes .js-calendar-graph { display: none !important; }",
    ".ic-toggle-options { display: inline-flex; margin-left: 8px; vertical-align: middle; }",
    ".ic-toggle-option { cursor: pointer; }",
    ".ic-toggle-option.is-selected { font-weight: 600; box-shadow: inset 0 0 0 1px currentColor; }",
    "#" + WRAPPER_ID + " { margin-top: 8px; }",
    "#" + CANVAS_ID + " { display: block; width: 100%; }",
    ".ic-tooltip { position: absolute; z-index: 30; pointer-events: none; padding: 4px 8px; border-radius: 6px; font-size: 12px; line-height: 1.4; background: rgba(15, 23, 42, 0.92); color: #fff; white-space: nowrap; }"
  ].join("\n");

  var mode = DEFAULT_MODE;
  var canvas = null;
  var wrapper = null;
  var tooltipEl = null;
  var blocks = [];
  var maxCount = 0;
  var resizeTimer = null;

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

  function parseCountFromTooltip(td) {
    var labelId = td.getAttribute("aria-labelledby");
    if (!labelId) {
      return null;
    }
    var tip = document.getElementById(labelId);
    if (!tip) {
      return null;
    }
    var text = (tip.textContent || "").trim();
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

  function readGrid() {
    var cells = document.querySelectorAll(
      ".js-calendar-graph-table tbody td.ContributionCalendar-day[data-date]"
    );
    if (!cells.length) {
      return null;
    }

    var map = new Map();
    Array.prototype.forEach.call(cells, function (td) {
      var dateStr = td.getAttribute("data-date");
      if (!dateStr || map.has(dateStr)) {
        return;
      }
      var level = Number(td.getAttribute("data-level") || "0");
      if (!isFinite(level)) {
        level = 0;
      }
      level = Math.max(0, Math.min(4, level));
      var count = parseCountFromTooltip(td);
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
    for (var col = 0; col < cols; col++) {
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

    return { grid: grid, cols: cols, maxCount: max };
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
    if (!canvas || !tooltipEl) {
      return;
    }

    var data = readGrid();
    if (!data) {
      return;
    }

    var ctx = canvas.getContext ? canvas.getContext("2d") : null;
    if (!ctx) {
      return;
    }

    var width = Math.max(320, Math.round(wrapper.clientWidth || 900));
    var rows = 7;
    var cols = data.cols;
    var maxHeightRatio = 0.14;

    var tileW = Math.max(6, Math.min(12, (width * 0.86) / (cols + rows)));
    var tileH = tileW * 0.55;
    var maxHeight = Math.round(width * maxHeightRatio);
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

    var palette = isDarkMode() ? COLORS_DARK : COLORS_LIGHT;

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
      var height =
        count > 0
          ? 1.5 + (Math.sqrt(count) / norm) * maxHeight
          : 0;
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
    if (!tooltipEl) {
      return;
    }
    var rect = canvas.getBoundingClientRect();
    var x = ((event.clientX - rect.left) / rect.width) * canvas.width / (window.devicePixelRatio || 1);
    var y = ((event.clientY - rect.top) / rect.height) * canvas.height / (window.devicePixelRatio || 1);

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
    tooltipEl.style.left = Math.min(rect.width - 160, Math.max(0, event.clientX - rect.left + 12)) + "px";
    tooltipEl.style.top = Math.max(0, event.clientY - rect.top - 32) + "px";
  }

  function updateToggleButtons() {
    var buttons = document.querySelectorAll(".ic-toggle-option");
    Array.prototype.forEach.call(buttons, function (button) {
      button.classList.toggle("is-selected", button.getAttribute("data-ic-option") === mode);
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

  function injectToggle(container) {
    var heading = container.querySelector("h2");
    if (!heading || container.querySelector(".ic-toggle-options")) {
      return;
    }
    var host = heading.parentElement || container;
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
    host.appendChild(group);
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
    var container = document.querySelector(".js-yearly-contributions");
    if (!container) {
      cleanup();
      return;
    }
    if (document.getElementById(WRAPPER_ID)) {
      return;
    }
    var graph = container.querySelector(".js-calendar-graph");
    if (!graph) {
      return;
    }

    wrapper = document.createElement("div");
    wrapper.id = WRAPPER_ID;

    canvas = document.createElement("canvas");
    canvas.id = CANVAS_ID;

    tooltipEl = document.createElement("div");
    tooltipEl.className = "ic-tooltip";
    tooltipEl.hidden = true;

    wrapper.appendChild(canvas);
    wrapper.appendChild(tooltipEl);
    graph.parentNode.insertBefore(wrapper, graph);

    canvas.addEventListener("mousemove", onCanvasMove);
    canvas.addEventListener("mouseleave", function () {
      if (tooltipEl) {
        tooltipEl.hidden = true;
      }
    });

    injectToggle(container);
    applyMode(mode);
    window.addEventListener("resize", debouncedRender);
  }

  addStyle(CSS_TEXT);

  try {
    mode = gmGet(MODE_KEY, DEFAULT_MODE);
  } catch (error) {
    mode = DEFAULT_MODE;
  }
  if (MODES.indexOf(mode) < 0) {
    mode = DEFAULT_MODE;
  }

  var scheduled = null;
  function scheduleInit() {
    if (scheduled) {
      return;
    }
    scheduled = window.setTimeout(function () {
      scheduled = null;
      init();
    }, 150);
  }

  document.addEventListener("DOMContentLoaded", scheduleInit);
  document.addEventListener("turbo:load", scheduleInit);
  document.addEventListener("pjax:end", scheduleInit);
  window.addEventListener("popstate", scheduleInit);

  if (document.readyState !== "loading") {
    scheduleInit();
  }
})();