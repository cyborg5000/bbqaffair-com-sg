import { useEffect, useMemo, useState } from 'react';
import { staticTestimonials } from '../data/menu';
import { supabase } from '../lib/supabase';
import { Star, Quote } from 'lucide-react';

function getCardsPerPage() {
  if (typeof window === 'undefined') return 3;
  if (window.innerWidth < 768) return 1;
  if (window.innerWidth < 1100) return 2;
  return 3;
}

function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(getCardsPerPage);
  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchTestimonials() {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('id, name, event, quote, rating, is_active')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (isMounted) {
          setTestimonials(data || []);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        if (isMounted) {
          setTestimonials([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchTestimonials();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayTestimonials = useMemo(() => {
    if (!loading && testimonials.length > 0) {
      return testimonials;
    }
    return staticTestimonials;
  }, [loading, testimonials]);

  useEffect(() => {
    function handleResize() {
      setCardsPerPage(getCardsPerPage());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const testimonialPages = useMemo(() => {
    const pages = [];
    for (let i = 0; i < displayTestimonials.length; i += cardsPerPage) {
      pages.push(displayTestimonials.slice(i, i + cardsPerPage));
    }
    return pages.length > 0 ? pages : [[]];
  }, [displayTestimonials, cardsPerPage]);

  const totalPages = testimonialPages.length;

  useEffect(() => {
    if (currentPage > totalPages - 1) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [currentPage, totalPages]);

  function handlePrev() {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  }

  function handleNext() {
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  }

  function handleTouchStart(event) {
    setTouchStartX(event.changedTouches[0]?.clientX ?? null);
  }

  function handleTouchEnd(event) {
    if (touchStartX === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX;
    const deltaX = touchStartX - endX;
    const swipeThreshold = 40;

    if (deltaX > swipeThreshold) {
      handleNext();
    } else if (deltaX < -swipeThreshold) {
      handlePrev();
    }

    setTouchStartX(null);
  }

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

      <div className="testimonials-carousel">
        <button
          className="testimonials-nav testimonials-nav-prev"
          onClick={handlePrev}
          aria-label="Previous testimonials"
        >
          &#8249;
        </button>

        <div
          className="testimonials-viewport"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="testimonials-track"
            style={{ transform: `translateX(-${currentPage * 100}%)` }}
          >
            {testimonialPages.map((page, pageIndex) => (
              <div className="testimonials-slide" key={`page-${pageIndex}`}>
                <div
                  className="testimonials-grid"
                  style={{ gridTemplateColumns: `repeat(${cardsPerPage}, minmax(0, 1fr))` }}
                >
                  {page.map((testimonial) => (
                    <div key={testimonial.id} className="testimonial-card">
                      <div className="testimonial-card-inner">
                        <div className="stars">
                          {[...Array(Math.min(5, Math.max(1, Number(testimonial.rating) || 5)))].map((_, i) => (
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
              </div>
            ))}
          </div>
        </div>

        <button
          className="testimonials-nav testimonials-nav-next"
          onClick={handleNext}
          aria-label="Next testimonials"
        >
          &#8250;
        </button>
      </div>

      <div className="testimonials-dots" role="tablist" aria-label="Testimonials pages">
        {testimonialPages.map((_, index) => (
          <button
            key={`dot-${index}`}
            type="button"
            role="tab"
            aria-selected={index === currentPage}
            aria-label={`Go to testimonials page ${index + 1}`}
            className={`testimonials-dot ${index === currentPage ? 'active' : ''}`}
            onClick={() => setCurrentPage(index)}
          />
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
