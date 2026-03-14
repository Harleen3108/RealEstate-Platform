import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Bell, MessageSquare, Building2, UserPlus, 
    CheckCircle, AlertCircle, Clock, Trash2, X
} from 'lucide-react';
import API_BASE_URL from '../../apiConfig';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchNotifications();
    }, [user]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_BASE_URL}/notifications`);
            setNotifications(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.patch(`${API_BASE_URL}/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await axios.patch(`${API_BASE_URL}/notifications/read-all`);
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/notifications/${id}`);
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleNotificationClick = (n) => {
        if (!n.read) markAsRead(n._id);
        
        // Redirect logic based on relatedId and type
        if (n.type === 'lead' || n.type === 'status') {
            navigate('/dashboard/agency/leads');
        } else if (n.type === 'system' || n.type === 'alert') {
            if (n.relatedId) {
                // If it's about a property
                navigate('/dashboard/agency/properties');
            }
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'lead': return MessageSquare;
            case 'status': return Clock;
            case 'system': return CheckCircle;
            case 'alert': return AlertCircle;
            default: return Bell;
        }
    };

    const getColor = (type) => {
        switch(type) {
            case 'lead': return '#3b82f6';
            case 'status': return '#f97316';
            case 'system': return '#10b981';
            case 'alert': return '#f43f5e';
            default: return 'var(--primary)';
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDocs = Math.floor((now - date) / 1000);
        
        if (diffInDocs < 60) return 'Just now';
        if (diffInDocs < 3600) return `${Math.floor(diffInDocs / 60)}m ago`;
        if (diffInDocs < 86400) return `${Math.floor(diffInDocs / 3600)}h ago`;
        if (diffInDocs < 604800) return `${Math.floor(diffInDocs / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

    return (
        <div className="animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>Notifications</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Stay updated with your leads and listing activities</p>
                </div>
                {notifications.some(n => !n.read) && (
                    <button 
                        onClick={markAllRead}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notifications.length > 0 ? (
                    notifications.map(n => {
                        const Icon = getIcon(n.type);
                        const color = getColor(n.type);
                        return (
                            <div 
                                key={n._id} 
                                className="glass-card" 
                                onClick={() => handleNotificationClick(n)}
                                style={{ 
                                    display: 'flex', 
                                    gap: '1.5rem', 
                                    padding: '1.2rem', 
                                    background: n.read ? 'var(--surface)' : 'var(--surface-light)',
                                    border: '1px solid var(--border)',
                                    borderLeft: n.read ? '1px solid var(--border)' : `4px solid ${color}`,
                                    borderRadius: '12px',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s ease'
                                }}
                            >
                                <div style={{ 
                                    width: '48px', 
                                    height: '48px', 
                                    borderRadius: '12px', 
                                    background: `${color}15`, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: color
                                }}>
                                    <Icon size={24} />
                                </div>
                                
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: n.read ? 'var(--text)' : 'var(--text)' }}>{n.title}</h4>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>{formatTime(n.createdAt)}</span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{n.message}</p>
                                </div>

                                <button 
                                    onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                                    style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '4px' }}
                                    onMouseOver={(e) => e.currentTarget.style.color = '#f43f5e'}
                                    onMouseOut={(e) => e.currentTarget.style.color = '#cbd5e1'}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <div style={{ background: 'var(--surface-light)', width: '80px', height: '80px', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Bell size={40} color="var(--border)" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text)' }}>All caught up!</h3>
                        <p style={{ color: 'var(--text-muted)' }}>You don't have any new notifications at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
