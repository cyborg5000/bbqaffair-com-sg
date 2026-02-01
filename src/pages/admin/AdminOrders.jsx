import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
            product:products (name)
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

  if (loading) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-orders">
        <h1>Orders</h1>

        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
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
                <tr key={order.id}>
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
                        <tr key={item.id}>
                          <td>{item.product?.name || 'Unknown Product'}</td>
                          <td>{item.quantity}</td>
                          <td>${item.price_at_time.toFixed(2)}</td>
                          <td>${(item.quantity * item.price_at_time).toFixed(2)}</td>
                        </tr>
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
