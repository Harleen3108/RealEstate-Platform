import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, Building2, TrendingUp, Users, Settings, LogOut, 
    ChevronRight, MessageCircle, Home, Search, Bell, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const DashboardLayout = () => {
    const { user, logout, loading } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0a' }}>
            <div className="animate-pulse" style={{ color: 'var(--primary)', fontWeight: '700' }}>Authenticating Hub...</div>
        </div>
    );

    if (!user) return null;

    const menuItems = {
        Agency: [
            { label: 'Overview', path: '/dashboard/agency', icon: LayoutDashboard },
            { label: 'My listings', path: '/dashboard/agency/listings', icon: Building2 },
            { label: 'Leads CRM', path: '/dashboard/agency/leads', icon: Users },
        ],
        Investor: [
            { label: 'Portfolio', path: '/dashboard/investor', icon: TrendingUp },
            { label: 'Documents', path: '/dashboard/investor/docs', icon: Settings },
        ],
        Buyer: [
            { label: 'Saved', path: '/dashboard/buyer', icon: Building2 },
            { label: 'Enquiries', path: '/dashboard/buyer/enquiries', icon: Users },
        ],
        Admin: [
            { label: 'Overview', path: '/dashboard/admin', icon: LayoutDashboard },
            { label: 'Agencies', path: '/dashboard/admin/agencies', icon: Building2 },
            { label: 'Investors', path: '/dashboard/admin/investors', icon: TrendingUp },
            { label: 'Properties', path: '/dashboard/admin/properties', icon: Home },
            { label: 'Leads', path: '/dashboard/admin/leads', icon: MessageCircle },
            { label: 'Users', path: '/dashboard/admin/users', icon: Users },
            { label: 'Settings', path: '/dashboard/admin/settings', icon: Settings },
        ]
    };

    const currentItems = menuItems[user.role] || [];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)', color: 'var(--text)' }}>
            {/* Sidebar */}
            <aside style={{ 
                width: '260px', 
                background: 'var(--sidebar-bg)', 
                display: 'flex', 
                flexDirection: 'column',
                borderRight: '1px solid var(--border)'
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
                        <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem', letterSpacing: '0.2px', lineHeight: '1.2' }}>
                        RealEstate <span style={{ color: 'var(--primary)', display: 'block' }}>Platform</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Avani Enterprises</span>
                    </div>
                </div>

                {/* Nav Links */}
                <div style={{ flex: 1, padding: '0 0.8rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {currentItems.map((item, index) => {
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
                                        padding: '0.9rem 1rem',
                                        borderRadius: '8px',
                                        color: isActive ? 'white' : 'var(--text-muted)',
                                        background: isActive ? 'var(--primary)' : 'transparent',
                                        transition: 'all 0.2s ease',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <item.icon size={18} opacity={isActive ? 1 : 0.7} />
                                    <span style={{ fontWeight: isActive ? '600' : '500', fontSize: '0.9rem' }}>{item.label}</span>
                                    {isActive && (
                                        <div style={{ 
                                            position: 'absolute', 
                                            left: 0, 
                                            top: '20%', 
                                            bottom: '20%', 
                                            width: '3px', 
                                            background: 'white', 
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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* HeaderBar */}
                <header style={{ 
                    height: '70px', 
                    background: 'var(--header-bg)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '0 2.5rem',
                    borderBottom: '1px solid var(--border)'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                        {currentItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                    </h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {/* Theme Toggle */}
                        <button 
                            onClick={toggleTheme}
                            style={{ 
                                background: 'var(--surface-light)', 
                                border: '1px solid var(--border)', 
                                padding: '8px', 
                                borderRadius: '8px', 
                                color: 'var(--text)', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="text" 
                                placeholder="Search records..." 
                                style={{ 
                                    background: 'var(--input-bg)', 
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    padding: '8px 12px 8px 38px',
                                    color: 'var(--text)',
                                    fontSize: '0.85rem',
                                    width: '240px'
                                }}
                            />
                        </div>
                        <button style={{ background: 'var(--surface-light)', border: 'none', padding: '8px', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', position: 'relative' }}>
                            <Bell size={18} />
                            <div style={{ position: 'absolute', top: '8px', right: '8px', width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%' }} />
                        </button>
                    </div>
                </header>

                <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
                    <Outlet />
                </main>

                <footer style={{ 
                    padding: '1.5rem 2.5rem', 
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                }}>
                    <div>Avani Enterprises - RealEstate Platform © 2026</div>
                    {/* <div style={{ letterSpacing: '0.5px', textTransform: 'uppercase' }}>Powered by DataStore Snapshot v2.0</div> */}
                </footer>
            </div>
        </div>
    );
};

export default DashboardLayout;
