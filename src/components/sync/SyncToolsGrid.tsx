"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSync } from './SyncProviders';
import { Sparkles, ChevronLeft, ChevronRight, Loader2, Search, LayoutGrid, List, Grid3X3, ArrowUpDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createSyncClient } from '@/lib/sync/supabase-client';

interface Product {
  id: string;
  slug: string;
  name: string;
  cover_image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
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

type ViewMode = 'grid' | 'list' | 'compact';
type SortMode = 'default' | 'price-asc' | 'price-desc' | 'newest' | 'name-asc';

export default function SyncToolsGrid() {
  const { t, lang } = useSync();
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ name_en: string; name_ar: string; slug: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showViewOptions, setShowViewOptions] = useState(false);
  const [catStartIndex, setCatStartIndex] = useState(0);
  const viewBtnRef = useRef<HTMLDivElement>(null);

  const VISIBLE_CATS = 3;
  const itemsPerPage = viewMode === 'list' ? 8 : viewMode === 'compact' ? 12 : 6;

  // Fetch products and categories from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createSyncClient();

        const { data: categoriesData, error: catError } = await supabase
          .from('categories')
          .select('name_en, name_ar, slug')
          .eq('is_active', true)
          .order('sort_order');

        if (catError) console.error("Categories fetch error:", catError);
        if (categoriesData) {
          setCategories(categoriesData);
        }

