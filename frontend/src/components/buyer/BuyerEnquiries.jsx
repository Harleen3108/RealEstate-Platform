import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, User } from 'lucide-react';

const BuyerEnquiries = ({ enquiries }) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (enquiries.length === 0) {
        return (
            <div className="glass-card" style={{ padding: '2.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                    <MessageCircle size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                    <p>You haven't initiated any property enquiries yet.</p>
                    <Link to="/marketplace" className="btn btn-outline" style={{ marginTop: '1.5rem' }}>View Assets</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card" style={{ padding: '2.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {windowWidth > 768 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', padding: '1rem 1.5rem', opacity: 0.8, fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', background: 'var(--surface-light)', borderRadius: '8px', marginBottom: '1rem' }}>
                        <div>Property Asset</div>
                        <div>Listing Agency</div>
                        <div>Submission Date</div>
                        <div style={{ textAlign: 'right' }}>Pipeline Status</div>
                    </div>
                )}
                {enquiries.map(enq => (
                    <div key={enq._id} className="glass-card animate-fade hover-light" style={{ display: 'grid', gridTemplateColumns: windowWidth > 768 ? '2fr 1.5fr 1fr 1fr' : '1fr', alignItems: 'center', padding: '1.5rem', background: 'var(--surface-light)', border: '1px solid var(--border)', transition: 'background 0.2s ease', gap: windowWidth > 768 ? '0' : '1rem' }}>
                        <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text)' }}>
                            {enq.property?.title || 'Unknown Property'}
                            <div style={{ color: 'var(--primary)', fontSize: '0.7rem', fontWeight: '700' }}>{enq.property?.location}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={14} color="var(--primary)" />
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text)' }}>{enq.agency?.name || 'Platform Agency'}</span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600' }}>
                            {windowWidth <= 768 && <span style={{ marginRight: '8px' }}>Submitted:</span>}
                            {new Date(enq.createdAt).toLocaleDateString()}
                        </div>
                        <div style={{ textAlign: windowWidth > 768 ? 'right' : 'left' }}>
                            <span style={{ 
                                fontSize: '0.65rem', 
                                background: enq.status === 'Sold' ? 'var(--success)' : 'var(--primary)', 
                                color: 'white',
                                padding: '5px 14px', 
                                borderRadius: '20px',
                                fontWeight: '900',
                                textTransform: 'uppercase'
                            }}>{enq.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BuyerEnquiries;
