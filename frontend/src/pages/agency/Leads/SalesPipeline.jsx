import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Users, Mail, Phone, MessageSquare, X, 
    Save, MoreVertical, Plus, TrendingUp
} from 'lucide-react';
import API_BASE_URL from '../../../apiConfig';
import { useAuth } from '../../../context/AuthContext';

const SalesPipeline = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNoteModal, setShowNoteModal] = useState(null); // leadId
    const [viewLead, setViewLead] = useState(null); // Full lead object
    const [noteContent, setNoteContent] = useState('');
    const [notification, setNotification] = useState(null);

    const stages = ['New Lead', 'Contacted', 'Site Visit', 'Negotiation', 'Booked', 'Sold', 'Lost'];

    useEffect(() => {
        if (user) fetchLeads();
    }, [user]);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_BASE_URL}/leads`);
            setLeads(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching leads:', error);
            setLoading(false);
        }
    };

    const updateLeadStatus = async (leadId, newStatus) => {
        try {
            await axios.patch(`${API_BASE_URL}/leads/${leadId}/status`, { status: newStatus });
            setLeads(leads.map(l => l._id === leadId ? { ...l, status: newStatus } : l));
            if (viewLead?._id === leadId) setViewLead(prev => ({ ...prev, status: newStatus }));
            
            setNotification({ message: `Status updated to ${newStatus}`, type: 'success' });
            setTimeout(() => setNotification(null), 3000);
            
            // If the modal is open, we might want to close it or keep it open for more updates.
            // User requested that clicking update timeline and adding notes DOES close it.
            // For status change in the main card, it's already updated.
            // If it's in the profile modal, let's keep it open unless they add a note.
        } catch (error) {
            console.error(error);
            setNotification({ message: 'Failed to update status', type: 'error' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const handleAddNote = async (id) => {
        if (!noteContent.trim()) return;
        try {
            const { data } = await axios.post(`${API_BASE_URL}/leads/${id}/notes`, { content: noteContent });
            setLeads(leads.map(l => l._id === id ? data : l));
            if (viewLead?._id === id) setViewLead(data);
            setNoteContent('');
            setShowNoteModal(null);
            setViewLead(null); // Close the detail modal too as requested
            
            setNotification({ message: 'Note added & Timeline updated', type: 'success' });
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            console.error(error);
            setNotification({ message: 'Failed to add note', type: 'error' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <TrendingUp className="animate-pulse" size={40} color="var(--primary)" />
        </div>
    );

    return (
        <div className="animate-fade">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Sales CRM - Kanban Pipeline</h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Track your leads progress across stages</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/dashboard/agency/leads/add')}>
                    <Plus size={18} /> Create Lead
                </button>
             </div>

            {/* Notification Toast */}
            {notification && (
                <div style={{ 
                    position: 'fixed', 
                    top: '20px', 
                    right: '20px', 
                    background: notification.type === 'success' ? '#10b981' : '#ef4444', 
                    color: 'white', 
                    padding: '1rem 2rem', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
                    zIndex: 2000, 
                    fontWeight: '700',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {notification.type === 'success' ? <Plus size={18} /> : <X size={18} />}
                        {notification.message}
                    </div>
                </div>
            )}

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '1rem', 
                paddingBottom: '2rem'
            }}>
                {stages.map(stage => {
                    const stageLeads = leads.filter(l => (l.status || 'New Lead') === stage);
                    return (
                        <div key={stage} style={{ width: '100%', minHeight: '400px' }}>
                            <div style={{ 
                                padding: '0.8rem 1rem', 
                                background: 'var(--surface)', 
                                borderRadius: '12px 12px 0 0', 
                                border: '1px solid var(--border)',
                                borderBottom: `2px solid ${stage === 'Sold' ? '#10b981' : '#f97316'}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ fontWeight: '800', fontSize: '0.75rem', color: 'var(--text)' }}>{stage.toUpperCase()}</span>
                                <span style={{ background: 'var(--surface-light)', color: 'var(--text-muted)', padding: '1px 6px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '700' }}>{stageLeads.length}</span>
                            </div>
                            
                            <div style={{ 
                                background: 'var(--surface-light)', 
                                padding: '0.8rem', 
                                borderRadius: '0 0 12px 12px', 
                                height: '350px', 
                                overflowY: 'auto',
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '0.8rem',
                                border: '1px solid var(--border)',
                                borderTop: 'none'
                            }}>
                                {stageLeads.map(lead => (
                                    <div 
                                        key={lead._id} 
                                        className="glass-card" 
                                        onClick={() => setViewLead(lead)}
                                        style={{ 
                                            padding: '0.8rem', 
                                            fontSize: '0.8rem', 
                                            position: 'relative', 
                                            background: 'var(--surface)', 
                                            border: '1px solid var(--border)',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                            <div style={{ fontWeight: '800', color: 'var(--text)', fontSize: '0.85rem' }}>{lead.name}</div>
                                            <button 
                                                style={{ border: 'none', background: 'none', color: 'var(--text-muted)' }}
                                                onClick={(e) => { e.stopPropagation(); setShowNoteModal(lead._id); }}
                                            >
                                                <MoreVertical size={12} />
                                            </button>
                                        </div>
                                        <div style={{ color: '#f97316', fontWeight: '700', fontSize: '0.65rem', marginBottom: '0.6rem' }}>
                                            {lead.property?.title || 'General Property Enquiry'}
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem' }}>
                                            <a href={`mailto:${lead.email}`} onClick={e => e.stopPropagation()} className="btn btn-outline" style={{ flex: 1, padding: '0.2rem' }}><Mail size={14} /></a>
                                            {lead.phone && <a href={`tel:${lead.phone}`} onClick={e => e.stopPropagation()} className="btn btn-outline" style={{ flex: 1, padding: '0.2rem' }}><Phone size={14} /></a>}
                                            <button className="btn btn-outline" style={{ flex: 1, padding: '0.2rem' }} onClick={(e) => { e.stopPropagation(); setShowNoteModal(lead._id); }}><MessageSquare size={14} /></button>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <select 
                                                value={lead.status || 'New Lead'} 
                                                onClick={e => e.stopPropagation()}
                                                onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                                                style={{ background: 'transparent', color: '#f97316', border: 'none', fontSize: '0.65rem', fontWeight: '900', cursor: 'pointer' }}
                                            >
                                                {stages.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                                {lead.notes?.length || 0} notes
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {stageLeads.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8', fontSize: '0.7rem', fontStyle: 'italic' }}>
                                        No leads in this stage
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

             {/* Lead Details Modal */}
            {viewLead && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.1)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                    <div className="glass-card animate-fade" style={{ width: '100%', maxWidth: '800px', padding: '0', background: 'var(--surface)', borderRadius: '16px', overflow: 'hidden', display: 'flex', height: '80vh' }}>
                        {/* Side Info */}
                        <div style={{ width: '280px', background: 'var(--surface-light)', borderRight: '1px solid var(--border)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '800', margin: '0 auto 1rem' }}>
                                    {viewLead.name.charAt(0)}
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.2rem' }}>{viewLead.name}</h3>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>{viewLead.status || 'New Lead'}</div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Mail size={16} color="var(--text-muted)" />
                                    <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{viewLead.email}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Phone size={16} color="var(--text-muted)" />
                                    <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{viewLead.phone || 'N/A'}</span>
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>UPDATE STATUS</label>
                                <select 
                                    value={viewLead.status || 'New Lead'} 
                                    onChange={(e) => updateLeadStatus(viewLead._id, e.target.value)}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem', fontWeight: '600' }}
                                >
                                    {stages.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Activity logs & Notes</h4>
                                <button className="btn btn-outline" onClick={() => setViewLead(null)} style={{ padding: '0.4rem', border: 'none' }}><X size={20} /></button>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
                                <div style={{ padding: '1rem', background: 'rgba(249, 115, 22, 0.05)', border: '1px solid rgba(249, 115, 22, 0.2)', borderRadius: '10px' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.5rem' }}>ORIGINAL ENQUIRY</div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{viewLead.message || 'No initial message provided'}</p>
                                </div>

                                {viewLead.notes?.map((n, i) => (
                                    <div key={i} style={{ padding: '1rem', fontSize: '0.85rem', background: 'var(--surface-light)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '700' }}>{new Date(n.date).toLocaleString()}</span>
                                            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--primary)' }}>INTERNAL NOTE</span>
                                        </div>
                                        <div>{n.content}</div>
                                    </div>
                                ))}
                                {(!viewLead.notes?.length) && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '2rem 0' }}>No internal notes recorded yet.</p>}
                            </div>

                            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <textarea 
                                    className="input-control" 
                                    placeholder="Type a new activity note..." 
                                    value={noteContent} 
                                    onChange={e => setNoteContent(e.target.value)}
                                    style={{ background: 'var(--surface-light)', marginBottom: '0.8rem', minHeight: '80px', color: 'var(--text)' }}
                                ></textarea>
                                <button className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }} onClick={() => handleAddNote(viewLead._id)}>
                                    Add Note & Update Timeline
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

             {/* Quick Note Modal */}
            {showNoteModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.05)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '2rem', background: 'var(--surface)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.1rem' }}>Quick Activity Note</h3>
                            <button className="btn btn-outline" onClick={() => setShowNoteModal(null)} style={{ padding: '0.3rem', border: 'none' }}><X size={20} /></button>
                        </div>

                        <textarea 
                            className="input-control" 
                            placeholder="Briefly describe the interaction..." 
                            value={noteContent} 
                            onChange={e => setNoteContent(e.target.value)}
                            style={{ background: 'var(--surface-light)', marginBottom: '1rem', minHeight: '100px', color: 'var(--text)' }}
                        ></textarea>
                        
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleAddNote(showNoteModal)}>
                            Save Note
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesPipeline;
