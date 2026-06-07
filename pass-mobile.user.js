// ==UserScript==
// @name         PASS Mobile Auto
// @namespace    https://github.com/KTG-kr/bmwauto
// @version      1.6
// @match        https://nice.checkplus.co.kr/cert/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  function n(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }

  function compact(t) {
    return n(t).replace(/\s+/g, "");
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

  function allText(e) {
    var img = [...e.querySelectorAll("img")]
      .map(function (i) {
        return n(i.alt || i.title || i.getAttribute("aria-label") || "");
      })
      .join(" ");

    return n(
      (e.innerText || e.textContent || "") +
      " " + img +
      " " + (e.getAttribute("aria-label") || "") +
      " " + (e.title || "")
    );
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

  function fireClickAt(e, xRatio, yRatio) {
    if (!e) return false;

    try {
      e.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (_) {}

    setTimeout(function () {
      var target = e;

      try {
        var r = e.getBoundingClientRect();
        var x = r.left + r.width * (xRatio == null ? 0.5 : xRatio);
        var y = r.top + r.height * (yRatio == null ? 0.5 : yRatio);
        var top = document.elementFromPoint(x, y);

        if (top) target = top;

        target.dispatchEvent(new PointerEvent("pointerdown", {
          bubbles: true,
          clientX: x,
          clientY: y,
          pointerType: "touch"
        }));

        target.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));

        target.dispatchEvent(new PointerEvent("pointerup", {
          bubbles: true,
          clientX: x,
          clientY: y,
          pointerType: "touch"
        }));

        target.dispatchEvent(new TouchEvent("touchend", { bubbles: true }));
      } catch (_) {}

      try {
        target.click();
      } catch (_) {
        try {
          target.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
          target.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
          target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        } catch (__) {}
      }

      if (target !== e) {
        try {
          e.click();
        } catch (_) {}
      }
    }, 80);

    return true;
  }

  function clickCenter(e) {
    return fireClickAt(e, 0.5, 0.5);
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

  /*
   * SKT 선택 로직은 유지.
   */
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

  function methodPageCards() {
    return visibleNodes().filter(function (e) {
      var r = e.getBoundingClientRect();
      var t = text(e);

      return r.width >= window.innerWidth * 0.55 &&
        r.height >= 70 &&
        r.height <= 260 &&
        t &&
        !t.includes("이용약관") &&
        !t.includes("개인정보처리방침") &&
        !t.includes("도입문의");
    });
  }

  function clickPassAuth() {
    if (!location.href.includes("/cert/mobileCert/method")) {
      return false;
    }

    var exactText = visibleNodes().find(function (e) {
      return text(e) === "PASS 인증";
    });

    if (exactText) {
      return clickCenter(closestCard(exactText));
    }

    var card = methodPageCards().find(function (e) {
      var t = text(e);
      return t.includes("PASS 인증") &&
        t.includes("앱으로") &&
        !t.includes("문자") &&
        !t.includes("SMS") &&
        !t.includes("QR") &&
        !t.includes("QR코드");
    });

    if (card) {
      return clickCenter(card);
    }

    var passOnly = methodPageCards().find(function (e) {
      var t = text(e);
      return t.includes("PASS") &&
        t.includes("인증") &&
        !t.includes("문자") &&
        !t.includes("SMS") &&
        !t.includes("QR");
    });

    if (passOnly) {
      return clickCenter(passOnly);
    }

    return false;
  }

  function isAgreeText(t) {
    var s = compact(t);
    return s.includes("본인확인이용동의") &&
      (s.includes("필수") || s.includes("(필수)"));
  }

  function findAgreeNode() {
    var nodes = visibleNodes();

    var exact = nodes.find(function (e) {
      return isAgreeText(allText(e));
    });

    if (exact) return exact;

    return nodes.find(function (e) {
      var s = compact(allText(e));
      return s.includes("본인확인") &&
        s.includes("이용동의") &&
        s.includes("필수");
    }) || null;
  }

  function agreeRowFromTextNode(e) {
    var cur = e;

    for (var i = 0; cur && cur !== document.body && i < 8; i++, cur = cur.parentElement) {
      var r = cur.getBoundingClientRect();
      var s = compact(allText(cur));

      if (
        r.width >= window.innerWidth * 0.55 &&
        r.height >= 38 &&
        r.height <= 130 &&
        s.includes("본인확인") &&
        s.includes("이용동의") &&
        s.includes("필수")
      ) {
        return cur;
      }
    }

    return e;
  }

  function clickAgree() {
    var node = findAgreeNode();

    if (!node) return false;

    var row = agreeRowFromTextNode(node);
    var r = row.getBoundingClientRect();

    var checkbox = [...document.querySelectorAll("input[type='checkbox'],[role='checkbox']")]
      .filter(v)
      .find(function (e) {
        var cr = e.getBoundingClientRect();
        return cr.top >= r.top - 20 &&
          cr.bottom <= r.bottom + 20 &&
          cr.left <= r.left + r.width * 0.35;
      });

    if (checkbox) {
      return clickCenter(checkbox);
    }

    return fireClickAt(row, 0.08, 0.5) ||
      fireClickAt(row, 0.15, 0.5) ||
      clickCenter(row);
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
      return t.includes("다음") && area(e) < window.innerWidth * 260;
    });

    if (fallback) {
      return clickCenter(fallback);
    }

    return false;
  }

  var step = location.href.includes("/cert/mobileCert/method") ? 1 : 0;
  var tries = 0;
  var lastHref = location.href;
  var clickedPassAt = 0;
  var clickedAgreeAt = 0;

  var timer = setInterval(function () {
    tries++;

    if (location.href !== lastHref) {
      lastHref = location.href;
      if (location.href.includes("/cert/mobileCert/method") && step < 1) {
        step = 1;
      }
    }

    if (step === 0) {
      if (clickSkt()) {
        step = 1;
        return;
      }
    }

    if (step === 1) {
      var agreeNode = findAgreeNode();

      if (agreeNode) {
        step = 2;
        return;
      }

      if (Date.now() - clickedPassAt > 1600 && clickPassAuth()) {
        clickedPassAt = Date.now();
        return;
      }
    }

    if (step === 2) {
      if (Date.now() - clickedAgreeAt > 1200 && clickAgree()) {
        clickedAgreeAt = Date.now();

        setTimeout(function () {
          step = 3;
        }, 700);

        return;
      }
    }

    if (step === 3) {
      if (clickNext()) {
        step = 4;
        clearInterval(timer);
        return;
      }

      if (findAgreeNode() && Date.now() - clickedAgreeAt > 1500) {
        step = 2;
        return;
      }
    }

    if (tries > 420) {
      clearInterval(timer);
    }
  }, 350);
})();
