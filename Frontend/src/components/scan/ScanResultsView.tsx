import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, GitBranch, FileCode, CheckCircle2, AlertTriangle, ChevronDown, 
    Hash, ShieldAlert, ShieldCheck, Activity, TrendingUp, FileWarning, ArrowLeft, Layers,
    Zap, ExternalLink, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnalyseResponse, SourceCodeResponse, FullScanResponse } from '@/services/api';

type ScanMode = 'commit' | 'code' | 'full';

interface ScanResultsViewProps { 
    data: any; 
    mode: ScanMode; 
    owner?: string;
    repo?: string;
    branch?: string;
    onReset: () => void; 
}

export function ScanResultsView({ 
    data, 
    mode, 
    owner,
    repo: repoProp,
    branch: branchProp,
    onReset 
}: ScanResultsViewProps) {
    // Determine effective repo/branch from data or props
    const effectiveRepo = repoProp || data?.repo || "Project";
    const effectiveBranch = branchProp || data?.branch || "main";
    const effectiveOwner = owner || "";

    return (
        <div className="relative min-h-screen flex flex-col items-center p-6 overflow-x-hidden pt-12 pb-24 bg-[#050608]">
            {/* Background Glows */}
            <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -mr-[300px] -mt-[300px]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] -ml-[200px] -mb-[200px]" />
            </div>

            <div className="max-w-7xl w-full relative z-10">
                <div className="flex items-center justify-between mb-10">
                    <button 
                      onClick={onReset} 
                      className="flex items-center gap-2 text-muted-foreground hover:text-white transition-all text-[10px] font-headline uppercase tracking-widest glass-panel px-6 py-2.5 rounded-xl border border-white/10 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(38,114,255,0.15)] group"
                    >
                        <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Back to Search
                    </button>
                    <div className="text-[10px] font-headline uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" /> 
                        <span className="text-emerald-400">Analysis Synchronized</span>
                        <div className="h-1 w-1 rounded-full bg-white/20" />
                        <span>Secure Trace Complete</span>
                    </div>
                </div>

                <div className="space-y-12">
                    {mode === 'commit' && <CommitDashboard data={data as AnalyseResponse} owner={effectiveOwner} repo={effectiveRepo} branch={effectiveBranch} />}
                    {mode === 'code' && <SourceCodeDashboard data={data as SourceCodeResponse} owner={effectiveOwner} repo={effectiveRepo} branch={effectiveBranch} />}
                    {mode === 'full' && <FullScanDashboard data={data as FullScanResponse} owner={effectiveOwner} repo={effectiveRepo} branch={effectiveBranch} />}
                </div>
            </div>
        </div>
    );
}

// --------------------------------------------------------------------------------------
// COMMIT DASHBOARD
// --------------------------------------------------------------------------------------
function CommitDashboard({ data, owner, repo, branch }: { data: AnalyseResponse, owner: string, repo: string, branch: string }) {
    if (!data) return null;
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <ScanHeader title="Commit Behaviour Audit" owner={owner} repo={repo} branch={branch} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPICard icon={Activity} label="Commits Analyzed" value={data.total_analyzed ?? 0} color="text-primary" />
                <KPICard icon={AlertTriangle} label="Suspicious Commits" value={data.suspicious_count ?? 0} color={(data.suspicious_count ?? 0) > 0 ? "text-red-400" : "text-emerald-400"} />
                <KPICard icon={Zap} label="Suspicion Rate" value={`${(data.suspicious_pct ?? 0).toFixed(1)}%`} color={(data.suspicious_pct ?? 0) > 10 ? "text-amber-400" : "text-emerald-400"} />
                <KPICard icon={TrendingUp} label="Risk Metric" value={data.suspicious_count > 5 ? "Elevated" : "Nominal"} color={data.suspicious_count > 5 ? "text-red-400" : "text-emerald-400"} />
            </div>
            <CommitList results={data.results} />
        </motion.div>
    );
}

