"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const services = [
  {
    title: "تصميم وتطوير المواقع",
    en: "WEB DESIGN & DEV",
    desc: "مواقع وتطبيقات ويب عصرية بأحدث التقنيات وتجربة مستخدم استثنائية",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2" y="3" width="20" height="14" rx="1" /><path d="M8 21h8M12 17v4M7 8l3 3-3 3M13 14h4" /></svg>,
  },
  {
    title: "تسويق سوشيال ميديا",
    en: "SOCIAL MEDIA MARKETING",
    desc: "إدارة حسابات، حملات إعلانية، وزيادة متابعين على جميع المنصات",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /><path d="M8 12l3 3 5-5" /></svg>,
  },
  {
    title: "تصميم الهوية البصرية",
    en: "BRANDING & IDENTITY",
    desc: "شعارات ولوجوهات وهوية بصرية كاملة تميز علامتك التجارية",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="13.5" cy="6.5" r="2.5" /><path d="M3 22l5-5M6.5 18.5l-3 3" /><path d="M20 15a2 2 0 1 0-4 0 6 6 0 0 1-6 6H4" /></svg>,
  },
  {
    title: "أدوات AI وبرامج",
    en: "AI TOOLS & SOFTWARE",
    desc: "اشتراكات مخفضة لأقوى أدوات الذكاء الاصطناعي والتصميم",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" /><rect x="4" y="12" width="16" height="8" rx="2" /><path d="M9 20v2M15 20v2" /></svg>,
  },
  {
    title: "حلول المؤسسات",
    en: "ENTERPRISE SOLUTIONS",
    desc: "أنظمة ERP/CRM، شاشات تفاعلية، وتوجيه داخلي للمؤسسات الكبرى",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="4" y="2" width="16" height="20" rx="1" /><path d="M9 22V18h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" /></svg>,
  },
  {
    title: "الأصول الرقمية",
    en: "DIGITAL ASSETS",
    desc: "عناصر UI جاهزة، أكواد مفتوحة المصدر، وموديلات ثلاثية الأبعاد",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>,
  },
];

export default function Services() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" className="relative py-28 lg:py-40" ref={ref}>
      <div className="section-container">
        {/* Header — right-aligned (RTL) */}
        <motion.div
          className="mb-16 lg:mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="section-label">What We Do</p>
          <h2 className="section-title">خدماتنا</h2>
          <p className="section-subtitle">
            نقدم حلول رقمية شاملة تغطي كافة احتياجاتك من التصميم للتسويق — موديلات حية تطوّر أعمالك
          </p>
        </motion.div>

        {/* 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={i}
              className="surface surface-hover p-8 lg:p-10 group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
            >
              {/* Icon */}
              <div className="w-12 h-12 flex items-center justify-center text-white/25 group-hover:text-white/60 transition-colors duration-500 mb-8">
                {s.icon}
              </div>

              {/* English label */}
              <p className="font-display text-[10px] tracking-[0.3em] text-white/20 mb-3">{s.en}</p>

              {/* Arabic title */}
              <h3 className="font-arabic text-xl font-bold text-white mb-3">{s.title}</h3>

              {/* Description */}
              <p className="font-arabic text-sm text-white/35 leading-relaxed mb-8">{s.desc}</p>

              {/* Learn more */}
              <div className="flex items-center gap-2 text-white/10 group-hover:text-white/40 transition-colors duration-500">
                <span className="font-display text-[10px] tracking-[0.2em]">LEARN MORE</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="transform group-hover:-translate-x-1 transition-transform">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
