"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { logoPortfolio } from "@/data/content";

export default function LogoMarket() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="logos" className="relative py-28 lg:py-40 bg-[#0c0e13]" ref={ref}>
      <div className="section-container">
        {/* Header */}
        <motion.div
          className="mb-16 lg:mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
        >
          <p className="section-label">Logo Design</p>
          <h2 className="section-title">تصميم الشعارات</h2>
          <p className="section-subtitle">
            شعارات مصممة بعناية تعكس هوية علامتك التجارية
          </p>
        </motion.div>

        {/* Masonry grid */}
        <div className="columns-2 lg:columns-3 gap-6 space-y-6">
          {logoPortfolio.map((item, i) => (
            <motion.div
              key={item.id}
              className="break-inside-avoid surface group cursor-pointer overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
            >
              <div className={`relative ${i % 3 === 0 ? "aspect-square" : i % 2 === 0 ? "aspect-4/3" : "aspect-video"} bg-[#0e0e10] flex items-center justify-center`}>
                <span className="font-display text-5xl lg:text-6xl text-white/8 font-bold">
                  {item.name.charAt(0)}
                </span>
                {/* Hover */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/3 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="font-display text-sm text-white font-bold tracking-wider bg-[#080a0f]/80 px-4 py-2">
                    {item.name}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <a href="#contact" className="btn-primary">
            اطلب شعارك
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
