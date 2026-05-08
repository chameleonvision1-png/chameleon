"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSync } from '@/components/sync/SyncProviders';
import { useSyncAuth } from '@/components/sync/SyncAuthProvider';
import { createSyncClient } from '@/lib/sync/supabase-client';
import { 
  ShoppingBag, Wallet, Clock, Package, Settings, Bell, 
  LogOut, ChevronRight, Loader2, User, Copy, CheckCircle,
  AlertCircle, MessageSquare, ArrowLeft, CreditCard, PlusCircle
} from 'lucide-react';
import RechargeModal from '@/components/sync/RechargeModal';

type TabKey = 'overview' | 'orders' | 'subscriptions' | 'balance' | 'support' | 'notifications' | 'settings';

interface Order {
  id: string;
  order_number: string;
  total_usd: number;
  payment_method: string;
  status: string;
  created_at: string;
  order_items: any[];
}

interface BalanceTransaction {
  id: string;
  amount: number;
  type: string;
  admin_note: string | null;
  balance_after: number;
  created_at: string;
}

interface Notification {
  id: string;
  title_en: string;
  title_ar: string;
  message_en: string;
  message_ar: string;
  is_read: boolean;
  created_at: string;
}

export default function UserDashboard() {
  const { lang } = useSync();
  const { user, profile, isLoading: authLoading, signOut, refreshProfile } = useSyncAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    setIsDataLoading(true);
    const supabase = createSyncClient();

    const load = async () => {
      const [ordersRes, txRes, notifRes] = await Promise.all([
        supabase.from('orders')
          .select('*, order_items(*, plan:plans(*), inventory:plan_inventory(*))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase.from('balance_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      ]);

      if (ordersRes.data) setOrders(ordersRes.data);
      if (txRes.data) setTransactions(txRes.data);
      if (notifRes.data) setNotifications(notifRes.data);
      setIsDataLoading(false);
    };

    load();
  }, [user]);

  const copyCode = () => {
    if (profile?.user_code) {
      navigator.clipboard.writeText(profile.user_code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleActivateLink = async (inventoryId: string, link: string) => {
    setIsActivating(true);
    const supabase = createSyncClient();
    try {
      const { error } = await supabase
        .from('plan_inventory')
        .update({ status: 'used' })
        .eq('id', inventoryId);
        
      if (error) throw error;

      // Update local state so button immediately disables
      setOrders(prevOrders => 
        prevOrders.map(order => ({
          ...order,
          order_items: order.order_items.map(item => ({
            ...item,
            inventory: item.inventory?.map((inv: any) => 
              inv.id === inventoryId ? { ...inv, status: 'used' } : inv
            )
          }))
        }))
      );
      
      // Update selected order view
      if (selectedOrder) {
        setSelectedOrder((prev: any) => ({
          ...prev,
          order_items: prev.order_items.map((item: any) => ({
            ...item,
            inventory: item.inventory?.map((inv: any) => 
              inv.id === inventoryId ? { ...inv, status: 'used' } : inv
            )
          }))
        }));
      }

      window.open(link, '_blank');
    } catch (err: any) {
      alert("Error activating link: " + err.message);
    } finally {
      setIsActivating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--sync-bg)' }}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--sync-yellow)' }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center" style={{ background: 'var(--sync-bg)' }}>
        <User className="w-16 h-16 opacity-20 mb-6" />
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--sync-text-primary)' }}>
          {lang === 'ar' ? 'سجل دخولك أولاً' : 'Sign in to continue'}
        </h1>
        <Link href="/auth/login" className="px-8 py-4 rounded-xl font-bold text-lg" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>
          {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
        </Link>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    pending_payment: '#f59e0b',
    confirmed: '#22c55e',
    processing: '#3b82f6',
    delivered: '#8b5cf6',
    cancelled: '#ef4444',
  };

  const tabs: { key: TabKey; icon: React.ReactNode; label: string }[] = [
    { key: 'overview', icon: <Package className="w-4 h-4" />, label: lang === 'ar' ? 'نظرة عامة' : 'Overview' },
    { key: 'orders', icon: <ShoppingBag className="w-4 h-4" />, label: lang === 'ar' ? 'طلباتي' : 'My Orders' },
    { key: 'balance', icon: <Wallet className="w-4 h-4" />, label: lang === 'ar' ? 'رصيدي' : 'Balance' },
    { key: 'notifications', icon: <Bell className="w-4 h-4" />, label: lang === 'ar' ? 'الإشعارات' : 'Notifications' },
    { key: 'support', icon: <MessageSquare className="w-4 h-4" />, label: lang === 'ar' ? 'الدعم' : 'Support' },
    { key: 'settings', icon: <Settings className="w-4 h-4" />, label: lang === 'ar' ? 'الإعدادات' : 'Settings' },
  ];

  const pendingOrders = orders.filter(o => o.status === 'pending_payment').length;
  const confirmedOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'delivered').length;
  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen pt-24 pb-24" style={{ background: 'var(--sync-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black" style={{ color: 'var(--sync-text-primary)' }}>
              {lang === 'ar' ? `مرحبا، ${profile?.full_name || 'مستخدم'}` : `Welcome, ${profile?.full_name || 'User'}`}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm opacity-50">{lang === 'ar' ? 'كود الحساب:' : 'Account Code:'}</span>
              <button onClick={copyCode} className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-white/10 hover:border-(--sync-yellow)/30 transition-all text-sm font-mono">
                {profile?.user_code || '—'}
                {codeCopied ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 opacity-40" />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-5 py-3 rounded-xl border border-white/10" style={{ background: '#0d1530' }}>
              <p className="text-xs opacity-50 mb-1">{lang === 'ar' ? 'الرصيد' : 'Balance'}</p>
              <p className="text-2xl font-black" style={{ color: 'var(--sync-yellow)' }}>${Number(profile?.balance || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-60 shrink-0">
            <div className="rounded-2xl border border-white/10 overflow-hidden sticky top-28" style={{ background: '#0d1530' }}>
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-semibold transition-all text-left ${activeTab === tab.key ? 'bg-(--sync-yellow)/10 border-l-2 border-(--sync-yellow)' : 'hover:bg-white/5 border-l-2 border-transparent'}`}
                  style={{ color: activeTab === tab.key ? 'var(--sync-yellow)' : 'var(--sync-text-primary)' }}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.key === 'notifications' && unreadNotifications > 0 && (
                    <span className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              ))}
              <button onClick={signOut} className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-red-400 hover:bg-red-500/5 transition-all text-left border-l-2 border-transparent">
                <LogOut className="w-4 h-4" /> {lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {isDataLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--sync-yellow)' }} />
              </div>
            ) : (
              <>
                {/* OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { label: lang === 'ar' ? 'طلبات قيد المراجعة' : 'Pending Orders', value: pendingOrders, color: '#f59e0b', icon: <Clock className="w-5 h-5" /> },
                        { label: lang === 'ar' ? 'طلبات مكتملة' : 'Completed', value: confirmedOrders, color: '#22c55e', icon: <CheckCircle className="w-5 h-5" /> },
                        { label: lang === 'ar' ? 'الرصيد' : 'Balance', value: `$${Number(profile?.balance || 0).toFixed(2)}`, color: 'var(--sync-yellow)', icon: <Wallet className="w-5 h-5" /> },
                      ].map((stat, i) => (
                        <div key={i} className="rounded-xl border border-white/10 p-5" style={{ background: '#0d1530' }}>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs opacity-50">{stat.label}</span>
                            <span style={{ color: stat.color }}>{stat.icon}</span>
                          </div>
                          <p className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Recent Orders */}
                    <div className="rounded-xl border border-white/10 p-6" style={{ background: '#0d1530' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold" style={{ color: 'var(--sync-text-primary)' }}>
                          {lang === 'ar' ? 'آخر الطلبات' : 'Recent Orders'}
                        </h3>
                        <button onClick={() => setActiveTab('orders')} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--sync-yellow)' }}>
                          {lang === 'ar' ? 'عرض الكل' : 'View All'} <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      {orders.length === 0 ? (
                        <p className="text-sm opacity-40 py-8 text-center">{lang === 'ar' ? 'لا توجد طلبات بعد' : 'No orders yet'}</p>
                      ) : (
                        <div className="space-y-3">
                          {orders.slice(0, 5).map(order => (
                            <div 
                              key={order.id} 
                              onClick={() => { setSelectedOrder(order); setActiveTab('orders'); }}
                              className="flex items-center justify-between p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              <div>
                                <p className="text-sm font-bold" style={{ color: 'var(--sync-text-primary)' }}>#{order.order_number}</p>
                                <p className="text-xs opacity-40">{new Date(order.created_at).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold" style={{ color: 'var(--sync-yellow)' }}>${Number(order.total_usd).toFixed(2)}</p>
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${statusColor[order.status] || '#666'}20`, color: statusColor[order.status] || '#666' }}>
                                  {order.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ORDERS */}
                {activeTab === 'orders' && (
                  <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: '#0d1530' }}>
                    
                    {selectedOrder ? (
                      // ORDER DETAILS VIEW
                      <div>
                        <div className="p-6 border-b border-white/10 flex items-center gap-4">
                          <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                          </button>
                          <div>
                            <h2 className="text-lg font-bold" style={{ color: 'var(--sync-text-primary)' }}>
                              {lang === 'ar' ? `طلب #${selectedOrder.order_number}` : `Order #${selectedOrder.order_number}`}
                            </h2>
                            <p className="text-xs opacity-50">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                          </div>
                          <div className="ml-auto">
                            <span className="text-[12px] px-3 py-1 rounded-full font-bold" style={{ background: `${statusColor[selectedOrder.status] || '#666'}20`, color: statusColor[selectedOrder.status] || '#666' }}>
                              {selectedOrder.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="p-6 space-y-6">
                          <h3 className="font-bold opacity-60 text-sm mb-4 uppercase tracking-wider">{lang === 'ar' ? 'المنتجات' : 'Items Ordered'}</h3>
                          
                          {selectedOrder.order_items?.map((item: any) => (
                            <div key={item.id} className="rounded-xl border border-white/10 bg-[#080b14] overflow-hidden">
                              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-(--sync-yellow)" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-(--sync-text-primary)">{item.plan?.title_en || 'Product'}</p>
                                    <p className="text-xs opacity-50">Qty: {item.quantity} &times; ${item.unit_price_usd}</p>
                                  </div>
                                </div>
                                <p className="font-black text-lg text-(--sync-yellow)">${Number(item.quantity * item.unit_price_usd).toFixed(2)}</p>
                              </div>

                              {/* Delivery Data / Activation Steps */}
                              <div className="p-4 bg-white/2">
                                {item.delivery_type === 'invitation_link' && item.inventory && item.inventory.length > 0 && (
                                  <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4" /> Activation Steps
                                    </h4>
                                    <p className="text-xs opacity-70">
                                      {lang === 'ar' 
                                        ? 'اضغط على الزر بالأسفل لتفعيل اشتراكك وتوجيهك لرابط الدعوة. يرجى الملاحظة أن الرابط سيعمل مرة واحدة فقط للحد من الاستخدام الخاطئ.' 
                                        : 'Click the button below to activate your subscription and be redirected to the invite link. Note that the link will only work once to prevent misuse.'}
                                    </p>
                                    
                                    <div className="grid grid-cols-1 gap-3">
                                      {item.inventory.map((inv: any, idx: number) => (
                                        <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-black/20">
                                          <div>
                                            <p className="text-sm font-bold opacity-80">{lang === 'ar' ? `رابط الدعوة #${idx + 1}` : `Invitation Link #${idx + 1}`}</p>
                                            {inv.used_at && (
                                              <p className="text-[10px] text-red-400 font-bold mt-1">
                                                {lang === 'ar' ? 'تم الاستخدام في:' : 'Used on:'} {new Date(inv.used_at).toLocaleString()}
                                              </p>
                                            )}
                                          </div>
                                          <button
                                            disabled={!!inv.used_at || isActivating}
                                            onClick={() => handleActivateLink(inv.id, inv.invite_link)}
                                            className="px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:scale-105 active:scale-95"
                                            style={{ 
                                              background: inv.used_at ? '#333' : 'var(--sync-yellow)', 
                                              color: inv.used_at ? '#aaa' : '#0B132B' 
                                            }}
                                          >
                                            {isActivating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : inv.used_at ? (lang === 'ar' ? 'تم التفعيل' : 'Activated') : (lang === 'ar' ? 'تفعيل الآن' : 'Activate Now')}
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {item.delivery_type === 'ready_account' && item.inventory && item.inventory.length > 0 && (
                                  <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-green-400 flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4" /> Account Credentials
                                    </h4>
                                    <div className="grid grid-cols-1 gap-3">
                                      {item.inventory.map((inv: any, idx: number) => (
                                        <div key={inv.id} className="p-4 rounded-xl border border-white/10 bg-black/20 font-mono text-sm">
                                          <div className="flex justify-between mb-2">
                                            <span className="opacity-50">Email:</span>
                                            <span className="font-bold text-(--sync-yellow)">{inv.account_email}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="opacity-50">Password:</span>
                                            <span className="font-bold text-(--sync-yellow)">{inv.account_password}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {item.delivery_type === 'user_provides_email' && (
                                  <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-center">
                                    <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm font-bold text-blue-400">Processing Activation</p>
                                    <p className="text-xs opacity-70 mt-1">
                                      {lang === 'ar' ? 'سيتم تفعيل الاشتراك على الحساب الذي أدخلته خلال ساعات.' : 'Your subscription will be activated on the provided account shortly.'}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      // ORDERS LIST VIEW
                      <>
                        <div className="p-6 border-b border-white/10">
                          <h2 className="text-lg font-bold" style={{ color: 'var(--sync-text-primary)' }}>
                            {lang === 'ar' ? 'كل الطلبات' : 'All Orders'}
                          </h2>
                        </div>
                        {orders.length === 0 ? (
                          <p className="text-center py-16 opacity-40">{lang === 'ar' ? 'لا توجد طلبات' : 'No orders yet'}</p>
                        ) : (
                          <div className="divide-y divide-white/5">
                            {orders.map(order => (
                              <div 
                                key={order.id} 
                                onClick={() => setSelectedOrder(order)}
                                className="p-5 flex items-center justify-between gap-4 hover:bg-white/2 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${statusColor[order.status] || '#666'}15` }}>
                                    <ShoppingBag className="w-5 h-5" style={{ color: statusColor[order.status] || '#666' }} />
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm" style={{ color: 'var(--sync-text-primary)' }}>#{order.order_number}</p>
                                    <p className="text-xs opacity-40">{new Date(order.created_at).toLocaleString()} • {order.payment_method}</p>
                                  </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                  <p className="font-black text-lg" style={{ color: 'var(--sync-yellow)' }}>${Number(order.total_usd).toFixed(2)}</p>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${statusColor[order.status] || '#666'}20`, color: statusColor[order.status] || '#666' }}>
                                    {order.status.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* BALANCE */}
                {activeTab === 'balance' && (
                  <div className="space-y-6">
                    <div className="rounded-xl border border-white/10 p-6" style={{ background: '#0d1530' }}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div>
                          <p className="text-sm opacity-50 mb-1">{lang === 'ar' ? 'الرصيد الحالي' : 'Current Balance'}</p>
                          <div className="flex items-center gap-4">
                            <p className="text-5xl font-black" style={{ color: 'var(--sync-yellow)' }}>${Number(profile?.balance || 0).toFixed(2)}</p>
                            <Wallet className="w-8 h-8 opacity-20 hidden sm:block" />
                          </div>
                        </div>
                        <button 
                          onClick={() => setIsRechargeModalOpen(true)}
                          className="shrink-0 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,194,26,0.2)]" 
                          style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}
                        >
                          <PlusCircle className="w-5 h-5" />
                          {lang === 'ar' ? 'شحن الرصيد' : 'Top Up Balance'}
                        </button>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: '#0d1530' }}>
                      <div className="p-5 border-b border-white/10">
                        <h3 className="font-bold" style={{ color: 'var(--sync-text-primary)' }}>
                          {lang === 'ar' ? 'سجل العمليات' : 'Transaction History'}
                        </h3>
                      </div>
                      {transactions.length === 0 ? (
                        <p className="text-center py-16 opacity-40">{lang === 'ar' ? 'لا توجد عمليات' : 'No transactions yet'}</p>
                      ) : (
                        <div className="divide-y divide-white/5">
                          {transactions.map(tx => (
                            <div key={tx.id} className="p-4 flex items-center justify-between">
                              <div>
                                <p className="text-sm font-bold" style={{ color: 'var(--sync-text-primary)' }}>
                                  {tx.admin_note || tx.type}
                                </p>
                                <p className="text-xs opacity-40">{new Date(tx.created_at).toLocaleString()}</p>
                              </div>
                              <span className={`font-black text-lg ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {tx.amount >= 0 ? '+' : ''}{Number(tx.amount).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* NOTIFICATIONS */}
                {activeTab === 'notifications' && (
                  <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: '#0d1530' }}>
                    <div className="p-5 border-b border-white/10">
                      <h3 className="font-bold" style={{ color: 'var(--sync-text-primary)' }}>
                        {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
                      </h3>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-center py-16 opacity-40">{lang === 'ar' ? 'لا توجد إشعارات' : 'No notifications yet'}</p>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {notifications.map(notif => (
                          <div key={notif.id} className={`p-5 ${!notif.is_read ? 'bg-(--sync-yellow)/3' : ''}`}>
                            <div className="flex items-start gap-3">
                              <Bell className="w-4 h-4 mt-0.5 shrink-0" style={{ color: !notif.is_read ? 'var(--sync-yellow)' : undefined, opacity: notif.is_read ? 0.3 : 1 }} />
                              <div>
                                <p className="text-sm font-bold" style={{ color: 'var(--sync-text-primary)' }}>{lang === 'ar' ? notif.title_ar : notif.title_en}</p>
                                <p className="text-xs opacity-60 mt-1">{lang === 'ar' ? notif.message_ar : notif.message_en}</p>
                                <p className="text-[10px] opacity-30 mt-2">{new Date(notif.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SUPPORT */}
                {activeTab === 'support' && (
                  <div className="rounded-xl border border-white/10 p-8 text-center" style={{ background: '#0d1530' }}>
                    <MessageSquare className="w-16 h-16 mx-auto mb-6 opacity-20" />
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--sync-text-primary)' }}>
                      {lang === 'ar' ? 'الدعم الفني' : 'Support'}
                    </h3>
                    <p className="text-sm opacity-50 mb-6">
                      {lang === 'ar' ? 'للمساعدة تواصل معنا عبر الواتساب أو التلجرام' : 'Contact us via WhatsApp or Telegram for help'}
                    </p>
                    <div className="flex gap-4 justify-center">
                      <a href="https://wa.me/201000000000" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105" style={{ background: '#25d366', color: 'white' }}>WhatsApp</a>
                      <a href="https://t.me/chameleonvision" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105" style={{ background: '#0088cc', color: 'white' }}>Telegram</a>
                    </div>
                  </div>
                )}

                {/* SETTINGS */}
                {activeTab === 'settings' && (
                  <div className="rounded-xl border border-white/10 p-6 space-y-6" style={{ background: '#0d1530' }}>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--sync-text-primary)' }}>
                      {lang === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs opacity-50 block mb-1">{lang === 'ar' ? 'الاسم' : 'Name'}</label>
                        <input type="text" defaultValue={profile?.full_name || ''} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0a1128] outline-none focus:border-(--sync-yellow)/30 transition-colors" style={{ color: 'var(--sync-text-primary)' }} />
                      </div>
                      <div>
                        <label className="text-xs opacity-50 block mb-1">{lang === 'ar' ? 'الإيميل' : 'Email'}</label>
                        <input type="email" defaultValue={user.email || ''} disabled className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0a1128] opacity-50 cursor-not-allowed" style={{ color: 'var(--sync-text-primary)' }} />
                      </div>
                      <div>
                        <label className="text-xs opacity-50 block mb-1">{lang === 'ar' ? 'رقم الموبايل' : 'Phone'}</label>
                        <input type="tel" defaultValue={profile?.phone || ''} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0a1128] outline-none focus:border-(--sync-yellow)/30 transition-colors" style={{ color: 'var(--sync-text-primary)' }} />
                      </div>
                      <button className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>
                        {lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {user && (
        <RechargeModal 
          isOpen={isRechargeModalOpen} 
          onClose={() => setIsRechargeModalOpen(false)} 
          userId={user.id} 
        />
      )}
    </div>
  );
}
