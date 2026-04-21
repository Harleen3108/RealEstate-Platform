import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Home, Bath, Bed, Move, Sparkles } from 'lucide-react';
import Property3DViewer from './Property3DViewer';

const formatINR = (value) => {
  if (!value) return 'Price on request';
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  return `₹${value.toLocaleString('en-IN')}`;
};

const Property3DTourModal = ({ open, onClose, property, modelPath = '/models/house.glb' }) => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const isMobile = windowWidth <= 768;
  const isSmall = windowWidth <= 480;

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onEsc = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    const onResize = () => setWindowWidth(window.innerWidth);

    window.addEventListener('keydown', onEsc);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onEsc);
      window.removeEventListener('resize', onResize);
    };
  }, [open, onClose]);

  if (!open) return null;

  const title = property?.title || '3D House Tour';
  const location = property?.location || property?.city || 'Premium location';
  const price = formatINR(property?.price);
  const modelCount = property?.threeDModelImages?.length || 0;

  const content = (
    <div
      onClick={onClose}
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'center',
        padding: isSmall ? '0' : isMobile ? '8px' : '20px 14px',
        background: 'radial-gradient(circle at top, rgba(15, 23, 42, 0.84) 0%, rgba(2, 6, 23, 0.96) 58%, rgba(2, 6, 23, 0.98) 100%)',
        backdropFilter: 'blur(14px)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="3D house tour"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 1360,
          maxHeight: isMobile ? 'none' : '94vh',
          minHeight: isSmall ? '100vh' : 'auto',
          overflow: isMobile ? 'visible' : 'hidden',
          borderRadius: isSmall ? 0 : isMobile ? 16 : 24,
          border: isSmall ? 'none' : '1px solid rgba(148, 163, 184, 0.18)',
          background: 'linear-gradient(180deg, rgba(7, 12, 24, 0.96) 0%, rgba(10, 15, 29, 0.96) 100%)',
          boxShadow: isSmall ? 'none' : '0 40px 120px rgba(2, 6, 23, 0.92)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(circle at 15% 15%, rgba(245, 158, 11, 0.12), transparent 24%), radial-gradient(circle at 85% 18%, rgba(56, 189, 248, 0.08), transparent 20%), radial-gradient(circle at 50% 100%, rgba(148, 163, 184, 0.1), transparent 28%)',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, padding: isSmall ? 14 : isMobile ? 16 : 18 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: isMobile ? 12 : 16 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(251, 191, 36, 0.22)', background: 'rgba(251, 191, 36, 0.08)', color: '#fde68a', fontSize: isSmall ? 10 : 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: isMobile ? 10 : 12 }}>
                <Sparkles size={12} /> 360° Virtual Tour
              </div>
              <h3 style={{ margin: 0, fontSize: isSmall ? 20 : isMobile ? 24 : 'clamp(20px, 2.8vw, 34px)', lineHeight: 1.15, color: '#f8fafc', fontWeight: 800, letterSpacing: '-0.02em' }}>
                {title}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: isSmall ? 8 : 12, marginTop: 8, color: '#cbd5e1', fontSize: isSmall ? 12 : 14 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><MapPin size={14} color="#f59e0b" /> {location}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#f8fafc', fontWeight: 700 }}>{price}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Move size={14} color="#94a3b8" /> {property?.size ? `${property.size.toLocaleString('en-IN')} sqft` : 'Curated showcase'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close 3D tour"
              style={{
                position: isSmall ? 'fixed' : 'relative',
                top: isSmall ? 12 : 'auto',
                right: isSmall ? 12 : 'auto',
                zIndex: 10,
                borderRadius: 999,
                border: 'none',
                background: '#ffffff',
                width: isSmall ? 44 : 46,
                height: isSmall ? 44 : 46,
                color: '#0F172A',
                cursor: 'pointer',
                lineHeight: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                transition: 'background 0.2s ease, transform 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f0f0f0';
                e.currentTarget.style.transform = 'scale(1.08)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <X size={20} strokeWidth={3} color="#0F172A" />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'minmax(0, 1.95fr) minmax(280px, 0.85fr)', gap: isMobile ? 12 : 18, alignItems: 'stretch' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ position: 'relative', borderRadius: isSmall ? 14 : 20, overflow: 'hidden', border: '1px solid rgba(148, 163, 184, 0.16)', background: '#0F172A', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}>
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03)' }} />
                <Property3DViewer modelPath={modelPath} property={property} style={{ height: isSmall ? '55vh' : isMobile ? '60vh' : '72vh', minHeight: isSmall ? 320 : isMobile ? 380 : 560, borderRadius: isSmall ? 14 : 20 }} />
              </div>
            </div>

            <aside style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 14 }}>
              <div style={{ padding: isSmall ? 14 : 18, borderRadius: isSmall ? 14 : 20, border: '1px solid rgba(148, 163, 184, 0.16)', background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.84) 0%, rgba(15, 23, 42, 0.62) 100%)', boxShadow: '0 18px 30px rgba(2, 6, 23, 0.2)' }}>
                <div style={{ color: '#cbd5e1', fontSize: 12, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>Showcase details</div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(4, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))', gap: isSmall ? 8 : 10 }}>
                  <div style={{ padding: 12, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.12)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f8fafc', fontSize: 13, fontWeight: 700 }}><Bed size={14} color="#fbbf24" /> {property?.bedrooms || 0}</div>
                    <div style={{ marginTop: 4, color: '#94a3b8', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Beds</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.12)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f8fafc', fontSize: 13, fontWeight: 700 }}><Bath size={14} color="#fbbf24" /> {property?.bathrooms || 0}</div>
                    <div style={{ marginTop: 4, color: '#94a3b8', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Baths</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.12)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f8fafc', fontSize: 13, fontWeight: 700 }}><Home size={14} color="#fbbf24" /> {property?.propertyType || 'Luxury'}</div>
                    <div style={{ marginTop: 4, color: '#94a3b8', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Type</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.12)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f8fafc', fontSize: 13, fontWeight: 700 }}><Move size={14} color="#fbbf24" /> {property?.size ? `${property.size.toLocaleString('en-IN')}` : '--'}</div>
                    <div style={{ marginTop: 4, color: '#94a3b8', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Sqft</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: isSmall ? 14 : 18, borderRadius: isSmall ? 14 : 20, border: '1px solid rgba(148, 163, 184, 0.16)', background: 'linear-gradient(180deg, rgba(251, 191, 36, 0.08) 0%, rgba(15, 23, 42, 0.72) 100%)' }}>
                <div style={{ color: '#fde68a', fontSize: 12, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Immersive viewing</div>
                <div style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700 }}>Real-world 360° photosphere</div>
                <div style={{ marginTop: 6, color: '#cbd5e1', fontSize: 12, lineHeight: 1.6 }}>
                  Pan around a captured scene of the property. If the listing has a Matterport or Kuula URL, the full walkthrough embeds here.
                </div>
                {modelCount > 0 && (
                  <div style={{ marginTop: 8, color: '#94a3b8', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    {modelCount} preview image{modelCount === 1 ? '' : 's'} attached
                  </div>
                )}
              </div>

              <div style={{ padding: isSmall ? 14 : 18, borderRadius: isSmall ? 14 : 20, border: '1px solid rgba(148, 163, 184, 0.16)', background: 'rgba(15, 23, 42, 0.62)' }}>
                <div style={{ color: '#cbd5e1', fontSize: 12, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>Controls</div>
                <div style={{ display: 'grid', gap: isSmall ? 6 : 10, color: '#e2e8f0', fontSize: isSmall ? 12 : 13, lineHeight: 1.5 }}>
                  <div>• {isMobile ? 'Touch and drag' : 'Click and drag'} to look around the room.</div>
                  <div>• {isMobile ? 'Pinch' : 'Scroll'} to zoom into details.</div>
                  <div>• Pick another scene from the chips at the bottom.</div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
};

export default Property3DTourModal;
