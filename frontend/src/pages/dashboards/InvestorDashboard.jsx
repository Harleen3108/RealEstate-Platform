import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL, { BACKEND_URL } from '../../apiConfig';
import { 
    Layout, 
    List, 
    FileText, 
    BarChart3, 
    User, 
    Settings,
    Calculator
} from 'lucide-react';

// Sub-components
import InvestorOverview from '../../components/investor/InvestorOverview';
import InvestorPortfolio from '../../components/investor/InvestorPortfolio';
import InvestorDocuments from '../../components/investor/InvestorDocuments';
import InvestorAnalytics from '../../components/investor/InvestorAnalytics';
import InvestorProfile from '../../components/investor/InvestorProfile';
import InvestorSettings from '../../components/investor/InvestorSettings';

const InvestorDashboard = () => {
    const { tab } = useParams();
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(tab || 'overview');
    
    // UI State
    const [showForm, setShowForm] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [formData, setFormData] = useState({
        propertyName: '',
        location: '',
        propertyType: 'Residential',
        purchasePrice: '',
        currentValue: '',
        investmentDate: '',
        ownershipPercentage: 100,
        notes: ''
    });

    const propertyTypes = ['Residential', 'Commercial', 'Industrial', 'Land'];

    useEffect(() => {
        if (tab === 'add-investment') {
            setActiveTab('investments');
            setShowForm(true);
        } else if (tab) {
            setActiveTab(tab);
        }
    }, [tab]);

    useEffect(() => {
        fetchInvestments();
    }, []);

    const fetchInvestments = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/investments`);
            setInvestments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        const totalInvested = investments.reduce((sum, inv) => sum + (Number(inv.purchasePrice) * (Number(inv.ownershipPercentage) / 100)), 0);
        const totalValue = investments.reduce((sum, inv) => sum + (Number(inv.currentValue) * (Number(inv.ownershipPercentage) / 100)), 0);
        const profit = totalValue - totalInvested;
        const roi = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
        
        return { totalInvested, totalValue, profit, roi, count: investments.length };
    };

    const stats = calculateStats();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRecord) {
                await axios.put(`${API_BASE_URL}/investments/${editingRecord._id}`, formData);
            } else {
                await axios.post(`${API_BASE_URL}/investments`, formData);
            }
            setShowForm(false);
            setEditingRecord(null);
            setFormData({ propertyName: '', location: '', propertyType: 'Residential', purchasePrice: '', currentValue: '', investmentDate: '', ownershipPercentage: 100, notes: '' });
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
            await axios.delete(`${API_BASE_URL}/investments/${id}`);
            fetchInvestments();
        } catch (error) {
            console.error(error);
        }
    };

    const handleFileUpload = async (e, recordId) => {
        const file = e.target.files[0];
        if (!file) return;
        const fData = new FormData();
        fData.append('file', file);
        try {
            const { data } = await axios.post(`${API_BASE_URL}/upload`, fData);
            const record = investments.find(inv => inv._id === recordId);
            const updatedDocs = [...(record.documents || []), data.url];
            await axios.put(`${API_BASE_URL}/investments/${recordId}`, { documents: updatedDocs });
            fetchInvestments();
            alert('Document added to vault');
        } catch (error) {
            alert('Upload failed');
        }
    };

    const getFileUrl = (url) => {
        if (!url) return '#';
        if (url.startsWith('http')) {
            if (window.location.hostname !== 'localhost' && url.includes('localhost:5000')) {
                return url.replace('http://localhost:5000', BACKEND_URL);
            }
            return url;
        }
        return `${BACKEND_URL}${url}`;
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <Calculator className="animate-pulse" size={40} color="var(--primary)" />
        </div>
    );

    const tabs = [
        { id: 'overview', label: 'Dashboard', icon: Layout },
        { id: 'investments', label: 'Portfolio', icon: List },
        { id: 'docs', label: 'Documents', icon: FileText },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    return (
        <div className="animate-fade" style={{ paddingBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.4rem' }}>Investor <span className="text-gradient">Hub</span></h2>
                    <p style={{ color: 'var(--text-muted)' }}>Real-time performance of your real estate assets</p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--surface-light)', border: '1px solid var(--border)', padding: '0.4rem', borderRadius: '12px', overflowX: 'auto', maxWidth: '100%' }}>
                    {tabs.map(t => (
                        <button 
                            key={t.id}
                            className={`btn ${activeTab === t.id ? 'btn-primary' : ''}`}
                            style={{ 
                                padding: '0.5rem 1rem', 
                                fontSize: '0.85rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                background: activeTab === t.id ? 'var(--primary)' : 'transparent',
                                color: activeTab === t.id ? 'white' : 'var(--text-muted)',
                                border: 'none',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap'
                            }}
                            onClick={() => setActiveTab(t.id)}
                        >
                            <t.icon size={16} /> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'overview' && (
                <InvestorOverview stats={stats} investments={investments} setActiveTab={setActiveTab} />
            )}
            {activeTab === 'investments' && (
                <InvestorPortfolio 
                    investments={investments} 
                    showForm={showForm} 
                    setShowForm={setShowForm}
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    editingRecord={editingRecord}
                    setEditingRecord={setEditingRecord}
                    propertyTypes={propertyTypes}
                />
            )}
            {activeTab === 'docs' && (
                <InvestorDocuments 
                    investments={investments} 
                    getFileUrl={getFileUrl} 
                    handleFileUpload={handleFileUpload} 
                />
            )}
            {activeTab === 'analytics' && (
                <InvestorAnalytics stats={stats} investments={investments} />
            )}
            {activeTab === 'profile' && (
                <InvestorProfile />
            )}
            {activeTab === 'settings' && (
                <InvestorSettings />
            )}
        </div>
    );
};

export default InvestorDashboard;
