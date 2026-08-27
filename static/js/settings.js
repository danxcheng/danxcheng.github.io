/* ============================================================
   组件设置系统
   ------------------------------------------------------------
   - 右侧栏底部「⚙ 组件」按钮 / 移动端浮动按钮 → 原生 <dialog> 弹窗
   - 主面板：各组件开关；每个组件「调整」→ 详情面板（参数滑块）
   - 持久化：localStorage "siteSettings"，刷新保持
   - 初始化：先读设置再启动组件（避免"闪一下再消失"）
   - 尊重 prefers-reduced-motion：系统减少动态时动画默认关闭
   设计依据：调研参考/设置界面调研.md
   ============================================================ */
(function () {
  "use strict";

  var KEY = "siteSettings";
  var DEFAULTS = {
    theme: "auto",                              // light | dark | auto
    particles: { on: true, count: 81, size: 4, speed: 2, linkDistance: 100, color: "#c4483a" },
    koi: { on: true, count: 10, alpha: 60 },    // alpha 单位 %（60 = 0.6）
    grain: { on: true, opacity: 4.5 }           // opacity 单位 %（4.5 = 0.045）
  };

  var settings;
  var pond = null;              // 锦鲤实例
  var particlesActive = false;  // 粒子是否已启动
  var isDesktop = screen.width >= 768;
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 存储 ---------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function mergeDeep(base, over) {
    var out = clone(base);
    if (over && typeof over === "object") {
      Object.keys(over).forEach(function (k) {
        if (out[k] && typeof out[k] === "object" && typeof over[k] === "object" && !Array.isArray(over[k])) {
          out[k] = mergeDeep(out[k], over[k]);
        } else if (over[k] !== undefined) {
          out[k] = over[k];
        }
      });
    }
    return out;
  }
  function load() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
    var hadSaved = saved !== null;
    settings = mergeDeep(DEFAULTS, saved || {});
    // 尊重系统"减少动态"：仅首次访问（无保存记录）时动画默认关
    if (reducedMotion && !hadSaved) {
      settings.particles.on = false;
      settings.koi.on = false;
      save();
    }
    return settings;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (e) {}
  }

  /* ---------- 主题 ---------- */
  function applyTheme() {
    var root = document.documentElement;
    if (settings.theme === "auto") delete root.dataset.theme;
    else root.dataset.theme = settings.theme;
    syncThemeButtons();
  }

  /* ---------- 纸噪点（CSS 伪元素层，强度 = 变量 / 100） ---------- */
  function applyGrain() {
    document.body.classList.toggle("no-grain", !settings.grain.on);
    document.body.style.setProperty("--grain-opacity", String(settings.grain.opacity / 100));
  }

  /* ---------- 粒子（particles.js） ---------- */
  function particlesConfig(p) {
    return {
      particles: {
        number: { value: p.count, density: { enable: true, value_area: 800 } },
        color: { value: p.color },
        shape: { type: "circle" },
        opacity: { value: 0.35, random: true },
        size: { value: p.size, random: true },
        line_linked: { enable: true, distance: p.linkDistance, color: p.color, opacity: 0.25, width: 1 },
        move: { enable: true, speed: p.speed, direction: "none", random: true, out_mode: "out" }
      },
      interactivity: {
        detect_on: "window",
        events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "repulse" }, resize: true },
        modes: { grab: { distance: 180, line_linked: { opacity: 0.6 } }, repulse: { distance: 200 } }
      },
      retina_detect: true
    };
  }
  function startParticles() {
    if (!isDesktop || particlesActive || typeof particlesJS !== "function") return;
    if (!settings.particles.on) return;
    particlesJS("particles-js", particlesConfig(settings.particles));
    particlesActive = true;
  }
  function stopParticles() {
    if (!particlesActive) return;
    if (window.pJSDom && window.pJSDom.length && window.pJSDom[0].pJS) {
      try { window.pJSDom[0].pJS.fn.vendors.destroy(); } catch (e) {}
    }
    window.pJSDom = [];
    particlesActive = false;
  }
  function rebuildParticles() { stopParticles(); startParticles(); }

  /* ---------- 锦鲤（koi-pond，动态 import） ---------- */
  function startKoi() {
    if (!isDesktop || pond || !settings.koi.on) return;
    var url = window.SiteConfig && window.SiteConfig.koiUrl;
    if (!url) return;
    import(url).then(function (m) {
      var canvas = document.getElementById("pond");
      if (!canvas || !settings.koi.on) return;
      var k = settings.koi;
      pond = m.createKoiPond(canvas, {
        count: k.count,
        alphaFn: function () { return k.alpha / 100; }
      });
      pond.start();
    });
  }
  function stopKoi() {
    if (pond) { try { pond.destroy(); } catch (e) {} pond = null; }
  }
  function rebuildKoi() { stopKoi(); startKoi(); }

  /* ---------- DOM 工具 ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function getPath(obj, path) { return path.split(".").reduce(function (o, k) { return o ? o[k] : undefined; }, obj); }
  function setPath(obj, path, val) {
    var parts = path.split("."), o = obj;
    for (var i = 0; i < parts.length - 1; i++) o = o[parts[i]];
    o[parts[parts.length - 1]] = val;
  }

  /* ---------- UI 同步 ---------- */
  var dialog = null;
  function syncToggle(comp) {
    var el = $('[data-toggle="' + comp + '"]');
    if (el) el.checked = !!settings[comp].on;
  }
  function syncThemeButtons() {
    $$("[data-seg=theme] button").forEach(function (b) {
      b.classList.toggle("active", b.dataset.theme === settings.theme);
    });
  }
  function syncParamInputs(path) {
    var val = getPath(settings, path);
    var rng = $('[data-range="' + path + '"]');
    var num = $('[data-num="' + path + '"]');
    if (rng) rng.value = val;
    if (num) num.value = val;
  }
  function syncAll() {
    ["particles", "koi", "grain"].forEach(syncToggle);
    syncThemeButtons();
    ["particles.count", "particles.size", "particles.speed", "particles.linkDistance",
     "koi.count", "koi.alpha", "grain.opacity"].forEach(syncParamInputs);
  }
  function switchView(name) {
    $$(".settings-view", dialog).forEach(function (v) { v.hidden = v.dataset.view !== name; });
  }
  function syncDetail(name) {
    if (name === "particles") ["particles.count", "particles.size", "particles.speed", "particles.linkDistance"].forEach(syncParamInputs);
    else if (name === "koi") ["koi.count", "koi.alpha"].forEach(syncParamInputs);
    else if (name === "grain") syncParamInputs("grain.opacity");
  }

  /* 参数变更 → 对应组件重建（防抖：change 事件松手才触发） */
  function applyChanged(path) {
    var comp = path.split(".")[0];
    if (comp === "particles") rebuildParticles();
    else if (comp === "koi") rebuildKoi();
    else if (comp === "grain") applyGrain();
  }

  /* ---------- 初始化 ---------- */
  function init() {
    load();
    dialog = document.getElementById("settings-dialog");

    if (dialog) {
      $("[data-action=close]", dialog).addEventListener("click", function () { dialog.close(); });
      // 遮罩点击关闭（原生 dialog 点 ::backdrop 不会自动关）
      dialog.addEventListener("click", function (ev) {
        if (ev.target === dialog) dialog.close();
      });
      // 开关
      $$("[data-toggle]", dialog).forEach(function (chk) {
        chk.addEventListener("change", function () {
          setPath(settings, chk.dataset.toggle, chk.checked);
          save();
          var comp = chk.dataset.toggle;
          if (comp === "particles") rebuildParticles();
          else if (comp === "koi") rebuildKoi();
          else if (comp === "grain") applyGrain();
        });
      });
      // 详情 / 返回
      $$("[data-detail]", dialog).forEach(function (btn) {
        btn.addEventListener("click", function () { switchView(btn.dataset.detail); syncDetail(btn.dataset.detail); });
      });
      $$("[data-action=back]", dialog).forEach(function (btn) {
        btn.addEventListener("click", function () { switchView("main"); });
      });
      // 重置（单个组件 / 全部）
      $$("[data-action=reset]", dialog).forEach(function (btn) {
        btn.addEventListener("click", function () {
          settings[btn.dataset.reset] = clone(DEFAULTS[btn.dataset.reset]);
          save(); applyChanged(btn.dataset.reset); syncAll(); switchView("main");
        });
      });
      var resetAll = $("[data-action=reset-all]", dialog);
      if (resetAll) resetAll.addEventListener("click", function () {
        settings = clone(DEFAULTS);
        save(); applyTheme(); applyGrain(); rebuildParticles(); rebuildKoi(); syncAll(); switchView("main");
      });
      // 主题（弹窗内）
      $$("[data-seg=theme] button", dialog).forEach(function (b) {
        b.addEventListener("click", function () { settings.theme = b.dataset.theme; save(); applyTheme(); });
      });
      // 参数控件：range 的 change（松手）与 number 的 change
      $$("[data-range]", dialog).forEach(function (rng) {
        rng.addEventListener("input", function () { syncParamInputs(rng.dataset.range); });  // 拖动中只同步数字显示
        rng.addEventListener("change", function () {
          setPath(settings, rng.dataset.range, parseFloat(rng.value));
          save(); applyChanged(rng.dataset.range); syncParamInputs(rng.dataset.range);
        });
      });
      $$("[data-num]", dialog).forEach(function (num) {
        num.addEventListener("change", function () {
          var v = parseFloat(num.value);
          var min = parseFloat(num.min), max = parseFloat(num.max);
          if (isNaN(v)) v = getPath(DEFAULTS, num.dataset.num);
          v = Math.min(max, Math.max(min, v));
          setPath(settings, num.dataset.num, v);
          save(); applyChanged(num.dataset.num); syncParamInputs(num.dataset.num);
        });
      });
    }

    // 打开入口：右栏按钮 + 移动端浮动按钮
    $$("[data-open-settings]").forEach(function (btn) {
      btn.addEventListener("click", function () { if (dialog) { syncAll(); switchView("main"); dialog.showModal(); } });
    });
    var fab = document.getElementById("settings-fab");
    if (fab) fab.addEventListener("click", function () { if (dialog) { syncAll(); switchView("main"); dialog.showModal(); } });

    // 侧栏主题切换（弹窗外的同一组按钮）
    $$("[data-seg=theme] button").forEach(function (b) {
      if (!b.closest("#settings-dialog")) {
        b.addEventListener("click", function () { settings.theme = b.dataset.theme; save(); applyTheme(); });
      }
    });

    // 先应用设置再启动组件（避免闪一下）
    applyTheme();
    applyGrain();
    startParticles();
    startKoi();
    syncAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
