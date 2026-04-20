import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Plus, Edit2, Trash2, Eye, FileText } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';
import '../../styles/TenantDocuments.css';

const RentReceiptManager = () => {
    const [receipts, setReceipts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        tenantName: '',
        tenantEmail: '',
        tenantPhone: '',
        tenantAddress: '',
        landlordName: '',
        landlordEmail: '',
        landlordPhone: '',
        propertyAddress: '',
        rentAmount: '',
        maintenanceCharges: 0,
        paymentMethod: 'Bank Transfer',
        period: '',
        notes: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/tenant/rent-receipts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReceipts(response.data);
        } catch (error) {
            console.error('Error fetching receipts:', error);
            setMessage('Failed to load rent receipts');
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
            
            // Convert string numbers to actual numbers
            const submitData = {
                ...formData,
                rentAmount: parseFloat(formData.rentAmount) || 0,
                maintenanceCharges: parseFloat(formData.maintenanceCharges) || 0
            };
            
            if (editingId) {
                await axios.put(`${API_BASE_URL}/tenant/rent-receipt/${editingId}`, submitData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('Rent receipt updated successfully');
                setEditingId(null);
            } else {
                await axios.post(`${API_BASE_URL}/tenant/rent-receipt`, submitData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('Rent receipt created successfully');
            }
            
            setFormData({
                tenantName: '',
                tenantEmail: '',
                tenantPhone: '',
                tenantAddress: '',
                landlordName: '',
                landlordEmail: '',
                landlordPhone: '',
                propertyAddress: '',
                rentAmount: '',
                maintenanceCharges: 0,
                paymentMethod: 'Bank Transfer',
                period: '',
                notes: ''
            });
            setShowForm(false);
            fetchReceipts();
        } catch (error) {
            console.error('Error saving receipt:', error);
            setMessage('Failed to save rent receipt');
        }
    };

    const handleGeneratePDF = async (receiptId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/tenant/rent-receipt/${receiptId}/generate-pdf`, {}, {
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

    const handleDelete = async (receiptId) => {
        if (window.confirm('Are you sure you want to delete this receipt?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_BASE_URL}/tenant/rent-receipt/${receiptId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('Rent receipt deleted successfully');
                fetchReceipts();
            } catch (error) {
                console.error('Error deleting receipt:', error);
                setMessage('Failed to delete rent receipt');
            }
        }
    };

    return (
        <div className="tenant-documents-container">
            <div className="documents-header">
                <h2>Rent Receipts</h2>
                <button className="btn-primary" onClick={() => {
                    setShowForm(!showForm);
                    setEditingId(null);
                }}>
                    <Plus size={20} /> Create Receipt
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
                <form className="receipt-form" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3>Tenant Information</h3>
                        <div className="form-grid">
                            <input type="text" name="tenantName" placeholder="Tenant Name" value={formData.tenantName} onChange={handleInputChange} required />
                            <input type="email" name="tenantEmail" placeholder="Tenant Email" value={formData.tenantEmail} onChange={handleInputChange} required />
                            <input type="tel" name="tenantPhone" placeholder="Tenant Phone" value={formData.tenantPhone} onChange={handleInputChange} required />
                            <input type="text" name="tenantAddress" placeholder="Tenant Address" value={formData.tenantAddress} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Landlord Information</h3>
                        <div className="form-grid">
                            <input type="text" name="landlordName" placeholder="Landlord Name" value={formData.landlordName} onChange={handleInputChange} required />
                            <input type="email" name="landlordEmail" placeholder="Landlord Email" value={formData.landlordEmail} onChange={handleInputChange} required />
                            <input type="tel" name="landlordPhone" placeholder="Landlord Phone" value={formData.landlordPhone} onChange={handleInputChange} required />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Property & Payment Details</h3>
                        <div className="form-grid">
                            <input type="text" name="propertyAddress" placeholder="Property Address" value={formData.propertyAddress} onChange={handleInputChange} required />
                            <input type="number" name="rentAmount" placeholder="Rent Amount (₹)" value={formData.rentAmount} onChange={handleInputChange} required />
                            <input type="number" name="maintenanceCharges" placeholder="Maintenance Charges (₹)" value={formData.maintenanceCharges} onChange={handleInputChange} />
                            <input type="month" name="period" placeholder="Period" value={formData.period} onChange={handleInputChange} required />
                            <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange}>
                                <option>Bank Transfer</option>
                                <option>Cash</option>
                                <option>Cheque</option>
                                <option>Digital Payment</option>
                                <option>Online</option>
                            </select>
                            <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleInputChange}></textarea>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary">
                            {editingId ? 'Update Receipt' : 'Create Receipt'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => {
                            setShowForm(false);
                            setEditingId(null);
                            setFormData({...formData});
                        }}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <p>Loading receipts...</p>
            ) : receipts.length === 0 ? (
                <p className="empty-state">No rent receipts yet. Create one to get started!</p>
            ) : (
                <div className="receipts-grid">
                    {receipts.map(receipt => (
                        <div key={receipt._id} className="receipt-card">
                            <div className="receipt-header">
                                <div>
                                    <h4>{receipt.receiptNumber}</h4>
                                    <p className="receipt-period">{receipt.period}</p>
                                </div>
                                <span className={`status-badge ${receipt.status}`}>{receipt.status}</span>
                            </div>

                            <div className="receipt-details">
                                <p><strong>Tenant:</strong> {receipt.tenantName}</p>
                                <p><strong>Property:</strong> {receipt.propertyAddress}</p>
                                <p><strong>Amount:</strong> ₹{receipt.totalAmount?.toLocaleString('en-IN')}</p>
                                <p><strong>Method:</strong> {receipt.paymentMethod}</p>
                            </div>

                            <div className="receipt-actions">
                                <button className="btn-icon" onClick={() => handleGeneratePDF(receipt._id)} title="Download PDF">
                                    <Download size={18} />
                                </button>
                                <button className="btn-icon" title="View Details">
                                    <Eye size={18} />
                                </button>
                                <button className="btn-icon" onClick={() => handleDelete(receipt._id)} title="Delete">
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

export default RentReceiptManager;
