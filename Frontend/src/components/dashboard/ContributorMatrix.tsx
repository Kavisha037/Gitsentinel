"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Contributor {
  username: string;
  trustScore: number;
  historySummary: string;
}

export default function ContributorMatrix({ contributors }: { contributors: Contributor[] }) {
  return (
    <div className="space-y-4">
      {contributors.map((c, i) => {
        const isCritical = c.trustScore < 30;
        const isTrusted = c.trustScore > 80;

        return (
          <motion.div 
            key={i} 
            whileHover={{ scale: 1.02, x: 5 }}
            className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all cursor-default group"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-white/10 shrink-0">
                <AvatarImage src={`https://picsum.photos/seed/${c.username}/100/100`} />
                <AvatarFallback className="bg-muted">{c.username[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="text-sm font-medium text-white group-hover:text-primary transition-colors flex items-center gap-1.5 flex-wrap">
                  <span>{c.username}</span>
                  <span className="text-white/20">•</span>
                  <span className={cn(
                    "text-xs font-headline tracking-tight",
                    isTrusted ? "text-secondary" : isCritical ? "text-destructive" : "text-amber-500"
                  )}>
                    {isTrusted ? 'Verified Contributor' : isCritical ? '⚠ Needs review' : 'Elevated risk'}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                  Score: {c.trustScore}%
                </div>
              </div>
            </div>
            <div className={cn(
              "h-1.5 w-1.5 rounded-full shrink-0",
              isTrusted ? "bg-secondary" : isCritical ? "bg-destructive animate-pulse" : "bg-amber-500"
            )} />
          </motion.div>
        );
      })}
    </div>
  );
}
