// ==UserScript==
// @name         PASS Mobile Auto
// @namespace    https://github.com/KTG-kr/bmwauto
// @version      1.0
// @match        https://nice.checkplus.co.kr/cert/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  function n(t){return(t||"").replace(/\s+/g," ").trim()}
  function v(e){if(!e)return false;var r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=="none"&&s.visibility!=="hidden"}
  function c(e){try{e.scrollIntoView({behavior:"smooth",block:"center"})}catch(_){}try{e.click()}catch(_){try{e.dispatchEvent(new MouseEvent("mousedown",{bubbles:true}));e.dispatchEvent(new MouseEvent("mouseup",{bubbles:true}));e.dispatchEvent(new MouseEvent("click",{bubbles:true}))}catch(__){}}}
  function txt(e){var img=[...e.querySelectorAll("img")].map(i=>n(i.alt||i.title||i.getAttribute("aria-label")||"")).join(" ");return n((e.innerText||e.textContent||"")+" "+img+" "+(e.getAttribute("aria-label")||"")+" "+(e.title||""))}
  function cand(){return[...document.querySelectorAll("button,a,label,li,div,span,[role='button'],[onclick]")].filter(v)}
  function clickSkt(){var hit=cand().find(e=>{var t=txt(e);return (t==="SKT"||t.includes("SKT"))&&!t.includes("알뜰폰")});if(hit){c(hit);return true}return false}
  function clickPass(){var hit=cand().find(e=>{var t=txt(e);return t.includes("PASS 인증")||(t.includes("PASS")&&t.includes("인증"))});if(hit){c(hit);return true}return false}
  function clickAgree(){var hit=cand().find(e=>{var t=txt(e);return t.includes("본인확인")&&t.includes("이용 동의")&&t.includes("필수")});if(hit){c(hit);return true}return false}
  function clickNext(){var hit=cand().find(e=>txt(e)==="다음")||cand().find(e=>txt(e).includes("다음"));if(hit){c(hit);return true}return false}

  var tries = 0;
  var timer = setInterval(function () {
    tries++;

    if (location.href.includes("/cert/main/menu")) {
      clickSkt();
    } else {
      clickPass();
      setTimeout(clickAgree, 200);
      setTimeout(clickNext, 450);
    }

    if (tries > 240) clearInterval(timer);
  }, 250);
})();
