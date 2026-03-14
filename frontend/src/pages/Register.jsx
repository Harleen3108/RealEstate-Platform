import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, Briefcase } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Buyer',
        phoneNumber: ''
    });
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

    return (
        <div className="section container" style={{ display: 'flex', justifyContent: 'center', minHeight: '95vh', alignItems: 'center' }}>
            <div className="glass-card animate-fade" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-flex', background: 'var(--primary)', padding: '12px', borderRadius: '12px', marginBottom: '1.2rem' }}>
                        <UserPlus size={24} color="white" />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join the elite real estate community</p>
                </div>

                {error && <div className="glass" style={{ padding: '1rem', color: 'var(--error)', marginBottom: '1.5rem', textAlign: 'center', borderColor: 'var(--error)' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label><User size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Full Name</label>
                        <input 
                            type="text" 
                            className="input-control" 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label><Mail size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Email Address</label>
                        <input 
                            type="email" 
                            className="input-control" 
                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label><Phone size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Phone Number</label>
                        <input 
                            type="text" 
                            className="input-control" 
                            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
                        />
                    </div>

                    <div className="input-group">
                        <label><Briefcase size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Access Role</label>
                        <select 
                            className="input-control" 
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="Buyer">Buyer / Individual</option>
                            <option value="Agency">Real Estate Agency</option>
                            <option value="Investor">Real Estate Investor</option>
                            <option value="Admin">System Administrator</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label><Lock size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Password</label>
                        <input 
                            type="password" 
                            className="input-control" 
                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                            required 
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        <UserPlus size={20} /> Create Account
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
