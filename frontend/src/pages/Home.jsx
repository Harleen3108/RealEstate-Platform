import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import {
  Search, MapPin, ArrowRight, Instagram, Twitter, Facebook, Linkedin, Send,
  User, Users, TrendingUp, ShieldCheck, Award, Bed, Home as HomeIcon, Zap, Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/common/PropertyCard';
import ArticleCard from '../components/common/ArticleCard';

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

const CATEGORIES = ['All', 'Apartment', 'Villa', 'Commercial', 'Land', 'PG', 'CoLiving'];

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [slideIndex, setSlideIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [propertiesRes, articlesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/properties`),
          axios.get(`${API_BASE_URL}/articles?limit=6`)
        ]);
        setProperties(propertiesRes.data);
        setArticles(articlesRes.data.articles || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlideIndex((i) => (i + 1) % heroSlides.length), 6000);
    return () => clearInterval(t);
  }, []);

  const approved = properties.filter((p) => p.isApproved && p.status !== 'Blocked');

  const featured = [...approved]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const grid = approved
    .filter((p) => activeCategory === 'All' || p.propertyType === activeCategory)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = encodeURIComponent(searchQuery.trim());
    navigate(q ? `/marketplace?location=${q}` : '/marketplace');
  };

  const handleInvest = (e) => {
    if (!user) {
      e.preventDefault();
      navigate('/login');
    }
  };

  return (
    <div className="animate-fade" style={{ background: 'var(--background)' }}>
      {/* ===== HERO ===== */}
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
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: i === slideIndex ? 1 : 0,
              transition: 'opacity 1.8s ease-in-out',
              transform: i === slideIndex ? 'scale(1.04)' : 'scale(1)',
              transitionProperty: 'opacity, transform',
              transitionDuration: '1.8s, 8s',
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
              A discreetly curated platform for exceptional residences, trusted agents, and
              discerning investors across the globe.
            </p>

            {/* Search */}
            <form
              onSubmit={handleSearch}
              style={{
                background: 'rgba(248,250,252,0.96)',
                borderRadius: '4px',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                maxWidth: '620px',
                boxShadow: '0 20px 50px -20px rgba(0,0,0,0.45)',
              }}
            >
              <Search size={18} color="#64748B" style={{ marginLeft: '14px' }} />
              <input
                type="text"
                placeholder="Search by city, neighborhood, or address"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '14px 10px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#0F172A',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-sans)',
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.9rem 1.6rem' }}>
                Search
              </button>
            </form>

            {/* Quick category links (open for all) */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
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
                    fontSize: '0.92rem',
                    fontWeight: 500,
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

          {/* Slide indicators */}
          <div
            className="desktop-only"
            style={{
              position: 'absolute',
              bottom: '2rem',
              right: '1.5rem',
              display: 'flex',
              gap: '8px',
            }}
          >
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIndex(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  width: i === slideIndex ? '40px' : '14px',
                  height: '3px',
                  background: i === slideIndex ? 'var(--primary)' : 'rgba(248,250,252,0.45)',
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

      {/* ===== FEATURED LISTINGS (marquee) ===== */}
      <section className="container" style={{ padding: 'clamp(4rem, 9vw, 6.5rem) 1.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="eyebrow">Handpicked</p>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}>Featured Listings</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '560px', margin: '1rem auto 0' }}>
            Our most extraordinary residences, selected for architectural merit, location, and
            enduring value.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            Loading listings…
          </div>
        ) : featured.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            No listings available.
          </div>
        ) : (
          <div className="marquee-container">
            <div className="marquee-content">
              {[...featured, ...featured].map((property, index) => (
                <div key={`${property._id}-${index}`} className="marquee-item">
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ===== INVESTMENT GRID ===== */}
      <section className="container" style={{ padding: '2rem 1.5rem clamp(4rem, 9vw, 6.5rem)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <div>
            <p className="eyebrow">Investment Grade</p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>Top Opportunities</h2>
          </div>

          <div style={{ display: 'flex', gap: '1.75rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  color: activeCategory === cat ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom:
                    activeCategory === cat ? '1.5px solid var(--primary)' : '1.5px solid transparent',
                  paddingBottom: '6px',
                  transition: 'var(--transition)',
                }}
              >
                {cat === 'All' ? 'All' : `${cat}s`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            Loading…
          </div>
        ) : grid.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            No opportunities in this category.
          </div>
        ) : (
          <div className="lx-grid">
            {grid.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                variant="investment"
                ctaLabel="Invest Now"
                requiresAuthFor="invest"
                user={user}
                onCtaClick={handleInvest}
              />
            ))}
          </div>
        )}
      </section>

      {/* ===== BHK CATEGORY SECTION ===== */}
      <section style={{ background: 'rgba(198,161,91,0.04)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ padding: 'clamp(4rem, 9vw, 6.5rem) 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="eyebrow">Category Listings</p>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}>Properties by Bedroom</h2>
          </div>

          {/* BHK Categories - 4 Column Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
          }}
          className="bhk-grid">
            {/* 1 BHK */}
            <div style={{
              background: 'var(--background)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '2rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(198,161,91,0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: 'rgba(198,161,91,0.12)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}>
                  <Bed size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>1 BHK</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                    {approved.filter(p => p.bedrooms === 1).length} available
                  </p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                {approved.filter(p => p.bedrooms === 1).length > 0 ? (
                  <>
                    {approved.filter(p => p.bedrooms === 1).slice(0, 2).map((prop) => (
                      <Link
                        key={prop._id}
                        to={`/marketplace`}
                        style={{
                          display: 'block',
                          padding: '0.6rem 0',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                          borderBottom: '1px solid rgba(198,161,91,0.1)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--primary)';
                          e.currentTarget.style.paddingLeft = '6px';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'inherit';
                          e.currentTarget.style.paddingLeft = '0';
                        }}
                      >
                        <div style={{ color: 'var(--text)', fontSize: '0.85rem', fontWeight: 500 }}>
                          {prop.title}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                          ₹{(prop.price / 100000).toFixed(1)}L
                        </div>
                      </Link>
                    ))}
                    <Link
                      to="/marketplace?bedrooms=1"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '0.8rem',
                        color: 'var(--primary)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                      }}
                    >
                      View All →
                    </Link>
                  </>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No properties</p>
                )}
              </div>
            </div>

            {/* 2 BHK */}
            <div style={{
              background: 'var(--background)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '2rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(198,161,91,0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: 'rgba(198,161,91,0.12)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}>
                  <HomeIcon size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>2 BHK</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                    {approved.filter(p => p.bedrooms === 2).length} available
                  </p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                {approved.filter(p => p.bedrooms === 2).length > 0 ? (
                  <>
                    {approved.filter(p => p.bedrooms === 2).slice(0, 2).map((prop) => (
                      <Link
                        key={prop._id}
                        to={`/marketplace`}
                        style={{
                          display: 'block',
                          padding: '0.6rem 0',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                          borderBottom: '1px solid rgba(198,161,91,0.1)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--primary)';
                          e.currentTarget.style.paddingLeft = '6px';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'inherit';
                          e.currentTarget.style.paddingLeft = '0';
                        }}
                      >
                        <div style={{ color: 'var(--text)', fontSize: '0.85rem', fontWeight: 500 }}>
                          {prop.title}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                          ₹{(prop.price / 100000).toFixed(1)}L
                        </div>
                      </Link>
                    ))}
                    <Link
                      to="/marketplace?bedrooms=2"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '0.8rem',
                        color: 'var(--primary)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                      }}
                    >
                      View All →
                    </Link>
                  </>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No properties</p>
                )}
              </div>
            </div>

            {/* 3 BHK */}
            <div style={{
              background: 'var(--background)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '2rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(198,161,91,0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: 'rgba(198,161,91,0.12)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}>
                  <Zap size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>3 BHK</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                    {approved.filter(p => p.bedrooms === 3).length} available
                  </p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                {approved.filter(p => p.bedrooms === 3).length > 0 ? (
                  <>
                    {approved.filter(p => p.bedrooms === 3).slice(0, 2).map((prop) => (
                      <Link
                        key={prop._id}
                        to={`/marketplace`}
                        style={{
                          display: 'block',
                          padding: '0.6rem 0',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                          borderBottom: '1px solid rgba(198,161,91,0.1)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--primary)';
                          e.currentTarget.style.paddingLeft = '6px';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'inherit';
                          e.currentTarget.style.paddingLeft = '0';
                        }}
                      >
                        <div style={{ color: 'var(--text)', fontSize: '0.85rem', fontWeight: 500 }}>
                          {prop.title}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                          ₹{(prop.price / 100000).toFixed(1)}L
                        </div>
                      </Link>
                    ))}
                    <Link
                      to="/marketplace?bedrooms=3"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '0.8rem',
                        color: 'var(--primary)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                      }}
                    >
                      View All →
                    </Link>
                  </>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No properties</p>
                )}
              </div>
            </div>

            {/* 4+ BHK */}
            <div style={{
              background: 'var(--background)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '2rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(198,161,91,0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: 'rgba(198,161,91,0.12)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}>
                  <Crown size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>4+ BHK</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                    {approved.filter(p => p.bedrooms >= 4).length} available
                  </p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                {approved.filter(p => p.bedrooms >= 4).length > 0 ? (
                  <>
                    {approved.filter(p => p.bedrooms >= 4).slice(0, 2).map((prop) => (
                      <Link
                        key={prop._id}
                        to={`/marketplace`}
                        style={{
                          display: 'block',
                          padding: '0.6rem 0',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                          borderBottom: '1px solid rgba(198,161,91,0.1)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--primary)';
                          e.currentTarget.style.paddingLeft = '6px';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'inherit';
                          e.currentTarget.style.paddingLeft = '0';
                        }}
                      >
                        <div style={{ color: 'var(--text)', fontSize: '0.85rem', fontWeight: 500 }}>
                          {prop.title}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                          ₹{(prop.price / 100000).toFixed(1)}L
                        </div>
                      </Link>
                    ))}
                    <Link
                      to="/marketplace?bedrooms=4"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '0.8rem',
                        color: 'var(--primary)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                      }}
                    >
                      View All →
                    </Link>
                  </>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No properties</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED ARTICLES ===== */}
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              marginBottom: '2.5rem'
            }}>
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
                  transition: 'gap 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.gap = '14px'}
                onMouseLeave={(e) => e.currentTarget.style.gap = '10px'}
              >
                View All Articles
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        ) : null}
      </section>

      {/* ===== FINANCIAL TOOLS ===== */}
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

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginTop: '2.5rem'
          }}>
            {/* EMI Calculator Card */}
            <Link
              to="/calculator/emi"
              style={{
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  padding: '2.5rem 2rem',
                  background: 'var(--background)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(198,161,91,0.15)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(198,161,91,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      marginBottom: '1.2rem',
                      fontSize: '1.5rem',
                    }}
                  >
                    📊
                  </div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 600 }}>EMI Calculator</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Calculate your monthly EMI, understand affordability, and explore bank loan options with our intelligent calculator
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    marginTop: '1.5rem',
                    transition: 'gap 0.3s ease',
                  }}
                >
                  Get Started
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>

            {/* Additional Tool Placeholder */}
            <div
              style={{
                padding: '2.5rem 2rem',
                background: 'rgba(198,161,91,0.04)',
                border: '1.5px dashed var(--border)',
                borderRadius: 'var(--radius)',
                opacity: 0.6,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '2.5rem',
                  marginBottom: '1rem',
                }}
              >
                🔧
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>More Tools Coming</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Vastu Calculator & More
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT / TRUST ===== */}
      <section
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          className="container"
          style={{
            padding: 'clamp(4rem, 9vw, 6.5rem) 1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'clamp(2.5rem, 6vw, 5rem)',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                aspectRatio: '4/5',
                border: '1px solid var(--border)',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop"
                alt="Architecture"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '-20px',
                left: '-20px',
                background: 'var(--primary)',
                padding: '1.5rem 2rem',
                borderRadius: 'var(--radius)',
                color: '#0F172A',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700 }}>
                25+
              </div>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                Years of Excellence
              </div>
            </div>
          </div>

          <div>
            <p className="eyebrow">About Us</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4.2vw, 2.8rem)', marginBottom: '1.5rem' }}>
              A Standard Defined by Discretion & Expertise
            </h2>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '1rem',
                lineHeight: 1.8,
                marginBottom: '2.5rem',
              }}
            >
              Millionaire Club brings together distinguished agencies, investors, and clients under
              a single, elegantly engineered platform — combining an intuitive property marketplace
              with institutional-grade CRM and portfolio tracking.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
              }}
            >
              {[
                { Icon: ShieldCheck, title: 'Verified Agencies', text: 'Every partner vetted for provenance.' },
                { Icon: Award, title: 'Certified Experts', text: 'Specialists in luxury & investment.' },
                { Icon: TrendingUp, title: 'Smart Financing', text: 'Tailored structures, clear terms.' },
              ].map(({ Icon, title, text }) => (
                <div
                  key={title}
                  style={{
                    padding: '1.4rem',
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    transition: 'var(--transition)',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(198,161,91,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      marginBottom: '0.9rem',
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '0.35rem' }}>{title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.55 }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        style={{
          background: 'var(--background)',
          borderTop: '1px solid var(--border)',
          padding: '5rem 1.5rem 2rem',
        }}
      >
        <div
          className="container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '3rem',
            marginBottom: '3.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  background: 'var(--primary)',
                }}
              >
                <img
                  src="/logo.png"
                  alt="Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'var(--text)',
                }}
              >
                Millionaire <span style={{ color: 'var(--primary)' }}>Club</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              A unified platform for luxury property discovery, elite CRM, and professional
              portfolio tracking.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[
                { Icon: Instagram, url: 'https://www.instagram.com/avanienterprises.branding/' },
                { Icon: Linkedin, url: 'https://www.linkedin.com/in/avani-enterprises-137448390' },
                { Icon: Facebook, url: 'https://www.facebook.com/share/1AXpRTxpoH/' },
                { Icon: Twitter, url: 'https://x.com/avanienterprises' },
              ].map(({ Icon, url }, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    transition: 'var(--transition)',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                  onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.82rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '1.25rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Discover
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Buy', to: '/marketplace?intent=buy' },
                { label: 'Rent', to: '/marketplace?intent=rent' },
                { label: 'Sell', to: '/marketplace?intent=sell' },
                { label: 'All Listings', to: '/marketplace' },
              ].map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.82rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '1.25rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Tower B, 3rd Floor, Unitech Cyber Park, Sector 39, Gurugram, Haryana 122002</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={16} color="var(--primary)" /> +91 92536 25099
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Send size={16} color="var(--primary)" /> kp@avanienterprises.in
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.82rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '1.25rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Newsletter
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Receive private listings and market insights.
            </p>
            <form
              style={{
                display: 'flex',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                background: 'var(--surface)',
              }}
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Your email"
                style={{
                  flex: 1,
                  padding: '0.85rem 1rem',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text)',
                  fontSize: '0.88rem',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '0 1.2rem',
                  background: 'var(--primary)',
                  border: 'none',
                  color: '#0F172A',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '1.5rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.82rem',
          }}
        >
          © 2026 Avani Enterprises. Crafted for connoisseurs.
        </div>
      </footer>

      <style>{`
        @media (max-width: 1200px) {
          .bhk-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .bhk-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
