import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, Eye, EyeOff, UserPlus } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Buyer',
        phoneNumber: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { register, user, loading } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!loading && user) {
            const role = user.role;
            if (role === 'Agency') navigate('/dashboard/agency');
            else if (role === 'Investor') navigate('/dashboard/investor');
            else if (role === 'Admin') navigate('/dashboard/admin');
            else navigate('/dashboard/buyer');
        }
    }, [user, loading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await register(formData);
            if (data.role === 'Agency') navigate('/dashboard/agency');
            else if (data.role === 'Investor') navigate('/dashboard/investor');
            else if (data.role === 'Admin') navigate('/dashboard/admin');
            else navigate('/dashboard/buyer');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    if (loading) return null;

    const roles = [
        { id: 'Buyer', label: 'Buyer', desc: 'Find your home' },
        { id: 'Agency', label: 'Agency', desc: 'Manage listings' },
        { id: 'Investor', label: 'Investor', desc: 'Track portfolios' },
        { id: 'Admin', label: 'Admin', desc: 'System control' }
    ];

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
                    marginBottom: '2rem'
                }}>
                    {/* Left Side - Hero Image */}
                    <div className="desktop-only" style={{ 
                        flex: '1 1 400px', 
                        position: 'relative',
                        backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%), url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '3rem',
                        minHeight: '400px'
                    }}>
                        <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Millionaire Club</h1>
                        <p style={{ color: 'var(--primary)', fontSize: '1.1rem', fontWeight: '700', opacity: 0.9 }}>Join the future of elite real estate.</p>
                        
                        <div style={{ display: 'flex', gap: '8px', marginTop: '2rem' }}>
                            <div style={{ width: '12px', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}></div>
                            <div style={{ width: '40px', height: '4px', background: 'var(--primary)', borderRadius: '2px' }}></div>
                            <div style={{ width: '12px', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}></div>
                        </div>
                    </div>

                {/* Right Side - Register Form */}
                <div style={{ 
                    flex: '1 1 400px', 
                    padding: 'clamp(2rem, 5vw, 3rem)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    background: 'var(--surface)'
                }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.5rem' }}>Create Account</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Join our exclusive community today</p>
                    </div>

                    {error && (
                        <div style={{ padding: '0.8rem', color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    type="text" 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                    required 
                                    placeholder="enter your name / agency name"
                                    style={{ 
                                        width: '100%',
                                        padding: '0.8rem 1rem 0.8rem 3rem',
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

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Email</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input 
                                        type="email" 
                                        value={formData.email} 
                                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                        required 
                                        placeholder="name@mail.com"
                                        style={{ 
                                            width: '100%',
                                            padding: '0.8rem 1rem 0.8rem 3rem',
                                            background: 'var(--input-bg)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '12px',
                                            color: 'var(--text)',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            transition: 'var(--transition)'
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Phone</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input 
                                        type="text" 
                                        value={formData.phoneNumber} 
                                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
                                        placeholder="+1..."
                                        style={{ 
                                            width: '100%',
                                            padding: '0.8rem 1rem 0.8rem 3rem',
                                            background: 'var(--input-bg)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '12px',
                                            color: 'var(--text)',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            transition: 'var(--transition)'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Select Role</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px' }}>
                                {roles.map(r => (
                                    <div 
                                        key={r.id} 
                                        onClick={() => setFormData({...formData, role: r.id})}
                                        style={{ 
                                            padding: '10px 5px', 
                                            borderRadius: '10px', 
                                            border: '1px solid var(--border)', 
                                            background: formData.role === r.id ? 'rgba(229, 90, 22, 0.1)' : 'var(--input-bg)',
                                            borderColor: formData.role === r.id ? 'var(--primary)' : 'var(--border)',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontSize: '0.8rem', fontWeight: '800', color: formData.role === r.id ? 'var(--primary)' : 'var(--text)' }}>{r.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={formData.password} 
                                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                    required 
                                    placeholder="••••••••"
                                    style={{ 
                                        width: '100%',
                                        padding: '0.8rem 3rem 0.8rem 3rem',
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

                        <button 
                            type="submit" 
                            style={{ 
                                padding: '1rem', 
                                background: 'var(--primary)', 
                                border: 'none', 
                                borderRadius: '12px', 
                                color: 'white', 
                                fontWeight: '800', 
                                fontSize: '1rem', 
                                cursor: 'pointer',
                                transition: 'var(--transition)',
                                marginTop: '0.5rem',
                                boxShadow: '0 10px 15px -3px rgba(229, 90, 22, 0.3)'
                            }}
                        >
                            Register
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>login now</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
