"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ShieldCheck, Info, ListChecks, ArrowUpRight, Cpu } from "lucide-react";
import type { IdentifySuspiciousActivityPatternsOutput } from "@/ai/flows/identify-suspicious-activity-patterns";

interface RiskDisplayProps {
  assessment: IdentifySuspiciousActivityPatternsOutput & { isFallback?: boolean };
}

export default function RiskDisplay({ assessment }: RiskDisplayProps) {
  const isHigh = assessment.riskLevel === 'high';
  const isMedium = assessment.riskLevel === 'medium';
  
  const riskColor = isHigh ? 'text-destructive' : isMedium ? 'text-amber-500' : 'text-secondary';
  const riskBg = isHigh ? 'bg-destructive/10' : isMedium ? 'bg-amber-500/10' : 'bg-secondary/10';

  return (
    <div className="space-y-10">
      <Card className="glass-panel border-none rounded-[2.5rem] shadow-2xl relative overflow-hidden bg-gradient-to-br from-card/60 to-card/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-headline flex items-center gap-3 tracking-tighter text-white">
            <ShieldCheck className={`h-8 w-8 ${riskColor}`} />
            RISK PROFILE
          </CardTitle>
          <div className="flex flex-col items-end gap-1">
            <Badge className={`${riskBg} ${riskColor} border-none font-headline px-4 py-1 tracking-widest text-[10px]`}>
              {assessment.riskLevel.toUpperCase()}_STATUS
            </Badge>
            {assessment.isFallback && (
              <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-[8px] px-2 py-0 font-headline uppercase">
                <Cpu className="h-2 w-2 mr-1" /> Heuristic_Fallback
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-8 pt-0">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-headline">Anomaly Confidence</span>
            <span className={`text-4xl font-bold font-headline ${riskColor} tracking-tighter`}>
              {assessment.riskScore}<span className="text-sm opacity-20">/100</span>
            </span>
          </div>
          
          <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5 mb-10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${assessment.riskScore}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className={`h-full rounded-full ${isHigh ? 'bg-destructive' : 'bg-secondary'} shadow-[0_0_15px_rgba(58,203,224,0.3)]`} 
            />
          </div>
          
          <div className="space-y-6">
            <h4 className="text-[10px] font-headline text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-3">
              <div className="h-px w-8 bg-white/10" />
              <AlertTriangle className="h-4 w-4" /> 
              FLAGGED_BEHAVIORS
              <div className="h-px flex-1 bg-white/10" />
            </h4>
            
            {assessment.flaggedBehaviors.length > 0 ? (
              <div className="grid gap-6">
                {assessment.flaggedBehaviors.map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    whileHover={{ scale: 1.01, x: 5 }}
                    className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all shadow-sm group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h5 className="text-lg font-bold text-white group-hover:text-secondary transition-colors">{item.behavior}</h5>
                      <Badge variant="outline" className="text-[9px] uppercase border-white/10 font-mono tracking-widest text-muted-foreground">
                        {item.confidence}_CONF
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">
                      {item.explanation}
                    </p>
                    
                    <div className="space-y-4">
                      <span className="text-[10px] font-bold flex items-center gap-2 text-primary uppercase tracking-widest">
                        <ListChecks className="h-4 w-4" /> PROTOCOL VERIFICATION
                      </span>
                      <ul className="grid gap-3">
                        {item.suggestedVerificationSteps.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-3 text-xs text-muted-foreground/80 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5 group-hover:border-white/10 transition-all">
                            <ArrowUpRight className="h-4 w-4 text-secondary shrink-0 mt-0.5" /> 
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                <ShieldCheck className="h-16 w-16 mx-auto mb-6 text-secondary/20" />
                <p className="text-muted-foreground font-headline uppercase tracking-widest text-xs">Integrity Verified</p>
                <p className="text-[10px] text-muted-foreground/40 mt-2">NO SIGNIFICANT ANOMALIES RECORDED</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-white/5 p-6 rounded-3xl flex gap-4 items-start border border-white/10 shadow-lg"
      >
        <div className="p-2 rounded-lg bg-primary/10">
          <Info className="h-5 w-5 text-primary shrink-0" />
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground leading-relaxed uppercase tracking-[0.1em] font-headline">
            <span className="text-white font-bold">ANALYTIC_DISCLAIMER:</span> This is a decision-support module. 
            All risk indicators are derived from public telemetry patterns and must be validated 
            by authorized security protocols before escalations.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
