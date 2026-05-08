import React, { useState, useEffect } from 'react';
import { createSyncClient } from '@/lib/sync/supabase-client';
import { X, Loader2, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AdminUserModalProps {
  userId: string;
  onClose: () => void;
  onBalanceUpdated: () => void;
}

export default function AdminUserModal({ userId, onClose, onBalanceUpdated }: AdminUserModalProps) {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add balance states
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceNote, setBalanceNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const supabase = createSyncClient();
    
    // Fetch profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profile) setUser(profile);

    // Fetch transactions
    const { data: balanceTxs } = await supabase
      .from('balance_transactions')
      .select('*')
      .eq('user_id', userId)
      .neq('type', 'purchase');
      
    // Fetch orders
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId);

    let allTxs: any[] = [];
    
    if (balanceTxs) {
      allTxs.push(...balanceTxs.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        created_at: t.created_at
      })));
    }

    if (orders) {
      allTxs.push(...orders.map(o => ({
        id: o.id,
        type: 'purchase',
        amount: -o.total_usd, // Negative because it's spending
        status: o.status === 'delivered' ? 'confirmed' : o.status === 'cancelled' ? 'rejected' : 'pending',
        created_at: o.created_at
      })));
    }

    allTxs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setTransactions(allTxs);
    setIsLoading(false);
  };

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const handleAddBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !balanceAmount) return;

    setIsUpdating(true);
    const supabase = createSyncClient();
    try {
      const amount = parseFloat(balanceAmount);
      const { error } = await supabase.rpc('update_user_balance', {
        p_user_id: user.id,
        p_amount: amount,
        p_type: 'admin_adjust',
        p_admin_note: balanceNote || 'Admin adjustment',
      });

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: user.id,
        title_en: 'Balance Updated',
        title_ar: 'تحديث الرصيد',
        message_en: `Your balance has been adjusted by $${amount.toFixed(2)}.`,
        message_ar: `تم تعديل رصيدك بمقدار $${amount.toFixed(2)}.`,
        is_read: false
      });

      setBalanceAmount('');
      setBalanceNote('');
      onBalanceUpdated();
      fetchData(); // Refresh history and balance
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-2xl border border-white/10 shadow-2xl relative flex flex-col max-h-[90vh]" style={{ background: '#0a1128', color: '#e2e8f0' }}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 opacity-50 hover:opacity-100 bg-black/20 p-2 rounded-full transition-opacity">
          <X className="w-5 h-5" />
        </button>

        {isLoading ? (
          <div className="p-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#ffc21a]" />
          </div>
        ) : user ? (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header / Info */}
            <div className="p-6 border-b border-white/5 bg-white/5 shrink-0">
              <h2 className="text-2xl font-black">{user.full_name || 'Unknown User'}</h2>
              <div className="flex items-center gap-4 mt-2 text-sm opacity-70">
                <span>{user.user_code}</span>
                {user.phone && <span>• {user.phone}</span>}
              </div>
              <div className="mt-4 text-3xl font-black text-[#ffc21a]">
                ${Number(user.balance || 0).toFixed(2)}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Transaction History */}
              <div className="flex flex-col h-full max-h-[500px]">
                <h3 className="font-bold mb-4 opacity-80 flex items-center gap-2">Transaction History <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{transactions.length}</span></h3>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {transactions.length === 0 ? (
                    <div className="text-center opacity-40 py-10 text-sm border border-white/5 border-dashed rounded-xl">No transactions yet.</div>
                  ) : transactions.map(tx => (
                    <div key={tx.id} className="p-3 rounded-xl border border-white/5 bg-black/20 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${tx.amount > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {tx.amount > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm truncate">
                            {tx.type === 'topup' ? 'Top-Up' : tx.type === 'admin_adjust' ? 'Adjustment' : 'Purchase'}
                          </span>
                          <span className={`font-bold text-sm shrink-0 ${tx.amount > 0 ? 'text-green-400' : 'text-white'}`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] opacity-50 truncate mr-2">{new Date(tx.created_at).toLocaleString()}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase shrink-0 ${
                            tx.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                            tx.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                            'bg-orange-500/20 text-orange-400'
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Balance Form */}
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5 h-fit">
                <h3 className="font-bold mb-4 opacity-80 flex items-center gap-2"><Plus className="w-4 h-4" /> Adjust Balance</h3>
                <form onSubmit={handleAddBalance} className="space-y-4">
                  <div>
                    <label className="text-xs opacity-50 block mb-1">Amount ($) <span className="text-red-400 ml-1">*Use negative to deduct</span></label>
                    <input 
                      type="number" 
                      step="0.01" 
                      required 
                      value={balanceAmount} 
                      onChange={e => setBalanceAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-[#ffc21a]/50 transition-colors bg-black/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs opacity-50 block mb-1">Note (Optional)</label>
                    <input 
                      type="text" 
                      value={balanceNote} 
                      onChange={e => setBalanceNote(e.target.value)}
                      placeholder="e.g. Refund, Bonus..."
                      className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-[#ffc21a]/50 transition-colors bg-black/20"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isUpdating || !balanceAmount}
                    className="w-full py-3 mt-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
                    style={{ background: '#ffc21a', color: '#060b18' }}
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Confirm Update
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center opacity-50">User not found.</div>
        )}
      </div>
    </div>
  );
}
