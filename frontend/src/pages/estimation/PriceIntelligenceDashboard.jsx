import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Calculator, TrendingUp, Database, Activity, RefreshCw } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';
import { useAuth } from '../../context/AuthContext';
import PriceEstimationForm from '../../components/estimation/PriceEstimationForm';
import MarketTrendChart from '../../components/estimation/MarketTrendChart';
import EstimationAgentStatus from '../../components/estimation/EstimationAgentStatus';
import PropertyEstimationCard from '../../components/estimation/PropertyEstimationCard';

const formatINR = (num) => {
    if (!num) return '---';
    if (num >= 10000000) return `Rs.${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `Rs.${(num / 100000).toFixed(1)} L`;
    return `Rs.${num.toLocaleString('en-IN')}`;
};

const PriceIntelligenceDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [dashboard, setDashboard] = useState(null);
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [triggeringJob, setTriggeringJob] = useState(false);
    const [normalizing, setNormalizing] = useState(false);
    const [normalizationJob, setNormalizationJob] = useState(null);
    const [activeScrapingJobId, setActiveScrapingJobId] = useState(null);
    const [trendCity, setTrendCity] = useState('');
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, []);

    useEffect(() => {
        if (activeTab === 'trends') fetchTrends();
    }, [activeTab, trendCity]);

    const fetchDashboard = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/estimation/dashboard`);
            setDashboard(data);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrends = async () => {
        try {
            const params = {};
            if (trendCity) params.city = trendCity;
            const { data } = await axios.get(`${API_BASE_URL}/estimation/trends`, { params });
            setTrends(data);
        } catch (err) {
            console.error('Trends fetch error:', err);
        }
    };

    useEffect(() => {
        let interval;
        if (normalizing && normalizationJob?._id) {
            interval = setInterval(async () => {
                try {
                    const { data } = await axios.get(`${API_BASE_URL}/estimation/normalize/status/${normalizationJob._id}`);
                    setNormalizationJob(data);
                    if (['completed', 'failed'].includes(data.status)) {
                        setNormalizing(false);
                        if (data.status === 'failed') alert(`Normalization Failed: ${data.errorMessage}`);
                    }
                } catch (err) {
                    console.error('Polling error:', err);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [normalizing, normalizationJob?._id]);

    const handleRunNormalization = async () => {
        setNormalizing(true);
        setNormalizationJob(null);
        try {
            const { data } = await axios.post(`${API_BASE_URL}/estimation/normalize`);
            setNormalizationJob({ _id: data.jobId, status: 'queued' });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to start normalization');
            setNormalizing(false);
        }
    };

    const triggerScraping = async () => {
        setTriggeringJob(true);
        try {
            const { data } = await axios.post(`${API_BASE_URL}/estimation/scraping/trigger`, {});
            
            // Explicitly track the new job ID to force the status component to refresh
            if (data.jobId) {
                setActiveScrapingJobId(data.jobId);
            }
            
            setActiveTab('scraping');
            
            // Minor delay to allow backend to initialize the job records
            setTimeout(() => {
                setTriggeringJob(false);
            }, 1000);

        } catch (err) {
            console.error('Scraping trigger error:', err);
            alert(err.response?.data?.message || 'Failed to start scraping');
            setTriggeringJob(false);
        }
    };

    const tabs = [
        { key: 'overview', label: 'Overview', icon: BarChart3 },
        { key: 'estimate', label: 'Quick Estimate', icon: Calculator },
        { key: 'trends', label: 'Market Trends', icon: TrendingUp },
        ...(user?.role === 'Admin' ? [{ key: 'scraping', label: 'Data Pipeline', icon: Database }] : [])
    ];

    const statCards = dashboard ? [
        { label: 'Total Estimations', value: dashboard.totalEstimations || 0, icon: Calculator, color: '#3b82f6' },
        { label: 'Avg Confidence', value: `${dashboard.avgConfidence || 0}%`, icon: Activity, color: '#22c55e' },
        { label: 'Market Listings', value: dashboard.totalListings || 0, icon: Database, color: '#7c3aed' },
        { label: 'Last Scrape', value: dashboard.latestScrapingJob?.status || 'N/A', icon: RefreshCw, color: '#f59e0b' }
    ] : [];

    return (
        <div>
            {/* Page Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }} />
                    Price Intelligence
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>AI-powered property valuation and market analytics</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                        padding: '10px 18px', borderRadius: '10px', border: '1px solid var(--border)',
                        background: activeTab === tab.key ? 'linear-gradient(90deg, #7c3aed, #3b82f6)' : 'var(--surface)',
                        color: activeTab === tab.key ? 'white' : 'var(--text-muted)',
                        cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600',
                        display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease'
                    }}>
                        <tab.icon size={15} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div>
                    {/* Stat Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: windowWidth > 900 ? 'repeat(4, 1fr)' : windowWidth > 600 ? 'repeat(2, 1fr)' : '1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        {statCards.map((card, i) => (
                            <div key={i} className="glass-card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${card.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <card.icon size={22} style={{ color: card.color }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>{card.label}</div>
                                    <div style={{ fontSize: '1.3rem', fontWeight: '800' }}>{card.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Two-column layout */}
                    <div style={{ display: 'grid', gridTemplateColumns: windowWidth > 900 ? '2fr 1fr' : '1fr', gap: '1.5rem' }}>
                        {/* Recent Estimations */}
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>Recent Estimations</h3>
                            {(dashboard?.recentEstimations || []).length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No estimations yet. Try the Quick Estimate tab!</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {(dashboard?.recentEstimations || []).map((est, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '10px 14px', background: 'var(--surface)', borderRadius: '8px',
                                            border: '1px solid var(--border)'
                                        }}>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>{est.property?.title || `${est.input?.city}, ${est.input?.locality}`}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{est.input?.propertyType} | {est.input?.areaSqft} sqft</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>{formatINR(est.estimatedPrice)}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{est.confidenceScore}% confidence</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Top Localities */}
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>Top Demand Areas</h3>
                            {(dashboard?.trendSummary || []).length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>Run data pipeline to see trends</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {(dashboard?.trendSummary || []).slice(0, 8).map((area, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                            <div>
                                                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{area._id?.locality}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '6px' }}>{area._id?.city}</span>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary)' }}>
                                                Rs.{area.latestAvgPrice?.toLocaleString('en-IN')}/sqft
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {user?.role === 'Admin' && (
                                <button onClick={triggerScraping} disabled={triggeringJob} style={{
                                    marginTop: '1rem', width: '100%', padding: '10px',
                                    background: triggeringJob ? 'var(--surface-light)' : 'linear-gradient(90deg, #7c3aed, #3b82f6)',
                                    border: 'none', borderRadius: '8px', color: 'white',
                                    fontSize: '0.8rem', fontWeight: '600', cursor: triggeringJob ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                }}>
                                    <RefreshCw size={14} /> {triggeringJob ? 'Starting...' : 'Run Data Pipeline'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Estimate Tab */}
            {activeTab === 'estimate' && (
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>Quick Price Estimation</h3>
                    <PriceEstimationForm />
                </div>
            )}

            {/* Market Trends Tab */}
            {activeTab === 'trends' && (
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Market Trends</h3>
                        <select value={trendCity} onChange={e => setTrendCity(e.target.value)} style={{
                            padding: '8px 12px', background: 'var(--input-bg)', border: '1px solid var(--border)',
                            borderRadius: '8px', color: 'var(--text)', fontSize: '0.8rem'
                        }}>
                            <option value="">All Cities</option>
                            {['Delhi NCR', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Gurgaon', 'Noida', 'Ahmedabad', 'Kolkata'].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <MarketTrendChart trends={trends} height={300} />
                </div>
            )}

            {/* Scraping Status Tab (Admin only) */}
            {activeTab === 'scraping' && user?.role === 'Admin' && (
                <div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <button onClick={triggerScraping} disabled={triggeringJob} style={{
                            padding: '10px 20px', background: 'linear-gradient(90deg, #7c3aed, #3b82f6)',
                            border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer',
                            fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                            <RefreshCw size={14} /> {triggeringJob ? 'Starting...' : 'Trigger Full Scrape'}
                        </button>
                        <button 
                            disabled={normalizing || triggeringJob}
                            onClick={handleRunNormalization}
                            style={{
                            padding: '10px 20px', 
                            background: normalizing ? 'var(--surface-light)' : 'var(--surface)', 
                            border: '1px solid var(--border)',
                            borderRadius: '8px', color: normalizing ? 'var(--text-muted)' : 'var(--text)', 
                            cursor: normalizing ? 'not-allowed' : 'pointer',
                            fontSize: '0.85rem', fontWeight: '600'
                        }}>
                            {normalizing ? 'Processing Pipeline...' : 'Run Normalization'}
                        </button>
                    </div>

                    {normalizing && normalizationJob && (
                        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem', border: '1px solid var(--primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'capitalize' }}>
                                    Status: {normalizationJob.status.replace('_', ' ')}
                                </h4>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {normalizationJob.processedRecords} / {normalizationJob.totalRecords}
                                </span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'var(--surface)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                                <div style={{ 
                                    width: `${normalizationJob.totalRecords > 0 ? (normalizationJob.processedRecords / normalizationJob.totalRecords * 100) : 0}%`, 
                                    height: '100%', background: 'linear-gradient(90deg, #7c3aed, #3b82f6)',
                                    transition: 'width 0.5s ease'
                                }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.75rem' }}>
                                <div style={{ color: 'var(--text-muted)' }}>Cleaned: <span style={{ color: 'var(--text)', fontWeight: '600' }}>{normalizationJob.results?.cleaned || 0}</span></div>
                                <div style={{ color: 'var(--text-muted)' }}>Geocoded: <span style={{ color: 'var(--text)', fontWeight: '600' }}>{normalizationJob.results?.geocoded || 0}</span></div>
                                <div style={{ color: 'var(--text-muted)' }}>Deduped: <span style={{ color: 'var(--text)', fontWeight: '600' }}>{normalizationJob.results?.deduplicated || 0}</span></div>
                                <div style={{ color: 'var(--text-muted)' }}>Outliers: <span style={{ color: 'var(--text)', fontWeight: '600' }}>{normalizationJob.results?.outliersFound || 0}</span></div>
                            </div>
                        </div>
                    )}

                    <EstimationAgentStatus jobId={activeScrapingJobId} onComplete={() => setActiveScrapingJobId(null)} />
                </div>
            )}
        </div>
    );
};

export default PriceIntelligenceDashboard;
