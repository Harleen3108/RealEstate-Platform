import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Search, LayoutDashboard, LogOut, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return null;
    if (location.pathname.startsWith('/dashboard')) return null;

    return (
        <nav className="navbar container" style={{ borderBottom: '1px solid var(--border)', background: 'var(--header-bg)', backdropFilter: 'blur(10px)', sticky: 'top', zIndex: 1000 }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '35px', height: '35px', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid var(--border)' }}>
                    <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text)', lineHeight: '1.1' }}>
                        RealEstate <span style={{ color: 'var(--primary)' }}>Platform</span>
                    </div>
                    <div style={{ fontSize: '0.6rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Avani Enterprises
                    </div>
                </div>
            </Link>
            
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <Link to="/marketplace" className="btn btn-outline" style={{ border: 'none', fontSize: '0.9rem', color: 'var(--text)' }}>
                    <Search size={16} /> Market
                </Link>
                
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <Link to={`/dashboard/${user.role.toLowerCase()}`} className="btn btn-outline" style={{ border: 'none', fontSize: '0.9rem', color: 'var(--text)' }}>
                            <LayoutDashboard size={16} /> Dashboard
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 14px', borderRadius: '30px', background: 'var(--surface-light)', border: '1px solid var(--border)' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '800', color: 'white' }}>
                                {user.name.slice(0,1).toUpperCase()}
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text)' }}>{user.name}</span>
                        </div>
                        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <LogOut size={18} />
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/login" className="btn btn-outline" style={{ fontSize: '0.85rem', borderColor: 'var(--border)', color: 'var(--text)' }}>Login</Link>
                        <Link to="/register" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem' }}>Join Now</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
