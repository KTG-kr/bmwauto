(() => {
const CFG = {
  exterior: "블랙 사파이어 메탈릭",
  interior: "BMW 인디비주얼 레더 ‘메리노’ 타르투포",
  dealerCompany: "바바리안 모터스",
  dealerBranch: "바바리안 모터스 (목동 전시장)",
  dealerSalesperson: "엄대동",

  gap: 100,
  dealerGap: 300,
  buyGap: 1300,
  popupStart: 5000,

  agreeClickDelay: 2000,
  confirmClickDelay: 2000
};

  const norm = v =>
    (typeof v === "string" ? v : (v?.innerText || v?.textContent || ""))
      .replace(/\s+/g, " ")
      .trim();

  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];

  const visible = el => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const st = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && st.display !== "none" && st.visibility !== "hidden";
  };

  const clickEl = el => {
    if (!el) return;
    try {
      el.scrollIntoView({ block: "center" });
    } catch {}

    try {
      el.click();
    } catch {
      try {
        ["mousedown", "mouseup", "click"].forEach(type => {
          el.dispatchEvent(new MouseEvent(type, { bubbles: true }));
        });
      } catch {}
    }
  };

  const getTrim = title =>
    qsa("div.trim").find(t => norm(qs("h3", t)) === title);

  const optionText = a =>
    [
      norm(qs("img", a)?.getAttribute("alt")),
      norm(qs(".tooltiptext", a)),
      norm(a)
    ].join(" ");

  const pickOption = (sectionTitle, wantText) => {
    const trim = getTrim(sectionTitle);
    if (!trim) return false;

    const options = qsa("a.tooltip", trim).filter(visible);
    if (!options.length) return false;

    const want = norm(wantText);

    let hit =
      options.find(a => optionText(a).includes(want)) ||
      options.find(a =>
        want
          .split("/")
          .map(norm)
          .filter(Boolean)
          .every(x => optionText(a).includes(x))
      ) ||
      options[0];

    clickEl(hit);
    return true;
  };

  const findDealerSection = () =>
    qsa("div.section.section02").find(s => norm(qs("h3", s)) === "딜러위치");

  const setSelectByText = (select, text) => {
    if (!select) return false;

    const target = norm(text);
    const option =
      [...select.options].find(o => norm(o.textContent) === target) ||
      [...select.options].find(o => norm(o.textContent).includes(target));

    if (!option) return false;

    select.value = option.value;
    select.dispatchEvent(new Event("input", { bubbles: true }));
    select.dispatchEvent(new Event("change", { bubbles: true }));

    return true;
  };

  const clickBuy = () => {
    const words = ["구매하기", "구매", "결제", "바로구매"];

    const btn = qsa("button,a,[role='button']")
      .filter(visible)
      .find(el => words.some(w => norm(el).includes(w)));

    clickEl(btn);
  };

  const findDialog = () =>
    qsa("[role='dialog'],.modal,.popup,.layer,.dialog")
      .filter(visible)
      .pop() || document.body;

  const getAgreeNode = root =>
    qsa("label,div,span,p", root)
      .filter(visible)
      .find(el => {
        const t = norm(el);
        return t.includes("[필수]") && t.includes("개인정보") && t.includes("동의");
      });

  const isCheckedFrom = (node, root) => {
    const input =
      node?.querySelector?.("input[type='checkbox']") ||
      node?.closest?.("label")?.querySelector("input[type='checkbox']") ||
      root?.querySelector?.("input[type='checkbox']");

    if (input) return !!input.checked;

    const role =
      node?.closest?.("[role='checkbox']") ||
      root?.querySelector?.("[role='checkbox']");

    if (role) return role.getAttribute("aria-checked") === "true";

    const label = node?.closest?.("label");
    if (label) {
      const cls = `${label.className || ""} ${node.className || ""}`;
      return /checked|active|on|selected/i.test(cls);
    }

    return false;
  };

  const clickToCheck = (node, root) => {
    const target =
      node?.querySelector?.("input[type='checkbox']") ||
      node?.closest?.("label")?.querySelector("input[type='checkbox']") ||
      node?.closest?.("[role='checkbox']") ||
      root?.querySelector?.("[role='checkbox']") ||
      node?.closest?.("label") ||
      node;

    clickEl(target);
  };

  const confirmPopup = root => {
    const ok = qsa("button,a,[role='button']", root)
      .filter(visible)
      .find(el => {
        const t = norm(el);
        return t === "확인" || t.includes("확인");
      });

    if (ok) {
      clickEl(ok);
      return true;
    }

    return false;
  };

const agreePopupAndConfirm = () => {
  let count = 0;
  let didCheck = false;
  let didConfirm = false;

  const timer = setInterval(() => {
    count++;

    const root = findDialog();
    const agreeNode = getAgreeNode(root);

    if (agreeNode) {
      if (!isCheckedFrom(agreeNode, root) && !didCheck) {
        didCheck = true;

        setTimeout(() => {
          clickToCheck(agreeNode, root);
        }, CFG.agreeClickDelay);

        return;
      }

      if (isCheckedFrom(agreeNode, root) && !didConfirm) {
        didConfirm = true;

        setTimeout(() => {
          const latestRoot = findDialog();
          if (confirmPopup(latestRoot)) clearInterval(timer);
        }, CFG.confirmClickDelay);

        return;
      }
    } else {
      if (!didConfirm) {
        didConfirm = true;

        setTimeout(() => {
          const latestRoot = findDialog();
          if (confirmPopup(latestRoot)) clearInterval(timer);
        }, CFG.confirmClickDelay);
      }
    }

    if (count >= 240) clearInterval(timer);
  }, 50);
};

  pickOption("익스테리어", CFG.exterior);

  setTimeout(() => {
    pickOption("인테리어", CFG.interior);
  }, CFG.gap);

  setTimeout(() => {
    let sec = findDealerSection();
    if (!sec) return;

    const company = qs("select.left", sec);
    setSelectByText(company, CFG.dealerCompany);

    setTimeout(() => {
      sec = findDealerSection();
      const branch = sec && qs("select.right", sec);
      setSelectByText(branch, CFG.dealerBranch);

      setTimeout(() => {
        sec = findDealerSection();
        const salesperson = sec && qs("select:nth-child(4)", sec);
        setSelectByText(salesperson, CFG.dealerSalesperson);
      }, CFG.dealerGap);
    }, CFG.dealerGap);
  }, CFG.gap * 2);

  setTimeout(() => {
    clickBuy();

    setTimeout(() => {
      agreePopupAndConfirm();
    }, CFG.popupStart);
  }, CFG.buyGap);
})();
