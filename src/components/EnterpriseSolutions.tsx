"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { enterpriseSolutions } from "@/data/content";

const icons: Record<string, React.ReactNode> = {
  navigation: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  kiosk: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="2" y="3" width="20" height="14" rx="1" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  erp: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="4" y="2" width="16" height="20" rx="1" />
      <path d="M9 22V18h6v4" />
      <path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
    </svg>
  ),
};

export default function EnterpriseSolutions() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="enterprise" className="relative py-28 lg:py-40" ref={ref}>
      <div className="section-container">
        {/* Header */}
        <motion.div
          className="mb-16 lg:mb-24 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
        >
          <p className="section-label text-center">Enterprise Solutions</p>
          <h2 className="section-title text-center mx-auto">حلول المؤسسات</h2>
          <p className="section-subtitle text-center mx-auto">
            حلول رقمية متكاملة للمؤسسات والشركات الكبرى
          </p>
        </motion.div>

        {/* Z-pattern solutions */}
        <div className="flex flex-col gap-6">
          {enterpriseSolutions.map((sol, i) => (
            <motion.div
              key={sol.id}
              className={`surface surface-hover p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 group ${
                i % 2 !== 0 ? "lg:flex-row-reverse" : ""
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
            >
              {/* Icon */}
              <div className="shrink-0 w-24 h-24 lg:w-32 lg:h-32 bg-white/2 flex items-center justify-center text-white/25 group-hover:text-white/50 transition-colors duration-500">
                {icons[sol.icon]}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className="font-display text-[10px] tracking-[0.3em] text-white/20 mb-3">
                  {sol.titleEn}
                </p>
                <h3 className="font-arabic text-2xl lg:text-3xl font-bold text-white mb-3">
                  {sol.title}
                </h3>
                <p className="font-arabic text-base text-white/40 leading-relaxed max-w-xl">
                  {sol.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          <a href="#contact" className="btn-primary">
            احجز استشارة لمؤسستك
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
