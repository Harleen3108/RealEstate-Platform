import React, { useEffect, useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, MapPin, CheckCircle2 } from 'lucide-react';

const testimonials = [
  {
    name: 'The Sharma Family',
    location: 'Gurgaon, Haryana',
    propertyType: '4BHK Villa',
    image: 'https://images.pexels.com/photos/3807395/pexels-photo-3807395.jpeg?auto=compress&cs=tinysrgb&w=1600',
    quote:
      'Buying our first home with three generations under one roof felt impossible until we found Millionaire Club. The team understood exactly what a joint family needs.',
  },
  {
    name: 'Aarav & Priya Iyer',
    location: 'Bandra West, Mumbai',
    propertyType: '3BHK Apartment',
    image: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=1600',
    quote:
      'From the first site visit to handing over the keys, the experience was discreet, premium, and deeply personal. Our little one already calls it home.',
  },
  {
    name: 'The Bhatia Household',
    location: 'DLF Phase 3, Gurgaon',
    propertyType: 'Luxury Villa',
    image: 'https://images.pexels.com/photos/8088495/pexels-photo-8088495.jpeg?auto=compress&cs=tinysrgb&w=1600',
    quote:
      'We wanted a home that welcomed both our parents and our children. The advisory team understood our values and found a residence we are proud to grow into.',
  },
  {
    name: 'Dr. Rohan & Ananya Kapoor',
    location: 'Jubilee Hills, Hyderabad',
    propertyType: 'Premium Villa',
    image: 'https://images.pexels.com/photos/7148395/pexels-photo-7148395.jpeg?auto=compress&cs=tinysrgb&w=1600',
    quote:
      'Two working professionals, one shortlist, zero wasted weekends. Millionaire Club respected our time and delivered a home that feels like a retreat.',
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
      <div className="testimonial-shell__header reveal-slide">
        <p className="eyebrow">Voices From Our Residents</p>
        <h2>Home That Build <span className="text-gradient">Families</span></h2>
        <p>
          Real stories from families across India who found their forever address with Millionaire Club — curated listings, trusted advisory, and a team that listens.
        </p>
      </div>

      <div className="testimonial-carousel reveal-slide" data-reveal-delay="1">
        <button
          type="button"
          className="testimonial-nav testimonial-nav--left"
          onClick={() => setActiveIndex((currentIndex) => (currentIndex - 1 + testimonials.length) % testimonials.length)}
          aria-label="Previous testimonial"
        >
          <ChevronLeft size={18} />
        </button>

        <article className="testimonial-card testimonial-card--animated" key={activeIndex}>
          <div className="testimonial-card__media">
            <img src={current.image} alt={current.name} loading="lazy" />
            <div className="testimonial-card__media-overlay" />
            <div className="testimonial-card__quote-mark">
              <Quote size={18} />
            </div>
            {current.propertyType && (
              <div className="testimonial-card__property-tag">
                <CheckCircle2 size={12} /> {current.propertyType}
              </div>
            )}
          </div>

          <div className="testimonial-card__content">
            <div className="testimonial-card__rating" aria-label="Five star rating">
              {rating.map((index) => (
                <Star key={index} size={15} fill="#C6A15B" color="#C6A15B" />
              ))}
              <span className="testimonial-card__rating-label">Verified Review</span>
            </div>
            <p className="testimonial-card__quote">&ldquo;{current.quote}&rdquo;</p>
            <div className="testimonial-card__meta">
              <div>
                <strong>{current.name}</strong>
                <span className="testimonial-card__location">
                  <MapPin size={13} /> {current.location}
                </span>
              </div>
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

      <div className="testimonial-dots reveal-slide" data-reveal-delay="2" role="tablist" aria-label="Testimonial navigation">
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
