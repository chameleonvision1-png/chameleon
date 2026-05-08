"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useSync } from '@/components/sync/SyncProviders';
import { useSyncAuth } from '@/components/sync/SyncAuthProvider';
import { useSyncCart } from '@/components/sync/SyncCartProvider';
import { createSyncClient } from '@/lib/sync/supabase-client';
import { ArrowLeft, Upload, Trash2, CheckCircle, Loader2, Wallet, CreditCard, ShoppingBag, ImageIcon, AlertCircle } from 'lucide-react';

type PaymentMethod = 'balance' | 'vodafone' | 'crypto';

export default function CheckoutPage() {
  const { lang } = useSync();
  const { user, profile } = useSyncAuth();
  const { items, totalUsd, clearCart, removeItem } = useSyncCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vodafone');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const balance = Number(profile?.balance || 0);
  const canPayWithBalance = balance >= totalUsd;

  // Compress image before upload
  const compressImage = (file: File, maxSizeKB: number = 500): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width *= ratio;
            height *= ratio;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          
          let quality = 0.8;
          const tryCompress = () => {
            canvas.toBlob((blob) => {
              if (!blob) {
                resolve(file); // fallback
                return;
              }
              if (blob.size / 1024 <= maxSizeKB || quality <= 0.1) {
                resolve(blob);
              } else {
                quality -= 0.1;
                tryCompress();
              }
            }, 'image/jpeg', quality);
          };
          tryCompress();
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError(lang === 'ar' ? 'حجم الصورة يجب أن لا يتعدى ٥ ميجابايت' : 'Image size must not exceed 5MB');
      return;
    }
    setError(null);
    
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setProofPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmitOrder = async () => {
    if (!user) return;
    if (items.length === 0) return;
    
    if (paymentMethod !== 'balance' && !proofFile) {
      setError(lang === 'ar' ? 'من فضلك ارفع صورة إثبات الدفع' : 'Please upload payment proof');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createSyncClient();

      let proofUrl: string | null = null;

      // Upload proof if not balance payment
      if (paymentMethod !== 'balance' && proofFile) {
        const compressed = await compressImage(proofFile);
        const fileName = `${user.id}/${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, compressed, { contentType: 'image/jpeg' });

        if (uploadError) throw new Error(uploadError.message);
        proofUrl = fileName;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: '', // Overwritten by db trigger
          total_usd: totalUsd,
          payment_method: paymentMethod,
          payment_proof_url: proofUrl,
          status: paymentMethod === 'balance' ? 'processing' : 'pending_payment',
          payment_status: paymentMethod === 'balance' ? 'confirmed' : 'pending',
        } as any)
        .select('id, order_number')
        .single();

      if (orderError) throw new Error(orderError.message);

      // Get plan details to properly set delivery_type
      const planIds = items.map(item => item.planId);
      const { data: plansData } = await supabase.from('plans').select('id, delivery_type').in('id', planIds);
      const planTypes = new Map(plansData?.map(p => [p.id, p.delivery_type]));

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        plan_id: item.planId,
        quantity: item.quantity,
        unit_price_usd: item.priceUsd,
        delivery_type: planTypes.get(item.planId) || 'user_provides_email', 
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw new Error(itemsError.message);

      // If paying with balance, deduct it and allocate inventory
      if (paymentMethod === 'balance') {
        const { error: balanceError } = await supabase.rpc('update_user_balance', {
          p_user_id: user.id,
          p_amount: -totalUsd,
          p_type: 'purchase',
          p_admin_note: `Order #${order.order_number}`,
          p_related_order_id: order.id,
        });

        if (balanceError) throw new Error(balanceError.message);

        // Auto-allocate inventory since payment is instantly confirmed
        const { error: allocError } = await supabase.rpc('allocate_inventory_for_order', {
          p_order_id: order.id
        });
        if (allocError) console.error("Allocation error:", allocError); // Don't fail the order if allocation fails (could be out of stock, admin can handle it)
      }

      clearCart();
      setOrderSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-24" style={{ background: 'var(--sync-bg)' }}>
        <div className="max-w-lg mx-auto px-4 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-6 opacity-30" />
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--sync-text-primary)' }}>
            {lang === 'ar' ? 'سجل دخولك أولاً' : 'Sign in to continue'}
          </h1>
          <Link href="/auth/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>
            {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </Link>
        </div>
      </div>
    );
  }

  // Order success
  if (orderSuccess) {
    return (
      <div className="min-h-screen pt-32 pb-24" style={{ background: 'var(--sync-bg)' }}>
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-4xl font-black mb-4" style={{ color: 'var(--sync-text-primary)' }}>
            {paymentMethod === 'balance' 
              ? (lang === 'ar' ? 'تم الشراء بنجاح! 🎉' : 'Purchase Successful! 🎉')
              : (lang === 'ar' ? 'تم إرسال الطلب! 📦' : 'Order Submitted! 📦')
            }
          </h1>
          <p className="text-lg opacity-70 mb-8" style={{ color: 'var(--sync-text-primary)' }}>
            {paymentMethod === 'balance'
              ? (lang === 'ar' ? 'تم خصم المبلغ من رصيدك. ستجد تفاصيل اشتراكاتك في لوحة التحكم.' : 'Amount deducted from balance. Check your dashboard for subscription details.')
              : (lang === 'ar' ? 'سيتم مراجعة إثبات الدفع خلال ٢٤ ساعة. ستصلك رسالة عند التأكيد.' : 'Payment proof will be reviewed within 24 hours. You will be notified upon confirmation.')
            }
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard" className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>
              {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
            </Link>
            <Link href="/" className="px-6 py-3 rounded-xl font-bold border border-white/10 hover:border-white/30 transition-all" style={{ color: 'var(--sync-text-primary)' }}>
              {lang === 'ar' ? 'تصفح المزيد' : 'Browse More'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-24" style={{ background: 'var(--sync-bg)' }}>
        <div className="max-w-lg mx-auto px-4 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-6 opacity-30" />
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--sync-text-primary)' }}>
            {lang === 'ar' ? 'السلة فارغة' : 'Your cart is empty'}
          </h1>
          <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>
            {lang === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-24" style={{ background: 'var(--sync-bg)' }}>
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-80 opacity-15 pointer-events-none blur-[120px]" style={{ background: 'radial-gradient(circle, var(--sync-yellow) 0%, transparent 70%)' }} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-white/10 hover:border-white/30 transition-all" style={{ color: 'var(--sync-text-primary)' }}>
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-semibold">{lang === 'ar' ? 'رجوع' : 'Back'}</span>
        </Link>

        <h1 className="text-4xl md:text-5xl font-black mb-12" style={{ color: 'var(--sync-text-primary)' }}>
          {lang === 'ar' ? 'إتمام الشراء' : 'Checkout'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Order Summary */}
          <div className="lg:col-span-3 space-y-6">
            {/* Cart Items */}
            <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: '#0d1530' }}>
              <div className="p-6 border-b border-white/10">
                <h2 className="text-lg font-bold" style={{ color: 'var(--sync-text-primary)' }}>
                  {lang === 'ar' ? 'الطلب' : 'Order Items'} ({items.length})
                </h2>
              </div>
              <div className="divide-y divide-white/5">
                {items.map(item => (
                  <div key={item.planId} className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center shrink-0 overflow-hidden" style={{ background: '#161e31' }}>
                      {item.coverImageUrl ? (
                        <img src={item.coverImageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 opacity-30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: 'var(--sync-text-primary)' }}>{item.productName}</p>
                      <p className="text-xs opacity-50">{item.planTitle} • {item.durationDays} {lang === 'ar' ? 'يوم' : 'days'}</p>
                      <p className="text-xs opacity-40">x{item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg" style={{ color: 'var(--sync-yellow)' }}>${(item.priceUsd * item.quantity).toFixed(2)}</p>
                      {item.originalPriceUsd && (
                        <p className="text-xs line-through opacity-40">${(item.originalPriceUsd * item.quantity).toFixed(2)}</p>
                      )}
                    </div>
                    <button onClick={() => removeItem(item.planId)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl border border-white/10 p-6 space-y-4" style={{ background: '#0d1530' }}>
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--sync-text-primary)' }}>
                {lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
              </h2>

              {/* Vodafone Cash */}
              <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'vodafone' ? 'border-(--sync-yellow) bg-(--sync-yellow)/5' : 'border-white/10 hover:border-white/20'}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'vodafone'} onChange={() => setPaymentMethod('vodafone')} className="hidden" />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'vodafone' ? 'border-(--sync-yellow)' : 'border-white/30'}`}>
                  {paymentMethod === 'vodafone' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--sync-yellow)' }} />}
                </div>
                <CreditCard className="w-5 h-5 opacity-60" />
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--sync-text-primary)' }}>Vodafone Cash</p>
                  <p className="text-xs opacity-40">{lang === 'ar' ? 'حوّل المبلغ وارفع صورة الإيصال' : 'Transfer amount & upload receipt'}</p>
                </div>
              </label>

              {/* Crypto */}
              <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'crypto' ? 'border-(--sync-yellow) bg-(--sync-yellow)/5' : 'border-white/10 hover:border-white/20'}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'crypto'} onChange={() => setPaymentMethod('crypto')} className="hidden" />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'crypto' ? 'border-(--sync-yellow)' : 'border-white/30'}`}>
                  {paymentMethod === 'crypto' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--sync-yellow)' }} />}
                </div>
                <span className="text-lg">₿</span>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--sync-text-primary)' }}>Cryptocurrency</p>
                  <p className="text-xs opacity-40">{lang === 'ar' ? 'ادفع بالكريبتو وارفع إثبات' : 'Pay with crypto & upload proof'}</p>
                </div>
              </label>

              {/* Balance */}
              <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'balance' ? 'border-(--sync-yellow) bg-(--sync-yellow)/5' : 'border-white/10 hover:border-white/20'} ${!canPayWithBalance ? 'opacity-50 pointer-events-none' : ''}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'balance'} onChange={() => setPaymentMethod('balance')} className="hidden" disabled={!canPayWithBalance} />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'balance' ? 'border-(--sync-yellow)' : 'border-white/30'}`}>
                  {paymentMethod === 'balance' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--sync-yellow)' }} />}
                </div>
                <Wallet className="w-5 h-5 opacity-60" />
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: 'var(--sync-text-primary)' }}>
                    {lang === 'ar' ? 'الرصيد' : 'Balance'} 
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: canPayWithBalance ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: canPayWithBalance ? '#22c55e' : '#ef4444' }}>
                      ${balance.toFixed(2)}
                    </span>
                  </p>
                  <p className="text-xs opacity-40">{!canPayWithBalance ? (lang === 'ar' ? 'رصيد غير كافي' : 'Insufficient balance') : (lang === 'ar' ? 'دفع فوري بدون انتظار' : 'Instant payment, no waiting')}</p>
                </div>
              </label>

              {/* Payment Instructions */}
              {paymentMethod === 'vodafone' && (
                <div className="mt-4 p-4 rounded-xl border border-white/5" style={{ background: '#0a1128' }}>
                  <p className="text-sm font-bold mb-2" style={{ color: 'var(--sync-yellow)' }}>
                    {lang === 'ar' ? 'تعليمات الدفع:' : 'Payment Instructions:'}
                  </p>
                  <ol className="text-xs opacity-70 space-y-1.5 list-decimal list-inside" style={{ color: 'var(--sync-text-primary)' }}>
                    <li>{lang === 'ar' ? 'حوّل المبلغ المطلوب على رقم 01XXXXXXXXX' : 'Transfer the amount to 01XXXXXXXXX'}</li>
                    <li>{lang === 'ar' ? 'التقط صورة للإيصال' : 'Take a screenshot of the receipt'}</li>
                    <li>{lang === 'ar' ? 'ارفع الصورة بالأسفل وأكمل الطلب' : 'Upload the screenshot below and complete order'}</li>
                  </ol>
                </div>
              )}

              {paymentMethod === 'crypto' && (
                <div className="mt-4 p-4 rounded-xl border border-white/5" style={{ background: '#0a1128' }}>
                  <p className="text-sm font-bold mb-2" style={{ color: 'var(--sync-yellow)' }}>
                    {lang === 'ar' ? 'عنوان المحفظة:' : 'Wallet Address:'}
                  </p>
                  <code className="text-xs opacity-70 break-all block">TBD — Contact support</code>
                </div>
              )}

              {/* Proof Upload */}
              {paymentMethod !== 'balance' && (
                <div className="mt-4">
                  <p className="text-sm font-bold mb-3" style={{ color: 'var(--sync-text-primary)' }}>
                    {lang === 'ar' ? 'صورة إثبات الدفع *' : 'Payment Proof *'}
                  </p>
                  {proofPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-white/10">
                      <img src={proofPreview} alt="Proof" className="w-full max-h-64 object-contain bg-black/50" />
                      <button onClick={() => { setProofFile(null); setProofPreview(null); }} className="absolute top-2 right-2 p-2 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => fileInputRef.current?.click()} className="w-full py-8 rounded-xl border-2 border-dashed border-white/10 hover:border-(--sync-yellow)/30 transition-all flex flex-col items-center gap-3" style={{ background: '#0a1128' }}>
                      <Upload className="w-8 h-8 opacity-30" />
                      <span className="text-sm opacity-50">{lang === 'ar' ? 'اضغط لرفع الصورة' : 'Click to upload'}</span>
                      <span className="text-xs opacity-30">{lang === 'ar' ? 'PNG, JPG — أقصى حجم ٥ ميجا' : 'PNG, JPG — Max 5MB'}</span>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
              )}
            </div>
          </div>

          {/* Right: Summary Sidebar */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-white/10 p-6 space-y-6 sticky top-28" style={{ background: '#0d1530' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--sync-text-primary)' }}>
                {lang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="opacity-60">{lang === 'ar' ? 'المنتجات' : 'Items'} ({items.length})</span>
                  <span style={{ color: 'var(--sync-text-primary)' }}>${totalUsd.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-60">{lang === 'ar' ? 'الخصم' : 'Savings'}</span>
                  <span className="text-green-400">
                    -${items.reduce((s, i) => s + ((i.originalPriceUsd || i.priceUsd) - i.priceUsd) * i.quantity, 0).toFixed(2)}
                  </span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between">
                  <span className="font-bold" style={{ color: 'var(--sync-text-primary)' }}>
                    {lang === 'ar' ? 'الإجمالي' : 'Total'}
                  </span>
                  <span className="text-2xl font-black" style={{ color: 'var(--sync-yellow)' }}>
                    ${totalUsd.toFixed(2)}
                  </span>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)' }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {paymentMethod === 'balance'
                      ? (lang === 'ar' ? 'تأكيد الشراء' : 'Confirm Purchase')
                      : (lang === 'ar' ? 'إرسال الطلب' : 'Submit Order')
                    }
                  </>
                )}
              </button>

              <p className="text-xs opacity-30 text-center" style={{ color: 'var(--sync-text-primary)' }}>
                {lang === 'ar' ? 'بالمتابعة أنت توافق على شروط الاستخدام' : 'By proceeding you agree to our Terms of Service'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
