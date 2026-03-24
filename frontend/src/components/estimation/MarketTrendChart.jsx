import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MarketTrendChart = ({ trends = [], height = 250 }) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!trends || trends.length === 0) {
        return (
            <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No trend data available
            </div>
        );
    }

    const sortedTrends = [...trends].sort((a, b) => {
        const dateA = a.periodEnd || a.period;
        const dateB = b.periodEnd || b.period;
        return new Date(dateA) - new Date(dateB);
    });

    const prices = sortedTrends.map(t => t.avgPricePerSqft || 0);
    const counts = sortedTrends.map(t => t.listingCount || 0);
    const maxPrice = Math.max(...prices) || 1;
    const minPrice = Math.min(...prices) || 0;
    const maxCount = Math.max(...counts) || 1;
    const priceRange = maxPrice - minPrice || 1;

    const chartWidth = Math.max(400, windowWidth > 768 ? 600 : windowWidth - 100);
    const chartHeight = height - 60;
    const padding = { top: 20, right: 40, bottom: 30, left: 60 };
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    // Build SVG polyline points for price line
    const pricePoints = sortedTrends.map((t, i) => {
        const x = padding.left + (i / (sortedTrends.length - 1 || 1)) * plotWidth;
        const y = padding.top + plotHeight - ((prices[i] - minPrice) / priceRange) * plotHeight;
        return `${x},${y}`;
    }).join(' ');

    const overallChange = prices.length >= 2 ? ((prices[prices.length - 1] - prices[0]) / prices[0] * 100).toFixed(1) : 0;

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {parseFloat(overallChange) >= 0
                        ? <TrendingUp size={16} style={{ color: '#22c55e' }} />
                        : <TrendingDown size={16} style={{ color: '#ef4444' }} />
                    }
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: parseFloat(overallChange) >= 0 ? '#22c55e' : '#ef4444' }}>
                        {parseFloat(overallChange) >= 0 ? '+' : ''}{overallChange}%
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>over {sortedTrends.length} months</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '12px', height: '3px', background: '#3b82f6', borderRadius: '2px' }} />
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Price/sqft</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '12px', height: '8px', background: 'rgba(124,58,237,0.3)', borderRadius: '2px' }} />
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Listings</span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div style={{ overflowX: 'auto' }}>
                <svg width={chartWidth} height={chartHeight} style={{ display: 'block' }}>
                    {/* Bar chart for listing count */}
                    {sortedTrends.map((t, i) => {
                        const barWidth = Math.max(8, plotWidth / sortedTrends.length * 0.5);
                        const x = padding.left + (i / (sortedTrends.length - 1 || 1)) * plotWidth - barWidth / 2;
                        const barHeight = (counts[i] / maxCount) * plotHeight * 0.6;
                        const y = padding.top + plotHeight - barHeight;

                        return (
                            <rect key={`bar-${i}`} x={x} y={y} width={barWidth} height={barHeight}
                                fill={hoveredIndex === i ? 'rgba(124,58,237,0.5)' : 'rgba(124,58,237,0.2)'}
                                rx="3" style={{ transition: 'fill 0.2s' }}
                            />
                        );
                    })}

                    {/* Price line */}
                    <polyline points={pricePoints} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Data points */}
                    {sortedTrends.map((t, i) => {
                        const x = padding.left + (i / (sortedTrends.length - 1 || 1)) * plotWidth;
                        const y = padding.top + plotHeight - ((prices[i] - minPrice) / priceRange) * plotHeight;
                        return (
                            <g key={`point-${i}`}
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                style={{ cursor: 'pointer' }}
                            >
                                <circle cx={x} cy={y} r={hoveredIndex === i ? 5 : 3} fill="#3b82f6" stroke="var(--background)" strokeWidth="2" />
                                {/* Invisible larger hit area */}
                                <circle cx={x} cy={y} r="15" fill="transparent" />
                            </g>
                        );
                    })}

                    {/* X axis labels */}
                    {sortedTrends.map((t, i) => {
                        const x = padding.left + (i / (sortedTrends.length - 1 || 1)) * plotWidth;
                        const label = t.period || (t.periodEnd ? new Date(t.periodEnd).toLocaleDateString('en-IN', { month: 'short' }) : '');
                        if (sortedTrends.length > 8 && i % 2 !== 0) return null;
                        return (
                            <text key={`label-${i}`} x={x} y={padding.top + plotHeight + 20}
                                textAnchor="middle" fontSize="10" fill="var(--text-muted)">
                                {label.slice(-5)}
                            </text>
                        );
                    })}

                    {/* Y axis labels */}
                    {[0, 0.5, 1].map((pct, i) => {
                        const val = minPrice + priceRange * pct;
                        const y = padding.top + plotHeight - pct * plotHeight;
                        return (
                            <text key={`yaxis-${i}`} x={padding.left - 8} y={y + 4}
                                textAnchor="end" fontSize="10" fill="var(--text-muted)">
                                {val >= 1000 ? `${(val / 1000).toFixed(1)}K` : Math.round(val)}
                            </text>
                        );
                    })}
                </svg>
            </div>

            {/* Tooltip */}
            {hoveredIndex !== null && sortedTrends[hoveredIndex] && (
                <div style={{
                    marginTop: '8px', padding: '8px 14px', background: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    fontSize: '0.75rem', display: 'flex', gap: '16px', justifyContent: 'center'
                }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                        {sortedTrends[hoveredIndex].period || new Date(sortedTrends[hoveredIndex].periodEnd).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </span>
                    <span style={{ color: '#3b82f6', fontWeight: '600' }}>
                        Rs.{prices[hoveredIndex]?.toLocaleString('en-IN')}/sqft
                    </span>
                    <span style={{ color: '#7c3aed', fontWeight: '600' }}>
                        {counts[hoveredIndex]} listings
                    </span>
                </div>
            )}
        </div>
    );
};

export default MarketTrendChart;
