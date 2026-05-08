"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export interface GalleryItem {
  id: string | number;
  title: string;
  description: string;
  image?: string;
  url?: string;
  iframeUrl?: string;
}

interface ImageGalleryProps {
  items: GalleryItem[];
  className?: string;
}

export function ImageGallery({ items, className }: ImageGalleryProps) {
  // First item is expanded by default
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  return (
    <div className={cn("w-full flex flex-col items-center justify-start", className)}>
      <div className="flex flex-col md:flex-row items-center gap-4 h-[500px] md:h-[600px] w-full mt-4">
        {items.map((item, idx) => {
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={item.id}
              onClick={() => setExpandedIndex(idx)}
              className={cn(
                "relative group grow transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-2xl overflow-hidden h-full cursor-pointer border border-white/10",
                isExpanded ? "w-full md:w-[70%]" : "w-1/4 opacity-60 hover:opacity-100"
              )}
            >
              {item.iframeUrl ? (
                <div className="absolute inset-0 w-full h-full bg-[#080a0f]">
                  <iframe
                    src={item.iframeUrl}
                    className={cn(
                      "w-full h-full border-0 transition-opacity duration-700",
                      isExpanded ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-50"
                    )}
                    loading="lazy"
                  />
                  {/* Invisible overlay for non-expanded state to catch clicks */}
                  {!isExpanded && <div className="absolute inset-0 z-10" />}
                </div>
              ) : (
                <img
                  className={cn(
                    "h-full w-full object-cover object-center transition-transform duration-700",
                    isExpanded ? "scale-100" : "scale-110"
                  )}
                  src={item.image}
                  alt={item.title}
                />
              )}
              
              {/* Overlay Gradient for text readability */}
              <div 
                className={cn(
                  "absolute inset-0 pointer-events-none transition-all duration-500",
                  isExpanded 
                    ? "bg-linear-to-t from-black/80 via-transparent to-transparent" 
                    : "bg-black/60"
                )}
              />

              {/* Content Overlay */}
              <div 
                className={cn(
                  "absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end transition-all duration-500 transform pointer-events-none",
                  isExpanded ? "translate-y-0 opacity-100 delay-100" : "translate-y-10 opacity-0"
                )}
              >
                <div className="flex items-end justify-between pointer-events-auto">
                  <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <h3 className="font-arabic text-2xl md:text-3xl font-bold text-white mb-2 whitespace-nowrap">
                      {item.title}
                    </h3>
                    <p className="font-arabic text-sm text-white/70 line-clamp-2 max-w-lg">
                      {item.description}
                    </p>
                  </div>
                  
                  {item.url && (
                    <a 
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center backdrop-blur-md transition-colors duration-300 border border-white/20 shrink-0 mb-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
              
              {/* Vertical Title (when collapsed) */}
              <div 
                className={cn(
                  "absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500",
                  !isExpanded ? "opacity-100" : "opacity-0"
                )}
              >
                <h3 className="font-arabic text-xl font-bold text-white tracking-wider px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 whitespace-nowrap shadow-xl transform -rotate-90 md:rotate-0">
                  {item.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
