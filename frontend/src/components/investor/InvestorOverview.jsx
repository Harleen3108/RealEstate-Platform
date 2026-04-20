import React, { useState, useEffect } from 'react';
import { Wallet, Landmark, TrendingUp, Building2, ArrowUpRight, Bot } from 'lucide-react';
import AnimatedCounter from '../common/AnimatedCounter';

const formatINR = (num) => {
    if (!num) return '---';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
    return `₹${num.toLocaleString('en-IN')}`;
};

const InvestorOverview = ({ stats, investments, setActiveTab, aiEstimates = {} }) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Calculate AI-based portfolio valuation
    const aiTotalValue = investments.reduce((sum, inv) => {
        const ai = aiEstimates[inv._id];
        if (ai && ai.estimatedPrice && !ai.error) {
            return sum + (ai.estimatedPrice * (Number(inv.ownershipPercentage) / 100));
        }
        return sum;
    }, 0);

    const aiCoveredCount = investments.filter(inv => {
        const ai = aiEstimates[inv._id];
        return ai && ai.estimatedPrice && !ai.error;
    }).length;

    const aiDiff = aiTotalValue > 0 && stats.totalValue > 0
        ? ((stats.totalValue - aiTotalValue) / aiTotalValue * 100).toFixed(1)
        : null;

    return (
        <>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text)' }}>Portfolio Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: windowWidth > 900 ? 'repeat(5, 1fr)' : windowWidth > 600 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Total Portfolio Value', value: `₹${stats.totalValue.toLocaleString()}`, icon: Wallet, color: 'var(--success)', sub: 'Your Estimate' },
                    { label: 'Total Invested Capital', value: `₹${stats.totalInvested.toLocaleString()}`, icon: Landmark, color: 'var(--text)', sub: 'Principal Amount' },
                    { label: 'Profit / Gain Estimate', value: `${stats.profit >= 0 ? '+' : ''}₹${stats.profit.toLocaleString()}`, icon: TrendingUp, color: 'var(--accent)', sub: `${stats.roi.toFixed(1)}% Total ROI` },
                    { label: 'Properties', value: stats.count, icon: Building2, color: 'var(--primary)', sub: 'Active Assets' },
                    { label: 'AI Portfolio Value', value: aiTotalValue > 0 ? formatINR(aiTotalValue) : '...', icon: Bot, color: '#7c3aed', sub: aiCoveredCount > 0 ? `${aiCoveredCount}/${stats.count} analyzed` : 'Analyzing...' }
                ].map((s, i) => (
                    <div key={i} className="glass-card" style={{ padding: '1.5rem', position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '800', marginBottom: '0.6rem', letterSpacing: '0.5px' }}>{s.label}</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '900', color: s.color, marginBottom: '0.4rem' }}>
                            <AnimatedCounter value={s.value} />
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {s.sub}
                        </div>
                        <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--surface-light)', padding: '8px', borderRadius: '10px', color: i === 4 ? '#7c3aed' : 'var(--primary)' }}>
                            <s.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Valuation Comparison Banner */}
            {aiDiff !== null && (
                <div className="glass-card" style={{
                    padding: '1.2rem 1.5rem', marginBottom: '2rem',
                    background: 'linear-gradient(135deg, #7c3aed15, #3b82f615)',
                    border: '1px solid #7c3aed30', borderRadius: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#7c3aed20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bot size={22} color="#7c3aed" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text)' }}>AI Valuation Analysis</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Your portfolio estimate is <strong style={{ color: Number(aiDiff) > 0 ? '#ef4444' : '#22c55e' }}>{aiDiff > 0 ? '+' : ''}{aiDiff}%</strong> {Number(aiDiff) > 0 ? 'above' : 'below'} AI valuation
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Your Estimate</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text)' }}>{formatINR(stats.totalValue)}</div>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>vs</div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.6rem', color: '#7c3aed', fontWeight: '700', textTransform: 'uppercase' }}>AI Valuation</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#7c3aed' }}>{formatINR(aiTotalValue)}</div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: windowWidth > 768 ? 'minmax(0, 1fr) minmax(0, 2fr)' : 'minmax(0, 1fr)', gap: windowWidth <= 480 ? '1rem' : '2rem' }}>
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
                                <th style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Your Value</th>
                                <th style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Bot size={11} /> AI Value</span>
                                </th>
                                <th style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {investments.slice(0, 5).map(inv => {
                                const ai = aiEstimates[inv._id];
                                const hasAi = ai && ai.estimatedPrice && !ai.error;
                                const diff = hasAi ? ((inv.currentValue - ai.estimatedPrice) / ai.estimatedPrice * 100) : null;

                                return (
                                    <tr key={inv._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem 0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--surface-light)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Building2 size={20} color="var(--primary)" />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{inv.propertyName}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{inv.location || inv.propertyType}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 0', fontWeight: '700', fontSize: '0.9rem' }}>₹{inv.currentValue.toLocaleString()}</td>
                                        <td style={{ padding: '1rem 0' }}>
                                            {hasAi ? (
                                                <span style={{ fontWeight: '800', color: '#7c3aed', fontSize: '0.9rem' }}>{formatINR(ai.estimatedPrice)}</span>
                                            ) : (
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem 0' }}>
                                            {diff !== null ? (
                                                <span style={{
                                                    background: diff > 15 ? '#fef2f2' : diff < -10 ? '#f0fdf4' : '#fffbeb',
                                                    color: diff > 15 ? '#ef4444' : diff < -10 ? '#22c55e' : '#f59e0b',
                                                    padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800'
                                                }}>
                                                    {diff > 15 ? 'OVERVALUED' : diff < -10 ? 'UNDERVALUED' : 'FAIR'}
                                                </span>
                                            ) : (
                                                <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800' }}>ACTIVE</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
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
