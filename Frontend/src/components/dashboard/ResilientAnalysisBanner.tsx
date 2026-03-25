"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Activity, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ResilientAnalysisBannerProps {
  errorMessage: string;
}

export default function ResilientAnalysisBanner({ errorMessage }: ResilientAnalysisBannerProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);
  const [showDetails, setShowDetails] = useState(false);
  const isRateLimit = errorMessage.toLowerCase().includes("quota") || errorMessage.includes("429");

  useEffect(() => {
    if (!isRateLimit) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.refresh();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRateLimit, router]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mb-8"
    >
      <div className="glass-panel p-6 rounded-[2rem] border-amber-500/20 bg-amber-500/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity className="h-16 w-16 text-amber-500 animate-pulse" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-headline text-white mb-1">
                {isRateLimit ? "INTELLIGENT_THROTTLE_ACTIVE" : "AI_ENGINE_LATENCY_DETECTED"}
              </h3>
              <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-xl">
                {isRateLimit 
                  ? "High demand detected. GitSentinel is using rule-based heuristics while wait-queuing the full AI behavioral synthesis." 
                  : "We encountered an issue finalizing the AI model. Baseline security signals are being displayed."}
              </p>
              
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="mt-3 text-[10px] uppercase font-bold tracking-widest text-amber-500/60 hover:text-amber-500 flex items-center gap-1 transition-colors"
              >
                {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {showDetails ? "Hide technical trace" : "View technical trace"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isRateLimit && (
              <div className="text-right">
                <div className="text-[10px] uppercase font-headline tracking-widest text-amber-500/60 mb-1">Next Sync Attempt</div>
                <div className="text-2xl font-bold font-mono text-amber-500">00:{countdown.toString().padStart(2, '0')}</div>
              </div>
            )}
            <Button 
              onClick={() => router.refresh()}
              variant="outline" 
              className="border-amber-500/30 hover:bg-amber-500/10 text-amber-500 rounded-xl font-headline tracking-widest text-[10px]"
            >
              <RefreshCw className="h-3 w-3 mr-2" /> SYNC NOW
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-white/5 overflow-hidden"
            >
              <pre className="p-4 rounded-xl bg-black/40 text-[10px] font-mono text-amber-500/60 break-words whitespace-pre-wrap">
                {errorMessage}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
