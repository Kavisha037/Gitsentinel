import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, GitBranch, FileCode, CheckCircle2, AlertTriangle, ChevronDown, 
    Hash, ShieldAlert, ShieldCheck, Activity, TrendingUp, FileWarning, ArrowLeft, Layers 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnalyseResponse, SourceCodeResponse, FullScanResponse } from '@/services/api';

type ScanMode = 'commit' | 'code' | 'full';

export function ScanResultsView({ 
    data, 
    mode, 
    onReset 
}: { 
    data: any; 
    mode: ScanMode; 
    onReset: () => void; 
}) {
    return (
        <div className="relative min-h-screen flex flex-col items-center p-6 overflow-x-hidden pt-12">
            <div className="max-w-7xl w-full relative z-10">
                <div className="flex items-center justify-between mb-10">
                    <button onClick={onReset} className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm font-headline uppercase tracking-widest glass-panel px-6 py-2 rounded-xl border border-white/10 hover:border-white/30">
                        <ArrowLeft className="h-4 w-4" /> New Audit
                    </button>
                    <div className="text-[10px] font-headline uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" /> SECURE TRACE COMPLETE
                    </div>
                </div>

                {mode === 'commit' && <CommitDashboard data={data as AnalyseResponse} />}
                {mode === 'code' && <SourceCodeDashboard data={data as SourceCodeResponse} />}
                {mode === 'full' && <FullScanDashboard data={data as FullScanResponse} />}
            </div>
        </div>
    );
}

// --------------------------------------------------------------------------------------
// COMMIT DASHBOARD
// --------------------------------------------------------------------------------------
function CommitDashboard({ data }: { data: AnalyseResponse }) {
    if (!data) return null;
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <ScanHeader title="Commit Behaviour Audit" repo={data.repo} branch={data.branch} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPICard icon={Activity} label="Commits Analyzed" value={data.total_analyzed ?? 0} color="text-primary" />
                <KPICard icon={AlertTriangle} label="Suspicious Commits" value={data.suspicious_count ?? 0} color={(data.suspicious_count ?? 0) > 0 ? "text-red-400" : "text-emerald-400"} />
            </div>
            <CommitList results={data.results} />
        </motion.div>
    );
}

// --------------------------------------------------------------------------------------
// SOURCE CODE DASHBOARD
// --------------------------------------------------------------------------------------
function SourceCodeDashboard({ data }: { data: SourceCodeResponse }) {
    if (!data) return null;
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <ScanHeader title="Source Vulnerability Trace" repo={data.repo} branch={data.branch} risk={data.repo_risk} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <KPICard icon={FileCode} label="Files Scanned" value={data.scanned_files ?? 0} color="text-secondary" />
               <KPICard icon={FileWarning} label="Vulnerable Files" value={data.vulnerable_files ?? 0} color={(data.vulnerable_files ?? 0) > 0 ? "text-red-400" : "text-emerald-400"} />
               <KPICard icon={CheckCircle2} label="Safe Files" value={data.safe_files ?? 0} color="text-emerald-400" />
               <KPICard icon={TrendingUp} label="Risk Score" value={`${((data.repo_risk_score ?? 0) * 100).toFixed(1)}%`} color={(data.repo_risk_score ?? 0) > 0.5 ? "text-red-400" : "text-emerald-400"} />
            </div>
            <SourceCodeDistribution safe={data.safe_files} vulnerable={data.vulnerable_files} total={data.scanned_files} />
            <SourceList results={data.results} />
        </motion.div>
    );
}

