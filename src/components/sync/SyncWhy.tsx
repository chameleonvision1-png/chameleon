"use client";

import React from 'react';
import { useSync } from './SyncProviders';
import { PiggyBank, ShieldCheck, Headphones, Zap } from 'lucide-react';

export default function SyncWhy() {
  const { t, lang } = useSync();

  const features = [
    { title: t.why1Title, desc: t.why1Desc, icon: PiggyBank },
    { title: t.why2Title, desc: t.why2Desc, icon: ShieldCheck },
    { title: t.why3Title, desc: t.why3Desc, icon: Headphones },
    { title: t.why4Title, desc: t.why4Desc, icon: Zap },
  ];

  return (
    <section id="why-sync" className="py-24 relative z-10">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-12 2xl:px-24">
        <h2 className="sync-heading text-4xl md:text-5xl text-center mb-16 flex items-center justify-center gap-3">
          {lang === 'en' ? 'Why' : 'ليه'}
          <img src="/sync-logo.png" alt="SYNC" className="h-12 md:h-16 w-auto object-contain scale-150 inline-block mx-4" />
          {lang === 'en' ? '?' : '؟'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl" style={{ background: 'var(--sync-surface)', border: '1px solid var(--sync-border)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(255, 194, 26, 0.1)' }}>
                <feature.icon className="w-8 h-8" style={{ color: 'var(--sync-yellow)' }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--sync-text-primary)' }}>{feature.title}</h3>
              <p className="opacity-70 text-base leading-relaxed" style={{ color: 'var(--sync-text-primary)' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
