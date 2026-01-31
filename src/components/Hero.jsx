import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content fade-in">
        <h1>Premium BBQ Catering<br />for Every Occasion</h1>
        <p className="hero-subtitle">
          🔥 Authentic Singapore BBQ Experience
        </p>
        <p className="hero-description">
          From intimate family gatherings to large corporate events, we bring the 
          sizzle and flavor of authentic BBQ right to your doorstep. 
          Quality ingredients, expert grilling, unforgettable taste.
        </p>
        <div className="hero-buttons">
          <Link to="/menu" className="btn btn-primary">
            View Our Menu
          </Link>
          <Link to="/contact" className="btn btn-secondary">
            Get a Quote
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
