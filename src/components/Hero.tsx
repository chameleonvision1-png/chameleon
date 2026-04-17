"use client";

import React, { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import ChameleonLogo from "./ChameleonLogo";

const socialPlatforms = [
  { name: "Instagram", icon: "instagram", color: "#E1306C", position: { top: "5%", left: "50%", transform: "translateX(-50%)" } },
  { name: "TikTok", icon: "tiktok", color: "#00f2ea", position: { top: "20%", left: "12%" } },
  { name: "YouTube", icon: "youtube", color: "#FF0000", position: { top: "50%", left: "2%", transform: "translateY(-50%)" } },
  { name: "X", icon: "x", color: "#ffffff", position: { bottom: "5%", left: "50%", transform: "translateX(-50%)" } },
  { name: "Snapchat", icon: "snapchat", color: "#FFFC00", position: { bottom: "20%", right: "12%" } },
  { name: "Facebook", icon: "facebook", color: "#1877F2", position: { top: "50%", right: "2%", transform: "translateY(-50%)" } },
];

function SocialIcon({ platform }: { platform: string }) {
  const icons: Record<string, React.ReactNode> = {
    instagram: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" />
      </svg>
    ),
    tiktok: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
    youtube: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.58C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
    x: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    snapchat: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2c-2.5 0-4.5 1.5-5 4l-.5 3c-.5 0-1.5-.5-2 0s0 1.5.5 2c-1.5 1-2.5 2-2 3s2 1 3 1c-.5 1.5 0 3 1 3.5S9 20 12 20s4.5-.5 5-1.5 1.5-2 1-3.5c1 0 2.5 0 3-1s-.5-2-2-3c.5-.5 1-1.5.5-2s-1.5 0-2 0l-.5-3c-.5-2.5-2.5-4-5-4z" />
      </svg>
    ),
    facebook: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  };
  return <>{icons[platform]}</>;
}

export default function Hero() {
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden grid-pattern">
      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#080a0f_100%)]" />

      {/* Color bloom on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: activeColor
            ? `radial-gradient(circle at 50% 50%, ${activeColor}08 0%, transparent 60%)`
            : "transparent",
        }}
        transition={{ duration: 0.8 }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-4xl">
        {/* Orbit container */}
        <div className="relative w-full max-w-[580px] aspect-square mx-auto flex items-center justify-center mb-6 lg:mb-10">
          {/* Orbit tracks */}
          <div className="absolute inset-[5%] border border-white/4 rounded-full" />
          <div className="absolute inset-[18%] border border-white/2 rounded-full" />

          {/* Social icons */}
          {socialPlatforms.map((platform) => (
            <motion.div
              key={platform.name}
              className="absolute w-11 h-11 lg:w-14 lg:h-14 flex items-center justify-center text-white/40 cursor-pointer transition-colors duration-300 bg-[#191b21] hover:text-white"
              style={platform.position}
              onMouseEnter={() => setActiveColor(platform.color)}
              onMouseLeave={() => setActiveColor(null)}
              whileHover={{ scale: 1.1 }}
            >
              <SocialIcon platform={platform.icon} />
            </motion.div>
          ))}

          {/* CHAMELEON Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <ChameleonLogo activeColor={activeColor || "#ffffff"} />
          </motion.div>
        </div>

        {/* Tagline */}
        <motion.p
          className="font-arabic text-lg lg:text-2xl text-white/50 mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
        >
          يتكيف مع عالمك الرقمي
        </motion.p>

        <motion.p
          className="font-display text-[11px] lg:text-xs tracking-[0.35em] text-white/25 mb-10"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          ADAPTS TO YOUR DIGITAL WORLD
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
        >
          <a href="#services" className="btn-primary">اكتشف خدماتنا</a>
          <a href="#contact" className="btn-ghost">تواصل معنا</a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1.2 }}
      >
        <span className="font-display text-[10px] tracking-[0.3em] text-white/20 uppercase">Scroll</span>
        <motion.svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
          className="text-white/20"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </motion.svg>
      </motion.div>
    </section>
  );
}
