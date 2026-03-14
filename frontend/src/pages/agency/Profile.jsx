import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../apiConfig';
import { useAuth } from '../../context/AuthContext';
import { 
    User, Mail, Phone, MapPin, Building2, Globe, 
    Camera, Save, ShieldCheck, Briefcase, Loader2
} from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        agencyName: '',
        location: '',
        website: '',
        bio: '',
        profileImage: ''
    });
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_BASE_URL}/users/profile`);
            setProfileData({
                name: data.name || '',
                email: data.email || '',
                phoneNumber: data.phoneNumber || '',
                agencyName: data.agencyName || '',
                location: data.location || '',
                website: data.website || '',
                bio: data.bio || '',
                profileImage: data.profileImage || ''
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const { data } = await axios.patch(`${API_BASE_URL}/users/profile`, profileData);
            
            // Update local state and auth context if necessary
            // Note: AuthContext might need a way to refresh user data or we can manually update localStorage
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const updatedUserInfo = { ...userInfo, ...data };
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
            
            setSaving(false);
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            setSaving(false);
            alert(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setSaving(true);
            const { data } = await axios.post(`${API_BASE_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfileData({ ...profileData, profileImage: data.url });
            setSaving(false);
        } catch (error) {
            console.error('Error uploading image:', error);
            setSaving(false);
            alert('Failed to upload image');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        </div>
    );

    return (
        <div className="animate-fade">
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>My Profile</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your agency brand and contact information</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Left Column: Avatar & Quick Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem' }}>
                            <div style={{ 
                                width: '100%', 
                                height: '100%', 
                                borderRadius: '50%', 
                                background: profileData.profileImage ? `url(${API_BASE_URL.replace('/api', '')}${profileData.profileImage}) center/cover no-repeat` : 'linear-gradient(135deg, var(--primary), var(--accent))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem',
                                color: 'white',
                                fontWeight: '800',
                                boxShadow: '0 10px 25px -5px rgba(229, 90, 22, 0.3)',
                                overflow: 'hidden'
                            }}>
                                {!profileData.profileImage && profileData.name.charAt(0)}
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                accept="image/*" 
                                onChange={handleImageUpload} 
                            />
                            <button 
                                onClick={() => fileInputRef.current.click()}
                                style={{ 
                                    position: 'absolute', 
                                    bottom: '0', 
                                    right: '0', 
                                    padding: '8px', 
                                    borderRadius: '50%', 
                                    background: 'var(--surface)', 
                                    border: '1px solid var(--border)',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                    cursor: 'pointer'
                                }}
                            >
                                <Camera size={16} color="var(--primary)" />
                            </button>
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.3rem' }}>{profileData.name}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{profileData.agencyName || 'Agency Partner'}</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', textAlign: 'left', background: 'var(--surface-light)', padding: '1rem', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' }}>
                                <ShieldCheck size={14} color="#10b981" />
                                <span style={{ fontWeight: '700', color: '#10b981' }}>Verified Agency</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' }}>
                                <Briefcase size={14} color="var(--primary)" />
                                <span style={{ fontWeight: '600' }}>Agency Member</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '1rem' }}>Identity Verification</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ padding: '0.8rem', borderRadius: '8px', background: 'var(--surface-light)', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '2px' }}>Business License</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Status: Active / Verified</div>
                            </div>
                            <div style={{ padding: '0.8rem', borderRadius: '8px', background: 'var(--surface-light)', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '2px' }}>Tax ID (GST)</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Status: Active / Verified</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Forms */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ padding: '2rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Account Details</h4>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {isEditing && (
                                    <button 
                                        className="btn btn-outline"
                                        onClick={() => setIsEditing(false)}
                                        style={{ padding: '0.5rem 1.2rem', fontSize: '0.8rem' }}
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button 
                                    className={`btn ${isEditing ? 'btn-primary' : 'btn-outline'}`} 
                                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                    disabled={saving}
                                    style={{ padding: '0.5rem 1.2rem', fontSize: '0.8rem' }}
                                >
                                    {isEditing ? (
                                        <>
                                            {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                            Save Changes
                                        </>
                                    ) : 'Edit Profile'}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="input-group">
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>FULL NAME</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input 
                                        type="text" 
                                        disabled={!isEditing}
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '10px', border: '1px solid var(--border)', background: isEditing ? 'var(--surface)' : 'var(--surface-light)', color: 'var(--text)', fontSize: '0.9rem' }} 
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>AGENCY NAME</label>
                                <div style={{ position: 'relative' }}>
                                    <Building2 size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input 
                                        type="text" 
                                        disabled={!isEditing}
                                        value={profileData.agencyName}
                                        onChange={(e) => setProfileData({...profileData, agencyName: e.target.value})}
                                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '10px', border: '1px solid var(--border)', background: isEditing ? 'var(--surface)' : 'var(--surface-light)', color: 'var(--text)', fontSize: '0.9rem' }} 
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>EMAIL ADDRESS</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input 
                                        type="email" 
                                        disabled={!isEditing}
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '10px', border: '1px solid var(--border)', background: isEditing ? 'var(--surface)' : 'var(--surface-light)', color: 'var(--text)', fontSize: '0.9rem' }} 
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>PHONE NUMBER</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input 
                                        type="text" 
                                        disabled={!isEditing}
                                        value={profileData.phoneNumber}
                                        onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '10px', border: '1px solid var(--border)', background: isEditing ? 'var(--surface)' : 'var(--surface-light)', color: 'var(--text)', fontSize: '0.9rem' }} 
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>PRIMARY LOCATION</label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input 
                                        type="text" 
                                        disabled={!isEditing}
                                        value={profileData.location}
                                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '10px', border: '1px solid var(--border)', background: isEditing ? 'var(--surface)' : 'var(--surface-light)', color: 'var(--text)', fontSize: '0.9rem' }} 
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>WEBSITE</label>
                                <div style={{ position: 'relative' }}>
                                    <Globe size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input 
                                        type="text" 
                                        disabled={!isEditing}
                                        value={profileData.website}
                                        onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '10px', border: '1px solid var(--border)', background: isEditing ? 'var(--surface)' : 'var(--surface-light)', color: 'var(--text)', fontSize: '0.9rem' }} 
                                    />
                                </div>
                            </div>

                            <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>AGENCY BIOGRAPHY</label>
                                <textarea 
                                    disabled={!isEditing}
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                    rows="4"
                                    style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)', background: isEditing ? 'var(--surface)' : 'var(--surface-light)', fontSize: '0.9rem', resize: 'none', color: 'var(--text)' }} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
