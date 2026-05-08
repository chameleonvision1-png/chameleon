"use client";

import React, { useState, useEffect } from 'react';
import { createSyncClient } from '@/lib/sync/supabase-client';
import { DollarSign, Loader2, Save, RefreshCw, AlertTriangle, AlertCircle } from 'lucide-react';

export default function AdminCurrenciesTab() {
  const [rates, setRates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createSyncClient();
      const { data, error: fetchError } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('currency_code');
      
      if (fetchError) {
        if (fetchError.code === '42P01') {
          // Table doesn't exist
          throw new Error('Table "exchange_rates" does not exist. Please run the SQL migration script (admin_updates.sql) in your Supabase SQL Editor.');
        }
        throw fetchError;
      }
      
      setRates(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleRateChange = (index: number, newRate: number) => {
    const updated = [...rates];
    updated[index].rate_to_usd = newRate;
    setRates(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const supabase = createSyncClient();
      for (const rate of rates) {
        const { error } = await supabase
          .from('exchange_rates')
          .update({ rate_to_usd: rate.rate_to_usd })
          .eq('currency_code', rate.currency_code);
        if (error) throw error;
      }
      alert('Exchange rates saved successfully!');
      fetchRates();
    } catch (err: any) {
      alert('Failed to save: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--sync-yellow)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-black">Currency Exchange Rates</h1>
        <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg mb-2">Database Setup Required</h3>
              <p className="text-sm opacity-90 leading-relaxed">{error}</p>
              <div className="mt-4 p-4 rounded-xl bg-black/40 font-mono text-xs overflow-x-auto text-white/70">
                You can find the required SQL script at: <br/>
                <code>supabase/admin_updates.sql</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Currency Exchange Rates</h1>
          <p className="opacity-60 text-sm mt-1">Manage conversion rates used in the store. Base currency is USD ($1.00).</p>
        </div>
        <button 
          onClick={fetchRates}
          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-[#0d1530] border border-white/5 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-[rgba(255,194,26,0.1)] border border-[rgba(255,194,26,0.2)] text-(--sync-yellow)">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-semibold">These rates are multiplied by the USD price. (e.g., if price is $10 and EGP rate is 50.8, the EGP price is 508 ج.م)</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-white/10 bg-black/20 flex flex-col items-center justify-center relative overflow-hidden">
              <DollarSign className="w-12 h-12 text-white/10 absolute -right-2 -bottom-2" />
              <p className="text-sm uppercase tracking-widest opacity-50 mb-1 font-bold">Base Currency</p>
              <h3 className="text-3xl font-black">1.00 USD</h3>
            </div>
            
            <div className="space-y-4">
              {rates.map((rate, idx) => (
                <div key={rate.currency_code} className="flex items-center gap-4">
                  <div className="w-24 shrink-0">
                    <p className="font-bold">{rate.label}</p>
                    <p className="text-xs opacity-50">{rate.currency_code}</p>
                  </div>
                  <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 font-bold">=</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      required
                      value={rate.rate_to_usd}
                      onChange={(e) => handleRateChange(idx, parseFloat(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#060b18] font-mono text-lg font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-white/5">
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-8 py-3 rounded-xl font-black text-[#0B132B] hover:opacity-90 transition-all flex items-center gap-2 hover:scale-105 shadow-[0_0_20px_rgba(255,194,26,0.2)]" 
              style={{ background: 'var(--sync-yellow)' }}
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Rates
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
