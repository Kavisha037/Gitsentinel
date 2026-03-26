"use client";

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RiskBreakdownChartProps {
  stats: {
    totalCommits: number;
    suspiciousCommits: number;
    flaggedContributors: number;
    atRiskFiles: number;
    totalContributors: number;
    overallScore: number;
  };
}

export default function RiskBreakdownChart({ stats }: RiskBreakdownChartProps) {
  // Mouse tracking for 3D parallax
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const safeCommitsCount = stats.totalCommits - stats.suspiciousCommits;

  // Normalize stats for radar visualization (0-100 scale)
  const data = [
    { 
      subject: 'TOTAL COMMITS', 
      value: 100, 
      fullValue: stats.totalCommits 
    },
    { 
      subject: 'SUSPICIOUS COMMITS', 
      value: Math.min(100, (stats.suspiciousCommits / (stats.totalCommits || 1)) * 500), 
      fullValue: stats.suspiciousCommits
    },
    { 
      subject: 'SAFE NODES', 
      value: Math.min(100, (safeCommitsCount / (stats.totalCommits || 1)) * 100), 
      fullValue: safeCommitsCount
    },
    { 
      subject: 'AT-RISK FILES', 
      value: Math.min(100, stats.atRiskFiles * 20), 
      fullValue: stats.atRiskFiles
    },
    { 
      subject: 'TOTAL CONTRIBUTORS', 
      value: Math.min(100, (stats.totalContributors / 10) * 100), 
      fullValue: stats.totalContributors
    },
    { 
      subject: 'OVERALL RISK', 
      value: stats.overallScore, 
      fullValue: `${stats.overallScore}%`
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-xl border-primary/40 bg-black/80 shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-headline uppercase tracking-widest text-primary mb-1">{payload[0].payload.subject}</p>
          <p className="text-xl font-bold font-headline text-white">{payload[0].payload.fullValue}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full flex items-center justify-center p-4 group perspective-1000"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-primary/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="w-full h-full relative z-10" style={{ transform: "translateZ(50px)" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#ffffff15" strokeWidth={1} />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ 
                fill: '#94a3b8', 
                fontSize: 9, 
                fontWeight: 700,
                fontFamily: 'Space Grotesk'
              }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Risk Vector"
              dataKey="value"
              stroke="#2672FF"
              strokeWidth={3}
              fill="url(#radarGradient)"
              fillOpacity={0.4}
              animationBegin={300}
              animationDuration={1500}
              animationEasing="ease-out"
            />
            <defs>
              <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2672FF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3ACBE0" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Floating Indicators */}
      <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-40">
        <div className="text-[8px] font-headline uppercase tracking-[0.4em] text-primary animate-pulse">Risk_Vector_Mapping_Active</div>
      </div>
    </motion.div>
  );
}