// --------------------------------------------------------------------------------------
// SOURCE CODE DASHBOARD
// --------------------------------------------------------------------------------------
function SourceCodeDashboard({ data, owner, repo, branch }: { data: SourceCodeResponse, owner: string, repo: string, branch: string }) {
    if (!data) return null;
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <ScanHeader title="Source Vulnerability Trace" owner={owner} repo={repo} branch={branch} risk={data.repo_risk} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <KPICard icon={FileCode} label="Files Scanned" value={data.scanned_files ?? 0} color="text-secondary" />
               <KPICard icon={FileWarning} label="Vulnerable Files" value={data.vulnerable_files ?? 0} color={(data.vulnerable_files ?? 0) > 0 ? "text-red-400" : "text-emerald-400"} />
               <KPICard icon={CheckCircle2} label="Safe Files" value={data.safe_files ?? 0} color="text-emerald-400" />
               <KPICard icon={TrendingUp} label="Weighted Risk Score" value={`${((data.repo_risk_score ?? 0) * 100).toFixed(1)}%`} color={(data.repo_risk_score ?? 0) > 0.5 ? "text-red-400" : "text-emerald-400"} />
            </div>
            <SourceCodeDistribution safe={data.safe_files} vulnerable={data.vulnerable_files} total={data.scanned_files} />
            <SourceList results={data.results} />
        </motion.div>
    );
}

// --------------------------------------------------------------------------------------
// FULL SCAN DASHBOARD
// --------------------------------------------------------------------------------------
function FullScanDashboard({ data, owner, repo, branch }: { data: FullScanResponse, owner: string, repo: string, branch: string }) {
    const [activeTab, setActiveTab] = useState<'overview' | 'commits' | 'source'>('overview');
    if (!data) return null;
    const ca = data.commit_analysis || { results: [], total_analyzed: 0, suspicious_count: 0 };
    const sc = data.source_code_scan || { results: [], scanned_files: 0, vulnerable_files: 0, repo_risk_score: 0 };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <ScanHeader title="Comprehensive Ecosystem Audit" owner={owner} repo={repo} branch={branch} risk={sc.repo_risk} />
            
            <div className="flex gap-2 p-2 bg-white/[0.02] border border-white/5 rounded-2xl inline-flex w-full md:w-auto overflow-x-auto no-scrollbar">
                {[
                    { key: 'overview' as const, label: 'Overview Metrics', icon: LayoutDashboard },
                    { key: 'commits' as const, label: 'Commit Intelligence', icon: GitBranch },
                    { key: 'source' as const, label: 'Source Integrity', icon: FileCode },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn(
                        "flex items-center gap-3 px-6 py-3.5 rounded-xl text-[10px] font-headline uppercase tracking-widest transition-all whitespace-nowrap border",
                        activeTab === tab.key 
                          ? "bg-primary/20 border-primary/40 text-primary shadow-[0_0_20px_rgba(38,114,255,0.15)]" 
                          : "text-muted-foreground border-transparent hover:text-white hover:bg-white/5"
                    )}>
                        <tab.icon className="h-4 w-4" /> {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <KPICard icon={Activity} label="Commits Analyzed" value={ca.total_analyzed ?? 0} color="text-white" />
                            <KPICard icon={AlertTriangle} label="Suspicious Commits" value={ca.suspicious_count ?? 0} color={(ca.suspicious_count ?? 0) > 0 ? "text-red-400" : "text-emerald-400"} />
                            <KPICard icon={FileWarning} label="Vulnerable Files" value={sc.vulnerable_files ?? 0} color={(sc.vulnerable_files ?? 0) > 0 ? "text-red-400" : "text-emerald-400"} />
                            <KPICard icon={TrendingUp} label="Aggregate Risk" value={`${((sc.repo_risk_score ?? 0) * 100).toFixed(1)}%`} color={(sc.repo_risk_score ?? 0) > 0.5 ? "text-red-400" : "text-emerald-400"} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SummaryModule title="Behavioural Synthesis" icon={GitBranch} color="primary" stats={[{label: "Total Blocks", value: ca.total_analyzed}, {label: "Anomalies", value: ca.suspicious_count, isBad: (ca.suspicious_count ?? 0) > 0}]} onDeepDive={() => setActiveTab('commits')} />
                            <SummaryModule title="Source Inventory" icon={FileCode} color="secondary" stats={[{label: "Files Parsed", value: sc.scanned_files}, {label: "Vulnerabilities", value: sc.vulnerable_files, isBad: (sc.vulnerable_files ?? 0) > 0}]} onDeepDive={() => setActiveTab('source')} />
                        </div>
                    </motion.div>
                )}
                {activeTab === 'commits' && <motion.div key="commits" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><CommitList results={ca.results} /></motion.div>}
                {activeTab === 'source'  && <motion.div key="source" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><SourceList results={sc.results} /></motion.div>}
            </AnimatePresence>
        </motion.div>
    );
}

// --------------------------------------------------------------------------------------
// SHARED UI COMPONENTS
// --------------------------------------------------------------------------------------

