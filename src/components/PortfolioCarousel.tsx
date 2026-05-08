"use client";

import React, { useRef } from "react";
import { useInView } from "framer-motion";
import { portfolioItems } from "@/data/content";
import SectionHeader from "./SectionHeader";
import { ExpandingCards, CardItem } from "@/components/ui/expanding-cards";
import { MonitorPlay, GraduationCap, Stethoscope, Building2, Globe, LayoutTemplate } from "lucide-react";

export default function PortfolioCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const icons = [
    <MonitorPlay key="1" size={24} />,
    <GraduationCap key="2" size={24} />,
    <Stethoscope key="3" size={24} />,
    <Building2 key="4" size={24} />,
    <Globe key="5" size={24} />,
    <LayoutTemplate key="6" size={24} />
  ];

  // Map portfolio items to ExpandingCards format
  const galleryItems: CardItem[] = portfolioItems.slice(0, 4).map((item, index) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    imgSrc: item.image,
    linkHref: item.url,
    iframeUrl: item.iframeUrl,
    icon: icons[index],
    category: item.category
  }));

  return (
    <section id="portfolio" className="relative section-py bg-[#080a0f]" ref={ref}>
      <div className="section-container relative z-10">
        {/* Header */}
        <SectionHeader
          badge="Selected Work"
          title="أحدث أعمالنا"
          description="مشاريع حقيقية نفذناها بأعلى معايير الجودة والإبداع لنخبة من عملائنا"
          action={
            <button className="group flex items-center gap-3 text-white">
              <span className="font-display text-xs tracking-widest uppercase">View All Projects</span>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          }
        />
      </div>

      {/* Expanding Cards Wrapper - USING FULL WIDTH TO MAXIMIZE HORIZONTAL SPACE */}
      <div 
        className="w-full mx-auto px-4 md:px-8 mt-4 opacity-0 translate-y-10"
        style={{ 
          animation: isInView ? 'fadeInUp 0.8s ease-out 0.2s forwards' : 'none'
        }}
      >
        <ExpandingCards items={galleryItems} />
      </div>
      
      {/* Required CSS for animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}} />
    </section>
  );
}
