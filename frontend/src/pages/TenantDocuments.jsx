import React, { useState } from 'react';
import RentReceiptManager from '../components/tenant/RentReceiptManager';
import LeaseAgreementManager from '../components/tenant/LeaseAgreementManager';
import { FileText, Receipt } from 'lucide-react';
import '../styles/TenantDocuments.css';

const TenantDocuments = () => {
    const [activeTab, setActiveTab] = useState('receipts');

    return (
        <div className="tenant-documents-page">
            <div className="page-header">
                <h1>Tenant Documents Center</h1>
                <p>Manage your rent receipts and lease agreements in one place</p>
            </div>

            <div className="tabs-container">
                <div className="tabs-nav">
                    <button 
                        className={`tab-btn ${activeTab === 'receipts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('receipts')}
                    >
                        <Receipt size={20} />
                        <span>Rent Receipts</span>
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'agreements' ? 'active' : ''}`}
                        onClick={() => setActiveTab('agreements')}
                    >
                        <FileText size={20} />
                        <span>Lease Agreements</span>
                    </button>
                </div>

                <div className="tabs-content">
                    {activeTab === 'receipts' && <RentReceiptManager />}
                    {activeTab === 'agreements' && <LeaseAgreementManager />}
                </div>
            </div>

            <div className="feature-info">
                <h3>Why Use Tenant Documents Center?</h3>
                <div className="info-grid">
                    <div className="info-card">
                        <h4>📄 Rent Receipts</h4>
                        <p>Create and download professional rent receipts for tax purposes and payment tracking</p>
                    </div>
                    <div className="info-card">
                        <h4>📋 Lease Agreements</h4>
                        <p>Generate comprehensive rental agreements with all terms, conditions, and policies clearly documented</p>
                    </div>
                    <div className="info-card">
                        <h4>✅ Legal Compliance</h4>
                        <p>Professional documents that comply with rental laws and best practices</p>
                    </div>
                    <div className="info-card">
                        <h4>🔒 Secure Storage</h4>
                        <p>All your documents are securely stored and accessible anytime, anywhere</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenantDocuments;
