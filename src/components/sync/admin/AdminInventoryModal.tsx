import React, { useState, useEffect } from 'react';
import { createSyncClient } from '@/lib/sync/supabase-client';
import { X, Loader2, Plus, Box, Link as LinkIcon, Users, CheckCircle, Clock, Eye, EyeOff, Edit2, Trash2, Check } from 'lucide-react';

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

  // Link editing state
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editLinkUrl, setEditLinkUrl] = useState('');
  const [editLinkTotal, setEditLinkTotal] = useState(1);

  // Accounts form
  const [accEmail, setAccEmail] = useState('');
  const [accPassword, setAccPassword] = useState('');
  const [accBackupEmail, setAccBackupEmail] = useState('');
  const [accBackupPassword, setAccBackupPassword] = useState('');
  const [acc2Fa, setAcc2Fa] = useState('');
  const [showAccountsList, setShowAccountsList] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<number>>(new Set());

  // Stats
  const [linkStats, setLinkStats] = useState<any[]>([]);
  const [accountStats, setAccountStats] = useState({ available: 0, sold: 0 });
  const [accountList, setAccountList] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && plan) {
      loadInventoryStats();
      setEditingIdx(null);
      setEditLinkUrl('');
      setEditLinkTotal(1);
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
            acc[item.invite_link] = { total: 0, sold: 0, used: 0, availableIds: [] };
          }
          acc[item.invite_link].total++;
          if (item.status === 'sold') acc[item.invite_link].sold++;
          if (item.used_at) acc[item.invite_link].used++;
          if (item.status === 'available') acc[item.invite_link].availableIds.push(item.id);
          return acc;
        }, {});
        
        setLinkStats(Object.entries(grouped).map(([link, stats]: any) => ({ link, ...stats })));
      } else if (plan.delivery_type === 'ready_account') {
        const availableItems = items.filter((i: any) => i.status === 'available');
        const available = availableItems.length;
        const sold = items.filter((i: any) => i.status === 'sold').length;
        setAccountStats({ available, sold });
        setAccountList(availableItems);
      }
    } catch (err: any) {
      console.error("Error loading stats:", err.message);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleStartEdit = (idx: number, stat: any) => {
    setEditingIdx(idx);
    setEditLinkUrl(stat.link);
    setEditLinkTotal(stat.total);
  };

  const handleCancelEdit = () => {
    setEditingIdx(null);
    setEditLinkUrl('');
    setEditLinkTotal(1);
  };

  const handleSaveEdit = async (stat: any) => {
    if (!editLinkUrl.trim() || editLinkTotal < stat.sold) {
      alert(`Total stock cannot be less than sold quantity (${stat.sold}).`);
      return;
    }

    setIsUpdating(true);
    const supabase = createSyncClient();

    try {
      // 1. Update the URL if it changed
      if (editLinkUrl.trim() !== stat.link) {
        const { error: urlError } = await supabase
          .from('plan_inventory')
          .update({ invite_link: editLinkUrl.trim() })
          .eq('plan_id', plan.id)
          .eq('invite_link', stat.link);

        if (urlError) throw urlError;
      }

      // 2. Adjust stock limit
      const difference = editLinkTotal - stat.total;

      if (difference > 0) {
        // Add more stock slots
        const inserts = [];
        for (let i = 0; i < difference; i++) {
          inserts.push({
            plan_id: plan.id,
            invite_link: editLinkUrl.trim(),
            status: 'available'
          });
        }
        const { error: insertError } = await supabase
          .from('plan_inventory')
          .insert(inserts);

        if (insertError) throw insertError;
      } else if (difference < 0) {
        // Delete excess available stock slots
        const numToDelete = Math.abs(difference);
        const idsToDelete = stat.availableIds.slice(0, numToDelete);

        if (idsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('plan_inventory')
            .delete()
            .in('id', idsToDelete);

          if (deleteError) throw deleteError;
        }
      }

      setEditingIdx(null);
      loadInventoryStats();
      onSuccess();
    } catch (err: any) {
      alert("Error saving edits: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteLinkGroup = async (stat: any) => {
    const availableCount = stat.availableIds.length;
    if (availableCount === 0) {
      alert("No available slots to delete for this link.");
      return;
    }

    const confirmMsg = `Are you sure you want to delete all ${availableCount} available stock slots for this link? This action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    setIsUpdating(true);
    const supabase = createSyncClient();

    try {
      const { error } = await supabase
        .from('plan_inventory')
        .delete()
        .in('id', stat.availableIds);

      if (error) throw error;

      loadInventoryStats();
      onSuccess();
    } catch (err: any) {
      alert("Error deleting link stock: " + err.message);
    } finally {
      setIsUpdating(false);
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

  const handleAddAccountForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accEmail.trim()) return;
    
    setIsUpdating(true);
    const supabase = createSyncClient();
    
    try {
      const { error } = await supabase.from('plan_inventory').insert({
        plan_id: plan.id,
        account_email: accEmail.trim(),
        account_password: accPassword.trim(),
        backup_email: accBackupEmail.trim(),
        backup_password: accBackupPassword.trim(),
        two_fa_secret: acc2Fa.trim(),
        status: 'available'
      });
      
      if (error) throw error;
      
      setAccEmail('');
      setAccPassword('');
      setAccBackupEmail('');
      setAccBackupPassword('');
      setAcc2Fa('');
      
      loadInventoryStats();
      onSuccess();
    } catch (err: any) {
      alert("Error adding account: " + err.message);
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
                      {linkStats.map((stat, idx) => {
                        const isEditing = editingIdx === idx;
                        return (
                          <div key={idx} className="bg-[#060b18] border border-white/5 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {isEditing ? (
                              <div className="flex-1 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end w-full">
                                <div className="flex-1">
                                  <label className="block text-[10px] uppercase tracking-wider opacity-50 mb-1">Invite Link URL</label>
                                  <input
                                    type="url"
                                    required
                                    value={editLinkUrl}
                                    onChange={e => setEditLinkUrl(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-black/40 text-sm font-mono text-white"
                                  />
                                </div>
                                <div className="w-full sm:w-24">
                                  <label className="block text-[10px] uppercase tracking-wider opacity-50 mb-1">Total Stock</label>
                                  <input
                                    type="number"
                                    required
                                    min={stat.sold}
                                    value={editLinkTotal}
                                    onChange={e => setEditLinkTotal(parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-black/40 text-sm font-bold text-center text-white"
                                    title={`Must be at least ${stat.sold} (number of sold slots)`}
                                  />
                                </div>
                                <div className="flex gap-2 shrink-0 pt-2 sm:pt-0 justify-end">
                                  <button
                                    onClick={() => handleSaveEdit(stat)}
                                    disabled={isUpdating}
                                    className="p-2 bg-green-500 hover:bg-green-600 rounded-lg text-[#060b18] transition-colors disabled:opacity-50"
                                    title="Save changes"
                                  >
                                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    disabled={isUpdating}
                                    className="p-2 border border-white/15 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex-1 min-w-0">
                                  <p className="font-mono text-sm text-(--sync-yellow) truncate mb-2">{stat.link}</p>
                                  <div className="flex gap-4 text-xs font-bold">
                                    <span className="flex items-center gap-1 opacity-70"><Box className="w-3 h-3" /> Total: {stat.total}</span>
                                    <span className="flex items-center gap-1 text-green-400"><CheckCircle className="w-3 h-3" /> Sold: {stat.sold}</span>
                                    <span className="flex items-center gap-1 text-blue-400"><Users className="w-3 h-3" /> Used: {stat.used}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end w-full md:w-auto">
                                  {/* Progress bar visual */}
                                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden flex shrink-0">
                                    <div className="h-full bg-blue-500" style={{ width: `${stat.total > 0 ? (stat.used / stat.total) * 100 : 0}%` }}></div>
                                    <div className="h-full bg-green-500 opacity-50" style={{ width: `${stat.total > 0 ? ((stat.sold - stat.used) / stat.total) * 100 : 0}%` }}></div>
                                  </div>

                                  {/* Edit/Delete Actions */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => handleStartEdit(idx, stat)}
                                      disabled={isUpdating}
                                      className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                                      title="Edit link or stock"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteLinkGroup(stat)}
                                      disabled={isUpdating || stat.availableIds.length === 0}
                                      className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-red-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                      title={stat.availableIds.length === 0 ? "No available slots to delete" : "Delete available stock"}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
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

                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Add New Account</h3>
                  <button 
                    onClick={() => setShowAccountsList(!showAccountsList)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    {showAccountsList ? 'Hide Accounts' : 'View Available Accounts'}
                  </button>
                </div>

                {showAccountsList ? (
                  <div className="mb-6 border border-white/10 rounded-xl overflow-hidden bg-[#060b18]">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                      <h4 className="font-bold text-sm">Available Accounts</h4>
                    </div>
                    {accountList.length === 0 ? (
                      <div className="p-8 text-center opacity-50 text-sm">No accounts available</div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto p-2 space-y-2">
                        {accountList.map((acc, idx) => (
                          <div key={idx} className="p-3 bg-black/40 rounded-lg border border-white/5 flex flex-col gap-1">
                            <div className="flex justify-between">
                              <span className="text-sm font-bold text-(--sync-yellow)">{acc.account_email}</span>
                            </div>
                            <div className="flex gap-4 text-xs opacity-60 items-center">
                              <span>Password: {revealedPasswords.has(idx) ? acc.account_password : '••••••••'}</span>
                              <button
                                type="button"
                                onClick={() => setRevealedPasswords(prev => { const n = new Set(prev); if (n.has(idx)) n.delete(idx); else n.add(idx); return n; })}
                                className="opacity-60 hover:opacity-100 transition-opacity"
                              >
                                {revealedPasswords.has(idx) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                              {acc.backup_email && <span>Backup: {acc.backup_email}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleAddAccountForm} className="space-y-4 bg-[#060b18] p-5 rounded-xl border border-white/5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs opacity-60 mb-1">Primary Email *</label>
                        <input 
                          required 
                          type="email" 
                          value={accEmail} 
                          onChange={e => setAccEmail(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-black/50 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs opacity-60 mb-1">Primary Password</label>
                        <input 
                          type="password" 
                          value={accPassword} 
                          onChange={e => setAccPassword(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-black/50 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs opacity-60 mb-1">Backup/Protection Email</label>
                        <input 
                          type="email" 
                          value={accBackupEmail} 
                          onChange={e => setAccBackupEmail(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-black/50 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs opacity-60 mb-1">Backup Password</label>
                        <input 
                          type="password" 
                          value={accBackupPassword} 
                          onChange={e => setAccBackupPassword(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-black/50 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs opacity-60 mb-1">2FA Secret Code</label>
                      <input 
                        type="text" 
                        value={acc2Fa} 
                        onChange={e => setAcc2Fa(e.target.value)}
                        placeholder="e.g. JBSWY3DPEHPK3PXP"
                        className="w-full px-4 py-2.5 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow)/50 bg-black/50 text-sm font-mono"
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <button 
                        type="submit"
                        disabled={isUpdating || !accEmail.trim()}
                        className="px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 w-full"
                        style={{ background: 'var(--sync-yellow)', color: '#060b18' }}
                      >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Save Account
                      </button>
                    </div>
                  </form>
                )}
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
