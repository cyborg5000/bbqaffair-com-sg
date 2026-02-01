import { staticTestimonials as testimonials } from '../data/menu';
import { Star } from 'lucide-react';

function Testimonials() {
  return (
    <section className="testimonials-section">
      <h2 className="section-title">What Our Customers Say</h2>
      <p className="section-subtitle">
        Don't just take our word for it - hear from our satisfied customers
      </p>
      
      <div className="testimonials-grid">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="testimonial-card">
            <div className="stars">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} size={20} fill="#FFD700" color="#FFD700" />
              ))}
            </div>
            <p>"{testimonial.quote}"</p>
            <div className="testimonial-author">{testimonial.name}</div>
            <div className="testimonial-event">{testimonial.event}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
