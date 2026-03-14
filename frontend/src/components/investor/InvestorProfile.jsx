import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../apiConfig';
import { User, Mail, Phone, MapPin, ShieldCheck, Save, Key } from 'lucide-react';

const InvestorProfile = () => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        location: '',
        bio: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/users/profile`);
            setProfile({
                name: data.name || '',
                email: data.email || '',
                phoneNumber: data.phoneNumber || '',
                location: data.location || '',
                bio: data.bio || ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await axios.patch(`${API_BASE_URL}/users/profile`, profile);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading security credentials...</div>;

    return (
        <div className="animate-fade">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Profile Information */}
                <div className="glass-card" style={{ padding: '2.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <User size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Personal Identity</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Management of your public investor profile</p>
                        </div>
                    </div>

                    <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700' }}>
                                <User size={14} /> Full Legal Name
                            </label>
                            <input 
                                type="text" 
                                className="input-control" 
                                value={profile.name} 
                                onChange={e => setProfile({...profile, name: e.target.value})}
                                style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}
                            />
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700' }}>
                                <Mail size={14} /> Registered Email
                            </label>
                            <input 
                                type="email" 
                                className="input-control" 
                                value={profile.email} 
                                onChange={e => setProfile({...profile, email: e.target.value})}
                                style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="input-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700' }}>
                                    <Phone size={14} /> Contact Number
                                </label>
                                <input 
                                    type="text" 
                                    className="input-control" 
                                    value={profile.phoneNumber} 
                                    onChange={e => setProfile({...profile, phoneNumber: e.target.value})}
                                    style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}
                                />
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700' }}>
                                    <MapPin size={14} /> Operational Base
                                </label>
                                <input 
                                    type="text" 
                                    className="input-control" 
                                    value={profile.location} 
                                    onChange={e => setProfile({...profile, location: e.target.value})}
                                    style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700' }}>
                                <ShieldCheck size={14} /> Professional Bio / Strategy
                            </label>
                            <textarea 
                                className="input-control" 
                                value={profile.bio} 
                                onChange={e => setProfile({...profile, bio: e.target.value})}
                                placeholder="Describe your investment strategy..."
                                style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)', minHeight: '100px' }}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={saving}
                            style={{ padding: '1rem', width: '100%', mt: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            <Save size={18} /> {saving ? 'Synchronizing...' : 'Update Corporate Identity'}
                        </button>
                    </form>
                </div>

                {message.text && (
                    <div className="glass-card animate-scale" style={{ 
                        padding: '1.2rem', 
                        background: message.type === 'success' ? '#14b8a620' : '#ef444420', 
                        border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                        color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
                        fontWeight: '700',
                        textAlign: 'center',
                        borderRadius: '12px',
                        marginTop: '1.5rem'
                    }}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvestorProfile;
