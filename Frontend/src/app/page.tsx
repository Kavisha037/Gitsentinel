"use client";

import { scanRepository } from "@/services/api";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Shield, Zap, Search, Github, Activity, Globe,
  LayoutDashboard, Cpu, Database,
  TrendingUp, Network, Box, AlertTriangle, Lock,
  GitBranch, List, Key, User, CheckCircle2
} from 'lucide-react';
import { cn } from '@/utils/utils';
import Link from 'next/link';

export default function Home() {
  const [formData, setFormData] = useState({
    owner: '',
    repo: '',
    branch: 'main',
    last_Commit: 5,
    token: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isFormFocused, setIsFormFocused] = useState(false);
  const router = useRouter();

  // Simulated Live Stats
  const [stats, setStats] = useState({ repos: 1245892, threats: 4589, nodes: 124 });

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setStats(prev => ({
        repos: prev.repos + Math.floor(Math.random() * 3),
        threats: prev.threats + (Math.random() > 0.8 ? 1 : 0),
        nodes: 120 + Math.floor(Math.random() * 10)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Mouse tracking for parallax
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.owner || !formData.repo || !formData.token) return;
    setIsLoading(true);

    const queryParams = new URLSearchParams({
      branch: formData.branch,
      commits: formData.last_Commit.toString(),
      token: formData.token
    }).toString();

    router.push(`/scan/repo/${formData.owner}/${formData.repo}?${queryParams}`);
  };

  const updateField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Activation requires Owner, Repo, and Token
  const isReady = !!(formData.owner && formData.repo && formData.token);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start p-6 overflow-x-hidden">

      {/* Hero Section */}
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap justify-center gap-8 text-[10px] font-headline tracking-widest uppercase text-muted-foreground/60"
        >
          <StatItem label="Repos Scanned" value={stats.repos.toLocaleString()} icon={Database} />
          <StatItem label="Threats Detected" value={stats.threats.toLocaleString()} icon={Shield} />
          <StatItem label="Active Nodes" value={stats.nodes.toString()} icon={Network} />
        </motion.div>

        {/* Multi-Input Form */}
        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onSubmit={handleSearch}
          className="max-w-4xl mx-auto space-y-8 relative"
        >
          <div className="relative group perspective-1000">
            <div className={cn(
              "absolute -inset-[1px] rounded-3xl blur-sm transition-all duration-500",
              isReady
                ? "bg-secondary/20 opacity-40"
                : "bg-gradient-to-r from-primary to-secondary opacity-5 group-hover:opacity-15"
            )} />

            <motion.div
              whileHover={{ y: -5 }}
              className={cn(
                "relative p-8 shadow-2xl overflow-hidden rounded-[2rem] backdrop-blur-3xl border transition-all duration-500 bg-card/60",
                isReady ? "border-secondary/30 shadow-[0_0_20px_rgba(58,203,224,0.05)]" : "border-white/5"
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Owner */}
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <User className="h-3 w-3 text-primary" /> Repository Owner
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

              <Button
                type="submit"
                disabled={isLoading || !isReady}
                className={cn(
                  "w-full mt-8 h-16 rounded-2xl transition-all duration-300 relative overflow-hidden group/btn font-headline tracking-[0.2em] uppercase text-sm",
                  isReady
                    ? "bg-secondary hover:bg-secondary/90 text-black shadow-[0_0_30px_rgba(58,203,224,0.3)]"
                    : "bg-primary hover:bg-primary/90 glow-primary opacity-50"
                )}
              >
                {isLoading ? (
                  <Activity className="h-6 w-6 animate-spin" />
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <Search className="h-5 w-5" /> AUDIT
                  </span>
                )}
              </Button>
            </motion.div>

            {/* Ready Status Feedback */}
            <AnimatePresence>
              {isReady && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute -bottom-12 left-0 right-0 flex justify-center"
                >
                  <div className="flex gap-2 items-center px-6 py-1.5 rounded-full glass-panel text-[9px] font-headline uppercase tracking-widest text-secondary border-secondary/40 bg-secondary/5 shadow-[0_0_20px_rgba(58,203,224,0.2)]">
                    <CheckCircle2 className="h-3 w-3" /> READY_FOR_AUDIT
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
            desc="Automatic detection of risky patterns and dependency issues."
            color="primary"
          />
          <FeatureCard
            icon={Zap}
            title="Real-time Scoring"
            desc="Deep analysis of contributor activity and cross-repo interactions."
            color="secondary"
          />
          <FeatureCard
            icon={Shield}
            title="Threat Intel"
            desc="Automatic detection of risky patterns and dependency issues."
            color="white"
          />
        </div>

        {/* How It Works */}
        <div className="pt-32 space-y-16">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl font-headline font-bold text-white tracking-tight"
          >
            THE <span className="text-secondary">AUDIT</span> LIFECYCLE
          </motion.h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-4 relative">
            <WorkflowStep step="01" label="Ingest" icon={Github} desc="Target repo & depth" />
            <WorkflowConnector />
            <WorkflowStep step="02" label="Analyze" icon={Cpu} desc="ML-driven pattern audit" />
            <WorkflowConnector />
            <WorkflowStep step="03" label="Score" icon={TrendingUp} desc="Generate risk profile" />
          </div>
        </div>
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

function WorkflowStep({ step, label, icon: Icon, desc }: { step: string, label: string, icon: any, desc: string }) {
  return (
    <div className="flex flex-col items-center gap-4 group">
      <div className="relative">
        <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative z-10 group-hover:border-primary/50 transition-all">
          <Icon className="h-8 w-8 text-white group-hover:text-primary transition-colors" />
        </div>
        <div className="absolute -top-2 -right-2 text-[8px] font-headline bg-primary px-2 py-0.5 rounded text-white z-20">
          {step}
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-headline font-bold text-white mb-1">{label}</div>
        <div className="text-[10px] text-muted-foreground leading-tight">{desc}</div>
      </div>
    </div>
  );
}

function WorkflowConnector() {
  return (
    <div className="hidden md:block w-20 h-px bg-gradient-to-r from-primary/10 via-secondary/40 to-primary/10 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-1 rounded-full bg-secondary animate-pulse" />
    </div>
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
