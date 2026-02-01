import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "How far in advance should I book?",
    answer: "We recommend booking at least 2 weeks in advance for standard events, and 4-6 weeks for large events (200+ guests) during peak seasons. This ensures we can properly prepare and secure your preferred date."
  },
  {
    question: "What is included in your BBQ packages?",
    answer: "All our packages include fresh, quality meats, side dishes, sauces, and basic setup. Our Premium and Deluxe packages include additional items like desserts, beverages, and premium cuts. Each package listing shows exactly what's included."
  },
  {
    question: "Do you provide setup and cleanup?",
    answer: "Yes! Our service includes complete setup before your event and thorough cleanup afterward. We bring our own equipment and leave your venue spotless. You don't have to worry about a thing!"
  },
  {
    question: "Are your ingredients Halal?",
    answer: "Yes, all our ingredients are sourced from Halal-certified suppliers. We can provide certification upon request. We also offer vegetarian options for guests with different dietary requirements."
  },
  {
    question: "Can you accommodate dietary restrictions?",
    answer: "Absolutely! We offer vegetarian packages and can accommodate most dietary requirements including allergies. Please let us know in advance when placing your order so we can prepare accordingly."
  },
  {
    question: "What is your cancellation policy?",
    answer: "Cancellations made 7 days or more before the event receive a full refund. Cancellations within 7 days may be subject to a cancellation fee. For rescheduling, please contact us as soon as possible."
  },
  {
    question: "Do you charge for delivery?",
    answer: "Delivery is included for most locations in Singapore. For venues located in remote areas or with difficult access, a small delivery fee may apply. We'll inform you of any additional charges when you request a quote."
  },
  {
    question: "How long does the BBQ service last?",
    answer: "Our standard service duration is 3-4 hours, which includes setup, grilling, and cleanup. Additional hours can be arranged at $50 per hour if you need extended service."
  },
  {
    question: "What happens if it rains?",
    answer: "We recommend having a sheltered area or tent for outdoor events. We offer tentage rental as an add-on service. If weather becomes severe, we can discuss rescheduling options."
  },
  {
    question: "Do you provide plates and cutlery?",
    answer: "Basic disposable plates and cutlery are included. If you prefer eco-friendly options or premium tableware, please let us know and we can arrange it for an additional fee."
  },
  {
    question: "Can I customize my menu?",
    answer: "Yes! While our packages are designed to offer great value, we can customize menus to suit your specific needs. Contact us for a custom quote with your preferred items."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept PayNow, bank transfer, and credit/debit cards via Stripe. For large events, a 50% deposit is required to confirm your booking, with the balance due on the event day."
  }
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '4rem' }}>
      {/* Header */}
      <section style={{ 
        background: 'linear-gradient(135deg, var(--secondary-color) 0%, #4A2C1A 100%)',
        color: 'white',
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <HelpCircle size={64} style={{ marginBottom: '1rem', opacity: 0.9 }} />
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Got questions? We've got answers! If you can't find what you're looking for, feel free to contact us.
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, index) => (
            <div 
              key={index}
              style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                style={{
                  width: '100%',
                  padding: '1.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'left'
                }}
              >
                <span style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '600',
                  color: 'var(--secondary-color)',
                  paddingRight: '1rem'
                }}>
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp size={24} color="var(--primary-color)" />
                ) : (
                  <ChevronDown size={24} color="var(--primary-color)" />
                )}
              </button>
              
              {openIndex === index && (
                <div style={{
                  padding: '0 1.5rem 1.5rem',
                  color: 'var(--text-light)',
                  lineHeight: '1.7'
                }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          background: 'var(--light-bg)',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
            Still have questions?
          </h3>
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
            We're here to help! Reach out to us and we'll get back to you within 24 hours.
          </p>
          <a href="/contact" className="btn btn-primary">
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}

export default FAQ;
