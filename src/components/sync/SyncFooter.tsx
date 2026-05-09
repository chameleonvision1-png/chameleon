"use client";

import React from 'react';
import { useSync } from './SyncProviders';
import { ArrowUpRight } from 'lucide-react';

export default function SyncFooter() {
  const { t } = useSync();

  return (
    <footer className="relative z-10 pt-16 pb-8 border-t border-(--sync-border)" style={{ borderTopColor: 'rgba(255,255,255,0.05)', backgroundColor: 'var(--sync-surface)' }}>
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-12 2xl:px-24 flex flex-col items-center">
        <div className="mb-12 text-center flex flex-col items-center">
          <img src="/sync-logo.png" alt="SYNC" className="h-20 w-auto object-contain mb-6 drop-shadow-xl" />
          <p className="text-lg opacity-70 mb-8 max-w-md mx-auto" style={{ color: 'var(--sync-text-primary)' }}>
            {t.heroSubtitle}
          </p>
          <a href="https://www.facebook.com/share/1CS5uwBHrd/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-full hover:scale-105 transition-all shadow-xl" style={{ background: 'var(--sync-bg)', border: '2px solid var(--sync-yellow)', color: 'var(--sync-yellow)' }}>
            Contact Support <ArrowUpRight className="w-5 h-5" />
          </a>
        </div>
        
        <div className="w-full flex flex-col md:flex-row justify-between items-center text-sm pt-8 border-t border-(--sync-border)" style={{ color: 'var(--sync-text-dim)', borderTopColor: 'rgba(255,255,255,0.05)' }}>
          <p>© {new Date().getFullYear()} SYNC. All rights reserved.</p>
          <p className="mt-4 md:mt-0 font-semibold">{t.poweredBy}</p>
        </div>
      </div>
    </footer>
  );
}
