import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, user, loading } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!loading && user) {
            const role = user.role.toLowerCase();
            if (role === 'agency') navigate('/dashboard/agency');
            else if (role === 'investor') navigate('/dashboard/investor');
            else if (role === 'admin') navigate('/dashboard/admin');
            else navigate('/dashboard/buyer');
        }
    }, [user, loading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const data = await login(email, password);
            const role = data.role.toLowerCase();
            if (role === 'agency') navigate('/dashboard/agency');
            else if (role === 'investor') navigate('/dashboard/investor');
            else if (role === 'admin') navigate('/dashboard/admin');
            else navigate('/dashboard/buyer');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <div style={{ 
            minHeight: 'calc(100vh - 90px)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'var(--background)',
            padding: '2rem',
            transition: 'var(--transition)'
        }}>
                <div style={{ 
                    width: '100%', 
                    maxWidth: '1000px', 
                    display: 'flex', 
                    borderRadius: '24px', 
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow)',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    flexWrap: 'wrap',
                    minHeight: window.innerWidth > 768 ? "550px" : "auto"
                }}>
                    {/* Left Side - Hero Image */}
                    <div className="desktop-only" style={{ 
                        flex: '1 1 400px', 
                        position: 'relative',
                        backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%), url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1935&auto=format&fit=crop')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '3rem',
                        minHeight: '400px'
                    }}>
                        <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Millionaire Club</h1>
                        <p style={{ color: 'var(--primary)', fontSize: '1.1rem', fontWeight: '700', opacity: 0.9 }}>Managing luxury assets with precision.</p>
                        
                        <div style={{ display: 'flex', gap: '8px', marginTop: '2rem' }}>
                            <div style={{ width: '40px', height: '4px', background: 'var(--primary)', borderRadius: '2px' }}></div>
                            <div style={{ width: '12px', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}></div>
                            <div style={{ width: '12px', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}></div>
                        </div>
                    </div>

                {/* Right Side - Login Form */}
                <div style={{ 
                    flex: '1 1 400px', 
                    padding: 'clamp(2rem, 5vw, 4rem)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    background: 'var(--surface)'
                }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.5rem' }}>Welcome Back</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Enter your credentials to access your dashboard</p>
                    </div>

                    {error && (
                        <div style={{ padding: '0.8rem', color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                    placeholder="name@example.com"
                                    style={{ 
                                        width: '100%',
                                        padding: '1rem 1rem 1rem 3rem',
                                        background: 'var(--input-bg)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '12px',
                                        color: 'var(--text)',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        transition: 'var(--transition)'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    placeholder="••••••••"
                                    style={{ 
                                        width: '100%',
                                        padding: '1rem 3rem 1rem 3rem',
                                        background: 'var(--input-bg)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '12px',
                                        color: 'var(--text)',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        transition: 'var(--transition)'
                                    }}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>
                                <input type="checkbox" style={{ accentColor: 'var(--primary)' }} /> Remember me
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="btn btn-primary"
                            style={{ 
                                padding: '1.2rem', 
                                borderRadius: '12px', 
                                fontWeight: '800', 
                                fontSize: '1.1rem', 
                                marginTop: '1rem',
                                boxShadow: '0 10px 15px -3px rgba(229, 90, 22, 0.3)',
                                width: '100%',
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="spinner spinner-sm" style={{ marginRight: '10px' }}></div>
                                    Logging in...
                                </>
                            ) : 'Login'}
                        </button>
                    </form>

                    {/* <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6 }}>
                            POWERED BY MILLIONAIRE CLUB
                        </p>
                    </div> */}

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>register now</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
