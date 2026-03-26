'use client';

import React, { useState, createContext, useContext, ReactNode } from 'react';
import AuthModal from './AuthModal';

interface AuthModalContextType {
  openLogin: () => void;
  openSignup: () => void;
  close: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalManagerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('signup');

  const openLogin = () => {
    setMode('login');
    setIsOpen(true);
  };

  const openSignup = () => {
    setMode('signup');
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  return (
    <AuthModalContext.Provider value={{ openLogin, openSignup, close }}>
      {children}
      <AuthModal isOpen={isOpen} onClose={close} mode={mode} />
    </AuthModalContext.Provider>
  );
}

export const useAuthModals = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModals must be used within AuthModalManagerProvider');
  }
  return context;
};
