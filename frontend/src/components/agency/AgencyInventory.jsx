import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2, MapPin, Upload, FileText, X as CloseIcon, Save, Bot } from 'lucide-react';
import AnimatedCounter from '../common/AnimatedCounter';

const INVENTORY_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop';

const AgencyInventory = ({ 
    properties, 
    showPropForm, 
    setShowPropForm, 
    propData, 
    setPropData, 
    handlePropSubmit, 
    handleEditProp, 
    handleDeleteProp, 
    editingProp, 
    inventoryFilters, 
    setInventoryFilters, 
    propertyTypes, 
    propStatuses, 
    handleFileUpload, 
    getImageUrl 
}) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const getEmbedUrl = (url) => {
        if (!url) return null;
        let cleanUrl = url.trim();
        if (cleanUrl.includes('<iframe')) {
            const srcMatch = cleanUrl.match(/src=["']([^"']+)["']/);
            if (srcMatch && srcMatch[1]) cleanUrl = srcMatch[1];
        }
        if (cleanUrl.includes('/maps/embed') || cleanUrl.includes('output=embed')) return cleanUrl;
        const placeMatch = cleanUrl.match(/\/maps\/(search|place)\/([^/@?]+)/);
        if (placeMatch && placeMatch[2]) {
            const query = decodeURIComponent(placeMatch[2].replace(/\+/g, ' '));
            return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
        }
        const coordMatch = cleanUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (coordMatch && coordMatch[1] && coordMatch[2]) {
            return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&output=embed`;
        }
        if (cleanUrl.includes('google.com/maps') || cleanUrl.includes('maps.google')) {
            const separator = cleanUrl.includes('?') ? '&' : '?';
            return `${cleanUrl}${separator}output=embed`;
        }
        return cleanUrl;
    };

    return (
        <div className="animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1.4rem', color: 'var(--text)', fontWeight: '800' }}>Property Inventory</h4>
                <button className="btn btn-primary" onClick={() => { setShowPropForm(!showPropForm); }}>
                    <Plus size={18} /> {showPropForm ? 'Cancel' : 'Create Listing'}
                </button>
            </div>

            {!showPropForm && (
                <div className="glass-card" style={{ padding: '1.2rem', background: 'var(--surface)', border: '1px solid var(--border)', marginBottom: '2rem', display: 'grid', gridTemplateColumns: windowWidth > 1024 ? 'repeat(4, 1fr)' : 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                    <div className="input-group">
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>LOCATION</label>
                        <input 
                            type="text" 
                            placeholder="Search location..." 
                            className="input-control" 
                            value={inventoryFilters.location}
                            onChange={e => setInventoryFilters({...inventoryFilters, location: e.target.value})}
                            style={{ fontSize: '0.85rem', background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}
                        />
                    </div>
                    <div className="input-group">
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>PROPERTY TYPE</label>
                        <select 
                            className="input-control" 
                            value={inventoryFilters.type}
                            onChange={e => setInventoryFilters({...inventoryFilters, type: e.target.value})}
                            style={{ fontSize: '0.85rem', background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}
                        >
                            <option value="">All Types</option>
                            {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>MIN PRICE</label>
                        <input 
                            type="number" 
                            placeholder="Min ₹" 
                            className="input-control" 
                            value={inventoryFilters.minPrice}
                            onChange={e => setInventoryFilters({...inventoryFilters, minPrice: e.target.value})}
                            style={{ fontSize: '0.85rem', background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}
                        />
                    </div>
                    <div className="input-group">
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>MAX PRICE</label>
                        <input 
                            type="number" 
                            placeholder="Max ₹" 
                            className="input-control" 
                            value={inventoryFilters.maxPrice}
                            onChange={e => setInventoryFilters({...inventoryFilters, maxPrice: e.target.value})}
                            style={{ fontSize: '0.85rem', background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}
                        />
                    </div>
                </div>
            )}

            {showPropForm && (
                <div className="glass-card animate-fade" style={{ marginBottom: '3rem', border: '1px solid var(--primary)', background: 'var(--surface)', padding: '2rem' }}>
                    <h5 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text)', fontWeight: '800' }}>
                        <Edit size={20} color="var(--primary)" /> {editingProp ? 'Edit Listing Data' : 'New Property Details'}
                    </h5>
                    <form onSubmit={handlePropSubmit} style={{ display: 'grid', gridTemplateColumns: windowWidth > 992 ? 'repeat(3, 1fr)' : windowWidth > 600 ? 'repeat(2, 1fr)' : '1fr', gap: '1.5rem' }}>
                        <div className="input-group" style={{ gridColumn: 'span 2' }}>
                            <label style={{ color: 'var(--text-muted)' }}>Headline Title</label>
                            <input type="text" className="input-control" required value={propData.title} onChange={e => setPropData({...propData, title: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-muted)' }}>Price (₹)</label>
                            <input type="number" className="input-control" required value={propData.price} onChange={e => setPropData({...propData, price: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        </div>
                        <div className="input-group" style={{ gridColumn: 'span 3' }}>
                            <label style={{ color: 'var(--text-muted)' }}>Description</label>
                            <textarea className="input-control" rows="3" required value={propData.description} onChange={e => setPropData({...propData, description: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}></textarea>
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-muted)' }}>Location / City</label>
                            <input type="text" className="input-control" required value={propData.location} onChange={e => setPropData({...propData, location: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-muted)' }}>Map Embed URL</label>
                            <input type="url" className="input-control" placeholder="https://www.google.com/maps/embed?..." value={propData.mapLocation} onChange={e => setPropData({...propData, mapLocation: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block', marginTop: '4px' }}>
                                Paste Google Maps URL or Embed `src`. <b>Avoid shortened `maps.app.goo.gl` links.</b>
                            </small>
                            {propData.mapLocation && propData.mapLocation.includes('maps.app.goo.gl') && (
                                <div style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '8px', fontWeight: '700', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '6px' }}>
                                    ⚠️ Shortened links (maps.app.goo.gl) are blocked by Google. Please open the link in your browser and copy the FULL URL from the address bar.
                                </div>
                            )}
                            {propData.mapLocation && !propData.mapLocation.includes('maps.app.goo.gl') && (
                                <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', height: '120px' }}>
                                    <iframe 
                                        src={getEmbedUrl(propData.mapLocation)} 
                                        width="100%" 
                                        height="100%" 
                                        style={{ border: 0 }}
                                        title="Map Preview"
                                    ></iframe>
                                </div>
                            )}
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-muted)' }}>Property Category</label>
                            <select className="input-control" value={propData.propertyType} onChange={e => setPropData({...propData, propertyType: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                                {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-muted)' }}>Status</label>
                            <select className="input-control" value={propData.status} onChange={e => setPropData({...propData, status: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                                {propStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-muted)' }}>Area (sqft)</label>
                            <input type="number" className="input-control" required value={propData.size} onChange={e => setPropData({...propData, size: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-muted)' }}>Beds</label>
                            <input type="number" className="input-control" value={propData.bedrooms} onChange={e => setPropData({...propData, bedrooms: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-muted)' }}>Baths</label>
                            <input type="number" className="input-control" value={propData.bathrooms} onChange={e => setPropData({...propData, bathrooms: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        </div>
                        <div className="input-group" style={{ gridColumn: 'span 3' }}>
                            <label style={{ color: 'var(--text-muted)' }}>Amenities (comma separated)</label>
                            <input type="text" className="input-control" placeholder="Pool, Gym, Parking, WiFi" value={propData.amenities} onChange={e => setPropData({...propData, amenities: e.target.value})} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        </div>
                        <div className="input-group">
                            <label><Upload size={14} /> Upload Image</label>
                            <input type="file" onChange={e => handleFileUpload(e, 'image')} />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                {propData.images.map((img, i) => (
                                    <div key={i} style={{ position: 'relative', width: '60px', height: '60px' }}>
                                        <img
                                            src={getImageUrl(img)}
                                            onError={(event) => {
                                                event.currentTarget.onerror = null;
                                                event.currentTarget.src = INVENTORY_FALLBACK_IMAGE;
                                            }}
                                            style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)' }}
                                            alt=""
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setPropData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                                            style={{
                                                position: 'absolute', top: '-6px', right: '-6px',
                                                width: '20px', height: '20px', borderRadius: '50%',
                                                background: 'var(--error)', color: 'white', border: 'none',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', fontSize: '12px', fontWeight: '800',
                                                boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                                            }}
                                        >
                                            <CloseIcon size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="input-group" style={{ gridColumn: 'span 2' }}>
                            <label><FileText size={14} /> Property Documents</label>
                            <input type="file" onChange={e => handleFileUpload(e, 'doc')} />
                            <div style={{ fontSize: '0.75rem', marginTop: '5px' }}>{propData.documents.length} files attached</div>
                        </div>
                        <div style={{ gridColumn: 'span 3' }}>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                                <Save size={18} /> {editingProp ? 'Finalize Updates' : 'Publish Listing'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: windowWidth > 600 ? "repeat(2, 1fr)" : "1fr", gap: '1.5rem' }}>
                {properties
                    .filter(p => {
                        const matchesLocation = p.location.toLowerCase().includes(inventoryFilters.location.toLowerCase());
                        const matchesType = !inventoryFilters.type || p.propertyType === inventoryFilters.type;
                        const matchesMinPrice = !inventoryFilters.minPrice || p.price >= Number(inventoryFilters.minPrice);
                        const matchesMaxPrice = !inventoryFilters.maxPrice || p.price <= Number(inventoryFilters.maxPrice);
                        return matchesLocation && matchesType && matchesMinPrice && matchesMaxPrice;
                    })
                    .map(p => (
                    <div key={p._id} className="glass-card animate-fade" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                        <div style={{ height: '180px', position: 'relative' }}>
                            <img
                                src={getImageUrl(p.images[0])}
                                onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src = INVENTORY_FALLBACK_IMAGE;
                                }}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                alt=""
                            />
                            <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                                {p.isApproved && <div style={{ background: '#10b981', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '800' }}>APPROVED</div>}
                                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800' }}>{p.status}</div>
                            </div>
                        </div>
                        <div style={{ padding: '1.2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <h5 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text)' }}>{p.title}</h5>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--primary)' }}><AnimatedCounter value={`₹${p.price}`} /></div>
                                    {p.aiEstimation?.estimatedPrice > 0 && (
                                        <div style={{ fontSize: '0.65rem', color: '#7c3aed', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end', marginTop: '2px' }}>
                                            <Bot size={10} /> AI: ₹{p.aiEstimation.estimatedPrice >= 10000000 ? `${(p.aiEstimation.estimatedPrice / 10000000).toFixed(2)} Cr` : p.aiEstimation.estimatedPrice >= 100000 ? `${(p.aiEstimation.estimatedPrice / 100000).toFixed(1)} L` : p.aiEstimation.estimatedPrice.toLocaleString('en-IN')}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                                <MapPin size={12} /> {p.location}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-outline" style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', borderColor: 'var(--border)', color: 'var(--text)' }} onClick={() => handleEditProp(p)}>Edit</button>
                                <button className="btn btn-outline" style={{ padding: '0.5rem', color: 'var(--error)', borderColor: 'var(--error)', opacity: 0.8 }} onClick={() => handleDeleteProp(p._id)}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AgencyInventory;
