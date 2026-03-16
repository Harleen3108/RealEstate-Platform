import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle, TrendingUp, Users } from 'lucide-react';
import AnimatedCounter from '../common/AnimatedCounter';

const AgencyOverview = ({ stats }) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return (
        <div className="animate-fade">
            <div style={{ display: 'grid', gridTemplateColumns: windowWidth > 768 ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Platform Listings', value: stats.totalProperties, color: 'var(--text)', icon: Building2 },
                    { label: 'Active Assets', value: stats.available, color: 'var(--success)', icon: CheckCircle },
                    { label: 'Closed Deals', value: stats.sold, color: 'var(--accent)', icon: TrendingUp },
                    { label: 'Total Enquiries', value: stats.totalLeads, color: 'var(--primary)', icon: Users }
                 ].map((s, i) => (
                    <div key={i} className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>{s.label}</div>
                        <div style={{ fontSize: '2.2rem', fontWeight: '900', color: s.color }}>
                            <AnimatedCounter value={s.value} />
                        </div>
                    </div>
                ))}
            </div>
             <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📈</div>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text)', fontWeight: '800' }}>Growth Analytics</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '1rem auto', lineHeight: '1.6' }}>
                    Your agency is currently managing <b style={{ color: 'var(--text)' }}><AnimatedCounter value={stats.totalProperties} /></b> assets with an active conversion of 
                    <b style={{ color: 'var(--primary)' }}> <AnimatedCounter value={stats.totalLeads > 0 ? `${Math.round((stats.sold / stats.totalLeads) * 100)}%` : '0%'} /></b> across the pipeline.
                </p>
            </div>
        </div>
    );
};

export default AgencyOverview;
