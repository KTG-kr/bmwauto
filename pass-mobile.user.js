// ==UserScript==
// @name         PASS Mobile Auto
// @namespace    https://github.com/KTG-kr/bmwauto
// @version      1.2
// @match        https://nice.checkplus.co.kr/cert/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  function n(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }

  function v(e) {
    if (!e) return false;
    var r = e.getBoundingClientRect();
    var s = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden";
  }

  function txt(e) {
    var img = [...e.querySelectorAll("img")]
      .map(i => n(i.alt || i.title || i.getAttribute("aria-label") || ""))
      .join(" ");

    return n(
      (e.innerText || e.textContent || "") +
      " " + img +
      " " + (e.getAttribute("aria-label") || "") +
      " " + (e.title || "")
    );
  }

  function cand() {
    return [...document.querySelectorAll("button,a,label,li,div,span,[role='button'],[onclick]")]
      .filter(v);
  }

  function findClickableBox(e) {
    var cur = e;

    for (var i = 0; cur && cur !== document.body && i < 8; i++, cur = cur.parentElement) {
      var s = getComputedStyle(cur);
      var tag = cur.tagName;

      if (
        tag === "BUTTON" ||
        tag === "A" ||
        tag === "LABEL" ||
        cur.onclick ||
        cur.getAttribute("role") === "button" ||
        s.cursor === "pointer"
      ) {
        return cur;
      }
    }

    cur = e;

    for (var j = 0; cur && cur !== document.body && j < 6; j++, cur = cur.parentElement) {
      var r = cur.getBoundingClientRect();

      if (r.width > 120 && r.height > 70) {
        return cur;
      }
    }

    return e;
  }

  function c(e) {
    if (!e) return;

    e = findClickableBox(e);

    try {
      e.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (_) {}

    try {
      var r = e.getBoundingClientRect();
      var x = r.left + r.width / 2;
      var y = r.top + r.height / 2;
      var top = document.elementFromPoint(x, y);

      if (top) e = findClickableBox(top);

      e.dispatchEvent(new PointerEvent("pointerdown", {
        bubbles: true,
        clientX: x,
        clientY: y,
        pointerType: "touch"
      }));

      e.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));

      e.dispatchEvent(new PointerEvent("pointerup", {
        bubbles: true,
        clientX: x,
        clientY: y,
        pointerType: "touch"
      }));

      e.dispatchEvent(new TouchEvent("touchend", { bubbles: true }));
    } catch (_) {}

    try {
      e.click();
    } catch (_) {
      try {
        e.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        e.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        e.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      } catch (__) {}
    }
  }

  function clickSkt() {
    var hit = cand().find(e => {
      var t = txt(e);
      return (t === "SKT" || t.includes("SKT")) && !t.includes("알뜰폰");
    });

    if (hit) {
      c(hit);
      return true;
    }

    return false;
  }

  function clickPass() {
    var hit = cand().find(e => {
      var t = txt(e);
      return t.includes("PASS 인증") || (t.includes("PASS") && t.includes("인증"));
    });

    if (hit) {
      c(hit);
      return true;
    }

    return false;
  }

  function clickAgree() {
    var hit = cand().find(e => {
      var t = txt(e);
      return t.includes("본인확인") &&
        t.includes("이용 동의") &&
        t.includes("필수");
    });

    if (hit) {
      c(hit);
      return true;
    }

    return false;
  }

  function clickNext() {
    var hit = cand().find(e => txt(e) === "다음") ||
      cand().find(e => txt(e).includes("다음"));

    if (hit) {
      c(hit);
      return true;
    }

    return false;
  }

  var done = {
    skt: false,
    pass: false,
    agree: false,
    next: false
  };

  var tries = 0;

  var timer = setInterval(function () {
    tries++;

    if (!done.skt) {
      done.skt = clickSkt();
    }

    if (!done.pass) {
      done.pass = clickPass();
    }

    if (!done.agree) {
      done.agree = clickAgree();
    }

    if (done.agree && !done.next) {
      done.next = clickNext();
    }

    if (done.next || tries > 300) {
      clearInterval(timer);
    }
  }, 300);
})();