function ScanHeader({ title, owner, repo, branch, risk }: { title: string, owner: string, repo: string, branch: string, risk?: string }) {
    return (
        <div className="glass-panel p-10 rounded-[3rem] relative overflow-hidden shadow-2xl border-white/5 group hover:border-primary/20 transition-all duration-700">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-[200px] -mt-[200px] group-hover:bg-primary/10 transition-colors" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] -ml-[200px] -mb-[200px] group-hover:bg-secondary/10 transition-colors" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-headline tracking-[0.3em] text-muted-foreground uppercase">
                        <Layers className="h-3 w-3 text-primary" /> {title}
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter text-white mb-2 drop-shadow-lg flex flex-wrap items-center gap-x-4">
                            {owner && <span className="text-muted-foreground font-light">{owner}/</span>}
                            <span className="text-white">{repo}</span>
                        </h1>
                        <div className="flex items-center gap-3 mt-4">
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                                <GitBranch className="h-3 w-3 text-secondary" /> <span className="text-white/80 font-medium tracking-widest">{branch.toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                                <Shield className="h-3 w-3 text-primary" /> <span className="text-white/80 font-medium tracking-widest">v4.5.0_SECURE</span>
                            </div>
                        </div>
                    </div>
                </div>
                {risk && (
                    <div className="text-right space-y-3">
                        <div className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground">Ecosystem Risk Verdict</div>
                        <RiskBadge level={risk} large />
                    </div>
                )}
            </div>
        </div>
    );
}

function CommitList({ results }: { results: any[] }) {
    const [expandedHash, setExpandedHash] = useState<string | null>(null);
    if (!results || results.length === 0) return (
        <div className="p-12 text-center text-muted-foreground glass-panel rounded-3xl border-white/5 flex flex-col items-center gap-4">
            <Activity className="h-8 w-8 text-white/5" />
            <span className="font-headline text-[10px] tracking-widest uppercase">No commit telemetry detected in specified window.</span>
        </div>
    );
    
    return (
        <div className="glass-panel rounded-[2rem] overflow-hidden border-white/5">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-3">
                    <Hash className="h-5 w-5 text-primary" />
                    <span className="font-headline text-white font-bold text-sm tracking-widest uppercase">Analyzed Commits</span>
                </div>
                <span className="text-[10px] font-headline text-muted-foreground uppercase tracking-[0.2em]">{results.length} blocks mapped</span>
            </div>
            <div className="divide-y divide-white/5">
                {results.map((commit, i) => (
                    <div key={commit.commit_hash || i} className="group">
                        <div 
                            onClick={() => setExpandedHash(expandedHash === commit.commit_hash ? null : commit.commit_hash)} 
                            className="flex items-center gap-5 p-5 hover:bg-white/[0.02] cursor-pointer transition-all active:scale-[0.99]"
                        >
                            <div className={cn(
                                "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105", 
                                commit.suspicious ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            )}>
                                {commit.suspicious ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1.5">
                                    <code className="text-[10px] text-primary font-code bg-primary/5 px-2 py-0.5 rounded border border-primary/20">{commit.commit_hash?.substring(0, 8) || "NO_HASH"}</code>
                                    <span className="text-sm text-white font-medium truncate tracking-tight">{commit.subject}</span>
                                </div>
                                <div className="flex items-center gap-4 text-[9px] text-muted-foreground font-headline uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><Activity className="h-3 w-3" /> UID: {commit.author_id}</span>
                                    <span className="h-1 w-1 rounded-full bg-white/20" />
                                    <span>Sync_Index: #{i + 1}</span>
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <RiskBadge level={commit.risk_level} />
                            </div>
                            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-all duration-300", expandedHash === commit.commit_hash && "rotate-180 text-primary")} />
                        </div>
                        <AnimatePresence>
                            {expandedHash === commit.commit_hash && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }} 
                                    animate={{ height: "auto", opacity: 1 }} 
                                    exit={{ height: 0, opacity: 0 }} 
                                    className="overflow-hidden bg-white/[0.015] border-t border-white/5"
                                >
                                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-2">
                                            <div className="text-[9px] font-headline uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                                <Zap className="h-3 w-3 text-amber-500" /> Anomaly Probability
                                            </div>
                                            <div className="text-xl font-bold text-white font-headline tabular-nums leading-none">
                                                {(commit.probability * 100).toFixed(4)}%
                                            </div>
                                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${commit.probability * 100}%` }} className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-[9px] font-headline uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                                <ShieldAlert className="h-3 w-3 text-red-500" /> Suspicious Flag
                                            </div>
                                            <div className={cn("text-xl font-bold font-headline leading-none", commit.suspicious ? "text-red-400" : "text-emerald-400")}>
                                                {commit.suspicious ? "POSITIVE_HIT" : "NEGATIVE_HIT"}
                                            </div>
                                        </div>
                                        <div className="flex items-end justify-end">
                                            <button className="text-[10px] font-headline uppercase tracking-[0.2em] text-primary hover:text-white transition-colors flex items-center gap-2 group/link">
                                                View Raw Telemetry <ExternalLink className="h-3 w-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SourceList({ results }: { results: any[] }) {
    if (!results || results.length === 0) return (
        <div className="p-12 text-center text-muted-foreground glass-panel rounded-3xl border-white/5 flex flex-col items-center gap-4">
            <FileCode className="h-8 w-8 text-white/5" />
            <span className="font-headline text-[10px] tracking-widest uppercase">No source code vulnerabilities detected. Environment clean.</span>
        </div>
    );
    
    return (
        <div className="glass-panel rounded-[2rem] overflow-hidden border-white/5">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-3">
                    <FileCode className="h-5 w-5 text-secondary" />
                    <span className="font-headline text-white font-bold text-sm tracking-widest uppercase">Vulnerabilities Detected</span>
                </div>
                <span className="text-[10px] font-headline text-muted-foreground uppercase tracking-[0.2em]">{results.length} files flagged</span>
            </div>
            <div className="divide-y divide-white/5">
                {results.map((file, i) => (
                    <div key={file.filepath || i} className="flex flex-col md:flex-row md:items-center gap-5 p-5 hover:bg-white/[0.02] transition-colors group">
                        <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border group-hover:scale-105 transition-transform duration-300", 
                            file.prediction === 'VULNERABLE' ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        )}>
                            {file.prediction === 'VULNERABLE' ? <ShieldAlert className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-white font-medium truncate tracking-tight">{file.filename}</span>
                                <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-muted-foreground font-code uppercase tracking-widest">{file.language}</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex-1 max-w-[240px]">
                                    <ProbabilityBar value={file.vulnerable_probability} label="Vulnerability Risk" />
                                </div>
                                <span className="text-[9px] text-muted-foreground/60 font-headline tabular-nums uppercase tracking-widest">
                                    {(file.confidence * 100).toFixed(1)}% Confidence
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                            <RiskBadge level={file.risk_level} />
                            <button className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all">
                                <ExternalLink className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SourceCodeDistribution({ safe, vulnerable, total }: { safe: number, vulnerable: number, total: number }) {
    const safePct = (safe / Math.max(total, 1)) * 100;
    const vulnerablePct = (vulnerable / Math.max(total, 1)) * 100;
    
    return (
        <div className="glass-panel p-8 rounded-[2rem] border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <LayoutDashboard className="h-24 w-24 text-white" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 w-full space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="text-[10px] font-headline uppercase tracking-[0.3em] text-muted-foreground">Ecosystem Security Profile</div>
                        <div className="text-xs font-headline text-white font-bold">{total} Files Total</div>
                    </div>
                    <div className="flex h-5 rounded-full overflow-hidden bg-white/5 border border-white/5 p-1">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${safePct}%` }} transition={{ duration: 1.5, ease: "circOut" }} className="bg-emerald-500/80 h-full rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                        <motion.div initial={{ width: 0 }} animate={{ width: `${vulnerablePct}%` }} transition={{ duration: 1.5, delay: 0.3, ease: "circOut" }} className="bg-red-500/80 h-full rounded-full shadow-[0_0_15px_rgba(239,68,68,0.3)] ml-1" />
                    </div>
                    <div className="flex flex-wrap gap-8 text-[9px] font-headline uppercase tracking-[0.2em] text-muted-foreground">
                        <span className="flex items-center gap-2 group/item"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> <span className="group-hover/item:text-white transition-colors">Nominal Files ({safe}) — {safePct.toFixed(1)}%</span></span>
                        <span className="flex items-center gap-2 group/item"><span className="h-2 w-2 rounded-full bg-red-500" /> <span className="group-hover/item:text-white transition-colors">Vulnerable Paths ({vulnerable}) — {vulnerablePct.toFixed(1)}%</span></span>
                    </div>
                </div>
                <div className="shrink-0 flex items-center justify-center p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                    <div className="text-center">
                        <div className="text-[10px] font-headline text-muted-foreground uppercase tracking-widest mb-1">Health Score</div>
                        <div className="text-4xl font-bold font-headline text-white glow-white">{safePct.toFixed(0)}%</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryModule({ title, icon: Icon, color, stats, onDeepDive }: { title: string, icon: any, color: 'primary' | 'secondary', stats: any[], onDeepDive: () => void }) {
    return (
        <div className="glass-panel p-8 rounded-[2.5rem] space-y-8 border-white/5 hover:border-white/10 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
            <div className="flex items-center gap-4">
                <div className={cn("p-4 rounded-2xl border", color === 'primary' ? "bg-primary/10 border-primary/20 text-primary shadow-[0_0_15px_rgba(38,114,255,0.2)]" : "bg-secondary/10 border-secondary/20 text-secondary shadow-[0_0_15px_rgba(58,203,224,0.2)]")}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="font-headline text-white font-bold text-xl tracking-tight uppercase">{title}</h3>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {stats.map((s, i) => (
                    <div key={i} className={cn("bg-white/[0.02] rounded-2xl p-5 border transition-all duration-300 group-hover:bg-white/[0.04]", s.isBad ? "border-red-500/20 bg-red-500/5" : "border-white/5")}>
                        <div className="text-[9px] font-headline uppercase tracking-widest text-muted-foreground/60 mb-3">{s.label}</div>
                        <div className={cn("text-3xl font-bold font-headline tabular-nums", s.isBad ? "text-red-400" : "text-white")}>{s.value ?? 0}</div>
                    </div>
                ))}
            </div>
            <button 
                onClick={onDeepDive} 
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-primary cursor-pointer text-[10px] font-headline tracking-[0.3em] uppercase p-4 rounded-xl transition-all text-muted-foreground active:scale-[0.98] group/btn"
            >
                Start Deep Dive Trace <ArrowLeft className="h-3 w-3 inline ml-2 rotate-180 group-hover/btn:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}

function KPICard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            whileHover={{ y: -5, scale: 1.02 }} 
            className="glass-panel p-7 rounded-[2rem] border-white/5 relative overflow-hidden group shadow-xl active:scale-[0.98] transition-all"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-2.5 rounded-xl bg-white/5 border border-white/10", color)}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className={cn("h-2 w-2 rounded-full animate-pulse shadow-[0_0_8px_currentColor]", color.includes('red') ? 'text-red-400 bg-red-400' : color.includes('emerald') ? 'text-emerald-400 bg-emerald-400' : color.includes('amber') ? 'text-amber-400 bg-amber-400' : 'text-primary bg-primary')} />
            </div>
            <div className={cn("text-4xl font-bold font-headline mb-2 tabular-nums tracking-tighter", color)}>{value}</div>
            <div className="text-[9px] font-headline uppercase text-muted-foreground/60 tracking-[0.2em] leading-tight group-hover:text-white transition-colors uppercase">{label}</div>
        </motion.div>
    );
}

function RiskBadge({ level, large = false }: { level: string, large?: boolean }) {
    const config = {
        LOW: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
        MEDIUM: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-400' },
        HIGH: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-400' },
    }[level.toUpperCase()] || { bg: 'bg-white/5', border: 'border-white/10', text: 'text-white/60', dot: 'bg-white/40' };
    
    return (
        <span className={cn(
            "inline-flex items-center gap-2 rounded-full font-headline uppercase tracking-widest border transition-all duration-300", 
            large ? "px-6 py-2.5 text-xs font-bold shadow-lg" : "px-3 py-1 text-[9px]",
            config.bg, config.border, config.text
        )}>
            <span className={cn("rounded-full animate-pulse shadow-[0_0_5px_currentColor]", large ? "h-2 w-2" : "h-1.5 w-1.5", config.dot)} />
            {level}
        </span>
    );
}

function ProbabilityBar({ value, label }: { value: number, label?: string }) {
    const pct = Math.min(value * 100, 100);
    return (
        <div className="space-y-1.5">
            {label && <div className="text-[8px] font-headline uppercase tracking-widest text-muted-foreground/40">{label}</div>}
            <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${pct}%` }} 
                    transition={{ duration: 1.2, ease: "easeOut" }} 
                    className={cn(
                        "h-full rounded-full transition-all duration-500", 
                        pct > 50 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : pct > 20 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    )} 
                />
            </div>
        </div>
    );
}
