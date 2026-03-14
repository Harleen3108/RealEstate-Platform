import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../apiConfig';
import { Key, Bell, Shield, Eye, Globe, Save } from 'lucide-react';

const InvestorSettings = () => {
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        pushNotifications: false,
        twoFactorAuth: false,
        publicProfile: true,
        language: 'English'
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setMessage({ type: 'error', text: 'Passwords do not match' });
        }
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await axios.patch(`${API_BASE_URL}/users/profile/password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Password update failed' });
        } finally {
            setSaving(false);
        }
    };

    const handlePreferenceToggle = (key) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSavePreferences = () => {
        setSaving(true);
        // Mock API call
        setTimeout(() => {
            setSaving(false);
            setMessage({ type: 'success', text: 'Preferences saved successfully!' });
        }, 800);
    };

    return (
        <div className="animate-fade">
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '2rem' }}>
                {/* Security Section */}
                <div className="glass-card" style={{ padding: '2.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--surface-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1px solid var(--border)' }}>
                            <Key size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Authentication</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Update your account access key</p>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700' }}>Current Password</label>
                            <input 
                                type="password" 
                                className="input-control" 
                                value={passwordData.currentPassword}
                                onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700' }}>New Password</label>
                            <input 
                                type="password" 
                                className="input-control" 
                                value={passwordData.newPassword}
                                onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                                style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700' }}>Confirm New Password</label>
                            <input 
                                type="password" 
                                className="input-control" 
                                value={passwordData.confirmPassword}
                                onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={saving}
                            style={{ padding: '1rem', width: '100%', mt: '1.2rem' }}
                        >
                            {saving ? 'Processing...' : 'Change Password'}
                        </button>
                    </form>
                </div>

                {/* Preferences Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-card" style={{ padding: '2.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2.5rem' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <Bell size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>System Preferences</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Customize your dashboard experience</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ color: 'var(--primary)' }}><Globe size={20} /></div>
                                    <div>
                                        <div style={{ fontWeight: '700', color: 'var(--text)', fontSize: '0.95rem' }}>Language & Regional</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Choose your preferred display language</div>
                                    </div>
                                </div>
                                <select className="input-control" style={{ width: '140px', background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)', padding: '5px 10px' }}>
                                    <option>English</option>
                                    <option>Hindi</option>
                                    <option>Spanish</option>
                                </select>
                            </div>

                            {[
                                { id: 'emailNotifications', label: 'Email Reports', desc: 'Receive weekly portfolio performance summaries', icon: Shield },
                                { id: 'pushNotifications', label: 'Real-time Alerts', desc: 'Get notified of valuation changes instantly', icon: Bell },
                                { id: 'publicProfile', label: 'Incognito Mode', desc: 'Hide your profile from property marketplace', icon: Eye }
                            ].map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <div style={{ color: 'var(--primary)' }}><item.icon size={20} /></div>
                                        <div>
                                            <div style={{ fontWeight: '700', color: 'var(--text)', fontSize: '0.95rem' }}>{item.label}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handlePreferenceToggle(item.id)}
                                        style={{ 
                                            width: '50px', 
                                            height: '26px', 
                                            borderRadius: '20px', 
                                            background: preferences[item.id] ? 'var(--primary)' : 'var(--surface-light)',
                                            border: '1px solid var(--border)',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <div style={{ 
                                            position: 'absolute', 
                                            top: '2px', 
                                            left: preferences[item.id] ? '26px' : '2px', 
                                            width: '20px', 
                                            height: '20px', 
                                            borderRadius: '50%', 
                                            background: 'white',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}></div>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={handleSavePreferences}
                            className="btn btn-outline" 
                            style={{ width: '100%', marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            <Save size={18} /> Save Preferences
                        </button>
                    </div>

                    {message.text && (
                        <div className="glass-card animate-scale" style={{ 
                            padding: '1.2rem', 
                            background: message.type === 'success' ? '#14b8a620' : '#ef444420', 
                            border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                            color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
                            fontWeight: '700',
                            textAlign: 'center',
                            borderRadius: '12px'
                        }}>
                            {message.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvestorSettings;
