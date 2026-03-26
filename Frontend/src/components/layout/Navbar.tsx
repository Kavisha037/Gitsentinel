'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@/firebase';
import { useAuthModals } from '@/components/auth/AuthModalManager';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const { openLogin, openSignup } = useAuthModals();

  if (pathname.startsWith('/scan')) {
    return null;
  }

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 p-6 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all backdrop-blur-sm shadow-2xl">
            <Shield className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-headline font-bold text-lg tracking-tighter text-white drop-shadow-md">
            GIT<span className="text-primary italic">SENTINEL</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Button 
                variant="ghost" 
                onClick={openLogin}
                className="text-[10px] font-headline tracking-widest uppercase text-white hover:text-primary hover:bg-white/5"
              >
                LOGIN
              </Button>
              <Button 
                onClick={openSignup}
                className="bg-primary glow-primary text-[10px] font-headline tracking-widest uppercase rounded-xl h-10 px-6"
              >
                SIGN UP
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-1.5 pl-4 backdrop-blur-xl">
              <span className="text-[10px] font-headline tracking-widest text-muted-foreground uppercase hidden md:block">
                {user.email?.split('@')[0]}
              </span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => signOut(auth)}
                className="h-8 w-8 rounded-xl hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
