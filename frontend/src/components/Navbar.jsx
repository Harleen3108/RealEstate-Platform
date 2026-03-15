import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, LogOut, User, Moon, Sun, Bell } from 'lucide-react';

const Navbar = () => {
    const { user, logout, loading } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchUnreadCount = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/notifications`);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return null;
    if (location.pathname.startsWith('/dashboard')) return null;

    return (
        <nav style={{ 
            height: '90px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'sticky', 
            top: 0, 
            zIndex: 1000,
            background: 'var(--header-bg)', 
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border)',
            transition: 'var(--transition)'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                {/* Logo Section */}
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text)', lineHeight: '1.1' }}>
                            RealEstate <span style={{ color: 'var(--primary)' }}>Platform</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                            Avani Enterprises
                        </div>
                    </div>
                </Link>
                
                {/* Actions Section */}
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <Link to="/marketplace" style={{ 
                        textDecoration: 'none', 
                        fontSize: '1rem', 
                        fontWeight: '700', 
                        color: 'var(--text)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        paddingBottom: '2px'
                    }}>
                        <Search size={18} /> Find Property
                    </Link>

                    {user && (
                        <button 
                            onClick={() => navigate(`/dashboard/${user.role.toLowerCase()}/notifications`)}
                            style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                color: unreadCount > 0 ? 'var(--primary)' : 'var(--text)', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '8px',
                                position: 'relative'
                            }}
                            title="Notifications"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '4px', 
                                    right: '4px', 
                                    minWidth: '16px', 
                                    height: '16px', 
                                    background: 'var(--primary)', 
                                    color: 'white',
                                    borderRadius: '50%', 
                                    fontSize: '0.6rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    border: '1.5px solid var(--header-bg)'
                                }}>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </div>
                            )}
                        </button>
                    )}

                    <button 
                        onClick={toggleTheme}
                        style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: 'var(--text)', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px',
                            transition: 'var(--transition)'
                        }}
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                            <Link to={user.role === 'Buyer' ? '/dashboard/user/dashboard' : `/dashboard/${user.role.toLowerCase()}`} style={{ width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <div style={{ width: '100%', height: '100%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800' }}>
                                    {user.name.slice(0,1).toUpperCase()}
                                </div>
                            </Link>
                            <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <Link to="/login" style={{ 
                                textDecoration: 'none', 
                                fontSize: '1rem', 
                                fontWeight: '700', 
                                color: 'var(--text)',
                                paddingBottom: '2px'
                            }}>
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '0.8rem 2.2rem', fontSize: '1rem', borderRadius: '12px', fontWeight: '800', textDecoration: 'none' }}>
                                Join Now
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
