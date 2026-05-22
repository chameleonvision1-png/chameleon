"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createSyncClient } from '@/lib/sync/supabase-client';
import { Package, Plus, ChevronLeft, Edit, Trash2, Tag, Box, ArrowRight, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';
import AdminPlanModal from './AdminPlanModal';
import AdminInventoryModal from './AdminInventoryModal';
import AdminPlanDetailsModal from './AdminPlanDetailsModal';
import { FileText, TrendingUp } from 'lucide-react';

export default function AdminProductsTab({ products, onRefresh }: { products: any[], onRefresh: () => void }) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [showInventoryModal, setShowInventoryModal] = useState<any>(null);
  const [showPlanDetailsModal, setShowPlanDetailsModal] = useState<any>(null);

  // Form states
  const [inventoryInput, setInventoryInput] = useState('');
  const [unitsSoldInputs, setUnitsSoldInputs] = useState<Record<string, string>>({});
  const [savingUnitsSold, setSavingUnitsSold] = useState<string | null>(null);

  const loadPlans = useCallback(async (productId: string) => {
    setIsLoadingPlans(true);
    try {
      const supabase = createSyncClient();
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order');
      
      if (error) throw error;
      setPlans(data || []);
    } catch (err: any) {
      console.error("Error loading plans:", err);
      alert("Failed to load plans: " + err.message);
      setPlans([]);
    } finally {
      setIsLoadingPlans(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      loadPlans(selectedProduct.id);
    }
  }, [selectedProduct, loadPlans]);

  const handleToggleActive = async (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    try {
      const supabase = createSyncClient();
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);
      
      if (error) throw error;
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // The handleSaveInventory logic is now inside AdminInventoryModal

  const handleSaveUnitsSold = async (planId: string) => {
    const val = unitsSoldInputs[planId];
    if (val === undefined || val === '') return;
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 0) { alert('Please enter a valid positive number.'); return; }
    setSavingUnitsSold(planId);
    try {
      const supabase = createSyncClient();
      const { error } = await supabase.from('plans').update({ units_sold: num }).eq('id', planId);
      if (error) throw error;
      await loadPlans(selectedProduct.id);
      setUnitsSoldInputs(prev => { const n = { ...prev }; delete n[planId]; return n; });
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSavingUnitsSold(null);
    }
  };

  if (selectedProduct) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedProduct(null)} 
            className="p-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            {selectedProduct.cover_image_url ? (
              <img src={selectedProduct.cover_image_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Package className="w-5 h-5 opacity-50" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-black">{selectedProduct.name}</h2>
              <p className="text-sm opacity-50 font-mono">{selectedProduct.slug}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Tag className="w-5 h-5" style={{ color: 'var(--sync-yellow)' }} /> 
            Packages & Pricing
          </h3>
          <button 
            onClick={() => { setEditingPlan(null); setShowPlanModal(true); }}
            className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(255,194,26,0.2)] w-full sm:w-auto justify-center"
            style={{ background: 'var(--sync-yellow)', color: '#060b18' }}
          >
            <Plus className="w-4 h-4" /> Add Package
          </button>
        </div>

        {isLoadingPlans ? (
          <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-(--sync-yellow)" /></div>
        ) : plans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/20 p-12 text-center opacity-50">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No packages found for this product.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map(plan => (
              <div key={plan.id} className="rounded-3xl border border-white/10 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300 shadow-2xl" style={{ background: '#080b14' }}>
                {plan.is_highlighted && (
                  <div className="absolute top-0 inset-x-0 h-1 z-10" style={{ background: 'var(--sync-yellow)' }}></div>
                )}
                
                {/* Mini Card Header */}
                <div className="h-32 relative overflow-hidden flex items-center justify-center p-4 border-b border-white/5" style={{ background: '#04165d' }}>
                  <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none" style={{ background: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }}></div>
                  <img src={plan.mini_card_url || selectedProduct.cover_image_url || '/sync-covers/products-ticket.jpg'} alt="" className="w-full h-full object-cover absolute inset-0 z-0 opacity-60 mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-500 group-hover:opacity-100 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-linear-to-t from-[#080b14] to-transparent z-10"></div>
                  
                  {plan.discount_label && (
                    <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full text-[10px] font-black shadow-lg" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>
                      {plan.discount_label}
                    </div>
                  )}
                  {plan.is_highlighted && (
                    <div className="absolute top-4 left-4 z-20">
                      <Sparkles className="w-5 h-5 drop-shadow-lg animate-pulse" style={{ color: 'var(--sync-yellow)' }} />
                    </div>
                  )}
                  <h4 className="font-black text-2xl relative z-20 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">{plan.title_en}</h4>
                </div>
                
                {/* Pricing & Details */}
                <div className="p-5 relative z-20">
                  <div className="flex justify-between items-end mb-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold mb-1">Pricing</p>
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-lg text-(--sync-yellow)">$</span>
                        <span className="font-black text-3xl text-(--sync-yellow) tracking-tighter">{plan.price_usd}</span>
                      </div>
                      {plan.original_price_usd && <p className="text-xs line-through opacity-50 block mt-1">${plan.original_price_usd}</p>}
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10">
                        <span className="w-2 h-2 rounded-full" style={{ background: plan.is_active ? '#4ade80' : '#ef4444' }}></span>
                        <span className="text-[10px] font-bold uppercase opacity-80">{plan.is_active ? 'Active' : 'Hidden'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs mb-6 font-medium">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="opacity-50">Delivery Type</span>
                      <span className="capitalize">{plan.delivery_type.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="opacity-50">Duration</span>
                      <span>{plan.duration_days} Days</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="opacity-50">In Stock</span>
                      <span className="font-bold text-(--sync-yellow)">
                        {plan.delivery_type === 'user_provides_email' ? '∞' : (plan.stock_count || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <span className="opacity-50 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Sold</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          className="w-16 px-2 py-0.5 rounded-md text-xs font-bold text-right bg-white/5 border border-white/10 focus:border-(--sync-yellow) focus:outline-none transition-colors"
                          placeholder={String(plan.units_sold || 0)}
                          value={unitsSoldInputs[plan.id] ?? ''}
                          onChange={e => setUnitsSoldInputs(prev => ({ ...prev, [plan.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') handleSaveUnitsSold(plan.id); }}
                        />
                        {unitsSoldInputs[plan.id] !== undefined && unitsSoldInputs[plan.id] !== '' && (
                          <button
                            onClick={() => handleSaveUnitsSold(plan.id)}
                            disabled={savingUnitsSold === plan.id}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors hover:opacity-90 disabled:opacity-50"
                            style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}
                          >
                            {savingUnitsSold === plan.id ? '...' : 'Save'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setShowInventoryModal(plan)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-(--sync-yellow) hover:text-[#0B132B] transition-colors flex justify-center items-center gap-1 border border-white/10 hover:border-transparent min-w-[80px]"
                    >
                      <Box className="w-4 h-4" /> Stock
                    </button>
                    <button 
                      onClick={() => setShowPlanDetailsModal(plan)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-blue-400 hover:text-[#0B132B] transition-colors flex items-center justify-center gap-1 border border-white/10 hover:border-transparent min-w-[100px]"
                      title="Details & Policies"
                    >
                      <FileText className="w-4 h-4" /> Info & Policy
                    </button>
                    <button 
                      onClick={() => { setEditingPlan(plan); setShowPlanModal(true); }}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center border border-white/10 shrink-0"
                      title="Edit Package"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors flex items-center justify-center border border-red-500/20 shrink-0" title="Delete Package">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Inventory Modal */}
        <AdminInventoryModal
          isOpen={!!showInventoryModal}
          onClose={() => setShowInventoryModal(null)}
          plan={showInventoryModal}
          onSuccess={() => loadPlans(selectedProduct.id)}
        />

      {/* Plan Modal */}
      <AdminPlanModal 
        isOpen={showPlanModal} 
        onClose={() => { setShowPlanModal(false); setEditingPlan(null); }} 
        product={selectedProduct} 
        plan={editingPlan} 
        onSuccess={() => loadPlans(selectedProduct.id)} 
      />

      {/* Plan Details Modal */}
      <AdminPlanDetailsModal
        isOpen={!!showPlanDetailsModal}
        onClose={() => setShowPlanDetailsModal(null)}
        plan={showPlanDetailsModal}
        onSuccess={() => loadPlans(selectedProduct.id)}
      />

      </div>
    );
  }

  // Main Products Grid
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-black">Services & Products</h1>
        <button 
          className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 w-full sm:w-auto justify-center"
          style={{ background: 'var(--sync-yellow)', color: '#060b18' }}
        >
          <Plus className="w-4 h-4" /> New Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map(p => (
          <div 
            key={p.id} 
            className="group rounded-2xl border border-white/5 overflow-hidden cursor-pointer hover:border-white/20 transition-all hover:shadow-[0_0_30px_rgba(255,194,26,0.1)] relative" 
            style={{ background: '#0d1530' }}
            onClick={() => setSelectedProduct(p)}
          >
            <div className="h-32 bg-white/5 relative">
              {p.cover_image_url ? (
                <img src={p.cover_image_url} alt="" className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-10">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10" onClick={e => e.stopPropagation()}>
                {p.is_active ? (
                  <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-400 backdrop-blur-md shadow-sm">Active</span>
                ) : (
                  <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/50 backdrop-blur-md shadow-sm">Coming Soon</span>
                )}
                <button
                  onClick={(e) => handleToggleActive(e, p)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    p.is_active ? 'bg-green-500' : 'bg-white/20'
                  }`}
                  title={p.is_active ? "Set as Coming Soon" : "Set as Active"}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      p.is_active ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-1">{p.name}</h3>
                  <p className="text-sm opacity-50">{(p.category as any)?.name_en || 'Uncategorized'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-(--sync-yellow) group-hover:text-[#060b18] transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
