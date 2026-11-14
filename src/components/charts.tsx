"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Code2, Info } from "lucide-react";
import { compact, percent } from "@/lib/research";
import type { MarketSnapshot, OnchainRow } from "@/lib/types";

export function Sparkline({ values, color = "#f2416b" }: { values: number[]; color?: string }) {
  const id = useId().replace(/:/g, "");
  if (values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const points = values.map((value, index) => `${index * 100 / (values.length - 1)},${31 - ((value - min) / (max - min || 1)) * 26}`).join(" ");
  return <svg className="sparkline" viewBox="0 0 100 38" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".16"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
    <polygon points={`0,38 ${points} 100,38`} fill={`url(#${id})`}/><polyline points={points} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
  </svg>;
}

export function MetricCards({ snapshot, onSource }: { snapshot: MarketSnapshot; onSource: () => void }) {
  const { market, history, tvl } = snapshot;
  const lastTvl = tvl[tvl.length - 1];
  const previousTvl = tvl[tvl.length - 2];
  const tvlChange = previousTvl?.tvl ? (lastTvl.tvl / previousTvl.tvl - 1) * 100 : 0;
  const metrics = [
    { label: "NEAR price", value: `$${market.current_price.toFixed(2)}`, change: market.price_change_percentage_24h, context: "24h", source: "CoinGecko", points: history.prices.slice(-30).map(p => p[1]), tip: "Latest NEAR / USD spot price from the timestamped CoinGecko snapshot." },
    { label: "Market capitalization", value: compact(market.market_cap), change: market.market_cap_change_percentage_24h, context: "24h", source: "CoinGecko", points: history.market_caps.slice(-30).map(p => p[1]), tip: "Circulating supply multiplied by the source’s current token price." },
    { label: "Trading volume", value: compact(market.total_volume), change: null, context: "Past 24 hours", source: "CoinGecko", points: history.total_volumes.slice(-30).map(p => p[1]), tip: "Reported 24-hour token trading volume, not network transaction volume." },
    { label: "Total value locked", value: compact(lastTvl.tvl), change: tvlChange, context: "latest day", source: "DefiLlama", points: tvl.slice(-30).map(p => p.tvl), tip: "NEAR-chain DeFi TVL in USD. Excludes liquid staking and double-counted TVL. Not a user-adoption metric." },
  ];
  return <div className="metric-grid">{metrics.map(metric => <article className="metric-card" key={metric.label}>
    <div className="metric-label">{metric.label}<button className="info-button" aria-label={`About ${metric.label}`} title={metric.tip} onClick={onSource}><Info size={13}/></button></div>
    <div className="metric-value">{metric.value}</div>
    <div className="metric-bottom"><div className="metric-context">{metric.change !== null && <span className={metric.change >= 0 ? "positive" : "negative"}>{metric.change >= 0 ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>} {percent(metric.change)}</span>}<span>{metric.context}</span></div><Sparkline values={metric.points} color={metric.label === "Trading volume" ? "#6b6b6b" : "#f2416b"}/></div>
  </article>)}</div>;
}

const ranges = [{ label: "1M", days: 30 }, { label: "3M", days: 90 }, { label: "6M", days: 180 }, { label: "1Y", days: 365 }];

export function PerformanceChart({ snapshot, onQuery, expanded = false }: { snapshot: MarketSnapshot; onQuery: () => void; expanded?: boolean }) {
  const [range, setRange] = useState(90);
  const [hover, setHover] = useState<number | null>(null);
  const [showPrice, setShowPrice] = useState(true);
  const [showTvl, setShowTvl] = useState(true);
  const [mode, setMode] = useState<"indexed" | "price">("indexed");
  const gradientId = useId().replace(/:/g, "");
  const chartRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: expanded ? 310 : 220 });
  useEffect(() => {
    if (!chartRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setDimensions({ width: Math.max(280, entry.contentRect.width), height: Math.max(160, entry.contentRect.height) });
    });
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);
  const points = useMemo(() => {
    const latest = snapshot.history.prices.at(-1)?.[0] ?? 0;
    const prices = snapshot.history.prices.filter(([date]) => date >= latest - range * 86400000);
    const tvlDates = new Map(snapshot.tvl.map(row => [new Date(row.date * 1000).toISOString().slice(0, 10), row.tvl]));
    const firstTvl = prices.map(([date]) => tvlDates.get(new Date(date).toISOString().slice(0, 10))).find(value => value !== undefined && value > 0) ?? 1;
    return prices.map(([date, price]) => {
      const tvl = tvlDates.get(new Date(date).toISOString().slice(0, 10));
      return { date, price, tvl, p: mode === "price" ? price : price / prices[0][1] * 100, t: tvl === undefined ? undefined : tvl / firstTvl * 100 };
    });
  }, [snapshot, range, mode]);
  const { width, height } = dimensions;
  const left = 14, right = 57, top = 18, bottom = 31;
  const chartWidth = width - left - right, chartHeight = height - top - bottom;
  const allValues = points.flatMap(p => [...(showPrice ? [p.p] : []), ...(showTvl && mode === "indexed" && p.t !== undefined ? [p.t] : [])]);
  const dataMin = Math.min(...allValues), dataMax = Math.max(...allValues);
  const span = dataMax - dataMin || Math.max(dataMax * .1, 1);
  const rawStep = span / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const scaledStep = rawStep / magnitude;
  const step = (scaledStep <= 1 ? 1 : scaledStep <= 2 ? 2 : scaledStep <= 2.5 ? 2.5 : scaledStep <= 5 ? 5 : 10) * magnitude;
  const min = Math.max(0, Math.floor((dataMin - span * .08) / step) * step);
  const max = Math.ceil((dataMax + span * .08) / step) * step;
  const ticks = Array.from({ length: Math.round((max - min) / step) + 1 }, (_, index) => min + index * step);
  const x = (index: number) => left + index * chartWidth / Math.max(points.length - 1, 1);
  const y = (value: number) => top + chartHeight - (value - min) / (max - min || 1) * chartHeight;
  const pricePath = points.map((point, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(2)},${y(point.p).toFixed(2)}`).join(" ");
  let segmentOpen = false;
  const tvlPath = points.map((point, i) => {
    if (point.t === undefined) { segmentOpen = false; return ""; }
    const prefix = segmentOpen ? "L" : "M"; segmentOpen = true;
    return `${prefix}${x(i).toFixed(2)},${y(point.t).toFixed(2)}`;
  }).join(" ");
  const focused = hover === null ? null : points[hover];
  const first = points[0], last = points.at(-1);
  const change = first && last ? (last.price / first.price - 1) * 100 : 0;
  return <section className={`panel performance-panel ${expanded ? "expanded" : ""}`}>
    <div className="panel-heading"><div><h2>Market & network performance</h2><p>Two perspectives. One long-term picture.</p></div><button className="icon-button subtle" title="View chart methodology" aria-label="View chart methodology" onClick={onQuery}><Code2 size={17}/></button></div>
    <div className="chart-toolbar"><div className="chart-measure"><button className={mode === "indexed" ? "selected" : ""} onClick={() => { setMode("indexed"); setHover(null); }}>Indexed <span>100</span></button><button className={mode === "price" ? "selected" : ""} onClick={() => { setMode("price"); setShowPrice(true); setHover(null); }}>Price <span>USD</span></button></div><div className="range-switch" aria-label="Chart time range">{ranges.map(item => <button key={item.label} className={range === item.days ? "active" : ""} aria-pressed={range === item.days} onClick={() => { setRange(item.days); setHover(null); }}>{item.label}</button>)}</div></div>
    <div ref={chartRef} className="chart-canvas" onMouseLeave={() => setHover(null)}>
      <svg className="performance-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`NEAR price ${mode === "indexed" ? "and total value locked indexed to 100" : "in USD"} over ${range} days`} onMouseMove={event => { const box = event.currentTarget.getBoundingClientRect(); const mouseX = (event.clientX - box.left) / box.width * width; setHover(Math.max(0, Math.min(points.length - 1, Math.round((mouseX - left) / chartWidth * (points.length - 1))))); }}>
        <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f2416b" stopOpacity=".20"/><stop offset="100%" stopColor="#f2416b" stopOpacity=".005"/></linearGradient></defs>
        {ticks.map(value => <g key={value}><line x1={left} x2={width - right + 3} y1={y(value)} y2={y(value)} stroke="#222222" strokeDasharray="3 5" strokeWidth=".7"/><text x={width - right + 13} y={y(value) + 4} fill="#6b6b6b" fontSize="10.5">{mode === "price" ? `$${value.toFixed(2)}` : Math.round(value)}</text></g>)}
        {points.length > 0 && showPrice && <><path d={`${pricePath} L${x(points.length - 1)},${top + chartHeight} L${left},${top + chartHeight} Z`} fill={`url(#${gradientId})`}/><path d={pricePath} fill="none" stroke="#ededed" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke"/></>}
        {showTvl && mode === "indexed" && <path d={tvlPath} fill="none" stroke="#6e8f95" strokeWidth="1.6" strokeDasharray="4 4" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>}
        {[0, 1, 2, 3, 4, 5].map(i => { const index = Math.round((points.length - 1) * i / 5); const point = points[index]; return point ? <text key={i} x={x(index)} y={height - 8} textAnchor={i === 0 ? "start" : i === 5 ? "end" : "middle"} fill="#6b6b6b" fontSize="10.5">{new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}</text> : null; })}
        {focused && hover !== null && <g><line x1={x(hover)} x2={x(hover)} y1={top} y2={top + chartHeight} stroke="#3a3a3a" strokeDasharray="3 4"/>{showPrice && <circle cx={x(hover)} cy={y(focused.p)} r="4" fill="#ededed" stroke="#000000" strokeWidth="2"/>}{showTvl && mode === "indexed" && focused.t !== undefined && <circle cx={x(hover)} cy={y(focused.t)} r="3" fill="#83a6ab"/>}</g>}
      </svg>
      {focused && hover !== null && <div className="chart-tooltip" style={{ left: `${Math.max(2, Math.min(100 - 168 / width * 100, x(hover) / width * 100 - 10))}%` }}><span>{new Date(focused.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</span><b><i className="legend-dot purple"/>NEAR <strong>${focused.price.toFixed(3)}</strong></b>{focused.tvl !== undefined && <b><i className="legend-dot teal"/>TVL <strong>{compact(focused.tvl)}</strong></b>}</div>}
    </div>
    <div className="chart-legend"><div><button className={!showPrice ? "muted" : ""} onClick={() => { if (mode === "price" || (!showTvl && showPrice)) return; setShowPrice(!showPrice); }} aria-pressed={showPrice}><i className="legend-dot purple"/>NEAR price</button>{mode === "indexed" && <button className={!showTvl ? "muted" : ""} onClick={() => { if (!showPrice && showTvl) return; setShowTvl(!showTvl); }} aria-pressed={showTvl}><i className="legend-dot teal"/>Total value locked</button>}</div><span className={change >= 0 ? "positive" : "negative"}>{percent(change)} <span className="muted">price · {range}d</span></span></div>
    <div className="chart-source"><span>CoinGecko + DefiLlama</span><span>{mode === "indexed" ? "Rebased to 100 at period start" : "Daily observations · UTC"}<Info size={11}/></span></div>
  </section>;
}

export function OnchainChart({ rows }: { rows: OnchainRow[] }) {
  const [metric, setMetric] = useState<"active_accounts" | "transactions">("active_accounts");
  const visible = rows.slice(-90);
  const max = Math.max(...visible.map(row => row[metric]), 1);
  return <section className="panel onchain-chart"><div className="panel-heading"><div><h2>Imported network activity</h2><p>Last {visible.length} observations · user-provided results</p></div><select aria-label="On-chain metric" value={metric} onChange={e => setMetric(e.target.value as typeof metric)}><option value="active_accounts">Active accounts</option><option value="transactions">Transactions</option></select></div><div className="bar-chart">{visible.map(row => <div className="bar-column" key={row.date} title={`${row.date}: ${row[metric].toLocaleString()} ${metric.replace("_", " ")}`}><div style={{ height: `${row[metric] / max * 100}%` }}/></div>)}</div><div className="bar-axis"><span>{visible[0]?.date}</span><span>{visible.at(-1)?.date}</span></div></section>;
}
