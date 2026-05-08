import React, { useState, useEffect } from 'react';
import { createSyncClient } from '@/lib/sync/supabase-client';
import { X, Loader2, Plus, Box, Link as LinkIcon, Users, CheckCircle, Clock } from 'lucide-react';

interface AdminInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any;
  onSuccess: () => void;
}

export default function AdminInventoryModal({ isOpen, onClose, plan, onSuccess }: AdminInventoryModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Link inputs
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkLimit, setNewLinkLimit] = useState(1);

  // Accounts input
  const [accountsInput, setAccountsInput] = useState('');

  // Stats
  const [linkStats, setLinkStats] = useState<any[]>([]);
  const [accountStats, setAccountStats] = useState({ available: 0, sold: 0 });

  useEffect(() => {
    if (isOpen && plan) {
      loadInventoryStats();
    }
  }, [isOpen, plan]);

  const loadInventoryStats = async () => {
    setIsLoadingStats(true);
    const supabase = createSyncClient();
    
    try {
      const { data, error } = await supabase
        .from('plan_inventory')
        .select('*')
        .eq('plan_id', plan.id);
        
      if (error) throw error;
      
      const items = data || [];
      
      if (plan.delivery_type === 'invitation_link') {
        // Group by link
        const grouped = items.reduce((acc: any, item: any) => {
          if (!item.invite_link) return acc;
          if (!acc[item.invite_link]) {
            acc[item.invite_link] = { total: 0, sold: 0, used: 0 };
          }
          acc[item.invite_link].total++;
          if (item.status === 'sold') acc[item.invite_link].sold++;
          if (item.used_at) acc[item.invite_link].used++;
          return acc;
        }, {});
        
        setLinkStats(Object.entries(grouped).map(([link, stats]: any) => ({ link, ...stats })));
      } else if (plan.delivery_type === 'ready_account') {
        const available = items.filter((i: any) => i.status === 'available').length;
        const sold = items.filter((i: any) => i.status === 'sold').length;
        setAccountStats({ available, sold });
      }
    } catch (err: any) {
      console.error("Error loading stats:", err.message);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkUrl.trim() || newLinkLimit < 1) return;
    
    setIsUpdating(true);
    const supabase = createSyncClient();
    const inserts = [];
    
    for (let i = 0; i < newLinkLimit; i++) {
      inserts.push({
        plan_id: plan.id,
        invite_link: newLinkUrl.trim(),
        status: 'available'
      });
    }
    
    try {
      const { error } = await supabase.from('plan_inventory').insert(inserts);
      if (error) throw error;
      
      setNewLinkUrl('');
      setNewLinkLimit(1);
      loadInventoryStats();
      onSuccess();
    } catch (err: any) {
      alert("Error adding link: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddAccounts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountsInput.trim()) return;
    
    setIsUpdating(true);
    const supabase = createSyncClient();
    const lines = accountsInput.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const inserts = [];
    
    for (const line of lines) {
      const [email, password] = line.split(':');
      inserts.push({
        plan_id: plan.id,
        account_email: email,
        account_password: password || '',
        status: 'available'
      });
    }
    
    try {
      if (inserts.length > 0) {
        const { error } = await supabase.from('plan_inventory').insert(inserts);
        if (error) throw error;
      }
      setAccountsInput('');
      loadInventoryStats();
      onSuccess();
    } catch (err: any) {
      alert("Error adding accounts: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto pt-12 pb-12">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 p-6 md:p-8 shadow-2xl relative mt-4 mb-4" style={{ background: '#0a1128', color: '#e2e8f0' }}>
        <button onClick={onClose} className="absolute top-6 right-6 opacity-50 hover:opacity-100 transition-colors">
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-black mb-1 flex items-center gap-3">
          <Box className="w-6 h-6 text-(--sync-yellow)" /> 
          Manage Inventory
        </h2>
        <p className="text-sm opacity-60 mb-6 border-b border-white/5 pb-4">
          Plan: <strong className="text-(--sync-yellow)">{plan.title_en}</strong> &mdash; <span className="uppercase tracking-widest text-[10px] opacity-80">{plan.delivery_type.replace(/_/g, ' ')}</span>
        </p>

        {isLoadingStats ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-(--sync-yellow)" />
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Invitation Links Layout */}
            {plan.delivery_type === 'invitation_link' && (
              <>
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5" /> Current Links
                  </h3>
                  {linkStats.length === 0 ? (
                    <div className="text-center p-8 bg-white/5 rounded-xl opacity-50 text-sm">No links added yet.</div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {linkStats.map((stat, idx) => (
                        <div key={idx} className="bg-[#060b18] border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-sm text-(--sync-yellow) truncate mb-2">{stat.link}</p>
                            <div className="flex gap-4 text-xs font-bold">
                              <span className="flex items-center gap-1 opacity-70"><Box className="w-3 h-3" /> Total: {stat.total}</span>
                              <span className="flex items-center gap-1 text-green-400"><CheckCircle className="w-3 h-3" /> Sold: {stat.sold}</span>
                              <span className="flex items-center gap-1 text-blue-400"><Users className="w-3 h-3" /> Used: {stat.used}</span>
                            </div>
                          </div>
                          
                          {/* Progress bar visual */}
                          <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden flex shrink-0">
                            <div className="h-full bg-blue-500" style={{ width: `${(stat.used / stat.total) * 100}%` }}></div>
                            <div className="h-full bg-green-500 opacity-50" style={{ width: `${((stat.sold - stat.used) / stat.total) * 100}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-white/5 pt-6">
                  <h3 className="text-sm font-bold opacity-60 mb-4">Add New Link</h3>
                  <form onSubmit={handleAddLink} className="flex gap-4">
                    <div className="flex-1">
                      <input 
                        required 
                        type="url" 
                        placeholder="https://..." 
                        value={newLinkUrl} 
                        onChange={e => setNewLinkUrl(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#060b18] text-sm"
                      />
                    </div>
                    <div className="w-32">
                      <input 
                        required 
                        type="number" 
                        min="1"
                        placeholder="Limit" 
                        value={newLinkLimit} 
                        onChange={e => setNewLinkLimit(parseInt(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-[#060b18] text-sm"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isUpdating}
                      className="px-6 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                      style={{ background: 'var(--sync-yellow)', color: '#060b18' }}
                    >
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Add Link
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* Ready Accounts Layout */}
            {plan.delivery_type === 'ready_account' && (
              <>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 bg-[#060b18] border border-white/5 p-4 rounded-xl text-center">
                    <p className="text-xs opacity-50 uppercase tracking-wider mb-1">Available Accounts</p>
                    <p className="text-3xl font-black text-(--sync-yellow)">{accountStats.available}</p>
                  </div>
                  <div className="flex-1 bg-[#060b18] border border-white/5 p-4 rounded-xl text-center">
                    <p className="text-xs opacity-50 uppercase tracking-wider mb-1">Sold Accounts</p>
                    <p className="text-3xl font-black text-green-400">{accountStats.sold}</p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-6">
                  <h3 className="text-sm font-bold opacity-60 mb-2">Add New Accounts</h3>
                  <p className="text-xs opacity-40 mb-4">Enter accounts (one per line). Format: email:password</p>
                  <form onSubmit={handleAddAccounts}>
                    <textarea 
                      required 
                      rows={6}
                      value={accountsInput} 
                      onChange={e => setAccountsInput(e.target.value)}
                      placeholder="user1@gmail.com:pass123&#10;user2@gmail.com:pass456"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 font-mono text-sm mb-4"
                      style={{ background: '#060b18' }}
                    />
                    <div className="flex justify-end">
                      <button 
                        type="submit"
                        disabled={isUpdating || !accountsInput.trim()}
                        className="px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                        style={{ background: 'var(--sync-yellow)', color: '#060b18' }}
                      >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Save Accounts
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
            
            {/* User Provides Email Layout */}
            {plan.delivery_type === 'user_provides_email' && (
              <div className="text-center p-8 bg-[#060b18] border border-white/5 rounded-xl">
                <Clock className="w-12 h-12 text-(--sync-yellow) mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-bold mb-2">Manual Activation</h3>
                <p className="text-sm opacity-60 max-w-md mx-auto">
                  For this plan type, users will provide their email address during checkout. 
                  You will need to manually process these orders from the Orders tab. No inventory management is required here.
                </p>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
