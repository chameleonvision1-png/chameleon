"use client";

import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { smmServices, socialPlatforms as smmPlatforms } from "@/data/content";

export default function SMMMarket() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = ["all", ...smmPlatforms.map((p) => p.id)];
  const filtered = activeFilter === "all"
    ? smmServices
    : smmServices.filter((s) => s.platform === activeFilter);

  const getPlatformName = (id: string) =>
    smmPlatforms.find((p) => p.id === id)?.name || id;

  return (
    <section id="smm" className="relative py-28 lg:py-40" ref={ref}>
      <div className="section-container">
        {/* Header */}
        <motion.div
          className="mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
        >
          <p className="section-label">Social Media Marketing</p>
          <h2 className="section-title">السوشيال ميديا</h2>
          <p className="section-subtitle">
            خدمات تسويق رقمي شاملة لجميع المنصات بأسعار منافسة
          </p>
        </motion.div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-12">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2.5 text-xs font-display tracking-[0.15em] uppercase cursor-pointer transition-all duration-300 rounded-full ${
                activeFilter === f
                  ? "bg-white text-[#1a1c1c] shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  : "bg-white/5 text-white/50 border border-transparent hover:bg-white/10 hover:text-white"
              }`}
            >
              {f === "all" ? "الكل" : getPlatformName(f)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((service, i) => {
            const platformData = smmPlatforms.find((p) => p.id === service.platform);
            return (
              <motion.div
                key={`${service.platform}-${service.name}-${i}`}
                className="surface p-6 group"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: i * 0.05 }}
              >
                {/* Platform badge */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-arabic text-base font-bold text-white">{service.name}</h3>
                    <p className="font-display text-[10px] tracking-wider text-white/25 mt-0.5">
                      {platformData?.name}
                    </p>
                  </div>
                  <div className="w-9 h-9 bg-white/6 flex items-center justify-center">
                    <span className="font-display text-[10px] font-bold text-white/40">
                      {platformData?.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-6">
                  {service.tiers.map((tier) => (
                    <div key={tier.name} className="flex items-center justify-between py-3 px-4 bg-[#14161a] rounded-xl border border-white/5">
                      <div>
                        <span className="font-display text-[10px] font-bold tracking-widest text-white/50 block mb-1">
                          {tier.name}
                        </span>
                        <span className="font-arabic text-xs text-white/60 mr-2">{tier.count}</span>
                      </div>
                      <span className="font-display text-sm font-bold text-white">
                        EGP {tier.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button className="w-full btn-ghost text-xs! py-3! cursor-pointer mt-auto">
                  اطلب الآن
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
