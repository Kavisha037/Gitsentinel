"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Hash, ChevronRight } from 'lucide-react';

interface FlaggedCommitsTableProps {
  changes: any[];
}

export default function FlaggedCommitsTable({ changes }: FlaggedCommitsTableProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 overflow-hidden backdrop-blur-md shadow-2xl relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <Table>
        <TableHeader className="bg-white/5 border-none">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-[10px] font-headline tracking-widest text-muted-foreground uppercase py-4 pl-6">Commit</TableHead>
            <TableHead className="text-[10px] font-headline tracking-widest text-muted-foreground uppercase">What Changed</TableHead>
            <TableHead className="text-[10px] font-headline tracking-widest text-muted-foreground uppercase text-right pr-6">Risk Level</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {changes.map((change, idx) => {
            const isHighRisk = change.riskLevel === 'HIGH';
            const isMediumRisk = change.riskLevel === 'MEDIUM';

            return (
              <motion.tr 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="border-white/5 hover:bg-white/5 group transition-colors cursor-pointer"
              >
                <TableCell className="py-5 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                      <Hash className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-mono text-white/70">{change.hash.substring(0, 6)}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-md">
                  <p className="text-xs text-muted-foreground group-hover:text-white transition-colors truncate font-body">
                    {change.description}
                  </p>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-3">
                    <div className={`h-2 w-2 rounded-full ${isHighRisk ? 'bg-destructive animate-pulse' : isMediumRisk ? 'bg-amber-500' : 'bg-secondary'}`} />
                    <span className={`text-[10px] font-bold font-headline tracking-widest ${isHighRisk ? 'text-destructive' : isMediumRisk ? 'text-amber-500' : 'text-secondary'}`}>
                      {change.riskLevel} {isHighRisk ? '🔴' : isMediumRisk ? '🟡' : '🟢'}
                    </span>
                    <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-primary transition-colors group-hover:translate-x-1" />
                  </div>
                </TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
