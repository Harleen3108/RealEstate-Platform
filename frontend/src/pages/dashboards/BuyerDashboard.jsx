import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL, { BACKEND_URL } from '../../apiConfig';
import { Heart, MessageCircle, Inbox } from 'lucide-react';

// Sub-components
import BuyerWatchlist from '../../components/buyer/BuyerWatchlist';
import BuyerEnquiries from '../../components/buyer/BuyerEnquiries';

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
                axios.get(`${API_BASE_URL}/auth/me`),
                axios.get(`${API_BASE_URL}/leads/my-enquiries`)
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
            await axios.post(`${API_BASE_URL}/auth/save-property/${id}`);
            setSavedProperties(savedProperties.filter(p => p._id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/400x180';
        if (url.startsWith('http')) {
            if (window.location.hostname !== 'localhost' && url.includes('localhost:5000')) {
                return url.replace('http://localhost:5000', BACKEND_URL);
            }
            return url;
        }
        return `${BACKEND_URL}${url}`;
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <Inbox className="animate-pulse" size={40} color="var(--primary)" />
        </div>
    );

    const tabs = [
        { id: 'favorites', label: 'Watchlist', icon: Heart },
        { id: 'enquiries', label: 'My Enquiries', icon: MessageCircle }
    ];

    return (
        <div className="animate-fade">
            <div className="dash-header">
                <div>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', fontWeight: '800', marginBottom: '0.4rem' }}>Buyer <span className="text-gradient">Console</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>Manage your interests and property tracklist</p>
                </div>
                <div style={{ 
                    display: 'flex', 
                    gap: '0.4rem', 
                    background: 'var(--surface-light)', 
                    border: '1px solid var(--border)', 
                    padding: '0.4rem', 
                    borderRadius: '12px',
                    flexWrap: 'wrap'
                }}>
                    {tabs.map(t => (
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

            {activeTab === 'favorites' && (
                <BuyerWatchlist 
                    savedProperties={savedProperties} 
                    handleRemoveSaved={handleRemoveSaved} 
                    getImageUrl={getImageUrl} 
                />
            )}

            {activeTab === 'enquiries' && (
                <BuyerEnquiries enquiries={enquiries} />
            )}
        </div>
    );
};

export default BuyerDashboard;
