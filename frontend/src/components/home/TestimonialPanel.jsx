import React, { useEffect, useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Aarav Shah',
    location: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop',
    quote:
      'Finding our dream home felt effortless with Millionaire Club. The listings felt carefully curated, and the guidance felt discreet, responsive, and genuinely premium.',
  },
  {
    name: 'Meera Shah',
    location: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop',
    quote:
      'The platform made it easy to compare premium homes without feeling overwhelmed by clutter or noise. We loved the balance of trust and taste.',
  },
  {
    name: 'Riya Malhotra',
    location: 'Bangalore',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop',
    quote:
      'The experience was calm, refined, and incredibly efficient. Every interaction felt tailored to the way a luxury property search should work.',
  },
  {
    name: 'Karan Bhatia',
    location: 'Gurgaon',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop',
    quote:
      'Millionaire Club is a unified platform for luxury property discovery and professional portfolio tracking. The guidance felt discreet and responsive.',
  },
  {
    name: 'Nisha Bhatia',
    location: 'Gurgaon',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop',
    quote:
      'We loved the attention to detail and the curated feel of every listing. It is the gold standard for premium real estate platforms.',
  },
];

const rating = [1, 2, 3, 4, 5];

const TestimonialPanel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 6500);

    return () => clearInterval(interval);
  }, []);

  const current = testimonials[activeIndex];

  return (
    <section className="testimonial-shell container">
      <div className="testimonial-shell__header">
        <p className="eyebrow">What Our Clients Say</p>
        <h2>Trusted by 10,000+ Happy Homeowners</h2>
        <p>
          Discreet service, premium advisory, and results that feel personal at every stage of the journey.
        </p>
      </div>

      <div className="testimonial-carousel">
        <button
          type="button"
          className="testimonial-nav testimonial-nav--left"
          onClick={() => setActiveIndex((currentIndex) => (currentIndex - 1 + testimonials.length) % testimonials.length)}
          aria-label="Previous testimonial"
        >
          <ChevronLeft size={18} />
        </button>

        <article className="testimonial-card">
          <div className="testimonial-card__media">
            <img src={current.image} alt={current.name} loading="lazy" />
            <div className="testimonial-card__quote-mark">
              <Quote size={18} />
            </div>
          </div>

          <div className="testimonial-card__content">
            <div className="testimonial-card__rating" aria-label="Five star rating">
              {rating.map((index) => (
                <Star key={index} size={14} fill="#C6A15B" color="#C6A15B" />
              ))}
            </div>
            <p className="testimonial-card__quote">{current.quote}</p>
            <div className="testimonial-card__meta">
              <strong>{current.name}</strong>
              <span>{current.location}</span>
            </div>
          </div>
        </article>

        <button
          type="button"
          className="testimonial-nav testimonial-nav--right"
          onClick={() => setActiveIndex((currentIndex) => (currentIndex + 1) % testimonials.length)}
          aria-label="Next testimonial"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="testimonial-dots" role="tablist" aria-label="Testimonial navigation">
        {testimonials.map((item, index) => (
          <button
            key={item.name}
            type="button"
            className={`testimonial-dot ${activeIndex === index ? 'testimonial-dot--active' : ''}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Show testimonial from ${item.name}`}
          />
        ))}
      </div>
    </section>
  );
};

export default TestimonialPanel;
