"use client";

import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function GraffitiBackground() {
  const mouseX = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 40, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseX.set(x);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX]);

  // Shared SVGs for reuse
  const SVG_GEMINI = (
    <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
      <path d="M50,10 C50,45 55,50 90,50 C55,50 50,55 50,90 C50,55 45,50 10,50 C45,50 50,45 50,10 Z" />
      <circle cx="20" cy="20" r="3" />
      <circle cx="80" cy="80" r="2" />
      <path d="M85,15 L90,10 M88,20 L95,15" strokeWidth="3" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );

  const SVG_CHATGPT = (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
      <path d="M50,20 C80,20 80,50 65,60 C80,70 70,90 50,80 C30,90 20,70 35,60 C20,50 20,20 50,20 Z" strokeWidth="5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="8" fill="currentColor" />
      <path d="M20,30 L15,25 M80,30 L85,25 M20,70 L15,75 M80,70 L85,75" strokeWidth="3" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );

  const SVG_CLAUDE = (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
      <path d="M75,30 C50,10 20,30 20,50 C20,70 50,90 75,70" strokeWidth="8" stroke="currentColor" strokeLinecap="round" />
      <path d="M25,50 L50,50" strokeWidth="6" stroke="currentColor" strokeLinecap="round" />
      <circle cx="80" cy="25" r="5" fill="currentColor" />
      <path d="M80,15 L80,5 M90,25 L100,25" strokeWidth="3" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );

  const SVG_DEEPSEEK = (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
      <path d="M10,60 Q30,30 70,40 Q90,45 90,30 Q90,60 60,70 Q30,80 10,60 Z M10,60 L20,75 M10,60 L25,50" strokeWidth="5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="65" cy="45" r="4" fill="currentColor" />
      <path d="M40,85 Q50,95 60,85 M30,90 Q40,100 50,90" strokeWidth="3" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );

  const SVG_CROWN = (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
      <path d="M15,45 Q25,80 25,80 L75,80 Q75,80 85,45 L65,65 L50,25 L35,65 Z" strokeWidth="5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20,90 Q50,85 80,90" strokeWidth="4" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );

  const SVG_X = (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
      <path d="M20,20 Q50,45 80,80 M80,20 Q50,55 20,80" strokeWidth="8" stroke="currentColor" strokeLinecap="round" />
      <circle cx="85" cy="15" r="3" fill="currentColor" />
      <circle cx="15" cy="85" r="2" fill="currentColor" />
    </svg>
  );

  const SVG_ARROW = (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
      <path d="M10,50 Q40,40 80,50 M60,30 Q75,45 80,50 Q75,65 60,70" strokeWidth="6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M80,50 Q90,55 85,65" strokeWidth="3" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );

  const SVG_SQUIGGLE = (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
      <path d="M20,30 Q60,10 80,30 Q90,50 50,70 Q20,80 80,80" strokeWidth="6" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );

  const SVG_DRIPS = (
    <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
      <path d="M40,40 Q50,30 60,40 Q70,50 60,60 Q50,70 40,60 Q30,50 40,40 Z" />
      <circle cx="25" cy="35" r="6" />
      <circle cx="75" cy="25" r="4" />
      <circle cx="85" cy="55" r="8" />
      <circle cx="30" cy="75" r="5" />
      <circle cx="65" cy="80" r="3" />
    </svg>
  );

  // Distribution across 0% to 100% of the entire page height
  const graffitiElements = [
    // --- HERO SECTION (~0% to ~20%) ---
    { id: 'gemini-hero', path: SVG_GEMINI, top: '2%', right: '12%', width: 140, parallax: -35, rotate: 15, duration: 10 },
    { id: 'crown-hero', path: SVG_CROWN, top: '5%', left: '8%', width: 180, parallax: 30, rotate: -15, duration: 8 },
    { id: 'x-hero', path: SVG_X, top: '11%', right: '8%', width: 220, parallax: -40, rotate: 10, duration: 11 },
    { id: 'claude-hero', path: SVG_CLAUDE, top: '15%', right: '25%', width: 120, parallax: 20, rotate: -10, duration: 14 },
    { id: 'arrow-hero', path: SVG_ARROW, top: '18%', left: '10%', width: 180, parallax: 25, rotate: -25, duration: 12 },

    // --- TOOLS GRID SECTION (~20% to ~40%) ---
    { id: 'deepseek-tools', path: SVG_DEEPSEEK, top: '22%', right: '15%', width: 160, parallax: -30, rotate: 20, duration: 11 },
    { id: 'squiggle-tools', path: SVG_SQUIGGLE, top: '26%', left: '12%', width: 150, parallax: 20, rotate: -15, duration: 9 },
    { id: 'gemini-tools', path: SVG_GEMINI, top: '30%', right: '8%', width: 110, parallax: -45, rotate: -5, duration: 13 },
    { id: 'chatgpt-tools', path: SVG_CHATGPT, top: '34%', left: '5%', width: 170, parallax: 35, rotate: 15, duration: 10 },
    { id: 'drips-tools', path: SVG_DRIPS, top: '38%', right: '20%', width: 190, parallax: -25, rotate: 0, duration: 14 },

    // --- HOW IT WORKS SECTION (~40% to ~60%) ---
    { id: 'claude-hiw', path: SVG_CLAUDE, top: '42%', left: '18%', width: 150, parallax: 30, rotate: 10, duration: 11 },
    { id: 'arrow-hiw', path: SVG_ARROW, top: '46%', right: '10%', width: 170, parallax: -20, rotate: 35, duration: 12 },
    { id: 'crown-hiw', path: SVG_CROWN, top: '50%', left: '5%', width: 140, parallax: 40, rotate: -20, duration: 9 },
    { id: 'deepseek-hiw', path: SVG_DEEPSEEK, top: '54%', right: '25%', width: 130, parallax: -35, rotate: -15, duration: 13 },
    { id: 'x-hiw', path: SVG_X, top: '58%', left: '22%', width: 160, parallax: 25, rotate: 5, duration: 10 },

    // --- WHY SYNC SECTION (~60% to ~80%) ---
    { id: 'gemini-why', path: SVG_GEMINI, top: '62%', left: '10%', width: 150, parallax: 45, rotate: 25, duration: 11 },
    { id: 'squiggle-why', path: SVG_SQUIGGLE, top: '66%', right: '15%', width: 180, parallax: -30, rotate: -10, duration: 12 },
    { id: 'chatgpt-why', path: SVG_CHATGPT, top: '70%', left: '25%', width: 140, parallax: 20, rotate: -5, duration: 10 },
    { id: 'drips-why', path: SVG_DRIPS, top: '74%', right: '5%', width: 160, parallax: -40, rotate: 15, duration: 14 },
    { id: 'claude-why', path: SVG_CLAUDE, top: '78%', left: '12%', width: 170, parallax: 35, rotate: -25, duration: 9 },

    // --- FAQ & FOOTER SECTION (~80% to ~100%) ---
    { id: 'deepseek-faq', path: SVG_DEEPSEEK, top: '82%', right: '20%', width: 150, parallax: -25, rotate: 10, duration: 12 },
    { id: 'x-faq', path: SVG_X, top: '86%', left: '8%', width: 190, parallax: 40, rotate: 15, duration: 11 },
    { id: 'crown-faq', path: SVG_CROWN, top: '90%', right: '10%', width: 160, parallax: -35, rotate: -10, duration: 8 },
    { id: 'arrow-faq', path: SVG_ARROW, top: '94%', left: '20%', width: 140, parallax: 20, rotate: -35, duration: 13 },
    { id: 'gemini-faq', path: SVG_GEMINI, top: '97%', right: '15%', width: 130, parallax: -20, rotate: 5, duration: 10 },
  ];

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0" style={{ color: 'var(--sync-text-primary)' }}>
      {graffitiElements.map((el) => {
        // We use useTransform to create a dedicated motion value for each element's X parallax,
        // without causing React re-renders!
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const xTransform = useTransform(smoothMouseX, [-1, 1], [-el.parallax, el.parallax]);

        return (
          <motion.div
            key={el.id}
            className="absolute"
            style={{
              top: el.top,
              left: el.left,
              right: el.right,
              width: el.width,
              height: el.width,
              rotate: el.rotate,
              opacity: 0.08,
              x: xTransform // Bound motion value directly to bypass React render!
            }}
            initial={{ opacity: 0 }}
            whileInView={{
              y: [0, -50, 0],
              opacity: [0.06, 0.15, 0.06],
              rotate: [el.rotate, el.rotate + 10, el.rotate],
              scale: [1, 1.08, 1]
            }}
            viewport={{ once: false, margin: "200px" }} // Triggers when within 200px of screen, pauses otherwise
            transition={{
              y: { duration: el.duration, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: el.duration * 0.8, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: el.duration * 1.2, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: el.duration, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            {el.path}
          </motion.div>
        );
      })}
    </div>
  );
}
