import React, { useState } from 'react';
import { 
    ChevronLeft, 
    Building2, 
    DollarSign, 
    FileText, 
    Info, 
    Save, 
    Plus, 
    Calendar,
    Percent,
    CreditCard,
    ShieldCheck,
    Upload,
    File
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../apiConfig';

const InvestorPropertyDetail = ({ investment, onBack, fetchInvestments, getFileUrl, handleFileUpload }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...investment });

    const handleSave = async () => {
        try {
            await axios.put(`${API_BASE_URL}/investments/${investment._id}`, formData);
            fetchInvestments();
            setIsEditing(false);
            alert('Financial details updated successfully');
        } catch (error) {
            console.error(error);
            alert('Failed to update details');
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Info },
        { id: 'financials', label: 'Financials', icon: DollarSign },
        { id: 'docs', label: 'Documents', icon: FileText }
    ];

    return (
        <div className="animate-fade">
            <button 
                onClick={onBack}
                className="btn btn-outline" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', padding: '0.5rem 1rem' }}
            >
                <ChevronLeft size={18} /> Back to Portfolio
            </button>

            <div className="glass-card" style={{ padding: '2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.4rem' }}>{investment.propertyName}</h3>
                        <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Building2 size={16} /> {investment.location} • <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{investment.propertyType}</span>
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-light)', padding: '0.4rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        {tabs.map(t => (
                            <button 
                                key={t.id}
                                className={`btn ${activeTab === t.id ? 'btn-primary' : ''}`}
                                style={{ 
                                    padding: '0.5rem 1rem', 
                                    fontSize: '0.85rem', 
                                    background: activeTab === t.id ? 'var(--primary)' : 'transparent',
                                    color: activeTab === t.id ? 'white' : 'var(--text-muted)',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                                onClick={() => setActiveTab(t.id)}
                            >
                                <t.icon size={16} /> {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                        <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--surface-light)' }}>
                            <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Acquisition Cost</label>
                            <h4 style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '0.5rem' }}>₹{investment.purchasePrice.toLocaleString()}</h4>
                        </div>
                        <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--surface-light)' }}>
                            <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Current Valuation</label>
                            <h4 style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '0.5rem', color: 'var(--success)' }}>₹{investment.currentValue.toLocaleString()}</h4>
                        </div>
                        <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--surface-light)' }}>
                            <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Ownership %</label>
                            <h4 style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '0.5rem' }}>{investment.ownershipPercentage}%</h4>
                        </div>
                        <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--surface-light)', gridColumn: 'span 2' }}>
                            <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Investment Date</label>
                            <p style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '0.5rem' }}>{new Date(investment.investmentDate).toLocaleDateString()}</p>
                        </div>
                        {investment.notes && (
                            <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--surface-light)', gridColumn: '1 / -1' }}>
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Notes</label>
                                <p style={{ marginTop: '0.5rem', color: 'var(--text)' }}>{investment.notes}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'financials' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Property Financials</h4>
                            {!isEditing ? (
                                <button className="btn btn-outline" onClick={() => setIsEditing(true)}>Edit Details</button>
                            ) : (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
                                    <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Save Changes</button>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            {/* Loan Information */}
                            <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--surface-light)' }}>
                                <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', fontWeight: '700' }}>
                                    <Building2 size={18} color="var(--primary)" /> Loan Information
                                </h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Loan Taken</label>
                                        <select 
                                            className="input-control" 
                                            disabled={!isEditing}
                                            value={formData.loanInformation?.loanTaken ? 'Yes' : 'No'}
                                            onChange={e => setFormData({
                                                ...formData, 
                                                loanInformation: { ...formData.loanInformation, loanTaken: e.target.value === 'Yes' }
                                            })}
                                        >
                                            <option>No</option>
                                            <option>Yes</option>
                                        </select>
                                    </div>
                                    {formData.loanInformation?.loanTaken && (
                                        <>
                                            <div className="input-group">
                                                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Bank Name</label>
                                                <input 
                                                    type="text" 
                                                    className="input-control" 
                                                    disabled={!isEditing}
                                                    value={formData.loanInformation?.bankName || ''}
                                                    onChange={e => setFormData({
                                                        ...formData,
                                                        loanInformation: { ...formData.loanInformation, bankName: e.target.value }
                                                    })}
                                                />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div className="input-group">
                                                    <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Loan Amount (₹)</label>
                                                    <input 
                                                        type="number" 
                                                        className="input-control" 
                                                        disabled={!isEditing}
                                                        value={formData.loanInformation?.loanAmount || ''}
                                                        onChange={e => setFormData({
                                                            ...formData,
                                                            loanInformation: { ...formData.loanInformation, loanAmount: e.target.value }
                                                        })}
                                                    />
                                                </div>
                                                <div className="input-group">
                                                    <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Interest Rate (%)</label>
                                                    <input 
                                                        type="number" 
                                                        className="input-control" 
                                                        disabled={!isEditing}
                                                        value={formData.loanInformation?.interestRate || ''}
                                                        onChange={e => setFormData({
                                                            ...formData,
                                                            loanInformation: { ...formData.loanInformation, interestRate: e.target.value }
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="input-group">
                                                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>EMI Amount (₹)</label>
                                                <input 
                                                    type="number" 
                                                    className="input-control" 
                                                    disabled={!isEditing}
                                                    value={formData.loanInformation?.emiAmount || ''}
                                                    onChange={e => setFormData({
                                                        ...formData,
                                                        loanInformation: { ...formData.loanInformation, emiAmount: e.target.value }
                                                    })}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Payment Tracking */}
                            <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--surface-light)' }}>
                                <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', fontWeight: '700' }}>
                                    <CreditCard size={18} color="var(--primary)" /> Payment Tracking
                                </h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Total Property Cost (₹)</label>
                                        <input 
                                            type="number" 
                                            className="input-control" 
                                            disabled={!isEditing}
                                            value={formData.paymentTracking?.totalPropertyCost || ''}
                                            onChange={e => setFormData({
                                                ...formData,
                                                paymentTracking: { ...formData.paymentTracking, totalPropertyCost: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="input-group">
                                            <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Amount Paid (₹)</label>
                                            <input 
                                                type="number" 
                                                className="input-control" 
                                                disabled={!isEditing}
                                                value={formData.paymentTracking?.amountPaid || ''}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    paymentTracking: { ...formData.paymentTracking, amountPaid: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Pending Amount (₹)</label>
                                            <input 
                                                type="number" 
                                                className="input-control" 
                                                value={Number(formData.paymentTracking?.totalPropertyCost || 0) - Number(formData.paymentTracking?.amountPaid || 0)}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Payment Type</label>
                                        <select 
                                            className="input-control" 
                                            disabled={!isEditing}
                                            value={formData.paymentTracking?.paymentType || 'Cash'}
                                            onChange={e => setFormData({
                                                ...formData,
                                                paymentTracking: { ...formData.paymentTracking, paymentType: e.target.value }
                                            })}
                                        >
                                            <option>Cash</option>
                                            <option>Loan</option>
                                            <option>Mixed</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Insurance Details */}
                            <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--surface-light)', gridColumn: 'span 2' }}>
                                <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', fontWeight: '700' }}>
                                    <ShieldCheck size={18} color="var(--primary)" /> Insurance Details
                                </h5>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                    <div className="input-group">
                                        <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Provider</label>
                                        <input 
                                            type="text" 
                                            className="input-control" 
                                            disabled={!isEditing}
                                            value={formData.insuranceDetails?.provider || ''}
                                            onChange={e => setFormData({
                                                ...formData,
                                                insuranceDetails: { ...formData.insuranceDetails, provider: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Insurance Type</label>
                                        <select 
                                            className="input-control" 
                                            disabled={!isEditing}
                                            value={formData.insuranceDetails?.insuranceType || 'property'}
                                            onChange={e => setFormData({
                                                ...formData,
                                                insuranceDetails: { ...formData.insuranceDetails, insuranceType: e.target.value }
                                            })}
                                        >
                                            <option value="property">Property Insurance</option>
                                            <option value="home">Home Insurance</option>
                                            <option value="loan insurance">Loan Insurance</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Premium Amount (₹)</label>
                                        <input 
                                            type="number" 
                                            className="input-control" 
                                            disabled={!isEditing}
                                            value={formData.insuranceDetails?.premiumAmount || ''}
                                            onChange={e => setFormData({
                                                ...formData,
                                                insuranceDetails: { ...formData.insuranceDetails, premiumAmount: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'docs' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Asset Vault</h4>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {investment.documents?.map((doc, i) => (
                                <a 
                                    key={i} 
                                    href={getFileUrl(doc)} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="glass-card" 
                                    style={{ 
                                        padding: '1rem', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '12px', 
                                        textDecoration: 'none', 
                                        color: 'var(--text)', 
                                        background: 'var(--surface-light)', 
                                        border: '1px solid var(--border)', 
                                        borderRadius: '12px',
                                        transition: 'transform 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ background: 'var(--surface)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <File size={20} color="var(--primary)" />
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {doc.split('-').pop()}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tap to view document</div>
                                    </div>
                                </a>
                            ))}
                            
                            <div className="glass-card" style={{ padding: '1rem', border: '2px dashed var(--border)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80px', position: 'relative' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <Upload size={20} color="var(--text-muted)" style={{ marginBottom: '4px' }} />
                                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Upload Document</div>
                                </div>
                                <input 
                                    type="file" 
                                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }}
                                    onChange={(e) => handleFileUpload(e, investment._id)}
                                />
                            </div>
                        </div>

                        {(!investment.documents || investment.documents.length === 0) && (
                            <div style={{ marginTop: '2rem', textAlign: 'center', padding: '3rem', background: 'var(--surface-light)', borderRadius: '12px', color: 'var(--text-muted)' }}>
                                <FileText size={40} strokeWidth={1} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>This asset's vault is empty. Upload purchase deeds, loan agreements, or insurance papers.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvestorPropertyDetail;
