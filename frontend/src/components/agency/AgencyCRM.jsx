import React from 'react';
import { Mail, Phone, MessageSquare, X } from 'lucide-react';

const AgencyCRM = ({ 
    leads, 
    stages, 
    updateLeadStatus, 
    showNoteModal, 
    setShowNoteModal, 
    noteContent, 
    setNoteContent, 
    handleAddNote 
}) => {
    return (
        <div className="animate-fade">
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
                                border: '1px solid var(--border)',
                                borderBottom: `3px solid ${stage === 'Sold' ? 'var(--accent)' : 'var(--primary)'}`,
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

export default AgencyCRM;
