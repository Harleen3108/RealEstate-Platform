import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL, { BACKEND_URL } from '../apiConfig';
import { Search, MapPin, DollarSign, Home, Filter, Heart, ArrowRight, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PropertyMarketplace = () => {
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
                axios.get(`${API_BASE_URL}/auth/agencies`) // Public endpoint now used instead of admin
            ]);
            setProperties(propRes.data);
            setAgencies(userRes.data.filter(u => u.role === 'Agency'));
            setLoading(false);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Global <span className="text-gradient">Marketplace</span></h2>
                    <p style={{ color: 'var(--text-muted)' }}>Discover premium real estate opportunities</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-light)', border: '1px solid var(--border)' }}>
                        <Search size={18} color="var(--text-muted)" />
                        <input 
                            type="text" 
                            placeholder="City or Address..." 
                            className="input-control" 
                            style={{ border: 'none', background: 'transparent', padding: '0.2rem', width: '180px', color: 'var(--text)' }}
                            value={filters.location}
                            onChange={(e) => setFilters({...filters, location: e.target.value})}
                        />
                    </div>
                    <select 
                        className="btn btn-outline" 
                        style={{ padding: '0.7rem 1.2rem', background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: '700' }}
                        value={filters.type}
                        onChange={(e) => setFilters({...filters, type: e.target.value})}
                    >
                        <option value="">All Categories</option>
                        <option value="Apartment">Apartments</option>
                        <option value="Villa">Villas</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Land">Land Plots</option>
                    </select>
                    <select 
                        className="btn btn-outline" 
                        style={{ padding: '0.7rem 1.2rem', background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: '700' }}
                        value={filters.agency}
                        onChange={(e) => setFilters({...filters, agency: e.target.value})}
                    >
                        <option value="">All Agencies</option>
                        {agencies.map(a => (
                            <option key={a._id} value={a._id}>{a.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <div className="animate-pulse" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>Scanning marketplace...</div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}>
                    {filteredProperties.map(property => {
                        const isSaved = savedIds.includes(property._id);
                        return (
                             <div key={property._id} className="glass-card animate-fade" style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', padding: '1rem' }}>
                                <div style={{ height: '220px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem', position: 'relative' }}>
                                    <img src={getImageUrl(property.images?.[0])} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button 
                                        onClick={(e) => toggleSave(e, property._id)}
                                        style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.3s' }}
                                    >
                                        <Heart size={20} fill={isSaved ? 'var(--secondary)' : 'none'} color={isSaved ? 'var(--secondary)' : 'var(--text)'} />
                                    </button>
                                    <div style={{ position: 'absolute', bottom: '15px', left: '15px', background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800' }}>
                                        {property.status.toUpperCase()}
                                    </div>
                                </div>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase' }}>{property.propertyType}</span>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginTop: '0.2rem', maxWidth: '200px', color: 'var(--text)' }}>{property.title}</h3>
                                    </div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text)' }}>
                                        <span style={{ fontSize: '0.9rem', verticalAlign: 'top', color: 'var(--text-muted)' }}>₹</span>{property.price.toLocaleString()}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1.2rem', color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <MapPin size={16} color="var(--primary)" /> {property.location}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Home size={16} color="var(--primary)" /> {property.size} SQFT
                                    </div>
                                </div>
                                <div style={{ marginBottom: '1.8rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <Building2 size={14} color="var(--accent)" /> Listing by {property.agency?.name}
                                </div>
                                <Link to={`/property/${property._id}`} className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                                    View Premium Details <ArrowRight size={18} />
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
