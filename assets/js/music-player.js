/* 音乐播放器：多曲目 + 随机播放，原生 audio 自托管，无外部依赖。
 * - 曲目表 TRACKS（static/audio/ 自托管文件）
 * - 上一曲 / 播放暂停 / 下一曲 / 随机开关
 * - 进度条点击可跳转；进度按曲目存 localStorage，刷新后恢复
 * - 随机模式：Fisher-Yates 洗牌后顺序播放，播完一轮再洗
 */
(function () {
  var audio = document.getElementById("music-audio");
  var player = document.getElementById("music-player");
  var btnPlay = document.getElementById("music-toggle");
  var btnPrev = document.getElementById("music-prev");
  var btnNext = document.getElementById("music-next");
  var btnShuffle = document.getElementById("music-shuffle");
  var title = document.getElementById("music-title");
  var trackEl = document.getElementById("music-track");
  var fill = document.getElementById("music-fill");
  if (!audio || !player || !btnPlay) return;

  /* 曲目表：由 baseof 的 SiteConfig.tracks 注入（名称走 i18n） */
  var TRACKS = (window.SiteConfig && window.SiteConfig.tracks) || [
    { name: "欢乐颂 · 贝多芬", mp3: "/audio/ode-to-joy.mp3", ogg: "/audio/ode-to-joy.ogg" }
  ];
  var KEY = "music-state";   /* {i, pos, shuffle} */

  var state = { i: 0, pos: 0, shuffle: false };
  var order = [];            /* 随机播放顺序 */
  var orderIdx = 0;

  function loadState() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || "null");
      if (s && typeof s.i === "number" && s.i >= 0 && s.i < TRACKS.length) {
        state = { i: s.i, pos: typeof s.pos === "number" ? s.pos : 0, shuffle: !!s.shuffle };
      }
    } catch (e) { /* 损坏状态忽略 */ }
  }
  function saveState() {
    try { localStorage.setItem(KEY, JSON.stringify({ i: state.i, pos: audio.currentTime || 0, shuffle: state.shuffle })); } catch (e) { }
  }

  function setSource() {
    var t = TRACKS[state.i];
    /* 清空旧 source 再挂新源，保证切换生效 */
    while (audio.firstChild) audio.removeChild(audio.firstChild);
    var mp3 = document.createElement("source");
    mp3.src = t.mp3;
    mp3.type = "audio/mpeg";
    audio.appendChild(mp3);
    if (t.ogg) {
      var og = document.createElement("source");
      og.src = t.ogg;
      og.type = "audio/ogg";
      audio.appendChild(og);
    }
    audio.load();
    if (state.pos > 0.5) {
      try { audio.currentTime = state.pos; } catch (e) { }
    }
    title.textContent = t.name;
  }

  function renderShuffle() {
    btnShuffle.classList.toggle("on", state.shuffle);
    btnShuffle.setAttribute("aria-pressed", String(state.shuffle));
  }

  function nextIndex(dir) {
    var n = TRACKS.length;
    if (n <= 1) return 0;
    if (state.shuffle) {
      /* 随机模式：用预洗牌顺序；播到末尾重新洗牌 */
      if (order.length === 0) {
        order = TRACKS.map(function (_, i) { return i; });
        /* Fisher-Yates */
        for (var i = order.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = order[i]; order[i] = order[j]; order[j] = tmp;
        }
        orderIdx = 0;
      }
      orderIdx = (orderIdx + dir + order.length) % order.length;
      return order[orderIdx];
    }
    return (state.i + dir + n) % n;
  }

  function playIndex(dir) {
    state.i = nextIndex(dir);
    state.pos = 0;
    setSource();
    audio.play().then(function () { player.classList.add("playing"); btnPlay.innerHTML = "\u2759\u2759"; })
      .catch(function () { /* 自动播放被拒则停住等用户点击 */ });
    saveState();
  }

  function toggleShuffle() {
    state.shuffle = !state.shuffle;
    order = [];
    renderShuffle();
    saveState();
  }

  /* ---- 事件 ---- */
  btnPlay.addEventListener("click", function () {
    if (audio.paused) {
      if (!audio.currentSrc) setSource();
      audio.play().then(function () {
        player.classList.add("playing");
        btnPlay.innerHTML = "\u2759\u2759";
      }).catch(function () { });
    } else {
      audio.pause();
    }
  });
  if (btnPrev) btnPrev.addEventListener("click", function () { playIndex(-1); });
  if (btnNext) btnNext.addEventListener("click", function () { playIndex(1); });
  if (btnShuffle) btnShuffle.addEventListener("click", toggleShuffle);

  audio.addEventListener("pause", function () {
    player.classList.remove("playing");
    btnPlay.innerHTML = "\u25B6";
    saveState();
  });
  audio.addEventListener("ended", function () { playIndex(1); });
  audio.addEventListener("timeupdate", function () {
    if (audio.duration) fill.style.width = (audio.currentTime / audio.duration * 100).toFixed(1) + "%";
  });
  /* 进度条点击跳转 */
  if (trackEl) trackEl.addEventListener("click", function (ev) {
    var r = trackEl.getBoundingClientRect();
    var ratio = (ev.clientX - r.left) / r.width;
    if (audio.duration && ratio >= 0 && ratio <= 1) {
      audio.currentTime = ratio * audio.duration;
    }
  });
  window.addEventListener("pagehide", saveState);

  /* ---- 启动 ---- */
  loadState();
  setSource();
  renderShuffle();
})();