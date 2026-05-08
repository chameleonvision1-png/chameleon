"use client";

import React, { useState, useEffect } from 'react';
import { createSyncClient } from '@/lib/sync/supabase-client';
import { 
  Loader2, Save, CreditCard, Wallet, AlertCircle, CheckCircle, 
  Phone, Globe, MessageSquare, Eye, EyeOff, ToggleLeft, ToggleRight 
} from 'lucide-react';

interface PaymentSetting {
  id: string;
  payment_method: string;
  is_enabled: boolean;
  display_name_en: string;
  display_name_ar: string;
  account_number: string;
  account_name: string;
  wallet_address: string;
  network: string;
  instructions_en: string;
  instructions_ar: string;
  admin_note_en: string;
  admin_note_ar: string;
  updated_at: string;
}

export default function AdminPaymentSettingsTab() {
  const [settings, setSettings] = useState<PaymentSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    const supabase = createSyncClient();
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      setError(error.message);
    } else {
      setSettings(data || []);
    }
    setIsLoading(false);
  };

  const handleFieldChange = (id: string, field: string, value: any) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSave = async (setting: PaymentSetting) => {
    setIsSaving(setting.id);
    setError(null);
    const supabase = createSyncClient();

    const { error: updateError } = await supabase
      .from('payment_settings')
      .update({
        is_enabled: setting.is_enabled,
        display_name_en: setting.display_name_en,
        display_name_ar: setting.display_name_ar,
        account_number: setting.account_number,
        account_name: setting.account_name,
        wallet_address: setting.wallet_address,
        network: setting.network,
        instructions_en: setting.instructions_en,
        instructions_ar: setting.instructions_ar,
        admin_note_en: setting.admin_note_en,
        admin_note_ar: setting.admin_note_ar,
        updated_at: new Date().toISOString(),
      })
      .eq('id', setting.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSavedId(setting.id);
      setTimeout(() => setSavedId(null), 2500);
    }
    setIsSaving(null);
  };

  const toggleEnabled = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, is_enabled: !s.is_enabled } : s));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--sync-yellow)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Payment Settings</h1>
          <p className="text-sm opacity-50 mt-1">Configure payment methods and instructions shown to buyers during checkout</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-6">
        {settings.map(setting => {
          const isVodafone = setting.payment_method === 'vodafone';
          const Icon = isVodafone ? Phone : Globe;

          return (
            <div 
              key={setting.id} 
              className={`rounded-2xl border overflow-hidden transition-all ${setting.is_enabled ? 'border-white/10' : 'border-white/5 opacity-60'}`}
              style={{ background: '#0d1530' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5" style={{ background: '#0a1128' }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: isVodafone ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)' }}>
                    <Icon className="w-6 h-6" style={{ color: isVodafone ? '#ef4444' : '#818cf8' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{setting.display_name_en || setting.payment_method}</h3>
                    <p className="text-xs opacity-40 font-mono">{setting.payment_method}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {savedId === setting.id && (
                    <span className="flex items-center gap-1 text-xs text-green-400 font-bold animate-pulse">
                      <CheckCircle className="w-4 h-4" /> Saved!
                    </span>
                  )}
                  <button
                    onClick={() => toggleEnabled(setting.id)}
                    className="flex items-center gap-2 text-sm font-bold transition-colors"
                    style={{ color: setting.is_enabled ? '#4ade80' : '#ef4444' }}
                  >
                    {setting.is_enabled ? (
                      <><ToggleRight className="w-6 h-6" /> Enabled</>
                    ) : (
                      <><ToggleLeft className="w-6 h-6" /> Disabled</>
                    )}
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Display Names */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs opacity-60 mb-1.5 font-bold uppercase tracking-wider">Display Name (EN)</label>
                    <input
                      type="text"
                      value={setting.display_name_en}
                      onChange={e => handleFieldChange(setting.id, 'display_name_en', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#060b18] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs opacity-60 mb-1.5 font-bold uppercase tracking-wider">Display Name (AR)</label>
                    <input
                      type="text"
                      value={setting.display_name_ar}
                      onChange={e => handleFieldChange(setting.id, 'display_name_ar', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#060b18] text-sm"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Account / Wallet Info */}
                <div className="grid grid-cols-2 gap-4">
                  {isVodafone ? (
                    <>
                      <div>
                        <label className="block text-xs opacity-60 mb-1.5 font-bold uppercase tracking-wider">Phone Number</label>
                        <input
                          type="text"
                          value={setting.account_number}
                          onChange={e => handleFieldChange(setting.id, 'account_number', e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#060b18] text-sm font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs opacity-60 mb-1.5 font-bold uppercase tracking-wider">Account Name</label>
                        <input
                          type="text"
                          value={setting.account_name}
                          onChange={e => handleFieldChange(setting.id, 'account_name', e.target.value)}
                          placeholder="e.g. Ahmed Mohamed"
                          className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#060b18] text-sm"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs opacity-60 mb-1.5 font-bold uppercase tracking-wider">Wallet Address</label>
                        <input
                          type="text"
                          value={setting.wallet_address}
                          onChange={e => handleFieldChange(setting.id, 'wallet_address', e.target.value)}
                          placeholder="0x... or TRC20 address"
                          className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#060b18] text-sm font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs opacity-60 mb-1.5 font-bold uppercase tracking-wider">Network</label>
                        <input
                          type="text"
                          value={setting.network}
                          onChange={e => handleFieldChange(setting.id, 'network', e.target.value)}
                          placeholder="e.g. TRC20, ERC20, BEP20"
                          className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#060b18] text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Instructions */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs opacity-60 mb-1.5 font-bold uppercase tracking-wider">
                      Payment Instructions (EN)
                    </label>
                    <textarea
                      value={setting.instructions_en}
                      onChange={e => handleFieldChange(setting.id, 'instructions_en', e.target.value)}
                      rows={4}
                      placeholder="Step-by-step instructions for the buyer..."
                      className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#060b18] text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs opacity-60 mb-1.5 font-bold uppercase tracking-wider">
                      Payment Instructions (AR)
                    </label>
                    <textarea
                      value={setting.instructions_ar}
                      onChange={e => handleFieldChange(setting.id, 'instructions_ar', e.target.value)}
                      rows={4}
                      placeholder="تعليمات الدفع للمشتري..."
                      className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#060b18] text-sm resize-none"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Admin Note */}
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4" style={{ color: 'var(--sync-yellow)' }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--sync-yellow)' }}>
                      Admin Note — Shown to buyers during checkout
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs opacity-50 mb-1">Note (EN)</label>
                      <textarea
                        value={setting.admin_note_en}
                        onChange={e => handleFieldChange(setting.id, 'admin_note_en', e.target.value)}
                        rows={2}
                        placeholder="e.g. Orders are processed within 30 minutes..."
                        className="w-full px-4 py-3 rounded-xl border border-amber-500/20 outline-none focus:border-(--sync-yellow)/50 bg-[#060b18] text-sm resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs opacity-50 mb-1">Note (AR)</label>
                      <textarea
                        value={setting.admin_note_ar}
                        onChange={e => handleFieldChange(setting.id, 'admin_note_ar', e.target.value)}
                        rows={2}
                        placeholder="مثال: يتم معالجة الطلبات خلال 30 دقيقة..."
                        className="w-full px-4 py-3 rounded-xl border border-amber-500/20 outline-none focus:border-(--sync-yellow)/50 bg-[#060b18] text-sm resize-none"
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleSave(setting)}
                    disabled={isSaving === setting.id}
                    className="px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,194,26,0.15)]"
                    style={{ background: 'var(--sync-yellow)', color: '#060b18' }}
                  >
                    {isSaving === setting.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Last Updated */}
              <div className="px-6 py-3 border-t border-white/5 text-xs opacity-30">
                Last updated: {new Date(setting.updated_at).toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
