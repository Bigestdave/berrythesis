"use client";

import { useState } from "react";
import { Activity, AlertTriangle, ArrowDownToLine, ArrowRight, ArrowUpRight, BookOpen, Check, CheckCircle2, ChevronRight, CircleDashed, Clock3, Code2, Database, ExternalLink, FileText, FlaskConical, GitCommitHorizontal, Globe2, History, Info, Layers3, Lightbulb, Link2, ListFilter, Loader2, LockKeyhole, Network, NotebookPen, Pencil, Plus, RefreshCw, Scale, Search, ShieldAlert, ShieldCheck, Sparkles, Sprout, Terminal, Trash2, TrendingDown, TrendingUp, TriangleAlert, Users, Waypoints, XCircle } from "lucide-react";
import { AuthorAvatar, NearMark } from "@/components/brand";
import { MetricCards, OnchainChart, PerformanceChart } from "@/components/charts";
import {
  compact,
  comparables,
  confirmedContracts,
  falsifiers,
  formatDate,
  honestyLedger,
  leadLagTests,
  monthlySettlement,
  queries,
  returnsComparison,
  riskBudgeting,
  scenarioMatrix,
  sourceLinks,
} from "@/lib/research";
import type { OnchainDataset, ResearchNote, Section, Workspace } from "@/lib/types";
import type { DialogState } from "@/components/research-dialogs";

type PanelProps = { workspace: Workspace; onOpen: (dialog: DialogState) => void; onNavigate: (section: Section) => void };

export function ThesisGlance({ workspace, onOpen, onNavigate }: PanelProps) {
  return (
    <section className="panel glance-panel">
      <div className="panel-heading">
        <h2>Thesis at a glance</h2>
        <button className="icon-button subtle" onClick={() => onNavigate("thesis")} aria-label="Read the thesis">
          <ArrowUpRight size={17} />
        </button>
      </div>
      <div className="glance-rows">
        <div>
          <span>Primary asset</span>
          <strong className="asset-inline"><NearMark size={15} />NEAR Protocol</strong>
        </div>
        <div>
          <span>Core thesis</span>
          <strong>Settlement Business Case</strong>
        </div>
        <div>
          <span>Verified floor</span>
          <strong className="positive">$11.22B settled</strong>
        </div>
        <div>
          <span>Current outlook</span>
          <strong className="badge purple">{workspace.thesis.stance}</strong>
        </div>
        <div>
          <span>Position sizing</span>
          <strong>Risk-budget conditional</strong>
        </div>
      </div>
      <div className="glance-principle">
        <ShieldCheck size={16} />
        <span>Evidence before conviction. Let the null result stand.</span>
      </div>
      <button className="researcher-row" onClick={() => onOpen({ type: "profile" })}>
        <AuthorAvatar small />
        <span>
          <strong>David Olabowale</strong>
          <small>Independent researcher · Hackathon Submission v5</small>
        </span>
        <ArrowUpRight size={15} />
      </button>
    </section>
  );
}

export function SourcePanel({ onOpen }: { onOpen: (dialog: DialogState) => void }) {
  const sources = [
    { name: "NEAR BigQuery", label: "Verified (ft_events)", active: true, style: "bigquery" },
    { name: "Archival RPC", label: "Verified (9 tokens)", active: true, style: "bigquery" },
    { name: "Binance Klines", label: "Verified (682 closes)", active: true, style: "coingecko" },
    { name: "CoinGecko", label: "Snapshot ($3.45)", active: true, style: "coingecko" },
    { name: "DefiLlama", label: "Snapshot ($105M TVL)", active: true, style: "defillama" },
    { name: "Intents Explorer", label: "Partner gated", active: false, style: "intents" },
  ];
  return (
    <section className="panel sources-panel">
      <div className="panel-heading">
        <h2>Connected evidence & provenance</h2>
        <Database size={15} />
      </div>
      <div className="compact-sources">
        {sources.map(source => (
          <button key={source.name} onClick={() => onOpen({ type: "sources" })}>
            <span className={`provider-icon ${source.style}`}>
              {source.style === "bigquery" ? <Database size={12} /> : source.style === "defillama" ? "D" : "B"}
            </span>
            <span>{source.name}</span>
            <small className={source.active ? "source-ready" : ""}>
              {source.active && <i className="status-dot green" />}
              {source.label}
            </small>
          </button>
        ))}
      </div>
      <button className="panel-footer-link" onClick={() => onOpen({ type: "sources" })}>
        Inspect sources & limitations <ArrowRight size={13} />
      </button>
    </section>
  );
}

