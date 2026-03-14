import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
    Users, Building2, CheckCircle, TrendingUp, Plus, Edit, Trash2, 
    Upload, FileText, Check, X, MessageSquare, Phone, Mail, ChevronRight, 
    ChevronDown, Save, MapPin, DollarSign, List, Layout
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const AgencyDashboard = () => {
    const { user: authUser } = useAuth();
    const { tab } = useParams();
    const [stats, setStats] = useState({
        totalProperties: 0,
        available: 0,
        sold: 0,
        totalLeads: 0
    });
    const [leads, setLeads] = useState([]);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(tab || 'overview');
    
    // UI State
    const [showPropForm, setShowPropForm] = useState(false);
    const [editingProp, setEditingProp] = useState(null);
    const [showNoteModal, setShowNoteModal] = useState(null); // leadId
    const [noteContent, setNoteContent] = useState('');

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

    const stages = ['New Lead', 'Contacted', 'Site Visit', 'Negotiation', 'Booked', 'Sold', 'Lost'];
    const propStatuses = ['Available', 'Reserved', 'Under Contract', 'Sold'];

    useEffect(() => {
        if (tab) setActiveTab(tab);
    }, [tab]);

    useEffect(() => {
        if (authUser) fetchData();
    }, [authUser]);

    const fetchData = async () => {
        try {
            const [propRes, leadRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/properties/agency/${authUser._id}`),
                axios.get('http://localhost:5000/api/leads')
            ]);
            
            const myProps = propRes.data; 
            setProperties(myProps);
            setStats({
                totalProperties: myProps.length,
                available: myProps.filter(p => p.status === 'Available').length,
                sold: myProps.filter(p => p.status === 'Sold').length,
                totalLeads: leadRes.data.length
            });
            setLeads(leadRes.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data } = await axios.post('http://localhost:5000/api/upload', formData);
            if (type === 'image') {
                setPropData(prev => ({ ...prev, images: [...prev.images, data.url] }));
            } else {
                setPropData(prev => ({ ...prev, documents: [...prev.documents, data.url] }));
            }
        } catch (error) {
            alert('File upload failed');
        }
    };

    const handlePropSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...propData,
                amenities: propData.amenities.split(',').map(a => a.trim()).filter(a => a)
            };

            if (editingProp) {
                await axios.put(`http://localhost:5000/api/properties/${editingProp._id}`, payload);
            } else {
                await axios.post('http://localhost:5000/api/properties', payload);
            }
            
            setShowPropForm(false);
            setEditingProp(null);
            setPropData({
                title: '', description: '', location: '', propertyType: 'Apartment',
                price: '', size: '', bedrooms: '', bathrooms: '', amenities: '',
                status: 'Available', images: [], documents: []
            });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Action failed');
        }
    };

    const handleEditProp = (prop) => {
        setEditingProp(prop);
        setPropData({
            ...prop,
            amenities: prop.amenities.join(', ')
        });
        setShowPropForm(true);
    };

    const handleDeleteProp = async (id) => {
        if (!window.confirm('Delete this listing permanently?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/properties/${id}`);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const updateLeadStatus = async (leadId, newStatus) => {
        try {
            await axios.patch(`http://localhost:5000/api/leads/${leadId}/status`, { status: newStatus });
            setLeads(leads.map(l => l._id === leadId ? { ...l, status: newStatus } : l));
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddNote = async (id) => {
        if (!noteContent.trim()) return;
        try {
            const { data } = await axios.post(`http://localhost:5000/api/leads/${id}/notes`, { content: noteContent });
            setLeads(leads.map(l => l._id === id ? data : l));
            setNoteContent('');
            setShowNoteModal(null);
        } catch (error) {
            console.error(error);
        }
    };

    if (!authUser?.isApproved) return (
        <div style={{ padding: '4rem', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card" style={{ maxWidth: '500px', padding: '3rem' }}>
                <ShieldAlert size={60} color="#f59e0b" style={{ marginBottom: '1.5rem' }} />
                <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Approval Pending</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    Your agency account is currently awaiting administrative review. 
                    You will gain access to the dashboard command center once your credentials have been verified.
                </p>
                <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '700' }}>
                    Estimated verification time: 24-48 hours
                </div>
            </div>
        </div>
    );

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <TrendingUp className="animate-pulse" size={40} color="var(--primary)" />
        </div>
    );

    return (
        <div className="animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text)' }}>Agency <span className="text-gradient">Hub</span></h2>
                <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--surface-light)', border: '1px solid var(--border)', padding: '0.4rem', borderRadius: '12px' }}>
                    {[
                        { id: 'overview', label: 'Overview', icon: Layout },
                        { id: 'listings', label: 'Inventory', icon: Building2 },
                        { id: 'leads', label: 'CRM Pipeline', icon: Users }
                    ].map(t => (
                        <button 
                            key={t.id}
                            className={`btn ${activeTab === t.id ? 'btn-primary' : ''}`}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: activeTab === t.id ? 'var(--primary)' : 'transparent', color: activeTab === t.id ? 'white' : 'var(--text-muted)', transition: 'all 0.2s ease' }}
                            onClick={() => setActiveTab(t.id)}
                        >
                            <t.icon size={16} /> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                        {[
                            { label: 'Platform Listings', value: stats.totalProperties, color: 'var(--text)', icon: Building2 },
                            { label: 'Active Assets', value: stats.available, color: 'var(--success)', icon: CheckCircle },
                            { label: 'Closed Deals', value: stats.sold, color: 'var(--accent)', icon: TrendingUp },
                            { label: 'Total Enquiries', value: stats.totalLeads, color: 'var(--primary)', icon: Users }
                         ].map((s, i) => (
                            <div key={i} className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>{s.label}</div>
                                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: s.color }}>{s.value}</div>
                            </div>
                        ))}
                    </div>
                     <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📈</div>
                        <h3 style={{ fontSize: '1.5rem', color: 'var(--text)', fontWeight: '800' }}>Growth Analytics</h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '1rem auto', lineHeight: '1.6' }}>
                            Your agency is currently managing <b style={{ color: 'var(--text)' }}>{stats.totalProperties}</b> assets with an active conversion of 
                            <b style={{ color: 'var(--primary)' }}> {stats.totalLeads > 0 ? Math.round((stats.sold / stats.totalLeads) * 100) : 0}%</b> across the pipeline.
                        </p>
                    </div>
                </>
            )}

            {/* Listings Tab */}
            {activeTab === 'listings' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h4 style={{ fontSize: '1.4rem', color: 'var(--text)', fontWeight: '800' }}>Property Inventory</h4>
                        <button className="btn btn-primary" onClick={() => { setShowPropForm(!showPropForm); setEditingProp(null); }}>
                            <Plus size={18} /> {showPropForm ? 'Cancel' : 'Create Listing'}
                        </button>
                    </div>

                    {showPropForm && (
                        <div className="glass-card animate-fade" style={{ marginBottom: '3rem', border: '1px solid var(--primary)', background: 'var(--surface)', padding: '2rem' }}>
                            <h5 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text)', fontWeight: '800' }}>
                                <Edit size={20} color="var(--primary)" /> {editingProp ? 'Edit Listing Data' : 'New Property Details'}
                            </h5>
                            <form onSubmit={handlePropSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <label style={{ color: 'var(--text-muted)' }}>Headline Title</label>
                                    <input type="text" className="input-control" required value={propData.title} onChange={e => setPropData({...propData, title: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                                </div>
                                <div className="input-group">
                                    <label style={{ color: 'var(--text-muted)' }}>Price (₹)</label>
                                    <input type="number" className="input-control" required value={propData.price} onChange={e => setPropData({...propData, price: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                                </div>
                                <div className="input-group" style={{ gridColumn: 'span 3' }}>
                                    <label style={{ color: 'var(--text-muted)' }}>Description</label>
                                    <textarea className="input-control" rows="3" required value={propData.description} onChange={e => setPropData({...propData, description: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}></textarea>
                                </div>
                                <div className="input-group">
                                    <label style={{ color: 'var(--text-muted)' }}>Location / City</label>
                                    <input type="text" className="input-control" required value={propData.location} onChange={e => setPropData({...propData, location: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                                </div>
                                <div className="input-group">
                                    <label style={{ color: 'var(--text-muted)' }}>Property Category</label>
                                    <select className="input-control" value={propData.propertyType} onChange={e => setPropData({...propData, propertyType: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                                        <option>Apartment</option>
                                        <option>Villa</option>
                                        <option>Commercial</option>
                                        <option>Land</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label style={{ color: 'var(--text-muted)' }}>Status</label>
                                    <select className="input-control" value={propData.status} onChange={e => setPropData({...propData, status: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                                        {propStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label style={{ color: 'var(--text-muted)' }}>Area (sqft)</label>
                                    <input type="number" className="input-control" required value={propData.size} onChange={e => setPropData({...propData, size: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                                </div>
                                <div className="input-group">
                                    <label style={{ color: 'var(--text-muted)' }}>Beds</label>
                                    <input type="number" className="input-control" value={propData.bedrooms} onChange={e => setPropData({...propData, bedrooms: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                                </div>
                                <div className="input-group">
                                    <label style={{ color: 'var(--text-muted)' }}>Baths</label>
                                    <input type="number" className="input-control" value={propData.bathrooms} onChange={e => setPropData({...propData, bathrooms: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                                </div>
                                <div className="input-group" style={{ gridColumn: 'span 3' }}>
                                    <label style={{ color: 'var(--text-muted)' }}>Amenities (comma separated)</label>
                                    <input type="text" className="input-control" placeholder="Pool, Gym, Parking, WiFi" value={propData.amenities} onChange={e => setPropData({...propData, amenities: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                                </div>
                                <div className="input-group">
                                    <label><Upload size={14} /> Upload Image</label>
                                    <input type="file" onChange={e => handleFileUpload(e, 'image')} />
                                    <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                        {propData.images.map((img, i) => <img key={i} src={img} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />)}
                                    </div>
                                </div>
                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <label><FileText size={14} /> Property Documents</label>
                                    <input type="file" onChange={e => handleFileUpload(e, 'doc')} />
                                    <div style={{ fontSize: '0.75rem', marginTop: '5px' }}>{propData.documents.length} files attached</div>
                                </div>
                                <div style={{ gridColumn: 'span 3' }}>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                                        <Save size={18} /> {editingProp ? 'Finalize Updates' : 'Publish Listing'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {properties.map(p => (
                            <div key={p._id} className="glass-card animate-fade" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                                <div style={{ height: '180px', position: 'relative' }}>
                                    <img src={p.images[0] || 'https://via.placeholder.com/400x200?text=No+Image'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                                        {p.isApproved && <div style={{ background: '#10b981', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '800' }}>APPROVED</div>}
                                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800' }}>{p.status}</div>
                                    </div>
                                </div>
                                <div style={{ padding: '1.2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <h5 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text)' }}>{p.title}</h5>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--primary)' }}>₹${p.price.toLocaleString()}</div>
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                                        <MapPin size={12} /> {p.location}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-outline" style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', borderColor: 'var(--border)', color: 'var(--text)' }} onClick={() => handleEditProp(p)}>Edit</button>
                                        <button className="btn btn-outline" style={{ padding: '0.5rem', color: 'var(--error)', borderColor: 'var(--error)', opacity: 0.8 }} onClick={() => handleDeleteProp(p._id)}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Leads Tab (CRM Pipeline) */}
            {activeTab === 'leads' && (
                <div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h4 style={{ fontSize: '1.4rem', color: 'var(--text)', fontWeight: '800' }}>Sales CRM - Kanban Pipeline</h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Drag leads between phases to track progress</div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.2rem', overflowX: 'auto', paddingBottom: '2rem', minHeight: '600px', alignItems: 'flex-start' }}>
                        {stages.map(stage => {
                            const stageLeads = leads.filter(l => l.status === stage);
                            return (
                                <div key={stage} style={{ minWidth: '300px', flex: 1 }}>
                                    <div style={{ 
                                        padding: '1.2rem', 
                                        background: 'var(--surface-light)', 
                                        borderRadius: '16px 16px 0 0', 
                                        borderBottom: `3px solid ${stage === 'Sold' ? 'var(--accent)' : 'var(--primary)'}`,
                                        border: '1px solid var(--border)',
                                        borderBottomColor: stage === 'Sold' ? 'var(--accent)' : 'var(--primary)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--text)' }}>{stage.toUpperCase()}</span>
                                        <span style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stageLeads.length}</span>
                                    </div>
                                    
                                    <div style={{ 
                                        background: 'var(--surface)', 
                                        padding: '1rem', 
                                        borderRadius: '0 0 16px 16px', 
                                        minHeight: '520px', 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        gap: '1.2rem',
                                        border: '1px solid var(--border)',
                                        borderTop: 'none'
                                    }}>
                                        {stageLeads.map(lead => (
                                            <div key={lead._id} className="glass-card animate-fade" style={{ padding: '1.2rem', fontSize: '0.9rem', position: 'relative', background: 'var(--surface-light)', border: '1px solid var(--border)' }}>
                                                <div style={{ fontWeight: '800', marginBottom: '0.4rem', color: 'var(--text)' }}>{lead.name}</div>
                                                <div style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.75rem', marginBottom: '1rem' }}>
                                                    {lead.property?.title || 'General Property Enquiry'}
                                                </div>

                                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                                    <a href={`mailto:${lead.email}`} className="btn btn-outline" style={{ flex: 1, padding: '0.3rem', borderColor: 'var(--border)', color: 'var(--text-muted)' }}><Mail size={16} /></a>
                                                    {lead.phone && <a href={`tel:${lead.phone}`} className="btn btn-outline" style={{ flex: 1, padding: '0.3rem', borderColor: 'var(--border)', color: 'var(--text-muted)' }}><Phone size={16} /></a>}
                                                    <button className="btn btn-outline" style={{ flex: 1, padding: '0.3rem', borderColor: 'var(--border)', color: 'var(--text-muted)' }} onClick={() => setShowNoteModal(lead._id)}><MessageSquare size={16} /></button>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <select 
                                                        value={lead.status} 
                                                        onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                                                        style={{ background: 'transparent', color: 'var(--primary)', border: 'none', fontSize: '0.7rem', fontWeight: '900', cursor: 'pointer' }}
                                                    >
                                                        {stages.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{lead.notes?.length || 0} notes</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Notes Modal Overlay */}
            {showNoteModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, color: 'var(--text)', fontWeight: '800' }}>Lead Activity Notes</h3>
                            <button className="btn btn-outline" onClick={() => setShowNoteModal(null)} style={{ padding: '0.3rem', border: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>
                        </div>

                        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {leads.find(l => l._id === showNoteModal)?.notes?.map((n, i) => (
                                <div key={i} className="glass-card" style={{ padding: '1rem', fontSize: '0.85rem', background: 'var(--surface-light)', border: '1px solid var(--border)' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.5rem', fontWeight: '700' }}>{new Date(n.date).toLocaleString()}</div>
                                    <div style={{ color: 'var(--text)' }}>{n.content}</div>
                                </div>
                            ))}
                            {(!leads.find(l => l._id === showNoteModal)?.notes?.length) && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No logs for this lead yet.</p>}
                        </div>

                        <div className="input-group">
                            <textarea className="input-control" placeholder="Type a new activity note..." value={noteContent} onChange={e => setNoteContent(e.target.value)} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}></textarea>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => handleAddNote(showNoteModal)}>
                            Append Note
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgencyDashboard;
