"use client";

import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

import { smmServices, socialPlatforms as smmPlatforms } from "@/data/content";
import SectionHeader from "./SectionHeader";

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
    <section id="smm" className="relative section-py bg-[#0c0e13]" ref={ref}>
      <div className="section-container relative z-10">
        {/* Header */}
        <SectionHeader
          badge="Social Media Marketing"
          title={
            <a href={process.env.NODE_ENV === 'development' ? 'http://khawarizm.localhost:3000' : 'https://khawarizm.chameleon.vision'} className="hover:text-white/80 transition-colors underline decoration-white/20 underline-offset-12">
              خوارزم
            </a>
          }
          description="خدمات تسويق رقمي شاملة لجميع المنصات بأسعار منافسة وحزم مصممة خصيصاً لنمو حساباتك"
        />

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-6 py-3 text-xs font-display tracking-[0.15em] uppercase cursor-pointer transition-all duration-500 rounded-2xl border ${
                activeFilter === f
                  ? "bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                  : "bg-[#111319] text-white/50 border-white/5 hover:bg-white/5 hover:text-white"
              }`}
            >
              {f === "all" ? "الكل" : getPlatformName(f)}
            </button>
          ))}
        </div>

        {/* Pricing Cards Carousel */}
        {/* Dynamic Grid */}
        <div className="mt-12 min-h-[400px]">
          <div
            key={activeFilter}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-[fadeInUp_0.5s_ease-out_forwards]"
          >
            {filtered.map((service, index) => {
              const platformData = smmPlatforms.find((p) => p.id === service.platform);
              return (
                <div
                  key={`${service.platform}-${service.name}-${index}`}
                  className="group relative bg-black/40 border border-white/10 hover:border-white/30 rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(255,255,255,0.05)]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Glow Effect */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[50px] group-hover:bg-white/10 transition-colors duration-500 pointer-events-none" />

                  <div className="relative p-8 z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="font-arabic text-2xl font-bold text-white mb-2">{service.name}</h3>
                        <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-white/5">
                          <span className="font-display text-[10px] tracking-widest text-white/60 uppercase">
                            {platformData?.name}
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center text-white font-display text-xs font-bold">
                        {platformData?.name.slice(0, 2).toUpperCase()}
                      </div>
                    </div>

                    <div className="space-y-4 flex-1">
                      {service.tiers.map((tier) => (
                        <div key={tier.name} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                          <div className="flex flex-col">
                            <span className="font-display text-[10px] font-bold tracking-[0.2em] text-white/40 mb-1 uppercase">{tier.name}</span>
                            <span className="font-arabic text-sm text-white/80 font-medium">{tier.count}</span>
                          </div>
                          <div className="font-display text-lg font-bold text-white">
                            {tier.price.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button className="mt-8 w-full py-4 bg-white text-black font-arabic font-bold rounded-xl hover:bg-gray-200 transition-transform active:scale-95">
                      اطلب الآن
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
