import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { useAuth } from '../context/AuthContext';
import { 
    CheckCircle, X as CloseIcon, Menu, Phone, Mail, MapPin, Search, Globe, ChevronDown,
    LayoutDashboard, Building2, TrendingUp, Users, Settings, LogOut, MessageCircle, Home, Bell, 
    ChevronRight, Sun, Moon, Plus, FileText, BarChart3
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const UserLayout = () => {
    const { user, logout, loading } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
        if (user) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000); 
            return () => clearInterval(interval);
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        setSidebarOpen(false);
    }, [location]);

    const fetchUnreadCount = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/notifications`);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0a' }}>
            <div className="animate-pulse" style={{ color: 'var(--primary)', fontWeight: '700' }}>Loading User Portal...</div>
        </div>
    );

    if (!user) return null;

    const menuItems = [
        { label: 'Dashboard', path: '/dashboard/user/dashboard', icon: LayoutDashboard },
        { label: 'Browse Properties', path: '/dashboard/user/browse', icon: Search },
        { label: 'Saved Properties', path: '/dashboard/user/saved', icon: Heart },
        { label: 'My Enquiries', path: '/dashboard/user/enquiries', icon: MessageCircle },
        { section: 'ACCOUNT' },
        { label: 'Profile', path: '/dashboard/user/profile', icon: User },
        { label: 'Settings', path: '/dashboard/user/settings', icon: Settings },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)', color: 'var(--text)', position: 'relative' }}>
            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 1001,
                        backdropFilter: 'blur(4px)'
                    }}
                    className="mobile-only"
                />
            )}

            {/* Sidebar */}
            <aside style={{ 
                width: '280px', 
                minWidth: '280px',
                background: 'var(--sidebar-bg)', 
                display: 'flex', 
                flexDirection: 'column',
                borderRight: '1px solid var(--border)',
                position: windowWidth <= 768 ? 'fixed' : 'sticky',
                top: 0,
                bottom: 0,
                left: 0,
                height: '100vh',
                overflowY: 'auto',
                color: 'var(--text)',
                zIndex: 1002,
                transform: windowWidth <= 768 ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                {/* Logo Area */}
                <div style={{ padding: '1.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'white'
                    }}>
                        <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text)', letterSpacing: '0.2px' }}>Millionaire Club</div>
                    </div>
                    <button className="mobile-only" onClick={() => setSidebarOpen(false)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
                        <CloseIcon size={20} />
                    </button>
                </div>

                {/* Nav Links */}
                <div style={{ flex: 1, padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {menuItems.map((item, index) => {
                            if (item.section) {
                                return (
                                    <div key={`sec-${index}`} style={{ padding: '1.5rem 0.5rem 0.5rem', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                                        {item.section}
                                    </div>
                                );
                            }
                            const isActive = location.pathname === item.path;
                            return (
                                <Link 
                                    key={index} 
                                    to={item.path} 
                                    style={{ 
                                        textDecoration: 'none', 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '1rem 1.2rem',
                                        borderRadius: '12px',
                                        color: isActive ? 'white' : 'var(--text-muted)',
                                        background: isActive ? 'var(--primary)' : 'transparent',
                                        transition: 'all 0.3s ease',
                                        position: 'relative'
                                    }}
                                >
                                    <item.icon size={20} color={isActive ? 'white' : 'var(--text-muted)'} />
                                    <span style={{ fontWeight: isActive ? '600' : '500', fontSize: '0.95rem' }}>{item.label}</span>
                                    {isActive && (
                                        <div style={{ 
                                            position: 'absolute', 
                                            left: 0, 
                                            top: '20%', 
                                            bottom: '20%', 
                                            width: '4px', 
                                            background: 'var(--primary)', 
                                            borderRadius: '0 4px 4px 0' 
                                        }} />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* User Profile */}
                <div style={{ 
                    padding: '1.5rem', 
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{ 
                        width: '38px', 
                        height: '38px', 
                        borderRadius: '50%', 
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '0.8rem'
                    }}>
                        {user.name.slice(0, 2).toUpperCase()}
                    </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                        </div>
                    <button onClick={logout} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--background)', minWidth: 0 }}>
                {/* HeaderBar */}
                <header style={{ 
                    height: '70px', 
                    background: 'var(--header-bg)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '0 clamp(1rem, 5vw, 2.5rem)',
                    borderBottom: '1px solid var(--border)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button 
                            className="mobile-only"
                            onClick={() => setSidebarOpen(true)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer' }}
                        >
                            <Menu size={24} />
                        </button>
                        <h2 style={{ fontSize: 'clamp(1rem, 5vw, 1.5rem)', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                        </h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 3vw, 20px)' }}>
                        {/* Theme Toggle */}
                        <button 
                            onClick={toggleTheme}
                            style={{ 
                                background: 'rgba(255,255,255,0.05)', 
                                border: '1px solid var(--border)', 
                                padding: 'clamp(6px, 2vw, 10px)', 
                                borderRadius: '12px', 
                                color: 'var(--text)', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'var(--transition)'
                            }}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <button 
                            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: 'clamp(6px, 2vw, 10px)', borderRadius: '12px', color: unreadCount > 0 ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', position: 'relative' }}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '8px', 
                                    right: '8px', 
                                    width: '8px', 
                                    height: '8px', 
                                    background: 'var(--primary)', 
                                    borderRadius: '50%', 
                                    border: '2px solid var(--background)'
                                }} />
                            )}
                        </button>                       
                    </div>
                </header>

                <main style={{ flex: 1, padding: 'clamp(1rem, 5vw, 3rem)' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default UserLayout;
