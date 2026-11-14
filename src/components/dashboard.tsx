"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownToLine, ArrowRight, ArrowUpRight, Bell, BookOpenText, ChartNoAxesCombined, ChartLine, CheckCircle2, ChevronRight, CircleHelp, Code2, Database, Globe2, History, LayoutDashboard, Menu, NotebookPen, PanelLeftClose, Pencil, Plus, RefreshCw, Search, Share2, Terminal, TriangleAlert, X } from "lucide-react";
import { AuthorAvatar, BerryMark, NearMark } from "@/components/brand";
import ResearchDialogs, { type DialogState } from "@/components/research-dialogs";
import { ChangelogView, MarketView, MethodologyView, NotebookView, OnchainView, Overview, ThesisView } from "@/components/research-panels";
import initialOnchainDataset from "@/data/onchain-dataset.json";
import { DemoMode } from "@/components/demo-mode";
import type { OnchainDataset, ResearchNote, Section, Thesis, Workspace } from "@/lib/types";

const navigation = [
  { id: "overview" as Section, label: "Overview", icon: LayoutDashboard },
  { id: "onchain" as Section, label: "On-chain analytics", icon: ChartNoAxesCombined },
  { id: "market" as Section, label: "Market analysis", icon: ChartLine },
  { id: "thesis" as Section, label: "Investment thesis", icon: BookOpenText },
  { id: "methodology" as Section, label: "Methodology & data", icon: Database },
];
const workspaceNavigation = [
  { id: "notebook" as Section, label: "Research notebook", icon: NotebookPen },
  { id: "changelog" as Section, label: "Changelog", icon: History },
];
const sectionInfo: Record<Section, { title: string; description: string; breadcrumb: string }> = {
  overview: { title: "Thesis overview", description: "An independent, long-term perspective on NEAR Protocol.", breadcrumb: "Overview" },
  onchain: { title: "On-chain analytics", description: "Go beyond transaction counts. Understand the quality of network activity.", breadcrumb: "On-chain analytics" },
  market: { title: "Market analysis", description: "A little more context. A clearer view of how NEAR is being valued.", breadcrumb: "Market analysis" },
  thesis: { title: "Investment thesis", description: "An evolving argument—with room for the evidence to change it.", breadcrumb: "Investment thesis" },
  methodology: { title: "Methodology & data", description: "Inspect the inputs. Re-run the work. Understand the limitations.", breadcrumb: "Methodology & data" },
  notebook: { title: "Research notebook", description: "Observations, open questions, and evidence worth keeping.", breadcrumb: "Research notebook" },
  changelog: { title: "Research changelog", description: "An open record of the work behind the thesis.", breadcrumb: "Changelog" },
};