// --------------------------------------------------------------------------------------
// FULL SCAN DASHBOARD
// --------------------------------------------------------------------------------------
function FullScanDashboard({ data }: { data: FullScanResponse }) {
    const [activeTab, setActiveTab] = useState<'overview' | 'commits' | 'source'>('overview');
    if (!data) return null;
    const ca = data.commit_analysis || { results: [] };
    const sc = data.source_code_scan || { results: [] };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <ScanHeader title="Full Security Audit Report" repo={data.repo} branch={data.branch} risk={sc.repo_risk} />
            
            <div className="flex gap-2 p-2 bg-white/[0.02] border border-white/5 rounded-2xl inline-flex w-full md:w-auto overflow-x-auto">
                {[
                    { key: 'overview' as const, label: 'Overview Dashboard', icon: LayoutDashboard },
                    { key: 'commits' as const, label: 'Commit Intelligence', icon: GitBranch },
                    { key: 'source' as const, label: 'Source Vulnerabilities', icon: FileCode },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn(
                        "flex items-center gap-2 px-6 py-4 rounded-xl text-xs font-headline uppercase tracking-widest transition-all whitespace-nowrap",
                        activeTab === tab.key ? "bg-primary/20 border border-primary/40 text-primary shadow-lg" : "text-muted-foreground hover:text-white hover:bg-white/5"
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
                            <KPICard icon={TrendingUp} label="Repo Risk Score" value={`${((sc.repo_risk_score ?? 0) * 100).toFixed(1)}%`} color={(sc.repo_risk_score ?? 0) > 0.5 ? "text-red-400" : "text-emerald-400"} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SummaryModule title="Behavioural Intel" icon={GitBranch} color="primary" stats={[{label: "Total Extracted", value: ca.total_analyzed}, {label: "Flagged Anomalies", value: ca.suspicious_count, isBad: (ca.suspicious_count ?? 0) > 0}]} onDeepDive={() => setActiveTab('commits')} />
                            <SummaryModule title="Source Structure" icon={FileCode} color="secondary" stats={[{label: "Files Scanned", value: sc.scanned_files}, {label: "Vulnerable Paths", value: sc.vulnerable_files, isBad: (sc.vulnerable_files ?? 0) > 0}]} onDeepDive={() => setActiveTab('source')} />
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

function ScanHeader({ title, repo, branch, risk }: { title: string, repo: string, branch: string, risk?: string }) {
    return (
        <div className="glass-panel p-10 rounded-[3rem] relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-[200px] -mt-[200px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] -ml-[200px] -mb-[200px]" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 text-[10px] font-headline tracking-[0.3em] text-muted-foreground uppercase mb-4">
                        <Layers className="h-3 w-3 text-primary" /> {title}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter text-white mb-4 drop-shadow-lg">{repo}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground bg-white/5 px-4 py-2 rounded-xl border border-white/10 inline-flex">
                        <GitBranch className="h-4 w-4 text-secondary" /> <span className="text-white font-medium">{branch}</span>
                    </div>
                </div>
                {risk && (
                    <div className="text-right">
                        <div className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground mb-2">Final Risk Verdict</div>
                        <RiskBadge level={risk} />
                    </div>
                )}
            </div>
        </div>
    );
}

function CommitList({ results }: { results: any[] }) {
    const [expandedHash, setExpandedHash] = useState<string | null>(null);
    if (!results || results.length === 0) return <div className="p-8 text-center text-muted-foreground glass-panel rounded-3xl">No commit data available.</div>;
    return (
        <div className="glass-panel rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Hash className="h-5 w-5 text-primary" />
                    <span className="font-headline text-white font-bold">Analyzed Commits</span>
                </div>
                <span className="text-[10px] font-headline text-muted-foreground uppercase tracking-widest">{results.length} mapped</span>
            </div>
            <div className="divide-y divide-white/5">
                {results.map((commit, i) => (
                    <div key={commit.commit_hash || i} className="group">
                        <div onClick={() => setExpandedHash(expandedHash === commit.commit_hash ? null : commit.commit_hash)} className="flex items-center gap-4 p-5 hover:bg-white/[0.02] cursor-pointer transition-colors">
                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border", commit.suspicious ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20")}>
                                {commit.suspicious ? <AlertTriangle className="h-5 w-5 text-red-400" /> : <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <code className="text-xs text-primary font-code">{commit.commit_hash.substring(0, 8)}</code>
                                    <span className="text-sm text-white font-medium truncate">{commit.subject}</span>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-headline uppercase tracking-widest">
                                    <span>Author: {commit.author_id}</span>
                                </div>
                            </div>
                            <RiskBadge level={commit.risk_level} />
                            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", expandedHash === commit.commit_hash && "rotate-180")} />
                        </div>
                        <AnimatePresence>
                            {expandedHash === commit.commit_hash && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white/[0.01] border-t border-white/5">
                                    <div className="p-6 grid grid-cols-2 gap-4">
                                        <div className="space-y-1"><div className="text-[9px] font-headline uppercase tracking-widest text-muted-foreground">Probability</div><div className="text-sm text-white">{(commit.probability * 100).toFixed(4)}%</div></div>
                                        <div className="space-y-1"><div className="text-[9px] font-headline uppercase tracking-widest text-muted-foreground">Suspicious</div><div className={cn("text-sm font-bold", commit.suspicious ? "text-red-400" : "text-white")}>{commit.suspicious ? "YES" : "NO"}</div></div>
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
    if (!results || results.length === 0) return <div className="p-8 text-center text-muted-foreground glass-panel rounded-3xl">No source code data available.</div>;
    return (
        <div className="glass-panel rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FileCode className="h-5 w-5 text-secondary" />
                    <span className="font-headline text-white font-bold">Vulnerabilities Detected</span>
                </div>
                <span className="text-[10px] font-headline text-muted-foreground uppercase tracking-widest">{results.length} files</span>
            </div>
            <div className="divide-y divide-white/5">
                {results.map((file, i) => (
                    <div key={file.filepath || i} className="flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors">
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border", file.prediction === 'VULNERABLE' ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20")}>
                            {file.prediction === 'VULNERABLE' ? <ShieldAlert className="h-5 w-5 text-red-400" /> : <ShieldCheck className="h-5 w-5 text-emerald-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-sm text-white font-medium truncate">{file.filename}</span>
                                <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-muted-foreground font-code uppercase">{file.language}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 max-w-[200px]">
                                    <ProbabilityBar value={file.vulnerable_probability} />
                                </div>
                                <span className="text-[10px] text-muted-foreground font-headline tabular-nums">
                                    {(file.confidence * 100).toFixed(1)}% confidence
                                </span>
                            </div>
                        </div>
                        <RiskBadge level={file.risk_level} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function SourceCodeDistribution({ safe, vulnerable, total }: { safe: number, vulnerable: number, total: number }) {
    return (
        <div className="glass-panel p-6 rounded-[2rem]">
            <div className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground mb-4">Code Security Distribution</div>
            <div className="flex h-4 rounded-full overflow-hidden bg-white/5">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(safe / Math.max(total, 1)) * 100}%` }} transition={{ duration: 1 }} className="bg-emerald-500 h-full" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${(vulnerable / Math.max(total, 1)) * 100}%` }} transition={{ duration: 1, delay: 0.3 }} className="bg-red-500 h-full" />
            </div>
            <div className="flex gap-6 mt-3 text-[9px] font-headline uppercase tracking-widest text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Safe ({safe})</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Vulnerable ({vulnerable})</span>
            </div>
        </div>
    );
}

function SummaryModule({ title, icon: Icon, color, stats, onDeepDive }: { title: string, icon: any, color: 'primary' | 'secondary', stats: any[], onDeepDive: () => void }) {
    return (
        <div className="glass-panel p-8 rounded-[2rem] space-y-6">
            <div className="flex items-center gap-3">
                <div className={cn("p-3 rounded-xl border", color === 'primary' ? "bg-primary/10 border-primary/20 text-primary" : "bg-secondary/10 border-secondary/20 text-secondary")}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-headline text-white font-bold text-lg">{title}</h3>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {stats.map((s, i) => (
                    <div key={i} className={cn("bg-white/[0.03] rounded-2xl p-4 border transition-colors", s.isBad ? "border-red-500/30 bg-red-500/5" : "border-white/5")}>
                        <div className="text-[8px] font-headline uppercase tracking-widest text-muted-foreground mb-2">{s.label}</div>
                        <div className={cn("text-2xl font-bold font-headline tabular-nums", s.isBad ? "text-red-400" : "text-white")}>{s.value ?? 0}</div>
                    </div>
                ))}
            </div>
            <button onClick={onDeepDive} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer text-[10px] font-headline tracking-widest uppercase p-3 rounded-xl transition-colors text-white">
                Deep Dive
            </button>
        </div>
    );
}

function KPICard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3, scale: 1.02 }} className="glass-panel p-6 rounded-3xl border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-4">
                <Icon className={cn("h-5 w-5", color)} />
                <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", color.includes('red') ? 'bg-red-400' : color.includes('emerald') ? 'bg-emerald-400' : 'bg-secondary')} />
            </div>
            <div className={cn("text-3xl font-bold font-headline mb-2 tabular-nums", color)}>{value}</div>
            <div className="text-[9px] font-headline uppercase text-muted-foreground tracking-widest leading-tight">{label}</div>
        </motion.div>
    );
}

function RiskBadge({ level }: { level: string }) {
    const config = {
        LOW: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
        MEDIUM: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-400' },
        HIGH: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-400' },
    }[level] || { bg: 'bg-white/5', border: 'border-white/10', text: 'text-white', dot: 'bg-white' };
    return (
        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-headline uppercase tracking-widest border", config.bg, config.border, config.text)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />{level}
        </span>
    );
}

function ProbabilityBar({ value }: { value: number }) {
    const pct = Math.min(value * 100, 100);
    return (
        <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className={cn("h-full rounded-full", pct > 50 ? "bg-red-500" : pct > 20 ? "bg-amber-500" : "bg-emerald-500")} />
        </div>
    );
}
