"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { aiTools } from "@/data/content";

export default function AITools() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="ai-tools" className="relative py-28 lg:py-40 bg-[#0c0e13]" ref={ref}>
      <div className="section-container">
        {/* Header */}
        <motion.div
          className="mb-16 lg:mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
        >
          <p className="section-label">AI & Software Deals</p>
          <h2 className="section-title">أدوات AI وعروض البرامج</h2>
          <p className="section-subtitle">
            اشتراكات مخفضة لأقوى الأدوات — وفّر وارتقِ بشغلك
          </p>
        </motion.div>

        {/* 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiTools.map((tool, i) => (
            <motion.div
              key={tool.name}
              className="surface surface-hover p-8 group cursor-pointer relative"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
            >
              {/* Best deal badge */}
              {tool.bestOffer && (
                <div className="absolute top-0 right-6 bg-white text-[#1a1c1c] font-display text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1.5 rounded-b-lg">
                  عرض خاص
                </div>
              )}

              {/* Tool name */}
              <h3 className="font-display text-xl font-bold text-white mb-1 mt-3">
                {tool.name}
              </h3>
              <p className="font-arabic text-sm text-white/35 mb-6">{tool.description}</p>

              {/* Price */}
              <div className="flex items-baseline justify-end gap-2 mb-4" dir="ltr">
                <span className="font-display text-4xl font-bold text-white">
                  ${tool.salePrice}
                </span>
                <span className="font-display text-base text-white/40">
                  /mo
                </span>
                <span className="font-display text-sm text-white/25 line-through ml-2">
                  ${tool.originalPrice}
                </span>
              </div>

              {/* Discount */}
              <div className="mt-4 mb-6">
                <span className="bg-white/6 font-display text-sm font-bold text-white/60 px-3 py-1.5">
                  -{tool.discount}%
                </span>
                <span className="font-arabic text-xs text-white/30 mr-3">خصم حصري</span>
              </div>

              {/* CTA */}
              <button className="w-full btn-ghost text-[10px]! cursor-pointer">
                احصل على العرض
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
