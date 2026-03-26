
"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Github, Users, GitBranch, 
  Download, Activity, 
  Zap, Shield, AlertTriangle,
  BarChart3, List, ChevronRight, CheckCircle2,
  ArrowRightCircle, Star, Code, GitCommit
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RepoRiskMeter from "@/components/dashboard/RepoRiskMeter";
import FlaggedCommitsTable from "@/components/dashboard/FlaggedCommitsTable";
import ContributorMatrix from "@/components/dashboard/ContributorMatrix";
import CommitVolume3D from "@/components/dashboard/CommitVolume3D";
import ResilientAnalysisBanner from "@/components/dashboard/ResilientAnalysisBanner";
import type { RepoAnalysisData } from "@/lib/mock-data";
import type { AnalyzeRepositoryOutput } from "@/ai/flows/analyze-repository-behavior";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface RepoDashboardContentProps {
  owner: string;
  name: string;
  branch: string;
  commitDepth: number;
  scanMode?: 'commit' | 'code' | 'full';
  rawData: RepoAnalysisData;
  analysis: AnalyzeRepositoryOutput;
  errorMsg?: string | null;
}

export default function RepoDashboardContent({ 
  owner, 
  name, 
  branch, 
  commitDepth,
  scanMode = 'full',
  rawData, 
  analysis,
  errorMsg
}: RepoDashboardContentProps) {
  const isHighRisk = analysis.riskLevel === 'High Risk';
  const isModerateRisk = analysis.riskLevel === 'Moderate Risk';

  const suspiciousCount = rawData.sensitiveChanges.length;
  const safeCommitsCount = Math.max(0, commitDepth - suspiciousCount);

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(38, 114, 255); 
    doc.text("GITSENTINEL Audit Report", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Scan Mode: ${scanMode.toUpperCase()}`, 14, 34);
    
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Repository Identity", 14, 45);
    doc.setFontSize(10);
    doc.text(`Target: ${owner}/${name}`, 14, 53);
    doc.text(`Audit Branch: ${branch}`, 14, 59);
    doc.text(`Analysis Depth: ${commitDepth} commits`, 14, 65);

    doc.setFontSize(14);
    doc.text("Security Verdict", 14, 80);
    doc.setFontSize(12);
    const riskLevelColor = isHighRisk ? [239, 68, 68] : isModerateRisk ? [245, 158, 11] : [58, 203, 224];
    doc.setTextColor(riskLevelColor[0], riskLevelColor[1], riskLevelColor[2]);
    doc.text(`Overall Risk Level: ${analysis.riskLevel.toUpperCase()}`, 14, 88);
    doc.text(`Risk Score: ${analysis.overallRiskScore}/100`, 14, 95);
    doc.setTextColor(0);

    autoTable(doc, {
      startY: 105,
      head: [['Metric', 'Value', 'Status']],
      body: [
        ['Total Commits Scanned', commitDepth.toString(), 'Nominal'],
        ['Suspicious Commits', suspiciousCount.toString(), suspiciousCount > 0 ? 'ALERT' : 'NONE'],
        ['Safe Commits', safeCommitsCount.toString(), 'VERIFIED'],
        ['Threat Probability', `${analysis.overallRiskScore}%`, analysis.overallRiskScore > 35 ? 'HIGH' : 'LOW'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [38, 114, 255] }
    });

    doc.setFontSize(14);
    doc.text("Flagged Behavioral Anomalies", 14, (doc as any).lastAutoTable.finalY + 15);
    
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Hash', 'What Changed', 'Risk Level']],
      body: rawData.sensitiveChanges.map(c => [
        c.hash.substring(0, 6),
        c.description,
        c.riskLevel
      ]),
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68] }
    });

    doc.save(`GitSentinel_Report_${owner}_${name}.pdf`);
  };

  const kpiStats = [
    { 
      label: "Total commits scanned", 
      value: commitDepth, 
      sub: `Full audit depth of ${commitDepth} nodes`, 
      icon: Activity, 
      color: "text-white" 
    },
    { 
      label: "Suspicious commits", 
      value: suspiciousCount, 
      sub: `${suspiciousCount} suspicious commits`, 
      icon: AlertTriangle, 
      color: suspiciousCount > 0 ? "text-destructive" : "text-secondary" 
    },
    { 
      label: "Safe commits", 
      value: safeCommitsCount, 
      sub: "Verified as nominal activity", 
      icon: Shield, 
      color: "text-secondary" 
    },
    { 
      label: "Risk percentage", 
      value: `${analysis.overallRiskScore}%`, 
      sub: "Aggregated threat probability", 
      icon: Zap, 
      color: analysis.overallRiskScore > 70 ? "text-destructive" : analysis.overallRiskScore > 35 ? "text-amber-500" : "text-secondary" 
    }
  ];

  const getDashboardIcon = () => {
    switch (scanMode) {
      case 'commit': return <GitCommit className="h-10 w-10 text-primary" />;
      case 'code': return <Code className="h-10 w-10 text-secondary" />;
      case 'full': return <Star className="h-10 w-10 text-amber-500 animate-pulse" />;
      default: return <Github className="h-10 w-10 text-white" />;
    }
  };

  const getDashboardTitle = () => {
    switch (scanMode) {
      case 'commit': return <>Commit <span className="text-primary italic">Analysis</span></>;
      case 'code': return <>Code <span className="text-secondary italic">Audit</span></>;
      case 'full': return <>Full Ecosystem <span className="text-amber-500 italic">Scan</span></>;
      default: return <>Repository <span className="text-secondary italic">Analysis</span></>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 md:p-8 space-y-10 relative"
    >
      <div className={cn(
        "fixed inset-0 pointer-events-none transition-colors duration-1000 -z-10 opacity-20",
        scanMode === 'full' ? "bg-[radial-gradient(circle_at_50%_0%,#f59e0b_0%,transparent_50%)]" :
        isHighRisk ? "bg-[radial-gradient(circle_at_50%_0%,#ef4444_0%,transparent_50%)]" : 
        isModerateRisk ? "bg-[radial-gradient(circle_at_50%_0%,#f59e0b_0%,transparent_50%)]" : 
        "bg-[radial-gradient(circle_at_50%_0%,#3acbe0_0%,transparent_50%)]"
      )} />

      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 glass-panel p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 shadow-2xl">
            {getDashboardIcon()}
          </div>
          <div>
            <div className="flex items-center gap-3 text-[10px] font-headline tracking-[0.3em] text-muted-foreground uppercase mb-2">
              <span>{owner}</span>
              <ChevronRight className="h-3 w-3 text-white/20" />
              <span className="text-white font-bold">{name}</span>
              <div className="h-1 w-1 rounded-full bg-white/20 mx-1" />
              <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" /> {branch}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter text-white uppercase">
              {getDashboardTitle()}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 relative z-10">
          <Link href="/">
            <Button variant="outline" className="h-12 px-6 rounded-xl border-white/10 glass-card font-headline text-[10px] tracking-widest uppercase hover:bg-white/5">
              New Scan
            </Button>
          </Link>
          <Button 
            onClick={handleDownloadReport}
            className={cn(
              "h-12 px-8 rounded-xl font-headline text-[10px] tracking-widest uppercase shadow-2xl",
              scanMode === 'full' ? "bg-amber-500 text-black hover:bg-amber-600" : "bg-primary text-white glow-primary"
            )}
          >
            <Download className="h-4 w-4 mr-2" /> Download Report
          </Button>
        </div>
      </header>

      {errorMsg && <ResilientAnalysisBanner errorMessage={errorMsg} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <Card className="glass-panel border-none p-12 rounded-[3rem] shadow-2xl bg-gradient-to-b from-card/60 to-card/20 overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20" />
            <RepoRiskMeter 
              score={analysis.overallRiskScore} 
              level={analysis.riskLevel} 
              branch={branch}
              commitDepth={commitDepth}
            />
          </Card>
        </div>

        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiStats.map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass-panel p-6 rounded-3xl border-white/5 relative overflow-hidden group cursor-default"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-4">
                <stat.icon className={cn("h-4 w-4", stat.color)} />
                <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", stat.color === 'text-destructive' ? 'bg-destructive' : 'bg-secondary')} />
              </div>
              <div className={cn("text-2xl font-bold font-headline mb-1", stat.color)}>{stat.value}</div>
              <div className="text-[9px] font-headline uppercase text-muted-foreground tracking-widest">{stat.label}</div>
              <div className="text-[8px] text-muted-foreground/50 mt-1 italic leading-tight">{stat.sub}</div>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-12">
          <Card className="glass-panel border-none rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <CardHeader className="p-0 mb-4 relative z-10">
              <CardTitle className="text-xl font-headline tracking-tighter flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-secondary" /> Commit Activity
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground/60 uppercase tracking-widest">Recent commit analysis</CardDescription>
            </CardHeader>
            <div className="mb-6 relative z-10">
              <p className="text-xs text-muted-foreground/80 font-body">Most commits are safe, but a few show risky behavior.</p>
            </div>
            <div className="h-[400px] w-full relative z-10">
              <CommitVolume3D 
                commitDepth={commitDepth} 
                sensitiveChanges={rawData.sensitiveChanges} 
              />
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-headline text-muted-foreground uppercase tracking-widest bg-white/5 p-4 rounded-2xl border border-white/5">
              <AlertTriangle className={cn("h-4 w-4", suspiciousCount > 0 ? "text-destructive" : "text-secondary")} />
              <span>{suspiciousCount} suspicious commit{suspiciousCount !== 1 ? 's' : ''} detected in recent activity</span>
            </div>
            <div className="scanning-sweep absolute inset-0 pointer-events-none opacity-10" />
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <Card className="glass-panel border-none rounded-[2.5rem] p-8 shadow-2xl">
            <CardHeader className="p-0 mb-8">
              <CardTitle className="text-xl font-headline tracking-tighter flex items-center gap-3">
                <List className="h-6 w-6 text-primary" /> Flagged Commits
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground/60 uppercase tracking-widest">Anomalous nodes detected in recent trace</CardDescription>
            </CardHeader>
            <FlaggedCommitsTable changes={rawData.sensitiveChanges} />
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="glass-panel border-none rounded-[2.5rem] p-8 shadow-2xl bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <CardHeader className="p-0 mb-8">
              <div className="flex items-center justify-between mb-2">
                <Zap className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <CardTitle className="text-2xl font-headline tracking-tighter text-white uppercase italic">
                RECOMMENDATIONS
              </CardTitle>
              <CardDescription className="text-[10px] text-primary/60 uppercase font-bold tracking-[0.2em] mt-2">Prioritized Security Directives</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              {analysis.recommendedActions.map((action, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ x: 5 }}
                  className="flex gap-4 items-start group relative"
                >
                  <div className="absolute -left-2 top-0 bottom-0 w-1 bg-primary/20 rounded-full group-hover:bg-primary transition-colors" />
                  <div className="h-7 w-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white font-headline shrink-0 group-hover:bg-primary group-hover:text-black transition-all duration-300">
                    <span className="group-hover:hidden font-bold">{i + 1}</span>
                    <CheckCircle2 className="h-4 w-4 hidden group-hover:block" />
                  </div>
                  <div className="space-y-1">
                    <p className={cn(
                      "text-sm leading-relaxed transition-colors",
                      i === 0 && isHighRisk ? "text-destructive font-bold" : "text-muted-foreground group-hover:text-white"
                    )}>
                      {action}
                    </p>
                    <div className="flex items-center gap-2 text-[8px] font-headline tracking-widest text-primary/40 uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRightCircle className="h-2.5 w-2.5" /> Execute Directive
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-panel border-none rounded-[2.5rem] p-8 shadow-2xl">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-headline tracking-tighter flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" /> Contributors
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground/60 uppercase tracking-widest">Trust levels based on past activity</CardDescription>
            </CardHeader>
            <ContributorMatrix contributors={rawData.contributors} />
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
