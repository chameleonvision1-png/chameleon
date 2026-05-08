"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { enterpriseSolutions } from "@/data/content";
import SectionHeader from "./SectionHeader";

const icons: Record<string, React.ReactNode> = {
  "map-pin": (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  monitor: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  building: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22V18h6v4" />
      <path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
    </svg>
  ),
};

export default function EnterpriseSolutions() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="enterprise" className="relative section-py bg-[#0c0e13]" ref={ref}>
      <div className="section-container relative z-10">
        {/* Header */}
        <SectionHeader
          badge="Enterprise Solutions"
          title="حلول المؤسسات"
          description="حلول رقمية متكاملة مصممة خصيصاً لتلبية احتياجات المؤسسات والشركات الكبرى"
        />

        {/* Z-pattern solutions */}
        <div className="flex flex-col gap-8 lg:gap-16 relative">
          {/* Decorative connecting line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-white/10 to-transparent -translate-x-1/2 z-0" />

          {enterpriseSolutions.map((sol, i) => (
            <motion.div
              key={sol.id}
              className={`relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-24 group ${
                i % 2 !== 0 ? "lg:flex-row-reverse" : ""
              }`}
              initial={false}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
            >
              {/* Visual/Icon Side */}
              <div className="w-full lg:w-1/2 flex justify-center">
                <div className="relative w-48 h-48 lg:w-72 lg:h-72 rounded-4xl bg-[#111319] border border-white/5 flex items-center justify-center transform group-hover:scale-105 group-hover:-rotate-2 transition-all duration-700 shadow-2xl">
                  <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent rounded-4xl" />
                  <div className="relative z-10 text-white/50 group-hover:text-white transition-colors duration-500 scale-150">
                    {icons[sol.icon]}
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 transform rotate-12 animate-pulse" />
                  <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-white/10 rounded-full backdrop-blur-md border border-white/10 transform -rotate-12" />
                </div>
              </div>

              {/* Content Side */}
              <div className={`w-full lg:w-1/2 ${i % 2 !== 0 ? "lg:text-right" : ""}`}>
                <p className="font-display text-[10px] tracking-[0.3em] text-white/30 mb-4 uppercase">
                  {sol.titleEn}
                </p>
                <h3 className="font-arabic text-3xl lg:text-4xl font-bold text-white mb-6">
                  {sol.title}
                </h3>
                <p className="font-arabic text-lg text-white/40 leading-relaxed mb-8">
                  {sol.description}
                </p>
                
                <button className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-arabic hover:bg-white hover:text-black transition-colors duration-300">
                  تفاصيل الحل
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="mt-20 text-center flex justify-center relative z-10"
          initial={false}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full w-96 h-96 mx-auto pointer-events-none" />
          <a href="#contact" className="relative px-14 py-6 bg-white text-black font-arabic font-bold text-lg rounded-2xl hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.3)] flex items-center gap-4">
            احجز استشارة لمؤسستك
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