        const { data: productsData, error: prodError } = await supabase
          .from('products')
          .select(`
            id, slug, name, cover_image_url, is_active, sort_order, created_at,
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

  // Close view options on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (viewBtnRef.current && !viewBtnRef.current.contains(e.target as Node)) {
        setShowViewOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getMinPrice = (product: Product) => {
    if (!product.plans || product.plans.length === 0) return Infinity;
    return Math.min(...product.plans.map(p => Number(p.price_usd)));
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = products;
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category?.slug === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }
    switch (sortMode) {
      case 'price-asc':
        result = [...result].sort((a, b) => getMinPrice(a) - getMinPrice(b));
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => getMinPrice(b) - getMinPrice(a));
        break;
      case 'newest':
        result = [...result].sort((a, b) => {
          const da = a.created_at ? new Date(a.created_at).getTime() : 0;
          const db = b.created_at ? new Date(b.created_at).getTime() : 0;
          return db - da;
        });
        break;
      case 'name-asc':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return result;
  }, [activeCategory, products, searchQuery, sortMode]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const currentProducts = filteredAndSortedProducts.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

  // All categories with "All" prepended
  const allCats = useMemo(() => [
    { slug: 'All', name_en: 'All', name_ar: 'الكل' },
    ...categories
  ], [categories]);

  const visibleCats = allCats.slice(catStartIndex, catStartIndex + VISIBLE_CATS);
  const canCatPrev = catStartIndex > 0;
  const canCatNext = catStartIndex + VISIBLE_CATS < allCats.length;

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
    setDirection(1);
  };

  const nextPage = () => {
    if (safeCurrentPage < totalPages) { setDirection(1); setCurrentPage(safeCurrentPage + 1); }
  };
  const prevPage = () => {
    if (safeCurrentPage > 1) { setDirection(-1); setCurrentPage(safeCurrentPage - 1); }
  };
  const goToPage = (page: number) => {
    setDirection(page > safeCurrentPage ? 1 : -1);
    setCurrentPage(page);
  };
  const handleSearchChange = (val: string) => { setSearchQuery(val); setCurrentPage(1); };
  const handleViewChange = (mode: ViewMode) => { setViewMode(mode); setCurrentPage(1); setShowViewOptions(false); };
  const handleSortChange = (mode: SortMode) => { setSortMode(mode); setShowSortDropdown(false); setCurrentPage(1); };

  const sortLabels: Record<SortMode, { en: string; ar: string }> = {
    'default': { en: 'Default', ar: 'افتراضي' },
    'price-asc': { en: 'Price ↑', ar: 'السعر ↑' },
    'price-desc': { en: 'Price ↓', ar: 'السعر ↓' },
    'newest': { en: 'Newest', ar: 'الأحدث' },
    'name-asc': { en: 'A → Z', ar: 'أ → ي' },
  };

  const viewIcons: Record<ViewMode, React.ReactNode> = {
    grid: <LayoutGrid className="w-4 h-4" />,
    list: <List className="w-4 h-4" />,
    compact: <Grid3X3 className="w-4 h-4" />,
  };
  const viewLabels: Record<ViewMode, { en: string; ar: string }> = {
    grid: { en: 'Grid', ar: 'شبكة' },
    list: { en: 'List', ar: 'قائمة' },
    compact: { en: 'Compact', ar: 'مصغر' },
  };

  const slideVariants: any = {
    hidden: (dir: number) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
    visible: () => ({ x: 0, opacity: 1, transition: { type: 'spring' as const, bounce: 0.3, duration: 0.6 } }),
    exit: (dir: number) => ({ x: dir > 0 ? -100 : 100, opacity: 0, transition: { duration: 0.3 } })
  };

  const getProductMeta = (product: Product) => {
    if (!product.plans || product.plans.length === 0) {
      return { startingPrice: '$0', discount: '', bestDeal: false };
    }
    const prices = product.plans.map(p => Number(p.price_usd));
    const minPrice = Math.min(...prices);
    const bestPlan = product.plans.find(p => p.is_highlighted) || product.plans[0];
    const hasHighlighted = product.plans.some(p => p.is_highlighted);
    return { startingPrice: `$${minPrice}`, discount: bestPlan.discount_label || '', bestDeal: hasHighlighted };
  };

  const getGridClass = () => {
    switch (viewMode) {
      case 'list': return 'grid grid-cols-1 gap-4';
      case 'compact': return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
      default: return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';
    }
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
        
        {/* ═══ TOOLBAR ═══ */}
        <div className="flex flex-col gap-3 mb-10 xl:flex-row xl:items-center xl:gap-3">

          {/* ── Row 1 (mobile): Search + View + Sort ── */}
          <div className="flex items-center gap-2 w-full xl:w-auto xl:contents">

            {/* Search */}
            <div className="relative flex-1 xl:flex-none xl:min-w-[200px]">
              <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--sync-text-dim)', [lang === 'ar' ? 'right' : 'left']: '14px' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={lang === 'ar' ? 'ابحث...' : 'Search...'}
                className="w-full h-10 rounded-full text-sm font-medium transition-all duration-300 border outline-none bg-(--sync-bg-elevated) text-(--sync-text-primary) border-(--sync-border) placeholder:text-(--sync-text-dim) focus:border-(--sync-yellow) focus:shadow-[0_0_12px_rgba(255,194,26,0.15)]"
                style={{ [lang === 'ar' ? 'paddingRight' : 'paddingLeft']: '38px', [lang === 'ar' ? 'paddingLeft' : 'paddingRight']: searchQuery ? '34px' : '14px' }}
              />
              {searchQuery && (
                <button onClick={() => handleSearchChange('')} className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-(--sync-surface)" style={{ [lang === 'ar' ? 'left' : 'right']: '8px' }}>
                  <X className="w-3.5 h-3.5" style={{ color: 'var(--sync-text-dim)' }} />
                </button>
              )}
            </div>

            {/* View Mode (single button with popout) */}
            <div className="relative xl:order-5" ref={viewBtnRef}>
              <button
                onClick={() => setShowViewOptions(!showViewOptions)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border bg-(--sync-yellow) text-[#0B132B] border-transparent shadow-[0_0_12px_rgba(255,194,26,0.3)]"
                title={lang === 'ar' ? viewLabels[viewMode].ar : viewLabels[viewMode].en}
              >
                {viewIcons[viewMode]}
              </button>

              {showViewOptions && (
                <div className="absolute top-full mt-2 z-50 rounded-2xl border shadow-xl overflow-hidden" style={{ background: 'var(--sync-bg-elevated)', borderColor: 'var(--sync-border)', [lang === 'ar' ? 'left' : 'right']: 0 }}>
                  {(['grid', 'list', 'compact'] as ViewMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleViewChange(mode)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold transition-all duration-200 whitespace-nowrap ${viewMode === mode ? 'bg-(--sync-yellow) text-[#0B132B]' : 'text-(--sync-text-primary) hover:bg-(--sync-surface)'}`}
                    >
                      {viewIcons[mode]}
                      <span>{lang === 'ar' ? viewLabels[mode].ar : viewLabels[mode].en}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative xl:order-4">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className={`h-10 px-4 rounded-full text-xs font-bold flex items-center gap-2 transition-all duration-300 border whitespace-nowrap ${showSortDropdown ? 'bg-(--sync-yellow) text-[#0B132B] border-transparent' : 'bg-(--sync-bg-elevated) text-(--sync-text-primary) border-(--sync-border) hover:bg-(--sync-surface)'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'ar' ? sortLabels[sortMode].ar : sortLabels[sortMode].en}</span>
              </button>
              {showSortDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
                  <div className="absolute top-full mt-2 z-50 min-w-[180px] rounded-2xl border shadow-xl overflow-hidden" style={{ background: 'var(--sync-bg-elevated)', borderColor: 'var(--sync-border)', [lang === 'ar' ? 'left' : 'right']: 0 }}>
                    {(Object.keys(sortLabels) as SortMode[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => handleSortChange(key)}
                        className={`w-full text-start px-5 py-2.5 text-xs font-semibold transition-all duration-200 ${sortMode === key ? 'bg-(--sync-yellow) text-[#0B132B]' : 'text-(--sync-text-primary) hover:bg-(--sync-surface)'}`}
                      >
                        {lang === 'ar' ? sortLabels[key].ar : sortLabels[key].en}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>

          {/* ── Row 2 (mobile): Categories + Pagination ── */}
          <div className="flex items-center justify-between gap-2 w-full xl:w-auto xl:contents">

            {/* Categories (3 visible + arrows) */}
            <div className="flex items-center gap-1 xl:gap-1.5 xl:order-2">
              <button
                onClick={() => {
                  const currentIdx = allCats.findIndex(c => c.slug === activeCategory);
                  const prevIdx = Math.max(0, currentIdx - 1);
                  handleCategoryChange(allCats[prevIdx].slug);
                  if (prevIdx < catStartIndex) setCatStartIndex(prevIdx);
                }}
                disabled={allCats.findIndex(c => c.slug === activeCategory) === 0}
                className="w-7 h-7 xl:w-8 xl:h-8 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-(--sync-bg-elevated) border border-(--sync-border)"
              >
                <ChevronLeft className="w-3.5 h-3.5 xl:w-4 xl:h-4" style={{ color: 'var(--sync-text-primary)' }} />
              </button>

              <div className="flex items-center gap-1 xl:gap-1.5">
                {visibleCats.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`px-3 py-1.5 xl:px-5 xl:py-2 rounded-full text-[11px] xl:text-xs font-bold transition-all duration-300 border whitespace-nowrap ${
                      activeCategory === cat.slug
                        ? 'bg-(--sync-yellow) text-[#0B132B] border-transparent shadow-[0_0_12px_rgba(255,194,26,0.35)]'
                        : 'bg-(--sync-bg-elevated) text-(--sync-text-primary) border-(--sync-border) hover:bg-(--sync-surface)'
                    }`}
                  >
                    {lang === 'ar' ? cat.name_ar : cat.name_en}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  const currentIdx = allCats.findIndex(c => c.slug === activeCategory);
                  const nextIdx = Math.min(allCats.length - 1, currentIdx + 1);
                  handleCategoryChange(allCats[nextIdx].slug);
                  if (nextIdx >= catStartIndex + VISIBLE_CATS) setCatStartIndex(nextIdx - VISIBLE_CATS + 1);
                }}
                disabled={allCats.findIndex(c => c.slug === activeCategory) === allCats.length - 1}
                className="w-7 h-7 xl:w-8 xl:h-8 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-(--sync-bg-elevated) border border-(--sync-border)"
              >
                <ChevronRight className="w-3.5 h-3.5 xl:w-4 xl:h-4" style={{ color: 'var(--sync-text-primary)' }} />
              </button>
            </div>

            {/* Spacer (desktop only) */}
            <div className="flex-1 hidden xl:block xl:order-3" />

            {/* Pagination */}
            <div className={`flex items-center gap-1 xl:gap-2 xl:order-6 transition-opacity duration-300 ${totalPages > 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <button 
                onClick={prevPage}
                disabled={safeCurrentPage === 1}
                className="w-7 h-7 xl:w-8 xl:h-8 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-(--sync-bg-elevated) border border-(--sync-border)"
              >
                <ChevronLeft className="w-3.5 h-3.5 xl:w-4 xl:h-4" style={{ color: 'var(--sync-text-primary)' }} />
              </button>

              <div className="flex items-center gap-1 xl:gap-1.5">
                {Array.from({ length: totalPages || 1 }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = pageNum === safeCurrentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-7 h-7 xl:w-8 xl:h-8 rounded-full font-bold text-[11px] xl:text-xs transition-all duration-300 border ${
                        isActive
                          ? 'bg-(--sync-yellow) text-[#0B132B] border-transparent shadow-[0_0_12px_rgba(255,194,26,0.35)]'
                          : 'bg-(--sync-bg-elevated) text-(--sync-text-primary) border-(--sync-border) hover:bg-(--sync-surface)'
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
                className="w-7 h-7 xl:w-8 xl:h-8 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-(--sync-bg-elevated) border border-(--sync-border)"
              >
                <ChevronRight className="w-3.5 h-3.5 xl:w-4 xl:h-4" style={{ color: 'var(--sync-text-primary)' }} />
              </button>
            </div>

          </div>

        </div>

        {/* ═══ PRODUCTS GRID ═══ */}
        <div className={`relative ${viewMode === 'grid' ? 'min-h-[600px]' : 'min-h-[300px]'} overflow-visible`}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={safeCurrentPage + activeCategory + viewMode + sortMode + searchQuery}
              custom={direction}
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={getGridClass()}
            >
              {currentProducts.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
                  <Search className="w-12 h-12 opacity-20" style={{ color: 'var(--sync-text-primary)' }} />
                  <p className="text-lg font-bold opacity-50" style={{ color: 'var(--sync-text-primary)' }}>
                    {lang === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                  </p>
                </div>
              ) : currentProducts.map((product) => {
                const meta = getProductMeta(product);
                const isAvailable = product.is_active && product.plans && product.plans.length > 0;

                /* ── LIST VIEW ── */
                if (viewMode === 'list') {
                  return (
                    <Link 
                      key={product.id} 
                      href={isAvailable ? `/tool/${product.slug}` : `#`} 
                      onClick={(e) => { if (!isAvailable) e.preventDefault() }}
                      className={`block relative group rounded-2xl overflow-hidden p-[2px] transition-all duration-400 hover:-translate-y-1 ${!isAvailable ? 'cursor-default' : ''}`}
                      style={{
                        background: meta.bestDeal 
                          ? 'linear-gradient(135deg, var(--sync-yellow), transparent 80%)' 
                          : 'linear-gradient(135deg, var(--sync-border), transparent 80%)'
                      }}
                    >
                      <div className="relative h-full rounded-[0.9rem] flex flex-row items-center overflow-hidden shadow-lg" style={{ background: 'var(--sync-surface)' }}>
                        {!isAvailable && (
                          <div className="absolute inset-0 z-50 bg-[#0B132B]/80 backdrop-blur-sm flex items-center justify-center">
                            <span className="px-4 py-2 rounded-full border border-[rgba(255,255,255,0.1)] bg-[#0B132B]/90 font-bold uppercase tracking-widest text-xs text-white flex items-center gap-2">
                              <Sparkles className="w-3 h-3" style={{ color: 'var(--sync-yellow)' }} />
                              {lang === 'ar' ? 'قريباً' : 'Coming Soon'}
                            </span>
                          </div>
                        )}
                        <div className="w-24 h-24 sm:w-32 sm:h-24 shrink-0 relative overflow-hidden flex items-center justify-center" style={{ background: 'var(--sync-bg-elevated)' }}>
                          {product.cover_image_url ? (
                            <img src={product.cover_image_url} alt={product.name} className="w-full h-full object-cover sync-light-image-filter" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          ) : (
                            <Sparkles className="w-10 h-10 opacity-10" style={{ color: 'var(--sync-yellow)' }} />
                          )}
                        </div>
                        <div className="flex-1 flex items-center justify-between px-5 py-4 gap-4 min-w-0">
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-widest opacity-50 font-semibold mb-1 truncate" style={{ color: 'var(--sync-text-primary)' }}>
                              {lang === 'ar' ? product.category?.name_ar : product.category?.name_en}
                            </p>
                            <h3 className="text-lg font-black truncate" style={{ color: 'var(--sync-text-primary)' }}>{product.name}</h3>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            {meta.discount && (
                              <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>
                                {lang === 'ar' ? meta.discount.replace('Up to', 'خصم حتى').replace('OFF', '') : meta.discount}
                              </span>
                            )}
                            {isAvailable && <span className="text-2xl font-black" style={{ color: 'var(--sync-yellow)' }}>{meta.startingPrice}</span>}
                            {isAvailable && (
                              <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: 'var(--sync-yellow)' }}>
                                <svg className="w-4 h-4 text-[#0B132B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={lang === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                }

                /* ── COMPACT VIEW ── */
                if (viewMode === 'compact') {
                  return (
                    <Link 
                      key={product.id} 
                      href={isAvailable ? `/tool/${product.slug}` : `#`} 
                      onClick={(e) => { if (!isAvailable) e.preventDefault() }}
                      className={`block relative group rounded-2xl overflow-hidden p-[2px] transition-all duration-400 hover:-translate-y-2 ${!isAvailable ? 'cursor-default' : ''}`}
                      style={{
                        background: meta.bestDeal 
                          ? 'linear-gradient(135deg, var(--sync-yellow), transparent 80%)' 
                          : 'linear-gradient(135deg, var(--sync-border), transparent 80%)'
                      }}
                    >
                      <div className="relative h-full rounded-[0.9rem] flex flex-col overflow-hidden shadow-lg" style={{ background: 'var(--sync-surface)' }}>
                        {!isAvailable && (
                          <div className="absolute inset-0 z-50 bg-[#0B132B]/80 backdrop-blur-sm flex items-center justify-center">
                            <span className="px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.1)] bg-[#0B132B]/90 font-bold uppercase tracking-widest text-[10px] text-white flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3" style={{ color: 'var(--sync-yellow)' }} />
                              {lang === 'ar' ? 'قريباً' : 'Soon'}
                            </span>
                          </div>
                        )}
                        {meta.bestDeal && (
                          <div className="absolute top-3 right-0 pr-3 pl-4 py-1 rounded-l-full text-[10px] font-black uppercase tracking-widest z-20" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>
                            {t.bestDeal}
                          </div>
                        )}
                        <div className="w-full h-28 relative overflow-hidden flex items-center justify-center" style={{ background: 'var(--sync-bg-elevated)' }}>
                          {product.cover_image_url ? (
                            <img src={product.cover_image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 sync-light-image-filter" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          ) : (
                            <Sparkles className="w-12 h-12 opacity-10" style={{ color: 'var(--sync-yellow)' }} />
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest opacity-50 font-semibold mb-1" style={{ color: 'var(--sync-text-primary)' }}>
                              {lang === 'ar' ? product.category?.name_ar : product.category?.name_en}
                            </p>
                            <h3 className="text-base font-black truncate" style={{ color: 'var(--sync-text-primary)' }}>{product.name}</h3>
                          </div>
                          {isAvailable && (
                            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--sync-border)' }}>
                              <span className="text-xl font-black" style={{ color: 'var(--sync-yellow)' }}>{meta.startingPrice}</span>
                              <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: 'var(--sync-yellow)' }}>
                                <svg className="w-3.5 h-3.5 text-[#0B132B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={lang === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                }

                /* ── DEFAULT GRID VIEW ── */
                return (
                  <Link 
                    key={product.id} 
                    href={isAvailable ? `/tool/${product.slug}` : `#`} 
                    onClick={(e) => { if (!isAvailable) e.preventDefault() }}
                    className={`block relative group rounded-4xl overflow-hidden p-[2px] transition-all duration-500 hover:-translate-y-4 ${!isAvailable ? 'cursor-default' : ''}`}
                    style={{
                      background: meta.bestDeal 
                        ? 'linear-gradient(135deg, var(--sync-yellow), transparent 80%)' 
                        : 'linear-gradient(135deg, var(--sync-border), transparent 80%)'
                    }}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl" style={{ background: 'var(--sync-yellow)', opacity: meta.bestDeal ? 0.3 : 0.1 }} />
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
                      <div className="w-full h-48 relative overflow-hidden bg-(--sync-bg-elevated) flex items-center justify-center">
                        {product.cover_image_url ? (
                          <img src={product.cover_image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 sync-light-image-filter" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
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
                          <div className="flex items-center justify-between relative z-10 pt-8 mt-auto" style={{ borderTop: '1px solid var(--sync-border)' }}>
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
