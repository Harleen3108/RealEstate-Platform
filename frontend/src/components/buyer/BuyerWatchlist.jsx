import { Heart, MapPin, Bed, Bath, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedCounter from '../common/AnimatedCounter';

const formatINR = (num) => {
    if (!num) return '---';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
    return `₹${num.toLocaleString('en-IN')}`;
};

const BuyerWatchlist = ({ savedProperties, handleRemoveSaved, getImageUrl }) => {
    if (savedProperties.length === 0) {
        return (
            <div className="glass-card" style={{ padding: '5rem', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div style={{ width: '80px', height: '80px', background: 'var(--surface-light)', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <Heart size={40} color="var(--primary)" style={{ opacity: 0.3 }} />
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text)', fontWeight: '800' }}>Your wishlist is empty</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 2rem', fontWeight: '600' }}>
                    Find properties you love in the marketplace and save them here to track pricing and availability.
                </p>
                <Link to="/marketplace" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>Start Browsing</Link>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {savedProperties.map(p => (
                <div key={p._id} className="glass-card animate-fade" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1rem' }}>
                    <div style={{ height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.2rem', position: 'relative' }}>
                        <img src={getImageUrl(p.images?.[0])} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        <button 
                            onClick={() => handleRemoveSaved(p._id)}
                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '50%', width: '35px', height: '35px', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease' }}
                        >
                            <Heart size={16} fill="var(--primary)" />
                        </button>
                    </div>
                    <div style={{ padding: '0 0.5rem 0.5rem' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--text)' }}>{p.title}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '1.2rem', fontWeight: '600' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={12} color="var(--primary)" /> {p.location}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Bed size={14} color="var(--primary)" /> {p.bedrooms || 0}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Bath size={14} color="var(--primary)" /> {p.bathrooms || 0}
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text)' }}><AnimatedCounter value={`₹${p.price}`} /></div>
                                {p.aiEstimation?.estimatedPrice > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                                        <span style={{ fontSize: '0.7rem', color: '#7c3aed', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            <Bot size={11} /> AI: {formatINR(p.aiEstimation.estimatedPrice)}
                                        </span>
                                        {(() => {
                                            const diff = ((p.price - p.aiEstimation.estimatedPrice) / p.aiEstimation.estimatedPrice * 100);
                                            const color = diff > 15 ? '#ef4444' : diff < -10 ? '#22c55e' : '#f59e0b';
                                            const bg = diff > 15 ? '#fef2f2' : diff < -10 ? '#f0fdf4' : '#fffbeb';
                                            const label = diff > 15 ? 'HIGH' : diff < -10 ? 'DEAL' : 'FAIR';
                                            return <span style={{ background: bg, color, padding: '1px 5px', borderRadius: '3px', fontSize: '0.55rem', fontWeight: '800' }}>{label}</span>;
                                        })()}
                                    </div>
                                )}
                            </div>
                            <Link to={`/property/${p._id}`} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderColor: 'var(--border)', color: 'var(--text)' }}>Explore Case</Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BuyerWatchlist;
