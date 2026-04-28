import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { Search, MapPin, ArrowRight, Send, Bed, Home as HomeIcon, Zap, Crown, Instagram, Linkedin, Facebook, Twitter, Phone, Mail, Building2, Briefcase, TreePine, Users, Truck, Calendar } from 'lucide-react';
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

const MAIN_CATEGORIES = [
  { label: 'Villas', type: 'Villa', icon: Crown, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200&auto=format&fit=crop', gated: false },
  { label: 'Apartments', type: 'Apartment', icon: Building2, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200&auto=format&fit=crop', gated: false },
  { label: 'PGs', type: 'PG', icon: Users, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop', gated: true },
  { label: 'Commercial', type: 'Commercial', icon: Briefcase, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop', gated: false },
  { label: 'Land', type: 'Land', icon: TreePine, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop', gated: false },
];

const EXPLORE_STATES = ['Maharashtra', 'Haryana', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat'];

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [tourProperty, setTourProperty] = useState(null);
  const [moversForm, setMoversForm] = useState({ name: '', phone: '', city: '', date: '', size: '' });
  const [moversSubmitting, setMoversSubmitting] = useState(false);
  const [moversStatus, setMoversStatus] = useState(null);
  const [exploreState, setExploreState] = useState('Maharashtra');
  const [verifiedAgencies, setVerifiedAgencies] = useState([]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [propertiesRes, articlesRes, agenciesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/properties`),
          axios.get(`${API_BASE_URL}/articles?limit=6`),
          axios.get(`${API_BASE_URL}/auth/agencies`),
        ]);
        setProperties(propertiesRes.data);
        setArticles(articlesRes.data.articles || []);
        setVerifiedAgencies(Array.isArray(agenciesRes.data) ? agenciesRes.data : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const approved = properties.filter((property) => property.isApproved && property.status !== 'Blocked');
  const selectedStateCities = selectedState ? getCitiesForState(selectedState) : [];
  const approvedCities = new Set(approved.map((property) => inferCityFromProperty(property)).filter(Boolean));

  const formatMetric = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
    }
    return `${value}`;
  };

  // Home hero search only routes users to marketplace filters; it does not curate these sections.
  const featured = [...approved]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const opportunities = approved
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

  const handleCategoryClick = (category) => {
    if (category.gated && !user) {
      alert('Please login to view PG listings');
      navigate('/login');
      return;
    }
    navigate(`/marketplace?type=${encodeURIComponent(category.type)}`);
  };

  const exploreStateProperties = approved
    .filter((p) => inferStateFromProperty(p) === exploreState)
    .slice(0, 3);

  const handleMoversSubmit = async (event) => {
    event.preventDefault();
    if (moversSubmitting) return;
    setMoversSubmitting(true);
    setMoversStatus(null);
    try {
      await axios.post(`${API_BASE_URL}/packers-movers/leads`, {
        userName: moversForm.name,
        phone: moversForm.phone,
        moveFrom: moversForm.city,
        moveTo: moversForm.city,
        moveDate: moversForm.date,
        propertySize: moversForm.size,
        serviceType: 'full_service',
        source: 'home_banner',
      });
      setMoversStatus({ type: 'success', message: 'Your request has been received. A dedicated concierge will contact you shortly.' });
      setMoversForm({ name: '', phone: '', city: '', date: '', size: '' });
    } catch (err) {
      setMoversStatus({ type: 'error', message: err.response?.data?.message || 'Could not submit, try again.' });
    } finally {
      setMoversSubmitting(false);
    }
  };

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
          minHeight: '100vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          color: '#F8FAFC',
          paddingTop: '80px',
          paddingBottom: '2rem',
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={heroSlides[0].image}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            // Scale slightly from top-left so the bottom-right of the source
            // video (Veo watermark) is cropped off-screen.
            transform: 'scale(1.08)',
            transformOrigin: '0 0',
          }}
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
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
            <p className="eyebrow hero-label" style={{ color: '#C6A15B' }}>
              {heroSlides[0].eyebrow}
            </p>
            <h1
              className="hero-title"
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
              {heroSlides[0].title}
            </h1>
            <p
              className="hero-subtitle"
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

            <form onSubmit={handleSearch} className="search-bar-shell search-bar-shell--hero hero-search search-bar-container" style={{ maxWidth: '860px' }}>
              <div className="search-bar-hero">
                <div className="search-bar-hero__segment search-bar-hero__segment--select">
                  <MapPin size={16} color="#c6a15b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
                  <select
                    className="search-bar-select"
                    value={selectedState}
                    onChange={(event) => {
                      setSelectedState(event.target.value);
                      setSelectedCity('');
                    }}
                    style={{ paddingLeft: '2.4rem' }}
                  >
                    <option value="">Select State</option>
                    {STATE_OPTIONS.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="search-bar-hero__segment search-bar-hero__segment--select">
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
                </div>

                <div className="search-bar-hero__segment search-bar-hero__segment--search">
                  <Search size={16} color="#c6a15b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
                  <input
                    type="text"
                    className="search-bar-input"
                    placeholder="Search locality, project, or builder"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    style={{ paddingLeft: '2.4rem' }}
                  />
                </div>

                <button type="submit" className="search-bar-submit search-bar-submit--hero" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                  <Search size={16} />
                  <span>Search</span>
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

            <div className="hero-tabs" style={{ display: 'flex', gap: '1.25rem', marginTop: '1.8rem', flexWrap: 'wrap' }}>
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
        </div>
      </section>

      {/* Trusted by Indian Families — social proof */}
      <section className="container trusted-section" style={{ padding: 'clamp(1.25rem, 3vw, 2rem) 1.5rem 1rem' }}>
        <div className="trusted-grid">
          <div className="trusted-copy reveal">
            <p className="eyebrow">Building Trust</p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4.5vw, 2.75rem)', margin: '0.3rem 0 1rem', lineHeight: 1.15 }}>
              Trusted by <span className="text-gradient">buyers across India</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7, margin: 0, maxWidth: '480px' }}>
              The figures below reflect the current property feed and verified agency directory, giving you a clear view of platform activity.
            </p>
            <div className="trusted-stats">
              {[
                { label: 'Approved Listings', value: formatMetric(approved.length) },
                { label: 'Cities Covered', value: formatMetric(approvedCities.size) },
                { label: 'Verified Agencies', value: formatMetric(verifiedAgencies.length) },
              ].map((s, i) => (
                <div key={s.label} className="reveal" data-reveal-delay={i + 1}>
                  <div className="trusted-stats__value stat-number" data-target={s.value}>{s.value}</div>
                  <div className="trusted-stats__label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="trusted-collage reveal" data-reveal-delay="1">
            <div className="trusted-tile trusted-tile--lg photo-grid-item">
              <img src="https://images.unsplash.com/photo-1611095973763-414019e72400?q=80&w=900&auto=format&fit=crop" alt="Happy Indian family at home" loading="lazy" />
            </div>
            <div className="trusted-tile photo-grid-item">
              <img src="https://images.unsplash.com/photo-1607863680198-23d4b2565df0?q=80&w=700&auto=format&fit=crop" alt="Indian couple receiving keys" loading="lazy" />
            </div>
            <div className="trusted-tile photo-grid-item">
              <img src="https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=700&auto=format&fit=crop" alt="Family with kids in new home" loading="lazy" />
            </div>
            <div className="trusted-tile trusted-tile--wide photo-grid-item">
              <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1200&auto=format&fit=crop" alt="Luxury lifestyle interior" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Categories */}
      <section className="container" style={{ padding: 'clamp(3rem, 7vw, 5rem) 1.5rem 1rem' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p className="eyebrow">Browse By Type</p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4.5vw, 2.75rem)', margin: 0 }}>Find Your Space</h2>
        </div>
        <div className="main-categories-grid">
          {MAIN_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className="main-category-card property-type-card reveal"
              data-reveal-delay={Math.min(idx, 4)}
            >
              <div className="main-category-card__media">
                <img src={cat.image} alt={cat.label} loading="lazy" />
                <div className="main-category-card__overlay" />
              </div>
              <div className="main-category-card__body">
                <div className="main-category-card__icon"><cat.icon size={18} /></div>
                <div style={{ textAlign: 'left' }}>
                  <div className="main-category-card__label">{cat.label}</div>
                  {cat.gated && <div className="main-category-card__sub">Login required</div>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="container" style={{ padding: 'clamp(4rem, 9vw, 6.5rem) 1.5rem 2rem' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
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
        <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
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

      {/* Explore by State */}
      <section className="container" style={{ padding: 'clamp(3rem, 7vw, 5rem) 1.5rem' }}>
        <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <p className="eyebrow">Regional Highlights</p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', margin: 0 }}>Explore by State</h2>
          </div>
        </div>

        <div className="explore-state-tabs" role="tablist">
          {EXPLORE_STATES.map((state) => (
            <button
              key={state}
              type="button"
              role="tab"
              aria-selected={exploreState === state}
              className={`explore-state-tab ${exploreState === state ? 'explore-state-tab--active' : ''}`}
              onClick={() => setExploreState(state)}
            >
              {state}
            </button>
          ))}
        </div>

        {exploreStateProperties.length > 0 ? (
          <>
            <div className="lx-grid" style={{ marginTop: '1.5rem' }}>
              {exploreStateProperties.map((property) => (
                <PropertyCard key={property._id} property={property} onScheduleClick={handleTourClick} />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate(`/marketplace?state=${encodeURIComponent(exploreState)}`)}
                style={{ padding: '0.85rem 2rem', borderRadius: '999px', borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.04em' }}
              >
                View More in {exploreState} <ArrowRight size={16} style={{ marginLeft: 6, verticalAlign: 'middle' }} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', marginTop: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
            No active listings in {exploreState} yet. Check back soon.
          </div>
        )}
      </section>

      {/* Packers & Movers Banner */}
      <section className="container" style={{ padding: 'clamp(3rem, 7vw, 5rem) 1.5rem' }}>
        <div className="movers-banner reveal">
          <div className="movers-banner__copy">
            <div className="movers-banner__icon"><Truck size={22} /></div>
            <p className="eyebrow" style={{ color: '#fde68a' }}>Relocation Partner</p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', margin: '0.4rem 0 0.6rem', color: '#fff' }}>Need Help Moving?</h2>
            <p style={{ color: 'rgba(255,255,255,0.78)', margin: 0, maxWidth: '420px' }}>
              Trusted packers & movers at negotiated rates for Millionaire Club clients. Share your details — we&apos;ll call within the hour.
            </p>
          </div>
          <form onSubmit={handleMoversSubmit} className="movers-banner__form">
            <input
              type="text"
              required
              placeholder="Your name"
              value={moversForm.name}
              onChange={(e) => setMoversForm({ ...moversForm, name: e.target.value })}
              className="movers-input"
            />
            <input
              type="tel"
              required
              pattern="[0-9+ \-]{7,}"
              placeholder="Phone number"
              value={moversForm.phone}
              onChange={(e) => setMoversForm({ ...moversForm, phone: e.target.value })}
              className="movers-input"
            />
            <input
              type="text"
              required
              placeholder="City"
              value={moversForm.city}
              onChange={(e) => setMoversForm({ ...moversForm, city: e.target.value })}
              className="movers-input"
            />
            <select
              required
              value={moversForm.size}
              onChange={(e) => setMoversForm({ ...moversForm, size: e.target.value })}
              className="movers-input"
              style={{ appearance: 'none', cursor: 'pointer', backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23c6a15b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.4rem' }}
            >
              <option value="" disabled>Property size</option>
              <option value="1bhk">1 BHK</option>
              <option value="2bhk">2 BHK</option>
              <option value="3bhk">3 BHK</option>
              <option value="4bhk">4 BHK</option>
              <option value="villa">Villa</option>
              <option value="office">Office</option>
            </select>
            <div style={{ position: 'relative' }}>
              <Calendar size={16} color="#c6a15b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="date"
                required
                value={moversForm.date}
                onChange={(e) => setMoversForm({ ...moversForm, date: e.target.value })}
                className="movers-input"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
            <button type="submit" disabled={moversSubmitting} className="movers-submit">
              {moversSubmitting ? 'Submitting...' : 'Schedule Concierge Call'} <ArrowRight size={16} />
            </button>
            {moversStatus && (
              <div className="movers-status" style={{ color: moversStatus.type === 'success' ? '#86efac' : '#fca5a5' }}>
                {moversStatus.message}
              </div>
            )}
          </form>
        </div>
      </section>

      <TestimonialPanel />

      <section className="container" style={{ padding: 'clamp(4rem, 9vw, 6.5rem) 1.5rem' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="eyebrow">Knowledge Hub</p>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', marginBottom: '1rem' }}>Latest Articles & Insights</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto' }}>
            Expert tips, market trends, and guides to help you make informed real estate decisions
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div className="articles-grid">
            {articles.length > 0 ? (
              articles.slice(0, 4).map((article) => (
                <ArticleCard key={article._id} article={article} compact />
              ))
            ) : (
              [
                {
                  title: 'How To Identify A High-Growth Micro-Market In 2026',
                  description: 'A practical framework to evaluate demand depth, rental velocity, and infrastructure tailwinds before you invest.',
                  image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1600&auto=format&fit=crop',
                },
                {
                  title: 'Rental Yield Vs Capital Appreciation: What Matters Most?',
                  description: 'Understand when to prioritize cash flow and when to prioritize long-term value compounding in Indian metros.',
                  image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1600&auto=format&fit=crop',
                },
                {
                  title: 'Due Diligence Checklist Before Booking Any Property',
                  description: 'From title checks to developer track record, use this checklist to avoid common mistakes and delays.',
                  image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600&auto=format&fit=crop',
                },
              ].map((item, index) => (
                <div key={index} className="glass-card" style={{ padding: '2rem', display: 'grid', gap: '1rem', borderRadius: 0 }}>
                  <div style={{ height: '190px', borderRadius: 0, overflow: 'hidden', marginBottom: '0.15rem' }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  <p className="eyebrow" style={{ marginBottom: 0 }}>Editorial</p>
                  <h3 style={{ margin: 0, fontSize: '1.45rem' }}>{item.title}</h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.7 }}>{item.description}</p>
                  <Link to="/articles" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                    Read Articles <ArrowRight size={16} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                  </Link>
                </div>
              ))
            )}
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

          <div className="tools-grid">
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
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="eyebrow">Category Listings</p>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}>Properties by Bedroom</h2>
          </div>

          <div className="bhk-grid">
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

      <footer style={{ borderTop: '1px solid var(--border)', padding: '4rem 0 2rem' }}>
        <div className="container footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <img src="/logo.png" alt="Millionaire Club" style={{ width: '38px', height: '38px', borderRadius: '4px' }} />
              <h4 style={{ fontSize: '1.1rem', margin: 0, lineHeight: 1.15 }}>
                Millionaire <span style={{ color: 'var(--primary)' }}>Club</span>
              </h4>
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: '320px', fontSize: '0.95rem' }}>
              A unified platform for luxury property discovery, elite CRM, and professional portfolio tracking.
            </p>
            <div style={{ display: 'flex', gap: '0.9rem', marginTop: '1.25rem' }}>
              {[
                { Icon: Instagram, href: 'https://www.instagram.com/avanienterprises.branding/', label: 'Instagram' },
                { Icon: Linkedin, href: '#', label: 'LinkedIn' },
                { Icon: Facebook, href: 'https://www.facebook.com/people/Avani-Enterprises/61576229620845/?rdid=iK5tOBcqbWYF7kfd&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1AXpRTxpoH%2F', label: 'Facebook' },
                { Icon: Twitter, href: 'https://x.com/avanienterprises', label: 'X' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href === '#' ? undefined : '_blank'}
                  rel={href === '#' ? undefined : 'noreferrer noopener'}
                  aria-label={label}
                  style={{
                    width: '44px',
                    height: '44px',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    textDecoration: 'none',
                  }}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.98rem', marginBottom: '1rem', fontFamily: 'var(--font-sans)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              Discover
            </h4>
            <div style={{ display: 'grid', gap: '0.7rem' }}>
              <Link to="/marketplace?intent=buy" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.95rem' }}>Buy</Link>
              <Link to="/marketplace?intent=rent" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.95rem' }}>Rent</Link>
              <Link to="/marketplace?intent=sell" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.95rem' }}>Sell</Link>
              <Link to="/marketplace" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.95rem' }}>All Listings</Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.98rem', marginBottom: '1rem', fontFamily: 'var(--font-sans)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              Contact
            </h4>
            <div style={{ display: 'grid', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={18} color="var(--primary)" style={{ marginTop: '4px', flexShrink: 0 }} />
                <span>Tower B, 3rd Floor, Unitech Cyber Park, Sector 39, Gurugram, Haryana 122002</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={18} color="var(--primary)" /> <span>+91 92536 25099</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={18} color="var(--primary)" /> <span>kp@avanienterprises.in</span>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.98rem', marginBottom: '1rem', fontFamily: 'var(--font-sans)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              Newsletter
            </h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.95rem' }}>Receive private listings and market insights.</p>
            <form onSubmit={(event) => event.preventDefault()} style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden', background: 'var(--surface)' }}>
              <input
                type="email"
                placeholder="Your email"
                style={{ flex: 1, padding: '0.95rem 1rem', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '0.95rem' }}
              />
              <button
                type="submit"
                aria-label="Subscribe"
                style={{
                  minWidth: '44px',
                  padding: '0 1.15rem 0 0.95rem',
                  background: 'var(--primary)',
                  border: 'none',
                  color: '#0F172A',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Send size={18} style={{ marginRight: '2px' }} />
              </button>
            </form>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', marginTop: '2rem', paddingTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
          © 2026 Avani Enterprises. Crafted for connoisseurs.
        </div>
      </footer>

      <ScheduleTourModal open={Boolean(tourProperty)} property={tourProperty} onClose={() => setTourProperty(null)} />
    </div>
  );
};

export default Home;
