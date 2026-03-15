import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, Search, Heart, MessageCircle, User, Settings, 
    LogOut, Bell, Sun, Moon, Plus, ChevronRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const UserLayout = () => {
    const { user, logout, loading } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);

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
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)', color: 'var(--text)' }}>
            {/* Sidebar */}
            <aside style={{ 
                width: '280px', 
                minWidth: '280px',
                background: '#120d0b', // Specific dark brown from image
                display: 'flex', 
                flexDirection: 'column',
                borderRight: '1px solid var(--border)',
                position: 'sticky',
                top: 0,
                height: '100vh',
                overflowY: 'auto',
                color: 'white'
            }}>
                {/* Logo Area */}
                <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ 
                        width: '45px',
                        height: '45px',
                        borderRadius: '10px',
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(229, 90, 22, 0.3)'
                    }}>
                        <Plus color="white" size={24} />
                    </div>
                    <div>
                        <div style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '0.2px' }}>Avani Enterprises</div>
                        <div style={{ fontSize: '0.7rem', color: '#8c847e', letterSpacing: '1px', textTransform: 'uppercase' }}>Real Estate Platform</div>
                    </div>
                </div>

                {/* Nav Links */}
                <div style={{ flex: 1, padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {menuItems.map((item, index) => {
                            if (item.section) {
                                return (
                                    <div key={`sec-${index}`} style={{ padding: '1.5rem 0.5rem 0.5rem', fontSize: '0.7rem', fontWeight: '700', color: '#5e5650', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
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
                                        color: isActive ? 'white' : '#8c847e',
                                        background: isActive ? '#241a16' : 'transparent',
                                        transition: 'all 0.3s ease',
                                        position: 'relative'
                                    }}
                                >
                                    <item.icon size={20} color={isActive ? 'var(--primary)' : '#8c847e'} />
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

                {/* User Profile Card */}
                <div style={{ padding: '1.5rem' }}>
                    <div style={{ 
                        background: '#1a1411',
                        padding: '12px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{ 
                            width: '44px', 
                            height: '44px', 
                            borderRadius: '50%', 
                            overflow: 'hidden',
                            border: '2px solid #241a16'
                        }}>
                             <img src={`https://ui-avatars.com/api/?name=${user.name}&background=e55a16&color=fff`} alt="User" style={{ width: '100%', height: '100%' }} />
                        </div>
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#8c847e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Premium Member</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
                {/* HeaderBar */}
                <header style={{ 
                    height: '80px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '0 3rem'
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>
                            {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                        </h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        {/* Theme Toggle */}
                        <button 
                            onClick={toggleTheme}
                            style={{ 
                                background: 'rgba(255,255,255,0.05)', 
                                border: '1px solid var(--border)', 
                                padding: '10px', 
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
                            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '10px', borderRadius: '12px', color: unreadCount > 0 ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', position: 'relative' }}
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

                        <button 
                            className="btn btn-primary"
                            style={{ 
                                padding: '0.8rem 1.5rem', 
                                borderRadius: '12px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px',
                                fontSize: '0.9rem'
                            }}
                        >
                            <Plus size={18} /> Post Property
                        </button>
                    </div>
                </header>

                <main style={{ flex: 1, padding: '1rem 3rem 3rem 3rem' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default UserLayout;
