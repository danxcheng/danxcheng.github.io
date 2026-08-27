/* 音乐播放器：原生 audio 自托管，无外部依赖。
 * 进度用 localStorage 保留，页面切换后自动回到上次位置（参考 hugo-stack custom-player）。
 */
(function () {
  var audio = document.getElementById("music-audio");
  var player = document.getElementById("music-player");
  var btn = document.getElementById("music-toggle");
  var fill = document.querySelector(".music-track-fill");
  var KEY = "music-pos";
  if (!audio || !player || !btn) return;

  /* 恢复上次进度（不自动播放，浏览器策略禁止跨页自动播放） */
  try {
    var pos = parseFloat(localStorage.getItem(KEY));
    if (isFinite(pos) && pos > 0.5) audio.currentTime = pos;
  } catch (e) { /* localStorage 不可用时忽略 */ }

  function savePos() {
    try { localStorage.setItem(KEY, String(audio.currentTime)); } catch (e) { }
  }

  btn.addEventListener("click", function () {
    if (audio.paused) {
      audio.play().then(function () {
        player.classList.add("playing");
        btn.innerHTML = "\u2759\u2759"; /* ❙❙ */
      }).catch(function () { /* 播放被拒时静默 */ });
    } else {
      audio.pause();
      player.classList.remove("playing");
      btn.innerHTML = "\u25B6"; /* ▶ */
    }
  });

  audio.addEventListener("pause", function () {
    player.classList.remove("playing");
    btn.innerHTML = "\u25B6";
    savePos();
  });
  audio.addEventListener("timeupdate", function () {
    if (audio.duration) fill.style.width = (audio.currentTime / audio.duration * 100).toFixed(1) + "%";
  });
  /* 页面离开前存进度 */
  window.addEventListener("pagehide", savePos);
})();
