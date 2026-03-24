import React, { useState } from 'react';
import axios from 'axios';
import { Calculator, MapPin, Home, Ruler, BedDouble } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';
import PropertyEstimationCard from './PropertyEstimationCard';

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Commercial', 'Land'];
const CITIES = ['Delhi NCR', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Gurgaon', 'Noida', 'Ahmedabad', 'Kolkata'];

const PriceEstimationForm = ({ compact = false }) => {
    const [form, setForm] = useState({ city: '', locality: '', propertyType: 'Apartment', size: '', bedrooms: 2, bathrooms: 2, floorNumber: '', ageYears: '', furnishing: 'semi_furnished' });
    const [estimation, setEstimation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.city || !form.locality || !form.size) {
            setError('City, locality, and area are required');
            return;
        }
        setLoading(true);
        setError('');
        setEstimation(null);

        try {
            const { data } = await axios.post(`${API_BASE_URL}/estimation/estimate`, {
                city: form.city,
                locality: form.locality,
                propertyType: form.propertyType,
                areaSqft: Number(form.size),
                bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
                bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
                floorNumber: form.floorNumber ? Number(form.floorNumber) : undefined,
                ageYears: form.ageYears ? Number(form.ageYears) : undefined,
                furnishing: form.furnishing
            });
            setEstimation(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Estimation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '10px 12px', background: 'var(--input-bg)',
        border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)',
        fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box'
    };

    const labelStyle = { fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}><MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />City</label>
                        <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} style={inputStyle}>
                            <option value="">Select City</option>
                            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Locality</label>
                        <input type="text" placeholder="e.g. Whitefield, Andheri" value={form.locality} onChange={e => setForm({ ...form, locality: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}><Home size={12} style={{ display: 'inline', marginRight: '4px' }} />Type</label>
                        <select value={form.propertyType} onChange={e => setForm({ ...form, propertyType: e.target.value })} style={inputStyle}>
                            {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}><Ruler size={12} style={{ display: 'inline', marginRight: '4px' }} />Area (sq.ft)</label>
                        <input type="number" placeholder="e.g. 1200" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}><BedDouble size={12} style={{ display: 'inline', marginRight: '4px' }} />BHK</label>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {[1, 2, 3, 4, 5].map(n => (
                                <button key={n} type="button" onClick={() => setForm({ ...form, bedrooms: n })} style={{
                                    flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border)',
                                    background: form.bedrooms === n ? 'var(--primary)' : 'var(--input-bg)',
                                    color: form.bedrooms === n ? 'white' : 'var(--text)', cursor: 'pointer',
                                    fontSize: '0.8rem', fontWeight: '600'
                                }}>
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                    {!compact && (
                        <>
                            <div>
                                <label style={labelStyle}>Floor</label>
                                <input type="number" placeholder="Floor number" value={form.floorNumber} onChange={e => setForm({ ...form, floorNumber: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Age (years)</label>
                                <input type="number" placeholder="Property age" value={form.ageYears} onChange={e => setForm({ ...form, ageYears: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Furnishing</label>
                                <select value={form.furnishing} onChange={e => setForm({ ...form, furnishing: e.target.value })} style={inputStyle}>
                                    <option value="furnished">Furnished</option>
                                    <option value="semi_furnished">Semi-Furnished</option>
                                    <option value="unfurnished">Unfurnished</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>

                {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.8rem' }}>{error}</p>}

                <button type="submit" disabled={loading} style={{
                    marginTop: '1.2rem', width: '100%', padding: '12px',
                    background: loading ? 'var(--surface-light)' : 'linear-gradient(90deg, #7c3aed, #3b82f6)',
                    border: 'none', borderRadius: '10px', color: 'white', fontSize: '0.9rem',
                    fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.3s ease'
                }}>
                    <Calculator size={18} />
                    {loading ? 'Estimating...' : 'Get AI Estimate'}
                </button>
            </form>

            {(estimation || loading) && (
                <div style={{ marginTop: '1.5rem' }}>
                    <PropertyEstimationCard estimation={estimation} loading={loading} />
                </div>
            )}
        </div>
    );
};

export default PriceEstimationForm;
