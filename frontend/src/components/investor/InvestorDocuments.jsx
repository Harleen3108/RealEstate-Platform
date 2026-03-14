import React from 'react';
import { Building2, File, Upload } from 'lucide-react';

const InvestorDocuments = ({ investments, getFileUrl, handleFileUpload }) => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
             {investments.map(inv => (
                <div key={inv._id} className="glass-card" style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
                    <h5 style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontWeight: '800' }}>
                        <Building2 size={18} color="var(--primary)" /> {inv.propertyName}
                    </h5>
                    
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                        {inv.documents?.map((doc, i) => (
                            <a key={i} href={getFileUrl(doc)} target="_blank" rel="noreferrer" className="glass-card" style={{ padding: '0.8rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', textDecoration: 'none', color: 'var(--text)', background: 'var(--surface-light)', border: '1px solid var(--border)', fontWeight: '600', borderRadius: '10px' }}>
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
            {investments.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: '16px' }}>
                    No assets recorded. Add an investment to start managing documents.
                </div>
            )}
        </div>
    );
};

export default InvestorDocuments;
