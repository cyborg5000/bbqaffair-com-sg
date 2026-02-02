import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (name),
            order_item_addons (
              id,
              addon_name,
              addon_price,
              quantity
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId, newStatus) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order status');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      // Delete order items first (foreign key constraint)
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);

      if (itemsError) throw itemsError;

      // Delete the order
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order');
    }
  }

  // Bulk selection handlers
  function handleSelectAll(e) {
    if (e.target.checked) {
      setSelectedIds(orders.map(o => o.id));
    } else {
      setSelectedIds([]);
    }
  }

  function handleSelectOne(id) {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} order(s)?`)) return;

    try {
      // Delete order items first (foreign key constraint)
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .in('order_id', selectedIds);

      if (itemsError) throw itemsError;

      // Delete the orders
      const { error } = await supabase
        .from('orders')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;
      setSelectedIds([]);
      fetchOrders();
    } catch (error) {
      console.error('Error deleting orders:', error);
      alert('Error deleting orders');
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getStatusBadge(status) {
    const statusColors = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      preparing: 'status-preparing',
      ready: 'status-ready',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
    };
    return statusColors[status] || 'status-pending';
  }

  const isAllSelected = orders.length > 0 && selectedIds.length === orders.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < orders.length;

  if (loading) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-orders">
        <div className="page-header">
          <h1>Orders</h1>
        </div>

        {selectedIds.length > 0 && (
          <div className="bulk-actions-bar">
            <span className="selected-count">{selectedIds.length} selected</span>
            <button onClick={handleBulkDelete} className="btn-delete-bulk">
              🗑️ Delete Selected
            </button>
          </div>
        )}

        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className={selectedIds.includes(order.id) ? 'selected-row' : ''}>
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(order.id)}
                      onChange={() => handleSelectOne(order.id)}
                    />
                  </td>
                  <td>#{order.id.slice(0, 8)}</td>
                  <td>
                    <div>{order.customer_name}</div>
                    <div className="customer-phone">{order.customer_phone}</div>
                  </td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>${order.total_amount.toFixed(2)}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`status-select ${getStatusBadge(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="btn-view"
                    >
                      👁️ View
                    </button>
                    <button 
                      onClick={() => handleDelete(order.id)}
                      className="btn-delete"
                      title="Delete order"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
              <h2>Order Details #{selectedOrder.id.slice(0, 8)}</h2>
              
              <div className="order-details">
                <div className="detail-section">
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                  <p><strong>Event Date:</strong> {selectedOrder.event_date}</p>
                  <p><strong>Address:</strong> {selectedOrder.delivery_address}</p>
                </div>

                <div className="detail-section">
                  <h3>Order Items</h3>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.order_items?.map((item) => (
                        <React.Fragment key={item.id}>
                          <tr>
                            <td>{item.product_name || item.product?.name || 'Unknown Product'}</td>
                            <td>{item.quantity}</td>
                            <td>${(item.price_at_time || item.price || 0).toFixed(2)}</td>
                            <td>${(item.quantity * (item.price_at_time || item.price || 0)).toFixed(2)}</td>
                          </tr>
                          {/* Display Add-Ons */}
                          {item.order_item_addons && item.order_item_addons.length > 0 && (
                            item.order_item_addons.map(addon => (
                              <tr key={addon.id} className="addon-row">
                                <td style={{ paddingLeft: '1.5rem', color: '#3b82f6', fontSize: '0.875rem' }}>
                                  + {addon.addon_name}
                                </td>
                                <td style={{ color: '#666', fontSize: '0.875rem' }}>{addon.quantity}</td>
                                <td style={{ color: '#3b82f6', fontSize: '0.875rem' }}>+${addon.addon_price.toFixed(2)}</td>
                                <td style={{ color: '#3b82f6', fontSize: '0.875rem' }}>+${(addon.quantity * addon.addon_price).toFixed(2)}</td>
                              </tr>
                            ))
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="detail-section">
                  <h3>Payment Information</h3>
                  <p><strong>Method:</strong> {selectedOrder.payment_method}</p>
                  <p><strong>Status:</strong> {selectedOrder.payment_status}</p>
                  <p><strong>Total Amount:</strong> ${selectedOrder.total_amount.toFixed(2)}</p>
                </div>

                {selectedOrder.notes && (
                  <div className="detail-section">
                    <h3>Notes</h3>
                    <p>{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button onClick={() => setSelectedOrder(null)} className="btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
