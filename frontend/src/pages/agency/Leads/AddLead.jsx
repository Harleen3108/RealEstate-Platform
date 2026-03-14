import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Save, X, User, Mail, Phone, MessageSquare, Building2, TrendingUp } from 'lucide-react';
import API_BASE_URL from '../../../apiConfig';
import { useAuth } from '../../../context/AuthContext';

const AddLead = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [properties, setProperties] = useState([]);
    const [leadData, setLeadData] = useState({
        name: '',
        email: '',
        phone: '',
        propertyId: '',
        message: 'Manually added lead',
        status: 'New Lead'
    });

    const stages = ['New Lead', 'Contacted', 'Site Visit', 'Negotiation', 'Booked', 'Sold', 'Lost'];

    useEffect(() => {
        if (user) fetchProperties();
    }, [user]);

    const fetchProperties = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/properties/agency/${user._id}`);
            setProperties(data);
        } catch (error) {
            console.error('Error fetching properties:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post(`${API_BASE_URL}/leads`, {
                ...leadData,
                agencyId: user._id
            });
            navigate('/dashboard/agency/leads');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add lead');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="animate-fade" style={{ maxWidth: '700px', margin: '0 auto', paddingBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Add New Lead</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manually record a new prospect for your CRM.</p>
                </div>
                <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                    <X size={18} /> Cancel
                </button>
            </div>

            <div className="glass-card" style={{ background: 'var(--surface)', padding: '2.5rem', border: '1px solid var(--border)', borderRadius: '16px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block', color: 'var(--text)' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="text" className="input-control" required value={leadData.name} onChange={e => setLeadData({...leadData, name: e.target.value})} style={{ paddingLeft: '2.5rem', background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} placeholder="e.g. Rahul Sharma" />
                            </div>
                        </div>
                        <div className="input-group">
                            <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block', color: 'var(--text)' }}>Phone Number</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="text" className="input-control" required value={leadData.phone} onChange={e => setLeadData({...leadData, phone: e.target.value})} style={{ paddingLeft: '2.5rem', background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} placeholder="+91 98765 43210" />
                            </div>
                        </div>
                    </div>

                    <div className="input-group">
                        <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block', color: 'var(--text)' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="email" className="input-control" required value={leadData.email} onChange={e => setLeadData({...leadData, email: e.target.value})} style={{ paddingLeft: '2.5rem', background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} placeholder="name@example.com" />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block', color: 'var(--text)' }}>Interested Property</label>
                            <div style={{ position: 'relative' }}>
                                <Building2 size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <select 
                                    className="input-control" 
                                    value={leadData.propertyId} 
                                    onChange={e => setLeadData({...leadData, propertyId: e.target.value})}
                                    style={{ paddingLeft: '2.5rem', background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}
                                >
                                    <option value="">Select a Property (Optional)</option>
                                    {properties.map(p => (
                                        <option key={p._id} value={p._id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="input-group">
                            <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block', color: 'var(--text)' }}>Lead Status</label>
                            <div style={{ position: 'relative' }}>
                                <TrendingUp size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <select 
                                    className="input-control" 
                                    value={leadData.status} 
                                    onChange={e => setLeadData({...leadData, status: e.target.value})}
                                    style={{ paddingLeft: '2.5rem', background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}
                                >
                                    {stages.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="input-group">
                        <label style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'block', color: 'var(--text)' }}>Requirement / Message</label>
                        <div style={{ position: 'relative' }}>
                            <MessageSquare size={18} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} />
                            <textarea 
                                className="input-control" 
                                rows="4" 
                                value={leadData.message} 
                                onChange={e => setLeadData({...leadData, message: e.target.value})} 
                                style={{ paddingLeft: '2.5rem', background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}
                                placeholder="Describe the lead's requirements or source..."
                            ></textarea>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', padding: '1.2rem', marginTop: '1rem', fontSize: '1rem', fontWeight: '800', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)' }}>
                        {submitting ? 'Adding Lead...' : 'Sync Lead to CRM'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddLead;
