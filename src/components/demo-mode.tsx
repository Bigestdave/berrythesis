"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DialogState } from "@/components/research-dialogs";
import type { Section } from "@/lib/types";

/* ═══════════════════════════════════════════════════════
   Berry Thesis — Automated Demo Mode
   Press D, click the floating button, or open ?demo=1.
   Press Esc to stop.
   Synchronized to the 2:13 voiceover script.
   ═══════════════════════════════════════════════════════ */

type ScrollStep = { scroll: number | string; from: number; duration: number };
type TapStep = { tap: string; lands: number; dialog?: DialogState };
type HighlightStep = { highlight: { section: string; row?: number; text?: string }; from: number; duration?: number };
type Step = ScrollStep | TapStep | HighlightStep;
type Cue = { at: number; screen: Section; steps: Step[] };

function isScroll(s: Step): s is ScrollStep { return "scroll" in s; }
function isTap(s: Step): s is TapStep { return "tap" in s; }
function isHighlight(s: Step): s is HighlightStep { return "highlight" in s; }

const NAV_LABELS: Record<Section, string> = {
  overview: "Overview",
  onchain: "On-chain",
  market: "Market",
  thesis: "Investment thesis",
  methodology: "Methodology",
  notebook: "notebook",
  changelog: "Changelog",
};

