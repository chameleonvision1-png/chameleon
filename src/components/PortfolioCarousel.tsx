"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { portfolioItems } from "@/data/content";

export default function PortfolioCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="portfolio" className="relative py-28 lg:py-40 bg-[#0c0e13]" ref={ref}>
      <div className="section-container">
        {/* Header */}
        <motion.div
          className="mb-16 lg:mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="section-label">Our Work</p>
          <h2 className="section-title">أعمالنا</h2>
          <p className="section-subtitle">
            مشاريع حقيقية نفذناها بأعلى معايير الجودة والإبداع
          </p>
        </motion.div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {portfolioItems.slice(0, 4).map((item, i) => (
            <motion.div
              key={item.id}
              className="surface group cursor-pointer overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              {/* Browser mockup */}
              <div className="relative aspect-video bg-[#0e0e10]">
                {/* Chrome bar */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-[#1a1a1e] flex items-center px-4 gap-2 z-10">
                  <div className="w-2 h-2 rounded-full bg-white/10" />
                  <div className="w-2 h-2 rounded-full bg-white/10" />
                  <div className="w-2 h-2 rounded-full bg-white/10" />
                  <div className="flex-1 mx-6 h-3.5 bg-white/4" />
                </div>

                {/* Content placeholder */}
                <div className="absolute inset-0 top-8 flex items-center justify-center">
                  <div className="w-3/4 h-2/3 bg-white/2 flex flex-col items-center justify-center gap-3">
                    <span className="font-display text-4xl lg:text-5xl text-white/8">
                      {String(item.id).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Hover gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-[#191b21] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Info */}
              <div className="p-6 lg:p-8">
                <p className="font-display text-[10px] tracking-[0.3em] text-white/20 mb-2">
                  {item.titleEn}
                </p>
                <h3 className="font-arabic text-lg font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="font-arabic text-sm text-white/35 leading-relaxed mb-4">
                  {item.description}
                </p>
                <div className="flex items-center gap-2 text-white/15 group-hover:text-white/50 transition-colors">
                  <span className="font-display text-[10px] tracking-[0.2em]">VIEW PROJECT</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
