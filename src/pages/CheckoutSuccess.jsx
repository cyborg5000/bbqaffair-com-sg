import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Check, Loader, AlertCircle } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dndpcnyiqrtjfefpnqho.supabase.co';

function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    async function verifyAndFetchOrder() {
      if (!sessionId) {
        setError('No session ID found');
        setLoading(false);
        return;
      }

      try {
        // First, verify payment with Stripe via edge function
        const verifyResponse = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'verify-session',
            session_id: sessionId
          })
        });

        const verifyData = await verifyResponse.json();

        if (verifyData.paid && verifyData.order_id) {
          setPaymentVerified(true);

          // Fetch the updated order
          const { data, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', verifyData.order_id)
            .single();

          if (!fetchError && data) {
            setOrder(data);
          }
        } else if (verifyData.error) {
          console.error('Verification error:', verifyData.error);
          setError('Payment verification failed. Please contact support.');
        } else {
          setError('Payment not completed. Please try again.');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Failed to verify payment. Please contact support.');
      } finally {
        setLoading(false);
      }
    }

    verifyAndFetchOrder();
  }, [sessionId]);

  if (loading) {
    return (
      <div style={{ paddingTop: '100px', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
          <Loader size={48} style={{ marginBottom: '1rem', animation: 'spin 1s linear infinite' }} />
          <p>Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div style={{ paddingTop: '100px', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
          <AlertCircle size={64} style={{ marginBottom: '1rem', color: '#ffc107' }} />
          <h1 style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
            Payment Processing
          </h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Your payment is being processed. You will receive an email confirmation shortly.
          </p>
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#856404' }}>
              <strong>Note:</strong> If you don't receive a confirmation email within 5 minutes,
              please contact us at <a href="mailto:lebbqaffair@gmail.com" style={{ color: 'var(--primary-color)' }}>lebbqaffair@gmail.com</a>
            </p>
          </div>
          <a href="/" className="btn btn-primary">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '100px', minHeight: '60vh' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: '#4CAF50',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <Check size={40} color="white" />
          </div>
          <h1 style={{ color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>
            Payment Successful!
          </h1>
          {order && (
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Order ID: <strong>{order.id.slice(0, 8).toUpperCase()}</strong>
            </p>
          )}
        </div>

        <div style={{
          background: '#f8f8f8',
          padding: '2rem',
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1rem', textAlign: 'center' }}>
            Order Confirmed
          </h3>

          {order && (
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}><strong>Name:</strong> {order.customer_name}</p>
                <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}><strong>Email:</strong> {order.customer_email}</p>
                <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}><strong>Event Date:</strong> {order.event_date}</p>
                {order.event_time && (
                  <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}><strong>Event Time:</strong> {order.event_time}</p>
                )}
                <p style={{ margin: '0', color: '#666' }}><strong>Address:</strong> {order.event_address}</p>
              </div>
              <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                <p style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary-color)', margin: 0, textAlign: 'right' }}>
                  Total Paid: ${order.total_amount.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <div style={{
            background: '#d4edda',
            border: '1px solid #28a745',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#155724' }}>
              Thank you for your order! We will contact you within 24 hours to confirm your booking details.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <a href="/" className="btn btn-primary">
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
}

export default CheckoutSuccess;
