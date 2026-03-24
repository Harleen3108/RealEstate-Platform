import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import ConfidenceRing from './ConfidenceRing';

const formatINR = (num) => {
    if (!num) return '---';
    if (num >= 10000000) return `Rs.${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `Rs.${(num / 100000).toFixed(2)} Lac`;
    return `Rs.${num.toLocaleString('en-IN')}`;
};

const PropertyEstimationCard = ({ estimation, listingPrice, onReEstimate, loading }) => {
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [displayPrice, setDisplayPrice] = useState(0);

    // Animated counter
    useEffect(() => {
        if (!estimation?.estimatedPrice) return;
        const target = estimation.estimatedPrice;
        const duration = 1000;
        const steps = 30;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                setDisplayPrice(target);
                clearInterval(timer);
            } else {
                setDisplayPrice(Math.round(current));
            }
        }, duration / steps);
        return () => clearInterval(timer);
    }, [estimation?.estimatedPrice]);

    if (loading) {
        return (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                <RefreshCw className="animate-pulse" size={32} style={{ color: 'var(--primary)' }} />
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Analyzing property value...</p>
            </div>
        );
    }

    if (!estimation) return null;

    const priceDiff = listingPrice && estimation.estimatedPrice
        ? ((listingPrice - estimation.estimatedPrice) / estimation.estimatedPrice * 100).toFixed(1)
        : null;

    const getDealBadge = () => {
        if (!priceDiff) return null;
        const diff = parseFloat(priceDiff);
        if (diff > 15) return { label: 'Overpriced', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
        if (diff > 5) return { label: 'Slightly High', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
        if (diff < -10) return { label: 'Good Deal', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' };
        return { label: 'Fair Price', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' };
    };

    const badge = getDealBadge();

    return (
        <div className="glass-card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Price Estimation</span>
                </div>
                {onReEstimate && (
                    <button onClick={onReEstimate} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <RefreshCw size={12} /> Re-estimate
                    </button>
                )}
            </div>

            {/* Price + Confidence Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', fontWeight: '800', color: 'var(--text)', lineHeight: 1.1 }}>
                        {formatINR(displayPrice)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {formatINR(estimation.priceLow)} — {formatINR(estimation.priceHigh)}
                    </div>
                    {estimation.pricePerSqft > 0 && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Rs.{estimation.pricePerSqft?.toLocaleString('en-IN')}/sqft
                        </div>
                    )}
                </div>
                <ConfidenceRing confidence={estimation.confidenceScore || estimation.confidence || 0} size={90} />
            </div>

            {/* Deal Badge */}
            {badge && (
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: badge.bg, color: badge.color, padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                        {badge.label}
                    </span>
                    {priceDiff && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {parseFloat(priceDiff) > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(parseFloat(priceDiff))}% {parseFloat(priceDiff) > 0 ? 'above' : 'below'} estimate
                        </span>
                    )}
                </div>
            )}

            {/* Source Breakdown Bars */}
            {estimation.sourceBreakdown && (
                <div style={{ marginTop: '1.2rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Source Weights</div>
                    {Object.entries(estimation.sourceBreakdown).map(([key, val]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ width: '80px', fontSize: '0.7rem', fontWeight: '600', textTransform: 'capitalize', color: 'var(--text-muted)' }}>{key}</span>
                            <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${(val.weight || 0) * 100}%`,
                                    height: '100%',
                                    borderRadius: '3px',
                                    background: key === 'comparable' ? '#3b82f6' : key === 'trend' ? '#22c55e' : '#7c3aed',
                                    transition: 'width 0.8s ease-out'
                                }} />
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', minWidth: '35px' }}>{Math.round((val.weight || 0) * 100)}%</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Market Timing */}
            {estimation.marketTiming && (
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Market Timing: </span>
                    <span style={{
                        padding: '2px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700',
                        background: estimation.marketTiming === 'good' ? 'rgba(34,197,94,0.15)' : estimation.marketTiming === 'wait' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                        color: estimation.marketTiming === 'good' ? '#22c55e' : estimation.marketTiming === 'wait' ? '#ef4444' : '#f59e0b'
                    }}>
                        {estimation.marketTiming === 'good' ? 'Good Time to Buy' : estimation.marketTiming === 'wait' ? 'Consider Waiting' : 'Neutral'}
                    </span>
                </div>
            )}

            {/* Collapsible AI Analysis */}
            {estimation.llmReasoning && (
                <div style={{ marginTop: '1rem' }}>
                    <button
                        onClick={() => setShowAnalysis(!showAnalysis)}
                        style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 14px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center' }}
                    >
                        {showAnalysis ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {showAnalysis ? 'Hide' : 'Show'} AI Analysis
                    </button>
                    {showAnalysis && (
                        <div style={{ marginTop: '12px', padding: '1rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{estimation.llmReasoning}</p>
                            {estimation.factors && estimation.factors.length > 0 && (
                                <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {estimation.factors.map((f, i) => (
                                        <span key={i} style={{
                                            padding: '3px 10px', borderRadius: '15px', fontSize: '0.7rem', fontWeight: '600',
                                            background: f.direction === 'positive' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                            color: f.direction === 'positive' ? '#22c55e' : '#ef4444'
                                        }}>
                                            {f.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Timestamp */}
            {estimation.createdAt && (
                <div style={{ marginTop: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                    Estimated {new Date(estimation.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {estimation.processingTimeMs && ` in ${(estimation.processingTimeMs / 1000).toFixed(1)}s`}
                </div>
            )}
        </div>
    );
};

export default PropertyEstimationCard;
