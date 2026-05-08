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
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
  public_proof_url?: string;
}

export default function AdminFinanceTab() {
  const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    const supabase = createSyncClient();
    
    const { data, error } = await supabase
      .from('balance_transactions')
      .select('*, user:profiles(id, full_name, email)')
      .eq('type', 'topup')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else if (data) {
      const txs = data as any[];
      // Map proof URLs
      for (const tx of txs) {
        if (tx.payment_proof_url) {
          const { data: urlData } = supabase.storage.from('payment-proofs').getPublicUrl(tx.payment_proof_url);
          tx.public_proof_url = urlData.publicUrl;
        }
      }
      setTransactions(txs);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAction = async (txId: string, userId: string, amount: number, action: 'confirmed' | 'rejected') => {
    if (!confirm(`Are you sure you want to ${action === 'confirmed' ? 'approve' : 'reject'} this top-up?`)) return;
    
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
          <p className="text-sm opacity-50 mt-1">Review pending balance top-up requests.</p>
        </div>
        <button onClick={fetchTransactions} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
          <Loader2 className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#ffc21a]" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-20 bg-[#0d1530] rounded-2xl border border-white/5">
          <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="opacity-50">No pending top-up requests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {transactions.map(tx => (
            <div key={tx.id} className="bg-[#0d1530] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row gap-6">
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
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-[#ffc21a]">${tx.amount.toFixed(2)} Top-Up</h3>
                    <p className="text-sm opacity-70">via {tx.payment_method}</p>
                    <p className="text-xs opacity-40 mt-1">{new Date(tx.created_at).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{tx.user?.full_name}</p>
                    <p className="text-xs opacity-50">{tx.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-auto">
                  <button
                    onClick={() => handleAction(tx.id, tx.user_id, tx.amount, 'confirmed')}
                    disabled={!!isUpdating}
                    className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isUpdating === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Approve & Add Balance
                  </button>
                  <button
                    onClick={() => handleAction(tx.id, tx.user_id, tx.amount, 'rejected')}
                    disabled={!!isUpdating}
                    className="px-4 py-2.5 rounded-xl font-bold border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isUpdating === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
