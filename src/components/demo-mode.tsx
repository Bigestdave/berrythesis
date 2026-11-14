"use client";

import { useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════
   Berry Thesis — Demo Mode
   Press D or open ?demo=1 to activate.
   Esc to stop. Automated navigation, scrolling, and
   cursor effects synced to the voiceover script.
   ═══════════════════════════════════════════════════════ */

type ScrollStep = { scroll: number | string; from: number; duration: number };
type TapStep = { tap: string; lands: number };
type HighlightStep = { highlight: { section: string; row?: number; text?: string }; from: number; duration?: number };
type Step = ScrollStep | TapStep | HighlightStep;
type Cue = { at: number; screen: string; steps: Step[] };

function isScroll(s: Step): s is ScrollStep { return "scroll" in s; }
function isTap(s: Step): s is TapStep { return "tap" in s; }
function isHighlight(s: Step): s is HighlightStep { return "highlight" in s; }

const NAV: Record<string, string> = {
  overview: "Overview",
  onchain: "On-chain",
  market: "Market",
  thesis: "Investment thesis",
  methodology: "Methodology",
  notebook: "Research notebook",
  changelog: "Changelog",
};

// ── The script, precisely timed to the user's voiceover ──
const SCRIPT: Cue[] = [
  // ═══ A · The number (0:00 → 0:42) ═══
  // 0:00 — "By the usual usage metrics, NEAR is shrinking..."
  // Dashboard overview, holding on hero / metrics
  {
    at: 0,
    screen: "overview",
    steps: [
      { scroll: 0, from: 0, duration: 400 },
    ],
  },
  // 0:06 — "But inside it, a settlement rail called Intents..."
  {
    at: 6,
    screen: "overview",
    steps: [
      { scroll: 380, from: 500, duration: 2400 },
    ],
  },
  // 0:17 — "At least eleven point two two billion. Nine contracts, one public query..."
  // Show On-chain view and open/scroll to BigQuery query
  {
    at: 17,
    screen: "onchain",
    steps: [
      { scroll: 0, from: 0, duration: 400 },
      { scroll: "BigQuery research toolkit", from: 800, duration: 2000 },
      { tap: "Stablecoin settlement into intents.near", lands: 3800 },
    ],
  },
  // 0:25 — "I checked every contract on-chain: six decimals, USD. One was bridged USDC..."
  // Close modal if open, scroll to 9 confirmed contracts table, highlight bridged-USDC row
  {
    at: 25,
    screen: "onchain",
    steps: [
      { tap: "Close", lands: 400 },
      { scroll: "9 confirmed", from: 600, duration: 2200 },
      { highlight: { section: "9 confirmed", row: 1 }, from: 2800, duration: 8000 },
    ],
  },
  // 0:36 — "And it's growing. Settlements per day have nearly doubled since the summer."
  // Scroll to monthly settlement table, highlight the Nov row
  {
    at: 36,
    screen: "onchain",
    steps: [
      { scroll: "Reconstructed monthly", from: 200, duration: 2000 },
      { highlight: { section: "Reconstructed monthly", row: 9 }, from: 2400, duration: 5000 },
    ],
  },

  // ═══ B · The story and the price (0:42 → 1:17) ═══
  // 0:42 — "Then I doubted my story. The brief's hypothesis: Intents flow leads real usage..."
  // Show lead-lag table with every p-value visible
  {
    at: 42,
    screen: "methodology",
    steps: [
      { scroll: 0, from: 0, duration: 300 },
      { scroll: "Lead-Lag Testing", from: 500, duration: 2400 },
      { highlight: { section: "Lead-Lag Testing", row: 0 }, from: 3000, duration: 7000 },
      { highlight: { section: "Lead-Lag Testing", row: 2 }, from: 3000, duration: 7000 },
    ],
  },
  // 0:53 — "Then the price. Since the fee switch, NEAR is up over two hundred and fifty percent..."
  // Show returns table (+251%, September's share, -35% over whole period)
  {
    at: 53,
    screen: "thesis",
    steps: [
      { scroll: 0, from: 0, duration: 300 },
      { scroll: "Measured return", from: 500, duration: 2400 },
      { highlight: { section: "Measured return", row: 1 }, from: 3000, duration: 5000 },
      { highlight: { section: "Measured return", row: 7 }, from: 4500, duration: 5000 },
      { highlight: { section: "Measured return", row: 8 }, from: 6000, duration: 5000 },
    ],
  },
  // 1:08 — "At over a hundred and fifty times revenue, it's priced for a lot..."
  // Show "what today's price requires" matrix with reported inputs
  {
    at: 68,
    screen: "thesis",
    steps: [
      { scroll: "What today's price requires", from: 400, duration: 2400 },
      { highlight: { section: "What today's price requires", row: 0 }, from: 3000, duration: 7000 },
    ],
  },

  // ═══ C · The bet and the close (1:17 → 2:13) ═══
  // 1:17 — "So there's no timing trade. What's left is a bet on the take rate..."
  // Show historical comparables / take-rate panel
  {
    at: 77,
    screen: "thesis",
    steps: [
      { scroll: "Historical comparables", from: 300, duration: 2400 },
      { highlight: { section: "Historical comparables", row: 0 }, from: 2800, duration: 6000 },
    ],
  },
  // 1:30 — "And that's the part I can't verify myself. It's reported..."
  // Show Honesty Ledger with "Reported" tags
  {
    at: 90,
    screen: "methodology",
    steps: [
      { scroll: "Honesty Ledger", from: 400, duration: 2400 },
      { highlight: { section: "Honesty Ledger", row: 9 }, from: 3000, duration: 6000 },
      { highlight: { section: "Honesty Ledger", row: 10 }, from: 3000, duration: 6000 },
    ],
  },
  // 1:38 — "It tells you exactly when it's wrong. Net revenue... has to grow fifty percent..."
  // Show falsifiers table and position sizing
  {
    at: 98,
    screen: "thesis",
    steps: [
      { scroll: "Monthly monitoring falsifiers", from: 400, duration: 2400 },
      { highlight: { section: "Monthly monitoring falsifiers", row: 0 }, from: 3000, duration: 5000 },
      { scroll: "Position sizing by risk budget", from: 5500, duration: 2200 },
    ],
  },
  // 1:55 — "Ten claims from my earlier drafts didn't survive verification..."
  // Show 10 Removed Claims, then tap Reproduce to show terminal running rebuild
  {
    at: 115,
    screen: "methodology",
    steps: [
      { scroll: "10 Removed Claims", from: 400, duration: 2200 },
      { tap: "Reproduce via rebuild.sh", lands: 3800 },
    ],
  },
  // 2:04 — "This is Berry Thesis. NEAR is short its own take rate... Not investment advice. Just the work."
  // Close modal, return to Overview hero title card, hold still
  {
    at: 124,
    screen: "overview",
    steps: [
      { tap: "Close", lands: 300 },
      { scroll: 0, from: 400, duration: 600 },
    ],
  },
];

// ── Inject demo CSS ──
const DEMO_CSS = `
.demo-overlay{position:fixed;inset:0;pointer-events:none;z-index:100000}
.demo-dot{position:fixed;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,0.65);
  box-shadow:0 0 16px rgba(255,255,255,0.4);transform:translate(-50%,-50%);
  transition:left 0.7s cubic-bezier(.4,0,.2,1),top 0.7s cubic-bezier(.4,0,.2,1),
  opacity 0.35s ease,transform 0.2s ease;pointer-events:none;z-index:100002;opacity:0}
.demo-dot.pressing{transform:translate(-50%,-50%) scale(0.82);background:rgba(255,255,255,0.85)}
@keyframes demo-ripple{0%{transform:translate(-50%,-50%) scale(0.5);opacity:0.6}
  100%{transform:translate(-50%,-50%) scale(3.2);opacity:0}}
.demo-ripple{position:fixed;width:38px;height:38px;border-radius:50%;
  border:2.5px solid rgba(255,255,255,0.45);pointer-events:none;z-index:100002;
  animation:demo-ripple 0.65s ease-out forwards}
.demo-scroll-ind{position:fixed;right:6px;top:50%;transform:translateY(-50%);width:3px;height:64px;
  border-radius:3px;background:rgba(242,65,107,0.65);box-shadow:0 0 8px rgba(242,65,107,0.4);
  pointer-events:none;z-index:100002;transition:opacity 0.9s ease;opacity:0}
.demo-countdown{position:fixed;inset:0;z-index:100003;background:rgba(0,0,0,0.94);
  display:flex;align-items:center;justify-content:center;flex-direction:column;
  font-family:var(--font-sans, system-ui, sans-serif);cursor:pointer}
.demo-countdown h1{font-size:110px;font-weight:700;color:#f2416b;margin:0;
  transition:transform 0.3s ease,color 0.3s ease;text-shadow:0 0 40px rgba(242,65,107,0.5)}
.demo-countdown p{color:#a1a1a1;font-size:15px;margin-top:20px;text-align:center;line-height:1.6}
.demo-badge{position:fixed;bottom:24px;right:24px;z-index:100003;background:rgba(10,10,10,0.9);
  border:1px solid #222222;border-radius:8px;padding:8px 14px;color:#a1a1a1;font-size:12px;
  display:flex;align-items:center;gap:8px;backdrop-filter:blur(8px);pointer-events:auto;cursor:pointer}
.demo-badge:hover{border-color:#444444;color:#ededed}
.demo-badge-dot{width:6px;height:6px;border-radius:50%;background:#f2416b;box-shadow:0 0 8px #f2416b}
`;

// ── Easing ──
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// ── DOM Helpers ──
function getScrollY(): number {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

function findElementByText(text: string): HTMLElement | null {
  const norm = text.trim().toLowerCase();
  // Check buttons, links, modal close, and headings
  const candidates = document.querySelectorAll("button, a, [role='button'], h2, h3, .nav-item");
  for (const el of candidates) {
    const t = el.textContent?.trim().toLowerCase() || "";
    if (t.startsWith(norm) || t.includes(norm)) {
      return el as HTMLElement;
    }
  }
  return null;
}

function findHeading(text: string): HTMLElement | null {
  const norm = text.toLowerCase();
  const all = document.querySelectorAll("h2, h3, .panel-heading");
  for (const h of all) {
    if (h.textContent?.toLowerCase().includes(norm)) {
      return (h.closest(".panel, section, .methodology-hero") || h) as HTMLElement;
    }
  }
  return null;
}

function getTargetScrollY(target: number | string): number {
  if (typeof target === "number") return target;
  const el = findHeading(target);
  if (!el) return -1;
  const rect = el.getBoundingClientRect();
  return getScrollY() + rect.top - 85; // 85px offset for sticky header
}

function animWindowScroll(targetY: number, duration: number, onDone?: () => void) {
  const startY = getScrollY();
  const delta = targetY - startY;
  if (Math.abs(delta) < 4) {
    onDone?.();
    return 0;
  }
  // Set html scroll-behavior to auto during scripted scrolls
  document.documentElement.style.scrollBehavior = "auto";
  const t0 = performance.now();
  let frameId = 0;

  function tick(now: number) {
    const p = Math.min((now - t0) / duration, 1);
    window.scrollTo(0, startY + delta * easeInOut(p));
    if (p < 1) {
      frameId = requestAnimationFrame(tick);
    } else {
      document.documentElement.style.scrollBehavior = "";
      onDone?.();
    }
  }
  frameId = requestAnimationFrame(tick);
  return frameId;
}

export function DemoMode() {
  const state = useRef({
    active: false,
    screen: "overview",
    timers: [] as ReturnType<typeof setTimeout>[],
    intervals: [] as ReturnType<typeof setInterval>[],
    frames: [] as number[],
    styleEl: null as HTMLStyleElement | null,
    overlay: null as HTMLDivElement | null,
    dot: null as HTMLDivElement | null,
    indicator: null as HTMLDivElement | null,
    countdownEl: null as HTMLDivElement | null,
    highlightCleanups: [] as (() => void)[],
  });

  const clearCurrentSteps = () => {
    const s = state.current;
    s.timers.forEach(clearTimeout);
    s.intervals.forEach(clearInterval);
    s.frames.forEach(cancelAnimationFrame);
    s.timers = [];
    s.intervals = [];
    s.frames = [];
    s.highlightCleanups.forEach(fn => fn());
    s.highlightCleanups = [];
    document.documentElement.style.scrollBehavior = "";
  };

  const cleanup = () => {
    const s = state.current;
    clearCurrentSteps();
    s.overlay?.remove();
    s.dot?.remove();
    s.indicator?.remove();
    s.countdownEl?.remove();
    s.styleEl?.remove();
    s.overlay = s.dot = s.indicator = s.countdownEl = s.styleEl = null;
    s.active = false;
  };

  const showDot = (x: number, y: number) => {
    const d = state.current.dot;
    if (!d) return;
    d.style.transition = "none";
    d.style.left = `${x}px`;
    d.style.top = `${y}px`;
    d.style.opacity = "1";
    d.offsetHeight; // force reflow
    d.style.transition = "left 0.7s cubic-bezier(.4,0,.2,1), top 0.7s cubic-bezier(.4,0,.2,1), opacity 0.35s ease, transform 0.2s ease";
  };

  const moveDot = (x: number, y: number) => {
    const d = state.current.dot;
    if (!d) return;
    d.style.left = `${x}px`;
    d.style.top = `${y}px`;
  };

  const hideDot = () => {
    const d = state.current.dot;
    if (d) d.style.opacity = "0";
  };

  const pressDot = () => {
    state.current.dot?.classList.add("pressing");
  };

  const releaseDot = () => {
    state.current.dot?.classList.remove("pressing");
  };

  const showRipple = (x: number, y: number) => {
    const r = document.createElement("div");
    r.className = "demo-ripple";
    r.style.left = `${x}px`;
    r.style.top = `${y}px`;
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 700);
  };

  const showIndicator = () => {
    const ind = state.current.indicator;
    if (ind) ind.style.opacity = "1";
  };

  const hideIndicator = () => {
    const ind = state.current.indicator;
    if (ind) ind.style.opacity = "0";
  };

  const highlightTableRow = (sectionText: string, rowIndex: number, durationMs = 6000) => {
    const section = findHeading(sectionText);
    if (!section) return;
    const rows = section.querySelectorAll("tbody tr");
    const row = rows[rowIndex] as HTMLElement;
    if (!row) return;

    row.style.transition = "all 0.4s ease";
    row.style.outline = "2px solid #f2416b";
    row.style.outlineOffset = "-1px";
    row.style.backgroundColor = "rgba(242, 65, 107, 0.12)";
    row.style.borderRadius = "4px";

    const revert = () => {
      row.style.outline = "";
      row.style.outlineOffset = "";
      row.style.backgroundColor = "";
    };

    state.current.highlightCleanups.push(revert);
    const timer = setTimeout(revert, durationMs);
    state.current.timers.push(timer);
  };

  // Perform tap with translucent dot, glide, ripple, and real .click()
  const executeTap = (targetText: string, landsMs: number) => {
    const s = state.current;
    const moveLeadTime = 850; // start moving 0.85s before lands
    const startMoveAt = Math.max(0, landsMs - moveLeadTime);

    const timer = setTimeout(() => {
      let attempts = 0;
      const interval = setInterval(() => {
        let el: HTMLElement | null = null;
        if (targetText.toLowerCase() === "close") {
          // Look for modal close button
          el = document.querySelector(".modal-close, button[aria-label='Close'], button[aria-label='Dismiss']") as HTMLElement;
        }
        if (!el) {
          el = findElementByText(targetText);
        }

        if (el && el.offsetParent !== null) {
          clearInterval(interval);

          const rect = el.getBoundingClientRect();
          const targetX = rect.left + rect.width / 2;
          const targetY = rect.top + rect.height / 2;

          // Start from an offset if dot is hidden
          const d = s.dot;
          if (d && (d.style.opacity === "0" || !d.style.opacity)) {
            showDot(Math.max(50, targetX - 80), Math.max(50, targetY - 60));
          }

          // Glide to target centre (~0.7s transition)
          setTimeout(() => moveDot(targetX, targetY), 20);

          // Lands: shrink slightly, ripple, click
          const clickTimer = setTimeout(() => {
            pressDot();
            showRipple(targetX, targetY);
            el.click();

            // Release and fade dot
            setTimeout(() => {
              releaseDot();
              hideDot();
            }, 250);
          }, 700);
          s.timers.push(clickTimer);
        } else if (++attempts > 30) {
          // 30 attempts * 200ms = 6s retry timeout
          clearInterval(interval);
        }
      }, 200);
      s.intervals.push(interval);
    }, startMoveAt);
    s.timers.push(timer);
  };

  const navigateToScreen = (screen: string, onDone?: () => void) => {
    const s = state.current;
    if (s.screen === screen) {
      window.scrollTo(0, 0);
      onDone?.();
      return;
    }

    const label = NAV[screen];
    if (!label) {
      window.scrollTo(0, 0);
      onDone?.();
      return;
    }

    // Find sidebar nav item
    const navItems = document.querySelectorAll(".nav-item");
    let navEl: HTMLElement | null = null;
    for (const el of navItems) {
      if (el.textContent?.toLowerCase().includes(label.toLowerCase())) {
        navEl = el as HTMLElement;
        break;
      }
    }

    if (navEl) {
      const rect = navEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      showDot(Math.max(40, cx - 40), Math.max(40, cy - 30));
      setTimeout(() => moveDot(cx, cy), 30);

      const tClick = setTimeout(() => {
        pressDot();
        showRipple(cx, cy);
        navEl!.click();
        s.screen = screen;

        setTimeout(() => {
          releaseDot();
          hideDot();
          window.scrollTo(0, 0);
          setTimeout(() => onDone?.(), 300);
        }, 200);
      }, 650);
      s.timers.push(tClick);
    } else {
      window.scrollTo(0, 0);
      s.screen = screen;
      onDone?.();
    }
  };

  const scheduleSteps = (steps: Step[]) => {
    const s = state.current;
    for (const step of steps) {
      if (isScroll(step)) {
        const timer = setTimeout(() => {
          let targetY = getTargetScrollY(step.scroll);
          if (targetY < 0) {
            // Retry for heading if section hasn't finished rendering
            let retries = 0;
            const retryInterval = setInterval(() => {
              targetY = getTargetScrollY(step.scroll);
              if (targetY >= 0 || ++retries > 15) {
                clearInterval(retryInterval);
                if (targetY >= 0) {
                  showIndicator();
                  const frame = animWindowScroll(targetY, step.duration, () => {
                    const hideTimer = setTimeout(hideIndicator, 900);
                    s.timers.push(hideTimer);
                  });
                  s.frames.push(frame);
                }
              }
            }, 150);
            s.intervals.push(retryInterval);
            return;
          }

          showIndicator();
          const frame = animWindowScroll(targetY, step.duration, () => {
            const hideTimer = setTimeout(hideIndicator, 900);
            s.timers.push(hideTimer);
          });
          s.frames.push(frame);
        }, step.from);
        s.timers.push(timer);
      } else if (isTap(step)) {
        executeTap(step.tap, step.lands);
      } else if (isHighlight(step)) {
        const timer = setTimeout(() => {
          if (step.highlight.row !== undefined) {
            highlightTableRow(step.highlight.section, step.highlight.row, step.duration || 6000);
          }
        }, step.from);
        s.timers.push(timer);
      }
    }
  };

  const runClock = () => {
    const s = state.current;
    let lastScreen = "overview";

    for (const cue of SCRIPT) {
      const needsNavigation = cue.screen !== lastScreen;
      lastScreen = cue.screen;

      const timer = setTimeout(() => {
        if (!s.active) return;
        clearCurrentSteps();

        if (needsNavigation) {
          navigateToScreen(cue.screen, () => {
            scheduleSteps(cue.steps);
          });
        } else {
          scheduleSteps(cue.steps);
        }
      }, cue.at * 1000);
      s.timers.push(timer);
    }

    // Complete marker at 2:15
    const endTimer = setTimeout(() => {
      const endBadge = document.createElement("div");
      endBadge.className = "demo-badge";
      endBadge.innerHTML = '<span class="demo-badge-dot"></span><span>Demo run finished (2:15)</span>';
      document.body.appendChild(endBadge);
      setTimeout(() => endBadge.remove(), 6000);
      cleanup();
    }, 135 * 1000);
    s.timers.push(endTimer);
  };

  const startDemo = () => {
    const s = state.current;
    if (s.active) return;
    s.active = true;

    // Inject styles
    const style = document.createElement("style");
    style.textContent = DEMO_CSS;
    document.head.appendChild(style);
    s.styleEl = style;

    // Create overlay elements
    const overlay = document.createElement("div");
    overlay.className = "demo-overlay";
    document.body.appendChild(overlay);
    s.overlay = overlay;

    const dot = document.createElement("div");
    dot.className = "demo-dot";
    document.body.appendChild(dot);
    s.dot = dot;

    const ind = document.createElement("div");
    ind.className = "demo-scroll-ind";
    document.body.appendChild(ind);
    s.indicator = ind;

    // Reset view to top of overview
    window.scrollTo(0, 0);
    s.screen = "overview";

    // 5-second countdown
    const cd = document.createElement("div");
    cd.className = "demo-countdown";
    cd.innerHTML = `
      <h1>5</h1>
      <p>Start your voiceover audio when countdown hits GO.<br/>Press Esc anytime to stop.</p>
    `;
    document.body.appendChild(cd);
    s.countdownEl = cd;

    let count = 5;
    const cdInterval = setInterval(() => {
      count--;
      const h1 = cd.querySelector("h1");
      if (!h1) return;

      if (count > 0) {
        h1.textContent = String(count);
        h1.style.transform = "scale(1.1)";
        setTimeout(() => { if (h1) h1.style.transform = "scale(1)"; }, 200);
      } else if (count === 0) {
        h1.textContent = "GO";
        h1.style.color = "#45d483";
        h1.style.transform = "scale(1.25)";
      } else {
        clearInterval(cdInterval);
        cd.remove();
        s.countdownEl = null;
        runClock();
      }
    }, 1000);
  };

  useEffect(() => {
    // Check ?demo=1 query parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "1") {
      setTimeout(startDemo, 600);
    }

    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if ((e.key === "d" || e.key === "D") && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (!state.current.active) {
          startDemo();
        } else {
          cleanup();
        }
      }

      if (e.key === "Escape" && state.current.active) {
        cleanup();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      cleanup();
    };
  }, []);

  return null;
}
