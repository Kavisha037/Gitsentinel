"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

interface AITerminalExplanationProps {
  analysis: any;
}

export default function AITerminalExplanation({ analysis }: AITerminalExplanationProps) {
  const [displayText, setDisplayText] = useState('');
  const fullText = `[SYSTEM_INIT] Behavioral Intelligence Core v4.2.0\n[SCANNING] Analyzing repository entropy...\n[DETECTED] ${analysis.keyFactors[0]?.explanation || 'Telemetry suggests nominal activity.'}\n[VERDICT] Risk level evaluated as ${analysis.riskLevel.toUpperCase()}.\n[RECOMMENDATION] ${analysis.recommendedActions[0] || 'Continue monitoring baseline.'}\n[COMPLETE] Neural synthesis finished.`;

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [fullText]);

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
      <div className="relative bg-black rounded-2xl p-6 font-mono text-[11px] leading-relaxed overflow-hidden border border-white/5">
        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2 text-muted-foreground/40">
          <Terminal className="h-3 w-3" />
          <span className="tracking-[0.2em] uppercase">Behavioral_Heuristics_Terminal</span>
        </div>
        <div className="space-y-1 text-primary/80">
          {displayText.split('\n').map((line, idx) => (
            <div key={idx} className="flex gap-4">
              <span className="text-white/10 shrink-0">{(idx + 1).toString().padStart(2, '0')}</span>
              <span className={cn(
                line.includes('[DETECTED]') || line.includes('[VERDICT]') ? "text-secondary font-bold" : "text-primary/70"
              )}>{line}</span>
            </div>
          ))}
          <motion.span 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="inline-block w-2 h-4 bg-primary align-middle ml-1"
          />
        </div>
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';
