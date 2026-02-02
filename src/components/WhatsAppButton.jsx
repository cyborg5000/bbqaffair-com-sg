import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Show button after scrolling down a bit
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const phoneNumber = '+6588911844';
  const message = 'Hi BBQAffair! I have a question about your catering services.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <>
      {/* Floating WhatsApp Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#25D366',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
          display: showButton ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          transform: showButton ? 'scale(1)' : 'scale(0)'
        }}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          width: '300px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          zIndex: 999,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#25D366',
            color: 'white',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MessageCircle size={24} color="#25D366" />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>BBQAffair</p>
              <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>Typically replies in minutes</p>
            </div>
          </div>

          {/* Message */}
          <div style={{ padding: '16px' }}>
            <div style={{
              backgroundColor: '#f0f0f0',
              padding: '12px',
              borderRadius: '12px',
              marginBottom: '16px'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                Hello! 👋 Welcome to BBQAffair. How can we help you with your BBQ catering needs today?
              </p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#25D366',
                color: 'white',
                padding: '14px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                width: '100%'
              }}
            >
              <MessageCircle size={20} />
              Start Chat on WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}

export default WhatsAppButton;
