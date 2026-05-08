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

        {/* Dynamic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {aiTools.map((tool, i) => (
            <motion.div
              key={tool.name}
              className="group relative bg-[#111319] hover:bg-[#151820] border border-white/5 hover:border-white/10 p-10 rounded-3xl transition-all duration-500 overflow-hidden flex flex-col"
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Background glow effect on hover */}
              <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

              {/* Best deal badge */}
              {tool.bestOffer && (
                <div className="absolute top-0 left-8 bg-white text-black font-arabic text-xs font-bold px-4 py-2 rounded-b-xl shadow-lg z-20 transform origin-top group-hover:scale-110 transition-transform">
                  أفضل عرض
                </div>
              )}

              {/* Animated Glow */}
              <div className="absolute -inset-24 bg-linear-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full duration-1000 transform transition-all ease-in-out pointer-events-none skew-x-12" />

              <div className="relative z-10 flex-1 flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <span className="font-display text-xl font-bold text-white/80">{tool.name.charAt(0)}</span>
                </div>
                
                <h3 className="font-display text-xl font-bold text-white mb-4 tracking-wide">
                  {tool.name}
                </h3>
                <p className="font-arabic text-sm text-white/40 mb-6 leading-[1.8] flex-1">{tool.description}</p>

                {/* Pricing Area */}
                <div className="p-5 rounded-2xl bg-black/40 border border-white/5 mb-6">
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="font-display text-[10px] tracking-widest text-white/40 uppercase">Price</span>
                    <div className="flex items-baseline gap-2" dir="ltr">
                      <span className="font-display text-4xl font-bold text-white">{tool.salePrice}</span>
                      <span className="font-display text-sm text-white/30 line-through">{tool.originalPrice}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-arabic text-xs text-white/50">نسبة الخصم</span>
                    <span className="bg-white/10 text-white font-display text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10">
                      -{tool.discount}%
                    </span>
                  </div>
                </div>

                {/* CTA */}
                {(tool as any).link ? (
                  <a href={(tool as any).link} target="_blank" rel="noopener noreferrer" className="block text-center w-full py-4 bg-transparent border border-white/20 text-white font-arabic font-bold rounded-xl group-hover:bg-white group-hover:text-black transition-colors duration-300">
                    احصل على العرض
                  </a>
                ) : (
                  <button type="button" className="w-full py-4 bg-transparent border border-white/20 text-white font-arabic font-bold rounded-xl group-hover:bg-white group-hover:text-black transition-colors duration-300">
                    احصل على العرض
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA to visit SYNC */}
        <motion.div
          className="mt-16 text-center flex justify-center"
          initial={false}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <a href={SYNC_URL} className="px-8 py-4 bg-white text-black font-arabic font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center gap-3">
            استكشف منصة SYNC
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
