import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { CreditCard, QrCode, ArrowLeft, Check, ShoppingCart } from 'lucide-react';

function Checkout() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventAddress: '',
    notes: ''
  });
  const [orderComplete, setOrderComplete] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Process payment logic here
    setOrderComplete(true);
    clearCart();
  };

  if (orderComplete) {
    return (
      <div style={{ paddingTop: '100px', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: '#4CAF50',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem'
          }}>
            <Check size={40} color="white" />
          </div>
          <h1 style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
            Order Received!
          </h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Thank you for your order. We will contact you within 24 hours to confirm your booking.
          </p>
          <a href="/" className="btn btn-primary">
            Return to Home
          </a>
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
              
              {cartItems.map(item => {
                const itemKey = item.optionId ? `${item.id}-${item.optionId}` : item.id;
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
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '1rem 0',
                      borderBottom: '1px solid #ddd'
                    }}
                  >
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
                    <p style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                      {lineTotal}
                    </p>
                  </div>
                );
              })}
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '1.5rem',
                fontSize: '1.25rem',
                fontWeight: 'bold'
              }}>
                <span>Total:</span>
                <span style={{ color: 'var(--primary-color)' }}>
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
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

              {/* PayNow QR Display */}
              {paymentMethod === 'paynow' && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1.5rem',
                  background: 'white',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                    Scan to Pay ${totalPrice.toFixed(2)}
                  </p>
                  <div style={{
                    width: '200px',
                    height: '200px',
                    background: '#f0f0f0',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    border: '2px dashed #ccc'
                  }}>
                    <div style={{ textAlign: 'center', color: '#666' }}>
                      <QrCode size={64} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                      <p style={{ fontSize: '0.875rem' }}>PayNow QR Code</p>
                      <p style={{ fontSize: '0.75rem' }}>(Upload from Drive)</p>
                    </div>
                  </div>
                  <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
                    UEN: [Add your UEN number]
                  </p>
                </div>
              )}
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

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  {paymentMethod === 'stripe' ? 'Pay with Card' : 'Confirm PayNow Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
