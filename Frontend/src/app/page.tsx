"use client";

import { useState, useEffect } from 'react';
import { runAnalyse, runSourceCodeScan, runFullScan } from '@/services/api';
import { ScanResultsView } from '@/components/scan/ScanResultsView';
import ImmersiveScanner from '@/components/scan/ImmersiveScanner';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Shield, Zap, Search, Github, Activity, Globe, 
  LayoutDashboard, Cpu, Database, 
  TrendingUp, Network, Box, AlertTriangle, Lock,
  GitBranch, List, Key, User as UserIcon, CheckCircle2, Star, Code, GitCommit,
  ArrowRight, ShieldCheck, FileText, Fingerprint
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useUser, useFirestore } from '@/firebase';
import { useAuthModals } from '@/components/auth/AuthModalManager';
import { saveScanRecord, getUserScanStats, UserStats } from '@/services/scan-history';

type ScanMode = 'commit' | 'code' | 'full';

export default function Home() {
  const [scanMode, setScanMode] = useState<ScanMode>('commit');
  const [formData, setFormData] = useState({
    owner: '',
    repo: '',
    branch: 'main',
    last_Commit: 20,
    token: ''
  });
  const [result, setResult] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerComplete, setScannerComplete] = useState(false);
  const [isFormFocused, setIsFormFocused] = useState(false);
  const router = useRouter();
  
  const { user } = useUser();
  const firestore = useFirestore();
  const { openSignup } = useAuthModals();

  const [stats, setStats] = useState<UserStats | { reposScanned: number, threatsDetected: number, activeNodes: number }>({ 
    reposScanned: 2, 
    threatsDetected: 1, 
    activeNodes: 1 
  });

  useEffect(() => {
    setMounted(true);
    
    // If not logged in, maintain dummy random stats
    if (!user) {
      const interval = setInterval(() => {
        setStats(prev => ({
          reposScanned: prev.reposScanned + Math.floor(Math.random() * 3),
          threatsDetected: prev.threatsDetected + (Math.random() > 0.8 ? 1 : 0),
          activeNodes: 120 + Math.floor(Math.random() * 10)
        }));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch real stats when user logs in
  useEffect(() => {
    async function loadStats() {
      if (user && firestore) {
        const userStats = await getUserScanStats(firestore, user.uid);
        setStats(userStats);
      }
    }
    loadStats();
  }, [user, firestore]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      x.set((e.clientX / window.innerWidth) - 0.5);
      y.set((e.clientY / window.innerHeight) - 0.5);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.owner || !formData.repo || !formData.token) return;

    // Gated Access Check
    if (!user) {
      openSignup();
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setShowScanner(true);
    setScannerComplete(false);

    try {
      let data;
      let threats = 0;
      let nodes = 0;

      if (scanMode === 'commit') {
        data = await runAnalyse({ owner: formData.owner, repo: formData.repo, branch: formData.branch, last_n: formData.last_Commit, token: formData.token });
        threats = data.suspicious_count;
        nodes = data.total_analyzed;
      } else if (scanMode === 'code') {
        data = await runSourceCodeScan({ owner: formData.owner, repo: formData.repo, branch: formData.branch, token: formData.token });
        threats = data.vulnerable_files;
        nodes = data.scanned_files;
      } else {
        data = await runFullScan({ owner: formData.owner, repo: formData.repo, branch: formData.branch, last_n: formData.last_Commit, token: formData.token });
        threats = (data.commit_analysis?.suspicious_count || 0) + (data.source_code_scan?.vulnerable_files || 0);
        nodes = (data.commit_analysis?.total_analyzed || 0) + (data.source_code_scan?.scanned_files || 0);
      }
      
      setResult(data);
      
      // Save scan record if user is logged in
      if (user && firestore) {
        await saveScanRecord(firestore, user.uid, {
          repoOwner: formData.owner,
          repoName: formData.repo,
          branch: formData.branch,
          scanMode: scanMode,
          threatsDetected: threats,
          nodesAnalyzed: 1 // SET 1 TO ACTIVE NODES as requested
        });
        
        // Refresh stats
        const updatedStats = await getUserScanStats(firestore, user.uid);
        setStats(updatedStats);
      }
    } catch (err: any) {
      setApiError(err.message || "Failed to audit repository");
      setShowScanner(false);
      setScannerComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isReady = !!(formData.owner && formData.repo && formData.token);

  if (!mounted) return null;

  if (result && scannerComplete) {
    return (
      <ScanResultsView 
        data={result} 
        mode={scanMode} 
        owner={formData.owner}
        repo={formData.repo}
        branch={formData.branch}
        onReset={async () => {
          setResult(null);
          setShowScanner(false);
          setScannerComplete(false);
          setFormData({
            owner: '',
            repo: '',
            branch: 'main',
            last_Commit: 20,
            token: ''
          });
          setApiError(null);
          
          // Refresh stats one more time to be absolutely sure when returning to home
          if (user && firestore) {
            const updatedStats = await getUserScanStats(firestore, user.uid);
            setStats(updatedStats);
          }
        }} 
      />
    );
  }

  if (showScanner) {
    return (
      <div className="min-h-screen bg-[#050608] selection:bg-primary/30">
        <ImmersiveScanner 
          mode="repo"
          scanMode={scanMode}
          owner={formData.owner} 
          target={formData.repo} 
          onComplete={() => setScannerComplete(true)} 
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start p-6 overflow-x-hidden">
      <div className="max-w-6xl w-full text-center space-y-12 relative z-10 pt-20 pb-32">
        <motion.div 
          style={{ rotateX, rotateY }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 perspective-1000"
        >
          <div className="relative inline-block group">
            <h1 className="text-7xl md:text-9xl font-bold font-headline tracking-tighter text-white drop-shadow-2xl transition-all duration-500">
              GIT<span className="text-primary italic inline-block transform -skew-x-12 neon-text-primary">SENTINEL</span>
            </h1>
            <div className="pulse-line mx-auto mt-2" />
          </div>
          
          <p className="text-xl md:text-2xl text-muted-foreground font-body max-w-3xl mx-auto leading-relaxed">
            <span className="shimmer-text">Detect hidden risks in GitHub repositories before they become real security threats.</span> 
          </p>
        </motion.div>

        {/* Live Intelligence Layer */}
        {user && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap justify-center gap-8 text-[10px] font-headline tracking-widest uppercase text-muted-foreground/60"
          >
            <StatItem label="Repos Scanned" value={stats.reposScanned.toLocaleString()} icon={Database} />
            <StatItem label="Threats Detected" value={stats.threatsDetected.toLocaleString()} icon={Shield} />
            <StatItem label="Active Nodes" value={stats.activeNodes.toLocaleString()} icon={Network} />
          </motion.div>
        )}

        {/* Multi-Input Form */}
        <motion.form 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onSubmit={handleSearch} 
          className="max-w-4xl mx-auto space-y-8 relative"
        >
          {/* Scan Mode Toggles */}
          <div className="flex justify-center gap-4 mb-8">
            <ScanModeButton 
              active={scanMode === 'commit'} 
              onClick={() => setScanMode('commit')} 
              label="Commit Analysis" 
              icon={GitCommit}
            />
            <ScanModeButton 
              active={scanMode === 'code'} 
              onClick={() => setScanMode('code')} 
              label="Code Analysis" 
              icon={Code}
            />
            <ScanModeButton 
              active={scanMode === 'full'} 
              onClick={() => setScanMode('full')} 
              label="FULL SCAN ⭐" 
              icon={Star}
              special
            />
          </div>

          <div className="relative group perspective-1000">
            <div className={cn(
              "absolute -inset-[1px] rounded-3xl blur-sm transition-all duration-700",
              isReady 
                ? scanMode === 'commit' ? "bg-primary/40" 
                  : scanMode === 'code' ? "bg-secondary/40" 
                  : "bg-amber-500/40"
                : "bg-white/5"
            )} />
            
            <motion.div 
              whileHover={{ y: -5 }}
              className={cn(
                "relative p-8 shadow-2xl overflow-hidden rounded-[2rem] backdrop-blur-3xl border transition-all duration-500 bg-card/60",
                isReady 
                  ? scanMode === 'commit' ? "border-primary/30" 
                    : scanMode === 'code' ? "border-secondary/30" 
                    : "border-amber-500/30"
                  : "border-white/5"
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Owner */}
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <UserIcon className="h-3 w-3 text-primary" /> Repository Owner
                  </label>
                  <Input 
                    value={formData.owner}
                    onChange={(e) => updateField('owner', e.target.value)}
                    placeholder="e.g., alex"
                    className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl h-12 text-white font-body"
                    onFocus={() => setIsFormFocused(true)}
                    onBlur={() => setIsFormFocused(false)}
                  />
                </div>

                {/* Repo */}
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Github className="h-3 w-3 text-secondary" /> Repository Name
                  </label>
                  <Input 
                    value={formData.repo}
                    onChange={(e) => updateField('repo', e.target.value)}
                    placeholder="e.g., linux"
                    className="bg-white/5 border-white/10 focus:border-secondary/50 rounded-xl h-12 text-white font-body"
                    onFocus={() => setIsFormFocused(true)}
                    onBlur={() => setIsFormFocused(false)}
                  />
                </div>

                {/* Branch */}
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <GitBranch className="h-3 w-3 text-primary" /> Audit Branch
                  </label>
                  <Input 
                    value={formData.branch}
                    onChange={(e) => updateField('branch', e.target.value)}
                    placeholder="main"
                    className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl h-12 text-white font-body"
                    onFocus={() => setIsFormFocused(true)}
                    onBlur={() => setIsFormFocused(false)}
                  />
                </div>

                {/* Last Commit */}
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <List className="h-3 w-3 text-secondary" /> Analysis Depth (Commits)
                  </label>
                  <Input 
                    type="number"
                    value={formData.last_Commit}
                    onChange={(e) => updateField('last_Commit', parseInt(e.target.value))}
                    className="bg-white/5 border-white/10 focus:border-secondary/50 rounded-xl h-12 text-white font-body"
                    onFocus={() => setIsFormFocused(true)}
                    onBlur={() => setIsFormFocused(false)}
                  />
                </div>

                {/* Token */}
                <div className="lg:col-span-2 space-y-2 text-left">
                  <label className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Key className="h-3 w-3 text-primary" /> Auth Token
                  </label>
                  <Input 
                    type="password"
                    value={formData.token}
                    onChange={(e) => updateField('token', e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxx"
                    className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl h-12 text-white font-body"
                    onFocus={() => setIsFormFocused(true)}
                    onBlur={() => setIsFormFocused(false)}
                  />
                </div>
              </div>

              {apiError && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 text-destructive text-sm flex items-center gap-3 mt-6">
                  <AlertTriangle className="h-5 w-5 shrink-0" /> {apiError}
                </motion.div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading || !isReady}
                className={cn(
                  "w-full mt-8 h-16 rounded-2xl transition-all duration-300 relative overflow-hidden group/btn font-headline tracking-[0.2em] uppercase text-sm",
                  isReady 
                    ? scanMode === 'commit' ? "bg-primary hover:bg-primary/90 text-white glow-primary"
                      : scanMode === 'code' ? "bg-secondary hover:bg-secondary/90 text-black shadow-[0_0_30px_rgba(58,203,224,0.3)]"
                      : "bg-amber-500 hover:bg-amber-600 text-black shadow-[0_0_40px_rgba(245,158,11,0.4)]"
                    : "bg-white/10 text-white/40 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <Activity className="h-6 w-6 animate-spin" />
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <Search className="h-5 w-5" /> START {scanMode.toUpperCase()} AUDIT
                  </span>
                )}
              </Button>
            </motion.div>

            <AnimatePresence>
              {isReady && !isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute -bottom-12 left-0 right-0 flex justify-center"
                >
                  <div className={cn(
                    "flex gap-2 items-center px-6 py-1.5 rounded-full glass-panel text-[9px] font-headline uppercase tracking-widest border shadow-xl",
                    scanMode === 'commit' ? "border-primary/40 text-primary bg-primary/5" 
                      : scanMode === 'code' ? "border-secondary/40 text-secondary bg-secondary/5"
                      : "border-amber-500/40 text-amber-500 bg-amber-500/5"
                  )}>
                    <CheckCircle2 className="h-3 w-3" /> {scanMode.toUpperCase()}_AUDIT_READY
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.form>

        {/* Demo Widget */}
        <div className="pt-24">
          <DemoWidget />
        </div>

        {/* Interactive Holographic Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20">
          <FeatureCard 
            icon={LayoutDashboard}
            title="Behavioral Audit"
            desc="Deep analysis of contributor activity and cross-repo interactions."
            color="primary"
          />
          <FeatureCard 
            icon={Zap}
            title="Real-time Scoring"
            desc="Dynamic risk scoring based on changes from normal activity."
            color="secondary"
          />
          <FeatureCard 
            icon={Shield}
            title="Threat Intel"
            desc="Automatic detection of risky patterns and dependency issues."
            color="white"
          />
        </div>

        {/* Audit Cycle Section */}
        <section className="pt-32 pb-20 space-y-16">
          <div className="text-center space-y-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold font-headline tracking-tighter text-white uppercase"
            >
              AUDIT <span className="text-primary italic">CYCLE</span>
            </motion.h2>
            <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
            <p className="text-muted-foreground uppercase tracking-[0.3em] text-[10px] font-headline">How it works</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <AuditStep 
              step="01"
              icon={Globe}
              title="CONNECT DATA"
              desc="Securely connect to your GitHub or GitLab repositories to start the security audit."
            />
            <AuditStep 
              step="02"
              icon={Fingerprint}
              title="ANALYZE PATTERNS"
              desc="We map contributor activity against historical data to spot unusual changes."
            />
            <AuditStep 
              step="03"
              icon={Cpu}
              title="IDENTIFY THREATS"
              desc="The engine detects suspicious code changes, dependency risks, and workflow drift."
            />
            <AuditStep 
              step="04"
              icon={ShieldCheck}
              title="GET RESULTS"
              desc="Get a clear risk report with prioritized steps to secure your repository."
              isLast
            />
          </div>
        </section>
      </div>
      
      <footer className="w-full max-w-6xl mx-auto py-12 px-6 border-t border-white/5 mt-20 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[10px] font-headline uppercase tracking-[0.5em] text-muted-foreground/40">
            GITSENTINEL CORE • V4.5.0_STABLE
          </div>
          <div className="flex gap-8 text-[10px] font-headline tracking-widest uppercase text-muted-foreground/60">
            <Link href="#" className="hover:text-white transition-colors">Source</Link>
            <Link href="#" className="hover:text-white transition-colors">About</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AuditStep({ step, icon: Icon, title, desc, isLast }: { step: string, icon: any, title: string, desc: string, isLast?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: parseInt(step) * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
      className="glass-panel p-8 rounded-3xl text-left border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 text-4xl font-bold font-headline text-white/5 group-hover:text-primary/10 transition-colors">
        {step}
      </div>
      <div className="p-4 rounded-2xl bg-primary/5 inline-block mb-6 group-hover:bg-primary/10 transition-all duration-300">
        <Icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
      </div>
      <h3 className="text-lg font-headline font-bold mb-3 text-white tracking-tighter group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed transition-colors group-hover:text-white/80">{desc}</p>
      
      {!isLast && (
        <div className="hidden md:flex absolute top-1/2 -right-4 translate-x-1/2 z-20 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
           <div className="w-8 h-[1px] bg-gradient-to-r from-primary to-transparent" />
           <ArrowRight className="h-5 w-5 text-primary -ml-2" />
        </div>
      )}

      {/* Background soft glow on hover */}
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] transition-colors pointer-events-none" />
    </motion.div>
  );
}

function ScanModeButton({ active, onClick, label, icon: Icon, special }: { active: boolean, onClick: () => void, label: string, icon: any, special?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-3 rounded-2xl font-headline text-[10px] tracking-widest uppercase transition-all duration-300 border",
        active 
          ? special 
            ? "bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
            : "bg-white/10 text-white border-white/20"
          : "bg-white/5 text-muted-foreground border-transparent hover:bg-white/10"
      )}
    >
      <Icon className={cn("h-4 w-4", active && special ? "text-black" : active ? "text-primary" : "text-muted-foreground")} />
      {label}
    </button>
  );
}

function StatItem({ label, value, icon: Icon }: { label: string, value: string, icon: any }) {
  return (
    <div className="flex items-center gap-3 group">
      <Icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
      <div className="flex flex-col items-start">
        <span className="text-[8px] text-muted-foreground/40">{label}</span>
        <span className="text-white font-bold tabular-nums">{value}</span>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  return (
    <motion.div 
      style={{ rotateX, rotateY }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="glass-panel p-8 rounded-3xl text-left border-white/5 hover:border-primary/50 transition-all cursor-default group shadow-2xl relative perspective-1000 scanning-sweep"
    >
      <div className={cn(
        "p-4 rounded-2xl bg-white/5 inline-block mb-6 transition-all group-hover:scale-110",
        color === 'primary' ? "group-hover:bg-primary/10" : "group-hover:bg-secondary/10"
      )}>
        <Icon className={cn("h-8 w-8", color === 'primary' ? "text-primary" : color === 'secondary' ? "text-secondary" : "text-white")} />
      </div>
      <h3 className="text-xl font-headline font-bold mb-3 text-white group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      <div className="mt-6 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 rounded-full" />
    </motion.div>
  );
}

function DemoWidget() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => p < 78 ? p + 1 : 78);
    }, 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="glass-panel p-6 rounded-[2.5rem] max-w-sm mx-auto flex items-center gap-6 group hover:border-secondary/30 transition-all"
    >
      <div className="relative h-24 w-24">
        <svg className="h-full w-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <motion.circle 
            cx="50" cy="50" r="45" 
            fill="none" 
            stroke="hsl(187, 100%, 50%)" 
            strokeWidth="8" 
            strokeDasharray="283" 
            strokeDashoffset={283 - (283 * progress) / 100}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white font-headline">{progress}%</span>
        </div>
      </div>
      <div className="text-left space-y-2">
        <div className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground">Sample Audit Status</div>
        <div className="text-lg font-bold text-white">Nominal Risk Detected</div>
        <div className="flex gap-2">
          <div className="h-1.5 w-8 rounded-full bg-secondary" />
          <div className="h-1.5 w-8 rounded-full bg-secondary/30" />
          <div className="h-1.5 w-8 rounded-full bg-secondary/30" />
        </div>
      </div>
    </motion.div>
  );
}
