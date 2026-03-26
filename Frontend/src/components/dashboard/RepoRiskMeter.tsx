"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, ShieldX, GitBranch, History } from "lucide-react";
import { cn } from "@/lib/utils";

interface RepoRiskMeterProps {
  score: number;
  level: string;
  branch: string;
  commitDepth: number;
}

export default function RepoRiskMeter({ score, level, branch, commitDepth }: RepoRiskMeterProps) {
  const isHigh = level === 'High Risk';
  const isModerate = level === 'Moderate Risk';
  
  const riskColor = isHigh ? 'text-destructive' : isModerate ? 'text-amber-500' : 'text-secondary';
  const Icon = isHigh ? ShieldX : isModerate ? ShieldAlert : ShieldCheck;

  // Gauge calculation
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
      {/* Gauge Module */}
      <div className="relative h-72 w-72 flex items-center justify-center">
        {/* Background Glows */}
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className={cn("absolute inset-0 rounded-full blur-3xl opacity-30", isHigh ? "bg-destructive" : isModerate ? "bg-amber-500" : "bg-secondary")}
        />

        {/* Circular Gauge */}
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-white/5"
          />
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 2, ease: "easeOut" }}
            className={riskColor}
            strokeLinecap="round"
          />
        </svg>

        {/* Score Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-7xl font-bold font-headline tracking-tighter text-white tabular-nums drop-shadow-2xl"
          >
            {score}
          </motion.div>
          <div className="text-[10px] font-headline uppercase tracking-[0.3em] text-muted-foreground opacity-60 text-center px-4">Overall Risk Score</div>
        </div>
      </div>

      {/* Intelligence Readout */}
      <div className="flex-1 space-y-8 text-center lg:text-left">
        <div className="space-y-4">
          <div className="flex items-center justify-center lg:justify-start gap-4">
            <Icon className={cn("h-10 w-10", riskColor)} />
            <h2 className={cn("text-5xl font-bold font-headline tracking-tighter uppercase", riskColor)}>
              {isHigh ? 'HIGH' : isModerate ? 'MODERATE' : 'SAFE'} <span className="text-white">RISK DETECTED</span>
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            <Badge variant="outline" className="border-white/10 bg-white/5 px-4 py-1.5 rounded-xl uppercase font-headline tracking-widest text-[9px] text-white">
              <GitBranch className="h-3 w-3 mr-2 text-primary" /> Branch: {branch}
            </Badge>
            <Badge variant="outline" className="border-white/10 bg-white/5 px-4 py-1.5 rounded-xl uppercase font-headline tracking-widest text-[9px] text-white">
              <History className="h-3 w-3 mr-2 text-secondary" /> Scope: {commitDepth} Commits
            </Badge>
          </div>
          
          <p className="text-muted-foreground text-base max-w-xl leading-relaxed border-l-2 border-white/10 pl-6 py-2">
            We analyzed {commitDepth} recent commits and found some unusual activity that may be risky.
          </p>
        </div>

        {/* Critical Signal Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'New Commit', status: 'safe' },
            { label: 'Suspicious commit detected', status: 'danger' },
            { label: 'New Contributor activity', status: 'warning' }
          ].map((signal, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all shadow-lg"
            >
              <span className="text-[9px] font-headline tracking-widest text-muted-foreground group-hover:text-white transition-colors uppercase">{signal.label}</span>
              <div className={cn(
                "h-1.5 w-1.5 rounded-full", 
                signal.status === 'danger' ? "bg-destructive animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" : 
                signal.status === 'warning' ? "bg-amber-500" : "bg-secondary"
              )} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
