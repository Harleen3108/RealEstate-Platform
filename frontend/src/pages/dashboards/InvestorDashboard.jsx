import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
    TrendingUp, Building2, Wallet, PieChart, Plus, Edit, Trash2, 
    Upload, FileText, CheckCircle, Clock, ArrowUpRight, ArrowDownRight,
    X, Save, File, Landmark, Calculator
} from 'lucide-react';

const InvestorDashboard = () => {
    const { tab } = useParams();
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(tab || 'portfolio');
    
    // UI State
    const [showForm, setShowForm] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [formData, setFormData] = useState({
        propertyName: '',
        purchasePrice: '',
        currentValue: '',
        investmentDate: '',
        ownershipPercentage: 100,
        notes: ''
    });

    useEffect(() => {
        if (tab) setActiveTab(tab);
    }, [tab]);

    useEffect(() => {
        fetchInvestments();
    }, []);

    const fetchInvestments = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/investments');
            setInvestments(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const calculateStats = () => {
        const totalInvested = investments.reduce((sum, inv) => sum + (inv.purchasePrice * (inv.ownershipPercentage / 100)), 0);
        const currentValuation = investments.reduce((sum, inv) => sum + (inv.currentValue * (inv.ownershipPercentage / 100)), 0);
        const profit = currentValuation - totalInvested;
        const roi = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
        
        return { totalInvested, currentValuation, profit, roi, count: investments.length };
    };

    const stats = calculateStats();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRecord) {
                await axios.put(`http://localhost:5000/api/investments/${editingRecord._id}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/investments', formData);
            }
            setShowForm(false);
            setEditingRecord(null);
            setFormData({ propertyName: '', purchasePrice: '', currentValue: '', investmentDate: '', ownershipPercentage: 100, notes: '' });
            fetchInvestments();
        } catch (error) {
            alert('Action failed');
        }
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        setFormData({
            ...record,
            investmentDate: record.investmentDate.split('T')[0]
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this investment from your portfolio?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/investments/${id}`);
            fetchInvestments();
        } catch (error) {
            console.error(error);
        }
    };

    const handleFileUpload = async (e, recordId) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const { data } = await axios.post('http://localhost:5000/api/upload', formData);
            const record = investments.find(inv => inv._id === recordId);
            const updatedDocs = [...(record.documents || []), data.url];
            await axios.put(`http://localhost:5000/api/investments/${recordId}`, { documents: updatedDocs });
            fetchInvestments();
        } catch (error) {
            alert('Upload failed');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <Calculator className="animate-pulse" size={40} color="var(--primary)" />
        </div>
    );

    return (
        <div className="animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.4rem' }}>Wealth <span className="text-gradient">Portfolio</span></h2>
                    <p style={{ color: 'var(--text-muted)' }}>Private asset tracking and performance analysis</p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--surface-light)', border: '1px solid var(--border)', padding: '0.4rem', borderRadius: '12px' }}>
                    {[
                        { id: 'portfolio', label: 'Analytics', icon: PieChart },
                        { id: 'assets', label: 'My Assets', icon: Landmark },
                        { id: 'docs', label: 'Vault', icon: FileText }
                    ].map(t => (
                        <button 
                            key={t.id}
                            className={`btn ${activeTab === t.id ? 'btn-primary' : ''}`}
                            style={{ 
                                padding: '0.6rem 1.2rem', 
                                fontSize: '0.85rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                background: activeTab === t.id ? 'var(--primary)' : 'transparent',
                                color: activeTab === t.id ? 'white' : 'var(--text-muted)',
                                border: 'none',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => setActiveTab(t.id)}
                        >
                            <t.icon size={16} /> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Portfolio Overview */}
            {activeTab === 'portfolio' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                        {[
                            { label: 'Net Equity', value: `₹${stats.currentValuation.toLocaleString()}`, icon: Wallet, color: 'var(--success)', sub: 'Current market value' },
                            { label: 'Capital Invested', value: `₹${stats.totalInvested.toLocaleString()}`, icon: Landmark, color: 'var(--text)', sub: 'Cost of acquisition' },
                            { label: 'Unrealized Gain', value: `₹${stats.profit.toLocaleString()}`, icon: TrendingUp, color: 'var(--accent)', sub: `${stats.roi.toFixed(2)}% Lifetime ROI` },
                            { label: 'Property Count', value: stats.count, icon: Building2, color: 'var(--primary)', sub: 'Diversified assets' }
                        ].map((s, i) => (
                            <div key={i} className="glass-card" style={{ padding: '2rem', position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '800', marginBottom: '0.8rem' }}>{s.label}</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: s.color, marginBottom: '0.3rem' }}>{s.value}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{s.sub}</div>
                                <div style={{ position: 'absolute', top: '15px', right: '15px', opacity: 0.1, color: 'var(--text)' }}>
                                    <s.icon size={40} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                        <div className="glass-card" style={{ padding: '2rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                            <h4 style={{ marginBottom: '2rem', fontSize: '1.2rem', color: 'var(--text)', fontWeight: '800' }}>Growth Performance</h4>
                            <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '1rem', paddingBottom: '2rem' }}>
                                {investments.map((inv, i) => {
                                    const h = Math.min(100, (inv.currentValue / inv.purchasePrice) * 50);
                                    return (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '100%', background: 'var(--primary)', height: `${h}px`, borderRadius: '4px 4px 0 0', opacity: 1 - (i * 0.1), minHeight: '4px' }}></div>
                                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center', fontWeight: '700' }}>{inv.propertyName.substring(0, 10)}...</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                            <PieChart size={60} color="var(--accent)" style={{ margin: '0 auto 1.5rem' }} />
                            <h4 style={{ fontSize: '1.2rem', color: 'var(--text)', fontWeight: '800' }}>Diversification</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6' }}>Your capital is spread across <b style={{ color: 'var(--text)' }}>{stats.count}</b> distinct assets. Review individual performance to optimize your yields.</p>
                        </div>
                    </div>
                </>
            )}

            {/* Assets Management */}
            {activeTab === 'assets' && (
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
                            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <label style={{ color: 'var(--text-muted)' }}>Property Name / Address</label>
                                    <input type="text" className="input-control" required value={formData.propertyName} onChange={e => setFormData({...formData, propertyName: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
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
                                <div className="input-group" style={{ gridColumn: 'span 3' }}>
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
                                    <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800' }}>ASSET</th>
                                    <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800' }}>DYNAMICS</th>
                                    <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800' }}>VALUATION</th>
                                    <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800' }}>ROI</th>
                                    <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {investments.map(inv => {
                                    const gain = inv.currentValue - inv.purchasePrice;
                                    const r = (gain / inv.purchasePrice) * 100;
                                    return (
                                         <tr key={inv._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s ease' }} className="hover-light">
                                            <td style={{ padding: '1.5rem 1.2rem' }}>
                                                <div style={{ fontWeight: '800', color: 'var(--text)' }}>{inv.propertyName}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                                                    <Clock size={10} /> Acquired {new Date(inv.investmentDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem 1.2rem' }}>
                                                <span style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                    {inv.ownershipPercentage}% Stake
                                                </span>
                                            </td>
                                             <td style={{ padding: '1.5rem 1.2rem' }}>
                                                <div style={{ fontWeight: '900', color: 'var(--text)' }}>₹${inv.currentValue.toLocaleString()}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Cost: ₹${inv.purchasePrice.toLocaleString()}</div>
                                            </td>
                                            <td style={{ padding: '1.5rem 1.2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: r >= 0 ? 'var(--success)' : 'var(--error)', fontWeight: '800' }}>
                                                    {r >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                    {Math.abs(r).toFixed(1)}%
                                                </div>
                                            </td>
                                             <td style={{ padding: '1.5rem 1.2rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button className="btn btn-outline" style={{ padding: '0.3rem', border: 'none', color: 'var(--text-muted)' }} onClick={() => handleEdit(inv)}><Edit size={16} /></button>
                                                    <button className="btn btn-outline" style={{ padding: '0.3rem', border: 'none', color: 'var(--error)' }} onClick={() => handleDelete(inv._id)}><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Document Vault */}
            {activeTab === 'docs' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                     {investments.map(inv => (
                        <div key={inv._id} className="glass-card" style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                            <h5 style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontWeight: '800' }}>
                                <Building2 size={18} color="var(--primary)" /> {inv.propertyName}
                            </h5>
                            
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                                {inv.documents?.map((doc, i) => (
                                    <a key={i} href={doc} target="_blank" rel="noreferrer" className="glass-card" style={{ padding: '0.8rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', textDecoration: 'none', color: 'var(--text)', background: 'var(--surface-light)', border: '1px solid var(--border)', fontWeight: '600' }}>
                                        <File size={16} color="var(--accent)" /> 
                                        {doc.split('-').pop()}
                                    </a>
                                ))}
                                {(!inv.documents || inv.documents.length === 0) && (
                                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', border: '1px dashed var(--border)', borderRadius: '8px', fontWeight: '600' }}>
                                        No files uploaded for this asset
                                    </div>
                                )}
                            </div>

                            <div style={{ position: 'relative' }}>
                                <button className="btn btn-outline" style={{ width: '100%', fontSize: '0.75rem', gap: '8px' }}>
                                    <Upload size={14} /> Add Documents
                                </button>
                                <input 
                                    type="file" 
                                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }}
                                    onChange={(e) => handleFileUpload(e, inv._id)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InvestorDashboard;
