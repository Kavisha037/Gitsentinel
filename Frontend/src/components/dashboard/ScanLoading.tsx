
"use client";

import { Activity, Shield, Zap, Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function ScanLoading() {
  const [step, setStep] = useState(0);
  const steps = [
    "Fetching historical commit data...",
    "Validating contributor identities...",
    "Analyzing CI/CD configuration drift...",
    "Correlating dependency injection vectors...",
    "Finalizing behavioral risk score..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="relative mb-12">
        <div className="absolute -inset-8 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="relative h-32 w-32 flex items-center justify-center">
          <Activity className="h-16 w-16 text-primary animate-pulse" />
          <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
      
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-2xl font-bold font-headline tracking-widest uppercase">Deep Repository Scan</h2>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-progress-indefinite" />
        </div>
        <p className="text-sm text-muted-foreground font-mono animate-pulse">{steps[step]}</p>
      </div>

      <div className="grid grid-cols-3 gap-8 mt-16 opacity-50">
        <div className="flex flex-col items-center gap-2">
          <Shield className="h-6 w-6 text-secondary" />
          <span className="text-[10px] font-headline uppercase">Baseline</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-[10px] font-headline uppercase">Context</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Search className="h-6 w-6 text-white" />
          <span className="text-[10px] font-headline uppercase">Logic</span>
        </div>
      </div>
    </div>
  );
}
