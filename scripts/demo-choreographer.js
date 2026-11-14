/**
 * Berry Thesis — Demo Choreographer
 * 
 * HOW TO USE:
 * 1. Open http://localhost:3000 in Chrome (fullscreen, F11)
 * 2. Open DevTools console (F12 → Console tab)
 * 3. Paste this entire script and press Enter
 * 4. A black overlay appears with "Click to start"
 * 5. Start your screen recorder (Win+G or OBS)
 * 6. Click the overlay — 3-2-1 countdown begins
 * 7. Play your voiceover audio at the same moment the countdown hits GO
 * 8. Sit back — the screen does everything automatically
 *
 * Timed to the user's 2:13 voiceover script.
 */

(function BerryThesisDemoChoreographer() {
  "use strict";

  /* ── helpers ──────────────────────────────────────── */

  /** Find the scrollable content area */
  function getScroller() {
    return document.querySelector('.dashboard-content') || document.documentElement;
  }

  /** Click a sidebar nav item by partial text match */
  function nav(label) {
    const items = document.querySelectorAll('.nav-item');
    for (const btn of items) {
      if (btn.textContent.toLowerCase().includes(label.toLowerCase())) {
        btn.click();
        return;
      }
    }
  }

  /** Scroll the content area to the top */
  function top() {
    getScroller().scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Scroll to a pixel offset in the content area */
  function scrollTo(px) {
    getScroller().scrollTo({ top: px, behavior: 'smooth' });
  }

  /** Find a heading (h2/h3) containing text and scroll its parent panel into view */
  function scrollToSection(text) {
    const headings = document.querySelectorAll('h2, h3');
    for (const h of headings) {
      if (h.textContent.toLowerCase().includes(text.toLowerCase())) {
        const panel = h.closest('.panel, section, [class*="card"]') || h;
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return panel;
      }
    }
  }

  /** Highlight a specific table row near a heading, with a berry-red glow */
  function highlightRow(headingText, rowIndex, durationMs) {
    durationMs = durationMs || 6000;
    const headings = document.querySelectorAll('h2, h3');
    for (const h of headings) {
      if (h.textContent.toLowerCase().includes(headingText.toLowerCase())) {
        const container = h.closest('.panel, section') || h.parentElement;
        if (!container) continue;
        const rows = container.querySelectorAll('tbody tr');
        const row = rows[rowIndex];
        if (!row) continue;
        row.style.transition = 'all 0.4s ease';
        row.style.outline = '2px solid #f2416b';
        row.style.outlineOffset = '-1px';
        row.style.backgroundColor = 'rgba(242, 65, 107, 0.1)';
        row.style.borderRadius = '4px';
        setTimeout(() => {
          row.style.outline = '';
          row.style.outlineOffset = '';
          row.style.backgroundColor = '';
        }, durationMs);
        return row;
      }
    }
  }

  /** Highlight a badge or element containing specific text */
  function highlightBadge(text, durationMs) {
    durationMs = durationMs || 4000;
    const badges = document.querySelectorAll('.badge, .status, strong, span');
    for (const el of badges) {
      if (el.textContent.trim().toLowerCase().includes(text.toLowerCase())) {
        el.style.transition = 'all 0.4s ease';
        el.style.outline = '2px solid #f2416b';
        el.style.outlineOffset = '2px';
        el.style.borderRadius = '4px';
        setTimeout(() => {
          el.style.outline = '';
          el.style.outlineOffset = '';
        }, durationMs);
        return;
      }
    }
  }

  /** Schedule an action at a specific second */
  function at(seconds, fn) {
    setTimeout(fn, seconds * 1000);
  }

  /* ── overlay & countdown ─────────────────────────── */

  const overlay = document.createElement('div');
  overlay.id = 'demo-overlay';
  overlay.innerHTML = `
    <div style="
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(0,0,0,0.92);
      display: flex; align-items: center; justify-content: center;
      flex-direction: column; cursor: pointer;
      font-family: 'Geist', system-ui, sans-serif;
    ">
      <div id="demo-counter" style="
        color: #ededed; font-size: 32px; font-weight: 700;
        letter-spacing: -0.5px;
      ">Click anywhere to start the demo</div>
      <div style="
        color: #a1a1a1; font-size: 14px; margin-top: 12px;
        max-width: 400px; text-align: center; line-height: 1.5;
      ">Start your voiceover audio when the countdown hits GO.<br>
      The screen will navigate automatically for 2 min 13 sec.</div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', function handler() {
    overlay.removeEventListener('click', handler);
    const counter = document.getElementById('demo-counter');
    let count = 3;

    const interval = setInterval(() => {
      counter.textContent = count;
      counter.style.fontSize = '96px';
      counter.style.color = '#f2416b';
      count--;
      if (count < 0) {
        clearInterval(interval);
        counter.textContent = 'GO';
        counter.style.color = '#45d483';
        setTimeout(() => {
          overlay.remove();
          runChoreography();
        }, 600);
      }
    }, 1000);
  });

  /* ── the choreography ────────────────────────────── */

  function runChoreography() {

    // ═══════════════════════════════════════════════
    // SECTION A — The number (0:00 → 0:42)
    // ═══════════════════════════════════════════════

    // 0:00 — "By the usual usage metrics, NEAR is shrinking..."
    // Show: Overview page, hero visible
    nav('overview');
    at(0.3, () => top());

    // 0:04 — Scroll down gently to show the market snapshot cards
    at(4, () => scrollTo(350));

    // 0:06 — "But inside it, a settlement rail..."
    // Scroll further to show the thesis glance sidebar with the stance
    at(6, () => scrollTo(550));

    // 0:12 — "So I doubted the number..."
    // Navigate to On-chain analytics
    at(12, () => nav('on-chain'));
    at(12.5, () => top());

    // 0:15 — Let the on-chain stats cards register (shows -74% YoY hint)
    at(15, () => scrollTo(100));

    // 0:17 — "At least eleven point two two billion. Nine contracts, one public query..."
    // Scroll down to show the query cards (SQL toolkit)
    at(17, () => scrollToSection('BigQuery research toolkit'));

    // 0:21 — Hold on the query cards for a beat, then start moving to contracts
    at(21, () => scrollToSection('Reconstructed monthly'));

    // 0:25 — "I checked every contract on-chain..."
    // Show the 9 confirmed contracts table
    at(25, () => scrollToSection('9 confirmed'));

    // 0:27 — Highlight the S2 row (bridged USDC) — row index 1
    at(27, () => highlightRow('9 confirmed', 1, 8000));

    // 0:34 — "And it's growing. Settlements per day have nearly doubled..."
    // Scroll back up to the monthly settlement table to show $/day growing
    at(34, () => scrollToSection('Reconstructed monthly'));

    // 0:38 — Hold on the settlement table, let the Nov row register
    at(38, () => {
      // Highlight the last row (Nov) to show the growth
      highlightRow('Reconstructed monthly', 9, 4000);
    });


    // ═══════════════════════════════════════════════
    // SECTION B — The story and the price (0:42 → 1:17)
    // ═══════════════════════════════════════════════

    // 0:42 — "Then I doubted my story..."
    // Navigate to Methodology, show lead-lag table
    at(42, () => nav('methodology'));
    at(43, () => scrollToSection('Null Result'));

    // 0:47 — "I tested it. It doesn't."
    // Let the p-values register — maybe highlight the lag+1 column header area
    at(47, () => {
      // Highlight a few rows to draw eye to the p-values
      highlightRow('Null Result', 0, 5000);
      highlightRow('Null Result', 2, 5000);
      highlightRow('Null Result', 5, 5000);
    });

    // 0:53 — "Then the price. Since the fee switch, NEAR is up over two hundred and fifty percent..."
    // Navigate to Thesis view, scroll to returns table
    at(53, () => nav('investment thesis'));
    at(54.5, () => scrollToSection('Measured return'));

    // 0:58 — Hold on returns table — let "+251%" and "81% of gain" register
    at(58, () => {
      highlightRow('Measured return', 1, 4000);  // Total return row
      highlightRow('Measured return', 7, 4000);  // Best month row
    });

    // 1:04 — "And since January last year, it's down thirty-five percent"
    at(64, () => {
      highlightRow('Measured return', 8, 4000);  // Sharpe without Sep row
    });

    // 1:08 — "At over a hundred and fifty times revenue..."
    // Scroll to scenario matrix
    at(68, () => scrollToSection('What today'));

    // 1:12 — Hold on scenario matrix, let the numbers land
    at(72, () => {
      highlightRow('What today', 0, 5000);  // 15× sales row (needs 10× revenue)
    });


    // ═══════════════════════════════════════════════
    // SECTION C — The bet and the close (1:17 → 2:13)
    // ═══════════════════════════════════════════════

    // 1:17 — "So there's no timing trade. What's left is a bet on the take rate..."
    // Scroll up to show the comparables / thesis hero area
    at(77, () => scrollToSection('Historical comparables'));

    // 1:23 — Let comparables register (Visa, LSEG mapping)
    at(83, () => {
      highlightRow('Historical comparables', 0, 4000); // Visa row
    });

    // 1:30 — "And that's the part I can't verify myself. It's reported..."
    // Navigate to Methodology to show the Honesty Ledger with "Reported" tags
    at(90, () => nav('methodology'));
    at(91, () => scrollToSection('Honesty Ledger'));

    // 1:33 — Highlight a "Reported" row in the honesty ledger
    at(93, () => {
      highlightRow('Honesty Ledger', 9, 5000);   // "15.9 bps" — Reported
      highlightRow('Honesty Ledger', 10, 5000);   // "Protocol capture" — Reported
    });

    // 1:38 — "It tells you exactly when it's wrong..."
    // Navigate to Thesis view, scroll to falsifiers table
    at(98, () => nav('investment thesis'));
    at(99, () => scrollToSection('Monthly monitoring falsifiers'));

    // 1:42 — "Net revenue... has to grow fifty percent... or it's dead"
    at(102, () => {
      highlightRow('Monthly monitoring', 0, 4000);  // Protocol capture — Abandon
    });

    // 1:46 — "Capture under fifteen percent for two months, I'm out"
    at(106, () => {
      highlightRow('Monthly monitoring', 1, 3000);  // Stable settlement — Downgrade
    });

    // 1:50 — "And you size it by a risk budget..."
    // Scroll to position sizing
    at(110, () => scrollToSection('Position sizing'));

    // 1:55 — "Ten claims from my earlier drafts didn't survive verification..."
    // Navigate to Methodology to show the "10 Removed Claims" section
    at(115, () => nav('methodology'));
    at(116, () => scrollToSection('10 Removed Claims'));

    // 2:00 — "Every verified number regenerates with one command."
    // Hold on removed claims for a beat
    // (The user mentioned showing a terminal with rebuild.sh — we can't automate that,
    //  but they can splice that footage in post, or we just stay on this section)

    // 2:04 — "This is Berry Thesis."
    // Navigate back to Overview — the hero title card
    at(124, () => nav('overview'));
    at(125, () => top());

    // 2:10 — Hold on the hero. "Not investment advice. Just the work."
    // Stay still. Let it breathe. End of demo.

    // 2:15 — Demo complete. Show a subtle "end" indicator.
    at(135, () => {
      const end = document.createElement('div');
      end.innerHTML = `
        <div style="
          position: fixed; bottom: 32px; right: 32px; z-index: 99999;
          background: rgba(0,0,0,0.8); border: 1px solid #1f1f1f;
          border-radius: 8px; padding: 12px 20px;
          color: #a1a1a1; font-size: 13px;
          font-family: 'Geist', system-ui, sans-serif;
        ">Demo choreography complete</div>
      `;
      document.body.appendChild(end);
      setTimeout(() => end.remove(), 5000);
    });
  }

  console.log('%c🫐 Berry Thesis Demo Choreographer loaded', 'color: #f2416b; font-weight: bold; font-size: 14px');
  console.log('Click the overlay to start the 3-2-1 countdown.');

})();
