import ContactForm from '../components/ContactForm';

function Contact() {
  return (
    <div style={{ paddingTop: '80px' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(rgba(44, 24, 16, 0.85), rgba(44, 24, 16, 0.85)), url("/images/contact-team.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          padding: '4rem 2rem',
          textAlign: 'center'
        }}
      >
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'white' }}>Contact Us</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', opacity: 0.9 }}>
          Let's bring the sizzle to your next event
        </p>
      </section>

      <ContactForm />
      
      {/* Map Section */}
      <section style={{ padding: '0 2rem 4rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--secondary-color)' }}>
            Our Service Area
          </h2>
          <div 
            style={{
              background: '#eee',
              height: '400px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-light)'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                🗺️ Interactive Map Coming Soon
              </p>
              <p>
                We serve all areas across Singapore including:<br />
                Orchard, CBD, Tampines, Jurong, Woodlands, and more
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section style={{ background: 'var(--light-bg)', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--secondary-color)' }}>
            Frequently Asked Questions
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--secondary-color)' }}>
                How far in advance should I book?
              </h4>
              <p style={{ color: 'var(--text-light)' }}>
                We recommend booking at least 2 weeks in advance for standard events, 
                and 4-6 weeks for large events (200+ guests) during peak seasons.
              </p>
            </div>
            
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--secondary-color)' }}>
                Do you provide setup and cleanup?
              </h4>
              <p style={{ color: 'var(--text-light)' }}>
                Yes! Our service includes complete setup before your event and cleanup 
                afterward. We leave your venue spotless.
              </p>
            </div>
            
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--secondary-color)' }}>
                Are your ingredients Halal?
              </h4>
              <p style={{ color: 'var(--text-light)' }}>
                Yes, all our ingredients are sourced from Halal-certified suppliers. 
                We can provide certification upon request.
              </p>
            </div>
            
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--secondary-color)' }}>
                Can you accommodate dietary restrictions?
              </h4>
              <p style={{ color: 'var(--text-light)' }}>
                Absolutely. We offer vegetarian packages and can accommodate most dietary 
                requirements. Please let us know in advance.
              </p>
            </div>
            
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--secondary-color)' }}>
                What is your cancellation policy?
              </h4>
              <p style={{ color: 'var(--text-light)' }}>
                Cancellations made 7 days or more before the event receive a full refund. 
                Cancellations within 7 days may be subject to a cancellation fee.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
