import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL, { BACKEND_URL } from '../../apiConfig';
import { Heart, MessageCircle, Clock, MapPin, Bed, Bath, ChevronRight, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
    const [user, setUser] = useState(null);
    const [savedProperties, setSavedProperties] = useState([]);
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [userRes, leadRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/auth/me`),
                axios.get(`${API_BASE_URL}/leads/my-enquiries`)
            ]);
            setUser(userRes.data);
            setSavedProperties(userRes.data.savedProperties?.slice(0, 2) || []);
            setEnquiries(leadRes.data?.slice(0, 3) || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800';
        if (url.startsWith('http')) {
            if (window.location.hostname !== 'localhost' && url.includes('localhost:5000')) {
                return url.replace('http://localhost:5000', BACKEND_URL);
            }
            return url;
        }
        return `${BACKEND_URL}${url}`;
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="animate-fade">
            {/* Welcome Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                    Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'User'}</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Manage your real estate journey and saved listings here.</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-card" style={{ padding: '1.2rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                        <div style={{ background: 'rgba(229, 90, 22, 0.1)', padding: '8px', borderRadius: '10px' }}>
                            <Heart size={20} color="var(--primary)" />
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '20px' }}>+2 new</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Total Saved</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.2rem' }}>{user?.savedProperties?.length || 0}</div>
                </div>

                <div className="glass-card" style={{ padding: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '8px', borderRadius: '10px' }}>
                            <MessageCircle size={20} color="#6366f1" />
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6366f1', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '20px' }}>Active</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Enquiries</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.2rem' }}>{enquiries.length}</div>
                </div>

                <div className="glass-card" style={{ padding: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '10px' }}>
                            <Clock size={20} color="#f59e0b" />
                        </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Activity</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '0.5rem' }}>2 HOURS AGO</div>
                </div>

                <div className="glass-card" style={{ padding: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '10px' }}>
                            <Bell size={20} color="var(--success)" />
                        </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Alerts</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.2rem' }}>0</div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
                {/* Saved Properties */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Saved Properties</h3>
                        <Link to="/dashboard/user/saved" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '600', textDecoration: 'none' }}>View All</Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {savedProperties.length > 0 ? savedProperties.map(prop => (
                            <div key={prop._id} className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{ height: '180px', position: 'relative' }}>
                                    <img src={getImageUrl(prop.images?.[0])} alt={prop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', color: 'white', padding: '5px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}>
                                        ${prop.price?.toLocaleString()}
                                    </div>
                                    <button style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'white', border: 'none', padding: '8px', borderRadius: '50%', color: 'var(--primary)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
                                        <Heart size={18} fill="var(--primary)" />
                                    </button>
                                </div>
                                <div style={{ padding: '1.2rem' }}>
                                    <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.4rem' }}>{prop.title}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                        <MapPin size={14} /> {prop.location}
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                            <Bed size={16} color="var(--text-muted)" /> <span>{prop.bedrooms || 0}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                            <Bath size={16} color="var(--text-muted)" /> <span>{prop.bathrooms || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ gridColumn: 'span 2', padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                                <Heart size={40} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p style={{ color: 'var(--text-muted)' }}>No saved properties yet. <Link to="/dashboard/user/browse" style={{ color: 'var(--primary)', fontWeight: '600' }}>Browse properties</Link></p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Enquiries & CTA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-card" style={{ height: 'fit-content' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem' }}>Recent Enquiries</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            {enquiries.length > 0 ? enquiries.map(lead => (
                                <div key={lead._id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{new Date(lead.createdAt).toLocaleDateString()}</span>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: lead.status === 'Won' ? '#10b981' : '#f59e0b', background: lead.status === 'Won' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>{lead.status}</span>
                                    </div>
                                    <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.2rem' }}>{lead.property?.title || 'Unknown Property'}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{lead.message?.slice(0, 50)}..."</div>
                                </div>
                            )) : (
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No recent enquiries.</p>
                            )}
                        </div>
                        <Link to="/dashboard/user/enquiries" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', marginTop: '1.5rem', padding: '0.8rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>
                            View Full History
                        </Link>
                    </div>

                    {/* CTA Card */}
                    <div style={{ 
                        background: 'linear-gradient(135deg, #e55a16, #f97316)',
                        borderRadius: '20px',
                        padding: '1.5rem',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.6rem' }}>Get Price Alerts</h3>
                            <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '1.2rem', lineHeight: '1.4' }}>Be the first to know when your saved properties drop in price.</p>
                            <button className="btn" style={{ background: 'white', color: 'var(--primary)', width: '100%', borderRadius: '10px', padding: '0.7rem' }}>Enable Alerts</button>
                        </div>
                        <Bell size={100} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, transform: 'rotate(-15deg)' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
