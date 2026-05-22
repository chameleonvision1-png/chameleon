"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSync } from './SyncProviders';
import { useSyncAuth } from './SyncAuthProvider';
import { useSyncCart } from './SyncCartProvider';
import { Moon, Sun, Globe, ShoppingCart, User, LogOut, Wallet, Menu, X } from 'lucide-react';

export default function SyncNavbar() {
  const pathname = usePathname();
  const { lang, setLang, theme, setTheme, t } = useSync();
  const { user, profile, isAdmin, signOut } = useSyncAuth();
  const { totalItems, setIsCartOpen } = useSyncCart();

  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/') || pathname === '/sync/admin' || pathname.startsWith('/sync/admin/');

  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserMenu(false);
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showMobileMenu]);

  if (isAdminPage) return null;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-(--sync-bg)/80 backdrop-blur-lg border-b border-(--sync-border) shadow-lg' : 'bg-transparent border-b border-transparent'}`}>
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-12 2xl:px-24">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="shrink-0 flex items-center">
            {/* Mobile Menu Toggle */}
            <button onClick={() => setShowMobileMenu(true)} className="md:hidden p-2 mr-2 hover:text-(--sync-yellow) transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <img src="/sync-logo.png" alt="SYNC" className="h-10 md:h-16 w-auto object-contain scale-125 md:scale-150 origin-left ml-2 md:-ml-4" />
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

          {/* Right Controls */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Balance (logged in only) */}
            {user && profile && (
              <Link href="/dashboard" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-(--sync-yellow)/30 transition-all font-mono text-sm bg-black/20">
                <Wallet className="w-4 h-4" style={{ color: 'var(--sync-yellow)' }} />
                <span className="text-xs font-bold" style={{ color: 'var(--sync-yellow)' }}>${Number(profile.balance || 0).toFixed(2)}</span>
              </Link>
            )}

            {/* Cart */}
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 hover:text-(--sync-yellow) transition-colors" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>
                  {totalItems}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div className="relative hidden md:block">
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="p-2 hover:text-(--sync-yellow) transition-colors rounded-full border border-white/10">
                  <User className="w-4 h-4" />
                </button>
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 outline-none" 
                      onClick={() => setShowUserMenu(false)} 
                      onKeyDown={(e) => e.key === 'Escape' && setShowUserMenu(false)}
                      tabIndex={0}
                      role="button"
                      aria-label="Close user menu"
                    />
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden" style={{ background: '#0d1530' }}>
                      <div className="p-3 border-b border-white/10">
                        <p className="text-xs font-bold truncate">{profile?.full_name || 'User'}</p>
                        <p className="text-[10px] opacity-50 truncate">{user?.email}</p>
                      </div>
                      <Link href="/dashboard" className="block px-4 py-2.5 text-sm hover:bg-white/5 transition-colors" onClick={() => setShowUserMenu(false)}>
                        {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" className="block px-4 py-2.5 text-sm hover:bg-white/5 transition-colors" style={{ color: 'var(--sync-yellow)' }} onClick={() => setShowUserMenu(false)}>
                          {lang === 'ar' ? 'إدارة المتجر' : 'Admin Panel'}
                        </Link>
                      )}
                      <button onClick={() => { signOut(); setShowUserMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2">
                        <LogOut className="w-3.5 h-3.5" /> {lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>
                {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
              </Link>
            )}

            {/* Language */}
            <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="flex items-center gap-2 hover:text-(--sync-yellow) transition-colors p-2" aria-label="Toggle Language">
              <Globe className="w-5 h-5" />
              <span className="text-sm font-bold">{lang === 'en' ? 'AR' : 'EN'}</span>
            </button>

            {/* Theme */}
            <button onClick={() => setTheme(theme === 'sync-dark' ? 'sync-light' : 'sync-dark')} className="p-2 hover:text-(--sync-yellow) transition-colors" aria-label="Toggle Theme">
              {theme === 'sync-dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>

    {/* Mobile Sidebar */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-100 flex" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />
          <div className="relative w-64 sm:w-80 h-full shadow-2xl flex flex-col" style={{ background: 'var(--sync-surface)', borderRight: lang === 'en' ? '1px solid rgba(255,255,255,0.05)' : 'none', borderLeft: lang === 'ar' ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <img src="/sync-logo.png" alt="SYNC" className="h-8 w-auto object-contain" />
              <button onClick={() => setShowMobileMenu(false)} className="p-2 hover:text-(--sync-yellow) transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <a href="/#deals" onClick={() => setShowMobileMenu(false)} className="font-semibold text-lg hover:text-(--sync-yellow) transition-colors">{t.navDeals}</a>
                <a href="/#how-it-works" onClick={() => setShowMobileMenu(false)} className="font-semibold text-lg hover:text-(--sync-yellow) transition-colors">{t.navHowItWorks}</a>
                <a href="/#why-sync" onClick={() => setShowMobileMenu(false)} className="font-semibold text-lg hover:text-(--sync-yellow) transition-colors">{t.navWhySync}</a>
                <a href="/#faq" onClick={() => setShowMobileMenu(false)} className="font-semibold text-lg hover:text-(--sync-yellow) transition-colors">{t.navFAQ}</a>
              </div>
              
              <div className="h-px w-full bg-white/10" />
              
              <div className="flex flex-col gap-4">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 mb-2 p-3 rounded-xl bg-black/20 border border-white/5">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-(--sync-bg) flex items-center justify-center border border-(--sync-yellow)/30">
                        <User className="w-5 h-5 text-(--sync-yellow)" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold truncate">{profile?.full_name || 'User'}</p>
                        <p className="text-xs opacity-50 truncate">{user.email}</p>
                      </div>
                    </div>
                    
                    {profile && (
                      <Link href="/dashboard" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 font-mono text-sm p-3 rounded-xl bg-black/20 border border-white/5">
                        <Wallet className="w-4 h-4 text-(--sync-yellow)" />
                        <span className="text-(--sync-yellow) font-bold">Balance: ${Number(profile.balance || 0).toFixed(2)}</span>
                      </Link>
                    )}
                    
                    <Link href="/dashboard" onClick={() => setShowMobileMenu(false)} className="font-semibold p-3 rounded-xl hover:bg-white/5 transition-colors">
                      {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                    </Link>
                    
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setShowMobileMenu(false)} className="font-semibold text-(--sync-yellow) p-3 rounded-xl hover:bg-white/5 transition-colors">
                        {lang === 'ar' ? 'إدارة المتجر' : 'Admin Panel'}
                      </Link>
                    )}
                    
                    <button onClick={() => { signOut(); setShowMobileMenu(false); }} className="text-left font-semibold text-red-400 p-3 rounded-xl hover:bg-red-500/10 transition-colors flex items-center gap-2 mt-2">
                      <LogOut className="w-5 h-5" /> {lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                    </button>
                  </>
                ) : (
                  <Link href="/auth/login" onClick={() => setShowMobileMenu(false)} className="flex items-center justify-center w-full py-4 rounded-xl font-bold transition-all shadow-lg" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>
                    {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
