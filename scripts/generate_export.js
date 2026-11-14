const http = require('http');
const fs = require('fs');
const path = require('path');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function buildStandaloneExport() {
  console.log('Fetching all 7 pages from dev server...');
  const pages = {
    overview: await fetchPage('http://localhost:3000/'),
    onchain: await fetchPage('http://localhost:3000/onchain'),
    market: await fetchPage('http://localhost:3000/market'),
    thesis: await fetchPage('http://localhost:3000/thesis'),
    methodology: await fetchPage('http://localhost:3000/methodology'),
    notebook: await fetchPage('http://localhost:3000/notebook'),
    changelog: await fetchPage('http://localhost:3000/changelog'),
  };

  const baseHtml = pages.overview;

  // Extract CSS from link/style tags or directly from globals.css
  const globalsCss = fs.readFileSync(path.join(__dirname, '../src/app/globals.css'), 'utf8');

  // Extract the view section from each page
  // Looking for <div class="section-enter">...</div> inside <main class="dashboard-content">
  function extractSection(html) {
    const start = html.indexOf('<div class="section-enter">');
    if (start === -1) return '';
    // Find where </main> begins
    const end = html.indexOf('</main>', start);
    if (end === -1) return '';
    return html.substring(start, end);
  }

  const sections = {};
  for (const [key, html] of Object.entries(pages)) {
    sections[key] = extractSection(html);
  }

  // Build the complete standalone export HTML
  // In the standalone HTML, we render all 7 sections inside dashboard-content,
  // each tagged with id="view-{key}" and display: none except overview.
  // We add an inlined JS switcher that intercepts sidebar and breadcrumb navigation clicks.

  // Extract the layout before <div class="section-enter"> and after </main>
  const mainStart = baseHtml.indexOf('<main class="dashboard-content">');
  const layoutBefore = baseHtml.substring(0, mainStart + '<main class="dashboard-content">'.length);
  const layoutAfter = baseHtml.substring(baseHtml.indexOf('</main>'));

  let viewsHtml = '\n';
  for (const [key, content] of Object.entries(sections)) {
    const isVisible = key === 'overview';
    viewsHtml += `  <div id="view-${key}" class="standalone-view" style="${isVisible ? '' : 'display: none;'}">\n`;
    viewsHtml += content + '\n';
    viewsHtml += `  </div>\n`;
  }

  const clientSwitcherScript = `
<script>
(function() {
  var activeView = 'overview';
  var viewTitles = {
    overview: { title: 'Thesis overview', desc: 'An independent, long-term perspective on NEAR Protocol.' },
    onchain: { title: 'On-chain analytics', desc: 'Go beyond transaction counts. Understand the quality of network activity.' },
    market: { title: 'Market analysis', desc: 'A little more context. A clearer view of how NEAR is being valued.' },
    thesis: { title: 'Investment thesis', desc: 'An evolving argument—with room for the evidence to change it.' },
    methodology: { title: 'Methodology & data', desc: 'Inspect the inputs. Re-run the work. Understand the limitations.' },
    notebook: { title: 'Research notebook', desc: 'Observations, open questions, and evidence worth keeping.' },
    changelog: { title: 'Research changelog', desc: 'An open record of the work behind the thesis.' }
  };

  function switchTab(target) {
    if (!target) return;
    target = target.replace(/^\\/?(#|view-)?/, '').toLowerCase();
    if (!viewTitles[target]) return;

    // Hide all views
    var views = document.querySelectorAll('.standalone-view');
    views.forEach(function(el) { el.style.display = 'none'; });

    // Show target view
    var targetEl = document.getElementById('view-' + target);
    if (targetEl) targetEl.style.display = 'block';

    // Update active nav button
    var navButtons = document.querySelectorAll('.nav-item');
    navButtons.forEach(function(btn) {
      var text = btn.innerText.toLowerCase();
      var isMatch = (target === 'overview' && text.includes('overview')) ||
                    (target === 'onchain' && text.includes('on-chain')) ||
                    (target === 'market' && text.includes('market')) ||
                    (target === 'thesis' && text.includes('thesis')) ||
                    (target === 'methodology' && text.includes('methodology')) ||
                    (target === 'notebook' && text.includes('notebook')) ||
                    (target === 'changelog' && text.includes('changelog'));
      if (isMatch) {
        btn.classList.add('active');
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.classList.remove('active');
        btn.removeAttribute('aria-current');
      }
    });

    // Update header title & description
    var h1 = document.querySelector('.header-title h1');
    var p = document.querySelector('.header-title p');
    if (h1 && viewTitles[target]) h1.innerText = viewTitles[target].title;
    if (p && viewTitles[target]) p.innerText = viewTitles[target].desc;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
    activeView = target;
  }

  // Intercept nav clicks
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.nav-item, .focus-card, button, a');
    if (!btn) return;

    var text = (btn.innerText || '').toLowerCase();
    if (text.includes('overview')) { e.preventDefault(); switchTab('overview'); }
    else if (text.includes('on-chain')) { e.preventDefault(); switchTab('onchain'); }
    else if (text.includes('market')) { e.preventDefault(); switchTab('market'); }
    else if (text.includes('thesis') || text.includes('read the thesis') || text.includes('explore the evidence')) { e.preventDefault(); switchTab('thesis'); }
    else if (text.includes('methodology')) { e.preventDefault(); switchTab('methodology'); }
    else if (text.includes('notebook') || text.includes('notes')) { e.preventDefault(); switchTab('notebook'); }
    else if (text.includes('changelog') || text.includes('activity')) { e.preventDefault(); switchTab('changelog'); }
  });

  // Handle hash on load
  if (window.location.hash) {
    switchTab(window.location.hash.replace('#', ''));
  }
})();
</script>
`;

  let finalHtml = layoutBefore + viewsHtml + layoutAfter;

  // Inline font and styling if needed
  if (!finalHtml.includes('GeistVF')) {
    const fontHead = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Geist+Mono:wght@100..900&family=Geist:wght@100..900&display=swap" rel="stylesheet">
<style>
${globalsCss}
</style>
`;
    finalHtml = finalHtml.replace('</head>', fontHead + '</head>');
  }

  // Add the client switcher script before </body>
  finalHtml = finalHtml.replace('</body>', clientSwitcherScript + '</body>');

  const exportPath = path.join(__dirname, '../../berry-thesis-redesign-export.html');
  fs.writeFileSync(exportPath, finalHtml, 'utf8');
  console.log('Successfully wrote standalone export to:', exportPath, `(${finalHtml.length} bytes)`);

  // Also write to local directory for preview
  const localPreviewPath = path.join(__dirname, '../standalone-preview.html');
  fs.writeFileSync(localPreviewPath, finalHtml, 'utf8');
  console.log('Successfully wrote local preview to:', localPreviewPath);
}

buildStandaloneExport().catch(err => {
  console.error('Error generating standalone export:', err);
  process.exit(1);
});
