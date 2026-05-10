"use client";

import React, { useState, useRef } from 'react';
import { X, Upload, Trash2, CheckCircle, Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { useSync } from './SyncProviders';
import { createSyncClient } from '@/lib/sync/supabase-client';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

type PaymentMethod = 'vodafone' | 'crypto';

export default function RechargeModal({ isOpen, onClose, userId }: RechargeModalProps) {
  const { lang } = useSync();
  const [amount, setAmount] = useState<string>('10');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vodafone');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [senderNumber, setSenderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAmountSelect = (val: string) => {
    setAmount(val);
    if (val !== 'custom') setCustomAmount('');
  };

  const finalAmount = amount === 'custom' ? Number(customAmount) : Number(amount);

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

  const handleSubmit = async () => {
    if (!finalAmount || finalAmount <= 0) {
      setError(lang === 'ar' ? 'من فضلك أدخل مبلغ صحيح' : 'Please enter a valid amount');
      return;
    }
    if (!proofFile) {
      setError(lang === 'ar' ? 'من فضلك ارفع صورة إثبات الدفع' : 'Please upload payment proof');
      return;
    }
    if (paymentMethod === 'vodafone' && !senderNumber.trim()) {
      setError(lang === 'ar' ? 'من فضلك ادخل رقم التحويل أو الحساب' : 'Please enter the sender number or account');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createSyncClient();

      // Upload proof
      const compressed = await compressImage(proofFile);
      let fileName = `${userId}/recharge_${Date.now()}.jpg`;
      
      if (paymentMethod === 'vodafone' && senderNumber) {
        const safeSender = senderNumber.replace(/[^a-zA-Z0-9\u0600-\u06FF\s-]/g, '').trim();
        fileName = `${userId}/recharge_${Date.now()}_sender_${safeSender}.jpg`;
      }
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, compressed, { contentType: 'image/jpeg' });

      if (uploadError) throw new Error(uploadError.message);

      // Insert pending transaction
      const { error: txError } = await supabase
        .from('balance_transactions')
        .insert({
          user_id: userId,
          amount: finalAmount,
          type: 'topup',
          status: 'pending',
          payment_method: paymentMethod,
          payment_proof_url: fileName,
          balance_after: 0 // Will be updated by admin when approved
        });

      if (txError) throw new Error(txError.message);

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    if (isSuccess) {
      window.location.reload(); // Refresh to update balance transactions UI
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0B132B]/80 backdrop-blur-sm" onClick={!isSubmitting ? handleModalClose : undefined} />
      
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" style={{ background: '#0d1530', border: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0" style={{ background: '#0a1128' }}>
          <h2 className="text-2xl font-black" style={{ color: 'var(--sync-text-primary)' }}>
            {lang === 'ar' ? 'شحن الرصيد' : 'Top Up Balance'}
          </h2>
          <button onClick={handleModalClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white" disabled={isSubmitting}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--sync-text-primary)' }}>
                {lang === 'ar' ? 'تم إرسال طلب الشحن!' : 'Top Up Request Sent!'}
              </h3>
              <p className="opacity-70 text-sm mb-8">
                {lang === 'ar' 
                  ? 'سيقوم الدعم الفني بمراجعة الإيصال وإضافة الرصيد لحسابك في أقرب وقت.' 
                  : 'Support will review your receipt and add the balance to your account shortly.'}
              </p>
              <button onClick={handleModalClose} className="w-full py-4 rounded-xl font-bold transition-all hover:scale-[1.02]" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>
                {lang === 'ar' ? 'حسناً' : 'Done'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Amount Selection */}
              <div>
                <label className="text-sm font-bold block mb-3" style={{ color: 'var(--sync-text-primary)' }}>
                  {lang === 'ar' ? 'اختر المبلغ' : 'Select Amount'}
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {['10', '25', '50', '100'].map(val => (
                    <button
                      key={val}
                      onClick={() => handleAmountSelect(val)}
                      className={`py-3 rounded-xl font-bold text-lg border transition-all ${amount === val ? 'bg-[#ffc21a]/10 border-[#ffc21a] text-[#ffc21a]' : 'border-white/10 hover:border-white/30 text-white/70'}`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAmountSelect('custom')}
                    className={`px-4 py-3 rounded-xl font-bold text-sm border transition-all whitespace-nowrap ${amount === 'custom' ? 'bg-[#ffc21a]/10 border-[#ffc21a] text-[#ffc21a]' : 'border-white/10 hover:border-white/30 text-white/70'}`}
                  >
                    {lang === 'ar' ? 'مبلغ آخر' : 'Custom'}
                  </button>
                  {amount === 'custom' && (
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold">$</span>
                      <input 
                        type="number" 
                        min="1"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-[#ffc21a]/50 bg-[#0a1128] text-[#ffc21a] font-bold text-lg outline-none focus:border-[#ffc21a] transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-sm font-bold block mb-3" style={{ color: 'var(--sync-text-primary)' }}>
                  {lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <label className={`flex flex-col gap-4 p-4 rounded-xl border transition-all ${paymentMethod === 'vodafone' ? 'border-[#ffc21a] bg-[#ffc21a]/5' : 'border-white/10 hover:border-white/20'}`}>
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => setPaymentMethod('vodafone')}>
                      <input type="radio" checked={paymentMethod === 'vodafone'} readOnly className="hidden" />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'vodafone' ? 'border-[#ffc21a]' : 'border-white/30'}`}>
                        {paymentMethod === 'vodafone' && <div className="w-2.5 h-2.5 rounded-full bg-[#ffc21a]" />}
                      </div>
                      <CreditCard className="w-5 h-5 opacity-60 shrink-0" />
                      <div>
                        <p className="font-bold text-sm text-(--sync-text-primary)">
                          {lang === 'ar' ? 'محفظة إلكترونية / إنستاباي' : 'Mobile Wallet / Instapay'}
                        </p>
                      </div>
                    </div>
                    
                    {paymentMethod === 'vodafone' && (
                      <div className="pl-14 pr-4 pt-2 w-full animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block mb-1 text-xs font-bold text-(--sync-text-primary)">
                          {lang === 'ar' ? 'رقم التحويل أو عنوان إنستاباي *' : 'Sender Number or Instapay Address *'}
                        </label>
                        <input 
                          type="text" 
                          value={senderNumber}
                          onChange={(e) => setSenderNumber(e.target.value)}
                          placeholder={lang === 'ar' ? 'اكتب الرقم أو الحساب' : 'Enter number or account'}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ffc21a] transition-colors text-(--sync-text-primary)"
                        />
                      </div>
                    )}
                  </label>

                  <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'crypto' ? 'border-[#ffc21a] bg-[#ffc21a]/5' : 'border-white/10 hover:border-white/20'}`}>
                    <input type="radio" checked={paymentMethod === 'crypto'} onChange={() => setPaymentMethod('crypto')} className="hidden" />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'crypto' ? 'border-[#ffc21a]' : 'border-white/30'}`}>
                      {paymentMethod === 'crypto' && <div className="w-2.5 h-2.5 rounded-full bg-[#ffc21a]" />}
                    </div>
                    <span className="text-lg">₿</span>
                    <div>
                      <p className="font-bold text-sm text-(--sync-text-primary)">Cryptocurrency</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="p-4 rounded-xl border border-white/5" style={{ background: '#0a1128' }}>
                <p className="text-sm font-bold mb-2 text-[#ffc21a]">
                  {lang === 'ar' ? 'تعليمات الدفع:' : 'Payment Instructions:'}
                </p>
                {paymentMethod === 'vodafone' ? (
                  <ol className="text-xs opacity-70 space-y-1.5 list-decimal list-inside text-(--sync-text-primary)">
                    <li>{lang === 'ar' ? `حوّل مبلغ $${finalAmount || '0'} على رقم 01000000000` : `Transfer $${finalAmount || '0'} equivalent to 01000000000`}</li>
                    <li>{lang === 'ar' ? 'التقط صورة للإيصال' : 'Take a screenshot of the receipt'}</li>
                    <li>{lang === 'ar' ? 'ارفع الصورة بالأسفل' : 'Upload the screenshot below'}</li>
                  </ol>
                ) : (
                  <div className="text-xs opacity-70 space-y-1.5 text-(--sync-text-primary)">
                    <p>USDT (TRC20) Wallet:</p>
                    <code className="block p-2 bg-black/50 rounded mt-1 break-all select-all">TBD_WALLET_ADDRESS_HERE</code>
                    <p className="mt-2">{lang === 'ar' ? 'حول وارفع صورة المعاملة.' : 'Transfer and upload the transaction screenshot.'}</p>
                  </div>
                )}
              </div>

              {/* Proof Upload */}
              <div>
                <label className="text-sm font-bold block mb-3 text-(--sync-text-primary)">
                  {lang === 'ar' ? 'صورة إثبات الدفع *' : 'Payment Proof *'}
                </label>
                {proofPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-white/10">
                    <img src={proofPreview} alt="Proof" className="w-full max-h-48 object-contain bg-black/50" />
                    <button onClick={() => { setProofFile(null); setProofPreview(null); }} className="absolute top-2 right-2 p-2 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} className="w-full py-6 rounded-xl border-2 border-dashed border-white/10 hover:border-[#ffc21a]/30 transition-all flex flex-col items-center gap-2 bg-[#0a1128]">
                    <Upload className="w-6 h-6 opacity-30" />
                    <span className="text-sm opacity-50">{lang === 'ar' ? 'اضغط لرفع الصورة' : 'Click to upload'}</span>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-sm text-red-400 bg-red-500/10">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isSuccess && (
          <div className="p-6 border-t border-white/10 shrink-0 bg-[#0a1128]">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 bg-[#ffc21a] text-[#0B132B]"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  {lang === 'ar' ? 'إرسال طلب الشحن' : 'Submit Request'}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
