// @ts-nocheck
/* demo-director.js
   Plays a scripted walkthrough INSIDE your running app so you can screen-record it.
   A dot glides to real buttons, clicks them, and eases the page down, all on a clock.
   Plain DOM: no React component, no framework.
   Start: open ?demo=1 or press D, or click the bottom-right button.
   Stop: Esc. Console: demo.start() / demo.stop() */
(function () {
  if (typeof window === 'undefined') return;

  /* ============ EDIT ONLY THIS BLOCK ============ */
  var SCROLLER = '.dashboard-content';   // the element that scrolls; falls back to the whole page
  var SCRIPT = [
    // ═══ Section A · The number (0:00 to 0:42) ═══
    // 0:00 — [calm, direct] By the usual usage metrics, NEAR is shrinking. Active accounts are down seventy-four percent in a year.
    { at: 0,  screen: 'Overview',            steps: [] },

    // 0:06 — [quietly intrigued] But inside it, a settlement rail called Intents says it's moved thirty-eight billion dollars...
    { at: 6,  screen: 'Overview',            steps: [{ scroll: 420, at: 500, dur: 2500 }] },

    // 0:17 — [matter-of-fact] At least eleven point two two billion. Nine contracts, one public query... and you can re-run it yourself.
    { at: 17, screen: 'On-chain analytics',  steps: [{ scroll: 'BigQuery research toolkit', at: 800, dur: 2000 }] },

    // 0:25 — [steady] I checked every contract on-chain: six decimals, USD. One was bridged USDC, not a NEAR-native stablecoin...
    { at: 25, screen: 'On-chain analytics',  steps: [{ scroll: '9 confirmed', at: 500, dur: 2200 }] },

    // 0:36 — [relaxed] And it's growing. Settlements per day have nearly doubled since the summer.
    { at: 36, screen: 'On-chain analytics',  steps: [{ scroll: 'Monthly settlements', at: 500, dur: 2200 }] },

    // ═══ Section B · The story and the price (0:42 to 1:17) ═══
    // 0:42 — [thoughtful] Then I doubted my story. The brief's hypothesis: Intents flow leads real usage...
    { at: 42, screen: 'Methodology & data',  steps: [{ scroll: 'Lead-lag', at: 800, dur: 2400 }] },

    // 0:53 — [matter-of-fact] Then the price. Since the fee switch, NEAR is up over two hundred and fifty percent...
    { at: 53, screen: 'Investment thesis',   steps: [{ scroll: 'Measured return', at: 800, dur: 2400 }] },

    // 1:08 — [slower, more serious] At over a hundred and fifty times revenue, it's priced for a lot...
    { at: 68, screen: 'Investment thesis',   steps: [{ scroll: 'Scenario', at: 500, dur: 2400 }] },

    // ═══ Section C · The bet and the close (1:17 to 2:13) ═══
    // 1:17 — [steady, resolute] So there's no timing trade. What's left is a bet on the take rate...
    { at: 77, screen: 'Investment thesis',   steps: [{ scroll: 'Historical comparables', at: 500, dur: 2200 }] },

    // 1:30 — [honest, quietly] And that's the part I can't verify myself. It's reported... so it's labelled reported...
    { at: 90, screen: 'Methodology & data',  steps: [{ scroll: 'Honesty Ledger', at: 600, dur: 2400 }] },

    // 1:38 — [firm] It tells you exactly when it's wrong. Net revenue... has to grow fifty percent in four quarters...
    { at: 98, screen: 'Investment thesis',   steps: [{ scroll: 'Falsifiers', at: 600, dur: 2400 }, { scroll: 'Position sizing', at: 5500, dur: 2200 }] },

    // 1:55 — [calm, confident] Ten claims from my earlier drafts didn't survive verification, so they're deleted...
    { at: 115, screen: 'Methodology & data', steps: [{ scroll: '10 Removed', at: 500, dur: 2200 }] },

    // 2:04 — [quiet confidence] This is Berry Thesis. NEAR is short its own take rate... Not investment advice. Just the work.
    { at: 124, screen: 'Overview',           steps: [{ scroll: 0, at: 300, dur: 600 }] }
  ];
  /* ============================================== */

  var LAND = 850;                      // the dot starts moving this long before a click lands
  var mT = [], dT = [], raf = 0, sbT = 0, cd = 0, fx = null, isRunning = false;
  var CSS = '#dfx{position:fixed;inset:0;pointer-events:none;z-index:2147483647}'
    + '#ddot{position:absolute;left:50%;top:70%;width:0;height:0;opacity:0;transition:left .72s cubic-bezier(.3,.7,.2,1),top .72s cubic-bezier(.3,.7,.2,1),opacity .25s}'
    + '#ddot i{position:absolute;left:-17px;top:-17px;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.45);border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.3),0 4px 14px rgba(0,0,0,.4);transition:transform .12s}'
    + '#ddot.dn i{transform:scale(.78)}'
    + '.drip{position:absolute;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.25);animation:drip .62s ease-out forwards}'
    + '@keyframes drip{from{transform:scale(.5);opacity:.9}to{transform:scale(3.4);opacity:0}}'
    + '#dsb{position:absolute;width:3px;border-radius:2px;background:rgba(242,65,107,.85);box-shadow:0 0 8px rgba(242,65,107,.5);opacity:0;transition:opacity .3s}#dsb.on{opacity:1}'
    + '#dcount{position:fixed;left:50%;top:28px;transform:translateX(-50%);padding:10px 24px;border-radius:999px;background:rgba(0,0,0,.85);border:1px solid #333;color:#ededed;font:600 15px system-ui,sans-serif;box-shadow:0 4px 20px rgba(0,0,0,.6);display:none;z-index:2147483647;backdrop-filter:blur(8px)}'
    + '#dpill{position:fixed;bottom:24px;right:24px;z-index:2147483640;background:#111;color:#ededed;border:1px solid #333;padding:10px 18px;border-radius:24px;font:500 13px system-ui,sans-serif;box-shadow:0 4px 20px rgba(0,0,0,.6);cursor:pointer;display:flex;align-items:center;gap:8px;pointer-events:auto;transition:all .2s}'
    + '#dpill:hover{background:#1a1a1a;border-color:#f2416b}'
    + '#dpill.on{border-color:#f2416b;background:#161616}'
    + '#dpill-dot{width:7px;height:7px;border-radius:50%;background:#f2416b;box-shadow:0 0 8px #f2416b}';

  function later(f, ms) { dT.push(setTimeout(f, ms)); }
  function stopSteps() { dT.forEach(clearTimeout); dT = []; cancelAnimationFrame(raf); }
  function ov(sel) {
    if (!fx || !fx.isConnected) {
      fx = document.createElement('div'); fx.id = 'dfx';
      fx.innerHTML = '<style>' + CSS + '</style><div id="ddot"><i></i></div><div id="dsb"></div><div id="dcount"></div><div id="dpill"><span id="dpill-dot"></span><span id="dpill-text">▶ Start Demo (Press D)</span></div>';
      document.body.appendChild(fx);
      fx.querySelector('#dpill').addEventListener('click', function (e) {
        e.stopPropagation();
        if (isRunning) stop(); else start();
      });
    }
    return fx.querySelector(sel);
  }
  function rest() {
    ov('#ddot').style.opacity = 0;
    ov('#ddot').classList.remove('dn');
    ov('#dsb').classList.remove('on');
  }
  function scroller() {
    return document.querySelector(SCROLLER) || document.scrollingElement || document.documentElement;
  }
  function edge(sc) {
    return { t: 0, r: innerWidth };
  }

  /* find a visible clickable by its text (or data-demo="..."): starts-with first, then contains */
  function find(want) {
    var all = document.querySelectorAll('button,a,[role=button],[role=tab],[role=menuitem],summary,label,[data-demo]'), k, m = null, e, r, t;
    for (k = 0; k < all.length; k++) {
      e = all[k]; r = e.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      t = (e.getAttribute('data-demo') || e.textContent).replace(/\s+/g, ' ').trim().toLowerCase();
      if (t.indexOf(want) === 0) return e;
      if (!m && t.indexOf(want) > -1 && t.length < want.length + 30) m = e;
    }
    return m;
  }

  function heading(want) {
    var h = document.querySelectorAll('h1,h2,h3,h4'), k, t;
    for (k = 0; k < h.length; k++) {
      t = h[k].textContent.toLowerCase();
      if (h[k].getBoundingClientRect().height && t.indexOf(want) > -1) return h[k];
    }
    return null;
  }

  /* thin scroll indicator, shown only while a scripted scroll runs */
  function bar(sc) {
    var b = ov('#dsb'), h = innerHeight, scrollH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight), m = scrollH - h, th;
    if (m < 8) return;
    th = Math.max(40, h * h / scrollH);
    b.style.height = th + 'px'; b.style.left = (innerWidth - 8) + 'px';
    b.style.top = (8 + (window.scrollY || 0) / m * (h - th - 16)) + 'px';
    b.classList.add('on'); clearTimeout(sbT); sbT = setTimeout(function () { b.classList.remove('on'); }, 900);
  }

  function glide(to, ms, done) {
    var sc = scroller(), from = window.scrollY || sc.scrollTop || 0;
    var max = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - innerHeight;
    var t0 = performance.now();
    document.documentElement.style.scrollBehavior = 'auto';
    to = to === 'bottom' ? max : to === 'top' ? 0 : Math.max(0, Math.min(max, to));
    cancelAnimationFrame(raf);
    (function f(n) {
      var k = Math.min(1, Math.max(0, (n - t0) / ms)), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      var cur = from + (to - from) * e;
      window.scrollTo(0, cur);
      if (sc && sc !== document.documentElement) sc.scrollTop = cur;
      if (Math.abs(to - from) > 4) bar(sc);
      if (k < 1) {
        raf = requestAnimationFrame(f);
      } else {
        document.documentElement.style.scrollBehavior = '';
        if (done) done();
      }
    })(t0);
  }

  function scrollToTarget(target, ms, n) {
    var h;
    if (typeof target === 'string' && target !== 'top' && target !== 'bottom') {
      h = heading(target.toLowerCase());
      if (!h) { if ((n || 0) < 30) later(function () { scrollToTarget(target, ms, (n || 0) + 1); }, 200); return; }
      target = h.getBoundingClientRect().top + (window.scrollY || 0) - 85;
    }
    glide(target, ms);
  }

  function ripple(x, y) {
    var r = document.createElement('i'); r.className = 'drip'; r.style.left = x + 'px'; r.style.top = y + 'px';
    ov('#dfx') || 0; fx.appendChild(r); setTimeout(function () { r.remove(); }, 700);
  }

  /* glide the dot to the real element, press, ripple, then click it for real */
  function tap(text, n) {
    var want = text.toLowerCase(), el = find(want), dot = ov('#ddot'), r0, sc;
    if (!el) { if ((n || 0) < 30) later(function () { tap(text, (n || 0) + 1); }, 200); return; }
    function aim() {
      var r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      dot.style.opacity = 1; dot.style.left = x + 'px'; dot.style.top = y + 'px';
      later(function () {
        dot.classList.add('dn'); ripple(x, y);
        later(function () {
          var target = find(want) || el;
          target.click();
          // Trigger React navigation if available
          var sec = target.getAttribute('data-section');
          if (sec && window.demoNavigate) window.demoNavigate(sec);
          dot.classList.remove('dn');
          later(function () { dot.style.opacity = 0; }, 800);
        }, 110);
      }, 720);
    }
    r0 = el.getBoundingClientRect();
    if (r0.bottom < 0 || r0.top > innerHeight) {
      sc = scroller();
      glide((window.scrollY || 0) + r0.top - innerHeight / 2, 650, aim);
    } else aim();
  }

  /* one cue: click its sidebar item (lands at `at`), reset scroll, then run its steps */
  function fire(i) {
    var c = SCRIPT[i], nav = c.screen && i > 0, L = nav ? LAND : 0;
    stopSteps(); rest();
    if (nav) {
      tap(c.screen);
      later(function () {
        window.scrollTo(0, 0);
        var sc = scroller(); if (sc) sc.scrollTop = 0;
      }, L + 150);
    }
    (c.steps || []).forEach(function (s) {
      if (s.tap) later(function () { tap(s.tap); }, Math.max(0, L + s.at - LAND));
      else later(function () { scrollToTarget(s.scroll, s.dur || 2500); }, L + s.at);
    });
  }

  function stop() {
    isRunning = false;
    stopSteps(); mT.forEach(clearTimeout); mT = []; clearInterval(cd);
    rest();
    var cnt = ov('#dcount'), pill = ov('#dpill'), txt = ov('#dpill-text');
    if (cnt) cnt.style.display = 'none';
    if (pill) pill.classList.remove('on');
    if (txt) txt.textContent = '▶ Start Demo (Press D)';
  }

  function start() {
    stop();
    isRunning = true;
    var base = SCRIPT[0].at, n = 5, cnt = ov('#dcount'), pill = ov('#dpill'), txt = ov('#dpill-text');
    var e = SCRIPT[0].screen && find(SCRIPT[0].screen.toLowerCase());
    if (e) {
      e.click();
      if (e.getAttribute('data-section') && window.demoNavigate) window.demoNavigate(e.getAttribute('data-section'));
    }
    window.scrollTo(0, 0);
    var sc = scroller(); if (sc) sc.scrollTop = 0;

    pill.classList.add('on');
    txt.textContent = 'Demo Running (Esc to stop)';

    cnt.style.display = 'block'; cnt.textContent = 'Starting in ' + n + '… (Start voiceover at GO)';
    cd = setInterval(function () {
      n--;
      if (n > 0) {
        cnt.textContent = 'Starting in ' + n + '… (Start voiceover at GO)';
      } else if (n === 0) {
        cnt.textContent = 'GO! (Audio starting)';
        cnt.style.color = '#45d483';
      } else {
        clearInterval(cd);
        cnt.style.display = 'none';
        cnt.style.color = '#ededed';
        SCRIPT.forEach(function (c, i) {
          var t = (c.at - base) * 1000 - (c.screen && i > 0 ? LAND : 0);
          mT.push(setTimeout(function () { fire(i); }, Math.max(0, t)));
        });
        mT.push(setTimeout(stop, (SCRIPT[SCRIPT.length - 1].at - base + 8) * 1000));
      }
    }, 1000);
  }

  addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName || '').toLowerCase();
    if (e.key === 'Escape') stop();
    else if ((e.key === 'd' || e.key === 'D') && !e.metaKey && !e.ctrlKey && !e.altKey && tag !== 'input' && tag !== 'textarea' && !(e.target && e.target.isContentEditable)) {
      if (isRunning) stop(); else start();
    }
  });

  window.demo = { start: start, stop: stop, SCRIPT: SCRIPT };
  ov('#dpill'); // initialize floating trigger button immediately

  if (/[?&]demo=1\b/.test(location.search)) {
    if (document.readyState === 'complete') setTimeout(start, 1200);
    else addEventListener('load', function () { setTimeout(start, 1200); });
  }
})();
