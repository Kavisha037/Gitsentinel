"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CommitVolume3DProps {
  commitDepth: number;
  sensitiveChanges: any[];
}

export default function CommitVolume3D({ commitDepth, sensitiveChanges }: CommitVolume3DProps) {
  // 3D Parallax effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  // Generate per-commit data based on depth and flagged commits
  const data = useMemo(() => {
    // We want to show 'commitDepth' number of bars
    return Array.from({ length: commitDepth }, (_, i) => {
      // Find if this index (from the end) corresponds to a suspicious commit
      const suspiciousIndex = sensitiveChanges[i % sensitiveChanges.length];
      const isSuspicious = i < sensitiveChanges.length;
      
      const hash = isSuspicious ? suspiciousIndex.hash : Math.random().toString(16).substring(2, 8);
      
      // Simplify tooltip messages
      let message = "Normal contribution activity";
      if (isSuspicious) {
        if (suspiciousIndex.type === 'cicd') message = "CI/CD configuration change (possible risk)";
        else if (suspiciousIndex.type === 'dependency') message = "Suspicious package added (possible risk)";
        else if (suspiciousIndex.type === 'binary_commit') message = "Binary file added (possible risk)";
        else message = "Unusual activity detected (possible risk)";
      }

      const riskLevel = isSuspicious ? suspiciousIndex.riskLevel : "LOW";
      const probability = isSuspicious ? suspiciousIndex.confidence : Math.floor(Math.random() * 5) + 2;

      return {
        hash: hash.toUpperCase(),
        message,
        riskLevel,
        probability,
        isSuspicious,
        // Bar height now strictly represents probability %
        intensity: probability 
      };
    }).reverse(); 
  }, [commitDepth, sensitiveChanges]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl max-w-xs ring-1 ring-white/10">
          <p className="text-[9px] font-headline uppercase tracking-widest text-muted-foreground mb-2">Node: {item.hash}</p>
          <p className="text-xs text-white font-medium mb-3 leading-tight">{item.message}</p>
          <div className="flex justify-between items-center pt-2 border-t border-white/5">
            <span className={cn(
              "text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter",
              item.isSuspicious ? "bg-destructive/20 text-destructive" : "bg-secondary/20 text-secondary"
            )}>
              {item.riskLevel} Risk
            </span>
            <span className="text-[10px] font-mono text-white/60">{item.probability}% Prob</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Legend */}
      <div className="flex items-center gap-6 mb-8 text-[10px] font-headline uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-[#2672FF] shadow-[0_0_10px_rgba(38,114,255,0.4)]" />
          <span className="text-muted-foreground">Normal Commit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse" />
          <span className="text-destructive">Risky Commit</span>
        </div>
      </div>

      <motion.div 
        style={{ rotateX, rotateY, perspective: 1000 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="flex-1 group relative"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="normalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2672FF" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#2672FF" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="suspiciousGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2} />
              </linearGradient>
              <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
            <XAxis 
              dataKey="hash" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 9, fontWeight: 600 }}
              dy={10}
            />
            <YAxis hide domain={[0, 100]} />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: 'rgba(255,255,255,0.02)' }} 
            />
            <Bar 
              dataKey="intensity" 
              radius={[4, 4, 0, 0]} 
              barSize={Math.max(20, 100 / (commitDepth || 1) * 3)}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isSuspicious ? "url(#suspiciousGradient)" : "url(#normalGradient)"}
                  style={{ 
                    filter: entry.isSuspicious ? 'url(#glow-red)' : 'none',
                  }}
                  className={cn(entry.isSuspicious && "animate-pulse")}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}