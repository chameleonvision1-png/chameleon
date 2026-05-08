"use client";

import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { digitalAssets } from "@/data/content";
import SectionHeader from "./SectionHeader";

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
    <section id="assets" className="relative section-py bg-[#080a0f]" ref={ref}>
      <div className="section-container relative z-10">
        {/* Header */}
        <SectionHeader
          badge="Digital Assets"
          title="الأصول الرقمية"
          description="عناصر جاهزة للاستخدام في مشاريعك لتسريع وتيرة العمل بأعلى جودة"
        />

        {/* Animated Tabs */}
        <div className="flex justify-center mb-12">
          <div className="flex flex-col sm:flex-row bg-[#111319] p-2 rounded-2xl border border-white/5 relative gap-2 w-full sm:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 whitespace-nowrap px-6 sm:px-10 py-4 font-display text-[11px] tracking-[0.15em] uppercase cursor-pointer transition-colors z-10 w-full sm:w-auto text-center ${
                  activeTab === tab.id ? "text-black font-bold" : "text-white/40 hover:text-white/80"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabAsset"
                    className="absolute inset-0 bg-white rounded-xl -z-10 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <span className="block mb-1.5">{tab.en}</span>
                <span className="font-arabic text-[13px] opacity-70 block capitalize">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((asset, i) => (
            <motion.div
              key={i}
              className="group relative overflow-hidden rounded-4xl bg-[#111319] border border-white/5 cursor-pointer hover:border-white/20 transition-all duration-500"
              initial={false}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
            >
              {/* Preview Image/Placeholder */}
              <div className="relative aspect-4/3 bg-[#151820] flex items-center justify-center overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <span className="font-display text-2xl text-white/20 font-bold">{String(i + 1).padStart(2, "0")}</span>
                </div>
                {/* Elegant overlay gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-[#111319] via-transparent to-transparent opacity-100" />
              </div>

              {/* Info */}
              <div className="p-10 relative z-10 flex flex-col justify-between">
                <p className="font-display text-[10px] tracking-[0.3em] text-white/30 mb-3 uppercase">{asset.type}</p>
                <h3 className="font-arabic text-xl font-bold text-white mb-6">{asset.name}</h3>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-display text-lg font-bold text-white">
                    {asset.isFree ? "مجاناً" : asset.price}
                  </span>
                  {asset.isFree ? (
                    <span className="bg-white text-black font-display text-[10px] font-bold px-4 py-2 rounded-lg uppercase">
                      Free Download
                    </span>
                  ) : (
                    <span className="bg-white/10 text-white font-display text-[10px] font-bold px-4 py-2 rounded-lg uppercase hover:bg-white/20 transition-colors">
                      Purchase
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
