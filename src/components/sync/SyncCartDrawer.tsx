"use client";

import React from 'react';
import Link from 'next/link';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useSyncCart } from './SyncCartProvider';
import { useSync } from './SyncProviders';

export default function SyncCartDrawer() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalUsd, isCartOpen, setIsCartOpen } = useSyncCart();
  const { lang } = useSync();

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) setIsCartOpen(false);
    };
    if (isCartOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-90 transition-opacity duration-300" 
        onClick={() => setIsCartOpen(false)} 
        onKeyDown={(e) => e.key === 'Escape' && setIsCartOpen(false)}
        tabIndex={0}
        role="button"
        aria-label="Close cart"
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a1128] border-l border-white/10 shadow-2xl z-100 flex flex-col transform transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5" style={{ color: 'var(--sync-yellow)' }} />
            <h2 className="text-lg font-black text-white tracking-wider">
              {lang === 'ar' ? 'السلة' : 'Cart'} ({totalItems})
            </h2>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-40">
              <ShoppingBag className="w-16 h-16 mb-4" />
              <p className="text-lg font-bold">{lang === 'ar' ? 'السلة فاضية' : 'Cart is empty'}</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.planId} className="rounded-xl border border-white/10 p-4 space-y-3" style={{ background: '#0d1530' }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{item.productName}</p>
                    <p className="text-xs opacity-60 mt-1">{item.planTitle}</p>
                    <p className="text-xs opacity-40">{item.durationDays} {lang === 'ar' ? 'يوم' : 'days'}</p>
                  </div>
                  <button onClick={() => removeItem(item.planId)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 overflow-hidden">
                    <button onClick={() => updateQuantity(item.planId, item.quantity - 1)} className="p-2 hover:bg-white/5 transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.planId, item.quantity + 1)} className="p-2 hover:bg-white/5 transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="font-black text-lg" style={{ color: 'var(--sync-yellow)' }}>
                    ${(item.priceUsd * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-60">{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
              <span className="text-2xl font-black" style={{ color: 'var(--sync-yellow)' }}>${totalUsd.toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02]"
              style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}
            >
              {lang === 'ar' ? 'إتمام الشراء' : 'Checkout'}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button onClick={clearCart} className="w-full py-2 text-sm text-red-400 hover:text-red-300 transition-colors">
              {lang === 'ar' ? 'إفراغ السلة' : 'Clear Cart'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
