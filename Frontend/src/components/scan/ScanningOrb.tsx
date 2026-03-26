"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScanningOrbProps {
  progress: number;
  isActive: boolean;
}

export default function ScanningOrb({ progress, isActive }: ScanningOrbProps) {
  const isComplete = progress >= 100;

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
      {/* Background Glows */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: isComplete ? [0.4, 0.6, 0.4] : [0.1, 0.2, 0.1],
          backgroundColor: isComplete ? "rgba(58, 203, 224, 0.3)" : "rgba(38, 114, 255, 0.2)"
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-[-20%] rounded-full blur-3xl"
      />
      
      {/* Outer Rotating Ring */}
      <motion.div 
        animate={{ rotate: 360, scale: isComplete ? 1.2 : 1 }}
        transition={{ 
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 0.8 }
        }}
        className={`absolute inset-0 rounded-full border border-dashed ${isComplete ? 'border-secondary/60' : 'border-primary/30'}`}
      />
      
      {/* Secondary Counter-Rotating Ring */}
      <motion.div 
        animate={{ rotate: -360, scale: isComplete ? 1.1 : 1 }}
        transition={{ 
          rotate: { duration: 12, repeat: Infinity, ease: "linear" },
          scale: { duration: 0.8 }
        }}
        className={`absolute inset-4 rounded-full border border-t-secondary/60 border-b-secondary/60 ${isComplete ? 'border-secondary/40' : 'border-secondary/20'}`}
      />

      {/* Inner Glowing Orb */}
      <motion.div
        animate={{ 
          scale: isComplete ? [1, 1.1, 1] : [1, 1.05, 1],
          opacity: [0.9, 1, 0.9],
          boxShadow: isComplete 
            ? ["0 0 60px rgba(58, 203, 224, 0.6)", "0 0 100px rgba(58, 203, 224, 0.8)", "0 0 60px rgba(58, 203, 224, 0.6)"]
            : ["0 0 40px rgba(38, 114, 255, 0.3)", "0 0 70px rgba(58, 203, 224, 0.5)", "0 0 40px rgba(38, 114, 255, 0.3)"]
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute inset-12 rounded-full bg-gradient-to-br overflow-hidden flex items-center justify-center border border-white/20
          ${isComplete ? 'from-secondary via-secondary/80 to-primary' : 'from-primary via-primary/80 to-secondary'}`}
      >
        {/* Radar Line */}
        {!isComplete && (
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 z-10"
            style={{ background: 'conic-gradient(from 0deg, rgba(255,255,255,0.4) 0deg, transparent 90deg)' }}
          />
        )}

        {/* Vertical Scan Line */}
        <motion.div 
          animate={{ top: ['-10%', '110%'] }}
          transition={{ duration: isComplete ? 1.5 : 3.5, repeat: Infinity, ease: "linear" }}
          className={`absolute left-0 right-0 h-0.5 blur-[1px] z-20 ${isComplete ? 'bg-white' : 'bg-white/60'}`}
        />
        
        {/* Core Icon */}
        <div className="text-white relative z-30">
          <AnimatePresence mode="wait">
            {!isComplete ? (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
              >
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
            ) : (
              <motion.div
                key="completed"
                initial={{ scale: 0, rotate: -45, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Neural Particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            x: [Math.cos(i) * 130, Math.cos(i + 1) * (isComplete ? 180 : 150), Math.cos(i) * 130],
            y: [Math.sin(i) * 130, Math.sin(i + 1) * (isComplete ? 180 : 150), Math.sin(i) * 130],
            opacity: isComplete ? [0, 1, 0] : [0, 0.8, 0],
            scale: isComplete ? [0.8, 1.5, 0.8] : [0.5, 1, 0.5]
          }}
          transition={{
            duration: isComplete ? 2 + i % 2 : 4 + i % 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute h-1 w-1 rounded-full ${isComplete ? 'bg-white shadow-[0_0_15px_#fff]' : 'bg-secondary shadow-[0_0_12px_#3ACBE0]'}`}
        />
      ))}
    </div>
  );
}
