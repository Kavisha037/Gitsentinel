
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, 
  History, 
  Users, 
  ShieldAlert, 
  Cpu, 
  Calculator, 
  CheckCircle2, 
  Loader2,
  Lock,
  Zap,
  Globe,
  Activity,
  AlertCircle,
  LayoutDashboard,
  Rocket,
  ChevronRight
} from "lucide-react";
import ScanningOrb from "./ScanningOrb";

const REPO_STAGES = [
  { id: 'fetch', label: "Fetching Repository Data", icon: Database, description: "Extracting 90-day activity logs and repository metadata." },
  { id: 'history', label: "Analyzing Commit History", icon: History, description: "Evaluating code velocity, branch complexity, and baseline patterns." },
  { id: 'behavior', label: "Evaluating Contributor Behavior", icon: Users, description: "Calculating trust scores, tenure, and cross-repo interaction network." },
  { id: 'deps', label: "Scanning Dependencies", icon: ShieldAlert, description: "Identifying suspicious packages and potential supply chain injections." },
  { id: 'cicd', label: "Inspecting CI/CD Pipelines", icon: Cpu, description: "Detecting unauthorized workflow drift and deployment anomalies." },
  { id: 'score', label: "Calculating Risk Profile", icon: Calculator, description: "Aggregating behavioral signals into a weighted risk assessment." },
];

const USER_STAGES = [
  { id: 'profile', label: "Fetching Profile Data", icon: Globe, description: "Retrieving account metadata and identity verification status." },
  { id: 'repos', label: "Analyzing Repositories", icon: Database, description: "Aggregating activity across all public contributions and projects." },
  { id: 'patterns', label: "Evaluating Behavioral Patterns", icon: History, description: "Correlating contribution bursts and repository dispersion." },
  { id: 'trust', label: "Calculating Trust Score", icon: ShieldAlert, description: "Evaluating consistency and peer interaction reliability." },
  { id: 'ai', label: "Generating Risk Synthesis", icon: Calculator, description: "AI-driven behavioral pattern recognition and profile weighting." },
];

type ScanState = 'scanning' | 'processing' | 'preparing' | 'finalizing' | 'completed';

interface ImmersiveScannerProps {
  mode?: 'repo' | 'user';
  scanMode?: 'commit' | 'code' | 'full';
  target: string;
  owner?: string;
  onComplete: () => void;
}

