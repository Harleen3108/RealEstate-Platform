import React, { useState, useEffect } from 'react';
import { 
    Building2, Users, TrendingUp, CheckCircle, Clock, 
    ArrowUpRight, ArrowDownRight, Search, Bell, Plus,
    MoreVertical, ExternalLink, MessageSquare, Phone, Mail
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL, { BACKEND_URL } from '../../apiConfig';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DASHBOARD_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalProperties: { value: 0, trend: '+12%' },
        available: { value: 0, trend: '+5%' },
        reserved: { value: 0, trend: '-2%' },
        underContract: { value: 0, trend: '+8%' },
        sold: { value: 0, trend: '+15%' },
        totalLeads: { value: 0, trend: '-3%' }
    });
    const [recentLeads, setRecentLeads] = useState([]);
    const [activeListings, setActiveListings] = useState([]);
    const [pipeline, setPipeline] = useState([
        { label: 'NEW', count: 0, color: '#f97316' },
        { label: 'CONTACTED', count: 0, color: '#3b82f6' },
        { label: 'VIEWING', count: 0, color: '#8b5cf6' },
        { label: 'OFFER', count: 0, color: '#ec4899' },
        { label: 'CLOSED', count: 0, color: '#10b981' }
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const formatRelativeTime = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInMs = now - past;
        const diffInSec = Math.floor(diffInMs / 1000);
        const diffInMin = Math.floor(diffInSec / 60);
        const diffInHrs = Math.floor(diffInMin / 60);
        const diffInDays = Math.floor(diffInHrs / 24);

        if (diffInSec < 60) return 'Just now';
        if (diffInMin < 60) return `${diffInMin} min ago`;
        if (diffInHrs < 24) return `${diffInHrs} hr ago`;
        if (diffInDays === 1) return 'Yesterday';
        return past.toLocaleDateString();
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            let properties = [];
            let leads = [];

            try {
                const propRes = await axios.get(`${API_BASE_URL}/properties/agency/${user._id}`);
                const propData = propRes.data;
                properties = Array.isArray(propData) ? propData : (propData?.data || propData?.properties || []);
            } catch (err) {
                console.error('Failed to fetch agency properties (500?):', err.response?.status, err.message);
            }

            try {
                const leadRes = await axios.get(`${API_BASE_URL}/leads`);
                const leadData = leadRes.data;
                leads = Array.isArray(leadData) ? leadData : (leadData?.data || leadData?.leads || []);
            } catch (err) {
                console.error('Failed to fetch agency leads (401?):', err.response?.status, err.message);
            }

            // Update Stats
            setStats({
                totalProperties: { value: properties.length, trend: '+12%' },
                available: { value: properties.filter(p => p.status === 'Available').length, trend: '+5%' },
                reserved: { value: properties.filter(p => p.status === 'Reserved').length, trend: '-2%' },
                underContract: { value: properties.filter(p => p.status === 'Under Contract').length, trend: '+8%' },
                sold: { value: properties.filter(p => p.status === 'Sold').length, trend: '+15%' },
                totalLeads: { value: leads.length, trend: '-3%' }
            });

            // Calculate Pipeline
            setPipeline([
                { label: 'NEW', count: leads.filter(l => l.status === 'New Lead').length, color: '#f97316' },
                { label: 'CONTACTED', count: leads.filter(l => l.status === 'Contacted').length, color: '#3b82f6' },
                { label: 'VIEWING', count: leads.filter(l => l.status === 'Site Visit').length, color: '#8b5cf6' },
                { label: 'OFFER', count: leads.filter(l => l.status === 'Negotiation').length, color: '#ec4899' },
                { label: 'CLOSED', count: leads.filter(l => ['Booked', 'Sold'].includes(l.status)).length, color: '#10b981' }
            ]);

            // Recent Leads (top 4)
            setRecentLeads(leads.slice(0, 4).map(l => ({
                id: l._id,
                name: l.name,
                property: l.property?.title || 'General Inquiry',
                status: l.status || 'New',
                time: formatRelativeTime(l.createdAt), 
                initials: l.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            })));

            // Active Listings
            setActiveListings(properties.slice(0, 3));
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/400x200?text=No+Image';
        if (url.startsWith('http')) return url;
        return `${BACKEND_URL}${url}`;
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
        </div>
    );

    return (
        <div className="dashboard-container" style={{ color: 'var(--text)', width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
            {/* Upper Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <h1 style={{ fontSize: 'clamp(1.4rem, 4.5vw, 1.8rem)', fontWeight: '800', marginBottom: '0.5rem' }}>Performance Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Welcome back, here's what's happening today.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 0 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search properties..."
                            style={{
                                padding: '0.6rem 1rem 0.6rem 2.5rem',
                                borderRadius: '10px',
                                border: '1px solid var(--border)',
                                background: 'var(--surface)',
                                width: '100%',
                                maxWidth: '250px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <button style={{ 
                        background: 'var(--surface)', 
                        border: '1px solid var(--border)', 
                        padding: '0.6rem', 
                        borderRadius: '10px',
                        position: 'relative',
                        cursor: 'pointer'
                    }}>
                        <Bell size={20} color="var(--text-muted)" />
                        <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', border: '2px solid var(--surface)' }}></span>
                    </button>
                    <button 
                        onClick={() => navigate('/dashboard/agency/properties/add')}
                        style={{ 
                            background: '#f97316', 
                            color: 'white', 
                            border: 'none', 
                            padding: '0.6rem 1.2rem', 
                            borderRadius: '10px', 
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        <Plus size={20} /> New Listing
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.8rem', marginBottom: '1.5rem' }}>
                {Object.entries(stats).map(([key, stat]) => (
                    <div key={key} style={{ 
                        background: 'var(--surface)', 
                        padding: '1rem', 
                        borderRadius: '12px', 
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow)'
                    }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ fontSize: '1.4rem', fontWeight: '800' }}>{stat.value}</span>
                            <span style={{ 
                                fontSize: '0.65rem', 
                                fontWeight: '700', 
                                color: stat.trend.startsWith('+') ? '#10b981' : '#f43f5e' 
                            }}>
                                {stat.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Middle Section: Pipeline & Recent Leads */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem', marginBottom: '1.5rem' }}>
                {/* Sales Pipeline */}
                <div style={{ background: 'var(--surface)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Sales Pipeline</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Revenue potential across stages</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f97316' }}>$4.2M</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#10b981' }}>+10.5% vs last month</div>
                        </div>
                    </div>
                    {/* Horizontal Bar Graph */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '0.5rem 0' }}>
                        {pipeline.map(stage => {
                            const maxCount = Math.max(...pipeline.map(p => p.count), 1);
                            const percentage = (stage.count / maxCount) * 100;
                            return (
                                <div key={stage.label} style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', width: '85px', letterSpacing: '0.05em' }}>{stage.label}</span>
                                    <div style={{ flex: 1, height: '10px', background: 'var(--surface-light)', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                                        <div style={{ 
                                            width: `${percentage}%`, 
                                            height: '100%', 
                                            background: `linear-gradient(90deg, ${stage.color}22, ${stage.color})`,
                                            borderRadius: '10px',
                                            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: percentage > 0 ? `0 0 10px ${stage.color}33` : 'none'
                                        }}></div>
                                    </div>
                                    <div style={{ width: '30px', textAlign: 'right', fontSize: '0.85rem', fontWeight: '800' }}>
                                        {stage.count}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Leads */}
                <div style={{ background: 'var(--surface)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Recent Leads</h3>
                        <button 
                            onClick={() => navigate('/dashboard/agency/leads')}
                            style={{ color: '#f97316', background: 'none', border: 'none', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                            View All
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {recentLeads.map(lead => (
                            <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%', 
                                    background: '#f3f4f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '700',
                                    color: '#6b7280',
                                    fontSize: '0.7rem'
                                }}>
                                    {lead.initials}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ fontSize: '0.8rem', fontWeight: '700' }}>{lead.name}</h4>
                                        <span style={{ 
                                            fontSize: '0.6rem', 
                                            fontWeight: '800', 
                                            padding: '1px 6px', 
                                            borderRadius: '6px',
                                            background: lead.status === 'Hot' ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface-light)',
                                            color: lead.status === 'Hot' ? 'var(--success)' : 'var(--text-muted)'
                                        }}>{lead.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1px' }}>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{lead.property}</p>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{lead.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {recentLeads.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No recent leads</p>}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Active Listings Overview */}
            <div style={{ background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Active Listings Overview</h3>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button style={{ padding: '0.3rem 0.8rem', borderRadius: '6px', border: 'none', background: 'var(--surface-light)', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text)' }}>All Time</button>
                        <button style={{ padding: '0.3rem 0.8rem', borderRadius: '6px', border: 'none', background: 'none', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', cursor: 'pointer' }}>This Month</button>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--surface-light)', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800' }}>
                            <tr>
                                <th style={{ padding: '0.8rem 1.2rem' }}>PROPERTY</th>
                                <th style={{ padding: '0.8rem 1.2rem' }}>AGENT</th>
                                <th style={{ padding: '0.8rem 1.2rem' }}>STATUS</th>
                                <th style={{ padding: '0.8rem 1.2rem' }}>INQUIRIES</th>
                                <th style={{ padding: '0.8rem 1.2rem' }}>PRICE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeListings.map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.8rem 1.2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img
                                                src={getImageUrl(p.images?.[0])}
                                                alt=""
                                                onError={(event) => {
                                                    event.currentTarget.onerror = null;
                                                    event.currentTarget.src = DASHBOARD_FALLBACK_IMAGE;
                                                }}
                                                style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{p.title}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.location}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.8rem 1.2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--border)' }}></div>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{user.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.8rem 1.2rem' }}>
                                        <span style={{ 
                                            fontSize: '0.7rem', 
                                            fontWeight: '700', 
                                            padding: '3px 8px', 
                                            borderRadius: '20px',
                                            background: p.status === 'Available' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                                            color: p.status === 'Available' ? 'var(--success)' : 'var(--primary)'
                                        }}>{p.status}</span>
                                    </td>
                                    <td style={{ padding: '0.8rem 1.2rem', fontSize: '0.8rem', fontWeight: '600' }}>
                                        42
                                    </td>
                                    <td style={{ padding: '0.8rem 1.2rem', fontSize: '0.9rem', fontWeight: '800', color: '#f97316' }}>
                                        ₹{p.price.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {activeListings.length === 0 && <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No properties found</p>}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
