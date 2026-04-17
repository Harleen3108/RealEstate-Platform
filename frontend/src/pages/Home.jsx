import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { Search, MapPin, ArrowRight, Send, User, Bed, Home as HomeIcon, Zap, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/common/PropertyCard';
import ArticleCard from '../components/common/ArticleCard';
import ScheduleTourModal from '../components/common/ScheduleTourModal';
import TestimonialPanel from '../components/home/TestimonialPanel';
import {
  STATE_OPTIONS,
  getCitiesForState,
  inferCityFromProperty,
  inferStateFromProperty,
} from '../data/locationHierarchy';

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop',
    eyebrow: 'Curated Portfolio',
    title: 'Defining the Art of Luxury Living',
  },
  {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    eyebrow: 'Elite Estates',
    title: 'Residences that Transcend the Ordinary',
  },
  {
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
    eyebrow: 'Global Reach',
    title: 'Exclusive Properties, Worldwide Presence',
  },
];

const HOME_CATEGORIES = ['All', 'Apartment', 'Villa', 'Commercial', 'Land', 'PG', 'CoLiving'];

const bhkCards = [
  { label: '1 BHK', icon: Bed, query: 1 },
  { label: '2 BHK', icon: HomeIcon, query: 2 },
  { label: '3 BHK', icon: Zap, query: 3 },
  { label: '4+ BHK', icon: Crown, query: 4 },
];

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [slideIndex, setSlideIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [tourProperty, setTourProperty] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [propertiesRes, articlesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/properties`),
          axios.get(`${API_BASE_URL}/articles?limit=6`),
        ]);
        setProperties(propertiesRes.data);
        setArticles(articlesRes.data.articles || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setSlideIndex((index) => (index + 1) % heroSlides.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const approved = properties.filter((property) => property.isApproved && property.status !== 'Blocked');
  const selectedStateCities = selectedState ? getCitiesForState(selectedState) : [];

  const filteredApproved = approved.filter((property) => {
    const state = inferStateFromProperty(property);
    const city = inferCityFromProperty(property);
    const query = searchQuery.trim().toLowerCase();

    const matchesState = !selectedState || state.toLowerCase() === selectedState.toLowerCase();
    const matchesCity = !selectedCity || city.toLowerCase() === selectedCity.toLowerCase();
    const matchesQuery =
      !query ||
      [property.title, property.location, property.description, property.builder]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));

    return matchesState && matchesCity && matchesQuery;
  });

  const featured = [...filteredApproved]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const opportunities = filteredApproved
    .filter((property) => activeCategory === 'All' || property.propertyType === activeCategory)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (selectedState) params.set('state', selectedState);
    if (selectedCity) params.set('city', selectedCity);
    if (searchQuery.trim()) params.set('location', searchQuery.trim());
    navigate(params.toString() ? `/marketplace?${params.toString()}` : '/marketplace');
  };

  const handleInvest = (event) => {
    if (!user) {
      event.preventDefault();
      navigate('/login');
    }
  };

  const handleTourClick = (property) => setTourProperty(property);

  const bhkCounts = {
    1: approved.filter((property) => property.bedrooms === 1),
    2: approved.filter((property) => property.bedrooms === 2),
    3: approved.filter((property) => property.bedrooms === 3),
    4: approved.filter((property) => (property.bedrooms || 0) >= 4),
  };

  return (
    <div className="animate-fade" style={{ background: 'var(--background)' }}>
      <section
        style={{
          position: 'relative',
          height: 'clamp(560px, 88vh, 780px)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          color: '#F8FAFC',
        }}
      >
        {heroSlides.map((slide, index) => (
          <div
            key={slide.title}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: index === slideIndex ? 1 : 0,
              transition: 'opacity 1.8s ease-in-out, transform 8s ease',
              transform: index === slideIndex ? 'scale(1.04)' : 'scale(1)',
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.35) 45%, rgba(15,23,42,0.85) 100%)',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '760px' }}>
            <p className="eyebrow" style={{ color: '#C6A15B' }}>
              {heroSlides[slideIndex].eyebrow}
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
                fontWeight: 600,
                lineHeight: 1.08,
                color: '#F8FAFC',
                marginBottom: '1.25rem',
                textShadow: '0 2px 30px rgba(0,0,0,0.35)',
              }}
            >
              {heroSlides[slideIndex].title}
            </h1>
            <p
              style={{
                fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
                color: 'rgba(248,250,252,0.82)',
                maxWidth: '600px',
                marginBottom: '2.25rem',
                lineHeight: 1.65,
              }}
            >
              A discreetly curated platform for exceptional residences, trusted agents, and discerning investors across the globe.
            </p>

            <form onSubmit={handleSearch} className="search-bar-shell" style={{ maxWidth: '860px' }}>
              <div className="search-bar-grid">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <MapPin size={18} color="#64748B" style={{ flexShrink: 0, marginLeft: '4px' }} />
                  <select
                    className="search-bar-select"
                    value={selectedState}
                    onChange={(event) => {
                      setSelectedState(event.target.value);
                      setSelectedCity('');
                    }}
                  >
                    <option value="">Select State</option>
                    {STATE_OPTIONS.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  className="search-bar-select"
                  value={selectedCity}
                  onChange={(event) => setSelectedCity(event.target.value)}
                  disabled={!selectedState}
                >
                  <option value="">Select City</option>
                  {selectedStateCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', gridColumn: '1 / -1' }}>
                  <Search size={18} color="#64748B" style={{ flexShrink: 0, marginLeft: '4px' }} />
                  <input
                    type="text"
                    className="search-bar-input"
                    placeholder="Search locality, project, or builder"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>

                <button type="submit" className="search-bar-submit">
                  Search
                </button>
              </div>

              <div className="state-chip-row" aria-label="Popular states">
                {['All', ...STATE_OPTIONS].map((state) => (
                  <button
                    key={state}
                    type="button"
                    className={`state-chip ${selectedState === state || (state === 'All' && !selectedState) ? 'state-chip--active' : ''}`}
                    onClick={() => {
                      if (state === 'All') {
                        setSelectedState('');
                        setSelectedCity('');
                        return;
                      }
                      setSelectedState(state);
                      setSelectedCity('');
                    }}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </form>

            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.8rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Buy', to: '/marketplace?intent=buy' },
                { label: 'Rent', to: '/marketplace?intent=rent' },
                { label: 'Sell', to: '/marketplace?intent=sell' },
                { label: 'Explore', to: '/marketplace' },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  style={{
                    color: '#F8FAFC',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    borderBottom: '1px solid rgba(198,161,91,0.6)',
                    paddingBottom: '2px',
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div
            className="desktop-only"
            style={{ position: 'absolute', bottom: '2rem', right: '1.5rem', display: 'flex', gap: '8px' }}
          >
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setSlideIndex(index)}
                aria-label={`Slide ${index + 1}`}
                style={{
                  width: index === slideIndex ? '40px' : '14px',
                  height: '3px',
                  background: index === slideIndex ? 'var(--primary)' : 'rgba(248,250,252,0.45)',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'all 0.4s ease',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: 'clamp(4rem, 9vw, 6.5rem) 1.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="eyebrow">Handpicked</p>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}>Featured Listings</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '560px', margin: '1rem auto 0' }}>
            Our most extraordinary residences, selected for architectural merit, location, and enduring value.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading listings…</div>
        ) : featured.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>No listings available.</div>
        ) : (
          <div className="marquee-container">
            <div className="marquee-content">
              {[...featured, ...featured].map((property, index) => (
                <div key={`${property._id}-${index}`} className="marquee-item">
                  <PropertyCard property={property} onScheduleClick={handleTourClick} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="container" style={{ padding: '2rem 1.5rem clamp(4rem, 9vw, 6.5rem)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <p className="eyebrow">Investment Grade</p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>Top Opportunities</h2>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            {HOME_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: activeCategory === category ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeCategory === category ? '1.5px solid var(--primary)' : '1.5px solid transparent',
                  paddingBottom: '6px',
                  transition: 'var(--transition)',
                }}
              >
                {category === 'All' ? 'All' : `${category}s`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading…</div>
        ) : opportunities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>No opportunities in this category.</div>
        ) : (
          <div className="lx-grid">
            {opportunities.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                variant="investment"
                ctaLabel="Invest Now"
                requiresAuthFor="invest"
                user={user}
                onCtaClick={handleInvest}
                onScheduleClick={handleTourClick}
              />
            ))}
          </div>
        )}
      </section>

      <TestimonialPanel />

      <section className="container" style={{ padding: 'clamp(4rem, 9vw, 6.5rem) 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="eyebrow">Knowledge Hub</p>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', marginBottom: '1rem' }}>Latest Articles & Insights</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto' }}>
            Expert tips, market trends, and guides to help you make informed real estate decisions
          </p>
        </div>

        {articles.length > 0 ? (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
              {articles.slice(0, 3).map((article) => (
                <ArticleCard key={article._id} article={article} compact />
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <Link
                to="/articles"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '0.95rem 2rem',
                  background: 'var(--primary)',
                  color: '#0F172A',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                View All Articles
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        ) : null}
      </section>

      <section
        style={{
          background: 'linear-gradient(135deg, rgba(198,161,91,0.08) 0%, rgba(198,161,91,0.02) 100%)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: 'clamp(4rem, 9vw, 6.5rem) 1.5rem',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="eyebrow">Smart Financing</p>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', marginBottom: '1rem' }}>Financial Tools</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto' }}>
              Calculate your EMI, explore financing options, and make informed decisions about your real estate investment
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {[
              { title: 'EMI Calculator', description: 'Plan monthly payments and compare affordability.', to: '/calculator/emi' },
              { title: 'Price Intelligence', description: 'Review market timing, confidence, and AI estimate context.', to: '/dashboard/agency/price-intelligence' },
            ].map((item) => (
              <Link key={item.title} to={item.to} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="glass-card" style={{ height: '100%', padding: '2rem', display: 'grid', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'rgba(198,161,91,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <HomeIcon size={24} />
                  </div>
                  <div>
                    <h3 style={{ marginBottom: '0.5rem' }}>{item.title}</h3>
                    <p style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                  </div>
                  <div style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    Open tool <ArrowRight size={16} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'rgba(198,161,91,0.04)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ padding: 'clamp(4rem, 9vw, 6.5rem) 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="eyebrow">Category Listings</p>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}>Properties by Bedroom</h2>
          </div>

          <div className="bhk-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {bhkCards.map(({ label, icon: Icon, query }) => {
              const bucket = bhkCounts[query] || [];
              return (
                <div
                  key={label}
                  style={{ background: 'var(--background)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '2rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '48px', height: '48px', background: 'rgba(198,161,91,0.12)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{label}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>{bucket.length} available</p>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                    {bucket.length > 0 ? (
                      <>
                        {bucket.slice(0, 2).map((property) => (
                          <Link
                            key={property._id}
                            to="/marketplace"
                            style={{ display: 'block', padding: '0.6rem 0', textDecoration: 'none', borderBottom: '1px solid rgba(198,161,91,0.1)' }}
                          >
                            <div style={{ color: 'var(--text)', fontSize: '0.85rem', fontWeight: 500 }}>{property.title}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{property.price.toLocaleString('en-IN')}</div>
                          </Link>
                        ))}
                        <Link
                          to={`/marketplace?bedrooms=${query}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.8rem' }}
                        >
                          View All →
                        </Link>
                      </>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No properties</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '4rem 0 2rem' }}>
        <div className="container" style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Millionaire Club</h4>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.75 }}>
              Private access to luxury homes, trusted advisors, and curated investment opportunities.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.82rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Contact
            </h4>
            <div style={{ display: 'grid', gap: '0.8rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={16} color="var(--primary)" /> +91 92536 25099
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Send size={16} color="var(--primary)" /> kp@avanienterprises.in
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.82rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Newsletter
            </h4>
            <form onSubmit={(event) => event.preventDefault()} style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface)' }}>
              <input
                type="email"
                placeholder="Your email"
                style={{ flex: 1, padding: '0.85rem 1rem', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '0.88rem' }}
              />
              <button type="submit" style={{ padding: '0 1.2rem', background: 'var(--primary)', border: 'none', color: '#0F172A', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', marginTop: '2rem', paddingTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          © 2026 Millionaire Club. Crafted for connoisseurs.
        </div>
      </footer>

      <ScheduleTourModal open={Boolean(tourProperty)} property={tourProperty} onClose={() => setTourProperty(null)} />
    </div>
  );
};

export default Home;
