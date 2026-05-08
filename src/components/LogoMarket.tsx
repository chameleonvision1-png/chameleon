"use client";

import React, { useRef, useState, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import { logoPortfolio } from "@/data/content";
import SectionHeader from "./SectionHeader";
import { FlipReveal, FlipRevealItem } from "@/components/ui/flip-reveal";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function LogoMarket() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [filterKey, setFilterKey] = useState("all");

  const categories = useMemo(() => {
    const cats = new Set(logoPortfolio.map(item => item.category));
    return ["all", ...Array.from(cats)];
  }, []);

  return (
    <section id="logos" className="relative section-py bg-[#0c0e13]" ref={ref}>
      <div className="section-container relative z-10">
        {/* Header */}
        <SectionHeader
          badge="Logo Design"
          title="تصميم الشعارات"
          description="شعارات مصممة بعناية تعكس هوية علامتك التجارية بلمسة احترافية"
        />

        {/* Filter Toggle Group */}
        <div className="flex justify-center mb-10">
          <ToggleGroup
            type="single"
            className="flex-wrap bg-[#111319] rounded-2xl border border-white/5 p-1 gap-1 w-full max-w-fit justify-center"
            value={filterKey}
            onValueChange={(val) => {
              if (val) setFilterKey(val);
            }}
          >
            {categories.map(cat => (
              <ToggleGroupItem
                key={cat}
                value={cat}
                className="px-4 py-2 font-display text-xs tracking-wider uppercase whitespace-nowrap data-[state=on]:bg-white data-[state=on]:text-black text-white/70 hover:bg-white/10 rounded-xl transition-all"
              >
                {cat === "all" ? "الكل" : cat}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Flip Reveal Grid */}
        <FlipReveal 
          keys={[filterKey]} 
          showClass="block" 
          hideClass="hidden" 
          className="flex w-full overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 pb-8 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {logoPortfolio.map((item, i) => (
            <FlipRevealItem
              key={item.id}
              flipKey={item.category}
              className="min-w-[85vw] sm:min-w-[320px] md:min-w-0 snap-center shrink-0 relative rounded-3xl group cursor-pointer overflow-hidden border border-white/5 bg-[#111319] w-full"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  // Trigger click action here
                }
              }}
            >
              <div className="relative aspect-4/3 flex items-center justify-center">
                <span className="font-display text-6xl lg:text-8xl text-white/5 font-bold group-hover:scale-110 group-focus:scale-110 transition-transform duration-700">
                  {item.name.charAt(0)}
                </span>
                
                {/* Overlay reveal */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-500 flex items-end justify-center p-6">
                  <span className="font-display text-sm text-white font-bold tracking-wider px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 transform translate-y-4 group-hover:translate-y-0 group-focus:translate-y-0 transition-transform duration-500">
                    {item.name}
                  </span>
                </div>
              </div>
            </FlipRevealItem>
          ))}
        </FlipReveal>

        {/* Mobile Scroll Indicator */}
        <div className="md:hidden flex justify-center items-center gap-3 mt-6 mb-4 opacity-50">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-pulse rotate-180">
            <path d="M9 18l6-6-6-6" />
          </svg>
          <span className="text-xs font-arabic tracking-wide uppercase">اسحب للمزيد</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-pulse">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>

        {/* CTA */}
        <motion.div
          className="mt-16 text-center flex justify-center"
          initial={false}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <a href="#contact" className="px-8 py-4 bg-white text-black font-arabic font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center gap-3">
            اطلب شعارك
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
