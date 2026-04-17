"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

const navLinks = [
  { href: "#services", label: "الخدمات" },
  { href: "#portfolio", label: "أعمالنا" },
  { href: "#smm", label: "السوشيال ميديا" },
  { href: "#ai-tools", label: "أدوات AI" },
  { href: "#enterprise", label: "حلول المؤسسات" },
  { href: "#contact", label: "تواصل معنا" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#111319]/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          : "bg-transparent"
      }`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="section-container flex items-center justify-between h-16 lg:h-20">
        {/* Logo */}
        <a href="#" className="font-display text-xl lg:text-2xl tracking-[-0.05em] text-white">
          CHAMELEON
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-arabic text-sm text-white/50 hover:text-white transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a href="#contact" className="hidden lg:block btn-ghost py-2.5! px-5! text-[11px]!">
          ابدأ مشروعك
        </a>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="القائمة"
        >
          <span className={`w-5 h-px bg-white transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[4px]" : ""}`} />
          <span className={`w-5 h-px bg-white transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[3px]" : ""}`} />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <motion.div
          className="lg:hidden fixed inset-0 top-16 bg-[#080a0f] z-40 flex flex-col items-center justify-center gap-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="font-arabic text-2xl text-white/60 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a href="#contact" className="btn-primary mt-4">ابدأ مشروعك</a>
        </motion.div>
      )}
    </motion.nav>
  );
}
