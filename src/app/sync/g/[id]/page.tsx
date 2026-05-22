"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSyncAuth } from '@/components/sync/SyncAuthProvider';
import { createSyncClient } from '@/lib/sync/supabase-client';
import { useSync } from '@/components/sync/SyncProviders';
import { translations } from '@/components/sync/sync-i18n';
import { Key, Loader2, AlertCircle, ArrowRight, Bookmark } from 'lucide-react';
import { FaFacebook } from 'react-icons/fa';

export default function ClaimGiftPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useSyncAuth();
  const { t, lang } = useSync();
  const [gift, setGift] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const claimingRef = useRef(false);

  const facebookLink = "https://www.facebook.com/share/1CS5uwBHrd/";

  useEffect(() => {
    const fetchGift = async () => {
      if (!id) return;
      try {
        const supabase = createSyncClient();
        const { data, error } = await supabase
          .from('gift_links')
          .select('*')
          .eq('id', id as string)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setError(t.giftInvalid);
          } else {
            throw error;
          }
        } else if (data.is_used) {
          setError(lang === 'ar' ? 'عذراً، هذا الرابط تم استخدامه بالفعل.' : 'Sorry, this link has already been used.');
        } else if (data.saved_by && !authLoading && user && data.saved_by !== user.id) {
          setError(lang === 'ar' ? 'عذراً، هذا الرابط محفوظ لحساب آخر.' : 'Sorry, this link has been saved to another account.');
        } else {
          setGift(data);
          setError(null);
        }
      } catch (err: any) {
        setError(t.giftInvalid);
      } finally {
        setLoading(false);
      }
    };

    fetchGift();
  }, [id, t, lang, user, authLoading]);

  const handleSaveToAccount = async () => {
    if (!user) {
      router.push(`/auth/login?returnUrl=/g/${id}`);
      return;
    }

    if (!gift || gift.is_used || gift.saved_by || saving) return;

    setSaving(true);
    try {
      const supabase = createSyncClient();
      const { data, error } = await supabase
        .rpc('save_gift_link', {
          p_gift_link_id: id as string,
          p_user_id: user.id
        });

      if (error) throw error;

      setSavedSuccessfully(true);
      setGift((prev: any) => ({ ...prev, saved_by: user.id }));
    } catch (err: any) {
      alert(lang === 'ar' ? 'حدث خطأ أثناء حفظ الاشتراك.' : 'Error saving subscription.');
    } finally {
      setSaving(false);
    }
  };

  const handleClaim = async () => {
    if (!user) {
      router.push(`/auth/login?returnUrl=/g/${id}`);
      return;
    }

    if (!gift || gift.is_used || claimingRef.current) return;

    claimingRef.current = true;
    setClaiming(true);
    try {
      const supabase = createSyncClient();
      // Call the claim_gift_link RPC function
      const { data, error } = await supabase
        .rpc('claim_gift_link', {
          p_gift_link_id: id as string,
          p_user_id: user.id
        });

      if (error) throw error;

      if (!data || data.length === 0) {
        setError(lang === 'ar' ? 'عذراً، هذا الرابط تم استخدامه بالفعل.' : 'Sorry, this link has already been used.');
        setGift(null);
        return;
      }

      // Success! Immediately redirect to the reward URL
      // This ensures the link is "not visible" (hidden behind redirect) and "one-time use"
      window.location.href = data[0].reward_url;
    } catch (err: any) {
      alert(lang === 'ar' ? 'حدث خطأ أثناء تفعيل الاشتراك.' : 'Error activating subscription.');
      setClaiming(false);
      claimingRef.current = false;
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#060b18]">
        <Loader2 className="w-12 h-12 animate-spin text-(--sync-yellow)" />
        <p className="mt-4 text-white/50 font-medium">
          {lang === 'ar' ? 'جاري التحقق من الاشتراك...' : 'Verifying subscription...'}
        </p>
      </div>
    );
  }

  if (error || claiming) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 pt-28 pb-12 bg-[#060b18]">
        <div className={`w-full max-w-md p-8 rounded-3xl border text-center ${claiming ? 'border-(--sync-yellow)/20 bg-(--sync-yellow)/5' : 'border-red-500/20 bg-red-500/5'}`}>
          {claiming ? (
            <>
              <Loader2 className="w-16 h-16 text-(--sync-yellow) animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-black text-white mb-2">جاري التحويل...</h1>
              <p className="text-white/60 mb-2">Redirecting to your subscription...</p>
            </>
          ) : (
            <>
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h1 className="text-2xl font-black text-white mb-2">
                {lang === 'ar' ? 'عذراً!' : 'Oops!'}
              </h1>
              <p className="text-white/60 mb-8 leading-relaxed">{error}</p>
              <button 
                onClick={() => router.push('/')}
                className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all"
              >
                {lang === 'ar' ? 'العودة للرئيسية' : 'Back Home'}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 pt-28 pb-12 bg-[#060b18] overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none opacity-10" style={{ backgroundColor: 'var(--sync-yellow)' }} />
      
      <div className="w-full max-w-lg relative z-10">
        <div className="bg-[#0a1128] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl text-center relative overflow-hidden">
          
          <div className="flex items-center justify-center mx-auto mb-8 transform hover:scale-105 transition-transform duration-300">
            <img src="/sync-logo.png" alt="SYNC" className="h-16 w-auto object-contain drop-shadow-[0_4px_20px_rgba(255,194,26,0.25)]" />
          </div>
          
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
            {translations.ar.giftCongratulations}
          </h1>
          <h2 className="text-xl font-bold text-(--sync-yellow) mb-6">
            {translations.en.giftCongratulations}
          </h2>
          
          <p className="text-white/60 text-lg mb-10 leading-relaxed font-tajawal">
            {gift.details || t.giftClaimDesc}
          </p>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8 text-left">
            <p className={`text-sm text-white/70 leading-relaxed ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {t.giftRewardNote}
            </p>
          </div>

          {savedSuccessfully && (
            <div className="p-4 mb-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium leading-relaxed" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {t.giftSaveSuccess}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleClaim}
              disabled={claiming}
              className="w-full py-5 rounded-2xl bg-(--sync-yellow) text-[#0B132B] font-black text-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(255,194,26,0.3)]"
            >
              <Key className="w-6 h-6" />
              {user ? t.giftClaimBtn : t.giftLoginToClaim}
            </button>

            {!gift.saved_by && (
              <button 
                onClick={handleSaveToAccount}
                disabled={saving}
                className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white/70" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
                {t.giftSaveBtn}
              </button>
            )}

            {gift.saved_by && gift.saved_by === user?.id && (
              <div className="w-full py-3 px-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 font-medium text-sm flex items-center justify-center gap-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {t.giftSavedBtn}
              </div>
            )}

            <a 
              href={facebookLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-2xl bg-[#1877F2]/10 border border-[#1877F2]/20 text-[#1877F2] font-bold transition-all flex items-center justify-center gap-2 hover:bg-[#1877F2] hover:text-white"
            >
              <FaFacebook className="w-5 h-5" />
              {lang === 'ar' ? 'تواصل مع الدعم (Facebook)' : 'Contact Support (Facebook)'}
            </a>

            <button 
              onClick={() => router.push('/')}
              className={`w-full py-4 rounded-2xl border border-white/10 hover:bg-white/5 text-white font-bold transition-all flex items-center justify-center gap-2 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}
            >
              {lang === 'ar' ? 'العودة للرئيسية' : 'Back Home'}
              <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="absolute -top-10 -right-10 w-40 h-40 blur-3xl rounded-full opacity-5" style={{ backgroundColor: 'var(--sync-yellow)' }} />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 blur-3xl rounded-full opacity-5" style={{ backgroundColor: 'var(--sync-yellow)' }} />
        </div>
        
        <p className="text-center mt-8 text-white/30 text-sm font-medium tracking-wide uppercase">
          Powered by <span className="text-white/50">Sync Platform</span>
        </p>
      </div>
    </div>
  );
}
