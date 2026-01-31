import { Eye, Target } from 'lucide-react';

function VisionMission() {
  return (
    <section style={{ background: 'var(--secondary-color)', color: 'white', padding: '5rem 2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '4rem' 
        }}>
          {/* Vision */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <Eye size={32} style={{ color: 'var(--accent-color)' }} />
              <h2 style={{ margin: 0, color: 'var(--accent-color)' }}>Our Vision</h2>
            </div>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', opacity: 0.9 }}>
              Singapore's top authority and destination for BBQ enthusiasts, renowned 
              for our dedication to quality, authenticity, and customer satisfaction. 
              We aim to inspire individuals to explore BBQ, fostering creativity, 
              camaraderie, and culinary excellence. Through innovation and dedication, 
              we elevate the BBQ experience, enriching lives and creating lasting memories.
            </p>
          </div>

          {/* Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <Target size={32} style={{ color: 'var(--accent-color)' }} />
              <h2 style={{ margin: 0, color: 'var(--accent-color)' }}>Our Mission</h2>
            </div>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', opacity: 0.9 }}>
              We unite people with the joy of BBQ, crafting unforgettable experiences 
              and delicious flavors that ignite the senses and nourish the soul. 
              Dedicated to exceptional quality, passion, and innovation in every dish, 
              we foster community and connection, one delicious bite at a time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VisionMission;
