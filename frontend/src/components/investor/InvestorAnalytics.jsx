import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, PieChart, Building2 } from 'lucide-react';

const InvestorAnalytics = ({ stats, investments }) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Calculate Property Distribution
    const distribution = investments.reduce((acc, inv) => {
        const type = inv.propertyType || 'Other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const totalAssets = investments.length;
    const distributionData = Object.keys(distribution).map(type => ({
        type,
        percentage: totalAssets > 0 ? (distribution[type] / totalAssets) * 100 : 0,
        count: distribution[type]
    })).sort((a, b) => b.percentage - a.percentage);

    const colors = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6'];

    const currentDate = new Date();
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    
    const historicalData = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
        
        let monthlyValue = 0;
        investments.forEach(inv => {
            const invDate = new Date(inv.investmentDate);
            if (invDate <= endOfMonth) {
                monthlyValue += (inv.currentValue * (inv.ownershipPercentage / 100));
            }
        });
        
        historicalData.push({
            label: i === 0 ? `${monthNames[d.getMonth()]} (CURRENT)` : monthNames[d.getMonth()],
            value: monthlyValue,
            isCurrent: i === 0
        });
    }

    const maxChartValue = Math.max(...historicalData.map(d => d.value), 1);

    return (
        <div className="animate-fade">
            <div style={{ display: 'grid', gridTemplateColumns: windowWidth > 1024 ? 'repeat(4, 1fr)' : windowWidth > 600 ? 'repeat(2, 1fr)' : '1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: '700', textTransform: 'uppercase' }}>
                        <DollarSign size={16} color="var(--primary)" /> Portfolio Value
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text)' }}>₹{stats.totalValue.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.5rem', fontWeight: '700' }}>Overall Portfolio Value</div>
                </div>
                
                <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: '700', textTransform: 'uppercase' }}>
                        <TrendingUp size={16} color="var(--primary)" /> Invested Capital
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text)' }}>₹{stats.totalInvested.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: '600' }}>Across {stats.count} Assets</div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: '700', textTransform: 'uppercase' }}>
                        <PieChart size={16} color="var(--primary)" /> Net Profit
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: stats.profit >= 0 ? 'var(--success)' : 'var(--error)' }}>
                        ₹{stats.profit.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: '600' }}>Realized & Unrealized</div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: '700', textTransform: 'uppercase' }}>
                        <BarChart3 size={16} color="var(--primary)" /> Performance ROI
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)' }}>{stats.roi.toFixed(2)}%</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: '600' }}>Aggregate Portfolio ROI</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: windowWidth > 1024 ? 'minmax(0, 1.5fr) minmax(0, 1fr)' : '1fr', gap: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '2.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Portfolio Allocation</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Distribution of assets by property category</p>
                        </div>
                        <div style={{ padding: '0.5rem', background: 'var(--surface-light)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                            <Building2 size={20} color="var(--primary)" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        {/* Custom SVG Pie Chart */}
                        <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                            <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                                {distributionData.map((item, i) => {
                                    const offset = distributionData.slice(0, i).reduce((sum, d) => sum + d.percentage, 0);
                                    return (
                                        <circle
                                            key={i}
                                            cx="18" cy="18" r="15.5"
                                            fill="none"
                                            stroke={colors[i % colors.length]}
                                            strokeWidth="3"
                                            strokeDasharray={`${item.percentage} 100`}
                                            strokeDashoffset={-offset}
                                            style={{ transition: 'stroke-dasharray 0.5s ease' }}
                                        />
                                    );
                                })}
                            </svg>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>{totalAssets}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assets</div>
                            </div>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            {distributionData.map((item, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                                        <span style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors[i % colors.length] }}></div>
                                            {item.type}
                                        </span>
                                        <span style={{ fontWeight: '800' }}>{item.percentage.toFixed(1)}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--surface-light)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            width: `${item.percentage}%`, 
                                            height: '100%', 
                                            background: colors[i % colors.length],
                                            borderRadius: '10px'
                                        }}></div>
                                    </div>
                                </div>
                            ))}
                            {distributionData.length === 0 && (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No data available for allocation.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '2.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Asset Growth</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>Portfolio valuation trend over time</p>
                    
                    <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                        {historicalData.map((data, i) => {
                            const heightPct = maxChartValue > 0 ? (data.value / maxChartValue) * 100 : 0;
                            return (
                                <div key={i} style={{ flex: 1, position: 'relative', height: '100%' }}>
                                    <div style={{ 
                                        height: `${heightPct}%`, 
                                        minHeight: data.value > 0 ? '4px' : '0px',
                                        background: data.isCurrent ? 'var(--primary)' : 'var(--surface-light)', 
                                        borderRadius: '6px 6px 0 0',
                                        transition: 'height 1s ease',
                                        position: 'absolute',
                                        bottom: 0,
                                        width: '100%'
                                    }}>
                                        {data.isCurrent && data.value > 0 && (
                                            <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', fontWeight: '800', color: 'var(--primary)' }}>
                                                ₹{data.value.toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                        {historicalData.map((data, i) => (
                            <span key={i} style={{ color: data.isCurrent ? 'var(--primary)' : 'inherit' }}>
                                {data.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestorAnalytics;
