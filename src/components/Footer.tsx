"use client";

import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { siteConfig, socialPlatforms } from "@/data/content";

function SocialIconSmall({ platform }: { platform: string }) {
  const map: Record<string, React.ReactNode> = {
    facebook: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>,
    snapchat: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2c-2.5 0-4.5 1.5-5 4l-.5 3c-.5 0-1.5-.5-2 0s0 1.5.5 2c-1.5 1-2.5 2-2 3s2 1 3 1c-.5 1.5 0 3 1 3.5S9 20 12 20s4.5-.5 5-1.5 1.5-2 1-3.5c1 0 2.5 0 3-1s-.5-2-2-3c.5-.5 1-1.5.5-2s-1.5 0-2 0l-.5-3c-.5-2.5-2.5-4-5-4z" /></svg>,
    x: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
    youtube: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.58C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" /></svg>,
    tiktok: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>,
    instagram: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" /></svg>,
  };
  return <>{map[platform] || null}</>;
}

export default function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [email, setEmail] = useState("");

  const footerLinks = [
    { href: "#services", label: "الخدمات" },
    { href: "#portfolio", label: "أعمالنا" },
    { href: "#smm", label: "السوشيال ميديا" },
    { href: "#enterprise", label: "حلول المؤسسات" },
  ];

  return (
    <footer ref={ref} id="contact" className="relative pt-28 lg:pt-40 pb-8">
      <div className="section-container">
        {/* Contact card */}
        <motion.div
          className="surface p-10 lg:p-16 mb-20 lg:mb-28"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
        >
          <p className="section-label text-center">Get In Touch</p>
          <h2 className="font-arabic text-3xl lg:text-5xl font-bold text-white text-center mb-4">
            جاهز تبدأ مشروعك؟
          </h2>
          <p className="font-arabic text-base text-white/40 text-center mb-10 max-w-md mx-auto">
            أرسلنا رسالة وفريقنا هيتواصل معاك في أسرع وقت
          </p>

          {/* Email form */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="بريدك الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 w-full bg-white/3 border-b border-white/10 px-4 py-3.5 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-white/30 transition-colors font-arabic"
            />
            <button className="btn-primary px-8! cursor-pointer">ابعت</button>
          </div>
        </motion.div>

        {/* Footer grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-16">
          {/* Brand */}
          <div>
            <span className="font-display text-2xl text-white mb-4 block">CHAMELEON</span>
            <p className="font-arabic text-sm text-white/35 leading-relaxed max-w-xs">
              {siteConfig.description}
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="font-display text-[11px] tracking-[0.2em] text-white/40 mb-6">روابط</p>
            <div className="flex flex-col gap-3">
              {footerLinks.map((link) => (
                <a key={link.href} href={link.href} className="font-arabic text-sm text-white/30 hover:text-white/60 transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Socials */}
          <div>
            <p className="font-display text-[11px] tracking-[0.2em] text-white/40 mb-6">تابعنا</p>
            <div className="flex gap-3">
              {socialPlatforms.map((p) => (
                <a key={p.id} href="#" className="w-10 h-10 bg-white/3 flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/6 transition-all duration-300" aria-label={p.name}>
                  <SocialIconSmall platform={p.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-display text-[10px] tracking-[0.15em] text-white/20 uppercase">
            {siteConfig.copyright}
          </p>
          <p className="font-display text-[10px] tracking-[0.15em] text-white/15 uppercase">
            ✦ Crafted with precision
          </p>
        </div>
      </div>
    </footer>
  );
}
