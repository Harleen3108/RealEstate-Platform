import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Plus, Edit, Trash2, MapPin, Search, Bot, TrendingUp, TrendingDown } from 'lucide-react';
import API_BASE_URL, { BACKEND_URL } from '../../../apiConfig';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const formatINR = (num) => {
    if (!num) return '---';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
    return `₹${num.toLocaleString('en-IN')}`;
};

const AllProperties = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        location: '',
        type: '',
        minPrice: '',
        maxPrice: ''
    });

    const propertyTypes = ['Apartment', 'Villa', 'Commercial', 'Land'];

    useEffect(() => {
        if (user) {
            fetchProperties();
            const intervalId = setInterval(fetchProperties, 30000);
            return () => clearInterval(intervalId);
        }
    }, [user]);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_BASE_URL}/properties/agency/${user._id}`);
            setProperties(data);
            setLoading(false);

            // Trigger batch AI estimation for properties missing estimates
            const missingIds = data
                .filter(p => !p.aiEstimation?.estimatedPrice && p.location && p.size)
                .map(p => p._id);
            if (missingIds.length > 0) {
                axios.post(`${API_BASE_URL}/estimation/batch-property-estimate`, { propertyIds: missingIds })
                    .then(({ data: batchData }) => {
                        if (batchData.estimated > 0) {
                            axios.get(`${API_BASE_URL}/properties/agency/${user._id}`).then(res => setProperties(res.data));
                        }
                    })
                    .catch(() => {});
            }
        } catch (error) {
            console.error('Error fetching properties:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this listing permanently?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/properties/${id}`);
            fetchProperties();
        } catch (error) {
            console.error(error);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/400x200?text=No+Image';
        if (url.startsWith('http')) return url;
        return `${BACKEND_URL}${url}`;
    };

    const filteredProperties = properties.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation = p.location.toLowerCase().includes(filters.location.toLowerCase());
        const matchesType = !filters.type || p.propertyType === filters.type;
        const matchesMinPrice = !filters.minPrice || p.price >= Number(filters.minPrice);
        const matchesMaxPrice = !filters.maxPrice || p.price <= Number(filters.maxPrice);
        
        return matchesSearch && matchesLocation && matchesType && matchesMinPrice && matchesMaxPrice;
    });

    if (loading) return <div>Loading properties...</div>;

    return (
        <div className="animate-fade">
            <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="filter-group">
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>SEARCH</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="text" 
                                placeholder="Search title..." 
                                className="input-control" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ padding: '0.5rem 1rem 0.5rem 2.2rem', fontSize: '0.85rem', width: '100%', background: 'var(--surface-light)' }} 
                            />
                        </div>
                    </div>
                    <div className="filter-group">
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>LOCATION</label>
                        <input 
                            type="text" 
                            placeholder="All Cities" 
                            className="input-control" 
                            value={filters.location}
                            onChange={(e) => setFilters({...filters, location: e.target.value})}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', width: '100%', background: 'var(--surface-light)' }} 
                        />
                    </div>
                    <div className="filter-group">
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>PROPERTY TYPE</label>
                        <select 
                            className="input-control" 
                            value={filters.type}
                            onChange={(e) => setFilters({...filters, type: e.target.value})}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', width: '100%', background: 'var(--surface-light)' }}
                        >
                            <option value="">All Types</option>
                            {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>PRICE RANGE</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input 
                                type="number" 
                                placeholder="Min" 
                                className="input-control" 
                                value={filters.minPrice}
                                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                                style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem', width: '100%', background: 'var(--surface-light)' }} 
                            />
                            <input 
                                type="number" 
                                placeholder="Max" 
                                className="input-control" 
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                                style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem', width: '100%', background: 'var(--surface-light)' }} 
                            />
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={() => navigate('/dashboard/agency/properties/add')} style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
                        <Plus size={18} /> Create Listing
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {filteredProperties.map(p => (
                    <div 
                        key={p._id} 
                        className="glass-card" 
                        onClick={() => navigate(`/property/${p._id}`)}
                        style={{ 
                            padding: '0', 
                            overflow: 'hidden', 
                            border: '1px solid var(--border)', 
                            background: 'var(--surface)', 
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ height: '140px', position: 'relative' }}>
                            <img src={getImageUrl(p.images[0])} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.title} />
                            <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                                {p.isApproved && <div style={{ background: '#10b981', color: 'white', padding: '3px 8px', borderRadius: '16px', fontSize: '0.6rem', fontWeight: '800' }}>APPROVED</div>}
                                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '3px 8px', borderRadius: '16px', fontSize: '0.65rem', fontWeight: '800' }}>{p.status}</div>
                            </div>
                        </div>
                        <div style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                                <h5 style={{ fontSize: '0.95rem', fontWeight: '800' }}>{p.title}</h5>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--primary)' }}>₹{p.price.toLocaleString()}</div>
                                    {p.aiEstimation?.estimatedPrice > 0 && (
                                        <div style={{ fontSize: '0.65rem', color: '#7c3aed', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end', marginTop: '2px' }}>
                                            <Bot size={10} /> AI: {formatINR(p.aiEstimation.estimatedPrice)}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                                <MapPin size={10} /> {p.location}
                            </div>
                            {p.aiEstimation?.estimatedPrice > 0 && (() => {
                                const diff = ((p.price - p.aiEstimation.estimatedPrice) / p.aiEstimation.estimatedPrice * 100);
                                const label = diff > 15 ? 'OVERPRICED' : diff < -10 ? 'GREAT DEAL' : 'FAIR';
                                const color = diff > 15 ? '#ef4444' : diff < -10 ? '#22c55e' : '#f59e0b';
                                const bg = diff > 15 ? '#fef2f2' : diff < -10 ? '#f0fdf4' : '#fffbeb';
                                return (
                                    <div style={{ marginBottom: '0.6rem' }}>
                                        <span style={{ background: bg, color: color, padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '800' }}>
                                            {label} ({diff > 0 ? '+' : ''}{diff.toFixed(0)}%)
                                        </span>
                                    </div>
                                );
                            })()}
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button 
                                    className="btn btn-outline" 
                                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }} 
                                    onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/agency/properties/edit/${p._id}`); }}
                                >
                                    Edit
                                </button>
                                <button 
                                    className="btn btn-outline" 
                                    style={{ color: 'var(--error)', borderColor: 'var(--error)', padding: '0.4rem' }} 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(p._id); }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {filteredProperties.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No properties found matching your search.</p>}
        </div>
    );
};

export default AllProperties;
