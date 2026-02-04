import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, MapPin, Phone, Mail, Music2 } from 'lucide-react';

function Footer() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = 0.6;
  }, []);

  return (
    <footer className="footer">
      {/* Video Background */}
      <div className="footer-background">
        <video
          ref={videoRef}
          className="footer-video-layer"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/video/fire-background.mp4" type="video/mp4" />
        </video>
        <div className="footer-gradient-layer"></div>
      </div>

      <div className="footer-content">
        <div className="footer-section footer-brand">
          <div className="footer-logo">
            <img src="/images/logo.png" alt="BBQ Affair" className="footer-logo-image" />
          </div>
          <p className="footer-description">
            Professional BBQ Chef with 10 years in the industry.
            Providing Chef For Hire & Sales of food in Singapore.
          </p>
          <div className="footer-social">
            <a
              href="https://www.facebook.com/bbqaffair"
              className="social-link"
              aria-label="Facebook"
              target="_blank"
              rel="noreferrer"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://www.instagram.com/bbqaffairyos/"
              className="social-link"
              aria-label="Instagram"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://www.tiktok.com/@bbqaffair"
              className="social-link"
              aria-label="TikTok"
              target="_blank"
              rel="noreferrer"
            >
              <Music2 size={20} />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/menu">Menu</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/review">Leave a Review</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Services</h4>
          <ul className="footer-links">
            <li><Link to="/menu">Corporate Events</Link></li>
            <li><Link to="/menu">Private Parties</Link></li>
            <li><Link to="/menu">Wedding Catering</Link></li>
            <li><Link to="/menu">Birthday Celebrations</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Contact</h4>
          <ul className="footer-contact">
            <li>
              <Phone size={16} />
              <a href="https://wa.me/6588911844" style={{ color: 'inherit', textDecoration: 'none' }}>+65 8891 1844</a>
            </li>
            <li>
              <Mail size={16} />
              <a href="mailto:lebbqaffair@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>lebbqaffair@gmail.com</a>
            </li>
            <li>
              <MapPin size={16} />
              <span>59 Lengkok Bahru, Block 59, Singapore 150059</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} BBQAffair Singapore. All rights reserved.</p>
        <p className="footer-tagline">
          Serving authentic BBQ across Singapore
        </p>
      </div>
    </footer>
  );
}

export default Footer;
