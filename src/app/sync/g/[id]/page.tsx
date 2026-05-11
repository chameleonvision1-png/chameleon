"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSyncAuth } from '@/components/sync/SyncAuthProvider';
import { createSyncClient } from '@/lib/sync/supabase-client';
import { useSync } from '@/components/sync/SyncProviders';
import { translations } from '@/components/sync/sync-i18n';
import { Gift, Loader2, PartyPopper, CheckCircle2, AlertCircle, ExternalLink, ArrowRight } from 'lucide-react';
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
  const [isClaimed, setIsClaimed] = useState(false);
  const claimingRef = useRef(false);

  const facebookLink = "https://www.facebook.com/share/1CS5uwBHrd/";

  const isSafeUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

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
        } else {
          setGift(data);
          if (data.is_used) {
            setIsClaimed(true);
          }
        }
      } catch (err: any) {
        setError(t.giftInvalid);
      } finally {
        setLoading(false);
      }
    };

    fetchGift();
  }, [id, t]);

  const handleClaim = async () => {
    if (!user) {
      router.push(`/sync/auth/login?returnUrl=/sync/g/${id}`);
      return;
    }

    if (!gift || gift.is_used || claimingRef.current) return;

    claimingRef.current = true;
    setClaiming(true);
    try {
      const supabase = createSyncClient();
      const { data, error } = await supabase
        .from('gift_links')
        .update({
          is_used: true,
          used_by: user.id,
          used_at: new Date().toISOString()
        })
        .match({ id: id as string, is_used: false })
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        setIsClaimed(true);
        if (gift) setGift({ ...gift, is_used: true });
        return;
      }

      setIsClaimed(true);
      if (gift) setGift({ ...gift, is_used: true });
    } catch (err: any) {
      alert(lang === 'ar' ? 'حدث خطأ أثناء استلام الهدية.' : 'Error claiming gift.');
    } finally {
      claimingRef.current = false;
      setClaiming(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#060b18]">
        <Loader2 className="w-12 h-12 animate-spin text-[color:var(--sync-yellow)]" />
        <p className="mt-4 text-white/50 font-medium">
          {lang === 'ar' ? 'جاري التحقق من الهدية...' : 'Checking gift...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#060b18]">
        <div className="w-full max-w-md p-8 rounded-3xl border border-red-500/20 bg-red-500/5 text-center">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#060b18] overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none opacity-10" style={{ backgroundColor: 'var(--sync-yellow)' }} />
      
      <div className="w-full max-w-lg relative z-10">
        <div className="bg-[#0a1128] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl text-center relative overflow-hidden">
          
          {!isClaimed ? (
            <>
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 transform rotate-3 animate-pulse opacity-20" style={{ backgroundColor: 'var(--sync-yellow)' }}>
                <Gift className="w-10 h-10 text-[color:var(--sync-yellow)]" />
              </div>
              
              <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                {translations.ar.giftCongratulations}
              </h1>
              <h2 className="text-xl font-bold text-[color:var(--sync-yellow)] mb-6">
                {translations.en.giftCongratulations}
              </h2>
              
              <p className="text-white/60 text-lg mb-10 leading-relaxed font-tajawal">
                {gift.details || t.giftClaimDesc}
              </p>

              <button 
                onClick={handleClaim}
                disabled={claiming}
                className="w-full py-5 rounded-2xl bg-[color:var(--sync-yellow)] text-[#0B132B] font-black text-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(255,194,26,0.3)]"
              >
                {claiming ? <Loader2 className="w-6 h-6 animate-spin" /> : <PartyPopper className="w-6 h-6" />}
                {user ? t.giftClaimBtn : t.giftLoginToClaim}
              </button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-green-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 transform -rotate-3">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              
              <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                {translations.ar.giftClaimedTitle}
              </h1>
              <h2 className="text-xl font-bold text-green-400 mb-6">
                {translations.en.giftClaimedTitle}
              </h2>
              
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8 text-left" dir="ltr">
                <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">
                  {t.giftRewardLabel}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 font-mono text-sm text-[color:var(--sync-yellow)] truncate bg-black/40 p-3 rounded-lg border border-white/5">
                    {gift.reward_url}
                  </div>
                  {isSafeUrl(gift.reward_url) ? (
                    <a 
                      href={gift.reward_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg bg-[color:var(--sync-yellow)] text-[#0B132B] hover:opacity-90 transition-all"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  ) : (
                    <button disabled className="p-3 rounded-lg bg-gray-500 text-[#0B132B] opacity-50 cursor-not-allowed">
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <p className={`mt-4 text-sm text-white/50 leading-relaxed ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  {t.giftRewardNote}
                </p>
              </div>

              <div className="flex flex-col gap-3">
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
                  onClick={() => router.push('/dashboard')}
                  className={`w-full py-4 rounded-2xl border border-white/10 hover:bg-white/5 text-white font-bold transition-all flex items-center justify-center gap-2 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}
                >
                  {t.giftGoDashboard}
                  <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </>
          )}

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
