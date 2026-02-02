import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, Flame } from 'lucide-react';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    guests: '',
    package: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic here
    alert('Thank you for your inquiry! We will contact you within 24 hours.');
  };

  return (
    <section className="contact-section" id="contact">
      <div className="contact-header">
        <span className="contact-tagline">Get in Touch</span>
        <h2 className="section-title">Book Your BBQ Event</h2>
        <p className="section-subtitle">
          Ready to make your event unforgettable? Get in touch with us today.
        </p>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <h3 className="contact-info-title">Contact Information</h3>

          <div className="contact-item">
            <div className="contact-icon">
              <Phone size={20} />
            </div>
            <div className="contact-item-content">
              <strong>Phone</strong>
              <p>+65 XXXX XXXX</p>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-icon">
              <Mail size={20} />
            </div>
            <div className="contact-item-content">
              <strong>Email</strong>
              <p>info@bbqaffair.com.sg</p>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-icon">
              <MapPin size={20} />
            </div>
            <div className="contact-item-content">
              <strong>Location</strong>
              <p>Singapore (Island-wide service)</p>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-icon">
              <Clock size={20} />
            </div>
            <div className="contact-item-content">
              <strong>Hours</strong>
              <p>Mon-Sun: 9AM - 9PM</p>
            </div>
          </div>

          <div className="special-offer-card">
            <div className="special-offer-icon">
              <Flame size={24} />
            </div>
            <div className="special-offer-content">
              <h4>Special Offer</h4>
              <p>Book 2 weeks in advance and get <strong>10% off</strong> your total bill!</p>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h3 className="form-title">Request a Quote</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Your Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+65 XXXX XXXX"
              />
            </div>

            <div className="form-group">
              <label>Event Date</label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Number of Guests</label>
              <select name="guests" value={formData.guests} onChange={handleChange}>
                <option value="">Select range</option>
                <option value="20-30">20-30 guests</option>
                <option value="31-50">31-50 guests</option>
                <option value="51-100">51-100 guests</option>
                <option value="101-200">101-200 guests</option>
                <option value="200+">200+ guests</option>
              </select>
            </div>

            <div className="form-group">
              <label>Interested Package</label>
              <select name="package" value={formData.package} onChange={handleChange}>
                <option value="">Select a package</option>
                <option value="classic">Classic BBQ Package ($25/pax)</option>
                <option value="premium">Premium BBQ Feast ($45/pax)</option>
                <option value="deluxe">Deluxe BBQ Experience ($65/pax)</option>
                <option value="custom">Custom Package</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Additional Message</label>
            <textarea
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your event, dietary requirements, special requests..."
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary btn-submit">
            <Send size={18} />
            Send Inquiry
          </button>
        </form>
      </div>
    </section>
  );
}

export default ContactForm;
