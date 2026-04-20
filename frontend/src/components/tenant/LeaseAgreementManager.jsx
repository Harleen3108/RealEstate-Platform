import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Plus, Edit2, Trash2, Eye, FileText } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';
import '../../styles/TenantDocuments.css';

const LeaseAgreementManager = () => {
    const [leases, setLeases] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        tenantName: '',
        tenantEmail: '',
        tenantPhone: '',
        tenantAddress: '',
        tenantAadharNumber: '',
        landlordName: '',
        landlordEmail: '',
        landlordPhone: '',
        landlordAddress: '',
        landlordAadharNumber: '',
        propertyAddress: '',
        propertyType: 'Apartment',
        bhk: '',
        rentAmount: '',
        rentDueDate: 1,
        depositAmount: '',
        maintenanceCharges: 0,
        leasePeriodMonths: '',
        startDate: '',
        petPolicy: 'Not Allowed',
        smokingPolicy: 'Not Allowed',
        utilitiesIncluded: [],
        utilitiesNotIncluded: []
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchLeases();
    }, []);

    const fetchLeases = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/tenant/leases`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeases(response.data);
        } catch (error) {
            console.error('Error fetching leases:', error);
            setMessage('Failed to load lease agreements');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            
            if (editingId) {
                await axios.put(`${API_BASE_URL}/tenant/lease/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('Lease agreement updated successfully');
                setEditingId(null);
            } else {
                await axios.post(`${API_BASE_URL}/tenant/lease`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('Lease agreement created successfully');
            }
            
            setFormData({
                tenantName: '', tenantEmail: '', tenantPhone: '', tenantAddress: '', tenantAadharNumber: '',
                landlordName: '', landlordEmail: '', landlordPhone: '', landlordAddress: '', landlordAadharNumber: '',
                propertyAddress: '', propertyType: 'Apartment', bhk: '', rentAmount: '', rentDueDate: 1,
                depositAmount: '', maintenanceCharges: 0, leasePeriodMonths: '', startDate: '',
                petPolicy: 'Not Allowed', smokingPolicy: 'Not Allowed',
                utilitiesIncluded: [], utilitiesNotIncluded: []
            });
            setShowForm(false);
            fetchLeases();
        } catch (error) {
            console.error('Error saving lease:', error);
            setMessage('Failed to save lease agreement');
        }
    };

    const handleGeneratePDF = async (leaseId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/tenant/lease/${leaseId}/generate-pdf`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Download the PDF
            const pdfUrl = `${window.location.origin}${response.data.pdfPath}`;
            window.open(pdfUrl, '_blank');
            setMessage('PDF generated successfully');
        } catch (error) {
            console.error('Error generating PDF:', error);
            setMessage('Failed to generate PDF');
        }
    };

    const handleDelete = async (leaseId) => {
        if (window.confirm('Are you sure you want to delete this lease agreement?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_BASE_URL}/tenant/lease/${leaseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('Lease agreement deleted successfully');
                fetchLeases();
            } catch (error) {
                console.error('Error deleting lease:', error);
                setMessage('Failed to delete lease agreement');
            }
        }
    };

    return (
        <div className="tenant-documents-container">
            <div className="documents-header">
                <h2>Lease Agreements</h2>
                <button className="btn-primary" onClick={() => {
                    setShowForm(!showForm);
                    setEditingId(null);
                }}>
                    <Plus size={20} /> Create Agreement
                </button>
            </div>

            {message && (
                <div className="alert" style={{ 
                    background: message.includes('successfully') ? '#d4edda' : '#f8d7da',
                    color: message.includes('successfully') ? '#155724' : '#721c24'
                }}>
                    {message}
                </div>
            )}

            {showForm && (
                <form className="lease-form" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3>Tenant Information</h3>
                        <div className="form-grid">
                            <input type="text" name="tenantName" placeholder="Tenant Name" value={formData.tenantName} onChange={handleInputChange} required />
                            <input type="email" name="tenantEmail" placeholder="Tenant Email" value={formData.tenantEmail} onChange={handleInputChange} required />
                            <input type="tel" name="tenantPhone" placeholder="Tenant Phone" value={formData.tenantPhone} onChange={handleInputChange} required />
                            <input type="text" name="tenantAddress" placeholder="Tenant Address" value={formData.tenantAddress} onChange={handleInputChange} />
                            <input type="text" name="tenantAadharNumber" placeholder="Aadhaar Number" value={formData.tenantAadharNumber} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Landlord Information</h3>
                        <div className="form-grid">
                            <input type="text" name="landlordName" placeholder="Landlord Name" value={formData.landlordName} onChange={handleInputChange} required />
                            <input type="email" name="landlordEmail" placeholder="Landlord Email" value={formData.landlordEmail} onChange={handleInputChange} required />
                            <input type="tel" name="landlordPhone" placeholder="Landlord Phone" value={formData.landlordPhone} onChange={handleInputChange} required />
                            <input type="text" name="landlordAddress" placeholder="Landlord Address" value={formData.landlordAddress} onChange={handleInputChange} />
                            <input type="text" name="landlordAadharNumber" placeholder="Landlord Aadhaar" value={formData.landlordAadharNumber} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Property Details</h3>
                        <div className="form-grid">
                            <input type="text" name="propertyAddress" placeholder="Property Address" value={formData.propertyAddress} onChange={handleInputChange} required />
                            <select name="propertyType" value={formData.propertyType} onChange={handleInputChange}>
                                <option>Apartment</option>
                                <option>Villa</option>
                                <option>House</option>
                                <option>Studio</option>
                                <option>Room</option>
                            </select>
                            <input type="text" name="bhk" placeholder="BHK (e.g., 2BHK)" value={formData.bhk} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Rental Terms</h3>
                        <div className="form-grid">
                            <input type="number" name="rentAmount" placeholder="Monthly Rent (₹)" value={formData.rentAmount} onChange={handleInputChange} required />
                            <input type="number" name="rentDueDate" placeholder="Rent Due Date (1-31)" value={formData.rentDueDate} onChange={handleInputChange} min="1" max="31" />
                            <input type="number" name="depositAmount" placeholder="Security Deposit (₹)" value={formData.depositAmount} onChange={handleInputChange} required />
                            <input type="number" name="maintenanceCharges" placeholder="Maintenance Charges (₹)" value={formData.maintenanceCharges} onChange={handleInputChange} />
                            <input type="number" name="leasePeriodMonths" placeholder="Lease Period (months)" value={formData.leasePeriodMonths} onChange={handleInputChange} required />
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Policies</h3>
                        <div className="form-grid">
                            <select name="petPolicy" value={formData.petPolicy} onChange={handleInputChange}>
                                <option>Not Allowed</option>
                                <option>Allowed</option>
                                <option>With Permission</option>
                            </select>
                            <select name="smokingPolicy" value={formData.smokingPolicy} onChange={handleInputChange}>
                                <option>Not Allowed</option>
                                <option>Allowed</option>
                                <option>Balcony Only</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary">
                            {editingId ? 'Update Agreement' : 'Create Agreement'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => {
                            setShowForm(false);
                            setEditingId(null);
                        }}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <p>Loading lease agreements...</p>
            ) : leases.length === 0 ? (
                <p className="empty-state">No lease agreements yet. Create one to get started!</p>
            ) : (
                <div className="leases-grid">
                    {leases.map(lease => (
                        <div key={lease._id} className="lease-card">
                            <div className="lease-header">
                                <div>
                                    <h4>{lease.propertyAddress}</h4>
                                    <p className="lease-tenant">{lease.tenantName}</p>
                                </div>
                                <span className={`status-badge ${lease.status}`}>{lease.status}</span>
                            </div>

                            <div className="lease-details">
                                <p><strong>Rent:</strong> ₹{lease.rentAmount?.toLocaleString('en-IN')}/month</p>
                                <p><strong>Deposit:</strong> ₹{lease.depositAmount?.toLocaleString('en-IN')}</p>
                                <p><strong>Period:</strong> {lease.leasePeriodMonths} months</p>
                                <p><strong>Valid:</strong> {new Date(lease.startDate).toLocaleDateString('en-IN')} to {new Date(lease.endDate).toLocaleDateString('en-IN')}</p>
                            </div>

                            <div className="lease-actions">
                                <button className="btn-icon" onClick={() => handleGeneratePDF(lease._id)} title="Download PDF">
                                    <Download size={18} />
                                </button>
                                <button className="btn-icon" title="View Details">
                                    <Eye size={18} />
                                </button>
                                <button className="btn-icon" onClick={() => handleDelete(lease._id)} title="Delete">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LeaseAgreementManager;
