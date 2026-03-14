import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, user, loading } = useAuth();
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
            const data = await login(email, password);
            if (data.role === 'Agency') navigate('/dashboard/agency');
            else if (data.role === 'Investor') navigate('/dashboard/investor');
            else if (data.role === 'Admin') navigate('/dashboard/admin');
            else navigate('/dashboard/buyer');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    if (loading) return null;

    return (
        <div className="section container" style={{ display: 'flex', justifyContent: 'center', minHeight: '80vh', alignItems: 'center' }}>
            <div className="glass-card animate-fade" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-flex', background: 'var(--primary)', padding: '12px', borderRadius: '12px', marginBottom: '1.2rem' }}>
                        <LogIn size={24} color="white" />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>System Access</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enter your credentials to enter the hub</p>
                </div>

                {error && <div className="glass" style={{ padding: '1rem', color: 'var(--error)', marginBottom: '1.5rem', textAlign: 'center', borderColor: 'var(--error)' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label><Mail size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Email Address</label>
                        <input 
                            type="email" 
                            className="input-control" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="name@example.com"
                        />
                    </div>

                    <div className="input-group">
                        <label><Lock size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Password</label>
                        <input 
                            type="password" 
                            className="input-control" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        <LogIn size={20} /> Login
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
