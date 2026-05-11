"use client";

import React, { useState, useEffect } from 'react';
import { createSyncClient } from '@/lib/sync/supabase-client';
import { Gift, Loader2, Plus, Copy, CheckCircle, XCircle, Trash2, ExternalLink, RefreshCw } from 'lucide-react';

export default function AdminGiftsTab() {
  const [links, setLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [rewardUrl, setRewardUrl] = useState('');
  const [details, setDetails] = useState('');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const supabase = createSyncClient();
      const { data, error } = await supabase
        .from('gift_links')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLinks(data || []);
    } catch (err: any) {
      alert('Error fetching links: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardUrl) return;

    setIsGenerating(true);
    try {
      const supabase = createSyncClient();
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        alert('Authentication error: User not found.');
        return;
      }

      const { error } = await supabase
        .from('gift_links')
        .insert({
          reward_url: rewardUrl,
          details: details,
          created_by: userData.user.id
        });

      if (error) throw error;

      setRewardUrl('');
      setDetails('');
      fetchLinks();
    } catch (err: any) {
      alert('Error generating link: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    
    try {
      const supabase = createSyncClient();
      const { error } = await supabase.from('gift_links').delete().eq('id', id);
      if (error) throw error;
      fetchLinks();
    } catch (err: any) {
      alert('Error deleting link: ' + err.message);
    }
  };

  const copyToClipboard = (id: string) => {
    const baseUrl = window.location.origin.includes('localhost') 
      ? 'http://sync.localhost:3000' 
      : 'https://sync.chameleon.vision';
    const link = `${baseUrl}/g/${id}`;
    
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopyStatus(id);
        setTimeout(() => setCopyStatus(null), 2000);
      })
      .catch(() => {
        setCopyStatus('error');
        setTimeout(() => setCopyStatus(null), 2000);
      });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Gift Links (هدايا)</h1>
          <p className="opacity-60 text-sm mt-1">Generate one-time use links for rewards and giveaways.</p>
        </div>
        <button 
          onClick={fetchLinks}
          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Generate Form */}
      <div className="bg-[#0d1530] border border-white/5 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-(--sync-yellow)" />
          Generate New Gift Link
        </h3>
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider opacity-50">Reward URL (The prize link)</label>
            <input 
              type="url" 
              placeholder="https://example.com/gift-code" 
              required
              value={rewardUrl}
              onChange={(e) => setRewardUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow) bg-[#060b18] focus:border-opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider opacity-50">Instructions / Details (Arabic/English)</label>
            <input 
              type="text" 
              placeholder="مبروك كسبت معانا! سجل هنا..." 
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow) bg-[#060b18] focus:border-opacity-50"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button 
              type="submit" 
              disabled={isGenerating}
              className="px-8 py-3 rounded-xl font-black text-[#0B132B] hover:opacity-90 transition-all flex items-center gap-2" 
              style={{ background: 'var(--sync-yellow)' }}
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Gift className="w-5 h-5" />}
              Generate Link
            </button>
          </div>
        </form>
      </div>

      {/* Links List */}
      <div className="bg-[#0d1530] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-white/5 opacity-60">
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Reward Link</th>
              <th className="p-4 font-semibold">Details</th>
              <th className="p-4 font-semibold">Created</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" />
                </td>
              </tr>
            ) : links.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center opacity-50 italic">
                  No gift links generated yet.
                </td>
              </tr>
            ) : links.map((link) => (
              <tr key={link.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="p-4">
                  {link.is_used ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/10 text-red-400 text-[10px] font-bold uppercase">
                      <XCircle className="w-3 h-3" /> Used
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-[10px] font-bold uppercase">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  )}
                </td>
                <td className="p-4 max-w-[200px] truncate opacity-80">
                  {link.reward_url}
                </td>
                <td className="p-4 max-w-[200px] truncate opacity-60">
                  {link.details || '—'}
                </td>
                <td className="p-4 opacity-50 text-xs">
                  {new Date(link.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-right flex items-center justify-end gap-2">
                  <button 
                    onClick={() => copyToClipboard(link.id)}
                    className={`p-2 rounded-lg transition-all ${copyStatus === link.id ? 'bg-green-500/20 text-green-400' : 'bg-white/5 hover:bg-white/10'}`}
                    title="Copy Share Link"
                  >
                    {copyStatus === link.id ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleDelete(link.id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
