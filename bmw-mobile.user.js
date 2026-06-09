// ==UserScript==
// @name         BMW Auto Mobile
// @namespace    https://github.com/KTG-kr/bmwauto
// @version      1.2
// @match        https://*.bmw.co.kr/*
// @match        https://*.bmwgroup.com/*
// @match        https://*.bmw.com/*
// @run-at       document-idle
// @require      https://raw.githubusercontent.com/KTG-kr/bmwauto/main/bmw-auto.js
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  function run() {
    if (typeof window.runBmwAuto === "function") {
      window.runBmwAuto();
    } else {
      alert("BMW 자동 실행 코드를 불러오지 못했습니다.");
    }
  }

  if (typeof GM_registerMenuCommand === "function") {
    GM_registerMenuCommand("BMW 자동 선택 실행", run);
  }

  if (location.hash.includes("bmw-auto")) {
    setTimeout(run, 500);
  }

  if (document.getElementById("bmw-auto-mobile-button")) return;

  var btn = document.createElement("button");
  btn.id = "bmw-auto-mobile-button";
  btn.textContent = "BMW AUTO";
  btn.style.cssText = [
    "position:fixed",
    "right:12px",
    "bottom:76px",
    "z-index:2147483647",
    "background:#ff354f",
    "color:#fff",
    "border:0",
    "border-radius:10px",
    "padding:12px 14px",
    "font:bold 14px sans-serif",
    "box-shadow:0 3px 12px rgba(0,0,0,.25)"
  ].join(";");

  btn.onclick = run;
  document.documentElement.appendChild(btn);
})();
