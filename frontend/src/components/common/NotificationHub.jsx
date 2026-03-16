import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Bell, MessageSquare, Building2, UserPlus, 
    CheckCircle, AlertCircle, Clock, Trash2, X,
    ShieldAlert
} from 'lucide-react';
import API_BASE_URL from '../../apiConfig';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NotificationHub = () => {
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
        
        // Context-aware redirection
        if (n.type === 'lead') {
            if (user.role === 'Admin') navigate('/dashboard/admin?tab=leads');
            else if (user.role === 'Agency') navigate('/dashboard/agency/leads');
        } else if (n.type === 'status' || n.type === 'system') {
            if (n.relatedId) {
                if (user.role === 'Admin') navigate('/dashboard/admin?tab=properties');
                else if (user.role === 'Agency') navigate('/dashboard/agency/properties');
                else if (user.role === 'Investor') navigate('/dashboard/investor/investments');
            }
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'lead': return MessageSquare;
            case 'status': return Clock;
            case 'system': return CheckCircle;
            case 'alert': return AlertCircle;
            case 'security': return ShieldAlert;
            default: return Bell;
        }
    };

    const getColor = (type) => {
        switch(type) {
            case 'lead': return '#3b82f6';
            case 'status': return '#f97316';
            case 'system': return '#10b981';
            case 'alert': return '#f43f5e';
            case 'security': return '#8b5cf6';
            default: return 'var(--primary)';
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '4rem' }}>
            <div className="animate-pulse" style={{ color: 'var(--primary)', fontWeight: '700' }}>Accessing Notifications Vault...</div>
        </div>
    );

    return (
        <div className="animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>Notification <span className="text-gradient">Center</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Account activities and system updates</p>
                </div>
                {notifications.some(n => !n.read) && (
                    <button 
                        onClick={markAllRead}
                        className="btn-text"
                        style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem' }}
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
                                    borderRadius: '16px',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)'
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
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text)' }}>{n.title}</h4>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>{formatTime(n.createdAt)}</span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{n.message}</p>
                                </div>

                                <button 
                                    onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                                    className="hover-red"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--surface)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
                        <div style={{ background: 'var(--surface-light)', width: '80px', height: '80px', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Bell size={40} color="var(--border)" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text)' }}>All caught up!</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>You don't have any new notifications at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationHub;
