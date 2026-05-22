"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSync } from '@/components/sync/SyncProviders';
import { useSyncAuth } from '@/components/sync/SyncAuthProvider';
import { useSyncCart } from '@/components/sync/SyncCartProvider';
import { createSyncClient } from '@/lib/sync/supabase-client';
import { ArrowLeft, Upload, Trash2, CheckCircle, Loader2, Wallet, CreditCard, ShoppingBag, ImageIcon, AlertCircle, Package, Copy, ExternalLink, Clock, Eye, EyeOff } from 'lucide-react';

type PaymentMethod = 'balance' | 'vodafone' | 'crypto';

export default function CheckoutPage() {
  const { lang } = useSync();
  const { user, profile } = useSyncAuth();
  const { items, totalUsd, clearCart, removeItem } = useSyncCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vodafone');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [senderNumber, setSenderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [paymentSettings, setPaymentSettings] = useState<any[]>([]);

  // Fetch payment settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      const supabase = createSyncClient();
      const { data } = await supabase.from('payment_settings').select('*').eq('is_enabled', true);
      if (data) setPaymentSettings(data);
    };
    fetchSettings();
  }, []);

  // Restore session order if refreshed
  useEffect(() => {
    const lastOrderId = sessionStorage.getItem('lastSyncOrderId');
    if (lastOrderId && items.length === 0 && !orderSuccess) {
      const restoreOrder = async () => {
        const supabase = createSyncClient();
        const { data } = await supabase
          .from('orders')
          .select('*, order_items(*, plan:plans(title_en, title_ar, delivery_type), inventory:plan_inventory(id, invite_link, account_email, account_password, backup_email, backup_password, two_fa_secret, status, used_at))')
          .eq('id', lastOrderId)
          .single();
        if (data) {
          setCompletedOrder(data);
          setOrderSuccess(true);
        }
      };
      restoreOrder();
    }
  }, [items.length, orderSuccess]);

  const getPaymentSetting = (method: string) => paymentSettings.find(s => s.payment_method === method);

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
    
    if (paymentMethod !== 'balance') {
      if (!proofFile) {
        setError(lang === 'ar' ? 'من فضلك ارفع صورة إثبات الدفع' : 'Please upload payment proof');
        return;
      }
      if (paymentMethod === 'vodafone' && !senderNumber.trim()) {
        setError(lang === 'ar' ? 'من فضلك ادخل رقم التحويل أو الحساب' : 'Please enter the sender number or account');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createSyncClient();

      let proofUrl: string | null = null;

      // Upload proof if not balance payment
      if (paymentMethod !== 'balance' && proofFile) {
        const compressed = await compressImage(proofFile);
        let fileName = `${user.id}/${Date.now()}.jpg`;
        
        if (paymentMethod === 'vodafone' && senderNumber) {
          const safeSender = senderNumber.replace(/[^a-zA-Z0-9\u0600-\u06FF\s-]/g, '').trim();
          fileName = `${user.id}/${Date.now()}_sender_${safeSender}.jpg`;
        }
        
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
        if (allocError) {
          console.error("Allocation error:", allocError); // Don't fail the order if allocation fails
        }

        // Use RPC to finalize order status (user can't update orders directly due to RLS)
        const { error: finalizeError } = await supabase.rpc('finalize_order_delivery', { p_order_id: order.id });
        if (finalizeError) {
          console.error('Finalize order error:', finalizeError);
          // Don't throw — allocation succeeded, order will show as processing but items are delivered
        }
      }

      // Fetch the completed order with all nested data for display
      const { data: fullOrder } = await supabase
        .from('orders')
        .select('*, order_items(*, plan:plans(title_en, title_ar, delivery_type), inventory:plan_inventory(id, invite_link, account_email, account_password, backup_email, backup_password, two_fa_secret, status, used_at))')
        .eq('id', order.id)
        .single();

      clearCart();
      setCompletedOrder(fullOrder);
      setOrderSuccess(true);
      if (fullOrder) {
        sessionStorage.setItem('lastSyncOrderId', fullOrder.id);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Poll for order status updates on the success screen
  useEffect(() => {
    if (!orderSuccess || !completedOrder?.id || paymentMethod === 'balance') return;
    
    if (completedOrder.status === 'payment_review' || (completedOrder.status as any) === 'pending' || (completedOrder.status as any) === 'pending_payment') {
      const interval = setInterval(async () => {
        const supabase = createSyncClient();
        const { data } = await supabase
          .from('orders')
          .select('*, order_items(*, plan:plans(title_en, title_ar, delivery_type), inventory:plan_inventory(id, invite_link, account_email, account_password, backup_email, backup_password, two_fa_secret, status, used_at))')
          .eq('id', completedOrder.id)
          .single();
          
        if (data && data.status !== 'payment_review' && (data.status as any) !== 'pending' && (data.status as any) !== 'pending_payment') {
          setCompletedOrder(data);
        }
      }, 3000); // Polling every 3 seconds for a snappier experience
      
      return () => clearInterval(interval);
    }
  }, [orderSuccess, completedOrder?.id, completedOrder?.status, paymentMethod]);

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

  const handleCopyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for browsers that block clipboard API
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePasswordVisibility = (id: string) => {
    setRevealedPasswords(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };


  // Order success
  if (orderSuccess) {
    const isBalancePurchase = paymentMethod === 'balance';
    return (
      <div className="min-h-screen pt-28 pb-24" style={{ background: 'var(--sync-bg)' }}>
        <div className="max-w-2xl mx-auto px-4">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--sync-text-primary)' }}>
              {isBalancePurchase
                ? (lang === 'ar' ? 'تم الشراء بنجاح! 🎉' : 'Purchase Successful! 🎉')
                : (lang === 'ar' ? 'تم إرسال الطلب! 📦' : 'Order Submitted! 📦')
              }
            </h1>
            {completedOrder && (
              <p className="text-sm font-mono opacity-50" style={{ color: 'var(--sync-text-primary)' }}>#{completedOrder.order_number}</p>
            )}
            <p className="text-sm opacity-60 mt-2" style={{ color: 'var(--sync-text-primary)' }}>
              {isBalancePurchase
                ? (lang === 'ar' ? 'تم خصم المبلغ من رصيدك.' : 'Amount deducted from balance.')
                : (lang === 'ar' ? 'سيتم مراجعة إثبات الدفع خلال ٢٤ ساعة.' : 'Payment proof will be reviewed within 24 hours.')}
            </p>
          </div>

          {/* Order Items with Delivery Data */}
          {completedOrder?.order_items?.length > 0 && (
            <div className="space-y-4 mb-8">
              {completedOrder.order_items.map((item: any) => (
                <div key={item.id} className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: '#0d1530' }}>
                  {/* Item Header */}
                  <div className="p-5 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,194,26,0.1)' }}>
                        <Package className="w-5 h-5" style={{ color: 'var(--sync-yellow)' }} />
                      </div>
                      <div>
                        <p className="font-bold" style={{ color: 'var(--sync-text-primary)' }}>
                          {lang === 'ar' ? item.plan?.title_ar : item.plan?.title_en || 'Product'}
                        </p>
                        <p className="text-xs opacity-50" style={{ color: 'var(--sync-text-primary)' }}>Qty: {item.quantity} &times; ${item.unit_price_usd}</p>
                      </div>
                    </div>
                    <p className="font-black text-lg" style={{ color: 'var(--sync-yellow)' }}>${Number(item.quantity * item.unit_price_usd).toFixed(2)}</p>
                  </div>

                  {/* Delivery Content */}
                  <div className="p-5">
                    {/* Invitation Links */}
                    {item.delivery_type === 'invitation_link' && item.inventory?.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-green-400 flex items-center gap-2 mb-3">
                          <CheckCircle className="w-4 h-4" />
                          {lang === 'ar' ? 'روابط الدعوة جاهزة!' : 'Your Invitation Links are Ready!'}
                        </h4>
                        {item.inventory.map((inv: any, idx: number) => (
                          <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-black/30">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(59,130,246,0.15)' }}>
                                <ExternalLink className="w-4 h-4 text-blue-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold opacity-80" style={{ color: 'var(--sync-text-primary)' }}>
                                  {lang === 'ar' ? `رابط الدعوة #${idx + 1}` : `Invitation Link #${idx + 1}`}
                                </p>
                                <p className="text-[10px] opacity-40" style={{ color: 'var(--sync-text-primary)' }}>
                                  {lang === 'ar' ? 'جاهز للتفعيل' : 'Ready to activate'}
                                </p>
                              </div>
                            </div>
                            <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500/15 text-green-400">
                              {lang === 'ar' ? '✓ محجوز' : '✓ Reserved'}
                            </span>
                          </div>
                        ))}
                        <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 mt-2">
                          <p className="text-[12px] font-bold" style={{ color: 'var(--sync-yellow)' }}>
                            {lang === 'ar' ? '⚠️ لتفعيل الرابط، اذهب للوحة التحكم واضغط "تفعيل الآن". الرابط يعمل مرة واحدة فقط.' : '⚠️ To activate, go to your Dashboard and click "Activate Now". Each link works only once.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Ready Accounts */}
                    {item.delivery_type === 'ready_account' && item.inventory?.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-green-400 flex items-center gap-2 mb-3">
                          <CheckCircle className="w-4 h-4" />
                          {lang === 'ar' ? 'بيانات حسابك جاهزة!' : 'Your Account Credentials are Ready!'}
                        </h4>
                        {item.inventory.map((inv: any, idx: number) => (
                          <div key={inv.id} className="p-4 rounded-xl border border-white/10 bg-black/30 space-y-3">
                            <p className="text-xs font-bold opacity-60" style={{ color: 'var(--sync-text-primary)' }}>
                              {lang === 'ar' ? `حساب #${idx + 1}` : `Account #${idx + 1}`}
                            </p>
                            {/* Email */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/3">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider opacity-40 mb-0.5" style={{ color: 'var(--sync-text-primary)' }}>Email</p>
                                <p className="text-sm font-mono font-bold" style={{ color: 'var(--sync-yellow)' }}>{inv.account_email}</p>
                              </div>
                              <button onClick={() => handleCopyText(inv.account_email, `email-${inv.id}`)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                                {copiedId === `email-${inv.id}` ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 opacity-50" style={{ color: 'var(--sync-text-primary)' }} />}
                              </button>
                            </div>
                            {/* Password */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/3">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider opacity-40 mb-0.5" style={{ color: 'var(--sync-text-primary)' }}>Password</p>
                                <p className="text-sm font-mono font-bold" style={{ color: 'var(--sync-yellow)' }}>
                                  {revealedPasswords.has(inv.id) ? inv.account_password : '••••••••••'}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button onClick={() => togglePasswordVisibility(inv.id)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                                  {revealedPasswords.has(inv.id)
                                    ? <EyeOff className="w-4 h-4 opacity-50" style={{ color: 'var(--sync-text-primary)' }} />
                                    : <Eye className="w-4 h-4 opacity-50" style={{ color: 'var(--sync-text-primary)' }} />}
                                </button>
                                <button onClick={() => handleCopyText(inv.account_password, `pass-${inv.id}`)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                                  {copiedId === `pass-${inv.id}` ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 opacity-50" style={{ color: 'var(--sync-text-primary)' }} />}
                                </button>
                              </div>
                            </div>
                            {/* Backup Account */}
                            {inv.backup_email && (
                              <>
                                <div className="border-t border-white/5 pt-2 mt-1"></div>
                                <p className="text-[10px] uppercase tracking-wider opacity-30 mb-1" style={{ color: 'var(--sync-text-primary)' }}>{lang === 'ar' ? 'حساب الحماية' : 'Backup Account'}</p>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/3">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider opacity-40 mb-0.5" style={{ color: 'var(--sync-text-primary)' }}>Backup Email</p>
                                    <p className="text-sm font-mono font-bold text-blue-400">{inv.backup_email}</p>
                                  </div>
                                  <button onClick={() => handleCopyText(inv.backup_email, `bemail-${inv.id}`)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                                    {copiedId === `bemail-${inv.id}` ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 opacity-50" style={{ color: 'var(--sync-text-primary)' }} />}
                                  </button>
                                </div>
                                {inv.backup_password && (
                                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/3">
                                    <div>
                                      <p className="text-[10px] uppercase tracking-wider opacity-40 mb-0.5" style={{ color: 'var(--sync-text-primary)' }}>Backup Password</p>
                                      <p className="text-sm font-mono font-bold text-blue-400">
                                        {revealedPasswords.has(`b-${inv.id}`) ? inv.backup_password : '••••••••••'}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button onClick={() => togglePasswordVisibility(`b-${inv.id}`)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                                        {revealedPasswords.has(`b-${inv.id}`)
                                          ? <EyeOff className="w-4 h-4 opacity-50" style={{ color: 'var(--sync-text-primary)' }} />
                                          : <Eye className="w-4 h-4 opacity-50" style={{ color: 'var(--sync-text-primary)' }} />}
                                      </button>
                                      <button onClick={() => handleCopyText(inv.backup_password, `bpass-${inv.id}`)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                                        {copiedId === `bpass-${inv.id}` ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 opacity-50" style={{ color: 'var(--sync-text-primary)' }} />}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                            {/* 2FA */}
                            {inv.two_fa_secret && (
                              <>
                                <div className="border-t border-white/5 pt-2 mt-1"></div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/3">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider opacity-40 mb-0.5" style={{ color: 'var(--sync-text-primary)' }}>2FA Code</p>
                                    <p className="text-sm font-mono font-bold text-purple-400">{inv.two_fa_secret}</p>
                                  </div>
                                  <button onClick={() => handleCopyText(inv.two_fa_secret, `2fa-${inv.id}`)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                                    {copiedId === `2fa-${inv.id}` ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 opacity-50" style={{ color: 'var(--sync-text-primary)' }} />}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                        <p className="text-[11px] opacity-40 mt-2" style={{ color: 'var(--sync-text-primary)' }}>
                          {lang === 'ar' ? '⚠️ يمكنك أيضاً الوصول لبيانات الحساب من لوحة التحكم.' : '⚠️ You can also access these credentials from your Dashboard anytime.'}
                        </p>
                      </div>
                    )}

                    {/* Manual activation (user provides email) */}
                    {item.delivery_type === 'user_provides_email' && (
                      <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-center">
                        <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2 opacity-60" />
                        <p className="text-sm font-bold text-blue-400">{lang === 'ar' ? 'جاري تفعيل الاشتراك' : 'Activation in Progress'}</p>
                        <p className="text-xs opacity-60 mt-1" style={{ color: 'var(--sync-text-primary)' }}>
                          {lang === 'ar' ? 'سيتم تفعيل حسابك خلال ساعات قليلة.' : 'Your account will be activated within a few hours.'}
                        </p>
                      </div>
                    )}

                    {/* Pending external payment */}
                    {!isBalancePurchase && (!item.inventory || item.inventory.length === 0) && item.delivery_type !== 'user_provides_email' && (
                      <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 text-center">
                        <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2 opacity-60" />
                        <p className="text-sm font-bold text-orange-400">{lang === 'ar' ? 'في انتظار تأكيد الدفع' : 'Awaiting Payment Confirmation'}</p>
                        <p className="text-xs opacity-60 mt-1" style={{ color: 'var(--sync-text-primary)' }}>
                          {lang === 'ar' ? 'سيتم تسليم المنتج بعد تأكيد الدفع.' : 'Product will be delivered after payment is confirmed.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>
              {lang === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
            </Link>
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg border border-white/10 hover:border-white/30 transition-all" style={{ color: 'var(--sync-text-primary)' }}>
              {lang === 'ar' ? 'لوحة التحكم' : 'View Dashboard'}
            </Link>
          </div>
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

              <label className={`flex flex-col gap-4 p-4 rounded-xl border transition-all ${paymentMethod === 'vodafone' ? 'border-(--sync-yellow) bg-(--sync-yellow)/5' : 'border-white/10 hover:border-white/20'}`}>
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => setPaymentMethod('vodafone')}>
                  <input type="radio" name="payment" checked={paymentMethod === 'vodafone'} readOnly className="hidden" />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'vodafone' ? 'border-(--sync-yellow)' : 'border-white/30'}`}>
                    {paymentMethod === 'vodafone' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--sync-yellow)' }} />}
                  </div>
                  <CreditCard className="w-5 h-5 opacity-60 shrink-0" />
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--sync-text-primary)' }}>
                      {lang === 'ar' ? 'محفظة إلكترونية / إنستاباي' : 'Mobile Wallet / Instapay'}
                    </p>
                    <p className="text-xs opacity-40">{lang === 'ar' ? 'فودافون، اتصالات، أورانج، وي، أو إنستاباي' : 'Vodafone, Etisalat, Orange, WE, or Instapay'}</p>
                  </div>
                </div>
                
                {paymentMethod === 'vodafone' && (
                  <div className="pl-14 pr-4 pt-2 w-full animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block mb-1 text-xs font-bold" style={{ color: 'var(--sync-text-primary)' }}>
                      {lang === 'ar' ? 'رقم التحويل أو عنوان إنستاباي *' : 'Sender Number or Instapay Address *'}
                    </label>
                    <input 
                      type="text" 
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      placeholder={lang === 'ar' ? 'اكتب الرقم أو الحساب الذي حولت منه' : 'Enter the number or account you transferred from'}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-(--sync-yellow) transition-colors"
                      style={{ color: 'var(--sync-text-primary)' }}
                    />
                  </div>
                )}
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
              {paymentMethod === 'vodafone' && (() => {
                const vfSetting = getPaymentSetting('vodafone');
                return (
                  <div className="mt-4 p-4 rounded-xl border border-white/5" style={{ background: '#0a1128' }}>
                    {vfSetting?.account_number && (
                      <div className="mb-3 flex items-center gap-3">
                        <span className="text-xs opacity-50">{lang === 'ar' ? 'حوّل على الرقم:' : 'Transfer to:'}</span>
                        <span className="font-mono font-bold text-lg" style={{ color: 'var(--sync-yellow)' }}>{vfSetting.account_number}</span>
                        {vfSetting.account_name && <span className="text-xs opacity-40">({vfSetting.account_name})</span>}
                      </div>
                    )}
                    <p className="text-sm font-bold mb-2" style={{ color: 'var(--sync-yellow)' }}>
                      {lang === 'ar' ? 'تعليمات الدفع:' : 'Payment Instructions:'}
                    </p>
                    <div className="text-xs opacity-70 space-y-1.5" style={{ color: 'var(--sync-text-primary)' }}>
                      {(lang === 'ar' ? vfSetting?.instructions_ar : vfSetting?.instructions_en)?.split('\n').map((line: string, i: number) => (
                        <p key={i}>{line}</p>
                      )) || <p>{lang === 'ar' ? 'حوّل المبلغ وارفع صورة الإيصال' : 'Transfer the amount and upload the receipt'}</p>}
                    </div>
                    {(lang === 'ar' ? vfSetting?.admin_note_ar : vfSetting?.admin_note_en) && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-xs font-bold opacity-80" style={{ color: 'var(--sync-yellow)' }}>📌 {lang === 'ar' ? 'ملاحظة:' : 'Note:'}</p>
                        <p className="text-xs opacity-60 mt-1">{lang === 'ar' ? vfSetting.admin_note_ar : vfSetting.admin_note_en}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {paymentMethod === 'crypto' && (() => {
                const cryptoSetting = getPaymentSetting('crypto');
                return (
                  <div className="mt-4 p-4 rounded-xl border border-white/5" style={{ background: '#0a1128' }}>
                    <p className="text-sm font-bold mb-2" style={{ color: 'var(--sync-yellow)' }}>
                      {lang === 'ar' ? 'عنوان المحفظة:' : 'Wallet Address:'}
                    </p>
                    {cryptoSetting?.wallet_address ? (
                      <div className="mb-2">
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs opacity-90 break-all font-mono p-2 rounded bg-white/5" style={{ color: 'var(--sync-yellow)' }}>
                            {cryptoSetting.wallet_address}
                          </code>
                          <button
                            onClick={() => handleCopyText(cryptoSetting.wallet_address, 'wallet')}
                            className="shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                            style={{ 
                              background: copiedId === 'wallet' ? '#22c55e' : 'rgba(255,194,26,0.15)', 
                              color: copiedId === 'wallet' ? '#fff' : 'var(--sync-yellow)' 
                            }}
                          >
                            {copiedId === 'wallet' ? (
                              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Copied!</span>
                            ) : (
                              <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</span>
                            )}
                          </button>
                        </div>
                        {cryptoSetting.network && (
                          <span className="text-[10px] opacity-40 mt-1 block">Network: {cryptoSetting.network}</span>
                        )}
                      </div>
                    ) : (
                      <code className="text-xs opacity-70 break-all block">TBD — Contact support</code>
                    )}
                    {cryptoSetting?.qr_code_url && (
                      <div className="my-3 flex justify-center">
                        <img 
                          src={cryptoSetting.qr_code_url} 
                          alt="Payment QR Code" 
                          className="w-48 h-48 object-contain rounded-xl border border-white/10 bg-white p-2"
                        />
                      </div>
                    )}
                    {(lang === 'ar' ? cryptoSetting?.instructions_ar : cryptoSetting?.instructions_en) && (
                      <div className="text-xs opacity-60 mt-2 space-y-1">
                        {(lang === 'ar' ? cryptoSetting.instructions_ar : cryptoSetting.instructions_en).split('\n').map((line: string, i: number) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    )}
                    {(lang === 'ar' ? cryptoSetting?.admin_note_ar : cryptoSetting?.admin_note_en) && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-xs font-bold opacity-80" style={{ color: 'var(--sync-yellow)' }}>📌 {lang === 'ar' ? 'ملاحظة:' : 'Note:'}</p>
                        <p className="text-xs opacity-60 mt-1">{lang === 'ar' ? cryptoSetting.admin_note_ar : cryptoSetting.admin_note_en}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

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
