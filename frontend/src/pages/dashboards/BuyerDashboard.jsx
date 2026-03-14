import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Heart, MessageCircle, Clock, Search, MapPin, DollarSign, ArrowRight, User, Inbox } from 'lucide-react';

const BuyerDashboard = () => {
    const { tab } = useParams();
    const [savedProperties, setSavedProperties] = useState([]);
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(tab || 'favorites');

    useEffect(() => {
        if (tab) setActiveTab(tab);
    }, [tab]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [userRes, leadRes] = await Promise.all([
                axios.get('http://localhost:5000/api/auth/me'),
                axios.get('http://localhost:5000/api/leads')
            ]);
            setSavedProperties(userRes.data.savedProperties || []);
            setEnquiries(leadRes.data || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleRemoveSaved = async (id) => {
        try {
            await axios.post(`http://localhost:5000/api/auth/save-property/${id}`);
            setSavedProperties(savedProperties.filter(p => p._id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <Inbox className="animate-pulse" size={40} color="var(--primary)" />
        </div>
    );

    return (
        <div className="animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.4rem' }}>Buyer <span className="text-gradient">Console</span></h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your interests and property tracklist</p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--surface-light)', border: '1px solid var(--border)', padding: '0.4rem', borderRadius: '12px' }}>
                    {[
                        { id: 'favorites', label: 'Watchlist', icon: Heart },
                        { id: 'enquiries', label: 'My Enquiries', icon: MessageCircle }
                    ].map(t => (
                        <button 
                            key={t.id}
                            className={`btn ${activeTab === t.id ? 'btn-primary' : ''}`}
                            style={{ 
                                padding: '0.6rem 1.2rem', 
                                fontSize: '0.85rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                background: activeTab === t.id ? 'var(--primary)' : 'transparent',
                                color: activeTab === t.id ? 'white' : 'var(--text-muted)',
                                border: 'none',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => setActiveTab(t.id)}
                        >
                            <t.icon size={16} /> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Watchlist Tab */}
            {activeTab === 'favorites' && (
                <div>
                    {savedProperties.length === 0 ? (
                        <div className="glass-card" style={{ padding: '5rem', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                            <div style={{ width: '80px', height: '80px', background: 'var(--surface-light)', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Heart size={40} color="var(--primary)" style={{ opacity: 0.3 }} />
                            </div>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text)', fontWeight: '800' }}>Your wishlist is empty</h3>
                            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 2rem', fontWeight: '600' }}>
                                Find properties you love in the marketplace and save them here to track pricing and availability.
                            </p>
                            <Link to="/marketplace" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>Start Browsing</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                            {savedProperties.map(p => (
                                 <div key={p._id} className="glass-card animate-fade" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1rem' }}>
                                    <div style={{ height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.2rem', position: 'relative' }}>
                                        <img src={p.images?.[0] || 'https://via.placeholder.com/400x180'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button 
                                            onClick={() => handleRemoveSaved(p._id)}
                                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '50%', width: '35px', height: '35px', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease' }}
                                        >
                                            <Heart size={16} fill="var(--primary)" />
                                        </button>
                                    </div>
                                    <div style={{ padding: '0 0.5rem 0.5rem' }}>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--text)' }}>{p.title}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '1.2rem', fontWeight: '600' }}>
                                            <MapPin size={12} color="var(--primary)" /> {p.location}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text)' }}>₹${p.price.toLocaleString()}</div>
                                            <Link to={`/property/${p._id}`} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderColor: 'var(--border)', color: 'var(--text)' }}>Explore Case</Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Enquiries Tab */}
            {activeTab === 'enquiries' && (
                <div className="glass-card" style={{ padding: '2.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    {enquiries.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                            <MessageCircle size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                            <p>You haven't initiated any property enquiries yet.</p>
                            <Link to="/marketplace" className="btn btn-outline" style={{ marginTop: '1.5rem' }}>View Assets</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', padding: '1rem 1.5rem', opacity: 0.8, fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', background: 'var(--surface-light)', borderRadius: '8px', marginBottom: '1rem' }}>
                                <div>Property Asset</div>
                                <div>Listing Agency</div>
                                <div>Submission Date</div>
                                <div style={{ textAlign: 'right' }}>Pipeline Status</div>
                            </div>
                            {enquiries.map(enq => (
                                 <div key={enq._id} className="glass-card animate-fade hover-light" style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', alignItems: 'center', padding: '1.5rem', background: 'var(--surface-light)', border: '1px solid var(--border)', transition: 'background 0.2s ease' }}>
                                    <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text)' }}>
                                        {enq.property?.title || 'Unknown Property'}
                                        <div style={{ color: 'var(--primary)', fontSize: '0.7rem', fontWeight: '700' }}>{enq.property?.location}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={14} color="var(--primary)" />
                                        </div>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text)' }}>{enq.agency?.name || 'Platform Agency'}</span>
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600' }}>
                                        {new Date(enq.createdAt).toLocaleDateString()}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ 
                                            fontSize: '0.65rem', 
                                            background: enq.status === 'Sold' ? 'var(--success)' : 'var(--primary)', 
                                            color: 'white',
                                            padding: '5px 14px', 
                                            borderRadius: '20px',
                                            fontWeight: '900',
                                            textTransform: 'uppercase'
                                        }}>{enq.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BuyerDashboard;
