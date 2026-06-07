window.runBmwAuto = function () {
  var CFG = {
    exterior: ["블랙 사파이어 메탈릭", "브루클린 그레이 메탈릭", "카본 블랙 메탈릭"],
    interior: ["BMW 인디비주얼 익스텐디드 레더 트림 메리노 커피", "BMW 인디비주얼 레더 ‘메리노’ 블랙", "베르나스카 블랙"],
    dealerCompany: ["내쇼날 모터스", "바바리안 모터스", "코오롱 모터스"],
    dealerBranch: ["내쇼날 모터스 (전주 전시장)", "바바리안 모터스 (목동 전시장)"],
    dealerSalesperson: ["김기동", "엄대동"],
    gap: 50,
    dealerGap: 300,
    buyGap: 1200,
    popupStart: 150
  };

  function n(t){return(t||"").replace(/\s+/g," ").trim()}
  function arr(x){return Array.isArray(x)?x:[x]}
  function v(e){if(!e)return 0;var r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=="none"&&s.visibility!=="hidden"}
  function enabledOption(a){if(!a||!v(a))return 0;var cls=" "+(a.className||"")+" ",s=getComputedStyle(a);return !cls.includes(" soldout ")&&!a.classList.contains("disabled")&&!a.hasAttribute("disabled")&&a.getAttribute("aria-disabled")!=="true"&&s.pointerEvents!=="none"}
  function c(e){try{e.scrollIntoView({behavior:"smooth",block:"center"})}catch(_){}try{e.click()}catch(_){try{e.dispatchEvent(new MouseEvent("mousedown",{bubbles:true}));e.dispatchEvent(new MouseEvent("mouseup",{bubbles:true}));e.dispatchEvent(new MouseEvent("click",{bubbles:true}))}catch(__){}}}
  function getTrim(sec){return[...document.querySelectorAll("div.trim")].find(t=>n(t.querySelector("h3")&&t.querySelector("h3").innerText)===sec)}
  function optionText(a){var alt=n(a.querySelector("img")&&a.querySelector("img").getAttribute("alt"));var tip=n(a.querySelector(".tooltiptext")&&a.querySelector(".tooltiptext").innerText);var all=n(a.innerText||a.textContent||"");return n(alt+" "+tip+" "+all)}
  function findOption(opts,want){var w=n(want);if(!w)return null;return opts.find(a=>optionText(a).includes(w))||opts.find(a=>{var s=optionText(a);var ws=w.split("/").map(n).filter(Boolean);return ws.length&&ws.every(p=>s.includes(p))})}
  function pickOption(sec,wants){var trim=getTrim(sec);if(!trim)return 0;var opts=[...trim.querySelectorAll("a.tooltip")].filter(enabledOption);if(!opts.length)return 0;var hit=null,list=arr(wants);for(var i=0;i<list.length;i++){hit=findOption(opts,list[i]);if(hit)break}if(!hit)hit=opts[0];c(hit);return 1}
  function findDealerSection(){return[...document.querySelectorAll("div.section.section02")].find(s=>n(s.querySelector("h3")&&s.querySelector("h3").innerText)==="딜러위치")}
  function setSelectByText(sel,wants){if(!sel)return 0;var opts=[...sel.options],hit=null,list=arr(wants);for(var i=0;i<list.length;i++){var t=n(list[i]);hit=opts.find(o=>n(o.textContent)===t)||opts.find(o=>n(o.textContent).includes(t));if(hit)break}if(!hit)hit=opts.find(o=>!o.disabled&&n(o.textContent)&&o.value!=="")||opts[0];if(!hit)return 0;sel.value=hit.value;sel.dispatchEvent(new Event("input",{bubbles:true}));sel.dispatchEvent(new Event("change",{bubbles:true}));return 1}
  function clickBuy(){var ks=["구매하기","구매","결제","바로구매"];var cand=[...document.querySelectorAll("button,a,[role='button']")].filter(v);var b=null;for(var i=0;i<ks.length;i++){b=cand.find(el=>n(el.innerText||el.textContent||"").includes(ks[i]));if(b)break}if(b&&v(b))c(b)}
  function findDialog(){var ds=[...document.querySelectorAll("[role='dialog'],.modal,.popup,.layer,.dialog")].filter(v);return ds[ds.length-1]||document.body}
  function getAgreeNode(root){return[...root.querySelectorAll("label,div,span,p")].filter(v).find(el=>{var s=n(el.innerText||el.textContent||"");return s.includes("[필수]")&&s.includes("개인정보")&&s.includes("동의")})||null}
  function isCheckedFrom(node,root){var inp=node&&node.querySelector&&node.querySelector("input[type='checkbox']")||node&&node.closest&&node.closest("label")&&node.closest("label").querySelector("input[type='checkbox']")||root&&root.querySelector&&root.querySelector("input[type='checkbox']");if(inp)return!!inp.checked;var role=node&&node.closest&&node.closest("[role='checkbox']")||root&&root.querySelector&&root.querySelector("[role='checkbox']");if(role){var a=role.getAttribute("aria-checked");if(a!=null)return a==="true"}return 0}
  function clickToCheck(node,root){var inp=node&&node.querySelector&&node.querySelector("input[type='checkbox']")||node&&node.closest&&node.closest("label")&&node.closest("label").querySelector("input[type='checkbox']");if(inp){c(inp);return 1}var role=node&&node.closest&&node.closest("[role='checkbox']")||root&&root.querySelector&&root.querySelector("[role='checkbox']");if(role){c(role);return 1}var lbl=node&&node.closest?node.closest("label"):null;if(lbl){c(lbl);return 1}if(node){c(node);return 1}return 0}
  function confirmPopup(root){var ok=[...root.querySelectorAll("button,a,[role='button']")].filter(v).find(b=>{var t=n(b.innerText||b.textContent||"");return t==="확인"||t.includes("확인")});if(ok){c(ok);return 1}return 0}
  function agreePopupAndConfirm(){var tries=0,max=240,didCheck=0,timer=setInterval(function(){tries++;var root=findDialog();var node=getAgreeNode(root);if(node){if(!isCheckedFrom(node,root)&&!didCheck){clickToCheck(node,root);didCheck=1}if(isCheckedFrom(node,root)&&confirmPopup(root))clearInterval(timer)}else if(confirmPopup(root))clearInterval(timer);if(tries>=max)clearInterval(timer)},50)}

  pickOption("익스테리어",CFG.exterior);
  setTimeout(function(){pickOption("인테리어",CFG.interior)},CFG.gap);
  setTimeout(function(){var sec=findDealerSection();if(!sec)return;setSelectByText(sec.querySelector("select.left"),CFG.dealerCompany);setTimeout(function(){sec=findDealerSection();setSelectByText(sec&&sec.querySelector("select.right"),CFG.dealerBranch);setTimeout(function(){sec=findDealerSection();setSelectByText(sec&&sec.querySelector("select:nth-child(4)"),CFG.dealerSalesperson)},CFG.dealerGap)},CFG.dealerGap)},CFG.gap*2);
  setTimeout(function(){clickBuy();setTimeout(agreePopupAndConfirm,CFG.popupStart)},CFG.buyGap);
};
