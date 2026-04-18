import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Shield, Award, TrendingUp } from 'lucide-react';

const AboutUs = () => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  // Premium real estate property images
  const brandImages = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1570129477492-45927003d148?w=800&h=800&fit=crop',
  ];

  const handleImageError = (idx) => {
    setImageErrors(prev => ({ ...prev, [idx]: true }));
  };

  const features = [
    {
      icon: Shield,
      title: 'Verified Agencies',
      description: 'All partners undergo rigorous background checks and compliance verification to ensure legitimacy and professionalism.',
    },
    {
      icon: Award,
      title: 'Price Intelligence',
      description: 'AI-powered market analysis, comparable properties, and accurate valuations for informed investment decisions.',
    },
    {
      icon: TrendingUp,
      title: 'Institutional Tools',
      description: 'Portfolio tracking, lead management, and advanced CRM designed for serious investors and agencies.',
    },
  ];

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      {/* Add top padding to account for fixed navbar */}
      <div style={{ height: '75px' }} />

      {/* Brand Section */}
      <section style={{
        padding: '60px 40px',
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        alignItems: 'center',
      }}>
        {/* Title and Navigation */}
        <div>
          <h1 style={{
            fontSize: '3.2rem',
            fontWeight: '800',
            marginBottom: '40px',
            color: 'var(--text)',
            lineHeight: '1.1',
          }}>
            A Brand Like No Other
          </h1>

          {/* Image Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '30px',
          }}>
            {brandImages.map((img, idx) => (
              <div
                key={idx}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '0',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  background: imageErrors[idx] ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {!imageErrors[idx] && (
                  <img
                    src={img}
                    alt={`Brand showcase ${idx + 1}`}
                    onError={() => handleImageError(idx)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                )}
                {imageErrors[idx] && (
                  <div style={{
                    textAlign: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    padding: '1rem',
                  }}>
                    Premium Property {idx + 1}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'flex-start',
          }}>
            <button
              onClick={() => setCarouselIndex((prev) => (prev - 1 + brandImages.length) % brandImages.length)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--primary)';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--surface)';
                e.target.style.color = 'var(--text)';
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCarouselIndex((prev) => (prev + 1) % brandImages.length)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--primary)';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--surface)';
                e.target.style.color = 'var(--text)';
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Content Side */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}>
          <h2 style={{
            fontSize: '2.8rem',
            fontWeight: '800',
            color: 'var(--text)',
            lineHeight: '1.2',
          }}>
            Millionaire Club Platform
          </h2>

          <p style={{
            fontSize: '1.05rem',
            lineHeight: '1.6',
            color: 'var(--text-muted)',
          }}>
            A revolutionary real estate marketplace designed for distinguished buyers, investors, and agencies. Access curated premium properties, institutional-grade tools, and connect with verified experts in luxury real estate investment.
          </p>

          <button
            style={{
              alignSelf: 'flex-start',
              padding: '12px 32px',
              backgroundColor: '#b89968',
              color: '#1a1a1a',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderRadius: '0',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#a58659';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#b89968';
            }}
          >
            Explore
          </button>
        </div>
      </section>

      {/* About Us Details Section */}
      <section style={{
        padding: '100px 40px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '60px',
        }}>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: '700',
            letterSpacing: '2px',
            color: '#b89968',
            marginBottom: '12px',
            textTransform: 'uppercase',
          }}>
            About Us
          </div>

          <h2 style={{
            fontSize: '3rem',
            fontWeight: '800',
            color: 'var(--text)',
            lineHeight: '1.2',
            marginBottom: '24px',
            maxWidth: '600px',
          }}>
            Redefining Luxury Real Estate Excellence
          </h2>

          <p style={{
            fontSize: '1.05rem',
            lineHeight: '1.7',
            color: 'var(--text-muted)',
            maxWidth: '600px',
          }}>
            Millionaire Club is India's premier platform for high-net-worth property transactions. We connect elite buyers, seasoned investors, and certified real estate professionals through advanced technology, transparent pricing intelligence, and white-glove service.
          </p>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
        }}>
          {features.map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={idx}
                style={{
                  padding: '32px',
                  border: '1px solid var(--border)',
                  borderRadius: '0',
                  backgroundColor: 'var(--surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  backgroundColor: '#ede8e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <IconComponent size={28} color="#b89968" />
                </div>

                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  color: 'var(--text)',
                }}>
                  {feature.title}
                </h3>

                <p style={{
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  color: 'var(--text-muted)',
                }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
