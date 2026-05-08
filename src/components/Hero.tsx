"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ChameleonLogo from "./ChameleonLogo";
import DotField from "./DotField";

// Keep social data but update visuals
const socialPlatforms = [
  { name: "Instagram", icon: "instagram", color: "#E1306C" },
  { name: "TikTok", icon: "tiktok", color: "#00f2ea" },
  { name: "YouTube", icon: "youtube", color: "#FF0000" },
  { name: "X", icon: "x", color: "#ffffff" },
  { name: "Snapchat", icon: "snapchat", color: "#FFFC00" },
  { name: "Facebook", icon: "facebook", color: "#1877F2" },
];

function SocialIcon({ platform }: { platform: string }) {
  const icons: Record<string, React.ReactNode> = {
    instagram: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" />
      </svg>
    ),
    tiktok: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
    youtube: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.58C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
    x: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    snapchat: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2c-2.5 0-4.5 1.5-5 4l-.5 3c-.5 0-1.5-.5-2 0s0 1.5.5 2c-1.5 1-2.5 2-2 3s2 1 3 1c-.5 1.5 0 3 1 3.5S9 20 12 20s4.5-.5 5-1.5 1.5-2 1-3.5c1 0 2.5 0 3-1s-.5-2-2-3c.5-.5 1-1.5.5-2s-1.5 0-2 0l-.5-3c-.5-2.5-2.5-4-5-4z" />
      </svg>
    ),
    facebook: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  };
  return <>{icons[platform]}</>;
}

export default function Hero() {
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#080a0f]">
      {/* Background Video */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        poster="/videos/hero-bg-poster.jpg"
        className="absolute inset-0 w-full h-full object-cover opacity-60 z-0"
      >
        <source src="/videos/hero-bg.mp4" type="video/mp4" />
        <img src="/videos/hero-bg-poster.jpg" alt="Hero background" className="absolute inset-0 w-full h-full object-cover opacity-60 z-0" />
      </video>
      <div className="absolute inset-0 bg-black/50 z-0 pointer-events-none" />

      {/* Dynamic Background Glow */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none opacity-20"
        animate={{
          x: mousePos.x - 400,
          y: mousePos.y - 400,
          background: activeColor ? activeColor : "rgba(255, 255, 255, 0.05)",
        }}
        transition={{ type: "tween", ease: "easeOut", duration: 0.8 }}
      />
      
      {/* DotField Animation */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <DotField
          dotRadius={1.5}
          dotSpacing={14}
          bulgeStrength={67}
          glowRadius={160}
          sparkle={false}
          waveAmplitude={0}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl px-6 flex flex-col items-center">
        {/* Logo Reveal */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <ChameleonLogo activeColor={activeColor || "#ffffff"} />
        </motion.div>

        {/* Cinematic Title & Tags */}
        <div className="text-center mb-16">
          <motion.h1 
            className="font-arabic text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            يتكيف مع <span className="text-transparent bg-clip-text bg-linear-to-r from-white via-gray-300 to-gray-500">عالمك الرقمي</span>
          </motion.h1>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <span className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 font-display text-[10px] tracking-[0.35em] text-white/50 backdrop-blur-md">
              ADAPTS TO YOUR DIGITAL WORLD
            </span>
          </motion.div>
        </div>

        {/* Social Interactive Dock */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-4xl bg-[#111319]/80 backdrop-blur-xl border border-white/5 shadow-2xl"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {socialPlatforms.map((platform) => (
            <motion.div
              key={platform.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 cursor-pointer border border-white/5 transition-colors relative group overflow-hidden"
              onMouseEnter={() => setActiveColor(platform.color)}
              onMouseLeave={() => setActiveColor(null)}
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{ backgroundColor: platform.color }}
              />
              <div className="relative z-10 group-hover:text-white transition-colors duration-300">
                <SocialIcon platform={platform.icon} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mt-16"
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <a href="#services" className="px-8 py-4 bg-white text-black font-arabic font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.2)]">اكتشف خدماتنا</a>
          <a href="#contact" className="px-8 py-4 bg-white/5 border border-white/10 text-white font-arabic rounded-xl hover:bg-white/10 transition-colors backdrop-blur-md">تواصل معنا</a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <span className="font-display text-[9px] tracking-[0.4em] text-white/30 uppercase">Scroll</span>
        <motion.div 
          className="w-px h-12 bg-linear-to-b from-white/30 to-transparent"
          animate={{ height: ["0px", "48px"], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