// ── Cue schedule matching the 2:13 voiceover ──
const CUES: Cue[] = [
  // ═══ Section A · The number (0:00 to 0:42) ═══
  // 0:00 — "By the usual usage metrics, NEAR is shrinking..."
  {
    at: 0,
    screen: "overview",
    steps: [
      { scroll: 0, from: 0, duration: 300 },
    ],
  },
  // 0:06 — "But inside it, a settlement rail called Intents says it's moved thirty-eight billion dollars..."
  {
    at: 6,
    screen: "overview",
    steps: [
      { scroll: 420, from: 300, duration: 2500 },
    ],
  },
  // 0:17 — "At least eleven point two two billion. Nine contracts, one public query... and you can re-run it yourself."
  {
    at: 17,
    screen: "onchain",
    steps: [
      { scroll: 0, from: 0, duration: 300 },
      { scroll: "BigQuery research toolkit", from: 500, duration: 2000 },
      { tap: "Stablecoin settlement into intents.near", lands: 3400, dialog: { type: "query", queryId: "inflow" } },
    ],
  },
  // 0:25 — "I checked every contract on-chain: six decimals, USD. One was bridged USDC, not a NEAR-native stablecoin..."
  {
    at: 25,
    screen: "onchain",
    steps: [
      { tap: "Close", lands: 300 },
      { scroll: "9 confirmed", from: 600, duration: 2200 },
      { highlight: { section: "9 confirmed", row: 1 }, from: 2800, duration: 8000 },
    ],
  },
  // 0:36 — "And it's growing. Settlements per day have nearly doubled since the summer."
  {
    at: 36,
    screen: "onchain",
    steps: [
      { scroll: "Reconstructed monthly", from: 300, duration: 2000 },
      { highlight: { section: "Reconstructed monthly", row: 9 }, from: 2400, duration: 5000 },
    ],
  },

  // ═══ Section B · The story and the price (0:42 to 1:17) ═══
  // 0:42 — "Then I doubted my story. The brief's hypothesis: Intents flow leads real usage..."
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
  {
    at: 68,
    screen: "thesis",
    steps: [
      { scroll: "What today's price requires", from: 400, duration: 2400 },
      { highlight: { section: "What today's price requires", row: 0 }, from: 3000, duration: 7000 },
    ],
  },

  // ═══ Section C · The bet and the close (1:17 to 2:13) ═══
  // 1:17 — "So there's no timing trade. What's left is a bet on the take rate..."
  {
    at: 77,
    screen: "thesis",
    steps: [
      { scroll: "Historical comparables", from: 400, duration: 2200 },
      { highlight: { section: "Historical comparables", row: 0 }, from: 2800, duration: 6000 },
    ],
  },
  // 1:30 — "And that's the part I can't verify myself. It's reported..."
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
  {
    at: 115,
    screen: "methodology",
    steps: [
      { scroll: "10 Removed Claims", from: 400, duration: 2000 },
      { tap: "Reproduce via rebuild.sh", lands: 3600, dialog: { type: "reproduce" } },
    ],
  },
  // 2:04 — "This is Berry Thesis. NEAR is short its own take rate... Not investment advice. Just the work."
  {
    at: 124,
    screen: "overview",
    steps: [
      { tap: "Close", lands: 300 },
      { scroll: 0, from: 500, duration: 600 },
    ],
  },
];

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function findElement(text: string): HTMLElement | null {
  const norm = text.trim().toLowerCase();
  const all = document.querySelectorAll("button, a, [role='button'], h2, h3, .nav-item");
  for (const el of all) {
    const t = el.textContent?.trim().toLowerCase() || "";
    if (t.startsWith(norm) || t.includes(norm)) return el as HTMLElement;
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

function getScrollY(): number {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

function getTargetY(target: number | string): number {
  if (typeof target === "number") return target;
  const el = findHeading(target);
  if (!el) return -1;
  const rect = el.getBoundingClientRect();
  return getScrollY() + rect.top - 85;
}

interface DemoModeProps {
  onNavigate: (section: Section) => void;
  onOpenDialog: (dialog: DialogState) => void;
  onCloseDialog: () => void;
  currentSection: Section;
}

export function DemoMode({ onNavigate, onOpenDialog, onCloseDialog, currentSection }: DemoModeProps) {
  const [active, setActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);
  const framesRef = useRef<number[]>([]);
  const cleanupsRef = useRef<(() => void)[]>([]);

  const dotRef = useRef<HTMLDivElement | null>(null);
  const indRef = useRef<HTMLDivElement | null>(null);

  const clearSteps = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    intervalsRef.current.forEach(clearInterval);
    framesRef.current.forEach(cancelAnimationFrame);
    cleanupsRef.current.forEach(fn => fn());
    timersRef.current = [];
    intervalsRef.current = [];
    framesRef.current = [];
    cleanupsRef.current = [];
    document.documentElement.style.scrollBehavior = "";
    if (indRef.current) indRef.current.style.opacity = "0";
    if (dotRef.current) dotRef.current.style.opacity = "0";
  }, []);

  const stopDemo = useCallback(() => {
    clearSteps();
    setActive(false);
    setCountdown(null);
    setElapsed(0);
    onCloseDialog();
  }, [clearSteps, onCloseDialog]);

  const showDot = useCallback((x: number, y: number) => {
    const d = dotRef.current;
    if (!d) return;
    d.style.transition = "none";
    d.style.left = `${x}px`;
    d.style.top = `${y}px`;
    d.style.opacity = "1";
    d.offsetHeight;
    d.style.transition = "left 0.7s cubic-bezier(.4,0,.2,1), top 0.7s cubic-bezier(.4,0,.2,1), opacity 0.35s ease, transform 0.2s ease";
  }, []);

  const moveDot = useCallback((x: number, y: number) => {
    const d = dotRef.current;
    if (!d) return;
    d.style.left = `${x}px`;
    d.style.top = `${y}px`;
  }, []);

  const hideDot = useCallback(() => {
    if (dotRef.current) dotRef.current.style.opacity = "0";
  }, []);

  const showRipple = useCallback((x: number, y: number) => {
    const r = document.createElement("div");
    r.className = "demo-ripple";
    r.style.left = `${x}px`;
    r.style.top = `${y}px`;
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 700);
  }, []);

  const animScroll = useCallback((targetY: number, duration: number, onDone?: () => void) => {
    const startY = getScrollY();
    const delta = targetY - startY;
    if (Math.abs(delta) < 4) { onDone?.(); return; }

    document.documentElement.style.scrollBehavior = "auto";
    if (indRef.current) indRef.current.style.opacity = "1";

    const t0 = performance.now();
    let frameId = 0;

    function tick(now: number) {
      const p = Math.min((now - t0) / duration, 1);
      window.scrollTo(0, startY + delta * easeInOut(p));
      if (p < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        document.documentElement.style.scrollBehavior = "";
        if (indRef.current) indRef.current.style.opacity = "0";
        onDone?.();
      }
    }
    frameId = requestAnimationFrame(tick);
    framesRef.current.push(frameId);
  }, []);

  const highlightRow = useCallback((sectionText: string, rowIndex: number, durationMs = 6000) => {
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
    cleanupsRef.current.push(revert);
    const t = setTimeout(revert, durationMs);
    timersRef.current.push(t);
  }, []);

  const executeTap = useCallback((targetText: string, landsMs: number, dialogFallback?: DialogState) => {
    const startMoveAt = Math.max(0, landsMs - 850);

    const timer = setTimeout(() => {
      let attempts = 0;
      const interval = setInterval(() => {
        let el: HTMLElement | null = null;
        if (targetText.toLowerCase() === "close") {
          el = document.querySelector(".modal-close, button[aria-label='Close'], button[aria-label='Dismiss']") as HTMLElement;
        }
        if (!el) el = findElement(targetText);

        if (el && el.offsetParent !== null) {
          clearInterval(interval);
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;

          showDot(Math.max(50, cx - 70), Math.max(50, cy - 40));
          setTimeout(() => moveDot(cx, cy), 30);

          const clickTimer = setTimeout(() => {
            if (dotRef.current) dotRef.current.classList.add("pressing");
            showRipple(cx, cy);
            el.click();

            if (targetText.toLowerCase() === "close") {
              onCloseDialog();
            } else if (dialogFallback) {
              onOpenDialog(dialogFallback);
            }

            setTimeout(() => {
              if (dotRef.current) dotRef.current.classList.remove("pressing");
              hideDot();
            }, 200);
          }, 700);
          timersRef.current.push(clickTimer);
        } else if (++attempts > 25) {
          clearInterval(interval);
          if (targetText.toLowerCase() === "close") {
            onCloseDialog();
          } else if (dialogFallback) {
            onOpenDialog(dialogFallback);
          }
        }
      }, 200);
      intervalsRef.current.push(interval);
    }, startMoveAt);
    timersRef.current.push(timer);
  }, [hideDot, moveDot, onCloseDialog, onOpenDialog, showDot, showRipple]);

  const navigateWithGlide = useCallback((screen: Section, onDone?: () => void) => {
    const label = NAV_LABELS[screen];
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

      showDot(Math.max(30, cx - 40), Math.max(30, cy - 20));
      setTimeout(() => moveDot(cx, cy), 30);

      const tClick = setTimeout(() => {
        if (dotRef.current) dotRef.current.classList.add("pressing");
        showRipple(cx, cy);
        navEl.click();
        onNavigate(screen);

        setTimeout(() => {
          if (dotRef.current) dotRef.current.classList.remove("pressing");
          hideDot();
          window.scrollTo(0, 0);
          setTimeout(() => onDone?.(), 300);
        }, 200);
      }, 650);
      timersRef.current.push(tClick);
    } else {
      onNavigate(screen);
      window.scrollTo(0, 0);
      setTimeout(() => onDone?.(), 100);
    }
  }, [hideDot, moveDot, onNavigate, showDot, showRipple]);

  const scheduleSteps = useCallback((steps: Step[]) => {
    for (const step of steps) {
      if (isScroll(step)) {
        const timer = setTimeout(() => {
          let targetY = getTargetY(step.scroll);
          if (targetY < 0) {
            let retries = 0;
            const rInt = setInterval(() => {
              targetY = getTargetY(step.scroll);
              if (targetY >= 0 || ++retries > 15) {
                clearInterval(rInt);
                if (targetY >= 0) animScroll(targetY, step.duration);
              }
            }, 150);
            intervalsRef.current.push(rInt);
          } else {
            animScroll(targetY, step.duration);
          }
        }, step.from);
        timersRef.current.push(timer);
      } else if (isTap(step)) {
        executeTap(step.tap, step.lands, step.dialog);
      } else if (isHighlight(step)) {
        const timer = setTimeout(() => {
          if (step.highlight.row !== undefined) {
            highlightRow(step.highlight.section, step.highlight.row, step.duration || 6000);
          }
        }, step.from);
        timersRef.current.push(timer);
      }
    }
  }, [animScroll, executeTap, highlightRow]);

  const runChoreography = useCallback(() => {
    let lastScreen = "overview";

    // Track elapsed time
    const t0 = Date.now();
    const clockInt = setInterval(() => {
      setElapsed(Math.floor((Date.now() - t0) / 1000));
    }, 500);
    intervalsRef.current.push(clockInt);

    for (const cue of CUES) {
      const screenChanged = cue.screen !== lastScreen;
      lastScreen = cue.screen;

      const timer = setTimeout(() => {
        clearSteps();
        if (screenChanged) {
          navigateWithGlide(cue.screen, () => {
            scheduleSteps(cue.steps);
          });
        } else {
          scheduleSteps(cue.steps);
        }
      }, cue.at * 1000);
      timersRef.current.push(timer);
    }

    // Complete at 2:15
    const endTimer = setTimeout(() => {
      stopDemo();
    }, 135 * 1000);
    timersRef.current.push(endTimer);
  }, [clearSteps, navigateWithGlide, scheduleSteps, stopDemo]);

  const startDemo = useCallback(() => {
    clearSteps();
    onCloseDialog();
    onNavigate("overview");
    window.scrollTo(0, 0);

    setActive(true);
    setCountdown(5);

    let count = 5;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else if (count === 0) {
        setCountdown(0);
      } else {
        clearInterval(interval);
        setCountdown(null);
        runChoreography();
      }
    }, 1000);
    intervalsRef.current.push(interval);
  }, [clearSteps, onCloseDialog, onNavigate, runChoreography]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "1") {
      const t = setTimeout(startDemo, 800);
      return () => clearTimeout(t);
    }
  }, [startDemo]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if ((e.key === "d" || e.key === "D") && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (!active && countdown === null) {
          startDemo();
        } else {
          stopDemo();
        }
      }

      if (e.key === "Escape") {
        if (active || countdown !== null) {
          stopDemo();
        }
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [active, countdown, startDemo, stopDemo]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <>
      <style>{`
        .demo-overlay{position:fixed;inset:0;pointer-events:none;z-index:999990}
        .demo-dot{position:fixed;width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,0.7);
          box-shadow:0 0 18px rgba(255,255,255,0.45);transform:translate(-50%,-50%);
          pointer-events:none;z-index:999992;opacity:0}
        .demo-dot.pressing{transform:translate(-50%,-50%) scale(0.82);background:rgba(255,255,255,0.9)}
        @keyframes demo-ripple-anim{0%{transform:translate(-50%,-50%) scale(0.4);opacity:0.7}
          100%{transform:translate(-50%,-50%) scale(3.2);opacity:0}}
        .demo-ripple{position:fixed;width:40px;height:40px;border-radius:50%;
          border:2.5px solid rgba(255,255,255,0.5);pointer-events:none;z-index:999992;
          animation:demo-ripple-anim 0.65s ease-out forwards}
        .demo-scroll-ind{position:fixed;right:6px;top:50%;transform:translateY(-50%);width:3.5px;height:70px;
          border-radius:3px;background:rgba(242,65,107,0.75);box-shadow:0 0 10px rgba(242,65,107,0.5);
          pointer-events:none;z-index:999992;transition:opacity 0.9s ease;opacity:0}
        .demo-countdown-modal{position:fixed;inset:0;z-index:999995;background:rgba(0,0,0,0.92);
          display:flex;align-items:center;justify-content:center;flex-direction:column;
          font-family:var(--font-sans, system-ui, sans-serif);backdrop-filter:blur(8px)}
        .demo-countdown-num{font-size:120px;font-weight:700;color:#f2416b;margin:0;line-height:1;
          text-shadow:0 0 50px rgba(242,65,107,0.6);animation:demo-pulse 0.9s ease infinite}
        .demo-countdown-modal p{color:#a1a1a1;font-size:15px;margin-top:24px;text-align:center;line-height:1.6}
        @keyframes demo-pulse{0%{transform:scale(1)}50%{transform:scale(1.08)}100%{transform:scale(1)}}
        .demo-float-btn{position:fixed;bottom:24px;right:24px;z-index:999900;
          display:flex;align-items:center;gap:9px;background:#111111;color:#ededed;
          border:1px solid #2e2e2e;padding:10px 16px;border-radius:24px;font-size:13px;font-weight:500;
          box-shadow:0 4px 20px rgba(0,0,0,0.6);cursor:pointer;transition:all 0.2s ease}
        .demo-float-btn:hover{background:#1a1a1a;border-color:#f2416b;transform:translateY(-1px)}
        .demo-float-btn.active{background:#161616;border-color:#f2416b}
        .demo-live-dot{width:7px;height:7px;border-radius:50%;background:#f2416b;
          box-shadow:0 0 8px #f2416b;animation:demo-blink 1s ease infinite}
        @keyframes demo-blink{0%,100%{opacity:1}50%{opacity:0.3}}
        .demo-stop-btn{border:none;background:#2a0a0a;color:#ff7a7a;font-size:11px;
          padding:3px 9px;border-radius:12px;margin-left:6px;cursor:pointer}
        .demo-stop-btn:hover{background:#3a0a0a;color:#fff}
      `}</style>

      {/* Persistent visible toggle button in bottom-right */}
      {!active && countdown === null && (
        <button
          className="demo-float-btn"
          onClick={startDemo}
          title="Play automated screen walkthrough for recording (Hotkey: D)"
        >
          <span className="demo-live-dot" />
          <span>▶ Start Automated Demo (Press D)</span>
        </button>
      )}

      {/* Floating status pill while running */}
      {active && (
        <div className="demo-float-btn active">
          <span className="demo-live-dot" />
          <span>DEMO RUNNING: {formatTime(elapsed)} / 2:13</span>
          <button className="demo-stop-btn" onClick={stopDemo}>Stop (Esc)</button>
        </div>
      )}

      {/* 5-second countdown overlay */}
      {countdown !== null && (
        <div className="demo-countdown-modal" onClick={stopDemo}>
          <div className="demo-countdown-num" style={{ color: countdown === 0 ? "#45d483" : "#f2416b" }}>
            {countdown === 0 ? "GO" : countdown}
          </div>
          <p>
            Start your voiceover audio when countdown hits <strong>GO</strong>.<br />
            The screen will navigate automatically.<br />
            <small style={{ color: "#666", marginTop: "8px", display: "inline-block" }}>Press Esc or click to cancel</small>
          </p>
        </div>
      )}

      {/* Overlay container with dot, ripple, and scroll indicator */}
      <div className="demo-overlay">
        <div ref={dotRef} className="demo-dot" />
        <div ref={indRef} className="demo-scroll-ind" />
      </div>
    </>
  );
}
