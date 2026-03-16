import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, LogOut, User, Moon, Sun, CheckCircle, X as CloseIcon, Menu, Phone, Mail, MapPin, Globe, ChevronDown, Bell, Home, LayoutGrid, Info } from 'lucide-react';

const Navbar = () => {
    const { user, logout, loading } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (user && !location.pathname.startsWith('/dashboard')) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user, location.pathname]);

    // Close menu when location changes or screen size becomes desktop
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location, windowWidth]);

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

    const isMobile = windowWidth <= 768;
    const navHeight = isMobile ? '70px' : '90px';

    return (
        <>
            <nav style={{ 
                height: navHeight,
                width: '100%',
                left: 0,
                right: 0,
                display: 'flex', 
                alignItems: 'center', 
                position: 'fixed', 
                top: 0, 
                zIndex: 1000,
                background: 'var(--header-bg)', 
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                transition: 'var(--transition)',
                boxSizing: 'border-box'
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '8px' }}>
                    {/* Logo Section */}
                    <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', flexShrink: 1, minWidth: 0 }}>
                        <div style={{ 
                            width: isMobile ? '35px' : '45px', 
                            height: isMobile ? '35px' : '45px', 
                            borderRadius: '8px', 
                            overflow: 'hidden', 
                            border: '1px solid var(--border)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flexShrink: 0 
                        }}>
                            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div style={{ 
                                fontSize: isMobile ? '1.1rem' : '1.4rem', 
                                fontWeight: '800', 
                                color: 'var(--text)', 
                                lineHeight: '1.1',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                Millionaire <span style={{ color: 'var(--primary)' }}>Club</span>
                            </div>
                        </div>
                    </Link>
                    
                    {/* Actions Section - Desktop */}
                    <div className="desktop-only" style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexShrink: 0 }}>
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
                                <Link to={user.role === 'Buyer' ? '/dashboard/user/dashboard' : `/dashboard/${user.role.toLowerCase()}`} style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
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

                    {/* Mobile Menu Toggle & Theme Button */}
                    <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {user && (
                            <button 
                                onClick={() => navigate(`/dashboard/${user.role.toLowerCase()}/notifications`)}
                                style={{ 
                                    background: 'var(--surface-light)', 
                                    border: '1px solid var(--border)', 
                                    color: unreadCount > 0 ? 'var(--primary)' : 'var(--text)', 
                                    cursor: 'pointer', 
                                    padding: '8px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    position: 'relative'
                                }}
                            >
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <div style={{ 
                                        position: 'absolute', 
                                        top: '-2px', 
                                        right: '-2px', 
                                        width: '8px', 
                                        height: '8px', 
                                        background: 'var(--primary)', 
                                        borderRadius: '50%', 
                                        border: '1.5px solid var(--header-bg)' 
                                    }} />
                                )}
                            </button>
                        )}
                         <button 
                            onClick={toggleTheme}
                            style={{ 
                                background: 'var(--surface-light)', 
                                border: '1px solid var(--border)', 
                                color: 'var(--text)', 
                                cursor: 'pointer', 
                                padding: '8px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button 
                            onClick={() => setIsMenuOpen(true)}
                            style={{ 
                                background: 'var(--primary)', 
                                border: 'none', 
                                color: 'white', 
                                cursor: 'pointer', 
                                padding: '8px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <Menu size={22} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Layout Spacer - Necessary when using fixed positioning */}
            <div style={{ height: navHeight, width: '100%' }} />

            {/* Mobile Sidebar Menu */}
            <div 
                className={`mobile-only mobile-overlay ${isMenuOpen ? 'active' : ''}`} 
                onClick={() => setIsMenuOpen(false)}
                style={{ zIndex: 1100 }}
            />
            
            <div className={`mobile-only mobile-menu ${isMenuOpen ? 'active' : ''}`} style={{ zIndex: 1200, paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.5rem 1.5rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="/logo.png" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
                        <span style={{ fontWeight: '800', fontSize: '1rem' }}>Millionaire Club</span>
                    </div>
                    <button onClick={() => setIsMenuOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
                        <CloseIcon size={24} />
                    </button>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', opacity: 0.8 }}>Explore Millionaire Club</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Link to="/" className="mobile-menu-item">
                            <Home size={20} /> Home
                        </Link>
                        <Link to="/marketplace" className="mobile-menu-item">
                            <LayoutGrid size={20} /> Properties
                        </Link>
                    </div>
                </div>
                
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', opacity: 0.8 }}>Account</div>
                    {user ? (
                    <>
                            <Link to={user.role === 'Buyer' ? '/dashboard/user/dashboard' : `/dashboard/${user.role.toLowerCase()}`} className="mobile-menu-item">
                                <User size={20} /> My Dashboard
                            </Link>
                            <button onClick={handleLogout} className="mobile-menu-item" style={{ border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', background: 'var(--surface-light)' }}>
                                <LogOut size={20} /> Logout
                            </button>
                    </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Link to="/login" className="mobile-menu-item" style={{ background: 'var(--surface-light)' }}>
                                <User size={20} /> Login
                            </Link>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '1.2rem', borderRadius: '14px', fontSize: '1rem', textDecoration: 'none', textAlign: 'center', fontWeight: '800' }}>Join Now</Link>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'var(--surface-light)', borderRadius: '20px', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Expertly Curated</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text)' }}>
                        Millionaire <span style={{ color: 'var(--primary)' }}>Club</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
