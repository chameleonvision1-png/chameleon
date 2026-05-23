"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSync } from './SyncProviders';
import { Sparkles, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createSyncClient } from '@/lib/sync/supabase-client';

interface Product {
  id: string;
  slug: string;
  name: string;
  cover_image_url: string | null;
  is_active: boolean;
  sort_order: number;
  category: {
    id: string;
    name_en: string;
    name_ar: string;
    slug: string;
  } | null;
  plans: {
    id: string;
    price_usd: number;
    discount_label: string | null;
    is_highlighted: boolean;
    is_active: boolean;
  }[];
}

export default function SyncToolsGrid() {
  const { t, lang } = useSync();
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ name_en: string; name_ar: string; slug: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 6;

  // Fetch products and categories from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createSyncClient();

        // Fetch categories
        const { data: categoriesData, error: catError } = await supabase
          .from('categories')
          .select('name_en, name_ar, slug')
          .eq('is_active', true)
          .order('sort_order');

        if (catError) console.error("Categories fetch error:", catError);
        if (categoriesData) {
          setCategories(categoriesData);
        }

        // Fetch products with category and cheapest plan info
        const { data: productsData, error: prodError } = await supabase
          .from('products')
          .select(`
            id, slug, name, cover_image_url, is_active, sort_order,
            category:categories(id, name_en, name_ar, slug),
            plans(id, price_usd, discount_label, is_highlighted, is_active)
          `)
          .order('is_active', { ascending: false })
          .order('sort_order');

        if (prodError) throw prodError;
        if (productsData) {
          const processed = (productsData as any[]).map(p => ({
            ...p,
            plans: (p.plans || []).filter((pl: any) => pl.is_active)
          }));
          setProducts(processed as unknown as Product[]);
        }
      } catch (err) {
        console.error("Products fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter(p => p.category?.slug === activeCategory);
  }, [activeCategory, products]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const currentProducts = filteredProducts.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

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
    visible: () => ({
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

  // Get the starting price and best discount for a product
  const getProductMeta = (product: Product) => {
    if (!product.plans || product.plans.length === 0) {
      return { startingPrice: '$0', discount: '', bestDeal: false };
    }
    const prices = product.plans.map(p => Number(p.price_usd));
    const minPrice = Math.min(...prices);
    const bestPlan = product.plans.find(p => p.is_highlighted) || product.plans[0];
    const hasHighlighted = product.plans.some(p => p.is_highlighted);
    return {
      startingPrice: `$${minPrice}`,
      discount: bestPlan.discount_label || '',
      bestDeal: hasHighlighted,
    };
  };

  if (isLoading) {
    return (
      <section id="deals" className="py-24 relative z-10">
        <div className="max-w-[1600px] w-full mx-auto px-4 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--sync-yellow)' }} />
        </div>
      </section>
    );
  }

  return (
    <section id="deals" className="py-24 relative z-10">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-12 2xl:px-24">
        <h2 className="sync-heading text-4xl md:text-5xl text-center mb-12">{t.dealsTitle}</h2>
        
        {/* Filter and Pagination Row */}
        <div className="flex flex-col xl:flex-row items-center justify-between gap-8 mb-12">
          {/* Categories Filter */}
          <div className="flex flex-wrap justify-center xl:justify-start gap-2">
            <button
              onClick={() => handleCategoryChange('All')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-sm ${
                activeCategory === 'All' 
                  ? 'bg-(--sync-yellow) text-[#0B132B] shadow-[0_0_15px_rgba(255,194,26,0.4)]' 
                  : 'bg-[rgba(255,255,255,0.03)] text-(--sync-text-primary) hover:bg-[rgba(255,255,255,0.1)]'
              }`}
            >
              {lang === 'ar' ? 'الكل' : 'All'}
            </button>
            {categories.map(cat => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-sm ${
                  activeCategory === cat.slug 
                    ? 'bg-(--sync-yellow) text-[#0B132B] shadow-[0_0_15px_rgba(255,194,26,0.4)]' 
                    : 'bg-[rgba(255,255,255,0.03)] text-(--sync-text-primary) hover:bg-[rgba(255,255,255,0.1)]'
                }`}
              >
                {lang === 'ar' ? cat.name_ar : cat.name_en}
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
              {currentProducts.map((product) => {
                const meta = getProductMeta(product);
                // Only active products with plans are clickable
                const isAvailable = product.is_active && product.plans && product.plans.length > 0;

                return (
                  <Link 
                    key={product.id} 
                    href={isAvailable ? `/tool/${product.slug}` : `#`} 
                    onClick={(e) => { if (!isAvailable) e.preventDefault() }}
                    className={`block relative group rounded-4xl overflow-hidden p-[2px] transition-all duration-500 hover:-translate-y-4 ${!isAvailable ? 'cursor-default' : ''}`}
                    style={{
                      background: meta.bestDeal 
                        ? 'linear-gradient(135deg, var(--sync-yellow), transparent 80%)' 
                        : 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent 80%)'
                    }}
                  >
                    {/* Outer Hover Glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl" style={{ background: 'var(--sync-yellow)', opacity: meta.bestDeal ? 0.3 : 0.1 }} />
                    
                    {/* Inner Card content */}
                    <div className="relative h-full rounded-[1.9rem] flex flex-col overflow-hidden shadow-2xl" style={{ background: 'var(--sync-surface)' }}>
                      
                      {!isAvailable && (
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
                                window.location.href = `mailto:contact@chameleon-vision.com?subject=Request Special Access for ${product.name}`;
                              }}
                            >
                              {lang === 'ar' ? 'ابعتلنا طلب خاص' : 'Request Access'}
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Cover Image */}
                      <div className="w-full h-48 relative overflow-hidden bg-[#070b19] flex items-center justify-center">
                        {product.cover_image_url ? (
                          <img 
                            src={product.cover_image_url} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <Sparkles className="w-24 h-24 opacity-10" style={{ color: 'var(--sync-yellow)' }} />
                        )}
                      </div>

                      {meta.bestDeal && (
                        <div className="absolute top-8 right-0 pr-4 pl-6 py-2 rounded-l-full text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,194,26,0.3)] z-20" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>
                          {t.bestDeal}
                        </div>
                      )}

                      <div className="p-8 pt-0 flex-1 flex flex-col justify-between relative z-10">
                        {/* Giant Watermark Icon */}
                        <Sparkles className="absolute -bottom-12 -right-12 w-64 h-64 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 group-hover:scale-110 group-hover:rotate-12 pointer-events-none" style={{ color: 'var(--sync-text-primary)' }} />

                        <div className="relative z-10 mt-6">
                          <div className="mb-12">
                          {meta.discount && (
                            <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-5 shadow-sm" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>
                              {lang === 'ar' ? meta.discount.replace('Up to', 'خصم حتى').replace('OFF', '') : meta.discount}
                            </div>
                          )}
                          <p className="text-sm uppercase tracking-widest mb-2 opacity-60 font-semibold" style={{ color: 'var(--sync-text-primary)' }}>
                            {lang === 'ar' ? product.category?.name_ar : product.category?.name_en}
                          </p>
                          <h3 className="text-4xl font-black tracking-tight drop-shadow-sm group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-500" style={{ color: 'var(--sync-text-primary)' }}>{product.name}</h3>
                        </div>
                      </div>

                      {isAvailable && (
                        <div className="flex items-center justify-between relative z-10 pt-8 mt-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <div>
                            <p className="opacity-60 text-sm mb-1 font-medium" style={{ color: 'var(--sync-text-primary)' }}>{lang === 'ar' ? 'تبدأ من' : 'Starting from'}</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-5xl font-black drop-shadow-md" style={{ color: 'var(--sync-yellow)' }}>{meta.startingPrice}</span>
                              <span className="text-lg font-bold opacity-80" style={{ color: 'var(--sync-yellow)' }}>{t.month}</span>
                            </div>
                          </div>
                          
                          <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg group-hover:shadow-[0_0_25px_rgba(255,194,26,0.5)]" style={{ background: 'var(--sync-yellow)' }}>
                            <svg className="w-6 h-6 text-[#0B132B] transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={lang === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                            </svg>
                          </div>
                        </div>
                      )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
