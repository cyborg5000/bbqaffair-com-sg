import { Utensils, Award, Clock, Users, Flame } from 'lucide-react';

function AboutSection() {
  return (
    <section className="about-section">
      {/* Decorative Background Elements */}
      <div className="about-background">
        <div className="ember-glow ember-glow-1"></div>
        <div className="ember-glow ember-glow-2"></div>
      </div>

      <div className="about-content">
        <div className="about-header">
          <span className="about-tagline">Our Story</span>
          <h2 className="section-title">Why Choose BBQAffair?</h2>
        </div>

        <div className="about-text">
          <p>
            With years of experience in Singapore's catering scene, we've perfected
            the art of BBQ. Our commitment to quality ingredients, authentic flavors,
            and exceptional service has made us the preferred choice for hundreds of events.
          </p>
          <p>
            From marinated meats grilled to perfection to our signature sauces,
            every dish is crafted with passion and delivered with professionalism.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">
                <Utensils size={32} />
              </div>
            </div>
            <h3>Premium Ingredients</h3>
            <p>Only the freshest, highest quality meats and produce</p>
          </div>

          <div className="feature">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">
                <Award size={32} />
              </div>
            </div>
            <h3>Expert Chefs</h3>
            <p>Professional grill masters with years of experience</p>
          </div>

          <div className="feature">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">
                <Clock size={32} />
              </div>
            </div>
            <h3>On-Time Service</h3>
            <p>Punctual setup and service for your event</p>
          </div>

          <div className="feature">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">
                <Users size={32} />
              </div>
            </div>
            <h3>Any Event Size</h3>
            <p>From 20 to 500+ guests, we've got you covered</p>
          </div>
        </div>

        {/* Decorative Flame Element */}
        <div className="about-flame-accent">
          <Flame size={120} strokeWidth={1} />
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
