"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { aiTools } from "@/data/content";
import SectionHeader from "./SectionHeader";

const SYNC_URL = process.env.NEXT_PUBLIC_SYNC_URL || 'https://sync.chameleon.vision';

export default function AITools() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="ai-tools" className="relative section-py bg-[#080a0f]" ref={ref}>
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-white/2 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-white/2 rounded-full blur-[100px]" />
      </div>

      <div className="section-container relative z-10">
        {/* Header */}
        <SectionHeader
          badge="AI & Software Deals"
          title={
            <a href={SYNC_URL} className="inline-block hover:opacity-80 transition-opacity">
              <img src="/sync-logo.png" alt="SYNC" className="h-20 w-auto object-contain scale-150" />
            </a>
          }
          description="اشتراكات مخفضة لأقوى الأدوات — وفّر وارتقِ بمستوى عملك مع باقات حصرية"
        />

        {/* Dynamic Grid / Carousel */}
        <div className="flex w-full overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-6 lg:gap-8 mb-4 md:mb-16 pb-8 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {aiTools.slice(0, 3).map((tool, i) => (
            <motion.div
              key={tool.name}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="min-w-[85vw] sm:min-w-[320px] md:min-w-0 flex justify-center snap-center"
            >
              <ChameleonGiftCard 
                name={tool.name} 
                price={tool.salePrice} 
                original={tool.originalPrice} 
                discount={`${tool.discount}% OFF`} 
                period="1-Month Access" 
                image={`/sync/covers/${tool.name.split(' ')[0].toLowerCase()}.png`} 
                featured={tool.bestOffer} 
              />
            </motion.div>
          ))}
        </div>

        {/* Mobile Scroll Indicator */}
        <div className="md:hidden flex justify-center items-center gap-3 mt-4 mb-8 opacity-50">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-pulse rotate-180">
            <path d="M9 18l6-6-6-6" />
          </svg>
          <span className="text-xs font-arabic tracking-wide uppercase">اسحب للمزيد</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-pulse">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </section>
  );
}

function ChameleonGiftCard({ name, price, original, discount, period, image, featured = false }: any) {
  return (
    <div className={`w-full max-w-[320px] rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between backdrop-blur-md bg-[#111319] transition-all duration-500 hover:scale-105 cursor-pointer`} 
         style={{ 
           border: featured ? '2px solid #ffc21a' : '1px solid rgba(255,255,255,0.1)',
           height: '420px',
           boxShadow: featured ? '0 20px 50px rgba(255, 194, 26, 0.15)' : '0 20px 40px rgba(0,0,0,0.5)'
         }}>
      
      {/* Top section */}
      <div className="p-6 pb-2 border-b border-white/10 relative">
        <div className="flex justify-between items-start mb-4">
          <img src="/sync-logo.png" alt="SYNC" className="h-12 w-auto object-contain scale-[1.7] -ml-2 -mt-2" />
          <span className="font-bold text-lg text-[#ffc21a]">{discount}</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">{name}</h3>
        <p className="text-[#ffc21a] text-sm font-semibold">{period}</p>
        
        {/* Peg hole punch */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-10 h-2 bg-[#080a0f] rounded-full border border-white/10 opacity-80"></div>
      </div>

      {/* Middle section */}
      <div className="grow p-4">
        <div className="w-full h-full rounded-xl border flex flex-col items-center justify-center p-0 relative overflow-hidden group/card" 
             style={{ 
               borderColor: 'rgba(255,255,255,0.1)',
               background: featured ? 'linear-gradient(135deg, rgba(255,194,26,0.1) 0%, transparent 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)'
             }}>
          
          {/* Fallback Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
            <span className="text-xs opacity-60 mb-2 uppercase tracking-widest text-white">Premium Access</span>
            <span className="font-black italic text-3xl mb-4 text-[#ffc21a]" style={{ filter: 'drop-shadow(0 0 8px rgba(255,194,26,0.4))' }}>{name.split(' ')[0]}</span>
          </div>

          {/* Image */}
          <img 
            src={image} 
            alt={name} 
            className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700 opacity-90 z-10" 
            onError={(e: any) => { e.target.style.display = 'none'; }} 
          />
        </div>
      </div>

      {/* Bottom section */}
      <div className="p-6 pt-4 flex justify-between items-end border-t border-white/10">
        <div>
          <p className="text-[10px] opacity-60 uppercase tracking-widest mb-1 text-white">Original Value</p>
          <p className="line-through opacity-50 text-white">{original}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest mb-1 text-[#ffc21a]">Only</p>
          <p className="text-3xl font-bold text-[#ffc21a]">{price}</p>
        </div>
      </div>
    </div>
  );
}
