import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL, { BACKEND_URL } from '../../apiConfig';
import { 
    TrendingUp, Layout, Building2, Users, ShieldAlert
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

// Sub-components
import AgencyOverview from '../../components/agency/AgencyOverview';
import AgencyInventory from '../../components/agency/AgencyInventory';
import AgencyCRM from '../../components/agency/AgencyCRM';

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
        mapLocation: '',
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

    const [inventoryFilters, setInventoryFilters] = useState({
        location: '',
        type: '',
        minPrice: '',
        maxPrice: ''
    });

    const propertyTypes = ['Apartment', 'Villa', 'Commercial', 'Land'];
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
                axios.get(`${API_BASE_URL}/properties/agency/${authUser._id}`),
                axios.get(`${API_BASE_URL}/leads`)
            ]);
            
            const propData = propRes.data;
            const myProps = Array.isArray(propData) ? propData : (propData?.data || propData?.properties || []);
            const leadData = leadRes.data;
            const leadsArr = Array.isArray(leadData) ? leadData : (leadData?.data || leadData?.leads || []);
            setProperties(myProps);
            setStats({
                totalProperties: myProps.length,
                available: myProps.filter(p => p.status === 'Available').length,
                sold: myProps.filter(p => p.status === 'Sold').length,
                totalLeads: leadsArr.length
            });
            setLeads(leadsArr);
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
            const { data } = await axios.post(`${API_BASE_URL}/upload`, formData);
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
                amenities: typeof propData.amenities === 'string' ? propData.amenities.split(',').map(a => a.trim()).filter(a => a) : propData.amenities
            };

            if (editingProp) {
                await axios.put(`${API_BASE_URL}/properties/${editingProp._id}`, payload);
            } else {
                await axios.post(`${API_BASE_URL}/properties`, payload);
            }
            
            setShowPropForm(false);
            setEditingProp(null);
            setPropData({
                title: '', description: '', location: '', mapLocation: '', propertyType: 'Apartment',
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
            amenities: Array.isArray(prop.amenities) ? prop.amenities.join(', ') : prop.amenities
        });
        setShowPropForm(true);
    };

    const handleDeleteProp = async (id) => {
        if (!window.confirm('Delete this listing permanently?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/properties/${id}`);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const updateLeadStatus = async (leadId, newStatus) => {
        try {
            await axios.patch(`${API_BASE_URL}/leads/${leadId}/status`, { status: newStatus });
            setLeads(leads.map(l => l._id === leadId ? { ...l, status: newStatus } : l));
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddNote = async (id) => {
        if (!noteContent.trim()) return;
        try {
            const { data } = await axios.post(`${API_BASE_URL}/leads/${id}/notes`, { content: noteContent });
            setLeads(leads.map(l => l._id === id ? data : l));
            setNoteContent('');
            setShowNoteModal(null);
        } catch (error) {
            console.error(error);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/400x200?text=No+Image';
        if (url.startsWith('http')) {
            if (window.location.hostname !== 'localhost' && url.includes('localhost:5000')) {
                return url.replace('http://localhost:5000', BACKEND_URL);
            }
            return url;
        }
        return `${BACKEND_URL}${url}`;
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

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Layout },
        { id: 'listings', label: 'Inventory', icon: Building2 },
        { id: 'leads', label: 'CRM Pipeline', icon: Users }
    ];

    return (
        <div className="animate-fade" style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: 'clamp(1.4rem, 5vw, 2.2rem)', fontWeight: '800', color: 'var(--text)', minWidth: 0, flex: '1 1 auto' }}>Agency <span className="text-gradient">Hub</span></h2>
                <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--surface-light)', border: '1px solid var(--border)', padding: '0.4rem', borderRadius: '12px', overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            className={`btn ${activeTab === t.id ? 'btn-primary' : ''}`}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: activeTab === t.id ? 'var(--primary)' : 'transparent', color: activeTab === t.id ? 'white' : 'var(--text-muted)', transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}
                            onClick={() => setActiveTab(t.id)}
                        >
                            <t.icon size={16} /> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'overview' && (
                <AgencyOverview stats={stats} />
            )}
            {activeTab === 'listings' && (
                <AgencyInventory 
                    properties={properties}
                    showPropForm={showPropForm}
                    setShowPropForm={setShowPropForm}
                    propData={propData}
                    setPropData={setPropData}
                    handlePropSubmit={handlePropSubmit}
                    handleEditProp={handleEditProp}
                    handleDeleteProp={handleDeleteProp}
                    editingProp={editingProp}
                    inventoryFilters={inventoryFilters}
                    setInventoryFilters={setInventoryFilters}
                    propertyTypes={propertyTypes}
                    propStatuses={propStatuses}
                    handleFileUpload={handleFileUpload}
                    getImageUrl={getImageUrl}
                />
            )}
            {activeTab === 'leads' && (
                <AgencyCRM 
                    leads={leads}
                    stages={stages}
                    updateLeadStatus={updateLeadStatus}
                    showNoteModal={showNoteModal}
                    setShowNoteModal={setShowNoteModal}
                    noteContent={noteContent}
                    setNoteContent={setNoteContent}
                    handleAddNote={handleAddNote}
                />
            )}
        </div>
    );
};

export default AgencyDashboard;
