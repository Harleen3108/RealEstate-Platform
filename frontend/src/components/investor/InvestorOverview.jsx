import React, { useState, useEffect } from 'react';
import { Wallet, Landmark, TrendingUp, Building2, ArrowUpRight } from 'lucide-react';
import AnimatedCounter from '../common/AnimatedCounter';

const InvestorOverview = ({ stats, investments, setActiveTab }) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text)' }}>Portfolio Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: windowWidth > 768 ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Total Portfolio Value', value: `₹${stats.totalValue.toLocaleString()}`, icon: Wallet, color: 'var(--success)', sub: 'Current Market Value' },
                    { label: 'Total Invested Capital', value: `₹${stats.totalInvested.toLocaleString()}`, icon: Landmark, color: 'var(--text)', sub: 'Principal Amount' },
                    { label: 'Profit / Gain Estimate', value: `${stats.profit >= 0 ? '+' : ''}₹${stats.profit.toLocaleString()}`, icon: TrendingUp, color: 'var(--accent)', sub: `${stats.roi.toFixed(1)}% Total ROI` },
                    { label: 'Properties', value: stats.count, icon: Building2, color: 'var(--primary)', sub: 'Active Assets' }
                ].map((s, i) => (
                    <div key={i} className="glass-card" style={{ padding: '1.5rem', position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '800', marginBottom: '0.6rem', letterSpacing: '0.5px' }}>{s.label}</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: s.color, marginBottom: '0.4rem' }}>
                            <AnimatedCounter value={s.value} />
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {s.sub}
                        </div>
                        <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--surface-light)', padding: '8px', borderRadius: '10px', color: 'var(--primary)' }}>
                            <s.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: windowWidth > 1024 ? '1fr 2fr' : '1fr', gap: '2rem' }}>
                <div className="glass-card" style={{ padding: '2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h4 style={{ fontSize: '1.2rem', color: 'var(--text)', fontWeight: '800' }}>Property Distribution</h4>
                        <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>VIEW DETAILS</button>
                    </div>
                    <div style={{ position: 'relative', height: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ width: '160px', height: '160px', borderRadius: '50%', border: '15px solid var(--primary)', borderRightColor: 'var(--accent)', borderBottomColor: 'var(--success)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900' }}><AnimatedCounter value={stats.count} /></div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Units</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {['Residential', 'Commercial', 'Industrial'].map((type, idx) => {
                            const count = investments.filter(inv => inv.propertyType === type).length;
                            const pct = stats.count > 0 ? Math.round((count / stats.count) * 100) : 0;
                            const colors = ['var(--primary)', 'var(--accent)', 'var(--success)'];
                            return (
                                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[idx] }}></div>
                                        <span style={{ color: 'var(--text-muted)' }}>{type}</span>
                                    </div>
                                    <span style={{ fontWeight: '800' }}><AnimatedCounter value={`${pct}%`} /></span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h4 style={{ fontSize: '1.2rem', color: 'var(--text)', fontWeight: '800' }}>Recent Investments</h4>
                        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setActiveTab('investments')}><ArrowUpRight size={18} /></button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Property Name</th>
                                <th style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Invested</th>
                                <th style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Current Value</th>
                                <th style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {investments.slice(0, 5).map(inv => (
                                <tr key={inv._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem 0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--surface-light)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <Building2 size={20} color="var(--primary)" />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{inv.propertyName}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{inv.propertyType}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 0', fontWeight: '700', fontSize: '0.9rem' }}>₹{inv.purchasePrice.toLocaleString()}</td>
                                    <td style={{ padding: '1rem 0' }}>
                                        <span style={{ fontWeight: '800', color: 'var(--success)' }}>₹{inv.currentValue.toLocaleString()}</span>
                                    </td>
                                    <td style={{ padding: '1rem 0' }}>
                                        <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800' }}>ACTIVE</span>
                                    </td>
                                </tr>
                            ))}
                            {investments.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No investments recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default InvestorOverview;
