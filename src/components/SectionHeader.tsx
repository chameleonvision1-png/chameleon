import React from "react";
import { motion } from "framer-motion";

interface SectionHeaderProps {
  badge: string;
  title: React.ReactNode | string;
  description?: string;
  align?: "left" | "center" | "right";
  action?: React.ReactNode;
}

export default function SectionHeader({ badge, title, description, align = "center", action }: SectionHeaderProps) {
  const alignClass = 
    align === "center" ? "items-center text-center" : 
    align === "left" ? "items-start text-left" : 
    "items-end text-right";

  const descriptionAlignClass =
    align === "center" ? "mx-auto" : 
    align === "left" ? "mr-auto" : 
    "ml-auto";

  return (
    <motion.div
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className={`relative z-10 flex flex-col ${alignClass} mb-header`}
    >
      <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
        <span className="font-display text-[10px] md:text-xs tracking-[0.25em] text-white/80 uppercase">{badge}</span>
      </div>
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-arabic font-bold text-white mb-6 tracking-tight leading-tight">
        {title}
      </h2>
      {description && (
        <p className={`font-arabic text-lg md:text-xl text-white/50 max-w-2xl leading-relaxed ${descriptionAlignClass}`}>
          {description}
        </p>
      )}
      {action && (
        <div className="shrink-0 mt-8">
          {action}
        </div>
      )}
    </motion.div>
  );
}
