import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      // Get product count
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('status, total_amount');

      if (ordersError) throw ordersError;

      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

      setStats({
        totalProducts: productCount || 0,
        totalOrders: orders?.length || 0,
        pendingOrders,
        revenue: totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <h1>Dashboard</h1>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🍖</div>
            <div className="stat-info">
              <h3>{stats.totalProducts}</h3>
              <p>Products</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>

          <div className="stat-card alert">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.pendingOrders}</h3>
              <p>Pending Orders</p>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>${stats.revenue.toFixed(2)}</h3>
              <p>Revenue</p>
            </div>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="section">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <a href="/admin/products" className="action-card">
                <span>➕</span>
                <p>Add Product</p>
              </a>
              <a href="/admin/orders" className="action-card">
                <span>📦</span>
                <p>View Orders</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
