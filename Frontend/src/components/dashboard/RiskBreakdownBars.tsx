"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RiskBreakdownBarsProps {
  stats: {
    totalCommits: number;
    suspiciousCommits: number;
    flaggedContributors: number;
    atRiskFiles: number;
    totalContributors: number;
    overallScore: number;
  };
}

export default function RiskBreakdownBars({ stats }: RiskBreakdownBarsProps) {
  // Normalize the factors to percentages for visual representation
  const dimensions = [
    { 
      label: 'Total Commits Scanned', 
      value: 100, // Normalized baseline
      displayValue: stats.totalCommits,
      color: 'bg-white' 
    },
    { 
      label: 'Suspicious Commits', 
      value: Math.min(100, (stats.suspiciousCommits / stats.totalCommits) * 400), // Scaled for visibility
      displayValue: stats.suspiciousCommits,
      color: 'bg-destructive' 
    },
    { 
      label: 'Flagged Contributors', 
      value: Math.min(100, (stats.flaggedContributors / stats.totalContributors) * 100), 
      displayValue: stats.flaggedContributors,
      color: 'bg-amber-500' 
    },
    { 
      label: 'At-Risk Files', 
      value: Math.min(100, stats.atRiskFiles * 20), 
      displayValue: stats.atRiskFiles,
      color: 'bg-primary' 
    },
    { 
      label: 'Total Contributors', 
      value: 100, // Normalized
      displayValue: stats.totalContributors,
      color: 'bg-secondary' 
    },
    { 
      label: 'Overall Risk Score', 
      value: stats.overallScore, 
      displayValue: `${stats.overallScore}%`,
      color: 'bg-secondary shadow-[0_0_15px_rgba(58,203,224,0.5)]' 
    },
  ];

  return (
    <div className="space-y-6">
      {dimensions.map((dim, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between text-[10px] uppercase font-headline tracking-[0.2em] text-muted-foreground">
            <span>{dim.label}</span>
            <span className="text-white font-mono">{dim.displayValue}</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${dim.value || 0}%` }}
              transition={{ duration: 1, delay: i * 0.1 }}
              className={cn("h-full rounded-full", dim.color)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
