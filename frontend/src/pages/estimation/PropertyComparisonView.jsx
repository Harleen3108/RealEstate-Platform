import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, X, TrendingUp, TrendingDown, Minus, ArrowLeft } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';
import ConfidenceRing from '../../components/estimation/ConfidenceRing';

const formatINR = (num) => {
    if (!num) return '---';
    if (num >= 10000000) return `Rs.${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `Rs.${(num / 100000).toFixed(1)} L`;
    return `Rs.${num.toLocaleString('en-IN')}`;
};

const PropertyComparisonView = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const searchProperties = async (query) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        try {
            const { data } = await axios.get(`${API_BASE_URL}/properties`);
            const filtered = data.filter(p =>
                p.title?.toLowerCase().includes(query.toLowerCase()) ||
                p.location?.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 8);
            setSearchResults(filtered);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setSearching(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => searchProperties(searchQuery), 300);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const addProperty = (property) => {
        if (selectedIds.length >= 5) return;
        if (selectedIds.includes(property._id)) return;
        setSelectedIds(prev => [...prev, property._id]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const removeProperty = (id) => {
        setSelectedIds(prev => prev.filter(pid => pid !== id));
        setComparison(null);
    };

    const runComparison = async () => {
        if (selectedIds.length < 2) return;
        setLoading(true);
        try {
            const { data } = await axios.post(`${API_BASE_URL}/estimation/compare`, {
                propertyIds: selectedIds
            });
            setComparison(data);
        } catch (err) {
            alert(err.response?.data?.message || 'Comparison failed');
        } finally {
            setLoading(false);
        }
    };

    const getDealColor = (flag) => {
        if (!flag) return 'var(--text-muted)';
        if (flag.includes('good') || flag.includes('Good') || flag.includes('Under')) return '#22c55e';
        if (flag.includes('Over') || flag.includes('over')) return '#ef4444';
        return '#f59e0b';
    };

    const getDealIcon = (flag) => {
        if (!flag) return Minus;
        if (flag.includes('good') || flag.includes('Good') || flag.includes('Under')) return TrendingDown;
        if (flag.includes('Over') || flag.includes('over')) return TrendingUp;
        return Minus;
    };

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }} />
                    Property Comparison
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Compare up to 5 properties side-by-side with AI valuation</p>
            </div>

            {/* Property Search & Selection */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search properties by name or location..."
                            style={{
                                width: '100%', padding: '10px 12px 10px 38px',
                                background: 'var(--input-bg)', border: '1px solid var(--border)',
                                borderRadius: '10px', color: 'var(--text)', fontSize: '0.85rem'
                            }}
                        />
                        {searchResults.length > 0 && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0,
                                background: 'var(--surface)', border: '1px solid var(--border)',
                                borderRadius: '10px', marginTop: '4px', zIndex: 10,
                                maxHeight: '250px', overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                            }}>
                                {searchResults.map(p => (
                                    <div key={p._id} onClick={() => addProperty(p)} style={{
                                        padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        opacity: selectedIds.includes(p._id) ? 0.4 : 1
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>{p.title}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.location} | {p.propertyType}</div>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)' }}>
                                            Rs.{p.price?.toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={runComparison} disabled={selectedIds.length < 2 || loading} style={{
                        padding: '10px 24px', borderRadius: '10px', border: 'none',
                        background: selectedIds.length >= 2 ? 'linear-gradient(90deg, #7c3aed, #3b82f6)' : 'var(--surface-light)',
                        color: selectedIds.length >= 2 ? 'white' : 'var(--text-muted)',
                        fontWeight: '700', fontSize: '0.85rem', cursor: selectedIds.length >= 2 ? 'pointer' : 'not-allowed',
                        whiteSpace: 'nowrap'
                    }}>
                        {loading ? 'Comparing...' : `Compare (${selectedIds.length}/5)`}
                    </button>
                </div>

                {/* Selected property chips */}
                {selectedIds.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', flexWrap: 'wrap' }}>
                        {selectedIds.map(id => (
                            <div key={id} style={{
                                padding: '6px 12px', background: 'var(--surface-light)',
                                border: '1px solid var(--border)', borderRadius: '20px',
                                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem'
                            }}>
                                <span style={{ fontWeight: '600' }}>{id.slice(-6)}</span>
                                <X size={12} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => removeProperty(id)} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Comparison Results */}
            {comparison && comparison.results && (
                <div style={{ overflowX: 'auto' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${comparison.results.length}, minmax(250px, 1fr))`,
                        gap: '1rem', minWidth: comparison.results.length > 2 ? `${comparison.results.length * 260}px` : 'auto'
                    }}>
                        {comparison.results.map((item, idx) => {
                            const est = item.estimation;
                            const prop = item.property;
                            const DealIcon = getDealIcon(item.dealFlag);

                            return (
                                <div key={idx} className="glass-card" style={{
                                    padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                                    border: item.dealFlag?.includes('Good') ? '2px solid #22c55e' : '1px solid var(--border)'
                                }}>
                                    {/* Header */}
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '4px' }}>
                                            {prop?.title || `Property ${idx + 1}`}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            {prop?.location || '---'}
                                        </div>
                                    </div>

                                    {/* Deal Flag */}
                                    {item.dealFlag && (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '6px 12px', borderRadius: '8px',
                                            background: `${getDealColor(item.dealFlag)}15`,
                                            border: `1px solid ${getDealColor(item.dealFlag)}40`,
                                            alignSelf: 'flex-start'
                                        }}>
                                            <DealIcon size={14} style={{ color: getDealColor(item.dealFlag) }} />
                                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: getDealColor(item.dealFlag) }}>
                                                {item.dealFlag}
                                            </span>
                                        </div>
                                    )}

                                    {/* Price Comparison */}
                                    <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Listed Price</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{formatINR(prop?.price)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AI Estimated</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>{formatINR(est?.estimatedPrice)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Price/sqft</span>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                                                {est?.pricePerSqft ? `Rs.${Math.round(est.pricePerSqft).toLocaleString('en-IN')}` : '---'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Confidence */}
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
                                        <ConfidenceRing confidence={est?.confidenceScore || 0} size={80} />
                                    </div>

                                    {/* Property Details */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        {[
                                            { label: 'Type', value: prop?.propertyType || '---' },
                                            { label: 'Area', value: prop?.size ? `${prop.size} sqft` : '---' },
                                            { label: 'Beds', value: prop?.bedrooms || '---' },
                                            { label: 'Baths', value: prop?.bathrooms || '---' }
                                        ].map((detail, i) => (
                                            <div key={i} style={{ padding: '6px 8px', background: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>{detail.label}</div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: '700' }}>{detail.value}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Price Range */}
                                    {est?.priceLow && est?.priceHigh && (
                                        <div style={{ padding: '8px 12px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600' }}>ESTIMATED RANGE</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '600' }}>
                                                <span>{formatINR(est.priceLow)}</span>
                                                <span style={{ color: 'var(--text-muted)' }}>to</span>
                                                <span>{formatINR(est.priceHigh)}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Market Timing */}
                                    {est?.marketTiming && (
                                        <div style={{
                                            textAlign: 'center', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700',
                                            background: est.marketTiming === 'good' ? '#22c55e20' : est.marketTiming === 'wait' ? '#ef444420' : '#f59e0b20',
                                            color: est.marketTiming === 'good' ? '#22c55e' : est.marketTiming === 'wait' ? '#ef4444' : '#f59e0b'
                                        }}>
                                            {est.marketTiming === 'good' ? 'Good Time to Buy' : est.marketTiming === 'wait' ? 'Consider Waiting' : 'Neutral Market'}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary */}
                    {comparison.summary && (
                        <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem' }}>Comparison Summary</h3>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                {comparison.summary}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!comparison && selectedIds.length === 0 && (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Search size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.4 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>Search and select 2-5 properties to compare</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>AI will estimate prices and highlight the best deals</p>
                </div>
            )}
        </div>
    );
};

export default PropertyComparisonView;
