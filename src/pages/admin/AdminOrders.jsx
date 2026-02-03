import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  // Generate PDF Order Confirmation
  async function downloadOrderPDF(order) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor = [196, 30, 58]; // #c41e3a
    const grayColor = [100, 100, 100];
    const headerBgColor = [23, 25, 24]; // #171918 - dark background to match logo

    // Load logo image from local public folder (avoids CORS issues)
    const logoUrl = '/images/logo.png';
    let logoData = null;
    let logoWidth = 60;
    let logoHeight = 30;

    try {
      const response = await fetch(logoUrl);
      if (response.ok) {
        const blob = await response.blob();
        logoData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });

        // Get actual image dimensions to maintain aspect ratio
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = logoData;
        });

        // Calculate dimensions to fit within max width of 70mm while maintaining aspect ratio
        const maxWidth = 70;
        const maxHeight = 35;
        const aspectRatio = img.width / img.height;

        if (aspectRatio > maxWidth / maxHeight) {
          // Width constrained
          logoWidth = maxWidth;
          logoHeight = maxWidth / aspectRatio;
        } else {
          // Height constrained
          logoHeight = maxHeight;
          logoWidth = maxHeight * aspectRatio;
        }
      }
    } catch (err) {
      console.error('Failed to load logo:', err);
    }

    // Header background (dark to match logo)
    doc.setFillColor(...headerBgColor);
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Add logo if loaded
    if (logoData) {
      // Center the logo with correct aspect ratio
      const logoX = (pageWidth - logoWidth) / 2;
      const logoY = (40 - logoHeight) / 2 + 2; // Vertically center in header area
      doc.addImage(logoData, 'PNG', logoX, logoY, logoWidth, logoHeight);
    } else {
      // Fallback text if logo fails to load
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('BBQ AFFAIR', pageWidth / 2, 25, { align: 'center' });
    }

    // Tagline
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Premium BBQ Catering in Singapore', pageWidth / 2, 42, { align: 'center' });

    // Order Confirmation Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDER CONFIRMATION', pageWidth / 2, 63, { align: 'center' });

    // Order Info Box
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, 70, pageWidth - 28, 25, 3, 3, 'S');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(`Order #${order.id.slice(0, 8).toUpperCase()}`, 20, 80);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    doc.text(`Date: ${formatDate(order.created_at)}`, 20, 88);

    // Status badge
    const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1);
    doc.setFont('helvetica', 'bold');
    doc.text(`Status: ${statusText}`, pageWidth - 60, 80);

    // Payment info
    const paymentMethod = order.payment_method === 'stripe' ? 'Credit Card' : 'PayNow';
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment: ${paymentMethod}`, pageWidth - 60, 88);

    let yPos = 105;

    // Customer Information Section
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(14, yPos, pageWidth - 28, 45, 3, 3, 'F');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('CUSTOMER INFORMATION', 20, yPos + 10);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Name: ${order.customer_name}`, 20, yPos + 20);
    doc.text(`Phone: ${order.customer_phone}`, 20, yPos + 28);
    doc.text(`Email: ${order.customer_email}`, 20, yPos + 36);

    yPos += 55;

    // Event Details Section
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(14, yPos, pageWidth - 28, 35, 3, 3, 'F');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('EVENT DETAILS', 20, yPos + 10);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Date: ${order.event_date}`, 20, yPos + 20);
    doc.text(`Time: ${order.event_time || 'To be confirmed'}`, 20, yPos + 28);
    doc.text(`Address: ${order.event_address}`, pageWidth / 2 - 10, yPos + 20);

    yPos += 45;

    // Order Items Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('ORDER ITEMS', 20, yPos);

    yPos += 5;

    // Prepare table data
    const tableBody = [];
    let itemNumber = 1;

    order.order_items?.forEach((item) => {
      const itemName = item.product_name || item.product?.name || 'Unknown Product';
      const itemPrice = item.price_at_time || item.price || 0;
      const itemTotal = item.quantity * itemPrice;

      tableBody.push([
        itemNumber++,
        itemName,
        item.quantity,
        `$${itemPrice.toFixed(2)}`,
        `$${itemTotal.toFixed(2)}`
      ]);

      // Add addons
      if (item.order_item_addons && item.order_item_addons.length > 0) {
        item.order_item_addons.forEach(addon => {
          const addonTotal = addon.quantity * addon.addon_price;
          tableBody.push([
            '',
            `  + ${addon.addon_name}`,
            addon.quantity,
            `+$${addon.addon_price.toFixed(2)}`,
            `+$${addonTotal.toFixed(2)}`
          ]);
        });
      }
    });

    // Items Table
    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Item', 'Qty', 'Price', 'Total']],
      body: tableBody,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { cellWidth: 80 },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'right', cellWidth: 30 },
        4: { halign: 'right', cellWidth: 30 }
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      }
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    yPos = doc.lastAutoTable.finalY + 10;

    // Check if we need a new page for the total box
    if (yPos + 30 > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }

    // Total Box
    doc.setFillColor(...primaryColor);
    doc.roundedRect(pageWidth - 80, yPos, 66, 20, 3, 3, 'F');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL:', pageWidth - 75, yPos + 13);
    doc.setFontSize(14);
    doc.text(`$${order.total_amount.toFixed(2)}`, pageWidth - 20, yPos + 13, { align: 'right' });

    yPos += 30;

    // Notes Section (if any)
    if (order.notes) {
      const splitNotes = doc.splitTextToSize(order.notes, pageWidth - 50);
      const notesHeight = 20 + (splitNotes.length * 5);

      // Check if we need a new page for notes
      if (yPos + notesHeight > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(231, 243, 255);
      doc.roundedRect(14, yPos, pageWidth - 28, Math.max(25, notesHeight), 3, 3, 'F');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 102, 204);
      doc.text('Special Notes:', 20, yPos + 10);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(splitNotes, 20, yPos + 18);

      yPos += notesHeight + 10;
    }

    // Add footer to each page
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      const footerY = pageHeight - 25;

      doc.setDrawColor(200, 200, 200);
      doc.line(14, footerY, pageWidth - 14, footerY);

      doc.setFontSize(9);
      doc.setTextColor(...grayColor);
      doc.setFont('helvetica', 'normal');
      doc.text('Thank you for choosing BBQ Affair!', pageWidth / 2, footerY + 8, { align: 'center' });
      doc.text(`Contact: lebbqaffair@gmail.com | www.bbqaffair.com.sg | Page ${i} of ${totalPages}`, pageWidth / 2, footerY + 14, { align: 'center' });
    }

    // Save the PDF
    doc.save(`BBQ-Affair-Order-${order.id.slice(0, 8).toUpperCase()}.pdf`);
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
                  <p><strong>Event Time:</strong> {selectedOrder.event_time || 'Not specified'}</p>
                  <p><strong>Address:</strong> {selectedOrder.event_address}</p>
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
                <button
                  onClick={() => downloadOrderPDF(selectedOrder)}
                  className="btn-primary"
                  style={{ marginRight: '10px' }}
                >
                  📄 Download PDF
                </button>
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
