import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL, { BACKEND_URL } from '../apiConfig';
import { MapPin, Bed, Bath, Move, CheckCircle2, CheckCircle, Building2, Phone, Mail, ArrowLeft, Heart, Share2, ShieldCheck, Info, Home, MessageCircle, User, ChevronRight, Layout } from 'lucide-react';
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

    const getEmbedUrl = (url) => {
        if (!url) return null;
        
        let cleanUrl = url.trim();

        // 1. If the user pasted the entire <iframe> tag, extract only the src
        if (cleanUrl.includes('<iframe')) {
            const srcMatch = cleanUrl.match(/src=["']([^"']+)["']/);
            if (srcMatch && srcMatch[1]) {
                cleanUrl = srcMatch[1];
            }
        }

        // 2. If it's already a proper embed URL, return it
        if (cleanUrl.includes('/maps/embed') || cleanUrl.includes('output=embed')) {
            return cleanUrl;
        }

        // 3. Handle standard "place" or "dir" URLs: .../maps/place/Some+Name/...
        // We extract the place name or coordinates and build a clean search query
        const placeMatch = cleanUrl.match(/\/maps\/(search|place)\/([^/@?]+)/);
        if (placeMatch && placeMatch[2]) {
            const query = decodeURIComponent(placeMatch[2].replace(/\+/g, ' '));
            return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
        }

        // 4. Handle coordinate-only URLs: .../maps/@26.345,75.342,15z
        const coordMatch = cleanUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (coordMatch && coordMatch[1] && coordMatch[2]) {
            return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&output=embed`;
        }

        // 5. Fallback for any google maps link: make sure output=embed is there
        if (cleanUrl.includes('google.com/maps') || cleanUrl.includes('maps.google')) {
            const separator = cleanUrl.includes('?') ? '&' : '?';
            return `${cleanUrl}${separator}output=embed`;
        }

        return cleanUrl;
    };

    if (!property) return <div className="container section">Property not found</div>;

    return (
        <div style={{ background: 'var(--background)', minHeight: '100vh', paddingBottom: '4rem', color: 'var(--text)' }}>
            {/* Navigation Header - Breadcrumbs */}
            <div className="container" style={{ padding: '1.5rem 0' }}>
                <Link to={user?.role === 'Buyer' ? '/dashboard/user/browse' : '/marketplace'} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '700', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    <ArrowLeft size={18} /> Back to Properties
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span>
                    <ChevronRight size={14} />
                    <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{property.location}</span>
                    <ChevronRight size={14} />
                    <span style={{ color: 'var(--text)', fontWeight: '700' }}>{property.title}</span>
                </div>
            </div>

            <div className="container">
                {/* Image Grid - Masonry style */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 1fr 1fr', 
                    gridTemplateRows: 'repeat(2, 250px)', 
                    gap: '12px', 
                    borderRadius: '24px', 
                    overflow: 'hidden', 
                    marginBottom: '2.5rem' 
                }}>
                    <div style={{ gridRow: 'span 2' }}>
                        <img src={getImageUrl(property.images?.[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    {property.images?.[1] && (
                        <div>
                            <img src={getImageUrl(property.images[1])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    )}
                    {property.images?.[2] && (
                        <div>
                            <img src={getImageUrl(property.images[2])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    )}
                    {property.images?.[3] && (
                        <div>
                            <img src={getImageUrl(property.images[3])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    )}
                    {property.images?.[4] ? (
                        <div style={{ position: 'relative' }}>
                            <img src={getImageUrl(property.images[4])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {property.images.length > 5 && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(249, 115, 22, 0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                                    <Layout size={24} />
                                    <span style={{ fontWeight: '800', marginTop: '8px' }}>Show all {property.images.length} photos</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ background: 'var(--surface-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            <Home size={40} />
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 350px', gap: '4rem' }}>
                    {/* Left Column: Content */}
                    <div>
                        <div style={{ marginBottom: '2.5rem' }}>
                            <div style={{ background: '#ffedd5', color: '#f97316', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', display: 'inline-block', marginBottom: '1rem' }}>
                                {property.propertyType?.toUpperCase() || 'PREMIUM PROPERTY'}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text)', marginBottom: '0.5rem' }}>{property.title}</h1>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: '700' }}>
                                        <MapPin size={18} /> {property.location}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)' }}>
                                        ₹{property.price?.toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>per month / total</div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '3rem' }}>
                            {[
                                { icon: Home, label: 'SQUARE FEET', value: `${property.size} SQFT`, color: 'var(--primary)' },
                                { icon: Bed, label: 'BEDROOMS', value: `${property.bedrooms} Beds`, color: 'var(--primary)' },
                                { icon: Bath, label: 'BATHROOMS', value: `${property.bathrooms} Bath`, color: 'var(--primary)' }
                            ].map((s, i) => (
                                <div key={i} style={{ background: 'var(--surface)', padding: '1.5rem', textAlign: 'center' }}>
                                    <s.icon size={24} color={s.color} style={{ marginBottom: '0.8rem' }} />
                                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text)' }}>{s.value}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', marginTop: '4px' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text)', marginBottom: '1.2rem' }}>The Vision</h3>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8', whiteSpace: 'pre-line' }}>{property.description}</p>
                        </div>

                        {/* Amenities */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text)', marginBottom: '1.5rem' }}>Key Amenities</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2rem' }}>
                                {property.amenities?.map((amenity, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <div style={{ background: 'var(--surface-light)', padding: '8px', borderRadius: '8px', color: 'var(--primary)' }}>
                                            <CheckCircle2 size={18} />
                                        </div>
                                        <span style={{ fontWeight: '700', color: 'var(--text)', fontSize: '0.9rem' }}>{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location / Map */}
                        <div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text)', marginBottom: '1.5rem' }}>Location</h3>
                            <div style={{ width: '100%', height: '400px', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-light)' }}>
                                {property.mapLocation ? (
                                    property.mapLocation.includes('maps.app.goo.gl') ? (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
                                            <MapPin size={40} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                                            <p style={{ color: '#64748b', fontWeight: '600' }}>This map link is in a shortened format that cannot be displayed here.</p>
                                            <a href={property.mapLocation} target="_blank" rel="noopener noreferrer" style={{ marginTop: '1rem', color: 'var(--primary)', fontWeight: '700', textDecoration: 'underline' }}>
                                                View on Google Maps
                                            </a>
                                        </div>
                                    ) : (
                                        <iframe 
                                            src={getEmbedUrl(property.mapLocation)}
                                            width="100%" 
                                            height="100%" 
                                            style={{ border: 0 }} 
                                            allowFullScreen="" 
                                            loading="lazy" 
                                            referrerPolicy="no-referrer-when-downgrade"
                                        ></iframe>
                                    )
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                        <MapPin size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                        <p style={{ fontWeight: '600' }}>{property.location}</p>
                                        <p style={{ fontSize: '0.8rem' }}>Map view not available for this property</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sticky Sidebar */}
                    <div style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
                        <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '24px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text)', marginBottom: '4px' }}>Express Interest</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Schedule a visitor get more details.</p>

                            {enquirySent ? (
                                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                    <div style={{ width: '64px', height: '64px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                        <CheckCircle size={32} color="#10b981" />
                                    </div>
                                    <h4 style={{ color: '#0f172a', fontWeight: '800' }}>Inquiry Sent!</h4>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>We'll be in touch shortly.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleEnquiry}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>FULL NAME</label>
                                        <input type="text" style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontWeight: '600' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" required />
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>EMAIL ADDRESS</label>
                                        <input type="email" style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontWeight: '600' }} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" required />
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>PHONE NUMBER</label>
                                        <input type="text" style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontWeight: '600' }} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 00000 00000" required />
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>MESSAGE</label>
                                        <textarea rows="3" style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontWeight: '600', resize: 'none' }} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="I am interested in this villa..." required></textarea>
                                    </div>
                                    <button type="submit" style={{ width: '100%', padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(229, 90, 22, 0.3)' }}>
                                        Send Inquiry
                                    </button>
                                </form>
                            )}

                            {/* Agent Info */}
                            <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: 'var(--surface-light)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {property.agency?.profileImage ? (
                                            <img src={getImageUrl(property.agency.profileImage)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                        ) : (
                                            <User size={24} color="var(--primary)" />
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '800', color: 'var(--text)' }}>{property.agency?.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Property Advisor • Active partner</div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <button onClick={() => window.location.href = `tel:${property.agency?.phoneNumber}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.6rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
                                        <Phone size={14} /> Call
                                    </button>
                                    <button onClick={() => window.location.href = `mailto:${property.agency?.email}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.6rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
                                        <Mail size={14} /> Email
                                    </button>
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
