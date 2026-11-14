"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowDownToLine, ArrowRight, ArrowUpRight, BookOpen, Check, CheckCheck, ChevronRight, CircleHelp, Clipboard, Code2, Database, ExternalLink, FileJson, FileText, FlaskConical, Globe2, KeyRound, Link2, Loader2, NotebookPen, Play, Search, ShieldCheck, Sparkles, Terminal, Upload, X } from "lucide-react";
import { AuthorAvatar, BerryMark, NearMark } from "@/components/brand";
import { endpoints, formatDate, queries, sourceLinks } from "@/lib/research";
import type { OnchainDataset, ResearchNote, Section, Thesis, Workspace } from "@/lib/types";

export type DialogState = { type: "search" | "share" | "edit" | "note" | "query" | "sources" | "reproduce" | "profile" | "import" | "export" | "about" | "chart"; queryId?: string };

type Props = {
  dialog: DialogState;
  workspace: Workspace;
  onClose: () => void;
  onOpen: (dialog: DialogState) => void;
  onNavigate: (section: Section) => void;
  onThesisSaved: (thesis: Thesis) => void;
  onNoteSaved: (note: ResearchNote) => void;
  onImported: (dataset: OnchainDataset) => void;
  onToast: (message: string) => void;
  onRefresh: () => void;
};

