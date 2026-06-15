window.runBmwAuto = async function () {
  var CFG = {
    exterior: ["블랙 사파이어 메탈릭", "브루클린 그레이 메탈릭", "카본 블랙 메탈릭"],
    interior: [
      "BMW 인디비주얼 레더 '메리노' 타르투포",
      "BMW 인디비주얼 익스텐디드 레더 트림 메리노 커피",
      "BMW 인디비주얼 레더 ‘메리노’ 블랙",
      "베르나스카 블랙"
    ],
    dealerCompany: ["내쇼날 모터스", "바바리안 모터스", "코오롱 모터스", "동성 모터스"],
    dealerBranch: [
      "내쇼날 모터스 (전주 전시장)",
      "바바리안 모터스 (목동 전시장)",
      "동성 모터스(부산 중앙)",
      "코오롱모터스 (분당 전시장)"
    ],
    dealerSalesperson: ["김기동", "엄대동", "박성필", "민준성"],
    gap: 20,
    dealerGap: 60,
    buyGap: 500,
    popupStart: 120
  };

  function sleep(ms) {
    return new Promise(function (r) {
      setTimeout(r, ms);
    });
  }

  function n(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }

  function q(t) {
    return n(t).replace(/[‘’]/g, "'");
  }

  function arr(x) {
    return Array.isArray(x) ? x : [x];
  }

  function v(e) {
    if (!e) return false;
    var r = e.getBoundingClientRect();
    var s = getComputedStyle(e);
    return r.width > 0 &&
      r.height > 0 &&
      s.display !== "none" &&
      s.visibility !== "hidden";
  }

  function enabledOption(a) {
    if (!a || !v(a)) return false;
    var cls = (" " + (a.className || "") + " ").toLowerCase();
    var s = getComputedStyle(a);

    return !/(soldout|sold-out|disabled|deactive|inactive)/.test(cls) &&
      !a.hasAttribute("disabled") &&
      a.getAttribute("aria-disabled") !== "true" &&
      s.pointerEvents !== "none";
  }

  function c(e) {
    if (!e) return false;

    try {
      e.scrollIntoView({ behavior: "auto", block: "center" });
    } catch (_) {}

    try {
      if (e.focus) e.focus();
    } catch (_) {}

    try {
      e.click();
    } catch (_) {}

    try {
      e.dispatchEvent(new MouseEvent("mousedown", {
        bubbles: true,
        cancelable: true,
        view: window
      }));
    } catch (_) {}

    try {
      e.dispatchEvent(new MouseEvent("mouseup", {
        bubbles: true,
        cancelable: true,
        view: window
      }));
    } catch (_) {}

    try {
      e.dispatchEvent(new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window
      }));
    } catch (_) {}

    return true;
  }

  function sectionText(s) {
    var h = s && s.querySelector && s.querySelector("h3");
    return n(h && (h.innerText || h.textContent) || "");
  }

  function getSection(sec) {
    var cs = [...document.querySelectorAll("div.rsv-section,div.trim,div.section")];

    return cs.find(function (s) {
      return sectionText(s) === sec;
    }) ||
    cs.find(function (s) {
      return sectionText(s).includes(sec);
    }) ||
    [...document.querySelectorAll("h3")]
      .map(function (h) {
        return h.closest("div.rsv-section,div.trim,div.section");
      })
      .filter(Boolean)
      .find(function (s) {
        return sectionText(s).includes(sec);
      }) ||
    null;
  }

  function optionText(a) {
    var img = a.querySelector && a.querySelector("img");
    var alt = n(img && img.getAttribute("alt"));
    var title = n((img && img.getAttribute("title")) || a.getAttribute("title"));
    var aria = n(a.getAttribute && a.getAttribute("aria-label"));
    var tip = n(a.querySelector && a.querySelector(".tooltiptext") && a.querySelector(".tooltiptext").innerText);
    var all = n(a.innerText || a.textContent || "");

    return n(alt + " " + title + " " + aria + " " + tip + " " + all);
  }

  function findOption(opts, want) {
    var w = q(want);
    if (!w) return null;

    return opts.find(function (a) {
      return q(optionText(a)).includes(w);
    }) ||
    opts.find(function (a) {
      var s = q(optionText(a));
      var ws = w.split(/[\/,]/).map(q).filter(Boolean);
      return ws.length && ws.every(function (p) {
        return s.includes(p);
      });
    });
  }

  function pickOption(sec, wants) {
    var box = getSection(sec);
    if (!box) return false;

    var opts = [...box.querySelectorAll("a.tooltip,a.activable,button,[role='button']")]
      .filter(enabledOption);

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
    return getSection("딜러위치") || getSection("딜러");
  }

  function setSelectByText(sel, wants) {
    if (!sel) return false;

    var opts = [...sel.options];
    var hit = null;
    var list = arr(wants);

    for (var i = 0; i < list.length; i++) {
      var t = n(list[i]);

      hit = opts.find(function (o) {
        return n(o.textContent) === t;
      }) ||
      opts.find(function (o) {
        return n(o.textContent).includes(t);
      });

      if (hit) break;
    }

    if (!hit) {
      hit = opts.find(function (o) {
        return !o.disabled && n(o.textContent) && o.value !== "";
      }) || opts[0];
    }

    if (!hit) return false;

    sel.value = hit.value;
    sel.dispatchEvent(new Event("input", { bubbles: true }));
    sel.dispatchEvent(new Event("change", { bubbles: true }));

    return true;
  }

  function setDealer(idx, wants, optional) {
    var sec = findDealerSection();
    if (!sec) return false;

    var sels = [...sec.querySelectorAll("select")].filter(v);

    if (!sels[idx]) return optional ? true : false;

    return setSelectByText(sels[idx], wants);
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
      b = cand.find(function (el) {
        return n(el.innerText || el.textContent || "").includes(ks[i]);
      });

      if (b) break;
    }

    if (b) {
      c(b);
      return true;
    }

    return false;
  }

  function modalList() {
    return [...document.querySelectorAll(".modal-inner,[class*='ModalInner'],[role='dialog'],.modal,.popup,.layer,.dialog")]
      .filter(v);
  }

  function area(e) {
    var r = e.getBoundingClientRect();
    return r.width * r.height;
  }

  function getMainModal() {
    var ms = modalList().filter(function (m) {
      var s = n(m.innerText || m.textContent || "");
      return s.includes("개인정보") &&
        s.includes("수집") &&
        s.includes("이용") &&
        s.includes("동의");
    });

    ms.sort(function (a, b) {
      return area(a) - area(b);
    });

    return ms[0] || document.body;
  }

  function getWarnModal() {
    var ms = modalList().filter(function (m) {
      var s = n(m.innerText || m.textContent || "");
      return s.includes("동의") &&
        s.includes("체크") &&
        !s.includes("[필수]");
    });

    ms.sort(function (a, b) {
      return area(a) - area(b);
    });

    return ms[0] || null;
  }

  function clickButton(root, word) {
    var btns = [...root.querySelectorAll("button,a,[role='button'],input[type='button'],input[type='submit']")]
      .filter(v);

    var b = btns.find(function (x) {
      var t = n(x.innerText || x.textContent || x.value || "");
      var cls = (" " + (x.className || "") + " ").toLowerCase();
      var dis = x.disabled ||
        x.hasAttribute("disabled") ||
        x.getAttribute("aria-disabled") === "true" ||
        cls.includes("disabled");

      return !dis && (t === word || t.includes(word));
    });

    if (b) {
      c(b);
      return true;
    }

    return false;
  }

  function setNativeChecked(inp, val) {
    try {
      var d = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "checked");
      if (d && d.set) d.set.call(inp, val);
      else inp.checked = val;
    } catch (_) {
      inp.checked = val;
    }

    try {
      inp.dispatchEvent(new Event("input", {
        bubbles: true,
        cancelable: true,
        composed: true
      }));
    } catch (_) {}

    try {
      inp.dispatchEvent(new Event("change", {
        bubbles: true,
        cancelable: true,
        composed: true
      }));
    } catch (_) {}

    return inp.checked === val;
  }

  function getAgreeTarget() {
    var modal = getMainModal();
    var labels = [...modal.querySelectorAll("label")];

    var label = labels.find(function (l) {
      var s = n(l.innerText || l.textContent || "");
      return s.includes("개인정보") && s.includes("동의");
    }) || labels[0];

    var inp = label && label.querySelector("input[type='checkbox']") ||
      modal.querySelector("input[type='checkbox']");

    return {
      modal: modal,
      label: label,
      inp: inp
    };
  }

  async function checkAgreeOnce() {
    var t = getAgreeTarget();
    var inp = t.inp;

    if (!inp) return false;
    if (inp.checked) return true;

    try {
      inp.scrollIntoView({ behavior: "auto", block: "center" });
    } catch (_) {}

    try {
      inp.focus();
    } catch (_) {}

    try {
      inp.click();
    } catch (_) {}

    await sleep(180);

    if (inp.checked) return true;

    if (t.label) {
      try {
        t.label.click();
      } catch (_) {}

      await sleep(180);

      if (inp.checked) return true;
    }

    setNativeChecked(inp, true);
    await sleep(180);

    return inp.checked ? true : false;
  }

  async function agreePopupAndConfirm() {
    for (var i = 0; i < 300; i++) {
      var warn = getWarnModal();

      if (warn) {
        clickButton(warn, "확인");
        await sleep(180);

        var wt = getAgreeTarget();
        if (wt.inp) setNativeChecked(wt.inp, false);

        await sleep(80);
        continue;
      }

      var t = getAgreeTarget();

      if (t.inp) {
        var ok = await checkAgreeOnce();

        if (ok) {
          await sleep(250);

          if (clickButton(t.modal, "확인")) {
            return true;
          }
        }
      }

      await sleep(70);
    }

    return false;
  }

  async function waitUntil(fn, max, interval) {
    max = max || 60;
    interval = interval || 40;

    for (var i = 0; i < max; i++) {
      try {
        if (fn()) return true;
      } catch (e) {}

      await sleep(interval);
    }

    return false;
  }

  await waitUntil(function () {
    return pickOption("익스테리어", CFG.exterior);
  }, 60, 40);

  await sleep(CFG.gap);

  await waitUntil(function () {
    return pickOption("인테리어", CFG.interior);
  }, 60, 40);

  await sleep(CFG.gap);

  await waitUntil(function () {
    return setDealer(0, CFG.dealerCompany);
  }, 60, 40);

  await sleep(CFG.dealerGap);

  await waitUntil(function () {
    return setDealer(1, CFG.dealerBranch);
  }, 60, 40);

  await sleep(CFG.dealerGap);

  await waitUntil(function () {
    return setDealer(2, CFG.dealerSalesperson, true);
  }, 60, 40);

  await sleep(CFG.buyGap);

  clickBuy();

  await sleep(CFG.popupStart);

  agreePopupAndConfirm();
};
