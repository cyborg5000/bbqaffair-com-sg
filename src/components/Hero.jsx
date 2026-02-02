import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

function Hero() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Slow-mo playback rate (0.6 = 60% speed)
    video.playbackRate = 0.6;

    // Fade loop: fade out near end, fade in at start
    const handleTimeUpdate = () => {
      const duration = video.duration;
      const currentTime = video.currentTime;
      const fadeTime = 0.5; // seconds for fade transition

      if (duration - currentTime <= fadeTime) {
        // Fade out near end
        const opacity = (duration - currentTime) / fadeTime;
        video.style.opacity = Math.max(0.1, opacity * 0.5);
      } else if (currentTime <= fadeTime) {
        // Fade in at start
        const opacity = currentTime / fadeTime;
        video.style.opacity = Math.min(0.5, opacity * 0.5);
      } else {
        video.style.opacity = 0.5;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero">
      {/* Layered Background */}
      <div className="hero-background">
        {/* Video Background - Slow-mo Fire */}
        <video
          ref={videoRef}
          className="hero-video-layer"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/video/fire-background.mp4" type="video/mp4" />
        </video>
        <div className="hero-gradient-layer"></div>
        <div className="hero-smoke-layer"></div>
        <div className="hero-texture-layer"></div>
      </div>

      {/* Content */}
      <div className="hero-content">
        <span className="hero-tagline">Est. Singapore</span>
        <h1>
          Premium BBQ
          <span className="hero-title-accent">Catering</span>
        </h1>
        <p className="hero-subtitle">Fire-Grilled Excellence for Every Occasion</p>
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

      {/* Scroll Indicator */}
      <div className="hero-scroll-indicator" onClick={scrollToMenu}>
        <span>Scroll to explore</span>
        <div className="scroll-arrow">
          <ChevronDown size={20} />
        </div>
      </div>
    </section>
  );
}

export default Hero;
