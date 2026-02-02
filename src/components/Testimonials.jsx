import { staticTestimonials as testimonials } from '../data/menu';
import { Star, Quote } from 'lucide-react';

function Testimonials() {
  return (
    <section className="testimonials-section">
      {/* Large Decorative Quote Mark */}
      <div className="testimonial-quote-decoration">
        <Quote size={200} strokeWidth={1} />
      </div>

      <div className="testimonials-header">
        <span className="testimonials-tagline">Testimonials</span>
        <h2 className="section-title">What Our Customers Say</h2>
        <p className="section-subtitle">
          Don't just take our word for it - hear from our satisfied customers
        </p>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="testimonial-card">
            <div className="testimonial-card-inner">
              <div className="stars">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="var(--honey-gold)" color="var(--honey-gold)" />
                ))}
              </div>
              <blockquote className="testimonial-quote">
                "{testimonial.quote}"
              </blockquote>
              <div className="testimonial-footer">
                <div className="testimonial-author">{testimonial.name}</div>
                <div className="testimonial-event">{testimonial.event}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
