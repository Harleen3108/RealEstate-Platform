import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../apiConfig';
import { useTheme } from '../../context/ThemeContext';
import { 
    Settings as SettingsIcon, Bell, Lock, 
    Smartphone, Palette, ChevronRight, Save,
    Moon, Sun, Loader2, ShieldCheck, Mail
} from 'lucide-react';

const Settings = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('notifications');
    const [saving, setSaving] = useState(false);
    
    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords don't match!");
            return;
        }

        try {
            setSaving(true);
            await axios.patch(`${API_BASE_URL}/users/profile/password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            alert('Password updated successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update password');
        } finally {
            setSaving(false);
        }
    };

    const categories = [
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security & Access', icon: Lock },
        { id: 'appearance', label: 'Appearance', icon: Palette }
    ];

    return (
        <div className="animate-fade">
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>Settings</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Configure your dashboard preferences and security</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Left: Navigation Categories */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {categories.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px', 
                                padding: '1rem', 
                                border: 'none', 
                                background: activeTab === item.id ? 'var(--surface)' : 'transparent',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                border: activeTab === item.id ? '1px solid var(--border)' : '1px solid transparent',
                                color: activeTab === item.id ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: activeTab === item.id ? '700' : '600',
                                textAlign: 'left',
                                width: '100%'
                            }}
                        >
                            <item.icon size={18} />
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {activeTab === item.id && <ChevronRight size={14} />}
                        </button>
                    ))}
                </div>

                {/* Right: Settings Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {activeTab === 'notifications' && (
                        <div className="glass-card animate-fade" style={{ padding: '2rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Bell size={20} color="var(--primary)" /> Notification Center
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                                Manage how you receive alerts about leads, properties, and system updates.
                            </p>
                            
                            <div style={{ padding: '2rem', background: 'var(--surface-light)', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(249, 115, 22, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                    <Bell size={30} />
                                </div>
                                <h4 style={{ fontWeight: '800', marginBottom: '0.5rem' }}>View Recent Notifications</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Check your notification history for lead activity and account alerts.</p>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={() => navigate('/dashboard/agency/notifications')}
                                    style={{ padding: '0.8rem 2rem' }}
                                >
                                    Go to Notifications Page
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="glass-card animate-fade" style={{ padding: '2rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Lock size={20} color="var(--primary)" /> Password & Security
                            </h3>
                            
                            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div className="input-group">
                                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>CURRENT PASSWORD</label>
                                    <input 
                                        type="password" 
                                        className="input-control"
                                        required
                                        value={passwordData.currentPassword}
                                        onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                        style={{ background: 'var(--surface-light)', color: 'var(--text)', border: '1px solid var(--border)' }}
                                    />
                                </div>
                                <div className="input-group">
                                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>NEW PASSWORD</label>
                                    <input 
                                        type="password" 
                                        className="input-control"
                                        required
                                        value={passwordData.newPassword}
                                        onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                                        style={{ background: 'var(--surface-light)', color: 'var(--text)', border: '1px solid var(--border)' }}
                                    />
                                </div>
                                <div className="input-group">
                                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>CONFIRM NEW PASSWORD</label>
                                    <input 
                                        type="password" 
                                        className="input-control"
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                        style={{ background: 'var(--surface-light)', color: 'var(--text)', border: '1px solid var(--border)' }}
                                    />
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    disabled={saving}
                                    style={{ padding: '0.8rem 2rem', marginTop: '1rem', width: 'fit-content' }}
                                >
                                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Update Password
                                </button>
                            </form>

                            <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    <ShieldCheck size={20} color="#10b981" />
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#065f46' }}>Two-Factor Authentication</div>
                                        <div style={{ fontSize: '0.75rem', color: '#047857' }}>Your account is protected with SMS verification.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="glass-card animate-fade" style={{ padding: '2rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Palette size={20} color="var(--primary)" /> Theme & Appearance
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                                Customize how the platform looks on your device. Choose between light and dark modes.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div 
                                    onClick={() => theme !== 'light' && toggleTheme()}
                                    style={{ 
                                        padding: '1.5rem', 
                                        borderRadius: '16px', 
                                        background: theme === 'light' ? 'rgba(249, 115, 22, 0.05)' : 'var(--surface-light)',
                                        border: theme === 'light' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: theme === 'light' ? 'var(--primary)' : 'var(--border)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                        <Sun size={20} />
                                    </div>
                                    <div style={{ fontWeight: '800', color: theme === 'light' ? 'var(--primary)' : 'var(--text)' }}>Light Mode</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Clean & professional</div>
                                </div>

                                <div 
                                    onClick={() => theme !== 'dark' && toggleTheme()}
                                    style={{ 
                                        padding: '1.5rem', 
                                        borderRadius: '16px', 
                                        background: theme === 'dark' ? 'rgba(249, 115, 22, 0.05)' : 'var(--surface-light)',
                                        border: theme === 'dark' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: theme === 'dark' ? 'var(--primary)' : 'var(--border)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                        <Moon size={20} />
                                    </div>
                                    <div style={{ fontWeight: '800', color: theme === 'dark' ? 'var(--primary)' : 'var(--text)' }}>Dark Mode</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Easier on the eyes</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
