'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Shield, Zap, Activity, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, mode }: AuthModalProps) {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const features = mode === 'signup' 
    ? [
        { icon: Activity, text: "Deep Behavioral Audit" },
        { icon: Zap, text: "Real-time Risk Scoring" },
        { icon: Shield, text: "Supply Chain Intelligence" }
      ]
    : [
        { icon: CheckCircle2, text: "Access Saved Reports" },
        { icon: Shield, text: "Monitor Repositories" },
        { icon: Zap, text: "Advanced Threat Intel" }
      ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    if (mode === 'signup') {
      initiateEmailSignUp(auth, email, password);
    } else {
      initiateEmailSignIn(auth, email, password);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl glass-panel rounded-[3rem] overflow-hidden border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row min-h-[500px]"
          >
            {/* Visual/Feature Side */}
            <div className="w-full md:w-1/2 bg-primary/5 p-12 flex flex-col justify-between relative overflow-hidden border-r border-white/5">
              <div className="absolute top-0 left-0 w-full h-full scanning-sweep opacity-20 pointer-events-none" />
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
              
              <div className="relative z-10 space-y-8">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter text-white uppercase italic">
                    {mode === 'signup' ? (
                      <>START <span className="text-primary">SCANNING</span></>
                    ) : (
                      <>WELCOME <span className="text-secondary">BACK</span></>
                    )}
                  </h2>
                  <div className="h-1 w-24 bg-primary mt-4 rounded-full" />
                </motion.div>

                <div className="space-y-6 pt-8">
                  {features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + (i * 0.1) }}
                      className="flex items-center gap-4 group"
                    >
                      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-sm font-headline tracking-widest text-muted-foreground uppercase group-hover:text-white transition-colors">
                        {feature.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="text-[10px] font-headline tracking-[0.4em] text-muted-foreground/40 uppercase relative z-10">
                GITSENTINEL_CORE_AUTH_V4
              </div>
            </div>

            {/* Form Side */}
            <div className="w-full md:w-1/2 p-12 bg-card/20 relative">
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 text-muted-foreground hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              <form onSubmit={handleSubmit} className="h-full flex flex-col justify-center space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground flex items-center gap-2 pl-1">
                      <Mail className="h-3 w-3 text-primary" /> EMAIL_ADDRESS
                    </label>
                    <Input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="analyst@sentinel.core"
                      className="bg-white/5 border-white/10 focus:border-primary/50 rounded-2xl h-14 text-white font-body text-base px-6"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground flex items-center gap-2 pl-1">
                      <Lock className="h-3 w-3 text-secondary" /> {mode === 'signup' ? 'CREATE_SECURITY_KEY' : 'SECURITY_KEY'}
                    </label>
                    <Input 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-white/5 border-white/10 focus:border-secondary/50 rounded-2xl h-14 text-white font-body text-base px-6"
                    />
                  </div>
                </div>

                <Button 
                  type="submit"
                  className={cn(
                    "w-full h-16 rounded-2xl font-headline tracking-[0.2em] uppercase text-sm shadow-2xl group transition-all duration-500",
                    mode === 'signup' ? "bg-primary text-white glow-primary" : "bg-secondary text-black shadow-[0_0_30px_rgba(58,203,224,0.3)]"
                  )}
                >
                  <span className="flex items-center justify-center gap-3">
                    {mode === 'signup' ? 'INITIALIZE_ACCOUNT' : 'AUTHORIZE_ACCESS'}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {}} // This could toggle mode
                    className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors"
                  >
                    {mode === 'signup' ? 'ALREADY_HAVE_ACCESS?_LOGIN' : 'NEW_ANALYST?_REQUEST_SCAN_CLEARANCE'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
