"use client";
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { createSyncClient } from '@/lib/sync/supabase-client';
import { 
  Gift, Loader2, Plus, Copy, CheckCircle, XCircle, Trash2, 
  RefreshCw, Link as LinkIcon, Box, Tag, BarChart2, ExternalLink 
} from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  user_code: string | null;
  phone: string | null;
}

interface Plan {
  id: string;
  title_en: string;
  title_ar: string;
  product?: { name: string } | null;
}

interface GiftLink {
  id: string;
  plan_id: string;
  plan_inventory_id: string | null;
  reward_url: string;
  details: string | null;
  is_used: boolean;
  used_by: string | null;
  used_at: string | null;
  saved_by: string | null;
  saved_at: string | null;
  created_at: string;
  plan?: Plan | null;
  used_by_profile?: Profile | null;
  saved_by_profile?: Profile | null;
}

interface InviteLinkStat {
  invite_link: string;
  available: number;
  sold: number;
  used: number;
  total: number;
}

export default function AdminServiceLinksTab() {
  const [links, setLinks] = useState<GiftLink[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [availableInviteLinks, setAvailableInviteLinks] = useState<string[]>([]);
  
  // Stats and Filters
  const [totalAvailableStock, setTotalAvailableStock] = useState<number>(0);
  const [inviteLinkStats, setInviteLinkStats] = useState<InviteLinkStat[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'saved' | 'claimed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingInv, setIsLoadingInv] = useState(false);

  // Form State
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedInviteLink, setSelectedInviteLink] = useState('');
  const [details, setDetails] = useState('');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const fetchServiceLinks = async () => {
    setIsLoading(true);
    try {
      const supabase = createSyncClient();
      const { data, error } = await supabase
        .from('gift_links')
        .select(`
          *, 
          plan:plans(id, title_en, title_ar, product:products(name)),
          used_by_profile:profiles!gift_links_used_by_fkey(id, full_name, user_code, phone),
          saved_by_profile:profiles!gift_links_saved_by_fkey(id, full_name, user_code, phone)
        `)
        .not('plan_id', 'is', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLinks((data as any) || []);
    } catch (err: any) {
      toast.error('Error fetching service links: ' + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const supabase = createSyncClient();
      const { data, error } = await supabase
        .from('plans')
        .select('id, title_en, title_ar, product:products(name)')
        .eq('delivery_type', 'invitation_link')
        .eq('is_active', true);

      if (error) throw error;
      setPlans((data as any) || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchTotalAvailableStock = async () => {
    try {
      const supabase = createSyncClient();
      const { count, error } = await supabase
        .from('plan_inventory')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available')
        .not('invite_link', 'is', null);
      
      if (error) throw error;
      setTotalAvailableStock(count || 0);
    } catch (err: any) {
      console.error(err);
    }
  };

  const loadPlanInventory = async (planId: string) => {
    if (!planId) {
      setAvailableInviteLinks([]);
      return;
    }
    setIsLoadingInv(true);
    try {
      const supabase = createSyncClient();
      const { data, error } = await supabase
        .from('plan_inventory')
        .select('invite_link')
        .eq('plan_id', planId)
        .eq('status', 'available');

      if (error) throw error;

      const uniqueLinks = Array.from(
        new Set((data || []).map((item: { invite_link: string | null }) => item.invite_link).filter(Boolean))
      ) as string[];

      setAvailableInviteLinks(uniqueLinks);
      if (uniqueLinks.length > 0 && !selectedInviteLink) {
        setSelectedInviteLink(uniqueLinks[0]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingInv(false);
    }
  };

  const loadInviteLinkStats = async (planId: string) => {
    if (!planId) {
      setInviteLinkStats([]);
      return;
    }
    setIsLoadingStats(true);
    try {
      const supabase = createSyncClient();
      const { data, error } = await supabase
        .from('plan_inventory')
        .select('invite_link, status')
        .eq('plan_id', planId)
        .not('invite_link', 'is', null);

      if (error) throw error;

      const groups: Record<string, { invite_link: string; available: number; sold: number; used: number; total: number }> = {};
      (data || []).forEach((item: { invite_link: string | null; status: string | null }) => {
        const link = item.invite_link;
        if (!link) return;
        if (!groups[link]) {
          groups[link] = { invite_link: link, available: 0, sold: 0, used: 0, total: 0 };
        }
        groups[link].total += 1;
        if (item.status === 'available') {
          groups[link].available += 1;
        } else if (item.status === 'sold') {
          groups[link].sold += 1;
        } else if (item.status === 'used') {
          groups[link].used += 1;
        }
      });

      const statsArray = Object.values(groups).sort((a, b) => b.available - a.available);
      setInviteLinkStats(statsArray);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchServiceLinks(),
      fetchTotalAvailableStock(),
      selectedPlanId ? loadInviteLinkStats(selectedPlanId) : Promise.resolve(),
      selectedPlanId ? loadPlanInventory(selectedPlanId) : Promise.resolve()
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchServiceLinks();
    fetchPlans();
    fetchTotalAvailableStock();
  }, []);

  useEffect(() => {
    setSelectedInviteLink('');
    loadPlanInventory(selectedPlanId);
    loadInviteLinkStats(selectedPlanId);
  }, [selectedPlanId]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId || !selectedInviteLink) return;

    setIsGenerating(true);
    try {
      const supabase = createSyncClient();
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        toast.error('Authentication error: User not found.');
        return;
      }

      const { data, error } = await supabase
        .rpc('generate_service_gift_link', {
          p_plan_id: selectedPlanId,
          p_invite_link: selectedInviteLink,
          p_details: details || null,
          p_admin_id: userData.user.id
        });

      if (error) throw error;

      toast.success('Service link generated successfully!');
      setDetails('');
      setSelectedPlanId('');
      setSelectedInviteLink('');
      refreshData();
    } catch (err: any) {
      toast.error('Error generating service link: ' + err.message);
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link? This will return the invitation link back to the available plan stock if it has not been claimed yet.')) return;
    
    try {
      const supabase = createSyncClient();
      const { error } = await supabase.from('gift_links').delete().eq('id', id);
      if (error) throw error;
      toast.success('Service link deleted successfully!');
      refreshData();
    } catch (err: any) {
      toast.error('Error deleting link: ' + err.message);
      console.error(err);
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

  const filteredLinks = links.filter((link) => {
    // 1. Status Filter
    if (filterStatus === 'active') {
      if (link.is_used || link.saved_by) return false;
    } else if (filterStatus === 'saved') {
      if (link.is_used || !link.saved_by) return false;
    } else if (filterStatus === 'claimed') {
      if (!link.is_used) return false;
    }

    // 2. Search Query Filter
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    
    if (link.id.toLowerCase().includes(query)) return true;
    if (link.reward_url.toLowerCase().includes(query)) return true;
    if (link.details && link.details.toLowerCase().includes(query)) return true;
    if (link.plan?.title_en?.toLowerCase().includes(query)) return true;
    if (link.plan?.product?.name?.toLowerCase().includes(query)) return true;

    const usedProfile = link.used_by_profile;
    if (usedProfile) {
      if (usedProfile.full_name?.toLowerCase().includes(query)) return true;
      if (usedProfile.user_code?.toLowerCase().includes(query)) return true;
      if (usedProfile.phone?.toLowerCase().includes(query)) return true;
    }

    const savedProfile = link.saved_by_profile;
    if (savedProfile) {
      if (savedProfile.full_name?.toLowerCase().includes(query)) return true;
      if (savedProfile.user_code?.toLowerCase().includes(query)) return true;
      if (savedProfile.phone?.toLowerCase().includes(query)) return true;
    }

    return false;
  });

  return (
    <div className="space-y-8">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Service Links (لينكات الخدمات)</h1>
          <p className="opacity-60 text-sm mt-1">Generate one-time claim links tied to specific services and invitation links from stock.</p>
        </div>
        <button 
          onClick={refreshData}
          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl p-6 border border-white/5 relative overflow-hidden bg-[#0d1530]">
          <div className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10">
            <LinkIcon className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-xs uppercase tracking-widest opacity-50 mb-2 font-bold">Total Service Links</p>
          <p className="text-3xl font-black text-blue-400">{links.length}</p>
        </div>

        <div className="rounded-2xl p-6 border border-white/5 relative overflow-hidden bg-[#0d1530]">
          <div className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/10">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-xs uppercase tracking-widest opacity-50 mb-2 font-bold">Active Links</p>
          <p className="text-3xl font-black text-green-400">{links.filter(l => !l.is_used).length}</p>
        </div>

        <div className="rounded-2xl p-6 border border-white/5 relative overflow-hidden bg-[#0d1530]">
          <div className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10">
            <XCircle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-xs uppercase tracking-widest opacity-50 mb-2 font-bold">Claimed Links</p>
          <p className="text-3xl font-black text-red-400">{links.filter(l => l.is_used).length}</p>
        </div>

        <div className="rounded-2xl p-6 border border-white/5 relative overflow-hidden bg-[#0d1530]">
          <div className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-500/10">
            <Box className="w-5 h-5 text-(--sync-yellow)" />
          </div>
          <p className="text-xs uppercase tracking-widest opacity-50 mb-2 font-bold">Available Invite Stock</p>
          <p className="text-3xl font-black text-(--sync-yellow)">{totalAvailableStock}</p>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Generate Form (Col Span 5) */}
        <div className="lg:col-span-5 bg-[#0d1530] border border-white/5 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-(--sync-yellow)" />
              Generate New Service Link
            </h3>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-50">Select Service/Plan</label>
                <select
                  required
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow) bg-[#060b18] focus:border-opacity-50 text-sm"
                >
                  <option value="">-- Choose Plan --</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.product?.name} - {p.title_en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-50">
                  Select Invite Link (Available Stock)
                </label>
                {isLoadingInv ? (
                  <div className="h-[46px] flex items-center px-4 bg-[#060b18] border border-white/10 rounded-xl">
                    <Loader2 className="w-4 h-4 animate-spin text-(--sync-yellow) mr-2" />
                    <span className="text-xs opacity-50">Loading available stock...</span>
                  </div>
                ) : (
                  <select
                    required
                    disabled={!selectedPlanId || availableInviteLinks.length === 0}
                    value={selectedInviteLink}
                    onChange={(e) => setSelectedInviteLink(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow) bg-[#060b18] focus:border-opacity-50 text-sm disabled:opacity-50"
                  >
                    {!selectedPlanId ? (
                      <option value="">Choose a plan first</option>
                    ) : availableInviteLinks.length === 0 ? (
                      <option value="">No available invitation links in stock</option>
                    ) : (
                      availableInviteLinks.map((link) => (
                        <option key={link} value={link}>
                          {link}
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-50">Greeting / Instructions Details (Arabic/English)</label>
                <input 
                  type="text" 
                  placeholder="e.g. مبروك حصلت على اشتراك مجاني! متاح تفعيل الرابط مرة واحدة فقط..." 
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow) bg-[#060b18] focus:border-opacity-50 text-sm"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={isGenerating || !selectedPlanId || !selectedInviteLink}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl font-black text-[#0B132B] hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'var(--sync-yellow)' }}
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <LinkIcon className="w-5 h-5" />}
                  Generate Service Gift Link
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Invite Link Stats (Col Span 7) */}
        <div className="lg:col-span-7 bg-[#0d1530] border border-white/5 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex-1 flex flex-col">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-(--sync-yellow)" />
              Invite Links Stock Stats (إحصائيات روابط الدعوة)
            </h3>

            {!selectedPlanId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40 border border-dashed border-white/10 rounded-xl min-h-[250px]">
                <LinkIcon className="w-12 h-12 mb-3" />
                <p className="text-sm font-semibold">Please select a service/plan to view its invitation link stock statistics.</p>
                <p className="text-xs mt-1">برجاء اختيار خدمة لعرض إحصائيات روابط الدعوة الخاصة بها.</p>
              </div>
            ) : isLoadingStats ? (
              <div className="flex-1 flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-(--sync-yellow)" />
              </div>
            ) : inviteLinkStats.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40 border border-dashed border-white/10 rounded-xl min-h-[250px]">
                <XCircle className="w-12 h-12 mb-3 text-red-400" />
                <p className="text-sm font-semibold">No invitation links found in stock for this plan.</p>
                <p className="text-xs mt-1">لا توجد روابط دعوة مضافة لمخزون هذه الخدمة بعد.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {inviteLinkStats.map((stat) => {
                  const total = stat.total;
                  const availPct = (stat.available / total) * 100;
                  const soldPct = (stat.sold / total) * 100;
                  const usedPct = (stat.used / total) * 100;
                  
                  return (
                    <div key={stat.invite_link} className="p-4 rounded-xl bg-[#060b18] border border-white/5 hover:border-white/10 transition-all space-y-3 relative">
                      <div className="flex items-start justify-between gap-4">
                        <div className="truncate flex-1">
                          <span className="text-xs font-mono font-semibold text-(--sync-yellow) block truncate select-all" title={stat.invite_link}>
                            {stat.invite_link}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(stat.invite_link);
                              toast.success('Link copied to clipboard!');
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                            title="Copy Invite Link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={stat.available === 0}
                            onClick={() => setSelectedInviteLink(stat.invite_link)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              selectedInviteLink === stat.invite_link
                                ? 'bg-(--sync-yellow) text-black font-black'
                                : stat.available === 0
                                  ? 'opacity-30 cursor-not-allowed bg-white/5 text-white/40'
                                  : 'bg-white/5 hover:bg-white/10 text-white hover:text-(--sync-yellow)'
                            }`}
                          >
                            {selectedInviteLink === stat.invite_link ? 'Selected' : 'Use Link'}
                          </button>
                        </div>
                      </div>
                      
                      {/* Progress bar split */}
                      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden flex">
                        <div className="bg-green-500 h-full transition-all" style={{ width: `${availPct}%` }} title={`Available: ${stat.available}`} />
                        <div className="bg-yellow-500 h-full transition-all" style={{ width: `${soldPct}%` }} title={`Reserved: ${stat.sold}`} />
                        <div className="bg-red-500 h-full transition-all" style={{ width: `${usedPct}%` }} title={`Claimed/Used: ${stat.used}`} />
                      </div>
                      
                      {/* Detailed counts */}
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="opacity-50 text-[10px]">متاح:</span>
                            <span className="text-green-400">{stat.available}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-yellow-500" />
                            <span className="opacity-50 text-[10px]">محجوز:</span>
                            <span className="text-yellow-400">{stat.sold}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="opacity-50 text-[10px]">مستعمل:</span>
                            <span className="text-red-400">{stat.used}</span>
                          </span>
                        </div>
                        <div className="opacity-40">
                          Total Stock: {stat.total}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* History List */}
      <div className="bg-[#0d1530] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Tag className="w-5 h-5 text-(--sync-yellow)" />
            Generated Links History
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
            {/* Status Filter Tabs */}
            <div className="flex gap-2 bg-[#060b18] p-1 rounded-xl border border-white/5 overflow-x-auto w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  filterStatus === 'all' 
                    ? 'bg-[rgba(255,194,26,0.15)] text-[#ffc21a]' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                All ({links.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  filterStatus === 'active' 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Active ({links.filter(l => !l.is_used && !l.saved_by).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('saved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  filterStatus === 'saved' 
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Saved ({links.filter(l => !l.is_used && l.saved_by).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('claimed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  filterStatus === 'claimed' 
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Claimed ({links.filter(l => l.is_used).length})
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64 shrink-0">
              <input 
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-xl border border-white/10 outline-none focus:border-(--sync-yellow) bg-[#060b18] text-xs"
              />
              <svg className="w-3.5 h-3.5 absolute right-3 top-3 opacity-40 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[800px] text-sm text-left">
            <thead>
              <tr className="border-b border-white/5 opacity-60">
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Service / Plan</th>
                <th className="p-4 font-semibold">One-Time Claim Link</th>
                <th className="p-4 font-semibold">Assigned User Account</th>
                <th className="p-4 font-semibold">Original Invite Link</th>
                <th className="p-4 font-semibold">Created</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" />
                  </td>
                </tr>
              ) : filteredLinks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center opacity-50 italic">
                    No matching service gift links found.
                  </td>
                </tr>
              ) : (
                filteredLinks.map((link) => (
                  <tr key={link.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="p-4">
                      {link.is_used ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 text-[10px] font-bold uppercase border border-red-500/10">
                          <XCircle className="w-3 h-3" /> Claimed
                        </span>
                      ) : link.saved_by ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase border border-blue-500/10">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg> Saved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-500/10 text-green-400 text-[10px] font-bold uppercase border border-green-500/10">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">
                        {link.plan?.product?.name || 'Unknown Service'}
                      </div>
                      <div className="text-xs opacity-50 mt-0.5">
                        {link.plan?.title_en || 'Unknown Plan'}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-(--sync-yellow)">
                      {window.location.origin.includes('localhost')
                        ? `http://sync.localhost:3000/g/${link.id}`
                        : `https://sync.chameleon.vision/g/${link.id}`}
                    </td>
                    <td className="p-4">
                      {link.is_used && link.used_by_profile ? (
                        <div className="space-y-0.5">
                          <p className="font-bold text-white/90">{link.used_by_profile.full_name}</p>
                          <p className="text-xs font-mono text-(--sync-yellow)">{link.used_by_profile.user_code}</p>
                          {link.used_by_profile.phone && <p className="text-[10px] opacity-40">{link.used_by_profile.phone}</p>}
                        </div>
                      ) : link.saved_by && link.saved_by_profile ? (
                        <div className="space-y-0.5">
                          <p className="font-bold text-white/80">{link.saved_by_profile.full_name}</p>
                          <p className="text-xs font-mono text-blue-400">{link.saved_by_profile.user_code}</p>
                          {link.saved_by_profile.phone && <p className="text-[10px] opacity-40">{link.saved_by_profile.phone}</p>}
                        </div>
                      ) : (
                        <span className="opacity-30">—</span>
                      )}
                    </td>
                    <td className="p-4 max-w-[180px] truncate opacity-60" title={link.reward_url}>
                      {link.reward_url}
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
                        title="Delete Service Link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
