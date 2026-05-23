"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useSync } from './SyncProviders';
import { ArrowUpRight } from 'lucide-react';

export default function SyncFooter() {
  const pathname = usePathname();
  const { t } = useSync();

  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/') || pathname === '/sync/admin' || pathname.startsWith('/sync/admin/');

  if (isAdminPage) return null;

  return (
    <footer className="relative z-10 pt-16 pb-8 border-t border-(--sync-border)" style={{ borderTopColor: 'var(--sync-border)', backgroundColor: 'var(--sync-surface)' }}>
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-12 2xl:px-24 flex flex-col items-center">
        <div className="mb-12 text-center flex flex-col items-center">
          <img src="/sync-logo.png" alt="SYNC" className="h-20 w-auto object-contain mb-6 drop-shadow-xl" />
          <p className="text-lg opacity-70 mb-8 max-w-md mx-auto" style={{ color: 'var(--sync-text-primary)' }}>
            {t.heroSubtitle}
          </p>
          <a href="https://www.facebook.com/share/1CS5uwBHrd/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-full hover:scale-105 transition-all shadow-xl" style={{ background: 'var(--sync-yellow)', color: 'var(--sync-text-on-yellow)' }}>
            Contact Support <ArrowUpRight className="w-5 h-5" />
          </a>
        </div>
        
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 text-sm pt-8 border-t border-(--sync-border)" style={{ color: 'var(--sync-text-dim)', borderTopColor: 'var(--sync-border)' }}>
          <p className="text-center md:text-left">© {new Date().getFullYear()} SYNC. All rights reserved.</p>
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-xs font-semibold opacity-60">
            <a href="/privacy-policy" className="hover:text-(--sync-yellow) transition-colors text-center">
              {t.privacyPolicy}
            </a>
            <span className="hidden md:inline opacity-30">•</span>
            <p className="font-semibold text-center">{t.poweredBy}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
