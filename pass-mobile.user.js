// ==UserScript==
// @name         PASS Mobile Auto
// @namespace    https://github.com/KTG-kr/bmwauto
// @version      1.3
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
    return r.width > 0 &&
      r.height > 0 &&
      s.display !== "none" &&
      s.visibility !== "hidden" &&
      s.opacity !== "0";
  }

  function text(e) {
    return n(e.innerText || e.textContent || "");
  }

  function area(e) {
    var r = e.getBoundingClientRect();
    return r.width * r.height;
  }

  function visibleNodes() {
    return [...document.querySelectorAll("button,a,label,li,div,span,p,strong,h1,h2,h3,[role='button'],[onclick]")]
      .filter(v)
      .sort(function (a, b) {
        return area(a) - area(b);
      });
  }

  function clickCenter(e) {
    if (!e) return false;

    try {
      e.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (_) {}

    setTimeout(function () {
      try {
        var r = e.getBoundingClientRect();
        var x = r.left + r.width / 2;
        var y = r.top + r.height / 2;

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
    }, 80);

    return true;
  }

  function closestCard(e) {
    var cur = e;

    for (var i = 0; cur && cur !== document.body && i < 6; i++, cur = cur.parentElement) {
      var t = text(cur);
      var r = cur.getBoundingClientRect();

      if (
        r.width >= 120 &&
        r.height >= 70 &&
        r.width <= window.innerWidth * 0.95 &&
        t &&
        !t.includes("알뜰폰")
      ) {
        return cur;
      }
    }

    return e;
  }

  function clickSkt() {
    var exact = visibleNodes().find(function (e) {
      return text(e) === "SKT";
    });

    if (exact) {
      return clickCenter(closestCard(exact));
    }

    var fallback = visibleNodes().find(function (e) {
      var t = text(e);
      return t.includes("SKT") &&
        !t.includes("KT") &&
        !t.includes("LG") &&
        !t.includes("알뜰폰");
    });

    if (fallback) {
      return clickCenter(closestCard(fallback));
    }

    return false;
  }

  function clickPassAuth() {
    var exact = visibleNodes().find(function (e) {
      return text(e) === "PASS 인증";
    });

    if (exact) {
      return clickCenter(closestCard(exact));
    }

    var fallback = visibleNodes().find(function (e) {
      var t = text(e);
      return t.includes("PASS 인증") &&
        !t.includes("문자") &&
        !t.includes("SMS") &&
        !t.includes("QR") &&
        !t.includes("QR코드");
    });

    if (fallback) {
      return clickCenter(closestCard(fallback));
    }

    return false;
  }

  function clickAgree() {
    var exact = visibleNodes().find(function (e) {
      var t = text(e);
      return t.includes("본인확인") &&
        t.includes("이용 동의") &&
        t.includes("필수");
    });

    if (exact) {
      return clickCenter(closestCard(exact));
    }

    return false;
  }

  function clickNext() {
    var exact = visibleNodes().find(function (e) {
      return text(e) === "다음";
    });

    if (exact) {
      return clickCenter(exact);
    }

    var fallback = visibleNodes().find(function (e) {
      var t = text(e);
      return t.includes("다음") && area(e) < window.innerWidth * 180;
    });

    if (fallback) {
      return clickCenter(fallback);
    }

    return false;
  }

  var step = 0;
  var tries = 0;

  var timer = setInterval(function () {
    tries++;

    if (step === 0) {
      if (clickSkt()) {
        step = 1;
        return;
      }
    }

    if (step === 1) {
      if (clickPassAuth()) {
        step = 2;
        return;
      }
    }

    if (step === 2) {
      if (clickAgree()) {
        step = 3;
        return;
      }
    }

    if (step === 3) {
      if (clickNext()) {
        step = 4;
        clearInterval(timer);
        return;
      }
    }

    if (tries > 300) {
      clearInterval(timer);
    }
  }, 400);
})();
