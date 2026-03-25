"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Clock, Link as LinkIcon, ChevronRight } from "lucide-react";

interface TimelineEvent {
  date: string;
  event: string;
  severity: 'low' | 'medium' | 'high';
  correlationNote?: string;
}

export default function AnomaliesTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ScrollArea className="h-[450px] pr-6">
      <div className="space-y-10 relative before:absolute before:inset-y-0 before:left-3 before:w-px before:bg-gradient-to-b before:from-primary/50 before:via-white/10 before:to-transparent">
        {events.map((event, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative pl-12 group"
          >
            <div className={`absolute left-0 top-1.5 h-6 w-6 rounded-full border-4 border-background z-10 transition-all duration-500 group-hover:scale-125
              ${event.severity === 'high' ? 'bg-destructive glow-destructive' : event.severity === 'medium' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-secondary shadow-[0_0_10px_rgba(58,203,224,0.5)]'}`} 
            />
            
            <div className="glass-panel p-6 rounded-[2rem] border-white/5 hover:border-primary/40 transition-all duration-300 shadow-xl group-hover:bg-white/10 group-hover:translate-x-2">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-2 tracking-widest">
                  <Clock className="h-3 w-3 text-primary" /> {event.date}
                </span>
                <Badge variant="outline" className={`text-[9px] border-none font-headline tracking-widest px-3 py-1 rounded-lg
                  ${event.severity === 'high' ? 'bg-destructive/20 text-destructive' : 'bg-white/5 text-muted-foreground'}`}>
                  {event.severity.toUpperCase()}_PRIORITY
                </Badge>
              </div>
              
              <div className="flex items-start gap-4">
                <ChevronRight className="h-5 w-5 text-secondary shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h4 className="font-bold text-lg text-white group-hover:text-secondary transition-colors leading-tight">{event.event}</h4>
              </div>

              {event.correlationNote && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20 text-[11px] text-primary/90 mt-4 font-mono leading-relaxed"
                >
                  <LinkIcon className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>CORRELATION_SIGNAL: {event.correlationNote}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}
