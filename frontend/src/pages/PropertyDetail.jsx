import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL, { BACKEND_URL } from '../apiConfig';
import { MapPin, Bed, Bath, Move, CheckCircle2, CheckCircle, Building2, Phone, Mail, ArrowLeft, Heart, Share2, ShieldCheck, Info, Home, MessageCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PropertyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    
    // Enquiry Form State
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phoneNumber || '',
        message: ''
    });
    
    const [enquirySent, setEnquirySent] = useState(false);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const { data: propData } = await axios.get(`${API_BASE_URL}/properties/${id}`);
                setProperty(propData);
                
                if (user) {
                    const { data: userData } = await axios.get(`${API_BASE_URL}/auth/me`);
                    setIsSaved(userData.savedProperties.some(p => p._id === id || p === id));
                }
                
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchProperty();
    }, [id, user]);

    const toggleSave = async () => {
        if (!user) return navigate('/login');
        try {
            await axios.post(`${API_BASE_URL}/auth/save-property/${id}`);
            setIsSaved(!isSaved);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEnquiry = async (e) => {
        e.preventDefault();
        if (!user) return navigate('/login');
        
        try {
            await axios.post(`${API_BASE_URL}/leads`, {
                propertyId: property._id,
                agencyId: property.agency._id,
                ...formData
            });
            setEnquirySent(true);
        } catch (error) {
            alert(error.response?.data?.message || 'Enquiry failed');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <Info className="animate-pulse" size={40} color="var(--primary)" />
        </div>
    );
    
    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/800x520';
        if (url.startsWith('http')) {
            if (window.location.hostname !== 'localhost' && url.includes('localhost:5000')) {
                return url.replace('http://localhost:5000', BACKEND_URL);
            }
            return url;
        }
        return `${BACKEND_URL}${url}`;
    };

    if (!property) return <div className="container section">Property not found</div>;

    return (
        <div className="section container animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem', fontWeight: '700' }}>
                    <ArrowLeft size={18} /> Back
                </button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                     <button className="btn btn-outline" style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', borderRadius: '50%', width: '45px', height: '45px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
                        <Share2 size={18} />
                    </button>
                    <button 
                        onClick={toggleSave}
                        className={`btn ${isSaved ? 'btn-primary' : 'btn-outline'}`} 
                        style={{ borderRadius: '50%', width: '45px', height: '45px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isSaved ? 'var(--primary)' : 'var(--surface-light)', border: isSaved ? 'none' : '1px solid var(--border)', color: isSaved ? 'white' : 'var(--text)' }}
                    >
                        <Heart size={18} fill={isSaved ? 'white' : 'none'} />
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
                <div>
                    <div style={{ height: '520px', borderRadius: '24px', overflow: 'hidden', marginBottom: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                        <img src={getImageUrl(property.images?.[activeImage])} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    
                    {/* Image Thumbnails */}
                    {property.images && property.images.length > 1 && (
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            {property.images.map((img, index) => (
                                <div 
                                    key={index}
                                    onClick={() => setActiveImage(index)}
                                    style={{ 
                                        width: '100px', 
                                        height: '70px', 
                                        borderRadius: '12px', 
                                        overflow: 'hidden', 
                                        cursor: 'pointer',
                                        border: activeImage === index ? '3px solid var(--primary)' : '1px solid var(--border)',
                                        opacity: activeImage === index ? 1 : 0.7,
                                        transition: 'all 0.2s ease',
                                        flexShrink: 0
                                    }}
                                >
                                    <img src={getImageUrl(img)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                         <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'white', padding: '6px 16px', borderRadius: '30px', width: 'fit-content', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)' }}>
                                <Building2 size={16} />
                                <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{property.propertyType}</span>
                            </div>
                            <h1 style={{ fontSize: '3rem', fontWeight: '900', marginTop: '1rem', color: 'var(--text)', lineHeight: '1.1' }}>{property.title}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginTop: '0.8rem', fontSize: '1.1rem' }}>
                                <MapPin size={22} color="var(--primary)" /> {property.location}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                             <div style={{ color: 'var(--text)', fontSize: '2.8rem', fontWeight: '900' }}>
                                <span style={{ fontSize: '1.2rem', verticalAlign: 'top', marginRight: '4px', opacity: 0.7, color: 'var(--text-muted)' }}>₹</span>
                                {property.price.toLocaleString()}
                            </div>
                            <div style={{ color: 'var(--success)', fontWeight: '700', fontSize: '0.9rem' }}>Market Verified Asset</div>
                        </div>
                    </div>

                     <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: '800', color: 'var(--text)' }}>The Vision</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-line', fontWeight: '600' }}>{property.description}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                        {[
                            { icon: Home, label: 'Area', value: `${property.size} SQFT` },
                            { icon: Bed, label: 'Beds', value: property.bedrooms },
                            { icon: Bath, label: 'Baths', value: property.bathrooms },
                            { icon: CheckCircle, label: 'Status', value: property.status }
                        ].map((amenity, i) => (
                             <div key={i} className="glass-card" style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                                <amenity.icon size={28} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text)' }}>{amenity.value}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px', fontWeight: '700' }}>{amenity.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ position: 'sticky', top: '120px', height: 'fit-content' }}>
                    <div className="glass-card" style={{ border: '2px solid var(--primary)', padding: '2.5rem' }}>
                        <h3 style={{ marginBottom: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.4rem' }}>
                            <MessageCircle size={28} color="var(--primary)" /> Express Interest
                        </h3>
                        
                        {enquirySent ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                    <CheckCircle size={40} color="var(--success)" />
                                </div>
                                <h4 style={{ fontSize: '1.2rem' }}>Interest Logged!</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.8rem' }}>The Listing Agency has been notified and will reach out to you shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleEnquiry}>
                                 <div className="input-group">
                                    <label style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Full Name</label>
                                    <input type="text" className="input-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                                </div>
                                <div className="input-group">
                                    <label style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Email Address</label>
                                    <input type="email" className="input-control" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                                </div>
                                <div className="input-group">
                                    <label style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Phone Number</label>
                                    <input type="text" className="input-control" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                                </div>
                                <div className="input-group">
                                    <label style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Message</label>
                                    <textarea 
                                        className="input-control" 
                                        rows="4" 
                                        placeholder="Discuss viewing times or requirements..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                        required
                                        style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.1rem', fontSize: '1rem', fontWeight: '800', marginTop: '1rem' }}>
                                    Submit Enquiry
                                </button>
                                {!user && <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Login to start negotiating</p>}
                            </form>
                        )}
                        
                         <div style={{ borderTop: '1px solid var(--border)', marginTop: '2.5rem', paddingTop: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                                <div style={{ width: '55px', height: '55px', borderRadius: '50%', background: 'var(--surface-light)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={26} color="var(--primary)" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Managing Agency</div>
                                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text)' }}>{property.agency?.name}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetail;
