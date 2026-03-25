'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  // Do not show the navbar on scanning pages to maintain focus
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
      </div>
    </nav>
  );
}
