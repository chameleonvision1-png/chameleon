import React, { useState, useEffect } from 'react';
import { createSyncClient } from '@/lib/sync/supabase-client';
import { X, Loader2, Save, Image as ImageIcon, Upload } from 'lucide-react';

interface AdminPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  plan?: any; // If null, create new
  onSuccess: () => void;
}

export default function AdminPlanModal({ isOpen, onClose, product, plan, onSuccess }: AdminPlanModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    price_usd: 0,
    original_price_usd: '',
    duration_days: 30,
    discount_label: '',
    mini_card_url: '',
    delivery_type: 'ready_account',
    is_active: true,
    is_highlighted: false,
    sort_order: 0,
    max_accounts: 1,
    features: [] as string[],
    custom_details_en: '',
    custom_details_ar: '',
    custom_activation_en: '',
    custom_activation_ar: '',
    custom_policies_en: '',
    custom_policies_ar: ''
  });
  
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    if (plan) {
      setFormData({
        title_en: plan.title_en || '',
        title_ar: plan.title_ar || '',
        price_usd: plan.price_usd || 0,
        original_price_usd: plan.original_price_usd || '',
        duration_days: plan.duration_days || 30,
        discount_label: plan.discount_label || '',
        mini_card_url: plan.mini_card_url || '',
        delivery_type: plan.delivery_type || 'ready_account',
        is_active: plan.is_active ?? true,
        is_highlighted: plan.is_highlighted ?? false,
        sort_order: plan.sort_order || 0,
        max_accounts: plan.max_accounts || 1,
        features: Array.isArray(plan.features) ? plan.features : [],
        custom_details_en: plan.custom_details_en || '',
        custom_details_ar: plan.custom_details_ar || '',
        custom_activation_en: plan.custom_activation_en || '',
        custom_activation_ar: plan.custom_activation_ar || '',
        custom_policies_en: plan.custom_policies_en || '',
        custom_policies_ar: plan.custom_policies_ar || ''
      });
    } else {
      setFormData({
        title_en: '',
        title_ar: '',
        price_usd: 0,
        original_price_usd: '',
        duration_days: 30,
        discount_label: '',
        mini_card_url: '',
        delivery_type: 'ready_account',
        is_active: true,
        is_highlighted: false,
        sort_order: 0,
        max_accounts: 1,
        features: [],
        custom_details_en: '',
        custom_details_ar: '',
        custom_activation_en: '',
        custom_activation_ar: '',
        custom_policies_en: '',
        custom_policies_ar: ''
      });
    }
    setFeatureInput('');
  }, [plan, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const supabase = createSyncClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `plan-covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, mini_card_url: publicUrl }));
    } catch (err: any) {
      alert("Error uploading image: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const supabase = createSyncClient();
      const payload = {
        ...formData,
        original_price_usd: formData.original_price_usd ? parseFloat(formData.original_price_usd as string) : null,
        product_id: product.id,
        delivery_type: formData.delivery_type as any
      };

      if (plan?.id) {
        const { error } = await supabase.from('plans').update(payload).eq('id', plan.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('plans').insert(payload);
        if (error) throw error;
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      alert("Error saving package: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto pt-12 pb-12">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 p-6 md:p-8 shadow-2xl relative mt-4 mb-4" style={{ background: '#0a1128', color: '#e2e8f0' }}>
        <button onClick={onClose} className="absolute top-6 right-6 opacity-50 hover:opacity-100 transition-colors">
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-black mb-1">{plan ? 'Edit Package' : 'Create New Package'}</h2>
        <p className="text-sm opacity-60 mb-6 border-b border-white/5 pb-4">Product: <strong className="text-(--sync-yellow)">{product.name}</strong></p>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold opacity-60 block mb-2">Package Name (English)</label>
              <input required type="text" value={formData.title_en} onChange={e => setFormData({...formData, title_en: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#060b18]" />
            </div>
            <div>
              <label className="text-xs font-bold opacity-60 block mb-2">Package Name (Arabic)</label>
              <input required type="text" value={formData.title_ar} onChange={e => setFormData({...formData, title_ar: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#060b18] text-right" dir="rtl" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold opacity-60 block mb-2 text-(--sync-yellow)">Price (USD)</label>
              <input required type="number" step="0.01" value={formData.price_usd} onChange={e => setFormData({...formData, price_usd: parseFloat(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow) bg-[#060b18] font-bold" />
            </div>
            <div>
              <label className="text-xs font-bold opacity-60 block mb-2">Original Price (opt)</label>
              <input type="number" step="0.01" value={formData.original_price_usd} onChange={e => setFormData({...formData, original_price_usd: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#060b18]" />
            </div>
            <div>
              <label className="text-xs font-bold opacity-60 block mb-2">Discount Label (e.g. 90% OFF)</label>
              <input type="text" value={formData.discount_label} onChange={e => setFormData({...formData, discount_label: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#060b18]" />
            </div>
            <div>
              <label className="text-xs font-bold opacity-60 block mb-2">Duration (Days)</label>
              <input required type="number" value={formData.duration_days} onChange={e => setFormData({...formData, duration_days: parseInt(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#060b18]" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold opacity-60 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Mini Card Image URL
            </label>
            <div className="flex gap-2">
              <input type="text" value={formData.mini_card_url} onChange={e => setFormData({...formData, mini_card_url: e.target.value})} placeholder="https://..." className="flex-1 px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#060b18] font-mono text-sm" />
              
              <div className="relative overflow-hidden shrink-0">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
                  disabled={isUploading}
                />
                <button 
                  type="button" 
                  className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 font-bold text-sm h-full"
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
            <p className="text-[10px] opacity-40 mt-1">Shown in the inner holographic ticket in the store. Defaults to product cover if empty.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold opacity-60 block mb-2">Delivery Type</label>
              <select value={formData.delivery_type} onChange={e => setFormData({...formData, delivery_type: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#060b18] cursor-pointer">
                <option value="ready_account">Ready Account (Email:Pass)</option>
                <option value="invitation_link">Invitation Link</option>
                <option value="user_provides_email">User Provides Email (Manual)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold opacity-60 block mb-2">Display Order (ترتيب الظهور)</label>
              <input required type="number" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#060b18]" />
              <p className="text-[10px] opacity-40 mt-1">Controls the arrangement of packages. 1 shows first, 2 shows second, etc.</p>
            </div>
          </div>

          <div className="border border-white/5 rounded-xl p-4 bg-[#060b18] space-y-4">
            <h3 className="text-sm font-bold text-(--sync-yellow) border-b border-white/10 pb-2 mb-4">Custom Texts & Policies</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold opacity-60 block mb-2">Custom Details (English)</label>
                <textarea rows={3} value={formData.custom_details_en} onChange={e => setFormData({...formData, custom_details_en: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#0a1128] text-sm" placeholder="Leave empty for default..." />
              </div>
              <div>
                <label className="text-xs font-bold opacity-60 block mb-2">Custom Details (Arabic)</label>
                <textarea rows={3} value={formData.custom_details_ar} onChange={e => setFormData({...formData, custom_details_ar: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#0a1128] text-sm text-right" dir="rtl" placeholder="اتركه فارغاً للنص الافتراضي..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold opacity-60 block mb-2">Activation Steps (English)</label>
                <textarea rows={3} value={formData.custom_activation_en} onChange={e => setFormData({...formData, custom_activation_en: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#0a1128] text-sm" placeholder="Leave empty for default..." />
              </div>
              <div>
                <label className="text-xs font-bold opacity-60 block mb-2">Activation Steps (Arabic)</label>
                <textarea rows={3} value={formData.custom_activation_ar} onChange={e => setFormData({...formData, custom_activation_ar: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#0a1128] text-sm text-right" dir="rtl" placeholder="اتركه فارغاً للنص الافتراضي..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold opacity-60 block mb-2">Custom Policies (English)</label>
                <textarea rows={3} value={formData.custom_policies_en} onChange={e => setFormData({...formData, custom_policies_en: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#0a1128] text-sm" placeholder="Leave empty for default..." />
              </div>
              <div>
                <label className="text-xs font-bold opacity-60 block mb-2">Custom Policies (Arabic)</label>
                <textarea rows={3} value={formData.custom_policies_ar} onChange={e => setFormData({...formData, custom_policies_ar: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#0a1128] text-sm text-right" dir="rtl" placeholder="اتركه فارغاً للنص الافتراضي..." />
              </div>
            </div>
          </div>

          <div className="border border-white/5 rounded-xl p-4 bg-[#060b18]">
            <label className="text-xs font-bold opacity-60 block mb-3">Features List</label>
            <div className="flex gap-2 mb-4">
              <input type="text" value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} placeholder="Add a feature..." className="flex-1 px-4 py-2 rounded-lg border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#0a1128] text-sm" />
              <button type="button" onClick={addFeature} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-(--sync-yellow) hover:text-black font-bold text-sm transition-colors">Add</button>
            </div>
            <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {formData.features.map((feat, idx) => (
                <li key={idx} className="flex justify-between items-center bg-white/5 p-2 rounded-lg text-sm">
                  <span>{feat}</span>
                  <button type="button" onClick={() => removeFeature(idx)} className="text-red-400 hover:text-red-300 p-1"><X className="w-4 h-4" /></button>
                </li>
              ))}
              {formData.features.length === 0 && <li className="text-center opacity-30 text-xs py-2">No features added</li>}
            </ul>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-5 h-5 rounded border-white/20 accent-(--sync-yellow) cursor-pointer" />
              <span className="font-bold text-sm">Active (Visible)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.is_highlighted} onChange={e => setFormData({...formData, is_highlighted: e.target.checked})} className="w-5 h-5 rounded border-white/20 accent-(--sync-yellow) cursor-pointer" />
              <span className="font-bold text-sm text-(--sync-yellow)">Highlight Package</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-8 py-3 rounded-xl font-black text-[#0B132B] hover:opacity-90 transition-opacity flex items-center gap-2" style={{ background: 'var(--sync-yellow)' }}>
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {plan ? 'Save Changes' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