export function Modal({ title, subtitle, children, onClose, wide = false, className = "" }: { title: string; subtitle?: string; children: ReactNode; onClose: () => void; wide?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const scroll = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => {
      const input = ref.current?.querySelector<HTMLElement>("input:not([readonly]), textarea, select");
      (input || ref.current)?.focus();
    }, 30);
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const elements = ref.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, textarea, select, [tabindex="0"]');
      if (!elements?.length) return;
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { clearTimeout(timer); document.body.style.overflow = scroll; document.removeEventListener("keydown", keydown); before?.focus(); };
  }, [onClose]);
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><div ref={ref} className={`modal ${wide ? "wide" : ""} ${className}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}><div className="modal-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={18}/></button></div>{children}</div></div>;
}

export function CodeBlock({ code }: { code: string }) {
  return <pre className="code-block"><code>{code.split("\n").map((line, index) => <span className="code-line" key={index}><span className="line-number">{index + 1}</span><span>{line.startsWith("--") ? <span className="code-comment">{line}</span> : line.split(/(\b(?:SELECT|FROM|WHERE|AND|GROUP BY|ORDER BY|AS|COUNT|COUNTIF|DISTINCT|MIN|WITH|JOIN|USING|DATE|BY)\b|'[^']*'|`[^`]*`)/g).map((token, i) => <span key={i} className={/^(SELECT|FROM|WHERE|AND|GROUP BY|ORDER BY|AS|COUNT|COUNTIF|DISTINCT|MIN|WITH|JOIN|USING|DATE|BY)$/.test(token) ? "code-keyword" : /^['`]/.test(token) ? "code-string" : ""}>{token}</span>)}</span></span>)}</code></pre>;
}

const searchSections: { title: string; detail: string; section: Section }[] = [
  { title: "Research overview", detail: "NEAR thesis, market snapshot, and research focus", section: "overview" },
  { title: "On-chain analytics", detail: "Active accounts, transactions, contracts, and Intents", section: "onchain" },
  { title: "Market analysis", detail: "NEAR price, market capitalization, volume, and TVL", section: "market" },
  { title: "Investment thesis", detail: "The potential case, counter-case, risks, and invalidation", section: "thesis" },
  { title: "Methodology & data", detail: "Sources, SQL queries, reproducibility, and limitations", section: "methodology" },
  { title: "Research notebook", detail: "Saved observations, questions, and evidence", section: "notebook" },
  { title: "Changelog", detail: "Data refreshes and research revision history", section: "changelog" },
];

export default function ResearchDialogs({ dialog, workspace, onClose, onOpen, onNavigate, onThesisSaved, onNoteSaved, onImported, onToast, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [selectedSearch, setSelectedSearch] = useState(0);
  const [form, setForm] = useState(workspace.thesis);
  const [note, setNote] = useState({ title: "", body: "", category: "Observation" });
  const [queryId, setQueryId] = useState(dialog.queryId || "activity");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [rawImport, setRawImport] = useState("");
  const [importSource, setImportSource] = useState("");
  const [startDate, setStartDate] = useState(new Date(new Date(workspace.snapshot.capturedAt).getTime() - 90 * 86400000).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(workspace.snapshot.capturedAt.slice(0, 10));
  const query = queries.find(item => item.id === queryId) || queries[0];
  const sql = query.sql.replace(/@start_date/g, `DATE '${startDate}'`).replace(/@end_date/g, `DATE '${endDate}'`);
  const validDateRange = Boolean(startDate && endDate && startDate < endDate);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/#overview` : "";

  async function copy(value: string) {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { setError("Clipboard access is unavailable. Select and copy the text manually."); }
  }

  async function save(event: FormEvent, kind: "thesis" | "note" | "import") {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      let body: unknown = kind === "thesis" ? form : note;
      if (kind === "import") {
        const parsed = JSON.parse(rawImport);
        body = { rows: Array.isArray(parsed) ? parsed : parsed.rows, source: importSource };
      }
      const response = await fetch(kind === "thesis" ? "/api/research" : kind === "note" ? "/api/notes" : "/api/onchain", { method: kind === "thesis" ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save. Please try again.");
      if (kind === "thesis") onThesisSaved(data);
      else if (kind === "note") onNoteSaved(data);
      else onImported(data);
      onClose(); onToast(kind === "thesis" ? "Thesis saved. Your research is up to date." : kind === "note" ? "Note added to your research notebook." : "On-chain results imported and saved.");
    } catch (error) { setError(error instanceof SyntaxError ? "This isn’t valid JSON. Export your BigQuery results as JSON and try again." : error instanceof Error ? error.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  const errorMessage = error ? <div className="form-error" role="alert">{error}</div> : null;
  const submitButton = (label: string) => <button className="button primary" type="submit" disabled={busy}>{busy ? <Loader2 className="spin" size={15}/> : <Check size={15}/>} {busy ? "Saving…" : label}</button>;

  if (dialog.type === "search") {
    const q = search.toLowerCase();
    const results = [...searchSections, ...workspace.notes.map(n => ({ title: n.title, detail: n.body, section: "notebook" as Section }))].filter(item => `${item.title} ${item.detail}`.toLowerCase().includes(q));
    return <Modal title="Find something in your research" onClose={onClose} className="search-modal"><div className="command-input"><Search size={20}/><input aria-label="Search research" placeholder="Search your thesis, data, or notes…" value={search} onChange={e => { setSearch(e.target.value); setSelectedSearch(0); }} onKeyDown={e => { if (e.key === "ArrowDown") { e.preventDefault(); setSelectedSearch(i => Math.min(i + 1, results.length - 1)); } if (e.key === "ArrowUp") { e.preventDefault(); setSelectedSearch(i => Math.max(0, i - 1)); } if (e.key === "Enter" && results[selectedSearch]) { onNavigate(results[selectedSearch].section); onClose(); } }}/><kbd>esc</kbd></div><div className="search-results"><div className="eyebrow">{search ? `${results.length} results in this workspace` : "JUMP TO A SECTION"}</div>{results.map((item, index) => <button className={`search-result ${index === selectedSearch ? "highlighted" : ""}`} key={`${item.title}-${index}`} onClick={() => { onNavigate(item.section); onClose(); }}><FileText size={18}/><span><strong>{item.title}</strong><small>{item.detail}</small></span><ArrowRight size={16}/></button>)}{!results.length && <div className="search-empty"><Search size={25}/><p>No results for “{search}”</p><span>Try “price”, “SQL”, “risk”, or a note title.</span></div>}</div><div className="command-footer"><span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span><span><kbd>↵</kbd> to open</span><BerryMark/></div></Modal>;
  }

  if (dialog.type === "edit") return <Modal title="Shape the investment thesis" subtitle="A working argument, not a fixed conclusion. Keep both sides visible." onClose={onClose} wide><form onSubmit={e => save(e, "thesis")} className="dialog-form"><label>Working research question<textarea rows={2} required maxLength={12000} value={form.hypothesis} onChange={e => setForm({ ...form, hypothesis: e.target.value })}/></label><label>The potential case<textarea rows={4} required maxLength={12000} value={form.supporting} onChange={e => setForm({ ...form, supporting: e.target.value })}/></label><label>The counter-case<textarea rows={4} required maxLength={12000} value={form.contradicting} onChange={e => setForm({ ...form, contradicting: e.target.value })}/></label><label>What would change your mind?<textarea rows={3} required maxLength={12000} value={form.invalidation} onChange={e => setForm({ ...form, invalidation: e.target.value })}/></label><label>Current outlook<select aria-label="Current outlook" value={form.stance} onChange={e => setForm({ ...form, stance: e.target.value })}><option>Under review</option><option>Constructive</option><option>Cautious</option></select></label>{errorMessage}<div className="form-footer"><span><Globe2 size={13}/> Changes are saved to this shared workspace.</span>{submitButton("Save thesis")}</div></form></Modal>;

  if (dialog.type === "note") return <Modal title="A thought worth keeping" subtitle="Capture an observation, a question, or a piece of evidence." onClose={onClose}><form onSubmit={e => save(e, "note")} className="dialog-form"><label>Title<input placeholder="What did you notice?" maxLength={180} required value={note.title} onChange={e => setNote({ ...note, title: e.target.value })}/></label><label>Type<select aria-label="Note type" value={note.category} onChange={e => setNote({ ...note, category: e.target.value })}><option>Observation</option><option>Question</option><option>Evidence</option><option>Risk</option></select></label><label>Your note<textarea placeholder="Add context, a source URL, and why it matters to the thesis…" rows={7} maxLength={20000} required value={note.body} onChange={e => setNote({ ...note, body: e.target.value })}/></label>{errorMessage}<div className="form-footer"><span>Saved to the shared research notebook.</span>{submitButton("Save note")}</div></form></Modal>;

  if (dialog.type === "query") return <Modal title="Behind the numbers" subtitle="Readable SQL. Explicit assumptions. Nothing hidden." onClose={onClose} wide><div className="dialog-body"><div className="query-switch">{queries.map(q => <button className={queryId === q.id ? "active" : ""} key={q.id} onClick={() => setQueryId(q.id)}>{q.title.split(" &")[0]}</button>)}</div><p className="dialog-description">{query.description}</p><div className="query-date-row"><label>From (UTC)<input type="date" value={startDate} max={endDate} onChange={e => setStartDate(e.target.value)}/></label><label>To (exclusive, UTC)<input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)}/></label><span className="badge neutral"><Code2 size={12}/> Query ready</span></div>{!validDateRange && <div className="form-error" role="alert">Choose a start date before the exclusive end date to copy this query.</div>}<div className="code-file"><FileText size={14}/>{query.file}<span>GoogleSQL</span></div><CodeBlock code={sql}/><div className="inline-notice"><CircleHelp size={16}/><span>Not executed in this workspace. BigQuery query costs are billed to your Google Cloud project. Date partition filters are included.</span></div>{errorMessage}<div className="dialog-actions"><button className="button" disabled={!validDateRange} onClick={() => copy(sql)}>{copied ? <Check size={15}/> : <Clipboard size={15}/>} {copied ? "Copied SQL" : "Copy SQL"}</button><a className="button primary" href={sourceLinks.bigquery} target="_blank" rel="noreferrer">Open in BigQuery <ArrowUpRight size={15}/></a></div></div></Modal>;

  if (dialog.type === "import") return <Modal title="Bring your on-chain evidence" subtitle="Import real daily results from your BigQuery export. No generated data." onClose={onClose} wide><form className="dialog-form" onSubmit={e => save(e, "import")}><div className="inline-notice"><Database size={17}/><span>Run the daily activity query, export the results as JSON, then import them here. Imported results are labeled user-provided, not independently verified.</span></div><label>Source / query reference<input required maxLength={1000} placeholder="BigQuery saved query URL or job ID" value={importSource} onChange={e => setImportSource(e.target.value)}/></label><label className="file-upload"><Upload size={18}/><span>Choose a JSON export <small>or paste your result below · up to 2 MB</small></span><input type="file" accept=".json,application/json" onChange={async e => { const file = e.target.files?.[0]; if (file) { if (file.size > 2000000) { setError("Choose a file smaller than 2 MB."); return; } setRawImport(await file.text()); setError(""); } }}/></label><label>Daily result rows<textarea className="mono" required rows={8} placeholder={'Paste a JSON array with fields:\n"date": "YYYY-MM-DD"\n"active_accounts": integer\n"transactions": integer\n\nOptional: "active_contracts"\n\nUse your real query output, not sample numbers.'} value={rawImport} onChange={e => setRawImport(e.target.value)}/></label>{errorMessage}<div className="form-footer"><button type="button" className="text-button" onClick={() => onOpen({ type: "query", queryId: "activity" })}>Get the SQL query <ArrowRight size={14}/></button>{submitButton("Import results")}</div></form></Modal>;

  if (dialog.type === "share") return <Modal title="Research is better in the open" subtitle="Share the thesis, the evidence, and the questions that remain." onClose={onClose}><div className="dialog-body"><div className="share-preview"><span className="near-icon"><NearMark size={27}/></span><div><h3>NEAR Protocol</h3><p>Berry Thesis · Independent investment research</p></div><span className="badge purple">In progress</span></div><label className="share-label">Research link</label><div className="copy-input"><input aria-label="Research link" value={shareUrl} readOnly/><button className="button primary" onClick={() => copy(shareUrl)}>{copied ? <Check size={15}/> : <Link2 size={15}/>} {copied ? "Copied" : "Copy link"}</button></div><div className="inline-notice"><Globe2 size={17}/><span>This is an open, shared research workspace. Anyone with the link can read the research and use its editing tools. No account is required.</span></div>{errorMessage}</div></Modal>;

  if (dialog.type === "sources") return <Modal title="Every number has a source" subtitle={`Market snapshot captured ${formatDate(workspace.snapshot.capturedAt, true)} UTC.`} onClose={onClose} wide><div className="dialog-body"><div className="source-detail-list">{[
    { name: "CoinGecko", detail: "NEAR price, market cap, 24-hour volume, and daily price history.", url: sourceLinks.coingecko, status: "Snapshot available", icon: Globe2, state: "green" },
    { name: "DefiLlama", detail: "NEAR-chain TVL in USD. Liquid staking and double-counted TVL excluded.", url: sourceLinks.defillama, status: "Snapshot available", icon: Database, state: "green" },
    { name: "NEAR BigQuery", detail: "Daily account, transaction, and contract queries. Requires your Google Cloud billing project; import results after running.", url: sourceLinks.nearDocs, status: "Query ready", icon: Code2, state: "purple" },
    { name: "NEAR Intents Explorer", detail: "Historical 1Click swap transactions. Partner JWT and complete pagination required; aggregate volume is not yet computed.", url: sourceLinks.intents, status: "Not connected", icon: KeyRound, state: "neutral" },
  ].map(source => <div className="source-detail" key={source.name}><span className="source-detail-icon"><source.icon size={20}/></span><div><h3>{source.name}<span className={`badge ${source.state}`}>{source.status}</span></h3><p>{source.detail}</p><a href={source.url} target="_blank" rel="noreferrer">View source documentation <ArrowUpRight size={12}/></a></div></div>)}</div><div className="inline-notice"><ShieldCheck size={17}/><span>Unavailable metrics stay unavailable. Price and USD TVL do not, by themselves, establish adoption, token value accrual, or causality.</span></div><div className="dialog-actions"><button className="button" onClick={() => { onNavigate("methodology"); onClose(); }}>Explore methodology <ArrowRight size={15}/></button></div></div></Modal>;

  if (dialog.type === "chart") return <Modal title="How this chart is built" subtitle="Source data, transformations, and the limits of the comparison." onClose={onClose} wide><div className="dialog-body"><div className="method-step"><span>01</span><div><h3>Fetch daily public observations</h3><p>CoinGecko provides NEAR prices in USD. DefiLlama provides NEAR-chain TVL. Observations are matched by UTC date; missing TVL points are left missing.</p></div></div><div className="method-step"><span>02</span><div><h3>Rebase, don’t imply causality</h3><p>Indexed value = (daily value ÷ first available value in the selected range) × 100. Price mode shows untransformed USD prices. Changes compare the first and last price observations.</p></div></div><div className="method-step"><span>03</span><div><h3>Keep the raw evidence</h3><p>The source payloads and fetch time are stored in PostgreSQL and included in the JSON export. USD-denominated TVL is influenced by asset prices; the series are not independent adoption measures.</p></div></div><div className="endpoint-list">{Object.entries(endpoints).map(([name, url]) => <a key={name} href={url} target="_blank" rel="noreferrer"><Code2 size={14}/><span>{url.replace("https://", "")}</span><ExternalLink size={13}/></a>)}</div><div className="dialog-actions"><a className="button" href="/api/export?format=csv"><ArrowDownToLine size={15}/>Download chart data</a><button className="button primary" onClick={() => onOpen({ type: "reproduce" })}><Play size={14}/>Reproduce the research</button></div></div></Modal>;

  if (dialog.type === "reproduce") return <Modal title="Don’t take our word for it" subtitle="Re-run the sources. Inspect the inputs. Reach your own conclusion." onClose={onClose} wide><div className="dialog-body"><div className="terminal-block"><div><span className="terminal-dots"><i/><i/><i/></span><span>Terminal · from the project root</span></div><code><span>$</span> node scripts/rebuild.mjs</code><button className="icon-button" aria-label="Copy rebuild command" onClick={() => copy("node scripts/rebuild.mjs")}>{copied ? <Check size={16}/> : <Clipboard size={16}/>}</button></div><div className="reproduce-steps">{[["01", "Fetch", "Raw public API responses"], ["02", "Validate", "No simulated observations"], ["03", "Rebuild", "Deterministic chart inputs"]].map(([n, t, d]) => <div key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></div>)}</div><div className="inline-notice"><CircleHelp size={17}/><span>The command rebuilds the local market snapshot. “Re-run data” refreshes the database used by this workspace. BigQuery is a separate, billable query step; Intents volume requires a partner JWT and is not included.</span></div><p className="dialog-description">Optional server environment variable: <code>COINGECKO_API_KEY</code>. Public endpoints work without a key when allowed by the provider. Failed refreshes preserve the last good snapshot.</p>{errorMessage}<div className="dialog-actions"><a className="button" href="/api/export?format=json"><FileJson size={15}/>Download evidence bundle</a><button className="button primary" onClick={() => { onClose(); onRefresh(); }}><Play size={14}/>Re-run connected sources</button></div></div></Modal>;

  if (dialog.type === "export") return <Modal title="Take the research with you" subtitle="Portable, inspectable, and yours to re-run." onClose={onClose}><div className="dialog-body export-options">{[{ format: "md", title: "Investment thesis", description: "Working question, case, counter-case, and limitations", file: "THESIS.md", icon: FileText }, { format: "csv", title: "Chart observations", description: "Timestamped price, market cap, volume, and TVL", file: "near-market-data.csv", icon: Database }, { format: "json", title: "Complete evidence bundle", description: "Raw data, sources, queries, notes, and research history", file: "berry-thesis-research.json", icon: FileJson }].map(item => <a href={`/api/export?format=${item.format}`} className="export-option" key={item.format}><item.icon size={23}/><span><strong>{item.title}</strong><small>{item.description}</small><code>{item.file}</code></span><ArrowDownToLine size={18}/></a>)}</div></Modal>;

  if (dialog.type === "profile") return <Modal title="The researcher behind the thesis" onClose={onClose}><div className="dialog-body"><div className="profile-hero"><AuthorAvatar/><h3>David Olabowale</h3><p>Independent researcher · NEAR ecosystem</p><span className="badge purple"><FlaskConical size={12}/>Research in progress</span></div><p className="profile-description">Building a long-term view of NEAR, one verifiable claim at a time. This workspace is a living research document—not a trading signal, a portfolio, or a social network.</p><div className="profile-details"><span>Research focus<strong>NEAR Protocol</strong></span><span>Time horizon<strong>3–5 years</strong></span><span>Guiding principle<strong>Evidence before conviction</strong></span></div><button className="button full-width" onClick={() => { onNavigate("thesis"); onClose(); }}>Read the working thesis <ArrowRight size={15}/></button></div></Modal>;

  return <Modal title="A little more signal. A little less noise." subtitle="Welcome to Berry Thesis." onClose={onClose}><div className="dialog-body"><div className="about-logo"><BerryMark/><span>berry<span>thesis</span></span></div><p className="profile-description">One protocol, one evolving investment thesis. Berry brings a research report, a market dashboard, and a technical notebook into a single, transparent workspace.</p><div className="about-principles"><span><ShieldCheck size={18}/>Evidence before conviction</span><span><Code2 size={18}/>Methods anyone can inspect</span><span><BookOpen size={18}/>Counter-evidence stays in the story</span></div><div className="inline-notice"><NearMark size={20}/><span>Built for the NEAR Investment Thesis hackathon track. Independent research; not affiliated with NEAR Foundation and not financial advice.</span></div><div className="dialog-actions"><button className="button primary" onClick={onClose}>Let’s explore <ArrowRight size={15}/></button></div></div></Modal>;
}
