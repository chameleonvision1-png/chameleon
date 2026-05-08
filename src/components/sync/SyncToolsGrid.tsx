"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSync } from './SyncProviders';
import { Bot, Sparkles, MessageSquare, Image as ImageIcon, Video, Music, Palette, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TOOLS = [
  { id: 'chatgpt', name: 'ChatGPT', category: 'AI Assistant', icon: MessageSquare, startingPrice: '$8', discount: 'Up to 60% OFF', image: '/sync/covers/chatgpt.png' },
  { id: 'gemini', name: 'Gemini', category: 'AI Assistant', icon: Bot, startingPrice: '$10', discount: 'Up to 98% OFF', bestDeal: true, image: '/sync/covers/gemini.png' },
  { id: 'midjourney', name: 'Midjourney', category: 'Image Generation', icon: ImageIcon, startingPrice: '$33', discount: 'Up to 45% OFF', image: '/sync/covers/midjourney.png' },
  { id: 'claude', name: 'Claude', category: 'AI Assistant', icon: Sparkles, startingPrice: '$6', discount: 'Up to 70% OFF', image: '/sync/covers/claude.png' },
  { id: 'canva', name: 'Canva', category: 'Design', icon: Palette, startingPrice: '$5', discount: 'Up to 58% OFF', image: '/sync/covers/canva.png' },
  { id: 'elevenlabs', name: 'ElevenLabs', category: 'Voice AI', icon: Music, startingPrice: '$10', discount: 'Up to 55% OFF', image: '/sync/covers/elevenlabs.png' },
  { id: 'netflix', name: 'Netflix', category: 'Entertainment', icon: Video, startingPrice: '$4', discount: 'Up to 50% OFF' },
  { id: 'spotify', name: 'Spotify', category: 'Entertainment', icon: Music, startingPrice: '$3', discount: 'Up to 40% OFF' },
  { id: 'adobe', name: 'Adobe CC', category: 'Design', icon: Palette, startingPrice: '$15', discount: 'Up to 70% OFF' },
  { id: 'github', name: 'Copilot', category: 'AI Assistant', icon: Bot, startingPrice: '$5', discount: 'Up to 50% OFF' },
  { id: 'notion', name: 'Notion AI', category: 'AI Assistant', icon: MessageSquare, startingPrice: '$4', discount: 'Up to 30% OFF' },
  { id: 'figma', name: 'Figma', category: 'Design', icon: Palette, startingPrice: '$6', discount: 'Up to 45% OFF' },
];

export default function SyncToolsGrid() {
  const { t, lang } = useSync();
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(1);
  const itemsPerPage = 6;

  const categories = ['All', 'AI Assistant', 'Image Generation', 'Design', 'Voice AI', 'Entertainment'];

  const filteredTools = useMemo(() => {
    return activeCategory === 'All' 
      ? TOOLS 
      : TOOLS.filter(tool => tool.category === activeCategory);
  }, [activeCategory]);

  const totalPages = Math.ceil(filteredTools.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const currentTools = filteredTools.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
    setDirection(1);
  };

  const nextPage = () => {
    if (safeCurrentPage < totalPages) {
      setDirection(1);
      setCurrentPage(safeCurrentPage + 1);
    }
  };

  const prevPage = () => {
    if (safeCurrentPage > 1) {
      setDirection(-1);
      setCurrentPage(safeCurrentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    setDirection(page > safeCurrentPage ? 1 : -1);
    setCurrentPage(page);
  };

  const slideVariants: any = {
    hidden: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    visible: (dir: number) => ({
      x: 0,
      opacity: 1,
      transition: { type: 'spring' as const, bounce: 0.3, duration: 0.6 }
    }),
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      transition: { duration: 0.3 }
    })
  };

  return (
    <section id="deals" className="py-24 relative z-10">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-12 2xl:px-24">
        <h2 className="sync-heading text-4xl md:text-5xl text-center mb-12">{t.dealsTitle}</h2>
        
        {/* Filter and Pagination Row */}
        <div className="flex flex-col xl:flex-row items-center justify-between gap-8 mb-12">
          {/* Categories Filter */}
          <div className="flex flex-wrap justify-center xl:justify-start gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-sm ${
                  activeCategory === cat 
                    ? 'bg-(--sync-yellow) text-[#0B132B] shadow-[0_0_15px_rgba(255,194,26,0.4)]' 
                    : 'bg-[rgba(255,255,255,0.03)] text-(--sync-text-primary) hover:bg-[rgba(255,255,255,0.1)]'
                }`}
              >
                {lang === 'ar' ? (
                  cat === 'All' ? 'الكل' : 
                  cat === 'AI Assistant' ? 'مساعد ذكي' : 
                  cat === 'Image Generation' ? 'توليد صور' : 
                  cat === 'Design' ? 'تصميم' : 
                  cat === 'Voice AI' ? 'صوتيات' : 
                  cat === 'Entertainment' ? 'تسلية وترفيه' : cat
                ) : cat}
              </button>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className={`flex items-center gap-4 relative z-20 transition-opacity duration-300 ${totalPages > 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <button 
              onClick={prevPage}
              disabled={safeCurrentPage === 1}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[rgba(255,255,255,0.1)]"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <ChevronLeft className="w-6 h-6" style={{ color: 'var(--sync-text-primary)' }} />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages || 1 }).map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = pageNum === safeCurrentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 ${
                      isActive 
                        ? 'bg-(--sync-yellow) text-[#0B132B] shadow-[0_0_15px_rgba(255,194,26,0.4)]' 
                        : 'bg-[rgba(255,255,255,0.05)] text-(--sync-text-primary) hover:bg-[rgba(255,255,255,0.1)]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={nextPage}
              disabled={safeCurrentPage === totalPages}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[rgba(255,255,255,0.1)]"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <ChevronRight className="w-6 h-6" style={{ color: 'var(--sync-text-primary)' }} />
            </button>
          </div>
        </div>

        {/* Tools Grid Carousel */}
        <div className="relative min-h-[600px] overflow-visible">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={safeCurrentPage + activeCategory}
              custom={direction}
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {currentTools.map((tool) => (
                <Link 
                  key={tool.id} 
                  href={tool.id === 'gemini' ? `/tool/${tool.id}` : `#`} 
                  onClick={(e) => { if (tool.id !== 'gemini') e.preventDefault() }}
                  className={`block relative group rounded-4xl overflow-hidden p-[2px] transition-all duration-500 hover:-translate-y-4 ${tool.id !== 'gemini' ? 'cursor-default' : ''}`}
                  style={{
                    background: tool.bestDeal 
                      ? 'linear-gradient(135deg, var(--sync-yellow), transparent 80%)' 
                      : 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent 80%)'
                  }}
                >
                  {/* Outer Hover Glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl" style={{ background: 'var(--sync-yellow)', opacity: tool.bestDeal ? 0.3 : 0.1 }} />
                  
                  {/* Inner Card content */}
                  <div className="relative h-full rounded-[1.9rem] flex flex-col overflow-hidden shadow-2xl" style={{ background: 'var(--sync-surface)' }}>
                    
                    {tool.id !== 'gemini' && (
                      <div className="absolute inset-0 z-50 bg-[#0B132B]/80 backdrop-blur-sm flex items-center justify-center transition-all duration-500">
                        <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-0 group-hover:-translate-y-4 group-hover:opacity-0 transition-all duration-500 pointer-events-none">
                          <span className="px-6 py-3 rounded-full border border-[rgba(255,255,255,0.1)] bg-[#0B132B]/90 font-bold uppercase tracking-widest text-sm text-white shadow-2xl flex items-center gap-2">
                            <Sparkles className="w-4 h-4" style={{ color: 'var(--sync-yellow)' }} />
                            {lang === 'ar' ? 'قريباً' : 'Coming Soon'}
                          </span>
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                          <button 
                            className="px-6 py-3 rounded-full font-bold uppercase tracking-widest text-sm bg-(--sync-yellow) text-[#0B132B] hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_30px_rgba(255,194,26,0.3)] pointer-events-auto cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              window.location.href = `mailto:contact@chameleon-vision.com?subject=Request Special Access for ${tool.name}`;
                            }}
                          >
                            <MessageSquare className="w-4 h-4" />
                            {lang === 'ar' ? 'ابعتلنا طلب خاص' : 'Request Access'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Cover Image */}
                    <div className="w-full h-48 relative overflow-hidden bg-[#070b19] flex items-center justify-center">
                      {tool.image ? (
                        <img 
                          src={tool.image} 
                          alt={tool.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <tool.icon className="w-24 h-24 opacity-10" style={{ color: 'var(--sync-yellow)' }} />
                      )}
                    </div>

                    {tool.bestDeal && (
                      <div className="absolute top-8 right-0 pr-4 pl-6 py-2 rounded-l-full text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,194,26,0.3)] z-20" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>
                        {t.bestDeal}
                      </div>
                    )}

                    <div className="p-8 pt-0 flex-1 flex flex-col justify-between relative z-10">
                      {/* Giant Watermark Icon */}
                      <tool.icon className="absolute -bottom-12 -right-12 w-64 h-64 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 group-hover:scale-110 group-hover:rotate-12 pointer-events-none" style={{ color: 'var(--sync-text-primary)' }} />

                      <div className="relative z-10 mt-6">
                        <div className="mb-12">
                        <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-5 shadow-sm" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>
                          {lang === 'ar' ? tool.discount.replace('Up to', 'خصم حتى').replace('OFF', '') : tool.discount}
                        </div>
                        <p className="text-sm uppercase tracking-widest mb-2 opacity-60 font-semibold" style={{ color: 'var(--sync-text-primary)' }}>{tool.category}</p>
                        <h3 className="text-4xl font-black tracking-tight drop-shadow-sm group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-500" style={{ color: 'var(--sync-text-primary)' }}>{tool.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-between relative z-10 pt-8 mt-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <p className="opacity-60 text-sm mb-1 font-medium" style={{ color: 'var(--sync-text-primary)' }}>{lang === 'ar' ? 'تبدأ من' : 'Starting from'}</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-black drop-shadow-md" style={{ color: 'var(--sync-yellow)' }}>{tool.startingPrice}</span>
                          <span className="text-lg font-bold opacity-80" style={{ color: 'var(--sync-yellow)' }}>{t.month}</span>
                        </div>
                      </div>
                      
                      <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg group-hover:shadow-[0_0_25px_rgba(255,194,26,0.5)]" style={{ background: 'var(--sync-yellow)' }}>
                        <svg className="w-6 h-6 text-[#0B132B] transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={lang === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                        </svg>
                      </div>
                    </div>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
