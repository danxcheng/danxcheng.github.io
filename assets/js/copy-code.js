/* 代码块复制按钮：给 .highlight 块注入"复制"按钮。
 * 用 navigator.clipboard（仅 https/localhost），失败回退 document.execCommand。
 * 无外部依赖。 */
(function () {
  if (!document.querySelector || !document.querySelectorAll) return;
  var BTN_CLASS = "copy-code-btn";

  function makeButton(pre) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = BTN_CLASS;
    btn.textContent = "复制";
    btn.setAttribute("aria-label", "复制代码");
    btn.addEventListener("click", function () {
      var text = pre.innerText || pre.textContent || "";
      function done(ok) {
        btn.textContent = ok ? "已复制" : "复制失败";
        setTimeout(function () { btn.textContent = "复制"; }, 1500);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
      } else {
        done(fallbackCopy(text));
      }
    });
    return btn;
  }
  function fallbackCopy(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }
  function init() {
    document.querySelectorAll(".highlight").forEach(function (block) {
      if (block.querySelector("." + BTN_CLASS)) return;   // 已注入过
      var pre = block.querySelector("pre");
      if (!pre) return;
      block.style.position = "relative";
      block.appendChild(makeButton(pre));
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
