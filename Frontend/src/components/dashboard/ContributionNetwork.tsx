"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function ContributionNetwork() {
  // Generate stable nodes for the SVG network map
  const nodes = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: Math.random() * 4 + 2,
      color: i % 4 === 0 ? '#3ACBE0' : '#2672FF',
    }));
  }, []);

  // Generate stable connections
  const connections = useMemo(() => {
    const lines = [];
    for (let i = 0; i < nodes.length; i++) {
      if (i % 3 === 0) {
        const targetIdx = (i + 5) % nodes.length;
        lines.push({
          id: `line-${i}`,
          x1: nodes[i].x,
          y1: nodes[i].y,
          x2: nodes[targetIdx].x,
          y2: nodes[targetIdx].y,
        });
      }
    }
    return lines;
  }, [nodes]);

  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-xl bg-black/40 border border-white/5">
      <svg className="w-full h-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Connections */}
        {connections.map((line) => (
          <motion.line
            key={line.id}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke="url(#lineGradient)"
            strokeWidth="0.1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.2 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
          />
        ))}
        
        {/* Nodes */}
        {nodes.map((node) => (
          <motion.circle
            key={node.id}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r={node.size / 10}
            fill={node.color}
            initial={{ opacity: 0.2 }}
            animate={{ 
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2, 
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}

        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2672FF" stopOpacity="0" />
            <stop offset="50%" stopColor="#2672FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#3ACBE0" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center space-y-2">
          <div className="text-[10px] font-headline uppercase tracking-[0.4em] text-muted-foreground/40">Ecosystem Neural Graph</div>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary/20 to-transparent mx-auto" />
        </div>
      </div>

      <div className="absolute top-4 left-4 pointer-events-none">
        <h3 className="text-xs font-headline uppercase text-muted-foreground tracking-widest">Interactive Network Map</h3>
      </div>
    </div>
  );
}
