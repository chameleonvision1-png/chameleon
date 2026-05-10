"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, X } from 'lucide-react';
import { useSync } from './SyncProviders';

export default function SyncPrivacyBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const { t, lang } = useSync();

  useEffect(() => {
    // Check if the user has already accepted the privacy policy
    const hasAccepted = localStorage.getItem('sync_privacy_accepted');
    if (!hasAccepted) {
      // Show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleAccept();
    }
  }, [isVisible, timeLeft]);

  const handleAccept = () => {
    localStorage.setItem('sync_privacy_accepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 ${lang === 'ar' ? 'left-4 right-4 md:left-auto md:right-8' : 'right-4 left-4 md:right-auto md:left-8'} md:w-96 bg-(--sync-surface) border border-(--sync-border) rounded-2xl shadow-2xl p-5 z-50 overflow-hidden`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Background glow */}
      <div className={`absolute -top-10 ${lang === 'ar' ? '-right-10' : '-left-10'} w-32 h-32 bg-(--sync-yellow) opacity-10 rounded-full blur-2xl pointer-events-none`}></div>
      
      <button 
        onClick={handleAccept}
        className={`absolute top-3 ${lang === 'ar' ? 'left-3' : 'right-3'} text-(--sync-text-dim) hover:text-white transition-colors`}
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-4 mb-3">
        <div className="w-8 h-8 rounded-full bg-(--sync-yellow)/10 flex items-center justify-center border border-(--sync-yellow)/20 shrink-0 mt-1">
          <ShieldAlert className="w-4 h-4 text-(--sync-yellow)" />
        </div>
        <div>
          <h3 className="text-white text-sm font-bold mb-1">{t.bannerTitle}</h3>
          <p className="text-(--sync-text-dim) text-xs leading-relaxed">
            {t.bannerDesc}
          </p>
        </div>
      </div>

      <div className="bg-(--sync-bg) rounded-lg p-3 mb-4 border border-(--sync-border)">
        <p className="text-[11px] text-(--sync-text-dim) leading-relaxed">
          {t.bannerQuote}
        </p>
        <Link href="/privacy-policy" className="text-(--sync-yellow) text-[11px] font-semibold mt-1 inline-block hover:underline">
          {t.bannerReadMore}
        </Link>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="text-[10px] text-(--sync-text-dim) flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-(--sync-yellow) opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-(--sync-yellow)"></span>
          </span>
          {t.bannerAutoAccept} <span className="text-white font-mono font-bold w-4 text-center">{timeLeft}</span> {t.bannerSeconds}
        </div>
        <button 
          onClick={handleAccept}
          className="text-xs font-bold text-(--sync-bg) bg-(--sync-yellow) px-4 py-1.5 rounded-full hover:scale-105 transition-transform"
        >
          {t.bannerAcceptBtn}
        </button>
      </div>
    </div>
  );
}