export default function Dashboard({ initialWorkspace, initialSection = "overview" }: { initialWorkspace: Workspace; initialSection?: Section }) {
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [section, setSection] = useState<Section>(initialSection);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [onchain, setOnchain] = useState<OnchainDataset | null>(initialOnchainDataset as unknown as OnchainDataset);
  const [toast, setToast] = useState<{ message: string; error?: boolean; id: number } | null>(null);
  const closeDialog = useCallback(() => setDialog(null), []);
  const openDialog = useCallback((next: DialogState) => { setDialog(next); setMobileOpen(false); }, []);
  const notify = useCallback((message: string, error = false) => setToast({ message, error, id: Date.now() }), []);

  const navigate = useCallback((next: Section) => {
    setSection(next); setMobileOpen(false);
    const targetUrl = next === "overview" ? "/" : `/${next}`;
    if (window.location.pathname !== targetUrl) window.history.pushState(null, "", targetUrl);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const handleLocation = () => {
      const path = window.location.pathname.replace(/^\//, "").toLowerCase();
      const hash = window.location.hash.slice(1).toLowerCase();
      if (Object.keys(sectionInfo).includes(path)) setSection(path as Section);
      else if (Object.keys(sectionInfo).includes(hash)) setSection(hash as Section);
    };
    handleLocation();
    window.addEventListener("hashchange", handleLocation);
    window.addEventListener("popstate", handleLocation);
    fetch("/api/onchain").then(r => r.ok ? r.json() : null).then(data => { if (data && Array.isArray(data.rows)) setOnchain(data); }).catch(() => {});
    const keydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setDialog(current => current?.type === "search" ? null : { type: "search" }); }
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", keydown);
    return () => { window.removeEventListener("hashchange", handleLocation); window.removeEventListener("popstate", handleLocation); window.removeEventListener("keydown", keydown); };
  }, []);

  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 5000); return () => clearTimeout(id); }, [toast]);
  useEffect(() => {
    if (!mobileOpen) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = before; };
  }, [mobileOpen]);

  async function syncWorkspace() {
    try { const response = await fetch("/api/research"); if (response.ok) setWorkspace(await response.json()); } catch { /* The current verified workspace remains visible. */ }
  }

  async function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const response = await fetch("/api/refresh", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to refresh the sources.");
      setWorkspace(current => ({ ...current, snapshot: data.snapshot, runs: [data.run, ...current.runs] }));
      notify("CoinGecko and DefiLlama refreshed. Your evidence is up to date.");
    } catch (error) { notify(error instanceof Error ? error.message : "The data refresh failed. Your saved snapshot is unchanged.", true); void syncWorkspace(); }
    finally { setRefreshing(false); }
  }

  function saveThesis(thesis: Thesis) { setWorkspace(current => ({ ...current, thesis })); void syncWorkspace(); }
  function saveNote(note: ResearchNote) { setWorkspace(current => ({ ...current, notes: [note, ...current.notes] })); }
  function saveImport(dataset: OnchainDataset) { setOnchain(dataset); navigate("onchain"); void syncWorkspace(); }
  async function deleteNote(id: string) {
    try {
      const response = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error); }
      setWorkspace(current => ({ ...current, notes: current.notes.filter(note => note.id !== id) }));
      notify("Research note deleted.");
    } catch (error) { notify(error instanceof Error ? error.message : "The note could not be deleted.", true); }
  }

  const info = sectionInfo[section];
  const props = { workspace, onOpen: openDialog, onNavigate: navigate };
  const renderNav = (items: typeof navigation) => items.map(item => <a key={item.id} href={`#${item.id}`} className={`nav-item ${section === item.id ? "active" : ""}`} aria-current={section === item.id ? "page" : undefined} onClick={event => { event.preventDefault(); navigate(item.id); }}><item.icon size={17} strokeWidth={1.65}/><span>{item.label}</span>{item.id === "notebook" && workspace.notes.length > 0 ? <span className="nav-count">{workspace.notes.length}</span> : section === item.id ? <span className="active-nav-dot"/> : null}</a>);

  return <div className="app-shell"><DemoMode onNavigate={navigate} onOpenDialog={openDialog} onCloseDialog={closeDialog} currentSection={section} /><a className="skip-link" href="#main-content">Skip to research</a>{mobileOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)}/>}<aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}><button className="brand" onClick={() => navigate("overview")} aria-label="Berry Thesis overview"><BerryMark/><span>berry<span>thesis</span></span><span className="brand-beta">BETA</span></button><div className="sidebar-project"><span className="sidebar-project-icon"><NearMark size={23}/></span><div><strong>NEAR Protocol</strong><span>Investment research</span></div><i className="project-status-dot"/></div><nav aria-label="Research navigation"><div className="nav-label">RESEARCH</div>{renderNav(navigation)}<div className="nav-label workspace-label">WORKSPACE</div>{renderNav(workspaceNavigation)}</nav><div className="sidebar-spacer"/><div className="repro-card"><span className="repro-card-icon"><Terminal size={17}/></span><h3>Built to be questioned.</h3><p>Good research is research<br/>you can reproduce.</p><button onClick={() => openDialog({ type: "reproduce" })}>Reproduce the research <ArrowUpRight size={14}/></button></div><button className="hackathon-link" onClick={() => openDialog({ type: "about" })}><NearMark size={20}/><span><strong>NEAR Hackathon</strong><small>Investment Thesis track</small></span><ArrowUpRight size={14}/></button><button className="sidebar-profile" onClick={() => openDialog({ type: "profile" })}><AuthorAvatar/><span><strong>David Olabowale</strong><small>Independent researcher</small></span><ChevronRight size={15}/></button></aside><div className="main-shell"><header className="topbar"><div className="breadcrumb"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={20}/></button><span className="breadcrumb-project"><NearMark size={17}/><span>NEAR Protocol</span></span><span className="breadcrumb-slash">/</span><span>{info.breadcrumb}</span><span className="public-badge"><Globe2 size={11}/>Public</span></div><div className="topbar-right"><button className="header-search" onClick={() => openDialog({ type: "search" })}><Search size={15}/><span>Search this research…</span><kbd>⌘ K</kbd></button><button className={`icon-button notifications ${section === "changelog" ? "is-active" : ""}`} title="Research updates" aria-label="View research updates" onClick={() => navigate("changelog")}><Bell size={18}/></button><span className="topbar-divider"/><button className="topbar-avatar" aria-label="Open researcher profile" onClick={() => openDialog({ type: "profile" })}><AuthorAvatar small/></button></div></header><main className="main-content" id="main-content"><div className="page-heading"><div><div className="heading-eyebrow">THE LONG-TERM PERSPECTIVE</div><h1>{info.title}</h1><p>{info.description}</p></div><div className="page-actions">{section === "overview" ? <><button className="button" onClick={() => openDialog({ type: "share" })}><Share2 size={14}/>Share research</button><button className="button primary" onClick={() => navigate("thesis")}><BookOpenText size={15}/>Read thesis<ArrowUpRight size={14}/></button></> : section === "thesis" ? <><button className="button" onClick={() => openDialog({ type: "export" })}><ArrowDownToLine size={14}/>Export</button><button className="button primary" onClick={() => openDialog({ type: "edit" })}><Pencil size={14}/>Edit thesis</button></> : section === "notebook" ? <button className="button primary" onClick={() => openDialog({ type: "note" })}><Plus size={16}/>New note</button> : section === "onchain" ? <button className="button primary" onClick={() => openDialog({ type: "query" })}><Code2 size={15}/>View queries</button> : section === "methodology" ? <button className="button" onClick={() => openDialog({ type: "export" })}><ArrowDownToLine size={14}/>Export research</button> : <><button className="button" onClick={() => openDialog({ type: "export" })}><ArrowDownToLine size={14}/>Export data</button><button className="button primary" disabled={refreshing} onClick={refresh}><RefreshCw size={14} className={refreshing ? "spin" : ""}/>{refreshing ? "Refreshing…" : "Re-run data"}</button></>}</div></div>{section === "overview" && <Overview {...props} onRefresh={refresh} refreshing={refreshing}/>} {section === "onchain" && <OnchainView {...props} dataset={onchain}/>} {section === "market" && <MarketView {...props}/>} {section === "thesis" && <ThesisView {...props}/>} {section === "methodology" && <MethodologyView {...props}/>} {section === "notebook" && <NotebookView {...props} onDelete={deleteNote}/>} {section === "changelog" && <ChangelogView {...props}/>}<footer className="workspace-footer"><span><BerryMark/>Less noise. More evidence.</span><button onClick={() => openDialog({ type: "about" })}>About this project<ArrowUpRight size={12}/></button></footer></main></div>{dialog && <ResearchDialogs key={`${dialog.type}-${dialog.queryId || ""}`} dialog={dialog} workspace={workspace} onClose={closeDialog} onOpen={openDialog} onNavigate={navigate} onThesisSaved={saveThesis} onNoteSaved={saveNote} onImported={saveImport} onToast={notify} onRefresh={refresh}/>} {toast && <div className={`toast ${toast.error ? "error" : ""}`} role="status">{toast.error ? <TriangleAlert size={19}/> : <CheckCircle2 size={19}/>}<span>{toast.message}</span><button aria-label="Dismiss notification" onClick={() => setToast(null)}><X size={15}/></button></div>}</div>;
}
