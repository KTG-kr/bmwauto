window.runBmwAuto = function () {
  var CFG = {
    exterior: ["블랙 사파이어 메탈릭", "브루클린 그레이 메탈릭", "카본 블랙 메탈릭"],
    interior: ["BMW 인디비주얼 레더 '메리노' 타르투포","BMW 인디비주얼 익스텐디드 레더 트림 메리노 커피", "BMW 인디비주얼 레더 ‘메리노’ 블랙", "베르나스카 블랙"],
    dealerCompany: ["내쇼날 모터스", "바바리안 모터스", "코오롱 모터스","동성 모터스"],
    dealerBranch: ["내쇼날 모터스 (전주 전시장)", "바바리안 모터스 (목동 전시장)","동성 모터스(부산 중앙)","코오롱모터스 (분당 전시장)"],
    dealerSalesperson: ["김기동", "엄대동","박성필","민준성"],
    popupStart: 150,
    buyGap: 1200
  };

  function n(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }

  function compact(t) {
    return n(t).replace(/\s+/g, "").replace(/[()（）]/g, "");
  }

  function arr(x) {
    return Array.isArray(x) ? x : [x];
  }

  function v(e) {
    if (!e) return false;
    var r = e.getBoundingClientRect();
    var s = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden";
  }

  function enabledOption(a) {
    if (!a || !v(a)) return false;
    var cls = " " + (a.className || "") + " ";
    var s = getComputedStyle(a);
    return !cls.includes(" soldout ") &&
      !a.classList.contains("disabled") &&
      !a.hasAttribute("disabled") &&
      a.getAttribute("aria-disabled") !== "true" &&
      s.pointerEvents !== "none";
  }

  function c(e) {
    if (!e) return;

    try {
      e.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (_) {}

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
  }

  function getTrim(sec) {
    var sections = [...document.querySelectorAll("div.trim, div.rsv-section, div.section")];

    return sections.find(function (t) {
      var h = t.querySelector("h3");
      var txt = n(h && (h.innerText || h.textContent));
      return txt === sec || txt.includes(sec);
    }) || null;
  }

  function optionText(a) {
    var img = a.querySelector && a.querySelector("img");
    var alt = n(img && img.getAttribute("alt"));
    var title = n((img && img.getAttribute("title")) || a.getAttribute("title"));
    var aria = n(a.getAttribute && a.getAttribute("aria-label"));
    var tip = n(a.querySelector(".tooltiptext") && a.querySelector(".tooltiptext").innerText);
    var all = n(a.innerText || a.textContent || "");
    return n(alt + " " + title + " " + aria + " " + tip + " " + all);
  }

  function findOption(opts, want) {
    var w = n(want);
    if (!w) return null;

    return opts.find(a => optionText(a).includes(w)) ||
      opts.find(a => {
        var s = optionText(a);
        var ws = w.split("/").map(n).filter(Boolean);
        return ws.length && ws.every(p => s.includes(p));
      });
  }

  function pickOption(sec, wants) {
    var trim = getTrim(sec);
    if (!trim) return false;

    var opts = [...trim.querySelectorAll("a.tooltip, a.activable, button, [role='button']")].filter(enabledOption);
    if (!opts.length) return false;

    var hit = null;
    var list = arr(wants);

    for (var i = 0; i < list.length; i++) {
      hit = findOption(opts, list[i]);
      if (hit) break;
    }

    if (!hit) hit = opts[0];

    c(hit);
    return true;
  }

  function findDealerSection() {
    var sections = [...document.querySelectorAll("div.section.section02, div.rsv-section, div.section, section")];

    return sections.find(function (s) {
      var h = s.querySelector("h3");
      var txt = n(h && (h.innerText || h.textContent));
      return txt === "딜러위치" || txt.includes("딜러위치") || txt.includes("딜러");
    }) || sections.find(function (s) {
      var txt = n(s.innerText || s.textContent || "");
      return txt.includes("딜러") && s.querySelectorAll("select").length >= 1;
    }) || null;
  }

  function getDealerSelect(idx) {
    var sec = findDealerSection();
    if (!sec) return null;

    var sels = [...sec.querySelectorAll("select")].filter(v);
    return sels[idx] || null;
  }

  function validSelectOptions(sel) {
    if (!sel) return [];

    return [...sel.options].filter(function (o) {
      var txt = n(o.textContent);
      var val = n(o.value);

      return !o.disabled &&
        txt &&
        val !== "" &&
        !txt.includes("선택") &&
        !txt.includes("Please") &&
        !txt.includes("Select");
    });
  }

  function findSelectOptionByText(sel, wants) {
    var opts = validSelectOptions(sel);
    if (!opts.length) return null;

    var list = arr(wants);

    for (var i = 0; i < list.length; i++) {
      var t = n(list[i]);
      var ct = compact(t);

      var hit = opts.find(function (o) {
        return n(o.textContent) === t;
      }) || opts.find(function (o) {
        return n(o.textContent).includes(t);
      }) || opts.find(function (o) {
        return t.includes(n(o.textContent));
      }) || opts.find(function (o) {
        var co = compact(o.textContent);
        return co === ct || co.includes(ct) || ct.includes(co);
      });

      if (hit) return hit;
    }

    return null;
  }

  function setSelectByText(sel, wants) {
    if (!sel) return false;

    var hit = findSelectOptionByText(sel, wants);

    if (!hit) return false;

    if (sel.value === hit.value) return true;

    sel.value = hit.value;
    sel.dispatchEvent(new Event("input", { bubbles: true }));
    sel.dispatchEvent(new Event("change", { bubbles: true }));

    return true;
  }

  function clickBuy() {
    var ks = ["구매하기", "구매", "결제", "바로구매"];
    var cand = [
      ...document.querySelectorAll("button"),
      ...document.querySelectorAll("a"),
      ...document.querySelectorAll("[role='button']")
    ].filter(v);

    var b = null;

    for (var i = 0; i < ks.length; i++) {
      b = cand.find(el => n(el.innerText || el.textContent || "").includes(ks[i]));
      if (b) break;
    }

    if (b && v(b)) c(b);
  }

  function findDialog() {
    var ds = [...document.querySelectorAll("[role='dialog'],.modal,.popup,.layer,.dialog")].filter(v);
    return ds[ds.length - 1] || document.body;
  }

  function getAgreeNode(root) {
    return [...root.querySelectorAll("label,div,span,p")]
      .filter(v)
      .find(el => {
        var s = n(el.innerText || el.textContent || "");
        return s.includes("[필수]") && s.includes("개인정보") && s.includes("동의");
      }) || null;
  }

  function isCheckedFrom(node, root) {
    var inp =
      node && node.querySelector && node.querySelector("input[type='checkbox']") ||
      node && node.closest && node.closest("label") && node.closest("label").querySelector("input[type='checkbox']") ||
      root && root.querySelector && root.querySelector("input[type='checkbox']");

    if (inp) return !!inp.checked;

    var role =
      node && node.closest && node.closest("[role='checkbox']") ||
      root && root.querySelector && root.querySelector("[role='checkbox']");

    if (role) {
      var a = role.getAttribute("aria-checked");
      if (a != null) return a === "true";
    }

    var el = node && node.closest ? node.closest("label") || node : null;

    if (el) {
      var cls = (el.className || "") + " " + (node.className || "");
      return /checked|active|on|selected/i.test(cls);
    }

    return false;
  }

  function clickToCheck(node, root) {
    var inp =
      node && node.querySelector && node.querySelector("input[type='checkbox']") ||
      node && node.closest && node.closest("label") && node.closest("label").querySelector("input[type='checkbox']");

    if (inp) {
      c(inp);
      return true;
    }

    var role =
      node && node.closest && node.closest("[role='checkbox']") ||
      root && root.querySelector && root.querySelector("[role='checkbox']");

    if (role) {
      c(role);
      return true;
    }

    var lbl = node && node.closest ? node.closest("label") : null;

    if (lbl) {
      c(lbl);
      return true;
    }

    if (node) {
      c(node);
      return true;
    }

    return false;
  }

  function confirmPopup(root) {
    var btns = [...root.querySelectorAll("button,a,[role='button']")].filter(v);

    var ok = btns.find(b => {
      var t = n(b.innerText || b.textContent || "");
      return t === "확인" || t.includes("확인");
    });

    if (ok) {
      c(ok);
      return true;
    }

    return false;
  }

  function agreePopupAndConfirm() {
    var tries = 0;
    var max = 240;
    var didCheck = false;

    var timer = setInterval(function () {
      tries++;

      var root = findDialog();
      var node = getAgreeNode(root);

      if (node) {
        if (!isCheckedFrom(node, root) && !didCheck) {
          clickToCheck(node, root);
          didCheck = true;
        }

        if (isCheckedFrom(node, root)) {
          if (confirmPopup(root)) clearInterval(timer);
        }
      } else {
        if (confirmPopup(root)) clearInterval(timer);
      }

      if (tries >= max) clearInterval(timer);
    }, 50);
  }

  function waitFor(fn, done, interval, max) {
    var tries = 0;

    var timer = setInterval(function () {
      tries++;

      if (fn()) {
        clearInterval(timer);
        if (done) done();
      } else if (tries >= max) {
        clearInterval(timer);
      }
    }, interval || 150);
  }

  function runSteps() {
    waitFor(function () {
      return pickOption("익스테리어", CFG.exterior);
    }, function () {
      waitFor(function () {
        return pickOption("인테리어", CFG.interior);
      }, function () {
        waitFor(function () {
          var sel = getDealerSelect(0);
          return setSelectByText(sel, CFG.dealerCompany);
        }, function () {
          waitFor(function () {
            var sel = getDealerSelect(1);
            return setSelectByText(sel, CFG.dealerBranch);
          }, function () {
            waitFor(function () {
              var sel = getDealerSelect(2);

              if (!sel) return true;

              return setSelectByText(sel, CFG.dealerSalesperson);
            }, function () {
              setTimeout(function () {
                clickBuy();
                setTimeout(agreePopupAndConfirm, CFG.popupStart);
              }, CFG.buyGap);
            }, 200, 40);
          }, 200, 40);
        }, 200, 40);
      }, 200, 60);
    }, 200, 60);
  }

  runSteps();
};
