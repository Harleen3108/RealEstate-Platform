import React, { useState, useEffect } from 'react';
import { Plus, Save, Edit, Trash2 } from 'lucide-react';

const InvestorPortfolio = ({ 
    investments, 
    showForm, 
    setShowForm, 
    formData, 
    setFormData, 
    handleSubmit, 
    handleEdit, 
    handleDelete, 
    editingRecord, 
    setEditingRecord,
    propertyTypes 
}) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1.4rem' }}>Holdings Ledger</h4>
                <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingRecord(null); }}>
                    <Plus size={18} /> {showForm ? 'Cancel' : 'Record Investment'}
                </button>
            </div>

            {showForm && (
                <div className="glass-card animate-fade" style={{ marginBottom: '3rem', border: '1px solid var(--primary)', background: 'var(--surface)', padding: '2rem' }}>
                    <h5 style={{ marginBottom: '1.5rem', color: 'var(--text)', fontWeight: '800', fontSize: '1.2rem' }}>{editingRecord ? 'Update Asset Valuation' : 'New Portfolio Entry'}</h5>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: windowWidth > 768 ? 'repeat(3, 1fr)' : windowWidth > 480 ? 'repeat(2, 1fr)' : '1fr', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-muted)' }}>Property Name</label>
                            <input type="text" className="input-control" required value={formData.propertyName} onChange={e => setFormData({...formData, propertyName: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-muted)' }}>Location / Address</label>
                            <input type="text" className="input-control" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-muted)' }}>Property Category</label>
                            <select className="input-control" value={formData.propertyType} onChange={e => setFormData({...formData, propertyType: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                                {propertyTypes.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-muted)' }}>Investment Date</label>
                            <input type="date" className="input-control" required value={formData.investmentDate} onChange={e => setFormData({...formData, investmentDate: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-muted)' }}>Acquisition Cost (₹)</label>
                            <input type="number" className="input-control" required value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-muted)' }}>Current Valuation (₹)</label>
                            <input type="number" className="input-control" required value={formData.currentValue} onChange={e => setFormData({...formData, currentValue: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-muted)' }}>Ownership Split (%)</label>
                            <input type="number" className="input-control" required value={formData.ownershipPercentage} onChange={e => setFormData({...formData, ownershipPercentage: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        </div>
                        <div className="input-group" style={{ gridColumn: 'span 2' }}>
                            <label style={{ color: 'var(--text-muted)' }}>Internal Strategy Notes</label>
                            <textarea className="input-control" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Exit strategy, rental yield targets, etc." style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}></textarea>
                        </div>
                        <div style={{ gridColumn: 'span 3' }}>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                                <Save size={18} /> {editingRecord ? 'Override Registry' : 'Commit to Portfolio'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

             <div className="glass-card" style={{ overflowX: 'auto', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--surface-light)' }}>
                            <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800' }}>PROPERTY NAME</th>
                            <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800' }}>LOCATION</th>
                            <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800' }}>PURCHASE PRICE</th>
                            <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800' }}>CURRENT VALUE</th>
                            <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800' }}>OWNERSHIP %</th>
                            <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800' }}>INV. DATE</th>
                            <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {investments.map(inv => (
                             <tr key={inv._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s ease' }} className="hover-light">
                                <td style={{ padding: '1.5rem 1.2rem' }}>
                                    <div style={{ fontWeight: '800', color: 'var(--text)' }}>{inv.propertyName}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700' }}>{inv.propertyType}</div>
                                </td>
                                <td style={{ padding: '1.5rem 1.2rem' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: '600' }}>{inv.location || 'N/A'}</div>
                                </td>
                                <td style={{ padding: '1.5rem 1.2rem' }}>
                                    <div style={{ fontWeight: '800', color: 'var(--text)' }}>₹{inv.purchasePrice.toLocaleString()}</div>
                                </td>
                                <td style={{ padding: '1.5rem 1.2rem' }}>
                                    <div style={{ fontWeight: '900', color: 'var(--success)' }}>₹{inv.currentValue.toLocaleString()}</div>
                                </td>
                                <td style={{ padding: '1.5rem 1.2rem' }}>
                                    <span style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                                        {inv.ownershipPercentage}%
                                    </span>
                                </td>
                                <td style={{ padding: '1.5rem 1.2rem' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                        {new Date(inv.investmentDate).toLocaleDateString()}
                                    </div>
                                </td>
                                 <td style={{ padding: '1.5rem 1.2rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-outline" style={{ padding: '0.3rem', border: 'none', color: 'var(--text-muted)' }} onClick={() => handleEdit(inv)}><Edit size={16} /></button>
                                        <button className="btn btn-outline" style={{ padding: '0.3rem', border: 'none', color: 'var(--error)' }} onClick={() => handleDelete(inv._id)}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {investments.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No investments recorded yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvestorPortfolio;
