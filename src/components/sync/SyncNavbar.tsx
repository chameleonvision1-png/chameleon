"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSync } from './SyncProviders';
import { Moon, Sun, Globe } from 'lucide-react';

export default function SyncNavbar() {
  const { lang, setLang, theme, setTheme, t } = useSync();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-(--sync-bg)/80 backdrop-blur-lg border-b border-(--sync-border) shadow-lg' : 'bg-transparent border-b border-transparent'}`}>
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-12 2xl:px-24">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <img src="/sync-logo.png" alt="SYNC" className="h-12 md:h-16 w-auto object-contain scale-125 md:scale-150 origin-left md:-ml-4" />
            </Link>
          </div>

          {/* Center Links */}
          <div className="hidden md:block">
            <div className="flex items-baseline space-x-8">
              <a href="#deals" className="hover:text-(--sync-yellow) px-3 py-2 rounded-md text-sm font-semibold transition-colors uppercase tracking-wider">{t.navDeals}</a>
              <a href="#how-it-works" className="hover:text-(--sync-yellow) px-3 py-2 rounded-md text-sm font-semibold transition-colors uppercase tracking-wider">{t.navHowItWorks}</a>
              <a href="#why-sync" className="hover:text-(--sync-yellow) px-3 py-2 rounded-md text-sm font-semibold transition-colors uppercase tracking-wider">{t.navWhySync}</a>
              <a href="#faq" className="hover:text-(--sync-yellow) px-3 py-2 rounded-md text-sm font-semibold transition-colors uppercase tracking-wider">{t.navFAQ}</a>
            </div>
          </div>

          {/* Right Toggles */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-2 hover:text-(--sync-yellow) transition-colors p-2"
              aria-label="Toggle Language"
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm font-bold">{lang === 'en' ? 'AR' : 'EN'}</span>
            </button>
            <button 
              onClick={() => setTheme(theme === 'sync-dark' ? 'sync-light' : 'sync-dark')}
              className="p-2 hover:text-(--sync-yellow) transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'sync-dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
