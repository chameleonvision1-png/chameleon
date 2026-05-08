"use client";

import React from 'react';
import { useSync } from './SyncProviders';
import { Search, MessageCircle, Zap } from 'lucide-react';

export default function SyncHowItWorks() {
  const { t } = useSync();

  return (
    <section id="how-it-works" className="py-24 relative z-10" style={{ background: 'rgba(11, 19, 43, 0.5)' }}>
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-12 2xl:px-24">
        <h2 className="sync-heading text-4xl md:text-5xl text-center mb-20">{t.howItWorksTitle}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--sync-blue), transparent)' }} />

          {/* Step 1 */}
          <div className="relative text-center">
            <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 relative z-10 shadow-xl transition-transform duration-300 hover:scale-110" style={{ background: 'var(--sync-surface)', border: '2px solid var(--sync-yellow)' }}>
              <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>1</span>
              <Search className="w-10 h-10" style={{ color: 'var(--sync-yellow)' }} />
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--sync-text-primary)' }}>{t.step1Title}</h3>
            <p className="opacity-70 max-w-xs mx-auto text-lg leading-relaxed" style={{ color: 'var(--sync-text-primary)' }}>{t.step1Desc}</p>
          </div>

          {/* Step 2 */}
          <div className="relative text-center">
            <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 relative z-10 shadow-xl transition-transform duration-300 hover:scale-110" style={{ background: 'var(--sync-surface)', border: '2px solid var(--sync-yellow)' }}>
              <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>2</span>
              <MessageCircle className="w-10 h-10" style={{ color: 'var(--sync-yellow)' }} />
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--sync-text-primary)' }}>{t.step2Title}</h3>
            <p className="opacity-70 max-w-xs mx-auto text-lg leading-relaxed" style={{ color: 'var(--sync-text-primary)' }}>{t.step2Desc}</p>
          </div>

          {/* Step 3 */}
          <div className="relative text-center">
            <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 relative z-10 shadow-xl transition-transform duration-300 hover:scale-110" style={{ background: 'var(--sync-surface)', border: '2px solid var(--sync-yellow)' }}>
              <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>3</span>
              <Zap className="w-10 h-10" style={{ color: 'var(--sync-yellow)' }} />
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--sync-text-primary)' }}>{t.step3Title}</h3>
            <p className="opacity-70 max-w-xs mx-auto text-lg leading-relaxed" style={{ color: 'var(--sync-text-primary)' }}>{t.step3Desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
