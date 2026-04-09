import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Loader, Clock, Database } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';

const SOURCE_CONFIG = {
    magicbricks: { label: 'MagicBricks', color: '#e55a16' },
    '99acres': { label: '99Acres', color: '#3b82f6' },
    housing_com: { label: 'Housing.com', color: '#22c55e' },
    nobroker: { label: 'NoBroker', color: '#7c3aed' },
    govt_registry: { label: 'Govt Registry', color: '#f59e0b' }
};

const StatusDot = ({ status }) => {
    const config = {
        pending: { color: '#6b7280', pulse: false },
        running: { color: '#3b82f6', pulse: true },
        completed: { color: '#22c55e', pulse: false },
        failed: { color: '#ef4444', pulse: false }
    };
    const s = config[status] || config.pending;

    return (
        <div style={{
            width: '10px', height: '10px', borderRadius: '50%', background: s.color,
            boxShadow: s.pulse ? `0 0 8px ${s.color}` : 'none',
            animation: s.pulse ? 'pulse 1.5s infinite' : 'none'
        }} />
    );
};

const EstimationAgentStatus = ({ jobId, onComplete }) => {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch initially
        if (jobId) {
            fetchJobById(jobId);
        } else {
            fetchLatestJob();
        }

        // Set up interval for continuous polling if the job is active
        const interval = setInterval(() => {
            if (jobId) {
                fetchJobById(jobId);
            } else {
                fetchLatestJob();
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [jobId]);

    const fetchLatestJob = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/estimation/scraping/status`);
            const latestJob = data.latest;
            setJob(latestJob);
            
            // If the latest job is finished, we could theoretically stop polling 
            // but the interval will keep checking for new jobs every 3s anyway.
        } catch (err) {
            console.error('Error fetching latest job:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobById = async (id) => {
        try {
            // There isn't a direct "get job by id" endpoint in the current routes 
            // but the /status endpoint returns 'latest' and 'history'.
            // We'll fetch status and find the matching ID in latest or history.
            const { data } = await axios.get(`${API_BASE_URL}/estimation/scraping/status`);
            if (data.latest && data.latest._id === id) {
                setJob(data.latest);
            } else {
                const found = (data.history || []).find(h => h._id === id);
                if (found) setJob(found);
            }
        } catch (err) {
            console.error('Error fetching job by ID:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobStatus = async () => {
        // This is now handled by fetchLatestJob and fetchJobById
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '1rem', color: 'var(--text-muted)' }}>
                <Loader size={16} className="animate-pulse" /> Loading status...
            </div>
        );
    }

    if (!job) {
        return (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Database size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <p style={{ fontSize: '0.85rem' }}>No scraping jobs found</p>
            </div>
        );
    }

    const getStatusLabel = (status) => {
        const labels = { pending: 'Queued', running: 'Scraping...', completed: 'Complete', failed: 'Failed' };
        return labels[status] || status;
    };

    const successCount = (job.sources || []).filter(s => s.status === 'completed').length;
    const totalSources = (job.sources || []).length;

    return (
        <div className="glass-card" style={{ padding: '1.2rem' }}>
            {/* Job Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StatusDot status={job.status} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'capitalize' }}>{job.status}</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {job.createdAt && new Date(job.createdAt).toLocaleString('en-IN')}
                </span>
            </div>

            {/* Overall Progress */}
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sources: {successCount}/{totalSources}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Listings: {job.listingsFound || 0}</span>
                </div>
                <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${totalSources > 0 ? (successCount / totalSources) * 100 : 0}%`,
                        height: '100%', background: 'linear-gradient(90deg, #3b82f6, #22c55e)',
                        borderRadius: '2px', transition: 'width 0.5s ease'
                    }} />
                </div>
            </div>

            {/* Per-Source Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(job.sources || []).map((source, i) => {
                    const cfg = SOURCE_CONFIG[source.name] || { label: source.name, color: '#6b7280' };
                    return (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '8px 12px', borderRadius: '8px',
                            background: 'var(--surface)', border: '1px solid var(--border)'
                        }}>
                            <div style={{ width: '4px', height: '28px', borderRadius: '2px', background: cfg.color }} />
                            <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: '600' }}>{cfg.label}</span>
                            <StatusDot status={source.status} />
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', minWidth: '80px', textAlign: 'right' }}>
                                {source.status === 'completed'
                                    ? `${source.listingsFound || 0} listings`
                                    : getStatusLabel(source.status)
                                }
                            </span>
                            {source.status === 'completed' && <CheckCircle size={14} style={{ color: '#22c55e' }} />}
                            {source.status === 'failed' && <XCircle size={14} style={{ color: '#ef4444' }} />}
                            {source.status === 'running' && <Loader size={14} style={{ color: '#3b82f6' }} className="animate-pulse" />}
                            {source.status === 'pending' && <Clock size={14} style={{ color: '#6b7280' }} />}
                        </div>
                    );
                })}
            </div>

            {/* Warning for partial failure */}
            {job.status === 'partial' && (
                <div style={{ marginTop: '0.8rem', padding: '8px 12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', fontSize: '0.75rem', color: '#f59e0b' }}>
                    {successCount} of {totalSources} sources responded. Estimation may be less accurate.
                </div>
            )}
        </div>
    );
};

export default EstimationAgentStatus;
