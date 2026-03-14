import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, TrendingUp, ShieldCheck } from 'lucide-react';

const Home = () => {
    return (
        <div className="animate-fade">
            {/* Hero Section */}
            <section className="section container" style={{ textAlign: 'center', paddingTop: '6rem' }}>
                <h1 style={{ fontSize: '4rem', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.1', color: 'var(--text)' }}>
                    The Future of <span className="text-gradient">Real Estate</span> <br /> Investment
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
                    A unified platform for property discovery, elite CRM for agencies, and professional portfolio tracking for global investors.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                    <Link to="/marketplace" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                        Explore Properties <ArrowRight size={20} />
                    </Link>
                    <Link to="/register" className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                        List Your Property
                    </Link>
                </div>
            </section>

            {/* Features Stats */}
            <section className="section container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                    <div className="glass-card" style={{ textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)', padding: '2.5rem' }}>
                        <Building2 size={40} className="text-gradient" style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ color: 'var(--text)', fontWeight: '800' }}>Marketplace</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: '600' }}>Access premium listings from top agencies worldwide.</p>
                    </div>
                    <div className="glass-card" style={{ textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)', padding: '2.5rem' }}>
                        <ShieldCheck size={40} className="text-gradient" style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ color: 'var(--text)', fontWeight: '800' }}>Agency CRM</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: '600' }}>Manage leads with professional Kanban pipelines.</p>
                    </div>
                    <div className="glass-card" style={{ textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)', padding: '2.5rem' }}>
                        <TrendingUp size={40} className="text-gradient" style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ color: 'var(--text)', fontWeight: '800' }}>Portfolio Tracker</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: '600' }}>Track investment growth and profit in real-time.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
