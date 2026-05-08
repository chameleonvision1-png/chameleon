"use client";

import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import SectionHeader from "./SectionHeader";
import { PhotoStackCard } from "@/components/ui/image-showcase";

const services = [
  {
    title: "تصميم المواقع",
    en: "WEB DESIGN",
    desc: "مواقع عصرية بأحدث التقنيات",
    images: [
      "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=900&auto=format&fit=crop"
    ]
  },
  {
    title: "سوشيال ميديا",
    en: "SMM",
    desc: "حملات إعلانية وزيادة متابعين",
    images: [
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=900&auto=format&fit=crop"
    ]
  },
  {
    title: "الهوية البصرية",
    en: "BRANDING",
    desc: "شعارات وهوية بصرية كاملة",
    images: [
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1634942537034-2531766767d1?q=80&w=900&auto=format&fit=crop"
    ]
  },
  {
    title: "أدوات الذكاء",
    en: "AI TOOLS",
    desc: "أقوى أدوات الذكاء الاصطناعي",
    images: [
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1678286599522-cb8a195514f7?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1684369176149-a29d91f4a475?q=80&w=900&auto=format&fit=crop"
    ]
  },
  {
    title: "حلول المؤسسات",
    en: "ENTERPRISE",
    desc: "أنظمة إدارة وتوجيه داخلي",
    images: [
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1664575602253-aa44520925c4?q=80&w=900&auto=format&fit=crop"
    ]
  },
  {
    title: "الأصول الرقمية",
    en: "ASSETS",
    desc: "عناصر UI وموديلات 3D",
    images: [
      "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1606567595334-d39972c85d4f?q=80&w=900&auto=format&fit=crop"
    ]
  },
];

export default function Services() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeIndex, setActiveIndex] = useState<number>(2);

  return (
    <section id="services" className="relative section-py bg-[#0c0e13]" ref={ref}>
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/2 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/1 rounded-full blur-[100px] pointer-events-none" />

      <div className="section-container relative z-10">
        {/* Header */}
        <SectionHeader
          badge="What We Do"
          title="خدماتنا المتميزة"
          description="نقدم حلول رقمية شاملة تغطي كافة احتياجاتك من التصميم للتسويق، مبنية على أسس الإبداع والتطور المستمر"
        />

        {/* Interactive Card Stack */}
        <div className="relative mt-20 flex h-[600px] w-full max-w-[100vw] items-center justify-center overflow-hidden">
          {services.map((mem, index) => (
            <div
              key={mem.title}
              className="absolute transition-all duration-700 ease-in-out"
              style={{
                transform: `translateX(${(index - activeIndex) * 360}px) scale(${index === activeIndex ? 1 : 0.85})`,
                zIndex: index === activeIndex ? 20 : 10 - Math.abs(index - activeIndex),
                opacity: Math.abs(index - activeIndex) > 2 ? 0 : 1,
                pointerEvents: Math.abs(index - activeIndex) > 2 ? 'none' : 'auto'
              }}
            >
              <PhotoStackCard
                images={mem.images}
                category={mem.en}
                title={mem.title}
                subtitle={mem.desc}
                isActive={index === activeIndex}
                onClick={() => setActiveIndex(index)}
              />
            </div>
          ))}
        </div>
        
        {/* Navigation Dots */}
        <div className="flex justify-center mt-12 gap-2">
          {services.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-8 bg-white' : 'w-2 bg-white/20 hover:bg-white/40'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
