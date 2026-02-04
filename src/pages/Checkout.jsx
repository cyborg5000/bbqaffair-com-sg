import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { createOrder, createOrderItems, createOrderItemAddons, supabase } from '../lib/supabase';
import { CreditCard, QrCode, ArrowLeft, Check, ShoppingCart, Loader } from 'lucide-react';

// Supabase Edge Function URL for Stripe checkout
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dndpcnyiqrtjfefpnqho.supabase.co';

const DELIVERY_THRESHOLD = 500;
const DELIVERY_FEE = 40;
const ORDER_NUMBER_PREFIX = 'bbqaffair';
const ORDER_NUMBER_START = 1001;

function Checkout() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventTime: '',
    eventAddress: '',
    notes: ''
  });
  const [orderCreated, setOrderCreated] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [displayOrderNumber, setDisplayOrderNumber] = useState(null);

  const deliveryFee = totalPrice >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const orderTotal = totalPrice + deliveryFee;

  const formatOrderNumber = (order, fallbackNumber) => {
    if (!order) return '';
    const value = order.order_number;
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'number') {
        return `${ORDER_NUMBER_PREFIX}${value}`;
      }
      const raw = String(value);
      if (raw.toLowerCase().startsWith(ORDER_NUMBER_PREFIX)) {
        return raw.toLowerCase();
      }
      if (/^\d+$/.test(raw)) {
        return `${ORDER_NUMBER_PREFIX}${raw}`;
      }
      return raw;
    }
    if (fallbackNumber) {
      return `${ORDER_NUMBER_PREFIX}${fallbackNumber}`;
    }
    return `#${order.id.slice(0, 8).toUpperCase()}`;
  };

  // Wait for cart to load from localStorage
  useEffect(() => {
    // Small delay to ensure localStorage is loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!termsAccepted) {
      setError('Please accept the Terms & Conditions to place order.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Create order in database
      const orderData = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        event_date: formData.eventDate,
        event_time: formData.eventTime,
        event_address: formData.eventAddress,
        notes: formData.notes,
        total_amount: orderTotal,
        payment_method: paymentMethod,
        status: 'pending',
        payment_status: 'pending'
      };

      const order = await createOrder(orderData);

      if (!order) {
        throw new Error('Failed to create order');
      }

      if (order.order_number) {
        setDisplayOrderNumber(order.order_number);
      } else {
        try {
          const { count, error: countError } = await supabase
            .from('orders')
            .select('id', { count: 'exact', head: true });
          if (!countError && typeof count === 'number') {
            setDisplayOrderNumber(ORDER_NUMBER_START - 1 + count);
          }
        } catch (countErr) {
          console.warn('Failed to compute fallback order number:', countErr);
        }
      }

      // Create order items
      const orderItemsData = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.optionName ? `${item.name} - ${item.optionName}` : item.name,
        price: typeof item.price === 'number' ? item.price : parseFloat(item.price.replace(/[^0-9.]/g, '')),
        quantity: item.quantity
      }));

      const createdOrderItems = await createOrderItems(orderItemsData);

      // Create order item addons (if any items have addons)
      if (createdOrderItems && createdOrderItems.length > 0) {
        const orderItemAddons = [];
        cartItems.forEach((item, index) => {
          if (item.addons && item.addons.length > 0) {
            const orderItem = createdOrderItems[index];
            if (orderItem) {
              item.addons.forEach(addon => {
                orderItemAddons.push({
                  order_item_id: orderItem.id,
                  addon_name: addon.name,
                  addon_price: parseFloat(addon.price),
                  quantity: item.quantity
                });
              });
            }
          }
        });

        if (orderItemAddons.length > 0) {
          await createOrderItemAddons(orderItemAddons);
        }
      }

      // Handle Stripe payment - redirect to Stripe Checkout
      if (paymentMethod === 'stripe') {
        // Prepare line items for Stripe
        const lineItems = cartItems.map(item => {
          let itemName = item.optionName ? `${item.name} - ${item.optionName}` : item.name;
          const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price.replace(/[^0-9.]/g, ''));

          // Include addons in description
          let description = '';
          if (item.addons && item.addons.length > 0) {
            description = 'Add-ons: ' + item.addons.map(a => a.name).join(', ');
          }

          return {
            name: itemName,
            description: description || undefined,
            price: itemPrice,
            quantity: item.quantity
          };
        });

        // Add addon prices as separate line items
        cartItems.forEach(item => {
          if (item.addons && item.addons.length > 0) {
            item.addons.forEach(addon => {
              lineItems.push({
                name: `Add-on: ${addon.name}`,
                price: parseFloat(addon.price),
                quantity: item.quantity
              });
            });
          }
        });

        if (deliveryFee > 0) {
          lineItems.push({
            name: 'Delivery Fee',
            price: deliveryFee,
            quantity: 1
          });
        }

        // Call Supabase Edge Function to create Stripe Checkout Session
        const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`
          },
          body: JSON.stringify({
            order_id: order.id,
            line_items: lineItems,
            customer_email: formData.email,
            success_url: `${window.location.origin}/checkout/success`,
            cancel_url: `${window.location.origin}/checkout?cancelled=true`
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Edge function error:', response.status, errorText);
          throw new Error(`Payment service error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Stripe response:', data);

        if (data.error) {
          throw new Error(data.error);
        }

        if (!data.url) {
          console.error('No URL in response:', data);
          throw new Error('Payment redirect URL not received');
        }

        // Clear cart before redirect (order is created, payment pending)
        clearCart();

        // Redirect to Stripe Checkout
        window.location.href = data.url;
        return;
      }

      // For PayNow - send notification emails and show confirmation page
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'notify-paynow',
            order_id: order.id
          })
        });
      } catch (notifyErr) {
        console.error('Failed to send PayNow notification:', notifyErr);
        // Don't block the order confirmation even if notification fails
      }

      setCreatedOrder(order);
      setOrderCreated(true);
      clearCart();
    } catch (err) {
      console.error('Order creation failed:', err);
      setError('Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show order confirmation with payment instructions
  if (orderCreated && createdOrder) {
    return (
      <div style={{ paddingTop: '100px', minHeight: '60vh' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: paymentMethod === 'paynow' ? 'var(--primary-color)' : '#4CAF50',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              {paymentMethod === 'paynow' ? (
                <QrCode size={40} color="white" />
              ) : (
                <Check size={40} color="white" />
              )}
            </div>
            <h1 style={{ color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>
              Order Placed Successfully!
            </h1>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Order Number: <strong>{formatOrderNumber(createdOrder, displayOrderNumber)}</strong>
            </p>
          </div>

          {/* PayNow Payment Instructions */}
          {paymentMethod === 'paynow' && (
            <div style={{
              background: '#f8f8f8',
              padding: '2rem',
              borderRadius: '12px',
              marginBottom: '2rem'
            }}>
              <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1rem', textAlign: 'center' }}>
                Complete Your Payment
              </h3>
              <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#666' }}>
                Scan the QR code below with your banking app to pay
              </p>

              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '1.5rem'
              }}>
                <p style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>
                  Amount: ${createdOrder.total_amount.toFixed(2)}
                </p>
                <img
                  src="/images/QRCode.jpeg"
                  alt="PayNow QR Code"
                  style={{
                    width: '420px',
                    height: '420px',
                    objectFit: 'contain',
                    margin: '0 auto',
                    display: 'block',
                    borderRadius: '8px'
                  }}
                />
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                  UEN: <strong>53476778L</strong>
                </p>
              </div>

              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#856404' }}>
                  <strong>Important:</strong> After making payment, your order status will be updated once we verify the payment.
                  We will contact you within 24 hours to confirm your booking.
                </p>
              </div>
            </div>
          )}

          {/* Stripe Payment Instructions */}
          {paymentMethod === 'stripe' && (
            <div style={{
              background: '#f8f8f8',
              padding: '2rem',
              borderRadius: '12px',
              marginBottom: '2rem'
            }}>
              <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1rem', textAlign: 'center' }}>
                Payment Pending
              </h3>
              <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem' }}>
                Online card payment will be available soon. For now, please contact us to complete your payment.
              </p>

              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>
                  Total: ${createdOrder.total_amount.toFixed(2)}
                </p>
                <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                  <strong>WhatsApp:</strong> <a href="https://wa.me/6588911844" style={{ color: 'var(--primary-color)' }}>+65 8891 1844</a>
                </p>
                <p style={{ color: '#666' }}>
                  <strong>Email:</strong> <a href="mailto:lebbqaffair@gmail.com" style={{ color: 'var(--primary-color)' }}>lebbqaffair@gmail.com</a>
                </p>
              </div>

              <div style={{
                background: '#d4edda',
                border: '1px solid #28a745',
                borderRadius: '8px',
                padding: '1rem',
                marginTop: '1rem'
              }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#155724' }}>
                  Your order has been received. We will contact you within 24 hours to arrange payment and confirm your booking.
                </p>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <a href="/" className="btn btn-primary">
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while cart initializes
  if (isLoading) {
    return (
      <div style={{ paddingTop: '100px', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
          <ShoppingCart size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ paddingTop: '100px', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
          <h1 style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
            Your Cart is Empty
          </h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Add some items to your cart before checking out.
          </p>
          <a href="/menu" className="btn btn-primary">
            Browse Menu
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '80px', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        {/* Back Button */}
        <a 
          href="/menu" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            color: '#666',
            textDecoration: 'none',
            marginBottom: '2rem'
          }}
        >
          <ArrowLeft size={20} />
          Back to Menu
        </a>

        <h1 style={{ marginBottom: '2rem', color: 'var(--secondary-color)' }}>
          Checkout
        </h1>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '3rem' 
        }}>
          {/* Order Summary */}
          <div>
            <div style={{
              background: '#f8f8f8',
              padding: '2rem',
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary-color)' }}>
                Order Summary ({cartItems.length} items)
              </h3>
              
              {cartItems.map((item, index) => {
                // Generate unique key including addons
                let itemKey = item.optionId ? `${item.id}-${item.optionId}` : String(item.id);
                if (item.addons && item.addons.length > 0) {
                  itemKey += `-addons:${item.addons.map(a => a.id).sort().join(',')}`;
                }
                const displayPrice = typeof item.price === 'number'
                  ? `$${item.price.toFixed(2)}`
                  : item.price;
                const lineTotal = typeof item.price === 'number'
                  ? `$${(item.price * item.quantity).toFixed(2)}`
                  : displayPrice;

                return (
                  <div
                    key={itemKey}
                    style={{
                      padding: '1rem 0',
                      borderBottom: '1px solid #ddd'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>
                          {item.name}
                          {item.optionName && (
                            <span style={{ fontWeight: 'normal', color: 'var(--primary-color)' }}>
                              {' '}- {item.optionName}
                            </span>
                          )}
                        </p>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>
                          {displayPrice}
                          {item.unitLabel && ` / ${item.unitLabel}`}
                          {' '} × {item.quantity}
                        </p>
                      </div>
                      <p style={{ fontWeight: 'bold', color: 'var(--primary-color)', margin: 0 }}>
                        {lineTotal}
                      </p>
                    </div>
                    {/* Display Add-Ons */}
                    {item.addons && item.addons.length > 0 && (
                      <div style={{
                        marginTop: '0.5rem',
                        paddingLeft: '1rem',
                        fontSize: '0.8rem',
                        color: '#666'
                      }}>
                        {item.addons.map(addon => (
                          <div key={addon.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0.125rem 0',
                            color: '#3b82f6'
                          }}>
                            <span>+ {addon.name}</span>
                            <span>+${parseFloat(addon.price).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '1.5rem',
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                <span>Subtotal:</span>
                <span style={{ color: 'var(--primary-color)' }}>
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '0.5rem',
                fontSize: '0.95rem',
                color: '#666'
              }}>
                <span>Delivery Fee:</span>
                <span style={{ color: deliveryFee === 0 ? 'var(--success-green)' : '#666' }}>
                  {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '1rem',
                fontSize: '1.25rem',
                fontWeight: 'bold'
              }}>
                <span>Total:</span>
                <span style={{ color: 'var(--primary-color)' }}>
                  ${orderTotal.toFixed(2)}
                </span>
              </div>
              <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#777' }}>
                Free delivery for orders $500 and above.
              </p>
            </div>

            {/* Payment Methods */}
            <div style={{
              background: '#f8f8f8',
              padding: '2rem',
              borderRadius: '8px'
            }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary-color)' }}>
                Payment Method
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Stripe Option */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: paymentMethod === 'stripe' ? '#fff' : 'transparent',
                  border: paymentMethod === 'stripe' ? '2px solid var(--primary-color)' : '2px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="payment"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <CreditCard size={24} style={{ color: 'var(--primary-color)' }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Credit/Debit Card</p>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
                      Secure payment via Stripe
                    </p>
                  </div>
                </label>

                {/* PayNow Option */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: paymentMethod === 'paynow' ? '#fff' : 'transparent',
                  border: paymentMethod === 'paynow' ? '2px solid var(--primary-color)' : '2px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="payment"
                    value="paynow"
                    checked={paymentMethod === 'paynow'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <QrCode size={24} style={{ color: 'var(--primary-color)' }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>PayNow</p>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
                      Scan QR code with your banking app
                    </p>
                  </div>
                </label>
              </div>

              <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#777' }}>
                A $40 delivery fee applies to orders below $500 for all payment methods.
              </p>
            </div>
          </div>

          {/* Customer Details Form */}
          <div>
            <form onSubmit={handleSubmit}>
              <div style={{
                background: '#f8f8f8',
                padding: '2rem',
                borderRadius: '8px'
              }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary-color)' }}>
                  Event Details
                </h3>

                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Your full name"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="you@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+65 XXXX XXXX"
                  />
                </div>

                <div className="form-group">
                  <label>Event Date *</label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Event Time (SGT) *</label>
                  <input
                    type="time"
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Event Address *</label>
                  <input
                    type="text"
                    name="eventAddress"
                    value={formData.eventAddress}
                    onChange={handleInputChange}
                    required
                    placeholder="Full address for BBQ setup"
                  />
                </div>

                <div className="form-group">
                  <label>Additional Notes</label>
                  <textarea
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any special requests, dietary requirements, etc."
                  />
                </div>

                {error && (
                  <div style={{
                    background: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    color: '#721c24'
                  }}>
                    {error}
                  </div>
                )}

                <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.95rem', color: '#444' }}>
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => {
                        setTermsAccepted(e.target.checked);
                        if (e.target.checked) setError(null);
                      }}
                      style={{ marginTop: '0.2rem' }}
                    />
                    <span>
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setIsTermsOpen(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: 'var(--primary-color)',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Terms &amp; Conditions
                      </button>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    marginTop: '1rem',
                    opacity: isSubmitting || !termsAccepted ? 0.6 : 1,
                    cursor: isSubmitting || !termsAccepted ? 'not-allowed' : 'pointer'
                  }}
                  disabled={isSubmitting || !termsAccepted}
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={18} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {isTermsOpen && (
        <div
          onClick={() => setIsTermsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '1.5rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #eee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ margin: 0, color: 'var(--secondary-color)' }}>BBQ Affair - Terms &amp; Conditions</h3>
              <button
                type="button"
                onClick={() => setIsTermsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: '#666'
                }}
                aria-label="Close terms"
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <ol style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.7, color: '#444' }}>
                <li style={{ marginBottom: '1rem' }}>
                  <strong>Delivery &amp; Transportation</strong>
                  <ul style={{ marginTop: '0.5rem' }}>
                    <li>A delivery fee of $40 applies to orders below $500.</li>
                    <li>Additional transportation charges apply for events that end after 10:30 PM.</li>
                  </ul>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <strong>Reservations &amp; Bookings</strong>
                  <ul style={{ marginTop: '0.5rem' }}>
                    <li>Reservations must be made at least 7 days in advance.</li>
                    <li>A $40 late booking fee applies to last-minute bookings.</li>
                  </ul>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <strong>Cancellations</strong>
                  <ul style={{ marginTop: '0.5rem' }}>
                    <li>Last-minute cancellations are not accepted.</li>
                    <li>Cancellations will incur a 50% charge of the total amount.</li>
                    <li>If our chefs are already en route to your venue, additional charges will apply.</li>
                  </ul>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <strong>Special Venues</strong>
                  <ul style={{ marginTop: '0.5rem' }}>
                    <li>Inaccessible or special venues will incur an additional $40 charge.</li>
                    <li>
                      Examples include: NSRCC, East Coast Park, Labrador Park, Changi Fairy Point, Sentosa, 3 Jalan Hajijah
                      (Landbay) ($20) (staircase to BBQ pit), Tuas, Belmont Road, 42 Belmont Road (3 flights of stairs,
                      add $60 if the food is a lot), KI Residences, 68 Hua Guan Ave, Pavilion Green, Sunny Parc, Hilltops,
                      Sembwang Country Club.
                    </li>
                  </ul>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <strong>Payment Policy</strong>
                  <ul style={{ marginTop: '0.5rem' }}>
                    <li>Upon invoice issuance, payment should be made to UEN: 53476778L.</li>
                    <li>Full payment must be made at least 7 days before the event. Failure to do so may result in cancellation of your booking without prior notice.</li>
                  </ul>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <strong>Wet Weather Policy</strong>
                  <ul style={{ marginTop: '0.5rem' }}>
                    <li>In case of rain, we will wait for the rain to stop and resume the BBQ.</li>
                    <li>Alternatively, we may cook indoors (e.g., at your home) using pots, ovens, etc., while preserving the BBQ flavor.</li>
                    <li>To postpone your event due to weather, please inform us at least 5 hours before the scheduled start time.</li>
                    <li>Please assign someone to hold an umbrella for the chef during rain (note: chefs may get wet and smell of smoke).</li>
                    <li>We can provide a portable pit, subject to venue management approval. Please prepare additional A3 trays. If this is not permitted and an incident occurs, BBQ Affair will not be held responsible.</li>
                  </ul>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <strong>Chef Rules</strong>
                  <ul style={{ marginTop: '0.5rem' }}>
                    <li>Each chef can handle up to 30 pax.</li>
                    <li>For groups exceeding 30 pax, we recommend having 2 chefs and 2 pits.</li>
                    <li>If only one chef is available, we will try to cook as quickly as possible, but we cannot guarantee all food will be completed on time.</li>
                    <li>Alternatively, you may hire a chef for a 4-hour timeslot.</li>
                    <li>If you request a specific chef to serve you, an additional $40 charge applies.</li>
                  </ul>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <strong>Photo</strong>
                  <p style={{ marginTop: '0.5rem' }}>
                    When the team finishes the job, we will take a photo with you to celebrate a successful event with BBQ Affair.
                  </p>
                </li>
              </ol>

              <p style={{ marginTop: '1rem', color: '#555' }}>
                Thank you for your continued support of BBQ Affair. For enquiries, please contact Richard at 8891 1844.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
