import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL, { BACKEND_URL } from '../apiConfig';
import { Search, MapPin, DollarSign, Home, Filter, Heart, ArrowRight, Building2, Bed, Bath, Bot, TrendingUp, TrendingDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const formatINR = (num) => {
    if (!num) return '---';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
    return `₹${num.toLocaleString('en-IN')}`;
};

const getVerdict = (listedPrice, aiPrice) => {
    if (!aiPrice || !listedPrice) return null;
    const diff = ((listedPrice - aiPrice) / aiPrice * 100);
    if (diff > 15) return { label: 'OVERPRICED', color: '#ef4444', bg: '#fef2f2', icon: TrendingUp, diff: diff.toFixed(0) };
    if (diff < -10) return { label: 'GREAT DEAL', color: '#22c55e', bg: '#f0fdf4', icon: TrendingDown, diff: diff.toFixed(0) };
    return { label: 'FAIR PRICE', color: '#f59e0b', bg: '#fffbeb', icon: Bot, diff: diff.toFixed(0) };
};

const PropertyMarketplace = ({ compact = false }) => {
    const [properties, setProperties] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savedIds, setSavedIds] = useState([]);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        location: '',
        type: '',
        agency: '',
        minPrice: '',
        maxPrice: ''
    });

    useEffect(() => {
        fetchInitialData();
        if (user) fetchSavedProperties();
    }, [user]);

    const fetchInitialData = async () => {
        try {
            const [propRes, userRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/properties`),
                axios.get(`${API_BASE_URL}/auth/agencies`)
            ]);
            setProperties(propRes.data);
            setAgencies(userRes.data.filter(u => u.role === 'Agency'));
            setLoading(false);

            // Trigger batch AI estimation for properties missing estimates (fire-and-forget)
            const missingIds = propRes.data
                .filter(p => !p.aiEstimation?.estimatedPrice && p.location && p.size)
                .map(p => p._id);
            if (missingIds.length > 0 && user) {
                axios.post(`${API_BASE_URL}/estimation/batch-property-estimate`, { propertyIds: missingIds })
                    .then(({ data }) => {
                        if (data.estimated > 0) {
                            // Re-fetch to get updated estimates
                            axios.get(`${API_BASE_URL}/properties`).then(res => setProperties(res.data));
                        }
                    })
                    .catch(() => {});
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const fetchSavedProperties = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/auth/me`);
            setSavedIds(data.savedProperties.map(p => p._id || p));
        } catch (error) {
            console.error(error);
        }
    };

    const toggleSave = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return navigate('/login');

        try {
            const { data } = await axios.post(`${API_BASE_URL}/auth/save-property/${id}`);
            setSavedIds(data);
        } catch (error) {
            console.error(error);
        }
    };

    const filteredProperties = properties.filter(p => {
        const agencyMatch = filters.agency === '' || p.agency?._id === filters.agency;
        const locationMatch = filters.location === '' || p.location.toLowerCase().includes(filters.location.toLowerCase());
        const typeMatch = filters.type === '' || p.propertyType === filters.type;
        const priceMatch = (filters.minPrice === '' || p.price >= Number(filters.minPrice)) && (filters.maxPrice === '' || p.price <= Number(filters.maxPrice));
        
        return agencyMatch && locationMatch && typeMatch && priceMatch && p.status !== 'Blocked' && p.isApproved;
    });

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/400x220?text=Premium+Asset';
        if (url.startsWith('http')) {
            if (window.location.hostname !== 'localhost' && url.includes('localhost:5000')) {
                return url.replace('http://localhost:5000', BACKEND_URL);
            }
            return url;
        }
        return `${BACKEND_URL}${url}`;
    };

    return (
        <div className="section container animate-fade">
            <div style={{ 
                display: 'flex', 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: compact ? '1.5rem' : 'clamp(1.5rem, 5vw, 3rem)',
                gap: '1rem',
                flexWrap: 'wrap'
            }}>
                <div>
                    <h2 style={{ fontSize: compact ? '1.5rem' : 'clamp(1.5rem, 6vw, 2.5rem)', fontWeight: '800' }}>
                        {compact ? 'Browse' : 'Global'} <span className="text-gradient">Marketplace</span>
                    </h2>
                    {!compact && <p className="desktop-only" style={{ color: 'var(--text-muted)' }}>Discover premium real estate opportunities</p>}
                </div>
                <div style={{ 
                    display: 'flex', 
                    gap: compact ? '0.6rem' : '0.8rem', 
                    alignItems: 'center',
                    flexWrap: 'wrap' 
                }}>
                    <div className="glass-card" style={{ 
                        padding: '0.4rem 0.8rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        background: 'var(--surface-light)', 
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        flex: '1 1 150px'
                    }}>
                        <Search size={16} color="var(--text-muted)" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="input-control" 
                            style={{ 
                                border: 'none', 
                                background: 'transparent', 
                                padding: '2px', 
                                width: '100%', 
                                color: 'var(--text)',
                                fontSize: '0.85rem' 
                            }}
                            value={filters.location}
                            onChange={(e) => setFilters({...filters, location: e.target.value})}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flex: '1 1 250px', flexWrap: 'wrap' }}>
                        <select 
                            style={{ 
                                flex: '1 1 120px',
                                padding: '12px',
                                background: 'var(--background)',
                                border: '1px solid var(--border)',
                                borderRadius: '1rem',
                                color: 'var(--text)',
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                            value={filters.type}
                            onChange={(e) => setFilters({...filters, type: e.target.value})}
                        >
                            <option value="">All Type</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Villa">Villa</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Land">Land</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <div className="animate-pulse" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>Scanning marketplace...</div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: compact ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: compact ? '1.5rem' : '2.5rem' }}>
                    {filteredProperties.map(property => {
                        const isSaved = savedIds.includes(property._id);
                        return (
                             <div key={property._id} className="glass-card animate-fade" style={{ 
                                 position: 'relative', 
                                 background: 'var(--surface)', 
                                 border: '1px solid var(--border)', 
                                 padding: compact ? '1rem' : '1.2rem',
                                 borderRadius: '24px',
                                 boxShadow: 'var(--shadow)',
                                 display: 'flex',
                                 flexDirection: 'column'
                             }}>
                                <div style={{ 
                                    height: compact ? '180px' : '240px', 
                                    borderRadius: '18px', 
                                    overflow: 'hidden', 
                                    marginBottom: '1.2rem', 
                                    position: 'relative' 
                                }}>
                                    <img src={getImageUrl(property.images?.[0])} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button 
                                        onClick={(e) => toggleSave(e, property._id)}
                                        style={{ 
                                            position: 'absolute', 
                                            top: '12px', 
                                            right: '12px', 
                                            background: 'rgba(255,255,255,0.2)', 
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255,255,255,0.3)', 
                                            borderRadius: '50%', 
                                            width: '40px', 
                                            height: '40px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            cursor: 'pointer', 
                                            transition: '0.3s',
                                            color: 'white'
                                        }}
                                    >
                                        <Heart size={20} fill={isSaved ? 'var(--primary)' : 'none'} color={isSaved ? 'var(--primary)' : 'white'} />
                                    </button>
                                    <div style={{ 
                                        position: 'absolute', 
                                        bottom: '12px', 
                                        left: '12px', 
                                        background: 'var(--primary)', 
                                        color: 'white', 
                                        padding: '5px 12px', 
                                        borderRadius: '10px', 
                                        fontSize: '0.65rem', 
                                        fontWeight: '800',
                                        letterSpacing: '0.5px',
                                        boxShadow: '0 4px 10px rgba(229, 90, 22, 0.3)'
                                    }}>
                                        {property.status.toUpperCase()}
                                    </div>
                                </div>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem', gap: '10px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>{property.propertyType}</div>
                                        <h3 style={{ 
                                            fontSize: compact ? '1.15rem' : '1.35rem', 
                                            fontWeight: '800', 
                                            margin: 0, 
                                            color: 'var(--text)',
                                            lineHeight: '1.2'
                                        }}>{property.title}</h3>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: compact ? '1.2rem' : '1.5rem', fontWeight: '900', color: 'var(--text)', lineHeight: '1' }}>
                                            <span style={{ fontSize: '0.8rem', verticalAlign: 'top', color: 'var(--text-muted)', marginRight: '2px' }}>₹</span>{property.price.toLocaleString()}
                                        </div>
                                        {property.aiEstimation?.estimatedPrice > 0 && (
                                            <div style={{ fontSize: '0.7rem', color: '#7c3aed', fontWeight: '700', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                                                <Bot size={11} /> AI: {formatINR(property.aiEstimation.estimatedPrice)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {(() => {
                                    const v = getVerdict(property.price, property.aiEstimation?.estimatedPrice);
                                    if (!v) return null;
                                    return (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.6rem' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: v.bg, color: v.color, padding: '3px 8px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: '800' }}>
                                                <v.icon size={10} /> {v.label}
                                            </span>
                                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                                {v.diff > 0 ? '+' : ''}{v.diff}% vs AI estimate
                                            </span>
                                        </div>
                                    );
                                })()}
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
                                    <MapPin size={14} color="var(--primary)" /> 
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{property.location}</span>
                                </div>

                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    padding: '1rem 0',
                                    borderTop: '1px solid var(--border)',
                                    marginBottom: '1.2rem',
                                    gap: '10px'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)', fontWeight: '700', fontSize: '0.9rem' }}>
                                            <Bed size={16} color="var(--primary)" /> {property.bedrooms || 0}
                                        </div>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Beds</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)', fontWeight: '700', fontSize: '0.9rem' }}>
                                            <Bath size={16} color="var(--primary)" /> {property.bathrooms || 0}
                                        </div>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Baths</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)', fontWeight: '700', fontSize: '0.9rem' }}>
                                            <Home size={16} color="var(--primary)" /> {property.size}
                                        </div>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>SQFT</span>
                                    </div>
                                </div>

                                <Link to={`/property/${property._id}`} className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', borderRadius: '14px', fontSize: '0.95rem', fontWeight: '800' }}>
                                    View Details <ArrowRight size={18} />
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}
            
             {filteredProperties.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px' }}>
                    <Home size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.2 }} />
                    <h3 style={{ color: 'var(--text)', fontWeight: '800' }}>No properties match your current filters</h3>
                    <button className="btn btn-outline" style={{ marginTop: '1rem', borderColor: 'var(--border)', color: 'var(--text-muted)' }} onClick={() => setFilters({location: '', type: '', agency: '', minPrice: '', maxPrice: ''})}>Reset Filters</button>
                </div>
            )}
        </div>
    );
};

export default PropertyMarketplace;
