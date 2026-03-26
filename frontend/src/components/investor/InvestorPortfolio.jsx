import React, { useState, useEffect } from 'react';
import { Plus, Save, Edit, Trash2, Eye, Bot, TrendingUp, TrendingDown, Minus, Loader } from 'lucide-react';

const formatINR = (num) => {
    if (!num) return '---';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
    return `₹${num.toLocaleString('en-IN')}`;
};

const InvestorPortfolio = ({
    investments,
    showForm,
    setShowForm,
    formData,
    setFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    onViewDetails,
    editingRecord,
    setEditingRecord,
    propertyTypes,
    aiEstimates = {},
    estimatesLoading = false
}) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getDealBadge = (inv) => {
        const ai = aiEstimates[inv._id];
        if (!ai || ai.error || !ai.estimatedPrice) return null;

        const diff = ((inv.currentValue - ai.estimatedPrice) / ai.estimatedPrice * 100);
        if (diff > 15) return { label: 'Overvalued', color: '#ef4444', bg: '#fef2f2', icon: TrendingUp };
        if (diff < -10) return { label: 'Undervalued', color: '#22c55e', bg: '#f0fdf4', icon: TrendingDown };
        return { label: 'Fair Price', color: '#f59e0b', bg: '#fffbeb', icon: Minus };
    };

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
                            <label style={{ color: 'var(--text-muted)' }}>Location <span style={{ fontSize: '0.65rem', color: 'var(--primary)' }}>(Locality, City)</span></label>
                            <input type="text" className="input-control" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Andheri West, Mumbai" style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-muted)' }}>Property Category</label>
                            <select className="input-control" value={formData.propertyType} onChange={e => setFormData({...formData, propertyType: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                                {propertyTypes.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-muted)' }}>Area (sq.ft) <span style={{ fontSize: '0.65rem', color: 'var(--primary)' }}>for AI estimate</span></label>
                            <input type="number" className="input-control" value={formData.areaSqft} onChange={e => setFormData({...formData, areaSqft: e.target.value})} placeholder="e.g. 1200" style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-muted)' }}>Bedrooms</label>
                            <input type="number" className="input-control" value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: e.target.value})} placeholder="e.g. 3" style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
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
                        <div className="input-group" style={{ gridColumn: windowWidth > 768 ? 'span 3' : windowWidth > 480 ? 'span 2' : 'span 1' }}>
                            <label style={{ color: 'var(--text-muted)' }}>Internal Strategy Notes</label>
                            <textarea className="input-control" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Exit strategy, rental yield targets, etc." style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}></textarea>
                        </div>
                        <div style={{ gridColumn: windowWidth > 768 ? 'span 3' : windowWidth > 480 ? 'span 2' : 'span 1' }}>
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
                            <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Bot size={13} /> AI ESTIMATE
                                </div>
                            </th>
                            <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800' }}>VERDICT</th>
                            <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {investments.map(inv => {
                            const ai = aiEstimates[inv._id];
                            const badge = getDealBadge(inv);
                            const diffPct = ai && ai.estimatedPrice ? ((inv.currentValue - ai.estimatedPrice) / ai.estimatedPrice * 100).toFixed(1) : null;

                            return (
                                <tr key={inv._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s ease' }} className="hover-light">
                                    <td style={{ padding: '1.5rem 1.2rem' }}>
                                        <div style={{ fontWeight: '800', color: 'var(--text)' }}>{inv.propertyName}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700' }}>
                                            {inv.propertyType}
                                            {inv.areaSqft ? ` | ${inv.areaSqft} sqft` : ''}
                                            {inv.bedrooms ? ` | ${inv.bedrooms} BHK` : ''}
                                        </div>
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
                                        {estimatesLoading ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                <Loader size={14} className="animate-spin" /> Analyzing...
                                            </div>
                                        ) : ai && !ai.error ? (
                                            <div>
                                                <div style={{ fontWeight: '800', color: '#7c3aed', fontSize: '0.95rem' }}>
                                                    {ai.estimatedPrice ? formatINR(ai.estimatedPrice) : `₹${ai.pricePerSqft?.toLocaleString('en-IN')}/sqft`}
                                                </div>
                                                {ai.confidence && (
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                        {ai.confidence}% confidence
                                                        {ai.benchmarkOnly && ' (benchmark)'}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {ai?.error || 'No data'}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.5rem 1.2rem' }}>
                                        {badge ? (
                                            <div>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    background: badge.bg, color: badge.color,
                                                    padding: '4px 10px', borderRadius: '6px',
                                                    fontSize: '0.7rem', fontWeight: '800'
                                                }}>
                                                    <badge.icon size={12} /> {badge.label}
                                                </span>
                                                {diffPct && (
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                                                        {diffPct > 0 ? '+' : ''}{diffPct}% vs AI
                                                    </div>
                                                )}
                                            </div>
                                        ) : estimatesLoading ? (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>...</span>
                                        ) : (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                                        )}
                                    </td>
                                     <td style={{ padding: '1.5rem 1.2rem' }}>
                                         <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn btn-outline" style={{ padding: '0.3rem', border: 'none', color: 'var(--primary)' }} onClick={() => onViewDetails(inv)} title="View Financials"><Eye size={16} /></button>
                                            <button className="btn btn-outline" style={{ padding: '0.3rem', border: 'none', color: 'var(--text-muted)' }} onClick={() => handleEdit(inv)}><Edit size={16} /></button>
                                            <button className="btn btn-outline" style={{ padding: '0.3rem', border: 'none', color: 'var(--error)' }} onClick={() => handleDelete(inv._id)}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
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
