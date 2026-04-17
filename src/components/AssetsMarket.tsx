"use client";

import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { digitalAssets } from "@/data/content";

export default function AssetsMarket() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState<"ui" | "code" | "3d">("ui");

  const tabs = [
    { id: "ui" as const, label: "عناصر UI", en: "UI KITS" },
    { id: "code" as const, label: "أكواد", en: "CODE" },
    { id: "3d" as const, label: "ثلاثي الأبعاد", en: "3D MODELS" },
  ];

  const items = digitalAssets[activeTab];

  return (
    <section id="assets" className="relative py-28 lg:py-40" ref={ref}>
      <div className="section-container">
        {/* Header */}
        <motion.div
          className="mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
        >
          <p className="section-label">Digital Assets</p>
          <h2 className="section-title">الأصول الرقمية</h2>
          <p className="section-subtitle">عناصر جاهزة للاستخدام في مشاريعك</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-px bg-white/4 mb-12 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-display text-[11px] tracking-[0.15em] uppercase cursor-pointer transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-white text-[#1a1c1c]"
                  : "bg-[#191b21] text-white/40 hover:text-white/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((asset, i) => (
            <motion.div
              key={i}
              className="surface surface-hover group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
            >
              {/* Preview */}
              <div className="relative aspect-4/3 bg-[#0e0e10] flex items-center justify-center">
                <div className="w-12 h-12 bg-white/4 flex items-center justify-center">
                  <span className="font-display text-lg text-white/15">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-white/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Info */}
              <div className="p-6">
                <p className="font-display text-[10px] tracking-[0.3em] text-white/20 mb-2 uppercase">{asset.type}</p>
                <h3 className="font-arabic text-base font-bold text-white mb-2">{asset.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-white">
                    {asset.isFree ? "مجاناً" : asset.price}
                  </span>
                  {asset.isFree && (
                    <span className="bg-white/6 font-display text-[10px] font-bold text-white/40 px-2.5 py-1 uppercase">
                      Free
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
