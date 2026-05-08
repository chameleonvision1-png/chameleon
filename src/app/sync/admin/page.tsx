"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSyncAuth } from '@/components/sync/SyncAuthProvider';
import { createSyncClient } from '@/lib/sync/supabase-client';
import { 
  LayoutDashboard, Package, Users, ShoppingCart, CreditCard, 
  Tag, Bell, Settings, LogOut, Loader2, TrendingUp, 
  DollarSign, UserCheck, ShoppingBag, ChevronRight, Eye, CheckCircle, X, Plus, AlertCircle, Image as ImageIcon
} from 'lucide-react';
import AdminProductsTab from '@/components/sync/admin/AdminProductsTab';
import AdminCurrenciesTab from '@/components/sync/admin/AdminCurrenciesTab';
import AdminFinanceTab from '@/components/sync/admin/AdminFinanceTab';
import AdminUserModal from '@/components/sync/admin/AdminUserModal';

interface DashboardStats {
  totalProducts: number;
  totalPlans: number;
  totalUsers: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

type ActiveTab = 'overview' | 'products' | 'users' | 'orders' | 'currencies' | 'finance';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, profile, isAdmin, isLoading: authLoading, signOut } = useSyncAuth();
  const [stats, setStats] = useState<DashboardStats>({ totalProducts: 0, totalPlans: 0, totalUsers: 0, totalOrders: 0, pendingOrders: 0, totalRevenue: 0 });
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
    error?: string;
  } | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace('/sync/auth/login');
    }
  }, [authLoading, user, isAdmin, router]);

  const fetchDashboardData = useCallback(async () => {
    if (!user || !isAdmin) return;
    const supabase = createSyncClient();

    const [productsRes, plansRes, usersRes, ordersRes] = await Promise.all([
      supabase.from('products').select('id, name, slug, is_active, sort_order, cover_image_url, category:categories(name_en)').order('is_active', { ascending: false }).order('sort_order'),
      supabase.from('plans').select('id').eq('is_active', true),
      supabase.from('profiles').select('id, full_name, role, balance, created_at').order('created_at', { ascending: false }),
      supabase.from('orders').select('id, order_number, total_usd, status, payment_status, payment_method, payment_proof_url, created_at, user_id, order_items(id, quantity, unit_price_usd, delivery_type, delivery_status, plan_id, plan:plans(id, title_en, product:products(name)))').order('created_at', { ascending: false }).limit(50),
    ]);

    if (ordersRes.error) console.error("Admin Orders Fetch Error:", ordersRes.error);


    const prods = productsRes.data || [];
    const usrs = usersRes.data || [];
    const ords = ordersRes.data || [];

    // Map storage urls and users
    for (const ord of ords) {
      if (ord.payment_proof_url) {
        const { data } = supabase.storage.from('payment-proofs').getPublicUrl(ord.payment_proof_url);
        (ord as any).public_proof_url = data.publicUrl;
      }
      const matchedUser = usrs.find((u: any) => u.id === ord.user_id);
      (ord as any).user = matchedUser || { full_name: 'Unknown User' };
    }

    setProducts(prods);
    setUsers(usrs);
    setOrders(ords);
    setStats({
      totalProducts: prods.length,
      totalPlans: (plansRes.data || []).length,
      totalUsers: usrs.length,
      totalOrders: ords.length,
      pendingOrders: ords.filter((o: any) => o.status === 'pending_payment' || o.status === 'payment_review').length,
      totalRevenue: ords.filter((o: any) => o.status === 'delivered').reduce((sum: number, o: any) => sum + Number(o.total_usd || 0), 0),
    });
    setIsDataLoading(false);
  }, [user, isAdmin]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/sync/auth/login');
  };

  const handleApproveOrder = (order: any) => {
    setConfirmModal({
      title: 'Approve Payment',
      message: `Are you sure you want to approve payment for Order #${order.order_number}?`,
      onConfirm: async () => {
        setIsUpdating(true);
        const supabase = createSyncClient();
        try {
          const { error } = await supabase
            .from('orders')
            .update({ status: 'processing', payment_status: 'confirmed' })
            .eq('id', order.id);

          if (error) throw error;

          // Allocate inventory for this order now that payment is confirmed
          const { error: allocError } = await supabase.rpc('allocate_inventory_for_order', {
            p_order_id: order.id
          });
          
          if (allocError) {
            console.error("Allocation error:", allocError);
            alert("Payment approved, but there was an issue allocating inventory: " + allocError.message);
          }

          // Notification
          await supabase.from('notifications').insert({
            user_id: order.user?.id,
            title_en: 'Payment Confirmed',
            title_ar: 'تم تأكيد الدفع',
            message_en: `Your payment for order #${order.order_number} has been confirmed. It is now processing.`,
            message_ar: `تم تأكيد الدفع لطلبك رقم #${order.order_number}. جاري التجهيز.`,
            is_read: false
          });

          setSelectedOrder(null);
          fetchDashboardData();
        } catch (err: any) {
          alert(err.message);
        } finally {
          setIsUpdating(false);
          setConfirmModal(null);
        }
      }
    });
  };

  const handleCancelAndRefundOrder = (order: any) => {
    const isExternalPayment = order.payment_method !== 'balance';
    const message = isExternalPayment
      ? `Are you sure you want to cancel Order #${order.order_number}? \n\nNote: The user paid via ${order.payment_method}. Refunding will add $${order.total_usd} to their in-app balance.`
      : `Are you sure you want to cancel Order #${order.order_number} and refund $${order.total_usd} to the user's balance?`;

    setConfirmModal({
      title: 'Cancel & Refund Order',
      message,
      isDestructive: true,
      onConfirm: async () => {
        setIsUpdating(true);
        try {
          const supabase = createSyncClient();

          // Update order status to cancelled
          const { error: orderError } = await supabase
            .from('orders')
            .update({ status: 'cancelled', payment_status: 'rejected' })
            .eq('id', order.id);
            
          if (orderError) throw new Error("Order update failed: " + orderError.message);

          // Return inventory to available pool
          await supabase.rpc('deallocate_inventory_for_order', { p_order_id: order.id });

          // We don't update order_items delivery_status because 'cancelled' is not a valid enum value for delivery_item_status
          // The parent order status being 'cancelled' is enough.

          // Add balance back to user
          if (order.user_id && Number(order.total_usd) > 0) {
            const { error: refundError } = await supabase.rpc('update_user_balance', {
              p_user_id: order.user_id,
              p_amount: Number(order.total_usd),
              p_type: 'admin_adjust',
              p_admin_note: `Refund for Order #${order.order_number}`,
            });
            if (refundError) throw new Error("Refund failed: " + refundError.message);
          }

          // Send notification
          const { error: notifError } = await supabase.from('notifications').insert({
            user_id: order.user_id,
            title_en: 'Order Cancelled & Refunded',
            title_ar: 'تم إلغاء الطلب واسترداد المبلغ',
            message_en: `Your order #${order.order_number} has been cancelled and $${order.total_usd} has been refunded to your balance.`,
            message_ar: `تم إلغاء طلبك رقم #${order.order_number} وتم استرداد مبلغ $${order.total_usd} إلى رصيدك.`,
            is_read: false
          });

          if (notifError) throw new Error("Notification failed: " + notifError.message);

          setSelectedOrder(null);
          await fetchDashboardData();
          setConfirmModal({
            title: 'Success',
            message: `Order #${order.order_number} has been cancelled and $${order.total_usd} refunded to the user.`,
            isDestructive: false,
            onConfirm: () => setConfirmModal(null)
          });
        } catch (err: any) {
          setConfirmModal((prev: any) => ({
            ...prev,
            error: err.message || 'An unknown error occurred while canceling the order.',
          }));
        } finally {
          setIsUpdating(false);
        }
      }
    });
  };

  const handleMarkDelivered = (order: any) => {
    setConfirmModal({
      title: 'Mark Order as Delivered',
      message: `Are you sure you want to mark Order #${order.order_number} as delivered? \n\nIf there are any pending digital items (Invite Links or Ready Accounts), the system will attempt to auto-allocate them now. For manual plans, ensure you have delivered the service before proceeding.`,
      isDestructive: false,
      onConfirm: async () => {
        setIsUpdating(true);
        try {
          const supabase = createSyncClient();

          // Attempt to auto-allocate any pending digital items
          const { error: allocError } = await supabase.rpc('allocate_inventory_for_order', {
            p_order_id: order.id
          });

          if (allocError) {
            console.error("Allocation error:", allocError);
            throw new Error("Failed to allocate digital inventory: " + allocError.message);
          }

          // Update order status
          const { error: orderError } = await supabase
            .from('orders')
            .update({ status: 'delivered' })
            .eq('id', order.id);

          if (orderError) throw new Error("Status update failed: " + orderError.message);

          // Also update all manual order_items to delivered
          await supabase
            .from('order_items')
            .update({ delivery_status: 'delivered' })
            .eq('order_id', order.id)
            .eq('delivery_status', 'pending');

          // Send notification
          const { error: notifError } = await supabase.from('notifications').insert({
            user_id: order.user_id,
            title_en: 'Order Delivered',
            title_ar: 'تم تسليم الطلب',
            message_en: `Your order #${order.order_number} has been delivered. Check your dashboard for details.`,
            message_ar: `تم تسليم طلبك رقم #${order.order_number}. يمكنك مراجعة التفاصيل في لوحة التحكم.`,
            is_read: false
          });

          if (notifError) throw new Error("Notification failed: " + notifError.message);

          setSelectedOrder(null);
          await fetchDashboardData();
          setConfirmModal({
            title: 'Success',
            message: `Order #${order.order_number} has been successfully marked as delivered.`,
            isDestructive: false,
            onConfirm: () => setConfirmModal(null)
          });
        } catch (err: any) {
          setConfirmModal((prev: any) => ({
            ...prev,
            error: err.message || 'An unknown error occurred.',
          }));
        } finally {
          setIsUpdating(false);
        }
      }
    });
  };


  if (authLoading || (!user || !isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--sync-bg)' }}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--sync-yellow)' }} />
      </div>
    );
  }

  const sidebarItems = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'finance' as const, label: 'Finance & Topups', icon: CreditCard },
    { id: 'products' as const, label: 'Products', icon: Package },
    { id: 'currencies' as const, label: 'Currencies', icon: DollarSign },
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'orders' as const, label: 'Orders', icon: ShoppingCart },
  ];

  const statCards = [
    { label: 'Products', value: stats.totalProducts, icon: Package, color: '#ffc21a' },
    { label: 'Plans', value: stats.totalPlans, icon: Tag, color: '#22d3ee' },
    { label: 'Users', value: stats.totalUsers, icon: UserCheck, color: '#a78bfa' },
    { label: 'Orders', value: stats.totalOrders, icon: ShoppingBag, color: '#34d399' },
    { label: 'Pending', value: stats.pendingOrders, icon: CreditCard, color: '#fb923c' },
    { label: 'Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: '#4ade80' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#060b18', color: '#e2e8f0', paddingTop: '80px' }}>
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-white/5 p-6 flex flex-col gap-2 sticky top-[80px] h-[calc(100vh-80px)]" style={{ background: '#0a1128' }}>
        <div className="mb-6">
          <h2 className="text-lg font-black tracking-wider" style={{ color: 'var(--sync-yellow)' }}>SYNC ADMIN</h2>
          <p className="text-xs opacity-50 mt-1">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{ background: 'rgba(255,194,26,0.15)', color: 'var(--sync-yellow)' }}>
            {profile?.role}
          </span>
        </div>

        {sidebarItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 w-full text-left ${
              activeTab === item.id 
                ? 'bg-[rgba(255,194,26,0.1)] text-[#ffc21a]' 
                : 'text-white/60 hover:text-white/90 hover:bg-white/5'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}

        <div className="mt-auto">
          <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all w-full">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {isDataLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--sync-yellow)' }} />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <h1 className="text-3xl font-black">Dashboard Overview</h1>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {statCards.map(card => (
                    <div key={card.label} className="rounded-2xl p-6 border border-white/5 relative overflow-hidden" style={{ background: '#0d1530' }}>
                      <div className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                        <card.icon className="w-5 h-5" style={{ color: card.color }} />
                      </div>
                      <p className="text-xs uppercase tracking-widest opacity-50 mb-2">{card.label}</p>
                      <p className="text-3xl font-black" style={{ color: card.color }}>{card.value}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Orders */}
                <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: '#0d1530' }}>
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-bold text-lg">Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-xs font-bold flex items-center gap-1 hover:underline" style={{ color: 'var(--sync-yellow)' }}>
                      View All <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  {orders.length === 0 ? (
                    <p className="p-6 text-center opacity-50">No orders yet</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-white/5 text-left opacity-60">
                        <th className="p-4 font-semibold">Order</th><th className="p-4">User</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4">Date</th>
                      </tr></thead>
                      <tbody>
                        {orders.slice(0, 5).map((order: any) => (
                          <tr key={order.id} className="border-b border-white/5 hover:bg-white/2">
                            <td className="p-4 font-mono text-xs">#{order.order_number || order.id.slice(0,8)}</td>
                            <td className="p-4">{(order.user as any)?.full_name || '—'}</td>
                            <td className="p-4 font-bold" style={{ color: 'var(--sync-yellow)' }}>${Number(order.total_usd).toFixed(2)}</td>
                            <td className="p-4"><StatusBadge status={order.status} /></td>
                            <td className="p-4 opacity-60">{new Date(order.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <AdminProductsTab products={products} onRefresh={fetchDashboardData} />
            )}

            {/* Currencies Tab */}
            {activeTab === 'currencies' && <AdminCurrenciesTab />}

            {/* Finance Tab */}
            {activeTab === 'finance' && (
              <AdminFinanceTab onViewUser={(userId) => setSelectedUser({ id: userId })} />
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-black">Users ({users.length})</h1>
                <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: '#0d1530' }}>
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/5 text-left opacity-60">
                      <th className="p-4">Name</th><th className="p-4">Role</th><th className="p-4">Balance</th><th className="p-4">Joined</th><th className="p-4 text-right">Actions</th>
                    </tr></thead>
                    <tbody>
                      {users.map((u: any) => (
                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors" onClick={() => setSelectedUser(u)}>
                          <td className="p-4 font-bold">{u.full_name || '—'}</td>
                          <td className="p-4"><RoleBadge role={u.role} /></td>
                          <td className="p-4 font-bold" style={{ color: 'var(--sync-yellow)' }}>${Number(u.balance || 0).toFixed(2)}</td>
                          <td className="p-4 opacity-60">{new Date(u.created_at).toLocaleDateString()}</td>
                          <td className="p-4 text-right">
                            <button onClick={() => setSelectedUser(u)} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors bg-white/5 hover:bg-white/10 inline-flex items-center gap-1">
                              <Plus className="w-3 h-3" /> Details / Balance
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-black">Orders ({orders.length})</h1>
                {orders.length === 0 ? (
                  <div className="rounded-2xl border border-white/5 p-12 text-center" style={{ background: '#0d1530' }}>
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg opacity-50">No orders yet</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: '#0d1530' }}>
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-white/5 text-left opacity-60">
                        <th className="p-4">ID</th><th className="p-4">User</th><th className="p-4">Amount</th><th className="p-4">Method</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th>
                      </tr></thead>
                      <tbody>
                        {orders.map((order: any) => (
                          <tr key={order.id} className="border-b border-white/5 hover:bg-white/2">
                            <td className="p-4 font-mono text-xs">#{order.order_number || order.id.slice(0, 8)}</td>
                            <td className="p-4">{(order.user as any)?.full_name || '—'}</td>
                            <td className="p-4 font-bold" style={{ color: 'var(--sync-yellow)' }}>${Number(order.total_usd).toFixed(2)}</td>
                            <td className="p-4 opacity-60 capitalize">{order.payment_method}</td>
                            <td className="p-4"><StatusBadge status={order.status} /></td>
                            <td className="p-4 text-right">
                              <button onClick={() => setSelectedOrder(order)} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors bg-white/5 hover:bg-(--sync-yellow)/20 hover:text-(--sync-yellow) inline-flex">
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl relative" style={{ background: '#0a1128', color: '#e2e8f0' }}>
            <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 opacity-50 hover:opacity-100">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Order #{selectedOrder.order_number || selectedOrder.id.slice(0,8)}</h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="opacity-50">User</span>
                <span className="font-bold">{(selectedOrder.user as any)?.full_name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="opacity-50">Total Amount</span>
                <span className="font-bold" style={{ color: 'var(--sync-yellow)' }}>${Number(selectedOrder.total_usd).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="opacity-50">Payment Method</span>
                <span className="capitalize">{selectedOrder.payment_method}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="opacity-50">Payment Status</span>
                <span><StatusBadge status={selectedOrder.payment_status} /></span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="opacity-50">Order Status</span>
                <span><StatusBadge status={selectedOrder.status} /></span>
              </div>

              {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                <div className="mt-4 border border-white/10 rounded-xl p-4 bg-white/5">
                  <h3 className="font-bold mb-3 text-(--sync-yellow)">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.order_items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold">{item.plan?.product?.name || 'Unknown Product'} - {item.plan?.title_en || 'Unknown Plan'}</p>
                          <p className="opacity-50 mt-1">Qty: {item.quantity} • Type: {item.delivery_type?.replace(/_/g, ' ') || 'unknown'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-(--sync-yellow)">${Number(item.unit_price_usd).toFixed(2)}</p>
                          <StatusBadge status={item.delivery_status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedOrder.payment_method !== 'balance' && (
                <div className="mt-4">
                  <p className="opacity-50 mb-2">Payment Proof</p>
                  {selectedOrder.public_proof_url ? (
                    <a href={selectedOrder.public_proof_url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-all">
                      <img src={selectedOrder.public_proof_url} alt="Proof" className="w-full h-48 object-cover" />
                    </a>
                  ) : (
                    <div className="h-48 rounded-lg border border-white/5 bg-white/5 flex flex-col items-center justify-center opacity-50">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <p>No proof uploaded</p>
                    </div>
                  )}
                </div>
              )}

              {selectedOrder.status === 'pending_payment' && (
                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => handleApproveOrder(selectedOrder)}
                    disabled={isUpdating}
                    className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'var(--sync-yellow)', color: '#060b18' }}
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Approve Payment
                  </button>
                </div>
              )}
              
              {selectedOrder.status === 'processing' && (
                <div className="pt-2 flex gap-3">
                  <button 
                    onClick={() => handleMarkDelivered(selectedOrder)}
                    disabled={isUpdating}
                    className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-colors border border-green-500/20 disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                    Mark as Delivered
                  </button>
                </div>
              )}
              
              {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                <div className="pt-2 flex gap-3">
                  <button 
                    onClick={() => handleCancelAndRefundOrder(selectedOrder)}
                    disabled={isUpdating}
                    className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors border border-red-500/20 disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    Cancel & Refund
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Balance / User Details Modal */}
      {selectedUser && (
        <AdminUserModal 
          userId={selectedUser.id} 
          onClose={() => setSelectedUser(null)} 
          onBalanceUpdated={fetchDashboardData}
        />
      )}
      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" style={{ zIndex: 99999 }}>
          <div className="w-full max-w-sm rounded-2xl border border-white/10 shadow-2xl p-6" style={{ background: '#0a1128', color: '#e2e8f0' }}>
            <div className="flex items-center gap-3 mb-4">
              {confirmModal.isDestructive ? <AlertCircle className="w-6 h-6 text-red-500" /> : <AlertCircle className="w-6 h-6 text-yellow-500" />}
              <h3 className="text-xl font-bold">{confirmModal.title}</h3>
            </div>
            <p className="opacity-70 mb-6">{confirmModal.message}</p>
            {confirmModal.error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono overflow-auto max-h-32">
                {confirmModal.error}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(null)} disabled={isUpdating} className="flex-1 py-3 rounded-xl font-bold hover:bg-white/5 transition-colors border border-white/10 disabled:opacity-50">
                {confirmModal.error ? 'Close' : 'Cancel'}
              </button>
              {!confirmModal.error && (
                <button onClick={confirmModal.onConfirm} disabled={isUpdating} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center transition-colors disabled:opacity-50 ${confirmModal.isDestructive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-(--sync-yellow) hover:bg-(--sync-yellow)/90 text-black'}`}>
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending_payment: '#fb923c', pending: '#fb923c', payment_review: '#facc15', processing: '#38bdf8',
    delivered: '#4ade80', confirmed: '#4ade80', partially_delivered: '#a78bfa', cancelled: '#ef4444', refunded: '#94a3b8',
  };
  return (
    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: `${colors[status] || '#666'}20`, color: colors[status] || '#666' }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = { user: '#94a3b8', admin: '#ffc21a', super_admin: '#ef4444' };
  return (
    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: `${colors[role] || '#666'}20`, color: colors[role] || '#666' }}>
      {role.replace(/_/g, ' ')}
    </span>
  );
}