export function ResearchFocus({ onNavigate }: { onNavigate: (section: Section) => void }) {
  const items = [
    { icon: Scale, name: "A settlement business", text: "Can the slice NEAR keeps from its Intents rail be valued as recurring settlement revenue?", section: "thesis" as Section, style: "lavender" },
    { icon: Network, name: "Verified $11.22B floor", text: "Independent reconstruction across 9 confirmed 6-decimal USD contracts from BigQuery.", section: "onchain" as Section, style: "mint" },
    { icon: TrendingDown, name: "What has to be true", text: "The L1 is shrinking. The rail carries the entire case. Every link after volume is reported.", section: "market" as Section, style: "sand" },
  ];
  return (
    <section className="research-focus">
      <div className="section-heading">
        <h2>The core research questions</h2>
        <span>Hackathon Thesis v5 Focus</span>
      </div>
      <div className="focus-grid">
        {items.map((item, i) => (
          <button className="focus-card" key={item.name} onClick={() => onNavigate(item.section)}>
            <div className="focus-card-top">
              <span className={`focus-icon ${item.style}`}><item.icon size={18} /></span>
              <span className="focus-number">0{i + 1}</span>
            </div>
            <h3>{item.name}</h3>
            <p>{item.text}</p>
            <span className="focus-link">Explore the evidence <ArrowUpRight size={13} /></span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function Overview({ workspace, onOpen, onNavigate, onRefresh, refreshing }: PanelProps & { onRefresh: () => void; refreshing: boolean }) {
  return (
    <div className="section-enter">
      <section className="thesis-hero">
        <div className="hero-copy">
          <div className="hero-eyebrow">
            <FlaskConical size={13} />
            <span>INVESTMENT THESIS V5</span>
            <span className="hero-version">LONG-TERM CASE</span>
          </div>
          <h2>NEAR as a Settlement Business</h2>
          <p>A long-term case for NEAR: what's verified, what has to be true, and what would prove it wrong.</p>
          <div className="hero-tags">
            <span><i />$11.22B Verified Floor</span>
            <span><i />15.9 bps Gross / ~3–5 bps Retained</span>
            <span><i />Conditional at 151× Sales</span>
            <span><i />Reproducible Evidence</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbital orbital-one" />
          <div className="orbital orbital-two" />
          <div className="orbital orbital-three" />
          <div className="hero-near"><NearMark size={57} /></div>
          <span className="orbit-dot dot-one" />
          <span className="orbit-dot dot-two" />
          <span className="orbit-dot dot-three" />
          <span className="orbit-cross cross-one">+</span>
          <span className="orbit-cross cross-two">+</span>
          <span className="orbit-label">EVIDENCE BEFORE CONVICTION</span>
        </div>
      </section>

      <div className="snapshot-header">
        <h2>Market at a glance <span className="badge neutral">USD</span></h2>
        <div>
          <span className="snapshot-time"><i className="status-dot green" />Snapshot · {formatDate(workspace.snapshot.capturedAt)}</span>
          <button className="refresh-button" disabled={refreshing} onClick={onRefresh}>
            <RefreshCw size={12} className={refreshing ? "spin" : ""} />
            {refreshing ? "Refreshing…" : "Re-run data"}
          </button>
        </div>
      </div>

      <MetricCards snapshot={workspace.snapshot} onSource={() => onOpen({ type: "sources" })} />

      <div className="analysis-grid">
        <PerformanceChart snapshot={workspace.snapshot} onQuery={() => onOpen({ type: "chart" })} />
        <ThesisGlance workspace={workspace} onOpen={onOpen} onNavigate={onNavigate} />
      </div>

      <div className="research-bottom-grid">
        <ResearchFocus onNavigate={onNavigate} />
        <SourcePanel onOpen={onOpen} />
      </div>

      <div className="overview-footnote">
        <ShieldCheck size={13} />
        <span>NEAR Investment Thesis v5 — a long-term case for NEAR as a settlement business. Not investment advice.</span>
        <button onClick={() => onNavigate("methodology")}>Full methodology & reproducibility <ArrowUpRight size={12} /></button>
      </div>
    </div>
  );
}

export function ThesisView({ workspace, onOpen, onNavigate }: PanelProps) {
  const { thesis } = workspace;
  return (
    <div className="section-enter">
      <div className="document-meta">
        <span><AuthorAvatar small />David Olabowale</span>
        <span><Clock3 size={13} />Updated 13 Nov 2026 (Thesis v5)</span>
        <span className="badge purple">{thesis.stance}</span>
      </div>

      {/* Hero Question */}
      <section className="thesis-question-card">
        <div className="eyebrow"><FlaskConical size={14} />THE LONG-TERM CASE</div>
        <h2>NEAR is a settlement business.</h2>
        <p>The investable question is whether the slice NEAR keeps from its Intents rail gets valued as recurring settlement revenue — the reclassification that re-rated Visa, LSEG, and ICE. Today's price assumes a lot, so the position is conditional.</p>
      </section>

      {/* Case vs Counter-Case */}
      <div className="thesis-two-col">
        <section className="panel thesis-text-card">
          <div className="thesis-card-heading">
            <span className="focus-icon mint"><TrendingUp size={19} /></span>
            <div>
              <span className="eyebrow">THE EVIDENCE FOR</span>
              <h2>Why the rail could compound</h2>
            </div>
          </div>
          <div style={{ whiteSpace: "pre-line", fontSize: "13.5px", lineHeight: "1.65", color: "var(--text)" }}>
            {thesis.supporting}
          </div>
          <div className="research-label"><CircleDashed size={13} />Verified on-chain floor · BigQuery ft_events</div>
        </section>

        <section className="panel thesis-text-card">
          <div className="thesis-card-heading">
            <span className="focus-icon sand"><TriangleAlert size={19} /></span>
            <div>
              <span className="eyebrow">WHAT HAS TO BE TRUE</span>
              <h2>Conditions and open risks</h2>
            </div>
          </div>
          <div style={{ whiteSpace: "pre-line", fontSize: "13.5px", lineHeight: "1.65", color: "var(--text)" }}>
            {thesis.contradicting}
          </div>
          <div className="research-label"><ShieldCheck size={13} />Honest null results · Counter-evidence kept intact</div>
        </section>
      </div>

      {/* Section 12: Measured Performance & Returns Comparison */}
      <section className="panel" style={{ marginTop: "20px" }}>
        <div className="panel-heading">
          <div>
            <h2>Measured return, risk & volatility (Thesis §12)</h2>
            <p>Binance NEARUSDT daily closes through 13 Nov 2026 · Daily log returns · Risk-free rate 0</p>
          </div>
          <span className="badge neutral">Binance klines verified</span>
        </div>
        <div className="table-scroll">
          <table className="source-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Since fee switch (23 Feb 2026)</th>
                <th>Whole file (1 Jan 2025)</th>
                <th>Interpretation / Notes</th>
              </tr>
            </thead>
            <tbody>
              {returnsComparison.map(r => (
                <tr key={r.metric}>
                  <td><strong>{r.metric}</strong></td>
                  <td><span className={r.sinceFeeSwitch.startsWith("+") ? "positive" : ""}>{r.sinceFeeSwitch}</span></td>
                  <td><span className={r.wholeFile.startsWith("-") ? "negative" : ""}>{r.wholeFile}</span></td>
                  <td><small className="muted">{r.note}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-bottom-caption">
          <Info size={12} /> The +251% headline opens at $0.98, within 2% of the file's all-time low. September 2026 alone supplies 81% of the gain. Without September, Sharpe drops to 0.36.
        </div>
      </section>

      {/* What Today's Price Requires (Scenario Matrix §12) */}
      <section className="panel" style={{ marginTop: "20px" }}>
        <div className="panel-heading">
          <div>
            <h2>What today's price requires: Scenario matrix (Thesis §12)</h2>
            <p>Annual volume needed to support $4.52B market cap at various revenue multiples and retained take rates</p>
          </div>
          <span className="badge purple">Arithmetic on reported inputs</span>
        </div>
        <div className="table-scroll">
          <table className="source-table">
            <thead>
              <tr>
                <th>Revenue multiple (Revenue needed)</th>
                <th>5 bps retained take</th>
                <th>10 bps retained take</th>
                <th>30 bps retained take</th>
              </tr>
            </thead>
            <tbody>
              {scenarioMatrix.map(s => (
                <tr key={s.multiple}>
                  <td><strong>{s.multiple}</strong><br /><small className="muted">{s.revNeeded}</small></td>
                  <td>{s.take5bps}</td>
                  <td>{s.take10bps}</td>
                  <td><strong className="positive">{s.take30bps}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-bottom-caption">
          <Info size={12} /> Baseline: verified stable run-rate is $16.4B/year (Sep–Nov 2026). At 50× sales and 30 bps take, NEAR needs $30B/yr (1.8× current verified stable volume). At 15× sales and 5 bps, it needs $603B/yr (36.7×).
        </div>
      </section>

      {/* Position Sizing by Risk Budget (§12) */}
      <section className="panel" style={{ marginTop: "20px" }}>
        <div className="panel-heading">
          <div>
            <h2>Position sizing by risk budget (§8 & §12)</h2>
            <p>Formula: Weight = Annual risk budget ÷ Realised volatility (128% peak 90-day volatility)</p>
          </div>
          <span className="badge green">Sizing discipline</span>
        </div>
        <div className="focus-grid" style={{ marginTop: "12px" }}>
          {riskBudgeting.map(b => (
            <div className="panel" key={b.budget} style={{ padding: "16px", background: "var(--surface-raised)" }}>
              <span className="eyebrow">{b.budget}</span>
              <h3 style={{ fontSize: "22px", margin: "6px 0", color: "var(--text)" }}>{b.weight} position weight</h3>
              <small className="muted">{b.formula}</small>
            </div>
          ))}
        </div>
      </section>

      {/* The Comparables Table */}
      <section className="panel" style={{ marginTop: "20px" }}>
        <div className="panel-heading">
          <div>
            <h2>Historical comparables: The infrastructure multiple (Thesis §5)</h2>
            <p>Why financial markets re-rate tolls on throughput when revenue quality shifts to recurring data/infra</p>
          </div>
          <span className="badge neutral">4 analogues + 1 discipline</span>
        </div>
        <div className="table-scroll">
          <table className="source-table">
            <thead>
              <tr>
                <th>Analogue</th>
                <th>Mechanism in history</th>
                <th>Why it maps to NEAR Intents</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {comparables.map(c => (
                <tr key={c.name}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.mechanism}</td>
                  <td>{c.mapping}</td>
                  <td><span className={`badge ${c.status === "Analogue" ? "green" : c.status === "Discipline" ? "amber" : "purple"}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* The 6 Monthly Falsifiers (§9) */}
      <section className="panel" style={{ marginTop: "20px" }}>
        <div className="panel-heading">
          <div>
            <h2>Monthly monitoring falsifiers (Thesis §9)</h2>
            <p>Computable from public chain data by anyone running one query</p>
          </div>
          <span className="badge neutral">6 explicit rules</span>
        </div>
        <div className="table-scroll">
          <table className="source-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Signal</th>
                <th>Threshold</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {falsifiers.map(f => (
                <tr key={f.id}>
                  <td><code>0{f.id}</code></td>
                  <td><strong>{f.signal}</strong></td>
                  <td>{f.threshold}</td>
                  <td>
                    <span className={f.action.startsWith("Abandon") ? "negative" : f.action.startsWith("Upgrade") ? "positive" : "muted"}>
                      {f.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Invalidation & Single Falsifier */}
      <section className="panel invalidation-card" style={{ marginTop: "20px" }}>
        <div>
          <span className="focus-icon lavender"><Waypoints size={20} /></span>
          <h2>The single falsifier (§10)</h2>
        </div>
        <blockquote style={{ fontSize: "16px", fontStyle: "italic", margin: "14px 0", color: "var(--text)" }}>
          “If net revenue (not volume) fails to grow ≥ 50% over the next four quarters, the 'usage reaches the token' thesis is dead regardless of what volume does.”
        </blockquote>
        <p style={{ whiteSpace: "pre-line", marginTop: "10px" }}>{thesis.invalidation}</p>
        <div className="inline-notice">
          <Info size={15} />
          <span>Rules-based execution: Do not add at $3.45 (151× sales). Accumulate only on fundamental Trigger A (capture ≥ 25% for 2 months) or valuation Trigger B (P/S ≤ 100× / ≤ $2.29).</span>
        </div>
      </section>

      <div className="document-footer">
        <span><BookOpen size={15} />Hackathon Thesis v5. Fully reproducible via rebuild.sh.</span>
        <button className="button" onClick={() => onOpen({ type: "edit" })}><Pencil size={14} />Edit thesis</button>
        <a className="button primary" href="/api/export?format=md"><ArrowDownToLine size={14} />Download THESIS.md</a>
      </div>
    </div>
  );
}

export function MarketView({ workspace, onOpen }: PanelProps) {
  const m = workspace.snapshot.market;
  const facts = [
    { label: "Current price", value: `$${m.current_price.toFixed(2)}` },
    { label: "Market cap", value: compact(m.market_cap) },
    { label: "Circulating supply", value: `${compact(m.circulating_supply, false)} NEAR` },
    { label: "24h volume", value: compact(m.total_volume) },
    { label: "Run-rate P/S multiple", value: "151× sales" },
    { label: "Target entry (Trigger B)", value: "≤ $2.29 (≤ 100× P/S)" },
  ];
  return (
    <div className="section-enter">
      <div className="market-source-banner">
        <span><i className="status-dot green" />Public market data (CoinGecko + Binance Klines)</span>
        <span>Source observation: {formatDate(m.last_updated, true)} UTC</span>
        <button className="text-button" onClick={() => onOpen({ type: "sources" })}>Inspect sources <ArrowUpRight size={13} /></button>
      </div>

      <MetricCards snapshot={workspace.snapshot} onSource={() => onOpen({ type: "sources" })} />

      <div className="standalone-chart">
        <PerformanceChart snapshot={workspace.snapshot} onQuery={() => onOpen({ type: "chart" })} expanded />
      </div>

      <div className="thesis-two-col">
        <section className="panel">
          <div className="panel-heading">
            <h2>Valuation context & metrics</h2>
            <NearMark size={18} />
          </div>
          <div className="market-facts">
            {facts.map(fact => (
              <div key={fact.label}>
                <span>{fact.label}</span>
                <strong>{fact.value}</strong>
              </div>
            ))}
          </div>
          <div className="card-bottom-caption">Price and market cap from CoinGecko; P/S calculated on ~$30M run-rate revenue.</div>
        </section>

        <section className="panel market-interpretation">
          <div className="panel-heading">
            <h2>Sum-of-the-parts: The AWS analogue</h2>
            <Lightbulb size={17} />
          </div>
          <p>
            The whole valuation edge is that the market prices NEAR as a declining L1 and the Intents settlement rail at approximately zero. Like AWS inside Amazon in its early years, the rail should be valued separately:
          </p>
          <div className="reading-points">
            <span><Check size={14} /><strong>Declining L1:</strong> Signer accounts down -74% YoY; gas fees ~$1.17M (70% burned, economically irrelevant).</span>
            <span><Check size={14} /><strong>Settlement Rail:</strong> $11.22B verified floor, ~15.9 bps gross, ~3–5 bps retained take, zero balance-sheet risk.</span>
            <span><Check size={14} /><strong>Option Value:</strong> You are underwriting take-rate expansion toward Visa's 30 bps band, not momentum.</span>
          </div>
        </section>
      </div>
    </div>
  );
}

export function OnchainView({ workspace, onOpen, onNavigate, dataset }: PanelProps & { dataset: OnchainDataset | null }) {
  const latest = dataset?.rows.at(-1);
  const stats = [
    { name: "Daily active signers", icon: Users, value: latest?.active_accounts ?? 77831, query: "activity", hint: "Down -74% YoY (72k Oct-26 vs 273k Oct-25)" },
    { name: "Daily transactions", icon: Activity, value: latest?.transactions ?? 891297, query: "activity", hint: "Down from 3.48M/day step in Apr-26" },
    { name: "Intents share of L1", icon: Waypoints, value: undefined, query: "contracts", hint: "17.0% (Nov 1–11) up from 0.9% (Mar-26); 147 median callers" },
    { name: "Verified stable settlement", icon: Code2, value: undefined, query: "inflow", hint: "$11.22B floor across 9 confirmed 6-dec USD contracts" },
  ];

  return (
    <div className="section-enter">
      <div className="onchain-banner">
        <span className="focus-icon lavender"><Network size={23} /></span>
        <div>
          <h2>First-party on-chain evidence (BigQuery mainnet)</h2>
          <p>
            {dataset
              ? `Reconstructed from bigquery-public-data.crypto_near_mainnet_us · ${dataset.rows.length} daily observations (Jan 2025 – Nov 2026)`
              : "680 daily observations synthesized from BigQuery transactions and ft_events."}
          </p>
        </div>
        <button className="button" onClick={() => onOpen({ type: "import" })}>
          <ArrowDownToLine size={14} />
          {dataset ? "Import fresh results" : "Import query results"}
        </button>
      </div>

      <div className="metric-grid onchain-metrics">
        {stats.map(stat => (
          <article className="metric-card" key={stat.name}>
            <div className="metric-label">
              {stat.name}
              <stat.icon size={15} />
            </div>
            <div className={`metric-value ${stat.value === undefined ? "" : ""}`}>
              {stat.value === undefined ? (stat.name.includes("Intents") ? "17.0%" : "$11.22B") : compact(stat.value, false)}
            </div>
            <div className="onchain-metric-footer">
              <span>{stat.value !== undefined ? (latest?.date ?? "2026-11-11") : "Verified floor"}</span>
              <button onClick={() => onOpen({ type: "query", queryId: stat.query })} aria-label={`Inspect ${stat.name}`}>
                <ArrowUpRight size={14} />
              </button>
            </div>
            <small className="metric-definition">{stat.hint}</small>
          </article>
        ))}
      </div>

      {dataset && <OnchainChart rows={dataset.rows} />}

      {/* Monthly Reconstructed Settlements Table (§3) */}
      <section className="panel" style={{ marginTop: "20px" }}>
        <div className="panel-heading">
          <div>
            <h2>Reconstructed Monthly Settlements (Thesis §3) [verified]</h2>
            <p>Sum of 9 confirmed 6-decimal USD contracts into intents.near from BigQuery ft_events. No price feed required.</p>
          </div>
          <span className="badge green">$11.22B cumulative floor</span>
        </div>
        <div className="table-scroll">
          <table className="source-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Stable settled</th>
                <th>Rate ($/day)</th>
                <th>Settlements/day</th>
                <th>Phase</th>
              </tr>
            </thead>
            <tbody>
              {monthlySettlement.map(m => (
                <tr key={m.month}>
                  <td><strong>{m.month}</strong></td>
                  <td>{m.settled}</td>
                  <td>{m.perDay}</td>
                  <td>{m.eventsPerDay}</td>
                  <td><span className="badge neutral">{m.phase}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-bottom-caption">
          <Info size={12} /> Excludes two Solana contracts ($1.26B) pending RPC identity confirmation. If confirmed, total is $12.47B.
        </div>
      </section>

      {/* Confirmed 9 Contracts Table (§4) */}
      <section className="panel" style={{ marginTop: "20px" }}>
        <div className="panel-heading">
          <div>
            <h2>The 9 confirmed 6-decimal USD contracts (Thesis §4) [verified]</h2>
            <p>Verified via free archival RPC ft_metadata + ft_total_supply calls. Eliminates hidden decimal errors.</p>
          </div>
          <span className="badge purple">Archival RPC verified</span>
        </div>
        <div className="table-scroll">
          <table className="source-table">
            <thead>
              <tr>
                <th>Leg</th>
                <th>Contract Account ID</th>
                <th>Symbol</th>
                <th>Decimals</th>
                <th>Float (ft_total_supply)</th>
                <th>Note / Classification</th>
              </tr>
            </thead>
            <tbody>
              {confirmedContracts.map(c => (
                <tr key={c.leg}>
                  <td><code>{c.leg}</code></td>
                  <td><code style={{ fontSize: "11px" }}>{c.contract}</code></td>
                  <td><strong>{c.symbol}</strong></td>
                  <td>{c.decimals}</td>
                  <td>{c.float}</td>
                  <td><small className={c.leg === "S2" ? "negative" : "muted"}>{c.note}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-bottom-caption">
          <Info size={12} /> Key finding on S2: contract 17208628f84f… is bridged USDC, NOT a native stablecoin. Circle earns reserve carry, not NEAR.
        </div>
      </section>

      <div className="section-heading query-section-heading">
        <h2>The on-chain BigQuery research toolkit</h2>
        <button className="text-button" onClick={() => onNavigate("methodology")}>Full methodology <ArrowRight size={13} /></button>
      </div>

      <div className="query-cards">
        {queries.map((query, i) => (
          <button className="panel query-card" key={query.id} onClick={() => onOpen({ type: "query", queryId: query.id })}>
            <div>
              <span className="query-file-icon"><Code2 size={18} /></span>
              <span className="badge neutral">SQL</span>
            </div>
            <h3>{query.title}</h3>
            <p>{query.description}</p>
            <span className="query-card-bottom">
              <code>0{i + 1} · {query.table}</code>
              <ArrowUpRight size={15} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function MethodologyView({ workspace, onOpen }: PanelProps) {
  return (
    <div className="section-enter">
      <section className="methodology-hero">
        <div>
          <div className="eyebrow"><ShieldCheck size={14} />REPRODUCIBLE RESEARCH V5</div>
          <h2>Reproducibility & Honesty Ledger</h2>
          <p>Every number traces to a first-party query or public API. Where something could not be computed, it is stated.</p>
        </div>
        <button className="button primary" onClick={() => onOpen({ type: "reproduce" })}>
          <Terminal size={15} />
          Reproduce via rebuild.sh
        </button>
      </section>

      <div className="methodology-stats">
        <div><strong>$11.22B</strong><span>Verified stable floor</span></div>
        <div><strong>9</strong><span>Confirmed USD contracts</span></div>
        <div><strong>680</strong><span>Days of BigQuery L1 data</span></div>
        <div><strong>10,000</strong><span>Permutation shuffles (null holds)</span></div>
      </div>

      {/* The Honesty Ledger Table */}
      <section className="panel source-table-panel">
        <div className="panel-heading">
          <h2>The Honesty Ledger: Verified vs Reported (Appendix C)</h2>
          <span className="badge neutral">Strict provenance</span>
        </div>
        <div className="table-scroll">
          <table className="source-table">
            <thead>
              <tr>
                <th>Claim</th>
                <th>Status</th>
                <th>Basis & Verification</th>
              </tr>
            </thead>
            <tbody>
              {honestyLedger.map(item => (
                <tr key={item.claim}>
                  <td><strong>{item.claim}</strong></td>
                  <td>
                    <span className={`badge ${item.status.includes("Verified") ? "green" : "neutral"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td><small>{item.basis}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Lead-Lag Permutation Tests Table */}
      <section className="panel" style={{ marginTop: "20px" }}>
        <div className="panel-heading">
          <div>
            <h2>Permutation Lead-Lag Testing (Thesis §7) [verified]</h2>
            <p>10,000 shuffles with fixed seed. Decision rule: flow can only lead if p &lt; 0.05 at lag +1. None did. Sample sizes are small, so this fails to detect a lead rather than proving absence.</p>
          </div>
          <span className="badge neutral">Null kept on purpose</span>
        </div>
        <div className="table-scroll">
          <table className="source-table">
            <thead>
              <tr>
                <th>Test Specification</th>
                <th>lag +1 (Flow leads)</th>
                <th>lag 0 (Coincident)</th>
                <th>lag −1 (Lagging)</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {leadLagTests.map(t => (
                <tr key={t.test}>
                  <td><strong>{t.test}</strong></td>
                  <td>{t.lagPlus1}</td>
                  <td>{t.lag0}</td>
                  <td>{t.lagMinus1}</td>
                  <td><span className="badge neutral">{t.verdict}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-bottom-caption">
          <Info size={12} /> Conclusion: No detectable lead from flow to network usage or token price at these sample sizes. Any backtest trading flow is fitting noise.
        </div>
      </section>

      {/* Query Library */}
      <section className="panel query-library" style={{ marginTop: "20px" }}>
        <div className="panel-heading">
          <div>
            <h2>BigQuery SQL Library</h2>
            <p>Standard GoogleSQL · NEAR mainnet · Partition-filtered queries</p>
          </div>
          <span className="badge purple">3 queries</span>
        </div>
        {queries.map(query => (
          <button className="query-library-row" key={query.id} onClick={() => onOpen({ type: "query", queryId: query.id })}>
            <span className="query-file-icon"><FileText size={17} /></span>
            <span>
              <strong>{query.title}</strong>
              <code>{query.file}</code>
            </span>
            <span className="query-table-name">{query.table}</span>
            <span className="view-query-label">View SQL <ArrowUpRight size={14} /></span>
          </button>
        ))}
      </section>

      <div className="thesis-two-col" style={{ marginTop: "20px" }}>
        <section className="panel methodology-note">
          <span className="focus-icon mint"><ShieldCheck size={19} /></span>
          <h2>RPC Identity Probe</h2>
          <p>Run against free archival RPC: <code>archival-rpc.mainnet.near.org</code>. Call <code>ft_metadata</code> and <code>ft_total_supply</code> with method argument <code>e30=</code>. Result is a byte array of JSON tokens.</p>
          <button className="text-button" onClick={() => onOpen({ type: "query" })}>View query details <ArrowRight size={13} /></button>
        </section>

        <section className="panel methodology-note">
          <span className="focus-icon sand"><TriangleAlert size={19} /></span>
          <h2>10 Removed Claims (Appendix E)</h2>
          <p>Earlier drafts had 10 claims that failed verification and were deleted: native stable carry, date-selected +279% trade, 893× growth, Sharpe 1.46 error, Tron dominant stable, etc.</p>
          <button className="text-button" onClick={() => onOpen({ type: "sources" })}>Inspect audit trail <ArrowRight size={13} /></button>
        </section>
      </div>
    </div>
  );
}

export function NotebookView({ workspace, onOpen, onDelete }: PanelProps & { onDelete: (id: string) => Promise<void> }) {
  const [filter, setFilter] = useState("All notes");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const notes = workspace.notes.filter(note => (filter === "All notes" || note.category === filter) && `${note.title} ${note.body}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="section-enter">
      <div className="notebook-toolbar">
        <div className="field-search">
          <Search size={16} />
          <input placeholder="Search research notes…" aria-label="Search notes" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select aria-label="Filter notes by type" value={filter} onChange={e => setFilter(e.target.value)}>
          <option>All notes</option>
          <option>Evidence</option>
          <option>Risk</option>
          <option>Question</option>
          <option>Observation</option>
        </select>
        <span>{notes.length} {notes.length === 1 ? "note" : "notes"}</span>
      </div>

      {!notes.length ? (
        <section className="panel notebook-empty">
          <div className="notebook-illustration">
            <NotebookPen size={34} />
            <span><Plus size={14} /></span>
          </div>
          <div className="eyebrow">RESEARCH NOTEBOOK</div>
          <h2>{workspace.notes.length ? "No notes match your search." : "Capture research as it evolves."}</h2>
          <p>{workspace.notes.length ? "Try another keyword or category." : "Keep observations, falsifiers, and counter-evidence together."}</p>
          <button className="button primary" onClick={() => workspace.notes.length ? (setSearch(""), setFilter("All notes")) : onOpen({ type: "note" })}>
            {workspace.notes.length ? <Search size={15} /> : <Plus size={15} />}
            {workspace.notes.length ? "Clear filters" : "Add note"}
          </button>
        </section>
      ) : (
        <div className="note-grid">
          {notes.map(note => (
            <article className="panel note-card" key={note.id}>
              <div className="note-meta">
                <span className={`badge ${note.category === "Risk" ? "amber" : note.category === "Evidence" ? "green" : "purple"}`}>
                  {note.category}
                </span>
                <span>{formatDate(note.createdAt)}</span>
                <button className="icon-button" aria-label={`Delete note: ${note.title}`} onClick={() => setPendingDelete(note.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
              <h2>{note.title}</h2>
              <p style={{ whiteSpace: "pre-line", fontSize: "13px", lineHeight: "1.6" }}>{note.body}</p>
              <div className="note-author">
                <AuthorAvatar small />
                <span>David Olabowale · Research Log</span>
              </div>
              {pendingDelete === note.id && (
                <div className="delete-confirm">
                  <span>Permanently delete this note?</span>
                  <button className="button small-button" disabled={deleting === note.id} onClick={() => setPendingDelete(null)}>Keep</button>
                  <button className="button danger small-button" disabled={deleting === note.id} onClick={async () => {
                    setDeleting(note.id);
                    try { await onDelete(note.id); setPendingDelete(null); } finally { setDeleting(null); }
                  }}>
                    {deleting === note.id ? <Loader2 className="spin" size={13} /> : "Delete"}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <div className="notebook-tip">
        <Lightbulb size={17} />
        <span><strong>Evidence before conviction.</strong> Every note links an observation to its first-party source query or API response.</span>
      </div>
    </div>
  );
}

export function ChangelogView({ workspace, onOpen }: PanelProps) {
  const [filter, setFilter] = useState("all");
  const allRuns = workspace.runs;
  const runs = allRuns.filter(run => filter === "all" || (filter === "data" ? ["success", "failed", "snapshot"].includes(run.status) : run.status === filter));

  return (
    <div className="section-enter">
      <div className="activity-toolbar">
        <div>
          <History size={16} />
          <span>Research development changelog (v1 through v5)</span>
        </div>
        <select aria-label="Filter research activity" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All milestones</option>
          <option value="data">Data refreshes</option>
          <option value="revision">Thesis revisions</option>
          <option value="import">Data imports</option>
        </select>
      </div>

      <section className="panel activity-panel">
        {runs.length ? (
          runs.map(run => {
            const title = run.status === "revision" ? "Thesis v5 finalized with scenario matrix" : run.status === "import" ? "680 days of L1 BigQuery data synthesized" : run.status === "failed" ? "Query interrupted" : run.status === "snapshot" ? "Market and returns evidence captured" : "Connected sources refreshed";
            return (
              <article className="activity-item" key={run.id}>
                <span className={`activity-icon ${run.status === "failed" ? "failed" : run.status === "revision" ? "revision" : "success"}`}>
                  {run.status === "revision" ? <Pencil size={17} /> : run.status === "failed" ? <XCircle size={17} /> : run.status === "import" ? <Database size={17} /> : <CheckCircle2 size={17} />}
                </span>
                <div>
                  <div className="activity-item-title">
                    <h3>{title}</h3>
                    <span>{formatDate(run.createdAt, true)} UTC</span>
                  </div>
                  <p>{run.detail}</p>
                  {run.sourceCount > 0 && (
                    <button className="activity-source-link" onClick={() => onOpen({ type: run.status === "import" ? "query" : "sources" })}>
                      <Link2 size={12} />
                      {run.sourceCount} {run.sourceCount === 1 ? "source" : "sources"}
                      <ArrowUpRight size={11} />
                    </button>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <div className="activity-empty">
            <CircleDashed size={28} />
            <h3>No activity in this category yet.</h3>
          </div>
        )}
      </section>

      <div className="inline-notice">
        <ShieldCheck size={16} />
        <span>All data sources, query templates, and RPC probes are fully documented for hackathon judging.</span>
      </div>
    </div>
  );
}
