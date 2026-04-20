import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Save, X, Upload, FileText, Building2, MapPin,
    DollarSign, Layout, Edit, Plus, Bot, Loader
} from 'lucide-react';
import API_BASE_URL, { BACKEND_URL } from '../../../apiConfig';
import { useAuth } from '../../../context/AuthContext';

const formatINR = (num) => {
    if (!num) return '---';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
    return `₹${num.toLocaleString('en-IN')}`;
};

const AddProperty = () => {
    const { id } = useParams(); // For edit mode
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [aiEstimate, setAiEstimate] = useState(null);
    const [estimating, setEstimating] = useState(false);
    const estimateTimer = useRef(null);

    const [propData, setPropData] = useState({
        title: '',
        description: '',
        location: '',
        mapLocation: '',
        propertyType: 'Apartment',
        price: '',
        size: '',
        bedrooms: '',
        bathrooms: '',
        amenities: '',
        status: 'Available',
        images: [],
        threeDModelUrl: '',
        threeDModelImages: [],
        tour360Url: '',
        tour360Images: [],
        tour360RoomNames: [],
        documents: []
    });

    const propStatuses = ['Available', 'Reserved', 'Under Contract', 'Sold'];

    useEffect(() => {
        if (id) fetchPropertyDetails();
    }, [id]);

    // Auto-fetch AI estimate when location + size are filled
    useEffect(() => {
        if (estimateTimer.current) clearTimeout(estimateTimer.current);

        if (propData.location && propData.size && Number(propData.size) > 0) {
            estimateTimer.current = setTimeout(() => {
                fetchAiEstimate();
            }, 1500); // Debounce 1.5s
        } else {
            setAiEstimate(null);
        }

        return () => { if (estimateTimer.current) clearTimeout(estimateTimer.current); };
    }, [propData.location, propData.size, propData.propertyType, propData.bedrooms, propData.price]);

    const fetchAiEstimate = async () => {
        setEstimating(true);
        try {
            const { data } = await axios.post(`${API_BASE_URL}/estimation/direct-estimate`, {
                location: propData.location,
                propertyType: propData.propertyType,
                size: Number(propData.size),
                bedrooms: propData.bedrooms ? Number(propData.bedrooms) : undefined,
                bathrooms: propData.bathrooms ? Number(propData.bathrooms) : undefined,
                price: propData.price ? Number(propData.price) : undefined
            });
            setAiEstimate(data);
        } catch (error) {
            console.error('AI estimate error:', error);
            setAiEstimate(null);
        } finally {
            setEstimating(false);
        }
    };

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
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const { data } = await axios.post(`${API_BASE_URL}/upload`, formData);
                if (type === 'image') {
                    setPropData(prev => ({ ...prev, images: [...prev.images, data.url] }));
                } else if (type === 'model') {
                    setPropData(prev => ({ ...prev, threeDModelUrl: data.url }));
                } else if (type === 'panorama') {
                    setPropData(prev => ({
                        ...prev,
                        tour360Images: [...(prev.tour360Images || []), data.url],
                        tour360RoomNames: [...(prev.tour360RoomNames || []), `Scene ${(prev.tour360Images || []).length + 1}`],
                    }));
                } else if (type === 'doc') {
                    setPropData(prev => ({ ...prev, documents: [...prev.documents, data.url] }));
                }
            } catch {
                alert('File upload failed');
            }
        }
        e.target.value = '';
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

            {/* AI Estimate Banner */}
            {(aiEstimate || estimating) && (
                <div className="glass-card" style={{
                    marginBottom: '1.5rem',
                    padding: '1.2rem 1.5rem',
                    background: 'linear-gradient(135deg, #7c3aed10, #3b82f610)',
                    border: '1px solid #7c3aed30',
                    borderRadius: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#7c3aed20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {estimating ? <Loader size={20} color="#7c3aed" className="animate-spin" /> : <Bot size={20} color="#7c3aed" />}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text)' }}>
                                {estimating ? 'AI Analyzing...' : 'AI Price Estimate'}
                            </div>
                            {!estimating && aiEstimate && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    {aiEstimate.confidence}% confidence
                                    {aiEstimate.benchmark && ` | ${aiEstimate.benchmark.tier.replace('_', ' ')} area`}
                                </div>
                            )}
                        </div>
                    </div>
                    {!estimating && aiEstimate && (
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.55rem', color: '#7c3aed', fontWeight: '700', textTransform: 'uppercase' }}>AI Estimated Price</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#7c3aed' }}>{formatINR(aiEstimate.estimatedPrice)}</div>
                            </div>
                            {aiEstimate.pricePerSqft > 0 && (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Per Sq.Ft</div>
                                    <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text)' }}>₹{aiEstimate.pricePerSqft.toLocaleString()}</div>
                                </div>
                            )}
                            {aiEstimate.verdict && (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Verdict</div>
                                    <span style={{
                                        background: aiEstimate.verdict.label === 'Overvalued' ? '#fef2f2' : aiEstimate.verdict.label === 'Undervalued' ? '#f0fdf4' : '#fffbeb',
                                        color: aiEstimate.verdict.label === 'Overvalued' ? '#ef4444' : aiEstimate.verdict.label === 'Undervalued' ? '#22c55e' : '#f59e0b',
                                        padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800'
                                    }}>
                                        {aiEstimate.verdict.label} ({aiEstimate.verdict.diffPct > 0 ? '+' : ''}{aiEstimate.verdict.diffPct}%)
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="glass-card" style={{ background: 'var(--surface)', padding: '2.5rem', border: '1px solid var(--border)' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Headline Title</label>
                        <input type="text" className="input-control" required value={propData.title} onChange={e => setPropData({...propData, title: e.target.value})} style={{ background: 'var(--surface-light)', color: 'var(--text)' }} />
                    </div>
                    <div className="input-group">
                        <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Price (₹)</label>
                        <input type="number" className="input-control" required value={propData.price} onChange={e => setPropData({...propData, price: e.target.value})} style={{ background: 'var(--surface-light)', color: 'var(--text)' }} />
                        {aiEstimate?.estimatedPrice > 0 && !estimating && (
                            <small style={{ color: '#7c3aed', fontSize: '0.7rem', fontWeight: '700', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Bot size={11} /> AI suggests: {formatINR(aiEstimate.estimatedPrice)}
                            </small>
                        )}
                    </div>
                    <div className="input-group" style={{ gridColumn: 'span 3' }}>
                        <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Description</label>
                        <textarea className="input-control" rows="4" required value={propData.description} onChange={e => setPropData({...propData, description: e.target.value})} style={{ background: 'var(--surface-light)', color: 'var(--text)' }}></textarea>
                    </div>
                    <div className="input-group">
                        <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Location / City <span style={{ fontSize: '0.65rem', color: '#7c3aed' }}>(for AI estimate)</span></label>
                        <input type="text" className="input-control" required value={propData.location} onChange={e => setPropData({...propData, location: e.target.value})} placeholder="e.g. Bandra West, Mumbai" style={{ background: 'var(--surface-light)', color: 'var(--text)' }} />
                    </div>
                    <div className="input-group">
                        <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Map Embed URL</label>
                        <input type="url" className="input-control" placeholder="https://www.google.com/maps/embed?..." value={propData.mapLocation} onChange={e => setPropData({...propData, mapLocation: e.target.value})} style={{ background: 'var(--surface-light)', color: 'var(--text)' }} />
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                            Paste Google Maps URL or Embed `src`. <b>Avoid shortened `maps.app.goo.gl` links.</b>
                        </small>
                        {propData.mapLocation && propData.mapLocation.includes('maps.app.goo.gl') && (
                            <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '10px', fontWeight: '700', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                Shortened links (maps.app.goo.gl) are blocked from being embedded by Google. Please open the link, then copy the FULL URL from your browser's address bar.
                            </div>
                        )}
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
                        <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Area (sqft) <span style={{ fontSize: '0.65rem', color: '#7c3aed' }}>(for AI estimate)</span></label>
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
                                        <input type="file" accept="image/*" multiple hidden onChange={e => handleFileUpload(e, 'image')} />
                                    </label>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <Upload size={16} /> Upload 3D Model (.glb)
                                        <input type="file" accept=".glb,.gltf" hidden onChange={e => handleFileUpload(e, 'model')} />
                                    </label>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <input
                                            type="text"
                                            className="input-control"
                                            placeholder="Or paste 3D Model URL"
                                            value={propData.threeDModelUrl || ''}
                                            onChange={e => setPropData({ ...propData, threeDModelUrl: e.target.value })}
                                            style={{ background: 'var(--surface-light)', color: 'var(--text)', width: '100%' }}
                                        />
                                    </div>
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
                                <div style={{ marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text)' }}>360° Virtual Tour</div>

                                <div style={{ marginBottom: '0.75rem' }}>
                                    <input
                                        type="url"
                                        className="input-control"
                                        placeholder="Matterport / Kuula URL (optional, overrides uploads)"
                                        value={propData.tour360Url || ''}
                                        onChange={e => setPropData({ ...propData, tour360Url: e.target.value })}
                                        style={{ background: 'var(--surface-light)', color: 'var(--text)', width: '100%' }}
                                    />
                                    <small style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                                        Paste a Matterport, Kuula, Momento360, or Theta360 share URL to embed the real walkthrough.
                                    </small>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <Upload size={16} /> Upload 360° Panoramas
                                        <input type="file" accept="image/*" multiple hidden onChange={e => handleFileUpload(e, 'panorama')} />
                                    </label>
                                    <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '6px' }}>
                                        Upload as many equirectangular (2:1) photospheres as you like. Each becomes a scene the buyer can walk between.
                                    </small>
                                </div>

                                {(propData.tour360Images || []).length > 0 && (
                                    <div style={{ display: 'grid', gap: '8px', marginBottom: '1rem' }}>
                                        {(propData.tour360Images || []).map((img, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--surface-light)' }}>
                                                <img src={getImageUrl(img)} alt="" style={{ width: '56px', height: '56px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                                                <input
                                                    type="text"
                                                    className="input-control"
                                                    value={propData.tour360RoomNames?.[i] || ''}
                                                    onChange={e => setPropData(prev => {
                                                        const names = [...(prev.tour360RoomNames || [])];
                                                        names[i] = e.target.value;
                                                        return { ...prev, tour360RoomNames: names };
                                                    })}
                                                    placeholder={`Scene ${i + 1} label (e.g. Living Room)`}
                                                    style={{ background: 'var(--surface)', color: 'var(--text)', flex: 1, fontSize: '0.8rem', padding: '0.5rem 0.7rem' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setPropData(prev => ({
                                                        ...prev,
                                                        tour360Images: (prev.tour360Images || []).filter((_, idx) => idx !== i),
                                                        tour360RoomNames: (prev.tour360RoomNames || []).filter((_, idx) => idx !== i),
                                                    }))}
                                                    style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--error)', color: 'white', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                                                    aria-label="Remove panorama"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

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
