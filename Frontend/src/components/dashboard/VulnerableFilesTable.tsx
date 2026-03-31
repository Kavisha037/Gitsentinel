"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileCode, ChevronRight, ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VulnerableFilesTableProps {
  files: Array<{
    filename: string;
    riskPercentage: number;
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    language: string;
  }>;
}

export default function VulnerableFilesTable({ files }: VulnerableFilesTableProps) {
  if (!files || files.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground glass-panel rounded-3xl border-white/5 flex flex-col items-center gap-4">
        <FileCode className="h-8 w-8 text-white/5" />
        <span className="font-headline text-[10px] tracking-widest uppercase italic">No source code vulnerabilities detected. Environment clean.</span>
      </div>
    );
  }

  return (
    <div className="rounded-[2.5rem] border border-white/5 bg-[#0a0b0d]/40 overflow-hidden backdrop-blur-md shadow-2xl relative">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-transparent pointer-events-none" />
      <Table>
        <TableHeader className="bg-white/[0.02] border-none">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-[10px] font-headline tracking-widest text-muted-foreground uppercase py-6 pl-8">Vulnerable File</TableHead>
            <TableHead className="text-[10px] font-headline tracking-widest text-muted-foreground uppercase">Risk Probability</TableHead>
            <TableHead className="text-[10px] font-headline tracking-widest text-muted-foreground uppercase text-right pr-8">Risk Verdict</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file, idx) => {
            const isHighRisk = file.riskLevel === 'HIGH';
            const isMediumRisk = file.riskLevel === 'MEDIUM';

            return (
              <motion.tr 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="border-white/5 hover:bg-white/[0.03] group transition-all cursor-pointer relative"
              >
                <TableCell className="py-6 pl-8">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-110",
                      isHighRisk ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    )}>
                       {isHighRisk ? <ShieldAlert className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-white group-hover:text-secondary transition-colors font-headline tracking-tight">{file.filename}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-muted-foreground font-code uppercase tracking-widest self-start">{file.language}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-md">
                   <div className="flex flex-col gap-2 w-full max-w-[200px]">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-headline text-muted-foreground uppercase tracking-widest">Confidence</span>
                         <span className={cn("text-[10px] font-bold font-headline tabular-nums", isHighRisk ? "text-red-400" : "text-emerald-400")}>{file.riskPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${file.riskPercentage}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                          className={cn("h-full rounded-full transition-all duration-500", isHighRisk ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : isMediumRisk ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]")} 
                        />
                      </div>
                   </div>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <div className="flex items-center justify-end gap-4">
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg border font-headline tracking-widest text-[9px] font-bold uppercase",
                      isHighRisk ? 'bg-red-500/10 border-red-500/20 text-red-400' : isMediumRisk ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    )}>
                       <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", isHighRisk ? 'bg-red-500' : isMediumRisk ? 'bg-amber-500' : 'bg-emerald-500')} />
                       {file.riskLevel}
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-secondary transition-all group-hover:translate-x-1" />
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
