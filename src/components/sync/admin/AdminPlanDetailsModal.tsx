import React, { useState, useEffect } from 'react';
import { createSyncClient } from '@/lib/sync/supabase-client';
import { X, Loader2, Save } from 'lucide-react';

interface PlanRow {
  id: string;
  title_en: string;
  title_ar: string;
  custom_details_ar?: string | null;
  custom_details_en?: string | null;
  custom_activation_ar?: string | null;
  custom_activation_en?: string | null;
  custom_policies_ar?: string | null;
  custom_policies_en?: string | null;
}

interface AdminPlanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanRow | null;
  onSuccess: () => void;
}

export default function AdminPlanDetailsModal({ isOpen, onClose, plan, onSuccess }: AdminPlanDetailsModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    custom_details_ar: '',
    custom_details_en: '',
    custom_activation_ar: '',
    custom_activation_en: '',
    custom_policies_ar: '',
    custom_policies_en: '',
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        custom_details_ar: plan.custom_details_ar || '',
        custom_details_en: plan.custom_details_en || '',
        custom_activation_ar: plan.custom_activation_ar || '',
        custom_activation_en: plan.custom_activation_en || '',
        custom_policies_ar: plan.custom_policies_ar || 'تخضع جميع الاشتراكات والمنتجات الرقمية المباعة عبر منصة SYNC لشروط الاستخدام. لا يمكن استرداد المبلغ أو إلغاء الاشتراك بعد التفعيل واستلام بيانات الحساب أو مفتاح التفعيل. يرجى التأكد من قراءة مواصفات الباقة جيداً قبل إتمام عملية الدفع. في حال وجود أي مشكلة تقنية، الدعم الفني متاح لمساعدتك خلال فترة الضمان الموضحة.',
        custom_policies_en: plan.custom_policies_en || 'All subscriptions and digital products sold through the SYNC platform are subject to our terms of use. Refunds or cancellations are not available after activation and receipt of account details or activation keys. Please ensure you read the package specifications carefully before completing the payment. In case of any technical issues, technical support is available to assist you during the stated warranty period.',
      });
    }
  }, [plan, isOpen]);

  if (!isOpen || !plan) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const supabase = createSyncClient();
      const { error } = await supabase.from('plans').update(formData).eq('id', plan.id);
      if (error) throw error;
      
      onSuccess();
      onClose();
    } catch (err: any) {
      alert("Error saving details: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto pt-12 pb-12">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 p-6 md:p-8 shadow-2xl relative mt-4 mb-4" style={{ background: '#0a1128', color: '#e2e8f0' }}>
        <button onClick={onClose} className="absolute top-6 right-6 opacity-50 hover:opacity-100 transition-colors">
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-black mb-1">Package Details & Policies</h2>
        <p className="text-sm opacity-60 mb-6 border-b border-white/5 pb-4">Customize the text shown in the info modals and back of the card for <strong className="text-(--sync-yellow)">{plan.title_en} ({plan.title_ar})</strong>.</p>
        
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Details */}
          <div className="border border-white/5 rounded-xl p-5 bg-[#060b18]">
            <h3 className="font-bold mb-4 text-(--sync-yellow) flex items-center gap-2">
              <span className="w-6 h-6 rounded flex items-center justify-center bg-white/10 text-xs">1</span> 
              Detailed Information (معلومات تفصيلية)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold opacity-60 block mb-2">Details (English)</label>
                <textarea rows={3} value={formData.custom_details_en} onChange={e => setFormData({...formData, custom_details_en: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#0a1128] text-sm resize-none" placeholder="Default text will be used if empty..." />
              </div>
              <div>
                <label className="text-xs font-bold opacity-60 block mb-2 text-right">التفاصيل (عربي)</label>
                <textarea rows={3} value={formData.custom_details_ar} onChange={e => setFormData({...formData, custom_details_ar: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#0a1128] text-sm text-right resize-none" dir="rtl" placeholder="سيتم استخدام النص الافتراضي إذا تم تركه فارغاً..." />
              </div>
            </div>
          </div>

          {/* Activation Setup */}
          <div className="border border-white/5 rounded-xl p-5 bg-[#060b18]">
            <h3 className="font-bold mb-4 text-(--sync-yellow) flex items-center gap-2">
              <span className="w-6 h-6 rounded flex items-center justify-center bg-white/10 text-xs">2</span> 
              Activation Setup (تعليمات التفعيل)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold opacity-60 block mb-2">Activation Steps (English)</label>
                <textarea rows={3} value={formData.custom_activation_en} onChange={e => setFormData({...formData, custom_activation_en: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#0a1128] text-sm resize-none" placeholder="Default text will be used if empty..." />
              </div>
              <div>
                <label className="text-xs font-bold opacity-60 block mb-2 text-right">طريقة التفعيل (عربي)</label>
                <textarea rows={3} value={formData.custom_activation_ar} onChange={e => setFormData({...formData, custom_activation_ar: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#0a1128] text-sm text-right resize-none" dir="rtl" placeholder="سيتم استخدام النص الافتراضي إذا تم تركه فارغاً..." />
              </div>
            </div>
          </div>

          {/* Policies */}
          <div className="border border-white/5 rounded-xl p-5 bg-[#060b18]">
            <h3 className="font-bold mb-4 text-(--sync-yellow) flex items-center gap-2">
              <span className="w-6 h-6 rounded flex items-center justify-center bg-white/10 text-xs">3</span> 
              Policies & Terms (السياسات والشروط)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold opacity-60 block mb-2">Policy Summary (English)</label>
                <textarea rows={3} value={formData.custom_policies_en} onChange={e => setFormData({...formData, custom_policies_en: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#0a1128] text-sm resize-none" placeholder="All subscriptions and digital products sold through the SYNC platform are subject to our terms of use. Refunds or cancellations are not available after activation and receipt of account details or activation keys. Please ensure you read the package specifications carefully before completing the payment. In case of any technical issues, technical support is available to assist you during the stated warranty period." />
              </div>
              <div>
                <label className="text-xs font-bold opacity-60 block mb-2 text-right">ملخص السياسات (عربي)</label>
                <textarea rows={3} value={formData.custom_policies_ar} onChange={e => setFormData({...formData, custom_policies_ar: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#0a1128] text-sm text-right resize-none" dir="rtl" placeholder="تخضع جميع الاشتراكات والمنتجات الرقمية المباعة عبر منصة SYNC لشروط الاستخدام. لا يمكن استرداد المبلغ أو إلغاء الاشتراك بعد التفعيل واستلام بيانات الحساب أو مفتاح التفعيل. يرجى التأكد من قراءة مواصفات الباقة جيداً قبل إتمام عملية الدفع. في حال وجود أي مشكلة تقنية، الدعم الفني متاح لمساعدتك خلال فترة الضمان الموضحة." />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-8 py-3 rounded-xl font-black text-[#0B132B] hover:opacity-90 transition-opacity flex items-center gap-2" style={{ background: 'var(--sync-yellow)' }}>
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
