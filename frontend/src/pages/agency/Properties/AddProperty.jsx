import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Save, X, Upload, FileText, Building2, MapPin, 
    DollarSign, Layout, Edit, Plus 
} from 'lucide-react';
import API_BASE_URL, { BACKEND_URL } from '../../../apiConfig';
import { useAuth } from '../../../context/AuthContext';

const AddProperty = () => {
    const { id } = useParams(); // For edit mode
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [propData, setPropData] = useState({
        title: '',
        description: '',
        location: '',
        propertyType: 'Apartment',
        price: '',
        size: '',
        bedrooms: '',
        bathrooms: '',
        amenities: '',
        status: 'Available',
        images: [],
        documents: []
    });

    const propStatuses = ['Available', 'Reserved', 'Under Contract', 'Sold'];

    useEffect(() => {
        if (id) fetchPropertyDetails();
    }, [id]);

    const fetchPropertyDetails = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_BASE_URL}/properties/${id}`);
            setPropData({
                ...data,
                amenities: data.amenities.join(', ')
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching property details:', error);
            setLoading(false);
        }
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data } = await axios.post(`${API_BASE_URL}/upload`, formData);
            if (type === 'image') {
                setPropData(prev => ({ ...prev, images: [...prev.images, data.url] }));
            } else {
                setPropData(prev => ({ ...prev, documents: [...prev.documents, data.url] }));
            }
        } catch (error) {
            alert('File upload failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...propData,
                agency: user._id,
                amenities: propData.amenities.split(',').map(a => a.trim()).filter(a => a)
            };

            if (id) {
                await axios.put(`${API_BASE_URL}/properties/${id}`, payload);
            } else {
                await axios.post(`${API_BASE_URL}/properties`, payload);
            }
            
            navigate('/dashboard/agency/listings');
        } catch (error) {
            alert(error.response?.data?.message || 'Action failed');
        } finally {
            setSubmitting(false);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/400x200?text=No+Image';
        if (url.startsWith('http')) return url;
        return `${BACKEND_URL}${url}`;
    };

    if (loading) return <div>Loading details...</div>;

    return (
        <div className="animate-fade" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{id ? 'Edit Listing' : 'Create New Listing'}</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Fill in the details below to {id ? 'update' : 'publish'} your property.</p>
                </div>
                <button className="btn btn-outline" onClick={() => navigate(-1)}>
                    <X size={18} /> Cancel
                </button>
            </div>

            <div className="glass-card" style={{ background: 'var(--surface)', padding: '2.5rem', border: '1px solid var(--border)' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Headline Title</label>
                        <input type="text" className="input-control" required value={propData.title} onChange={e => setPropData({...propData, title: e.target.value})} style={{ background: 'var(--surface-light)', color: 'var(--text)' }} />
                    </div>
                    <div className="input-group">
                        <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Price (₹)</label>
                        <input type="number" className="input-control" required value={propData.price} onChange={e => setPropData({...propData, price: e.target.value})} style={{ background: 'var(--surface-light)', color: 'var(--text)' }} />
                    </div>
                    <div className="input-group" style={{ gridColumn: 'span 3' }}>
                        <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Description</label>
                        <textarea className="input-control" rows="4" required value={propData.description} onChange={e => setPropData({...propData, description: e.target.value})} style={{ background: 'var(--surface-light)', color: 'var(--text)' }}></textarea>
                    </div>
                    <div className="input-group">
                        <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Location / City</label>
                        <input type="text" className="input-control" required value={propData.location} onChange={e => setPropData({...propData, location: e.target.value})} style={{ background: 'var(--surface-light)', color: 'var(--text)' }} />
                    </div>
                    <div className="input-group">
                        <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Property Category</label>
                        <select className="input-control" value={propData.propertyType} onChange={e => setPropData({...propData, propertyType: e.target.value})} style={{ background: 'var(--surface-light)', color: 'var(--text)' }}>
                            <option>Apartment</option>
                            <option>Villa</option>
                            <option>Commercial</option>
                            <option>Land</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Status</label>
                        <select className="input-control" value={propData.status} onChange={e => setPropData({...propData, status: e.target.value})} style={{ background: 'var(--surface-light)', color: 'var(--text)' }}>
                            {propStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Area (sqft)</label>
                        <input type="number" className="input-control" required value={propData.size} onChange={e => setPropData({...propData, size: e.target.value})} style={{ background: 'var(--surface-light)', color: 'var(--text)' }} />
                    </div>
                    <div className="input-group">
                        <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Beds</label>
                        <input type="number" className="input-control" value={propData.bedrooms} onChange={e => setPropData({...propData, bedrooms: e.target.value})} style={{ background: 'var(--surface-light)', color: 'var(--text)' }} />
                    </div>
                    <div className="input-group">
                        <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Baths</label>
                        <input type="number" className="input-control" value={propData.bathrooms} onChange={e => setPropData({...propData, bathrooms: e.target.value})} style={{ background: 'var(--surface-light)', color: 'var(--text)' }} />
                    </div>
                    <div className="input-group" style={{ gridColumn: 'span 3' }}>
                        <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Amenities (comma separated)</label>
                        <input type="text" className="input-control" placeholder="Pool, Gym, Parking, WiFi" value={propData.amenities} onChange={e => setPropData({...propData, amenities: e.target.value})} style={{ background: 'var(--surface-light)', color: 'var(--text)' }} />
                    </div>
                    
                    {/* Media Uploads */}
                    <div className="input-group" style={{ gridColumn: 'span 3' }}>
                        <label style={{ fontWeight: '700', marginBottom: '1rem', display: 'block' }}>Media & Documents</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <Upload size={16} /> Upload Images
                                        <input type="file" hidden onChange={e => handleFileUpload(e, 'image')} />
                                    </label>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {propData.images.map((img, i) => (
                                        <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                            <img src={getImageUrl(img)} style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)' }} />
                                            <button
                                                type="button"
                                                onClick={() => setPropData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                                                style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--error)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <FileText size={16} /> Property Documents
                                        <input type="file" hidden onChange={e => handleFileUpload(e, 'doc')} />
                                    </label>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {propData.documents.length} files attached
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 3', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', padding: '1.2rem', fontSize: '1rem' }}>
                            {submitting ? 'Processing...' : (id ? 'Update Listing' : 'Publish Property')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProperty;