export default function ImmersiveScanner({ mode = 'repo', scanMode = 'full', target, owner, onComplete }: ImmersiveScannerProps) {
  const STAGES = mode === 'repo' ? REPO_STAGES : USER_STAGES;
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const completionTriggered = useRef(false);

  useEffect(() => {
    if (scanState !== 'scanning') return;

    const stageCount = STAGES.length;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99.5) {
          clearInterval(interval);
          setScanState('processing');
          return 99.5;
        }
        
        const step = 100 / (stageCount * 120); 
        const nextProgress = prev + step;
        
        const nextStage = Math.min(Math.floor((nextProgress / 100) * stageCount), stageCount - 1);
        if (nextStage > currentStageIndex) {
          setCompletedStages(prevStages => [...prevStages, STAGES[currentStageIndex].id]);
          setCurrentStageIndex(nextStage);
        }
        
        return nextProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentStageIndex, scanState, STAGES]);

  useEffect(() => {
    if (scanState === 'processing') {
      const timer = setTimeout(() => {
        setScanState('preparing');
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (scanState === 'preparing') {
      const timer = setTimeout(() => {
        setScanState('finalizing');
        setProgress(100);
      }, 2000); 
      return () => clearTimeout(timer);
    }
    if (scanState === 'finalizing') {
      const timer = setTimeout(() => {
        setScanState('completed');
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, [scanState]);

  useEffect(() => {
    if (scanState === 'completed' && !completionTriggered.current) {
      completionTriggered.current = true;
      onComplete();
    }
  }, [scanState, onComplete]);

  const [streams, setStreams] = useState<number[]>([]);
  useEffect(() => {
    setStreams(Array.from({ length: 15 }, () => Math.random() * 100));
  }, []);

  const getHeaderText = () => {
    if (mode === 'user') return <>PROFILING <span className="text-primary">@{target}</span></>;
    
    switch (scanMode) {
      case 'commit': return <>AUDITING commits - <span className="text-primary">{target}</span></>;
      case 'code': return <>AUDITING codes - <span className="text-secondary">{target}</span></>;
      case 'full': return <>analyzing AUDITING - <span className="text-amber-500">{target}</span></>;
      default: return <>AUDITING <span className="text-muted-foreground">{owner}/</span>{target}</>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={scanState === 'completed' ? { 
        scale: 1.2, 
        opacity: 0,
        filter: "blur(20px)"
      } : { opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 md:p-12 bg-[#050608] overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        {streams.map((left, i) => (
          <div 
            key={i} 
            className="data-stream" 
            style={{ left: `${left}%`, animationDelay: `${i * 0.4}s`, animationDuration: `${3 + Math.random() * 5}s` }} 
          />
        ))}
      </div>

      <div className="w-full max-w-7xl z-10 flex flex-col items-center">
        <header className="text-center mb-16 space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              backgroundColor: scanState === 'preparing' || scanState === 'finalizing' ? "rgba(58, 203, 224, 0.2)" : "rgba(38, 114, 255, 0.1)"
            }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-headline tracking-[0.3em] uppercase transition-colors duration-500 ${
              scanState === 'finalizing' || scanState === 'completed' || scanState === 'preparing'
                ? "border-secondary/40 text-secondary" 
                : "border-primary/20 text-primary"
            }`}
          >
            <Activity className={`h-3 w-3 ${scanState !== 'completed' ? 'animate-pulse' : ''}`} /> 
            {scanState === 'finalizing' || scanState === 'completed' ? "AUDIT_FINALIZED" : scanState === 'preparing' ? "PREPARING_DASHBOARD" : "CORE_ANALYSIS_ACTIVE"}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-6xl font-bold font-headline tracking-tighter text-white uppercase"
          >
            {getHeaderText()}
          </motion.h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full items-center">
          <div className="lg:col-span-4 space-y-4 hidden lg:block">
            {STAGES.slice(0, 3).map((stage, index) => {
              const isActive = index === currentStageIndex && scanState === 'scanning';
              const isCompleted = completedStages.includes(stage.id) || scanState !== 'scanning';
              return <StageCard key={stage.id} stage={stage} isActive={isActive} isCompleted={isCompleted} />;
            })}
          </div>

          <div className="lg:col-span-4 flex flex-col items-center justify-center relative py-12">
            <ScanningOrb progress={progress} isActive={scanState === 'scanning'} />
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 text-center"
            >
              <AnimatePresence mode="wait">
                {scanState === 'finalizing' || scanState === 'completed' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 1.1 }}
                    className="space-y-4"
                  >
                    <div className="text-4xl font-bold font-headline text-secondary tracking-widest neon-text-secondary uppercase">
                      Audit Complete
                    </div>
                    <div className="flex items-center justify-center gap-2 text-primary text-[10px] font-headline tracking-[0.4em] uppercase animate-pulse">
                      <LayoutDashboard className="h-4 w-4" /> Directing To Dashboard
                    </div>
                  </motion.div>
                ) : scanState === 'preparing' ? (
                   <motion.div
                    key="preparing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-3xl font-bold font-headline text-white tracking-widest uppercase">
                      Building Dashboard
                    </div>
                    <div className="flex items-center justify-center gap-2 text-primary text-xs font-headline tracking-widest uppercase">
                      <Rocket className="h-4 w-4 animate-bounce" /> Syncing Ecosystem Nodes...
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="progress"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-5xl font-bold font-headline text-white mb-2 tabular-nums">
                      {Math.round(progress)}%
                    </div>
                    <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5 mx-auto">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(38,114,255,0.6)]"
                      />
                    </div>
                    <p className="mt-4 text-[10px] font-headline uppercase tracking-widest text-muted-foreground animate-pulse">
                      {scanState === 'processing' ? 'Synthesizing Signals...' : 'Deep Behavior Audit...'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            {(STAGES.length > 3 ? STAGES.slice(3) : STAGES).map((stage, index) => {
              const adjustedIndex = STAGES.length > 3 ? index + 3 : index;
              const isActive = adjustedIndex === currentStageIndex && scanState === 'scanning';
              const isCompleted = completedStages.includes(stage.id) || scanState !== 'scanning';
              return <StageCard key={stage.id} stage={stage} isActive={isActive} isCompleted={isCompleted} />;
            })}
          </div>
        </div>
      </div>

      <footer className="absolute bottom-8 w-full px-12 flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest font-headline opacity-30">
        <div className="flex items-center gap-2">
          <Lock className="h-3 w-3" /> Encrypted_Handshake
        </div>
        <div className="flex items-center gap-4">
          <span>{target.toUpperCase()}</span>
          <div className="h-1 w-1 rounded-full bg-primary" />
          <span>V4.2.0_CORE</span>
        </div>
      </footer>
    </motion.div>
  );
}

function StageCard({ stage, isActive, isCompleted }: { stage: any, isActive: boolean, isCompleted: boolean }) {
  const Icon = stage.icon;
  return (
    <motion.div
      initial={false}
      animate={{ 
        scale: isActive ? 1.05 : 1,
        opacity: isActive ? 1 : isCompleted ? 0.7 : 0.3,
        x: isActive ? 10 : 0
      }}
      className={`relative p-5 rounded-2xl border transition-all duration-500 ${
        isActive 
        ? "bg-primary/10 border-primary/30 shadow-[0_0_30px_rgba(38,114,255,0.2)] z-20" 
        : isCompleted 
          ? "bg-secondary/5 border-secondary/20" 
          : "bg-white/5 border-white/5"
      }`}
    >
      <div className="flex items-center gap-4 mb-3">
        <div className={`p-2 rounded-lg ${isActive ? "bg-primary text-white" : isCompleted ? "bg-secondary/20 text-secondary" : "bg-white/10 text-muted-foreground"}`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className={`text-sm font-bold font-headline tracking-tight ${isActive ? "text-white" : isCompleted ? "text-secondary" : "text-muted-foreground"}`}>
          {stage.label}
        </h3>
        <div className="ml-auto">
          {isCompleted && <CheckCircle2 className="h-4 w-4 text-secondary" />}
          {isActive && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
        </div>
      </div>
      <AnimatePresence>
        {isActive && (
          <motion.p 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="text-[10px] text-muted-foreground/80 leading-relaxed italic border-t border-white/5 pt-3"
          >
            "{stage.description}"
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
