import React, { useState, useEffect } from 'react';
import { createSyncClient } from '@/lib/sync/supabase-client';
import { Loader2, CheckCircle, XCircle, Search, CreditCard, Image as ImageIcon } from 'lucide-react';

interface BalanceTransaction {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  payment_method: string;
  payment_proof_url: string;
  created_at: string;
  admin_note?: string;
  user?: {
    id: string;
    full_name: string;
    user_code: string;
    phone: string;
    balance: number;
  };
  public_proof_url?: string;
}

interface AdminFinanceTabProps {
  onViewUser?: (userId: string) => void;
}

export default function AdminFinanceTab({ onViewUser }: AdminFinanceTabProps) {
  const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [confirmPopup, setConfirmPopup] = useState<{ txId: string, userId: string, amount: number, action: 'confirmed' | 'rejected' } | null>(null);
  const [viewMode, setViewMode] = useState<'pending' | 'history'>('pending');

  const fetchTransactions = async () => {
    setIsLoading(true);
    const supabase = createSyncClient();
    
    let query = supabase
      .from('balance_transactions')
      .select('*, user:profiles(id, full_name, user_code, phone, balance)')
      .eq('type', 'topup')
      .order('created_at', { ascending: false });

    if (viewMode === 'pending') {
      query = query.eq('status', 'pending');
    } else {
      query = query.neq('status', 'pending');
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
    } else if (data) {
      const txs = data as any[];
      // Map proof URLs
      for (const tx of txs) {
        if (tx.payment_proof_url) {
          const { data: urlData } = await supabase.storage.from('payment-proofs').createSignedUrl(tx.payment_proof_url, 60 * 60); // 1 hour
          if (urlData) {
            tx.public_proof_url = urlData.signedUrl;
          }
        }
      }
      setTransactions(txs);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [viewMode]);

  const executeAction = async () => {
    if (!confirmPopup) return;
    const { txId, userId, amount, action } = confirmPopup;
    setConfirmPopup(null);
    setIsUpdating(txId);
    const supabase = createSyncClient();
    
    try {
      if (action === 'confirmed') {
        // We must update the user's balance and update the transaction status
        // Instead of doing it separately which might be tricky if not in a transaction,
        // we can call an RPC if we have one, or just update balance then transaction.
        // Wait! We can just use our existing rpc `update_user_balance`!
        // Actually, we already have a pending transaction, so we should just update its status,
        // and manually increment the profile balance. Or we can just let `update_user_balance` create a NEW transaction.
        // If we want to use the existing transaction, we update it and the profile.
        
        // Since we don't have a specific RPC for approving a topup, we do:
        // 1. Get current profile
        const { data: profile } = await supabase.from('profiles').select('balance').eq('id', userId).single();
        const currentBalance = profile?.balance || 0;
        const newBalance = currentBalance + amount;

        // 2. Update transaction
        const { error: txError } = await supabase
          .from('balance_transactions')
          .update({ 
            status: 'confirmed',
            balance_after: newBalance,
            admin_note: 'Top-up approved'
          })
          .eq('id', txId);

        if (txError) throw txError;

        // 3. Update profile
        const { error: profError } = await supabase
          .from('profiles')
          .update({ balance: newBalance })
          .eq('id', userId);

        if (profError) throw profError;

        // Notify user
        await supabase.from('notifications').insert({
          user_id: userId,
          title_en: 'Top Up Approved',
          title_ar: 'تم تأكيد الشحن',
          message_en: `Your balance has been topped up by $${amount.toFixed(2)}.`,
          message_ar: `تم شحن رصيدك بمقدار $${amount.toFixed(2)}.`,
          is_read: false
        });

      } else {
        // Rejected
        const { error } = await supabase
          .from('balance_transactions')
          .update({ 
            status: 'rejected',
            admin_note: 'Proof invalid or payment not received'
          })
          .eq('id', txId);

        if (error) throw error;

        // Notify user
        await supabase.from('notifications').insert({
          user_id: userId,
          title_en: 'Top Up Rejected',
          title_ar: 'تم رفض الشحن',
          message_en: `Your top up request for $${amount.toFixed(2)} was rejected. Please contact support.`,
          message_ar: `تم رفض طلب شحن الرصيد بقيمة $${amount.toFixed(2)}. يرجى التواصل مع الدعم.`,
          is_read: false
        });
      }

      fetchTransactions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">Finance & Recharges</h2>
          <p className="text-sm opacity-50 mt-1">Review balance top-up requests and history.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
            <button
              onClick={() => setViewMode('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'pending' ? 'bg-[#ffc21a] text-[#060b18]' : 'text-white/50 hover:text-white'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'history' ? 'bg-[#ffc21a] text-[#060b18]' : 'text-white/50 hover:text-white'}`}
            >
              History
            </button>
          </div>
          <button onClick={fetchTransactions} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <Loader2 className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#ffc21a]" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-20 bg-[#0d1530] rounded-2xl border border-white/5">
          <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="opacity-50">No top-up requests found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {transactions.map(tx => (
            <div key={tx.id} className={`bg-[#0d1530] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row gap-6 ${viewMode === 'history' ? 'opacity-80' : ''}`}>
              {/* Proof Image */}
              <div className="w-full md:w-48 shrink-0">
                {tx.public_proof_url ? (
                  <a href={tx.public_proof_url} target="_blank" rel="noopener noreferrer" className="block relative group rounded-xl overflow-hidden border border-white/10">
                    <img src={tx.public_proof_url} alt="Proof" className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                  </a>
                ) : (
                  <div className="w-full h-32 rounded-xl border border-white/10 bg-black/20 flex items-center justify-center">
                    <span className="text-xs opacity-50">No Image</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-[#ffc21a]">${tx.amount.toFixed(2)} Top-Up</h3>
                    <p className="text-sm opacity-70">via {tx.payment_method}</p>
                    <p className="text-xs opacity-40 mt-1">{new Date(tx.created_at).toLocaleString()}</p>
                    {viewMode === 'history' && tx.admin_note && (
                      <p className="text-xs mt-2 p-2 bg-white/5 rounded-lg italic">Note: {tx.admin_note}</p>
                    )}
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="font-bold text-lg">{tx.user?.full_name || 'Unknown User'}</p>
                    <p className="text-xs opacity-50 mb-1">{tx.user?.user_code} {tx.user?.phone ? `• ${tx.user?.phone}` : ''}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-1 bg-white/5 rounded-md">Balance: <span className="text-[#ffc21a]">${Number(tx.user?.balance || 0).toFixed(2)}</span></span>
                    </div>
                    {onViewUser && tx.user_id && (
                      <button onClick={() => onViewUser(tx.user_id)} className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2">
                        View User Profile
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-auto">
                  {viewMode === 'pending' ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setConfirmPopup({ txId: tx.id, userId: tx.user_id, amount: tx.amount, action: 'confirmed' })}
                        disabled={!!isUpdating}
                        className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {isUpdating === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Approve & Add Balance
                      </button>
                      <button
                        onClick={() => setConfirmPopup({ txId: tx.id, userId: tx.user_id, amount: tx.amount, action: 'rejected' })}
                        disabled={!!isUpdating}
                        className="px-4 py-2.5 rounded-xl font-bold border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {isUpdating === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <span className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider ${
                        tx.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Popup */}
      {confirmPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 p-6 shadow-2xl relative" style={{ background: '#0a1128', color: '#e2e8f0' }}>
            <h2 className="text-xl font-bold mb-4">Confirm Action</h2>
            <p className="opacity-80 mb-6">
              Are you sure you want to <strong className={confirmPopup.action === 'confirmed' ? 'text-green-400' : 'text-red-400'}>{confirmPopup.action === 'confirmed' ? 'APPROVE' : 'REJECT'}</strong> this top-up of <strong>${confirmPopup.amount.toFixed(2)}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmPopup(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-bold"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-colors ${
                  confirmPopup.action === 'confirmed' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Yes, {confirmPopup.action === 'confirmed' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
