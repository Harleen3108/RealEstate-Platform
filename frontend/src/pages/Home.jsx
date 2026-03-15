import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL, { BACKEND_URL } from '../apiConfig';
import { Search, MapPin, Bed, Bath, Move, ArrowRight, ShieldCheck, UserCheck, Wallet, Instagram, Twitter, Facebook, Linkedin, Send, User, Building2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const heroImages = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop'
];

const heroTexts = [
    'Real Estate Investment',
    'Property Management',
    'Smart CRM Solutions',
    'Luxury Living',
    'Global Portfolios'
];

const Home = () => {
    const { theme } = useTheme();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [textFade, setTextFade] = useState(true);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/properties`);
                setProperties(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching properties:", error);
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    // Hero image slideshow
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Hero text rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setTextFade(false);
            setTimeout(() => {
                setCurrentTextIndex((prev) => (prev + 1) % heroTexts.length);
                setTextFade(true);
            }, 500);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const categories = ['All', 'Apartment', 'Villa', 'Commercial', 'Land'];

    const filteredProperties = properties
        .filter(p => p.isApproved && p.status !== 'Blocked')
        .filter(p => activeCategory === 'All' || p.propertyType === activeCategory)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/400x180?text=Premium+Asset';
        if (url.startsWith('http')) {
            if (window.location.hostname !== 'localhost' && url.includes('localhost:5000')) {
                return url.replace('http://localhost:5000', BACKEND_URL);
            }
            return url;
        }
        return `${BACKEND_URL}${url}`;
    };

    return (
        <div className="animate-fade" style={{ background: 'var(--background)' }}>
            {/* Hero Section */}
            <section style={{ 
                height: '85vh', 
                margin: '1rem', 
                borderRadius: '30px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: 'white',
                padding: '2rem'
            }}>
                {/* Slideshow Images */}
                {heroImages.map((img, index) => (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `url('${img}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: index === currentImageIndex ? 1 : 0,
                            transition: 'opacity 1.5s ease-in-out',
                            zIndex: 0
                        }}
                    />
                ))}
                {/* Theme-Aware Overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: theme === 'dark'
                        ? 'linear-gradient(to bottom, rgba(10,10,20,0.7) 0%, rgba(10,10,20,0.5) 50%, rgba(10,10,20,0.8) 100%)'
                        : 'linear-gradient(to bottom, rgba(15,15,25,0.65) 0%, rgba(15,15,25,0.45) 50%, rgba(15,15,25,0.75) 100%)',
                    zIndex: 1,
                    transition: 'background 0.5s ease'
                }} />

                {/* Hero Content */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '900', marginBottom: '1.5rem', lineHeight: '1.1' }}>
                        The Future of <br />
                        <span style={{ 
                            color: 'var(--primary)', 
                            display: 'inline-block',
                            opacity: textFade ? 1 : 0,
                            transform: textFade ? 'translateY(0)' : 'translateY(15px)',
                            transition: 'opacity 0.5s ease, transform 0.5s ease'
                        }}>
                            {heroTexts[currentTextIndex]}
                        </span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', maxWidth: '750px', margin: '0 auto 3rem', opacity: '0.9', fontWeight: '500', lineHeight: '1.6' }}>
                        A unified platform for property discovery, elite CRM for agencies, and professional portfolio tracking for global investors.
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                        <Link to="/login" className="btn btn-primary" style={{ padding: '1.2rem 3rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '800' }}>
                            Login Account
                        </Link>
                        <Link to="/register" className="btn btn-outline" style={{ padding: '1.2rem 3rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '800', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                            Register Now
                        </Link>
                    </div>

                    {/* Slide Indicators */}
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '2.5rem' }}>
                        {heroImages.map((_, i) => (
                            <div
                                key={i}
                                onClick={() => setCurrentImageIndex(i)}
                                style={{
                                    width: i === currentImageIndex ? '32px' : '10px',
                                    height: '4px',
                                    borderRadius: '2px',
                                    background: i === currentImageIndex ? 'var(--primary)' : 'rgba(255,255,255,0.4)',
                                    cursor: 'pointer',
                                    transition: 'all 0.4s ease'
                                }}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Listings */}
            <section className="container" style={{ padding: '6rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <p style={{ color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Handpicked</p>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text)' }}>Featured Listings</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        {categories.map((cat) => (
                            <span 
                                key={cat} 
                                onClick={() => setActiveCategory(cat)}
                                style={{ 
                                    fontWeight: '700', 
                                    color: activeCategory === cat ? 'var(--primary)' : 'var(--text-muted)', 
                                    cursor: 'pointer',
                                    borderBottom: activeCategory === cat ? '2px solid var(--primary)' : 'none',
                                    paddingBottom: '5px',
                                    transition: 'var(--transition)'
                                }}
                            >
                                {cat === 'All' ? 'All' : cat + 's'}
                            </span>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--primary)', fontWeight: '700' }} className="animate-pulse">Fetching premium listings...</div>
                ) : (
                    <div className="marquee-container">
                        <div className="marquee-content">
                            {filteredProperties.length > 0 ? [...filteredProperties, ...filteredProperties].map((property, index) => (
                                <div 
                                    key={`${property._id}-${index}`} 
                                    className="glass-card marquee-item" 
                                    style={{ 
                                        padding: 0, 
                                        overflow: 'hidden', 
                                        border: '1px solid var(--border)', 
                                        background: 'var(--surface)', 
                                        borderRadius: '20px'
                                    }}
                                >
                                    <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                                        <img src={getImageUrl(property.images?.[0])} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'var(--primary)', color: 'white', padding: '3px 10px', fontSize: '0.65rem', fontWeight: '800', borderRadius: '4px' }}>{property.propertyType?.toUpperCase()}</div>
                                        <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', color: 'var(--primary)', padding: '5px 12px', borderRadius: '6px', fontWeight: '800', fontSize: '0.9rem' }}>
                                            ₹{property.price.toLocaleString()}
                                        </div>
                                    </div>
                                    <div style={{ padding: '1.2rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{property.title}</h3>
                                        <div style={{ display: 'flex', gap: '0.8rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Move size={12} /> {property.size} SQFT</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Bed size={12} /> {property.bedrooms || 0}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Bath size={12} /> {property.bathrooms || 0}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.2rem' }}>
                                            <MapPin size={12} color="var(--primary)" /> <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{property.location}</span>
                                        </div>
                                        <Link to={`/property/${property._id}`} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--border)', color: 'var(--text)', padding: '0.6rem', fontSize: '0.85rem' }}>
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', width: '100%' }}>
                                    No listings found for this category.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </section>

            {/* About Us Section */}
            <section className="container" style={{ padding: '6rem 1.5rem', display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{ borderRadius: '30px', overflow: 'hidden', height: '600px', border: '1px solid var(--border)' }}>
                        <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" alt="Architecture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ position: 'absolute', bottom: '30px', left: '30px', background: 'var(--surface)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)', lineHeight: '1' }}>25+</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '1px' }}>Years of Excellence</div>
                    </div>
                </div>
                <div>
                    <p style={{ color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', marginBottom: '0.5rem' }}>About Us</p>
                    <h2 style={{ fontSize: '2.8rem', fontWeight: '900', color: 'var(--text)', lineHeight: '1.2', marginBottom: '1.5rem' }}>Empowering Real Estate Through Smart CRM Solutions</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2.5rem' }}>
                        At Avani Enterprises, we go beyond traditional real estate services by providing advanced CRM solutions designed specifically for the real estate industry. Our platform helps agencies manage property listings, track leads, and streamline client interactions efficiently. With a focus on innovation and usability, we enable real estate professionals to manage their operations, nurture leads, and grow their business through a centralized and intelligent system.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                        <div>
                            <div style={{ width: '50px', height: '50px', background: 'rgba(229, 90, 22, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1rem' }}>
                                <UserCheck size={24} />
                            </div>
                            <h4 style={{ fontWeight: '800', color: 'var(--text)', marginBottom: '0.5rem' }}>Certified Agents</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>Our team consists of industry experts with deep market knowledge.</p>
                        </div>
                        <div>
                            <div style={{ width: '50px', height: '50px', background: 'rgba(229, 90, 22, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1rem' }}>
                                <Wallet size={24} />
                            </div>
                            <h4 style={{ fontWeight: '800', color: 'var(--text)', marginBottom: '0.5rem' }}>Smart Financing</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>Flexible financial solutions tailored to your unique investment goals.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '6rem 1.5rem 2rem' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr', gap: '5rem', marginBottom: '5rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'var(--primary)', overflow: 'hidden' }}>
                                <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text)' }}>Avani <span style={{ color: 'var(--primary)' }}>Enterprises</span></div>
                        </div>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '2rem' }}>
                            Expert Real Estate CRM Support <br/>
                            Our platform is designed to simplify property management and lead tracking for real estate agencies, helping teams stay organized and productive.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {[
                                { Icon: Instagram, url: 'https://www.instagram.com/avanienterprises.branding/' },
                                { Icon: Linkedin, url: 'https://www.linkedin.com/in/avani-enterprises-137448390?utm_source=share_via&utm_content=profile&utm_medium=member_android' },
                                { Icon: Facebook, url: 'https://www.facebook.com/share/1AXpRTxpoH/' },
                                { Icon: Twitter, url: 'https://x.com/avanienterprises' }
                            ].map((social, i) => (
                                <a 
                                    key={i} 
                                    href={social.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    style={{ 
                                        width: '35px', 
                                        height: '35px', 
                                        borderRadius: '8px', 
                                        background: 'var(--surface-light)', 
                                        border: '1px solid var(--border)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        color: 'var(--text-muted)', 
                                        cursor: 'pointer',
                                        transition: 'var(--transition)'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                    <social.Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 style={{ fontWeight: '800', color: 'var(--text)', marginBottom: '1.5rem' }}>Quick Links</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {['Search Properties', 'Our Story', 'Market Insights', 'Investor Relations'].map(link => (
                                <Link key={link} to="#" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{link}</Link>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 style={{ fontWeight: '800', color: 'var(--text)', marginBottom: '1.5rem' }}>Contact Us</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MapPin size={16} color="var(--primary)" /> Tower B, 3rd Floor, Unitech Cyber Park, Sector 39, Gurugram, Haryana 122002
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <User size={16} color="var(--primary)" /> +91 9253625099
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Send size={16} color="var(--primary)" /> kp@avanienterprises.in
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 style={{ fontWeight: '800', color: 'var(--text)', marginBottom: '1.5rem' }}>Newsletter</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Stay updated with the latest property releases and market trends.</p>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="email" 
                                placeholder="Your email" 
                                style={{ width: '100%', padding: '1rem 3rem 1rem 1.2rem', borderRadius: '12px', background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }} 
                            />
                            <button style={{ position: 'absolute', right: '8px', top: '8px', bottom: '8px', width: '40px', background: 'var(--primary)', border: 'none', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    © 2026 Avani Enterprises. All rights reserved. Designed for excellence.
                </div>
            </footer>

            <style>{`
                @media (max-width: 992px) {
                    footer .container { grid-template-columns: 1fr 1fr !important; gap: 3rem !important; }
                    section[style*="grid-template-columns: minmax(300px, 1fr) 1fr"] { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 600px) {
                    footer .container { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default Home;
