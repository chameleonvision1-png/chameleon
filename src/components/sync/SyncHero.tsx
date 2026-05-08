"use client";

import React from 'react';
import { useSync } from './SyncProviders';
import { ChevronRight, Zap, Cloud, Bot, Sparkles } from 'lucide-react';



export default function SyncHero() {
  const { t, lang } = useSync();

  return (
    <div className="relative min-h-[110vh] flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Background Orbits */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="sync-orbit-line sync-orbit-animate w-[600px] h-[600px]" />
        <div className="sync-orbit-line sync-orbit-animate w-[1000px] h-[1000px]" style={{ animationDirection: 'reverse', animationDuration: '90s' }} />
      </div>

      {/* Radial Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[800px] h-[800px] rounded-full" style={{ background: 'radial-gradient(circle, var(--sync-glow) 0%, transparent 70%)' }} />
      </div>



      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 2xl:px-24 text-center flex flex-col items-center">
        {/* Giant Logo */}
        <div className="mb-4">
          <img src="/sync-logo.png" alt="SYNC" className="h-32 md:h-48 lg:h-56 w-auto object-contain drop-shadow-[0_4px_20px_rgba(255,194,26,0.3)]" />
        </div>
        
        <h1 className="sync-heading text-4xl md:text-6xl lg:text-7xl mb-4 tracking-tight max-w-4xl mx-auto uppercase">
          {t.heroTitle}
        </h1>
        
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-16 text-[var(--sync-yellow)] font-medium">
          {t.heroSubtitle}
        </p>

        {/* 3 Gift Cards Display */}
        <div className="relative w-full max-w-4xl h-[450px] md:h-[550px] mb-16 flex justify-center items-center">
          
          {/* Card 1 - Left */}
          <div 
            className="absolute left-[15%] md:left-[20%] transform -translate-x-1/2 -rotate-12 hover:rotate-0 hover:z-30 transition-all duration-500 hover:scale-105 z-10 cursor-pointer"
            onClick={() => document.getElementById('deals')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <GiftCard name="ChatGPT Plus" price="$8.96" original="$20.00" discount="55% OFF" period="100-Day Access" image="/sync/covers/chatgpt.png" />
          </div>

          {/* Card 3 - Right */}
          <div 
            className="absolute left-[85%] md:left-[80%] transform -translate-x-1/2 rotate-12 hover:rotate-0 hover:z-30 transition-all duration-500 hover:scale-105 z-10 cursor-pointer"
            onClick={() => document.getElementById('deals')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <GiftCard name="Claude Pro" price="$9.96" original="$20.00" discount="50% OFF" period="100-Day Access" image="/sync/covers/claude.png" />
          </div>

          {/* Card 2 - Center (Highest Z-index) */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 hover:scale-110 hover:-translate-y-4 transition-all duration-500 z-20 cursor-pointer drop-shadow-2xl"
            onClick={() => document.getElementById('deals')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <GiftCard name="Gemini Advanced" price="$16.96" original="$369.00" discount="98% OFF" period="18-Month Access" featured={true} image="/sync/covers/gemini.png" />
          </div>

        </div>
        
        <button className="sync-button-primary px-8 py-4 text-lg inline-flex items-center gap-2 mb-16">
          {t.heroCta} <ChevronRight className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Feature Bar */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 opacity-80 border-t border-(--sync-border) pt-8 w-full">
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5" style={{ color: 'var(--sync-yellow)' }} />
            <span className="font-semibold text-sm md:text-base">{t.heroFeature1}</span>
          </div>
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5" style={{ color: 'var(--sync-yellow)' }} />
            <span className="font-semibold text-sm md:text-base">{t.heroFeature2}</span>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5" style={{ color: 'var(--sync-yellow)' }} />
            <span className="font-semibold text-sm md:text-base">{t.heroFeature3}</span>
          </div>
          <div className="flex items-center gap-3">
            <Cloud className="w-5 h-5" style={{ color: 'var(--sync-yellow)' }} />
            <span className="font-semibold text-sm md:text-base">{t.heroFeature4}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function GiftCard({ name, price, original, discount, period, image, featured = false }: any) {
  return (
    <div className={`w-[240px] md:w-[320px] rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between backdrop-blur-md`} 
         style={{ 
           backgroundColor: 'var(--sync-surface)', 
           border: featured ? '2px solid var(--sync-yellow)' : '1px solid var(--sync-border)',
           height: featured ? '480px' : '420px',
           boxShadow: featured ? '0 20px 50px rgba(255, 194, 26, 0.15)' : '0 20px 40px rgba(0,0,0,0.5)'
         }}>
      
      {/* Top section */}
      <div className="p-6 pb-2 border-b border-(--sync-border) relative" style={{ borderBottomColor: 'rgba(255,255,255,0.1)' }}>
        <div className="flex justify-between items-start mb-4">
          <img src="/sync-logo.png" alt="SYNC" className="h-12 w-auto object-contain scale-[1.7] -ml-2 -mt-2" />
          <span className="font-bold text-lg" style={{ color: 'var(--sync-yellow)' }}>{discount}</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-1" style={{ color: 'var(--sync-text-primary)' }}>{name}</h3>
        <p style={{ color: 'var(--sync-yellow)' }} className="text-sm font-semibold">{period}</p>
        
        {/* Peg hole punch */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-10 h-2 bg-(--sync-bg) rounded-full border border-(--sync-border)" style={{ opacity: 0.8 }}></div>
      </div>

      {/* Middle section (Golden/Blue Ticket area) */}
      <div className="grow p-4">
        <div className="w-full h-full rounded-xl border flex flex-col items-center justify-center p-0 relative overflow-hidden group/card" 
             style={{ 
               borderColor: 'var(--sync-border)',
               background: featured ? 'linear-gradient(135deg, rgba(255,194,26,0.1) 0%, transparent 100%)' : 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, transparent 100%)'
             }}>
          {image ? (
            <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700 opacity-90" />
          ) : (
            <>
              <span className="text-xs opacity-60 mb-2 uppercase tracking-widest" style={{ color: 'var(--sync-text-primary)' }}>Premium Access</span>
              <span className="font-black italic text-3xl md:text-4xl mb-4" style={{ color: 'var(--sync-yellow)', filter: 'drop-shadow(0 0 8px rgba(255,194,26,0.4))' }}>PRODUCTS</span>
              
              {/* Small icons row */}
              <div className="flex gap-3 opacity-80">
                <Bot className="w-5 h-5" style={{ color: 'var(--sync-yellow)' }} />
                <Sparkles className="w-5 h-5" style={{ color: 'var(--sync-yellow)' }} />
                <Zap className="w-5 h-5" style={{ color: 'var(--sync-yellow)' }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom section */}
      <div className="p-6 pt-4 flex justify-between items-end border-t border-(--sync-border)" style={{ borderTopColor: 'rgba(255,255,255,0.1)' }}>
        <div>
          <p className="text-[10px] opacity-60 uppercase tracking-widest mb-1" style={{ color: 'var(--sync-text-primary)' }}>Original Value</p>
          <p className="line-through opacity-50" style={{ color: 'var(--sync-text-primary)' }}>{original}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--sync-yellow)' }}>Only</p>
          <p className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--sync-yellow)' }}>{price}</p>
        </div>
      </div>
    </div>
  );
}
