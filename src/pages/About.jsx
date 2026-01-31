import { Utensils, Award, Clock, Users, Heart, Leaf } from 'lucide-react';

function About() {
  return (
    <div style={{ paddingTop: '80px' }}>
      {/* Hero Section */}
      <section 
        style={{
          background: 'linear-gradient(rgba(44, 24, 16, 0.85), rgba(44, 24, 16, 0.85))',
          color: 'white',
          padding: '6rem 2rem',
          textAlign: 'center'
        }}
      >
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>About BBQAffair</h1>
        <p style={{ fontSize: '1.3rem', maxWidth: '700px', margin: '0 auto' }}>
          Bringing people together through the love of authentic Singapore BBQ
        </p>
      </section>
      
      {/* Story Section */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '5rem 2rem' }}>
        <h2 style={{ color: 'var(--secondary-color)', marginBottom: '1.5rem', textAlign: 'center' }}>
          Our Story
        </h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-dark)', marginBottom: '1.5rem' }}>
          BBQAffair was born from a simple passion: the love of authentic BBQ and bringing people 
          together. What started as small family gatherings has grown into one of Singapore's most 
          trusted BBQ catering services.
        </p>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-dark)', marginBottom: '1.5rem' }}>
          We believe that great food creates great memories. That's why we've dedicated ourselves 
          to perfecting the art of BBQ, using time-honored recipes, premium ingredients, and expert 
          grilling techniques passed down through generations.
        </p>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-dark)' }}>
          Today, we're proud to serve hundreds of events across Singapore – from intimate family 
          celebrations to large corporate functions. Every event is special to us, and we bring the 
          same level of care and dedication to every grill we fire up.
        </p>
      </section>
      
      {/* Values Section */}
      <section style={{ background: 'var(--light-bg)', padding: '5rem 2rem' }}>
        <h2 style={{ color: 'var(--secondary-color)', marginBottom: '3rem', textAlign: 'center' }}>
          Our Values
        </h2>
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            maxWidth: '1000px',
            margin: '0 auto'
          }}
        >
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Heart size={48} style={{ color: 'var(--primary-color)', marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '1rem' }}>Passion</h3>
            <p style={{ color: 'var(--text-light)' }}>
              We love what we do, and it shows in every dish we serve.
            </p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Award size={48} style={{ color: 'var(--primary-color)', marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '1rem' }}>Quality</h3>
            <p style={{ color: 'var(--text-light)' }}>
              Only the freshest ingredients make it to your plate. No compromises.
            </p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Users size={48} style={{ color: 'var(--primary-color)', marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '1rem' }}>Service</h3>
            <p style={{ color: 'var(--text-light)' }}>
              Exceptional customer service from first contact to final cleanup.
            </p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Leaf size={48} style={{ color: 'var(--primary-color)', marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '1rem' }}>Sustainability</h3>
            <p style={{ color: 'var(--text-light)' }}>
              We're committed to eco-friendly practices and responsible sourcing.
            </p>
          </div>
        </div>
      </section>
      
      {/* Why Choose Us */}
      <section style={{ padding: '5rem 2rem' }}>
        <h2 style={{ color: 'var(--secondary-color)', marginBottom: '3rem', textAlign: 'center' }}>
          Why Choose Us?
        </h2>
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            maxWidth: '1000px',
            margin: '0 auto'
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Utensils size={32} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Authentic Recipes</h4>
              <p style={{ color: 'var(--text-light)' }}>
                Time-honored marinades and grilling techniques passed down through generations.
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Clock size={32} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Punctual Service</h4>
              <p style={{ color: 'var(--text-light)' }}>
                We respect your time. Setup and service always on schedule.
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Users size={32} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Experienced Team</h4>
              <p style={{ color: 'var(--text-light)' }}>
                Professional chefs with years of BBQ catering experience.
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Award size={32} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Quality Assured</h4>
              <p style={{ color: 'var(--text-light)' }}>
                Halal-certified ingredients with strict quality control.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section 
        style={{
          background: 'var(--primary-color)',
          color: 'white',
          padding: '4rem 2rem',
          textAlign: 'center'
        }}
      >
        <h2 style={{ marginBottom: '1rem' }}>Ready to Experience the Best BBQ in Singapore?</h2>
        <p style={{ marginBottom: '2rem', opacity: 0.9 }}>
          Let us make your next event unforgettable.
        </p>
        <a 
          href="/contact" 
          className="btn btn-secondary"
          style={{ borderColor: 'white', color: 'white' }}
        >
          Get in Touch
        </a>
      </section>
    </div>
  );
}

export default About;
